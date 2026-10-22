import React, { useEffect, useState } from 'react';
import { AppLogo } from '../../components/icons/AppLogo';
import { enterDemoMode, isDemoMode } from '../../lib/demoMode';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/ProvContext';
import { TEST_CONTENT } from '../../data/testContentCatalog';
import { VtrStatusBadge } from '../../components/VtrStatusBadge';
import { 
  User, 
  FileText, 
  ShieldCheck, 
  ChevronRight, 
  Users, 
  Calendar, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  UserCheck, 
  History,
  AlertTriangle,
  Cpu,
  Bookmark,
  Dice5
} from 'lucide-react';
import { triggerHaptic } from '../../lib/utils';
import { isTestStepPath, TEST_STEP_NAMES } from '../../lib/activeTest';
import { getLayoutPreference, setLayoutPreference, type ProtocolLayout } from '../../lib/protocolLayout';
import { generateFictitiousPnr } from '../../lib/fictitiousPnr';

interface LicenseInfo {
  id: string;
  label: string;
  icon: string;
  category: 'Personbil' | 'Tung bil/Buss' | 'Tvåhjuling' | 'Yrke/Special' | 'Spårtrafik';
}

const LICENSE_CONFIG: LicenseInfo[] = [
  { id: 'B', label: 'B', icon: '🚗', category: 'Personbil' },
  { id: 'B1', label: 'B1', icon: '🚙', category: 'Personbil' },
  { id: 'BE', label: 'BE (Släp)', icon: '🚐', category: 'Personbil' },
  { id: 'B96', label: 'B96 (Utökad B)', icon: '🛞', category: 'Personbil' },
  { id: 'C', label: 'C (Lastbil)', icon: '🚛', category: 'Tung bil/Buss' },
  { id: 'CE', label: 'CE (Släp)', icon: '🚚', category: 'Tung bil/Buss' },
  { id: 'C1', label: 'C1 (Medeltung)', icon: '🛻', category: 'Tung bil/Buss' },
  { id: 'C1E', label: 'C1E (Släp)', icon: '🚛', category: 'Tung bil/Buss' },
  { id: 'D', label: 'D (Buss)', icon: '🚌', category: 'Tung bil/Buss' },
  { id: 'DE', label: 'DE (Ledbuss)', icon: '🚍', category: 'Tung bil/Buss' },
  { id: 'A', label: 'A (Tung MC)', icon: '🏍️', category: 'Tvåhjuling' },
  { id: 'A2', label: 'A2 (Mellanstor)', icon: '🛵', category: 'Tvåhjuling' },
  { id: 'A1', label: 'A1 (Lätt MC)', icon: '🏍️', category: 'Tvåhjuling' },
  { id: 'AM', label: 'AM (Moped)', icon: '🛵', category: 'Tvåhjuling' },
  { id: 'TAXI', label: 'TAXI', icon: '🚕', category: 'Yrke/Special' },
  { id: 'Traktor (Traktorkort)', label: 'Traktor', icon: '🚜', category: 'Yrke/Special' },
  { id: 'Snöskoter (Förarbevis)', label: 'Snöskoter', icon: '🛷', category: 'Yrke/Special' },
  { id: 'Terränghjuling (ATV)', label: 'ATV / Fyrhjuling', icon: '🏎️', category: 'Yrke/Special' },
  { id: 'Truck (A+B)', label: 'Truck (A+B)', icon: '🏗️', category: 'Yrke/Special' },
  { id: 'Grävmaskin / Hjullastare', label: 'Grävmaskin / Hjullastare', icon: '🚜', category: 'Yrke/Special' },
  { id: 'Lokförare', label: 'Lokförare', icon: '🚆', category: 'Spårtrafik' },
  { id: 'Lokförare (Person)', label: 'Lokförare (Person)', icon: '🚅', category: 'Spårtrafik' },
  { id: 'Lokförare (Gods)', label: 'Lokförare (Gods)', icon: '🚂', category: 'Spårtrafik' },
  { id: 'Spårvagn', label: 'Spårvagn', icon: '🚋', category: 'Spårtrafik' },
  { id: 'Tunnelbana', label: 'Tunnelbana', icon: '🚇', category: 'Spårtrafik' },
];

const COMMON_LICENSES = LICENSE_CONFIG.map(l => l.id);

// Dynamic Schedule reading directly from Elevregistret
interface ScheduleItem {
  id: string;
  time: string;
  studentName: string;
  personalNumber: string;
  email: string;
  licenseType: string;
  testType: string;
  transmission: 'Manuell' | 'Automat';
  status: string;
  place?: string;
  city?: string;
  vehicle?: string;
  hasConditions?: boolean;
}

const getStoredSchedule = (): ScheduleItem[] => {
  try {
    const saved = localStorage.getItem('provprotokoll_elevregister');
    if (saved) {
      const all: any[] = JSON.parse(saved);
      return all.map(item => ({
        id: item.id,
        time: item.bookingTime || '09:00',
        studentName: item.name,
        personalNumber: item.personalNumber,
        email: item.email || '',
        licenseType: item.licenseType || 'B',
        testType: item.testType || 'Förstaprov',
        transmission: item.transmission || 'Manuell',
        status: item.status || 'Klar för start',
        place: item.place,
        city: item.city,
        vehicle: item.vehicle,
        hasConditions: item.hasConditions,
      }));
    }
  } catch (_) {}
  return [];
};

// Dagens datum i lokal tid, ÅÅÅÅ-MM-DD (toISOString ger UTC och kan visa gårdagen strax efter midnatt)
function localToday(): string {
  return new Date().toLocaleDateString('sv-SE');
}

export function StartScreen() {
  const navigate = useNavigate();
  const { state, updateState, resetCurrentTest, profile, addTestToHistory } = useAppStore();
  const [activeSearch, setActiveSearch] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);

  const {
    studentName,
    personalNumber,
    licenseType,
    examiner,
    testDate,
    email,
    testType,
    transmission
  } = state.properties;

  useEffect(() => {
    if (!studentName && !personalNumber) {
      updateState((prev) => ({
        ...prev,
        properties: {
          ...prev.properties,
          examiner: prev.properties.examiner || profile.name,
          testDate: prev.properties.testDate || localToday(),
          testType: prev.properties.testType || 'Förstaprov',
          transmission: prev.properties.transmission || 'Manuell'
        }
      }));
    }
  }, [studentName, personalNumber, updateState, profile.name]);

  // Provdatum följer dagens datum automatiskt. Ett gammalt datum från ett
  // tidigare formulär byts ut – men aldrig mitt i ett pågående prov.
  const hasActiveTest = Boolean(state.activeStep && isTestStepPath(state.activeStep));
  useEffect(() => {
    const today = localToday();
    if (hasActiveTest || !testDate || testDate >= today) return;
    updateState(prev => ({ ...prev, properties: { ...prev.properties, testDate: today } }));
  }, [hasActiveTest, testDate, updateState]);

  // Ny provlayout (testperiod): gäller pågående formulär och kommande prov
  const protocolLayout: ProtocolLayout = state.protocolLayout ?? getLayoutPreference();
  const changeLayout = (layout: ProtocolLayout) => {
    setLayoutPreference(layout);
    updateState(prev => ({ ...prev, protocolLayout: layout }));
  };

  const handleUpdateProp = (field: keyof typeof state.properties, value: string) => {
    updateState((prev) => {
      const updatedProps = { ...prev.properties, [field]: value };
      let updatedTestItems = prev.includedTestItems;
      
      if (field === 'licenseType') {
        updatedTestItems = [];
      }
      return {
        ...prev,
        properties: updatedProps,
        includedTestItems: updatedTestItems
      };
    });
  };

  // Skydda ett pågående prov från att av misstag skrivas över
  const confirmDiscardActiveTest = () => {
    if (!state.activeStep || !isTestStepPath(state.activeStep)) return true;
    return window.confirm(
      `Det finns ett pågående prov för ${studentName || 'en kandidat'} som inte är avslutat.\n\nVill du kasta det och börja om?`
    );
  };

  const setPresetCandidate = (candidate: {
    studentName: string;
    personalNumber: string;
    email: string;
    licenseType: string;
    testType?: string;
    transmission?: string;
    examiner?: string;
  }) => {
    if (!confirmDiscardActiveTest()) return;
    resetCurrentTest({
      studentName: candidate.studentName,
      personalNumber: candidate.personalNumber,
      email: candidate.email,
      licenseType: candidate.licenseType,
      examiner: candidate.examiner || profile.name,
      testType: candidate.testType || 'Förstaprov',
      transmission: candidate.transmission || 'Manuell',
      testDate: localToday()
    });
  };

  const handleStartTest = () => {
    if (!confirmDiscardActiveTest()) return;
    // Säkerställ att inget från ett tidigare prov (moment, checklista, resultat,
    // bristförteckningar m.m.) följer med in i ett nytt prov för nästa kandidat.
    resetCurrentTest({
      studentName: studentName || 'Kandidat',
      personalNumber,
      email,
      licenseType: licenseType || 'B',
      examiner,
      testDate,
      testType,
      transmission,
      tachograph: state.properties.tachograph
    });
    navigate('/korprov/egenskaper');
  };

  const loadMockFailedTest = () => {
    const mockState = {
      properties: {
        studentName: 'Elvira Strömqvist',
        personalNumber: '19950673-2391',
        email: 'elvira@exempel.se',
        examiner: examiner || 'Rasmus Lundin',
        testDate: '2026-05-20',
        testType: 'Förstaprov',
        licenseType: 'B',
        transmission: 'Manuell'
      },
      checklist: {
        identityChecked: true,
        studentInformed: true,
        licenseTypeCorrect: true,
        vehicleCorrect: true,
        questionsAnswered: true
      },
      includedTestItems: ['Säkerhetskontroll', 'Parkering', 'Backning', 'Cirkulationsplats'],
      result: {
        drivingResult: 'Underkänt',
        safetyCheckResult: 'Godkänt',
        interventionOccurred: true,
        testAborted: false,
        drivingFailure: {
          primaryCause: { area: 'Parkering', deficiencies: ['Följer inte parkeringsregel'] },
          consequences: [{ id: 'ingriper-1', area: 'Fordonshantering', deficiencies: ['Krav på ingripande'] }],
          situations: ['Parkering', 'Backning'],
          interventionOccurred: true,
          testAborted: false
        },
        safetyCheckFailure: {
          primaryCause: { area: '', deficiencies: [] },
          consequences: [],
          situations: [],
          interventionOccurred: false,
          testAborted: false
        }
      }
    };
    // @ts-ignore
    addTestToHistory(mockState);
    
    // Fill out current candidate as well, set as omprov
    setPresetCandidate({
      studentName: 'Elvira Strömqvist',
      personalNumber: '19950673-2391',
      email: 'elvira@exempel.se',
      licenseType: 'B',
      testType: 'Omprov körning',
      transmission: 'Manuell'
    });
  };

  const [scheduleList, setScheduleList] = useState<ScheduleItem[]>(() => getStoredSchedule());
  const [showCandidateSuggestions, setShowCandidateSuggestions] = useState(false);

  useEffect(() => {
    const handleStorage = () => setScheduleList(getStoredSchedule());
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const matchingCandidates = scheduleList.filter(item => {
    if (!studentName || studentName.trim() === '') return true;
    return item.studentName.toLowerCase().includes(studentName.toLowerCase()) ||
      item.personalNumber.includes(studentName);
  });

  const completedCount = scheduleList.filter(item => item.status === 'Genomförd').length;
  // Kandidaten som är vald i schemat (matchas på personnummer, annars namn)
  const selectedBooking = scheduleList.find(item =>
    item.licenseType === licenseType && (
      (personalNumber && item.personalNumber.replace(/\D/g, '').slice(-10) === personalNumber.replace(/\D/g, '').slice(-10)) ||
      (!personalNumber && item.studentName === studentName)
    )
  );
  const [showForm, setShowForm] = useState(false);
  // Första kandidaten som inte är klar markeras som "Nästa"
  const nextScheduleId = scheduleList.find(item => item.status !== 'Genomförd')?.id;
  const todayLabel = new Date().toLocaleDateString('sv-SE', { weekday: 'long', day: 'numeric', month: 'long' });
  const hour = new Date().getHours();
  const greeting = hour < 10 ? 'God morgon' : hour < 18 ? 'Hej' : 'God kväll';
  const readinessChecks = [
    { label: 'Namn', done: Boolean(studentName?.trim()) },
    { label: 'Personnummer', done: Boolean(personalNumber?.trim()) },
    { label: 'Identitet', done: state.checklist.identityChecked },
  ];

  const filteredSchedule = scheduleList.filter(item => 
    item.studentName.toLowerCase().includes(activeSearch.toLowerCase()) ||
    item.personalNumber.includes(activeSearch) ||
    item.licenseType.toLowerCase().includes(activeSearch.toLowerCase())
  );

  const labelCls = 'text-[13px] font-medium text-ink-2 flex items-center gap-1';
  const inputCls = 'w-full h-12 px-4 text-[15px] rounded-control border border-line bg-surface text-ink placeholder:text-ink-3 focus:outline-none focus:border-navy focus:ring-4 focus:ring-navy/10 dark:focus:border-blue-500 dark:focus:ring-blue-500/20 transition-shadow';
  const choiceCls = (selected: boolean, tone: 'navy' | 'red' = 'navy') =>
    `min-h-11 px-3 text-sm rounded-control border transition-colors cursor-pointer select-none active:scale-[0.98] ${
      selected
        ? tone === 'red'
          ? 'bg-[#c40000] text-white border-[#c40000] font-semibold'
          : 'bg-navy text-white border-navy dark:bg-blue-600 dark:border-blue-600 font-semibold'
        : 'bg-surface text-ink border-line hover:bg-surface-2 font-medium'
    }`;
  const sectionTitle = (n: number, title: string, extra?: React.ReactNode) => (
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-lg font-semibold text-ink flex items-center gap-2.5">
        <span className="w-6 h-6 rounded-full bg-navy/10 text-navy dark:bg-blue-500/20 dark:text-blue-300 flex items-center justify-center text-xs font-bold font-sans tabular-nums">{n}</span>
        {title}
      </h2>
      {extra}
    </div>
  );
  const categories = ['Personbil', 'Tung bil/Buss', 'Tvåhjuling', 'Yrke/Special', 'Spårtrafik'] as const;
  const selectedLicense = LICENSE_CONFIG.find(l => l.id === licenseType);
  const readyCount = readinessChecks.filter(c => c.done).length;

  const scheduleCard = (
    <section className="bg-surface border border-line rounded-card p-4 sm:p-6 flex flex-col lg:max-h-[640px]">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-ink flex items-center gap-2">
          <Calendar size={18} className="text-ink-3" /> Dagens schema
        </h2>
        {scheduleList.length > 0 && (
          <span className="text-[13px] text-ink-2 tabular-nums">
            <span className="font-semibold text-emerald-700 dark:text-emerald-400">{completedCount}</span> av {scheduleList.length} klara
          </span>
        )}
      </div>

      {scheduleList.length > 0 && (
        <div className="h-1.5 rounded-full bg-surface-2 overflow-hidden mb-4" role="progressbar" aria-valuemin={0} aria-valuemax={scheduleList.length} aria-valuenow={completedCount} aria-label="Genomförda prov idag">
          <div
            className="h-full rounded-full bg-emerald-500 transition-[width] duration-500"
            style={{ width: `${Math.round((completedCount / scheduleList.length) * 100)}%` }}
          />
        </div>
      )}

      {scheduleList.length > 3 && (
        <input
          type="search"
          placeholder="Sök inbokad kandidat"
          value={activeSearch}
          onChange={(e) => setActiveSearch(e.target.value)}
          className={`${inputCls} h-11 mb-3 bg-surface-2`}
        />
      )}

      <div className="-mx-1 px-1 space-y-2 overflow-y-auto custom-scrollbar flex-1">
        {filteredSchedule.length === 0 ? (
          <div className="text-center py-8 px-4 border border-dashed border-line rounded-control">
            <p className="text-sm text-ink-2 mb-3">
              {scheduleList.length === 0 ? 'Inga kandidater är inbokade idag.' : 'Ingen kandidat matchar sökningen.'}
            </p>
            {scheduleList.length === 0 && (
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <button
                  onClick={() => navigate('/elevregister')}
                  className="h-10 px-4 bg-navy/5 dark:bg-blue-500/10 hover:bg-navy/10 text-navy dark:text-blue-300 rounded-control text-sm font-semibold transition-colors cursor-pointer"
                >
                  Öppna elevregistret
                </button>
                {!isDemoMode() && (
                  <button
                    onClick={enterDemoMode}
                    className="h-10 px-4 text-violet-700 dark:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-950/30 rounded-control text-sm font-semibold transition-colors cursor-pointer"
                  >
                    Prova en demodag
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          filteredSchedule.map(item => {
            const isSelected = studentName === item.studentName && licenseType === item.licenseType;
            const done = item.status === 'Genomförd';
            const isNext = item.id === nextScheduleId;
            return (
              <button
                key={item.id}
                onClick={() => {
                  triggerHaptic('medium');
                  setPresetCandidate({
                    studentName: item.studentName,
                    personalNumber: item.personalNumber,
                    email: item.email,
                    licenseType: item.licenseType,
                    testType: item.testType,
                    transmission: item.transmission
                  });
                }}
                aria-pressed={isSelected}
                className={`w-full p-3 pr-3.5 rounded-control border text-left transition-colors flex items-center gap-3 cursor-pointer ${
                  isSelected
                    ? 'bg-navy/[0.04] dark:bg-blue-500/10 border-navy/40 dark:border-blue-500/50 ring-1 ring-navy/20 dark:ring-blue-500/30'
                    : isNext
                      ? 'bg-surface border-navy/25 dark:border-blue-500/30 hover:bg-surface-2 shadow-lift'
                      : 'bg-surface border-line hover:bg-surface-2'
                } ${done ? 'opacity-60' : ''}`}
              >
                <div className="w-14 shrink-0 text-center">
                  <div className="text-[15px] font-semibold text-ink tabular-nums leading-none">{item.time}</div>
                  <div className="mt-1.5 inline-flex items-center justify-center min-w-8 h-6 px-1.5 rounded-md bg-navy text-white dark:bg-blue-600 text-xs font-bold">
                    {item.licenseType}
                  </div>
                </div>
                <div className="min-w-0 flex-1 border-l border-line pl-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[15px] font-semibold text-ink truncate">{item.studentName}</span>
                    {isNext && !isSelected && (
                      <span className="text-[11px] font-semibold text-navy dark:text-blue-300 bg-navy/10 dark:bg-blue-500/20 px-1.5 py-0.5 rounded-md shrink-0">Nästa</span>
                    )}
                    {(item.status === 'Underkänd historik' || item.testType?.includes('Omprov')) && (
                      <span className="text-[11px] font-semibold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/40 px-1.5 py-0.5 rounded-md shrink-0" title={item.testType}>
                        {item.testType === 'Omprov körning' ? 'Omprov körning' : item.testType === 'Omprov säkerhetskontroll' ? 'Omprov säk.' : 'Omprov'}
                      </span>
                    )}
                    {item.testType === 'Bedömningsprov' && (
                      <span className="text-[11px] font-semibold text-violet-800 dark:text-violet-300 bg-violet-100 dark:bg-violet-900/40 px-1.5 py-0.5 rounded-md shrink-0">Bedömning</span>
                    )}
                    {done && <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />}
                  </div>
                  <div className="text-[13px] text-ink-3 tabular-nums mt-0.5 flex items-center gap-2 min-w-0">
                    <span className="truncate">{item.personalNumber}</span>
                    <span className="shrink-0">{item.transmission}</span>
                    <VtrStatusBadge personalNumber={item.personalNumber} compact />
                  </div>
                </div>
                <ChevronRight size={18} className={`shrink-0 ${isSelected ? 'text-navy dark:text-blue-400' : 'text-ink-3'}`} />
              </button>
            );
          })
        )}
      </div>
    </section>
  );

  return (
    <div className="max-w-7xl mx-auto sm:px-2 w-full text-ink">

      {/* Återuppta pågående prov (efter att appen stängts, laddats om eller kraschat) */}
      {state.activeStep && isTestStepPath(state.activeStep) && (
        <div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-card border border-amber-300 dark:border-amber-800/70 bg-amber-50 dark:bg-amber-950/30 animate-in fade-in duration-200">
          <div className="flex items-start gap-3">
            <span className="w-9 h-9 rounded-full bg-amber-200/70 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 shrink-0 flex items-center justify-center">
              <History size={18} />
            </span>
            <div>
              <div className="font-semibold text-[15px] text-amber-950 dark:text-amber-100">
                Pågående prov: {studentName || 'Namnlös kandidat'} ({licenseType})
              </div>
              <div className="text-[13px] text-amber-900/80 dark:text-amber-300/80 mt-0.5">
                Allt du fyllt i är sparat. Du var senast på steget <strong>{TEST_STEP_NAMES[state.activeStep]}</strong>.
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              triggerHaptic('success');
              navigate(state.activeStep!);
            }}
            className="w-full sm:w-auto px-5 h-12 rounded-control bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-white font-semibold text-[15px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
          >
            Fortsätt provet
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* Rubrik: logotyp, dag och läget just nu */}
      <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4 min-w-0">
          <div className="rounded-control bg-white px-2 py-1 border border-line shadow-xs shrink-0">
            <AppLogo variant="provprotokoll" size="sm" />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-ink leading-tight">Dagens prov</h1>
            <p className="text-[13px] text-ink-3">
              {todayLabel.charAt(0).toUpperCase() + todayLabel.slice(1)}
              {scheduleList.length > 0 && <> · <span className="tabular-nums">{completedCount} av {scheduleList.length} klara</span></>}
              {profile.name && <> · {profile.name}</>}
            </p>
          </div>
        </div>
        <button
          id="btn-clear-test"
          type="button"
          onClick={() => {
            if (!confirmDiscardActiveTest()) return;
            triggerHaptic('heavy');
            resetCurrentTest();
            setShowForm(true);
          }}
          className="h-9 px-3 rounded-control text-[13px] font-medium text-ink-2 hover:text-ink border border-line hover:bg-surface-2 transition-colors cursor-pointer"
        >
          Ny kandidat
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8 items-start">

        {/* Schemat först på mobil: mottagningen börjar med att välja kandidat */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-4">
          {scheduleCard}

          {/* Simuleringsverktyg – bara i utvecklingsläge, aldrig i den publicerade appen */}
          {import.meta.env.DEV && (
            <div className="hidden lg:block border border-dashed border-line rounded-card p-5 space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-ink-2">
                <Cpu size={16} /> Simuleringsverktyg (utveckling)
              </div>
              <p className="text-[13px] text-ink-3 leading-relaxed">
                Skapar ett underkänt prov i historiken för att testa hämtning av omprovsuppgifter.
              </p>
              <button
                onClick={() => {
                  triggerHaptic('heavy');
                  loadMockFailedTest();
                }}
                className="w-full h-11 text-sm font-semibold bg-surface-2 hover:bg-line text-ink transition-colors rounded-control cursor-pointer flex items-center justify-center gap-2 border border-line"
              >
                <History size={16} />
                Simulera underkänt prov
              </button>
            </div>
          )}
        </div>

        <div className="lg:col-span-8 space-y-4">
        {selectedBooking && (() => {
          const b = selectedBooking;
          const retest = b.testType.includes('Omprov');
          const conditions = b.hasConditions || (state.properties.specialConditions || []).length > 0;
          const statusText = b.status === 'Genomförd' ? 'Genomförd' : state.activeStep && isTestStepPath(state.activeStep) ? 'Pågår' : 'Inbokad';
          const title = b.testType.includes('Bedömningsprov') ? `Bedömningsprov ${b.licenseType}` : `Körprov ${b.licenseType}`;
          const rows: [string, string][] = [
            ['Plats', b.place || profile.depot || 'Förarprov'],
            ['Ort', b.city || '–'],
            ['Omprov', retest ? `JA${b.testType !== 'Omprov' ? ` (${b.testType.replace('Omprov ', '')})` : ''}` : 'NEJ'],
            ['Fordon', b.vehicle || '–'],
            ['Automatväxlad', b.transmission === 'Automat' ? 'JA' : 'NEJ'],
            ['Har villkor', conditions ? 'JA' : 'NEJ'],
          ];
          return (
            <section className="bg-surface border border-line rounded-card shadow-lift overflow-hidden animate-in fade-in duration-150" aria-label="Vald bokning">
              <div className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_200px] gap-5 sm:gap-6">
                <div className="min-w-0">
                  <span className={`inline-block text-[12px] font-semibold px-2 py-0.5 rounded-md ${
                    statusText === 'Genomförd' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                      : statusText === 'Pågår' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300'
                      : 'bg-navy/10 text-navy dark:bg-blue-500/20 dark:text-blue-300'}`}>
                    {b.time} · {statusText}
                  </span>
                  <h2 className="mt-2 text-[28px] sm:text-[32px] font-bold text-navy dark:text-blue-400 leading-tight">{title}</h2>
                  <p className="text-[17px] text-ink tabular-nums mt-0.5">{b.personalNumber || 'Personnummer saknas'}</p>
                  <p className="text-[19px] font-semibold text-ink">{b.studentName}</p>
                  <dl className="mt-4 grid grid-cols-[auto_minmax(0,1fr)] gap-x-6 gap-y-1.5 text-[14px]">
                    {rows.map(([k, v]) => (
                      <div key={k} className="contents">
                        <dt className="font-semibold text-ink">{k}:</dt>
                        <dd className={`min-w-0 truncate ${v.startsWith('JA') && k !== 'Automatväxlad' ? 'text-amber-700 dark:text-amber-400 font-semibold' : 'text-ink-2'}`}>{v}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
                <div className="flex flex-col gap-3">
                  {/* Här har Trafikverket kandidatens foto – vi visar initialer */}
                  <div className="aspect-[4/5] rounded-control bg-gradient-to-br from-navy/10 to-navy/[0.03] dark:from-blue-500/15 dark:to-blue-500/5 border border-line flex items-center justify-center">
                    <span className="text-5xl font-bold text-navy/70 dark:text-blue-300/80 select-none">
                      {b.studentName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                    </span>
                  </div>
                  <button
                    id="btn-open-booking"
                    type="button"
                    onClick={() => { triggerHaptic('success'); handleStartTest(); }}
                    disabled={b.status === 'Genomförd'}
                    className="h-12 rounded-control bg-navy hover:bg-navy-deep dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-semibold text-[15px] flex items-center justify-center gap-1.5 cursor-pointer transition-colors active:scale-[0.98] disabled:opacity-50 disabled:cursor-default"
                  >
                    {b.status === 'Genomförd' ? 'Provet är klart' : 'Öppna prov'}
                    {b.status !== 'Genomförd' && <ChevronRight size={18} />}
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowForm(v => !v)}
                aria-expanded={showForm}
                className="w-full px-5 sm:px-6 py-3 border-t border-line bg-surface-2/60 text-left text-[13px] font-medium text-ink-2 hover:text-ink flex items-center justify-between cursor-pointer"
              >
                {showForm ? 'Dölj uppgifterna' : 'Ändra uppgifter'}
                <ChevronRight size={16} className={`transition-transform ${showForm ? '-rotate-90' : 'rotate-90'}`} />
              </button>
            </section>
          );
        })()}

        {/* Kandidatformulär – alltid synligt utan bokning, annars via "Ändra uppgifter" */}
        {(!selectedBooking || showForm) && (
        <div className="bg-surface border border-line rounded-card flex flex-col animate-in fade-in duration-150">

          <div className="p-4 sm:p-6 lg:p-8 space-y-8 flex-1">
            {/* Section 1: Kandidatinformation */}
            <section className="space-y-4">
              {sectionTitle(1, 'Kandidat')}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Namn med sökförslag */}
                <div className="space-y-1.5 relative">
                  <label htmlFor="input-student-name" className={labelCls}>
                    Fullständigt namn <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={studentName || ''}
                      id="input-student-name"
                      autoComplete="off"
                      onFocus={() => setShowCandidateSuggestions(true)}
                      onChange={(e) => {
                        handleUpdateProp('studentName', e.target.value);
                        setShowCandidateSuggestions(true);
                      }}
                      placeholder="t.ex. Anna Andersson"
                      className={`${inputCls} font-medium`}
                    />
                    {showCandidateSuggestions && matchingCandidates.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1.5 bg-surface border border-line rounded-control shadow-float z-50 overflow-hidden max-h-72 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
                        <div className="px-3.5 py-2 bg-surface-2 text-xs font-medium text-ink-2 flex items-center justify-between border-b border-line">
                          <span>Välj för att fylla i</span>
                          <button
                            type="button"
                            onClick={() => setShowCandidateSuggestions(false)}
                            aria-label="Stäng förslag"
                            className="w-8 h-8 -mr-2 flex items-center justify-center rounded-full hover:bg-line text-ink-3 cursor-pointer"
                          >
                            ✕
                          </button>
                        </div>
                        {matchingCandidates.map(c => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => {
                              setPresetCandidate({
                                studentName: c.studentName,
                                personalNumber: c.personalNumber,
                                email: c.email,
                                licenseType: c.licenseType,
                                testType: c.testType,
                                transmission: c.transmission
                              });
                              setShowCandidateSuggestions(false);
                            }}
                            className="w-full text-left px-3.5 py-3 hover:bg-surface-2 flex items-center justify-between gap-3 transition-colors cursor-pointer border-b border-line last:border-b-0"
                          >
                            <div className="min-w-0">
                              <div className="text-[15px] font-semibold text-ink truncate">{c.studentName}</div>
                              <div className="flex items-center gap-1.5">
                                <div className="text-[13px] tabular-nums text-ink-3">{c.personalNumber || 'Saknar personnummer'}</div>
                                {c.personalNumber && <VtrStatusBadge personalNumber={c.personalNumber} compact />}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-navy/10 dark:bg-blue-500/20 text-navy dark:text-blue-200">
                                {c.licenseType}
                              </span>
                              <span className="text-[13px] text-ink-3">{c.transmission}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Personnummer */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="input-personal-number" className={labelCls}>
                      Personnummer <span className="text-ink-3 font-normal">(10 eller 12 siffror)</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic('light');
                        handleUpdateProp('personalNumber', generateFictitiousPnr());
                      }}
                      className="text-xs font-semibold text-navy dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                      title="Skapa ett fiktivt testpersonnummer (Skatteverket testformat med giltig Luhn-kontrollsiffra)"
                    >
                      <Dice5 size={13} />
                      Slumpa fiktivt nr
                    </button>
                  </div>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    value={personalNumber || ''}
                    id="input-personal-number"
                    onChange={(e) => handleUpdateProp('personalNumber', e.target.value)}
                    placeholder="ÅÅÅÅMMDD-XXXX"
                    className={`${inputCls} font-medium tabular-nums`}
                  />
                </div>

                {/* E-postadress */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label htmlFor="input-email" className={labelCls}>
                    E-post för protokollkopia
                  </label>
                  <input
                    type="email"
                    inputMode="email"
                    autoComplete="off"
                    value={email || ''}
                    id="input-email"
                    onChange={(e) => handleUpdateProp('email', e.target.value)}
                    placeholder="namn@exempel.se"
                    className={inputCls}
                  />
                  <p className="text-xs text-ink-3">Protokollet skickas hit när provet är klart.</p>
                </div>
              </div>
            </section>

            {/* Section 2: Provdetaljer */}
            <section className="space-y-4 pt-8 border-t border-line">
              {sectionTitle(2, 'Prov')}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <label htmlFor="input-examiner" className={`${labelCls} justify-between`}>
                    Provförrättare
                    {profile.name && examiner?.trim() !== profile.name && (
                      <button
                        type="button"
                        onClick={() => handleUpdateProp('examiner', profile.name)}
                        className="text-[12px] font-medium text-navy dark:text-blue-400 hover:underline cursor-pointer"
                      >
                        Använd mitt namn
                      </button>
                    )}
                  </label>
                  <input
                    type="text"
                    value={examiner || ''}
                    id="input-examiner"
                    autoComplete="name"
                    onChange={(e) => handleUpdateProp('examiner', e.target.value)}
                    placeholder={profile.name || 'Förnamn Efternamn'}
                    className={`${inputCls} font-medium`}
                  />
                </div>

                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <label htmlFor="input-test-date" className={labelCls}>Provdatum</label>
                  <input
                    type="date"
                    value={testDate || ''}
                    id="input-test-date"
                    onChange={(e) => handleUpdateProp('testDate', e.target.value)}
                    className={`${inputCls} font-medium tabular-nums`}
                  />
                </div>

                <div className="space-y-1.5 col-span-2">
                  <span className={labelCls}>Provtyp</span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2" role="radiogroup" aria-label="Provtyp">
                    {[
                      { id: 'Förstaprov', label: 'Förstaprov' },
                      { id: 'Omprov', label: 'Omprov' },
                      { id: 'Omprov säkerhetskontroll', label: 'Omprov säkerhet' },
                      { id: 'Omprov körning', label: 'Omprov körning' },
                      { id: 'Bedömningsprov', label: 'Bedömningsprov' }
                    ].map(pt => {
                      const selected = (state.properties.testType || 'Förstaprov') === pt.id;
                      return (
                        <button
                          key={pt.id}
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          onClick={() => handleUpdateProp('testType', pt.id)}
                          className={choiceCls(selected)}
                        >
                          {pt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>

            {/* Behörighet, grupperad per fordonsslag */}
            <section className="space-y-4 pt-8 border-t border-line">
              {sectionTitle(3, 'Behörighet', (
                <span className="text-sm font-semibold text-navy dark:text-blue-300 flex items-center gap-1.5">
                  <span aria-hidden="true">{selectedLicense?.icon || '🚗'}</span>
                  {selectedLicense?.label.split(' (')[0] || licenseType}
                </span>
              ))}

              <div className="space-y-4">
                {categories.map(cat => {
                  const items = LICENSE_CONFIG.filter(l => l.category === cat);
                  const wide = cat === 'Yrke/Special' || cat === 'Spårtrafik';
                  return (
                    <div key={cat}>
                      <h3 className="text-[13px] font-medium font-sans text-ink-3 mb-2 tracking-normal">{cat}</h3>
                      <div className={`grid gap-2 ${wide ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-4 sm:grid-cols-5'}`} role="radiogroup" aria-label={cat}>
                        {items.map((lic) => {
                          const isSelected = licenseType === lic.id;
                          const code = lic.label.split(' (')[0];
                          const sub = lic.label.includes('(') ? lic.label.split('(')[1].replace(')', '') : '';
                          return (
                            <button
                              key={lic.id}
                              type="button"
                              role="radio"
                              aria-checked={isSelected}
                              title={lic.label}
                              onClick={() => {
                                triggerHaptic('light');
                                handleUpdateProp('licenseType', lic.id);
                              }}
                              className={`min-h-[52px] px-2 py-1.5 rounded-control border transition-colors select-none active:scale-[0.97] cursor-pointer flex ${wide ? 'items-center gap-2 text-left' : 'flex-col items-center justify-center text-center'} ${
                                isSelected
                                  ? 'bg-navy text-white border-navy dark:bg-blue-600 dark:border-blue-600'
                                  : 'bg-surface text-ink border-line hover:bg-surface-2'
                              }`}
                            >
                              {wide && <span className="text-lg shrink-0" aria-hidden="true">{lic.icon}</span>}
                              <span className="min-w-0">
                                <span className="block text-[15px] font-semibold leading-tight">{code}</span>
                                {sub && (
                                  <span className={`block text-[11px] leading-tight mt-0.5 truncate ${isSelected ? 'text-white/75' : 'text-ink-3'}`}>{sub}</span>
                                )}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Fordonsegenskaper: Växellåda & Färdskrivare */}
            {(() => {
              const isHeavy = ['C', 'C1', 'CE', 'C1E', 'D', 'D1', 'DE', 'D1E'].includes(licenseType);
              return (
                <div className={`grid grid-cols-1 ${isHeavy ? 'sm:grid-cols-2' : ''} gap-4`}>
                  <div className="space-y-1.5">
                    <span className={labelCls}>Växellåda</span>
                    <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Växellåda">
                      <button
                        type="button"
                        role="radio"
                        aria-checked={(state.properties.transmission || 'Manuell') !== 'Automat'}
                        onClick={() => {
                          triggerHaptic('light');
                          handleUpdateProp('transmission', 'Manuell');
                        }}
                        className={choiceCls((state.properties.transmission || 'Manuell') !== 'Automat')}
                      >
                        Manuell
                      </button>
                      <button
                        type="button"
                        role="radio"
                        aria-checked={state.properties.transmission === 'Automat'}
                        onClick={() => {
                          triggerHaptic('light');
                          handleUpdateProp('transmission', 'Automat');
                        }}
                        className={choiceCls(state.properties.transmission === 'Automat')}
                      >
                        Automat (78)
                      </button>
                    </div>
                  </div>

                  {/* Färdskrivare (endast på tunga prov C, C1, CE, C1E, D, D1, DE, D1E) */}
                  {isHeavy && (
                    <div className="space-y-1.5 animate-in fade-in duration-200">
                      <span className={labelCls}>Färdskrivare</span>
                      <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Färdskrivare">
                        <button
                          type="button"
                          role="radio"
                          aria-checked={(state.properties.tachograph || 'Med färdskrivare') !== 'Utan färdskrivare'}
                          onClick={() => {
                            triggerHaptic('light');
                            handleUpdateProp('tachograph' as any, 'Med färdskrivare');
                          }}
                          className={choiceCls((state.properties.tachograph || 'Med färdskrivare') !== 'Utan färdskrivare')}
                        >
                          Med
                        </button>
                        <button
                          type="button"
                          role="radio"
                          aria-checked={state.properties.tachograph === 'Utan färdskrivare'}
                          onClick={() => {
                            triggerHaptic('light');
                            handleUpdateProp('tachograph' as any, 'Utan färdskrivare');
                          }}
                          className={choiceCls(state.properties.tachograph === 'Utan färdskrivare', 'red')}
                        >
                          Utan
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Identitetskontroll */}
            <label className={`flex items-start gap-3.5 p-4 rounded-control border transition-colors cursor-pointer focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 dark:focus-within:ring-offset-slate-900 ${
              state.checklist.identityChecked
                ? 'border-emerald-300 dark:border-emerald-800/60 bg-emerald-50/70 dark:bg-emerald-950/20'
                : 'border-line bg-surface-2 hover:border-ink-3/40'
            }`}>
              <div className="pt-0.5 relative">
                <input
                  type="checkbox"
                  id="checkbox-identity"
                  checked={state.checklist.identityChecked}
                  onChange={(e) => {
                    triggerHaptic(e.target.checked ? 'success' : 'light');
                    updateState(prev => ({
                      ...prev,
                      checklist: { ...prev.checklist, identityChecked: e.target.checked }
                    }));
                  }}
                  className="peer w-6 h-6 shrink-0 opacity-0 absolute"
                />
                <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors duration-150 ${
                  state.checklist.identityChecked
                    ? 'bg-emerald-600 border-emerald-600'
                    : 'border-ink-3/60 bg-surface'
                }`}>
                  {state.checklist.identityChecked && (
                    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="white" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m3.5 8.5 3 3 6-7" /></svg>
                  )}
                </div>
              </div>
              <div className="flex-1">
                <div className="font-semibold text-[15px] text-ink flex items-center gap-2">
                  <UserCheck size={17} className={state.checklist.identityChecked ? 'text-emerald-600' : 'text-ink-3'} />
                  Identitet kontrollerad <span className="text-red-500">*</span>
                </div>
                <div className="text-[13px] text-ink-2 leading-relaxed mt-0.5">
                  Giltig id-handling är kontrollerad och stämmer med kandidaten.
                </div>
              </div>
            </label>

            {/* Testperiod: Trafikverkets nya protokollayout */}
            <button
              type="button"
              role="switch"
              aria-checked={protocolLayout === 'ny'}
              id="toggle-new-layout"
              onClick={() => {
                triggerHaptic('light');
                changeLayout(protocolLayout === 'ny' ? 'klassisk' : 'ny');
              }}
              className={`w-full flex items-start gap-3.5 p-4 rounded-control border text-left transition-colors cursor-pointer ${
                protocolLayout === 'ny'
                  ? 'border-violet-300 dark:border-violet-800/60 bg-violet-50/70 dark:bg-violet-950/20'
                  : 'border-dashed border-line hover:bg-surface-2'
              }`}
            >
              <span className={`mt-0.5 w-11 h-6 rounded-full p-0.5 shrink-0 transition-colors ${protocolLayout === 'ny' ? 'bg-violet-600' : 'bg-ink-3/40'}`}>
                <span className={`block w-5 h-5 rounded-full bg-white shadow transition-transform ${protocolLayout === 'ny' ? 'translate-x-5' : ''}`} />
              </span>
              <span className="flex-1 min-w-0">
                <span className="font-semibold text-[15px] text-ink flex flex-wrap items-center gap-2">
                  Ny provlayout
                  <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded-md bg-violet-100 text-violet-800 dark:bg-violet-900/50 dark:text-violet-200">Testperiod</span>
                </span>
                <span className="block text-[13px] text-ink-2 leading-relaxed mt-1">
                  Resultatet visas som i Trafikverkets nya protokoll, med <em>Du måste bli bättre på</em> och <em>Detta bedömdes i ditt körprov</em>. Valet sparas tills du stänger av det.
                </span>
              </span>
            </button>

          </div>

          {/* Åtgärdsrad – följer med längst ner på mobilen */}
          <div className="sticky bottom-0 z-10 bg-surface/95 backdrop-blur-xl border-t border-line rounded-b-card p-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-[13px] text-ink-2 min-w-0">
              {studentName?.trim() && (
                <span className="hidden sm:flex items-center gap-2 min-w-0 pr-3 mr-0.5 border-r border-line">
                  <span className="w-8 h-8 rounded-full bg-navy/10 dark:bg-blue-500/20 text-navy dark:text-blue-300 flex items-center justify-center text-[13px] font-bold shrink-0">
                    {studentName.trim()[0].toUpperCase()}
                  </span>
                  <span className="min-w-0 leading-tight">
                    <span className="block font-semibold text-ink truncate max-w-[180px]">{studentName}</span>
                    <span className="block text-[12px] text-ink-3">Behörighet {licenseType || 'B'}</span>
                  </span>
                </span>
              )}
              <div className="flex gap-1 shrink-0" aria-hidden="true">
                {readinessChecks.map(check => (
                  <span key={check.label} className={`h-1.5 w-6 rounded-full transition-colors ${check.done ? 'bg-emerald-500' : 'bg-line'}`} />
                ))}
              </div>
              <span>
                {readyCount === readinessChecks.length
                  ? 'Redo att starta'
                  : `Saknas: ${readinessChecks.filter(c => !c.done).map(c => c.label.toLowerCase()).join(', ')}`}
              </span>
            </div>

            <button
              id="btn-open-prov"
              onClick={() => {
                triggerHaptic('success');
                handleStartTest();
              }}
              className="w-full sm:w-auto h-12 px-6 bg-navy hover:bg-navy-deep dark:bg-blue-600 dark:hover:bg-blue-500 active:scale-[0.98] text-white font-semibold text-[15px] transition-colors flex items-center justify-center gap-2 rounded-control cursor-pointer"
            >
              Skapa prov och fortsätt
              <ChevronRight size={18} />
            </button>
          </div>

        </div>

        )}
        </div>

        {/* Simuleringsverktyg på mobil – sist, under formuläret */}
        {import.meta.env.DEV && (
          <button
            onClick={() => {
              triggerHaptic('heavy');
              loadMockFailedTest();
            }}
            className="lg:hidden order-last w-full h-11 text-sm font-medium text-ink-2 border border-dashed border-line rounded-control cursor-pointer flex items-center justify-center gap-2"
          >
            <Cpu size={15} /> Simulera underkänt prov (utveckling)
          </button>
        )}

      </div>

    </div>
  );
}
