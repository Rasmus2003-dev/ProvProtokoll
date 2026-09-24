import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { 
  CheckCircle, 
  XCircle, 
  Share2, 
  Printer, 
  Copy, 
  Check, 
  Calendar, 
  User, 
  Car, 
  Shield, 
  FileText, 
  AlertTriangle,
  Award,
  Clock,
  Sparkles,
  ArrowLeft,
  ExternalLink
} from 'lucide-react';
import { loadSharedProtocol, SharedProtocolSummary } from '../lib/shareProtocol';
import { triggerHaptic } from '../lib/utils';

export function KandidatProtokollScreen() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [protocol, setProtocol] = useState<SharedProtocolSummary | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      setLoading(true);
      const res = await loadSharedProtocol(id, location.hash || location.search);
      if (isMounted) {
        setProtocol(res);
        setLoading(false);
      }
    }
    load();
    return () => { isMounted = false; };
  }, [id, location.hash, location.search]);

  const handleCopyLink = () => {
    triggerHaptic('light');
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    triggerHaptic('medium');
    if (navigator.share && protocol) {
      try {
        await navigator.share({
          title: `Körprovsresultat – ${protocol.studentName}`,
          text: `Här är mitt resultat på körprovet för behörighet ${protocol.licenseType}: ${protocol.isPassed ? 'Godkänd! 🎉' : 'Ej godkänd'}`,
          url: window.location.href,
        });
      } catch (_) {}
    } else {
      handleCopyLink();
    }
  };

  const handlePrint = () => {
    triggerHaptic('light');
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-full border-4 border-blue-200 border-t-[#002f6c] dark:border-blue-900 dark:border-t-blue-400 animate-spin mb-4" />
        <p className="text-sm font-bold text-gray-700 dark:text-slate-300">Hämtar provprotokoll...</p>
      </div>
    );
  }

  if (!protocol) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="p-4 bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 rounded-3xl mb-4">
          <AlertTriangle size={36} />
        </div>
        <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2">Protokollet hittades inte</h2>
        <p className="text-sm text-gray-600 dark:text-slate-400 max-w-md mb-6 leading-relaxed">
          Länken kan vara ogiltig eller så har protokollet ännu inte hunnit synkas till molnet. Kontakta din förarprövare om du saknar ditt protokoll.
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2.5 bg-[#002f6c] hover:bg-[#00204a] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer"
        >
          Gå till ProvProtokoll
        </button>
      </div>
    );
  }

  const {
    studentName,
    licenseType,
    transmission,
    testType,
    testDate,
    examiner,
    isPassed,
    drivingResult,
    safetyCheckResult,
    includedTestItems,
    drivingFailure,
    safetyCheckFailure,
    interventionOccurred,
    testAborted,
    notes
  } = protocol;

  return (
    <div className="min-h-screen bg-[#f8f9fc] dark:bg-[#0b1120] text-gray-900 dark:text-slate-100 py-6 sm:py-10 px-3 sm:px-6 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Top Branding & Navigation */}
        <header className="flex items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#002f6c] dark:bg-blue-600 text-white flex items-center justify-center font-black text-base shadow-sm">
              P
            </div>
            <div>
              <h1 className="text-sm font-black tracking-tight text-gray-950 dark:text-white leading-none">
                ProvProtokoll
              </h1>
              <span className="text-[11px] font-semibold text-gray-500 dark:text-slate-400">
                Officiellt förarprovsresultat
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2.5 sm:px-3.5 sm:py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 text-gray-700 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
              title="Skriv ut eller spara PDF"
            >
              <Printer size={15} />
              <span className="hidden sm:inline">Skriv ut</span>
            </button>

            <button
              onClick={handleShare}
              className="px-4 py-2 bg-[#002f6c] hover:bg-[#00204a] dark:bg-blue-600 dark:hover:bg-blue-500 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm cursor-pointer transition-all active:scale-95"
            >
              {copied ? <Check size={15} /> : <Share2 size={15} />}
              <span>{copied ? 'Kopierat!' : 'Dela'}</span>
            </button>
          </div>
        </header>

        {/* Main Result Banner */}
        <div className={`p-6 sm:p-8 rounded-3xl border shadow-lg text-white relative overflow-hidden ${
          isPassed 
            ? 'bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 border-emerald-500 shadow-emerald-950/20' 
            : 'bg-gradient-to-br from-slate-900 via-[#002f6c] to-red-950 border-slate-700 shadow-slate-950/30'
        }`}>
          {/* Subtle background decoration */}
          <div className="absolute right-0 bottom-0 translate-x-8 translate-y-8 opacity-10 pointer-events-none">
            {isPassed ? <Award size={220} /> : <Shield size={220} />}
          </div>

          <div className="relative z-10 space-y-3">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest bg-white/20 backdrop-blur-xs">
                Körprov · Behörighet {licenseType}
              </span>
              <span className="text-white/60 text-xs font-mono">• {testDate}</span>
            </div>

            <div className="flex items-start gap-4 pt-1">
              <div className="p-3 bg-white/20 backdrop-blur-xs rounded-2xl shrink-0">
                {isPassed ? (
                  <CheckCircle size={36} className="text-emerald-200" />
                ) : (
                  <XCircle size={36} className="text-red-300" />
                )}
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight leading-tight">
                  {isPassed ? 'Godkänt Körprov!' : 'Körprovet är ej godkänt'}
                </h2>
                <p className="text-sm sm:text-base text-white/90 font-medium mt-1 leading-relaxed">
                  {isPassed
                    ? `Grattis ${studentName}! Du har uppfyllt Trafikverkets krav för behörighet ${licenseType}.`
                    : `Hej ${studentName}. Du nådde tyvärr inte hela vägen den här gången. Se bristerna nedan inför ditt nästa prov.`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Candidate & Test Details Card */}
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 dark:text-slate-500">
            Provuppgifter
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1">
            <div className="space-y-1">
              <div className="text-[11px] font-bold text-gray-500 dark:text-slate-400 flex items-center gap-1.5">
                <User size={13} />
                <span>Kandidat</span>
              </div>
              <p className="text-sm font-black text-gray-900 dark:text-white truncate">
                {studentName}
              </p>
            </div>

            <div className="space-y-1">
              <div className="text-[11px] font-bold text-gray-500 dark:text-slate-400 flex items-center gap-1.5">
                <Car size={13} />
                <span>Fordon & Växel</span>
              </div>
              <p className="text-sm font-black text-gray-900 dark:text-white">
                {licenseType} ({transmission})
              </p>
            </div>

            <div className="space-y-1">
              <div className="text-[11px] font-bold text-gray-500 dark:text-slate-400 flex items-center gap-1.5">
                <Calendar size={13} />
                <span>Datum & Provtyp</span>
              </div>
              <p className="text-sm font-black text-gray-900 dark:text-white">
                {testType}
              </p>
            </div>

            <div className="space-y-1">
              <div className="text-[11px] font-bold text-gray-500 dark:text-slate-400 flex items-center gap-1.5">
                <Shield size={13} />
                <span>Förarprövare</span>
              </div>
              <p className="text-sm font-black text-gray-900 dark:text-white truncate">
                {examiner}
              </p>
            </div>
          </div>

          {/* Delresultat pills */}
          <div className="pt-3 border-t border-gray-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-slate-800/50 flex items-center justify-between border border-gray-100 dark:border-slate-800">
              <span className="text-xs font-bold text-gray-700 dark:text-slate-300">
                1. Säkerhetskontroll / Funktionsfråga
              </span>
              <span className={`text-xs font-black px-2.5 py-0.5 rounded-md ${
                safetyCheckResult === 'Godkänt' 
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' 
                  : safetyCheckResult === 'Underkänt'
                    ? 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300'
                    : 'bg-gray-200 text-gray-700 dark:bg-slate-700 dark:text-slate-300'
              }`}>
                {safetyCheckResult || 'Ej genomförd'}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-slate-800/50 flex items-center justify-between border border-gray-100 dark:border-slate-800">
              <span className="text-xs font-bold text-gray-700 dark:text-slate-300">
                2. Körning i och utanför tätort
              </span>
              <span className={`text-xs font-black px-2.5 py-0.5 rounded-md ${
                drivingResult === 'Godkänt' 
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' 
                  : 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300'
              }`}>
                {drivingResult || 'Underkänt'}
              </span>
            </div>
          </div>
        </div>

        {/* Bristförteckning vid underkänt prov */}
        {!isPassed && (drivingFailure?.primaryCause?.area || safetyCheckFailure?.primaryCause?.area) && (
          <div className="bg-red-50/70 dark:bg-red-950/20 border-2 border-red-200 dark:border-red-900/40 rounded-3xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2 text-red-800 dark:text-red-400">
              <AlertTriangle size={18} />
              <h3 className="text-sm font-black uppercase tracking-wider">
                Bristförteckning – Det här behöver du träna på
              </h3>
            </div>

            {drivingFailure?.primaryCause?.area && (
              <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-red-150 dark:border-red-900/30 space-y-2">
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Område: <strong className="text-red-700 dark:text-red-400">{drivingFailure.primaryCause.area}</strong>
                </div>

                {drivingFailure.primaryCause.deficiencies && drivingFailure.primaryCause.deficiencies.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {drivingFailure.primaryCause.deficiencies.map((d, i) => (
                      <span key={i} className="text-xs font-bold px-2 py-0.5 bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300 rounded border border-red-200 dark:border-red-900">
                        {d}
                      </span>
                    ))}
                  </div>
                )}

                {drivingFailure.situations && drivingFailure.situations.length > 0 && (
                  <p className="text-xs text-gray-600 dark:text-slate-400 pt-1">
                    <strong>Situationer:</strong> {drivingFailure.situations.join(', ')}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Provade moment */}
        {includedTestItems && includedTestItems.length > 0 && (
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 dark:text-slate-500">
                Genomförda provmoment ({includedTestItems.length} st)
              </h3>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {includedTestItems.map((item, idx) => (
                <span
                  key={idx}
                  className="text-xs font-medium px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-slate-200 border border-gray-200/60 dark:border-slate-700"
                >
                  ✓ {item}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Nästa steg & vägledning */}
        <div className="p-5 sm:p-6 rounded-3xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 space-y-2 text-xs text-blue-950 dark:text-blue-200 leading-relaxed">
          <h4 className="font-black text-sm uppercase tracking-wide text-[#002f6c] dark:text-blue-300">
            {isPassed ? 'Vad händer nu?' : 'Inför ditt nästa prov'}
          </h4>
          {isPassed ? (
            <p>
              Ditt godkända resultat har rapporterats till Transportstyrelsen. Du får köra direkt inom Sverige med giltig legitimation i väntan på att ditt körkortstillverkningsunderlag anländer i brevlådan!
            </p>
          ) : (
            <p>
              Boka ett omprov via Trafikverket eller din trafikskola. Använd punkterna ovan tillsammans med din trafiklärare för att fokusera på rätt moment under övningskörningen.
            </p>
          )}
        </div>

        {/* Footer info */}
        <footer className="text-center pt-4 pb-12 text-xs text-gray-400 dark:text-slate-500 space-y-2 print:hidden">
          <p>
            Detta är en digital kopia av ditt körprovsprotokoll från ProvProtokoll.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={handleCopyLink}
              className="text-[#002f6c] dark:text-blue-400 font-bold hover:underline cursor-pointer flex items-center gap-1"
            >
              <Copy size={12} />
              <span>{copied ? 'Länk kopierad' : 'Kopiera direktlänk'}</span>
            </button>
          </div>
        </footer>

      </div>
    </div>
  );
}
