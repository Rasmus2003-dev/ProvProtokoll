import { useState } from 'react';
import { useAppStore } from '../../store/ProvContext';
import { Button } from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { OfficialPrintLayout } from './components/OfficialPrintLayout';
import { AlertTriangle, Send, FileCheck, Mail, Copy, Check, Loader2, MailCheck, MailX } from 'lucide-react';
import { downloadProtocolHtml, downloadEmailProtocolHtml, generateEmailProtocolHtml, printProtocol } from '../../lib/generateProtocolHtml';
import { useToast } from '../../components/Toast';

export function ProtokollScreen() {
  const { state, saveTest, resetCurrentTest, profile } = useAppStore();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'email' | 'beslut'>('beslut');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [copiedEmailHtml, setCopiedEmailHtml] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isGeneratingHtml, setIsGeneratingHtml] = useState(false);
  const [isGeneratingEmailHtml, setIsGeneratingEmailHtml] = useState(false);
  const [sendStatus, setSendStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [sendError, setSendError] = useState<string | null>(null);
  const [deliveryStatus, setDeliveryStatus] = useState<'idle' | 'checking' | 'delivered' | 'bounced' | 'blocked' | 'spam' | 'pending' | 'unknown'>('idle');
  const [confirmResultChecked, setConfirmResultChecked] = useState(false);
  const [confirmReportChecked, setConfirmReportChecked] = useState(false);
  const [confirmEmailChecked, setConfirmEmailChecked] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);

  // Både "Skriv ut" och "Hämta PDF" går via samma printProtocol-funktion,
  // som renderar exakt samma HTML-källa som mejlet och HTML-nedladdningen -
  // garanterat identisk layout istället för en separat manuellt uppbyggd
  // PDF som kan hamna i otakt med protokollets faktiska utseende.
  const handlePrint = () => {
    printProtocol(state, profile?.name);
  };

  const handleDownloadPDF = () => {
    setIsGeneratingPdf(true);
    setTimeout(() => {
      printProtocol(state, profile?.name);
      setIsGeneratingPdf(false);
    }, 50);
  };

  const handleDownloadHTML = () => {
    setIsGeneratingHtml(true);
    setTimeout(() => {
      downloadProtocolHtml(state, profile?.name);
      setIsGeneratingHtml(false);
    }, 50);
  };

  const handleDownloadEmailHTML = () => {
    setIsGeneratingEmailHtml(true);
    setTimeout(() => {
      downloadEmailProtocolHtml(state, profile?.name);
      setIsGeneratingEmailHtml(false);
    }, 50);
  };

  const handleCopyEmailHTML = () => {
    const html = generateEmailProtocolHtml(state, profile?.name);
    navigator.clipboard.writeText(html).then(() => {
      setCopiedEmailHtml(true);
      setTimeout(() => setCopiedEmailHtml(false), 2500);
    });
  };

  const sendProtocolEmail = async (): Promise<{ success: boolean; error?: string; messageId?: string | null }> => {
    const recipient = state.properties.email;
    if (!recipient) {
      return { success: false, error: 'Kandidatens e-postadress saknas.' };
    }

    try {
      const html = generateEmailProtocolHtml(state, profile?.name);
      const res = await fetch('/api/send-protocol', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: recipient,
          toName: state.properties.studentName,
          subject: 'Körprovsresultat',
          html,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        return { success: false, error: data.error || 'Kunde inte skicka mejlet.' };
      }
      const data = await res.json().catch(() => ({}));
      return { success: true, messageId: data.messageId || null };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Ett oväntat fel inträffade.' };
    }
  };

  // "sent" från Brevo betyder bara att mejlet togs emot för utskick, inte att
  // det faktiskt nådde mottagarens inkorg. Poll:ar Brevos event-API några
  // gånger (leveranshändelser dyker ofta upp med någon sekunds fördröjning)
  // för att visa den faktiska leveransstatusen istället för att bara lita på
  // att skicka-anropet lyckades.
  const pollDeliveryStatus = async (recipient: string, messageId: string | null | undefined) => {
    setDeliveryStatus('checking');
    const maxAttempts = 5;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      try {
        const params = new URLSearchParams();
        if (messageId) params.set('messageId', messageId);
        params.set('email', recipient);
        const res = await fetch(`/api/send-protocol-status?${params.toString()}`);
        if (!res.ok) continue;
        const data = await res.json();

        if (data.status === 'delivered' || data.status === 'opened' || data.status === 'clicks') {
          setDeliveryStatus('delivered');
          return;
        }
        if (data.status === 'hardBounces' || data.status === 'softBounces') {
          setDeliveryStatus('bounced');
          return;
        }
        if (data.status === 'blocked' || data.status === 'invalid' || data.status === 'error') {
          setDeliveryStatus('blocked');
          return;
        }
        if (data.status === 'spam') {
          setDeliveryStatus('spam');
          return;
        }
        // 'sent' eller 'pending': fortsätt polla
      } catch (_) {
        // fortsätt polla vid tillfälligt nätverksfel
      }
    }
    setDeliveryStatus('pending');
  };

  const handleSendEmail = async () => {
    setSendStatus('sending');
    setSendError(null);
    setDeliveryStatus('idle');
    const result = await sendProtocolEmail();
    if (result.success) {
      setSendStatus('sent');
      const recipient = state.properties.email;
      if (recipient) {
        pollDeliveryStatus(recipient, result.messageId);
      }
    } else {
      setSendStatus('error');
      setSendError(result.error || 'Ett oväntat fel inträffade.');
    }
  };

  // Körs efter att inspektören uttryckligen bockat i alla tre bekräftelserutor
  // i dialogen: (1) resultatet stämmer, (2) rapportering till Transportstyrelsen,
  // (3) mejl till kandidaten. Skickar faktiskt mejlet (om e-post finns) istället
  // för att bara påstå att det görs, sparar protokollet och nollställer provet.
  const handleComplete = async () => {
    setIsFinalizing(true);

    if (state.properties.email) {
      const emailResult = await sendProtocolEmail();
      if (!emailResult.success) {
        showToast(
          `Protokollet sparas ändå, men mejlet gick inte att skicka (${emailResult.error || 'okänt fel'}).`,
          'warning'
        );
      }
    }

    const saveResult = await saveTest();
    if (!saveResult.success) {
      showToast(
        `Protokollet är sparat lokalt, men molnsynk misslyckades (${saveResult.error || 'okänt fel'}). Synkas automatiskt när anslutningen är tillbaka.`,
        'warning'
      );
    } else {
      showToast('Protokollet sparat, rapporterat och synkat.', 'success');
    }

    setIsFinalizing(false);
    resetCurrentTest();
    navigate('/');
  };

  const licenseType = state.properties.licenseType || 'B';
  const HEAVY_LICENSES = ['C1', 'C', 'C1E', 'CE', 'D1', 'D', 'D1E', 'DE'];
  
  const isSafetyCheckRequired = [...HEAVY_LICENSES, 'BE'].includes(licenseType);
  
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
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
          <Button 
            variant="secondary" 
            onClick={() => navigate('/korprov/resultat')} 
            className="rounded-xl border border-gray-300 bg-white hover:bg-gray-100 text-gray-700 px-4 py-2.5 sm:py-3 text-xs sm:text-sm shadow-none w-full sm:w-auto text-center font-bold"
          >
            Tillbaka till Beslut
          </Button>
          
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center justify-end gap-2 w-full sm:w-auto">
            <Button 
              variant="outline" 
              onClick={handlePrint} 
              className="bg-white rounded-xl px-2.5 sm:px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-100 shadow-none text-xs font-semibold flex items-center justify-center gap-1.5"
            >
              <svg className="w-4 h-4 text-gray-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
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
              className="bg-white rounded-xl px-2.5 sm:px-4 py-2 border border-blue-200 text-blue-700 hover:bg-blue-50 shadow-none text-xs font-semibold flex items-center justify-center gap-1.5"
            >
              <svg className="w-4 h-4 text-blue-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>Mejla länk</span>
            </Button>

            <Button 
              variant="outline" 
              onClick={() => setShowEmailModal(true)} 
              className="bg-white rounded-xl px-2.5 sm:px-4 py-2 border border-violet-200 text-violet-700 hover:bg-violet-50 shadow-none text-xs font-semibold flex items-center justify-center gap-1.5"
              title="Generera och förhandsgranska HTML-mejl med protokollet"
            >
              <Mail className="w-4 h-4 text-violet-600 shrink-0" />
              <span>HTML-mejl</span>
            </Button>

            <Button
              variant="outline"
              onClick={handleDownloadPDF}
              disabled={isGeneratingPdf}
              title="Öppnar utskriftsdialogen - välj 'Spara som PDF' för att ladda ner"
              className="bg-white rounded-xl px-2.5 sm:px-4 py-2 border border-teal-200 text-teal-700 hover:bg-teal-50 shadow-none text-xs font-semibold flex items-center justify-center gap-1.5 disabled:opacity-70 disabled:cursor-wait transition-opacity"
            >
              {isGeneratingPdf ? (
                <Loader2 className="w-4 h-4 text-teal-600 shrink-0 animate-spin" />
              ) : (
                <svg className="w-4 h-4 text-teal-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              )}
              <span>{isGeneratingPdf ? 'Öppnar...' : 'Spara som PDF'}</span>
            </Button>

            <Button
              variant="outline"
              onClick={handleDownloadHTML}
              disabled={isGeneratingHtml}
              className="bg-white rounded-xl px-2.5 sm:px-4 py-2 border border-indigo-200 text-indigo-700 hover:bg-indigo-50 shadow-none text-xs font-semibold flex items-center justify-center gap-1.5 col-span-1 sm:col-span-auto disabled:opacity-70 disabled:cursor-wait transition-opacity"
              title="Ladda ned officiellt protokoll som HTML-fil"
            >
              {isGeneratingHtml ? (
                <Loader2 className="w-4 h-4 text-indigo-600 shrink-0 animate-spin" />
              ) : (
                <svg className="w-4 h-4 text-indigo-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              )}
              <span>{isGeneratingHtml ? 'Genererar...' : 'HTML'}</span>
            </Button>
            
            <Button
              onClick={() => {
                setConfirmResultChecked(false);
                setConfirmReportChecked(false);
                setConfirmEmailChecked(false);
                setShowConfirmModal(true);
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white border-transparent rounded-xl px-3 sm:px-5 py-2 shadow-sm font-bold text-xs transition-all flex items-center justify-center col-span-1 sm:col-span-auto"
            >
              Spara och slutför
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
          <div className="mb-4 border border-gray-200 bg-gray-50 p-4 rounded-xl space-y-3 text-xs text-gray-700 print:hidden" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
            <div className="flex items-center justify-between pb-2 border-b border-gray-200">
              <span className="font-bold text-gray-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Mail size={14} className="text-violet-600" />
                Automatisk HTML-mejl förhandsvisning
              </span>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopyEmailHTML}
                  className="bg-white hover:bg-violet-50 text-violet-700 border-violet-200 text-xs h-8 px-3 rounded-lg flex items-center gap-1.5 font-bold"
                >
                  {copiedEmailHtml ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                  <span>{copiedEmailHtml ? 'Kopierat' : 'Kopiera HTML-kod'}</span>
                </Button>
                <Button
                  size="sm"
                  onClick={handleDownloadEmailHTML}
                  disabled={isGeneratingEmailHtml}
                  className="bg-violet-600 hover:bg-violet-700 text-white text-xs h-8 px-3 rounded-lg flex items-center gap-1.5 font-bold disabled:opacity-70 disabled:cursor-wait transition-opacity"
                >
                  {isGeneratingEmailHtml && <Loader2 size={13} className="animate-spin" />}
                  <span>{isGeneratingEmailHtml ? 'Genererar...' : 'Ladda ned HTML-mejl'}</span>
                </Button>
              </div>
            </div>
            <div className="flex border-b border-gray-200 pb-1">
              <span className="w-16 font-bold text-gray-400 uppercase tracking-wider text-[9px]">Från:</span>
              <span className="text-gray-950 font-semibold">ProvProtokoll &lt;info@rasmusl.se&gt;</span>
            </div>
            <div className="flex border-b border-gray-200 pb-1">
              <span className="w-16 font-bold text-gray-400 uppercase tracking-wider text-[9px]">Till:</span>
              <span className="text-blue-600 font-medium">{state.properties.email || 'kandidat@exempel.se'}</span>
            </div>
            <div className="flex border-b border-gray-200 pb-1">
              <span className="w-16 font-bold text-gray-400 uppercase tracking-wider text-[9px]">Datum:</span>
              <span className="text-gray-800">{state.properties.testDate || new Date().toLocaleDateString('sv-SE')} – {new Date().toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div className="flex">
              <span className="w-16 font-bold text-gray-400 uppercase tracking-wider text-[9px]">Ämne:</span>
              <span className="text-black font-bold text-[12px]">Körprovsresultat</span>
            </div>

            <div className="pt-3 border-t border-gray-200 flex items-center justify-between gap-3">
              <div className="text-[11px] text-gray-500">
                {sendStatus === 'error' && sendError && (
                  <span className="text-red-600 font-semibold">{sendError}</span>
                )}
                {sendStatus === 'sent' && deliveryStatus === 'checking' && (
                  <span className="text-blue-600 font-semibold flex items-center gap-1.5">
                    <Loader2 size={12} className="animate-spin" /> Skickat, kontrollerar leverans...
                  </span>
                )}
                {sendStatus === 'sent' && deliveryStatus === 'delivered' && (
                  <span className="text-emerald-600 font-semibold">✓ Levererat till kandidatens inkorg.</span>
                )}
                {sendStatus === 'sent' && deliveryStatus === 'bounced' && (
                  <span className="text-red-600 font-semibold">✗ Levererades inte (studsade) – kontrollera e-postadressen.</span>
                )}
                {sendStatus === 'sent' && deliveryStatus === 'blocked' && (
                  <span className="text-red-600 font-semibold">✗ Blockerades av mottagarens mejlserver.</span>
                )}
                {sendStatus === 'sent' && deliveryStatus === 'spam' && (
                  <span className="text-amber-600 font-semibold">⚠ Markerades som skräppost hos mottagaren.</span>
                )}
                {sendStatus === 'sent' && deliveryStatus === 'pending' && (
                  <span className="text-amber-600 font-semibold">Skickat – leveransstatus inte bekräftad än (kan ta någon minut).</span>
                )}
                {sendStatus === 'idle' && !state.properties.email && (
                  <span className="text-amber-600 font-semibold">Ingen e-postadress angiven för kandidaten.</span>
                )}
              </div>
              <Button
                size="sm"
                onClick={handleSendEmail}
                disabled={sendStatus === 'sending' || !state.properties.email}
                className={`text-white text-xs h-9 px-4 rounded-lg flex items-center gap-1.5 font-bold shrink-0 disabled:opacity-60 disabled:cursor-not-allowed transition-opacity ${
                  sendStatus === 'sent' ? 'bg-emerald-600 hover:bg-emerald-600' : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {sendStatus === 'sending' && <Loader2 size={14} className="animate-spin" />}
                {sendStatus === 'sent' && <MailCheck size={14} />}
                {sendStatus === 'error' && <MailX size={14} />}
                {sendStatus === 'idle' && <Send size={14} />}
                <span>
                  {sendStatus === 'sending' ? 'Skickar...' : sendStatus === 'sent' ? 'Skickat igen' : sendStatus === 'error' ? 'Försök igen' : 'Skicka till kandidaten'}
                </span>
              </Button>
            </div>
            <div className="pt-2 pb-1 border-t border-gray-200 text-gray-800 text-xs leading-relaxed space-y-2">
              <p>Hej {state.properties.studentName || 'Kandidat'}!</p>
              <p>Här kommer beslutet för ditt nyligen genomförda körprov. Provresultat och fullständigt protokoll finner du i dokumentet nedan.</p>
              <p>Med vänlig hälsning,<br /><span className="font-bold">Digitalt Provprotokoll Sverige</span></p>
              <div className="h-px bg-gray-300 my-2" />
            </div>
          </div>
        )}

        {/* TRV Style Document Wrapper */}
        <div className="overflow-x-auto -mx-2 px-2 sm:mx-0 sm:px-0">
          <OfficialPrintLayout />
        </div>
      </div>

      {/* HTML Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6">
          <div 
            className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm transition-opacity" 
            onClick={() => setShowEmailModal(false)}
          />
          
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 w-full max-w-3xl max-h-[90vh] flex flex-col relative z-10 shadow-2xl rounded-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between bg-slate-50 dark:bg-zinc-850">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300 flex items-center justify-center">
                  <Mail size={18} />
                </div>
                <div>
                  <h3 className="text-base font-black text-gray-900 dark:text-white uppercase tracking-tight">
                    Genererat HTML-e-postmeddelande
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    Klar för att klistras in i e-postklient (Outlook, Gmail) eller skickas direkt.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEmailModal(false)}
                className="w-8 h-8 rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-700 flex items-center justify-center text-gray-500 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Email Preview Frame */}
            <div className="flex-1 overflow-y-auto p-4 bg-slate-100 dark:bg-zinc-950">
              <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-2">
                <iframe
                  title="HTML Email Preview"
                  srcDoc={generateEmailProtocolHtml(state, profile?.name)}
                  className="w-full min-h-[500px] rounded-lg border-0"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-gray-500 dark:text-slate-400">
                Skickas till: <strong className="text-gray-900 dark:text-white">{state.properties.email || 'Saknar angiven e-post'}</strong>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={handleCopyEmailHTML}
                  className="border-gray-300 dark:border-zinc-700 text-xs font-bold flex items-center gap-1.5 h-10 px-4 rounded-xl"
                >
                  {copiedEmailHtml ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  <span>{copiedEmailHtml ? 'HTML-kod kopierad' : 'Kopiera HTML-kod'}</span>
                </Button>
                <Button
                  onClick={handleDownloadEmailHTML}
                  className="bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold flex items-center gap-1.5 h-10 px-5 rounded-xl shadow-sm"
                >
                  <span>Ladda ned .html-fil</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic reporting confirmation dialog */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm transition-opacity" 
            onClick={() => setShowConfirmModal(false)}
          />
          
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-850 w-full max-w-md p-6 relative z-10 shadow-2xl rounded-xl animate-in zoom-in-95 duration-150">
            <div className="flex items-start gap-4">
              <div className={`p-3 shrink-0 rounded-xl ${
                isPassed 
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-450' 
                  : 'bg-red-50 dark:bg-red-950/30 text-[#DD1D25] dark:text-red-400'
              }`}>
                {isPassed ? <FileCheck className="w-6 h-6 shrink-0" /> : <AlertTriangle className="w-6 h-6 shrink-0" />}
              </div>
              
              <div className="space-y-3 w-full">
                <h3 className="text-lg font-black text-gray-950 dark:text-white uppercase tracking-tight font-display">
                  Bekräfta rapportering
                </h3>

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

                {/* Obligatoriska bekräftelserutor så man inte råkar skicka fel resultat av misstag */}
                <div className="space-y-2 pt-1">
                  <label className="flex items-start gap-2.5 p-2.5 rounded-lg border border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={confirmResultChecked}
                      onChange={(e) => setConfirmResultChecked(e.target.checked)}
                      className="mt-0.5 w-4 h-4 shrink-0 accent-emerald-600 cursor-pointer"
                    />
                    <span className="text-xs text-gray-700 dark:text-zinc-300 font-semibold leading-snug">
                      Jag har kontrollerat att slutbetyget{' '}
                      <strong className={isPassed ? 'text-emerald-600 dark:text-emerald-400' : 'text-[#DD1D25] dark:text-red-400'}>
                        {isPassed ? 'GODKÄNT' : 'UNDERKÄNT'}
                      </strong>{' '}
                      är korrekt för {state.properties.studentName || 'kandidaten'}.
                    </span>
                  </label>

                  <label className="flex items-start gap-2.5 p-2.5 rounded-lg border border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={confirmReportChecked}
                      onChange={(e) => setConfirmReportChecked(e.target.checked)}
                      className="mt-0.5 w-4 h-4 shrink-0 accent-emerald-600 cursor-pointer"
                    />
                    <span className="text-xs text-gray-700 dark:text-zinc-300 font-semibold leading-snug">
                      Jag vill godkänna och rapportera detta beslut till Transportstyrelsen. Detta registreras permanent och kan inte ändras i efterhand via det här gränssnittet.
                    </span>
                  </label>

                  <label className="flex items-start gap-2.5 p-2.5 rounded-lg border border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={confirmEmailChecked}
                      onChange={(e) => setConfirmEmailChecked(e.target.checked)}
                      disabled={!state.properties.email}
                      className="mt-0.5 w-4 h-4 shrink-0 accent-emerald-600 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                    />
                    <span className="text-xs text-gray-700 dark:text-zinc-300 font-semibold leading-snug">
                      {state.properties.email
                        ? <>Skicka protokollet till kandidatens e-post: <strong className="text-gray-900 dark:text-zinc-150">{state.properties.email}</strong></>
                        : 'Ingen e-postadress angiven för kandidaten – mejl kan inte skickas.'
                      }
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-2 justify-end">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                disabled={isFinalizing}
                className="w-full sm:w-auto px-5 py-2.5 bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-700 border border-gray-300 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Avbryt
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowConfirmModal(false);
                  handleComplete();
                }}
                disabled={!confirmResultChecked || !confirmReportChecked || (!!state.properties.email && !confirmEmailChecked) || isFinalizing}
                className={`w-full sm:w-auto px-6 py-2.5 text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer rounded-xl flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed ${
                  isPassed
                    ? 'bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500'
                    : 'bg-[#DD1D25] hover:bg-[#b51d1b]'
                }`}
              >
                {isFinalizing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>{isFinalizing ? 'Skickar...' : 'Sänd beslut'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
