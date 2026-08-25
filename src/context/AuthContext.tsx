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
  login: (email: string, name?: string) => void;
  logout: () => void;
  updateUser: (updates: Partial<UserProfile>) => void;
  purchaseJourney: (journeyId: string) => void;
  completeLesson: (lessonId: string, xpReward?: number) => void;
  saveLessonNote: (lessonId: string, note: string) => void;
  addXP: (amount: number) => void;
  unlockedBadgeModal: Badge | null;
  closeBadgeModal: () => void;
  sosResponse: SOSTicketResponse | null;
  sendSosTicket: (userMessage: string) => void;
  replySosTicket: (adminReply: string) => void;
  markSosResponseRead: () => void;
}

const DEFAULT_USER: UserProfile = {
  id: 'user-demo-1',
  name: 'Helena Ribeiro',
  email: 'helena@elana.com.br',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  role: 'Mãe de 1ª viagem',
  familyTag: 'Mãe de 1ª viagem (0-2 anos)',
  purchasedJourneyIds: ['pais-recem-nascidos'],
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

  useEffect(() => {
    if (user) {
      localStorage.setItem('elana_user_session', JSON.stringify(user));
    } else {
      localStorage.removeItem('elana_user_session');
    }
  }, [user]);

  const login = (email: string, name?: string) => {
    const defaultName = name || email.split('@')[0];
    const isDemoHelena = email.toLowerCase() === 'helena@elana.com.br';

    const newUser: UserProfile = isDemoHelena ? {
      ...DEFAULT_USER,
      email,
      name: defaultName
    } : {
      id: `user-${Date.now()}`,
      email,
      name: defaultName,
      avatar: GENERIC_DEFAULT_AVATAR,
      role: 'Membro da Aldeia',
      familyTag: 'Mãe / Pai de 1ª viagem',
      purchasedJourneyIds: ['pais-recem-nascidos'],
      completedLessonIds: [],
      lessonNotes: {},
      xp: 0,
      level: 1,
      levelTitle: 'Semente',
      streakDays: 1,
      lastActiveDate: new Date().toISOString(),
      badges: []
    };

    // Remove spotlight tour flag so tutorial runs for new user
    localStorage.removeItem(`elana_spotlight_done_${email}`);

    setUser(newUser);
    localStorage.setItem('elana_user_session', JSON.stringify(newUser));

    // Upsert new profile into Supabase 'profiles' table!
    try {
      supabase.from('profiles').upsert({
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        avatar: newUser.avatar,
        role: newUser.role,
        family_tag: newUser.familyTag,
        xp: newUser.xp,
        level: newUser.level,
        updated_at: new Date().toISOString()
      }, { onConflict: 'email' }).then(({ error }) => {
        if (error) console.log('Supabase profiles sync note:', error.message);
      });
    } catch (e) {
      console.error('Supabase profiles sync error:', e);
    }
  };

  const updateUser = (updates: Partial<UserProfile>) => {
    if (!user) return;
    const updatedUser: UserProfile = {
      ...user,
      ...updates
    };
    setUser(updatedUser);
    localStorage.setItem('elana_user_session', JSON.stringify(updatedUser));

    // Sync profile updates to Supabase 'profiles' table!
    try {
      supabase.from('profiles').upsert({
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        avatar: updatedUser.avatar,
        role: updatedUser.role,
        family_tag: updatedUser.familyTag,
        xp: updatedUser.xp,
        level: updatedUser.level,
        updated_at: new Date().toISOString()
      }, { onConflict: 'email' }).then(({ error }) => {
        if (error) console.log('Supabase profile update note:', error.message);
      });
    } catch (e) {
      console.error('Supabase profile update error:', e);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('elana_user_session');
    supabase.auth.signOut();
  };

  const purchaseJourney = (journeyId: string) => {
    if (!user) return;
    if (user.purchasedJourneyIds.includes(journeyId)) return;

    setUser(prev => {
      if (!prev) return null;
      return {
        ...prev,
        purchasedJourneyIds: [...prev.purchasedJourneyIds, journeyId]
      };
    });
  };

  const addXP = (amount: number) => {
    if (!user) return;
    const newXP = user.xp + amount;
    const levelInfo = getLevelFromXP(newXP);
    
    setUser(prev => {
      if (!prev) return null;
      return {
        ...prev,
        xp: newXP,
        level: levelInfo.level,
        levelTitle: levelInfo.title
      };
    });
  };

  const completeLesson = (lessonId: string, xpReward: number = 10) => {
    if (!user) return;
    if (user.completedLessonIds.includes(lessonId)) return;

    const newXP = user.xp + xpReward;
    const levelInfo = getLevelFromXP(newXP);
    
    // Check if new badge unlocked
    let newlyUnlockedBadge: Badge | null = null;
    const currentBadgeIds = new Set(user.badges.map(b => b.id));

    // Demo check badge b4 on first lesson
    if (!currentBadgeIds.has('b4')) {
      newlyUnlockedBadge = ALL_BADGES.find(b => b.id === 'b4') || null;
    }

    const updatedBadges = newlyUnlockedBadge 
      ? [...user.badges, newlyUnlockedBadge] 
      : user.badges;

    setUser(prev => {
      if (!prev) return null;
      return {
        ...prev,
        completedLessonIds: [...prev.completedLessonIds, lessonId],
        xp: newXP,
        level: levelInfo.level,
        levelTitle: levelInfo.title,
        badges: updatedBadges
      };
    });

    if (newlyUnlockedBadge) {
      setUnlockedBadgeModal(newlyUnlockedBadge);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  const saveLessonNote = (lessonId: string, note: string) => {
    if (!user) return;
    setUser(prev => {
      if (!prev) return null;
      return {
        ...prev,
        lessonNotes: {
          ...prev.lessonNotes,
          [lessonId]: note
        }
      };
    });
  };

  const sendSosTicket = (userMessage: string) => {
    // Mock Admin automatic acolhimento response
    const mockReply: SOSTicketResponse = {
      userMessage,
      adminReply: 'Oi, Helena! Recebemos seu pedido de acolhimento SOS. Nossa equipe já acolheu seu desabafo com todo carinho e sigilo. Você não está sozinha. Como podemos te ajudar melhor hoje? 💖',
      repliedAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      isRead: false
    };
    setSosResponse(mockReply);
    localStorage.setItem('elana_sos_ticket_response', JSON.stringify(mockReply));
  };

  const replySosTicket = (adminReply: string) => {
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
        unlockedBadgeModal,
        closeBadgeModal,
        sosResponse,
        sendSosTicket,
        replySosTicket,
        markSosResponseRead
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
