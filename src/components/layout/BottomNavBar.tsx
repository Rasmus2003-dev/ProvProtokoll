import { NavLink } from 'react-router-dom';
import { motion } from 'motion/react';
import { Car, Laptop, History, Users, GraduationCap } from 'lucide-react';
import { triggerHaptic } from '../../lib/utils';

export function BottomNavBar() {
  const navItems = [
    { name: 'Körprov', path: '/korprov', icon: Car },
    { name: 'Register', path: '/elevregister', icon: Users },
    { name: 'Trafikskola', path: '/trafikskola', icon: GraduationCap },
    { name: 'Teoriprov', path: '/teoriprov', icon: Laptop },
    { name: 'Historik', path: '/historik', icon: History },
  ];

  return (
    <nav
      aria-label="Huvudmeny"
      className="w-full bg-surface/95 backdrop-blur-xl border-t border-line pb-safe z-50"
    >
      <div className="grid grid-cols-5 h-[64px] px-1 max-w-lg mx-auto">
        {navItems.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => triggerHaptic('light')}
              className={({ isActive }) =>
                `relative flex flex-col items-center justify-center gap-1 min-w-0 transition-colors ${
                  isActive ? 'text-navy dark:text-blue-300' : 'text-ink-3 hover:text-ink'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className="relative flex items-center justify-center w-14 h-8">
                    {isActive && (
                      <motion.span
                        layoutId="bottom-nav-pill"
                        className="absolute inset-0 rounded-full bg-navy/10 dark:bg-blue-400/15"
                        transition={{ type: 'spring', bounce: 0.18, duration: 0.45 }}
                      />
                    )}
                    <Icon className="relative w-[22px] h-[22px]" strokeWidth={isActive ? 2.4 : 1.9} />
                  </span>
                  <span className={`text-[11px] leading-none truncate max-w-full px-0.5 ${isActive ? 'font-semibold' : 'font-medium'}`}>
                    {item.name}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
