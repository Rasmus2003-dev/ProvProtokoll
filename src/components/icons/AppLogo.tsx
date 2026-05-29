import { HTMLAttributes } from 'react';

interface AppLogoProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'icon' | 'full' | 'horizontal' | 'badge';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function AppLogo({ 
  variant = 'horizontal', 
  size = 'md',
  className = '', 
  ...props 
}: AppLogoProps) {
  
  const height = size === 'sm' ? '30px' : size === 'md' ? '44px' : '58px';
  const width = variant === 'icon' ? height : '240px';

  // Vector Graphic structure (matching our incredible high-class theme and protocol style)
  const renderEmblem = () => (
    <svg viewBox="0 0 100 100" className="w-full h-full shrink-0">
      {/* Deep Navy Circle */}
      <rect width="100" height="100" rx="24" fill="#002F6C" />
      {/* Light outline */}
      <circle cx="50" cy="50" r="34" fill="none" stroke="#FFFFFF" strokeOpacity="0.1" strokeWidth="4" />
      
      {/* Stylized White Clipboard Sheet */}
      <rect x="32" y="19" width="36" height="48" rx="4" fill="#FFFFFF" />
      
      {/* Clipboard Metal Clip at Top */}
      <path d="M 43 19 L 43 14 C 43 13, 57 13, 57 14 L 57 19 Z" fill="#94A3B8" />
      <rect x="45" y="17" width="10" height="3" rx="1" fill="#475569" />

      {/* Protocol Checklist Elements */}
      {/* Row 1: Line */}
      <rect x="38" y="27" width="6" height="6" rx="1.5" fill="none" stroke="#64748B" strokeWidth="1" />
      <line x1="48" y1="30" x2="62" y2="30" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" />

      {/* Row 2: Checked Row (Green Box & Line) */}
      <rect x="38" y="37" width="6" height="6" rx="1.5" fill="#107C41" />
      <path d="M 39.5 40 L 41 41.5 L 43.5 38.5" fill="none" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="48" y1="40" x2="62" y2="40" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />

      {/* Row 3: Line */}
      <rect x="38" y="47" width="6" height="6" rx="1.5" fill="none" stroke="#64748B" strokeWidth="1" />
      <line x1="48" y1="50" x2="58" y2="50" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" />

      {/* Foreground Official Badge Overlay */}
      <circle cx="64" cy="62" r="15" fill="#DD1D25" stroke="#FFFFFF" strokeWidth="2.5" />
      <path d="M 58 62 L 62 66 L 70 58" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  if (variant === 'icon') {
    return (
      <div className={`inline-flex items-center justify-center select-none ${className}`} style={{ height, width }} {...props}>
        {renderEmblem()}
      </div>
    );
  }

  if (variant === 'badge') {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-slate-900 border border-gray-200 dark:border-white/5 rounded-full select-none ${className}`} {...props}>
        <div style={{ height: '18px', width: '18px' }}>
          {renderEmblem()}
        </div>
        <span className="text-xs font-black tracking-wider text-gray-950 dark:text-gray-100 uppercase font-sans">
          DIGITALT PROV
        </span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3.5 select-none ${className}`} style={{ height, width }} {...props}>
      <div style={{ height, width: height }} className="shrink-0">
        {renderEmblem()}
      </div>
      
      <div className="flex flex-col justify-center text-left leading-none font-sans">
        <span className="text-[14px] sm:text-[15px] font-black tracking-widest text-[#002F6C] dark:text-blue-400 uppercase leading-none">
          DIGITALT
        </span>
        <span className="text-[9.5px] sm:text-[10px] font-bold tracking-widest text-red-650 dark:text-red-400 uppercase mt-0.5 leading-none">
          PROVPROTOKOLL
        </span>
        <span className="text-[7.5px] sm:text-[8px] font-semibold text-gray-400 dark:text-gray-500 uppercase mt-1 tracking-wider leading-none">
          Inspirerad av Trafikverket
        </span>
      </div>
    </div>
  );
}

