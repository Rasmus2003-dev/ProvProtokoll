import { HTMLAttributes, CSSProperties } from 'react';
import provprotokollLogoImg from '../../assets/images/provprotokoll_logo.png';

interface AppLogoProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'icon' | 'full' | 'horizontal' | 'badge' | 'provprotokoll';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  style?: CSSProperties;
}

export function AppLogo({ 
  variant = 'horizontal', 
  size = 'md',
  className = '', 
  style,
  ...props 
}: AppLogoProps) {
  
  const height = size === 'sm' ? '32px' : size === 'md' ? '42px' : '54px';
  const width = variant === 'icon' ? height : 'auto';

  // Digital Provprotokoll Logotyp (klippblock + fordon)
  if (variant === 'provprotokoll') {
    const imgHeight = size === 'sm' ? '38px' : size === 'md' ? '48px' : '62px';
    return (
      <div 
        className={`inline-flex items-center select-none ${className}`}
        style={style}
        {...props}
      >
        <img 
          src={provprotokollLogoImg} 
          alt="ProvProtokoll - Digital Provhantering" 
          style={{ height: imgHeight, width: 'auto', objectFit: 'contain' }}
          className="drop-shadow-xs"
        />
      </div>
    );
  }

  const renderEmblem = () => (
    <div className="relative w-full h-full rounded-2xl overflow-hidden bg-gradient-to-br from-[#003882] via-[#00285a] to-[#001428] shadow-md flex items-center justify-center border border-white/20">
      {/* Radial soft light highlight */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(56,189,248,0.3),transparent_70%)]" />
      
      {/* Authentic High-Precision Vector Steering Wheel with Golden Checkmark & Royal Trim */}
      <svg className="w-[85%] h-[85%] drop-shadow-md relative z-10" viewBox="0 0 100 100" fill="none">
        <defs>
          <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDE047" />
            <stop offset="45%" stopColor="#EAB308" />
            <stop offset="100%" stopColor="#B45309" />
          </linearGradient>
          <linearGradient id="wheelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1E3A8A" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1.5" stdDeviation="1" floodColor="#000" floodOpacity="0.4" />
          </filter>
        </defs>

        {/* Outer Wheel Ring */}
        <circle cx="50" cy="50" r="41" stroke="url(#goldGrad)" strokeWidth="6" filter="url(#glow)" />
        <circle cx="50" cy="50" r="34" stroke="rgba(255,255,255,0.2)" strokeWidth="1.2" />

        {/* Steering Wheel Rim Body */}
        <circle cx="50" cy="50" r="37.5" stroke="url(#wheelGrad)" strokeWidth="3" />

        {/* Center Hub */}
        <circle cx="50" cy="50" r="13.5" fill="#002244" stroke="url(#goldGrad)" strokeWidth="2.5" />
        <circle cx="50" cy="50" r="5" fill="url(#goldGrad)" />

        {/* Steering Wheel Spokes */}
        <path d="M 50 25 L 50 36.5" stroke="url(#goldGrad)" strokeWidth="4.5" strokeLinecap="round" />
        <path d="M 29 63 L 40 54" stroke="url(#goldGrad)" strokeWidth="4.5" strokeLinecap="round" />
        <path d="M 71 63 L 60 54" stroke="url(#goldGrad)" strokeWidth="4.5" strokeLinecap="round" />

        {/* Big Golden Embossed Success Checkmark across steering wheel */}
        <path 
          d="M 38 52 L 48 64 L 74 34" 
          stroke="url(#goldGrad)" 
          strokeWidth="6" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          filter="url(#glow)"
        />
        <path 
          d="M 38 52 L 48 64 L 74 34" 
          stroke="#FFFFFF" 
          strokeWidth="1.8" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          opacity="0.8"
        />
      </svg>
    </div>
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
      <div className={`inline-flex items-center gap-2 px-3 py-1 bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/10 rounded-full select-none shadow-xs ${className}`} {...props}>
        <div style={{ height: '20px', width: '20px' }}>
          {renderEmblem()}
        </div>
        <span className="text-xs font-black tracking-wider text-gray-900 dark:text-gray-100 uppercase font-sans">
          PROVPROTOKOLL
        </span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3.5 select-none ${className}`} style={{ height, width }} {...props}>
      <div style={{ height, width: height }} className="shrink-0 drop-shadow-sm">
        {renderEmblem()}
      </div>
      
      <div className="flex flex-col justify-center text-left leading-none font-sans">
        <div className="flex items-center gap-1.5">
          <span className="text-[14px] sm:text-[16px] font-black tracking-widest text-[#002F6C] dark:text-blue-400 uppercase leading-none">
            DIGITALT
          </span>
          <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-mono">
            PRO
          </span>
        </div>
        <span className="text-[10px] sm:text-[11px] font-extrabold tracking-widest text-[#c40000] dark:text-red-400 uppercase mt-1 leading-none">
          KÖRPROVSSYSTEM
        </span>
        <span className="text-[7.5px] sm:text-[8.5px] font-semibold text-gray-400 dark:text-gray-500 uppercase mt-1 tracking-wider leading-none">
          Inspektörsklient
        </span>
      </div>
    </div>
  );
}
