import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/ProvContext';
import { Plus, X, Clock, User, FileText, ChevronRight, CheckCircle2 } from 'lucide-react';

export function DagensProvScreen() {
  const navigate = useNavigate();
  const { updateState } = useAppStore();
  
  const [testList, setTestList] = useState([
    { time: '08:30', name: 'Elvira Strömqvist', id: '19700613-1234', auth: 'B', lang: 'Svenska', status: 'Pågående', statusColor: 'text-blue-600', bgStatus: 'bg-blue-50', inspector: 'Rasmus Lundin', active: true },
    { time: '09:15', name: 'Mikael Andersson', id: '19881020-4321', auth: 'CE', lang: 'Svenska', status: 'Väntar', statusColor: 'text-gray-500', bgStatus: 'bg-white', inspector: 'Rasmus Lundin', active: true },
    { time: '10:00', name: 'Fatima Al-Sayed', id: '19950314-5566', auth: 'D', lang: 'Svenska', status: 'Väntar', statusColor: 'text-gray-500', bgStatus: 'bg-white', inspector: 'Rasmus Lundin', active: true },
    { time: '11:15', name: 'Johan Lundin', id: '19920512-7788', auth: 'TAXI', lang: 'Svenska', status: 'Väntar', statusColor: 'text-gray-500', bgStatus: 'bg-white', inspector: 'Rasmus Lundin', active: true },
    { time: '13:00', name: 'Sara Petrovic', id: '20010830-1122', auth: 'A', lang: 'Engelska', status: 'Väntar', statusColor: 'text-gray-500', bgStatus: 'bg-white', inspector: 'Rasmus Lundin', active: true },
    { time: '14:30', name: 'Lars Olofsson', id: '19751101-9900', auth: 'BE', lang: 'Svenska', status: 'Väntar', statusColor: 'text-gray-500', bgStatus: 'bg-white', inspector: 'Rasmus Lundin', active: true },
    { time: '15:15', name: 'Anna Bergström', id: '19991224-3344', auth: 'C', lang: 'Svenska', status: 'Väntar', statusColor: 'text-gray-500', bgStatus: 'bg-white', inspector: 'Rasmus Lundin', active: true },
  ]);

  const [activeTab, setActiveTab] = useState<'aktiva' | 'avslutade' | 'ej_genomforda'>('aktiva');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: '', id: '', auth: 'B', lang: 'Svenska' });

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.name || !newStudent.id) return;
    
    const now = new Date();
    const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    setTestList(prev => [
      ...prev,
      {
        time: timeString,
        name: newStudent.name,
        id: newStudent.id,
        auth: newStudent.auth,
        lang: newStudent.lang,
        status: 'Väntar',
        statusColor: 'text-gray-500',
        bgStatus: 'bg-white',
        inspector: 'Rasmus Lundin',
        active: true
      }
    ]);

    setNewStudent({ name: '', id: '', auth: 'B', lang: 'Svenska' });
    setShowAddModal(false);
  };

  const handleSelectTest = (test: typeof testList[0]) => {
    if (!test.active) return;
    
    // Generate clean email without Swedish special characters
    const cleanNameParts = test.name.toLowerCase()
      .replace(/å/g, 'a')
      .replace(/ä/g, 'a')
      .replace(/ö/g, 'o')
      .split(' ');
    const email = `${cleanNameParts[0]}.${cleanNameParts[1] || 'student'}@exempel.se`;

    updateState((prev) => ({
      ...prev,
      properties: {
        studentName: test.name,
        personalNumber: test.id,
        email: email,
        examiner: test.inspector,
        testDate: '2026-05-19',
        testType: 'Körprov',
        licenseType: test.auth
      },
      checklist: {
        identityChecked: false,
        studentInformed: false,
        licenseTypeCorrect: false,
        vehicleCorrect: false,
        questionsAnswered: false
      },
      includedTestItems: [],
      result: {
        drivingResult: null,
        safetyCheckResult: null,
        interventionOccurred: false,
        testAborted: false,
        drivingFailure: {
          primaryCause: { area: '', deficiencies: [] },
          consequences: [],
          situations: [],
          interventionOccurred: false,
          testAborted: false
        },
        safetyCheckFailure: {
          primaryCause: { area: '', deficiencies: [] },
          consequences: [],
          situations: [],
          interventionOccurred: false,
          testAborted: false
        }
      },
      testStartTime: null,
      testNotes: ''
    }));
    navigate('/korprov/start');
  };

  const filteredTests = testList.filter(t => {
    if (activeTab === 'aktiva') return t.active;
    if (activeTab === 'avslutade') return t.status === 'Avslutad';
    if (activeTab === 'ej_genomforda') return !t.active && t.status !== 'Avslutad';
    return true;
  });

  return (
    <div className="w-full h-full flex flex-col pt-2 pb-24 md:pb-6 px-4 md:px-6 max-w-5xl mx-auto">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 mt-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#002f6c] dark:text-blue-400">PROVSCHEMA • PROVPROTOKOLL</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight mt-0.5">Dagens prov</h1>
          <p className="text-gray-500 dark:text-zinc-400 font-medium text-sm mt-1">
            Välj ett prov direkt från schemat eller starta ett nytt prov och fyll i elevuppgifter.
          </p>
        </div>
        
        <div className="flex items-center gap-3 flex-wrap">
          <button 
            onClick={() => {
              // Quick reset to a fresh blank test for manual input
              updateState((prev) => ({
                ...prev,
                properties: {
                  studentName: '',
                  personalNumber: '',
                  email: '',
                  examiner: prev.properties.examiner,
                  testDate: new Date().toISOString().split('T')[0],
                  testType: 'Förstaprov',
                  licenseType: 'B',
                  transmission: 'Manuell'
                },
                checklist: {
                  identityChecked: false,
                  studentInformed: false,
                  licenseTypeCorrect: false,
                  vehicleCorrect: false,
                  questionsAnswered: false
                },
                includedTestItems: [],
                result: {
                  drivingResult: null,
                  safetyCheckResult: null,
                  interventionOccurred: false,
                  testAborted: false,
                  drivingFailure: { primaryCause: { area: '', deficiencies: [] }, consequences: [], situations: [], interventionOccurred: false, testAborted: false },
                  safetyCheckFailure: { primaryCause: { area: '', deficiencies: [] }, consequences: [], situations: [], interventionOccurred: false, testAborted: false }
                }
              }));
              navigate('/korprov/start');
            }}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5 bg-white dark:bg-zinc-800/90 text-gray-700 dark:text-zinc-100 border border-gray-200/90 dark:border-zinc-700 text-xs sm:text-sm font-bold uppercase tracking-wider rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-700 transition-all shadow-xs hover:shadow-sm active:scale-98 cursor-pointer"
          >
            <FileText className="w-4 h-4 text-[#002f6c] dark:text-blue-400" />
            <span>Nytt tomt prov</span>
          </button>

          <button 
            onClick={() => setShowAddModal(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 sm:py-2.5 bg-[#002f6c] hover:bg-[#002353] dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-xs sm:text-sm font-black uppercase tracking-wider rounded-xl transition-all shadow-md shadow-blue-950/20 active:scale-98 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Lägg till i schema</span>
          </button>
        </div>
      </div>

      {/* QUICK SELECTOR: VÄLJ PROVTYP / BEHÖRIGHET DIREKT */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-200/90 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 mb-6 shadow-xs hover:border-gray-300 dark:hover:border-zinc-700 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3.5">
          <span className="text-[11px] font-black uppercase tracking-widest text-gray-500 dark:text-zinc-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#002f6c] dark:bg-blue-400"></span>
            Snabbval: Starta valfritt prov direkt
          </span>
          <span className="text-xs text-gray-400 dark:text-zinc-500 font-medium">
            Klicka för att välja behörighet och mata in elevuppgifter
          </span>
        </div>
        
        <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-11 gap-2.5">
          {[
            { lic: 'B', name: 'Personbil' },
            { lic: 'BE', name: 'Släp' },
            { lic: 'B96', name: 'Utökad B' },
            { lic: 'C', name: 'Tung lastbil' },
            { lic: 'CE', name: 'Släp lastbil' },
            { lic: 'C1', name: 'Mellanlast' },
            { lic: 'D', name: 'Buss' },
            { lic: 'DE', name: 'Släp buss' },
            { lic: 'A', name: 'MC' },
            { lic: 'AM', name: 'Moped' },
            { lic: 'TAXI', name: 'Taxi' },
          ].map(({ lic, name }) => (
            <button
              key={lic}
              onClick={() => {
                updateState((prev) => ({
                  ...prev,
                  properties: {
                    ...prev.properties,
                    licenseType: lic,
                    studentName: '',
                    personalNumber: '',
                    email: '',
                    testDate: new Date().toISOString().split('T')[0],
                    testType: 'Körprov',
                    transmission: 'Manuell'
                  },
                  checklist: {
                    identityChecked: false,
                    studentInformed: false,
                    licenseTypeCorrect: false,
                    vehicleCorrect: false,
                    questionsAnswered: false
                  },
                  includedTestItems: [],
                  result: {
                    drivingResult: null,
                    safetyCheckResult: null,
                    interventionOccurred: false,
                    testAborted: false,
                    drivingFailure: { primaryCause: { area: '', deficiencies: [] }, consequences: [], situations: [], interventionOccurred: false, testAborted: false },
                    safetyCheckFailure: { primaryCause: { area: '', deficiencies: [] }, consequences: [], situations: [], interventionOccurred: false, testAborted: false }
                  }
                }));
                navigate('/korprov/start');
              }}
              className="flex flex-col items-center justify-center p-2.5 sm:py-3 rounded-xl border border-gray-200/90 dark:border-zinc-800 bg-gray-50/80 dark:bg-zinc-850 hover:bg-[#002f6c] hover:text-white dark:hover:bg-blue-600 hover:border-transparent transition-all duration-150 group cursor-pointer shadow-2xs hover:shadow-md active:scale-95"
            >
              <span className="text-base sm:text-lg font-black text-gray-900 dark:text-white group-hover:text-white transition-colors">
                {lic}
              </span>
              <span className="text-[10px] font-semibold text-gray-500 dark:text-zinc-400 group-hover:text-white/90 transition-colors truncate max-w-full">
                {name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* TABS */}
      <div className="flex bg-gray-200/80 dark:bg-zinc-800/80 p-1 rounded-xl mb-6 self-start w-full sm:w-auto overflow-x-auto hide-scrollbar border border-gray-200 dark:border-zinc-700/50">
        <button 
          onClick={() => setActiveTab('aktiva')}
          className={`flex-1 sm:flex-none px-5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${activeTab === 'aktiva' ? 'bg-white dark:bg-zinc-900 text-gray-900 dark:text-white shadow-xs' : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white'}`}
        >
          Aktiva ({testList.filter(t => t.active).length})
        </button>
        <button 
          onClick={() => setActiveTab('avslutade')}
          className={`flex-1 sm:flex-none px-5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${activeTab === 'avslutade' ? 'bg-white dark:bg-zinc-900 text-gray-900 dark:text-white shadow-xs' : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white'}`}
        >
          Avslutade (0)
        </button>
        <button 
          onClick={() => setActiveTab('ej_genomforda')}
          className={`flex-1 sm:flex-none px-5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${activeTab === 'ej_genomforda' ? 'bg-white dark:bg-zinc-900 text-gray-900 dark:text-white shadow-xs' : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white'}`}
        >
          Ej genomförda (0)
        </button>
      </div>

      {/* STUDENT CARDS LIST */}
      <div className="flex flex-col gap-3 md:gap-4 flex-1">
        {filteredTests.map((test, i) => {
          // Color coding for license type badges
          const getAuthStyle = (auth: string) => {
            if (['CE', 'C', 'C1', 'C1E'].includes(auth)) return 'bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300/50';
            if (['DE', 'D', 'D1', 'D1E'].includes(auth)) return 'bg-rose-100 text-rose-900 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300/50';
            if (['A', 'A1', 'A2', 'AM'].includes(auth)) return 'bg-purple-100 text-purple-900 dark:bg-purple-950/60 dark:text-purple-300 border-purple-300/50';
            if (auth === 'TAXI') return 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300/50';
            return 'bg-blue-100 text-blue-900 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300/50';
          };

          return (
            <div 
              key={i} 
              onClick={() => handleSelectTest(test)}
              className={`relative group flex flex-col sm:flex-row sm:items-center justify-between p-4 md:p-5 rounded-2xl border transition-all ${
                test.active 
                  ? 'cursor-pointer border-gray-200 dark:border-zinc-800 hover:border-[#002f6c] dark:hover:border-blue-500 hover:shadow-md bg-white dark:bg-zinc-900/90' 
                  : 'opacity-70 bg-gray-50 dark:bg-zinc-900/40 border-gray-200 dark:border-zinc-800'
              }`}
            >
              <div className="flex items-start sm:items-center gap-4">
                <div className="bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 font-bold px-3.5 py-2.5 rounded-xl text-center min-w-[72px] border border-gray-200/60 dark:border-zinc-700/50 shrink-0">
                  <Clock className="w-4 h-4 mx-auto mb-1 text-slate-500 dark:text-zinc-400" />
                  <span className="text-sm font-mono font-black">{test.time}</span>
                </div>
                
                <div className="flex flex-col min-w-0">
                  <h3 className="text-base md:text-lg font-bold text-gray-900 dark:text-white group-hover:text-[#002f6c] dark:group-hover:text-blue-400 transition-colors truncate">
                    {test.name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs md:text-sm text-gray-600 dark:text-zinc-400 font-medium">
                    <span className="flex items-center gap-1 font-mono text-gray-700 dark:text-zinc-300">
                      <User className="w-3.5 h-3.5 text-gray-400" /> {test.id}
                    </span>
                    <span className="hidden sm:inline text-gray-300 dark:text-zinc-700">•</span>
                    <span className={`px-2 py-0.5 rounded-md font-bold text-xs border ${getAuthStyle(test.auth)}`}>
                      {test.auth}
                    </span>
                    <span className="hidden sm:inline text-gray-300 dark:text-zinc-700">•</span>
                    <span className="text-gray-500 dark:text-zinc-400">{test.lang}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 sm:mt-0 sm:pl-4 border-t sm:border-t-0 sm:border-l border-gray-100 dark:border-zinc-800 pt-4 sm:pt-0 gap-3">
                <div className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider ${
                  test.status === 'Pågående' 
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800' 
                    : 'bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 border border-transparent'
                }`}>
                  {test.status}
                </div>
                
                {test.active && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectTest(test);
                      }}
                      className="px-4 py-2.5 bg-[#002f6c] dark:bg-blue-600 hover:bg-[#001f48] dark:hover:bg-blue-500 text-white text-xs font-black uppercase tracking-wider rounded-xl flex items-center gap-2 shadow-xs hover:shadow-md transition-all active:scale-95 cursor-pointer"
                    >
                      <span>Välj och starta</span>
                      <ChevronRight className="w-4 h-4 stroke-[3]" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        
        {filteredTests.length === 0 && (
          <div className="text-center py-12 px-4 bg-gray-50 dark:bg-zinc-900/50 rounded-2xl border border-gray-200 dark:border-zinc-800 border-dashed">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Inga prov i denna vy</h3>
            <p className="text-gray-500 dark:text-zinc-400 text-sm">Listan är tom för tillfället.</p>
          </div>
        )}
      </div>

      {/* FOOTER INFO */}
      <div className="flex flex-col sm:flex-row justify-between items-center mt-8 pt-6 border-t border-gray-200 dark:border-zinc-800 text-xs text-gray-500 dark:text-zinc-400 font-mono gap-2">
        <div>PROV-ID: <span className="font-bold text-gray-800 dark:text-zinc-200">2026-05-19-0013</span></div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          Automatisk synkronisering aktiv (Senast 09:24)
        </div>
      </div>

      {/* ADD STUDENT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm sm:px-4">
          <div className="bg-white dark:bg-zinc-900 w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden animate-slide-up sm:animate-fade-in flex flex-col max-h-[90vh] border border-gray-200 dark:border-zinc-800">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 sticky top-0 z-10">
              <h2 className="text-xl font-black text-gray-900 dark:text-white">Lägg till elev</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 hover:bg-gray-200 dark:hover:bg-zinc-700 p-2 min-w-10 min-h-10 flex items-center justify-center rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddStudent} className="p-6 flex flex-col gap-5 overflow-y-auto">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-widest mb-1.5">
                  Elevens fullständiga namn
                </label>
                <input 
                  type="text" 
                  required
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
                  className="w-full px-4 py-3.5 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:bg-white dark:focus:bg-zinc-900 focus:ring-2 focus:ring-[#002f6c] dark:focus:ring-blue-500 text-gray-900 dark:text-white text-[15px] font-medium transition-all"
                  placeholder="t.ex. Anna Svensson"
                />
              </div>
              
              <div>
                <label className="block text-[11px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-widest mb-1.5">
                  Personnummer
                </label>
                <input 
                  type="text" 
                  required
                  value={newStudent.id}
                  onChange={(e) => setNewStudent({...newStudent, id: e.target.value})}
                  className="w-full px-4 py-3.5 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:bg-white dark:focus:bg-zinc-900 focus:ring-2 focus:ring-[#002f6c] dark:focus:ring-blue-500 text-gray-900 dark:text-white text-[15px] font-mono font-medium transition-all"
                  placeholder="ÅÅÅÅMMDD-XXXX"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-widest mb-1.5">
                    Behörighet
                  </label>
                  <select
                    value={newStudent.auth}
                    onChange={(e) => setNewStudent({...newStudent, auth: e.target.value})}
                    className="w-full px-4 py-3.5 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:bg-white dark:focus:bg-zinc-900 focus:ring-2 focus:ring-[#002f6c] dark:focus:ring-blue-500 text-gray-900 dark:text-white text-[15px] font-medium appearance-none transition-all"
                  >
                    <option value="AM">AM</option>
                    <option value="A1">A1</option>
                    <option value="A2">A2</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="BE">BE</option>
                    <option value="C1">C1</option>
                    <option value="C1E">C1E</option>
                    <option value="C">C</option>
                    <option value="CE">CE</option>
                    <option value="D1">D1</option>
                    <option value="D1E">D1E</option>
                    <option value="D">D</option>
                    <option value="DE">DE</option>
                    <option value="TAXI">TAXI</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-widest mb-1.5">
                    Provets Språk
                  </label>
                  <select
                    value={newStudent.lang}
                    onChange={(e) => setNewStudent({...newStudent, lang: e.target.value})}
                    className="w-full px-4 py-3.5 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:bg-white dark:focus:bg-zinc-900 focus:ring-2 focus:ring-[#002f6c] dark:focus:ring-blue-500 text-gray-900 dark:text-white text-[15px] font-medium appearance-none transition-all"
                  >
                    <option value="Svenska">Svenska</option>
                    <option value="Engelska">Engelska</option>
                    <option value="Annat (Tolk)">Annat (Tolk)</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100 dark:border-zinc-800 flex gap-3 pb-safe">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-4 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 font-bold text-[13px] rounded-xl hover:bg-gray-200 dark:hover:bg-zinc-700 uppercase tracking-wider transition-colors cursor-pointer active:scale-[0.98]"
                >
                  Avbryt
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-4 bg-[#002f6c] dark:bg-blue-600 text-white font-bold text-[13px] rounded-xl hover:bg-[#001d4a] dark:hover:bg-blue-500 uppercase tracking-wider transition-colors shadow-md cursor-pointer active:scale-[0.98]"
                >
                  Spara och lägg till
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
