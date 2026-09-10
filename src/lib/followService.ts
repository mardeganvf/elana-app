import { supabase } from './supabase';
import { PublicUserProfile } from '../components/community/PublicProfileModal';

export const FOLLOWED_MEMBERS_CHANGED_EVENT = 'elana_followed_members_changed';

/**
 * Retorna a chave de armazenamento no localStorage para o usuário atual
 */
export function getFollowStorageKey(userId?: string): string {
  const key = userId && userId.trim() ? userId.trim() : 'current_user';
  return `elana_followed_members_${key}`;
}

/**
 * Lê os membros acompanhados do localStorage com fallback de migração
 */
export function getFollowedMembers(userId?: string): PublicUserProfile[] {
  try {
    const primaryKey = getFollowStorageKey(userId);
    let raw = localStorage.getItem(primaryKey);

    // Se estiver com ID específico mas sem dados, checa chaves genéricas e migra se houver
    if (!raw && userId && userId !== 'current_user') {
      const fallbackKeys = [
        'elana_followed_members_current_user',
        'elana_followed_members_anon',
        'elana_followed_members_helena'
      ];
      for (const fKey of fallbackKeys) {
        const fallbackRaw = localStorage.getItem(fKey);
        if (fallbackRaw) {
          raw = fallbackRaw;
          try {
            localStorage.setItem(primaryKey, fallbackRaw);
          } catch (_) {}
          break;
        }
      }
    }

    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch (err) {
    console.warn('Erro ao carregar membros acompanhados do localStorage:', err);
    return [];
  }
}

/**
 * Verifica se um membro já está sendo acompanhado
 */
export function isFollowingMember(targetIdOrName?: string, userId?: string): boolean {
  if (!targetIdOrName) return false;
  const list = getFollowedMembers(userId);
  const targetLower = targetIdOrName.trim().toLowerCase();
  return list.some(
    m => (m.id && m.id.toLowerCase() === targetLower) || (m.name && m.name.toLowerCase() === targetLower)
  );
}

/**
 * Acompanha (segue) um membro da comunidade
 */
export function followMember(profile: PublicUserProfile, userId?: string): PublicUserProfile[] {
  if (!profile || (!profile.id && !profile.name)) return getFollowedMembers(userId);

  const current = getFollowedMembers(userId);
  const targetId = profile.id ? profile.id.toLowerCase() : '';
  const targetName = profile.name ? profile.name.trim().toLowerCase() : '';

  const exists = current.some(
    m => (targetId && m.id && m.id.toLowerCase() === targetId) ||
         (targetName && m.name && m.name.trim().toLowerCase() === targetName)
  );

  let updated: PublicUserProfile[];
  if (exists) {
    // Atualiza os dados do perfil mantendo o membro na lista
    updated = current.map(m => {
      if ((targetId && m.id && m.id.toLowerCase() === targetId) ||
          (targetName && m.name && m.name.trim().toLowerCase() === targetName)) {
        return { ...m, ...profile };
      }
      return m;
    });
  } else {
    // Adiciona o membro formatado no início da lista
    const normalizedMember: PublicUserProfile = {
      id: profile.id || `member-${Date.now()}`,
      name: profile.name,
      avatar: profile.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      role: profile.role || 'membro',
      tag: profile.tag || 'Membro da Comunidade',
      levelName: profile.levelName || 'Semente Curiosa',
      levelIcon: profile.levelIcon || '🌱',
      levelNumber: profile.levelNumber || 1,
      xp: profile.xp || 650,
      bio: profile.bio || '',
      joinedDate: profile.joinedDate || '2026',
      streakDays: profile.streakDays || 5,
      postsCount: profile.postsCount ?? 0,
      commentsCount: profile.commentsCount ?? 0,
      reactionsReceivedCount: profile.reactionsReceivedCount ?? 0,
      children: profile.children || [],
      testimonials: profile.testimonials || []
    };
    updated = [normalizedMember, ...current];
  }

  try {
    localStorage.setItem(getFollowStorageKey(userId), JSON.stringify(updated));
  } catch (err) {
    console.warn('Erro ao salvar membros acompanhados no localStorage:', err);
  }

  // Notifica componentes ouvindo alterações na mesma aba
  window.dispatchEvent(new CustomEvent(FOLLOWED_MEMBERS_CHANGED_EVENT, { detail: updated }));

  // Sincronização segura em segundo plano com Supabase (se a tabela user_follows existir)
  if (userId && profile.id) {
    (async () => {
      try {
        await supabase
          .from('user_follows')
          .upsert({
            follower_id: userId,
            followed_id: profile.id,
            created_at: new Date().toISOString()
          });
      } catch (_) {
        // Ignora caso a tabela ainda não tenha sido migrada
      }
    })();
  }

  return updated;
}

/**
 * Deixa de acompanhar (unfollow) um membro
 */
export function unfollowMember(targetIdOrName?: string, userId?: string): PublicUserProfile[] {
  if (!targetIdOrName) return getFollowedMembers(userId);

  const current = getFollowedMembers(userId);
  const targetLower = targetIdOrName.trim().toLowerCase();

  const updated = current.filter(
    m => !(m.id && m.id.toLowerCase() === targetLower) &&
         !(m.name && m.name.trim().toLowerCase() === targetLower)
  );

  try {
    localStorage.setItem(getFollowStorageKey(userId), JSON.stringify(updated));
  } catch (err) {
    console.warn('Erro ao atualizar membros acompanhados no localStorage:', err);
  }

  // Notifica componentes
  window.dispatchEvent(new CustomEvent(FOLLOWED_MEMBERS_CHANGED_EVENT, { detail: updated }));

  // Sincronização em segundo plano com Supabase
  if (userId && targetIdOrName) {
    (async () => {
      try {
        await supabase
          .from('user_follows')
          .delete()
          .eq('follower_id', userId)
          .eq('followed_id', targetIdOrName);
      } catch (_) {
        // Ignora caso a tabela ainda não tenha sido migrada
      }
    })();
  }

  return updated;
}

/**
 * Alterna o estado de acompanhamento de um membro
 * Retorna true se passou a acompanhar, false se deixou de acompanhar
 */
export function toggleFollowMember(profile: PublicUserProfile, userId?: string): boolean {
  const isFollowing = isFollowingMember(profile.id || profile.name, userId);
  if (isFollowing) {
    unfollowMember(profile.id || profile.name, userId);
    return false;
  } else {
    followMember(profile, userId);
    return true;
  }
}

/**
 * Sincroniza a lista de membros acompanhados a partir do Supabase (user_follows + profiles),
 * atualizando o cache local e notificando a aplicação.
 */
export async function syncFollowedMembersFromSupabase(userId?: string): Promise<PublicUserProfile[]> {
  if (!userId || userId === 'current_user' || userId === 'anon') {
    return getFollowedMembers(userId);
  }

  try {
    const { data: followRows, error: followError } = await supabase
      .from('user_follows')
      .select('followed_id')
      .eq('follower_id', userId);

    if (followError) {
      console.warn('Notice syncing user_follows from Supabase:', followError.message);
      return getFollowedMembers(userId);
    }

    // Se já existem registros no Supabase, busca os perfis correspondentes
    if (followRows && followRows.length > 0) {
      const followedIds = followRows.map(r => r.followed_id).filter(Boolean);
      const { data: profileRows, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', followedIds);

      if (!profileError && profileRows) {
        const profileMap = new Map(profileRows.map(p => [p.id, p]));
        const localList = getFollowedMembers(userId);
        const localMap = new Map(localList.map(m => [m.id, m]));

        const synced: PublicUserProfile[] = followedIds.map(fId => {
          const p = profileMap.get(fId);
          const local = localMap.get(fId);
          if (p) {
            return {
              id: p.id,
              name: p.name || local?.name || 'Membro da Aldeia',
              avatar: p.avatar || local?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
              role: p.role || local?.role || 'membro',
              tag: p.tag || local?.tag || 'Membro da Comunidade',
              levelName: p.level_name || local?.levelName || 'Semente Curiosa',
              levelIcon: p.level_icon || local?.levelIcon || '🌱',
              levelNumber: p.level_number || local?.levelNumber || 1,
              xp: p.xp || local?.xp || 0,
              bio: p.bio || local?.bio || '',
              joinedDate: p.joined_date || local?.joinedDate || '2026',
              streakDays: p.streak_days || local?.streakDays || 1,
              postsCount: local?.postsCount ?? 0,
              commentsCount: local?.commentsCount ?? 0,
              reactionsReceivedCount: local?.reactionsReceivedCount ?? 0,
              children: local?.children || [],
              testimonials: local?.testimonials || []
            };
          }
          return local || {
            id: fId,
            name: 'Membro da Aldeia',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            role: 'membro',
            tag: 'Membro da Comunidade',
            levelName: 'Semente Curiosa',
            levelIcon: '🌱',
            levelNumber: 1,
            xp: 0
          };
        });

        try {
          localStorage.setItem(getFollowStorageKey(userId), JSON.stringify(synced));
        } catch (_) {}

        window.dispatchEvent(new CustomEvent(FOLLOWED_MEMBERS_CHANGED_EVENT, { detail: synced }));
        return synced;
      }
    } else {
      // Se não há registros no Supabase mas há dados no cache local, migra os locais para o Supabase
      const localList = getFollowedMembers(userId);
      if (localList.length > 0) {
        for (const m of localList) {
          if (m.id && !m.id.startsWith('member-')) {
            await supabase.from('user_follows').upsert({
              follower_id: userId,
              followed_id: m.id,
              created_at: new Date().toISOString()
            });
          }
        }
      }
    }
  } catch (err) {
    console.warn('Erro ao sincronizar rede de apoio com Supabase:', err);
  }

  return getFollowedMembers(userId);
}
