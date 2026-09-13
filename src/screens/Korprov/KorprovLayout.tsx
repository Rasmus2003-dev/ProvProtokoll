import React, { useState, useEffect, useMemo } from 'react';
import { Outlet, NavLink, useLocation, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { PenTool, X, Clock, Play, Square } from 'lucide-react';
import { useAppStore } from '../../store/ProvContext';
import { triggerHaptic } from '../../lib/utils';

const steps = [
  { id: '1', name: 'Start', path: 'start' },
  { id: '2', name: 'Egenskaper', path: 'egenskaper' },
  { id: '3', name: 'Inledning', path: 'inledning' },
  { id: '4', name: 'Körning', path: 'korning' },
  { id: '5', name: 'Resultat', path: 'resultat' },
  { id: '6', name: 'Protokoll', path: 'protokoll' },
];

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export function KorprovLayout() {
  const location = useLocation();
  const { state, updateState } = useAppStore();
  const [showNotes, setShowNotes] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  // Timer Effect
  useEffect(() => {
    let interval: any;
    if (state.testStartTime) {
      interval = setInterval(() => {
        setElapsed(Math.floor((Date.now() - state.testStartTime!) / 1000));
      }, 1000);
    } else {
      setElapsed(0);
    }
    return () => clearInterval(interval);
  }, [state.testStartTime]);

  // Mobile step calculation
  const activeStepIdx = useMemo(() => {
    const currentStep = steps.findIndex(s => location.pathname.endsWith(s.path));
    return currentStep >= 0 ? currentStep : 0;
  }, [location.pathname]);

  const activeStepName = useMemo(() => {
    return steps[activeStepIdx]?.name || 'Start';
  }, [activeStepIdx]);

  if (location.pathname === '/korprov' || location.pathname === '/korprov/') {
    return <Navigate to="start" replace />;
  }

  // Determine if we should show the secondary nav menu
  const isProtokoll = location.pathname.endsWith('protokoll');
  const isKorning = location.pathname.endsWith('korning');
  const showNav = !isProtokoll && !isKorning;

  const toggleTimer = () => {
    if (state.testStartTime) {
      // Stop timer
      updateState(s => ({ ...s, testStartTime: null }));
    } else {
      // Start timer
      updateState(s => ({ ...s, testStartTime: Date.now() }));
    }
  };

  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateState(s => ({ ...s, testNotes: e.target.value }));
  };

  return (
    <div className="max-w-7xl mx-auto py-4 md:py-8 w-full px-0 sm:px-4 print:py-0 print:m-0 print:max-w-none relative min-h-full">
      {/* Scrollable Navigation */}
      {showNav && (
        <div className="relative mb-4 md:mb-10 mt-1 md:mt-6 print:hidden select-none">
          
          {/* Mobile-Only Progress Stepper Dashboard Card */}
          <div className="block md:hidden px-4 mb-4">
            <div className="bg-white dark:bg-slate-900 border border-gray-200/80 dark:border-white/5 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest leading-none">
                    Steg {activeStepIdx + 1} av {steps.filter(s => s.name !== 'Protokoll').length}
                  </span>
                  <span className="text-sm font-black text-[#002F6C] dark:text-blue-400 mt-1 leading-none uppercase tracking-tight">
                    {activeStepName}
                  </span>
                </div>
                
                {/* Mobile Timer Badge inside Dashboard */}
                <button
                  onClick={() => { triggerHaptic('medium'); toggleTimer(); }}
                  className={`flex items-center gap-1.5 px-3 py-2.5 min-h-10 rounded-xl font-bold text-xs transition-all ${
                    state.testStartTime 
                      ? 'bg-red-50 text-red-600 border border-red-200 dark:bg-red-950/20 dark:border-red-900 dark:text-red-400' 
                      : 'bg-gray-100 text-gray-600 border border-transparent dark:bg-white/5 dark:text-gray-400'
                  }`}
                >
                  {state.testStartTime ? <Square size={10} className="fill-current animate-pulse text-red-600" /> : <Play size={10} className="fill-current" />}
                  <span className="font-mono text-sm font-black">{formatTime(elapsed)}</span>
                </button>
              </div>

              {/* Segmented Progress indicator dots */}
              <div className="flex gap-1.5 h-1.5 w-full bg-gray-100 dark:bg-slate-850 rounded-full overflow-hidden">
                {steps.filter(s => s.name !== 'Protokoll').map((step, idx) => (
                  <div 
                    key={step.id} 
                    className={`flex-1 h-full rounded-full transition-all duration-305 ${
                      idx <= activeStepIdx 
                        ? 'bg-[#D42220] dark:bg-blue-500' 
                        : 'bg-gray-200 dark:bg-slate-800'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Stepper Tabs Bar (Desktop-centered, Mobile-scrollable) */}
          <div className="relative overflow-x-auto hide-scrollbar pb-2">
            <div className="px-4 md:px-6 w-full flex items-center justify-between">
              <div className="flex gap-2 sm:gap-2.5 w-full justify-start md:justify-center min-w-max pb-1">
                {steps.filter(s => s.name !== 'Protokoll').map((step, idx) => (
                  <NavLink
                    key={step.id}
                    to={`/korprov/${step.path}`}
                    onClick={() => triggerHaptic('light')}
                    className={({ isActive }) =>
                      `text-xs sm:text-xs py-2 px-3.5 sm:px-4 rounded-xl transition-all duration-200 font-bold uppercase tracking-wider relative flex items-center gap-2 border-2 ${
                        isActive
                          ? 'bg-[#002F6C] dark:bg-blue-600 text-white border-[#002F6C] dark:border-blue-500 shadow-md font-black ring-2 ring-blue-500/20'
                          : idx < activeStepIdx
                            ? 'bg-emerald-50/60 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/50 hover:bg-emerald-100/60'
                            : 'bg-white dark:bg-slate-900 text-gray-600 dark:text-slate-300 border-gray-200 dark:border-slate-800 hover:border-gray-300 dark:hover:border-slate-700 hover:bg-gray-50'
                      }`
                    }
                  >
                    <span className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black bg-black/10 dark:bg-white/10 shrink-0">
                      {idx < activeStepIdx ? '✓' : idx + 1}
                    </span>
                    <span>{step.name}</span>
                  </NavLink>
                ))}
              </div>

              <div className="hidden md:flex ml-6 h-full items-center pb-1">
                 <button 
                    onClick={toggleTimer}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-2xs ${state.testStartTime ? 'bg-red-50 text-red-600 border border-red-200 dark:bg-red-950/40 dark:border-red-900 dark:text-red-400' : 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 border border-gray-200/60 dark:border-zinc-700 hover:bg-gray-200 dark:hover:bg-zinc-700'}`}
                 >
                   {state.testStartTime ? <Square size={13} className="fill-current text-red-600 animate-pulse" /> : <Play size={13} className="fill-current text-[#002f6c] dark:text-blue-400" />}
                   <span className="font-mono text-sm font-black">{formatTime(elapsed)}</span>
                 </button>
              </div>
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

      {/* Floating Notes Widget (Only shown during test) */}
      {showNav && (
        <div className="fixed bottom-20 right-4 sm:bottom-24 sm:right-6 md:bottom-12 md:right-12 z-40 print:hidden">
          <AnimatePresence>
            {showNotes && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute bottom-16 right-0 w-[calc(100vw-2rem)] max-w-sm sm:w-80 md:w-96 bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/10 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] overflow-hidden flex flex-col"
              >
                <div className="bg-[#002F6C] dark:bg-slate-950 p-4 flex items-center justify-between">
                  <div className="text-white text-sm font-bold flex items-center gap-2">
                    <PenTool size={16} /> Egna noteringar under provet
                  </div>
                  <button onClick={() => setShowNotes(false)} className="text-white/70 hover:text-white p-2 min-w-10 min-h-10 flex items-center justify-center transition-colors bg-white/10 hover:bg-white/20 rounded-full">
                    <X size={16} />
                  </button>
                </div>
                <div className="p-0 bg-yellow-50/30 dark:bg-yellow-900/5">
                  <textarea 
                    value={state.testNotes || ''}
                    onChange={handleNoteChange}
                    placeholder="Skriv dina privata noteringar här under körningen (sparas kontinuerligt)..." 
                    className="w-full h-48 text-sm bg-transparent border-0 focus:ring-0 resize-none p-4 block dark:text-gray-200 outline-none leading-relaxed placeholder:text-gray-400"
                    autoFocus
                  />
                  <div className="text-right px-4 pb-3 text-xs text-gray-400 italic">Sparades automatiskt</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="flex flex-col gap-3">
             {/* Mobile timer (only shown on small screens) */}
             <button 
                onClick={toggleTimer}
                className={`md:hidden w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg text-white font-mono text-sm font-bold ${state.testStartTime ? 'bg-red-600' : 'bg-gray-800 dark:bg-gray-700'}`}
             >
               {formatTime(elapsed)}
             </button>

            <button
              onClick={() => setShowNotes(!showNotes)}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg active:scale-95 text-white relative ${showNotes ? 'bg-[#D42220] scale-95' : 'bg-[#0052cc] hover:bg-[#0043a8]'}`}
              title="Snabbanteckning"
            >
              {state.testNotes && !showNotes && (
                 <span className="absolute top-0 right-0 w-4 h-4 bg-yellow-400 rounded-full border-2 border-[#0052cc]"></span>
              )}
              {showNotes ? <X size={24} /> : <PenTool size={24} />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
