import React, { useState, useEffect, Suspense } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CommunityProvider, useCommunity } from './context/CommunityContext';
import { FontSizeProvider } from './context/FontSizeContext';
import { JourneysProvider, useJourneys } from './context/JourneysContext';
import { DestaquesProvider } from './context/DestaquesContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';
import { PwaInstallBanner } from './components/pwa/PwaInstallBanner';
import { ToastProvider } from './context/ToastContext';
import { Journey } from './types';
import { supabase } from './lib/supabase';
import { ErrorBoundary } from './components/common/ErrorBoundary';

// ⚡ Code Splitting: Lazy loading de rotas e modais secundários
const ClassroomPage = React.lazy(() => import('./pages/ClassroomPage').then(m => ({ default: m.ClassroomPage })));
const CommunityPage = React.lazy(() => import('./pages/CommunityPage').then(m => ({ default: m.CommunityPage })));
const DashboardPage = React.lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const AdminPage = React.lazy(() => import('./pages/AdminPage').then(m => ({ default: m.AdminPage })));
const LoginPage = React.lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));

const CheckoutModal = React.lazy(() => import('./components/catalog/CheckoutModal').then(m => ({ default: m.CheckoutModal })));
const BadgeModal = React.lazy(() => import('./components/gamification/BadgeModal').then(m => ({ default: m.BadgeModal })));
const CertificateModal = React.lazy(() => import('./components/gamification/CertificateModal').then(m => ({ default: m.CertificateModal })));
const LevelUpModal = React.lazy(() => import('./components/gamification/LevelUpModal').then(m => ({ default: m.LevelUpModal })));
const UserLevelsModal = React.lazy(() => import('./components/gamification/UserLevelsModal').then(m => ({ default: m.UserLevelsModal })));
const AuthModal = React.lazy(() => import('./components/auth/AuthModal').then(m => ({ default: m.AuthModal })));
const ResetPasswordModal = React.lazy(() => import('./components/auth/ResetPasswordModal').then(m => ({ default: m.ResetPasswordModal })));
const GuidedSpotlightTour = React.lazy(() => import('./components/onboarding/GuidedSpotlightTour').then(m => ({ default: m.GuidedSpotlightTour })));
const BadgeRewardModal = React.lazy(() => import('./components/onboarding/BadgeRewardModal').then(m => ({ default: m.BadgeRewardModal })));
const ProfileCompletionInviteModal = React.lazy(() => import('./components/onboarding/ProfileCompletionInviteModal').then(m => ({ default: m.ProfileCompletionInviteModal })));
const CommunityPollModal = React.lazy(() => import('./components/community/CommunityPollModal').then(m => ({ default: m.CommunityPollModal })));

const PageLoadingFallback: React.FC = () => (
  <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 space-y-4 animate-fade-in">
    <div className="w-12 h-12 rounded-2xl bg-[#FF7F5B]/10 border border-[#FF7F5B]/30 flex items-center justify-center animate-pulse shadow-lg">
      <span className="text-2xl animate-spin">🌿</span>
    </div>
    <p className="text-xs font-bold text-slate-400 tracking-wider uppercase">Carregando espaço acolhedor...</p>
  </div>
);

const AppContent: React.FC = () => {
  const { user, login, unlockedBadgeModal, closeBadgeModal, unlockedLevelUpModal, closeLevelUpModal } = useAuth();
  const { activePoll, userVotedPollsMap } = useCommunity();
  const { journeys } = useJourneys();
  
  const [activeTab, setActiveTab] = useState<string>('home');
  const [selectedJourneyForCheckout, setSelectedJourneyForCheckout] = useState<Journey | null>(null);
  const [selectedJourneyForClassroom, setSelectedJourneyForClassroom] = useState<Journey | null>(null);
  const [selectedLessonIdForClassroom, setSelectedLessonIdForClassroom] = useState<string | undefined>(undefined);
  const [certificateJourney, setCertificateJourney] = useState<Journey | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSpotlightTourOpen, setIsSpotlightTourOpen] = useState(false);
  const [isBadgeRewardOpen, setIsBadgeRewardOpen] = useState(false);
  const [isProfileInviteOpen, setIsProfileInviteOpen] = useState(false);
  const [isUserLevelsListOpen, setIsUserLevelsListOpen] = useState(false);
  const [isPollModalOpen, setIsPollModalOpen] = useState(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);

  // 🔑 Detecção Automática de Link de Recuperação de Senha do Supabase
  useEffect(() => {
    const hash = window.location.hash || '';
    if (hash.includes('type=recovery') || hash.includes('access_token=')) {
      setIsResetPasswordModalOpen(true);
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsResetPasswordModalOpen(true);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // 🗳️ Disparo da Enquete no 1º Acesso Geral do Dia (Aba Conteúdos / Home)
  useEffect(() => {
    if (!user || activeTab !== 'home' || isSpotlightTourOpen || isBadgeRewardOpen || isProfileInviteOpen) return;
    if (!activePoll || activePoll.status !== 'open') return;

    const userKey = user.id;
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const pollDailySeenKey = `elana_poll_daily_seen_${userKey}_${todayStr}_${activePoll.id}`;

    const hasSeenToday = localStorage.getItem(pollDailySeenKey) === 'true';
    const hasVoted = !!userVotedPollsMap[activePoll.id];

    if (!hasSeenToday && !hasVoted) {
      const timer = setTimeout(() => {
        setIsPollModalOpen(true);
        localStorage.setItem(pollDailySeenKey, 'true');
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [user?.id, activeTab, activePoll?.id, userVotedPollsMap, isSpotlightTourOpen, isBadgeRewardOpen, isProfileInviteOpen]);

  useEffect(() => {
    if (user?.email) {
      const tourKey = `elana_spotlight_done_${user.email.toLowerCase().trim()}`;
      const isTourDoneLocally = localStorage.getItem(tourKey) === 'true';
      const isTourDoneInBackend = Boolean(user.onboardingCompleted);

      if (!isTourDoneLocally && !isTourDoneInBackend) {
        const timer = setTimeout(() => {
          setIsSpotlightTourOpen(true);
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [user?.email, user?.onboardingCompleted]);

  const handleSelectJourney = (journey: Journey) => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (user?.purchasedJourneyIds.includes(journey.id)) {
      setSelectedJourneyForClassroom(journey);
      setActiveTab('classroom');
    } else {
      setSelectedJourneyForCheckout(journey);
    }
  };

  const handleStartLearning = (journey: Journey, lessonId?: string) => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    setSelectedJourneyForClassroom(journey);
    setSelectedLessonIdForClassroom(lessonId);
    setActiveTab('classroom');
  };

  const handleCheckoutSuccess = (journey: Journey) => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    setSelectedJourneyForCheckout(null);
    setSelectedJourneyForClassroom(journey);
    setActiveTab('classroom');
  };

  if (!user || activeTab === 'login') {
    return (
      <Suspense fallback={<PageLoadingFallback />}>
        <LoginPage
          onSuccess={(isNewUser) => {
            setActiveTab('home');
            window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
            if (isNewUser) {
              setIsSpotlightTourOpen(true);
            }
          }}
        />
      </Suspense>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#070D0F] text-slate-100">
      <div>
        <Navbar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
          }}
          onOpenAuthModal={() => {
            setActiveTab('login');
            window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
          }}
        />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-safe-nav md:pb-0">
          <ErrorBoundary>
            <Suspense fallback={<PageLoadingFallback />}>
              {activeTab === 'home' && (
                <HomePage
                  onSelectJourney={handleSelectJourney}
                  onStartLearning={handleStartLearning}
                />
              )}

              {activeTab === 'classroom' && selectedJourneyForClassroom && (
                <ClassroomPage
                  journey={journeys.find(j => j.id === selectedJourneyForClassroom.id) || selectedJourneyForClassroom}
                  initialLessonId={selectedLessonIdForClassroom}
                  onBack={() => {
                    setActiveTab('home');
                    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
                  }}
                  onOpenCertificate={(journey: Journey) => setCertificateJourney(journey)}
                />
              )}

              {activeTab === 'community' && <CommunityPage />}

              {activeTab === 'dashboard' && (
                <DashboardPage
                  onStartLearning={handleStartLearning}
                  onOpenCertificate={(journey: Journey) => setCertificateJourney(journey)}
                  onExploreCatalog={() => {
                    setActiveTab('home');
                    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
                  }}
                />
              )}

              {activeTab === 'admin' && (
                <AdminPage
                  onBackToHome={() => {
                    setActiveTab('home');
                    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
                  }}
                  onOpenLogin={() => {
                    setActiveTab('login');
                    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
                  }}
                />
              )}
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>

      <Footer />

      {/* Modais carregados sob demanda */}
      <Suspense fallback={null}>
        {/* Checkout Modal */}
        {selectedJourneyForCheckout && (
          <CheckoutModal
            journey={selectedJourneyForCheckout}
            onClose={() => setSelectedJourneyForCheckout(null)}
            onSuccess={handleCheckoutSuccess}
          />
        )}

        {/* Gamification Badge Modal */}
        {unlockedBadgeModal && (
          <BadgeModal
            badge={unlockedBadgeModal}
            onClose={closeBadgeModal}
          />
        )}

        {/* Gamification Level Up Ranking Promotion Celebration Modal */}
        {!unlockedBadgeModal && unlockedLevelUpModal && (
          <LevelUpModal
            levelInfo={unlockedLevelUpModal.levelInfo}
            previousLevel={unlockedLevelUpModal.previousLevel}
            onClose={closeLevelUpModal}
            onOpenAllLevels={() => setIsUserLevelsListOpen(true)}
          />
        )}

        {/* 15 Levels Tree Timeline Modal */}
        {isUserLevelsListOpen && user && (
          <UserLevelsModal
            currentXp={user.xp}
            onClose={() => setIsUserLevelsListOpen(false)}
          />
        )}

        {/* Certificate Modal */}
        {certificateJourney && (
          <CertificateModal
            journey={certificateJourney}
            user={user}
            onClose={() => setCertificateJourney(null)}
          />
        )}

        {/* Complete Auth Modal */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={({ email, name, id }) => {
            login(email, name, id);
            setIsAuthModalOpen(false);
            setIsSpotlightTourOpen(true);
          }}
        />

        {/* Interactive Guided Spotlight Tour */}
        <GuidedSpotlightTour
          isOpen={isSpotlightTourOpen && user !== null}
          onClose={() => setIsSpotlightTourOpen(false)}
          onComplete={() => {
            setIsSpotlightTourOpen(false);
            setIsBadgeRewardOpen(true);
          }}
        />

        {/* High-Impact Semente Plantada Badge Reward Modal */}
        <BadgeRewardModal
          isOpen={isBadgeRewardOpen}
          onClose={() => {
            setIsBadgeRewardOpen(false);
            setIsProfileInviteOpen(true);
          }}
        />

        {/* Complete Profile Invitation Modal */}
        <ProfileCompletionInviteModal
          isOpen={isProfileInviteOpen}
          onClose={() => {
            setIsProfileInviteOpen(false);
            setActiveTab('home');
            window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
          }}
          onGoToProfile={() => {
            setActiveTab('dashboard');
            window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
          }}
        />

        {/* 🗳️ Modal Pop-up de Enquete Interativa no 1º Acesso Geral do Dia (Aba Conteúdos) */}
        {activePoll && activePoll.status === 'open' && (
          <CommunityPollModal
            isOpen={isPollModalOpen}
            onClose={() => setIsPollModalOpen(false)}
            poll={activePoll}
          />
        )}

        {/* 🔑 Modal de Redefinição de Senha via Link de E-mail */}
        <ResetPasswordModal
          isOpen={isResetPasswordModalOpen}
          onClose={() => setIsResetPasswordModalOpen(false)}
        />
      </Suspense>

      {/* PWA Install Banner */}
      <PwaInstallBanner />
    </div>
  );
};

export function App() {
  return (
    <FontSizeProvider>
      <AuthProvider>
        <JourneysProvider>
          <DestaquesProvider>
            <CommunityProvider>
              <ToastProvider>
                <AppContent />
              </ToastProvider>
            </CommunityProvider>
          </DestaquesProvider>
        </JourneysProvider>
      </AuthProvider>
    </FontSizeProvider>
  );
}

export default App;
