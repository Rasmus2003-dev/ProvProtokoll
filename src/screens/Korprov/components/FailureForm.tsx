import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { FailureAssessment } from '../../../types';
import { failureCategories, failureSituations } from '../data/failureData';
import { v4 as uuidv4 } from 'uuid';

type FailureFormProps = {
  data: FailureAssessment;
  onChange: (data: FailureAssessment) => void;
  title: string;
  type?: 'driving' | 'safety';
};

export function FailureForm({ data, onChange, title, type = 'driving' }: FailureFormProps) {
  const updateContent = (partial: Partial<FailureAssessment>) => {
    onChange({ ...data, ...partial });
  };

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
    <Card className="mt-6 border border-gray-200 dark:border-white/10 overflow-visible rounded-xl shadow-sm bg-white dark:bg-slate-950">
      <CardHeader className="bg-gradient-to-r from-gray-50 to-white dark:from-slate-900/60 dark:to-slate-950 border-b border-gray-100 dark:border-white/5 mb-4 pb-4 rounded-t-xl">
        <CardTitle className="text-[#c40000] flex items-center gap-2.5 font-sans font-black text-lg uppercase tracking-tight">
          <span className="w-2 h-5 bg-[#c40000] rounded-full shrink-0" />
          {title}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-8 p-6">
        
        {/* Grundorsak */}
        <section className="space-y-4">
          <h4 className="font-bold text-lg text-gray-900 dark:text-white leading-tight uppercase tracking-tight flex items-center gap-2">
            Grundorsak till underkännandet är:
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            {type === 'driving' ? 'Din körning visar brister i att:' : 'Din säkerhetskontroll visar brister i att:'}
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-1">
              <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Välj huvudkategori</label>
              <div className="relative">
                <select 
                  className="w-full h-11 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-900 px-3.5 py-2 text-sm font-medium text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#c40000]/20 focus:border-[#c40000] dark:focus:ring-red-950/40 transition-shadow appearance-none cursor-pointer"
                  value={data.primaryCause?.area || ''}
                  onChange={(e) => handlePrimaryCauseAreaChange(e.target.value)}
                >
                  <option value="">Välj...</option>
                  {failureCategories.areas.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
                <div className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
            {data.primaryCause?.area && (
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block mb-1">Markera brister</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                  {(failureCategories.deficiencies as any)[data.primaryCause.area].map((d: string) => {
                    const isSelected = data.primaryCause.deficiencies?.includes(d);
                    return (
                      <button
                        key={d}
                        onClick={() => togglePrimaryDeficiency(d)}
                        className={`text-left px-4 py-3.5 rounded-lg text-sm transition-all duration-150 flex items-start gap-3 border shadow-sm ${
                          isSelected
                            ? 'bg-red-50/50 dark:bg-red-950/20 border-[#c40000] text-red-900 dark:text-red-300 font-semibold'
                            : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-white/5 text-gray-700 dark:text-gray-300 hover:border-red-200 dark:hover:border-red-900/40 hover:bg-red-50/10'
                        }`}
                      >
                         <div className={`mt-0.5 flex shrink-0 items-center justify-center w-5 h-5 rounded-md overflow-hidden border transition-all ${isSelected ? 'bg-[#c40000] border-[#c40000] text-white' : 'border-gray-200 dark:border-white/10 bg-white dark:bg-slate-800'}`}>
                            {isSelected && <svg className="w-3.5 h-3.5 stroke-[3px]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
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

        {/* Konsekvenser */}
        <section className="space-y-4 pt-6 border-t border-gray-100 dark:border-white/5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-lg text-gray-900 dark:text-white uppercase tracking-tight">Detta får konsekvenser på:</h4>
              <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">Ej obligatoriska tilläggsområden för vidare instruktioner.</p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={addConsequence} 
              className="text-orange-600 border-orange-200 dark:border-orange-950/50 hover:bg-orange-50 dark:hover:bg-orange-950/20 rounded-lg shadow-sm font-bold text-xs uppercase tracking-wide px-4 h-9 flex items-center gap-1.5 shrink-0"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Lägg till område
            </Button>
          </div>
          
          <div className="space-y-4">
            {data.consequences?.map((cons, index) => (
              <div key={cons.id} className="p-5 rounded-xl border border-gray-100 dark:border-white/5 border-l-4 border-l-orange-500 dark:border-l-orange-600 bg-gradient-to-r from-orange-50/30 to-white dark:from-orange-950/5 dark:to-slate-950/40 relative group shadow-sm animate-fade-in">
                <button 
                  onClick={() => removeConsequence(cons.id)}
                  className="absolute top-4 right-4 text-gray-450 hover:text-[#c40000] dark:text-gray-500 dark:hover:text-red-400 transition-colors font-bold text-xl leading-none w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-white/10 shrink-0"
                  title="Ta bort konsekvens"
                >
                  ×
                </button>
                <div className="space-y-4 pr-8">
                  <div className="space-y-2 max-w-sm">
                    <label className="text-xs font-bold text-orange-700 dark:text-orange-400 uppercase tracking-wider block">Konsekvensområde {index + 1}</label>
                    <div className="relative">
                      <select 
                        className="w-full h-10 rounded-lg border border-orange-200 dark:border-orange-900/30 bg-white dark:bg-slate-900 px-3 py-2 text-sm font-medium text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 appearance-none cursor-pointer"
                        value={cons.area || ''}
                        onChange={(e) => updateConsequenceArea(cons.id, e.target.value)}
                      >
                        <option value="">Välj kategori...</option>
                        {failureCategories.areas.map(a => <option key={a} value={a}>{a}</option>)}
                      </select>
                      <div className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none text-orange-400">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  {cons.area && (
                    <div className="space-y-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                        {(failureCategories.deficiencies as any)[cons.area].map((d: string) => {
                          const isSelected = cons.deficiencies?.includes(d);
                          return (
                            <button
                              key={d}
                              onClick={() => toggleConsequenceDeficiency(cons.id, d)}
                              className={`text-left px-4 py-3.5 rounded-lg text-sm transition-all duration-150 flex items-start gap-3 border shadow-sm ${
                                isSelected
                                  ? 'bg-orange-500/10 border-orange-500 text-orange-950 dark:text-orange-300 font-semibold'
                                  : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-white/5 text-gray-700 dark:text-gray-300 hover:border-orange-300'
                              }`}
                            >
                               <div className={`mt-0.5 flex shrink-0 items-center justify-center w-5 h-5 rounded-md overflow-hidden border transition-all ${isSelected ? 'bg-orange-500 border-orange-500 text-white' : 'border-gray-250 dark:border-white/15 bg-white dark:bg-slate-800'}`}>
                                  {isSelected && <svg className="w-3.5 h-3.5 stroke-[3px]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
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
        <section className="space-y-4 pt-6 border-t border-gray-100 dark:border-white/5 mt-4">
          <div>
            <h4 className="font-bold text-lg text-gray-900 dark:text-white uppercase tracking-tight">I följande situationer:</h4>
            <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">Ej obligatoriska beskrivningar för att specificera körprovets kontext.</p>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {failureSituations.map(sit => {
              const isSelected = data.situations?.includes(sit);
              return (
                <button
                  key={sit}
                  onClick={() => toggleSituation(sit)}
                  className={`text-left px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-120 flex items-center gap-2.5 border shadow-sm ${
                    isSelected
                      ? 'bg-gray-900 dark:bg-slate-800 text-white border-transparent'
                      : 'bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-white/5 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'border-white/40 bg-white/10' : 'border-gray-300 dark:border-white/10 bg-white dark:bg-slate-800'}`}>
                    {isSelected && <span className="text-white text-[10px] font-sans font-black">✓</span>}
                  </div>
                  <span>{sit}</span>
                </button>
              );
            })}
          </div>
        </section>

      </CardContent>
    </Card>
  );
}
