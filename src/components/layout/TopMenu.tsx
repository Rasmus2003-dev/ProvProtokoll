import { NavLink } from 'react-router-dom';
import { useAppStore } from '../../store/ProvContext';
import { useEffect, useState } from 'react';

export function TopMenu() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

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

  const navItems = [
    { name: 'Körprov', path: '/korprov' },
    { name: 'Teoriprov', path: '/teoriprov' },
    { name: 'Historik', path: '/historik' },
    { name: 'Bedömningsprov', path: '/bedomningsprov' },
    { name: 'Profil', path: '/profil' },
  ];

  return (
    <header className="sticky top-0 z-50 px-2 sm:px-4 py-4 md:py-6">
      <div className="max-w-7xl mx-auto rounded-3xl glass shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/40 h-16 flex items-center justify-between px-3 sm:px-6">
        <div className="flex items-center gap-3 sm:gap-8 h-full min-w-0">
          <NavLink to="/" className="text-base sm:text-xl font-display font-bold tracking-tight text-primary flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-sm shrink-0">PP</div>
            <span className="hidden sm:inline">ProvProtokoll</span>
          </NavLink>
          <nav className="hidden md:flex h-full items-center gap-1">
            {navItems.map(item => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) => 
                  `px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive ? 'bg-primary/10 text-primary' : 'text-text-muted hover:text-text-main hover:bg-gray-100/80'
                  }`
                }
              >
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4 text-sm font-semibold shrink-0">
          {isOnline ? (
            <div className="flex items-center gap-1.5 text-success bg-success/10 px-2.5 sm:px-3 py-1.5 rounded-full border border-success/20">
              <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
              <span className="text-[11px] font-bold tracking-wider uppercase hidden sm:inline">Online</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-warning-dark bg-warning/10 px-2.5 sm:px-3 py-1.5 rounded-full border border-warning/20">
              <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
              <span className="text-[11px] font-bold tracking-wider uppercase text-amber-500 hidden sm:inline">Offline</span>
            </div>
          )}
        </div>
      </div>
      {/* Mobile nav */}
      <nav className="md:hidden mt-3 max-w-7xl mx-auto glass rounded-2xl border border-white/40 w-full overflow-x-auto flex p-2 text-sm drop-shadow-sm hide-scrollbar gap-1">
        {navItems.map(item => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `px-4 sm:px-5 py-2.5 min-h-10 rounded-xl font-semibold whitespace-nowrap transition-all flex-1 text-center flex items-center justify-center text-xs sm:text-sm ${
                isActive ? 'bg-primary text-white shadow-md' : 'text-text-muted hover:text-text-main'
              }`
            }
          >
            {item.name}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
