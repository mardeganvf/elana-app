import { describe, it, expect } from 'vitest';
import { getCommunityAccessInfo, hasCommunityAccess, UserProfile } from '../types';
import { JOURNEYS_DATA } from '../data/journeysData';

describe('Community Access Rules (Paywall & 90 Days Courtesy)', () => {
  const baseUser: UserProfile = {
    id: 'user-test-123',
    email: 'membro@elana.app',
    name: 'Ana Silva',
    role: 'membro',
    avatar: '',
    badges: [],
    streakDays: 5,
    xp: 120,
    level: 1,
    levelTitle: 'Raiz',
    lessonNotes: {},
    lastActiveDate: new Date().toISOString(),
    purchasedJourneyIds: [],
    completedLessonIds: [],
    children: []
  };

  it('deve negar acesso para usuário não autenticado (null ou undefined)', () => {
    expect(hasCommunityAccess(null)).toBe(false);
    expect(hasCommunityAccess(undefined)).toBe(false);

    const info = getCommunityAccessInfo(null);
    expect(info.hasAccess).toBe(false);
    expect(info.type).toBe('none');
    expect(info.daysRemaining).toBe(0);
  });

  it('deve conceder acesso irrestrito para administradores', () => {
    const adminUser: UserProfile = { ...baseUser, role: 'admin' };
    expect(hasCommunityAccess(adminUser)).toBe(true);

    const info = getCommunityAccessInfo(adminUser);
    expect(info.hasAccess).toBe(true);
    expect(info.type).toBe('admin');
    expect(info.daysRemaining).toBeNull();
  });

  it('deve conceder acesso irrestrito para assinantes ativos (R$ 9,90/mês)', () => {
    const subscriberUser: UserProfile = {
      ...baseUser,
      communitySubscriptionStatus: 'active'
    };
    expect(hasCommunityAccess(subscriberUser)).toBe(true);

    const info = getCommunityAccessInfo(subscriberUser);
    expect(info.hasAccess).toBe(true);
    expect(info.type).toBe('active_subscription');
    expect(info.daysRemaining).toBeNull();
  });

  it('deve conceder acesso temporário para usuários no período de cortesia de 90 dias', () => {
    // 30 dias no futuro
    const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    const trialUser: UserProfile = {
      ...baseUser,
      communitySubscriptionStatus: 'free',
      communityAccessExpiresAt: futureDate
    };

    expect(hasCommunityAccess(trialUser)).toBe(true);

    const info = getCommunityAccessInfo(trialUser);
    expect(info.hasAccess).toBe(true);
    expect(info.type).toBe('trial_bonus');
    expect(info.daysRemaining).toBeGreaterThanOrEqual(29);
    expect(info.daysRemaining).toBeLessThanOrEqual(31);
    expect(info.isExpiringSoon).toBe(false);
    expect(info.isCriticalExpiration).toBe(false);
  });

  it('deve acionar isExpiringSoon quando restarem 7 dias ou menos da cortesia', () => {
    // 5 dias no futuro
    const futureDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString();
    const expiringUser: UserProfile = {
      ...baseUser,
      communitySubscriptionStatus: 'free',
      communityAccessExpiresAt: futureDate
    };

    const info = getCommunityAccessInfo(expiringUser);
    expect(info.hasAccess).toBe(true);
    expect(info.type).toBe('trial_bonus');
    expect(info.daysRemaining).toBe(5);
    expect(info.isExpiringSoon).toBe(true);
    expect(info.isCriticalExpiration).toBe(false);
  });

  it('deve acionar isCriticalExpiration quando restarem 48 horas ou menos da cortesia', () => {
    // 24 horas no futuro
    const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const criticalUser: UserProfile = {
      ...baseUser,
      communitySubscriptionStatus: 'free',
      communityAccessExpiresAt: futureDate
    };

    const info = getCommunityAccessInfo(criticalUser);
    expect(info.hasAccess).toBe(true);
    expect(info.type).toBe('trial_bonus');
    expect(info.daysRemaining).toBe(1);
    expect(info.hoursRemaining).toBeGreaterThanOrEqual(23);
    expect(info.hoursRemaining).toBeLessThanOrEqual(24);
    expect(info.isExpiringSoon).toBe(true);
    expect(info.isCriticalExpiration).toBe(true);
  });

  it('deve bloquear acesso quando a cortesia de 90 dias expirar', () => {
    // 5 dias no passado
    const pastDate = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString();
    const expiredUser: UserProfile = {
      ...baseUser,
      communitySubscriptionStatus: 'free',
      communityAccessExpiresAt: pastDate
    };

    expect(hasCommunityAccess(expiredUser)).toBe(false);

    const info = getCommunityAccessInfo(expiredUser);
    expect(info.hasAccess).toBe(false);
    expect(info.type).toBe('none');
    expect(info.daysRemaining).toBe(0);
  });

  it('deve bloquear acesso para usuários free sem cortesia e sem assinatura', () => {
    const freeUser: UserProfile = {
      ...baseUser,
      communitySubscriptionStatus: 'free',
      communityAccessExpiresAt: undefined
    };

    expect(hasCommunityAccess(freeUser)).toBe(false);
    const info = getCommunityAccessInfo(freeUser);
    expect(info.hasAccess).toBe(false);
    expect(info.type).toBe('none');
  });
});

describe('Journey Catalog Integrity Check', () => {
  it('deve conter 6 jornadas catalogadas com estrutura válida', () => {
    expect(JOURNEYS_DATA.length).toBe(6);

    for (const journey of JOURNEYS_DATA) {
      expect(journey.id).toBeDefined();
      expect(journey.title).toBeDefined();
      expect(journey.pillar).toBeDefined();
      expect(journey.themeColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(journey.modules.length).toBeGreaterThan(0);

      for (const mod of journey.modules) {
        expect(mod.id).toBeDefined();
        expect(mod.title).toBeDefined();
        expect(mod.lessons.length).toBeGreaterThan(0);

        for (const lesson of mod.lessons) {
          expect(lesson.id).toBeDefined();
          expect(lesson.title).toBeDefined();
          expect(lesson.videoUrl).toBeDefined();
        }
      }
    }
  });

  it('a jornada Pais Recém-Nascidos deve ser a única aberta para vendas', () => {
    const prn = JOURNEYS_DATA.find(j => j.id === 'pais-recem-nascidos');
    expect(prn).toBeDefined();
    expect(prn?.isComingSoon).toBe(false);

    const otherJourneys = JOURNEYS_DATA.filter(j => j.id !== 'pais-recem-nascidos');
    for (const j of otherJourneys) {
      expect(j.isComingSoon).toBe(true);
    }
  });
});
