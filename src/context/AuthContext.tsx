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

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (email: string, name?: string) => void;
  logout: () => void;
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
  badges: [ALL_BADGES[0]] // Only "Semente Plantada" badge (25 XP)
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('elana_user_session');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Force cleanup of old cached session if xp was 50
        if (parsed.xp !== 25 && parsed.badges?.length === 1) {
          parsed.xp = 25;
          parsed.level = 1;
          parsed.levelTitle = 'Semente';
        }
        return parsed;
      } catch (e) {
        console.error('Error parsing stored session', e);
      }
    }
    return DEFAULT_USER;
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
    const newUser: UserProfile = {
      ...DEFAULT_USER,
      email,
      name: defaultName,
      xp: 25,
      level: 1,
      levelTitle: 'Semente',
      badges: [ALL_BADGES[0]],
      completedLessonIds: [],
      lessonNotes: {}
    };
    setUser(newUser);
    localStorage.setItem('elana_user_session', JSON.stringify(newUser));
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
