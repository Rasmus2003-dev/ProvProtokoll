import { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../../store/ProvContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppLogo } from '../icons/AppLogo';
import { Moon, Sun, History, Link2, Check, BookOpen, Maximize, Minimize, User, Users, LogOut, GraduationCap, Car, ClipboardList, BookMarked, WifiOff, RefreshCw } from 'lucide-react';
import { LathundModal } from '../LathundModal';
import { toggleAppFullscreen, isCurrentlyFullscreen } from '../../lib/fullscreen';
import { signOut } from '../../lib/inspectors';
import { isTestStepPath } from '../../lib/activeTest';

export function TopAppBar() {
  const { profile, state, syncQueue, syncTests, isSyncing } = useAppStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [time, setTime] = useState('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [copied, setCopied] = useState(false);
  const [isLathundOpen, setIsLathundOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Stäng menyn vid klick utanför eller Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsProfileMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, []);

  // Menyn stängs när man byter sida
  useEffect(() => {
    setIsProfileMenuOpen(false);
  }, [location.pathname]);

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
    // Statusfältet på mobilen följer temat
    document.querySelectorAll('meta[name="theme-color"]').forEach(m => m.setAttribute('content', isDark ? '#0b1120' : '#ffffff'));
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

  const iconButton = 'w-10 h-10 flex items-center justify-center rounded-control text-ink-2 hover:text-ink hover:bg-surface-2 transition-colors cursor-pointer';
  const menuItem = 'w-full min-h-11 px-3 text-left text-[15px] md:text-sm text-ink hover:bg-surface-2 rounded-[10px] transition-colors flex items-center gap-3 cursor-pointer';

  return (
    <header className="sticky top-0 z-50 w-full bg-surface/90 backdrop-blur-xl border-b border-line pt-safe shrink-0">
      <div className="max-w-[1400px] mx-auto px-3 sm:px-5 h-14 md:h-16 flex items-center justify-between gap-3">

        {/* Vänster: logga + status */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 min-w-0">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex items-center cursor-pointer rounded-control -ml-1 p-1 shrink-0"
            aria-label="Till startsidan"
          >
            <AppLogo variant="wordmark" />
          </button>
          {isTestStepPath(location.pathname) && state.properties.studentName && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-2 border border-line text-xs font-semibold text-ink min-w-0 max-w-[140px] sm:max-w-xs truncate shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="truncate">{state.properties.studentName}</span>
              <span className="text-[10px] text-ink-3 font-mono shrink-0">({state.properties.licenseType || 'B'})</span>
            </div>
          )}
          <div className="hidden xl:flex items-center gap-2 pl-3 border-l border-line text-xs text-ink-3 shrink-0">
            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-red-500'}`} title={isOnline ? 'Ansluten' : 'Frånkopplad'} />
            <span className="font-semibold tabular-nums">{time}</span>
          </div>
        </div>

        {/* Mitten: huvudnavigering (på iPad-bredd bara ikoner) */}
        <nav className="hidden md:flex items-center gap-0.5 min-w-0 p-1 rounded-[14px] bg-surface-2 border border-line" aria-label="Huvudmeny">
          {navItems.map(({ path, label, icon: Icon }) => {
            const active = location.pathname.startsWith(path);
            return (
              <button
                key={path}
                type="button"
                onClick={() => navigate(path)}
                title={label}
                aria-current={active ? 'page' : undefined}
                className={`h-9 px-2.5 lg:px-3 rounded-[10px] text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
                  active
                    ? 'bg-surface text-navy dark:text-white shadow-lift'
                    : 'text-ink-2 hover:text-ink'
                }`}
              >
                <Icon size={16} className="shrink-0" />
                <span className="hidden lg:inline">{label}</span>
              </button>
            );
          })}
        </nav>

        {/* Höger: verktyg + profil */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Offline eller kö-indikator för surfplatta och mobil */}
          {!isOnline ? (
            <span
              className="h-8 px-2.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs font-semibold flex items-center gap-1.5 shadow-xs"
              title="Appen är i offlineläge. Alla prov sparas lokalt."
            >
              <WifiOff size={13} className="shrink-0" />
              <span>Offline{syncQueue.length > 0 ? ` (${syncQueue.length})` : ''}</span>
            </span>
          ) : syncQueue.length > 0 ? (
            <button
              type="button"
              onClick={() => syncTests()}
              disabled={isSyncing}
              className="h-8 px-2.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer hover:bg-blue-100 transition-colors"
              title="Klicka för att synka köade prov till molnet"
            >
              <RefreshCw size={13} className={isSyncing ? 'animate-spin' : ''} />
              <span>Synka {syncQueue.length} prov</span>
            </button>
          ) : null}

          <div className="hidden sm:flex items-center gap-0.5">
            <button
              type="button"
              onClick={handleCopyLink}
              className={`${iconButton} ${copied ? '!text-emerald-600' : ''}`}
              title={copied ? 'Länken är kopierad' : 'Kopiera länk till elevprovet'}
            >
              {copied ? <Check size={18} /> : <Link2 size={18} />}
            </button>
            <button type="button" onClick={() => setIsLathundOpen(true)} className={iconButton} title="Snabblathund">
              <BookMarked size={18} />
            </button>
            <button type="button" onClick={handleToggleFullscreen} className={iconButton} title="Helskärm (surfplatta)">
              <Maximize size={18} />
            </button>
          </div>
          <button type="button" onClick={toggleDarkMode} className={iconButton} title={isDark ? 'Ljust läge' : 'Mörkt läge'} aria-label={isDark ? 'Byt till ljust läge' : 'Byt till mörkt läge'}>
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Profil */}
          <div className="relative ml-1 sm:ml-1.5 sm:pl-2 sm:border-l border-line" ref={profileMenuRef}>
            <button
              type="button"
              onClick={() => setIsProfileMenuOpen(prev => !prev)}
              className="flex items-center gap-2.5 cursor-pointer rounded-full xl:rounded-control p-1 xl:pr-2 hover:bg-surface-2 transition-colors"
              aria-haspopup="menu"
              aria-expanded={isProfileMenuOpen}
              aria-label="Konto och verktyg"
            >
              <div className="w-8 h-8 bg-navy dark:bg-blue-600 text-white font-semibold text-sm rounded-full flex items-center justify-center shrink-0">
                {initials}
              </div>
              {profile.name && (
                <div className="text-left hidden xl:block">
                  <div className="text-sm font-semibold text-ink leading-tight">{profile.name}</div>
                  <div className="text-[11px] text-ink-3 leading-tight">{roleLabel}</div>
                </div>
              )}
            </button>

            {isProfileMenuOpen && (
              <div
                role="menu"
                className="fixed md:absolute left-2 right-2 md:left-auto md:right-0 top-[calc(56px+env(safe-area-inset-top))] md:top-auto md:mt-2 md:w-64 bg-surface rounded-card shadow-float border border-line p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 origin-top-right"
              >
                <div className="px-3 pt-2 pb-3 mb-1 border-b border-line flex items-center gap-3">
                  <div className="w-10 h-10 bg-navy dark:bg-blue-600 text-white font-semibold rounded-full flex items-center justify-center shrink-0">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <div className="text-[15px] font-semibold text-ink truncate">{profile.name || 'Inspektör'}</div>
                    <div className="text-xs text-ink-3 truncate">
                      {roleLabel}{profile.depot ? `, ${profile.depot}` : ''}
                    </div>
                  </div>
                </div>

                {/* Verktyg som inte får plats i mobilens toppfält */}
                <div className="sm:hidden">
                  <button role="menuitem" type="button" onClick={() => { setIsProfileMenuOpen(false); navigate('/lathundar'); }} className={menuItem}>
                    <BookOpen size={18} className="text-ink-3" /> Lathundar
                  </button>
                  <button role="menuitem" type="button" onClick={() => { setIsProfileMenuOpen(false); setIsLathundOpen(true); }} className={menuItem}>
                    <BookMarked size={18} className="text-ink-3" /> Snabblathund
                  </button>
                  <button role="menuitem" type="button" onClick={handleCopyLink} className={menuItem}>
                    {copied ? <Check size={18} className="text-emerald-600" /> : <Link2 size={18} className="text-ink-3" />}
                    {copied ? 'Länken är kopierad' : 'Kopiera länk till elevprovet'}
                  </button>
                  <button role="menuitem" type="button" onClick={() => { setIsProfileMenuOpen(false); handleToggleFullscreen(); }} className={menuItem}>
                    <Maximize size={18} className="text-ink-3" /> Helskärm
                  </button>
                  <div className="my-1 border-t border-line" />
                </div>

                {[
                  { label: 'Min profil', icon: User, path: '/profil', show: true },
                  { label: 'Inspektörer', icon: Users, path: '/inspektorer', show: profile.role === 'admin' },
                ].filter(i => i.show).map(({ label, icon: Icon, path }) => (
                  <button
                    key={path}
                    role="menuitem"
                    type="button"
                    onClick={() => { setIsProfileMenuOpen(false); navigate(path); }}
                    className={menuItem}
                  >
                    <Icon size={18} className="text-ink-3" />
                    {label}
                  </button>
                ))}
                <div className="my-1 border-t border-line" />
                <button
                  role="menuitem"
                  type="button"
                  onClick={handleLogout}
                  className={`${menuItem} !text-red-600 dark:!text-red-400 font-semibold hover:!bg-red-50 dark:hover:!bg-red-950/40`}
                >
                  <LogOut size={18} />
                  Logga ut
                </button>
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
