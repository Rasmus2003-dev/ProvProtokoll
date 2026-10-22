import { useEffect, useState } from 'react';
import { WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useAppStore } from '../store/ProvContext';

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const [showReconnected, setShowReconnected] = useState(false);
  const { syncQueue, syncTests, isSyncing } = useAppStore();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnected(true);
      setTimeout(() => setShowReconnected(false), 3500);
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const queueCount = syncQueue.length;

  if (isOnline && !showReconnected && queueCount === 0) return null;

  return (
    <div
      className={`fixed top-0 inset-x-0 z-[60] flex items-center justify-center gap-3 px-4 py-1.5 text-xs font-semibold text-white transition-colors print:hidden shadow-md ${
        !isOnline
          ? 'bg-amber-600 dark:bg-amber-700'
          : queueCount > 0
            ? 'bg-blue-600 dark:bg-blue-700'
            : 'bg-emerald-600'
      }`}
    >
      {!isOnline ? (
        <div className="flex items-center gap-2">
          <WifiOff className="w-3.5 h-3.5 shrink-0" />
          <span>
            Offlineläge – du kan genomföra och spara prov helt utan internet.
            {queueCount > 0 && ` (${queueCount} prov sparat lokalt i kön)`}
          </span>
        </div>
      ) : queueCount > 0 ? (
        <div className="flex items-center gap-3">
          <span>{queueCount} {queueCount === 1 ? 'prov' : 'prov'} väntar på att synkas till molnet.</span>
          <button
            type="button"
            onClick={() => syncTests()}
            disabled={isSyncing}
            className="px-2.5 py-0.5 rounded-full bg-white text-blue-700 hover:bg-blue-50 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Synkar...' : 'Synka nu'}
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Uppkopplad igen – alla prov är synkade till molnet.</span>
        </div>
      )}
    </div>
  );
}
