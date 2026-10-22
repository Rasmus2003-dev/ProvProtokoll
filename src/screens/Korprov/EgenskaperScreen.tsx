import { useNavigate } from 'react-router-dom';
import { AppLogo } from '../../components/icons/AppLogo';
import { useEffect, useMemo, useState } from 'react';
import { useAppStore } from '../../store/ProvContext';
import { TEST_CONTENT } from '../../data/testContentCatalog';
import { OfficialPrintLayout } from './components/OfficialPrintLayout';
import { LICENSE_GUIDES } from '../../data/licenseGuidesData';
import { SignaturePad } from '../../components/SignaturePad';
import { LicenseScanModal } from '../../components/LicenseScanModal';
import { fetchLatestFailedCloud, findLatestFailedLocal, isRetest, normalizePersonalNumber } from '../../lib/previousTest';
import { triggerHaptic } from '../../lib/utils';
import type { AppState } from '../../types';
import {
  FileCheck2,
  History,
  Check,
  ChevronRight,
  Scale,
  ShieldAlert,
  Info,
  Award,
  Globe2,
  Calendar,
  PenLine,
  Pencil,
  Clock3,
  IdCard,
  ScanLine,
} from 'lucide-react';

// Egenskaper: det som inte redan fylls i på startsidan. Kandidat, provtyp,
// behörighet, fordon och provförrättare visas bara som en sammanfattning.

const ID_TYPES = ['Svenskt körkort', 'Pass', 'Nationellt id-kort', 'Id-kort (SIS-märkt)', 'Tjänstekort', 'Annan legitimation'];
const SKIP_REASONS = ['Kandidaten vill inte signera', 'Signeras på papper', 'Kontrollerat i annat system'];

export function EgenskaperScreen() {
  const navigate = useNavigate();
  const { state, updateState, syncQueue, testHistory } = useAppStore();
  const [loadedFromHistory, setLoadedFromHistory] = useState(false);
  const [showPrevious, setShowPrevious] = useState(false);
  const [scanOpen, setScanOpen] = useState(false);

  const p = state.properties;
  const license = p.licenseType || 'B';
  const guide = LICENSE_GUIDES[license] ?? LICENSE_GUIDES[license.split(' (')[0]];
  const isHeavy = ['C', 'C1', 'CE', 'C1E', 'D', 'D1', 'DE', 'D1E'].includes(license);
  const totalMoments = TEST_CONTENT[license]?.length || 0;
  const isTestprov = Boolean(p.testType?.includes('Testprov'));
  const mainTestType = p.testType?.split(',').map(s => s.trim()).filter(t => t !== 'Testprov').join(', ') || 'Förstaprov';

  // --- Föregående underkända prov vid omprov: lokalt först, annars molnet ---
  const pnrKey = normalizePersonalNumber(p.personalNumber);
  const retest = isRetest(p.testType);
  const localPrevious = useMemo(
    () => (retest ? findLatestFailedLocal(pnrKey, [testHistory, syncQueue]) : null),
    [retest, pnrKey, testHistory, syncQueue]
  );
  const [cloudPrevious, setCloudPrevious] = useState<{ key: string; test: AppState | null } | null>(null);
  useEffect(() => {
    if (!retest || localPrevious || pnrKey.length < 10) return;
    let cancelled = false;
    fetchLatestFailedCloud(pnrKey).then(test => {
      if (!cancelled) setCloudPrevious({ key: pnrKey, test });
    });
    return () => { cancelled = true; };
  }, [retest, localPrevious, pnrKey]);
  const previous = localPrevious ?? (retest && cloudPrevious?.key === pnrKey ? cloudPrevious.test : null);
  const lookingUp = retest && !localPrevious && pnrKey.length >= 10 && cloudPrevious?.key !== pnrKey;

  // Visa protokollet direkt när det hittas
  const previousKey = previous ? `${pnrKey}|${previous.properties.testDate}` : '';
  useEffect(() => {
    if (previousKey) setShowPrevious(true);
  }, [previousKey]);

  const loadPreviousFailures = () => {
    if (!previous) return;
    triggerHaptic('success');
    updateState(prev => {
      const situations = [
        ...(previous.result.drivingFailure?.situations || []),
        ...(previous.result.safetyCheckFailure?.situations || []),
      ];
      const fallback = situations.length === 0 ? previous.includedTestItems || [] : [];
      return {
        ...prev,
        includedTestItems: [...new Set([...(prev.includedTestItems || []), ...situations, ...fallback])].filter(Boolean),
      };
    });
    setLoadedFromHistory(true);
  };

  const setProp = <K extends keyof AppState['properties']>(key: K, value: AppState['properties'][K]) =>
    updateState(prev => ({ ...prev, properties: { ...prev.properties, [key]: value } }));

  const toggleTestprov = (on: boolean) => {
    const parts = (p.testType || 'Förstaprov').split(',').map(s => s.trim()).filter(t => t && t !== 'Testprov');
    setProp('testType', (on ? ['Testprov', ...parts] : parts).join(', '));
  };

  // --- Intygande om körkort i annat EU/EES-land ---
  const declaration = state.euLicenseDeclaration;
  const setDeclaration = (next: AppState['euLicenseDeclaration']) => updateState(prev => ({ ...prev, euLicenseDeclaration: next }));
  const [skipping, setSkipping] = useState(declaration?.status === 'skipped');

  const rowCheck = 'flex items-center gap-3 min-h-12 px-3.5 rounded-control border border-line bg-surface hover:bg-surface-2 cursor-pointer transition-colors';
  const cardCls = 'bg-surface border border-line rounded-card';

  const summary: [string, string][] = [
    ['Provtyp', mainTestType + (isTestprov ? ' (testprov)' : '')],
    ['Behörighet', license],
    ['Växellåda', p.transmission === 'Automat' ? 'Automat (villkor 78)' : 'Manuell'],
    ...(isHeavy ? [['Färdskrivare', p.tachograph === 'Utan färdskrivare' ? 'Utan färdskrivare' : 'Med färdskrivare'] as [string, string]] : []),
    ['Provförrättare', p.examiner || '–'],
    ['Datum', p.testDate || '–'],
  ];

  return (
    <div className="max-w-6xl mx-auto sm:px-2 w-full text-ink">

      <header className="mb-5">
        <div className="flex items-center gap-3">
          <AppLogo variant="icon" size="sm" className="shrink-0" />
          <div className="min-w-0">
            <p className="text-[13px] font-medium text-ink-3">Innan vi kör</p>
            <h1 className="text-[26px] sm:text-4xl font-bold text-ink leading-[1.1] truncate">
              {license.split(' (')[0]} – {p.studentName || 'Namn saknas'}
            </h1>
          </div>
        </div>
        <p className="text-[15px] text-ink-2 mt-1.5 max-w-2xl">
          Kontrollera legitimationen och låt kandidaten skriva under EES-intyget. Det du ändrar sparas direkt.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start">
        <div className="lg:col-span-7 space-y-5">

          {/* Sammanfattning från startsidan – ändras där, inte här */}
          <section className={`${cardCls} overflow-hidden`}>
            <div className="p-4 sm:p-5 flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-full bg-navy/10 dark:bg-blue-500/15 text-navy dark:text-blue-300 flex items-center justify-center shrink-0 font-semibold">
                {(p.studentName || '?').trim().charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg font-semibold text-ink truncate">{p.studentName || 'Namn saknas'}</h2>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${state.checklist.identityChecked
                    ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300'
                    : 'bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300'}`}>
                    {state.checklist.identityChecked ? 'Id kontrollerad' : 'Id ej kontrollerad'}
                  </span>
                </div>
                <p className="text-[13px] text-ink-3 tabular-nums mt-0.5 truncate">
                  {p.personalNumber || 'Personnummer saknas'}{p.email ? ` · ${p.email}` : ''}
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/korprov/start')}
                className="shrink-0 h-9 px-3 rounded-control text-[13px] font-medium text-navy dark:text-blue-400 hover:bg-navy/5 dark:hover:bg-blue-500/10 flex items-center gap-1.5 cursor-pointer"
              >
                <Pencil size={14} /> Ändra
              </button>
            </div>
            <dl className="grid grid-cols-2 sm:grid-cols-3 border-t border-line bg-surface-2/60">
              {summary.map(([k, v]) => (
                <div key={k} className="px-4 sm:px-5 py-3 border-b border-line [&:nth-last-child(-n+2)]:border-b-0 sm:[&:nth-last-child(-n+3)]:border-b-0 min-w-0">
                  <dt className="text-[12px] text-ink-3">{k}</dt>
                  <dd className={`text-[14px] font-semibold truncate ${k === 'Färdskrivare' && v === 'Utan färdskrivare' ? 'text-[#c40000] dark:text-red-400' : 'text-ink'}`}>{v}</dd>
                </div>
              ))}
            </dl>
          </section>

          {/* Identitetskontroll */}
          <section className={`${cardCls} p-4 sm:p-5`}>
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-[15px] font-semibold text-ink flex items-center gap-2">
                <IdCard size={16} className="text-ink-3" /> Identitetskontroll
              </h2>
              <div className="flex items-center gap-2 shrink-0">
                {state.checklist.identityChecked && (
                  <span className="text-[12px] font-semibold px-2 py-1 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 flex items-center gap-1">
                    <Check size={13} strokeWidth={3} /> Kontrollerad
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setScanOpen(true)}
                  className="h-9 px-3 rounded-control bg-navy hover:bg-navy-deep dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-[13px] font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <ScanLine size={15} /> Skanna körkortet
                </button>
              </div>
            </div>
            <LicenseScanModal
              open={scanOpen}
              onClose={() => setScanOpen(false)}
              candidateName={p.studentName || ''}
              personalNumber={p.personalNumber || ''}
              license={license.split(' (')[0]}
              onResult={({ idType, idNumber }) => updateState(prev => ({
                ...prev,
                properties: { ...prev.properties, idType, idNumber },
                checklist: { ...prev.checklist, identityChecked: true },
              }))}
            />
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <span className="text-[13px] font-medium text-ink-2">Personnummer</span>
                <div className="mt-1 h-11 px-3.5 rounded-control border border-line bg-surface-2 text-[15px] font-medium text-ink tabular-nums flex items-center truncate">
                  {p.personalNumber || '–'}
                </div>
              </div>
              <label className="block">
                <span className="text-[13px] font-medium text-ink-2">Legitimation</span>
                <select
                  value={p.idType || ''}
                  onChange={(e) => setProp('idType', e.target.value)}
                  className="mt-1 w-full h-11 px-3 text-[15px] rounded-control border border-line bg-surface text-ink focus:outline-none focus:border-navy focus:ring-4 focus:ring-navy/10 cursor-pointer"
                >
                  <option value="">Välj…</option>
                  {ID_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="text-[13px] font-medium text-ink-2">ID-nummer <span className="text-ink-3 font-normal">(valfritt)</span></span>
                <input
                  type="text"
                  value={p.idNumber || ''}
                  onChange={(e) => setProp('idNumber', e.target.value)}
                  autoComplete="off"
                  className="mt-1 w-full h-11 px-3.5 text-[15px] rounded-control border border-line bg-surface text-ink tabular-nums focus:outline-none focus:border-navy focus:ring-4 focus:ring-navy/10"
                />
              </label>
            </div>
            <label className="mt-3 flex items-center gap-3 min-h-12 px-3.5 rounded-control border border-line bg-surface hover:bg-surface-2 cursor-pointer transition-colors">
              <input
                type="checkbox"
                className="w-5 h-5 accent-emerald-600 rounded shrink-0"
                checked={state.checklist.identityChecked}
                onChange={(e) => {
                  triggerHaptic(e.target.checked ? 'success' : 'light');
                  updateState(prev => ({ ...prev, checklist: { ...prev.checklist, identityChecked: e.target.checked } }));
                }}
              />
              <span className="text-sm font-medium text-ink">Legitimationen stämmer med kandidaten</span>
            </label>
          </section>

          {/* Föregående protokoll vid omprov */}
          {previous && (
            <section className={`border rounded-card overflow-hidden ${loadedFromHistory ? 'border-emerald-300 dark:border-emerald-800/60' : 'border-amber-300 dark:border-amber-800/60'}`}>
              <div className={`p-4 sm:p-5 ${loadedFromHistory ? 'bg-emerald-50/70 dark:bg-emerald-950/20' : 'bg-amber-50/70 dark:bg-amber-950/20'}`}>
                <div className="flex items-start gap-3">
                  <ShieldAlert className={`shrink-0 mt-0.5 ${loadedFromHistory ? 'text-emerald-600' : 'text-amber-600'}`} size={20} />
                  <div className="min-w-0 flex-1">
                    <h2 className={`font-semibold text-[15px] ${loadedFromHistory ? 'text-emerald-900 dark:text-emerald-300' : 'text-amber-950 dark:text-amber-200'}`}>
                      {loadedFromHistory ? 'Momenten från förra provet är tillagda' : 'Underkänd förra gången'}
                    </h2>
                    <p className="text-[13px] text-ink-2 leading-relaxed mt-0.5">
                      {previous.properties.testType || 'Prov'} {previous.properties.licenseType}, {previous.properties.testDate}
                      {previous.properties.examiner ? <> hos {previous.properties.examiner}</> : null}.{' '}
                      {(() => {
                        const r = previous.result;
                        const causes = [r.drivingFailure?.primaryCause?.area, r.safetyCheckFailure?.primaryCause?.area].filter(Boolean);
                        const situations = [...(r.drivingFailure?.situations || []), ...(r.safetyCheckFailure?.situations || [])];
                        return (
                          <>
                            {r.testAborted && <strong className="font-semibold text-red-700 dark:text-red-400">Provet avbröts. </strong>}
                            {causes.length > 0 && <>Grundorsak: <strong className="font-semibold text-red-700 dark:text-red-400">{causes.join(', ')}</strong>. </>}
                            {situations.length > 0 && <>Brister i {situations.join(', ').toLowerCase()}.</>}
                          </>
                        );
                      })()}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    onClick={loadPreviousFailures}
                    disabled={loadedFromHistory}
                    className={`h-11 px-4 text-sm font-semibold rounded-control flex items-center justify-center gap-1.5 transition-colors ${loadedFromHistory
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 cursor-default'
                      : 'bg-amber-600 text-white hover:bg-amber-700 cursor-pointer'}`}
                  >
                    {loadedFromHistory ? <><Check size={16} /> Tillagda</> : <><History size={16} /> Pröva samma moment igen</>}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPrevious(v => !v)}
                    aria-expanded={showPrevious}
                    className="h-11 px-4 text-sm font-semibold rounded-control border border-line bg-surface text-ink hover:bg-surface-2 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <FileCheck2 size={16} />
                    {showPrevious ? 'Dölj protokollet' : 'Visa protokollet'}
                  </button>
                </div>
              </div>
              {showPrevious && (
                <div className="border-t border-line p-3 sm:p-4 bg-surface-2 animate-in fade-in duration-150">
                  <div
                    data-protocol
                    className="max-h-[520px] overflow-auto custom-scrollbar bg-white text-black rounded-control border border-line shadow-lift p-4 sm:p-6"
                    style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
                  >
                    <div className="min-w-[560px]">
                      <OfficialPrintLayout testState={previous} />
                    </div>
                  </div>
                </div>
              )}
            </section>
          )}

          {!previous && retest && pnrKey.length >= 10 && (
            <div className="flex items-center gap-2.5 px-4 py-3 rounded-card border border-dashed border-line text-[13px] text-ink-2">
              {lookingUp
                ? <><span className="w-3.5 h-3.5 rounded-full border-2 border-ink-3 border-t-transparent animate-spin" aria-hidden="true" /> Letar efter förra protokollet…</>
                : <><History size={15} className="text-ink-3" /> Hittar inget tidigare underkänt prov på {p.personalNumber}.</>}
            </div>
          )}

          {/* Intygande: körkort i annat EU/EES-land */}
          <section className={`${cardCls} p-4 sm:p-5`}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-[15px] font-semibold text-ink flex items-center gap-2">
                  <PenLine size={16} className="text-ink-3" /> EES-intyg
                </h2>
                <p className="text-[13px] text-ink-3 mt-0.5">Frivilligt – kan hoppas över vid behov.</p>
              </div>
              {declaration?.status === 'signed' && (
                <span className="shrink-0 text-[12px] font-semibold px-2 py-1 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 flex items-center gap-1">
                  <Check size={13} strokeWidth={3} /> Signerat
                </span>
              )}
              {declaration?.status === 'skipped' && (
                <span className="shrink-0 text-[12px] font-semibold px-2 py-1 rounded-md bg-surface-2 text-ink-2">Överhoppat</span>
              )}
            </div>

            {!skipping ? (
              <>
                <blockquote className="mt-4 pl-3.5 border-l-[3px] border-navy/40 dark:border-blue-400/40 text-[15px] text-ink leading-relaxed">
                  Jag, <strong>{p.studentName || 'kandidaten'}</strong>, intygar på heder och samvete att jag inte har ett körkort
                  som är utfärdat i en annan EES-stat, och att jag inte har ett körkort där som är återkallat eller spärrat.
                </blockquote>
                <div className="mt-4">
                  <SignaturePad
                    value={declaration?.status === 'signed' ? declaration.signature : undefined}
                    label="Kandidaten signerar här"
                    onChange={(signature) => setDeclaration(signature
                      ? { status: 'signed', signature, signedAt: new Date().toISOString() }
                      : undefined)}
                  />
                </div>
                <div className="mt-1 flex items-center justify-between gap-3 text-[12px] text-ink-3">
                  <span className="flex items-center gap-1.5">
                    {declaration?.status === 'signed' && declaration.signedAt && (
                      <><Clock3 size={13} /> {new Date(declaration.signedAt).toLocaleString('sv-SE', { dateStyle: 'short', timeStyle: 'short' })}</>
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={() => { setSkipping(true); setDeclaration({ status: 'skipped', skipReason: SKIP_REASONS[0] }); }}
                    className="text-[13px] font-medium text-ink-2 hover:text-ink underline underline-offset-2 cursor-pointer"
                  >
                    Hoppa över
                  </button>
                </div>
              </>
            ) : (
              <div className="mt-4 space-y-3 animate-in fade-in duration-150">
                <label className="block">
                  <span className="text-[13px] font-medium text-ink-2">Varför hoppas det över?</span>
                  <select
                    value={declaration?.skipReason || SKIP_REASONS[0]}
                    onChange={(e) => setDeclaration({ status: 'skipped', skipReason: e.target.value })}
                    className="mt-1 w-full h-11 px-3.5 text-[15px] rounded-control border border-line bg-surface text-ink focus:outline-none focus:border-navy focus:ring-4 focus:ring-navy/10 cursor-pointer"
                  >
                    {SKIP_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </label>
                <button
                  type="button"
                  onClick={() => { setSkipping(false); setDeclaration(undefined); }}
                  className="text-[13px] font-medium text-navy dark:text-blue-400 hover:underline cursor-pointer"
                >
                  Låt kandidaten signera i stället
                </button>
              </div>
            )}
          </section>

          {/* Testprov, villkor och tolk */}
          <section className={`${cardCls} p-4 sm:p-5 space-y-3`}>
            <h2 className="text-[15px] font-semibold text-ink">Villkor och tolk</h2>
            <div className="space-y-2">
              {['Medicinska villkor 69 (Alkolås)', 'Handikappanpassning (Klass 78+)'].map(condition => (
                <label key={condition} className={rowCheck}>
                  <input
                    type="checkbox"
                    className="w-5 h-5 accent-[#002f6c] rounded shrink-0"
                    checked={(p.specialConditions || []).includes(condition)}
                    onChange={(e) => {
                      const current = p.specialConditions || [];
                      setProp('specialConditions', e.target.checked ? [...current, condition] : current.filter(c => c !== condition));
                    }}
                  />
                  <span className="text-sm font-medium text-ink">{condition}</span>
                </label>
              ))}
              <label className={rowCheck}>
                <input
                  type="checkbox"
                  className="w-5 h-5 accent-[#002f6c] rounded shrink-0"
                  checked={Boolean(p.interpreterPresent)}
                  onChange={(e) => setProp('interpreterPresent', e.target.checked)}
                />
                <Globe2 size={16} className="text-ink-3 shrink-0" />
                <span className="text-sm font-medium text-ink">Tolk är med</span>
              </label>
              {p.interpreterPresent && (
                <input
                  type="text"
                  value={p.interpreterLanguage || ''}
                  onChange={(e) => setProp('interpreterLanguage', e.target.value)}
                  placeholder="Språk, t.ex. arabiska"
                  aria-label="Tolkens språk"
                  className="w-full h-12 px-4 text-[15px] rounded-control border border-line bg-surface text-ink placeholder:text-ink-3 focus:outline-none focus:border-navy focus:ring-4 focus:ring-navy/10 animate-in fade-in duration-150"
                />
              )}
              <label className={rowCheck}>
                <input
                  type="checkbox"
                  className="w-5 h-5 accent-violet-600 rounded shrink-0"
                  checked={isTestprov}
                  onChange={(e) => toggleTestprov(e.target.checked)}
                />
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-ink">Testprov</span>
                  <span className="block text-[12px] text-ink-3">Bedöms som vanligt men ger ingen behörighet.</span>
                </span>
              </label>
            </div>
          </section>
        </div>

        {/* Behörighetsfakta ur lathunden */}
        <aside className="lg:col-span-5 space-y-4 lg:sticky lg:top-4">
          <section className={`${cardCls} p-4 sm:p-6`}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-lg font-semibold text-ink">Behörighet {license.split(' (')[0]}</h2>
                {guide && <p className="text-[13px] text-ink-2 mt-0.5">{guide.name}</p>}
              </div>
              <Award size={20} className="text-ink-3 shrink-0 mt-1" />
            </div>

            <dl className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-control bg-surface-2 p-3">
                <dt className="text-[13px] text-ink-3">Moment i katalogen</dt>
                <dd className="text-xl font-semibold text-ink tabular-nums mt-0.5">{totalMoments}</dd>
              </div>
              <div className="rounded-control bg-surface-2 p-3">
                <dt className="text-[13px] text-ink-3">Valda hittills</dt>
                <dd className="text-xl font-semibold text-ink tabular-nums mt-0.5">{state.includedTestItems?.length || 0}</dd>
              </div>
            </dl>

            {guide ? (
              <div className="mt-4 space-y-4">
                <div>
                  <h3 className="text-[13px] font-medium font-sans text-ink-3 flex items-center gap-1.5 tracking-normal"><Calendar size={14} /> Körtid</h3>
                  <p className="text-[14px] text-ink-2 leading-relaxed mt-1">{guide.driveTime}</p>
                </div>
                {guide.mandatoryHighlights.length > 0 && (
                  <div>
                    <h3 className="text-[13px] font-medium font-sans text-ink-3 flex items-center gap-1.5 tracking-normal"><Scale size={14} /> Måste ingå</h3>
                    <ul className="mt-1.5 space-y-1.5">
                      {guide.mandatoryHighlights.map(h => (
                        <li key={h} className="flex gap-2.5 text-[14px] text-ink-2 leading-relaxed">
                          <span className="mt-2 w-1.5 h-1.5 rounded-full bg-signal shrink-0" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <p className="mt-4 text-[13px] text-ink-3 flex items-start gap-2">
                <Info size={15} className="shrink-0 mt-0.5" />
                Ingen lathund för den här behörigheten än.
              </p>
            )}
          </section>
        </aside>
      </div>

      {/* Åtgärdsrad */}
      <div className="sticky bottom-0 z-10 mt-8 -mx-4 sm:mx-0 px-4 py-3 sm:rounded-card bg-surface/95 backdrop-blur-xl border-t sm:border border-line flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate('/korprov/start')}
          className="h-12 px-3 sm:px-4 text-sm font-semibold text-ink-2 hover:text-ink rounded-control hover:bg-surface-2 flex items-center gap-1 cursor-pointer"
        >
          <ChevronRight size={18} className="rotate-180" />
          Tillbaka
        </button>
        <button
          id="btn-goto-inledning"
          type="button"
          onClick={() => navigate('/korprov/inledning')}
          className="flex-1 sm:flex-none h-12 px-6 bg-navy hover:bg-navy-deep dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-semibold text-[15px] transition-colors flex items-center justify-center gap-1.5 rounded-control cursor-pointer active:scale-[0.98]"
        >
          Vidare till inledningen
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
