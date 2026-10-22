import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/ProvContext';
import {
  FileText,
  UserCheck,
  Car,
  HelpCircle,
  BookOpen,
  ChevronRight,
  ChevronDown,
  Clock,
  Navigation,
  ShieldAlert,
  MessageSquare,
  Wrench,
  Flag,
  Globe2
} from 'lucide-react';
import { cn, triggerHaptic } from '../../lib/utils';
import { KompetensOmradenCard } from './components/KompetensOmradenCard';
import { LICENSE_GUIDES } from '../../data/licenseGuidesData';
import { buildTalmanus } from '../../data/talmanus';

export function InledningScreen() {
  const navigate = useNavigate();
  const { state, updateState, profile } = useAppStore();
  const [showGuideDetails, setShowGuideDetails] = useState(false);
  // Talmanus eller korta punkter – valet kommer ihåg
  const [view, setViewState] = useState<'manus' | 'punkter'>(() => {
    try { return localStorage.getItem('inledning-vy') === 'punkter' ? 'punkter' : 'manus'; } catch { return 'manus'; }
  });
  const setView = (v: 'manus' | 'punkter') => {
    setViewState(v);
    try { localStorage.setItem('inledning-vy', v); } catch { /* ignoreras */ }
  };

  const { studentName, personalNumber, licenseType, testType, transmission, interpreterPresent, interpreterLanguage } = state.properties;
  const license = licenseType || 'B';
  const guide = LICENSE_GUIDES[license] ?? LICENSE_GUIDES[license.split(' (')[0]];
  const isOmprovKorning = testType?.includes('Omprov körning');
  const isOmprovSakerhet = testType?.includes('Omprov säkerhetskontroll');
  const isBedomning = testType?.includes('Bedömningsprov') || testType?.includes('Testprov');

  const handleNext = () => {
    navigate('/korprov/korning');
  };

  const toggleCheck = (field: keyof typeof state.checklist) => {
    triggerHaptic('light');
    updateState((prev) => ({
      ...prev,
      checklist: { ...(prev.checklist || {}), [field]: !(prev.checklist?.[field]) }
    }));
  };

  const checks = [
    {
      id: 'identityChecked',
      label: 'Identitet fastställd',
      desc: 'Giltig id-handling (körkort, pass, id-kort eller nationellt id-kort) och att fotot stämmer med kandidaten.',
      icon: UserCheck
    },
    {
      id: 'licenseTypeCorrect',
      label: 'Behörighet och villkor',
      desc: `Provet gäller ${license}${testType ? `, ${testType.toLowerCase()}` : ''}. Körkortstillstånd och eventuella villkor stämmer med bokningen.`,
      icon: FileText
    },
    {
      id: 'vehicleCorrect',
      label: 'Fordon',
      desc: `Fordonet motsvarar behörigheten, är besiktigat, försäkrat och trafikdugligt.${transmission === 'Automat' ? ' Automatväxlat ger villkor 78.' : ''}`,
      icon: Car
    },
    {
      id: 'studentInformed',
      label: 'Information om provet',
      desc: 'Du har gått igenom hur provet går till och de fem kompetensområdena (se nedan).',
      icon: BookOpen
    },
    {
      id: 'questionsAnswered',
      label: 'Frågor besvarade',
      desc: 'Kandidaten har fått ställa frågor och vet att hen får fråga under provet om en instruktion är otydlig.',
      icon: HelpCircle
    }
  ] as const;

  const doneCount = checks.filter(c => state.checklist?.[c.id]).length;
  const allChecked = doneCount === checks.length;

  const toggleAllChecks = () => {
    triggerHaptic('medium');
    const targetState = !allChecked;
    const updated: Record<string, boolean> = {};
    checks.forEach(c => {
      updated[c.id] = targetState;
    });
    updateState((prev) => ({
      ...prev,
      checklist: { ...(prev.checklist || {}), ...updated }
    }));
  };

  // Det förarprövaren går igenom med kandidaten innan start
  const talkingPoints: { icon: React.ElementType; title: string; text: string }[] = [
    ...(!isOmprovSakerhet && guide ? [{
      icon: Clock,
      title: 'Körtid',
      text: guide.driveTime,
    }] : []),
    ...(!isOmprovKorning && guide ? [{
      icon: Wrench,
      title: guide.safetyCheck.title,
      text: guide.safetyCheck.description,
    }] : []),
    {
      icon: Navigation,
      title: 'Vägbeskrivning',
      text: 'Jag säger i god tid vart vi ska. En del av provet kan vara självständig körning mot ett mål eller efter skyltning. Kör du fel är det inget fel i sig.',
    },
    {
      icon: ShieldAlert,
      title: 'Ingripande och avbrott',
      text: 'Om jag behöver ingripa för att undvika en farlig situation påverkar det bedömningen. Provet kan avbrytas om trafiksäkerheten kräver det.',
    },
    {
      icon: MessageSquare,
      title: 'Fråga när du vill',
      text: 'Har du inte uppfattat en instruktion, fråga. Jag upprepar gärna.',
    },
    {
      icon: Flag,
      title: 'Efter provet',
      text: isBedomning
        ? 'Du får en muntlig genomgång direkt efter provet. Det här provet ger ingen behörighet.'
        : 'Du får besked om resultatet direkt efter provet, och protokollet skickas till din e-post.',
    },
  ];

  const script = buildTalmanus({
    candidateName: studentName || '',
    inspectorName: state.properties.examiner || profile.name || '',
    license,
    testType: testType || 'Förstaprov',
    driveTime: guide?.driveTime,
    safetyCheckTitle: guide?.safetyCheck?.title,
    interpreter: interpreterPresent ? (interpreterLanguage || 'tolk') : undefined,
  });

  return (
    <div className="max-w-6xl mx-auto sm:px-2 w-full text-ink">

      {/* Rubrik */}
      <header className="mb-5">
        <h1 className="text-[28px] sm:text-4xl font-bold text-ink leading-[1.05]">Inledning</h1>
        <p className="text-[15px] text-ink-2 mt-1.5 max-w-2xl">
          Kontrollera identitet, behörighet och fordon, och berätta hur provet går till innan ni kör.
        </p>
      </header>

      {/* Sammanfattning av kandidat och prov */}
      <div className="mb-6 bg-surface border border-line rounded-card p-4 flex flex-wrap items-center gap-x-5 gap-y-3">
        <div className="min-w-0 flex-1 basis-48">
          <div className="text-[17px] font-semibold text-ink truncate">{studentName || 'Namn saknas'}</div>
          <div className="text-[13px] text-ink-3 tabular-nums">{personalNumber || 'Personnummer saknas'}</div>
        </div>
        <dl className="flex flex-wrap gap-2 text-[13px]">
          <div className="h-8 px-2.5 rounded-lg bg-navy text-white dark:bg-blue-600 font-bold flex items-center">
            <dt className="sr-only">Behörighet</dt><dd>{license}</dd>
          </div>
          <div className="h-8 px-2.5 rounded-lg bg-surface-2 border border-line text-ink flex items-center">
            <dt className="sr-only">Provtyp</dt><dd>{testType || 'Förstaprov'}</dd>
          </div>
          <div className="h-8 px-2.5 rounded-lg bg-surface-2 border border-line text-ink flex items-center">
            <dt className="sr-only">Växellåda</dt><dd>{transmission || 'Manuell'}</dd>
          </div>
          {interpreterPresent && (
            <div className="h-8 px-2.5 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 text-blue-800 dark:text-blue-200 flex items-center gap-1.5">
              <Globe2 size={14} />
              <dt className="sr-only">Tolk</dt><dd>Tolk{interpreterLanguage ? `: ${interpreterLanguage}` : ''}</dd>
            </div>
          )}
        </dl>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">

        {/* Vänster: checklista */}
        <section className="lg:col-span-5 space-y-3" aria-labelledby="checklista-rubrik">
          <div className="flex items-center justify-between gap-3">
            <h2 id="checklista-rubrik" className="text-lg font-semibold text-ink">Checklista före start</h2>
            <button
              type="button"
              onClick={toggleAllChecks}
              className="h-10 px-3 -mr-3 text-sm font-semibold text-navy dark:text-blue-400 rounded-control hover:bg-navy/5 dark:hover:bg-blue-500/10 cursor-pointer"
            >
              {allChecked ? 'Avmarkera alla' : 'Markera alla'}
            </button>
          </div>

          <div className="bg-surface border border-line rounded-card overflow-hidden">
            {/* Framsteg */}
            <div className="px-4 pt-3.5 pb-3 border-b border-line flex items-center gap-3">
              <div className="flex-1 h-1.5 rounded-full bg-surface-2 overflow-hidden">
                <div
                  className={cn('h-full rounded-full transition-all duration-300', allChecked ? 'bg-emerald-500' : 'bg-navy dark:bg-blue-500')}
                  style={{ width: `${(doneCount / checks.length) * 100}%` }}
                />
              </div>
              <span className="text-[13px] font-semibold text-ink-2 tabular-nums">{doneCount} av {checks.length}</span>
            </div>

            <ul className="divide-y divide-line">
              {checks.map((check) => {
                const isChecked = Boolean(state.checklist?.[check.id]);
                const Icon = check.icon;
                return (
                  <li key={check.id}>
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={isChecked}
                      onClick={() => toggleCheck(check.id)}
                      className={cn(
                        'w-full text-left px-4 py-3.5 flex items-start gap-3.5 transition-colors cursor-pointer',
                        isChecked ? 'bg-emerald-50/60 dark:bg-emerald-500/[0.06]' : 'hover:bg-surface-2'
                      )}
                    >
                      <span className={cn(
                        'shrink-0 mt-0.5 w-9 h-9 rounded-full flex items-center justify-center transition-colors',
                        isChecked
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
                          : 'bg-surface-2 text-ink-3'
                      )}>
                        <Icon size={18} />
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className={cn('block font-semibold text-[15px]', isChecked ? 'text-emerald-800 dark:text-emerald-300' : 'text-ink')}>
                          {check.label}
                        </span>
                        <span className="block text-[13px] text-ink-2 mt-0.5 leading-snug">
                          {check.desc}
                        </span>
                      </span>
                      <span className={cn(
                        'shrink-0 mt-1.5 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors',
                        isChecked ? 'bg-emerald-600 border-emerald-600' : 'border-ink-3/50 bg-surface'
                      )}>
                        {isChecked && (
                          <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="white" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m3.5 8.5 3 3 6-7" /></svg>
                        )}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        {/* Höger: information till kandidaten */}
        <div className="lg:col-span-7 space-y-6">
          <section className="bg-surface border border-line rounded-card p-4 sm:p-6" aria-labelledby="provet-rubrik">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 id="provet-rubrik" className="text-lg font-semibold text-ink">Så går provet till</h2>
                <p className="text-[13px] text-ink-2 mt-0.5">
                  {view === 'manus' ? 'Läs repliken högt – det i kursiv stil är till dig.' : `Punkter att gå igenom${guide ? `, anpassade för ${license}` : ''}.`}
                </p>
              </div>
              <div className="inline-flex p-0.5 rounded-control bg-surface-2 border border-line shrink-0" role="tablist" aria-label="Visning">
                {([['manus', 'Talmanus'], ['punkter', 'Punkter']] as const).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    role="tab"
                    aria-selected={view === id}
                    onClick={() => setView(id)}
                    className={cn('h-8 px-3 rounded-[9px] text-[13px] font-medium cursor-pointer transition-colors',
                      view === id ? 'bg-surface text-ink font-semibold shadow-lift' : 'text-ink-2 hover:text-ink')}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {view === 'manus' && (
              <ol className="mt-5 space-y-6">
                {script.map((section, i) => (
                  <li key={section.id}>
                    <h3 className="text-[15px] font-semibold text-ink flex items-center gap-2.5 tracking-normal font-sans">
                      <span className="w-6 h-6 rounded-full bg-navy text-white dark:bg-blue-600 text-[12px] font-bold flex items-center justify-center tabular-nums shrink-0">{i + 1}</span>
                      {section.title}
                    </h3>
                    <div className="mt-2.5 ml-3 pl-5 border-l-2 border-line space-y-2.5">
                      {section.lines.map((line, j) => line.say ? (
                        <p key={j} className="text-[15px] leading-relaxed text-ink bg-navy/[0.04] dark:bg-blue-500/[0.07] rounded-control px-3.5 py-2.5">
                          ”{line.say}”
                        </p>
                      ) : (
                        <p key={j} className="text-[13px] italic text-ink-2 leading-relaxed flex gap-2">
                          <span aria-hidden="true" className="not-italic text-ink-3">→</span>
                          <span>{line.do}</span>
                        </p>
                      ))}
                    </div>
                  </li>
                ))}
              </ol>
            )}

            {view === 'punkter' && (
            <ul className="mt-4 space-y-3.5">
              {talkingPoints.map(({ icon: Icon, title, text }) => (
                <li key={title} className="flex gap-3">
                  <span className="shrink-0 w-9 h-9 rounded-full bg-navy/[0.07] dark:bg-blue-500/10 text-navy dark:text-blue-300 flex items-center justify-center">
                    <Icon size={17} />
                  </span>
                  <div className="min-w-0 pt-0.5">
                    <div className="text-[15px] font-semibold text-ink">{title}</div>
                    <p className="text-[14px] text-ink-2 leading-relaxed mt-0.5">{text}</p>
                  </div>
                </li>
              ))}
            </ul>
            )}

            {/* Behörighetens obligatoriska moment ur lathunden */}
            {guide && (guide.mandatoryHighlights.length > 0 || (guide.notes?.length ?? 0) > 0) && (
              <div className="mt-5 border-t border-line pt-3">
                <button
                  type="button"
                  onClick={() => setShowGuideDetails(v => !v)}
                  aria-expanded={showGuideDetails}
                  className="w-full min-h-11 flex items-center justify-between gap-3 text-left text-[15px] font-semibold text-ink cursor-pointer"
                >
                  Obligatoriskt för {license}
                  <ChevronDown size={18} className={cn('text-ink-3 transition-transform', showGuideDetails && 'rotate-180')} />
                </button>
                {showGuideDetails && (
                  <div className="pb-1 space-y-3 animate-in fade-in duration-150">
                    <ul className="space-y-2">
                      {guide.mandatoryHighlights.map(h => (
                        <li key={h} className="flex gap-2.5 text-[14px] text-ink-2 leading-relaxed">
                          <span className="mt-2 w-1.5 h-1.5 rounded-full bg-signal shrink-0" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                    {guide.notes && guide.notes.length > 0 && (
                      <div className="rounded-control bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 p-3 space-y-1">
                        {guide.notes.map(n => (
                          <p key={n} className="text-[13px] text-amber-900 dark:text-amber-200 leading-relaxed">{n}</p>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </section>

          <KompetensOmradenCard />
        </div>
      </div>

      {/* Åtgärdsrad */}
      <div className="sticky bottom-0 z-10 mt-8 -mx-4 sm:mx-0 px-4 py-3 sm:rounded-card bg-surface/95 backdrop-blur-xl border-t sm:border border-line flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center justify-between sm:justify-start gap-3">
          <p className="text-[13px] text-ink-2 text-center sm:text-left">
            {allChecked
              ? 'Checklistan är klar. Starta provtiden när ni kör iväg.'
              : `${checks.length - doneCount} ${checks.length - doneCount === 1 ? 'punkt' : 'punkter'} kvar i checklistan.`}
          </p>
          {!allChecked && (
            <button
              type="button"
              onClick={toggleAllChecks}
              className="text-xs font-semibold text-navy dark:text-blue-400 hover:underline cursor-pointer"
            >
              Bocka av alla
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!allChecked && (
            <button
              type="button"
              onClick={() => {
                const updated: Record<string, boolean> = {};
                checks.forEach(c => { updated[c.id] = true; });
                updateState(prev => ({ ...prev, checklist: { ...(prev.checklist || {}), ...updated } }));
                triggerHaptic('success');
                handleNext();
              }}
              className="h-12 px-4 rounded-control font-semibold text-[14px] bg-surface-2 hover:bg-surface border border-line text-ink flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              title="Godkänn alla punkter och gå direkt till körning"
            >
              Godkänn alla & Kör
            </button>
          )}
          <button
            type="button"
            onClick={() => { triggerHaptic('success'); handleNext(); }}
            disabled={!allChecked}
            className={cn(
              'h-12 px-6 rounded-control font-semibold text-[15px] flex items-center justify-center gap-1.5 transition-colors',
              allChecked
                ? 'bg-navy hover:bg-navy-deep dark:bg-blue-600 dark:hover:bg-blue-500 text-white cursor-pointer active:scale-[0.98]'
                : 'bg-surface-2 text-ink-3 border border-line cursor-not-allowed'
            )}
          >
            Starta körningen
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
