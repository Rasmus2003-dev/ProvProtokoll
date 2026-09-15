import { ReactNode, useEffect, useState } from 'react';
import { ShieldAlert } from 'lucide-react';

interface PrivacyGuardProps {
  children: ReactNode;
  className?: string;
}

/**
 * Döljer sitt innehåll bakom en svart skärm när fliken/fönstret tappar fokus
 * (appväxling, skärmdumpsverktyg, skärminspelning, låst skärm etc.).
 * Skyddar inte mot t.ex. en kamera riktad mot skärmen.
 */
export function PrivacyGuard({ children, className = '' }: PrivacyGuardProps) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const handleVisibility = () => setHidden(document.hidden);
    const handleBlur = () => setHidden(true);
    const handleFocus = () => setHidden(document.hidden);

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  return (
    <div className={`relative ${className}`}>
      {children}
      {hidden && (
        <div className="absolute inset-0 z-[999] bg-black flex flex-col items-center justify-center gap-3 select-none print:hidden">
          <ShieldAlert size={28} className="text-white/40" />
          <span className="text-white/40 text-xs font-bold uppercase tracking-widest">
            Innehåll dolt av integritetsskäl
          </span>
        </div>
      )}
    </div>
  );
}
