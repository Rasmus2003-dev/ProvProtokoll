import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useAppStore } from '../store/ProvContext';
import { 
  FileCheck, AlertTriangle, Calendar, FileText, Cloud, RefreshCw, Trash2, Search, 
  ClipboardList, TrendingUp, X, ChevronLeft, ChevronRight, Download, Upload, Navigation,
  Printer, Table, Clock, Sparkles
} from 'lucide-react';
import { printProtocol } from '../lib/generateProtocolHtml';
import { useToast } from '../components/Toast';
import { RouteReviewModal } from '../components/route/RouteReview';
import { hasRouteData } from '../lib/route';
import { AppState } from '../types';
import {
  fetchAllProtocols,
  importProtocols,
  BACKUP_FORMAT,
  fetchProtocolsPage,
  fetchProtocolStats,
  deleteProtocolFromBackend,
  subscribeToProtocols,
  SavedProtocolRow,
  ProtocolStats,
  isSupabaseConfigured
} from '../lib/supabase';
import { PrivacyGuard } from '../components/PrivacyGuard';
import { calculateDailyStats, exportProtocolsToCsv, printDailyReport } from '../lib/exportUtils';

const PAGE_SIZE = 25;

export function HistorikScreen() {
  const { testHistory, profile } = useAppStore();
  const { showToast } = useToast();
  const [rows, setRows] = useState<SavedProtocolRow[]>([]);
  const [total, setTotal] = useState(0);
  const [isCloud, setIsCloud] = useState(false);
  const [stats, setStats] = useState<ProtocolStats>({ total: 0, passed: 0, failed: 0, passRate: 0, availableLicenses: [] });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [resultFilter, setResultFilter] = useState<'all' | 'passed' | 'failed'>('all');
  const [licenseFilter, setLicenseFilter] = useState<string>('all');

  // Debounce fritextsökning mot databasen (undviker en fråga per tangenttryck)
  useEffect(() => {
    const timeout = setTimeout(() => setSearchTerm(searchInput), 350);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  const loadPage = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchProtocolsPage({
        search: searchTerm,
        resultFilter,
        licenseType: licenseFilter,
        page,
        pageSize: PAGE_SIZE
      });
      setRows(result.rows);
      setTotal(result.total);
      setIsCloud(result.isCloud);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, resultFilter, licenseFilter, page]);

  const loadStats = useCallback(async () => {
    const result = await fetchProtocolStats();
    setStats(result);
  }, []);

  // Reset till sida 0 när filter/sök ändras
  useEffect(() => {
    setPage(0);
  }, [searchTerm, resultFilter, licenseFilter]);

  useEffect(() => {
    loadPage();
  }, [loadPage]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // Live-uppdatera när andra inspektörer sparar/tar bort protokoll på andra enheter
  useEffect(() => {
    const unsubscribe = subscribeToProtocols(() => {
      loadPage();
      loadStats();
    });
    return unsubscribe;
  }, [loadPage, loadStats]);

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
    const drivingOk = item.drivingResult === 'Godkänt';
    const safetyOk = !isSafetyRequired || item.safetyResult === 'Godkänt' || !item.safetyResult;
    return drivingOk && safetyOk;
  };

  // Om molnet inte är konfigurerat/nått finns inga rader i "rows" (localStorage-läget
  // hanteras redan av fetchProtocolsPage), men vi vill fortsatt visa lokal testHistory
  // som en sista utväg om inget alls finns sparat i backend-lagret ännu.
  const displayItems = rows.length > 0 || !loading
    ? rows.map(p => ({
        id: p.id,
        isCloud,
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

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Vill du verkligen radera detta sparade protokoll?')) {
      await deleteProtocolFromBackend(id);
      loadPage();
      loadStats();
    }
  };

  // --- Säkerhetskopiering ---
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [reviewItem, setReviewItem] = useState<{ state: AppState; name: string; date: string; license: string } | null>(null);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const protocols = await fetchAllProtocols();
      if (protocols.length === 0) {
        showToast('Det finns inga protokoll att exportera.', 'warning');
        return;
      }
      const backup = { format: BACKUP_FORMAT, version: 1, exportedAt: new Date().toISOString(), protocols };
      const blob = new Blob([JSON.stringify(backup)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `provprotokoll-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      showToast(`${protocols.length} protokoll exporterade till JSON.`, 'success');
    } catch (err: any) {
      showToast(`Exporten misslyckades: ${err?.message || 'okänt fel'}`, 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportCsv = async () => {
    setIsExporting(true);
    try {
      const protocols = await fetchAllProtocols();
      if (protocols.length === 0) {
        showToast('Det finns inga protokoll att exportera.', 'warning');
        return;
      }
      exportProtocolsToCsv(protocols, evaluateIsPassed);
      showToast(`${protocols.length} protokoll exporterade till CSV / Excel.`, 'success');
    } catch (err: any) {
      showToast(`CSV-export misslyckades: ${err?.message || 'okänt fel'}`, 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      const rows = Array.isArray(parsed) ? parsed : parsed?.format === BACKUP_FORMAT ? parsed.protocols : null;
      if (!Array.isArray(rows)) {
        showToast('Filen är inte en giltig säkerhetskopia från ProvProtokoll.', 'error');
        return;
      }
      const { added, skipped } = await importProtocols(rows);
      showToast(
        added > 0
          ? `${added} protokoll importerade${skipped ? ` (${skipped} fanns redan)` : ''}.`
          : 'Alla protokoll i filen fanns redan.',
        added > 0 ? 'success' : 'warning'
      );
      loadPage();
      loadStats();
    } catch (err: any) {
      showToast(`Importen misslyckades: ${err?.message || 'filen kunde inte läsas'}`, 'error');
    }
  };

  const hasActiveFilters =searchInput.trim() !== '' || resultFilter !== 'all' || licenseFilter !== 'all';

  const clearFilters = () => {
    setSearchInput('');
    setSearchTerm('');
    setResultFilter('all');
    setLicenseFilter('all');
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasAnyRecords = stats.total > 0 || testHistory.length > 0;

  // Dagens statistik
  const dailyStats = useMemo(() => {
    const sourceRows: SavedProtocolRow[] = rows.length > 0 ? rows : testHistory.map((th, i) => ({
      id: `local-${i}`,
      student_name: th.properties.studentName || 'Okänd',
      personal_number: th.properties.personalNumber || '',
      license_type: th.properties.licenseType,
      transmission: th.properties.transmission,
      test_type: th.properties.testType,
      driving_result: th.result.drivingResult,
      safety_result: th.result.safetyCheckResult,
      examiner: th.properties.examiner,
      created_at: th.properties.testDate,
      full_state: th
    }));
    const today = new Date().toISOString().split('T')[0];
    return calculateDailyStats(sourceRows, today, evaluateIsPassed);
  }, [rows, testHistory]);

  const handlePrintDaily = () => {
    printDailyReport(dailyStats, profile?.name);
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
                Synkad live
              </span>
            )}
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xl">
            Sök och ladda ned tidigare körprovsprotokoll, exportera dagsrapporter till Excel/CSV samt arkivera.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCsv}
            disabled={isExporting}
            className="px-3.5 py-2 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Exportera protokoll till Excel-kompatibel CSV-fil"
          >
            <Table size={14} />
            <span>Excel / CSV</span>
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="px-3.5 py-2 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Ladda ner alla protokoll som en säkerhetskopia (JSON-fil)"
          >
            <Download size={14} />
            <span>JSON</span>
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3.5 py-2 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            title="Återställ protokoll från en säkerhetskopia"
          >
            <Upload size={14} />
            <span>Importera</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={handleImport}
          />
          <button
            onClick={() => { loadPage(); loadStats(); }}
            disabled={loading}
            className="px-3.5 py-2 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin text-blue-600' : ''} />
            <span>Uppdatera</span>
          </button>
        </div>
      </div>

      {/* Dagens sammanfattning Banner */}
      <div className="bg-linear-to-br from-[#002f6c] to-[#001f48] text-white rounded-2xl p-4 sm:p-5 mb-5 shadow-md border border-blue-900/30">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-black uppercase tracking-wider text-blue-200">Dagens Provsammanfattning</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              {new Date().toLocaleDateString('sv-SE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </h2>
            <div className="text-xs text-blue-200 flex flex-wrap items-center gap-3 pt-0.5">
              <span>Provförrättare: <strong className="text-white">{profile?.name || 'Trafikverket'}</strong></span>
              {Object.keys(dailyStats.licenseCounts).length > 0 && (
                <span>• Behörigheter idag: <strong className="text-white">{Object.entries(dailyStats.licenseCounts).map(([l, c]) => `${l} (${c})`).join(', ')}</strong></span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
            <button
              onClick={handlePrintDaily}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border border-white/20 shadow-xs cursor-pointer"
            >
              <Printer size={15} />
              <span>Skriv ut dagsrapport</span>
            </button>
          </div>
        </div>

        {/* 4 Mini Stat Pills for Today */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 pt-4 border-t border-white/15">
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <div className="text-2xl font-black">{dailyStats.total}</div>
            <div className="text-[10px] uppercase font-bold text-blue-200 mt-0.5">Genomförda idag</div>
          </div>

          <div className="bg-white/10 rounded-xl p-3 text-center">
            <div className={`text-2xl font-black ${dailyStats.passRate >= 80 ? 'text-emerald-300' : dailyStats.passRate >= 50 ? 'text-amber-300' : 'text-red-300'}`}>
              {dailyStats.total > 0 ? `${dailyStats.passRate}%` : '–'}
            </div>
            <div className="text-[10px] uppercase font-bold text-blue-200 mt-0.5">Godkänt-grad idag</div>
          </div>

          <div className="bg-white/10 rounded-xl p-3 text-center">
            <div className="text-2xl font-black">
              {dailyStats.passed} <span className="text-sm font-normal text-blue-200">/ {dailyStats.failed}</span>
            </div>
            <div className="text-[10px] uppercase font-bold text-blue-200 mt-0.5">Godkända / Underkända</div>
          </div>

          <div className="bg-white/10 rounded-xl p-3 text-center">
            <div className="text-2xl font-black">~{dailyStats.averageMinutes} <span className="text-sm font-normal text-blue-200">min</span></div>
            <div className="text-[10px] uppercase font-bold text-blue-200 mt-0.5">Snitt körtid</div>
          </div>
        </div>
      </div>

      {/* Statistik-panel */}
      {hasAnyRecords && (
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

      {/* Sök & filter (server-side) */}
      {hasAnyRecords && (
        <div className="flex flex-col sm:flex-row gap-2.5 mb-4">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Sök namn eller personnummer..."
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
            {stats.availableLicenses.map(lic => (
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
        {!hasAnyRecords ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gray-50/50 dark:bg-slate-900/40">
            <div className="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-2xl flex items-center justify-center mb-4 text-gray-400">
              <Calendar className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Inga sparade protokoll än</h3>
            <p className="text-sm text-gray-500 max-w-sm mt-2">
              När du slutför ett prov och klickar på "Spara & Slutför" sparas protokollet automatiskt i backend/Supabase.
            </p>
          </div>
        ) : displayItems.length === 0 && !loading ? (
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
            {displayItems.map((item) => (
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

                  {hasRouteData(item.state) && (
                    <button
                      onClick={() => setReviewItem({ state: item.state, name: item.studentName, date: item.testDate, license: item.licenseType })}
                      className="px-3 py-2 min-h-[40px] bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-200 border border-gray-200 dark:border-slate-700 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                      title="Visa inspelad rutt och händelser"
                    >
                      <Navigation size={14} />
                      <span>Rutt</span>
                    </button>
                  )}

                  <button
                    onClick={() => printProtocol(item.state, profile?.name)}
                    className="px-3 py-2 min-h-[40px] bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    title="Öppnar utskriftsdialogen - välj 'Spara som PDF' för att ladda ner"
                  >
                    <FileText size={14} />
                    <span>Skriv ut / PDF</span>
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

        {/* Pagination */}
        {isCloud && total > PAGE_SIZE && (
          <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-gray-100 dark:border-white/5 shrink-0">
            <span className="text-xs font-semibold text-gray-500 dark:text-slate-400">
              Sida {page + 1} av {totalPages} ({total} protokoll)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="p-2 rounded-lg border border-gray-200 dark:border-white/10 text-gray-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-slate-800 cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="p-2 rounded-lg border border-gray-200 dark:border-white/10 text-gray-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-slate-800 cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      <RouteReviewModal
        open={reviewItem !== null}
        onClose={() => setReviewItem(null)}
        route={reviewItem?.state?.route}
        events={reviewItem?.state?.events}
        title={`Genomgång – ${reviewItem?.name || 'Kandidat'}`}
        subtitle={reviewItem ? `${reviewItem.license} · ${reviewItem.date}` : undefined}
      />
    </div>
  );
}
