import { useEffect } from 'react';

// Håller skärmen tänd medan `active` är sant (t.ex. under ett pågående prov).
// Låset släpps automatiskt av webbläsaren när fliken göms, så det begärs på nytt
// när sidan blir synlig igen.
export function useWakeLock(active: boolean) {
  useEffect(() => {
    const wakeLockApi = (navigator as any).wakeLock;
    if (!active || !wakeLockApi) return;

    let sentinel: any = null;
    let cancelled = false;

    const request = async () => {
      try {
        if (document.visibilityState !== 'visible') return;
        sentinel = await wakeLockApi.request('screen');
        if (cancelled) sentinel.release().catch(() => {});
      } catch (_) {
        // T.ex. batterisparläge – inte kritiskt
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') request();
    };

    request();
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', handleVisibility);
      sentinel?.release?.().catch(() => {});
    };
  }, [active]);
}
