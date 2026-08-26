import React, { useState, useEffect } from 'react';
import { Smartphone, X } from 'lucide-react';

export function PwaInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if dismissed recently (7 days)
    const dismissedAt = localStorage.getItem('elana_pwa_dismissed');
    if (dismissedAt) {
      const dismissedTime = parseInt(dismissedAt, 10);
      const now = new Date().getTime();
      const sevenDays = 7 * 24 * 60 * 60 * 1000;
      if (now - dismissedTime < sevenDays) {
        return;
      }
    }

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true) {
      return;
    }

    // Check for iOS
    const ua = window.navigator.userAgent;
    const isIOSDevice = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
    if (isIOSDevice) {
      setIsIOS(true);
      setIsVisible(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('elana_pwa_dismissed', new Date().getTime().toString());
  };

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsVisible(false);
      }
      setDeferredPrompt(null);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 z-50 animate-in slide-in-from-bottom-5">
      <div className="bg-[#101B1E]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex flex-col gap-3 shadow-2xl">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-[#070D0F] p-2 rounded-xl border border-white/10 text-white">
              <Smartphone size={24} />
            </div>
            <div>
              <h3 className="text-white font-medium">Instale o Elana no seu celular!</h3>
              <p className="text-white/60 text-sm mt-0.5">
                {isIOS 
                  ? 'Toque em Compartilhar e depois "Adicionar à Tela Inicial"' 
                  : 'Acesse o app de forma mais rápida e fácil.'}
              </p>
            </div>
          </div>
          <button 
            onClick={handleDismiss}
            className="text-white/40 hover:text-white/80 p-1 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        {!isIOS && (
          <button
            onClick={handleInstall}
            className="w-full bg-gradient-to-r from-[#17c964] to-[#12a150] text-white font-medium py-2.5 rounded-xl hover:opacity-90 transition-opacity"
          >
            Instalar
          </button>
        )}
      </div>
    </div>
  );
}
