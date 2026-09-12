import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/ProvContext';
import { TEST_CONTENT } from '../../data/testContentCatalog';
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

const COMMON_LICENSES = ['B', 'BE', 'B96', 'C', 'CE', 'C1', 'C1E', 'D', 'DE', 'A', 'AM', 'TAXI', 'Lokförare', 'Lokförare (Person)', 'Lokförare (Gods)', 'Spårvagn', 'Tunnelbana'];

// Detailed mock list of today's schedule for full-featured feel
const DAILY_SCHEDULE = [
  { 
    id: '1', 
    time: '08:30', 
    studentName: 'Mikael Kronberg', 
    personalNumber: '19820209-4937', 
    email: 'mikael.kronberg@exempel.se', 
    licenseType: 'C',
    testType: 'Omprov',
    transmission: 'Manuell',
    status: 'Klar för start'
  },
  { 
    id: '2', 
    time: '10:15', 
    studentName: 'Fatima Al-Sayed', 
    personalNumber: '19900314-5566', 
    email: 'fatima.alsayed@exempel.se', 
    licenseType: 'D',
    testType: 'Förstaprov',
    transmission: 'Automat',
    status: 'Incheckad'
  },
  { 
    id: '3', 
    time: '13:00', 
    studentName: 'Elvira Strömqvist', 
    personalNumber: '19950613-1234', 
    email: 'elvira@exempel.se', 
    licenseType: 'B',
    testType: 'Omprov körning',
    transmission: 'Manuell',
    status: 'Underkänd historik'
  },
  { 
    id: '4', 
    time: '15:15', 
    studentName: 'Lucas Bergqvist', 
    personalNumber: '20011119-9876', 
    email: 'lucas.b@exempel.se', 
    licenseType: 'B',
    testType: 'Förstaprov',
    transmission: 'Manuell',
    status: 'Inbokad'
  }
];

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

  const setPresetCandidate = (candidate: {
    studentName: string;
    personalNumber: string;
    email: string;
    licenseType: string;
    testType?: string;
    transmission?: string;
    examiner?: string;
  }) => {
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
    if (!studentName) handleUpdateProp('studentName', 'Kandidat');
    if (!licenseType) handleUpdateProp('licenseType', 'B');
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

  const filteredSchedule = DAILY_SCHEDULE.filter(item => 
    item.studentName.toLowerCase().includes(activeSearch.toLowerCase()) ||
    item.personalNumber.includes(activeSearch) ||
    item.licenseType.toLowerCase().includes(activeSearch.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full pt-2 pb-24 font-sans text-gray-900 dark:text-gray-100 antialiased">
      
      {/* Header Panel with Stats Badge */}
      <div className="mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-[2rem] border border-gray-200/80 dark:border-white/5 shadow-sm relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-600/10 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border border-red-200/50 dark:border-red-900/30 flex items-center gap-1.5 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 dark:bg-red-500 animate-pulse"></span>
              Live System
            </span>
            <span className="text-xs font-medium text-gray-500 dark:text-slate-400 bg-gray-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
              Terminal 4
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-gray-900 dark:text-white flex flex-wrap items-center gap-3 sm:gap-4 mb-2">
            Mottagning & Provstart
            <button
              id="btn-clear-test"
              onClick={() => {
                triggerHaptic('heavy');
                updateState({
                  properties: {
                    studentName: '',
                    personalNumber: '',
                    licenseType: 'B',
                    examiner: profile.name,
                    testDate: new Date().toISOString().split('T')[0],
                    email: '',
                    testType: 'Förstaprov',
                    transmission: 'Manuell',
                  },
                  checklist: {
                    identityChecked: false,
                    studentInformed: false,
                    licenseTypeCorrect: false,
                    vehicleCorrect: false,
                    questionsAnswered: false,
                  },
                  includedTestItems: [],
                  result: {
                    drivingResult: null,
                    drivingScore: null,
                    safetyCheckResult: null,
                    interventionOccurred: false,
                    testAborted: false,
                    drivingFailure: { primaryCause: { area: '', deficiencies: [] }, consequences: [], situations: [], interventionOccurred: false, testAborted: false },
                    safetyCheckFailure: { primaryCause: { area: '', deficiencies: [] }, consequences: [], situations: [], interventionOccurred: false, testAborted: false }
                  }
                });
              }}
              className="text-[10px] font-bold text-gray-400 hover:text-red-600 dark:text-slate-500 dark:hover:text-red-400 bg-gray-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-2.5 min-h-10 rounded-lg transition-colors uppercase tracking-wider flex items-center gap-1 cursor-pointer border border-transparent hover:border-red-200 dark:hover:border-red-900/30"
            >
              Nollställ
            </button>
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 max-w-xl">
            Registrera kandidatuppgifter för att påbörja provet och generera utskriftsklart protokoll.
          </p>
        </div>

        {/* Real-time system counters */}
        <div className="flex gap-3 sm:gap-4 shrink-0 z-10 w-full lg:w-auto">
          <div className="flex-1 lg:flex-none bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-white/5 min-w-[120px] flex flex-col justify-center items-center">
            <span className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">Planerat Idag</span>
            <span className="text-2xl font-black text-[#002f6c] dark:text-blue-400">4 Prov</span>
          </div>
          <div className="flex-1 lg:flex-none bg-emerald-50/50 dark:bg-emerald-900/10 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 min-w-[120px] flex flex-col justify-center items-center">
            <span className="block text-[10px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest mb-1">Status</span>
            <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400 flex items-center justify-center gap-1">
              On-Line
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        
        {/* Left Side: Candidates intake Form */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/5 rounded-[2rem] shadow-sm overflow-hidden flex flex-col">
          
          <div className="p-6 sm:p-8 space-y-8 flex-1">
            <div>
              <h2 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest flex items-center gap-2 border-b border-gray-100 dark:border-white/5 pb-4 mb-2">
                <User size={16} className="text-[#002f6c] dark:text-blue-400" />
                Kandidatinformation
              </h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-500 dark:text-slate-400 tracking-widest uppercase ml-1">Kandidatens namn *</label>
                <div className="relative">
                  <input
                    type="text"
                    value={studentName || ''}
                    id="input-student-name"
                    onChange={(e) => handleUpdateProp('studentName', e.target.value)}
                    placeholder="Förnamn Efternamn"
                    className="w-full h-12 px-4 text-sm font-medium rounded-xl border border-gray-200 dark:border-white/10 focus:outline-none focus:border-[#002f6c] focus:ring-1 focus:ring-[#002f6c] dark:focus:border-blue-500 dark:focus:ring-blue-500 bg-gray-50/50 dark:bg-slate-900/50 dark:text-white transition-all"
                  />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-500 dark:text-slate-400 tracking-widest uppercase ml-1">Personnummer</label>
                <input
                  type="text"
                  value={personalNumber || ''}
                  id="input-personal-number"
                  onChange={(e) => handleUpdateProp('personalNumber', e.target.value)}
                  placeholder="ÅÅÅÅMMDD-XXXX"
                  className="w-full h-12 px-4 text-sm font-mono rounded-xl border border-gray-200 dark:border-white/10 focus:outline-none focus:border-[#002f6c] focus:ring-1 focus:ring-[#002f6c] dark:focus:border-blue-500 dark:focus:ring-blue-500 bg-gray-50/50 dark:bg-slate-900/50 dark:text-white transition-all"
                />
              </div>
              
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-[10px] font-black text-gray-500 dark:text-slate-400 tracking-widest uppercase ml-1">E-postadress</label>
                <input
                  type="email"
                  value={email || ''}
                  id="input-email"
                  onChange={(e) => handleUpdateProp('email', e.target.value)}
                  placeholder="namn@exempel.se"
                  className="w-full h-12 px-4 text-sm font-medium rounded-xl border border-gray-200 dark:border-white/10 focus:outline-none focus:border-[#002f6c] focus:ring-1 focus:ring-[#002f6c] dark:focus:border-blue-500 dark:focus:ring-blue-500 bg-gray-50/50 dark:bg-slate-900/50 dark:text-white transition-all"
                />
              </div>
            </div>

            <div className="pt-2">
              <h2 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest flex items-center gap-2 border-b border-gray-100 dark:border-white/5 pb-4 mb-2">
                <FileText size={16} className="text-amber-500 dark:text-amber-400" />
                Provdetaljer
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-500 dark:text-slate-400 tracking-widest uppercase ml-1">Provförrättare</label>
                <input
                  type="text"
                  value={examiner || ''}
                  id="input-examiner"
                  onChange={(e) => handleUpdateProp('examiner', e.target.value)}
                  className="w-full h-12 px-4 text-sm font-medium rounded-xl border border-gray-200 dark:border-white/5 focus:outline-none bg-gray-100 dark:bg-slate-800 dark:text-slate-300 cursor-not-allowed text-gray-500"
                  disabled
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-500 dark:text-slate-400 tracking-widest uppercase ml-1">Provdatum</label>
                <input
                  type="date"
                  value={testDate || ''}
                  id="input-test-date"
                  onChange={(e) => handleUpdateProp('testDate', e.target.value)}
                  className="w-full h-12 px-4 text-sm font-medium rounded-xl border border-gray-200 dark:border-white/10 focus:outline-none focus:border-[#002f6c] focus:ring-1 focus:ring-[#002f6c] dark:focus:border-blue-500 dark:focus:ring-blue-500 bg-gray-50/50 dark:bg-slate-900/50 dark:text-white transition-all"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-[10px] font-black text-gray-500 dark:text-slate-400 tracking-widest uppercase ml-1">Provtyp</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'Förstaprov', label: 'Förstaprov' },
                    { id: 'Omprov', label: 'Omprov' },
                    { id: 'Omprov körning', label: 'Omprov körning' },
                    { id: 'Bedömningsprov', label: 'Bedömningsprov' }
                  ].map(pt => (
                    <button
                      key={pt.id}
                      type="button"
                      onClick={() => handleUpdateProp('testType', pt.id)}
                      className={`h-11 px-3 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                        (state.properties.testType || 'Förstaprov') === pt.id
                          ? 'bg-[#002f6c] text-white border-[#002f6c] dark:bg-blue-600 dark:border-blue-500 shadow-sm'
                          : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 border-gray-200 dark:border-white/10 hover:bg-gray-50'
                      }`}
                    >
                      {pt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* License Grid */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black text-gray-500 dark:text-slate-400 tracking-widest uppercase ml-1 block">Behörighet</label>
                <span className="text-xs font-bold text-[#002f6c] dark:text-blue-400">Vald: {licenseType}</span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {COMMON_LICENSES.slice(0, 12).map((lic) => (
                  <button
                    key={lic}
                    type="button"
                    onClick={() => {
                      triggerHaptic('light');
                      handleUpdateProp('licenseType', lic);
                    }}
                    className={`h-11 text-xs sm:text-sm font-bold rounded-xl transition-all select-none active:scale-95 cursor-pointer flex items-center justify-center ${
                      licenseType === lic
                        ? 'bg-[#002f6c] dark:bg-blue-600 text-white shadow-md shadow-blue-900/20 ring-2 ring-offset-2 ring-[#002f6c] dark:ring-blue-500 dark:ring-offset-slate-900 font-black'
                        : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 border border-gray-200 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    {lic}
                  </button>
                ))}
              </div>
            </div>

            {/* Fordonsegenskaper: Växellåda & Färdskrivare (endast tunga prov: C, D, CE, DE etc.) */}
            {(() => {
              const isHeavy = ['C', 'C1', 'CE', 'C1E', 'D', 'D1', 'DE', 'D1E'].includes(licenseType);
              return (
                <div className={`grid grid-cols-1 ${isHeavy ? 'sm:grid-cols-2' : ''} gap-4 pt-1`}>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-500 dark:text-slate-400 tracking-widest uppercase ml-1 block">
                      Växellåda (Transmission)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          triggerHaptic('light');
                          handleUpdateProp('transmission', 'Manuell');
                        }}
                        className={`h-11 px-3 text-xs font-bold rounded-xl border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                          (state.properties.transmission || 'Manuell') !== 'Automat'
                            ? 'bg-[#002f6c] dark:bg-blue-600 text-white border-[#002f6c] dark:border-blue-500 shadow-sm font-black'
                            : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 border-gray-200 dark:border-white/10 hover:bg-gray-50'
                        }`}
                      >
                        <span>⚙️ Manuell</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          triggerHaptic('light');
                          handleUpdateProp('transmission', 'Automat');
                        }}
                        className={`h-11 px-3 text-xs font-bold rounded-xl border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                          state.properties.transmission === 'Automat'
                            ? 'bg-[#002f6c] dark:bg-blue-600 text-white border-[#002f6c] dark:border-blue-500 shadow-sm font-black'
                            : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 border-gray-200 dark:border-white/10 hover:bg-gray-50'
                        }`}
                      >
                        <span>⚡ Automat (78)</span>
                      </button>
                    </div>
                  </div>

                  {/* Färdskrivare (endast på tunga prov C, C1, CE, C1E, D, D1, DE, D1E) */}
                  {isHeavy && (
                    <div className="space-y-1.5 animate-in fade-in duration-200">
                      <label className="text-[10px] font-black text-gray-500 dark:text-slate-400 tracking-widest uppercase ml-1 block">
                        Färdskrivare (Tunga fordon)
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            triggerHaptic('light');
                            handleUpdateProp('tachograph' as any, 'Med färdskrivare');
                          }}
                          className={`h-11 px-3 text-xs font-bold rounded-xl border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                            (state.properties.tachograph || 'Med färdskrivare') !== 'Utan färdskrivare'
                              ? 'bg-[#002f6c] dark:bg-blue-600 text-white border-[#002f6c] dark:border-blue-500 shadow-sm font-black'
                              : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 border-gray-200 dark:border-white/10 hover:bg-gray-50'
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
                          className={`h-11 px-3 text-xs font-bold rounded-xl border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                            state.properties.tachograph === 'Utan färdskrivare'
                              ? 'bg-[#c40000] text-white border-[#c40000] shadow-sm font-black'
                              : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 border-gray-200 dark:border-white/10 hover:bg-gray-50'
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
              <label className="flex items-start gap-4 p-5 rounded-2xl border-2 border-transparent bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer group focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 dark:focus-within:ring-offset-slate-900">
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
                  <div className="w-6 h-6 rounded border-2 border-gray-300 dark:border-slate-600 peer-checked:bg-emerald-500 peer-checked:border-emerald-500 flex items-center justify-center transition-colors">
                     <CheckCircle2 size={16} className="text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
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

          </div>
          
          {/* Action Area footer inside card */}
          <div className="bg-gray-50/80 dark:bg-slate-800/30 p-6 sm:p-8 border-t border-gray-100 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-xs text-gray-500 dark:text-slate-400 font-medium">
              Aktiv profil: <strong className="font-mono bg-white dark:bg-slate-900 px-2 py-1 rounded-md border border-gray-200 dark:border-white/5 text-gray-900 dark:text-white shadow-sm ml-1">{licenseType}</strong>
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
              {filteredSchedule.map(item => {
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
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-500/30 shadow-sm'
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
                        <span className="inline-block text-[10px] font-black bg-[#002f6c] text-white dark:bg-slate-700 px-2 py-0.5 rounded-md shadow-sm">
                          {item.licenseType}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Simulation Desk */}
          <div className="bg-slate-900 dark:bg-slate-900 border border-slate-800 rounded-[2rem] shadow-lg p-6 sm:p-8 space-y-5 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="flex items-center gap-3 relative z-10">
              <span className="p-2 rounded-xl bg-slate-800 text-purple-400">
                <Cpu size={18} />
              </span>
              <h3 className="font-black text-sm text-white uppercase tracking-widest">
                Dev Simuleringsverktyg
              </h3>
            </div>
            
            <p className="text-sm text-slate-400 leading-relaxed relative z-10">
              Simulera en historik där en kandidat kuggats, för att i nästa test-vy testa omprovs-hämtning.
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

        </div>

      </div>

    </div>
  );
}
