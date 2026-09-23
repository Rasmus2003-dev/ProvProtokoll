import React, { useEffect, useState } from 'react';
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
  Bookmark
} from 'lucide-react';
import { triggerHaptic } from '../../lib/utils';
import { isTestStepPath, TEST_STEP_NAMES } from '../../lib/activeTest';
import { getLayoutPreference, setLayoutPreference, type ProtocolLayout } from '../../lib/protocolLayout';

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
        status: item.status || 'Klar för start'
      }));
    }
  } catch (_) {}
  return [];
};

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
          testDate: prev.properties.testDate || new Date().toISOString().split('T')[0],
          testType: prev.properties.testType || 'Förstaprov',
          transmission: prev.properties.transmission || 'Manuell'
        }
      }));
    }
  }, [studentName, personalNumber, updateState, profile.name]);

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
      testDate: new Date().toISOString().split('T')[0]
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
        personalNumber: '19950613-1234',
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
      personalNumber: '19950613-1234',
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full pt-2 pb-24 font-sans text-gray-900 dark:text-gray-100 antialiased">
      
      {/* Återuppta pågående prov (efter att appen stängts, laddats om eller kraschat) */}
      {state.activeStep && isTestStepPath(state.activeStep) && (
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border-2 border-amber-300 dark:border-amber-800/70 bg-amber-50 dark:bg-amber-950/30 shadow-sm animate-in fade-in duration-200">
          <div className="flex items-start gap-3">
            <span className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 shrink-0">
              <History size={20} />
            </span>
            <div>
              <div className="font-black text-sm text-amber-950 dark:text-amber-100">
                Pågående prov: {studentName || 'Namnlös kandidat'} ({licenseType})
              </div>
              <div className="text-xs text-amber-800 dark:text-amber-300/80 mt-0.5">
                Provet avslutades inte. Allt du fyllt i är sparat – senast på steget <strong>{TEST_STEP_NAMES[state.activeStep]}</strong>.
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              triggerHaptic('success');
              navigate(state.activeStep!);
            }}
            className="w-full sm:w-auto px-6 h-12 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-black text-xs uppercase tracking-widest shadow-md shadow-amber-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0"
          >
            <span>Fortsätt provet</span>
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Header Panel with Stats Badge */}
      <div className="mb-6 flex flex-col lg:flex-row lg:items-end justify-between gap-5">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 capitalize">{todayLabel}</p>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
            Mottagning & provstart
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 max-w-xl">
            {profile.name && <span className="font-medium text-slate-700 dark:text-slate-300">{greeting}, {profile.name.split(' ')[0]}. </span>}
            Registrera kandidaten för att påbörja provet.
          </p>
        </div>

        <div className="flex items-stretch gap-3 shrink-0">
          <button
            id="btn-clear-test"
            type="button"
            onClick={() => {
              if (!confirmDiscardActiveTest()) return;
              triggerHaptic('heavy');
              resetCurrentTest();
            }}
            className="self-end h-9 px-3 rounded-lg text-sm font-medium text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
          >
            Nollställ formulär
          </button>
        {/* Dagens schema – visas bara när det finns inbokade prov */}
        {scheduleList.length > 0 && (
        <div className="flex gap-3 shrink-0">
          <div className="bg-white dark:bg-slate-900 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 min-w-[120px]">
            <span className="block text-xs font-medium text-slate-500 dark:text-slate-400">Planerat idag</span>
            <span className="text-xl font-bold text-slate-900 dark:text-white">{scheduleList.length} prov</span>
          </div>
          <div className="bg-white dark:bg-slate-900 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 min-w-[120px]">
            <span className="block text-xs font-medium text-slate-500 dark:text-slate-400">Genomförda</span>
            <span className="text-xl font-bold text-emerald-700 dark:text-emerald-400">
              {completedCount}<span className="text-sm font-medium text-slate-400"> / {scheduleList.length}</span>
            </span>
            <div className="w-full h-1 mt-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${Math.round((completedCount / scheduleList.length) * 100)}%` }}
              />
            </div>
          </div>
        </div>
        )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        
        {/* Left Side: Candidates intake Form */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/5 rounded-[2rem] shadow-sm overflow-hidden flex flex-col">
          
          <div className="p-6 sm:p-8 space-y-8 flex-1">
            {/* Section 1: Kandidatinformation */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-3">
                <h2 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-[#002f6c]/10 dark:bg-blue-500/20 text-[#002f6c] dark:text-blue-400 flex items-center justify-center font-bold">1</span>
                  Kandidatinformation
                </h2>
                {scheduleList.length > 0 && (
                  <span className="text-[11px] font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2.5 py-1 rounded-md">
                    {scheduleList.length} elever i registret
                  </span>
                )}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Namn med sökförslag */}
                <div className="space-y-1.5 relative sm:col-span-1">
                  <label className="text-[11px] font-bold text-gray-700 dark:text-slate-300 tracking-wide uppercase flex items-center gap-1">
                    <span>Kandidatens fullständiga namn</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={studentName || ''}
                      id="input-student-name"
                      onFocus={() => setShowCandidateSuggestions(true)}
                      onChange={(e) => {
                        handleUpdateProp('studentName', e.target.value);
                        setShowCandidateSuggestions(true);
                      }}
                      placeholder="t.ex. Anna Andersson"
                      className="w-full h-12 px-4 text-sm font-semibold rounded-xl border-2 border-gray-200 dark:border-slate-700 focus:outline-none focus:border-[#002f6c] dark:focus:border-blue-500 bg-white dark:bg-slate-900 text-gray-900 dark:text-white shadow-xs transition-all placeholder:text-gray-400 placeholder:font-normal"
                    />
                    {showCandidateSuggestions && matchingCandidates.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-slate-900 border-2 border-blue-200 dark:border-blue-900 rounded-xl shadow-2xl z-50 overflow-hidden divide-y divide-gray-100 dark:divide-slate-800 max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
                        <div className="px-3.5 py-2 bg-blue-50/80 dark:bg-slate-800 text-[10px] font-bold uppercase tracking-wider text-blue-900 dark:text-blue-300 flex items-center justify-between">
                          <span>Klicka för att välja & autofylla</span>
                          <button
                            type="button"
                            onClick={() => setShowCandidateSuggestions(false)}
                            className="hover:text-red-500 text-xs px-1 cursor-pointer font-black"
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
                            className="w-full text-left px-3.5 py-3 hover:bg-blue-50 dark:hover:bg-blue-900/30 flex items-center justify-between transition-colors cursor-pointer"
                          >
                            <div>
                              <div className="text-sm font-bold text-gray-900 dark:text-white">{c.studentName}</div>
                              <div className="flex items-center gap-1.5">
                                <div className="text-xs font-mono text-gray-500 dark:text-slate-400">{c.personalNumber || 'Saknar personnummer'}</div>
                                {c.personalNumber && <VtrStatusBadge personalNumber={c.personalNumber} compact />}
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-black px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200">
                                {c.licenseType}
                              </span>
                              <span className="text-[11px] text-gray-500 dark:text-slate-400">
                                {c.transmission}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Personnummer */}
                <div className="space-y-1.5 sm:col-span-1">
                  <label className="text-[11px] font-bold text-gray-700 dark:text-slate-300 tracking-wide uppercase flex items-center gap-1">
                    <span>Personnummer</span>
                    <span className="text-gray-400 font-normal text-[10px] lowercase">(10 eller 12 siffror)</span>
                  </label>
                  <input
                    type="text"
                    value={personalNumber || ''}
                    id="input-personal-number"
                    onChange={(e) => handleUpdateProp('personalNumber', e.target.value)}
                    placeholder="ÅÅÅÅMMDD-XXXX"
                    className="w-full h-12 px-4 text-sm font-mono font-semibold rounded-xl border-2 border-gray-200 dark:border-slate-700 focus:outline-none focus:border-[#002f6c] dark:focus:border-blue-500 bg-white dark:bg-slate-900 text-gray-900 dark:text-white shadow-xs transition-all placeholder:text-gray-400 placeholder:font-mono"
                  />
                </div>
                
                {/* E-postadress */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-[11px] font-bold text-gray-700 dark:text-slate-300 tracking-wide uppercase flex items-center justify-between">
                    <span>E-postadress för protokollkopia</span>
                    <span className="text-gray-400 text-[10px] font-normal lowercase">skickas automatiskt vid godkännande</span>
                  </label>
                  <input
                    type="email"
                    value={email || ''}
                    id="input-email"
                    onChange={(e) => handleUpdateProp('email', e.target.value)}
                    placeholder="elevens.namn@exempel.se"
                    className="w-full h-12 px-4 text-sm font-medium rounded-xl border-2 border-gray-200 dark:border-slate-700 focus:outline-none focus:border-[#002f6c] dark:focus:border-blue-500 bg-white dark:bg-slate-900 text-gray-900 dark:text-white shadow-xs transition-all placeholder:text-gray-400 placeholder:font-normal"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Provdetaljer */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-3">
                <h2 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">2</span>
                  Provdetaljer & Inställningar
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-700 dark:text-slate-300 tracking-wide uppercase">Provförrättare</label>
                  <input
                    type="text"
                    value={examiner || ''}
                    id="input-examiner"
                    onChange={(e) => handleUpdateProp('examiner', e.target.value)}
                    className="w-full h-12 px-4 text-sm font-semibold rounded-xl border-2 border-gray-200 dark:border-slate-800 bg-gray-100 dark:bg-slate-800/80 text-gray-600 dark:text-slate-300 cursor-not-allowed"
                    disabled
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-700 dark:text-slate-300 tracking-wide uppercase">Provdatum</label>
                  <input
                    type="date"
                    value={testDate || ''}
                    id="input-test-date"
                    onChange={(e) => handleUpdateProp('testDate', e.target.value)}
                    className="w-full h-12 px-4 text-sm font-semibold rounded-xl border-2 border-gray-200 dark:border-slate-700 focus:outline-none focus:border-[#002f6c] dark:focus:border-blue-500 bg-white dark:bg-slate-900 text-gray-900 dark:text-white shadow-xs transition-all"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-[11px] font-bold text-gray-700 dark:text-slate-300 tracking-wide uppercase block">Provtyp</label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {[
                      { id: 'Förstaprov', label: 'Förstaprov' },
                      { id: 'Omprov', label: 'Omprov' },
                      { id: 'Omprov säkerhetskontroll', label: 'Omprov säkerhet' },
                      { id: 'Omprov körning', label: 'Omprov körning' },
                      { id: 'Bedömningsprov', label: 'Bedömningsprov' }
                    ].map(pt => (
                      <button
                        key={pt.id}
                        type="button"
                        onClick={() => handleUpdateProp('testType', pt.id)}
                        className={`h-11 px-2.5 text-xs font-bold rounded-xl border-2 transition-all cursor-pointer select-none active:scale-[0.98] ${
                          (state.properties.testType || 'Förstaprov') === pt.id
                            ? 'bg-[#002f6c] text-white border-[#002f6c] dark:bg-blue-600 dark:border-blue-500 shadow-sm font-black'
                            : 'bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-300 border-gray-200 dark:border-slate-700 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* License Grid */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-2">
                <label className="text-[11px] font-bold text-gray-700 dark:text-slate-300 tracking-wide uppercase flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">3</span>
                  Körkortsbehörighet & Förarbevis
                </label>
                {(() => {
                  const currentLic = LICENSE_CONFIG.find(l => l.id === licenseType);
                  return (
                    <span className="text-xs font-black text-[#002f6c] dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-lg flex items-center gap-1.5 border border-blue-200 dark:border-blue-800">
                      <span className="text-sm">{currentLic?.icon || '🚗'}</span>
                      <span>{licenseType}</span>
                    </span>
                  );
                })()}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                {LICENSE_CONFIG.map((lic) => {
                  const isSelected = licenseType === lic.id;
                  return (
                    <button
                      key={lic.id}
                      type="button"
                      onClick={() => {
                        triggerHaptic('light');
                        handleUpdateProp('licenseType', lic.id);
                      }}
                      className={`min-h-[58px] p-2.5 rounded-2xl transition-all select-none active:scale-[0.97] cursor-pointer flex flex-col justify-center items-start text-left border-2 relative overflow-hidden group ${
                        isSelected
                          ? 'bg-[#002f6c] dark:bg-blue-600 text-white border-[#002f6c] dark:border-blue-500 shadow-md font-black ring-2 ring-blue-500/20'
                          : 'bg-white dark:bg-slate-900 text-gray-800 dark:text-slate-200 border-gray-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-slate-700 hover:bg-slate-50/80'
                      }`}
                      title={lic.label}
                    >
                      <div className="flex items-center gap-2 w-full">
                        <span className="text-lg shrink-0 group-hover:scale-110 transition-transform duration-150">
                          {lic.icon}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className={`text-xs font-extrabold leading-tight break-words ${isSelected ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                            {lic.label.split(' (')[0]}
                          </div>
                          <div className={`text-[10px] leading-tight mt-0.5 ${isSelected ? 'text-blue-100 font-medium' : 'text-gray-500 dark:text-slate-400'}`}>
                            {lic.label.includes('(') ? lic.label.split('(')[1].replace(')', '') : lic.category}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Fordonsegenskaper: Växellåda & Färdskrivare */}
            {(() => {
              const isHeavy = ['C', 'C1', 'CE', 'C1E', 'D', 'D1', 'DE', 'D1E'].includes(licenseType);
              return (
                <div className={`grid grid-cols-1 ${isHeavy ? 'sm:grid-cols-2' : ''} gap-4 pt-2`}>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-gray-700 dark:text-slate-300 tracking-wide uppercase block">
                      Växellåda (Transmission)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          triggerHaptic('light');
                          handleUpdateProp('transmission', 'Manuell');
                        }}
                        className={`h-11 px-3 text-xs font-bold rounded-xl border-2 transition-all cursor-pointer flex items-center justify-center gap-1.5 select-none active:scale-95 ${
                          (state.properties.transmission || 'Manuell') !== 'Automat'
                            ? 'bg-[#002f6c] dark:bg-blue-600 text-white border-[#002f6c] dark:border-blue-500 shadow-sm font-black'
                            : 'bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-300 border-gray-200 dark:border-slate-700 hover:bg-gray-50'
                        }`}
                      >
                        <span>Manuell</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          triggerHaptic('light');
                          handleUpdateProp('transmission', 'Automat');
                        }}
                        className={`h-11 px-3 text-xs font-bold rounded-xl border-2 transition-all cursor-pointer flex items-center justify-center gap-1.5 select-none active:scale-95 ${
                          state.properties.transmission === 'Automat'
                            ? 'bg-[#002f6c] dark:bg-blue-600 text-white border-[#002f6c] dark:border-blue-500 shadow-sm font-black'
                            : 'bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-300 border-gray-200 dark:border-slate-700 hover:bg-gray-50'
                        }`}
                      >
                        <span>Automat (78)</span>
                      </button>
                    </div>
                  </div>

                  {/* Färdskrivare (endast på tunga prov C, C1, CE, C1E, D, D1, DE, D1E) */}
                  {isHeavy && (
                    <div className="space-y-1.5 animate-in fade-in duration-200">
                      <label className="text-[11px] font-bold text-gray-700 dark:text-slate-300 tracking-wide uppercase block">
                        Färdskrivare (Tunga fordon)
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            triggerHaptic('light');
                            handleUpdateProp('tachograph' as any, 'Med färdskrivare');
                          }}
                          className={`h-11 px-3 text-xs font-bold rounded-xl border-2 transition-all cursor-pointer flex items-center justify-center gap-1.5 select-none active:scale-95 ${
                            (state.properties.tachograph || 'Med färdskrivare') !== 'Utan färdskrivare'
                              ? 'bg-[#002f6c] dark:bg-blue-600 text-white border-[#002f6c] dark:border-blue-500 shadow-sm font-black'
                              : 'bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-300 border-gray-200 dark:border-slate-700 hover:bg-gray-50'
                          }`}
                        >
                          <span>Med färdskrivare</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            triggerHaptic('light');
                            handleUpdateProp('tachograph' as any, 'Utan färdskrivare');
                          }}
                          className={`h-11 px-3 text-xs font-bold rounded-xl border-2 transition-all cursor-pointer flex items-center justify-center gap-1.5 select-none active:scale-95 ${
                            state.properties.tachograph === 'Utan färdskrivare'
                              ? 'bg-[#c40000] text-white border-[#c40000] shadow-sm font-black'
                              : 'bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-300 border-gray-200 dark:border-slate-700 hover:bg-gray-50'
                          }`}
                        >
                          <span>Utan färdskrivare</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* ID Checkbox */}
            <div className="pt-6">
              <label className={`flex items-start gap-4 p-5 rounded-2xl border-2 transition-colors cursor-pointer group focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 dark:focus-within:ring-offset-slate-900 ${
                state.checklist.identityChecked
                  ? 'border-emerald-300 dark:border-emerald-800/60 bg-emerald-50/60 dark:bg-emerald-950/20'
                  : 'border-transparent bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800'
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
                  <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all duration-150 ${
                    state.checklist.identityChecked
                      ? 'bg-emerald-500 border-emerald-500 scale-105 shadow-sm shadow-emerald-600/30'
                      : 'border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900'
                  }`}>
                    {state.checklist.identityChecked && (
                      <CheckCircle2 size={16} className="text-white animate-in zoom-in-75 duration-100" />
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-1">
                    <UserCheck size={18} className={state.checklist.identityChecked ? 'text-emerald-500' : 'text-gray-400 dark:text-slate-500'} /> 
                    Fastställ identitet <span className="text-red-500">*</span>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed max-w-lg">
                    Intyga att giltig id-handling kontrollerats och kandidatens fysik stämmer.
                  </div>
                </div>
              </label>
            </div>

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
              className={`w-full flex items-start gap-4 p-5 rounded-2xl border-2 text-left transition-colors cursor-pointer ${
                protocolLayout === 'ny'
                  ? 'border-violet-300 dark:border-violet-800/60 bg-violet-50/70 dark:bg-violet-950/20'
                  : 'border-dashed border-gray-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <span className={`mt-0.5 w-11 h-6 rounded-full p-0.5 shrink-0 transition-colors ${protocolLayout === 'ny' ? 'bg-violet-600' : 'bg-gray-300 dark:bg-slate-600'}`}>
                <span className={`block w-5 h-5 rounded-full bg-white shadow transition-transform ${protocolLayout === 'ny' ? 'translate-x-5' : ''}`} />
              </span>
              <span className="flex-1 min-w-0">
                <span className="font-bold text-gray-900 dark:text-white flex flex-wrap items-center gap-2">
                  <Sparkles size={16} className="text-violet-500" />
                  Testa ny provlayout
                  <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-violet-100 text-violet-800 dark:bg-violet-900/50 dark:text-violet-200">Testperiod</span>
                </span>
                <span className="block text-sm text-gray-500 dark:text-slate-400 leading-relaxed mt-1">
                  Resultatet visas som i Trafikverkets nya protokoll: <em>Orsaker till underkännandet – Du måste bli bättre på</em>, samt <em>Detta bedömdes i ditt körprov</em>. Valet sparas tills du stänger av det.
                </span>
              </span>
            </button>

          </div>

          {/* Action Area footer inside card */}
          <div className="bg-gray-50/80 dark:bg-slate-800/30 p-6 sm:p-8 border-t border-gray-100 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
              {readinessChecks.map(check => (
                <span
                  key={check.label}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-colors ${
                    check.done
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-400'
                      : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-white/10 text-gray-400 dark:text-slate-500'
                  }`}
                >
                  {check.done ? <CheckCircle2 size={13} /> : <span className="w-3 h-3 rounded-full border-2 border-current" />}
                  {check.label}
                </span>
              ))}
            </div>
            
            <button
              id="btn-open-prov"
              onClick={() => {
                triggerHaptic('success');
                handleStartTest();
              }}
              className="w-full sm:w-auto px-8 py-4 bg-[#002f6c] hover:bg-[#00204a] dark:bg-blue-600 dark:hover:bg-blue-500 active:scale-95 text-white font-black text-sm tracking-widest uppercase transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-3 rounded-2xl cursor-pointer"
            >
              <span>Skapa prov & Gå vidare</span>
              <ChevronRight size={18} />
            </button>
          </div>

        </div>

        {/* Right Side: Terminal Control Desk (Quick schedule scheduler) */}
        <div className="lg:col-span-5 space-y-6 lg:space-y-8">
          
          {/* Quick Schedule Selector */}
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/5 rounded-[2rem] shadow-sm p-6 sm:p-8 flex flex-col h-full max-h-[600px]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-black text-sm text-gray-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                <Calendar size={18} className="text-blue-600 dark:text-blue-400" /> Schema
              </h3>
              <span className="text-[10px] uppercase tracking-widest font-black bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 px-2.5 py-1 rounded-lg">
                Idag
              </span>
            </div>
            
            {/* Quick Filter Search */}
            <div className="relative mb-6">
              <input 
                type="text"
                placeholder="Sök inbokad kandidat..."
                value={activeSearch}
                onChange={(e) => setActiveSearch(e.target.value)}
                className="w-full h-11 px-4 text-sm bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-white/10 rounded-xl dark:text-white outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
              />
            </div>

            <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-1">
              {filteredSchedule.length === 0 ? (
                <div className="text-center py-10 px-4 border border-dashed border-gray-200 dark:border-slate-800 rounded-2xl">
                  <p className="text-xs text-gray-500 dark:text-slate-400 mb-3">
                    Inga inbokade kandidater i schemat.
                  </p>
                  <button
                    onClick={() => navigate('/elevregister')}
                    className="px-3 py-2 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 text-[#002f6c] dark:text-blue-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    + Öppna Elevregister
                  </button>
                </div>
              ) : (
                filteredSchedule.map(item => {
                  const isSelected = studentName === item.studentName && licenseType === item.licenseType;
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
                      className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer group ${
                        isSelected
                          ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-500/30 shadow-sm border-l-4 border-l-[#002f6c] dark:border-l-blue-400'
                          : 'bg-white dark:bg-slate-900 border-gray-100 dark:border-white/5 hover:border-gray-200 dark:hover:border-white/10 hover:bg-gray-50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <div className="space-y-1.5 flex-1 pr-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-[#002f6c] dark:group-hover:text-blue-400 transition-colors">
                            {item.studentName}
                          </span>
                          {item.status === 'Underkänd historik' && (
                            <span className="text-[9px] font-black text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                              Omprov
                            </span>
                          )}
                          <VtrStatusBadge personalNumber={item.personalNumber} compact />
                        </div>
                        <div className="text-[11px] text-gray-500 dark:text-slate-400 font-mono flex items-center gap-2">
                          {item.personalNumber} <span className="opacity-50">•</span> {item.transmission}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-xs font-black text-gray-900 dark:text-white flex items-center gap-1.5 justify-end bg-gray-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                          <Clock size={12} className="text-gray-400 dark:text-slate-500" />
                          {item.time}
                        </div>
                        <div className="mt-2 text-right">
                          <span className="inline-flex items-center gap-1 text-[10px] font-black bg-[#002f6c] text-white dark:bg-blue-900/60 dark:text-blue-200 px-2 py-0.5 rounded-md shadow-sm">
                            <span>{LICENSE_CONFIG.find(l => l.id === item.licenseType)?.icon || '🚗'}</span>
                            <span>{item.licenseType}</span>
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Simuleringsverktyg – bara i utvecklingsläge, aldrig i den publicerade appen */}
          {import.meta.env.DEV && (
          <div className="bg-slate-900 dark:bg-slate-900 border border-slate-800 rounded-[2rem] shadow-lg p-6 sm:p-8 space-y-5 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="flex items-center gap-3 relative z-10">
              <span className="p-2 rounded-xl bg-slate-800 text-purple-400">
                <Cpu size={18} />
              </span>
              <h3 className="font-black text-sm text-white uppercase tracking-widest">
                Simuleringsverktyg (utveckling)
              </h3>
            </div>

            <p className="text-sm text-slate-400 leading-relaxed relative z-10">
              Simulera en historik där en kandidat blivit underkänd, för att i nästa vy testa hämtning av omprovsuppgifter.
            </p>

            <button
               onClick={() => {
                 triggerHaptic('heavy');
                 loadMockFailedTest();
               }}
               className="relative z-10 w-full h-12 text-xs font-black uppercase tracking-widest bg-slate-800 hover:bg-slate-700 text-white transition-all rounded-xl cursor-pointer shadow-sm flex items-center justify-center gap-2 border border-slate-700"
            >
              <History size={16} className="text-purple-400" />
              <span>Simulera underkänt prov</span>
            </button>
          </div>
          )}

        </div>

      </div>

    </div>
  );
}
