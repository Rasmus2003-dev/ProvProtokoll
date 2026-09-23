import { useNavigate } from 'react-router-dom';
import { ReactNode, useEffect, useRef, useState } from 'react';
import { useAppStore } from '../../store/ProvContext';
import { FailureForm } from './components/FailureForm';
import { OfficialPrintLayout } from './components/OfficialPrintLayout';
import { failureSituations } from './data/failureData';
import { printProtocol } from '../../lib/generateProtocolHtml';
import { isNewLayout } from '../../lib/protocolLayout';
import { Printer, ArrowRight, AlertTriangle, Maximize2, ChevronDown, Check, X, Minus, Plus, FileText, Info } from 'lucide-react';
import { triggerHaptic } from '../../lib/utils';
import { RouteReview, RouteReviewModal } from '../../components/route/RouteReview';
import { hasRouteData } from '../../lib/route';
import { Portal } from '../../components/Portal';
import { PrivacyGuard } from '../../components/PrivacyGuard';

type Tone = 'pass' | 'fail' | 'neutral';
type Result = 'Godkänt' | 'Underkänt' | '-' | null | undefined;

const EMPTY_FAILURE = {
  primaryCause: { area: '', deficiencies: [] as string[] },
  consequences: [],
  situations: [],
  interventionOccurred: false,
  testAborted: false,
};

// Segmenterat val, t.ex. Godkänd / Underkänd / Ej genomförd
function Choice<T extends string | boolean>({ value, options, onChange }: {
  value: T | null | undefined;
  options: { value: T; label: string; tone: Tone }[];
  onChange: (value: T) => void;
}) {
  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
      {options.map(opt => {
        const active = value === opt.value;
        const activeStyle =
          opt.tone === 'pass' ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm shadow-emerald-600/20'
          : opt.tone === 'fail' ? 'bg-red-600 border-red-600 text-white shadow-sm shadow-red-600/20'
          : 'bg-slate-800 border-slate-800 text-white dark:bg-slate-200 dark:border-slate-200 dark:text-slate-900';
        const Icon = opt.tone === 'pass' ? Check : opt.tone === 'fail' ? X : Minus;
        return (
          <button
            key={String(opt.value)}
            type="button"
            aria-pressed={active}
            onClick={() => { triggerHaptic('light'); onChange(opt.value); }}
            className={`min-h-12 px-1.5 sm:px-3 rounded-xl border text-[13px] sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer select-none active:scale-[0.98] ${
              active
                ? activeStyle
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Icon size={16} strokeWidth={2.75} className={`hidden sm:block shrink-0 ${active ? '' : 'text-slate-400'}`} />
            <span className="leading-tight text-center">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function Section({ title, hint, children, action }: { title: string; hint?: string; children: ReactNode; action?: ReactNode }) {
  return (
    <section className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs">
      <header className="px-5 pt-4 pb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-[15px] font-bold text-slate-900 dark:text-white">{title}</h3>
          {hint && <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">{hint}</p>}
        </div>
        {action}
      </header>
      <div className="px-5 pb-5">{children}</div>
    </section>
  );
}

function StatusPill({ result, emptyLabel = 'Ej bedömd' }: { result: Result; emptyLabel?: string }) {
  const map: Record<string, [string, string]> = {
    'Godkänt': ['Godkänd', 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-900'],
    'Underkänt': ['Underkänd', 'bg-red-50 text-red-700 ring-red-200 dark:bg-red-950/40 dark:text-red-300 dark:ring-red-900'],
    '-': ['Ej genomförd', 'bg-slate-100 text-slate-600 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700'],
  };
  const [label, style] = map[result || ''] || [emptyLabel, 'bg-slate-50 text-slate-500 ring-slate-200 dark:bg-slate-800/60 dark:text-slate-400 dark:ring-slate-700'];
  return <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ring-1 ring-inset ${style}`}>{label}</span>;
}

export function ResultatScreen() {
  const navigate = useNavigate();
  const { state, updateState } = useAppStore();

  const licenseType = state.properties.licenseType || 'B';
  const testType = state.properties.testType || 'Förstaprov';
  const HEAVY_LICENSES = ['C1', 'C', 'C1E', 'CE', 'D1', 'D', 'D1E', 'DE'];
  const SAFETY_CHECK_LICENSES = [...HEAVY_LICENSES, 'BE'];
  const isTaxi = licenseType === 'TAXI';
  const newLayout = isNewLayout(state);

  const [validationIssues, setValidationIssues] = useState<{ level: 'error' | 'warning'; text: string }[] | null>(null);
  const [showReview, setShowReview] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);

  const isOmprovSakerhet = testType === 'Omprov säkerhetskontroll';
  const isOmprovKorning = testType === 'Omprov körning';
  const isAssessmentOnly = testType.includes('Bedömningsprov') || testType.includes('Testprov');
  const heavyMandatory = SAFETY_CHECK_LICENSES.includes(licenseType) && !isOmprovKorning;
  const showDriving = !isOmprovSakerhet;

  // Bara moment som ingått i provet kan väljas, samma regel som för bristerna
  const interventionSituationOptions = state.includedTestItems?.length > 0
    ? Array.from(new Set(state.includedTestItems))
    : failureSituations;
  const interventionSituations = state.result.interventionSituations || [];

  // Situationer från markerade brister/anteckningar som ännu inte finns i bristförteckningen
  const suggestedSituations: string[] = Array.from(new Set<string>(
    (state.events || [])
      .filter(e => e.kind !== 'ingripande' && e.situation)
      .map(e => e.situation as string)
  )).filter(sit => !(state.result.drivingFailure?.situations || []).includes(sit));

  const drivingDone = isOmprovSakerhet || (Boolean(state.result.drivingResult) && state.result.drivingResult !== '-');
  const safetyDone = !heavyMandatory || (Boolean(state.result.safetyCheckResult) && state.result.safetyCheckResult !== '-');
  const isAssessmentComplete = drivingDone && safetyDone;

  let hasFailed = false;
  if (isOmprovSakerhet) {
    hasFailed = state.result.safetyCheckResult === 'Underkänt' || Boolean(state.result.testAborted);
  } else if (isOmprovKorning) {
    hasFailed = state.result.drivingResult === 'Underkänt' || Boolean(state.result.testAborted);
  } else {
    const safetyFailed = heavyMandatory && state.result.safetyCheckResult === 'Underkänt';
    hasFailed = state.result.drivingResult === 'Underkänt' || safetyFailed || Boolean(state.result.testAborted);
  }

  // Kontrollera att protokollet blir komplett innan det skapas
  const collectIssues = () => {
    const issues: { level: 'error' | 'warning'; text: string }[] = [];
    const checkFailure = (label: string, f: typeof state.result.drivingFailure) => {
      if (!f?.primaryCause?.area) {
        issues.push({ level: 'error', text: `${label}: välj ${newLayout ? 'kompetensområde' : 'grundorsak (kompetensområde)'}.` });
      } else if (!f.primaryCause.deficiencies?.length) {
        issues.push({ level: 'error', text: `${label}: markera minst en brist under "${f.primaryCause.area}".` });
      }
      (f?.consequences || []).forEach((c, i) => {
        if (!c.area) issues.push({ level: 'error', text: `${label}: ${newLayout ? `område ${i + 2}` : `konsekvensområde ${i + 1}`} saknar kompetensområde.` });
        else if (!c.deficiencies?.length) issues.push({ level: 'warning', text: `${label}: inga brister är markerade under "${c.area}".` });
      });
    };

    if (!isAssessmentComplete) {
      issues.push({ level: 'error', text: heavyMandatory && showDriving ? 'Bedöm både körning och säkerhetskontroll.' : heavyMandatory ? 'Bedöm säkerhetskontrollen.' : 'Bedöm körningen.' });
    }
    if (showDriving && state.result.drivingResult === 'Underkänt') {
      checkFailure('Körning', state.result.drivingFailure);
    }
    if (heavyMandatory && state.result.safetyCheckResult === 'Underkänt') {
      checkFailure('Säkerhetskontroll', state.result.safetyCheckFailure);
    }
    const anySituations = (state.result.drivingFailure?.situations?.length || 0) + (state.result.safetyCheckFailure?.situations?.length || 0) > 0;
    if (hasFailed && !state.result.testAborted && !anySituations) {
      issues.push({ level: 'warning', text: 'Ingen situation är vald där bristerna visade sig.' });
    }
    if (state.result.interventionOccurred && interventionSituations.length === 0) {
      issues.push({ level: 'warning', text: 'Ingripande är markerat utan situation. Protokollet visar då bara "Ingripande har förekommit."' });
    }
    return issues;
  };

  const handleNext = () => {
    const issues = collectIssues();
    if (issues.length > 0) {
      setValidationIssues(issues);
      return;
    }
    navigate('/korprov/protokoll');
  };

  const updateResult = (field: keyof typeof state.result, value: any) => {
    updateState((prev) => {
      const next = { ...prev, result: { ...prev.result, [field]: value } };

      // Byts körningen från underkänd rensas bristförteckningen
      if (field === 'drivingResult' && value !== 'Underkänt') {
        next.result.drivingFailure = { ...EMPTY_FAILURE, primaryCause: { area: '', deficiencies: [] } };
      }

      if (field === 'safetyCheckResult') {
        if (value === 'Underkänt') {
          if (!next.result.safetyCheckFailure?.primaryCause?.area) {
            next.result.safetyCheckFailure = { ...EMPTY_FAILURE, primaryCause: { area: 'Fordonskännedom', deficiencies: [] } };
          }
        } else {
          next.result.safetyCheckFailure = { ...EMPTY_FAILURE, primaryCause: { area: '', deficiencies: [] } };
        }
      }
      return next;
    });
  };

  const setIntervention = (occurred: boolean) => {
    if (occurred) {
      updateResult('interventionOccurred', true);
      return;
    }
    updateState(prev => ({
      ...prev,
      events: (prev.events || []).filter(e => e.kind !== 'ingripande'),
      result: { ...prev.result, interventionOccurred: false, interventionSituations: [] },
    }));
  };

  const addSuggestedSituations = (sits: string[]) => {
    triggerHaptic('light');
    updateState(prev => {
      const included = prev.includedTestItems || [];
      const current = prev.result.drivingFailure?.situations || [];
      return {
        ...prev,
        includedTestItems: [...included, ...sits.filter(s => !included.includes(s))],
        result: {
          ...prev.result,
          drivingFailure: {
            ...prev.result.drivingFailure,
            situations: [...current, ...sits.filter(s => !current.includes(s))],
          },
        },
      };
    });
  };

  // Hoppa direkt till bristförteckningen när körningen sätts till underkänd
  const failureFormRef = useRef<HTMLDivElement>(null);
  const prevDrivingResult = useRef(state.result.drivingResult);
  useEffect(() => {
    const prev = prevDrivingResult.current;
    prevDrivingResult.current = state.result.drivingResult;
    if (state.result.drivingResult === 'Underkänt' && prev !== 'Underkänt') {
      requestAnimationFrame(() => failureFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    }
  }, [state.result.drivingResult]);

  // Samma kontroll som vid "Skapa protokoll", men löpande i raden längst ner
  const liveIssues = collectIssues();
  const liveErrors = liveIssues.filter(i => i.level === 'error').length;
  const liveWarnings = liveIssues.length - liveErrors;

  // Totalt resultat i klartext
  const total: { tone: Tone; label: string; detail: string } = !isAssessmentComplete
    ? { tone: 'neutral', label: 'Ej klart', detail: 'Bedöm provet för att se resultatet.' }
    : hasFailed
      ? { tone: 'fail', label: 'Underkänt', detail: state.result.testAborted ? 'Provet avbröts. Ingen behörighet uppnås.' : 'Ingen behörighet uppnås.' }
      : {
          tone: 'pass',
          label: 'Godkänt',
          detail: isTaxi
            ? 'Godkänt taxiförarprov. Kandidaten kan ansöka om taxiförarlegitimation.'
            : isAssessmentOnly
              ? 'Godkänt bedömningsprov. Ingen behörighet uppnås.'
              : `Behörighet uppnås: ${licenseType}`,
        };

  const toneBox = {
    pass: 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-100',
    fail: 'border-red-200 bg-red-50 text-red-900 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-100',
    neutral: 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300',
  }[total.tone];
  const toneIcon = { pass: 'bg-emerald-600', fail: 'bg-red-600', neutral: 'bg-slate-400 dark:bg-slate-600' }[total.tone];
  const TotalIcon = total.tone === 'pass' ? Check : total.tone === 'fail' ? X : Minus;

  const heavyWithNote = HEAVY_LICENSES.includes(licenseType) || licenseType === 'BE';

  return (
    <PrivacyGuard className="max-w-[1300px] mx-auto px-4 sm:px-6 pb-40 block">
      <div ref={topRef} className="scroll-mt-4" />

      {/* Rubrik */}
      <div className="flex flex-wrap items-end justify-between gap-3 mt-2 sm:mt-4 mb-5">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Resultat</p>
          <h2 className="text-2xl sm:text-[28px] font-bold tracking-tight text-slate-900 dark:text-white truncate">
            {state.properties.studentName || 'Kandidat'}
          </h2>
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-900 text-white dark:bg-blue-600">{licenseType}</span>
            <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">{testType}</span>
            {state.properties.transmission === 'Automat' && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-900">Automat</span>
            )}
            {newLayout && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-200 dark:bg-violet-950/40 dark:text-violet-300 dark:ring-violet-900" title="Protokollet skapas i Trafikverkets nya utformning">
                Ny provlayout
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start">
        {/* Vänster: bedömningen */}
        <div className="lg:col-span-8 space-y-4">

          {/* Körning */}
          {showDriving && (
            <Section title="Körning" hint={testType.includes('Testprov') ? 'Bedöm på en skala 1–6. Minst 5 krävs för godkänt.' : undefined}>
              {testType.includes('Testprov') ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-6 gap-2">
                    {[1, 2, 3, 4, 5, 6].map(score => {
                      const passing = score >= 5;
                      const active = (state.result as any).drivingScore === score;
                      return (
                        <button
                          key={score}
                          type="button"
                          onClick={() => {
                            updateResult('drivingScore' as any, score);
                            updateResult('drivingResult', passing ? 'Godkänt' : 'Underkänt');
                          }}
                          className={`h-12 rounded-xl border font-bold transition-colors cursor-pointer ${
                            active
                              ? passing ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-red-600 border-red-600 text-white'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                          }`}
                        >
                          {score}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    type="button"
                    onClick={() => { updateResult('drivingScore' as any, null); updateResult('drivingResult', '-'); }}
                    className={`text-sm font-medium px-3 h-9 rounded-lg cursor-pointer ${state.result.drivingResult === '-' ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                  >
                    Ej genomförd
                  </button>
                </div>
              ) : (
                <Choice
                  value={state.result.drivingResult as any}
                  onChange={(v: any) => updateResult('drivingResult', v)}
                  options={[
                    { value: 'Godkänt', label: 'Godkänd', tone: 'pass' },
                    { value: 'Underkänt', label: 'Underkänd', tone: 'fail' },
                    { value: '-', label: 'Ej genomförd', tone: 'neutral' },
                  ]}
                />
              )}
            </Section>
          )}

          {/* Brister i körningen */}
          {showDriving && state.result.drivingResult === 'Underkänt' && (
            <div ref={failureFormRef} className="animate-fade-in scroll-mt-4 space-y-3">
              {suggestedSituations.length > 0 && (
                <div className="rounded-2xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/70 dark:bg-blue-950/20 p-4">
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div>
                      <div className="text-sm font-semibold text-blue-950 dark:text-blue-100">Markerat under körningen</div>
                      <div className="text-[13px] text-blue-800/80 dark:text-blue-300/80">Lägg till som situationer där bristerna visade sig.</div>
                    </div>
                    {suggestedSituations.length > 1 && (
                      <button
                        type="button"
                        onClick={() => addSuggestedSituations(suggestedSituations)}
                        className="h-9 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer shrink-0"
                      >
                        Lägg till alla
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {suggestedSituations.map(sit => (
                      <button
                        key={sit}
                        type="button"
                        onClick={() => addSuggestedSituations([sit])}
                        className="min-h-9 px-3 rounded-lg bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800 text-sm font-medium text-blue-900 dark:text-blue-200 hover:bg-blue-100 dark:hover:bg-blue-900/40 flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus size={14} /> {sit}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <FailureForm
                title="Brister i körningen"
                data={state.result.drivingFailure}
                onChange={(data) => updateResult('drivingFailure', data)}
                type="driving"
              />
            </div>
          )}

          {/* Säkerhetskontroll – BE och tunga behörigheter */}
          {heavyMandatory && (
            <Section title="Säkerhetskontroll">
              <Choice
                value={state.result.safetyCheckResult as any}
                onChange={(v: any) => updateResult('safetyCheckResult', v)}
                options={[
                  { value: 'Godkänt', label: 'Godkänd', tone: 'pass' },
                  { value: 'Underkänt', label: 'Underkänd', tone: 'fail' },
                  { value: '-', label: 'Ej genomförd', tone: 'neutral' },
                ]}
              />
            </Section>
          )}
          {heavyMandatory && state.result.safetyCheckResult === 'Underkänt' && (
            <div className="animate-fade-in">
              <FailureForm
                title="Brister i säkerhetskontrollen"
                data={state.result.safetyCheckFailure}
                onChange={(data) => updateResult('safetyCheckFailure', data)}
                type="safety"
              />
            </div>
          )}

          {/* Ingripande och avbrutet prov */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Section title="Ingripande" hint="Behövde du ingripa under provet?">
              <Choice
                value={Boolean(state.result.interventionOccurred)}
                onChange={setIntervention}
                options={[
                  { value: false, label: 'Nej', tone: 'neutral' },
                  { value: true, label: 'Ja', tone: 'fail' },
                ]}
              />
            </Section>
            <Section title="Avbrutet prov" hint="Avbröts provet i förtid?">
              <Choice
                value={Boolean(state.result.testAborted)}
                onChange={(v) => updateResult('testAborted', v)}
                options={[
                  { value: false, label: 'Nej', tone: 'neutral' },
                  { value: true, label: 'Ja', tone: 'fail' },
                ]}
              />
            </Section>
          </div>

          {state.result.interventionOccurred && (
            <Section title="I vilka situationer ingrep du?" hint='Valfritt. Utan val står det "Ingripande har förekommit." i protokollet.'>
              <div className="flex flex-wrap gap-2">
                {interventionSituationOptions.map(sit => {
                  const selected = interventionSituations.includes(sit);
                  return (
                    <button
                      key={sit}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => updateResult(
                        'interventionSituations',
                        selected ? interventionSituations.filter(s => s !== sit) : [...interventionSituations, sit]
                      )}
                      className={`min-h-9 px-3 rounded-full border text-sm font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                        selected
                          ? 'bg-orange-500 border-orange-500 text-white'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-orange-300'
                      }`}
                    >
                      {selected && <Check size={14} strokeWidth={3} />}
                      {sit}
                    </button>
                  );
                })}
              </div>
            </Section>
          )}

          {/* Körväg och händelser från Navigator */}
          {hasRouteData(state) && (
            <Section
              title="Körväg och händelser"
              action={
                <button
                  type="button"
                  onClick={() => setShowReview(true)}
                  className="h-9 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Maximize2 size={13} /> Visa för kandidaten
                </button>
              }
            >
              <RouteReview route={state.route} events={state.events} />
            </Section>
          )}

          {/* Förhandsvisning av protokollet */}
          <details className="group bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
            <summary className="cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden px-5 py-4 flex items-center gap-3">
              <FileText size={18} className="text-slate-400 shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="text-[15px] font-bold text-slate-900 dark:text-white">Förhandsgranska protokollet</div>
                <div className="text-[13px] text-slate-500 dark:text-slate-400">Så här ser kandidatens protokoll ut just nu.</div>
              </div>
              <ChevronDown size={18} className="text-slate-400 transition-transform group-open:rotate-180 shrink-0" />
            </summary>
            <div className="border-t border-slate-100 dark:border-slate-800 p-4 sm:p-6 overflow-x-auto">
              <OfficialPrintLayout />
            </div>
          </details>

          {/* Bedömningsgrunder */}
          <details className="group rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 text-slate-700 dark:text-slate-300 print:hidden">
            <summary className="cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden px-5 py-3.5 flex items-center gap-3 text-sm font-semibold">
              <Info size={16} className="text-slate-400 shrink-0" />
              Bedömningsgrunder (TSFS 2012:41, 4 kap.)
              <ChevronDown size={16} className="ml-auto text-slate-400 transition-transform group-open:rotate-180" />
            </summary>
            <ul className="text-sm space-y-1.5 list-disc pl-10 pr-5 pb-4 leading-relaxed">
              <li>Provet bedöms inom fyra kompetensområden: fordonskännedom och manövrering, miljömedveten körning, trafikregler samt trafiksäkerhet och beteende.</li>
              <li>Enstaka brister som har liten betydelse för trafiksäkerheten ska inte leda till underkännande.</li>
              <li>Vid mörker, nedsatt sikt eller halt väglag läggs särskild vikt vid belysning, placering och hastighet.</li>
            </ul>
          </details>
        </div>

        {/* Höger: sammanfattning */}
        <aside className="lg:col-span-4 lg:sticky lg:top-4 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
            <div className="px-5 pt-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="text-sm font-medium text-slate-500 dark:text-slate-400">Sammanfattning</div>
              <div className="mt-1 font-semibold text-slate-900 dark:text-white truncate">{state.properties.studentName || 'Namn saknas'}</div>
              <div className="text-sm text-slate-500 dark:text-slate-400 font-mono">{state.properties.personalNumber || 'Personnummer saknas'}</div>
            </div>

            <dl className="px-5 py-3 divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {showDriving && (
                <div className="flex items-center justify-between gap-3 py-2.5">
                  <dt className="text-slate-600 dark:text-slate-300">Körning</dt>
                  <dd><StatusPill result={state.result.drivingResult as Result} /></dd>
                </div>
              )}
              {heavyMandatory && (
                <div className="flex items-center justify-between gap-3 py-2.5">
                  <dt className="text-slate-600 dark:text-slate-300">Säkerhetskontroll</dt>
                  <dd><StatusPill result={state.result.safetyCheckResult as Result} /></dd>
                </div>
              )}
              <div className="flex items-center justify-between gap-3 py-2.5">
                <dt className="text-slate-600 dark:text-slate-300">Ingripande</dt>
                <dd className={`font-medium ${state.result.interventionOccurred ? 'text-orange-600 dark:text-orange-400' : 'text-slate-500 dark:text-slate-400'}`}>
                  {state.result.interventionOccurred ? `Ja${interventionSituations.length ? ` (${interventionSituations.length})` : ''}` : 'Nej'}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3 py-2.5">
                <dt className="text-slate-600 dark:text-slate-300">Avbrutet</dt>
                <dd className={`font-medium ${state.result.testAborted ? 'text-red-600 dark:text-red-400' : 'text-slate-500 dark:text-slate-400'}`}>
                  {state.result.testAborted ? 'Ja' : 'Nej'}
                </dd>
              </div>
            </dl>

            {/* Delprov som tillgodoräknas vid omprov */}
            {heavyWithNote && state.result.safetyCheckResult === 'Godkänt' && state.result.drivingResult === 'Underkänt' && (
              <p className="mx-5 mb-3 text-[13px] leading-snug rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200 px-3.5 py-2.5">
                Säkerhetskontrollen är godkänd och behöver inte göras om vid omprov.
              </p>
            )}
            {heavyWithNote && state.result.safetyCheckResult === 'Underkänt' && state.result.drivingResult === 'Godkänt' && (
              <p className="mx-5 mb-3 text-[13px] leading-snug rounded-xl bg-blue-50 dark:bg-blue-950/30 text-blue-900 dark:text-blue-200 px-3.5 py-2.5">
                Körningen är godkänd. Vid omprov görs bara säkerhetskontrollen.
              </p>
            )}

            <div className={`m-3 mt-1 rounded-xl border p-4 flex items-center gap-3.5 ${toneBox}`}>
              <span className={`w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0 ${toneIcon}`}>
                <TotalIcon size={22} strokeWidth={3} />
              </span>
              <div className="min-w-0">
                <div className="text-xs font-medium opacity-70">Totalt resultat</div>
                <div className="text-xl font-bold leading-tight">{total.label}</div>
                <div className="text-[13px] mt-0.5 opacity-80 leading-snug">{total.detail}</div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Raden längst ner – alltid synlig */}
      <Portal>
        <div className="fixed inset-x-0 bottom-[calc(60px+env(safe-area-inset-bottom))] md:bottom-0 z-40 print:hidden border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md">
          <div className="max-w-[1300px] mx-auto px-3 sm:px-6 py-2.5 flex items-center gap-2 sm:gap-3 md:pb-[max(0.625rem,env(safe-area-inset-bottom))]">
            <button
              type="button"
              onClick={() => liveIssues.length > 0 && setValidationIssues(liveIssues)}
              title={liveIssues.length > 0 ? 'Visa vad som saknas' : undefined}
              className={`text-left flex items-center gap-2.5 min-w-0 flex-1 px-3 h-12 rounded-xl border ${liveIssues.length > 0 ? 'cursor-pointer' : 'cursor-default'} ${toneBox}`}
            >
              <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0 ${toneIcon}`}>
                <TotalIcon size={16} strokeWidth={3} />
              </span>
              <div className="min-w-0 leading-tight">
                <div className="text-sm font-bold truncate">{total.label}</div>
                <div className="text-xs truncate opacity-75">
                  {liveErrors > 0
                    ? `${liveErrors} ${liveErrors === 1 ? 'sak saknas' : 'saker saknas'}`
                    : liveWarnings > 0
                      ? `${liveWarnings} att se över`
                      : 'Klart för protokoll'}
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => printProtocol(state)}
              className="h-12 w-12 sm:w-auto sm:px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center gap-2 text-sm font-semibold cursor-pointer shrink-0"
              title="Skriv ut eller spara som PDF"
            >
              <Printer size={18} />
              <span className="hidden sm:inline">Skriv ut</span>
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="h-12 px-4 sm:px-7 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer shrink-0 transition-all"
            >
              Skapa protokoll
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </Portal>

      {/* Kontroll innan protokollet skapas */}
      {validationIssues && (
        <Portal>
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-150" onClick={() => setValidationIssues(null)}>
          <div className="w-full sm:max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="px-5 pt-5 pb-3 flex items-start gap-3">
              <span className={`p-2 rounded-xl shrink-0 ${validationIssues.some(i => i.level === 'error') ? 'bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400' : 'bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400'}`}>
                <AlertTriangle size={20} />
              </span>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  {validationIssues.some(i => i.level === 'error') ? 'Protokollet är inte klart' : 'Kontrollera innan du går vidare'}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Det här saknas eller bör ses över:</p>
              </div>
            </div>
            <ul className="px-5 pb-4 space-y-2 max-h-[50dvh] overflow-y-auto">
              {validationIssues.map((issue, idx) => (
                <li key={idx} className={`text-sm p-3 rounded-xl flex gap-2.5 ${
                  issue.level === 'error'
                    ? 'bg-red-50 dark:bg-red-950/20 text-red-900 dark:text-red-200'
                    : 'bg-amber-50 dark:bg-amber-950/20 text-amber-900 dark:text-amber-200'
                }`}>
                  {issue.level === 'error' ? <X size={16} className="shrink-0 mt-0.5" /> : <AlertTriangle size={16} className="shrink-0 mt-0.5" />}
                  <span>{issue.text}</span>
                </li>
              ))}
            </ul>
            <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-800 flex flex-col-reverse sm:flex-row gap-2 sm:justify-end pb-[max(1rem,env(safe-area-inset-bottom))]">
              <button
                type="button"
                onClick={() => { setValidationIssues(null); navigate('/korprov/protokoll'); }}
                className="h-11 px-4 rounded-xl text-sm font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Skapa protokoll ändå
              </button>
              <button
                type="button"
                onClick={() => { setValidationIssues(null); topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}
                className="h-12 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold cursor-pointer"
              >
                Komplettera
              </button>
            </div>
          </div>
        </div>
        </Portal>
      )}

      <RouteReviewModal
        open={showReview}
        onClose={() => setShowReview(false)}
        route={state.route}
        events={state.events}
        title={`Genomgång – ${state.properties.studentName || 'Kandidat'}`}
        subtitle={`${licenseType} · ${state.properties.testDate || ''}`}
      />
    </PrivacyGuard>
  );
}
