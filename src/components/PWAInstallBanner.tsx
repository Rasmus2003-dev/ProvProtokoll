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
    <div className="fixed left-3 right-3 bottom-[calc(76px+env(safe-area-inset-bottom))] md:left-auto md:right-6 md:bottom-6 md:max-w-sm z-50 bg-surface border border-line rounded-card p-3 pl-3.5 shadow-float animate-sheet-up">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-control bg-navy p-1.5 shrink-0 flex items-center justify-center">
          <img src="/pwa-192x192.png" alt="" className="w-full h-full object-contain" />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-[15px] font-semibold text-ink leading-tight">Installera appen</h4>
          <p className="text-xs text-ink-2 mt-0.5 leading-snug">
            {isIOS
              ? 'Tryck på Dela och välj "Lägg till på hemskärmen".'
              : 'Snabbare start och fungerar utan uppkoppling.'}
          </p>
        </div>
        {!isIOS && deferredPrompt && (
          <button
            onClick={handleInstallClick}
            className="h-10 px-3.5 bg-navy hover:bg-navy-deep dark:bg-blue-600 dark:hover:bg-blue-500 text-white rounded-control text-sm font-semibold flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <Download size={15} />
            Installera
          </button>
        )}
        <button
          onClick={handleDismiss}
          aria-label="Stäng"
          className="w-10 h-10 -mr-1 flex items-center justify-center text-ink-3 hover:text-ink rounded-control transition-colors shrink-0 cursor-pointer"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
