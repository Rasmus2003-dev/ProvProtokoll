import { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnected(true);
      setTimeout(() => setShowReconnected(false), 2500);
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !showReconnected) return null;

  return (
    <div
      className={`fixed top-0 inset-x-0 z-[60] flex items-center justify-center gap-2 py-1.5 text-[11px] font-bold uppercase tracking-widest text-white transition-colors print:hidden ${
        isOnline ? 'bg-emerald-600' : 'bg-amber-600'
      }`}
    >
      {isOnline ? (
        <span>Anslutning återställd — data synkas</span>
      ) : (
        <>
          <WifiOff className="w-3.5 h-3.5" />
          <span>Offline — dina ändringar sparas lokalt och synkas automatiskt</span>
        </>
      )}
    </div>
  );
}
