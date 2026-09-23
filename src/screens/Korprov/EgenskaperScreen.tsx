import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAppStore } from '../../store/ProvContext';
import { TEST_CONTENT } from '../../data/testContentCatalog';
import { useMemo, useState } from 'react';
import { OfficialPrintLayout } from './components/OfficialPrintLayout';
import { 
  User, 
  Map, 
  Settings, 
  FileCheck2, 
  Edit3, 
  CheckCircle, 
  History, 
  Sparkles, 
  Check, 
  ChevronRight, 
  Scale, 
  ShieldAlert, 
  Info,
  Sliders,
  Award,
  Globe2,
  Calendar,
  Lock
} from 'lucide-react';

const licenseTypes = [
  'AM', 'A1', 'A2', 'A', 'B', 'B1', 'BE', 'B96', 'C1', 'C1E', 'C', 'CE', 'D1', 'D1E', 'D', 'DE', 'TAXI',
  'Traktor (Traktorkort)', 'Snöskoter (Förarbevis)', 'Terränghjuling (ATV)', 'Truck (A+B)', 'Grävmaskin / Hjullastare',
  'Lokförare', 'Lokförare (Person)', 'Lokförare (Gods)', 'Spårvagn', 'Tunnelbana'
];

export function EgenskaperScreen() {
  const navigate = useNavigate();
  const { state, updateState, syncQueue } = useAppStore();
  const [loadedFromHistory, setLoadedFromHistory] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'protocol'>('info');
  const [showEditCandidate, setShowEditCandidate] = useState(false);

  const handleNext = () => {
    navigate('/korprov/inledning');
  };

  const handleBack = () => {
    navigate('/korprov/start');
  };

  const previousFailedTest = useMemo(() => {
    if (!state.properties.personalNumber || state.properties.personalNumber.length < 10) return null;
    
    // Check if test type is an omprov
    if (!state.properties.testType || (!state.properties.testType.includes('Omprov') && !state.properties.testType.includes('Testprov'))) return null;

    // Find the most recent test for this candidate in the sync queue that had a failure
    const latestTest = [...syncQueue]
      .reverse()
      .find(t => 
        t.properties.personalNumber === state.properties.personalNumber && 
        (t.result.drivingResult === 'Underkänt' || t.result.safetyCheckResult === 'Underkänt')
      );
      
    return latestTest;
  }, [state.properties.personalNumber, state.properties.testType, syncQueue]);

  const loadPreviousFailures = () => {
    if (!previousFailedTest) return;
    
    updateState(prev => {
      const prevDrivingSituations = previousFailedTest.result.drivingFailure?.situations || [];
      const prevSafetySituations = previousFailedTest.result.safetyCheckFailure?.situations || [];
      
      const fallbackItems = (prevDrivingSituations.length === 0 && prevSafetySituations.length === 0) 
        ? previousFailedTest.includedTestItems 
        : [];
      
      const newIncludedItems = [...new Set([
        ...(prev.includedTestItems || []),
        ...prevDrivingSituations,
        ...prevSafetySituations,
        ...(fallbackItems || [])
      ])];
      
      return {
        ...prev,
        properties: {
          ...prev.properties,
          licenseType: prev.properties.licenseType || previousFailedTest.properties.licenseType,
          transmission: prev.properties.transmission || previousFailedTest.properties.transmission,
          email: prev.properties.email || previousFailedTest.properties.email,
        },
        includedTestItems: newIncludedItems.filter(Boolean)
      };
    });
    setLoadedFromHistory(true);
  };

  const updateField = (field: keyof typeof state.properties, value: string) => {
    if (field === 'personalNumber') {
      setLoadedFromHistory(false);
    }
    updateState((prev) => {
      const newProps = { ...prev.properties, [field]: value };
      let newTestItems = prev.includedTestItems;
      
      if (field === 'licenseType') {
        const allowedItems = TEST_CONTENT[value] || TEST_CONTENT['B'];
        newTestItems = (prev.includedTestItems || []).filter(item => allowedItems.includes(item));
      }
      
      return {
        ...prev,
        properties: newProps,
        includedTestItems: newTestItems
      };
    });
  };

  const totalMoments = TEST_CONTENT[state.properties.licenseType || 'B']?.length || 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 px-4 sm:px-6 w-full pb-20 dark:text-gray-100">
      
      <div className="mb-6 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-gray-200 dark:border-zinc-800 pb-5">
        <div>
          <h2 className="text-2xl sm:text-3xl font-display font-bold tracking-tight">Provkonfiguration</h2>
          <p className="text-gray-500 dark:text-zinc-400 text-sm mt-0.5">Finjustera provparametrar, fordonets egenskaper och återställ tidigare underkända moment.</p>
        </div>
        <span className="px-3 py-1 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 text-xs font-bold uppercase rounded-lg border border-gray-200 dark:border-zinc-700 flex items-center gap-1.5 self-start sm:self-center">
          <Settings size={13} className="text-red-500" /> Momentredigering
        </span>
      </div>

      {/* 1. Candidate Profilkort Summarizing registration details from Step 1 */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-sm p-4 sm:p-6 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-24 -mr-12 -mt-12 bg-red-500/5 rounded-full blur-2xl pointer-events-none"></div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#002f6c]/10 dark:bg-blue-500/10 flex items-center justify-center text-[#002f6c] dark:text-blue-400 shrink-0 font-bold border border-blue-100 dark:border-blue-900/20">
              <User size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-extrabold text-gray-900 dark:text-white text-base sm:text-lg">
                  {state.properties.studentName || 'Kandidat saknas'}
                </h3>
                {state.checklist.identityChecked ? (
                  <span className="text-[10px] font-black tracking-widest uppercase px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-900/40">
                    Legitimation kontrollerad
                  </span>
                ) : (
                  <span className="text-[10px] font-black tracking-widest uppercase px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-400 border border-amber-200/50 dark:border-amber-900/40">
                    Legitimation ej kontrollerad
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-zinc-400 font-mono mt-0.5">
                {state.properties.personalNumber || 'Saknar personnummer'} • {state.properties.email || 'Saknar e-post'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:self-center w-full sm:w-auto mt-2 sm:mt-0">
            <div className="px-3.5 py-1.5 bg-gray-50 dark:bg-zinc-800 rounded-lg border border-gray-100 dark:border-zinc-700 text-center shrink-0">
              <span className="block text-[9px] font-black text-gray-500 dark:text-zinc-400 uppercase tracking-widest">Klass</span>
              <span className="text-sm font-black text-red-600 dark:text-red-400">{state.properties.licenseType || 'B'}</span>
            </div>
            
            <button
              onClick={() => setShowEditCandidate(!showEditCandidate)}
              className="px-3 py-2.5 min-h-10 text-xs font-bold text-gray-600 dark:text-zinc-300 hover:text-red-600 border border-gray-200 dark:border-zinc-700 hover:border-red-200 rounded-lg transition-all flex items-center justify-center gap-1 bg-white dark:bg-zinc-800 cursor-pointer w-full sm:w-auto"
            >
              <Edit3 size={13} />
              <span>{showEditCandidate ? 'Dölj redigering' : 'Justera namn'}</span>
            </button>
          </div>
        </div>

        {/* Expansible compact form fields directly under profile if examiner wants to edit */}
        {showEditCandidate && (
          <div className="mt-6 pt-6 border-t border-gray-100 dark:border-zinc-800 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 bg-gray-50/50 dark:bg-zinc-850 p-4 rounded-xl">
            <Input 
              label="Kandidatens namn" 
              placeholder="Förnamn Efternamn"
              value={state.properties.studentName}
              onChange={(e) => updateField('studentName', e.target.value)}
              className="bg-white dark:bg-zinc-800 h-11"
            />
            <Input 
              label="Personnummer" 
              placeholder="ÅÅÅÅMMDD-XXXX"
              value={state.properties.personalNumber}
              onChange={(e) => updateField('personalNumber', e.target.value)}
              className="bg-white dark:bg-zinc-800 font-mono h-11"
            />
            <Input 
              label="E-postadress" 
              type="email"
              placeholder="namn@exempel.se"
              value={state.properties.email}
              onChange={(e) => updateField('email', e.target.value)}
              className="bg-white dark:bg-zinc-800 h-11"
            />
          </div>
        )}
      </div>

      {/* 2. Previous failures alert box (Förebyggeri / Omprov recovery) */}
      {previousFailedTest && (
        <div className={`border rounded-2xl overflow-hidden transition-all shadow-sm ${loadedFromHistory ? 'border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/10' : 'border-amber-200 dark:border-amber-900/50 bg-amber-50/10'}`}>
          <div className={`flex flex-col sm:flex-row border-b sm:items-center justify-between px-4 sm:px-6 py-1 gap-1 sm:gap-0 ${loadedFromHistory ? 'bg-emerald-50/55 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900/50' : 'bg-amber-50/55 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/50'}`}>
             <div className="flex overflow-x-auto hide-scrollbar">
               <button
                 onClick={() => setActiveTab('info')}
                 className={`px-3 py-3.5 font-bold text-xs uppercase tracking-wider transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap shrink-0 ${activeTab === 'info' ? (loadedFromHistory ? 'text-emerald-900 dark:text-emerald-400 border-emerald-600' : 'text-amber-900 dark:text-amber-400 border-amber-600') : 'text-gray-500 dark:text-zinc-400 border-transparent hover:text-gray-800'}`}
               >
                 <History size={13} />
                 <span>Resultatåterställning</span>
               </button>
               <button
                 onClick={() => setActiveTab('protocol')}
                 className={`px-3 py-3.5 font-bold text-xs uppercase tracking-wider transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap shrink-0 ${activeTab === 'protocol' ? (loadedFromHistory ? 'text-emerald-900 dark:text-emerald-400 border-emerald-600' : 'text-amber-900 dark:text-amber-400 border-amber-600') : 'text-gray-500 dark:text-zinc-400 border-transparent hover:text-gray-800'}`}
               >
                 <FileCheck2 size={13} />
                 <span>Granska föregående protokoll</span>
               </button>
             </div>
             <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded self-start sm:self-auto mb-1.5 sm:mb-0 ${loadedFromHistory ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30'}`}>
               Föreliggande
             </span>
          </div>
          
          <div className="p-5 sm:p-6 bg-white dark:bg-zinc-900">
            {activeTab === 'info' ? (
              <div className="flex flex-col md:flex-row gap-5 justify-between items-start md:items-center">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className={loadedFromHistory ? 'text-emerald-600' : 'text-amber-500'} size={18} />
                    <h4 className={`font-extrabold text-sm sm:text-base ${loadedFromHistory ? 'text-emerald-900 dark:text-emerald-400' : 'text-amber-900 dark:text-amber-400'}`}>
                      {loadedFromHistory ? 'Information och underkända moment har överförts' : 'Kandidaten blev underkänd i föregående prov'}
                    </h4>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 leading-relaxed max-w-2xl">
                    Kandidaten fick underkänt i klassen <strong className="font-bold text-gray-800 dark:text-white">{previousFailedTest.properties.licenseType}</strong> på sitt prov den {previousFailedTest.properties.testDate}. Underkända områden omfattade <strong className="font-semibold text-red-600 dark:text-red-400 font-mono">{([...(previousFailedTest.result.drivingFailure?.situations || []), ...(previousFailedTest.result.safetyCheckFailure?.situations || [])]).join(', ') || 'provmoment'}</strong>.
                  </p>
                </div>
                
                <button 
                  onClick={loadPreviousFailures}
                  disabled={loadedFromHistory}
                  className={`w-full md:w-auto shrink-0 px-5 h-11 text-xs font-bold transition-all border rounded-xl flex items-center justify-center gap-1.5 cursor-pointer ${
                    loadedFromHistory 
                      ? "bg-emerald-50 border-emerald-300 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-800 dark:text-emerald-400 opacity-80 cursor-default" 
                      : "bg-amber-600 border-amber-600 text-white hover:bg-amber-700 shadow-sm"
                  }`}
                >
                  {loadedFromHistory ? (
                    <>
                      <Check size={14} />
                      <span>Hämtat och konfigurerat</span>
                    </>
                  ) : (
                    <>
                      <History size={14} />
                      <span>Läs in underkända delar</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto max-h-[350px] border border-gray-100 dark:border-zinc-800 rounded-xl p-4 bg-gray-50 dark:bg-zinc-950/40 relative">
                 <div className="scale-[0.8] origin-top-left overflow-hidden min-w-[700px] pointer-events-none">
                   <OfficialPrintLayout testState={previousFailedTest} />
                 </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. Provdetaljer Configuration sections (Bento setup card) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left Side: Provtyp, fordons växellåda */}
        <div className="md:col-span-8 space-y-6">
          <Card className="border border-gray-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden">
            <CardContent className="p-5 sm:p-7 space-y-6">
              
              {/* Test Type Interactive Buttons Selector */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-gray-500 dark:text-zinc-400 tracking-wide uppercase flex items-center gap-1.5">
                  <Sliders size={13} className="text-red-500" /> Provtyp och Bedömningsprofil
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { id: 'Förstaprov', label: 'Förstaprov', desc: 'Ny prövning med fullständigt prov' },
                    { id: 'Omprov', label: 'Omprov', desc: 'Fullständigt omprov av alla delar' },
                    { id: 'Omprov säkerhetskontroll', label: 'Omprov säkerhetskontroll', desc: 'Komplettering av säkerhetsmoment' },
                    { id: 'Omprov körning', label: 'Omprov körning', desc: 'Endast trafikbedömning' },
                    { id: 'Bedömningsprov', label: 'Bedömningsprov', desc: 'Pedagogisk bedömning – Ingen behörighet uppnås vid godkänt' }
                  ].map(type => {
                    const isSelected = state.properties.testType?.includes(type.id);
                    return (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => {
                           let current = state.properties.testType ? state.properties.testType.split(',').map(s => s.trim()).filter(Boolean) : [];
                           // If picking a main type, remove other main types but keep Testprov
                           current = current.filter(id => id === 'Testprov'); 
                           current.push(type.id);
                           updateField('testType', current.join(', '));
                        }}
                        className={`p-3.5 text-left border rounded-xl transition-all cursor-pointer select-none ${
                          isSelected
                            ? 'bg-[#002f6c]/10 border-[#002f6c] dark:bg-blue-600/10 dark:border-blue-500 text-[#002f6c] dark:text-blue-300 ring-2 ring-blue-100 dark:ring-blue-900/20'
                            : 'bg-white dark:bg-zinc-800 hover:border-gray-305 dark:hover:border-zinc-700 border-gray-100 dark:border-zinc-800'
                        }`}
                      >
                        <div className="font-bold text-xs uppercase text-gray-900 dark:text-white flex items-center justify-between">
                          <span>{type.label}</span>
                          {isSelected && <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400"></div>}
                        </div>
                        <p className="text-[10px] sm:text-[11px] text-gray-400 dark:text-zinc-500 mt-1">{type.desc}</p>
                      </button>
                    );
                  })}
                </div>
                
                {/* Testprov Flagga */}
                <label className={`mt-2 p-3.5 flex items-start gap-3 border rounded-xl transition-all cursor-pointer select-none ${
                    state.properties.testType?.includes('Testprov') 
                    ? 'bg-purple-50/50 border-purple-300 dark:bg-purple-900/20 dark:border-purple-700 ring-2 ring-purple-100 dark:ring-purple-900/40' 
                    : 'bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 hover:border-gray-300 dark:hover:border-zinc-600'
                }`}>
                  <div className="pt-0.5">
                    <input 
                      type="checkbox" 
                      className="w-4.5 h-4.5 accent-purple-600 rounded cursor-pointer" 
                      checked={state.properties.testType?.includes('Testprov') || false}
                      onChange={(e) => {
                         let current = state.properties.testType ? state.properties.testType.split(',').map(s => s.trim()).filter(Boolean) : [];
                         if (e.target.checked) {
                            if (!current.includes('Testprov')) current.push('Testprov');
                         } else {
                            current = current.filter(id => id !== 'Testprov');
                         }
                         updateField('testType', current.join(', '));
                      }}
                    />
                  </div>
                  <div>
                    <div className="font-bold text-xs uppercase text-gray-900 dark:text-white">
                      Testprov (Särskild Flagga)
                    </div>
                    <p className="text-[10px] sm:text-[11px] text-gray-500 dark:text-zinc-400 mt-0.5">
                      Om aktiverad registreras detta som ett "Testprov". Ingen behörighet uppnås även vid godkänt resultat, men provet bedöms som vanligt.
                    </p>
                  </div>
                </label>
              </div>

              {/* Equipment and Vehicles settings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 dark:text-zinc-400 tracking-wide uppercase">Växellåda / Transmission</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => updateField('transmission', 'Manuell')}
                      className={`flex-1 h-11 text-xs font-bold border transition-all rounded-xl select-none cursor-pointer ${
                        state.properties.transmission !== 'Automat'
                          ? 'bg-[#002f6c] dark:bg-blue-600 text-white border-[#002f6c] dark:border-blue-500 shadow-sm'
                          : 'bg-white dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 border-gray-200 dark:border-zinc-700 hover:bg-gray-100'
                      }`}
                    >
                      Manuell Växel
                    </button>
                    <button
                      type="button"
                      onClick={() => updateField('transmission', 'Automat')}
                      className={`flex-1 h-11 text-xs font-bold border transition-all rounded-xl select-none cursor-pointer ${
                        state.properties.transmission === 'Automat'
                          ? 'bg-[#002f6c] dark:bg-blue-600 text-white border-[#002f6c] dark:border-blue-500 shadow-sm'
                          : 'bg-white dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 border-gray-200 dark:border-zinc-700 hover:bg-gray-100'
                      }`}
                    >
                      Automat (Villkor 78)
                    </button>
                  </div>

                  {['C', 'C1', 'CE', 'C1E', 'D', 'D1', 'DE', 'D1E'].includes(state.properties.licenseType || '') && (
                    <div className="pt-2 animate-in fade-in duration-200">
                      <label className="text-[11px] font-bold text-gray-500 dark:text-zinc-400 tracking-wide uppercase block mb-1.5">Färdskrivare (Tunga fordon)</label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => updateField('tachograph' as any, 'Med färdskrivare')}
                          className={`flex-1 h-9 text-xs font-bold border transition-all rounded-xl select-none cursor-pointer ${
                            (state.properties.tachograph || 'Med färdskrivare') !== 'Utan färdskrivare'
                              ? 'bg-[#002f6c] dark:bg-blue-600 text-white border-[#002f6c] dark:border-blue-500 shadow-sm font-black'
                              : 'bg-white dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 border-gray-200 dark:border-zinc-700 hover:bg-gray-100'
                          }`}
                        >
                          Med färdskrivare
                        </button>
                        <button
                          type="button"
                          onClick={() => updateField('tachograph' as any, 'Utan färdskrivare')}
                          className={`flex-1 h-9 text-xs font-bold border transition-all rounded-xl select-none cursor-pointer ${
                            state.properties.tachograph === 'Utan färdskrivare'
                              ? 'bg-[#c40000] text-white border-[#c40000] shadow-sm font-black'
                              : 'bg-white dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 border-gray-200 dark:border-zinc-700 hover:bg-gray-100'
                          }`}
                        >
                          Utan färdskrivare
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 dark:text-zinc-400 tracking-wide uppercase">Provförrättare & Datum</label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="px-3 py-2 bg-gray-50 dark:bg-zinc-850 border border-gray-100 dark:border-zinc-800 rounded-lg text-xs font-semibold text-gray-500 select-none">
                      <span className="block text-[8px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest">Signerare</span>
                      <span className="text-gray-700 dark:text-zinc-300 truncate block mt-0.5">{state.properties.examiner || 'Examiner'}</span>
                    </div>
                    <div className="px-3 py-2 bg-gray-50 dark:bg-zinc-850 border border-gray-100 dark:border-zinc-800 rounded-lg text-xs font-semibold text-gray-500 select-none">
                      <span className="block text-[8px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest">Datum</span>
                      <span className="text-gray-700 dark:text-zinc-300 block mt-0.5">{state.properties.testDate || 'Datum'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Special options & Interpreter */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 border-t border-gray-100 dark:border-zinc-800">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 dark:text-zinc-400 tracking-wide uppercase flex items-center gap-1.5">
                    <Lock size={12} className="text-gray-400" /> Särskilda myndighetsvillkor
                  </label>
                  <div className="flex flex-col gap-2 p-3 bg-gray-50 dark:bg-zinc-850 border border-gray-150 dark:border-zinc-800 rounded-xl">
                    {['Medicinska villkor 69 (Alkolås)', 'Handikappanpassning (Klass 78+)'].map(condition => (
                      <label key={condition} className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          className="w-4 h-4 accent-red-600 rounded"
                          checked={(state.properties.specialConditions || []).includes(condition)}
                          onChange={(e) => updateState(prev => {
                            const current = prev.properties.specialConditions || [];
                            return {
                              ...prev,
                              properties: {
                                ...prev.properties,
                                specialConditions: e.target.checked ? [...current, condition] : current.filter(c => c !== condition),
                              },
                            };
                          })}
                        />
                        <span className="text-xs font-semibold text-gray-700 dark:text-zinc-300 group-hover:text-black dark:group-hover:text-white">{condition}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 dark:text-zinc-400 tracking-wide uppercase flex items-center gap-1.5">
                    <Globe2 size={12} className="text-blue-500" /> Tolk & Språkhjälp
                  </label>
                  <div className="flex flex-col gap-2 p-3 bg-gray-50 dark:bg-zinc-850 border border-gray-150 dark:border-zinc-800 rounded-xl h-[80px] justify-center">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        className="w-4 h-4 accent-red-600 rounded"
                        checked={Boolean(state.properties.interpreterPresent)}
                        onChange={(e) => updateState(prev => ({ ...prev, properties: { ...prev.properties, interpreterPresent: e.target.checked } }))}
                      />
                      <span className="text-xs font-semibold text-gray-700 dark:text-zinc-300 group-hover:text-black dark:group-hover:text-white">Tolk medverkar under provet</span>
                    </label>
                    <input
                      type="text"
                      value={state.properties.interpreterLanguage || ''}
                      onChange={(e) => updateState(prev => ({ ...prev, properties: { ...prev.properties, interpreterLanguage: e.target.value } }))}
                      placeholder="Språk (frivilligt)"
                      className="w-full text-xs border-b border-gray-200 dark:border-zinc-700 focus:border-red-600 dark:focus:border-red-500 focus:outline-none bg-transparent pb-0.5 dark:text-white" 
                    />
                  </div>
                </div>
              </div>

            </CardContent>
          </Card>
        </div>

        {/* Right Side Info Box: Active testing subclass details (license subclass specifications) */}
        <div className="md:col-span-4 space-y-6">
          
          <Card className="border border-gray-200 dark:border-zinc-800 bg-gradient-to-br from-blue-50/20 to-indigo-50/10 dark:from-zinc-900 dark:to-zinc-900 rounded-2xl shadow-sm text-gray-800 dark:text-zinc-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 bg-blue-500/5 dark:bg-blue-400/5 rounded-full blur-xl pointer-events-none"></div>
            <CardContent className="p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between text-[#002f6c] dark:text-blue-400">
                <div className="flex items-center gap-2">
                  <Award size={18} />
                  <h4 className="font-extrabold text-xs uppercase tracking-wider">Klasspecifikation</h4>
                </div>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
                  {state.properties.licenseType || 'B'}
                </span>
              </div>

              {/* License Class Picker Dropdown */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-gray-500 dark:text-zinc-400 tracking-wider">Välj behörighetsklass:</label>
                <div className="relative">
                  <select
                    value={state.properties.licenseType || 'B'}
                    onChange={(e) => updateField('licenseType', e.target.value)}
                    className="w-full appearance-none bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-800 dark:text-zinc-200 text-sm font-bold rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-sm cursor-pointer"
                  >
                    {licenseTypes.map((lic) => (
                      <option key={lic} value={lic}>{lic}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-500">
                    ▼
                  </div>
                </div>
              </div>

              <div className="space-y-2.5 pt-3 border-t border-gray-100 dark:border-zinc-800 text-xs">
                <div className="flex justify-between items-center text-gray-500">
                  <span>Totalt inlagda moment:</span>
                  <strong className="font-bold text-gray-800 dark:text-white">{totalMoments} st</strong>
                </div>
                <div className="flex justify-between items-center text-gray-500">
                  <span>Valda för prövning:</span>
                  <strong className="font-bold text-red-600 dark:text-red-400">{state.includedTestItems?.length || 0} st</strong>
                </div>
              </div>

              <div className="p-3 bg-white dark:bg-zinc-850 rounded-xl border border-gray-150 dark:border-zinc-800 space-y-2 mt-4">
                <div className="flex items-center gap-1 text-[11px] font-bold text-[#002f6c] dark:text-blue-400">
                  <Info size={12} />
                  <span>Automatisk profil</span>
                </div>
                <p className="text-[10px] text-gray-500 dark:text-zinc-400 leading-normal">
                  När provet startas laddas automatiskt branschstandardiserade moment baserat på lagstiftningen för {state.properties.licenseType || 'B'}-behörighet. De underkända provdelarna markeras automatiskt vid körprovet.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Stepper info */}
          <div className="p-5 border border-dashed border-gray-200 dark:border-zinc-850 rounded-2xl flex items-start gap-3">
            <CheckCircle className="text-emerald-500 shrink-0 mt-0.5" size={16} />
            <div>
              <h5 className="font-bold text-xs text-gray-800 dark:text-zinc-300">Nästa Steg: Inledning</h5>
              <p className="text-[11px] text-gray-500 dark:text-zinc-500 mt-1 leading-normal">
                Efter att du sparat dessa grundläggande egenskaper fortsätter du till den lagstadgade inledande checklistan (identitetsverifiering & provinstruktioner) tillsammans med kandidaten.
              </p>
            </div>
          </div>

        </div>

      </div>

      {/* 4. Large Action Area Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-10 mt-10 border-t border-gray-200 dark:border-zinc-800">
        <button 
          onClick={handleBack} 
          className="w-full sm:w-auto h-12 px-6 font-bold text-xs text-gray-500 dark:text-zinc-400 hover:text-[#002f6c] dark:hover:text-blue-400 transition-colors bg-transparent border-0 flex items-center justify-center gap-1"
        >
          <span>← Tillbaka till Mottagning</span>
        </button>
        
        <button 
          id="btn-goto-inledning"
          onClick={handleNext} 
          className="w-full sm:w-auto h-12 px-8 bg-[#002f6c] hover:bg-[#00204a] dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-bold text-sm tracking-wide transition-all shadow-md flex items-center justify-center gap-1.5 rounded-xl cursor-pointer select-none"
        >
          <span>Fortsätt till Inledning</span>
          <ChevronRight size={16} />
        </button>
      </div>

    </div>
  );
}
