import { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../../store/ProvContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppLogo } from '../icons/AppLogo';
import { Moon, Sun, Play, Pause, RotateCcw, Timer, History, ExternalLink, Share2, Check, BookOpen, Maximize, Minimize } from 'lucide-react';
import { LathundModal } from '../LathundModal';

import { toggleAppFullscreen, isCurrentlyFullscreen } from '../../lib/fullscreen';
import { LogIn } from 'lucide-react';
import { LoginModal } from '../LoginModal';

export function TopAppBar() {
  const { profile } = useAppStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [time, setTime] = useState('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [copied, setCopied] = useState(false);
  const [isLathundOpen, setIsLathundOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(isCurrentlyFullscreen());
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    document.addEventListener('webkitfullscreenchange', handleFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('webkitfullscreenchange', handleFsChange);
    };
  }, []);

  const handleToggleFullscreen = () => {
    toggleAppFullscreen();
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/elevprov`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  // Dark mode
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
             document.documentElement.classList.contains('dark') ||
             (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);
  
  // Stopwatch state
  const [showTimer, setShowTimer] = useState(false);
  const [testTime, setTestTime] = useState(0); 
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' }));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);
  
  // Timer logic
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setTestTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [isTimerRunning]);

  const toggleDarkMode = () => {
    setIsDark(prev => !prev);
  };
  
  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // I fullskärmsläge döljs toppmenyn helt så att applikationen blir identisk med Trafikverkets surfplatta
  if (isFullscreen) {
    return (
      <>
        {/* Liten diskret flytande knapp för att lämna fullskärm om man vill */}
        <button
          onClick={handleToggleFullscreen}
          className="fixed top-2 right-2 z-50 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white transition-opacity opacity-20 hover:opacity-100 shadow-md cursor-pointer"
          title="Lämna helskärm"
        >
          <Minimize size={16} />
        </button>
      </>
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-white dark:bg-slate-950 border-b border-gray-200 dark:border-slate-800 shadow-sm pt-safe shrink-0">
      <div className="max-w-[1400px] mx-auto px-2 sm:px-6 h-16 md:h-20 flex items-center justify-between gap-1.5 md:gap-6">
        
        {/* Left: Brand Logo & Status */}
        <div className="flex items-center gap-3 shrink-0">
          <div
            onClick={() => navigate('/')}
            className="flex items-center cursor-pointer group hover:opacity-95 transition-opacity rounded-sm overflow-hidden"
          >
            <AppLogo variant="provprotokoll" size="sm" />
          </div>

          <div className="hidden lg:flex items-center gap-2.5 pl-3 border-l border-gray-200 dark:border-slate-800 text-xs">
            <div className="flex flex-col">
              <span className="text-[10px] font-black tracking-widest uppercase text-[#002f6c] dark:text-blue-400">
                Inspektörsterminal
              </span>
              <span className="font-mono text-gray-500 dark:text-gray-400 text-[11px] font-semibold">
                {time}
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-100 dark:bg-slate-850 border border-gray-200/80 dark:border-slate-700/60 text-[11px]">
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 shadow-xs shadow-emerald-500/50' : 'bg-red-500'}`} />
              <span className="font-bold text-gray-700 dark:text-gray-300">{isOnline ? 'Ansluten' : 'Frånkopplad'}</span>
            </div>
          </div>
        </div>

        {/* Center: Main Navigation Tabs (Desktop view) */}
        <nav className="hidden md:flex items-center gap-1 bg-gray-100/80 dark:bg-slate-900 p-1 rounded-xl border border-gray-200/60 dark:border-slate-800">
          <button 
            onClick={() => navigate('/korprov')}
            className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-bold uppercase tracking-wider transition-all ${
              location.pathname.includes('/korprov') 
                ? 'bg-[#002f6c] text-white shadow-sm' 
                : 'text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white hover:bg-gray-200/60 dark:hover:bg-slate-800'
            }`}
          >
            Körprov
          </button>
          <button 
            onClick={() => navigate('/teoriprov')}
            className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-bold uppercase tracking-wider transition-all ${
              location.pathname.includes('/teoriprov') 
                ? 'bg-[#002f6c] text-white shadow-sm' 
                : 'text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white hover:bg-gray-200/60 dark:hover:bg-slate-800'
            }`}
          >
            Teoriprov
          </button>
          <button 
            onClick={() => navigate('/lathundar')}
            className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
              location.pathname.includes('/lathundar') 
                ? 'bg-[#002f6c] text-white shadow-sm' 
                : 'text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white hover:bg-gray-200/60 dark:hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4 hidden sm:inline text-amber-500" />
            Lathundar
          </button>
          <button 
            onClick={() => navigate('/historik')}
            className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
              location.pathname.includes('/historik') 
                ? 'bg-[#002f6c] text-white shadow-sm' 
                : 'text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white hover:bg-gray-200/60 dark:hover:bg-slate-800'
            }`}
          >
            <History className="w-4 h-4 hidden sm:inline" />
            Historik
          </button>
        </nav>

        {/* Right: Actions & User Profile */}
        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          {/* Stopwatch / Timer widget */}
          <div className="hidden xl:flex items-center">
            {!showTimer ? (
               <button 
                 onClick={() => setShowTimer(true)}
                 className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors border border-gray-200/80 dark:border-slate-800"
               >
                 <Timer size={15} className="text-[#002f6c] dark:text-blue-400" /> 
                 <span>Körtid</span>
               </button>
            ) : (
               <div className="flex items-center gap-2 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 px-2.5 py-1 rounded-lg shadow-sm">
                  <span className={`font-mono font-bold text-xs w-10 text-center ${isTimerRunning ? 'text-red-600' : 'text-gray-700 dark:text-gray-300'}`}>
                    {formatTimer(testTime)}
                  </span>
                  <div className="flex items-center gap-1 border-l border-gray-200 dark:border-slate-800 pl-1.5">
                    <button onClick={() => setIsTimerRunning(!isTimerRunning)} className="p-1 hover:text-[#002f6c] dark:hover:text-blue-400 rounded">
                      {isTimerRunning ? <Pause size={13} /> : <Play size={13} />}
                    </button>
                    <button onClick={() => { setIsTimerRunning(false); setTestTime(0); }} className="p-1 hover:text-red-500 rounded">
                      <RotateCcw size={13} />
                    </button>
                    <button onClick={() => setShowTimer(false)} className="p-1 text-gray-400 hover:text-gray-600 text-[10px] font-bold">✕</button>
                  </div>
               </div>
            )}
          </div>

          {/* Share Prov Link */}
          <button 
            onClick={handleCopyLink}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all uppercase tracking-wider ${
              copied 
                ? 'bg-emerald-600 text-white' 
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:hover:bg-emerald-900/40 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800'
            }`}
            title="Kopiera länk till elevprovet"
          >
            {copied ? <Check size={14} /> : <Share2 size={14} />}
            <span>{copied ? 'Kopierad!' : 'Dela provlänk'}</span>
          </button>

          {/* Lathund Modal Quick Button */}
          <button
            onClick={() => setIsLathundOpen(true)}
            className="flex items-center justify-center gap-1.5 min-w-10 min-h-10 sm:min-w-0 sm:min-h-0 px-2 sm:px-2.5 py-2 sm:py-1.5 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer"
            title="Öppna snabblathund för regelverk & TDOK"
          >
            <BookOpen size={14} />
            <span className="hidden xl:inline">Snabblathund</span>
          </button>

          {/* Fullskärmsvy (Surfplatteläge Android/Web) */}
          <button
            onClick={handleToggleFullscreen}
            className="flex items-center justify-center min-w-10 min-h-10 sm:min-w-0 sm:min-h-0 px-2.5 py-1.5 rounded-lg bg-gray-100 dark:bg-slate-900 hover:bg-gray-200 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300 transition-colors border border-gray-200/60 dark:border-slate-800 gap-1.5 text-xs font-bold cursor-pointer active:scale-95"
            title={isFullscreen ? "Lämna helskärm" : "Fullskärmsläge (Surfplatta)"}
          >
            {isFullscreen ? <Minimize size={15} className="text-blue-600 dark:text-blue-400" /> : <Maximize size={15} />}
            <span className="hidden xl:inline">{isFullscreen ? 'Avsluta fullskärm' : 'Fullskärm'}</span>
          </button>

          {/* Dark mode toggle */}
          <button
            onClick={toggleDarkMode}
            className="flex items-center justify-center min-w-10 min-h-10 sm:min-w-0 sm:min-h-0 p-2 rounded-lg bg-gray-100 dark:bg-slate-900 hover:bg-gray-200 dark:hover:bg-slate-800 text-gray-600 dark:text-gray-300 transition-colors border border-gray-200/60 dark:border-slate-800 cursor-pointer active:scale-95"
            title="Växla mörkt läge"
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* User Profile */}
          <div
            onClick={() => navigate('/profil')}
            className="flex items-center gap-2 pl-1 sm:pl-2 cursor-pointer group"
          >
            <div className="text-right hidden sm:block">
              <div className="text-xs md:text-sm font-bold text-gray-900 dark:text-gray-100 leading-none group-hover:text-[#002f6c] dark:group-hover:text-blue-400 transition-colors">
                {profile.name || 'Rasmus Lundin'}
              </div>
              <div className="text-[10px] text-gray-400 dark:text-gray-500 font-medium leading-tight mt-0.5">
                Inspektör
              </div>
            </div>
            <div className="w-9 h-9 md:w-9 md:h-9 bg-[#002F6C] text-white font-black text-xs md:text-sm rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-white/10 group-hover:bg-[#001d4a] transition-colors">
              {profile.name ? profile.name[0].toUpperCase() : 'R'}
            </div>
          </div>

        </div>
      </div>

      <LathundModal isOpen={isLathundOpen} onClose={() => setIsLathundOpen(false)} />
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </header>
  );
}
