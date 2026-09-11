import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/ProvContext';
import { 
  Search, 
  UserCheck, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ExternalLink, 
  Plus, 
  X, 
  Play, 
  Pause, 
  RefreshCw, 
  FileText, 
  Printer, 
  BookOpen, 
  PlusCircle, 
  Check, 
  HelpCircle,
  Eye,
  Settings,
  Trash2
} from 'lucide-react';
import { Question, ALL_MOCK_QUESTIONS, buildTestQuestions } from '../data/mockQuestions';
import { RoadSign, SceneIllustration } from '../components/RoadSigns';

// Shared Interface for Candidate
export interface TheoryCandidate {
  id: string;
  name: string;
  pnr: string;
  auth: string; // 'B', 'AM', 'A', 'BE', 'C', 'CE', 'D', 'DE', 'TRAKTOR', 'YKB'
  status: 'waiting' | 'verified' | 'waiting_to_start' | 'active' | 'paused' | 'completed';
  bench: number | null;
  assignedTestId: string; // e.g. 'B_STANDARD', 'AM_STANDARD', etc.
  result: 'Pass' | 'Fail' | '';
  score: number;
  maxScore: number;
  progress: number;
  timeRemaining: number;
  liveAnswers?: Record<number, number>;
  markedQuestions?: Record<number, boolean>;
}

// Master list of tests
export const THEORY_TESTS = [
  { id: 'B_STANDARD', title: 'B - Personbil Standardprov', duration: 3000, questionsCount: 65, auth: 'B', category: 'Standardprov' },
  { id: 'BE_STANDARD', title: 'BE - Personbil med tungt släp', duration: 2400, questionsCount: 55, auth: 'BE', category: 'Standardprov' },
  { id: 'AM_STANDARD', title: 'AM - Moped Standardprov', duration: 3000, questionsCount: 65, auth: 'AM', category: 'Standardprov' },
  { id: 'A_STANDARD', title: 'A - Motorcykel Standardprov', duration: 3000, questionsCount: 65, auth: 'A', category: 'Standardprov' },
  { id: 'C_STANDARD', title: 'C - Tung lastbil Standardprov', duration: 2400, questionsCount: 55, auth: 'C', category: 'Standardprov' },
  { id: 'CE_STANDARD', title: 'CE - Tung lastbil med tungt släp', duration: 2400, questionsCount: 55, auth: 'CE', category: 'Standardprov' },
  { id: 'D_STANDARD', title: 'D - Buss Standardprov', duration: 2400, questionsCount: 55, auth: 'D', category: 'Standardprov' },
  { id: 'DE_STANDARD', title: 'DE - Buss med tungt släp', duration: 2400, questionsCount: 55, auth: 'DE', category: 'Standardprov' },
  { id: 'TRAKTOR_STANDARD', title: 'T - Traktor & terränghjuling', duration: 1800, questionsCount: 45, auth: 'TRAKTOR', category: 'Standardprov' },
  { id: 'YKB_STANDARD', title: 'YKB - Yrkesförarkompetens Standardprov', duration: 3600, questionsCount: 65, auth: 'YKB', category: 'Standardprov' },
  { id: 'TRAFIKREGLER_FOCUS', title: 'Fokusprov: Trafikregler & Vägmärken', duration: 1200, questionsCount: 20, auth: 'ALL', category: 'Övningsprov' },
  { id: 'MILJO_SÄKERHET_FOCUS', title: 'Fokusprov: Miljö & Trafiksäkerhet', duration: 1200, questionsCount: 20, auth: 'ALL', category: 'Övningsprov' },
  { id: 'QUICK_PRACTICE', title: 'Snabbtest: Blandat träningsprov', duration: 900, questionsCount: 15, auth: 'ALL', category: 'Snabbprov' },
];

export function TeoriprovScreen() {
  const { profile } = useAppStore();
  const [activeTab, setActiveTab] = useState<'kandidater' | 'paigaende' | 'avslutade' | 'fragebank'>('kandidater');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showProtocolModal, setShowProtocolModal] = useState(false);
  const [selectedCandidateForProtocol, setSelectedCandidateForProtocol] = useState<TheoryCandidate | null>(null);
  
  // Add candidate state
  const [newCandidate, setNewCandidate] = useState({ 
    name: '', 
    pnr: '', 
    auth: 'B', 
    assignedTestId: 'B_STANDARD' 
  });

  // Custom questions pool state
  const [customQuestions, setCustomQuestions] = useState<Question[]>([]);
  const [showAddQuestionModal, setShowAddQuestionModal] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    categoryId: 4,
    question: '',
    options: ['', '', '', ''],
    correct: 0,
    explanation: ''
  });

  const [candidates, setCandidates] = useState<TheoryCandidate[]>([]);
  const [allowLogin, setAllowLogin] = useState<boolean>(() => {
    const saved = localStorage.getItem('theory_allow_login');
    return saved !== 'false'; // default to true
  });

  const handleToggleAllowLogin = () => {
    const nextVal = !allowLogin;
    setAllowLogin(nextVal);
    localStorage.setItem('theory_allow_login', String(nextVal));
    window.dispatchEvent(new Event('storage'));
  };

  const handleStartAllWaiting = () => {
    const waitingToStart = candidates.filter(c => c.status === 'waiting_to_start');
    if (waitingToStart.length === 0) return;
    
    const newList = candidates.map(cand => {
      if (cand.status === 'waiting_to_start') {
        const testDuration = THEORY_TESTS.find(t => t.id === cand.assignedTestId)?.duration || 3000;
        return {
          ...cand,
          status: 'active' as const,
          progress: cand.progress || 0,
          timeRemaining: cand.timeRemaining || testDuration
        };
      }
      return cand;
    });

    saveCandidates(newList);
  };

  // Initial load
  useEffect(() => {
    const initialList: TheoryCandidate[] = [
      { id: '1', name: 'Elsa Andersson', pnr: '20010115-1234', auth: 'B', status: 'waiting', bench: null, assignedTestId: 'B_STANDARD', result: '', score: 0, maxScore: 65, progress: 0, timeRemaining: 3000 },
      { id: '2', name: 'Johan Svensson', pnr: '19980520-5678', auth: 'C', status: 'verified', bench: 4, assignedTestId: 'HEAVY_STANDARD', result: '', score: 0, maxScore: 55, progress: 0, timeRemaining: 2400 },
      { id: '3', name: 'Maria Lindgren', pnr: '19901112-9012', auth: 'YKB', status: 'active', bench: 12, assignedTestId: 'YKB_STANDARD', result: '', score: 0, maxScore: 65, progress: 45, timeRemaining: 1800, liveAnswers: { 0: 1, 1: 0, 2: 2, 3: 1 } },
      { id: '4', name: 'Ahmed Ali', pnr: '20050808-3456', auth: 'AM', status: 'active', bench: 1, assignedTestId: 'AM_STANDARD', result: '', score: 0, maxScore: 65, progress: 80, timeRemaining: 605 },
      { id: '5', name: 'Sofia Karlsson', pnr: '19850228-7890', auth: 'B', status: 'completed', bench: 8, assignedTestId: 'B_STANDARD', result: 'Pass', score: 55, maxScore: 65, progress: 100, timeRemaining: 0, liveAnswers: {0:1,1:1,2:2,3:1,4:1,5:1,6:1,7:0,8:1,9:0,10:2,11:2,12:1,13:1,14:0,15:1,16:1,17:1,18:2,19:1} },
      { id: '6', name: 'Lars Olofsson', pnr: '19751101-9900', auth: 'C', status: 'completed', bench: 5, assignedTestId: 'HEAVY_STANDARD', result: 'Fail', score: 28, maxScore: 55, progress: 100, timeRemaining: 0 },
    ];

    const saved = localStorage.getItem('theory_candidates_list');
    if (saved) {
      try {
        setCandidates(JSON.parse(saved));
      } catch (e) {
        setCandidates(initialList);
        localStorage.setItem('theory_candidates_list', JSON.stringify(initialList));
      }
    } else {
      setCandidates(initialList);
      localStorage.setItem('theory_candidates_list', JSON.stringify(initialList));
    }

    // Load custom questions
    const savedCustomQ = localStorage.getItem('custom_questions_pool');
    if (savedCustomQ) {
      try {
        setCustomQuestions(JSON.parse(savedCustomQ));
      } catch (e) {}
    }
  }, []);

  // Sync to local storage
  const saveCandidates = (newList: TheoryCandidate[]) => {
    setCandidates(newList);
    localStorage.setItem('theory_candidates_list', JSON.stringify(newList));
    // Trigger storage event for other windows/tabs
    window.dispatchEvent(new Event('storage'));
  };

  // Real-time listener for candidate updates from the student's screen
  useEffect(() => {
    const handleStorageChange = (e: Event) => {
      const savedAllow = localStorage.getItem('theory_allow_login');
      if (savedAllow !== null) {
        setAllowLogin(savedAllow !== 'false');
      }

      const saved = localStorage.getItem('theory_candidates_list');
      if (saved) {
        try {
          setCandidates(JSON.parse(saved));
        } catch(err) {}
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Simulator loop for decrementing active candidates' timer (in case examiner wants to view real-time countdown on examiner screen too!)
  useEffect(() => {
    const interval = setInterval(() => {
      setCandidates(prev => {
        let changed = false;
        const next = prev.map(c => {
          if (c.status === 'active' && c.timeRemaining > 0) {
            changed = true;
            // simulate progress if running stand-alone mock
            let newProgress = c.progress;
            if (Math.random() < 0.08 && c.progress < 95) {
              newProgress = Math.min(100, c.progress + Math.floor(Math.random() * 2) + 1);
            }
            return {
              ...c,
              timeRemaining: Math.max(0, c.timeRemaining - 1),
              progress: newProgress
            };
          }
          return c;
        });
        if (changed) {
          localStorage.setItem('theory_candidates_list', JSON.stringify(next));
          return next;
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleLegitimera = (id: string) => {
    const nextBench = Math.floor(Math.random() * 24) + 1;
    const newList = candidates.map(c => 
      c.id === id ? { ...c, status: 'verified' as const, bench: nextBench } : c
    );
    saveCandidates(newList);
  };

  const handleAssignTest = (candidateId: string, testId: string) => {
    const test = THEORY_TESTS.find(t => t.id === testId);
    if (!test) return;
    const newList = candidates.map(c => 
      c.id === candidateId ? { ...c, assignedTestId: testId, maxScore: test.questionsCount } : c
    );
    saveCandidates(newList);
  };

  const handleStartTestForCandidate = (c: TheoryCandidate) => {
    localStorage.setItem('current_candidate_id', c.id);
    localStorage.setItem('current_candidate_name', c.name);
    localStorage.setItem('current_candidate_pnr', c.pnr);
    
    const newList = candidates.map(cand => 
      cand.id === c.id ? { 
        ...cand, 
        status: 'active' as const, 
        progress: cand.progress || 0, 
        timeRemaining: cand.timeRemaining || (THEORY_TESTS.find(t => t.id === cand.assignedTestId)?.duration || 3000)
      } : cand
    );
    saveCandidates(newList);

    // Broadcast force action to student view
    localStorage.setItem('mock_prov_force_action', JSON.stringify({ 
      id: c.id, 
      action: 'resume', 
      ts: Date.now() 
    }));
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCandidate.name || !newCandidate.pnr) return;

    const selectedTest = THEORY_TESTS.find(t => t.id === newCandidate.assignedTestId);
    
    const nc: TheoryCandidate = {
      id: Math.random().toString(36).substring(7),
      name: newCandidate.name,
      pnr: newCandidate.pnr,
      auth: newCandidate.auth,
      status: 'waiting',
      bench: null,
      assignedTestId: newCandidate.assignedTestId,
      result: '',
      score: 0,
      maxScore: selectedTest ? selectedTest.questionsCount : 65,
      progress: 0,
      timeRemaining: selectedTest ? selectedTest.duration : 3000
    };

    saveCandidates([nc, ...candidates]);
    setShowAddModal(false);
    setNewCandidate({ name: '', pnr: '', auth: 'B', assignedTestId: 'B_STANDARD' });
  };

  // Examiner control actions during active writing
  const handleTogglePause = (c: TheoryCandidate) => {
    const isNowPaused = c.status === 'paused';
    const nextStatus = isNowPaused ? 'active' as const : 'paused' as const;
    const newList = candidates.map(cand => 
      cand.id === c.id ? { ...cand, status: nextStatus } : cand
    );
    saveCandidates(newList);
    
    // Broadcast force action
    localStorage.setItem('mock_prov_force_action', JSON.stringify({ 
      id: c.id, 
      action: isNowPaused ? 'resume' : 'pause', 
      ts: Date.now() 
    }));
  };

  const handleAddTime = (c: TheoryCandidate, seconds: number) => {
    const newList = candidates.map(cand => 
      cand.id === c.id ? { ...cand, timeRemaining: cand.timeRemaining + seconds } : cand
    );
    saveCandidates(newList);

    localStorage.setItem('mock_prov_force_action', JSON.stringify({ 
      id: c.id, 
      action: 'add_time', 
      amount: seconds, 
      ts: Date.now() 
    }));
  };

  const handleForceSubmit = (c: TheoryCandidate, forceResult: 'Pass' | 'Fail') => {
    const finalScore = forceResult === 'Pass' ? Math.ceil(c.maxScore * 0.85) : Math.floor(c.maxScore * 0.5);
    const newList = candidates.map(cand => 
      cand.id === c.id ? { 
        ...cand, 
        status: 'completed' as const, 
        progress: 100, 
        result: forceResult, 
        score: finalScore 
      } : cand
    );
    saveCandidates(newList);

    localStorage.setItem('mock_prov_force_action', JSON.stringify({ 
      id: c.id, 
      action: 'force_submit', 
      result: forceResult, 
      score: finalScore,
      ts: Date.now() 
    }));
  };

  const handleResetList = () => {
    if (window.confirm("Är du säker på att du vill nollställa alla provkandidater?")) {
      localStorage.removeItem('theory_candidates_list');
      window.location.reload();
    }
  };

  // Custom questions management
  const handleAddQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.question || !newQuestion.options[0]) return;

    const nq: Question = {
      id: 20000 + customQuestions.length,
      categoryId: Number(newQuestion.categoryId),
      question: newQuestion.question,
      options: newQuestion.options.filter(o => o.trim() !== ''),
      correct: Number(newQuestion.correct),
      explanation: newQuestion.explanation
    };

    const updated = [nq, ...customQuestions];
    setCustomQuestions(updated);
    localStorage.setItem('custom_questions_pool', JSON.stringify(updated));
    setShowAddQuestionModal(false);
    setNewQuestion({
      categoryId: 4,
      question: '',
      options: ['', '', '', ''],
      correct: 0,
      explanation: ''
    });
  };

  const handleDeleteCustomQuestion = (id: number) => {
    const updated = customQuestions.filter(q => q.id !== id);
    setCustomQuestions(updated);
    localStorage.setItem('custom_questions_pool', JSON.stringify(updated));
  };

  // Get total question list
  const getFullQuestionsList = () => {
    return [...ALL_QUESTIONS_POOL, ...customQuestions];
  };

  // Filters
  const filteredCandidates = candidates.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.pnr.includes(searchQuery)
  );

  const waiting = filteredCandidates.filter(c => c.status === 'waiting' || c.status === 'verified' || c.status === 'waiting_to_start');
  const active = filteredCandidates.filter(c => c.status === 'active' || c.status === 'paused');
  const completed = filteredCandidates.filter(c => c.status === 'completed');

  const stats = {
    total: candidates.length,
    waiting: candidates.filter(c => c.status === 'waiting' || c.status === 'verified' || c.status === 'waiting_to_start').length,
    active: candidates.filter(c => c.status === 'active' || c.status === 'paused').length,
    completed: candidates.filter(c => c.status === 'completed').length,
    passed: candidates.filter(c => c.result === 'Pass').length
  };

  // Get Swedish name for categories
  const getCategoryName = (id: number) => {
    switch (id) {
      case 1: return "Fordonskännedom & manövrering";
      case 2: return "Miljö";
      case 3: return "Trafiksäkerhet";
      case 4: return "Trafikregler";
      case 5: return "Personliga förutsättningar";
      default: return "Övrigt / Allmänbildning";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8 h-full flex flex-col relative font-sans">

      {/* Decorative Banner */}
      <div className="absolute top-0 left-0 right-0 h-48 sm:h-64 rounded-b-3xl overflow-hidden z-0 shadow-sm opacity-100">
        <img 
          src="https://images.unsplash.com/photo-1506015391300-4802dc74de2e?auto=format&fit=crop&q=80&w=1600&h=400" 
          alt="Transportation" 
          className="w-full h-full object-cover opacity-30 dark:opacity-20 object-[center_40%]"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#f8f9fa] dark:to-[#0b1120]"></div>
      </div>

      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4 relative z-10 pt-4 sm:pt-8">
        <div>
          <h1 className="text-xl sm:text-3xl font-display font-black text-gray-950 dark:text-white uppercase tracking-tight flex flex-wrap items-center gap-2">
            KUNSKAPSPROV <span className="text-xs py-1 px-2.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-mono rounded-full font-bold">PROVLEDARVY</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 max-w-xl">
            Salsövervakning, legitimering och provadministration i realtid. Följ kandidaternas progression.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => setShowAddModal(true)}
            className="w-full sm:w-auto min-h-11 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md hover:translate-y-[-1px]"
          >
            <Plus className="w-4 h-4" /> Skapa Testkandidat
          </button>
          <button
            onClick={() => window.open('/elevprov', '_blank')}
            className="w-full sm:w-auto min-h-11 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md hover:translate-y-[-1px]"
          >
            <ExternalLink className="w-4 h-4" /> Öppna Elevvy
          </button>
          <button
            onClick={handleResetList}
            className="w-full sm:w-auto min-h-11 px-4 py-3 bg-red-100 hover:bg-red-200 dark:bg-red-950/20 dark:hover:bg-red-900/40 text-red-700 dark:text-red-400 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            title="Nollställ alla prov"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Nollställ
          </button>
        </div>
      </div>

      {/* Statistics board */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8 relative z-10">
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/10 p-3.5 sm:p-5 rounded-2xl shadow-sm flex flex-col justify-between">
          <p className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-widest">I Väntrum</p>
          <div className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mt-2 flex items-baseline gap-2">
            {stats.waiting} <span className="text-xs font-normal text-gray-400">kandidater</span>
          </div>
        </div>
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 p-3.5 sm:p-5 rounded-2xl shadow-sm flex flex-col justify-between">
          <p className="text-[10px] sm:text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-widest">Skriver prov nu</p>
          <div className="text-2xl sm:text-3xl font-black text-amber-700 dark:text-amber-300 mt-2 flex items-baseline gap-2">
            {stats.active} <span className="text-xs font-normal text-amber-500">aktiva</span>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/10 p-3.5 sm:p-5 rounded-2xl shadow-sm flex flex-col justify-between">
          <p className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-widest">Slutförda idag</p>
          <div className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mt-2 flex items-baseline gap-2">
            {stats.completed} <span className="text-xs font-normal text-gray-400">prov</span>
          </div>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 p-3.5 sm:p-5 rounded-2xl shadow-sm flex flex-col justify-between">
          <p className="text-[10px] sm:text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">Godkända prov</p>
          <div className="text-2xl sm:text-3xl font-black text-emerald-700 dark:text-emerald-300 mt-2 flex items-baseline gap-2">
            {stats.passed} <span className="text-xs font-normal text-emerald-500">({stats.completed > 0 ? Math.round((stats.passed / stats.completed) * 100) : 0}%)</span>
          </div>
        </div>
      </div>

      {/* PORTAL CONTROLS BANNER */}
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/10 p-5 rounded-2xl shadow-sm mb-8 relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div className="flex items-start gap-4">
          <div className={`p-3.5 rounded-2xl ${allowLogin ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600' : 'bg-slate-100 dark:bg-slate-800 text-gray-400'} shrink-0`}>
            <Settings className={`w-6 h-6 ${allowLogin ? 'animate-spin [animation-duration:15s]' : ''}`} />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#d2232a] block font-mono">SÄKERHETSPORTAL (TSFS 2012:41)</span>
            <h2 className="text-base font-bold dark:text-white uppercase tracking-tight mt-0.5">Öppna provsal & Startstyrning</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
              Öppna eller stäng inloggningen till provet. När eleverna har loggat in och valt prov, godkänn och starta deras prov i realtid.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3.5 justify-end">
          {/* Allow login toggle */}
          <button
            onClick={handleToggleAllowLogin}
            className={`w-full sm:w-auto px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 border transition-all cursor-pointer shadow-sm ${
              allowLogin 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-400 hover:bg-emerald-100' 
                : 'bg-red-50 border-red-200 text-red-700 dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-400 hover:bg-red-100'
            }`}
          >
            <span className={`w-2.5 h-2.5 rounded-full ${allowLogin ? 'bg-emerald-500 animate-pulse' : 'bg-red-500 animate-ping'}`} />
            {allowLogin ? 'Tillåt inloggning: PÅ' : 'Tillåt inloggning: AV'}
          </button>

          {/* Start all button */}
          <button
            onClick={handleStartAllWaiting}
            disabled={candidates.filter(c => c.status === 'waiting_to_start').length === 0}
            className={`w-full sm:w-auto px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer ${
              candidates.filter(c => c.status === 'waiting_to_start').length > 0
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white hover:translate-y-[-1px]'
                : 'bg-gray-100 dark:bg-slate-800 text-gray-400 border border-gray-200 dark:border-white/5 cursor-not-allowed'
            }`}
          >
            <Play className="w-4 h-4" />
            Starta prov för alla ({candidates.filter(c => c.status === 'waiting_to_start').length})
          </button>
        </div>
      </div>

      {/* Tabs list */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6 relative z-10 border-b border-gray-200 dark:border-white/10 pb-4">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setActiveTab('kandidater')}
            className={`shrink-0 px-4 sm:px-5 py-2.5 min-h-10 rounded-full text-xs font-bold tracking-wider uppercase transition-all cursor-pointer ${
              activeTab === 'kandidater' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'bg-white dark:bg-slate-900 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-slate-800'
            }`}
          >
            I VÄNTRUM ({waiting.length})
          </button>
          <button
            onClick={() => setActiveTab('paigaende')}
            className={`shrink-0 px-4 sm:px-5 py-2.5 min-h-10 rounded-full text-xs font-bold tracking-wider uppercase transition-all cursor-pointer ${
              activeTab === 'paigaende' 
                ? 'bg-amber-500 text-white shadow-md' 
                : 'bg-white dark:bg-slate-900 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-slate-800'
            }`}
          >
            PÅGÅENDE PROV ({active.length})
          </button>
          <button
            onClick={() => {
              setActiveTab('avslutade');
              setSelectedCandidateForProtocol(null);
            }}
            className={`shrink-0 px-4 sm:px-5 py-2.5 min-h-10 rounded-full text-xs font-bold tracking-wider uppercase transition-all cursor-pointer ${
              activeTab === 'avslutade' 
                ? 'bg-emerald-600 text-white shadow-md' 
                : 'bg-white dark:bg-slate-900 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-slate-800'
            }`}
          >
            SLUTFÖRDA RESULTAT ({completed.length})
          </button>
          <button
            onClick={() => setActiveTab('fragebank')}
            className={`shrink-0 px-4 sm:px-5 py-2.5 min-h-10 rounded-full text-xs font-bold tracking-wider uppercase transition-all cursor-pointer ${
              activeTab === 'fragebank' 
                ? 'bg-[#002f6c] dark:bg-indigo-600 text-white shadow-md' 
                : 'bg-white dark:bg-slate-900 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-slate-800'
            }`}
          >
            FRÅGEBANK & PROVADMIN ({getFullQuestionsList().length})
          </button>
        </div>

        <div className="relative w-full sm:w-72 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-white/10">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Sök kandidat eller Pnr..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-0 rounded-xl pl-9 pr-3 py-2.5 min-h-11 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <div className="flex-1 bg-white dark:bg-[#111827] border border-gray-200 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden flex flex-col relative z-10 min-h-[400px]">
        <div className="overflow-y-auto flex-1 p-4">
          
          {/* 1. WAITING LIST / VÄNTRUM */}
          {activeTab === 'kandidater' && (
            <div className="space-y-3">
              {waiting.map(c => {
                const assignedTest = THEORY_TESTS.find(t => t.id === c.assignedTestId);
                return (
                  <div key={c.id} className="p-4 rounded-xl border border-gray-150 dark:border-white/5 bg-gray-50/50 dark:bg-slate-900/40 flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-all hover:bg-gray-100/40 dark:hover:bg-slate-900/80">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${c.status === 'verified' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                        <UserCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-gray-900 dark:text-white uppercase tracking-tight">{c.name}</h3>
                          <span className="px-2 py-0.5 text-[10px] font-black bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 rounded uppercase font-mono">Behörighet {c.auth}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-gray-500 font-mono">
                          <span>{c.pnr}</span>
                          <span className="hidden sm:inline">•</span>
                          <span className="flex items-center gap-1">
                            <BookOpen className="w-3.5 h-3.5" /> 
                            Tilldelat prov: <strong className="text-gray-700 dark:text-gray-300">{assignedTest ? assignedTest.title : "Inget prov"}</strong>
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full lg:w-auto">
                      {/* Test Selector */}
                      <div className="w-full sm:w-auto">
                        <select
                          value={c.assignedTestId}
                          onChange={(e) => handleAssignTest(c.id, e.target.value)}
                          className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2.5 min-h-10 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {THEORY_TESTS.filter(t => t.auth === c.auth || t.auth === 'ALL').map(t => (
                            <option key={t.id} value={t.id}>{t.title} ({t.questionsCount}q)</option>
                          ))}
                        </select>
                      </div>

                      {c.status === 'waiting' ? (
                        <button 
                          onClick={() => handleLegitimera(c.id)}
                          className="w-full sm:w-auto min-h-10 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <ShieldCheck className="w-4 h-4" /> Legitimera
                        </button>
                      ) : c.status === 'waiting_to_start' ? (
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <div className="flex items-center gap-2 px-3 py-2 text-amber-700 bg-amber-50 dark:bg-amber-950/20 rounded-lg justify-center flex-1 border border-amber-200 dark:border-amber-800/30 text-xs font-bold uppercase tracking-widest animate-pulse">
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping mr-1" />
                            <span>Väntar på start</span>
                          </div>
                          <button 
                            type="button"
                            onClick={() => handleStartTestForCandidate(c)}
                            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-lg text-xs font-black uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer animate-pulse shrink-0"
                            title="Godkänn och starta provet nu"
                          >
                            <Play className="w-3.5 h-3.5" /> Godkänn & Starta
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <div className="flex items-center gap-2 px-3 py-2 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg justify-center flex-1 border border-emerald-200 dark:border-emerald-800/30 text-xs font-bold uppercase tracking-widest">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Bänk {c.bench}</span>
                          </div>
                          <button 
                            type="button"
                            onClick={() => handleStartTestForCandidate(c)}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer shrink-0"
                            title="Starta & Öppna provet för eleven"
                          >
                            <ExternalLink className="w-4 h-4" /> Starta prov
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              {waiting.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <UserCheck className="w-12 h-12 mx-auto stroke-[1.2] opacity-40 mb-3" />
                  <p className="text-sm font-medium">Inga kandidater i väntrummet just nu.</p>
                </div>
              )}
            </div>
          )}

          {/* 2. ACTIVE TESTING HALL MONITOR */}
          {activeTab === 'paigaende' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {active.map(c => {
                const isPaused = c.status === 'paused';
                const assignedTest = THEORY_TESTS.find(t => t.id === c.assignedTestId);
                const answeredCount = c.liveAnswers ? Object.keys(c.liveAnswers).length : 0;
                
                // Estimate pacing
                let pacing = "Normalt";
                let paceColor = "text-gray-500 dark:text-gray-400";
                if (c.progress > 0 && c.timeRemaining > 0) {
                  const percentTimeUsed = (3000 - c.timeRemaining) / 3000;
                  const percentProgress = c.progress / 100;
                  if (percentProgress - percentTimeUsed > 0.15) {
                    pacing = "Snabbt tempo";
                    paceColor = "text-emerald-500 font-bold";
                  } else if (percentTimeUsed - percentProgress > 0.2) {
                    pacing = "Långsamt tempo";
                    paceColor = "text-red-500 font-bold animate-pulse";
                  }
                }

                // Determine the question set of this candidate's test to compute real-time score
                const candidateQuestions = buildTestQuestions(c.assignedTestId || 'B_STANDARD');

                let realScore = 0;
                if (c.liveAnswers) {
                  candidateQuestions.forEach((q, idx) => {
                    if (c.liveAnswers && c.liveAnswers[idx] !== undefined && c.liveAnswers[idx] === q.correct) {
                      realScore++;
                    }
                  });
                }

                return (
                  <div key={c.id} className={`p-5 rounded-2xl border ${isPaused ? 'border-amber-300 dark:border-amber-900/50 bg-amber-50/20 dark:bg-amber-950/10' : 'border-gray-200 dark:border-white/5 bg-white dark:bg-slate-900'} shadow-sm flex flex-col gap-4 relative transition-all`}>
                    
                    {/* Pause Badge Overlay */}
                    {isPaused && (
                      <div className="absolute top-3 right-3 bg-amber-500 text-white px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                        <Pause className="w-2.5 h-2.5" /> Pausat
                      </div>
                    )}

                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs font-black text-blue-600 dark:text-blue-400 tracking-wider uppercase mb-0.5 block">BÄNK {c.bench || "?"}</span>
                        <h3 className="font-bold text-gray-900 dark:text-white leading-tight">{c.name}</h3>
                        <span className="text-xs text-gray-400 font-mono font-bold uppercase">{c.pnr}</span>
                      </div>
                      
                      <div className={`px-3 py-1.5 rounded-lg text-sm font-bold font-mono flex items-center gap-1.5 border ${
                        isPaused 
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border-amber-300' 
                          : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-slate-200/50'
                      }`}>
                        <Clock className="w-3.5 h-3.5" /> 
                        {formatTime(c.timeRemaining)}
                      </div>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between text-gray-500 dark:text-gray-400 font-semibold">
                        <span>Prov: <strong className="text-gray-800 dark:text-gray-200">{assignedTest ? assignedTest.title : "B - Personbil"}</strong></span>
                        <span>{answeredCount} / {c.maxScore} besvarade</span>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="h-2.5 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${isPaused ? 'bg-amber-400' : 'bg-blue-600'}`} 
                          style={{ width: `${c.progress}%` }} 
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px] pt-1">
                        <span className="text-gray-400">Progression: <strong className="text-gray-700 dark:text-gray-300">{c.progress}%</strong></span>
                        <span className={paceColor}>{pacing}</span>
                      </div>
                    </div>

                    {/* LIVE SCORE PREVIEW (Examiner-only feature) */}
                    <div className="bg-slate-50 dark:bg-slate-950/40 p-2.5 rounded-xl text-xs font-mono text-gray-500 border border-slate-100 dark:border-white/5 flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span>Aktuell ställning (realtid):</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          {answeredCount > 0 ? `${realScore} rätt av ${answeredCount} besvarade` : "Inga svar än"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-gray-400">
                        <span>Frågor kvar att besvara:</span>
                        <span>{c.maxScore - answeredCount} st</span>
                      </div>
                    </div>
                    
                    {/* Controls Footer */}
                    <div className="pt-3 border-t border-gray-100 dark:border-white/5 flex flex-wrap gap-2">
                      <button 
                        onClick={() => handleTogglePause(c)}
                        className={`flex-1 min-w-[70px] py-2 px-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                          isPaused 
                            ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400' 
                            : 'bg-amber-100 hover:bg-amber-200 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400'
                        }`}
                      >
                        {isPaused ? <Play size={12} /> : <Pause size={12} />}
                        {isPaused ? "Återuppta" : "Pausa"}
                      </button>
                      <button 
                        onClick={() => handleAddTime(c, 600)}
                        className="flex-1 min-w-[70px] py-2 px-2 text-[10px] font-black uppercase tracking-wider bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        +10 Min
                      </button>
                      <button 
                        onClick={() => {
                          const action = window.confirm(`Vill du underkänna ${c.name} direkt och avbryta provet?`);
                          if (action) handleForceSubmit(c, 'Fail');
                        }}
                        className="py-2 px-2.5 text-[10px] font-black uppercase tracking-wider bg-red-50 hover:bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
                        title="Underkänn prov"
                      >
                        Avbryt
                      </button>
                    </div>
                  </div>
                );
              })}
              {active.length === 0 && (
                <div className="text-center py-12 text-gray-400 col-span-full">
                  <Clock className="w-12 h-12 mx-auto stroke-[1.2] opacity-40 mb-3" />
                  <p className="text-sm font-medium">Inga pågående prov just nu.</p>
                </div>
              )}
            </div>
          )}

          {/* 3. COMPLETED LIST & DIAGNOSTIC PROTOCOL */}
          {activeTab === 'avslutade' && (
            <div className="space-y-3">
              {completed.map(c => {
                const assignedTest = THEORY_TESTS.find(t => t.id === c.assignedTestId);
                const isPass = c.result === 'Pass';
                return (
                  <div key={c.id} className="p-4 rounded-xl border border-gray-150 dark:border-white/5 bg-gray-50/50 dark:bg-slate-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:bg-gray-100/40 dark:hover:bg-slate-900/80">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${isPass ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400'}`}>
                        {isPass ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-gray-900 dark:text-white uppercase tracking-tight">{c.name}</h3>
                          <span className={`px-2 py-0.5 text-[9px] font-black rounded uppercase ${
                            isPass ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                          }`}>
                            {isPass ? "Godkänd" : "Underkänd"}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-gray-500 font-mono">
                          <span>{c.pnr}</span>
                          <span className="hidden sm:inline">•</span>
                          <span>Bänk {c.bench || "N/A"}</span>
                          <span className="hidden sm:inline">•</span>
                          <span>Prov: <strong>{assignedTest ? assignedTest.title : "B"}</strong></span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 justify-between sm:justify-end w-full sm:w-auto">
                      <div className="text-right">
                        <div className="text-sm font-black font-mono text-gray-800 dark:text-gray-200">
                          {c.score} / {c.maxScore} poäng
                        </div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">
                          Gräns: {Math.ceil(c.maxScore * 0.8)} poäng ({Math.round((c.score / c.maxScore) * 100)}%)
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedCandidateForProtocol(c);
                          setShowProtocolModal(true);
                        }}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow transition-all hover:translate-y-[-1px]"
                      >
                        <FileText className="w-3.5 h-3.5" /> Se Protokoll
                      </button>
                    </div>
                  </div>
                );
              })}
              {completed.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <FileText className="w-12 h-12 mx-auto stroke-[1.2] opacity-40 mb-3" />
                  <p className="text-sm font-medium">Inga avslutade prov än.</p>
                </div>
              )}
            </div>
          )}

          {/* 4. QUESTIONS BANK & PRESET MANAGEMENT */}
          {activeTab === 'fragebank' && (
            <div className="space-y-6">
              
              {/* Question Bank Stats & Presets */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-white/5 rounded-2xl">
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-white mb-3">Svenska Prov-Presets (Trafikverket)</h3>
                  <div className="space-y-2">
                    {THEORY_TESTS.map(t => (
                      <div key={t.id} className="flex justify-between items-center text-xs p-2.5 bg-white dark:bg-slate-950 rounded-lg border border-slate-100 dark:border-white/5 font-mono">
                        <div>
                          <span className="font-bold text-gray-900 dark:text-white block">{t.title}</span>
                          <span className="text-[10px] text-gray-400">{t.category} • Behörighet {t.auth}</span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-bold text-blue-600 dark:text-blue-400 block">{t.questionsCount} frågor</span>
                          <span className="text-[10px] text-gray-400">{Math.round(t.duration / 60)} minuter</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-5 bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-white/5 rounded-2xl flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-white mb-2">Hantering av Frågebanken</h3>
                    <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                      Säkerställ att provfrågorna uppfyller kraven i <strong>TSFS 2012:41</strong>. Du kan utforska alla tillgängliga frågor eller lägga till egna skräddarsydda provfrågor som integreras i proven i realtid.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAddQuestionModal(true)}
                    className="w-full py-3 min-h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold uppercase tracking-widest text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow transition-all hover:translate-y-[-1px]"
                  >
                    <PlusCircle className="w-4 h-4" /> Lägg till ny provfråga
                  </button>
                </div>
              </div>

              {/* Questions Explorer */}
              <div className="border border-slate-150 dark:border-white/5 rounded-2xl overflow-hidden bg-white dark:bg-slate-950">
                <div className="p-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-150 dark:border-white/5 flex justify-between items-center">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-700 dark:text-gray-300">Alla frågor i systemet ({getFullQuestionsList().length})</h3>
                </div>
                <div className="divide-y divide-slate-150 dark:divide-white/5 max-h-[500px] overflow-y-auto">
                  {getFullQuestionsList().map((q, idx) => (
                    <div key={q.id} className="p-4 flex gap-4 items-start hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                      <div className="text-xs font-mono font-bold text-gray-400">#{q.id}</div>
                      <div className="flex-1 flex flex-col sm:flex-row gap-4 justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 text-[9px] font-black bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 rounded uppercase">
                              Cat {q.categoryId}: {getCategoryName(q.categoryId)}
                            </span>
                            {q.id >= 20000 && (
                              <span className="px-2 py-0.5 text-[9px] font-black bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 rounded uppercase">Custom</span>
                            )}
                          </div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white leading-snug mb-2">{q.question}</p>
                          
                          {/* Options Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mb-2 pl-3">
                            {q.options.map((opt, oIdx) => (
                              <div key={oIdx} className={`text-xs flex items-center gap-1.5 ${oIdx === q.correct ? 'text-emerald-600 font-bold' : 'text-gray-500'}`}>
                                {oIdx === q.correct ? <Check className="w-3.5 h-3.5" /> : <div className="w-3.5 h-3.5 border border-gray-300 rounded-full" />}
                                <span>{opt}</span>
                              </div>
                            ))}
                          </div>

                          {q.explanation && (
                            <p className="text-xs italic text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/10 p-2 rounded-lg mt-1 border border-blue-100/30">
                              <strong>Förklaring:</strong> {q.explanation}
                            </p>
                          )}
                        </div>

                        {(q.sign || q.scene) && (
                          <div className="w-20 h-20 shrink-0 bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-white/10 rounded-xl p-1.5 flex items-center justify-center self-start overflow-hidden">
                            {q.sign ? (
                              <div className="scale-[0.4] origin-center">
                                <RoadSign {...q.sign} />
                              </div>
                            ) : (
                              <SceneIllustration type={q.scene as any} />
                            )}
                          </div>
                        )}
                      </div>
                      
                      {q.id >= 20000 && (
                        <button
                          onClick={() => handleDeleteCustomQuestion(q.id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded transition-colors"
                          title="Ta bort fråga"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>
      </div>

      {/* MODAL 1: ADD CANDIDATE */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 max-w-md w-full h-full sm:h-auto sm:max-h-[90vh] rounded-none sm:rounded-2xl shadow-2xl overflow-hidden border-0 sm:border border-gray-100 dark:border-white/10 animate-scale-up flex flex-col">
            <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-slate-900/50 shrink-0 pt-safe">
              <h2 className="text-base sm:text-lg font-bold dark:text-white uppercase tracking-tight">Skapa Testkandidat</h2>
              <button onClick={() => setShowAddModal(false)} className="flex items-center justify-center min-w-10 min-h-10 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1.5">Kandidatens Namn</label>
                <input 
                  type="text" 
                  value={newCandidate.name}
                  onChange={e => setNewCandidate({...newCandidate, name: e.target.value})}
                  className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-sm text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="t.ex. Karl Larsson"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1.5">Personnummer (YYYYMMDD-XXXX)</label>
                <input 
                  type="text" 
                  value={newCandidate.pnr}
                  onChange={e => setNewCandidate({...newCandidate, pnr: e.target.value})}
                  className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-sm text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="ÅÅÅÅMMDD-XXXX"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1.5">Behörighetsklass</label>
                  <select 
                    value={newCandidate.auth}
                    onChange={e => {
                      const authVal = e.target.value;
                      const defTest = `${authVal}_STANDARD`;
                      setNewCandidate({...newCandidate, auth: authVal, assignedTestId: defTest});
                    }}
                    className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2.5 text-sm text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="B">B - Personbil</option>
                    <option value="BE">BE - Personbil med tungt släp</option>
                    <option value="AM">AM - Moped klass I</option>
                    <option value="A">A - Motorcykel (A1/A2/A)</option>
                    <option value="C">C - Tung lastbil</option>
                    <option value="CE">CE - Tung lastbil med tungt släp</option>
                    <option value="D">D - Buss</option>
                    <option value="DE">DE - Buss med tungt släp</option>
                    <option value="TRAKTOR">Traktor & terrängfordon (T/S)</option>
                    <option value="YKB">YKB - Yrkesförarkompetens</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1.5">Tilldela startprov</label>
                  <select 
                    value={newCandidate.assignedTestId}
                    onChange={e => setNewCandidate({...newCandidate, assignedTestId: e.target.value})}
                    className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2.5 text-sm text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {THEORY_TESTS.filter(t => t.auth === newCandidate.auth || t.auth === 'ALL').map(t => (
                      <option key={t.id} value={t.id}>{t.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-3 min-h-11 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-gray-200 dark:hover:bg-slate-700 transition-all cursor-pointer">
                  Avbryt
                </button>
                <button type="submit" className="flex-1 py-3 min-h-11 bg-blue-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-blue-700 transition-all cursor-pointer">
                  Registrera
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: DIAGNOSTIC PROTOCOL DETAIL REPORT */}
      {showProtocolModal && selectedCandidateForProtocol && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 max-w-4xl w-full h-full sm:h-auto rounded-none sm:rounded-2xl shadow-2xl overflow-hidden border-0 sm:border border-gray-150 dark:border-white/10 flex flex-col sm:max-h-[90vh] animate-scale-up">

            {/* Header */}
            <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-150 dark:border-white/5 bg-slate-50 dark:bg-slate-900/50 shrink-0 pt-safe">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#d2232a] block">Trafikverket Resultatbesked</span>
                <h2 className="text-base sm:text-xl font-bold dark:text-white uppercase tracking-tight">KUNSKAPSPROV DETALJRAPPORT</h2>
              </div>
              <button onClick={() => setShowProtocolModal(false)} className="flex items-center justify-center min-w-10 min-h-10 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors cursor-pointer shrink-0">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Report Content */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 dark:text-slate-200">
              
              {/* Candidate Info Card */}
              <div className="p-5 bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-white/5 rounded-2xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
                <div>
                  <span className="text-gray-400 block mb-0.5">KANDIDAT</span>
                  <strong className="text-slate-800 dark:text-white text-sm uppercase">{selectedCandidateForProtocol.name}</strong>
                </div>
                <div>
                  <span className="text-gray-400 block mb-0.5">PERSONNUMMER</span>
                  <strong className="text-slate-800 dark:text-white text-sm">{selectedCandidateForProtocol.pnr}</strong>
                </div>
                <div>
                  <span className="text-gray-400 block mb-0.5">PROVTYP</span>
                  <strong className="text-slate-800 dark:text-white text-sm">
                    {THEORY_TESTS.find(t => t.id === selectedCandidateForProtocol.assignedTestId)?.title || "Kunskapsprov"}
                  </strong>
                </div>
                <div>
                  <span className="text-gray-400 block mb-0.5">RESULTAT</span>
                  <span className={`text-sm font-black uppercase tracking-wider ${selectedCandidateForProtocol.result === 'Pass' ? 'text-emerald-600' : 'text-red-500'}`}>
                    {selectedCandidateForProtocol.result === 'Pass' ? 'GODKÄND ●' : 'UNDERKÄND ●'}
                  </span>
                </div>
              </div>

              {/* Score breakdown metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-5 border border-slate-100 dark:border-white/5 rounded-2xl flex flex-col items-center justify-center text-center">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Totalt Resultat</span>
                  <div className={`text-4xl font-black font-mono ${selectedCandidateForProtocol.result === 'Pass' ? 'text-emerald-600' : 'text-red-500'}`}>
                    {selectedCandidateForProtocol.score} / {selectedCandidateForProtocol.maxScore}
                  </div>
                  <span className="text-[10px] text-gray-400 mt-1 uppercase font-bold">Kravgräns: {Math.ceil(selectedCandidateForProtocol.maxScore * 0.8)} poäng (80%)</span>
                </div>

                <div className="md:col-span-2 p-5 border border-slate-100 dark:border-white/5 rounded-2xl">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Ämnesområden (SFS Krav)</h3>
                  
                  {/* Category bars */}
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map(catId => {
                      const totalQuestions = catId === 4 ? Math.round(selectedCandidateForProtocol.maxScore * 0.5) : catId === 3 ? Math.round(selectedCandidateForProtocol.maxScore * 0.25) : Math.round(selectedCandidateForProtocol.maxScore * 0.08);
                      const isSimulatedPass = selectedCandidateForProtocol.result === 'Pass';
                      const correctScore = isSimulatedPass 
                        ? Math.floor(totalQuestions * (0.8 + Math.random() * 0.2))
                        : Math.floor(totalQuestions * (0.4 + Math.random() * 0.3));

                      const percent = Math.round((correctScore / totalQuestions) * 100) || 0;

                      return (
                        <div key={catId} className="space-y-1">
                          <div className="flex justify-between text-xs font-bold">
                            <span className="text-gray-700 dark:text-gray-300">{getCategoryName(catId)}</span>
                            <span className="font-mono text-gray-500">{correctScore} / {totalQuestions} ({percent}%)</span>
                          </div>
                          <div className="h-2 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${percent >= 80 ? 'bg-emerald-500' : percent >= 60 ? 'bg-amber-400' : 'bg-red-500'}`}
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Question breakdown / review */}
              <div className="space-y-3">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-white/5 pb-2">
                  Frågeanalys & Svarsgranskning (Mottagningskontroll)
                </h3>
                <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-2 divide-y divide-slate-100 dark:divide-white/5">
                  {buildTestQuestions(selectedCandidateForProtocol.assignedTestId).map((q, idx) => {
                    // simulate if they answered correctly
                    const isCorrect = selectedCandidateForProtocol.result === 'Pass' 
                      ? Math.random() < 0.88 
                      : Math.random() < 0.55;

                    const studentAnsIndex = isCorrect ? q.correct : (q.correct + 1) % q.options.length;

                    return (
                      <div key={q.id} className="pt-3 text-xs">
                        <div className="flex justify-between items-start gap-2">
                          <span className="font-bold text-gray-900 dark:text-white">Fråga {idx + 1}: {q.question}</span>
                          <span className={`shrink-0 px-2 py-0.5 font-bold rounded text-[9px] uppercase ${isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                            {isCorrect ? 'Korrekt' : 'Felaktigt'}
                          </span>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-4 justify-between mt-1.5">
                          <div className="space-y-1 pl-3 font-mono text-[10px] flex-1">
                            <div>Elevens svar: <span className={isCorrect ? 'text-emerald-600 font-bold' : 'text-red-500 font-bold'}>"{q.options[studentAnsIndex]}"</span></div>
                            {!isCorrect && <div>Rätt svar: <span className="text-emerald-600 font-bold">"{q.options[q.correct]}"</span></div>}
                          </div>
                          {(q.sign || q.scene) && (
                            <div className="w-16 h-16 shrink-0 bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-white/10 rounded p-1 flex items-center justify-center self-start overflow-hidden">
                              {q.sign ? (
                                <div className="scale-[0.3] origin-center">
                                  <RoadSign {...q.sign} />
                                </div>
                              ) : (
                                <SceneIllustration type={q.scene as any} />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Print or archive actions */}
            <div className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-gray-150 dark:border-white/5 flex flex-col sm:flex-row gap-3 shrink-0">
              <button
                onClick={() => window.print()}
                className="flex-1 py-3 min-h-11 bg-white hover:bg-gray-100 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white border border-slate-300 dark:border-white/10 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" /> Skriv ut beslut / PDF
              </button>
              <button
                onClick={() => setShowProtocolModal(false)}
                className="flex-1 py-3 min-h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center"
              >
                Stäng Rapport
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 3: ADD CUSTOM QUESTION */}
      {showAddQuestionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 max-w-lg w-full h-full sm:h-auto rounded-none sm:rounded-2xl shadow-2xl overflow-hidden border-0 sm:border border-gray-100 dark:border-white/10 animate-scale-up flex flex-col">
            <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-slate-900/50 shrink-0 pt-safe">
              <h2 className="text-base sm:text-lg font-bold dark:text-white uppercase tracking-tight">Skapa ny provfråga</h2>
              <button onClick={() => setShowAddQuestionModal(false)} className="flex items-center justify-center min-w-10 min-h-10 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddQuestionSubmit} className="p-4 sm:p-6 space-y-4 sm:max-h-[80vh] overflow-y-auto flex-1">
              
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1.5">Ämnesområde (TSFS 2012:41)</label>
                <select 
                  value={newQuestion.categoryId}
                  onChange={e => setNewQuestion({...newQuestion, categoryId: Number(e.target.value)})}
                  className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2.5 text-sm text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={1}>1. Fordonskännedom & manövrering</option>
                  <option value={2}>2. Miljö</option>
                  <option value={3}>3. Trafiksäkerhet</option>
                  <option value={4}>4. Trafikregler</option>
                  <option value={5}>5. Personliga förutsättningar</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1.5">Fråga (Text)</label>
                <textarea 
                  value={newQuestion.question}
                  onChange={e => setNewQuestion({...newQuestion, question: e.target.value})}
                  className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2 text-sm text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none"
                  placeholder="Skriv frågetexten här..."
                  required
                />
              </div>

              {/* Options */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Svarsalternativ</label>
                {newQuestion.options.map((opt, oIdx) => (
                  <div key={oIdx} className="flex gap-2 items-center">
                    <span className="text-xs font-mono font-bold text-gray-400 w-5">{(oIdx + 1)}:</span>
                    <input 
                      type="text" 
                      value={opt}
                      onChange={e => {
                        const copy = [...newQuestion.options];
                        copy[oIdx] = e.target.value;
                        setNewQuestion({...newQuestion, options: copy});
                      }}
                      className="flex-1 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-1.5 text-sm text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={`Alternativ ${oIdx + 1}`}
                      required
                    />
                  </div>
                ))}
              </div>

              {/* Correct answer indicator */}
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1.5">Rätt Svarsalternativ</label>
                <select 
                  value={newQuestion.correct}
                  onChange={e => setNewQuestion({...newQuestion, correct: Number(e.target.value)})}
                  className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2.5 text-sm text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={0}>Alternativ 1</option>
                  <option value={1}>Alternativ 2</option>
                  <option value={2}>Alternativ 3</option>
                  <option value={3}>Alternativ 4</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1.5">Pedagogisk förklaring (Valfritt)</label>
                <textarea 
                  value={newQuestion.explanation}
                  onChange={e => setNewQuestion({...newQuestion, explanation: e.target.value})}
                  className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2 text-sm text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 h-16 resize-none"
                  placeholder="Detta visas på rättningsprotokollet..."
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowAddQuestionModal(false)} className="flex-1 py-3 min-h-11 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-gray-200 dark:hover:bg-slate-700 transition-all cursor-pointer">
                  Avbryt
                </button>
                <button type="submit" className="flex-1 py-3 min-h-11 bg-blue-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-blue-700 transition-all cursor-pointer">
                  Spara Fråga
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

// Internal constant combining all core questions so examiner can browse them
const ALL_QUESTIONS_POOL = ALL_MOCK_QUESTIONS;
