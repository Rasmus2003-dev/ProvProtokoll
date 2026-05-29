import { Outlet, NavLink, useLocation, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

const steps = [
  { id: '1', name: 'Start', path: 'start' },
  { id: '2', name: 'Egenskaper', path: 'egenskaper' },
  { id: '3', name: 'Inledning', path: 'inledning' },
  { id: '4', name: 'Körning', path: 'korning' },
  { id: '5', name: 'Resultat', path: 'resultat' },
  { id: '6', name: 'Protokoll', path: 'protokoll' },
];

export function KorprovLayout() {
  const location = useLocation();

  if (location.pathname === '/korprov') {
    return <Navigate to="start" replace />;
  }

  // Determine if we should show the secondary nav menu
  const isProtokoll = location.pathname.endsWith('protokoll');
  const showNav = !isProtokoll;

  return (
    <div className="max-w-7xl mx-auto py-4 md:py-8 w-full px-0 sm:px-4 print:py-0 print:m-0 print:max-w-none">
      {/* Scrollable Navigation */}
      {showNav && (
        <div className="relative mb-4 md:mb-10 mt-3 md:mt-6 print:hidden overflow-x-auto hide-scrollbar pb-2 select-none">
          <div className="px-4 md:px-6 w-full">
            <div className="flex gap-4 md:gap-8 w-full justify-start md:justify-center min-w-max border-b border-gray-200 dark:border-white/5 pb-1">
              {steps.filter(s => s.name !== 'Protokoll').map((step) => (
                <NavLink
                  key={step.id}
                  to={step.path}
                  className={({ isActive }) =>
                    `text-[14.5px] md:text-[17px] pb-2.5 px-1 transition-all duration-150 border-b-2 font-bold uppercase tracking-wider relative ${
                      isActive
                        ? 'text-[#002F6C] dark:text-blue-400 border-[#c40000] scale-102 font-black'
                        : 'text-gray-400 dark:text-gray-500 border-transparent hover:text-gray-600 dark:hover:text-gray-400'
                    }`
                  }
                >
                  {step.name}
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      )}
      
      <div className="px-4 pb-20 sm:pb-24 sm:px-0 relative w-full overflow-hidden print:overflow-visible print:pb-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
