import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CommunityProvider } from './context/CommunityContext';
import { FontSizeProvider } from './context/FontSizeContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';
import { ClassroomPage } from './pages/ClassroomPage';
import { CommunityPage } from './pages/CommunityPage';
import { DashboardPage } from './pages/DashboardPage';
import { AdminPage } from './pages/AdminPage';
import { LoginPage } from './pages/LoginPage';
import { CheckoutModal } from './components/catalog/CheckoutModal';
import { BadgeModal } from './components/gamification/BadgeModal';
import { CertificateModal } from './components/gamification/CertificateModal';
import { AuthModal } from './components/auth/AuthModal';
import { GuidedSpotlightTour } from './components/onboarding/GuidedSpotlightTour';
import { BadgeRewardModal } from './components/onboarding/BadgeRewardModal';
import { ProfileCompletionInviteModal } from './components/onboarding/ProfileCompletionInviteModal';
import { Journey } from './types';

const AppContent: React.FC = () => {
  const { user, login, unlockedBadgeModal, closeBadgeModal } = useAuth();
  
  const [activeTab, setActiveTab] = useState<string>('home');
  const [selectedJourneyForCheckout, setSelectedJourneyForCheckout] = useState<Journey | null>(null);
  const [selectedJourneyForClassroom, setSelectedJourneyForClassroom] = useState<Journey | null>(null);
  const [certificateJourney, setCertificateJourney] = useState<Journey | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSpotlightTourOpen, setIsSpotlightTourOpen] = useState(false);
  const [isBadgeRewardOpen, setIsBadgeRewardOpen] = useState(false);
  const [isProfileInviteOpen, setIsProfileInviteOpen] = useState(false);

  useEffect(() => {
    if (user && !localStorage.getItem(`elana_spotlight_done_${user.email}`)) {
      // Small delay to ensure DOM is ready for the tour target selectors
      const timer = setTimeout(() => {
        setIsSpotlightTourOpen(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [user]);

  const handleSelectJourney = (journey: Journey) => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (user?.purchasedJourneyIds.includes(journey.id)) {
      setSelectedJourneyForClassroom(journey);
      setActiveTab('classroom');
    } else {
      setSelectedJourneyForCheckout(journey);
    }
  };

  const handleStartLearning = (journey: Journey) => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    setSelectedJourneyForClassroom(journey);
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
      <LoginPage
        onSuccess={() => {
          setActiveTab('home');
          window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        }}
      />
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

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28">
          {activeTab === 'home' && (
            <HomePage
              onSelectJourney={handleSelectJourney}
              onStartLearning={handleStartLearning}
            />
          )}

          {activeTab === 'classroom' && selectedJourneyForClassroom && (
            <ClassroomPage
              journey={selectedJourneyForClassroom}
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

          {activeTab === 'admin' && <AdminPage />}
        </main>
      </div>

      <Footer />

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
        onSuccess={({ email, name }) => {
          login(email, name);
          setIsAuthModalOpen(false);
        }}
      />

      {/* Interactive Guided Spotlight Tour */}
      <GuidedSpotlightTour
        isOpen={isSpotlightTourOpen && user !== null && !localStorage.getItem(`elana_spotlight_done_${user.email}`)}
        onClose={() => setIsSpotlightTourOpen(false)}
        onComplete={() => setIsBadgeRewardOpen(true)}
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
    </div>
  );
};

export function App() {
  return (
    <FontSizeProvider>
      <AuthProvider>
        <CommunityProvider>
          <AppContent />
        </CommunityProvider>
      </AuthProvider>
    </FontSizeProvider>
  );
}

export default App;
