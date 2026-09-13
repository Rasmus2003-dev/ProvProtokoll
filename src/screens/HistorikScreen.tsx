import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/ProvContext';
import { FileCheck, AlertTriangle, Calendar, FileText, Cloud, RefreshCw, Trash2, ArrowUpDown } from 'lucide-react';
import { generateProtocolPdf } from '../lib/generateProtocolPdf';
import { fetchAllProtocols, deleteProtocolFromBackend, SavedProtocolRow, isSupabaseConfigured } from '../lib/supabase';

export function HistorikScreen() {
  const { testHistory, profile } = useAppStore();
  const [cloudProtocols, setCloudProtocols] = useState<SavedProtocolRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeSource, setActiveSource] = useState<'all' | 'cloud' | 'local'>('all');

  const loadProtocols = async () => {
    setLoading(true);
    try {
      const data = await fetchAllProtocols();
      setCloudProtocols(data);
    } catch (e) {
      console.warn('Could not fetch protocols:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProtocols();
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Vill du verkligen radera detta sparade protokoll?')) {
      await deleteProtocolFromBackend(id);
      setCloudProtocols(prev => prev.filter(p => p.id !== id));
    }
  };

  const evaluateIsPassed = (item: {
    testType?: string;
    licenseType?: string;
    drivingResult?: string | null;
    safetyResult?: string | null;
  }) => {
    const tType = item.testType || '';
    const lType = item.licenseType || 'B';
    const isSafetyRequired = ['C1', 'C', 'C1E', 'CE', 'D1', 'D', 'D1E', 'DE', 'BE'].includes(lType);

    if (tType.includes('Omprov säkerhetskontroll')) {
      return item.safetyResult === 'Godkänt';
    }
    if (tType.includes('Omprov körning')) {
      return item.drivingResult === 'Godkänt';
    }
    // Standard test or Omprov båda
    const drivingOk = item.drivingResult === 'Godkänt';
    const safetyOk = !isSafetyRequired || item.safetyResult === 'Godkänt' || !item.safetyResult;
    return drivingOk && safetyOk;
  };

  // Merge cloud protocols with local testHistory if not already present
  const allDisplayItems = cloudProtocols.length > 0
    ? cloudProtocols.map(p => ({
        id: p.id,
        isCloud: true,
        testDate: p.created_at ? p.created_at.split('T')[0] : 'Idag',
        studentName: p.student_name,
        personalNumber: p.personal_number,
        licenseType: p.license_type,
        testType: p.test_type,
        transmission: p.transmission,
        isPassed: evaluateIsPassed({
          testType: p.test_type,
          licenseType: p.license_type,
          drivingResult: p.driving_result,
          safetyResult: p.safety_result
        }),
        state: p.full_state
      }))
    : testHistory.map((test, idx) => ({
        id: `local-${idx}`,
        isCloud: false,
        testDate: test.properties.testDate,
        studentName: test.properties.studentName || 'Okänd Kandidat',
        personalNumber: test.properties.personalNumber || 'XXXXXX-XXXX',
        licenseType: test.properties.licenseType,
        testType: test.properties.testType || 'Körprov',
        transmission: test.properties.transmission,
        isPassed: evaluateIsPassed({
          testType: test.properties.testType,
          licenseType: test.properties.licenseType,
          drivingResult: test.result.drivingResult,
          safetyResult: test.result.safetyCheckResult
        }),
        state: test
      }));

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-8 h-full flex flex-col">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-display font-black text-gray-950 dark:text-white uppercase tracking-tight">
              Protokollhistorik
            </h1>
            {isSupabaseConfigured() && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                <Cloud size={12} />
                Supabase Synkad
              </span>
            )}
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xl">
            Sök och ladda ned tidigare genomförda och arkiverade körprovsprotokoll från molndatabasen.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadProtocols}
            disabled={loading}
            className="px-3.5 py-2 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin text-blue-600' : ''} />
            <span>Uppdatera</span>
          </button>
        </div>
      </div>

      <div className="flex-1 rounded-2xl bg-white dark:bg-[#111827] border border-gray-200 dark:border-white/10 shadow-sm overflow-hidden flex flex-col">
        {allDisplayItems.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gray-50/50 dark:bg-slate-900/40">
            <div className="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-2xl flex items-center justify-center mb-4 text-gray-400">
              <Calendar className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Inga sparade protokoll än</h3>
            <p className="text-sm text-gray-500 max-w-sm mt-2">
              När du slutför ett prov och klickar på "Spara & Slutför" sparas protokollet automatiskt i backend/Supabase.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-white/5 overflow-y-auto">
            {allDisplayItems.map((item) => (
              <div key={item.id} className="p-3 sm:p-4 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                {/* Status Indicator */}
                <div className={`p-3 shrink-0 rounded-xl flex items-center justify-center ${
                  item.isPassed 
                    ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-450' 
                    : 'bg-red-50 dark:bg-red-950/30 text-[#DD1D25] dark:text-red-400'
                }`}>
                  {item.isPassed ? <FileCheck className="w-6 h-6 shrink-0" /> : <AlertTriangle className="w-6 h-6 shrink-0" />}
                </div>

                {/* Test Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight truncate">
                      {item.studentName}
                    </span>
                    <span className="text-xs bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded font-mono">
                      {item.personalNumber}
                    </span>
                    {item.isCloud && (
                      <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-1.5 py-0.5 rounded flex items-center gap-1">
                        <Cloud size={10} /> Cloud
                      </span>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 font-medium">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {item.testDate}
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] uppercase font-bold text-gray-400">Behörighet:</span>
                      <span className="text-gray-700 dark:text-gray-300 font-bold">{item.licenseType} ({item.transmission})</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] uppercase font-bold text-gray-400">Testtyp:</span>
                      <span className="text-gray-700 dark:text-gray-300">{item.testType || 'Körprov'}</span>
                    </div>
                  </div>
                </div>

                {/* Actions & Result Pill */}
                <div className="shrink-0 flex items-center justify-between sm:justify-end gap-2.5 w-full sm:w-auto mt-2 sm:mt-0">
                  <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                    item.isPassed 
                      ? 'border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' 
                      : 'border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                  }`}>
                    {item.isPassed ? 'Godkänt' : 'Underkänt'}
                  </div>

                  <button
                    onClick={() => generateProtocolPdf(item.state, profile?.name)}
                    className="px-3 py-2 min-h-[40px] bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    title="Ladda ner officiellt PDF-protokoll"
                  >
                    <FileText size={14} />
                    <span>Hämta PDF</span>
                  </button>

                  <button
                    onClick={(e) => handleDelete(item.id, e)}
                    className="p-2 min-h-[40px] min-w-[40px] hover:bg-red-50 dark:hover:bg-red-950/40 text-gray-400 hover:text-red-600 rounded-lg transition-colors flex items-center justify-center cursor-pointer"
                    title="Radera protokoll"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
