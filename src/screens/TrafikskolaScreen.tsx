import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, Users, Calendar, Clock, Plus, CheckCircle2, 
  Search, BookOpen, Award, FileText, ChevronRight, AlertCircle, 
  Trash2, UserCheck, ShieldCheck, Check, Smartphone, CheckSquare,
  Sparkles, Download, Layers
} from 'lucide-react';

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

const DEFAULT_CURRICULUM: UtbildningsPlanStep[] = [
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

export function TrafikskolaScreen() {
  const [students, setStudents] = useState<StudentProfile[]>(() => {
    const saved = localStorage.getItem('trafikskola_students');
    if (saved) {
      try { return JSON.parse(saved); } catch (_) {}
    }
    return [];
  });

  const [activeStudentId, setActiveStudentId] = useState<string>(students[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Student Form State
  const [newName, setNewName] = useState('');
  const [newPnr, setNewPnr] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newLicense, setNewLicense] = useState('B');
  const [newTrans, setNewTrans] = useState('Manuell');

  useEffect(() => {
    localStorage.setItem('trafikskola_students', JSON.stringify(students));
    // Also sync to backend
    fetch('/api/trafikskola/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(students)
    }).catch(() => {});
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

  const handleAddLesson = () => {
    if (!activeStudent) return;
    setStudents(prev => prev.map(stud => {
      if (stud.id !== activeStudent.id) return stud;
      return { ...stud, totalLessons: stud.totalLessons + 1 };
    }));
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
      teacher: 'Rasmus Lundin',
      curriculum: DEFAULT_CURRICULUM.map(c => ({ ...c, status: 'Ej påbörjad' }))
    };

    setStudents(prev => [newStudent, ...prev]);
    setActiveStudentId(newStudent.id);
    setShowAddModal(false);
    setNewName('');
    setNewPnr('');
    setNewPhone('');
  };

  // Stats calculation
  const completedMoments = activeStudent?.curriculum.filter(m => m.status === 'Klar').length || 0;
  const progressPercent = Math.round((completedMoments / (activeStudent?.curriculum.length || 12)) * 100);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-5">
      
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#002f6c] to-blue-700 text-white flex items-center justify-center shadow-md shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10.5px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md">
                Trafikskoleläge PRO
              </span>
              <span className="text-xs text-gray-400 font-mono">Digital Utbildningsplan & Körkortsjournal</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              Elevhantering & Undervisningsplan
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-[#002f6c] hover:bg-[#00224f] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <Plus size={15} />
            <span>Ny Trafikelev</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Student List & Detailed Educational Plan */}
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
                    onClick={handleAddLesson}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 text-gray-800 dark:text-gray-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus size={13} />
                    <span>Registrera Körlektion</span>
                  </button>
                </div>
              </div>

              {/* Badges and Progress Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-gray-50 dark:bg-slate-800/60 rounded-xl border border-gray-200/80 dark:border-slate-800 text-center">
                  <div className="text-[10px] uppercase font-bold text-gray-400">Totala Lektioner</div>
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

      {/* Modal: Lägg till elev */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
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
                  className="px-4 py-2 border border-gray-300 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-bold"
                >
                  Avbryt
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#002f6c] text-white rounded-xl text-xs font-bold hover:bg-[#00224f]"
                >
                  Spara elev
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
