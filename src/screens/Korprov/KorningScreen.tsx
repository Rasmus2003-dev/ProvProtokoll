import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { useAppStore } from '../../store/ProvContext';
import { cn } from '../../lib/utils';
import { TEST_CONTENT, ALL_SAFETY_ITEMS } from '../../data/testContentCatalog';
import { AlertCircle, ShieldAlert, Search, X, Bus, Maximize, Minimize, BookOpen } from 'lucide-react';
import { FailureForm } from './components/FailureForm';

import { AppLogo } from '../../components/icons/AppLogo';
import { toggleAppFullscreen, isCurrentlyFullscreen } from '../../lib/fullscreen';
import { LathundModal } from '../../components/LathundModal';

const HEAVY_LICENSES = ['C1', 'C', 'C1E', 'CE', 'D1', 'D', 'D1E', 'DE'];

export function KorningScreen() {
  const navigate = useNavigate();
  const { state, updateState } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLathundOpen, setIsLathundOpen] = useState(false);

  useEffect(() => {
    const handleFs = () => setIsFullscreen(isCurrentlyFullscreen());
    document.addEventListener('fullscreenchange', handleFs);
    document.addEventListener('webkitfullscreenchange', handleFs);
    return () => {
      document.removeEventListener('fullscreenchange', handleFs);
      document.removeEventListener('webkitfullscreenchange', handleFs);
    };
  }, []);

  const handleToggleFullscreen = () => {
    toggleAppFullscreen();
  };

  const licenseType = state.properties?.licenseType || 'B';
  const rawAvailableItems = TEST_CONTENT[licenseType] || TEST_CONTENT['B'];
  const isHeavy = ['C1', 'C', 'C1E', 'CE', 'D1', 'D', 'D1E', 'DE', 'BE', 'B96'].includes(licenseType);

  // Filter items if search is active
  const filteredAvailableItems = Array.from(
    new Set(
      searchTerm.trim() 
        ? rawAvailableItems.filter(item => item.toLowerCase().includes(searchTerm.toLowerCase().trim()))
        : rawAvailableItems
    )
  );



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

  const setIntervention = () => {
    updateState((prev) => ({
      ...prev,
      result: {
        ...(prev.result || {}),
        interventionOccurred: !(prev.result?.interventionOccurred)
      }
    }));
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

  const setSafetyCheckResult = (value: 'Godkänt' | 'Underkänt' | '-') => {
    updateState((prev) => ({
      ...prev,
      result: {
        ...(prev.result || {}),
        safetyCheckResult: value,
        ...(value === 'Underkänt' ? {
          safetyCheckFailure: {
            primaryCause: prev.result?.safetyCheckFailure?.primaryCause?.area 
              ? prev.result.safetyCheckFailure.primaryCause 
              : { area: 'Fordonskännedom', deficiencies: [] },
            consequences: prev.result?.safetyCheckFailure?.consequences || [],
            situations: prev.result?.safetyCheckFailure?.situations || [],
            interventionOccurred: false,
            testAborted: false,
          }
        } : {
          safetyCheckFailure: {
            primaryCause: { area: '', deficiencies: [] },
            consequences: [],
            situations: [],
            interventionOccurred: false,
            testAborted: false,
          }
        })
      }
    }));
  };

  const safetyCheckResultRelevant = !HEAVY_LICENSES.includes(licenseType) && ['B', 'B96', 'BE', 'Lokförare'].includes(licenseType);

  const renderItemButton = (item: string, customKey?: string) => {
    const isSelected = (state.includedTestItems || []).includes(item);
    return (
      <button 
        key={customKey || item} 
        onClick={() => toggleItem(item)}
        type="button"
        className={cn(
          "flex items-center gap-3 py-2.5 px-3.5 text-left cursor-pointer transition-all duration-150 w-full outline-none select-none rounded-lg border",
          isSelected 
            ? "border-slate-800 dark:border-slate-300 text-slate-950 dark:text-white bg-slate-50/80 dark:bg-slate-800/60 shadow-xs ring-1 ring-slate-800/10 dark:ring-white/10" 
            : "border-slate-200/90 dark:border-slate-800 text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900/90 hover:border-slate-300 hover:bg-slate-50/50"
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
    );
  };

  return (
    <div className="max-w-7xl mx-auto pb-24 sm:pb-8 px-2 lg:px-4 space-y-6">
      
      {/* Surfplatte-Header för Körning */}
      <div className="flex flex-col items-center justify-center pt-1 pb-3 relative">
        <div className="absolute left-2 top-2 text-xs font-bold text-gray-400 dark:text-zinc-500 font-mono hidden sm:block">
          {new Date().getDate()}
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

        {/* Centrerad ProvProtokoll logga för surfplattan */}
        <div className="flex flex-col items-center justify-center -mt-2 mb-2 select-none">
          <AppLogo variant="provprotokoll" size="md" />
        </div>

        {/* Ren textnavigering: Start  Egenskaper  Inledning  Körning  Resultat */}
        <div className="flex items-center justify-center gap-6 sm:gap-10 text-sm sm:text-base font-normal text-gray-400 dark:text-zinc-500 select-none pt-1">
          <button onClick={() => navigate('/korprov/start')} className="hover:text-gray-700 dark:hover:text-zinc-300 transition-colors">Start</button>
          <button onClick={() => navigate('/korprov/egenskaper')} className="hover:text-gray-700 dark:hover:text-zinc-300 transition-colors">Egenskaper</button>
          <button onClick={() => navigate('/korprov/inledning')} className="hover:text-gray-700 dark:hover:text-zinc-300 transition-colors">Inledning</button>
          <span className="text-gray-950 dark:text-white font-medium border-b-2 border-gray-900 dark:border-white pb-0.5">Körning</span>
          <button onClick={() => navigate('/korprov/resultat')} className="hover:text-gray-700 dark:hover:text-zinc-300 transition-colors">Resultat</button>
        </div>
      </div>

      {/* Snabblänk / Varningar (Ingripande & Avbrutet prov) diskret och funktionellt anpassat för inspektören */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-b border-gray-100 dark:border-zinc-800 pb-3">
        <div className="flex items-center gap-3">
          <div className="text-xs sm:text-sm text-gray-600 dark:text-zinc-400 font-medium">
            Kandidat: <strong className="text-gray-950 dark:text-white font-bold">{state.properties.studentName || 'Förnamn Efternamn'}</strong>
            <span className="ml-2 px-2 py-0.5 rounded text-[11px] font-black bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200">
              {state.properties.testType?.includes('Bedömningsprov') ? `Bedömningsprov (${licenseType})` : licenseType}
            </span>
          </div>

          {/* Momenträknare för inspektören */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-100 dark:bg-zinc-800/60 text-xs font-semibold text-gray-700 dark:text-zinc-300">
            <span className="font-bold text-[#c40000] dark:text-red-400">
              {(state.includedTestItems || []).length}
            </span>
            <span className="text-gray-400">/</span>
            <span>{baseDrivingItems.length} provade moment</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsLathundOpen(true)}
            className="px-3 py-2 rounded-lg border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 select-none bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/60 shadow-xs"
            title={`Öppna lathund för behörighet ${licenseType}`}
          >
            <BookOpen size={14} className="text-amber-600 dark:text-amber-400" />
            <span>Lathund ({licenseType})</span>
          </button>

          <button
            type="button"
            onClick={setIntervention}
            className={cn(
              "px-3.5 py-2 rounded-lg border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 select-none active:scale-95",
              state.result?.interventionOccurred
                ? "bg-amber-100 text-amber-900 border-amber-400 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-700 shadow-sm"
                : "bg-white dark:bg-zinc-900 text-gray-600 dark:text-zinc-400 border-gray-300 dark:border-zinc-700 hover:bg-gray-50"
            )}
          >
            <AlertCircle size={15} className={state.result?.interventionOccurred ? "text-amber-700 dark:text-amber-300" : "text-gray-400"} />
            <span>Ingripande {state.result?.interventionOccurred ? "✓" : ""}</span>
          </button>
          
          <button
            type="button"
            onClick={setAborted}
            className={cn(
              "px-3.5 py-2 rounded-lg border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 select-none active:scale-95",
              state.result?.testAborted
                ? "bg-red-100 text-red-900 border-red-400 dark:bg-red-950/60 dark:text-red-200 dark:border-red-700 shadow-sm"
                : "bg-white dark:bg-zinc-900 text-gray-600 dark:text-zinc-400 border-gray-300 dark:border-zinc-700 hover:bg-gray-50"
            )}
          >
            <ShieldAlert size={15} className={state.result?.testAborted ? "text-red-700 dark:text-red-300" : "text-gray-400"} />
            <span>Avbrutet {state.result?.testAborted ? "✓" : ""}</span>
          </button>
        </div>
      </div>

      {/* RENT 3-KOLUMNERS RUTNÄT SOM PÅ TRAFIKVERKETS SKÄRM */}
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
          <div>
            <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest flex items-center gap-2">Säkerhetskontroll</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Välj de ingående moment inom säkerhetskontrollen som ingått i provet.</p>
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
            <div className="pt-6 border-t border-gray-100 dark:border-white/5 space-y-3">
              <h4 className="text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest">Resultat säkerhetskontroll</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={() => setSafetyCheckResult('Godkänt')}
                  className={cn(
                    "px-4 py-3.5 border-2 text-sm w-full min-h-[44px] flex items-center justify-center gap-2 font-bold rounded-xl transition-all cursor-pointer",
                    state.result?.safetyCheckResult === 'Godkänt'
                      ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800/60 shadow-sm"
                      : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
                  )}
                >
                  Godkänd
                </button>
                <button
                  type="button"
                  onClick={() => setSafetyCheckResult('Underkänt')}
                  className={cn(
                    "px-4 py-3.5 border-2 text-sm w-full min-h-[44px] flex items-center justify-center gap-2 font-bold rounded-xl transition-all cursor-pointer",
                    state.result?.safetyCheckResult === 'Underkänt'
                      ? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-300 dark:border-red-800/60 shadow-sm"
                      : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
                  )}
                >
                  Underkänd
                </button>
                <div className="col-span-2 sm:col-span-1">
                  <button
                    type="button"
                    onClick={() => setSafetyCheckResult('-')}
                    className={cn(
                      "px-4 py-3.5 border-2 text-sm w-full min-h-[44px] flex items-center justify-center gap-2 font-bold rounded-xl transition-all cursor-pointer",
                      state.result?.safetyCheckResult === '-'
                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-800/60 shadow-sm"
                        : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
                    )}
                  >
                    Ej genomförd
                  </button>
                </div>
              </div>

              {state.result?.safetyCheckResult === 'Underkänt' && (
                <div className="animate-fade-in pt-2">
                  <FailureForm
                    title="Bristförteckning – Säkerhetskontroll"
                    data={state.result.safetyCheckFailure}
                    onChange={(data) => updateState((prev) => ({
                      ...prev,
                      result: { ...(prev.result || {}), safetyCheckFailure: data }
                    }))}
                    type="safety"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Navigation & Controls footer matches the clean Swedish myndighets style */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-10 border-t border-gray-200 dark:border-white/5 mt-12 print:hidden">
        <div className="flex gap-4 w-full sm:w-auto">
          <Button 
            variant="ghost" 
            onClick={clearAll} 
            className="text-gray-500 hover:text-red-600 hover:bg-red-50 dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-red-900/20 rounded-xl px-6 font-bold tracking-widest uppercase text-xs h-12"
          >
            Nollställ
          </Button>
          <Button 
            variant="secondary" 
            onClick={selectAll} 
            className="rounded-xl px-6 font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 tracking-widest uppercase text-xs h-12"
          >
            Markera alla
          </Button>
        </div>
        
        <div className="flex gap-4 w-full sm:w-auto">
          <Button 
            onClick={handleNext} 
            size="lg" 
            className="rounded-2xl px-10 h-14 bg-[#002f6c] hover:bg-[#00204a] dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-black text-sm tracking-widest uppercase shadow-lg shadow-blue-900/20 whitespace-nowrap cursor-pointer transition-all hover:scale-[1.02]"
          >
            Fortsätt till Resultat
          </Button>
        </div>
      </div>
      {/* Lathund Modal */}
      <LathundModal
        isOpen={isLathundOpen}
        onClose={() => setIsLathundOpen(false)}
        defaultLicense={licenseType}
      />
    </div>
  );
}
