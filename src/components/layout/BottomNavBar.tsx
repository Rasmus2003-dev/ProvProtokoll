import { NavLink } from 'react-router-dom';
import { motion } from 'motion/react';

export function BottomNavBar() {
  const navItems = [
    { name: 'PROV', path: '/korprov' },
    { name: 'LEKTION', path: '/korlektion' },
    { name: 'BEDÖMNING', path: '/bedomningsprov' },
    { name: 'PROFIL', path: '/profil' },
  ];

  return (
    <nav className="w-full bg-white border-t border-border pb-safe z-50">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map(item => {
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => 
                `relative flex flex-col items-center justify-center w-full h-full transition-colors duration-200 ${
                  isActive ? 'text-primary' : 'text-text-muted hover:text-text-main'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="relative py-2 px-3">
                    <span className={`text-[12px] tracking-[0.06em] transition-all ${isActive ? 'font-bold' : 'font-medium'}`}>
                      {item.name}
                    </span>
                    {isActive && (
                      <motion.div 
                        layoutId="nav-indicator"
                        className="absolute inset-x-0 bottom-0 h-0.5 bg-primary rounded-none z-[1]"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
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
