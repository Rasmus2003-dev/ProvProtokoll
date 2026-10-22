import { useEffect, useRef, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/ProvContext';
import { cn, triggerHaptic } from '../../lib/utils';
import { TEST_CONTENT, ALL_SAFETY_ITEMS } from '../../data/testContentCatalog';
import { AlertCircle, ShieldAlert, Search, X, Maximize, Minimize, BookOpen, Dice5, PenLine, ChevronRight } from 'lucide-react';
import { NavigatorPanel } from '../../components/route/NavigatorPanel';
import { EventDialog, EventDialogResult } from '../../components/route/EventDialog';
import { createDrivingEvent, withEvent } from '../../lib/drivingEvents';
import { DrivingEventKind } from '../../types';
import { LightSafetySuggestion } from './components/LightSafetySuggestion';
import { LIGHT_SAFETY_LICENSES } from '../../data/lightSafetyCheck';

import { toggleAppFullscreen, isCurrentlyFullscreen } from '../../lib/fullscreen';
import { LathundModal } from '../../components/LathundModal';
import { HeavySafetyQuestionModal } from './components/HeavySafetyQuestionModal';

const HEAVY_LICENSES = ['C1', 'C', 'C1E', 'CE', 'D1', 'D', 'D1E', 'DE'];

export function KorningScreen() {
  const navigate = useNavigate();
  const { state, updateState } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLathundOpen, setIsLathundOpen] = useState(false);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [filterMode, setFilterMode] = useState<'all' | 'tested' | 'untested'>('all');
  const [showFloatingBar, setShowFloatingBar] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleFs = () => setIsFullscreen(isCurrentlyFullscreen());
    document.addEventListener('fullscreenchange', handleFs);
    document.addEventListener('webkitfullscreenchange', handleFs);
    return () => {
      document.removeEventListener('fullscreenchange', handleFs);
      document.removeEventListener('webkitfullscreenchange', handleFs);
    };
  }, []);

  // Tangentbordsgenväg: tryck '/' för att söka moment, 'Esc' för att rensa
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === '/' &&
        document.activeElement !== searchInputRef.current &&
        !(document.activeElement instanceof HTMLInputElement) &&
        !(document.activeElement instanceof HTMLTextAreaElement)
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === 'Escape' && document.activeElement === searchInputRef.current) {
        setSearchTerm('');
        searchInputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Lyssna på scrollning för att visa en flytande surfplatte-bar längst ner
  useEffect(() => {
    const onScroll = () => {
      setShowFloatingBar(window.scrollY > 280);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleToggleFullscreen = () => {
    toggleAppFullscreen();
  };

  const licenseType = state.properties?.licenseType || 'B';
  const rawAvailableItems = TEST_CONTENT[licenseType] || TEST_CONTENT['B'];
  const isHeavy = HEAVY_LICENSES.includes(licenseType) || licenseType === 'BE';

  // Filter items if search or filter mode is active
  const filteredAvailableItems = useMemo(() => {
    let items = rawAvailableItems;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      items = items.filter(item => item.toLowerCase().includes(q));
    }
    if (filterMode === 'tested') {
      items = items.filter(item => (state.includedTestItems || []).includes(item));
    } else if (filterMode === 'untested') {
      items = items.filter(item => !(state.includedTestItems || []).includes(item));
    }
    return Array.from(new Set(items));
  }, [rawAvailableItems, searchTerm, filterMode, state.includedTestItems]);



  // For heavy licenses, safety items are split out into their own inspection area
  const selectedSafetyItems = isHeavy 
    ? filteredAvailableItems.filter(item => ALL_SAFETY_ITEMS.includes(item))
    : [];

  // For light licenses (B, TAXI, etc.), Säkerhetskontroll stays as a normal moment in the 3-column driving grid
  const baseDrivingItems = isHeavy
    ? filteredAvailableItems.filter(item => !ALL_SAFETY_ITEMS.includes(item))
    : filteredAvailableItems;
  
  // Dynamically split into 3 columns
  const colSize1 = Math.ceil(baseDrivingItems.length / 3);
  const colSize2 = Math.ceil((baseDrivingItems.length * 2) / 3);
  
  const column1 = baseDrivingItems.slice(0, colSize1);
  const column2 = baseDrivingItems.slice(colSize1, colSize2);
  const column3 = baseDrivingItems.slice(colSize2);
  
  const safeColSize1 = Math.ceil(selectedSafetyItems.length / 3);
  const safeColSize2 = Math.ceil((selectedSafetyItems.length * 2) / 3);
  
  const safetyCol1 = selectedSafetyItems.slice(0, safeColSize1);
  const safetyCol2 = selectedSafetyItems.slice(safeColSize1, safeColSize2);
  const safetyCol3 = selectedSafetyItems.slice(safeColSize2);

  // Clean up selected items when license type changes
  useEffect(() => {
    updateState((prev) => ({
      ...prev,
      includedTestItems: (prev.includedTestItems || []).filter(item => 
        rawAvailableItems.includes(item)
      )
    }));
  }, [licenseType, rawAvailableItems, updateState]);

  const handleNext = () => {
    navigate('/korprov/resultat');
  };

  const toggleItem = (item: string) => {
    updateState((prev) => {
      const items = prev.includedTestItems || [];
      const isCurrentlySelected = items.includes(item);
      
      return { 
        ...prev, 
        includedTestItems: isCurrentlySelected 
          ? items.filter(id => id !== item)
          : [...items, item]
      };
    });
  };

  const selectAll = () => {
    updateState((prev) => ({
      ...prev,
      includedTestItems: [...(rawAvailableItems || [])]
    }));
  };

  const clearAll = () => {
    updateState((prev) => ({
      ...prev,
      includedTestItems: []
    }));
  };

  // Markera/rensa bara säkerhetskontrollens egna moment, utan att röra
  // körmomenten i huvudrutnätet ovanför.
  const selectAllSafety = () => {
    updateState((prev) => {
      const items = new Set(prev.includedTestItems || []);
      selectedSafetyItems.forEach(item => items.add(item));
      return { ...prev, includedTestItems: Array.from(items) };
    });
  };

  const clearAllSafety = () => {
    updateState((prev) => ({
      ...prev,
      includedTestItems: (prev.includedTestItems || []).filter(item => !selectedSafetyItems.includes(item))
    }));
  };

  // Ingripande öppnar en snabbval-ruta för situationen medan den är färsk i minnet
  const setIntervention = () => {
    setDialog({ kind: 'ingripande', mode: 'intervention' });
  };

  const setAborted = () => {
    updateState((prev) => ({
      ...prev,
      result: {
        ...(prev.result || {}),
        testAborted: !(prev.result?.testAborted),
        drivingResult: !(prev.result?.testAborted) ? 'Underkänt' : prev.result?.drivingResult
      }
    }));
  };


  const safetyCheckResultRelevant = HEAVY_LICENSES.includes(licenseType) || licenseType === 'BE';

  // Count only driving moments here; safety items have their own section below
  const drivingItemsAll = isHeavy ? rawAvailableItems.filter(item => !ALL_SAFETY_ITEMS.includes(item)) : rawAvailableItems;
  const selectedDrivingCount = drivingItemsAll.filter(item => (state.includedTestItems || []).includes(item)).length;
  const drivingProgress = drivingItemsAll.length > 0 ? Math.round((selectedDrivingCount / drivingItemsAll.length) * 100) : 0;
  const todayLabel = new Date().toLocaleDateString('sv-SE', { weekday: 'short', day: 'numeric', month: 'short' });

  // --- Händelser: brist / ingripande / notering (med plats om Navigator spelar in) ---
  type DialogState = { kind: DrivingEventKind; situation?: string; mode: 'mark' | 'intervention' } | null;
  const [dialog, setDialog] = useState<DialogState>(null);

  // Provade moment först, sedan övriga moment för behörigheten
  const dialogSituations = Array.from(new Set([...(state.includedTestItems || []), ...rawAvailableItems]));
  const eventCountBySituation = (state.events || []).reduce<Record<string, number>>((acc, ev) => {
    if (ev.situation) acc[ev.situation] = (acc[ev.situation] || 0) + 1;
    return acc;
  }, {});
  const interventionCount = (state.events || []).filter(e => e.kind === 'ingripande').length;

  const handleDialogSave = ({ kind, situation, note }: EventDialogResult) => {
    const event = createDrivingEvent(kind, situation, note);
    updateState((prev) => {
      let next = withEvent(prev, event);
      // Det som hände i ett moment betyder att momentet provats
      if (situation && rawAvailableItems.includes(situation) && !(next.includedTestItems || []).includes(situation)) {
        next = { ...next, includedTestItems: [...(next.includedTestItems || []), situation] };
      }
      if (kind === 'ingripande') {
        const current = next.result?.interventionSituations || [];
        next = {
          ...next,
          result: {
            ...next.result,
            interventionOccurred: true,
            interventionSituations: situation && !current.includes(situation) ? [...current, situation] : current,
          },
        };
      }
      return next;
    });
    setDialog(null);
  };

  const undoIntervention = () => {
    updateState((prev) => ({
      ...prev,
      events: (prev.events || []).filter(e => e.kind !== 'ingripande'),
      result: { ...prev.result, interventionOccurred: false, interventionSituations: [] },
    }));
    setDialog(null);
  };

  // Håll inne ett moment (touch) för att skriva en anteckning – pennan syns bara vid hovring
  const longPressTimer = useRef<number | null>(null);
  const longPressFired = useRef(false);
  const startLongPress = (item: string) => {
    longPressFired.current = false;
    longPressTimer.current = window.setTimeout(() => {
      longPressFired.current = true;
      navigator.vibrate?.(15);
      setDialog({ kind: 'notering', situation: item, mode: 'mark' });
    }, 550);
  };
  const cancelLongPress = () => {
    if (longPressTimer.current) window.clearTimeout(longPressTimer.current);
    longPressTimer.current = null;
  };

  const renderItemButton = (item: string, customKey?: string) => {
    const isSelected = (state.includedTestItems || []).includes(item);
    const noteCount = eventCountBySituation[item] || 0;
    return (
      <div key={customKey || item} className="relative flex group">
      <button
        onClick={() => {
          // Ett långt tryck öppnade anteckningen – bocka inte i/ur momentet
          if (longPressFired.current) { longPressFired.current = false; return; }
          toggleItem(item);
        }}
        onPointerDown={() => startLongPress(item)}
        onPointerUp={cancelLongPress}
        onPointerLeave={cancelLongPress}
        onPointerCancel={cancelLongPress}
        onContextMenu={(e) => e.preventDefault()}
        type="button"
        className={cn(
          "flex items-center gap-3 py-2.5 pl-3.5 pr-10 text-left cursor-pointer transition-all duration-150 w-full outline-none select-none rounded-lg border border-l-4 active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-blue-500/40",
          isSelected
            ? "border-slate-300 border-l-[#002f6c] dark:border-slate-600 dark:border-l-blue-500 text-slate-950 dark:text-white bg-blue-50/60 dark:bg-blue-950/30 shadow-xs"
            : "border-slate-200/90 border-l-slate-200/90 dark:border-slate-800 dark:border-l-slate-800 text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900/90 hover:border-slate-300 hover:border-l-slate-300 hover:bg-slate-50/50"
        )}
        style={{ minHeight: '44px' }}
      >
        {/* Moderniserad förfinad checkruta med mjukare rundning och distinkt snäpp */}
        <div className={cn(
          "w-5 h-5 flex flex-shrink-0 items-center justify-center rounded-md border transition-all duration-200 shadow-2xs",
          isSelected 
            ? "bg-[#002f6c] dark:bg-blue-600 border-[#002f6c] dark:border-blue-500 text-white shadow-sm shadow-blue-950/20 scale-[1.04]" 
            : "bg-slate-50/80 dark:bg-slate-800 border-slate-300 dark:border-slate-600 hover:border-slate-400 group-hover:bg-white"
        )}>
          {isSelected && (
            <svg 
              className="w-3.5 h-3.5 stroke-[3px] animate-in zoom-in-75 duration-100" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          )}
        </div>
        <span className={cn(
          "text-[13.5px] sm:text-[14px] tracking-tight leading-snug transition-colors",
          isSelected ? "font-semibold text-slate-950 dark:text-white" : "font-normal text-slate-700 dark:text-slate-300"
        )}>
          {item}
        </span>
      </button>
      {/* Anteckning: diskret räknare om det finns anteckningar, annars penna bara vid hovring/fokus */}
      <button
        type="button"
        onClick={() => setDialog({ kind: 'notering', situation: item, mode: 'mark' })}
        className={cn(
          "absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer",
          noteCount > 0
            ? "opacity-100"
            : "opacity-0 pointer-events-none [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:group-hover:pointer-events-auto focus-visible:opacity-100 focus-visible:pointer-events-auto text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
        )}
        title={noteCount > 0 ? `${noteCount} anteckning${noteCount > 1 ? 'ar' : ''} – lägg till fler` : `Anteckning: ${item} (eller håll inne momentet)`}
        aria-label={`Anteckning för ${item}`}
      >
        {noteCount > 0 ? (
          <span className="min-w-5 h-5 px-1.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-bold flex items-center justify-center">
            {noteCount}
          </span>
        ) : (
          <PenLine size={14} />
        )}
      </button>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto pb-24 sm:pb-8 px-2 lg:px-4 space-y-6">
      
      {/* Surfplatte-Header för Körning */}
      <div className="flex flex-col items-center justify-center pt-1 pb-3 relative">
        <div className="absolute left-2 top-2 text-[11px] font-semibold text-gray-400 dark:text-zinc-500 hidden sm:block capitalize">
          {todayLabel}
        </div>

        {/* Fullscreen Quick Toggle in top right */}
        <button
          onClick={handleToggleFullscreen}
          className="absolute right-2 top-2 p-1.5 rounded-lg border border-gray-200 dark:border-zinc-800 text-gray-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1 text-[11px] font-bold cursor-pointer print:hidden active:scale-95"
          title={isFullscreen ? "Avsluta fullskärm" : "Fullskärmsläge (Surfplatta)"}
        >
          {isFullscreen ? <Minimize size={14} className="text-blue-600 dark:text-blue-400" /> : <Maximize size={14} />}
          <span className="hidden md:inline">{isFullscreen ? 'Avsluta' : 'Fullskärm'}</span>
        </button>


        {/* Ren textnavigering: Start  Egenskaper  Inledning  Körning  Resultat */}
        <div className="w-full overflow-x-auto hide-scrollbar flex items-center justify-start sm:justify-center gap-4 sm:gap-10 text-xs sm:text-base font-normal text-gray-400 dark:text-zinc-500 select-none pt-1 pl-2 pr-12">
          <button onClick={() => navigate('/korprov/start')} className="hover:text-gray-700 dark:hover:text-zinc-300 transition-colors whitespace-nowrap">Start</button>
          <button onClick={() => navigate('/korprov/egenskaper')} className="hover:text-gray-700 dark:hover:text-zinc-300 transition-colors whitespace-nowrap">Egenskaper</button>
          <button onClick={() => navigate('/korprov/inledning')} className="hover:text-gray-700 dark:hover:text-zinc-300 transition-colors whitespace-nowrap">Inledning</button>
          <span className="text-gray-950 dark:text-white font-semibold border-b-2 border-[#002f6c] dark:border-blue-400 pb-0.5 whitespace-nowrap">Körning</span>
          <button onClick={() => navigate('/korprov/resultat')} className="hover:text-gray-700 dark:hover:text-zinc-300 transition-colors whitespace-nowrap">Resultat</button>
        </div>
      </div>

      {/* Snabblänk / Varningar (Ingripande & Avbrutet prov) diskret och funktionellt anpassat för inspektören */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-b border-gray-100 dark:border-zinc-800 pb-3">
        <div className="flex items-center gap-3">
          <div className="text-xs sm:text-sm text-gray-600 dark:text-zinc-400 font-medium">
            Kandidat: <strong className="text-gray-950 dark:text-white font-bold">{state.properties.studentName || 'Förnamn Efternamn'}</strong>
            <span className="ml-2 px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200">
              {state.properties.testType?.includes('Bedömningsprov') ? `Bedömningsprov (${licenseType})` : licenseType}
            </span>
          </div>

          {/* Momenträknare med förloppsindikator för inspektören */}
          {state.properties?.testType !== 'Omprov säkerhetskontroll' && (
            <div className="hidden sm:flex items-center gap-2.5 px-2.5 py-1.5 rounded-md bg-gray-100 dark:bg-zinc-800/60 text-xs font-semibold text-gray-700 dark:text-zinc-300">
              <span>
                <span className="font-bold text-[#002f6c] dark:text-blue-400">{selectedDrivingCount}</span>
                <span className="text-gray-400"> / </span>
                {drivingItemsAll.length} provade moment
              </span>
              <div className="w-20 h-1.5 rounded-full bg-gray-200 dark:bg-zinc-700 overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#002f6c] dark:bg-blue-500 transition-all duration-300"
                  style={{ width: `${drivingProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Diskret indikator när GPS spelar in – klick hoppar ner till Navigator */}
          {state.route?.recording && (
            <button
              type="button"
              onClick={() => document.getElementById('navigator')?.scrollIntoView({ behavior: 'smooth' })}
              className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-red-50 dark:bg-red-950/40 text-[11px] font-bold text-red-700 dark:text-red-400 cursor-pointer"
              title="Navigator spelar in – visa"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" /> GPS
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsLathundOpen(true)}
            className="h-9 px-3 rounded-control border border-line bg-surface text-ink-2 hover:text-ink hover:bg-surface-2 text-[13px] font-medium transition-colors cursor-pointer flex items-center gap-1.5 select-none"
            title={`Lathund för ${licenseType}`}
          >
            <BookOpen size={15} className="text-ink-3" />
            <span>Lathund</span>
          </button>

          <button
            type="button"
            onClick={() => setIsQuestionModalOpen(true)}
            className="h-9 px-3 rounded-control border border-line bg-surface text-ink-2 hover:text-ink hover:bg-surface-2 text-[13px] font-medium transition-colors cursor-pointer flex items-center gap-1.5 select-none"
            title={`Slumpa en funktionsfråga för ${licenseType}`}
          >
            <Dice5 size={15} className="text-ink-3" />
            <span>Funktionsfråga</span>
          </button>

          <button
            type="button"
            onClick={setIntervention}
            className={cn(
              "h-9 px-3 rounded-control border text-[13px] font-medium transition-colors cursor-pointer flex items-center gap-1.5 select-none",
              state.result?.interventionOccurred
                ? "bg-amber-50 text-amber-900 border-amber-300 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-800"
                : "bg-surface text-ink-2 border-line hover:text-ink hover:bg-surface-2"
            )}
          >
            <AlertCircle size={15} className={state.result?.interventionOccurred ? "text-amber-700 dark:text-amber-300" : "text-ink-3"} />
            <span>
              {state.result?.interventionOccurred ? '+ Ingripande' : 'Ingripande'}
              {interventionCount > 0 && ` (${interventionCount})`}
            </span>
          </button>
          
          <button
            type="button"
            onClick={setAborted}
            className={cn(
              "h-9 px-3 rounded-control border text-[13px] font-medium transition-colors cursor-pointer flex items-center gap-1.5 select-none",
              state.result?.testAborted
                ? "bg-red-50 text-red-900 border-red-300 dark:bg-red-950/40 dark:text-red-200 dark:border-red-800"
                : "bg-surface text-ink-2 border-line hover:text-ink hover:bg-surface-2"
            )}
          >
            <ShieldAlert size={15} className={state.result?.testAborted ? "text-red-700 dark:text-red-300" : "text-ink-3"} />
            <span>{state.result?.testAborted ? 'Avbrutet ✓' : 'Avbryt provet'}</span>
          </button>
        </div>
      </div>

      {/* Förslag till säkerhetskontroll – lätta fordon */}
      {LIGHT_SAFETY_LICENSES.includes(licenseType) && state.properties?.testType !== 'Omprov körning' && (
        <LightSafetySuggestion />
      )}

      {/* Sök & Snabbfilter bland momenten */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Sök moment..."
            className="w-full h-11 pl-10 pr-14 text-sm rounded-control border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:border-[#002f6c] dark:focus:border-blue-500 transition-colors shadow-2xs"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {searchTerm ? (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-slate-800 cursor-pointer"
                aria-label="Rensa sökning"
              >
                <X size={15} />
              </button>
            ) : (
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[11px] tabular-nums text-gray-400 bg-gray-100 dark:bg-slate-800 rounded border border-gray-200 dark:border-slate-700 select-none pointer-events-none">
                /
              </kbd>
            )}
          </div>
        </div>

        {/* Filter-flikar: Alla / Provade / Kvar */}
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-slate-800/80 p-1 rounded-control border border-gray-200/80 dark:border-slate-700 shrink-0 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => { triggerHaptic('light'); setFilterMode('all'); }}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
              filterMode === 'all'
                ? "bg-white dark:bg-slate-900 text-[#002f6c] dark:text-blue-400 shadow-2xs font-bold"
                : "text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white"
            )}
          >
            Alla ({drivingItemsAll.length})
          </button>
          <button
            type="button"
            onClick={() => { triggerHaptic('light'); setFilterMode('tested'); }}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5",
              filterMode === 'tested'
                ? "bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-2xs font-bold"
                : "text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white"
            )}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Provade ({selectedDrivingCount})</span>
          </button>
          <button
            type="button"
            onClick={() => { triggerHaptic('light'); setFilterMode('untested'); }}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5",
              filterMode === 'untested'
                ? "bg-white dark:bg-slate-900 text-amber-700 dark:text-amber-400 shadow-2xs font-bold"
                : "text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white"
            )}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Kvar ({drivingItemsAll.length - selectedDrivingCount})</span>
          </button>
        </div>
      </div>

      {searchTerm.trim() && baseDrivingItems.length === 0 && selectedSafetyItems.length === 0 && (
        <p className="text-sm text-gray-500 dark:text-slate-400 text-center py-4">Inga moment matchar "{searchTerm}".</p>
      )}

      {filterMode === 'tested' && selectedDrivingCount === 0 && (
        <div className="text-center py-8 px-4 bg-gray-50 dark:bg-slate-800/30 rounded-card border border-dashed border-gray-200 dark:border-slate-800">
          <p className="text-sm font-semibold text-gray-600 dark:text-slate-300">Inga moment markerade ännu.</p>
          <p className="text-xs text-gray-400 mt-1">Klicka på ett moment för att bocka av det under körningen.</p>
        </div>
      )}

      {filterMode === 'untested' && (drivingItemsAll.length - selectedDrivingCount) === 0 && (
        <div className="text-center py-8 px-4 bg-emerald-50/60 dark:bg-emerald-950/20 rounded-card border border-emerald-200/80 dark:border-emerald-800/50">
          <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300">Alla moment har prövats!</p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">Samtliga moment för {licenseType} är avbockade.</p>
        </div>
      )}

      {/* RENT 3-KOLUMNERS RUTNÄT */}
      {state.properties?.testType !== 'Omprov säkerhetskontroll' && (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 lg:gap-x-8 gap-y-2.5 pt-2">

        {/* Kolumn 1 (10 moment) */}
        <div className="flex flex-col gap-2.5">
          {column1.map((item, idx) => renderItemButton(item, `btn-col1-${item}-${idx}`))}
        </div>

        {/* Kolumn 2 (10 moment) */}
        <div className="flex flex-col gap-2.5">
          {column2.map((item, idx) => renderItemButton(item, `btn-col2-${item}-${idx}`))}
        </div>

        {/* Kolumn 3 (9 moment) */}
        <div className="flex flex-col gap-2.5">
          {column3.map((item, idx) => renderItemButton(item, `btn-col3-${item}-${idx}`))}
        </div>

      </div>
      )}

      {/* Safety CheckPoints Section (Längst ner) */}
      {selectedSafetyItems.length > 0 && state.properties?.testType !== 'Omprov körning' && (
        <div className="pt-10 border-t border-gray-100 dark:border-white/5 mt-12 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  Säkerhetskontroll
                </h3>
                {HEAVY_LICENSES.includes(licenseType) && (
                  <span className="text-[11px] font-medium text-ink-3 px-2 py-0.5 rounded-md border border-line">
                    Tung behörighet
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                Bocka i det ni gått igenom i säkerhetskontrollen.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={clearAllSafety}
                className="h-9 px-3 rounded-control text-[13px] font-medium text-ink-2 hover:text-ink hover:bg-surface-2 transition-colors cursor-pointer"
              >
                Rensa
              </button>
              <button
                type="button"
                onClick={selectAllSafety}
                className="h-9 px-3 rounded-control border border-line text-[13px] font-medium text-ink-2 hover:text-ink hover:bg-surface-2 transition-colors cursor-pointer"
              >
                Markera alla
              </button>
              <button
                type="button"
                onClick={() => setIsQuestionModalOpen(true)}
                className="h-9 px-3 rounded-control border border-line bg-surface text-[13px] font-medium text-ink hover:bg-surface-2 transition-colors cursor-pointer flex items-center gap-1.5"
                title={`Slumpa en funktionsfråga för ${licenseType}`}
              >
                <Dice5 size={15} className="text-ink-3" />
                Ställ en funktionsfråga
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 lg:gap-x-12 gap-y-3">
            {/* Column 1 */}
            <div className="flex flex-col gap-3">
              {safetyCol1.map((item, idx) => renderItemButton(item, `btn-safe1-${item}-${idx}`))}
            </div>

            {/* Column 2 */}
            <div className="flex flex-col gap-3">
              {safetyCol2.map((item, idx) => renderItemButton(item, `btn-safe2-${item}-${idx}`))}
            </div>

            {/* Column 3 */}
            <div className="flex flex-col gap-3">
              {safetyCol3.map((item, idx) => renderItemButton(item, `btn-safe3-${item}-${idx}`))}
            </div>
          </div>

          {safetyCheckResultRelevant && (
            <p className="text-[13px] text-ink-3 pt-2">
              Resultatet för säkerhetskontrollen sätter du under Resultat.
            </p>
          )}
        </div>
      )}

      {/* Navigator (GPS): diskret längst ner – fälls ut vid behov */}
      {state.properties?.testType !== 'Omprov säkerhetskontroll' && (
        <div id="navigator" className="pt-6 scroll-mt-4">
          <NavigatorPanel onMark={(kind) => setDialog({ kind, mode: kind === 'ingripande' ? 'intervention' : 'mark' })} />
        </div>
      )}

      {/* Sidfot: en tydlig väg vidare, inget mer */}
      <div className="flex items-center justify-between gap-4 pt-8 border-t border-line mt-10 print:hidden">
        <button
          type="button"
          onClick={() => { if (window.confirm('Ta bort alla bockar i momenten?')) clearAll(); }}
          className="h-10 px-2 text-[13px] font-medium text-ink-3 hover:text-red-600 dark:hover:text-red-400 cursor-pointer"
        >
          Nollställ moment
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="h-12 px-6 rounded-control bg-navy hover:bg-navy-deep dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-semibold text-[15px] flex items-center gap-1.5 cursor-pointer transition-colors active:scale-[0.98]"
        >
          Fortsätt till resultat
          <ChevronRight size={18} />
        </button>
      </div>
      <EventDialog
        open={dialog !== null}
        title={
          dialog?.mode === 'intervention'
            ? (state.result?.interventionOccurred ? 'Nytt ingripande' : 'Ingripande')
            : dialog?.situation ? `Anteckning – ${dialog.situation}` : 'Markera händelse'
        }
        description={dialog?.mode === 'intervention' ? 'I vilken situation skedde ingripandet?' : undefined}
        situations={dialogSituations}
        initialKind={dialog?.kind}
        initialSituation={dialog?.situation}
        kinds={dialog?.mode === 'intervention' ? ['ingripande'] : ['brist', 'notering']}
        saveLabel={dialog?.mode === 'intervention' ? 'Registrera ingripande' : 'Spara'}
        secondaryAction={
          dialog?.mode === 'intervention' && state.result?.interventionOccurred
            ? { label: 'Ångra alla ingripanden', onClick: undoIntervention }
            : undefined
        }
        onSave={handleDialogSave}
        onClose={() => setDialog(null)}
      />

      {/* Lathund Modal */}
      <LathundModal
        isOpen={isLathundOpen}
        onClose={() => setIsLathundOpen(false)}
        defaultLicense={licenseType}
      />

      {/* Slumpad säkerhetsfråga modal för alla behörigheter */}
      <HeavySafetyQuestionModal
        isOpen={isQuestionModalOpen}
        onClose={() => setIsQuestionModalOpen(false)}
        licenseType={licenseType}
      />

      {/* Flytande snabbmeny för surfplatta & mobil vid skrollning */}
      {showFloatingBar && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 max-w-xl w-[calc(100vw-2rem)] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-gray-200 dark:border-slate-800 shadow-xl rounded-card p-2.5 flex items-center justify-between gap-3 animate-in slide-in-from-bottom-5 duration-200 print:hidden">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-xs font-bold bg-[#002f6c] dark:bg-blue-600 text-white px-2 py-1 rounded-md shrink-0">
              {licenseType}
            </span>
            <div className="min-w-0">
              <div className="text-xs font-bold text-gray-900 dark:text-white truncate">
                {selectedDrivingCount}/{drivingItemsAll.length} moment ({drivingProgress}%)
              </div>
              {interventionCount > 0 && (
                <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                  {interventionCount} ingripande{interventionCount > 1 ? 'n' : ''}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => { triggerHaptic('medium'); handleNext(); }}
              className="px-4 py-2 bg-[#002f6c] hover:bg-[#00204a] dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-xs font-bold rounded-control shadow-md cursor-pointer flex items-center gap-1.5 active:scale-95 transition-all"
            >
              <span>Resultat</span>
              <span>→</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
