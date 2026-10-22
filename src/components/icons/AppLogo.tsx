import { HTMLAttributes, CSSProperties } from 'react';
import provprotokollLogoImg from '../../assets/images/provprotokoll_logo_trim.png';
import provprotokollIconImg from '../../assets/images/provprotokoll_icon.png';

interface AppLogoProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'icon' | 'full' | 'horizontal' | 'badge' | 'provprotokoll' | 'wordmark';
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

  // Kompakt ordmärke för appens toppfält – samma tvåfärgade namn som logotypen,
  // men som text så att det är skarpt i liten storlek och fungerar i mörkt läge.
  if (variant === 'wordmark') {
    return (
      <div className={`inline-flex items-center gap-2 select-none ${className}`} style={style} {...props}>
        <img
          src={provprotokollIconImg}
          alt=""
          aria-hidden="true"
          draggable={false}
          className="w-9 h-9 rounded-[10px] bg-white border border-black/5 object-contain shrink-0"
        />
        <span className="font-heading text-[19px] font-bold leading-none tracking-[-0.01em]">
          <span className="text-ink">Prov</span><span className="text-[#1d4ed8] dark:text-blue-400">Protokoll</span>
        </span>
      </div>
    );
  }

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

  // Ikonen är ett utsnitt ur logotypen (skrivplattan med fordonen)
  const renderEmblem = () => (
    <img
      src={provprotokollIconImg}
      alt=""
      aria-hidden="true"
      draggable={false}
      className="w-full h-full rounded-[22%] bg-white border border-black/5 shadow-xs object-contain"
    />
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
        <span className="text-xs font-bold text-gray-900 dark:text-gray-100 font-sans">
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
          <span className="text-[14px] sm:text-[16px] font-bold text-[#002F6C] dark:text-blue-400 leading-none">
            DIGITALT
          </span>
          <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 tabular-nums">
            PRO
          </span>
        </div>
        <span className="text-[11px] sm:text-[11px] font-bold text-[#c40000] dark:text-red-400 mt-1 leading-none">
          KÖRPROVSSYSTEM
        </span>
        <span className="text-[7.5px] sm:text-[11px] font-semibold text-gray-400 dark:text-gray-500 mt-1 leading-none">
          Inspektörsklient
        </span>
      </div>
    </div>
  );
}
