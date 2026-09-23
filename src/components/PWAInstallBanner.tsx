import React, { useEffect, useState } from 'react';
import { Download, X, Smartphone, Check } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { isTestStepPath } from '../lib/activeTest';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'pwa_banner_dismissed_at';
const DISMISS_DAYS = 30;

// Stängd banner visas inte igen på 30 dagar (gällde tidigare bara iOS)
function wasDismissed(): boolean {
  try {
    const at = Number(localStorage.getItem(DISMISS_KEY));
    if (at && Date.now() - at < DISMISS_DAYS * 86400000) return true;
    return localStorage.getItem('pwa_ios_banner_dismissed') === 'true'; // äldre nyckel (iOS)
  } catch (_) {
    return false;
  }
}

export function PWAInstallBanner() {
  const location = useLocation();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if running in standalone mode (already installed)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const iosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(iosDevice);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      if (!wasDismissed()) setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Show banner on iOS if not standalone
    if (iosDevice && !isStandalone && !wasDismissed()) {
      setShowBanner(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    try { localStorage.setItem(DISMISS_KEY, String(Date.now())); } catch (_) {}
  };

  // Aldrig mitt i ett prov – bannern skymmer momenten
  if (isInstalled || !showBanner || isTestStepPath(location.pathname)) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-md z-50 bg-white dark:bg-zinc-900 border border-blue-200 dark:border-blue-900 rounded-2xl p-4 shadow-xl backdrop-blur-md animate-in slide-in-from-bottom duration-300">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#002f6c] p-1.5 shrink-0 shadow-sm flex items-center justify-center">
            <img src="/pwa-192x192.svg" alt="App Icon" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-1.5 py-0.5 rounded">
                PWA APP
              </span>
              <h4 className="text-sm font-black text-gray-900 dark:text-white">
                Installera Körprov
              </h4>
            </div>
            <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5 leading-snug">
              {isIOS 
                ? 'Tryck på Dela-knappen (mitten längst ner) och välj "Lägg till på hemskärmen".' 
                : 'Installera appen på din enhet för snabbare åtkomst och stöd för offline-läge.'}
            </p>
          </div>
        </div>

        <button 
          onClick={handleDismiss}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-lg transition-colors shrink-0"
        >
          <X size={18} />
        </button>
      </div>

      {!isIOS && deferredPrompt && (
        <button
          onClick={handleInstallClick}
          className="w-full mt-3 py-2.5 px-4 bg-[#002f6c] hover:bg-[#00204a] text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
        >
          <Download size={15} />
          <span>Installera Appen Nu</span>
        </button>
      )}
    </div>
  );
}
