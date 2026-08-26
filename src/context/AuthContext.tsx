import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, Badge } from '../types';
import { ALL_BADGES, getLevelFromXP } from '../data/gamificationData';
import { supabase } from '../lib/supabase';
import confetti from 'canvas-confetti';

export interface SOSTicketResponse {
  userMessage: string;
  adminReply: string;
  repliedAt: string;
  isRead: boolean;
}

export const ADMIN_EMAILS = [
  'admin@elana.com.br',
  'mariana@elana.com.br',
  'vitor@elana.com.br',
  'helena@elana.com.br'
];

export const isAdminUser = (user: UserProfile | null): boolean => {
  if (!user || !user.email) return false;
  const emailLower = user.email.toLowerCase();
  return ADMIN_EMAILS.includes(emailLower) || user.role === 'admin' || emailLower.includes('admin');
};

export const GENERIC_DEFAULT_AVATAR = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'><rect width='120' height='120' rx='60' fill='%23101B1E'/><circle cx='60' cy='45' r='22' fill='%23FF7F5B'/><path d='M25 105 C 25 75, 95 75, 95 105 Z' fill='%23FF7F5B'/></svg>";

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (email: string, name?: string, customId?: string) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<UserProfile>) => Promise<void>;
  purchaseJourney: (journeyId: string) => Promise<void>;
  completeLesson: (lessonId: string, xpReward?: number) => Promise<void>;
  saveLessonNote: (lessonId: string, note: string) => Promise<void>;
  addXP: (amount: number) => Promise<void>;
  awardBadge: (badgeId: string) => Promise<void>;
  unlockedBadgeModal: Badge | null;
  closeBadgeModal: () => void;
  sosResponse: SOSTicketResponse | null;
  sendSosTicket: (userMessage: string) => Promise<void>;
  replySosTicket: (adminReply: string) => Promise<void>;
  markSosResponseRead: () => void;
  refreshUserFromBackend: () => Promise<void>;
}

const DEFAULT_USER: UserProfile = {
  id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  name: 'Helena Ribeiro',
  email: 'helena@elana.com.br',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  role: 'Membro da Aldeia',
  familyTag: 'Mãe de 1ª viagem (0-2 anos)',
  purchasedJourneyIds: [],
  completedLessonIds: [],
  lessonNotes: {},
  xp: 25,
  level: 1,
  levelTitle: 'Semente',
  streakDays: 1,
  lastActiveDate: new Date().toISOString(),
  badges: [ALL_BADGES[0]] // Demo Helena badge
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('elana_user_session');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed;
      } catch (e) {
        console.error('Error parsing stored session', e);
      }
    }
    return null;
  });

  const [unlockedBadgeModal, setUnlockedBadgeModal] = useState<Badge | null>(null);
  const [sosResponse, setSosResponse] = useState<SOSTicketResponse | null>(() => {
    const savedTicket = localStorage.getItem('elana_sos_ticket_response');
    if (savedTicket) {
      try {
        return JSON.parse(savedTicket);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  // Re-hidratar dados atualizados do Supabase no carregamento inicial da sessão
  useEffect(() => {
    if (user?.email && user?.id) {
      fetchFullUserProfile(user.id, user.email, user.name).then(refreshed => {
        if (refreshed) {
          setUser(refreshed);
        }
      }).catch(err => {
        console.warn('Error rehydrating user session from backend:', err);
      });
    }
  }, []);

  // Salvar no localStorage sempre que o estado user mudar
  useEffect(() => {
    if (user) {
      try {
        localStorage.setItem('elana_user_session', JSON.stringify(user));
        if (user.email) {
          localStorage.setItem(`elana_user_data_${user.email.toLowerCase()}`, JSON.stringify(user));
        }
      } catch (err) {
        console.warn('localStorage quota exceeded, skipping local cache sync:', err);
      }
    } else {
      localStorage.removeItem('elana_user_session');
    }
  }, [user]);

  /**
   * HIDRATAÇÃO COMPLETA: Busca todos os dados do usuário no Supabase
   */
  const fetchFullUserProfile = async (userId: string, email: string, fallbackName?: string): Promise<UserProfile> => {
    try {
      const emailClean = email.toLowerCase().trim();

      // 1. Buscar Perfil Principal
      let { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .or(`id.eq.${userId},email.eq.${emailClean}`)
        .maybeSingle();

      // Se não encontrou no Supabase, cria um perfil padrão inicial
      if (!profile) {
        const initialName = fallbackName || emailClean.split('@')[0];
        const newProfilePayload = {
          id: userId,
          email: emailClean,
          name: initialName,
          avatar: GENERIC_DEFAULT_AVATAR,
          role: 'Membro da Aldeia',
          family_tag: 'Mãe / Pai de 1ª viagem',
          xp: 0,
          level_number: 1,
          level_name: 'Semente Plantada',
          level_icon: '🌱',
          streak_days: 1,
          notifications_enabled: false,
          updated_at: new Date().toISOString()
        };

        const { data: createdProfile } = await supabase
          .from('profiles')
          .upsert(newProfilePayload, { onConflict: 'id' })
          .select()
          .single();

        profile = createdProfile || newProfilePayload;
      }

      const profileId = profile.id || userId;

      // 2. Buscar Badges conquistadas
      const { data: userBadgesData } = await supabase
        .from('user_badges')
        .select('badge_id')
        .eq('profile_id', profileId);

      const unlockedBadgeIds = new Set((userBadgesData || []).map(b => b.badge_id));
      const badges = ALL_BADGES.filter(b => unlockedBadgeIds.has(b.id));

      // 3. Buscar Jornadas Adquiridas
      const { data: journeysData } = await supabase
        .from('user_purchased_journeys')
        .select('journey_id')
        .eq('profile_id', profileId);

      const purchasedJourneyIds = (journeysData || []).map(j => j.journey_id);

      // 4. Buscar Aulas Concluídas
      const { data: lessonsData } = await supabase
        .from('user_completed_lessons')
        .select('lesson_id')
        .eq('profile_id', profileId);

      const completedLessonIds = (lessonsData || []).map(l => l.lesson_id);

      // 5. Buscar Anotações de Aula
      const { data: notesData } = await supabase
        .from('user_lesson_notes')
        .select('lesson_id, note')
        .eq('profile_id', profileId);

      const lessonNotes: Record<string, string> = {};
      (notesData || []).forEach(n => {
        if (n.lesson_id && n.note) {
          lessonNotes[n.lesson_id] = n.note;
        }
      });

      // 6. Buscar Filhos / Membros da Família
      const { data: familyData } = await supabase
        .from('family_members')
        .select('*')
        .eq('profile_id', profileId);

      const children = (familyData || []).map(f => ({
        id: f.id,
        emoji: f.emoji || '👶',
        name: f.name || '',
        age: f.age || '',
        birthdate: f.birthdate || undefined,
        isPregnancy: !!f.is_pregnancy
      }));

      const xp = profile.xp || 0;
      const levelInfo = getLevelFromXP(xp);

      const hydratedUser: UserProfile = {
        id: profileId,
        email: profile.email || emailClean,
        name: profile.name || fallbackName || emailClean.split('@')[0],
        phone: profile.phone || undefined,
        avatar: profile.avatar || GENERIC_DEFAULT_AVATAR,
        role: profile.role || 'Membro da Aldeia',
        familyTag: profile.family_tag || profile.tag || 'Mãe / Pai de 1ª viagem',
        bio: profile.bio || undefined,
        xp,
        level: profile.level_number || levelInfo.level,
        levelTitle: profile.level_name || levelInfo.title,
        streakDays: profile.streak_days || 1,
        lastActiveDate: profile.last_active_date || new Date().toISOString(),
        purchasedJourneyIds,
        completedLessonIds,
        lessonNotes,
        badges,
        children
      };

      return hydratedUser;
    } catch (err) {
      console.error('Error hydrating profile from Supabase, falling back to local defaults:', err);
      return {
        id: userId,
        email,
        name: fallbackName || email.split('@')[0],
        avatar: GENERIC_DEFAULT_AVATAR,
        role: 'Membro da Aldeia',
        familyTag: 'Mãe / Pai de 1ª viagem',
        purchasedJourneyIds: [],
        completedLessonIds: [],
        lessonNotes: {},
        xp: 0,
        level: 1,
        levelTitle: 'Semente',
        streakDays: 1,
        lastActiveDate: new Date().toISOString(),
        badges: []
      };
    }
  };

  const login = async (email: string, name?: string, customId?: string) => {
    const emailClean = email.toLowerCase().trim();
    let validId = (customId && customId.length > 20) ? customId : null;

    // Tenta encontrar o perfil existente pelo email para preservar o ID do Supabase
    if (!validId) {
      try {
        const { data: existing } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', emailClean)
          .maybeSingle();

        if (existing?.id) {
          validId = existing.id;
        }
      } catch (err) {
        console.warn('Error checking existing profile id:', err);
      }
    }

    if (!validId) {
      validId = crypto.randomUUID();
    }

    const hydrated = await fetchFullUserProfile(validId, emailClean, name);
    
    setUser(hydrated);
    try {
      localStorage.setItem('elana_user_session', JSON.stringify(hydrated));
    } catch (e) {
      console.warn('Could not save session to localStorage:', e);
    }
  };

  const refreshUserFromBackend = async () => {
    if (!user || !user.email) return;
    const refreshed = await fetchFullUserProfile(user.id, user.email, user.name);
    setUser(refreshed);
  };

  const updateUser = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    const updatedUser: UserProfile = {
      ...user,
      ...updates
    };
    setUser(updatedUser);

    // Sincronizar dados no Supabase
    try {
      if (updatedUser.id && updatedUser.id.length > 10) {
        // 1. Atualizar Tabela profiles
        await supabase.from('profiles').upsert({
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          phone: updatedUser.phone || null,
          avatar: updatedUser.avatar,
          role: updatedUser.role,
          family_tag: updatedUser.familyTag || null,
          bio: updatedUser.bio || null,
          xp: updatedUser.xp,
          level_number: updatedUser.level,
          level_name: updatedUser.levelTitle,
          streak_days: updatedUser.streakDays,
          last_active_date: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });

        // 2. Sincronizar Filhos na tabela family_members (se foram alterados)
        if (updates.children) {
          // Deletar anteriores e inserir lista atual
          await supabase.from('family_members').delete().eq('profile_id', updatedUser.id);
          if (updates.children.length > 0) {
            const familyRows = updates.children.map(c => ({
              id: (c.id && c.id.length > 20) ? c.id : crypto.randomUUID(),
              profile_id: updatedUser.id,
              name: c.name,
              age: c.age,
              emoji: c.emoji || '👶',
              birthdate: c.birthdate || null,
              is_pregnancy: !!c.isPregnancy
            }));
            await supabase.from('family_members').insert(familyRows);
          }
        }
      }
    } catch (e) {
      console.error('Supabase profile update sync error:', e);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('elana_user_session');
    supabase.auth.signOut();
  };

  const purchaseJourney = async (journeyId: string) => {
    if (!user) return;
    if (user.purchasedJourneyIds.includes(journeyId)) return;

    const newPurchased = [...user.purchasedJourneyIds, journeyId];
    await updateUser({ purchasedJourneyIds: newPurchased });

    try {
      await supabase.from('user_purchased_journeys').upsert({
        profile_id: user.id,
        journey_id: journeyId
      }, { onConflict: 'profile_id, journey_id' });
    } catch (e) {
      console.error('Error recording purchased journey to Supabase:', e);
    }
  };

  const addXP = async (amount: number) => {
    if (!user) return;
    const newXP = user.xp + amount;
    const levelInfo = getLevelFromXP(newXP);
    
    await updateUser({
      xp: newXP,
      level: levelInfo.level,
      levelTitle: levelInfo.title
    });
  };

  const completeLesson = async (lessonId: string, xpReward: number = 10) => {
    if (!user) return;
    if (user.completedLessonIds.includes(lessonId)) return;

    let newXP = user.xp + xpReward;
    
    // Check if new badge unlocked (e.g. b4)
    let newlyUnlockedBadge: Badge | null = null;
    const currentBadgeIds = new Set(user.badges.map(b => b.id));

    if (!currentBadgeIds.has('b4')) {
      newlyUnlockedBadge = ALL_BADGES.find(b => b.id === 'b4') || null;
      if (newlyUnlockedBadge) {
        newXP += newlyUnlockedBadge.rewardXp;
      }
    }

    const levelInfo = getLevelFromXP(newXP);
    const updatedBadges = newlyUnlockedBadge 
      ? [...user.badges, newlyUnlockedBadge] 
      : user.badges;

    await updateUser({
      completedLessonIds: [...user.completedLessonIds, lessonId],
      xp: newXP,
      level: levelInfo.level,
      levelTitle: levelInfo.title,
      badges: updatedBadges
    });

    // Gravar aula concluída no Supabase
    try {
      await supabase.from('user_completed_lessons').upsert({
        profile_id: user.id,
        lesson_id: lessonId
      }, { onConflict: 'profile_id, lesson_id' });

      // Se desbloqueou badge b4, gravar badge no Supabase
      if (newlyUnlockedBadge) {
        await supabase.from('user_badges').upsert({
          profile_id: user.id,
          badge_id: newlyUnlockedBadge.id
        }, { onConflict: 'profile_id, badge_id' });
      }
    } catch (e) {
      console.error('Error recording completed lesson to Supabase:', e);
    }

    if (newlyUnlockedBadge) {
      setUnlockedBadgeModal(newlyUnlockedBadge);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  const awardBadge = async (badgeId: string) => {
    if (!user) return;
    const currentBadgeIds = new Set(user.badges.map(b => b.id));
    if (currentBadgeIds.has(badgeId)) return; // Already has it

    const badgeToAward = ALL_BADGES.find(b => b.id === badgeId);
    if (!badgeToAward) return;

    await updateUser({
      badges: [...user.badges, badgeToAward],
      xp: user.xp + (badgeToAward.rewardXp || 0)
    });

    // Gravar badge no Supabase
    try {
      await supabase.from('user_badges').upsert({
        profile_id: user.id,
        badge_id: badgeId
      }, { onConflict: 'profile_id, badge_id' });
    } catch (e) {
      console.error('Error saving user badge to Supabase:', e);
    }

    setUnlockedBadgeModal(badgeToAward);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const saveLessonNote = async (lessonId: string, note: string) => {
    if (!user) return;
    const newNotes = {
      ...user.lessonNotes,
      [lessonId]: note
    };
    
    await updateUser({ lessonNotes: newNotes });

    try {
      await supabase.from('user_lesson_notes').upsert({
        profile_id: user.id,
        lesson_id: lessonId,
        note,
        updated_at: new Date().toISOString()
      }, { onConflict: 'profile_id, lesson_id' });
    } catch (e) {
      console.error('Error saving lesson note to Supabase:', e);
    }
  };

  const sendSosTicket = async (userMessage: string) => {
    if (!user) return;
    const mockReply: SOSTicketResponse = {
      userMessage,
      adminReply: `Oi, ${user.name.split(' ')[0]}! Recebemos seu pedido de acolhimento SOS. Nossa equipe já acolheu seu desabafo com todo carinho e sigilo. Você não está sozinha. Como podemos te ajudar melhor hoje? 💖`,
      repliedAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      isRead: false
    };

    setSosResponse(mockReply);
    localStorage.setItem('elana_sos_ticket_response', JSON.stringify(mockReply));

    try {
      await supabase.from('sos_tickets').insert([{
        profile_id: user.id,
        user_name: user.name,
        user_avatar: user.avatar,
        user_message: userMessage,
        admin_reply: mockReply.adminReply,
        replied_at: new Date().toISOString(),
        is_read: false,
        status: 'in_progress'
      }]);
    } catch (e) {
      console.error('Error saving SOS ticket to Supabase:', e);
    }
  };

  const replySosTicket = async (adminReply: string) => {
    if (!sosResponse) return;
    const updated: SOSTicketResponse = {
      ...sosResponse,
      adminReply,
      repliedAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      isRead: false
    };
    setSosResponse(updated);
    localStorage.setItem('elana_sos_ticket_response', JSON.stringify(updated));
  };

  const markSosResponseRead = () => {
    if (!sosResponse) return;
    const updated = { ...sosResponse, isRead: true };
    setSosResponse(updated);
    localStorage.setItem('elana_sos_ticket_response', JSON.stringify(updated));
  };

  const closeBadgeModal = () => {
    setUnlockedBadgeModal(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        updateUser,
        purchaseJourney,
        completeLesson,
        saveLessonNote,
        addXP,
        awardBadge,
        unlockedBadgeModal,
        closeBadgeModal,
        sosResponse,
        sendSosTicket,
        replySosTicket,
        markSosResponseRead,
        refreshUserFromBackend
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
