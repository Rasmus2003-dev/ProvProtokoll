import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, Users, Calendar, Clock, Plus, CheckCircle2, 
  Search, BookOpen, Award, FileText, ChevronRight, AlertCircle, 
  Trash2, UserCheck, ShieldCheck, Check, Smartphone, CheckSquare,
  Sparkles, Download, Layers, Printer, Eye, Building2, Car, Edit3, Mail
} from 'lucide-react';
import { EmailComposerModal, EmailComposerInitialData } from '../components/EmailComposerModal';
import { 
  TrafikskolaProfile, 
  LektionsProtokoll, 
  getTrafikskolaProfile, 
  saveTrafikskolaProfile, 
  getLektionsProtokollList, 
  saveLektionsProtokoll, 
  deleteLektionsProtokoll,
  DEFAULT_TRAFIKSKOLA
} from '../lib/trafikskolaData';
import { LektionsProtokollDocument } from '../components/trafikskola/LektionsProtokollDocument';
import { SkapaLektionsProtokollModal } from '../components/trafikskola/SkapaLektionsProtokollModal';
import { useToast } from '../components/Toast';
import { triggerHaptic } from '../lib/utils';

export interface UtbildningsPlanStep {
  id: string;
  moment: number;
  title: string;
  category: 'Körställning' | 'Manövrering' | 'Trafikmiljö' | 'Landsväg' | 'Självständig körning';
  description: string;
  status: 'Ej påbörjad' | 'Övad' | 'Klar';
  notes?: string;
}

export interface StudentProfile {
  id: string;
  name: string;
  personalNumber: string;
  phone: string;
  licenseType: string;
  transmission: string;
  startDate: string;
  totalLessons: number;
  theoryStatus: 'Ej klar' | 'Godkänd' | 'Pågående';
  risk1: boolean;
  risk2: boolean;
  teacher: string;
  curriculum: UtbildningsPlanStep[];
}

export const DEFAULT_CURRICULUM: UtbildningsPlanStep[] = [
  { id: 'm1', moment: 1, title: 'Körställning & Reglage', category: 'Körställning', description: 'Stol, ratt, bälte, speglar, döda vinkeln och startrutin.', status: 'Klar' },
  { id: 'm2', moment: 2, title: 'Koppling, Gas & Broms (Krypkörning)', category: 'Manövrering', description: 'Dragläge, mjuk acceleration och precisionsstopp.', status: 'Klar' },
  { id: 'm3', moment: 3, title: 'Växling & Ecodriving', category: 'Manövrering', description: 'Uppväxling, nedväxling, motorbroms och hoppväxling.', status: 'Klar' },
  { id: 'm4', moment: 4, title: 'Manövrering: Backning & Parkering', category: 'Manövrering', description: 'Backning runt hörn, fickparkering och lutningsstart.', status: 'Övad' },
  { id: 'm5', moment: 5, title: 'Säkerhetskontroll (Inre & Yttre)', category: 'Körställning', description: 'Belysning, däck, vätskor, bromsservo och styrservo.', status: 'Övad' },
  { id: 'm6', moment: 6, title: 'Mindre bostadsområden & Högerregeln', category: 'Trafikmiljö', description: 'Avsökning, samspel med oskyddade trafikanter och väjningsplikt.', status: 'Övad' },
  { id: 'm7', moment: 7, title: 'Trafikljus & Cirkulationsplatser', category: 'Trafikmiljö', description: 'Placering, blinkersrutiner och filbyten.', status: 'Ej påbörjad' },
  { id: 'm8', moment: 8, title: 'Landsväg, Omkörning & Järnväg', category: 'Landsväg', description: 'Fartbedömning, mötesrutiner, viltfara och plankorsningar.', status: 'Ej påbörjad' },
  { id: 'm9', moment: 9, title: 'Motorväg & Motortrafikled', category: 'Landsväg', description: 'Påfart, avfart, säkerhetsavstånd och tresekundersregeln.', status: 'Ej påbörjad' },
  { id: 'm10', moment: 10, title: 'Mörkerkörning & Halkbana (Risk 2)', category: 'Landsväg', description: 'Helljusbruk, bländningsrisk och förståelse för friktion.', status: 'Ej påbörjad' },
  { id: 'm11', moment: 11, title: 'Självständig körning mot mål (Provförberedelse)', category: 'Självständig körning', description: 'Körning efter skyltar och instruktioner i okänd stadsmiljö.', status: 'Ej påbörjad' },
  { id: 'm12', moment: 12, title: 'Utbildningskontroll / Provsimulering', category: 'Självständig körning', description: 'Komplett 45-minuters körprovssimulering med betygsprotokoll.', status: 'Ej påbörjad' },
];

const DEFAULT_SAMPLE_STUDENTS: StudentProfile[] = [
  {
    id: 'elev-emma',
    name: 'Emma Lindqvist',
    personalNumber: '20040512-1422',
    phone: '070-512 88 19',
    licenseType: 'B',
    transmission: 'Manuell',
    startDate: '2026-08-10',
    totalLessons: 8,
    theoryStatus: 'Godkänd',
    risk1: true,
    risk2: true,
    teacher: 'Rasmus Lundin',
    curriculum: DEFAULT_CURRICULUM.map(m => {
      if (m.moment <= 3) return { ...m, status: 'Klar' };
      if (m.moment <= 7) return { ...m, status: 'Övad' };
      return { ...m, status: 'Ej påbörjad' };
    })
  },
  {
    id: 'elev-lucas',
    name: 'Lucas Bergström',
    personalNumber: '20050819-3891',
    phone: '073-891 22 40',
    licenseType: 'B',
    transmission: 'Automat',
    startDate: '2026-09-01',
    totalLessons: 3,
    theoryStatus: 'Pågående',
    risk1: true,
    risk2: false,
    teacher: 'Rasmus Lundin',
    curriculum: DEFAULT_CURRICULUM.map(m => {
      if (m.moment <= 2) return { ...m, status: 'Klar' };
      if (m.moment <= 5) return { ...m, status: 'Övad' };
      return { ...m, status: 'Ej påbörjad' };
    })
  },
  {
    id: 'elev-sofia',
    name: 'Sofia Al-Mansoor',
    personalNumber: '20031104-5820',
    phone: '072-401 99 33',
    licenseType: 'B',
    transmission: 'Manuell',
    startDate: '2026-06-15',
    totalLessons: 12,
    theoryStatus: 'Godkänd',
    risk1: true,
    risk2: true,
    teacher: 'Rasmus Lundin',
    curriculum: DEFAULT_CURRICULUM.map(m => ({ ...m, status: 'Klar' }))
  },
  {
    id: 'elev-ali',
    name: 'Ali Hassan',
    personalNumber: '19980214-7711',
    phone: '076-119 44 88',
    licenseType: 'C',
    transmission: 'Automat',
    startDate: '2026-08-20',
    totalLessons: 6,
    theoryStatus: 'Godkänd',
    risk1: true,
    risk2: true,
    teacher: 'Rasmus Lundin',
    curriculum: DEFAULT_CURRICULUM.map(m => {
      if (m.moment <= 5) return { ...m, status: 'Klar' };
      return { ...m, status: 'Övad' };
    })
  }
];

export function TrafikskolaScreen() {
  const { showToast } = useToast();

  // Active Top Tab
  const [activeTab, setActiveTab] = useState<'elever' | 'protokoll' | 'skolprofil'>('elever');

  // Skola profile
  const [skola, setSkola] = useState<TrafikskolaProfile>(() => getTrafikskolaProfile());

  // Elever
  const [students, setStudents] = useState<StudentProfile[]>(() => {
    const saved = localStorage.getItem('trafikskola_students');
    if (saved) {
      try { 
        const parsed = JSON.parse(saved); 
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (_) {}
    }
    return DEFAULT_SAMPLE_STUDENTS;
  });

  const [activeStudentId, setActiveStudentId] = useState<string>(students[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Lektionsprotokoll state
  const [protocols, setProtocols] = useState<LektionsProtokoll[]>(() => getLektionsProtokollList());
  const [viewingProtocol, setViewingProtocol] = useState<LektionsProtokoll | null>(null);
  const [showCreateProtocolModal, setShowCreateProtocolModal] = useState(false);

  // Email Composer state
  const [showEmailComposer, setShowEmailComposer] = useState(false);
  const [emailComposerData, setEmailComposerData] = useState<EmailComposerInitialData | undefined>(undefined);
  const [protocolFilterStudent, setProtocolFilterStudent] = useState<string>('alla');

  // New Student Form State
  const [newName, setNewName] = useState('');
  const [newPnr, setNewPnr] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newLicense, setNewLicense] = useState('B');
  const [newTrans, setNewTrans] = useState('Manuell');

  useEffect(() => {
    localStorage.setItem('trafikskola_students', JSON.stringify(students));
  }, [students]);

  const activeStudent = students.find(s => s.id === activeStudentId) || students[0];

  const handleStepStatusChange = (stepId: string, status: UtbildningsPlanStep['status']) => {
    if (!activeStudent) return;
    setStudents(prev => prev.map(stud => {
      if (stud.id !== activeStudent.id) return stud;
      return {
        ...stud,
        curriculum: stud.curriculum.map(c => c.id === stepId ? { ...c, status } : c)
      };
    }));
  };

  const handleToggleRisk = (field: 'risk1' | 'risk2') => {
    if (!activeStudent) return;
    setStudents(prev => prev.map(stud => {
      if (stud.id !== activeStudent.id) return stud;
      return { ...stud, [field]: !stud[field] };
    }));
  };

  const handleAddLessonQuick = () => {
    if (!activeStudent) return;
    setStudents(prev => prev.map(stud => {
      if (stud.id !== activeStudent.id) return stud;
      return { ...stud, totalLessons: stud.totalLessons + 1 };
    }));
    showToast(`Registrerade lektion #${activeStudent.totalLessons + 1} för ${activeStudent.name}`, 'success');
  };

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPnr.trim()) return;

    const newStudent: StudentProfile = {
      id: 'elev-' + Date.now(),
      name: newName.trim(),
      personalNumber: newPnr.trim(),
      phone: newPhone.trim() || '070-000 00 00',
      licenseType: newLicense,
      transmission: newTrans,
      startDate: new Date().toISOString().split('T')[0],
      totalLessons: 0,
      theoryStatus: 'Pågående',
      risk1: false,
      risk2: false,
      teacher: skola.utbildningsledare,
      curriculum: DEFAULT_CURRICULUM.map(c => ({ ...c, status: 'Ej påbörjad' }))
    };

    setStudents(prev => [newStudent, ...prev]);
    setActiveStudentId(newStudent.id);
    setShowAddModal(false);
    setNewName('');
    setNewPnr('');
    setNewPhone('');
    showToast(`Elev ${newStudent.name} inskriven!`, 'success');
  };

  const handleProtocolSaved = (newP: LektionsProtokoll) => {
    setProtocols(getLektionsProtokollList());
    setShowCreateProtocolModal(false);
    // Update student lesson count if higher
    setStudents(prev => prev.map(s => {
      if (s.id === newP.elevId && newP.lektionNr > s.totalLessons) {
        return { ...s, totalLessons: newP.lektionNr };
      }
      return s;
    }));
    setViewingProtocol(newP);
  };

  const handleDeleteProtocol = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Är du säker på att du vill ta bort detta lektionsprotokoll?')) {
      deleteLektionsProtokoll(id);
      setProtocols(getLektionsProtokollList());
      showToast('Lektionsprotokoll raderat.', 'info');
    }
  };

  // Stats calculation
  const completedMoments = activeStudent?.curriculum.filter(m => m.status === 'Klar').length || 0;
  const progressPercent = Math.round((completedMoments / (activeStudent?.curriculum.length || 12)) * 100);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-5">
      
      {/* Top Banner: Skolans Identitet & Snabbnavigering */}
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#002f6c] to-blue-700 text-white flex items-center justify-center font-black text-xl shadow-md shrink-0">
            S
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-900">
                {skola.name}
              </span>
              <span className="text-xs text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
                <ShieldCheck size={13} /> STR Auktoriserad ({skola.strNumber})
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              Trafikskola — Elever & Körprotokoll
            </h1>
          </div>
        </div>

        {/* Global Action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowCreateProtocolModal(true)}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95"
            title="Skapa nytt lektionsprotokoll"
          >
            <FileText size={15} />
            <span>Nytt protokoll</span>
          </button>

          <button
            onClick={() => {
              triggerHaptic('light');
              const activeStudent = students.find(s => s.id === activeStudentId);
              setEmailComposerData({
                toName: activeStudent?.name || '',
                licenseType: activeStudent?.licenseType || 'B',
                examiner: skola.name || 'Trafiklärare',
                initialTemplate: 'custom',
              });
              setShowEmailComposer(true);
            }}
            className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 text-[#002f6c] dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
            title="Skicka fritextmejl eller mall till elev"
          >
            <Mail size={15} />
            <span>Skicka mejl</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 bg-[#002f6c] hover:bg-[#00224f] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Plus size={15} />
            <span>Ny elev</span>
          </button>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex border-b border-gray-200 dark:border-slate-800">
        <div className="flex space-x-2 sm:space-x-4">
          <button
            onClick={() => setActiveTab('elever')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'elever'
                ? 'border-[#002f6c] text-[#002f6c] dark:text-blue-400 dark:border-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'
            }`}
          >
            <Users size={16} />
            <span>Elever & Kursplan ({students.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('protokoll')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'protokoll'
                ? 'border-[#002f6c] text-[#002f6c] dark:text-blue-400 dark:border-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'
            }`}
          >
            <FileText size={16} />
            <span>Körlektionsprotokoll ({protocols.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('skolprofil')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'skolprofil'
                ? 'border-[#002f6c] text-[#002f6c] dark:text-blue-400 dark:border-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'
            }`}
          >
            <Building2 size={16} />
            <span>Skolprofil & Fordonspark</span>
          </button>
        </div>
      </div>

      {/* TAB 1: ELEVER & UTBILDNINGSPLAN */}
      {activeTab === 'elever' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* Left Column: Student Selector (4 cols) */}
          <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-slate-800">
              <h2 className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <Users size={14} className="text-[#002f6c]" />
                Inskrivna Elever ({students.length})
              </h2>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Sök elev eller personnr..."
                className="w-full h-10 pl-9 pr-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
              {students
                .filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.personalNumber.includes(searchQuery))
                .map(stud => {
                  const isAct = stud.id === activeStudentId;
                  const studCompleted = stud.curriculum.filter(m => m.status === 'Klar').length;
                  const percent = Math.round((studCompleted / stud.curriculum.length) * 100);

                  return (
                    <div
                      key={stud.id}
                      onClick={() => setActiveStudentId(stud.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        isAct 
                          ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-300 dark:border-blue-800 shadow-xs' 
                          : 'bg-gray-50/70 dark:bg-slate-800/60 hover:bg-gray-100 border-gray-200/80 dark:border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-[#002f6c] text-white font-bold text-xs flex items-center justify-center">
                            {stud.name[0]}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-gray-900 dark:text-white">
                              {stud.name}
                            </div>
                            <div className="text-[10px] text-gray-400 font-mono">
                              {stud.personalNumber} • {stud.licenseType}
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-blue-700 dark:text-blue-400">
                          {percent}%
                        </span>
                      </div>

                      {/* Progress mini bar */}
                      <div className="w-full bg-gray-200 dark:bg-slate-700 h-1 rounded-full mt-2.5 overflow-hidden">
                        <div className="bg-[#002f6c] h-full transition-all" style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Right Column: Full Curriculum & Student Journal (8 cols) */}
          {activeStudent && (
            <div className="lg:col-span-8 space-y-4">
              
              {/* Student Header Card */}
              <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100 dark:border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-black text-gray-900 dark:text-white">
                        {activeStudent.name}
                      </h2>
                      <span className="px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 text-[10px] font-bold uppercase">
                        Körkort {activeStudent.licenseType} ({activeStudent.transmission})
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 font-mono mt-0.5">
                      Personnr: {activeStudent.personalNumber} • Tel: {activeStudent.phone} • Lärare: {activeStudent.teacher}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowCreateProtocolModal(true)}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <FileText size={13} />
                      <span>Nytt Lektionsprotokoll</span>
                    </button>
                    <button
                      onClick={handleAddLessonQuick}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 text-gray-800 dark:text-gray-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus size={13} />
                      <span>+1 Lektion</span>
                    </button>
                  </div>
                </div>

                {/* Badges and Progress Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-gray-50 dark:bg-slate-800/60 rounded-xl border border-gray-200/80 dark:border-slate-800 text-center">
                    <div className="text-[10px] uppercase font-bold text-gray-400">Genomförda Lektioner</div>
                    <div className="text-lg font-black text-gray-900 dark:text-white mt-0.5">
                      {activeStudent.totalLessons} st
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50 dark:bg-slate-800/60 rounded-xl border border-gray-200/80 dark:border-slate-800 text-center">
                    <div className="text-[10px] uppercase font-bold text-gray-400">Planens Framsteg</div>
                    <div className="text-lg font-black text-blue-600 dark:text-blue-400 mt-0.5">
                      {progressPercent}%
                    </div>
                  </div>

                  <div 
                    onClick={() => handleToggleRisk('risk1')}
                    className={`p-3 rounded-xl border cursor-pointer select-none transition-all text-center ${
                      activeStudent.risk1 
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-800 dark:text-emerald-300' 
                        : 'bg-gray-50 dark:bg-slate-800/60 border-gray-200 text-gray-400'
                    }`}
                  >
                    <div className="text-[10px] uppercase font-bold">Riskettan (Alkohol/Trötthet)</div>
                    <div className="text-xs font-black mt-1 flex items-center justify-center gap-1">
                      {activeStudent.risk1 ? <Check size={14} /> : null}
                      {activeStudent.risk1 ? 'Genomförd' : 'Ej intygad'}
                    </div>
                  </div>

                  <div 
                    onClick={() => handleToggleRisk('risk2')}
                    className={`p-3 rounded-xl border cursor-pointer select-none transition-all text-center ${
                      activeStudent.risk2 
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-800 dark:text-emerald-300' 
                        : 'bg-gray-50 dark:bg-slate-800/60 border-gray-200 text-gray-400'
                    }`}
                  >
                    <div className="text-[10px] uppercase font-bold">Halkbana (Risk 2)</div>
                    <div className="text-xs font-black mt-1 flex items-center justify-center gap-1">
                      {activeStudent.risk2 ? <Check size={14} /> : null}
                      {activeStudent.risk2 ? 'Genomförd' : 'Ej intygad'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Curriculum Step By Step */}
              <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-slate-800">
                  <h3 className="text-sm font-black uppercase tracking-wider text-gray-900 dark:text-white flex items-center gap-2">
                    <Layers size={16} className="text-[#002f6c]" />
                    Utbildningsplanens 12 Grundmoment (Transportstyrelsens kursplan)
                  </h3>
                  <span className="text-xs text-gray-500 font-medium">
                    {completedMoments} av {activeStudent.curriculum.length} moment klara
                  </span>
                </div>

                <div className="space-y-2.5">
                  {activeStudent.curriculum.map((step) => {
                    const isDone = step.status === 'Klar';
                    const isPracticed = step.status === 'Övad';

                    return (
                      <div 
                        key={step.id}
                        className="p-3.5 bg-gray-50/70 dark:bg-slate-800/50 border border-gray-200/80 dark:border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-start gap-3">
                          <span className="w-6 h-6 rounded-lg bg-[#002f6c]/10 dark:bg-blue-950 text-[#002f6c] dark:text-blue-400 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                            {step.moment}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-gray-900 dark:text-white">
                                {step.title}
                              </span>
                              <span className="text-[9.5px] uppercase font-bold text-gray-400 px-1.5 py-0.2 rounded bg-gray-100 dark:bg-slate-800">
                                {step.category}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                              {step.description}
                            </p>
                          </div>
                        </div>

                        {/* Status Selector Buttons */}
                        <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                          <button
                            type="button"
                            onClick={() => handleStepStatusChange(step.id, 'Ej påbörjad')}
                            className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-lg border transition-all cursor-pointer ${
                              step.status === 'Ej påbörjad' 
                                ? 'bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-gray-200 border-gray-300' 
                                : 'bg-transparent text-gray-400 border-transparent hover:bg-gray-100'
                            }`}
                          >
                            Ej påbörjad
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStepStatusChange(step.id, 'Övad')}
                            className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-lg border transition-all cursor-pointer ${
                              isPracticed 
                                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300' 
                                : 'bg-transparent text-gray-400 border-transparent hover:bg-amber-50'
                            }`}
                          >
                            Övad
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStepStatusChange(step.id, 'Klar')}
                            className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-lg border transition-all cursor-pointer ${
                              isDone 
                                ? 'bg-emerald-600 text-white border-transparent shadow-xs' 
                                : 'bg-transparent text-gray-400 border-transparent hover:bg-emerald-50'
                            }`}
                          >
                            ✓ Klar
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

        </div>
      )}

      {/* TAB 2: KÖRLEKTIONSPROTOKOLL */}
      {activeTab === 'protokoll' && (
        <div className="space-y-4">
          
          {/* Header filter */}
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Filtrera på elev:
              </span>
              <select
                value={protocolFilterStudent}
                onChange={(e) => setProtocolFilterStudent(e.target.value)}
                className="h-9 px-3 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-xs font-bold text-gray-900 dark:text-white"
              >
                <option value="alla">Alla elever ({protocols.length} protokoll)</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setShowCreateProtocolModal(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
            >
              <Plus size={15} />
              <span>Skapa Nytt Lektionsprotokoll</span>
            </button>
          </div>

          {/* Protocol Card Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {protocols
              .filter(p => protocolFilterStudent === 'alla' || p.elevId === protocolFilterStudent)
              .map(p => (
                <div
                  key={p.id}
                  onClick={() => setViewingProtocol(p)}
                  className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 rounded-2xl p-4 shadow-sm transition-all hover:shadow-md cursor-pointer flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-black uppercase text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded">
                          Lektion #{p.lektionNr} • {p.langdMinuter} min
                        </span>
                        <h3 className="text-base font-black text-gray-900 dark:text-white mt-1">
                          {p.elevNamn}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {p.lektionstyp}
                        </p>
                      </div>

                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                        p.betygHelhet === 'Bra genomfört' || p.betygHelhet === 'Utmärkt framsteg'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : p.betygHelhet === 'Godkänd nivå' || p.betygHelhet === 'Godkänd lektion'
                          ? 'bg-blue-50 text-blue-800 border-blue-300'
                          : 'bg-amber-50 text-amber-800 border-amber-300'
                      }`}>
                        {p.betygHelhet}
                      </span>
                    </div>

                    <div className="text-xs text-gray-600 dark:text-gray-300 space-y-1 pt-1">
                      <div className="flex items-center gap-1.5 text-gray-500 text-[11px]">
                        <Calendar size={12} /> {p.datum} kl {p.tid} • {p.fordon.split('(')[0]}
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-500 text-[11px]">
                        <GraduationCap size={12} /> Lärare: {p.larare}
                      </div>
                    </div>

                    {/* Moments preview */}
                    <div className="pt-2 border-t border-gray-100 dark:border-slate-800">
                      <div className="text-[10px] font-bold uppercase text-gray-400 mb-1">
                        Övade moment ({p.ovadeMoment.length}):
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {p.ovadeMoment.map(m => (
                          <span key={m.momentNr} className="text-[10px] bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 px-1.5 py-0.5 rounded">
                            {m.momentNr}. {m.momentTitel} (Nivå {m.niva})
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1">
                      <Eye size={13} /> Visa protokoll
                    </span>
                    <button
                      onClick={(e) => handleDeleteProtocol(p.id, e)}
                      className="text-gray-400 hover:text-red-600 p-1 rounded-md transition-colors"
                      title="Radera protokoll"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
          </div>

        </div>
      )}

      {/* TAB 3: SKOLPROFIL & FORDONSPARK */}
      {activeTab === 'skolprofil' && (
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-slate-800">
            <div>
              <span className="text-[10px] font-black uppercase text-blue-600 tracking-wider">
                Fiktiv Officiell Trafikskola
              </span>
              <h2 className="text-xl font-black text-gray-900 dark:text-white mt-0.5">
                {skola.name}
              </h2>
              <p className="text-xs text-gray-500">
                {skola.slogan}
              </p>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-900 rounded-xl text-blue-900 dark:text-blue-200 text-xs font-bold">
              <ShieldCheck size={16} className="text-blue-600" />
              <span>Auktoriserad Medlem i STR ({skola.strNumber})</span>
            </div>
          </div>

          {/* School Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-gray-50 dark:bg-slate-800/60 rounded-xl border border-gray-200 dark:border-slate-800 space-y-1">
              <div className="text-[10px] uppercase font-bold text-gray-400">Organisationsnummer</div>
              <div className="font-mono font-bold text-gray-900 dark:text-white text-sm">{skola.orgNumber}</div>
              <div className="text-gray-500 mt-2 text-[11px]">Registrerad hos Bolagsverket & Transportstyrelsen</div>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-slate-800/60 rounded-xl border border-gray-200 dark:border-slate-800 space-y-1">
              <div className="text-[10px] uppercase font-bold text-gray-400">Utbildningsledare</div>
              <div className="font-bold text-gray-900 dark:text-white text-sm">{skola.utbildningsledare}</div>
              <div className="text-gray-500 mt-2 text-[11px]">Behörig Trafikskolechef & Leg. Trafiklärare</div>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-slate-800/60 rounded-xl border border-gray-200 dark:border-slate-800 space-y-1">
              <div className="text-[10px] uppercase font-bold text-gray-400">Kontakt & Besöksadress</div>
              <div className="font-bold text-gray-900 dark:text-white">{skola.address}, {skola.city}</div>
              <div className="text-gray-500 text-[11px]">Tel: {skola.phone} • {skola.email}</div>
            </div>
          </div>

          {/* Fleet Vehicles */}
          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-black uppercase tracking-wider text-gray-900 dark:text-white flex items-center gap-2">
              <Car size={16} className="text-[#002f6c]" />
              Skolans Fordonspark ({skola.vehicles.length} fordon)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {skola.vehicles.map(v => (
                <div key={v.id} className="p-3.5 bg-gray-50 dark:bg-slate-800/60 rounded-xl border border-gray-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-xs text-gray-900 dark:text-white">
                      {v.model}
                    </div>
                    <div className="text-[10px] text-gray-500 font-mono mt-0.5">
                      {v.regNr} • {v.type} ({v.year})
                    </div>
                  </div>
                  <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 text-[10px] font-black rounded">
                    Klass {v.licenseCategory}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* MODAL: VISA FULLSTÄNDIGT LEKTIONSPROTOKOLL */}
      {viewingProtocol && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
          <div className="w-full max-w-4xl my-auto animate-in zoom-in-95">
            <LektionsProtokollDocument
              protokoll={viewingProtocol}
              skola={skola}
              onClose={() => setViewingProtocol(null)}
              onPrint={() => window.print()}
            />
          </div>
        </div>
      )}

      {/* MODAL: SKAPA NYTT LEKTIONSPROTOKOLL */}
      {showCreateProtocolModal && (
        <SkapaLektionsProtokollModal
          students={students}
          selectedStudent={activeStudent}
          skola={skola}
          onClose={() => setShowCreateProtocolModal(false)}
          onSaved={handleProtocolSaved}
        />
      )}

      {/* MODAL: LÄGG TILL ELEV */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <h3 className="text-lg font-black text-gray-900 dark:text-white">
              Skriv in ny elev i utbildningsplanen
            </h3>
            
            <form onSubmit={handleCreateStudent} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">Elevens Namn</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Förnamn Efternamn"
                  className="w-full h-10 px-3 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-xs font-bold"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">Personnummer</label>
                <input
                  type="text"
                  value={newPnr}
                  onChange={(e) => setNewPnr(e.target.value)}
                  placeholder="ÅÅÅÅMMDD-XXXX"
                  className="w-full h-10 px-3 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-xs font-mono font-bold"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">Telefonnummer</label>
                <input
                  type="text"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="07X-XXX XX XX"
                  className="w-full h-10 px-3 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-xs font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">Behörighet</label>
                  <select
                    value={newLicense}
                    onChange={(e) => setNewLicense(e.target.value)}
                    className="w-full h-10 px-3 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-xs font-bold"
                  >
                    <option value="B">B (Personbil)</option>
                    <option value="BE">BE (Släp)</option>
                    <option value="B96">B96 (Utökad B)</option>
                    <option value="C">C (Tung Lastbil)</option>
                    <option value="CE">CE (Tungt släp)</option>
                    <option value="D">D (Buss)</option>
                    <option value="A">A (Motorcykel)</option>
                    <option value="TAXI">TAXI</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">Växellåda</label>
                  <select
                    value={newTrans}
                    onChange={(e) => setNewTrans(e.target.value)}
                    className="w-full h-10 px-3 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-xs font-bold"
                  >
                    <option value="Manuell">Manuell</option>
                    <option value="Automat">Automat</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Avbryt
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#002f6c] text-white rounded-xl text-xs font-bold hover:bg-[#00224f] cursor-pointer"
                >
                  Spara elev
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Email Composer Modal */}
      <EmailComposerModal
        isOpen={showEmailComposer}
        onClose={() => setShowEmailComposer(false)}
        initialData={emailComposerData}
      />

    </div>
  );
}
