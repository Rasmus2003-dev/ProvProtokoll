import React, { useState, useEffect, useMemo } from 'react';
import { useAppStore } from '../store/ProvContext';
import { FileCheck, AlertTriangle, Calendar, FileText, Cloud, RefreshCw, Trash2, Search, ClipboardList, TrendingUp, X } from 'lucide-react';
import { generateProtocolPdf } from '../lib/generateProtocolPdf';
import { fetchAllProtocols, deleteProtocolFromBackend, SavedProtocolRow, isSupabaseConfigured } from '../lib/supabase';
import { PrivacyGuard } from '../components/PrivacyGuard';

export function HistorikScreen() {
  const { testHistory, profile } = useAppStore();
  const [cloudProtocols, setCloudProtocols] = useState<SavedProtocolRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [resultFilter, setResultFilter] = useState<'all' | 'passed' | 'failed'>('all');
  const [licenseFilter, setLicenseFilter] = useState<string>('all');

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

  const availableLicenses = useMemo(() => {
    return Array.from(new Set(allDisplayItems.map(item => item.licenseType).filter(Boolean))).sort();
  }, [allDisplayItems]);

  const filteredItems = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return allDisplayItems.filter(item => {
      const matchesSearch = !term ||
        item.studentName.toLowerCase().includes(term) ||
        item.personalNumber.toLowerCase().includes(term) ||
        item.testDate.toLowerCase().includes(term);
      const matchesResult = resultFilter === 'all' ||
        (resultFilter === 'passed' && item.isPassed) ||
        (resultFilter === 'failed' && !item.isPassed);
      const matchesLicense = licenseFilter === 'all' || item.licenseType === licenseFilter;
      return matchesSearch && matchesResult && matchesLicense;
    });
  }, [allDisplayItems, searchTerm, resultFilter, licenseFilter]);

  const stats = useMemo(() => {
    const total = allDisplayItems.length;
    const passed = allDisplayItems.filter(item => item.isPassed).length;
    const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;
    return { total, passed, failed: total - passed, passRate };
  }, [allDisplayItems]);

  const hasActiveFilters = searchTerm.trim() !== '' || resultFilter !== 'all' || licenseFilter !== 'all';

  const clearFilters = () => {
    setSearchTerm('');
    setResultFilter('all');
    setLicenseFilter('all');
  };

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

      {/* Statistik-panel */}
      {allDisplayItems.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-white dark:bg-slate-900 border border-gray-200/80 dark:border-white/10 rounded-2xl p-4 flex items-center gap-3 shadow-xs">
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 shrink-0">
              <ClipboardList size={18} />
            </div>
            <div className="min-w-0">
              <div className="text-lg font-black text-gray-900 dark:text-white leading-none">{stats.total}</div>
              <div className="text-[11px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wide truncate">Totalt prov</div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-gray-200/80 dark:border-white/10 rounded-2xl p-4 flex items-center gap-3 shadow-xs">
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 shrink-0">
              <TrendingUp size={18} />
            </div>
            <div className="min-w-0">
              <div className="text-lg font-black text-gray-900 dark:text-white leading-none">{stats.passRate}%</div>
              <div className="text-[11px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wide truncate">Godkänt-kvot</div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-gray-200/80 dark:border-white/10 rounded-2xl p-4 flex items-center gap-3 shadow-xs">
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 shrink-0">
              <FileCheck size={18} />
            </div>
            <div className="min-w-0">
              <div className="text-lg font-black text-gray-900 dark:text-white leading-none">{stats.passed}</div>
              <div className="text-[11px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wide truncate">Godkända</div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-gray-200/80 dark:border-white/10 rounded-2xl p-4 flex items-center gap-3 shadow-xs">
            <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 text-[#DD1D25] dark:text-red-400 shrink-0">
              <AlertTriangle size={18} />
            </div>
            <div className="min-w-0">
              <div className="text-lg font-black text-gray-900 dark:text-white leading-none">{stats.failed}</div>
              <div className="text-[11px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wide truncate">Underkända</div>
            </div>
          </div>
        </div>
      )}

      {/* Sök & filter */}
      {allDisplayItems.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-2.5 mb-4">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Sök namn, personnummer eller datum..."
              className="w-full h-11 pl-10 pr-4 text-sm bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/10 rounded-xl dark:text-white outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
            />
          </div>

          <select
            value={resultFilter}
            onChange={(e) => setResultFilter(e.target.value as 'all' | 'passed' | 'failed')}
            className="h-11 px-3.5 text-sm font-semibold bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/10 rounded-xl dark:text-white outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="all">Alla resultat</option>
            <option value="passed">Godkänt</option>
            <option value="failed">Underkänt</option>
          </select>

          <select
            value={licenseFilter}
            onChange={(e) => setLicenseFilter(e.target.value)}
            className="h-11 px-3.5 text-sm font-semibold bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/10 rounded-xl dark:text-white outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="all">Alla behörigheter</option>
            {availableLicenses.map(lic => (
              <option key={lic} value={lic}>{lic}</option>
            ))}
          </select>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="h-11 px-3.5 flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/10 rounded-xl transition-colors cursor-pointer shrink-0"
            >
              <X size={14} />
              <span className="hidden sm:inline">Rensa</span>
            </button>
          )}
        </div>
      )}

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
        ) : filteredItems.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gray-50/50 dark:bg-slate-900/40">
            <div className="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-2xl flex items-center justify-center mb-4 text-gray-400">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Inga träffar</h3>
            <p className="text-sm text-gray-500 max-w-sm mt-2">
              Inga protokoll matchar din sökning eller dina filter.
            </p>
            <button
              onClick={clearFilters}
              className="mt-4 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 text-[#002f6c] dark:text-blue-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Rensa filter
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-white/5 overflow-y-auto">
            {filteredItems.map((item) => (
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
                    <PrivacyGuard className="inline-block">
                      <span className="text-xs bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded font-mono">
                        {item.personalNumber}
                      </span>
                    </PrivacyGuard>
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
