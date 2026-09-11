import { useAppStore } from '../store/ProvContext';
import { FileCheck, AlertTriangle, Calendar, FileText } from 'lucide-react';
import { generateProtocolPdf } from '../lib/generateProtocolPdf';

export function HistorikScreen() {
  const { testHistory, profile } = useAppStore();

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-8 h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-display font-black text-gray-950 dark:text-white uppercase tracking-tight">Historik</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 max-w-xl">
          Här samlas alla dina avslutade och rapporterade prov från din lokala historik.
        </p>
      </div>

      <div className="flex-1 rounded-2xl bg-white dark:bg-[#111827] border border-gray-200 dark:border-white/10 shadow-sm overflow-hidden flex flex-col">
        {testHistory.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gray-50/50 dark:bg-slate-900/40">
            <div className="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-2xl flex items-center justify-center mb-4 text-gray-400">
              <Calendar className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Ingen historik än</h3>
            <p className="text-sm text-gray-500 max-w-sm mt-2">
              När du slutför och rapporterar prov kommer de att dyka upp i den här listan.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-white/5 overflow-y-auto">
            {testHistory.map((test, idx) => {
              const isPassed =
                test.result.drivingResult === 'Godkänt' &&
                (test.result.safetyCheckResult === 'Godkänt' || !test.result.safetyCheckResult);

              return (
                <div key={idx} className="p-3 sm:p-4 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  {/* Status Indicator */}
                  <div className={`p-3 shrink-0 rounded-xl flex items-center justify-center ${
                    isPassed 
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-450' 
                      : 'bg-red-50 dark:bg-red-950/30 text-[#DD1D25] dark:text-red-400'
                  }`}>
                    {isPassed ? <FileCheck className="w-6 h-6 shrink-0" /> : <AlertTriangle className="w-6 h-6 shrink-0" />}
                  </div>

                  {/* Test Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight truncate">
                        {test.properties.studentName || 'Okänd Kandidat'}
                      </span>
                      <span className="text-xs bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded font-mono">
                        {test.properties.personalNumber || 'XXXXXX-XXXX'}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 font-medium">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {test.properties.testDate}
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] uppercase font-bold text-gray-400">Behörighet:</span>
                        <span className="text-gray-700 dark:text-gray-300 font-bold">{test.properties.licenseType} ({test.properties.transmission})</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] uppercase font-bold text-gray-400">Testtyp:</span>
                        <span className="text-gray-700 dark:text-gray-300">{test.properties.testType || 'Körprov'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Result Pill */}
                  <div className="shrink-0 flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                    <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                      isPassed 
                        ? 'border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' 
                        : 'border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                    }`}>
                      {isPassed ? 'Godkänt' : 'Underkänt'}
                    </div>

                    <button
                      onClick={() => generateProtocolPdf(test, profile?.name)}
                      className="px-3 py-2 min-h-[40px] bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                      title="Ladda ner PDF-protokoll"
                    >
                      <FileText size={14} />
                      <span>Hämta PDF</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
