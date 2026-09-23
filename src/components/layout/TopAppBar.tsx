import { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../../store/ProvContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppLogo } from '../icons/AppLogo';
import { Moon, Sun, History, Share2, Check, BookOpen, Maximize, Minimize, User, Users, LogOut, GraduationCap, Car, ClipboardList } from 'lucide-react';
import { LathundModal } from '../LathundModal';
import { toggleAppFullscreen, isCurrentlyFullscreen } from '../../lib/fullscreen';
import { signOut } from '../../lib/inspectors';

export function TopAppBar() {
  const { profile, state } = useAppStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [time, setTime] = useState('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [copied, setCopied] = useState(false);
  const [isLathundOpen, setIsLathundOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    if (window.confirm('Är du säker på att du vill logga ut från provsystemet?')) {
      await signOut();
      window.location.reload();
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(isCurrentlyFullscreen());
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    document.addEventListener('webkitfullscreenchange', handleFsChange);
    window.addEventListener('appfullscreenchange', handleFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('webkitfullscreenchange', handleFsChange);
      window.removeEventListener('appfullscreenchange', handleFsChange);
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
  
  const roleLabel = profile.role === 'admin' ? 'Administratör' : 'Inspektör';
  const initials = (profile.name || 'I').split(' ').filter(Boolean).slice(0, 2).map(p => p[0].toUpperCase()).join('');

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
  
  const toggleDarkMode = () => {
    setIsDark(prev => !prev);
  };

  // I fullskärmsläge döljs toppmenyn helt så att applikationen blir identisk med provplattans surfplatta
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

  const navItems = [
    { path: '/korprov', label: 'Körprov', icon: Car },
    { path: '/teoriprov', label: 'Teoriprov', icon: ClipboardList },
    { path: '/trafikskola', label: 'Trafikskola', icon: GraduationCap },
    { path: '/elevregister', label: 'Elevregister', icon: Users },
    { path: '/lathundar', label: 'Lathundar', icon: BookOpen },
    { path: '/historik', label: 'Historik', icon: History },
  ];

  const iconButton = 'w-9 h-9 flex items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer';

  return (
    <header className="sticky top-0 z-50 w-full bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 pt-safe shrink-0">
      <div className="max-w-[1400px] mx-auto px-3 sm:px-5 h-14 md:h-16 flex items-center justify-between gap-3">

        {/* Vänster: logga + status */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex items-center cursor-pointer hover:opacity-90 transition-opacity"
            aria-label="Till startsidan"
          >
            <AppLogo variant="provprotokoll" size="sm" />
          </button>
          <div className="hidden xl:flex items-center gap-2 pl-3 border-l border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-red-500'}`} title={isOnline ? 'Ansluten' : 'Frånkopplad'} />
            <span className="font-mono font-semibold tabular-nums">{time}</span>
          </div>
        </div>

        {/* Mitten: huvudnavigering (på iPad-bredd bara ikoner) */}
        <nav className="hidden md:flex items-center gap-0.5 min-w-0" aria-label="Huvudmeny">
          {navItems.map(({ path, label, icon: Icon }) => {
            const active = location.pathname.startsWith(path);
            return (
              <button
                key={path}
                type="button"
                onClick={() => navigate(path)}
                title={label}
                aria-current={active ? 'page' : undefined}
                className={`h-9 px-2.5 lg:px-3 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
                  active
                    ? 'bg-[#002f6c] dark:bg-blue-600 text-white'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon size={16} className="shrink-0" />
                <span className="hidden lg:inline">{label}</span>
              </button>
            );
          })}
        </nav>

        {/* Höger: verktyg + profil */}
        <div className="flex items-center gap-0.5 shrink-0">
          <button
            type="button"
            onClick={handleCopyLink}
            className={`${iconButton} hidden sm:flex ${copied ? '!text-emerald-600' : ''}`}
            title={copied ? 'Länken är kopierad' : 'Kopiera länk till elevprovet'}
          >
            {copied ? <Check size={17} /> : <Share2 size={17} />}
          </button>
          <button type="button" onClick={() => setIsLathundOpen(true)} className={iconButton} title="Snabblathund">
            <BookOpen size={17} />
          </button>
          <button type="button" onClick={handleToggleFullscreen} className={iconButton} title={isFullscreen ? 'Lämna helskärm' : 'Helskärm (surfplatta)'}>
            {isFullscreen ? <Minimize size={17} /> : <Maximize size={17} />}
          </button>
          <button type="button" onClick={toggleDarkMode} className={iconButton} title={isDark ? 'Ljust läge' : 'Mörkt läge'}>
            {isDark ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          {/* Profil */}
          <div className="relative ml-1.5 pl-2 border-l border-slate-200 dark:border-slate-800" ref={profileMenuRef}>
            <button
              type="button"
              onClick={() => setIsProfileMenuOpen(prev => !prev)}
              className="flex items-center gap-2.5 cursor-pointer group rounded-lg py-1 pl-1 pr-1 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-haspopup="menu"
              aria-expanded={isProfileMenuOpen}
            >
              {profile.name && (
                <div className="text-right hidden xl:block">
                  <div className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">{profile.name}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">{roleLabel}</div>
                </div>
              )}
              <div className="w-8 h-8 bg-[#002f6c] dark:bg-blue-600 text-white font-bold text-sm rounded-full flex items-center justify-center shrink-0">
                {initials}
              </div>
            </button>

            {isProfileMenuOpen && (
              <div role="menu" className="absolute right-0 mt-2 w-60 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                  <div className="text-sm font-semibold text-slate-900 dark:text-white truncate">{profile.name || 'Inspektör'}</div>
                  {profile.email && <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{profile.email}</div>}
                  <div className="text-[11px] font-semibold text-[#002f6c] dark:text-blue-400 mt-1">
                    {roleLabel}{profile.depot ? ` · ${profile.depot}` : ''}
                  </div>
                </div>

                <div className="p-1">
                  {[
                    { label: 'Min profil', icon: User, path: '/profil', show: true },
                    { label: 'Inspektörer', icon: Users, path: '/inspektorer', show: profile.role === 'admin' },
                  ].filter(i => i.show).map(({ label, icon: Icon, path }) => (
                    <button
                      key={path}
                      role="menuitem"
                      type="button"
                      onClick={() => { setIsProfileMenuOpen(false); navigate(path); }}
                      className="w-full px-3 py-2 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-2.5 cursor-pointer"
                    >
                      <Icon size={15} className="text-slate-400" />
                      {label}
                    </button>
                  ))}
                  <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
                  <button
                    role="menuitem"
                    type="button"
                    onClick={handleLogout}
                    className="w-full px-3 py-2 text-left text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors flex items-center gap-2.5 cursor-pointer"
                  >
                    <LogOut size={15} />
                    Logga ut
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <LathundModal 
        isOpen={isLathundOpen} 
        onClose={() => setIsLathundOpen(false)}
        defaultLicense={state.properties.licenseType || 'B'}
      />
    </header>
  );
}
