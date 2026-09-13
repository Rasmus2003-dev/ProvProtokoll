import { NavLink } from 'react-router-dom';
import { motion } from 'motion/react';
import { Car, Laptop, History, User, BookOpen, GraduationCap } from 'lucide-react';
import { triggerHaptic } from '../../lib/utils';

export function BottomNavBar() {
  const navItems = [
    { name: 'PROTOKOLL', path: '/korprov', icon: Car },
    { name: 'TRAFIKSKOLA', path: '/trafikskola', icon: GraduationCap },
    { name: 'TEORIPROV', path: '/teoriprov', icon: Laptop },
    { name: 'LATHUNDAR', path: '/lathundar', icon: BookOpen },
    { name: 'HISTORIK', path: '/historik', icon: History },
  ];

  return (
    <nav className="w-full bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-t border-gray-200/80 dark:border-slate-800 pb-safe z-50">
      <div className="flex items-center justify-around h-[60px] sm:h-[64px] px-0.5 sm:px-1 max-w-lg mx-auto">
        {navItems.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => triggerHaptic('light')}
              className={({ isActive }) => 
                `relative flex flex-col items-center justify-center w-full h-full transition-all duration-200 ${
                  isActive ? 'text-[#002f6c] dark:text-blue-400 font-bold' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="relative py-1.5 w-full min-h-10 flex flex-col items-center justify-center gap-0.5">
                    <div className={`p-1 rounded-xl transition-all ${isActive ? 'bg-blue-50 dark:bg-blue-950/50' : ''}`}>
                      <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px] text-[#002f6c] dark:text-blue-400 scale-110' : 'stroke-2'}`} />
                    </div>
                    <span className={`text-[8.5px] sm:text-[9.5px] tracking-[0.02em] sm:tracking-[0.06em] uppercase transition-all whitespace-nowrap ${isActive ? 'font-black text-[#002f6c] dark:text-blue-400' : 'font-semibold'}`}>
                      {item.name}
                    </span>
                    {isActive && (
                      <motion.div 
                        layoutId="nav-indicator-mobile"
                        className="absolute bottom-0 inset-x-3 h-0.5 bg-[#002f6c] dark:bg-blue-400 rounded-full"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                      />
                    )}
                  </div>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
