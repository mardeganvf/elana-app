import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { UserProfile, Badge } from '../types';
import { ALL_BADGES, getLevelFromXP, USER_LEVELS } from '../data/gamificationData';
import { JOURNEYS_DATA } from '../data/journeysData';
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
  'helena@elana.com.br',
  'mardeganvf@gmail.com',
  'vitormardegan@gmail.com',
  'vitor.mardegan@redetv.com.br',
  'vitormardegan@redetv.com.br'
];

export const isAdminUser = (user: UserProfile | null): boolean => {
  if (!user) return false;
  const roleLower = (user.role || '').toLowerCase();
  if (roleLower.includes('admin') || roleLower.includes('guia')) return true;
  if (!user.email) return false;
  const emailLower = user.email.toLowerCase();
  return ADMIN_EMAILS.includes(emailLower) || emailLower.includes('admin') || emailLower.includes('mardegan');
};

export const GENERIC_DEFAULT_AVATAR = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'><rect width='120' height='120' rx='60' fill='%23101B1E'/><circle cx='60' cy='45' r='22' fill='%23FF7F5B'/><path d='M25 105 C 25 75, 95 75, 95 105 Z' fill='%23FF7F5B'/></svg>";

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (email: string, name?: string, customId?: string) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<UserProfile>) => Promise<void>;
  purchaseJourney: (journeyId: string) => Promise<void>;
  completeLesson: (lessonId: string) => Promise<void>;
  toggleCompleteLesson: (lessonId: string) => Promise<void>;
  saveLessonNote: (lessonId: string, note: string) => Promise<void>;
  addXP: (amount: number) => Promise<void>;
  awardBadge: (badgeId: string) => Promise<void>;
  unlockedBadgeModal: Badge | null;
  closeBadgeModal: () => void;
  unlockedLevelUpModal: { levelInfo: any; previousLevel: number } | null;
  closeLevelUpModal: () => void;
  triggerLevelUpModal: (level: number) => void;
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
  role: 'Membro da Comunidade',
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

  const userRef = useRef<UserProfile | null>(user);
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const [unlockedBadgeModal, setUnlockedBadgeModal] = useState<Badge | null>(null);
  const activeBadgeModalRef = useRef<Badge | null>(null);

  const [unlockedLevelUpModal, setUnlockedLevelUpModal] = useState<{
    levelInfo: any;
    previousLevel: number;
  } | null>(null);
  const pendingLevelUpRef = useRef<{
    levelInfo: any;
    previousLevel: number;
  } | null>(null);
  const [pendingLevelUp, setPendingLevelUp] = useState<{
    levelInfo: any;
    previousLevel: number;
  } | null>(null);

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



  // Re-hidratar dados atualizados do Supabase no carregamento inicial e em mudanças de sessão
  useEffect(() => {
    // 1. Hidratar usuário atual se já houver sessão salva
    if (user?.email && user?.id) {
      fetchFullUserProfile(user.id, user.email, user.name)
        .then(refreshed => {
          if (refreshed) setUser(refreshed);
        })
        .catch(err => {
          console.warn('Notice rehydrating user session:', err);
        });
    }

    // 2. Escutar eventos de atualização de usuário e e-mail do Supabase Auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        if ((event === 'USER_UPDATED' || event === 'SIGNED_IN') && session?.user?.email) {
          const refreshed = await fetchFullUserProfile(
            session.user.id,
            session.user.email,
            session.user.user_metadata?.name
          );
          if (refreshed) {
            setUser(refreshed);
            try {
              localStorage.setItem('elana_user_session', JSON.stringify(refreshed));
            } catch (e) {}
          }
        }
      } catch (err) {
        console.warn('Notice in onAuthStateChange handler:', err);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Carregar último chamado SOS do usuário direto do Supabase
  useEffect(() => {
    if (!user?.id) return;
    const fetchUserSosTicket = async () => {
      try {
        const { data: ticketData } = await supabase
          .from('sos_tickets')
          .select('*')
          .eq('profile_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (ticketData && ticketData.admin_reply) {
          setSosResponse({
            userMessage: ticketData.user_message || '',
            adminReply: ticketData.admin_reply,
            repliedAt: ticketData.replied_at
              ? new Date(ticketData.replied_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
              : new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            isRead: Boolean(ticketData.is_read)
          });
        }
      } catch (err) {
        console.warn('Notice fetching SOS ticket:', err);
      }
    };
    fetchUserSosTicket();
  }, [user?.id]);

  // Salvar no localStorage sempre que o estado user mudar
  useEffect(() => {
    if (user) {
      try {
        localStorage.setItem('elana_user_session', JSON.stringify(user));
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

      // 1. Buscar Perfil Principal prioritariamente por e-mail
      let profile: any = null;
      const { data: profileByEmail } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', emailClean)
        .maybeSingle();

      if (profileByEmail) {
        profile = profileByEmail;
      } else if (userId && userId.length > 20) {
        const { data: profileById } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();
        if (profileById) {
          profile = profileById;
        }
      }

      // Se não encontrou no Supabase, cria um perfil padrão inicial
      if (!profile) {
        const initialName = fallbackName || emailClean.split('@')[0];
        const newProfilePayload = {
          id: (userId && userId.length > 20) ? userId : crypto.randomUUID(),
          email: emailClean,
          name: initialName,
          avatar: GENERIC_DEFAULT_AVATAR,
          role: 'Membro da Comunidade',
          family_tag: 'Mãe / Pai de 1ª viagem',
          tag: 'Membro da Comunidade',
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
          .upsert(newProfilePayload, { onConflict: 'email' })
          .select()
          .maybeSingle();

        profile = createdProfile || newProfilePayload;
      }

      const profileId = profile.id || userId;

      // 2. Buscar Badges conquistadas
      const { data: userBadgesData } = await supabase
        .from('user_badges')
        .select('badge_id, unlocked_at')
        .eq('profile_id', profileId);

      const unlockedBadgeIds = new Set((userBadgesData || []).map(b => b.badge_id));

      // Sincronizar Conquistas Emocionais retroativamente a partir de emotional_checkins
      let rawCheckinsData: any[] = [];
      try {
        const { data: checkinsData } = await supabase
          .from('emotional_checkins')
          .select('emotion_id, checkin_date, created_at')
          .eq('profile_id', profileId);

        if (checkinsData && checkinsData.length > 0) {
          rawCheckinsData = checkinsData;
          const autoBadges: string[] = ['b11']; // b11 = Sinal de Cuidado (1º check-in)
          checkinsData.forEach(c => {
            if (c.emotion_id === 'sem_energia' || c.emotion_id === 'exausto') autoBadges.push('b12');
            if (c.emotion_id === 'esperanca') autoBadges.push('b13');
            if (c.emotion_id === 'celebrando') autoBadges.push('b14');
            if (c.emotion_id === 'precisando_luz' || c.emotion_id === 'preciso_luz') autoBadges.push('b15');
          });

          const totalCheckins = checkinsData.length;
          if (totalCheckins >= 90) autoBadges.push('b20');
          if (totalCheckins >= 60) autoBadges.push('b19');
          if (totalCheckins >= 30) autoBadges.push('b18');
          if (totalCheckins >= 20) autoBadges.push('b17');
          if (totalCheckins >= 10) autoBadges.push('b16');

          autoBadges.forEach(bId => {
            if (!unlockedBadgeIds.has(bId)) {
              unlockedBadgeIds.add(bId);
              supabase.from('user_badges').upsert({
                profile_id: profileId,
                badge_id: bId,
                unlocked_at: new Date().toISOString()
              }).then();
            }
          });
        }
      } catch (err) {
        console.warn('Notice checking retroactive emotional badges:', err);
      }

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
      let children: any[] = [];
      if (profile.family_tag && profile.family_tag.startsWith('JSON_CHILDREN:')) {
        try {
          children = JSON.parse(profile.family_tag.replace('JSON_CHILDREN:', ''));
        } catch (e) {
          console.warn('Error parsing children backup:', e);
        }
      } else {
        try {
          const { data: familyData } = await supabase
            .from('family_members')
            .select('*')
            .eq('profile_id', profileId);

          if (familyData && familyData.length > 0) {
            children = familyData.map(f => ({
              id: f.id,
              emoji: f.emoji || '👶',
              name: f.name || '',
              age: f.age || '',
              birthdate: f.birthdate || undefined,
              isPregnancy: !!f.is_pregnancy
            }));
          }
        } catch (err) {
          console.warn('Error fetching family_members table:', err);
        }
      }

      // 🔒 Isolamento Rigoroso de Dados:
      // Usuários comuns NUNCA herdam dados de terceiros.
      // Apenas administradores autorizados (ADMIN_EMAILS) sincronizam seus próprios dados caso acessem por outro de seus e-mails de admin.
      const isUserAdmin = isAdminUser({ email: emailClean, role: profile.role } as any);
      let userBio = profile.bio;
      let adminRecoveredXp = 0;
      let adminRecoveredBio = userBio;
      let adminRecoveredPhone = profile.phone;
      let adminRecoveredChildren = children;

      if (isUserAdmin && ((profile.xp || 0) === 0 || !userBio || unlockedBadgeIds.size === 0 || children.length === 0)) {
        try {
          const { data: adminProfiles } = await supabase
            .from('profiles')
            .select('*')
            .in('email', ADMIN_EMAILS)
            .neq('id', profileId)
            .gt('xp', 0);

          if (adminProfiles && adminProfiles.length > 0) {
            const bestAdmin = adminProfiles.sort((a, b) => (b.xp || 0) - (a.xp || 0))[0];
            if (bestAdmin) {
              adminRecoveredXp = Math.max(adminRecoveredXp, bestAdmin.xp || 0);
              if (!adminRecoveredBio && bestAdmin.bio) adminRecoveredBio = bestAdmin.bio;
              if (!adminRecoveredPhone && bestAdmin.phone) adminRecoveredPhone = bestAdmin.phone;

              // Recuperar filhos de admin se o perfil atual estiver sem
              if (adminRecoveredChildren.length === 0) {
                const { data: adminFamily } = await supabase
                  .from('family_members')
                  .select('*')
                  .eq('profile_id', bestAdmin.id);
                if (adminFamily && adminFamily.length > 0) {
                  adminRecoveredChildren = adminFamily.map((f: any) => ({
                    id: f.id,
                    emoji: f.emoji || '👶',
                    name: f.name || '',
                    age: f.age || '',
                    birthdate: f.birthdate || undefined,
                    isPregnancy: !!f.is_pregnancy
                  }));
                }
              }

              // Recuperar badges de admin
              const { data: oldBadges } = await supabase
                .from('user_badges')
                .select('badge_id')
                .eq('profile_id', bestAdmin.id);
              if (oldBadges) {
                oldBadges.forEach(b => {
                  if (!unlockedBadgeIds.has(b.badge_id)) {
                    unlockedBadgeIds.add(b.badge_id);
                    supabase.from('user_badges').upsert({
                      profile_id: profileId,
                      badge_id: b.badge_id,
                      unlocked_at: new Date().toISOString()
                    }, { onConflict: 'profile_id, badge_id' }).then();
                  }
                });
              }

              // Recuperar aulas concluídas de admin
              const { data: oldLessons } = await supabase
                .from('user_completed_lessons')
                .select('lesson_id')
                .eq('profile_id', bestAdmin.id);
              if (oldLessons) {
                oldLessons.forEach(l => {
                  if (!completedLessonIds.includes(l.lesson_id)) {
                    completedLessonIds.push(l.lesson_id);
                    supabase.from('user_completed_lessons').upsert({
                      profile_id: profileId,
                      lesson_id: l.lesson_id,
                      completed_at: new Date().toISOString()
                    }, { onConflict: 'profile_id, lesson_id' }).then();
                  }
                });
              }

              // Recuperar jornadas adquiridas de admin
              const { data: oldJourneys } = await supabase
                .from('user_purchased_journeys')
                .select('journey_id')
                .eq('profile_id', bestAdmin.id);
              if (oldJourneys) {
                oldJourneys.forEach(j => {
                  if (!purchasedJourneyIds.includes(j.journey_id)) {
                    purchasedJourneyIds.push(j.journey_id);
                    supabase.from('user_purchased_journeys').upsert({
                      profile_id: profileId,
                      journey_id: j.journey_id
                    }, { onConflict: 'profile_id, journey_id' }).then();
                  }
                });
              }

              // Recuperar anotações de admin
              const { data: oldNotes } = await supabase
                .from('user_lesson_notes')
                .select('lesson_id, note')
                .eq('profile_id', bestAdmin.id);
              if (oldNotes) {
                oldNotes.forEach(n => {
                  if (n.lesson_id && n.note && !lessonNotes[n.lesson_id]) {
                    lessonNotes[n.lesson_id] = n.note;
                    supabase.from('user_lesson_notes').upsert({
                      profile_id: profileId,
                      lesson_id: n.lesson_id,
                      note: n.note,
                      updated_at: new Date().toISOString()
                    }, { onConflict: 'profile_id, lesson_id' }).then();
                  }
                });
              }
            }
          }
        } catch (e) {
          console.warn('Notice syncing admin profile data across admin emails:', e);
        }
      }

      // Sincronização e Auditoria Completa de Conquistas Reais do Usuário
      const checkAndAddBadge = (badgeId: string) => {
        if (!unlockedBadgeIds.has(badgeId)) {
          unlockedBadgeIds.add(badgeId);
          supabase.from('user_badges').upsert({
            profile_id: profileId,
            badge_id: badgeId,
            unlocked_at: new Date().toISOString()
          }, { onConflict: 'profile_id, badge_id' }).then();
        }
      };

      // 🌿 1. Primeiros Passos (Conquistas condicionais reais - b1 não é automática para novos usuários começarem com 0 conquistas)
      if (userBio && userBio.trim().length > 0 && children.length > 0) {
        checkAndAddBadge('b2'); // Criando Raízes
      }
      if (profile.notifications_enabled) {
        checkAndAddBadge('b3'); // Sempre Alerta
      }

      // ▶️ 2. Jornadas de Conhecimento (b4, b5, b6, b7, b9)
      if (completedLessonIds.length >= 1) {
        checkAndAddBadge('b4'); // Minha Jornada
      }
      let allJourneysList = JOURNEYS_DATA;
      try {
        const cachedJ = localStorage.getItem('elana_journeys_cache_v4');
        if (cachedJ) {
          const parsedJ = JSON.parse(cachedJ);
          if (Array.isArray(parsedJ) && parsedJ.length > 0) {
            allJourneysList = parsedJ;
          }
        }
      } catch (e) {}

      for (const journey of allJourneysList) {
        const journeyLessonIds = (journey.modules || []).flatMap((m: any) => (m.lessons || []).map((l: any) => l.id));
        const completedInJourney = journeyLessonIds.filter((id: string) => completedLessonIds.includes(id)).length;
        const total = journeyLessonIds.length;
        if (total > 0) {
          const pct = (completedInJourney / total) * 100;
          if (pct >= 25) checkAndAddBadge('b5'); // Passos Seguros (25%)
          if (pct >= 50) checkAndAddBadge('b6'); // Chegando Lá! (50%)
          if (pct >= 75) checkAndAddBadge('b58'); // Quase Lá! (75%)
          if (pct >= 100) checkAndAddBadge('b7'); // Caminho Iluminado (100%)
        }
      }
      if (Object.keys(lessonNotes).length >= 1) {
        checkAndAddBadge('b9'); // Minhas Reflexões
      }

      // 🌿 Cálculo Preciso de Dias de Caminhada Conosco (Streak / Dias Conosco)
      let earliestActivityTimestamp = profile.created_at ? new Date(profile.created_at).getTime() : Date.now();
      
      if (userBadgesData && userBadgesData.length > 0) {
        userBadgesData.forEach((b: any) => {
          if (b.unlocked_at) {
            const t = new Date(b.unlocked_at).getTime();
            if (t > 0 && t < earliestActivityTimestamp) earliestActivityTimestamp = t;
          }
        });
      }

      if (rawCheckinsData && rawCheckinsData.length > 0) {
        rawCheckinsData.forEach((c: any) => {
          const dateVal = c.created_at || c.checkin_date;
          if (dateVal) {
            const t = new Date(dateVal).getTime();
            if (t > 0 && t < earliestActivityTimestamp) earliestActivityTimestamp = t;
          }
        });
      }

      const diffCalendarDays = Math.max(1, Math.floor((Date.now() - earliestActivityTimestamp) / (1000 * 60 * 60 * 24)) + 1);
      const calculatedStreak = Math.max(profile.streak_days || 1, diffCalendarDays);

      // ⚡ 4. Evolução Constante (b24, b25, b26, b27, b28)
      if (calculatedStreak >= 10) checkAndAddBadge('b24');
      if (calculatedStreak >= 20) checkAndAddBadge('b25');
      if (calculatedStreak >= 30) checkAndAddBadge('b26');
      if (calculatedStreak >= 60) checkAndAddBadge('b27');
      if (calculatedStreak >= 90) checkAndAddBadge('b28');

      // 💬 5. Espaços de Troca & 🤝 6. Rede de Apoio & 💖 8. Acolhimento
      try {
        const [postsRes, commentsRes, testimonialsRes] = await Promise.all([
          supabase.from('community_posts').select('id, transversal_room_id, is_anonymous').eq('author_id', profileId),
          supabase.from('community_comments').select('id').eq('author_id', profileId),
          supabase.from('profile_testimonials').select('id').eq('recipient_profile_id', profileId)
        ]);

        if (postsRes.data && postsRes.data.length > 0) {
          checkAndAddBadge('b29'); // Voz de Coragem (1º post)
          postsRes.data.forEach(p => {
            if (p.is_anonymous || p.transversal_room_id === 'confessionario') checkAndAddBadge('b30');
            if (p.transversal_room_id === 'cantinho-da-mel' || p.transversal_room_id === 'trocas-livres') checkAndAddBadge('b31');
            if (p.transversal_room_id === 'espaco-dois') checkAndAddBadge('b32');
            if (p.transversal_room_id === 'cuidando-de-quem-cuida') checkAndAddBadge('b33');
          });
        }

        if (commentsRes.data && commentsRes.data.length > 0) {
          checkAndAddBadge('b36'); // Primeiro Acolhimento
          const commentCount = commentsRes.data.length;
          if (commentCount >= 5) checkAndAddBadge('b37');
          if (commentCount >= 25) checkAndAddBadge('b38');
          if (commentCount >= 100) checkAndAddBadge('b39');
          if (commentCount >= 250) checkAndAddBadge('b40');
          if (commentCount >= 500) checkAndAddBadge('b41');
        }

        if (testimonialsRes.data && testimonialsRes.data.length > 0) {
          checkAndAddBadge('b57'); // Afeto Recebido
        }
      } catch (err) {
        console.warn('Notice checking community badges:', err);
      }

      const badges = ALL_BADGES.filter(b => unlockedBadgeIds.has(b.id));

      const badgeXpSum = badges.reduce((acc, b) => acc + (b.rewardXp || 0), 0);
      const calculatedMinimumXp = badgeXpSum;
      const xp = Math.max(profile.xp || 0, adminRecoveredXp, calculatedMinimumXp);
      const levelInfo = getLevelFromXP(xp);
      const isTourFinished = profile.tag === 'onboarded' || xp >= 25 || (isUserAdmin && xp > 0);

      const finalBio = userBio || adminRecoveredBio || undefined;
      const finalPhone = profile.phone || adminRecoveredPhone || undefined;
      const finalChildren = children.length > 0 ? children : adminRecoveredChildren;

      // Auto-heal Supabase se profiles.xp, bio ou streak_days de admin estiverem desatualizados
      if ((xp > (profile.xp || 0) || calculatedStreak > (profile.streak_days || 1) || (isUserAdmin && adminRecoveredBio && !profile.bio)) && profileId) {
        supabase
          .from('profiles')
          .update({
            xp,
            level_number: levelInfo.level,
            level_name: levelInfo.title,
            level_icon: levelInfo.icon,
            streak_days: calculatedStreak,
            bio: profile.bio || adminRecoveredBio || null,
            phone: profile.phone || adminRecoveredPhone || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', profileId)
          .then();
      }

      const hydratedUser: UserProfile = {
        id: profileId,
        email: profile.email || emailClean,
        name: profile.name || fallbackName || emailClean.split('@')[0],
        phone: finalPhone,
        avatar: profile.avatar || GENERIC_DEFAULT_AVATAR,
        role: profile.role || (isUserAdmin ? 'Administrador' : 'Membro da Comunidade'),
        familyTag: profile.family_tag || profile.tag || 'Mãe / Pai de 1ª viagem',
        bio: finalBio,
        notificationsEnabled: !!profile.notifications_enabled,
        onboardingCompleted: isTourFinished,
        xp,
        level: profile.level_number || levelInfo.level,
        levelTitle: profile.level_name || levelInfo.title,
        streakDays: calculatedStreak,
        lastActiveDate: profile.last_active_date || new Date().toISOString(),
        purchasedJourneyIds,
        completedLessonIds,
        lessonNotes,
        badges,
        children: finalChildren
      };

      return hydratedUser;
    } catch (err) {
      console.error('Error hydrating profile from Supabase, falling back to local defaults:', err);
      return {
        id: userId,
        email,
        name: fallbackName || email.split('@')[0],
        avatar: GENERIC_DEFAULT_AVATAR,
        role: 'Membro da Comunidade',
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
    let profileId = (customId && customId.length > 20) ? customId : '';

    // Limpar cache de sessão local se pertencer a outro usuário para evitar herança cruzada
    try {
      const savedSession = localStorage.getItem('elana_user_session');
      if (savedSession) {
        const parsed = JSON.parse(savedSession);
        if (parsed.email && parsed.email.toLowerCase().trim() !== emailClean) {
          localStorage.removeItem('elana_user_session');
        }
      }
    } catch (e) {}

    // Tenta encontrar o perfil existente pelo email para preservar o ID do Supabase
    if (!profileId) {
      try {
        const { data: existing } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', emailClean)
          .maybeSingle();

        if (existing?.id) {
          profileId = existing.id;
        }
      } catch (err) {
        console.warn('Error checking existing profile id:', err);
      }
    }

    if (!profileId) {
      profileId = crypto.randomUUID();
    }

    const hydrated = await fetchFullUserProfile(profileId, emailClean, name);
    
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
    const baseUser = userRef.current || user;
    if (!baseUser) return;

    const currentBadges = updates.badges !== undefined ? updates.badges : (baseUser.badges || []);
    const badgeXpSum = currentBadges.reduce((acc, b) => acc + (b.rewardXp || 0), 0);
    const guaranteedMinXp = badgeXpSum;

    const previousLevel = baseUser.level || getLevelFromXP(baseUser.xp).level;
    const requestedXp = updates.xp !== undefined ? updates.xp : baseUser.xp;
    const nextXp = Math.max(requestedXp, guaranteedMinXp);
    const nextLevelInfo = getLevelFromXP(nextXp);

    const updatedUser: UserProfile = {
      ...baseUser,
      ...updates,
      xp: nextXp,
      level: updates.level !== undefined ? updates.level : nextLevelInfo.level,
      levelTitle: updates.levelTitle !== undefined ? updates.levelTitle : nextLevelInfo.title
    };
    userRef.current = updatedUser;
    setUser(updatedUser);

    // Detect if rank level promoted!
    if (nextLevelInfo.level > previousLevel && previousLevel >= 1) {
      const levelUpPayload = {
        levelInfo: nextLevelInfo,
        previousLevel
      };
      if (activeBadgeModalRef.current !== null || pendingLevelUpRef.current !== null || unlockedBadgeModal !== null) {
        pendingLevelUpRef.current = levelUpPayload;
        setPendingLevelUp(levelUpPayload);
      } else {
        setTimeout(() => {
          if (activeBadgeModalRef.current === null && pendingLevelUpRef.current === null) {
            setUnlockedLevelUpModal(levelUpPayload);
          }
        }, 1000);
      }
    }

    try {
      localStorage.setItem('elana_user_session', JSON.stringify(updatedUser));
    } catch (err) {
      console.warn('LocalStorage error:', err);
    }

    // Sincronizar dados no Supabase
    try {
      if (updatedUser.id && updatedUser.id.length > 10) {
        const levelInfo = getLevelFromXP(updatedUser.xp);

        // 1. Atualizar Tabela profiles com colunas válidas
        let familyTagPayload = updatedUser.familyTag || null;
        if (updates.children !== undefined) {
          familyTagPayload = `JSON_CHILDREN:${JSON.stringify(updates.children)}`;
        } else if (updatedUser.children) {
          familyTagPayload = `JSON_CHILDREN:${JSON.stringify(updatedUser.children)}`;
        }

        const profilePayload: Record<string, any> = {
          id: updatedUser.id,
          email: updatedUser.email.toLowerCase().trim(),
          name: updatedUser.name,
          phone: updatedUser.phone || null,
          avatar: updatedUser.avatar,
          role: updatedUser.role,
          family_tag: familyTagPayload,
          tag: (updatedUser.onboardingCompleted || updatedUser.xp >= 25) ? 'onboarded' : 'Membro da Comunidade',
          bio: updatedUser.bio || null,
          xp: updatedUser.xp,
          level_number: updatedUser.level || levelInfo.level,
          level_name: updatedUser.levelTitle || levelInfo.title,
          level_icon: levelInfo.icon || '🌱',
          streak_days: updatedUser.streakDays,
          notifications_enabled: !!updatedUser.notificationsEnabled,
          last_active_date: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        // Se o e-mail foi alterado, limpar/fundir qualquer registro abandonado com o novo e-mail
        if (updates.email && updates.email.toLowerCase().trim() !== baseUser.email.toLowerCase().trim()) {
          try {
            const cleanNewEmail = updates.email.toLowerCase().trim();
            const { data: conflictProfile } = await supabase
              .from('profiles')
              .select('id, xp')
              .eq('email', cleanNewEmail)
              .maybeSingle();

            if (conflictProfile && conflictProfile.id !== updatedUser.id) {
              if ((conflictProfile.xp || 0) === 0) {
                await supabase.from('profiles').delete().eq('id', conflictProfile.id);
              }
            }
          } catch (e) {
            console.warn('Notice resolving email conflict before update:', e);
          }
        }

        const { error: profileErr } = await supabase
          .from('profiles')
          .upsert(profilePayload, { onConflict: 'id' });

        if (profileErr) {
          console.error('Supabase profile update error:', profileErr.message);
        }

        // 2. Sincronizar Filhos na tabela family_members (se foram alterados)
        if (updates.children) {
          try {
            await supabase.from('family_members').delete().eq('profile_id', updatedUser.id);
            if (updates.children.length > 0) {
              const familyRows = updates.children.map(c => {
                const row: Record<string, any> = {
                  profile_id: updatedUser.id,
                  name: c.name,
                  age: c.age,
                  emoji: c.emoji || '👶',
                  birthdate: c.birthdate || null,
                  is_pregnancy: !!c.isPregnancy
                };
                if (c.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(c.id)) {
                  row.id = c.id;
                }
                return row;
              });
              const { error: famErr } = await supabase.from('family_members').insert(familyRows);
              if (famErr) {
                console.warn('Supabase family_members insert notice:', famErr.message);
              }
            }
          } catch (famErr) {
            console.warn('Supabase family_members sync notice:', famErr);
          }
        }
      }
    } catch (e) {
      console.error('Supabase profile update sync error:', e);
    }
  };

  const logout = () => {
    userRef.current = null;
    setUser(null);
    setSosResponse(null);
    localStorage.removeItem('elana_user_session');
    localStorage.removeItem('elana_sos_ticket_response');
    supabase.auth.signOut();
  };

  const purchaseJourney = async (journeyId: string) => {
    const currentUser = userRef.current || user;
    if (!currentUser) return;
    if (currentUser.purchasedJourneyIds.includes(journeyId)) return;

    const newPurchased = [...currentUser.purchasedJourneyIds, journeyId];
    await updateUser({ purchasedJourneyIds: newPurchased });

    try {
      await supabase.from('user_purchased_journeys').upsert({
        profile_id: currentUser.id,
        journey_id: journeyId
      }, { onConflict: 'profile_id, journey_id' });
    } catch (e) {
      console.error('Error recording purchased journey to Supabase:', e);
    }
  };

  const addXP = async (amount: number) => {
    const currentUser = userRef.current || user;
    if (!currentUser) return;
    const newXP = currentUser.xp + amount;
    const levelInfo = getLevelFromXP(newXP);
    
    await updateUser({
      xp: newXP,
      level: levelInfo.level,
      levelTitle: levelInfo.title
    });
  };

  const completeLesson = async (lessonId: string) => {
    const currentUser = userRef.current || user;
    if (!currentUser) return;
    if (currentUser.completedLessonIds.includes(lessonId)) return;

    const nextCompletedLessonIds = [...currentUser.completedLessonIds, lessonId];
    const currentBadgeIds = new Set(currentUser.badges.map(b => b.id));

    // 1. Gravar aula concluída no Supabase
    try {
      await supabase.from('user_completed_lessons').upsert({
        profile_id: currentUser.id,
        lesson_id: lessonId
      }, { onConflict: 'profile_id, lesson_id' });
    } catch (e) {
      console.error('Error recording completed lesson to Supabase:', e);
    }

    // 2. Atualizar estado local de aulas concluídas (sem somar XP solto por vídeo)
    await updateUser({
      completedLessonIds: nextCompletedLessonIds
    });

    // 3. Checagem de Conquistas de Trilha:
    // Conquista 1: 1º vídeo assistido -> b4 ("Minha Jornada" +25 XP)
    if (!currentBadgeIds.has('b4')) {
      await awardBadge('b4');
    }

    // Carregar jornadas dinâmicas para calcular progresso exato em todos os módulos
    let allJourneysList = JOURNEYS_DATA;
    try {
      const cachedJ = localStorage.getItem('elana_journeys_cache_v4');
      if (cachedJ) {
        const parsedJ = JSON.parse(cachedJ);
        if (Array.isArray(parsedJ) && parsedJ.length > 0) {
          allJourneysList = parsedJ;
        }
      }
    } catch (e) {}

    // Conquistas 25%, 50%, 75% e 100% da jornada
    for (const journey of allJourneysList) {
      // Envolve TODOS os vídeos de TODOS os módulos da jornada (ex: 2 módulos)
      const journeyLessonIds = (journey.modules || []).flatMap((m: any) => (m.lessons || []).map((l: any) => l.id));
      if (journeyLessonIds.includes(lessonId)) {
        const completedCountInJourney = journeyLessonIds.filter((id: string) => nextCompletedLessonIds.includes(id)).length;
        const total = journeyLessonIds.length;
        if (total > 0) {
          const progressPct = (completedCountInJourney / total) * 100;

          if (progressPct >= 25 && !currentBadgeIds.has('b5')) {
            await awardBadge('b5'); // Passos Seguros (25%) +15 XP
          }
          if (progressPct >= 50 && !currentBadgeIds.has('b6')) {
            await awardBadge('b6'); // Chegando Lá! (50%) +15 XP
          }
          if (progressPct >= 75 && !currentBadgeIds.has('b58')) {
            await awardBadge('b58'); // Quase Lá! (75%) +25 XP
          }
          if (progressPct >= 100 && !currentBadgeIds.has('b7')) {
            await awardBadge('b7'); // Caminho Iluminado (100%) +50 XP
          }
        }
      }
    }
  };

  const toggleCompleteLesson = async (lessonId: string) => {
    const currentUser = userRef.current || user;
    if (!currentUser) return;
    if (currentUser.completedLessonIds.includes(lessonId)) {
      const nextCompleted = currentUser.completedLessonIds.filter(id => id !== lessonId);
      try {
        await supabase
          .from('user_completed_lessons')
          .delete()
          .eq('profile_id', currentUser.id)
          .eq('lesson_id', lessonId);
      } catch (e) {
        console.error('Error removing completed lesson from Supabase:', e);
      }
      await updateUser({ completedLessonIds: nextCompleted });
    } else {
      await completeLesson(lessonId);
    }
  };

  const awardBadge = async (badgeId: string) => {
    const currentUser = userRef.current || user;
    if (!currentUser) return;
    const currentBadgeIds = new Set(currentUser.badges.map(b => b.id));
    if (currentBadgeIds.has(badgeId)) return; // Already has it
    const badgeToAward = ALL_BADGES.find(b => b.id === badgeId);
    if (!badgeToAward) return;

    activeBadgeModalRef.current = badgeToAward;

    const previousLevel = currentUser.level || getLevelFromXP(currentUser.xp).level;
    const nextBadges = [...currentUser.badges, badgeToAward];
    const badgeXpSum = nextBadges.reduce((acc, b) => acc + (b.rewardXp || 0), 0);
    const newXP = Math.max(currentUser.xp + (badgeToAward.rewardXp || 0), badgeXpSum);
    const levelInfo = getLevelFromXP(newXP);

    if (levelInfo.level > previousLevel && previousLevel >= 1) {
      const levelUpPayload = {
        levelInfo,
        previousLevel
      };
      pendingLevelUpRef.current = levelUpPayload;
      setPendingLevelUp(levelUpPayload);
    }

    await updateUser({
      badges: nextBadges,
      xp: newXP,
      level: levelInfo.level,
      levelTitle: levelInfo.title
    });

    // Gravar badge no Supabase
    try {
      await supabase.from('user_badges').upsert({
        profile_id: currentUser.id,
        badge_id: badgeId
      }, { onConflict: 'profile_id, badge_id' });
    } catch (e) {
      console.error('Error saving user badge to Supabase:', e);
    }

    activeBadgeModalRef.current = badgeToAward;
    setUnlockedBadgeModal(badgeToAward);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const saveLessonNote = async (lessonId: string, note: string) => {
    const currentUser = userRef.current || user;
    if (!currentUser) return;
    const newNotes = {
      ...currentUser.lessonNotes,
      [lessonId]: note
    };
    
    await updateUser({ lessonNotes: newNotes });
    await awardBadge('b9'); // Minhas Reflexões

    try {
      await supabase.from('user_lesson_notes').upsert({
        profile_id: currentUser.id,
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

  const markSosResponseRead = async () => {
    if (!sosResponse) return;
    const updated = { ...sosResponse, isRead: true };
    setSosResponse(updated);
    localStorage.setItem('elana_sos_ticket_response', JSON.stringify(updated));
    if (user?.id) {
      try {
        await supabase.from('sos_tickets').update({ is_read: true }).eq('profile_id', user.id);
      } catch (err) {
        console.warn('Error marking SOS ticket as read in Supabase:', err);
      }
    }
  };

  const closeBadgeModal = () => {
    activeBadgeModalRef.current = null;
    setUnlockedBadgeModal(null);
    const queued = pendingLevelUpRef.current || pendingLevelUp;
    if (queued) {
      pendingLevelUpRef.current = null;
      setPendingLevelUp(null);
      setTimeout(() => {
        setUnlockedLevelUpModal(queued);
      }, 1000);
    }
  };

  const closeLevelUpModal = () => {
    if (unlockedLevelUpModal && user?.id) {
      localStorage.setItem(`elana_celebrated_level_${user.id}`, String(unlockedLevelUpModal.levelInfo.level));
    }
    setUnlockedLevelUpModal(null);
  };

  const triggerLevelUpModal = (targetLevel?: number) => {
    if (!user) return;
    const lvl = targetLevel || user.level || 2;
    const levelObj = USER_LEVELS.find(l => l.level === lvl) || USER_LEVELS[1];
    const levelInfo = getLevelFromXP(levelObj.minXp);
    setUnlockedLevelUpModal({
      levelInfo,
      previousLevel: Math.max(1, lvl - 1)
    });
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
        toggleCompleteLesson,
        saveLessonNote,
        addXP,
        awardBadge,
        unlockedBadgeModal,
        closeBadgeModal,
        unlockedLevelUpModal,
        closeLevelUpModal,
        triggerLevelUpModal,
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
