import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  Dice5, 
  HelpCircle, 
  CheckCircle, 
  ChevronRight, 
  Eye, 
  EyeOff, 
  X, 
  Truck,
  Bus,
  Layers,
  AlertTriangle,
  Flame,
  HelpCircle as QuestionIcon,
  ShieldAlert,
  ArrowRight,
  Filter
} from 'lucide-react';
import { 
  HEAVY_SAFETY_QUESTIONS_76, 
  HeavySafetyQuestion, 
  getQuestionsForLicense 
} from '../../../data/heavySafetyQuestions';
import { triggerHaptic } from '../../../lib/utils';

interface HeavySafetyQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  licenseType: string;
}

export function HeavySafetyQuestionModal({ isOpen, onClose, licenseType }: HeavySafetyQuestionModalProps) {
  // Pool filtered based on actual license type (e.g. CE gets trailer questions, D gets bus questions, not vice-versa)
  const [filterByLicense, setFilterByLicense] = useState(true);

  const availableQuestions = useMemo(() => {
    if (!filterByLicense) return HEAVY_SAFETY_QUESTIONS_76;
    const filtered = getQuestionsForLicense(licenseType);
    return filtered.length > 0 ? filtered : HEAVY_SAFETY_QUESTIONS_76;
  }, [licenseType, filterByLicense]);

  const [currentQuestion, setCurrentQuestion] = useState<HeavySafetyQuestion>(() => {
    const pool = getQuestionsForLicense(licenseType);
    const usePool = pool.length > 0 ? pool : HEAVY_SAFETY_QUESTIONS_76;
    const randomIndex = Math.floor(Math.random() * usePool.length);
    return usePool[randomIndex];
  });

  const [showAnswer, setShowAnswer] = useState(false);
  const [showFollowUps, setShowFollowUps] = useState(false);

  if (!isOpen) return null;

  const rollNewQuestion = () => {
    triggerHaptic('medium');
    let nextIndex: number;
    do {
      nextIndex = Math.floor(Math.random() * availableQuestions.length);
    } while (nextIndex === availableQuestions.findIndex(q => q.id === currentQuestion.id) && availableQuestions.length > 1);

    setShowAnswer(false);
    setShowFollowUps(false);
    setCurrentQuestion(availableQuestions[nextIndex]);
  };

  const isBus = ['D1', 'D', 'D1E', 'DE'].includes(licenseType.toUpperCase());
  const isTrailer = ['C1E', 'CE', 'D1E', 'DE'].includes(licenseType.toUpperCase());

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-4">
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl animate-in zoom-in-95 duration-150 flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-gray-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-linear-to-br from-amber-500/15 to-orange-500/15 text-amber-600 dark:text-amber-400 rounded-2xl border border-amber-300/40 dark:border-amber-800/50 shadow-2xs">
              <Dice5 size={22} className="animate-spin-once" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-black uppercase tracking-wider bg-[#002f6c] dark:bg-blue-600 text-white px-2 py-0.5 rounded-md flex items-center gap-1 shadow-2xs">
                  {isBus ? <Bus size={12} /> : <Truck size={12} />}
                  <span>Behörighet {licenseType}</span>
                </span>
                
                {currentQuestion.vehicleFocus && (
                  <span className="text-[10px] font-extrabold uppercase tracking-wide bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-md border border-amber-300/50 dark:border-amber-800/40">
                    {currentQuestion.vehicleFocus}
                  </span>
                )}

                {currentQuestion.difficulty && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded text-gray-600 dark:text-slate-300 bg-gray-100 dark:bg-slate-800`}>
                    {currentQuestion.difficulty}
                  </span>
                )}
              </div>
              <h3 className="text-base sm:text-lg font-black text-gray-900 dark:text-white leading-tight mt-1">
                Funktionsfråga & Följdfrågor
              </h3>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors cursor-pointer shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="py-2.5 px-3 bg-gray-50 dark:bg-slate-800/50 rounded-xl mt-2 flex items-center justify-between text-xs shrink-0 border border-gray-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5 text-gray-600 dark:text-slate-300 font-medium">
            <Filter size={13} className="text-[#002f6c] dark:text-blue-400" />
            <span>Fordonsspecifikt för <strong>{licenseType}</strong>:</span>
            <span className="font-bold text-[#002f6c] dark:text-blue-400">
              {availableQuestions.length} st lämpliga frågor
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              setFilterByLicense(!filterByLicense);
              triggerHaptic('light');
            }}
            className="text-[11px] font-bold text-gray-500 hover:text-gray-800 dark:text-slate-400 dark:hover:text-slate-200 underline cursor-pointer"
          >
            {filterByLicense ? 'Visa alla 80 frågor' : `Begränsa till ${licenseType}`}
          </button>
        </div>

        {/* Content Area */}
        <div className="py-3.5 overflow-y-auto space-y-3.5 flex-1 pr-1 custom-scrollbar">
          
          {/* Category Tag */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 dark:text-slate-400 flex items-center gap-1.5">
              <Layers size={13} />
              <span>Moment: <strong className="text-gray-800 dark:text-slate-200">{currentQuestion.category}</strong></span>
            </span>

            <span className="text-[11px] font-mono font-bold text-gray-400 dark:text-slate-500">
              Fråga #{currentQuestion.id}
            </span>
          </div>

          {/* The Question Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-linear-to-br from-amber-50/70 via-amber-50/40 to-orange-50/30 dark:from-amber-950/30 dark:via-slate-900 dark:to-orange-950/20 border-2 border-amber-200/80 dark:border-amber-800/60 shadow-xs relative">
            <div className="text-[10px] font-black uppercase tracking-wider text-amber-800 dark:text-amber-400 mb-1.5 flex items-center gap-1.5">
              <HelpCircle size={14} className="text-amber-600 dark:text-amber-400" />
              <span>Ställ frågan till aspiranten:</span>
            </div>
            <p className="text-sm sm:text-base font-black text-gray-950 dark:text-white leading-relaxed">
              "{currentQuestion.question}"
            </p>
          </div>

          {/* Answer & Lathund Toggle */}
          <div>
            {!showAnswer ? (
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setShowAnswer(true);
                }}
                className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200/90 dark:bg-slate-800 dark:hover:bg-slate-750 text-gray-800 dark:text-gray-100 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer border border-gray-200 dark:border-slate-700 shadow-2xs active:scale-[0.99]"
              >
                <Eye size={16} className="text-[#002f6c] dark:text-blue-400" />
                <span>Visa Lathund, Krav för G & Acceptabel Förklaring</span>
              </button>
            ) : (
              <div className="space-y-3 animate-in fade-in duration-200">
                {/* Fullständigt Svar */}
                <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/25 border border-emerald-300/80 dark:border-emerald-800/50 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="text-[10px] font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle size={14} />
                      <span>Fullständigt Korrekt Svar</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowAnswer(false)}
                      className="text-[10px] font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex items-center gap-1 cursor-pointer"
                    >
                      <EyeOff size={12} />
                      <span>Dölj svar</span>
                    </button>
                  </div>

                  <p className="text-xs sm:text-sm text-gray-900 dark:text-gray-100 leading-relaxed font-medium">
                    {currentQuestion.answer}
                  </p>
                </div>

                {/* LATHUND FÖR INSPEKTÖREN: ACCEPTABEL FÖRKLARING */}
                <div className="p-4 rounded-2xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#002f6c] dark:text-blue-300 flex items-center gap-1.5">
                      <Sparkles size={13} className="text-amber-500" />
                      <span>Lathund: Acceptabel förklaring (Godkänt svar)</span>
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/40 px-2 py-0.5 rounded">
                      Krav för G
                    </span>
                  </div>

                  <p className="text-xs text-blue-950 dark:text-blue-200 leading-relaxed">
                    Kandidaten behöver inte citera formuleringen ordagrant, men <strong>måste</strong> förstå principen och nämna följande kärnpunkter:
                  </p>

                  {currentQuestion.keyPoints && currentQuestion.keyPoints.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {currentQuestion.keyPoints.map((kp, idx) => (
                        <span 
                          key={idx}
                          className="text-xs font-bold px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 text-[#002f6c] dark:text-blue-300 border border-blue-200 dark:border-blue-800 shadow-2xs flex items-center gap-1"
                        >
                          <span className="text-emerald-500 font-black">✓</span> {kp}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>

                {/* FÖLJDFRÅGOR & RISKER */}
                {currentQuestion.followUpQuestions && currentQuestion.followUpQuestions.length > 0 && (
                  <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/25 border border-amber-300/60 dark:border-amber-900/40 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                        <AlertTriangle size={14} className="text-orange-500" />
                        <span>Följdfrågor om Risker & Konsekvenser</span>
                      </span>
                      <span className="text-[10px] font-extrabold uppercase bg-amber-200/80 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 px-2 py-0.5 rounded">
                        Ställ vid osäkerhet
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {currentQuestion.followUpQuestions.map((fu, idx) => (
                        <div key={idx} className="p-3 bg-white dark:bg-slate-800/90 rounded-xl border border-amber-200/70 dark:border-amber-900/50 space-y-2">
                          <div className="flex items-start gap-2">
                            <span className="text-xs font-black text-amber-700 dark:text-amber-400 shrink-0 mt-0.5">
                              Följdfråga {idx + 1}:
                            </span>
                            <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-slate-100 leading-snug">
                              "{fu.question}"
                            </p>
                          </div>

                          <div className="pl-4 border-l-2 border-emerald-400 dark:border-emerald-600 space-y-1 text-xs">
                            <div className="text-[10px] font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                              Godtagbart svar:
                            </div>
                            <p className="text-gray-700 dark:text-slate-200 font-medium">
                              {fu.acceptableAnswer}
                            </p>
                            {fu.riskAspect && (
                              <div className="text-[11px] font-bold text-orange-700 dark:text-orange-400 flex items-center gap-1 pt-0.5">
                                <ShieldAlert size={12} />
                                <span>Riskaspekt: {fu.riskAspect}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="text-[11px] text-gray-500 dark:text-slate-400 pt-1 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
                  <span>Otillräckligt svar eller missad säkerhetsrisk?</span>
                  <span className="text-red-600 dark:text-red-400 font-bold">Kryssa Brist i Protokollet (Säkerhetskontroll)</span>
                </div>

              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3.5 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-3 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 text-gray-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Stäng
          </button>

          <button
            type="button"
            onClick={rollNewQuestion}
            className="flex-1 py-3 px-5 bg-gradient-to-r from-[#002f6c] to-blue-700 hover:from-[#00204a] hover:to-blue-800 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-blue-900/20 active:scale-95"
          >
            <Dice5 size={16} />
            <span>Slumpa ny fråga ({availableQuestions.length} st)</span>
          </button>
        </div>

      </div>
    </div>
  );
}
