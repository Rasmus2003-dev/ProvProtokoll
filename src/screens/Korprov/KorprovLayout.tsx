import React, { useState, useEffect, useMemo } from 'react';
import { Outlet, NavLink, useLocation, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { PenTool, X, Play, Pause, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppStore } from '../../store/ProvContext';
import { triggerHaptic } from '../../lib/utils';
import { isTestStepPath } from '../../lib/activeTest';
import { useWakeLock } from '../../hooks/useWakeLock';
import { useRouteRecorder } from '../../hooks/useRouteRecorder';

const steps = [
  { id: '1', name: 'Start', path: 'start' },
  { id: '2', name: 'Egenskaper', path: 'egenskaper' },
  { id: '3', name: 'Inledning', path: 'inledning' },
  { id: '4', name: 'Körning', path: 'korning' },
  { id: '5', name: 'Resultat', path: 'resultat' },
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
  // Den flytande knappen (timer + anteckningar) kan fällas ihop så att den inte skymmer innehåll
  const [dockHidden, setDockHidden] = useState(() => {
    try { return localStorage.getItem('korprov-dock-hidden') === '1'; } catch { return false; }
  });
  const setDockHiddenPersist = (hidden: boolean) => {
    setDockHidden(hidden);
    if (hidden) setShowNotes(false);
    try { localStorage.setItem('korprov-dock-hidden', hidden ? '1' : '0'); } catch {}
  };

  // Timer Effect
  useEffect(() => {
    let interval: any;
    if (state.testStartTime) {
      const tick = () => setElapsed(Math.floor((Date.now() - state.testStartTime!) / 1000));
      tick();
      interval = setInterval(tick, 1000);
    } else {
      setElapsed(0);
    }
    return () => clearInterval(interval);
  }, [state.testStartTime]);

  // Kom ihåg var i provet inspektören är, så att provet kan återupptas
  // från startsidan om appen stängs eller kraschar.
  const onTestStep = isTestStepPath(location.pathname);
  useEffect(() => {
    if (!onTestStep) return;
    const step = location.pathname.replace(/\/+$/, '');
    updateState(s => (s.activeStep === step ? s : { ...s, activeStep: step }));
  }, [onTestStep, location.pathname, updateState]);

  // Håll skärmen tänd under provet och spela in körvägen när Navigator är igång
  useWakeLock(onTestStep);
  useRouteRecorder(Boolean(state.route?.recording), onTestStep, updateState);

  // Varna innan fliken/appen stängs eller laddas om mitt i ett prov
  useEffect(() => {
    if (!onTestStep) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [onTestStep]);

  const activeStepIdx = useMemo(() => {
    const currentStep = steps.findIndex(s => location.pathname.endsWith(s.path));
    return currentStep >= 0 ? currentStep : 0;
  }, [location.pathname]);

  if (location.pathname === '/korprov' || location.pathname === '/korprov/') {
    return <Navigate to="start" replace />;
  }

  // Körning och Protokoll har egna huvuden; Dagens prov är ett schema, inte ett steg
  const isProtokoll = location.pathname.endsWith('protokoll');
  const isKorning = location.pathname.endsWith('korning');
  const isResultat = location.pathname.endsWith('resultat');
  const isDagens = location.pathname.endsWith('dagens');
  const showNav = !isProtokoll && !isKorning && !isDagens;
  const timerRunning = Boolean(state.testStartTime);

  const toggleTimer = () => {
    triggerHaptic('medium');
    updateState(s => ({ ...s, testStartTime: s.testStartTime ? null : Date.now() }));
  };

  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateState(s => ({ ...s, testNotes: e.target.value }));
  };

  const timerButton = (
    <button
      type="button"
      onClick={toggleTimer}
      aria-label={timerRunning ? 'Pausa provtiden' : 'Starta provtiden'}
      className={`h-11 pl-3 pr-3.5 rounded-full flex items-center gap-2 font-semibold transition-colors cursor-pointer shrink-0 ${
        timerRunning
          ? 'bg-red-600 text-white shadow-[0_0_0_4px_rgb(220_38_38/0.15)]'
          : 'bg-surface text-ink border border-line hover:bg-surface-2'
      }`}
    >
      {timerRunning ? <Pause size={15} className="fill-current" /> : <Play size={15} className="fill-current text-navy dark:text-blue-400" />}
      <span className="tabular-nums text-[15px]">{formatTime(elapsed)}</span>
    </button>
  );

  return (
    <div className="max-w-7xl mx-auto pt-3 md:pt-6 w-full px-0 sm:px-4 print:py-0 print:m-0 print:max-w-none relative min-h-full">
      {/* Stegindikator: provets fem steg som en vägmarkering som fylls i */}
      {showNav && (
        <nav aria-label="Provets steg" className="px-4 sm:px-2 mb-5 md:mb-8 print:hidden select-none">
          <div className="flex items-center justify-between gap-3 mb-1">
            <p className="text-[13px] text-ink-2 font-medium">
              Steg <span className="text-ink font-semibold tabular-nums">{activeStepIdx + 1}</span> av {steps.length}
            </p>
            {timerButton}
          </div>

          <ol className="grid grid-cols-5 gap-1.5">
            {steps.map((step, idx) => {
              const done = idx < activeStepIdx;
              const current = idx === activeStepIdx;
              return (
                <li key={step.id} className="min-w-0">
                  <NavLink
                    to={`/korprov/${step.path}`}
                    onClick={() => triggerHaptic('light')}
                    aria-current={current ? 'step' : undefined}
                    className="group block pt-2 pb-1 rounded-[8px] cursor-pointer"
                  >
                    <span
                      data-state={done ? 'done' : current ? 'current' : 'todo'}
                      className={`block road-line ${current && timerRunning ? 'road-line-live' : ''}`}
                    />
                    <span
                      className={`mt-1.5 block text-[11px] sm:text-xs truncate transition-colors ${
                        current
                          ? 'text-ink font-semibold'
                          : done
                            ? 'text-ink-2 font-medium'
                            : 'text-ink-3 font-medium group-hover:text-ink-2'
                      }`}
                    >
                      {step.name}
                    </span>
                  </NavLink>
                </li>
              );
            })}
          </ol>
        </nav>
      )}

      {/* overflow-x-clip (inte hidden): en fast åtgärdsrad (position: sticky) måste kunna följa med vid scroll */}
      <div className="px-4 pb-28 md:pb-24 sm:px-0 relative w-full overflow-x-clip print:overflow-visible print:pb-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            // transitionEnd: ta bort transform efter övergången – annars blir
            // den "containing block" för position: fixed och modaler hamnar fel
            animate={{ opacity: 1, y: 0, transitionEnd: { transform: 'none' } }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="w-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Anteckningar (och timer under körning) – tillgängligt under provets alla moment */}
      {onTestStep && !isProtokoll && (
        <div className={`fixed right-3 sm:right-6 md:right-8 z-40 print:hidden ${
          // Resultat har en fast åtgärdsrad längst ner – lyft knapparna ovanför den
          isResultat || location.pathname.endsWith('egenskaper') || location.pathname.endsWith('inledning')
            ? 'bottom-[calc(148px+env(safe-area-inset-bottom))] md:bottom-28'
            : 'bottom-[calc(76px+env(safe-area-inset-bottom))] md:bottom-8'
        }`}>
          <AnimatePresence>
            {showNotes && (
              <motion.div
                initial={{ opacity: 0, y: 16, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 16, scale: 0.97 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="absolute bottom-[68px] right-0 w-[calc(100vw-1.5rem)] max-w-sm md:w-96 bg-surface border border-line rounded-card shadow-float overflow-hidden flex flex-col origin-bottom-right"
              >
                <div className="px-4 py-3 flex items-center justify-between border-b border-line">
                  <div className="text-[15px] font-semibold text-ink flex items-center gap-2">
                    <PenTool size={16} className="text-ink-3" /> Egna anteckningar
                  </div>
                  <button
                    onClick={() => setShowNotes(false)}
                    aria-label="Stäng anteckningar"
                    className="w-10 h-10 -mr-2 flex items-center justify-center text-ink-3 hover:text-ink rounded-full hover:bg-surface-2 transition-colors cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>
                <textarea
                  value={state.testNotes || ''}
                  onChange={handleNoteChange}
                  placeholder="Skriv privata anteckningar under provet. De sparas medan du skriver."
                  className="w-full h-48 text-[15px] bg-amber-50/40 dark:bg-amber-400/5 border-0 focus:ring-0 resize-none p-4 block text-ink outline-none leading-relaxed placeholder:text-ink-3"
                  autoFocus
                />
                <div className="px-4 py-2 text-xs text-ink-3 border-t border-line">Sparas automatiskt</div>
              </motion.div>
            )}
          </AnimatePresence>

          {dockHidden ? (
            // Ihopfälld: en smal flik vid kanten som tar nästan ingen plats
            <button
              type="button"
              onClick={() => setDockHiddenPersist(false)}
              aria-label="Visa timer och anteckningar"
              className="-mr-3 sm:-mr-6 md:-mr-8 h-12 pl-2.5 pr-2 rounded-l-full bg-surface/95 backdrop-blur-xl border border-r-0 border-line shadow-float flex items-center gap-1.5 text-ink-2 cursor-pointer"
            >
              <ChevronLeft size={18} />
              {timerRunning && <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" aria-hidden="true" />}
              {state.testNotes && !timerRunning && <span className="w-2 h-2 rounded-full bg-amber-400" aria-hidden="true" />}
            </button>
          ) : (
          <div className="flex items-center gap-1 p-1 rounded-full bg-surface/95 backdrop-blur-xl border border-line shadow-float">
            <button
              type="button"
              onClick={() => setDockHiddenPersist(true)}
              aria-label="Dölj timer och anteckningar"
              title="Dölj"
              className="w-9 h-12 flex items-center justify-center rounded-full text-ink-3 hover:text-ink cursor-pointer"
            >
              <ChevronRight size={18} />
            </button>
            {/* Under körning finns ingen stegrad – då sitter timern här */}
            {isKorning && timerButton}
            <button
              onClick={() => setShowNotes(!showNotes)}
              aria-label={showNotes ? 'Stäng anteckningar' : 'Öppna anteckningar'}
              aria-expanded={showNotes}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors active:scale-95 relative cursor-pointer ${
                showNotes ? 'bg-ink text-canvas' : 'bg-navy dark:bg-blue-600 text-white hover:bg-navy-deep'
              }`}
              title="Anteckningar"
            >
              {state.testNotes && !showNotes && (
                <span className="absolute top-1 right-1 w-3 h-3 bg-amber-400 rounded-full ring-2 ring-surface" />
              )}
              {showNotes ? <X size={20} /> : <PenTool size={20} />}
            </button>
          </div>
          )}
        </div>
      )}
    </div>
  );
}
