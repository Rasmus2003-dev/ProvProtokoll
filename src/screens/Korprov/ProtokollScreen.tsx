import { useState } from 'react';
import { useAppStore } from '../../store/ProvContext';
import { Button } from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { OfficialPrintLayout } from './components/OfficialPrintLayout';
import { AlertTriangle, Send, FileCheck } from 'lucide-react';
import { generateProtocolPdf } from '../../lib/generateProtocolPdf';
import { downloadProtocolHtml } from '../../lib/generateProtocolHtml';

export function ProtokollScreen() {
  const { state, saveTest, resetCurrentTest, profile } = useAppStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'email' | 'beslut'>('beslut');
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    generateProtocolPdf(state, profile?.name);
  };

  const handleDownloadHTML = () => {
    downloadProtocolHtml(state, profile?.name);
  };

  const handleComplete = () => {
    saveTest();
    resetCurrentTest();
    navigate('/');
  };

  const licenseType = state.properties.licenseType || 'B';
  const HEAVY_LICENSES = ['C1', 'C', 'C1E', 'CE', 'D1', 'D', 'D1E', 'DE'];
  
  // Rule checks
  const isSafetyCheckRequired = [...HEAVY_LICENSES, 'B', 'B1', 'B96', 'BE', 'Traktor', 'Traktor (Traktorkort)', 'Lokförare'].includes(licenseType);
  
  const isOmprovSakerhet = state.properties.testType === 'Omprov säkerhetskontroll';
  const isOmprovKorning = state.properties.testType === 'Omprov körning';
  
  let isPassed = false;
  let isFailed = false;
  
  if (isOmprovSakerhet) {
    if (state.result.safetyCheckResult === 'Godkänt') isPassed = true;
    if (state.result.safetyCheckResult === 'Underkänt') isFailed = true;
  } else if (isOmprovKorning) {
    if (state.result.drivingResult === 'Godkänt') isPassed = true;
    if (state.result.drivingResult === 'Underkänt') isFailed = true;
  } else {
    // Normal / Förstaprov / General Omprov
    const safetyCheckPassedOrNotNeeded = !isSafetyCheckRequired || state.result.safetyCheckResult === 'Godkänt';
    const drivingPassed = state.result.drivingResult === 'Godkänt';
    
    isPassed = drivingPassed && safetyCheckPassedOrNotNeeded;
    isFailed = state.result.drivingResult === 'Underkänt' || (isSafetyCheckRequired && state.result.safetyCheckResult === 'Underkänt');
  }

  const drivingFail = state.result.drivingFailure;
  const safetyFail = state.result.safetyCheckFailure;

  return (
    <div className="bg-[#f2f4f7] min-h-full py-3 sm:py-8 print:bg-white print:py-0 print:p-0 w-full text-black font-sans leading-normal">
      
      {/* Officiell utskriftsmall för PDF / Skriv ut (syns bara vid utskrift) */}
      <div className="hidden print:block w-full bg-white print:m-0 print:p-0">
        <OfficialPrintLayout />
      </div>

      {/* Dynamic top tool-bar to match standalone Web App wrapper (hidden during printing) */}
      <div className="max-w-[730px] mx-auto mb-4 flex flex-col gap-3 print:hidden px-2 sm:px-3">
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
          <Button 
            variant="secondary" 
            onClick={() => navigate('/korprov/resultat')} 
            className="rounded-xl border border-gray-300 bg-white hover:bg-gray-100 text-gray-700 px-5 py-3 text-sm shadow-none w-full md:w-auto text-center font-bold"
          >
            Tillbaka till Beslut
          </Button>
          
          <div className="flex flex-wrap items-center justify-end gap-2 w-full md:w-auto">
            <Button 
              variant="outline" 
              onClick={handlePrint} 
              className="bg-white rounded-xl px-3 sm:px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-100 shadow-none text-xs font-semibold flex items-center justify-center gap-1.5"
            >
              <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              <span>Skriv ut</span>
            </Button>

            <Button 
              variant="outline" 
              onClick={() => {
                const appUrl = window.location.origin;
                const mailtoLink = `mailto:${state.properties.email || ''}?subject=Resultat%20på%20ditt%20körprov%20${licenseType}&body=Hej!%0D%0A%0D%0AHär%20är%20länken%20till%20provprotokollssystemet:%0D%0A${encodeURIComponent(appUrl)}%0D%0A%0D%0AVänliga%20hälsningar`;
                window.location.href = mailtoLink;
              }}
              className="bg-white rounded-xl px-3 sm:px-4 py-2 border border-blue-200 text-blue-700 hover:bg-blue-50 shadow-none text-xs font-semibold flex items-center justify-center gap-1.5"
            >
              <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>Mejla länk</span>
            </Button>

            <Button 
              variant="outline" 
              onClick={handleDownloadHTML} 
              className="bg-white rounded-xl px-3 sm:px-4 py-2 border border-indigo-200 text-indigo-700 hover:bg-indigo-50 shadow-none text-xs font-semibold flex items-center justify-center gap-1.5"
              title="Ladda ned officiellt protokoll som HTML-fil"
            >
              <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              <span>Ladda ned HTML</span>
            </Button>

            <Button 
              variant="outline" 
              onClick={handleDownloadPDF} 
              className="bg-white rounded-xl px-3 sm:px-4 py-2 border border-teal-200 text-teal-700 hover:bg-teal-50 shadow-none text-xs font-semibold flex items-center justify-center gap-1.5"
            >
              <svg className="w-4 h-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Hämta PDF</span>
            </Button>
            
            <Button 
              onClick={() => setShowConfirmModal(true)} 
              className="bg-emerald-600 hover:bg-emerald-700 text-white border-transparent rounded-xl px-4 sm:px-5 py-2 shadow-sm font-bold text-xs transition-all flex items-center justify-center"
            >
              Spara & Slutför
            </Button>
          </div>
        </div>

        {/* View Selection Tabs */}
        <div className="flex border border-gray-255 bg-white p-1 rounded-xl shadow-sm">
          <button
            onClick={() => setActiveTab('beslut')}
            className={`flex-1 py-3 px-2 text-center font-bold text-[13px] sm:text-[14px] flex items-center justify-center gap-1.5 transition-all rounded-lg ${
              activeTab === 'beslut'
                ? 'bg-red-50 text-[#DD1D25]'
                : 'text-gray-500 hover:text-black hover:bg-gray-50'
            }`}
          >
            <span>Digitalt Provprotokoll</span>
          </button>
          <button
            onClick={() => setActiveTab('email')}
            className={`flex-1 py-3 px-2 text-center font-bold text-[13px] sm:text-[14px] flex items-center justify-center gap-1.5 transition-all rounded-lg ${
              activeTab === 'email'
                ? 'bg-red-50 text-[#DD1D25]'
                : 'text-gray-500 hover:text-black hover:bg-gray-50'
            }`}
          >
            <span>Mottagarens E-post</span>
          </button>
        </div>
      </div>

      {/* Main Document Canvas */}
      <div 
        className="max-w-[730px] mx-auto bg-white w-full sm:rounded-2xl border-y sm:border border-gray-200 sm:shadow-lg p-4 sm:p-8 md:p-10 text-black print:hidden relative"
        style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
      >
        
        {/* Email mock helper view */}
        {activeTab === 'email' && (
          <div className="mb-4 border border-gray-200 bg-gray-50 p-4 rounded-none space-y-1 text-xs text-gray-700 print:hidden" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
            <div className="flex border-b border-gray-200 pb-1">
              <span className="w-16 font-bold text-gray-400 uppercase tracking-wider text-[9px]">Från:</span>
              <span className="text-gray-950 font-semibold">Digitalt Provprotokoll &lt;noreply@provprotokoll.se&gt;</span>
            </div>
            <div className="flex border-b border-gray-200 pb-1">
              <span className="w-16 font-bold text-gray-400 uppercase tracking-wider text-[9px]">Till:</span>
              <span className="text-blue-600 font-medium">{state.properties.email || 'kandidat@exempel.se'}</span>
            </div>
            <div className="flex border-b border-gray-200 pb-1">
              <span className="w-16 font-bold text-gray-400 uppercase tracking-wider text-[9px]">Datum:</span>
              <span className="text-gray-800">{state.properties.testDate || new Date().toLocaleDateString('sv-SE')} – 16:45</span>
            </div>
            <div className="flex">
              <span className="w-16 font-bold text-gray-400 uppercase tracking-wider text-[9px]">Ämne:</span>
              <span className="text-black font-bold text-[12px]">Resultat på ditt körprov – {state.properties.testType || 'Körprov'} ({licenseType})</span>
            </div>
            <div className="pt-2 pb-1 border-t border-gray-200 text-gray-800 text-xs leading-relaxed space-y-2">
              <p>Hej!</p>
              <p>Här kommer beslutet för ditt nyligen genomförda körprov. Provresultat och fullständigt protokoll finner du i dokumentet nedan.</p>
              <p>Med vänlig hälsning,<br /><span className="font-bold">Digitalt Provprotokoll</span></p>
              <div className="h-px bg-gray-300 my-2" />
            </div>
          </div>
        )}

        {/* TRV Style Document Wrapper */}
        <OfficialPrintLayout />
      </div>

      {/* Dynamic reporting confirmation dialog */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm transition-opacity" 
            onClick={() => setShowConfirmModal(false)}
          />
          
          {/* Modal Box */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-850 w-full max-w-md p-6 relative z-10 shadow-2xl rounded-xl animate-in zoom-in-95 duration-150">
            <div className="flex items-start gap-4">
              <div className={`p-3 shrink-0 rounded-xl ${
                isPassed 
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-450' 
                  : 'bg-red-50 dark:bg-red-950/30 text-[#DD1D25] dark:text-red-400'
              }`}>
                {isPassed ? <FileCheck className="w-6 h-6 shrink-0" /> : <AlertTriangle className="w-6 h-6 shrink-0" />}
              </div>
              
              <div className="space-y-2 w-full">
                <h3 className="text-lg font-black text-gray-950 dark:text-white uppercase tracking-tight font-display">
                  Bekräfta rapportering
                </h3>
                
                <p className="text-sm text-gray-650 dark:text-zinc-300 leading-relaxed font-semibold">
                  {isPassed 
                    ? "Vill du verkligen godkänna provet och rapportera till Transportstyrelsen?"
                    : "Vill du verkligen underkänna provet och rapportera till Transportstyrelsen?"
                  }
                </p>
                
                <div className="bg-gray-50 dark:bg-zinc-800/40 p-3.5 text-xs text-gray-500 dark:text-zinc-400 font-medium space-y-1.5 rounded-lg border border-gray-150 dark:border-zinc-800">
                  <div className="flex justify-between items-center">
                    <span className="uppercase text-[10px] tracking-wider text-gray-400">Kandidat:</span>
                    <strong className="text-gray-900 dark:text-zinc-150">{state.properties.studentName || 'Saknas'}</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="uppercase text-[10px] tracking-wider text-gray-400 font-mono">Personnr:</span>
                    <strong className="text-gray-900 dark:text-zinc-150 font-mono">{state.properties.personalNumber || 'Saknas'}</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="uppercase text-[10px] tracking-wider text-gray-400">Behörighet:</span>
                    <strong className="text-gray-900 dark:text-zinc-150">{state.properties.licenseType || 'B'} ({state.properties.transmission})</strong>
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t border-gray-200/50 dark:border-zinc-800">
                    <span className="uppercase text-[10px] tracking-wider text-gray-400">Slutbetyg:</span>
                    <strong className={`font-black text-xs ${isPassed ? 'text-emerald-600 dark:text-emerald-400' : 'text-[#DD1D25] dark:text-red-400'}`}>
                      {isPassed ? 'GODKÄNT' : 'UNDERKÄNT'}
                    </strong>
                  </div>
                </div>
                
                <p className="text-[10px] text-gray-400 dark:text-zinc-500 leading-relaxed pt-1">
                  Detta beslut registreras permanent hos Transportstyrelsen och kan inte ändras i efterhand via det här gränssnittet. Resultatet skickas även direkt till kandidatens e-post.
                </p>
              </div>
            </div>
            
            <div className="mt-6 flex flex-col sm:flex-row gap-2 justify-end">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="w-full sm:w-auto px-5 py-2.5 bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-700 border border-gray-300 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer rounded-xl"
              >
                Avbryt
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowConfirmModal(false);
                  handleComplete();
                }}
                className={`w-full sm:w-auto px-6 py-2.5 text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer rounded-xl flex items-center justify-center gap-1.5 ${
                  isPassed 
                    ? 'bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500' 
                    : 'bg-[#DD1D25] hover:bg-[#b51d1b]'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>Sänd beslut</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
