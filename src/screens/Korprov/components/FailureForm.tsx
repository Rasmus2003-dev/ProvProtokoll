import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { FailureAssessment } from '../../../types';
import { failureCategories, failureSituations } from '../data/failureData';
import { v4 as uuidv4 } from 'uuid';
import { useAppStore } from '../../../store/ProvContext';

type FailureFormProps = {
  data: FailureAssessment;
  onChange: (data: FailureAssessment) => void;
  title: string;
  type?: 'driving' | 'safety';
};

export function FailureForm({ data, onChange, title, type = 'driving' }: FailureFormProps) {
  const { state } = useAppStore();

  const updateContent = (partial: Partial<FailureAssessment>) => {
    onChange({ ...data, ...partial });
  };

  // Auto-initialize safety check failure to Fordonskännedom
  React.useEffect(() => {
    if (type === 'safety') {
      const needsArea = !data.primaryCause || !data.primaryCause.area;
      if (needsArea) {
        updateContent({
          primaryCause: { area: 'Fordonskännedom', deficiencies: data.primaryCause?.deficiencies || [] }
        });
      }
    }
  }, [type, data.primaryCause?.area]);
  
  // Combine situations: safety specific situations, test items, and all standard situations
  const availableSituations = useMemo(() => {
    const included = state.includedTestItems || [];
    const safetyDefaults = type === 'safety' ? [
      'Säkerhetskontroll',
      'Funktionsbeskrivning',
      'Säkerhetskontroll och funktionsbeskrivning',
      'Koppling och lastsäkring',
      'Färdskrivare'
    ] : [];
    return Array.from(new Set([...safetyDefaults, ...included, ...failureSituations]));
  }, [state.includedTestItems, type]);

  const handlePrimaryCauseAreaChange = (area: string) => {
    updateContent({ primaryCause: { area, deficiencies: [] } });
  };

  const togglePrimaryDeficiency = (deficiency: string) => {
    const arr = data.primaryCause.deficiencies || [];
    if (arr.includes(deficiency)) {
      updateContent({ primaryCause: { ...data.primaryCause, deficiencies: arr.filter(d => d !== deficiency) } });
    } else {
      updateContent({ primaryCause: { ...data.primaryCause, deficiencies: [...arr, deficiency] } });
    }
  };

  const addConsequence = () => {
    const list = data.consequences || [];
    updateContent({ consequences: [...list, { id: uuidv4(), area: '', deficiencies: [] }] });
  };

  const removeConsequence = (id: string) => {
    const list = data.consequences || [];
    updateContent({ consequences: list.filter(c => c.id !== id) });
  };

  const updateConsequenceArea = (id: string, area: string) => {
    const list = data.consequences.map(c => c.id === id ? { ...c, area, deficiencies: [] } : c);
    updateContent({ consequences: list });
  };

  const toggleConsequenceDeficiency = (id: string, deficiency: string) => {
    const list = data.consequences.map(c => {
      if (c.id === id) {
        const arr = c.deficiencies || [];
        return {
          ...c,
          deficiencies: arr.includes(deficiency) ? arr.filter(d => d !== deficiency) : [...arr, deficiency]
        };
      }
      return c;
    });
    updateContent({ consequences: list });
  };

  const toggleSituation = (sit: string) => {
    const arr = data.situations || [];
    if (arr.includes(sit)) {
      updateContent({ situations: arr.filter(s => s !== sit) });
    } else {
      updateContent({ situations: [...arr, sit] });
    }
  };

  return (
    <Card className="mt-6 border border-gray-200 dark:border-white/10 overflow-hidden rounded-xl shadow-sm bg-white dark:bg-slate-950">
      <CardHeader className="bg-slate-50/90 dark:bg-slate-900/60 border-b border-gray-200 dark:border-white/5 py-4 px-5">
        <CardTitle className="text-[#C0504D] flex items-center justify-between font-sans font-black text-base sm:text-lg uppercase tracking-tight">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-5 bg-[#C0504D] rounded-full shrink-0" />
            <span>{title}</span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-900/40">
            Avvikelsehantering
          </span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-8 p-5 sm:p-7">
        
        {/* Grundorsak - inramad med Trafikverkets officiella 3px röda ram */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 border-b border-gray-100 dark:border-white/5 pb-2">
            <h4 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white leading-tight uppercase tracking-tight flex items-center gap-2">
              Grundorsak till underkännandet är:
            </h4>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              {type === 'driving' ? 'Din körning visar brister i att:' : 'Din säkerhetskontroll visar brister i att:'}
            </span>
          </div>

          <div className="border-[3px] border-[#C0504D] bg-red-50/20 dark:bg-red-950/10 rounded-lg p-4 sm:p-5 space-y-4">
            <div className="max-w-md space-y-1.5">
              <label className="text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider block">
                Välj kompetensområde (Grundorsak)
              </label>
              <div className="relative">
                <select 
                  className="w-full h-11 rounded-lg border-2 border-red-200 dark:border-red-900/40 bg-white dark:bg-slate-900 px-3.5 py-2 text-sm font-bold text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#C0504D]/30 focus:border-[#C0504D] transition-shadow appearance-none cursor-pointer"
                  value={data.primaryCause?.area || ''}
                  onChange={(e) => handlePrimaryCauseAreaChange(e.target.value)}
                >
                  <option value="">Välj område...</option>
                  {failureCategories.areas.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
                <div className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none text-[#C0504D]">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {data.primaryCause?.area && (
              <div className="space-y-2 pt-2 border-t border-red-100 dark:border-red-900/30">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Din {type === 'driving' ? 'körning' : 'kontroll'} visar brister i att:
                  </label>
                  <span className="text-[11px] font-semibold text-[#C0504D]">
                    {data.primaryCause.deficiencies?.length || 0} valda
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-2">
                  {(failureCategories.deficiencies as any)[data.primaryCause.area].map((d: string) => {
                    const isSelected = data.primaryCause.deficiencies?.includes(d);
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => togglePrimaryDeficiency(d)}
                        className={`text-left px-3.5 py-3 rounded-xl text-xs sm:text-sm transition-all duration-150 flex items-start gap-3 border ${
                          isSelected
                            ? 'bg-red-50/50 dark:bg-red-950/20 border-[#C0504D] text-gray-950 dark:text-white font-bold shadow-xs ring-1 ring-[#C0504D]/60'
                            : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-gray-700 dark:text-gray-300 hover:border-[#C0504D]/50 hover:bg-gray-50/60'
                        }`}
                      >
                         <div className={`mt-0.5 flex shrink-0 items-center justify-center w-4 h-4 rounded-md border transition-all duration-150 shadow-2xs ${
                           isSelected 
                             ? 'bg-[#C0504D] border-[#C0504D] text-white scale-105 shadow-xs' 
                             : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-slate-800 hover:border-gray-400'
                         }`}>
                            {isSelected && (
                              <svg className="w-2.5 h-2.5 stroke-[3.5px] animate-in zoom-in-75 duration-75" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                              </svg>
                            )}
                         </div>
                         <span className="leading-snug">{d}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Konsekvenser - inramade med Trafikverkets officiella 3px orangea ram */}
        <section className="space-y-4 pt-4 border-t border-gray-100 dark:border-white/5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h4 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white uppercase tracking-tight">
                Detta får konsekvenser på:
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                Tilläggsområden som påverkats av grundorsaken (orange ram i protokollet).
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={addConsequence} 
              className="text-[#F79646] border-[#F79646]/40 hover:bg-orange-50 dark:hover:bg-orange-950/20 rounded-lg shadow-none font-bold text-xs uppercase tracking-wide px-3.5 h-9 flex items-center gap-1.5 shrink-0"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Lägg till konsekvensområde
            </Button>
          </div>
          
          <div className="space-y-4">
            {data.consequences?.map((cons, index) => (
              <div 
                key={cons.id} 
                className="border-[3px] border-[#F79646] bg-orange-50/20 dark:bg-orange-950/10 rounded-lg p-4 sm:p-5 relative shadow-sm animate-fade-in"
              >
                <button 
                  onClick={() => removeConsequence(cons.id)}
                  className="absolute top-3.5 right-3.5 text-gray-400 hover:text-red-600 transition-colors font-bold text-xl leading-none w-7 h-7 flex items-center justify-center rounded-full hover:bg-white dark:hover:bg-slate-800 shrink-0"
                  title="Ta bort konsekvens"
                  type="button"
                >
                  ×
                </button>
                <div className="space-y-4 pr-7">
                  <div className="space-y-1.5 max-w-md">
                    <label className="text-xs font-black text-orange-900 dark:text-orange-300 uppercase tracking-wider block">
                      Konsekvensområde {index + 1}
                    </label>
                    <div className="relative">
                      <select 
                        className="w-full h-10 rounded-lg border-2 border-orange-200 dark:border-orange-900/40 bg-white dark:bg-slate-900 px-3 py-2 text-sm font-bold text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#F79646]/30 focus:border-[#F79646] appearance-none cursor-pointer"
                        value={cons.area || ''}
                        onChange={(e) => updateConsequenceArea(cons.id, e.target.value)}
                      >
                        <option value="">Välj område...</option>
                        {failureCategories.areas.map(a => <option key={a} value={a}>{a}</option>)}
                      </select>
                      <div className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none text-[#F79646]">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {cons.area && (
                    <div className="space-y-2 pt-2 border-t border-orange-100 dark:border-orange-900/30">
                      <div className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Din körning visar brister i att:
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-2">
                        {(failureCategories.deficiencies as any)[cons.area].map((d: string) => {
                          const isSelected = cons.deficiencies?.includes(d);
                          return (
                            <button
                              key={d}
                              type="button"
                              onClick={() => toggleConsequenceDeficiency(cons.id, d)}
                              className={`text-left px-3.5 py-3 rounded-lg text-xs sm:text-sm transition-all duration-150 flex items-start gap-3 border ${
                                isSelected
                                  ? 'bg-orange-50/40 dark:bg-orange-950/20 border-[#F79646] text-gray-950 dark:text-white font-bold shadow-xs ring-1 ring-[#F79646]/80'
                                  : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-gray-700 dark:text-gray-300 hover:border-[#F79646]/60 hover:bg-gray-50/50'
                              }`}
                            >
                               <div className={`mt-0.5 flex shrink-0 items-center justify-center w-4 h-4 rounded-[3px] border transition-all duration-150 shadow-2xs ${
                                 isSelected 
                                   ? 'bg-[#F79646] border-[#F79646] text-white scale-105' 
                                   : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 hover:border-gray-500'
                               }`}>
                                  {isSelected && (
                                    <svg className="w-2.5 h-2.5 stroke-[3.5px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                    </svg>
                                  )}
                               </div>
                               <span className="leading-snug">{d}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Situationer */}
        <section className="space-y-3 pt-4 border-t border-gray-100 dark:border-white/5">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
            <h4 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white uppercase tracking-tight">
              Brister har visat sig i följande situationer:
            </h4>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              Välj situationer där bristerna uppstod
            </span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-2">
            {availableSituations.map((sit, idx) => {
              const isSelected = data.situations?.includes(sit);
              const wasTested = state.includedTestItems?.includes(sit);
              
              return (
                <button
                  key={`sit-${sit}-${idx}`}
                  type="button"
                  onClick={() => toggleSituation(sit)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-150 flex items-center gap-2.5 border ${
                    isSelected
                      ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-900 dark:border-white font-bold shadow-xs'
                      : wasTested 
                        ? 'bg-blue-50/70 dark:bg-blue-950/30 text-blue-900 dark:text-blue-300 border-blue-200 dark:border-blue-900/50 hover:bg-blue-100/70' 
                        : 'bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-white/10 hover:border-gray-300 hover:bg-gray-50/50'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-[3px] border flex items-center justify-center shrink-0 transition-all duration-150 shadow-2xs ${
                    isSelected 
                      ? 'border-transparent bg-white/20 dark:bg-black/20 text-white dark:text-slate-900' 
                      : wasTested 
                        ? 'border-blue-300 dark:border-blue-700 bg-white dark:bg-blue-950 text-blue-600' 
                        : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-800'
                  }`}>
                    {isSelected && (
                      <svg className="w-2.5 h-2.5 stroke-[3.5px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    )}
                  </div>
                  <span className="truncate">{sit}</span>
                </button>
              );
            })}
          </div>
        </section>

      </CardContent>
    </Card>
  );
}
