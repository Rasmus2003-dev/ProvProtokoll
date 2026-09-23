import { useEffect, useState } from 'react';
import { BookOpen, FileText, Printer, ListChecks } from 'lucide-react';
import { useAppStore } from '../store/ProvContext';
import { LICENSE_GUIDES } from '../data/licenseGuidesData';
import { LicenseGuideView } from '../components/lathund/LicenseGuideView';
import { TdokViewer } from '../components/lathund/TdokViewer';
import { useStoredState } from '../components/lathund/Highlight';

export function LathundarScreen() {
  const { state } = useAppStore();
  const [activeTab, setActiveTab] = useStoredState<'behorighet' | 'dokument'>('lathund-tab', 'behorighet');
  // Börja på behörigheten för det aktuella provet om det finns en lathund för den
  const [selectedLicense, setSelectedLicense] = useState<string>(() => {
    const current = state.properties.licenseType;
    return current && LICENSE_GUIDES[current] ? current : 'B';
  });
  const [backendGuides, setBackendGuides] = useState<any[]>([]);

  // Kompletterande uppgifter (t.ex. hastighetsmarginal) från servern om den finns
  useEffect(() => {
    fetch('/api/lathundar/quick')
      .then(res => res.json())
      .then(data => { if (Array.isArray(data?.lathundar)) setBackendGuides(data.lathundar); })
      .catch(() => {});
  }, []);

  const extraNote = backendGuides.find(b => b.license === selectedLicense)?.speedMargin;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 h-full flex flex-col gap-4">
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 sm:p-3 bg-[#002f6c] text-white rounded-2xl shadow-sm shrink-0">
            <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white tracking-tight">Lathundar</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Snabbguide per behörighet med checklistor, samt rutinbeskrivningar med sökning.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end print:hidden">
          <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-xl border border-gray-200 dark:border-slate-700">
            <button
              onClick={() => setActiveTab('behorighet')}
              className={`h-9 px-3.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'behorighet' ? 'bg-white dark:bg-slate-900 text-[#002f6c] dark:text-blue-400 shadow-xs' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <ListChecks size={14} /> Per behörighet
            </button>
            <button
              onClick={() => setActiveTab('dokument')}
              className={`h-9 px-3.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'dokument' ? 'bg-white dark:bg-slate-900 text-[#002f6c] dark:text-blue-400 shadow-xs' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <FileText size={14} /> Rutinbeskrivningar
            </button>
          </div>
          <button
            onClick={() => window.print()}
            className="h-10 px-3 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Printer size={15} /> Skriv ut
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-sm p-4 sm:p-6 flex-1 flex flex-col">
        {activeTab === 'behorighet' ? (
          <LicenseGuideView license={selectedLicense} onLicenseChange={setSelectedLicense} extraNote={extraNote} />
        ) : (
          <TdokViewer />
        )}
      </div>
    </div>
  );
}
