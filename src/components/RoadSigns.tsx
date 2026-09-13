// Fictional-but-accurate renders of Swedish road signs & scene illustrations, drawn as inline SVG.
// Used instead of external image URLs so the theory exam works fully offline.

export type RoadSignType =
  | 'warning' | 'forbidden' | 'mandatory' | 'stop' | 'info' | 'yield' | 'no-entry'
  | 'vajningsplikt' | 'stopplikt' | 'parkering-forbud' | 'stanna-parkera-forbud'
  | 'motorvag' | 'postombud' | 'lgf'
  | 'huvudled' | 'overgangsstalle' | 'varning-alg' | 'cirkulationsplats' | 'cykelbana';

export const RoadSign = ({ type, icon: Icon, text }: { type: string, icon?: any, text?: string }) => {
  if (type === 'warning') {
    return (
      <div className="relative w-48 h-48 flex items-center justify-center">
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full drop-shadow-lg">
          <polygon points="50,5 95,85 5,85" fill="#fcd34d" stroke="#ef4444" strokeWidth="8" strokeLinejoin="round" />
        </svg>
        <div className="relative z-10 mt-6 text-black">
          {Icon && <Icon className="w-20 h-20 stroke-[1.5]" />}
        </div>
      </div>
    );
  }
  if (type === 'forbidden') {
    return (
      <div className="relative w-48 h-48 flex items-center justify-center">
        <div className="absolute inset-0 w-full h-full rounded-full border-[14px] border-red-500 bg-yellow-300 drop-shadow-lg" />
        <div className="relative z-10 text-black flex items-center justify-center">
          {Icon ? <Icon className="w-20 h-20 stroke-[1.5]" /> : <span className="font-black text-[5rem] tracking-tighter leading-none">{text}</span>}
        </div>
      </div>
    );
  }
  if (type === 'mandatory') {
    return (
      <div className="relative w-48 h-48 flex items-center justify-center">
        <div className="absolute inset-0 w-full h-full rounded-full bg-blue-600 border-4 border-white shadow-[0_0_0_4px_#2563eb] drop-shadow-lg" />
        <div className="relative z-10 text-white">
          {Icon && <Icon className="w-24 h-24 stroke-[2]" />}
        </div>
      </div>
    );
  }
  if (type === 'stop') {
    return (
      <div className="relative w-48 h-48 flex items-center justify-center">
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full drop-shadow-lg">
          <polygon points="30,5 70,5 95,30 95,70 70,95 30,95 5,70 5,30" fill="#ef4444" stroke="white" strokeWidth="3" />
        </svg>
        <div className="relative z-10 text-white font-black text-3xl tracking-widest mt-1">STOP</div>
      </div>
    );
  }
  if (type === 'info') {
    return (
      <div className="relative w-48 h-48 flex items-center justify-center">
        <div className="absolute inset-0 w-full h-full bg-blue-600 rounded-lg border-4 border-white drop-shadow-lg" />
        <div className="relative z-10 text-white">
          {Icon ? <Icon className="w-24 h-24 stroke-[1.5]" /> : <span className="font-bold text-[5.5rem] leading-none">{text}</span>}
        </div>
      </div>
    );
  }
  if (type === 'yield') {
    return (
      <div className="relative w-48 h-48 flex items-center justify-center">
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full drop-shadow-lg">
          <polygon points="5,15 95,15 50,95" fill="#fcd34d" stroke="#ef4444" strokeWidth="8" strokeLinejoin="round" />
        </svg>
      </div>
    );
  }
  if (type === 'no-entry') {
    return (
      <div className="relative w-48 h-48 flex items-center justify-center">
        <div className="absolute inset-0 w-full h-full rounded-full bg-red-500 border-4 border-white shadow-[0_0_0_2px_#ef4444] drop-shadow-lg" />
        <div className="relative z-10 w-28 h-7 bg-white rounded-sm" />
      </div>
    );
  }

  // Väjningsplikt (B1) — downward-pointing yellow/red triangle
  if (type === 'vajningsplikt') {
    return (
      <div className="relative w-48 h-48 flex items-center justify-center">
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full drop-shadow-lg">
          <polygon points="5,15 95,15 50,95" fill="#fdf6e3" stroke="#d2232a" strokeWidth="8" strokeLinejoin="round" />
        </svg>
      </div>
    );
  }

  // Stopplikt (B2) — octagon with STOP text
  if (type === 'stopplikt') {
    return (
      <div className="relative w-48 h-48 flex items-center justify-center">
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full drop-shadow-lg">
          <polygon points="30,5 70,5 95,30 95,70 70,95 30,95 5,70 5,30" fill="#d2232a" stroke="white" strokeWidth="3" />
        </svg>
        <div className="relative z-10 text-white font-black text-2xl tracking-widest">STOP</div>
      </div>
    );
  }

  // Förbud mot att parkera (C39) — red circle, one diagonal bar
  if (type === 'parkering-forbud') {
    return (
      <div className="relative w-48 h-48 flex items-center justify-center">
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full drop-shadow-lg">
          <circle cx="50" cy="50" r="46" fill="#0056a8" stroke="#d2232a" strokeWidth="8" />
          <line x1="18" y1="82" x2="82" y2="18" stroke="#d2232a" strokeWidth="8" />
          <text x="50" y="62" textAnchor="middle" fontSize="42" fontWeight="900" fill="white">P</text>
        </svg>
      </div>
    );
  }

  // Förbud mot att stanna och parkera (C35) — red circle, cross bars
  if (type === 'stanna-parkera-forbud') {
    return (
      <div className="relative w-48 h-48 flex items-center justify-center">
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full drop-shadow-lg">
          <circle cx="50" cy="50" r="46" fill="#0056a8" stroke="#d2232a" strokeWidth="8" />
          <line x1="18" y1="82" x2="82" y2="18" stroke="#d2232a" strokeWidth="8" />
          <line x1="18" y1="18" x2="82" y2="82" stroke="#d2232a" strokeWidth="8" />
          <text x="50" y="62" textAnchor="middle" fontSize="42" fontWeight="900" fill="white">P</text>
        </svg>
      </div>
    );
  }

  // Motorväg (E1) — blue square with stylised road lanes
  if (type === 'motorvag') {
    return (
      <div className="relative w-48 h-48 flex items-center justify-center">
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full drop-shadow-lg">
          <rect x="4" y="4" width="92" height="92" rx="6" fill="#0056a8" stroke="white" strokeWidth="4" />
          <path d="M20 80 L38 20 L48 20 L38 80 Z" fill="white" />
          <path d="M62 80 L80 20 L90 20 L80 80 Z" fill="white" />
        </svg>
      </div>
    );
  }

  // Postombud (H21-ish) — blue square with posthorn glyph
  if (type === 'postombud') {
    return (
      <div className="relative w-48 h-48 flex items-center justify-center">
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full drop-shadow-lg">
          <rect x="4" y="4" width="92" height="92" rx="6" fill="#0056a8" stroke="white" strokeWidth="4" />
          <path
            d="M30 68 C30 50, 45 30, 68 32 C72 32, 74 36, 71 39 C58 41, 48 52, 46 66"
            fill="none" stroke="#fbbf24" strokeWidth="7" strokeLinecap="round"
          />
          <circle cx="70" cy="34" r="6" fill="#fbbf24" />
        </svg>
      </div>
    );
  }

  // LGF — orange-red reflective triangle for slow-moving vehicles
  if (type === 'lgf') {
    return (
      <div className="relative w-48 h-48 flex items-center justify-center">
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full drop-shadow-lg">
          <polygon points="50,8 92,88 8,88" fill="#f97316" stroke="#d2232a" strokeWidth="6" strokeLinejoin="round" />
          <polygon points="50,26 76,78 24,78" fill="#fde68a" />
        </svg>
      </div>
    );
  }

  // Huvudled (B4) — yellow diamond with white border
  if (type === 'huvudled') {
    return (
      <div className="relative w-48 h-48 flex items-center justify-center">
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full drop-shadow-lg">
          <polygon points="50,5 95,50 50,95 5,50" fill="white" stroke="#334155" strokeWidth="1" />
          <polygon points="50,15 85,50 50,85 15,50" fill="#facc15" />
        </svg>
      </div>
    );
  }

  // Övergångsställe (B7 / E11) — blue square with pedestrian walking
  if (type === 'overgangsstalle') {
    return (
      <div className="relative w-48 h-48 flex items-center justify-center">
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full drop-shadow-lg">
          <rect x="4" y="4" width="92" height="92" rx="6" fill="#0056a8" stroke="white" strokeWidth="3" />
          <polygon points="50,12 88,84 12,84" fill="white" />
          {/* Walking person silhouette */}
          <circle cx="50" cy="36" r="5" fill="#1e293b" />
          <path d="M48 43 L54 55 L58 53 L51 43 Z" fill="#1e293b" />
          <path d="M46 54 L40 76 L44 76 L49 61 L55 76 L60 76 L52 56 Z" fill="#1e293b" />
          <rect x="25" y="78" width="50" height="4" fill="#0056a8" />
        </svg>
      </div>
    );
  }

  // Varning för älg / vilt (A19)
  if (type === 'varning-alg') {
    return (
      <div className="relative w-48 h-48 flex items-center justify-center">
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full drop-shadow-lg">
          <polygon points="50,6 94,84 6,84" fill="#fdf6e3" stroke="#d2232a" strokeWidth="8" strokeLinejoin="round" />
          <path d="M30 65 Q35 55 45 55 L58 53 Q62 48 66 45 Q70 42 72 46 L70 50 L64 54 Q65 58 66 68 L62 68 L60 58 L48 60 L45 68 L40 68 Q41 62 42 58 L32 60 Z" fill="#1e293b" />
        </svg>
      </div>
    );
  }

  // Cirkulationsplats (D1) — blue circle with three white rotating arrows
  if (type === 'cirkulationsplats') {
    return (
      <div className="relative w-48 h-48 flex items-center justify-center">
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full drop-shadow-lg">
          <circle cx="50" cy="50" r="46" fill="#0056a8" stroke="white" strokeWidth="3" />
          <g stroke="white" strokeWidth="6" fill="none" strokeLinecap="round">
            <path d="M50 20 A30 30 0 0 1 76 65" />
            <path d="M76 65 A30 30 0 0 1 24 65" />
            <path d="M24 65 A30 30 0 0 1 50 20" />
          </g>
          <polygon points="50,14 58,26 44,26" fill="white" />
          <polygon points="82,60 74,74 68,62" fill="white" />
          <polygon points="20,58 32,66 22,76" fill="white" />
        </svg>
      </div>
    );
  }

  // Påbjuden cykelbana (D4)
  if (type === 'cykelbana') {
    return (
      <div className="relative w-48 h-48 flex items-center justify-center">
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full drop-shadow-lg">
          <circle cx="50" cy="50" r="46" fill="#0056a8" stroke="white" strokeWidth="3" />
          {/* Bicycle outline */}
          <circle cx="34" cy="58" r="12" fill="none" stroke="white" strokeWidth="3.5" />
          <circle cx="66" cy="58" r="12" fill="none" stroke="white" strokeWidth="3.5" />
          <path d="M34 58 L48 42 L62 42 M48 42 L52 58 L34 58 M52 58 L66 58" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="44" y1="38" x2="52" y2="38" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
          <line x1="62" y1="38" x2="68" y2="44" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  return null;
};

// A specific set of options for the postombud question (H-series signs), exactly matching Trafikverket:
// A: Verkstad (skiftnyckel), B: Postombud (posthorn), C: Vandrarhem / Stuga (hus), D: Informationsplats (i)
export const PostombudOption = ({ letter }: { letter: 'A' | 'B' | 'C' | 'D' }) => {
  return (
    <div className="w-full h-full flex items-center justify-center p-2">
      <svg viewBox="0 0 100 100" className="w-28 h-28 max-h-36 max-w-36 drop-shadow-sm">
        {/* Outer blue square with thick white border */}
        <rect x="5" y="5" width="90" height="90" rx="3" fill="#0057a6" stroke="#0057a6" strokeWidth="2" />
        <rect x="11" y="11" width="78" height="78" rx="2" fill="white" />
        
        {/* A: Verkstad (black adjustable wrench / skiftnyckel) */}
        {letter === 'A' && (
          <g fill="#111">
            {/* Wrench head */}
            <rect x="42" y="24" width="16" height="52" rx="1" />
            <rect x="36" y="28" width="28" height="9" />
            <rect x="36" y="37" width="13" height="7" />
          </g>
        )}

        {/* B: Postombud (black posthorn) */}
        {letter === 'B' && (
          <g fill="#111">
            <path
              d="M26 40 C26 65, 74 65, 74 40 C74 45, 68 53, 50 53 C32 53, 26 45, 26 40 Z"
            />
            <path
              d="M40 50 C44 58, 56 58, 60 50 C57 53, 43 53, 40 50 Z"
            />
            <circle cx="27" cy="38" r="4" />
            <path d="M72 35 L76 35 L76 43 L72 43 Z" />
          </g>
        )}

        {/* C: Vandrarhem / Stuga (house with window) */}
        {letter === 'C' && (
          <g fill="#111">
            {/* Roof */}
            <polygon points="50,26 73,46 27,46" />
            {/* Body */}
            <rect x="33" y="46" width="34" height="28" />
            {/* Window */}
            <rect x="42" y="54" width="16" height="8" fill="white" />
          </g>
        )}

        {/* D: Informationsplats ('i' sign) */}
        {letter === 'D' && (
          <g fill="#111">
            {/* Dot of i */}
            <circle cx="50" cy="30" r="5" />
            {/* Stem of i with serif top and bottom */}
            <path d="M44 41 L54 41 L54 65 L58 65 L58 70 L42 70 L42 65 L46 65 L46 45 L44 45 Z" />
          </g>
        )}
      </svg>
    </div>
  );
};

// Fictional themed scene illustration used in place of stock photography, keeping
// the exam fully offline-capable. Purely decorative context art for a question.
export type SceneType = 'motorcycle' | 'trailer-hitch' | 'truck-underrun' | 'bus-stop' | 'tractor' | 'jackknife';

export const SceneIllustration = ({ type }: { type: SceneType }) => {
  const common = 'w-full h-full max-h-[280px]';
  if (type === 'motorcycle') {
    return (
      <svg viewBox="0 0 200 120" className={common}>
        <rect width="200" height="120" fill="#e2e8f0" />
        <rect y="90" width="200" height="30" fill="#94a3b8" />
        <circle cx="60" cy="88" r="16" fill="#1f2937" />
        <circle cx="140" cy="88" r="16" fill="#1f2937" />
        <rect x="70" y="60" width="60" height="16" rx="6" fill="#0056a8" />
        <rect x="95" y="40" width="10" height="26" fill="#1f2937" />
      </svg>
    );
  }
  if (type === 'trailer-hitch') {
    return (
      <svg viewBox="0 0 200 120" className={common}>
        <rect width="200" height="120" fill="#e2e8f0" />
        <rect y="95" width="200" height="25" fill="#94a3b8" />
        <rect x="20" y="55" width="70" height="35" rx="4" fill="#0056a8" />
        <circle cx="35" cy="92" r="12" fill="#1f2937" />
        <circle cx="75" cy="92" r="12" fill="#1f2937" />
        <rect x="90" y="70" width="20" height="6" fill="#334155" />
        <rect x="110" y="60" width="70" height="30" rx="4" fill="#d2232a" />
        <circle cx="125" cy="92" r="12" fill="#1f2937" />
        <circle cx="165" cy="92" r="12" fill="#1f2937" />
      </svg>
    );
  }
  if (type === 'truck-underrun' || type === 'jackknife') {
    return (
      <svg viewBox="0 0 200 120" className={common}>
        <rect width="200" height="120" fill="#e2e8f0" />
        <rect y="95" width="200" height="25" fill="#94a3b8" />
        <rect x="15" y="45" width="170" height="45" rx="4" fill="#f97316" />
        <rect x="15" y="82" width="170" height="8" fill="#1f2937" />
        <circle cx="40" cy="92" r="12" fill="#1f2937" />
        <circle cx="90" cy="92" r="12" fill="#1f2937" />
        <circle cx="160" cy="92" r="12" fill="#1f2937" />
        <rect x="15" y="45" width="35" height="45" fill="#1f2937" opacity="0.15" />
      </svg>
    );
  }
  if (type === 'bus-stop') {
    return (
      <svg viewBox="0 0 200 120" className={common}>
        <rect width="200" height="120" fill="#e2e8f0" />
        <rect y="95" width="200" height="25" fill="#94a3b8" />
        <rect x="20" y="40" width="140" height="50" rx="6" fill="#0056a8" />
        <rect x="30" y="50" width="24" height="18" fill="#bfdbfe" />
        <rect x="60" y="50" width="24" height="18" fill="#bfdbfe" />
        <rect x="90" y="50" width="24" height="18" fill="#bfdbfe" />
        <circle cx="45" cy="92" r="12" fill="#1f2937" />
        <circle cx="135" cy="92" r="12" fill="#1f2937" />
        <rect x="165" y="20" width="4" height="70" fill="#334155" />
        <rect x="150" y="20" width="30" height="18" fill="#fde68a" stroke="#334155" strokeWidth="2" />
      </svg>
    );
  }
  if (type === 'tractor') {
    return (
      <svg viewBox="0 0 200 120" className={common}>
        <rect width="200" height="120" fill="#dcfce7" />
        <rect y="95" width="200" height="25" fill="#94a3b8" />
        <circle cx="60" cy="90" r="22" fill="#1f2937" />
        <circle cx="60" cy="90" r="10" fill="#65a30d" />
        <circle cx="140" cy="95" r="14" fill="#1f2937" />
        <rect x="80" y="55" width="55" height="30" rx="3" fill="#65a30d" />
        <rect x="90" y="35" width="20" height="24" fill="#4d7c0f" />
      </svg>
    );
  }
  return null;
};
