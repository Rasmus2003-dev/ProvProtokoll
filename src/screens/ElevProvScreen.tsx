import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  ArrowLeft, 
  ChevronLeft,
  ChevronRight,
  Clock, 
  AlertCircle, 
  Lock, 
  User, 
  AlertTriangle, 
  Volume2, 
  Maximize2, 
  Loader2, 
  CheckCircle, 
  XCircle,
  HelpCircle,
  Info,
  Share2,
  Check
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  Question,
  buildTestQuestions as buildTestQuestionsShared 
} from '../data/mockQuestions';
import { THEORY_TESTS } from './TeoriprovScreen';
import { RoadSign, PostombudOption, SceneIllustration } from '../components/RoadSigns';
import { miniDb } from '../lib/db';

export { RoadSign, PostombudOption, SceneIllustration };

// Interface for sharing same candidates list state with examiner
export interface TheoryCandidate {
  id: string;
  name: string;
  pnr: string;
  auth: string;
  status: 'waiting' | 'verified' | 'waiting_to_start' | 'active' | 'paused' | 'completed';
  bench: number | null;
  assignedTestId: string;
  result: 'Pass' | 'Fail' | '';
  score: number;
  maxScore: number;
  progress: number;
  timeRemaining: number;
  liveAnswers?: Record<number, number>;
  markedQuestions?: Record<number, boolean>;
}

export function ElevProvScreen() {
  const navigate = useNavigate();

  // Force Light mode strictly for testing authenticity
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    return () => {
      if (localStorage.getItem('theme') === 'dark') {
        document.documentElement.classList.add('dark');
      }
    };
  }, []);

  // Shared state structures
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [pnrInput, setPnrInput] = useState('');
  const [studentName, setStudentName] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [activeCandidate, setActiveCandidate] = useState<TheoryCandidate | null>(null);

  // Active exam variables
  const [selectedTest, setSelectedTest] = useState<string | null>(null);
  const [currentTestQuestions, setCurrentTestQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [marked, setMarked] = useState<Record<number, boolean>>({});
  const [timeLeft, setTimeLeft] = useState(3000); // dynamic based on test
  const [showTime, setShowTime] = useState(true);
  
  // Status overlays
  const [isWaitingForStart, setIsWaitingForStart] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Test result summary
  const [testResult, setTestResult] = useState<{
    score: number;
    passed: boolean;
    total: number;
    categoryScores: Record<number, { correct: number, total: number }>
  } | null>(null);

  const [copiedLink, setCopiedLink] = useState(false);
  const [allowLogin, setAllowLogin] = useState<boolean>(() => {
    const saved = localStorage.getItem('theory_allow_login');
    return saved !== 'false'; // default to true if not set
  });

  const handleCopyPortalLink = () => {
    const link = `${window.location.origin}/elevprov`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Load candidate details on mount if they logged in via Examiner "Starta" action
  useEffect(() => {
    const candName = localStorage.getItem('current_candidate_name');
    const candPnr = localStorage.getItem('current_candidate_pnr');
    const candId = localStorage.getItem('current_candidate_id');
    const savedAllow = localStorage.getItem('theory_allow_login');

    if (savedAllow !== null) {
      setAllowLogin(savedAllow !== 'false');
    }

    if (candName && candPnr && candId) {
      setStudentName(candName);
      setPnrInput(candPnr);
      setIsLoggedIn(true);
      
      // Look up inside shared list
      const saved = localStorage.getItem('theory_candidates_list');
      if (saved) {
        try {
          const list: TheoryCandidate[] = JSON.parse(saved);
          const found = list.find(c => c.id === candId);
          if (found) {
            setActiveCandidate(found);
            setIsPaused(found.status === 'paused');
            
            // Restore test state if active, paused or waiting_to_start
            if (found.status === 'active' || found.status === 'paused') {
              const qList = buildTestQuestions(found.assignedTestId || 'B_STANDARD');
              setCurrentTestQuestions(qList);
              setSelectedTest(found.assignedTestId || 'B_STANDARD');
              setTimeLeft(found.timeRemaining);
              if (found.liveAnswers) {
                setSelectedAnswers(found.liveAnswers);
              }
              setIsWaitingForStart(false);
            } else if (found.status === 'waiting_to_start') {
              const qList = buildTestQuestions(found.assignedTestId || 'B_STANDARD');
              setCurrentTestQuestions(qList);
              setSelectedTest(found.assignedTestId || 'B_STANDARD');
              setTimeLeft(found.timeRemaining);
              setIsWaitingForStart(true);
            }
          }
        } catch(e) {}
      }
    }
  }, []);

  // Real-time synchronization storage listener
  useEffect(() => {
    const handleRemoteChanges = (e: Event) => {
      // Sync allowLogin state
      const savedAllow = localStorage.getItem('theory_allow_login');
      if (savedAllow !== null) {
        setAllowLogin(savedAllow !== 'false');
      }

      // Fetch direct from localStorage to support cross-tab and same-tab dispatch events
      const saved = localStorage.getItem('theory_candidates_list');
      if (saved) {
        try {
          const list: TheoryCandidate[] = JSON.parse(saved);
          const currentId = localStorage.getItem('current_candidate_id') || activeCandidate?.id;
          if (currentId) {
            const found = list.find(c => c.id === currentId);
            if (found) {
              setActiveCandidate(found);
              setIsPaused(found.status === 'paused');
              
              if (found.status === 'active' && isWaitingForStart) {
                setIsWaitingForStart(false);
              }

              // Handle examiner forcing add_time / completed actions
              if (found.timeRemaining !== timeLeft && found.status === 'active') {
                setTimeLeft(found.timeRemaining);
              }

              if (found.status === 'completed' && !isSubmitted) {
                // Force fail or exit
                calculateAndSubmitTest(found.score >= found.maxScore * 0.8, found.score);
              }
            }
          }
        } catch (err) {}
      }

      // Handle specific commands
      const forceAction = localStorage.getItem('mock_prov_force_action');
      if (forceAction) {
        try {
          const parsed = JSON.parse(forceAction);
          const currentId = localStorage.getItem('current_candidate_id') || activeCandidate?.id;
          if (parsed.id === currentId) {
            if (parsed.action === 'add_time') {
              setTimeLeft(t => t + parsed.amount);
            } else if (parsed.action === 'force_submit') {
              calculateAndSubmitTest(parsed.result === 'Pass', parsed.score);
            } else if (parsed.action === 'pause') {
              setIsPaused(true);
            } else if (parsed.action === 'resume') {
              setIsPaused(false);
              setIsWaitingForStart(false);
            }
          }
        } catch (err) {}
      }
    };

    window.addEventListener('storage', handleRemoteChanges);
    return () => window.removeEventListener('storage', handleRemoteChanges);
  }, [activeCandidate, timeLeft, isSubmitted, isWaitingForStart]);

  // Clock countdown loop
  useEffect(() => {
    if (selectedTest && !isSubmitted && !isWaitingForStart && !isPaused) {
      const timer = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            clearInterval(timer);
            // Auto submit when time runs out
            calculateAndSubmitTest();
            return 0;
          }
          const nextTime = t - 1;
          // Sync clock state to master list
          updateMasterCandidateList({ timeRemaining: nextTime });
          return nextTime;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [selectedTest, isSubmitted, isWaitingForStart, isPaused]);

  // Synchronize student answering progression live to examiner dashboard
  const updateMasterCandidateList = (updates: Partial<TheoryCandidate>) => {
    const currentId = localStorage.getItem('current_candidate_id') || activeCandidate?.id;
    if (!currentId) return;

    const saved = localStorage.getItem('theory_candidates_list');
    if (saved) {
      try {
        const list: TheoryCandidate[] = JSON.parse(saved);
        const nextList = list.map(c => {
          if (c.id === currentId) {
            return { ...c, ...updates };
          }
          return c;
        });
        localStorage.setItem('theory_candidates_list', JSON.stringify(nextList));
        window.dispatchEvent(new Event('storage'));
      } catch (e) {}
    }
  };

  // Login handler
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pnrInput) return;

    // Check if examiner allows login
    const savedAllow = localStorage.getItem('theory_allow_login');
    const isLoginPermitted = savedAllow !== 'false';
    if (!isLoginPermitted) {
      setLoginError('Provsalen är stängd för inloggning för tillfället. Kontakta provledaren.');
      return;
    }

    const cleanPnr = pnrInput.replace(/\D/g, '');
    let candidateRecord: TheoryCandidate | null = null;

    // 1. Check inside shared theory candidates list
    const saved = localStorage.getItem('theory_candidates_list');
    let list: TheoryCandidate[] = [];
    if (saved) {
      try {
        list = JSON.parse(saved);
        const found = list.find(c => c.pnr.replace(/\D/g, '') === cleanPnr);
        if (found) {
          candidateRecord = found;
        }
      } catch (err) {}
    }

    // 2. Check mini SQL database
    if (!candidateRecord) {
      const dbUser = miniDb.selectUsers().find(u => u.personalNumber.replace(/\D/g, '') === cleanPnr);
      if (dbUser) {
        candidateRecord = {
          id: dbUser.id,
          name: dbUser.name,
          pnr: dbUser.personalNumber,
          auth: dbUser.authClass || 'B',
          status: 'waiting',
          bench: Number(dbUser.bench) || Math.floor(Math.random() * 24) + 1,
          assignedTestId: `${dbUser.authClass || 'B'}_STANDARD`,
          result: '',
          score: 0,
          maxScore: 65,
          progress: 0,
          timeRemaining: 3000
        };
        list.push(candidateRecord);
        localStorage.setItem('theory_candidates_list', JSON.stringify(list));
      }
    }

    // 3. Fallback: If user enters a name and valid pnr, auto-create candidate record
    if (!candidateRecord && studentName.trim().length >= 2 && cleanPnr.length >= 8) {
      candidateRecord = {
        id: 'cand-' + Date.now(),
        name: studentName.trim(),
        pnr: pnrInput.trim(),
        auth: 'B',
        status: 'waiting',
        bench: Math.floor(Math.random() * 24) + 1,
        assignedTestId: 'B_STANDARD',
        result: '',
        score: 0,
        maxScore: 65,
        progress: 0,
        timeRemaining: 3000
      };
      list.push(candidateRecord);
      localStorage.setItem('theory_candidates_list', JSON.stringify(list));
    }

    if (!candidateRecord) {
      setLoginError('Det finns inget tilldelat prov för detta personnummer. Ange ditt fullständiga namn och personnummer för att registrera prov.');
      return;
    }

    setLoginError(null);
    localStorage.setItem('current_candidate_id', candidateRecord.id);
    localStorage.setItem('current_candidate_name', candidateRecord.name);
    localStorage.setItem('current_candidate_pnr', candidateRecord.pnr);

    setStudentName(candidateRecord.name);
    setActiveCandidate(candidateRecord);
    setIsLoggedIn(true);
  };

  // Procedural Builder utilizing shared module function with randomized seed per attempt
  const buildTestQuestions = (testId: string) => {
    let customQs: Question[] = [];
    const customSaved = localStorage.getItem('custom_questions_pool');
    if (customSaved) {
      try {
        customQs = JSON.parse(customSaved) || [];
      } catch (e) {}
    }
    // Randomize uniquely per candidate test attempt using timestamp and random salt
    const attemptSalt = Date.now() + '_' + Math.random().toString(36).substring(2, 8);
    const candidateId = activeCandidate?.id || localStorage.getItem('current_candidate_id') || pnrInput || 'elev';
    const seed = `${candidateId}_${attemptSalt}`;
    return buildTestQuestionsShared(testId, customQs, seed);
  };

  // Launch test selection
  const handleStartTest = (testId: string) => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    }

    const qList = buildTestQuestions(testId);
    const testMeta = THEORY_TESTS.find(t => t.id === testId);
    const duration = testMeta ? testMeta.duration : 3000;

    setCurrentTestQuestions(qList);
    setSelectedTest(testId);
    setTimeLeft(duration);
    setCurrentQuestion(0);
    setSelectedAnswers({});
    setMarked({});
    setIsWaitingForStart(true);

    // Update state to waiting_to_start so examiner must explicitly allow/start it
    updateMasterCandidateList({
      status: 'waiting_to_start',
      assignedTestId: testId,
      maxScore: qList.length,
      timeRemaining: duration,
      progress: 0
    });
  };

  // Audio Vocal read aloud helper (sv-SE Localization)
  const handleTTS = (text: string) => {
    if ('speechSynthesis' in window) {
      // Cancel previous
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Attempt Swedish speaker
      const voices = window.speechSynthesis.getVoices();
      const svVoice = voices.find(v => v.lang.startsWith('sv'));
      if (svVoice) {
        utterance.voice = svVoice;
      }
      utterance.lang = 'sv-SE';
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Hoppsan! Röstuppläsning stöds tyvärr inte i denna webbläsare.");
    }
  };

  // Handle single question answer trigger
  const handleAnswerSelect = (optIndex: number) => {
    const nextAnswers = { ...selectedAnswers, [currentQuestion]: optIndex };
    setSelectedAnswers(nextAnswers);

    // Calculate progression percentage
    const progressPercent = Math.round((Object.keys(nextAnswers).length / currentTestQuestions.length) * 100);

    // Save live answers in master list
    updateMasterCandidateList({
      progress: progressPercent,
      liveAnswers: nextAnswers
    });
  };

  const toggleMarkCurrent = () => {
    const nextMarked = { ...marked, [currentQuestion]: !marked[currentQuestion] };
    setMarked(nextMarked);
  };

  // Form submission / correction calculator
  // Local fallback grading, used offline or if the server can't be reached.
  const gradeLocally = () => {
    let score = 0;
    const categoryScores: Record<number, { correct: number, total: number }> = {
      1: { correct: 0, total: 0 },
      2: { correct: 0, total: 0 },
      3: { correct: 0, total: 0 },
      4: { correct: 0, total: 0 },
      5: { correct: 0, total: 0 }
    };

    currentTestQuestions.forEach((q, idx) => {
      const studentAns = selectedAnswers[idx];
      const isCorrect = studentAns === q.correct;
      const cat = q.categoryId || 4; // default rules

      if (!categoryScores[cat]) {
        categoryScores[cat] = { correct: 0, total: 0 };
      }

      categoryScores[cat].total += 1;
      if (isCorrect) {
        score += 1;
        categoryScores[cat].correct += 1;
      }
    });

    const passedLimit = Math.ceil(currentTestQuestions.length * 0.8);
    return { score, total: currentTestQuestions.length, passed: score >= passedLimit, categoryScores };
  };

  const calculateAndSubmitTest = async (forcePass?: boolean, forceScore?: number) => {
    setIsSubmitted(true);
    setShowConfirmDialog(false);

    let result: { score: number; total: number; passed: boolean; categoryScores: Record<number, { correct: number, total: number }> };

    if (forceScore !== undefined || forcePass !== undefined) {
      const local = gradeLocally();
      result = {
        score: forceScore !== undefined ? forceScore : local.score,
        total: local.total,
        passed: forcePass !== undefined ? forcePass : local.passed,
        categoryScores: local.categoryScores,
      };
    } else if (navigator.onLine) {
      try {
        const res = await fetch('/api/theory/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ testId: selectedTest, answers: selectedAnswers }),
        });
        if (!res.ok) throw new Error('grading failed');
        result = await res.json();
      } catch {
        result = gradeLocally();
      }
    } else {
      result = gradeLocally();
    }

    const { score, total, passed, categoryScores } = result;

    setTestResult({
      score,
      passed,
      total,
      categoryScores
    });

    // Finalize Candidate status in master list
    updateMasterCandidateList({
      status: 'completed',
      result: passed ? 'Pass' : 'Fail',
      score,
      progress: 100,
      timeRemaining: 0,
      liveAnswers: selectedAnswers
    });
  };

  // Sign out and back to login or selector
  const handleExitTest = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    setSelectedTest(null);
    setIsSubmitted(false);
    setTestResult(null);
    setCurrentQuestion(0);
    setSelectedAnswers({});
    setMarked({});
  };

  // Renders

  // Screen 1: Access Login portal
  if (!isLoggedIn) {
    return (
      <div className="h-full overflow-y-auto bg-[#eaedf1] flex flex-col items-center justify-center py-6 px-3 sm:py-12 sm:px-4 font-sans select-none">
        <div className="w-full max-w-md bg-white border border-gray-300 shadow-xl rounded-sm">
          <div className="bg-[#002f6c] text-white p-5 sm:p-6 border-b-4 border-[#d2232a] text-center">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight uppercase">Trafikverket</h1>
            <p className="text-[10px] sm:text-xs uppercase tracking-widest text-slate-300 font-bold mt-1">Kunskapsprov Portal</p>
          </div>
          
          {!allowLogin ? (
            <div className="p-6 sm:p-8 text-center space-y-6">
              <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto text-slate-500 border border-slate-200 animate-pulse">
                <Lock className="w-8 h-8 text-[#d2232a]" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">PORTALEN ÄR STÄNGD</h3>
                <p className="text-xs sm:text-sm text-gray-500 leading-relaxed font-semibold">
                  Inloggningen är för närvarande stängd av provledaren. Vänligen vänta tills provledaren öppnar portalen på din skärm.
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-50 rounded border border-gray-200 text-gray-400 text-xs font-mono">
                <Loader2 className="w-4 h-4 animate-spin text-[#d2232a]" />
                Väntar på behörighetsöppning...
              </div>
              
              <div className="pt-4 border-t border-gray-200 text-center">
                <button
                  type="button"
                  onClick={handleCopyPortalLink}
                  className={`w-full py-2 sm:py-2.5 px-4 rounded-sm text-[10px] sm:text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer border ${copiedLink ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-gray-50 border-gray-300 hover:bg-gray-100 text-gray-700'}`}
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-bounce" /> : <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                  {copiedLink ? 'Provlänk kopierad!' : 'Dela provsidan'}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleLoginSubmit} className="p-5 sm:p-8 space-y-4 sm:space-y-6">
              <div className="text-center">
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-semibold">
                  Välkommen till Trafikverkets teoriprovs-sal. Vänligen logga in med ditt personnummer.
                </p>
              </div>

              <div className="space-y-3.5 sm:space-y-4">
                {loginError && (
                  <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 p-3 rounded-sm border border-red-200 font-semibold leading-relaxed text-left animate-fade-in">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{loginError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 sm:mb-2">Ditt Fullständiga Namn</label>
                  <div className="relative rounded-sm shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input 
                      type="text"
                      value={studentName}
                      onChange={e => {
                        setStudentName(e.target.value);
                        setLoginError(null);
                      }}
                      className="block w-full pl-9 pr-3 py-2.5 sm:py-3 border border-gray-300 bg-slate-50 rounded-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#002f6c] text-sm"
                      placeholder="t.ex. Karl Larsson"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 sm:mb-2">Personnummer (ÅÅÅÅMMDD-XXXX)</label>
                  <div className="relative rounded-sm shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input 
                      type="text"
                      required
                      value={pnrInput}
                      onChange={e => {
                        setPnrInput(e.target.value);
                        setLoginError(null);
                      }}
                      className="block w-full pl-9 pr-3 py-2.5 sm:py-3 border border-gray-300 bg-slate-50 rounded-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#002f6c] text-sm font-mono font-bold"
                      placeholder="YYYYMMDD-XXXX"
                    />
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-2.5 sm:py-3 bg-[#002f6c] hover:bg-[#001d4a] text-white text-xs sm:text-sm rounded-sm font-bold uppercase tracking-widest transition-colors cursor-pointer"
              >
                Starta Provskrivning
              </button>
              
              <div className="flex items-center gap-2 text-[11px] sm:text-xs text-amber-600 justify-center bg-amber-50 p-2 sm:p-2.5 rounded-sm border border-amber-200">
                <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span>Sitt vid din tilldelade provdator bänk innan du loggar in.</span>
              </div>

              <div className="pt-3.5 border-t border-gray-200 text-center">
                <button
                  type="button"
                  onClick={handleCopyPortalLink}
                  className={`w-full py-2 sm:py-2.5 px-4 rounded-sm text-[10px] sm:text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer border ${copiedLink ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-gray-50 border-gray-300 hover:bg-gray-100 text-gray-700'}`}
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-bounce" /> : <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                  {copiedLink ? 'Provlänk kopierad!' : 'Dela provsidan'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  // Screen 2: Choose Test Selection
  if (isLoggedIn && !selectedTest) {
    const suggestedTestId = activeCandidate?.assignedTestId || 'B_STANDARD';
    const candidateClass = activeCandidate?.auth || 'B';

    const defaultCategories = THEORY_TESTS
      .filter(t => t.id === suggestedTestId)
      .map(t => ({
        id: t.id,
        title: t.title,
        duration: `${Math.round(t.duration / 60)} min`,
        limit: t.questionsCount,
        category: t.category === 'Standardprov' ? 'Trafikverket Prov' : (t.category === 'Övningsprov' ? 'Träningsprov' : 'Snabbprov')
      }));

    return (
      <div className="h-full overflow-y-auto bg-[#f2f2f2] flex flex-col items-center py-6 px-3 sm:py-12 sm:px-4 font-sans select-none">
        <div className="w-full max-w-4xl">
          <div className="mb-6 border-b border-gray-300 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#d2232a] uppercase tracking-tight">Trafikverket</h1>
              <h2 className="text-lg sm:text-xl font-medium text-gray-800 mt-0.5">Kunskapsprov för körkort</h2>
            </div>
            <div className="bg-white border border-gray-300 px-3 py-2 sm:px-4 sm:py-3 rounded text-xs sm:text-sm text-gray-700">
              Inloggad som: <strong className="text-gray-900 uppercase">{studentName}</strong> 
              <br />
              Datorbänk: <strong className="text-[#002f6c]">Bänk {activeCandidate?.bench || Math.floor(Math.random() * 24) + 1}</strong>
            </div>
          </div>

          {/* Examiner Highlight / Recommendation */}
          <div className="bg-blue-50/70 border-l-4 border-blue-600 p-3 sm:p-4 mb-4 sm:mb-6 text-xs sm:text-sm text-blue-900 rounded-r shadow-sm">
            <span className="font-bold">PROVLEDAREN REKOMMENDERAR:</span> 
            <br />
            Du är inlagd för behörighet <strong className="font-bold">{candidateClass}</strong>. Vänligen starta det tilldelade provet: <strong>{defaultCategories.find(t => t.id === suggestedTestId)?.title || "B - Standardprov"}</strong> nedan.
          </div>

          <div className="bg-white border border-gray-300 shadow-sm overflow-hidden rounded-sm">
            <div className="hidden sm:grid grid-cols-12 gap-4 p-4 border-b border-gray-300 bg-gray-100 font-bold text-sm text-gray-700 uppercase tracking-wider">
              <div className="col-span-3">Kategori</div>
              <div className="col-span-6">Teoriprov</div>
              <div className="col-span-3 text-right">Provtid & Frågor</div>
            </div>
            
            <div className="flex flex-col divide-y divide-gray-200">
              {defaultCategories.map(test => {
                const isAssigned = test.id === suggestedTestId;
                return (
                  <button
                    key={test.id}
                    onClick={() => handleStartTest(test.id)}
                    className={`grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 p-4 sm:p-5 text-left transition-colors items-center cursor-pointer ${
                      isAssigned ? 'bg-blue-50/50 hover:bg-blue-50' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="col-span-3">
                      <span className={`px-2 py-0.5 sm:px-2.5 sm:py-1 text-[9px] sm:text-[10px] font-black uppercase tracking-widest rounded ${
                        test.category === 'Trafikverket Prov' 
                          ? 'bg-amber-100 text-amber-800' 
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {test.category}
                      </span>
                    </div>
                    
                    <div className="col-span-6">
                      <span className="text-sm sm:text-base font-bold text-gray-900 block flex items-center gap-1.5 sm:gap-2">
                        {test.title}
                        {isAssigned && (
                          <span className="text-[9px] sm:text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded font-black tracking-widest uppercase shrink-0">TILLDELAD</span>
                        )}
                      </span>
                      <span className="text-[10px] sm:text-xs text-gray-400 font-semibold block mt-0.5 font-mono">ID: {test.id}</span>
                    </div>

                    <div className="col-span-3 flex items-center justify-between sm:justify-end gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600 font-semibold font-mono">
                      <span>{test.duration} / {test.limit} Frågor</span>
                      <span className="bg-[#002f6c] text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-sm text-[11px] sm:text-xs uppercase tracking-widest font-black transition-transform hover:scale-105">Starta</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Screen 3: Main Dynamic Test Page
  return (
    <div className="h-full overflow-y-auto bg-[#eaedf1] flex flex-col font-sans text-gray-900 selection:bg-blue-100 select-none">
      
      {/* 3a. Confirms Submission Dialog Overlay */}
      {showConfirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white max-w-md w-full p-8 rounded shadow-2xl">
            <h3 className="text-2xl font-black text-gray-950 mb-3 uppercase tracking-tight">LÄMNA IN PROVET?</h3>
            <p className="text-gray-600 mb-6 leading-relaxed text-sm font-semibold">
              Är du helt färdig? Detta beslut går inte att ångra och dina svar registreras omedelbart för rättning hos Trafikverket.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setShowConfirmDialog(false)}
                className="flex-1 py-3 text-gray-700 font-bold bg-gray-100 hover:bg-gray-200 rounded transition-colors cursor-pointer text-xs uppercase tracking-widest"
              >
                Gå Tillbaka
              </button>
              <button 
                onClick={() => calculateAndSubmitTest()}
                className="flex-1 py-3 text-white font-bold bg-[#51a351] hover:bg-[#438a43] rounded transition-colors cursor-pointer text-xs uppercase tracking-widest"
              >
                Lämna in nu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3b. Interactive Real-Time PAUSED SCREEN Overlay */}
      {isPaused && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/95 backdrop-blur-sm p-6 text-center select-none animate-fade-in">
          <div className="bg-white max-w-xl w-full p-10 rounded shadow-2xl border-t-8 border-amber-500 flex flex-col items-center">
            <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 mb-5 animate-pulse border border-amber-200">
              <AlertTriangle className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black text-slate-950 mb-3 tracking-tight uppercase">PROVET ÄR PAUSAT</h2>
            <p className="text-sm text-slate-600 mb-8 leading-relaxed font-semibold">
              Provledaren har tillfälligt pausat provskrivningen på din bänk. 
              <br />
              <span className="font-bold text-amber-600 mt-2 block">Ditt provtidsur har stoppats och alla dina svar är sparade säkert.</span>
            </p>
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded text-slate-500 text-xs font-mono">
              <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
              Väntar på att provledaren aktiverar din skärm...
            </div>
          </div>
        </div>
      )}

      {/* 3c. HEADER */}
      <header className="bg-white border-b border-gray-300 px-4 py-2 sm:px-6 sm:py-2.5 flex items-center justify-between z-10 shrink-0 shadow-xs select-none">
        <div className="flex items-center gap-3">
          <h1 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">Trafikverket</h1>
          <div className="h-5 w-px bg-gray-300 hidden sm:block"></div>
          <h2 className="text-xs sm:text-sm font-semibold text-gray-600 hidden sm:block">Kunskapsprov – {activeCandidate?.auth || 'B'}</h2>
        </div>

        {!isSubmitted && (
          <div className="flex items-center gap-3 sm:gap-5">
            {/* Visa tid toggle */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-700">Visa tid</span>
              <button 
                type="button"
                onClick={() => setShowTime(!showTime)}
                className={`w-9 h-5 rounded-full transition-colors p-0.5 flex items-center cursor-pointer ${showTime ? 'bg-slate-700 justify-end' : 'bg-gray-300 justify-start'}`}
                title="Sätt på/av tidsvisning"
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-xs" />
              </button>
              {showTime && (
                <div className="font-mono font-bold text-xs sm:text-sm text-gray-900 bg-slate-100 px-2 py-0.5 rounded border border-gray-300">
                  {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:{Math.floor(timeLeft % 60).toString().padStart(2, '0')}
                </div>
              )}
            </div>

            <button 
              onClick={() => {
                if (!document.fullscreenElement) {
                  document.documentElement.requestFullscreen().catch(err => console.error(err));
                } else {
                  if (document.exitFullscreen) document.exitFullscreen();
                }
              }}
              className="p-1.5 border border-gray-300 rounded hover:bg-gray-100 text-gray-700 bg-white shadow-xs flex items-center justify-center transition-colors cursor-pointer"
              title="Växla helskärm"
            >
              <Maximize2 className="w-4 h-4" />
            </button>

            {/* Candidate avatar icon */}
            <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#002f6c] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                <User size={16} />
              </div>
            </div>
          </div>
        )}
      </header>

      {/* 3d. MAIN PANEL CONTAINER */}
      <main className={`flex-1 w-full mx-auto p-2.5 sm:p-6 md:p-8 flex flex-col items-stretch justify-start ${isSubmitted ? 'max-w-4xl items-center pt-4 sm:pt-8' : 'max-w-[1600px] w-full lg:px-8'}`}>
        
        {isWaitingForStart ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-20 px-6 max-w-xl mx-auto select-none">
            <div className="w-20 h-20 bg-amber-50 dark:bg-amber-950/20 rounded-full border border-amber-200 dark:border-amber-900/50 flex items-center justify-center text-amber-500 mb-6 animate-pulse relative">
              <span className="absolute inset-0 rounded-full bg-amber-500/20 animate-ping" />
              <AlertTriangle className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 mb-3 uppercase tracking-tight">KONTROLLERAD AV PROVLEDAREN</h2>
            <p className="text-base font-bold text-[#002f6c] mb-4">Väntar på startgodkännande från provledaren...</p>
            <p className="text-sm font-semibold text-gray-500 leading-relaxed mb-8">
              Din legitimation är kontrollerad och din bänk <strong>Bänk {activeCandidate?.bench || "7"}</strong> är registrerad. Provet kan endast påbörjas efter att provledaren har startat det från sitt system. Sitt kvar på din plats.
            </p>
            <div className="flex items-center gap-2.5 px-5 py-3 bg-white rounded-lg shadow-sm border border-gray-200 text-gray-600 text-xs font-mono">
              <Loader2 className="w-4 h-4 animate-spin text-[#002f6c]" />
              Systemet är redo. Synkar i realtid...
            </div>
          </div>
        ) : isSubmitted && testResult ? (

          <div className="w-full flex flex-col items-center justify-center min-h-[65vh] py-8">
            {/* Trafikverket Authentic Result Screen */}
            <div className="w-full max-w-xl bg-white border border-gray-300 rounded-lg p-10 sm:p-14 shadow-lg text-center flex flex-col items-center">
              
              {/* Green checkmark or Red crossmark */}
              <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 border-2 shadow-sm ${
                testResult.passed ? 'bg-emerald-50 border-emerald-500 text-emerald-600' : 'bg-red-50 border-red-500 text-red-600'
              }`}>
                {testResult.passed ? (
                  <CheckCircle className="w-14 h-14 stroke-[2.5]" />
                ) : (
                  <XCircle className="w-14 h-14 stroke-[2.5]" />
                )}
              </div>

              {/* Status Header */}
              <h2 className={`text-2xl sm:text-3xl font-black uppercase tracking-tight mb-3 ${
                testResult.passed ? 'text-emerald-700' : 'text-red-700'
              }`}>
                {testResult.passed ? 'Ditt prov är godkänt' : 'Ditt prov är underkänt'}
              </h2>

              {/* Mandatory User-Requested Text */}
              <p className="text-base sm:text-lg font-semibold text-gray-700 mb-8">
                Resultatbesked mailas till dig.
              </p>

              {/* Candidate reference metadata */}
              <div className="w-full text-xs text-gray-500 font-mono border-t border-gray-200 pt-5 space-y-1 text-center bg-gray-50/60 p-3 rounded-md">
                <div>Kandidat: <strong className="text-gray-900 uppercase font-bold">{studentName}</strong></div>
                <div>Personnummer: <strong className="text-gray-900 font-bold">{activeCandidate?.pnr || pnrInput}</strong></div>
                <div>Datum: <strong className="text-gray-900 font-bold">{new Date().toLocaleDateString('sv-SE')}</strong></div>
                <div>Dator / Bänk: <strong className="text-gray-900 font-bold">Bänk {activeCandidate?.bench || '7'}</strong></div>
              </div>
            </div>

            <button
              onClick={handleExitTest}
              className="mt-8 px-8 py-3 bg-[#002f6c] hover:bg-[#001d4a] text-white text-xs font-bold uppercase tracking-widest rounded-sm cursor-pointer shadow transition-all hover:scale-105"
            >
              Tillbaka till startsidan
            </button>
          </div>
        ) : (
          
          // Question Sandbox Testing Layout (Trafikverket Official Interface)
          <div id="test-view" className="flex-1 flex flex-col items-stretch gap-3 min-h-0 w-full relative">
            
            {/* Main Outer Box with Floating Chevrons */}
            <div className="flex-1 relative flex flex-col min-h-0">
              
              {/* Floating Left Chevron Button */}
              <button 
                type="button"
                onClick={() => setCurrentQuestion(p => Math.max(0, p - 1))}
                disabled={currentQuestion === 0}
                className="absolute -left-3 sm:-left-6 top-1/2 -translate-y-1/2 z-20 p-1.5 sm:p-2 text-gray-400 hover:text-gray-800 disabled:opacity-20 transition-colors cursor-pointer"
                title="Föregående fråga"
              >
                <ChevronLeft className="w-10 h-10 sm:w-14 sm:h-14 stroke-[2.5]" />
              </button>

              {/* Floating Right Chevron Button */}
              <button 
                type="button"
                onClick={() => setCurrentQuestion(p => Math.min(currentTestQuestions.length - 1, p + 1))}
                disabled={currentQuestion === currentTestQuestions.length - 1}
                className="absolute -right-3 sm:-right-6 top-1/2 -translate-y-1/2 z-20 p-1.5 sm:p-2 text-gray-400 hover:text-gray-800 disabled:opacity-20 transition-colors cursor-pointer"
                title="Nästa fråga"
              >
                <ChevronRight className="w-10 h-10 sm:w-14 sm:h-14 stroke-[2.5]" />
              </button>

              {/* Central split view panel */}
              <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0 items-start overflow-y-auto lg:overflow-hidden p-2.5 sm:p-4 bg-[#f1f3f6] rounded-xl border border-gray-300 shadow-xs">

                {/* LEFT CARD (Question text & options) */}
                <div id="question-details" className="lg:col-span-5 bg-[#f9fafb] border border-gray-300 rounded-lg p-4 sm:p-6 flex flex-col lg:h-full overflow-y-auto">

                  <div>
                    {/* Header line: Fråga X/Y and Markera toggle */}
                    <div className="flex items-center justify-between pb-3 border-b border-gray-200 mb-4">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                        Fråga {currentQuestion + 1}/{currentTestQuestions.length}
                      </h3>

                      <div 
                        className="flex items-center gap-2 cursor-pointer select-none"
                        onClick={toggleMarkCurrent}
                      >
                        <span className="text-xs font-semibold text-gray-700">Markera</span>
                        <button 
                          type="button"
                          className={`w-9 h-5 rounded-full transition-colors p-0.5 flex items-center ${
                            marked[currentQuestion] ? 'bg-slate-800 justify-end' : 'bg-gray-300 justify-start'
                          }`}
                        >
                          <div className="w-4 h-4 rounded-full bg-white shadow-xs" />
                        </button>
                      </div>
                    </div>

                    {/* Question Statement */}
                    <div className="flex items-start justify-between gap-3 mb-5">
                      <p className="text-sm sm:text-base md:text-lg font-medium text-gray-900 leading-relaxed">
                        {currentTestQuestions[currentQuestion]?.question}
                      </p>
                      <button 
                        type="button"
                        onClick={() => handleTTS(currentTestQuestions[currentQuestion]?.question)}
                        className="shrink-0 p-2 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-800 transition-colors cursor-pointer"
                        title="Lyssna på frågan"
                      >
                        <Volume2 className="w-4.5 h-4.5" />
                      </button>
                    </div>

                    {/* Options list A, B, C, D */}
                    <div className="space-y-2.5">
                      {currentTestQuestions[currentQuestion]?.options.map((optText, rawIdx) => {
                        const isSelected = selectedAnswers[currentQuestion] === rawIdx;
                        const optionLetter = String.fromCharCode(65 + rawIdx); // 'A', 'B', 'C', 'D'

                        return (
                          <div 
                            key={rawIdx}
                            onClick={() => handleAnswerSelect(rawIdx)}
                            className={`flex items-center justify-between p-3 sm:p-3.5 rounded-lg border transition-all cursor-pointer ${
                              isSelected 
                                ? 'bg-[#d8e4f0] border-[#002f6c] shadow-xs' 
                                : 'bg-[#e7ebf0] hover:bg-[#dfe4ea] border-gray-300/70 text-gray-900'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-sm text-gray-900 min-w-[16px]">{optionLetter}</span>
                              <div className={`w-5 h-5 rounded-sm border flex items-center justify-center shrink-0 transition-colors ${
                                isSelected ? 'bg-[#002f6c] border-[#002f6c] text-white' : 'bg-white border-gray-400'
                              }`}>
                                {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                              </div>
                              <span className="text-xs sm:text-sm font-semibold text-gray-900 leading-snug">
                                {optText}
                              </span>
                            </div>

                            <button 
                              type="button"
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                handleTTS(optText); 
                              }}
                              className="shrink-0 p-1.5 text-gray-500 hover:text-[#002f6c] transition-colors cursor-pointer"
                              title="Lyssna på alternativet"
                            >
                              <Volume2 className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* RIGHT CARD (Media Panel: 2x2 Image Grid or Single Image) */}
                <div id="media-panel" className="lg:col-span-7 bg-[#f9fafb] border border-gray-300 rounded-lg p-4 sm:p-6 flex flex-col items-center justify-center min-h-[200px] lg:h-full">
                  
                  {/* Case 1: 4 Option Signs (2x2 Grid like in Trafikverket screenshot!) */}
                  {currentTestQuestions[currentQuestion]?.optionSignLetters ? (
                    <div className="w-full h-full grid grid-cols-2 gap-4 max-w-2xl mx-auto">
                      {(['A', 'B', 'C', 'D'] as const).map((letter, idx) => {
                        const isSelected = selectedAnswers[currentQuestion] === idx;

                        return (
                          <div
                            key={letter}
                            onClick={() => handleAnswerSelect(idx)}
                            className={`flex flex-col items-center justify-between p-4 bg-white border rounded-lg transition-all cursor-pointer ${
                              isSelected ? 'border-2 border-[#002f6c] ring-2 ring-blue-200 shadow-xs' : 'border-gray-300 hover:border-gray-400'
                            }`}
                          >
                            <div className="flex-1 flex items-center justify-center p-2 min-h-[110px] w-full">
                              <PostombudOption letter={letter} />
                            </div>
                            <span className="font-bold text-sm text-gray-800 mt-2">{letter}</span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    /* Case 2: Single Road Sign or Scene Illustration */
                    <div className="flex flex-col items-center justify-center h-full w-full">
                      {currentTestQuestions[currentQuestion]?.sign && (
                        <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-xs">
                          <RoadSign {...currentTestQuestions[currentQuestion]?.sign} />
                        </div>
                      )}

                      {currentTestQuestions[currentQuestion]?.scene && (
                        <div className="p-2 bg-white border border-gray-300 rounded-lg shadow-xs max-h-[340px] w-full max-w-md flex items-center justify-center overflow-hidden">
                          <SceneIllustration type={currentTestQuestions[currentQuestion]?.scene as any} />
                        </div>
                      )}

                      {!currentTestQuestions[currentQuestion]?.sign && !currentTestQuestions[currentQuestion]?.scene && (
                        <div className="flex flex-col items-center gap-2 text-gray-300">
                          <Info className="w-8 h-8" strokeWidth={1.5} />
                          <span className="text-gray-400 font-semibold text-xs sm:text-sm italic">
                            Ingen bildreferens för denna fråga
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                </div>

              </div>
            </div>

            {/* LOWER INDEX CAROUSEL & STATS BAR (Trafikverkets autentiska provutseende) */}
            <div className="shrink-0 w-full bg-[#dfe3e8] border border-gray-300 p-2 sm:p-3 rounded-lg flex flex-col xl:flex-row items-center justify-between gap-3 select-none">
              
              {/* Question Number Matrix (Rows of 30 questions) */}
              <div className="flex-1 w-full overflow-x-auto pb-1 xl:pb-0">
                <div className="flex flex-col gap-1 min-w-max">
                  {Array.from({ length: Math.ceil(currentTestQuestions.length / 30) }, (_, rowIdx) => {
                    const rowStart = rowIdx * 30;
                    const rowQuestions = currentTestQuestions.slice(rowStart, rowStart + 30);
                    return (
                      <div key={rowIdx} className="flex items-center gap-1">
                        {rowQuestions.map((_, colIdx) => {
                          const i = rowStart + colIdx;
                          const hasAnswer = selectedAnswers[i] !== undefined;
                          const isMarked = marked[i] === true;
                          const isActive = i === currentQuestion;

                          // Trafikverket authentic style:
                          // - Answered: solid black background with white text ("besvarad blir svart")
                          // - Unanswered: white/very light background with black text
                          // - Active: marked with distinct border/ring
                          // - Marked: gets a star ("Markerad fråga får en stjärna")
                          let btnClass = 'bg-white text-gray-900 hover:bg-gray-100 border-gray-300';
                          if (hasAnswer) {
                            btnClass = 'bg-black text-white font-bold border-black hover:bg-neutral-800';
                          }
                          if (isActive) {
                            btnClass += ' ring-2 ring-blue-600 border-blue-600 z-10';
                          }

                          return (
                            <button
                              type="button"
                              key={i}
                              onClick={() => setCurrentQuestion(i)}
                              className={`h-7 w-7 text-xs font-bold border rounded-[3px] flex items-center justify-center relative cursor-pointer transition-colors ${btnClass}`}
                              title={`Fråga ${i + 1}${hasAnswer ? ' (Besvarad)' : ' (Obesvarad)'}${isMarked ? ' ★' : ''}`}
                            >
                              <span>{i + 1}</span>
                              {isMarked && (
                                <span className="absolute -top-1.5 -right-1 text-amber-500 font-extrabold text-sm drop-shadow-xs leading-none">
                                  ★
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Stats Box & Submit Button (Matches screenshot layout) */}
              <div className="flex items-center justify-between xl:justify-end w-full xl:w-auto gap-3 shrink-0 pt-2 xl:pt-0 border-t xl:border-t-0 border-gray-300">
                
                {/* Stats list with vertical column styling */}
                <div className="flex flex-col gap-1 text-xs text-gray-800 font-medium">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-5 bg-black text-white font-bold text-center text-[11px] rounded-[3px] flex items-center justify-center">
                      {Object.keys(selectedAnswers).length}
                    </span>
                    <span className="text-gray-700 text-xs font-semibold">Besvarade</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-5 bg-white text-gray-900 border border-gray-400 font-bold text-center text-[11px] rounded-[3px] flex items-center justify-center">
                      {currentTestQuestions.length - Object.keys(selectedAnswers).length}
                    </span>
                    <span className="text-gray-700 text-xs font-semibold">Obesvarade</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-5 bg-white text-gray-900 border border-gray-400 font-bold text-center text-[11px] rounded-[3px] flex items-center justify-center">
                      {Object.keys(marked).filter(k => marked[Number(k)]).length}*
                    </span>
                    <span className="text-gray-700 text-xs font-semibold">Markerade</span>
                  </div>
                </div>

                {/* Submit button: Avsluta och rätta prov */}
                <button 
                  type="button"
                  onClick={() => setShowConfirmDialog(true)}
                  className="bg-[#4caf50] hover:bg-[#43a047] text-white text-sm font-bold px-5 py-3 rounded-md transition-colors cursor-pointer shadow-xs whitespace-nowrap self-stretch flex items-center justify-center"
                >
                  Avsluta och rätta prov
                </button>
              </div>

            </div>

          </div>
        )}
      </main>
    </div>
  );
}
