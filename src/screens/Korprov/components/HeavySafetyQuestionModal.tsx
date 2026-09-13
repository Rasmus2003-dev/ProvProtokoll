import React, { useState } from 'react';
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
  Layers
} from 'lucide-react';
import { HEAVY_SAFETY_QUESTIONS_76, HeavySafetyQuestion } from '../../../data/heavySafetyQuestions';
import { triggerHaptic } from '../../../lib/utils';

interface HeavySafetyQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  licenseType: string;
}

export function HeavySafetyQuestionModal({ isOpen, onClose, licenseType }: HeavySafetyQuestionModalProps) {
  const [currentQuestion, setCurrentQuestion] = useState<HeavySafetyQuestion>(() => {
    const randomIndex = Math.floor(Math.random() * HEAVY_SAFETY_QUESTIONS_76.length);
    return HEAVY_SAFETY_QUESTIONS_76[randomIndex];
  });

  const [showAnswer, setShowAnswer] = useState(false);
  const [historyIds, setHistoryIds] = useState<number[]>([]);

  if (!isOpen) return null;

  const rollNewQuestion = () => {
    triggerHaptic('medium');
    let nextIndex: number;
    do {
      nextIndex = Math.floor(Math.random() * HEAVY_SAFETY_QUESTIONS_76.length);
    } while (nextIndex === currentQuestion.id - 1 && HEAVY_SAFETY_QUESTIONS_76.length > 1);

    setShowAnswer(false);
    const nextQ = HEAVY_SAFETY_QUESTIONS_76[nextIndex];
    setCurrentQuestion(nextQ);
    setHistoryIds(prev => [currentQuestion.id, ...prev.slice(0, 9)]);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl max-w-xl w-full p-5 sm:p-7 shadow-2xl animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 rounded-2xl border border-amber-200/60 dark:border-amber-900/40">
              <Dice5 size={20} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest bg-[#002f6c] dark:bg-blue-600 text-white px-2 py-0.5 rounded-md">
                  {licenseType}
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-700 dark:text-amber-400">
                  Funktionsfråga Säkerhet
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-gray-900 dark:text-white leading-tight mt-0.5">
                Slumpad säkerhetsfråga ({currentQuestion.id} av 76)
              </h3>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Area */}
        <div className="py-5 overflow-y-auto space-y-4 flex-1">
          {/* Category Tag */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 dark:text-slate-400 flex items-center gap-1.5">
              <Layers size={13} />
              <span>Kategori: <strong>{currentQuestion.category}</strong></span>
            </span>

            <span className="text-[11px] font-mono text-gray-400">
              Fråga #{currentQuestion.id}
            </span>
          </div>

          {/* The Question Card */}
          <div className="p-5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40">
            <div className="text-[10px] font-black uppercase tracking-wider text-amber-800 dark:text-amber-400 mb-1.5 flex items-center gap-1">
              <HelpCircle size={13} />
              <span>Ställ till kandidaten:</span>
            </div>
            <p className="text-sm sm:text-base font-bold text-gray-900 dark:text-white leading-relaxed">
              "{currentQuestion.question}"
            </p>
          </div>

          {/* Answer Toggle Card */}
          <div>
            {!showAnswer ? (
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setShowAnswer(true);
                }}
                className="w-full py-3.5 px-4 bg-gray-100 hover:bg-gray-200/80 dark:bg-slate-800 dark:hover:bg-slate-750 text-gray-700 dark:text-gray-200 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer border border-gray-200/60 dark:border-slate-700"
              >
                <Eye size={16} />
                <span>Visa facit & bedömningspunkter</span>
              </button>
            ) : (
              <div className="p-5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle size={14} />
                    <span>Rätt svar & Förklaring</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAnswer(false)}
                    className="text-[10px] font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex items-center gap-1 cursor-pointer"
                  >
                    <EyeOff size={12} />
                    <span>Dölj</span>
                  </button>
                </div>

                <p className="text-xs sm:text-sm text-gray-800 dark:text-gray-100 leading-relaxed font-medium">
                  {currentQuestion.answer}
                </p>

                {currentQuestion.keyPoints && currentQuestion.keyPoints.length > 0 && (
                  <div className="pt-2 border-t border-emerald-200/60 dark:border-emerald-900/40">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-1.5">
                      Nyckelpunkter att lyssna efter:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {currentQuestion.keyPoints.map((kp, idx) => (
                        <span 
                          key={idx}
                          className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shadow-2xs"
                        >
                          ✓ {kp}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
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
            <span>Slumpa ny fråga ({HEAVY_SAFETY_QUESTIONS_76.length} st)</span>
          </button>
        </div>

      </div>
    </div>
  );
}
