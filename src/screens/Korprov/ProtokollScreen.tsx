import { useEffect, useMemo, useRef, useState } from 'react';
import { useBackToClose } from '../../hooks/useBackToClose';
import { AppLogo } from '../../components/icons/AppLogo';
import { useAppStore } from '../../store/ProvContext';
import { useNavigate } from 'react-router-dom';
import { OfficialPrintLayout } from './components/OfficialPrintLayout';
import { TrafiklararProtokollView } from './components/TrafiklararProtokollView';
import { AlertTriangle, Send, FileCheck, Mail, Copy, Check, Loader2, MailCheck, MailX, ArrowLeft, Printer, FileDown, Code2, Share2, GraduationCap, X, CircleCheck, CircleX, CircleSlash, CircleDashed, PenLine } from 'lucide-react';
import { downloadProtocolHtml, downloadEmailProtocolHtml, generateEmailProtocolHtml, printProtocol } from '../../lib/generateProtocolHtml';
import { authHeaders } from '../../lib/inspectors';
import { useToast } from '../../components/Toast';
import { Portal } from '../../components/Portal';
import { triggerHaptic } from '../../lib/utils';
import { CandidateShareModal } from './components/CandidateShareModal';
import { EmailComposerModal } from '../../components/EmailComposerModal';
import { isDemoMode } from '../../lib/demoMode';

type Tab = 'beslut' | 'larare' | 'email';
type Verdict = 'pass' | 'fail' | 'aborted' | 'pending';

const TABS: { id: Tab; label: string; short: string; icon: typeof FileCheck }[] = [
  { id: 'beslut', label: 'Officiellt protokoll', short: 'Beslut', icon: FileCheck },
  { id: 'larare', label: 'Lärarprotokoll', short: 'Lärare', icon: GraduationCap },
  { id: 'email', label: 'E-post till kandidaten', short: 'E-post', icon: Mail },
];

const VERDICT_STYLE: Record<Verdict, { label: string; icon: typeof CircleCheck; badge: string; bar: string }> = {
  pass: {
    label: 'Godkänt',
    icon: CircleCheck,
    badge: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/30',
    bar: 'bg-emerald-500',
  },
  fail: {
    label: 'Underkänt',
    icon: CircleX,
    badge: 'bg-red-50 text-[#b51d1b] ring-red-600/20 dark:bg-red-500/10 dark:text-red-300 dark:ring-red-400/30',
    bar: 'bg-[#D42220]',
  },
  aborted: {
    label: 'Avbrutet',
    icon: CircleSlash,
    badge: 'bg-amber-50 text-amber-800 ring-amber-600/25 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-400/30',
    bar: 'bg-amber-500',
  },
  pending: {
    label: 'Ej fastställt',
    icon: CircleDashed,
    badge: 'bg-surface-2 text-ink-2 ring-line',
    bar: 'bg-ink-3',
  },
};

export function ProtokollScreen() {
  const { state, saveTest, resetCurrentTest, profile } = useAppStore();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>('beslut');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showCustomEmailComposer, setShowCustomEmailComposer] = useState(false);
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
  // Skydd mot dubbelklick: state hinner inte uppdateras mellan två snabba tryck
  const finalizingRef = useRef(false);
  // Androids bakåtknapp stänger öppna dialoger
  useBackToClose(showEmailModal, () => setShowEmailModal(false));
  useBackToClose(showConfirmModal, () => { if (!finalizingRef.current) setShowConfirmModal(false); });

  // Både "Skriv ut" och "Hämta PDF" går via samma printProtocol-funktion,
  // som renderar exakt samma HTML-källa som mejlet och HTML-nedladdningen -
  // garanterat identisk layout istället för en separat manuellt uppbyggd
  // PDF som kan hamna i otakt med protokollets faktiska utseende.
  const handlePrint = () => {
    if (activeTab === 'larare') {
      window.print();
    } else {
      printProtocol(state, profile?.name);
    }
  };

  const handleDownloadPDF = () => {
    setIsGeneratingPdf(true);
    setTimeout(() => {
      try {
        if (activeTab === 'larare') {
          window.print();
        } else {
          printProtocol(state, profile?.name);
        }
      } finally {
        setIsGeneratingPdf(false);
      }
    }, 50);
  };

  const handleDownloadHTML = () => {
    setIsGeneratingHtml(true);
    setTimeout(() => {
      try {
        downloadProtocolHtml(state, profile?.name);
      } catch {
        showToast('Kunde inte skapa HTML-filen.', 'error');
      } finally {
        setIsGeneratingHtml(false);
      }
    }, 50);
  };

  const handleDownloadEmailHTML = () => {
    setIsGeneratingEmailHtml(true);
    setTimeout(() => {
      try {
        downloadEmailProtocolHtml(state, profile?.name);
      } catch {
        showToast('Kunde inte skapa HTML-mejlet.', 'error');
      } finally {
        setIsGeneratingEmailHtml(false);
      }
    }, 50);
  };

  const handleCopyEmailHTML = () => {
    const html = generateEmailProtocolHtml(state, profile?.name);
    if (!navigator.clipboard) {
      showToast('Urklipp stöds inte i den här webbläsaren.', 'warning');
      return;
    }
    navigator.clipboard.writeText(html).then(
      () => {
        setCopiedEmailHtml(true);
        setTimeout(() => setCopiedEmailHtml(false), 2500);
      },
      () => showToast('Kunde inte kopiera till urklipp.', 'error')
    );
  };

  const sendProtocolEmail = async (): Promise<{ success: boolean; error?: string; messageId?: string | null }> => {
    const recipient = state.properties.email;
    if (!recipient) {
      return { success: false, error: 'Kandidatens e-postadress saknas.' };
    }
    // Demokandidaterna är påhittade – inga riktiga mejl skickas i demoläge
    if (isDemoMode()) {
      return { success: false, error: 'Demoläge: inget mejl skickas till påhittade kandidater.' };
    }

    try {
      const html = generateEmailProtocolHtml(state, profile?.name);
      const res = await fetch('/api/send-protocol', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(await authHeaders()) },
        body: JSON.stringify({
          to: recipient,
          toName: state.properties.studentName,
          subject: 'Resultat från ditt körprov',
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
        const res = await fetch(`/api/send-protocol-status?${params.toString()}`, { headers: await authHeaders() });
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
  // Dialogen hålls öppen med spinner tills allt är klart.
  const handleComplete = async () => {
    if (finalizingRef.current) return;
    finalizingRef.current = true;
    setIsFinalizing(true);

    try {
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

      triggerHaptic('success');
      setShowConfirmModal(false);
      resetCurrentTest();
      navigate('/');
    } catch (e: any) {
      // Provet nollställs inte – inget går förlorat, inspektören kan försöka igen
      showToast(`Kunde inte slutföra: ${e?.message || 'okänt fel'}. Försök igen.`, 'error');
    } finally {
      finalizingRef.current = false;
      setIsFinalizing(false);
    }
  };

  const openConfirm = () => {
    triggerHaptic('medium');
    setConfirmResultChecked(false);
    setConfirmReportChecked(false);
    setConfirmEmailChecked(false);
    setShowConfirmModal(true);
  };

  // Esc stänger öppna dialoger (men aldrig mitt under slutförandet)
  useEffect(() => {
    if (!showConfirmModal && !showEmailModal) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (showEmailModal) setShowEmailModal(false);
      else if (!finalizingRef.current) setShowConfirmModal(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showConfirmModal, showEmailModal]);

  // Förhandsvisningen av mejlet byggs bara när dialogen är öppen
  const emailPreviewHtml = useMemo(
    () => (showEmailModal ? generateEmailProtocolHtml(state, profile?.name) : ''),
    [showEmailModal, state, profile?.name]
  );

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

  // Ett avbrutet prov är aldrig godkänt
  if (state.result.testAborted) {
    isPassed = false;
    isFailed = true;
  }

  const verdict: Verdict = state.result.testAborted ? 'aborted' : isPassed ? 'pass' : isFailed ? 'fail' : 'pending';
  const verdictStyle = VERDICT_STYLE[verdict];
  const VerdictIcon = verdictStyle.icon;

  const hasEmail = Boolean(state.properties.email);
  const allConfirmed = confirmResultChecked && confirmReportChecked && (!hasEmail || confirmEmailChecked);
  const testDate = state.properties.testDate || new Date().toLocaleDateString('sv-SE');

  const exportActions = [
    { key: 'share', label: 'Dela', icon: Share2, onClick: () => setShowShareModal(true), title: 'Dela unik länk och QR-kod till kandidaten' },
    { key: 'print', label: 'Skriv ut', icon: Printer, onClick: handlePrint, title: 'Skriv ut protokollet' },
    { key: 'pdf', label: isGeneratingPdf ? 'Öppnar…' : 'PDF', icon: isGeneratingPdf ? Loader2 : FileDown, onClick: handleDownloadPDF, disabled: isGeneratingPdf, spin: isGeneratingPdf, title: 'Öppnar utskriften – välj "Spara som PDF"' },
    { key: 'email', label: 'Mejl', icon: Mail, onClick: () => setShowEmailModal(true), title: 'Förhandsgranska och ladda ned mejlet med protokollet' },
    { key: 'html', label: isGeneratingHtml ? 'Skapar…' : 'HTML', icon: isGeneratingHtml ? Loader2 : Code2, onClick: handleDownloadHTML, disabled: isGeneratingHtml, spin: isGeneratingHtml, title: 'Ladda ned protokollet som HTML-fil' },
  ];

  const deliveryMessage = (() => {
    if (sendStatus === 'error' && sendError) return { tone: 'text-red-600 dark:text-red-400', text: sendError, spin: false };
    if (sendStatus === 'sent') {
      switch (deliveryStatus) {
        case 'checking': return { tone: 'text-blue-600 dark:text-blue-400', text: 'Skickat, kontrollerar leverans…', spin: true };
        case 'delivered': return { tone: 'text-emerald-600 dark:text-emerald-400', text: '✓ Levererat till kandidatens inkorg.', spin: false };
        case 'bounced': return { tone: 'text-red-600 dark:text-red-400', text: '✗ Levererades inte (studsade) – kontrollera e-postadressen.', spin: false };
        case 'blocked': return { tone: 'text-red-600 dark:text-red-400', text: '✗ Blockerades av mottagarens mejlserver.', spin: false };
        case 'spam': return { tone: 'text-amber-600 dark:text-amber-400', text: '⚠ Markerades som skräppost hos mottagaren.', spin: false };
        case 'pending': return { tone: 'text-amber-600 dark:text-amber-400', text: 'Skickat – leveransstatus inte bekräftad än (kan ta någon minut).', spin: false };
      }
    }
    if (sendStatus === 'idle' && !hasEmail) return { tone: 'text-amber-600 dark:text-amber-400', text: 'Ingen e-postadress angiven för kandidaten.', spin: false };
    return null;
  })();

  return (
    <div className="min-h-full pb-4 print:bg-white print:py-0 print:p-0 w-full font-sans leading-normal">

      {/* Officiell utskriftsmall för PDF / Skriv ut (syns bara vid utskrift) */}
      <div className="hidden print:block w-full bg-white text-black print:m-0 print:p-0">
        {activeTab === 'larare' ? (
          <div className="p-8 max-w-[760px] mx-auto">
            <TrafiklararProtokollView state={state} inspectorName={profile?.name} />
          </div>
        ) : (
          <OfficialPrintLayout />
        )}
      </div>

      <div className="max-w-[760px] mx-auto space-y-4 print:hidden">

        {/* Rubrik */}
        <header className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/korprov/resultat')}
            aria-label="Tillbaka till resultat"
            className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-ink-2 hover:text-ink hover:bg-surface-2 transition-colors cursor-pointer shrink-0"
          >
            <ArrowLeft size={20} />
          </button>
          <AppLogo variant="icon" size="sm" className="shrink-0" />
          <div className="min-w-0">
            <p className="text-[13px] text-ink-3 font-medium leading-tight">Körprov · Slutför</p>
            <h1 className="text-xl sm:text-2xl font-semibold text-ink tracking-tight leading-tight">Beslut &amp; protokoll</h1>
          </div>
        </header>

        {/* Sammanfattning av beslutet */}
        <section
          aria-label="Beslut"
          className="relative bg-surface border border-line rounded-card shadow-lift overflow-hidden"
        >
          <span className={`absolute inset-y-0 left-0 w-1 ${verdictStyle.bar}`} aria-hidden="true" />
          <div className="pl-5 pr-4 sm:pl-6 sm:pr-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`inline-flex items-center gap-1.5 h-7 pl-2 pr-2.5 rounded-full ring-1 ring-inset text-[13px] font-semibold ${verdictStyle.badge}`}>
                  <VerdictIcon size={15} strokeWidth={2.5} />
                  {verdictStyle.label}
                </span>
                {state.properties.testType && (
                  <span className="text-[13px] text-ink-3 font-medium">{state.properties.testType}</span>
                )}
              </div>
              <p className="mt-2 text-lg font-semibold text-ink truncate">
                {state.properties.studentName || 'Namn saknas'}
              </p>
              <dl className="mt-0.5 flex flex-wrap gap-x-4 gap-y-0.5 text-[13px] text-ink-2">
                <div className="flex gap-1"><dt className="sr-only">Personnummer</dt><dd className="tabular-nums">{state.properties.personalNumber || 'Personnr saknas'}</dd></div>
                <div className="flex gap-1"><dt className="text-ink-3">Behörighet</dt><dd className="font-medium text-ink">{licenseType}{state.properties.transmission ? ` · ${state.properties.transmission}` : ''}</dd></div>
                <div className="flex gap-1"><dt className="text-ink-3">Datum</dt><dd className="tabular-nums">{testDate}</dd></div>
              </dl>
            </div>

            <button
              type="button"
              onClick={() => navigate('/korprov/resultat')}
              className="self-start sm:self-center h-9 px-3 rounded-control text-[13px] font-medium text-ink-2 hover:text-ink border border-line hover:bg-surface-2 flex items-center gap-1.5 cursor-pointer transition-colors shrink-0"
            >
              <PenLine size={14} /> Ändra resultat
            </button>
          </div>
        </section>

        {/* Vyval och export */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="grid grid-cols-3 sm:inline-flex p-1 rounded-control bg-surface-2 border border-line" role="tablist" aria-label="Protokollvy">
            {TABS.map(({ id, label, short, icon: Icon }) => {
              const active = activeTab === id;
              return (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => { triggerHaptic('light'); setActiveTab(id); }}
                  className={`h-9 px-3 rounded-[9px] text-[13px] font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
                    active
                      ? 'bg-surface text-ink font-semibold shadow-lift'
                      : 'text-ink-2 hover:text-ink'
                  }`}
                >
                  <Icon size={15} className={active ? 'text-navy dark:text-blue-400' : ''} />
                  <span className="sm:hidden">{short}</span>
                  <span className="hidden sm:inline">{label}</span>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-5 sm:flex items-center gap-1">
            {exportActions.map(({ key, label, icon: Icon, onClick, disabled, spin, title }) => (
              <button
                key={key}
                type="button"
                onClick={onClick}
                disabled={disabled}
                title={title}
                aria-label={title}
                className="h-12 sm:h-9 sm:px-2.5 rounded-control text-[11px] sm:text-[13px] font-medium text-ink-2 hover:text-ink hover:bg-surface-2 flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 whitespace-nowrap cursor-pointer transition-colors disabled:opacity-60 disabled:cursor-wait"
              >
                <Icon size={16} className={`${spin ? 'animate-spin' : ''} ${key === 'share' ? 'text-navy dark:text-blue-400' : 'text-ink-3'}`} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* E-post: avsändarinfo och utskick */}
        {activeTab === 'email' && (
          <section className="bg-surface border border-line rounded-card shadow-lift overflow-hidden">
            <div className="px-4 sm:px-5 py-3 border-b border-line flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-[15px] font-semibold text-ink flex items-center gap-2">
                <Mail size={16} className="text-violet-600 dark:text-violet-400" /> Mejl till kandidaten
              </h2>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowCustomEmailComposer(true)}
                  title="Skicka fritextmejl, intyg, kallelse eller rapport i sidans officiella design"
                  className="h-8 px-2.5 rounded-control text-[13px] font-medium text-ink-2 hover:text-ink hover:bg-surface-2 flex items-center gap-1.5 cursor-pointer"
                >
                  <PenLine size={14} /> Fritext & mallar
                </button>
                <button
                  type="button"
                  onClick={handleCopyEmailHTML}
                  className="h-8 px-2.5 rounded-control text-[13px] font-medium text-ink-2 hover:text-ink hover:bg-surface-2 flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedEmailHtml ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  {copiedEmailHtml ? 'Kopierat' : 'Kopiera HTML'}
                </button>
                <button
                  type="button"
                  onClick={handleDownloadEmailHTML}
                  disabled={isGeneratingEmailHtml}
                  className="h-8 px-2.5 rounded-control text-[13px] font-medium text-ink-2 hover:text-ink hover:bg-surface-2 flex items-center gap-1.5 cursor-pointer disabled:opacity-60 disabled:cursor-wait"
                >
                  {isGeneratingEmailHtml ? <Loader2 size={14} className="animate-spin" /> : <FileDown size={14} />}
                  {isGeneratingEmailHtml ? 'Skapar…' : 'Ladda ned'}
                </button>
              </div>
            </div>

            <dl className="px-4 sm:px-5 py-2 text-[13px] divide-y divide-line">
              {[
                ['Från', <span className="text-ink font-medium">Trafikverket Förarprov &lt;info@rasmusl.se&gt;</span>],
                ['Till', <span className={hasEmail ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-ink-3 italic'}>{state.properties.email || 'Ingen e-post angiven'}</span>],
                ['Ämne', (
                  <span className="flex items-center gap-1.5 flex-wrap">
                    <span className="px-1.5 py-0.5 bg-blue-100 text-[#002f6c] dark:bg-blue-500/15 dark:text-blue-300 text-[10px] font-bold rounded uppercase tracking-wider">Officiellt</span>
                    <span className="text-ink font-semibold">Resultat från ditt körprov</span>
                  </span>
                )],
              ].map(([k, v]) => (
                <div key={k as string} className="flex items-baseline gap-3 py-2">
                  <dt className="w-12 shrink-0 text-ink-3">{k}</dt>
                  <dd className="min-w-0 break-words">{v}</dd>
                </div>
              ))}
            </dl>

            <div className="px-4 sm:px-5 py-3 border-t border-line bg-surface-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <p className="text-[13px] min-h-[1.25rem]" aria-live="polite">
                {deliveryMessage && (
                  <span className={`font-medium flex items-center gap-1.5 ${deliveryMessage.tone}`}>
                    {deliveryMessage.spin && <Loader2 size={13} className="animate-spin" />}
                    {deliveryMessage.text}
                  </span>
                )}
              </p>
              <button
                type="button"
                onClick={handleSendEmail}
                disabled={sendStatus === 'sending' || !hasEmail}
                className="h-10 px-4 rounded-control bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold flex items-center justify-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {sendStatus === 'sending' && <Loader2 size={15} className="animate-spin" />}
                {sendStatus === 'sent' && <MailCheck size={15} />}
                {sendStatus === 'error' && <MailX size={15} />}
                {sendStatus === 'idle' && <Send size={15} />}
                {sendStatus === 'sending' ? 'Skickar…' : sendStatus === 'sent' ? 'Skicka igen' : sendStatus === 'error' ? 'Försök igen' : 'Skicka till kandidaten'}
              </button>
            </div>
          </section>
        )}

        {/* Dokumentet – protokolldesignen är oförändrad, bara ramen runt är ny */}
        <div>
          <div className="flex items-center justify-between px-1 mb-2 text-[12px] text-ink-3 font-medium">
            <span>Förhandsgranskning</span>
            <span>{activeTab === 'larare' ? 'Internt · lämnas inte ut' : activeTab === 'email' ? 'Som mejlet ser ut i kandidatens inkorg' : 'Som kandidaten ser det'}</span>
          </div>
          <div
            data-protocol
            className="bg-white w-full rounded-card border border-line shadow-float p-4 sm:p-8 md:p-10 text-black relative"
            style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
          >
            {activeTab === 'email' && (
              <div className="mb-6 text-black text-[11pt] leading-normal font-sans">
                <p className="m-0 mb-4">Hej!</p>
                <p className="m-0 mb-4">Du har nyligen gjort körprov hos oss. Resultatet kan du läsa nedan.</p>
                <p className="m-0 mb-5">Vänliga hälsningar,<br /><strong>Trafikverket Förarprov</strong></p>
                <hr className="border-0 border-t border-black m-0 mb-6" />
              </div>
            )}

            {activeTab === 'larare' ? (
              <TrafiklararProtokollView state={state} inspectorName={profile?.name} />
            ) : (
              <div className="overflow-x-auto -mx-2 px-2 sm:mx-0 sm:px-0">
                <OfficialPrintLayout />
              </div>
            )}

            {activeTab === 'email' && (
              <div className="mt-8 pt-4 border-t border-gray-200 text-gray-500 text-[9.5pt] leading-relaxed font-sans">
                <p className="m-0 mb-1">Har du frågor? Läs mer på <a href="https://www.trafikverket.se" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">www.trafikverket.se</a> eller ring Trafikverkets kundtjänst på 0771-17 18 19.</p>
                <p className="m-0 text-gray-400 text-[8.5pt]">Detta är ett automatiskt genererat meddelande med anledning av genomfört förarprov.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fast åtgärdsrad längst ner – samma mönster som Resultat */}
      <Portal>
        <div className="fixed inset-x-0 bottom-[calc(64px+env(safe-area-inset-bottom))] md:bottom-0 z-40 print:hidden border-t border-line bg-surface/95 backdrop-blur-md">
          <div className="max-w-[760px] mx-auto px-3 sm:px-4 py-2.5 flex items-center gap-2 md:pb-[max(0.625rem,env(safe-area-inset-bottom))]">
            <div className="min-w-0 flex-1 flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${verdictStyle.bar}`} aria-hidden="true" />
              <div className="min-w-0 leading-tight">
                <p className="text-[13px] font-semibold text-ink truncate">{verdictStyle.label}</p>
                <p className="text-[12px] text-ink-3 truncate">{state.properties.studentName || 'Kandidat'} · {licenseType}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowShareModal(true)}
              aria-label="Dela länk och QR-kod"
              className="h-11 w-11 sm:w-auto sm:px-3.5 rounded-control border border-line text-ink-2 hover:text-ink hover:bg-surface-2 flex items-center justify-center gap-1.5 text-sm font-medium cursor-pointer transition-colors shrink-0"
            >
              <Share2 size={16} /> <span className="hidden sm:inline">Dela</span>
            </button>
            <button
              type="button"
              onClick={openConfirm}
              disabled={isFinalizing}
              className="h-11 px-4 sm:px-5 rounded-control bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-sm font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer transition-all shrink-0 disabled:opacity-60 disabled:cursor-wait"
            >
              {isFinalizing ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} strokeWidth={2.75} />}
              Spara och slutför
            </button>
          </div>
        </div>
      </Portal>

      {/* HTML-mejl: förhandsvisning */}
      {showEmailModal && (
        <Portal>
          <div
            className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150"
            onClick={() => setShowEmailModal(false)}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="email-preview-title"
              className="bg-surface border border-line w-full sm:max-w-3xl max-h-[92vh] flex flex-col shadow-2xl rounded-t-sheet sm:rounded-card overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-5 py-4 border-b border-line flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-9 h-9 rounded-control bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300 flex items-center justify-center shrink-0">
                    <Mail size={18} />
                  </span>
                  <div className="min-w-0">
                    <h3 id="email-preview-title" className="text-base font-semibold text-ink">HTML-mejl</h3>
                    <p className="text-[13px] text-ink-3 truncate">Klistra in i Outlook/Gmail eller skicka direkt.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowEmailModal(false)}
                  aria-label="Stäng"
                  className="w-10 h-10 -mr-2 rounded-full hover:bg-surface-2 flex items-center justify-center text-ink-3 hover:text-ink cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-3 sm:p-4 bg-canvas">
                <iframe
                  title="Förhandsvisning av mejlet"
                  srcDoc={emailPreviewHtml}
                  sandbox=""
                  className="w-full min-h-[500px] rounded-control border border-line bg-white"
                />
              </div>

              <div className="px-5 py-3 border-t border-line flex flex-wrap items-center justify-between gap-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
                <p className="text-[13px] text-ink-3 min-w-0 truncate">
                  Till: <strong className="text-ink font-medium">{state.properties.email || 'Ingen e-post angiven'}</strong>
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyEmailHTML}
                    className="h-10 px-3.5 rounded-control border border-line text-ink-2 hover:text-ink hover:bg-surface-2 text-sm font-medium flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedEmailHtml ? <Check size={15} className="text-emerald-600" /> : <Copy size={15} />}
                    {copiedEmailHtml ? 'Kopierad' : 'Kopiera'}
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadEmailHTML}
                    disabled={isGeneratingEmailHtml}
                    className="h-10 px-4 rounded-control bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-60 disabled:cursor-wait"
                  >
                    {isGeneratingEmailHtml ? <Loader2 size={15} className="animate-spin" /> : <FileDown size={15} />}
                    Ladda ned .html
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Portal>
      )}

      {/* Bekräfta rapportering */}
      {showConfirmModal && (
        <Portal>
          <div
            className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4 bg-slate-900/60 dark:bg-black/70 backdrop-blur-sm animate-in fade-in duration-150"
            onClick={() => { if (!isFinalizing) setShowConfirmModal(false); }}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="confirm-title"
              className="bg-surface border border-line w-full sm:max-w-md shadow-2xl rounded-t-sheet sm:rounded-card overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-5 pt-5 pb-4 flex items-start gap-3">
                <span className={`p-2 rounded-control shrink-0 ${
                  isPassed
                    ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400'
                    : 'bg-red-100 text-[#D42220] dark:bg-red-500/15 dark:text-red-400'
                }`}>
                  {isPassed ? <FileCheck size={20} /> : <AlertTriangle size={20} />}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 id="confirm-title" className="text-lg font-semibold text-ink">Bekräfta och rapportera</h3>
                  <p className="text-[13px] text-ink-3">Kontrollera uppgifterna innan beslutet skickas.</p>
                </div>
              </div>

              <div className="px-5 space-y-3">
                <dl className="rounded-control border border-line bg-surface-2 px-3.5 py-1 text-[13px] divide-y divide-line">
                  {[
                    ['Kandidat', state.properties.studentName || 'Saknas', ''],
                    ['Personnr', state.properties.personalNumber || 'Saknas', 'tabular-nums'],
                    ['Behörighet', `${licenseType}${state.properties.transmission ? ` (${state.properties.transmission})` : ''}`, ''],
                  ].map(([k, v, cls]) => (
                    <div key={k} className="flex justify-between gap-3 py-2">
                      <dt className="text-ink-3">{k}</dt>
                      <dd className={`text-ink font-medium text-right truncate ${cls}`}>{v}</dd>
                    </div>
                  ))}
                  <div className="flex justify-between items-center gap-3 py-2">
                    <dt className="text-ink-3">Slutbetyg</dt>
                    <dd className={`inline-flex items-center gap-1 h-6 px-2 rounded-full ring-1 ring-inset text-[12px] font-semibold ${verdictStyle.badge}`}>
                      <VerdictIcon size={13} strokeWidth={2.5} /> {isPassed ? 'Godkänt' : 'Underkänt'}
                    </dd>
                  </div>
                </dl>

                {/* Obligatoriska bekräftelserutor så man inte råkar skicka fel resultat av misstag */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[13px] font-medium text-ink-2">Bekräftelse</span>
                  <button
                    type="button"
                    disabled={isFinalizing}
                    onClick={() => {
                      const next = !allConfirmed;
                      setConfirmResultChecked(next);
                      setConfirmReportChecked(next);
                      if (hasEmail) setConfirmEmailChecked(next);
                    }}
                    className="text-[13px] font-semibold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer disabled:opacity-50"
                  >
                    {allConfirmed ? 'Avmarkera alla' : 'Bocka för alla'}
                  </button>
                </div>

                <fieldset disabled={isFinalizing} className="space-y-2">
                  {[
                    {
                      checked: confirmResultChecked,
                      set: setConfirmResultChecked,
                      disabled: false,
                      text: (
                        <>
                          Slutbetyget{' '}
                          <strong className={isPassed ? 'text-emerald-700 dark:text-emerald-400' : 'text-[#D42220] dark:text-red-400'}>
                            {isPassed ? 'GODKÄNT' : 'UNDERKÄNT'}
                          </strong>{' '}
                          är korrekt för {state.properties.studentName || 'kandidaten'}.
                        </>
                      ),
                    },
                    {
                      checked: confirmReportChecked,
                      set: setConfirmReportChecked,
                      disabled: false,
                      text: 'Rapportera beslutet till Transportstyrelsen. Det registreras permanent och kan inte ändras i efterhand här.',
                    },
                    {
                      checked: confirmEmailChecked,
                      set: setConfirmEmailChecked,
                      disabled: !hasEmail,
                      text: hasEmail
                        ? <>Skicka protokollet till <strong className="text-ink font-semibold break-all">{state.properties.email}</strong></>
                        : 'Ingen e-postadress angiven – mejl kan inte skickas.',
                    },
                  ].map((item, i) => (
                    <label
                      key={i}
                      className={`flex items-start gap-3 p-3 rounded-control border transition-colors ${
                        item.disabled
                          ? 'border-line opacity-60 cursor-not-allowed'
                          : item.checked
                            ? 'border-emerald-500/50 bg-emerald-50/60 dark:bg-emerald-500/10 cursor-pointer'
                            : 'border-line hover:bg-surface-2 cursor-pointer'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={(e) => item.set(e.target.checked)}
                        disabled={item.disabled}
                        className="mt-0.5 w-[18px] h-[18px] shrink-0 accent-emerald-600 cursor-pointer disabled:cursor-not-allowed"
                      />
                      <span className="text-[13px] text-ink-2 leading-snug">{item.text}</span>
                    </label>
                  ))}
                </fieldset>
              </div>

              <div className="px-5 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  disabled={isFinalizing}
                  className="h-11 px-5 rounded-control border border-line text-ink-2 hover:text-ink hover:bg-surface-2 text-sm font-medium cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Avbryt
                </button>
                <button
                  type="button"
                  onClick={handleComplete}
                  disabled={!allConfirmed || isFinalizing}
                  className={`h-11 px-6 rounded-control text-white text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    isPassed ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-[#D42220] hover:bg-[#b51d1b]'
                  }`}
                >
                  {isFinalizing ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  {isFinalizing ? 'Sparar och skickar…' : 'Sänd beslut'}
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}

      {/* Dela unik länk modal */}
      <CandidateShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        state={state}
        examinerName={profile?.name}
      />

      {/* Skicka annat mejl modal */}
      <EmailComposerModal
        isOpen={showCustomEmailComposer}
        onClose={() => setShowCustomEmailComposer(false)}
        initialData={{
          to: state.properties.email,
          toName: state.properties.studentName,
          licenseType: state.properties.licenseType,
          testDate: state.properties.testDate,
          examiner: state.properties.examiner?.trim() || profile?.name,
          result: state.result.drivingResult || 'Godkänt'
        }}
      />
    </div>
  );
}
