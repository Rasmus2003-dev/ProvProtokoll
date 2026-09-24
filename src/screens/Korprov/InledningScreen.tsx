import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAppStore } from '../../store/ProvContext';
import { 
  CheckCircle, 
  Circle,
  FileText,
  UserCheck,
  Car,
  HelpCircle,
  BookOpen
} from 'lucide-react';
import { cn, triggerHaptic } from '../../lib/utils';
import { KompetensOmradenCard } from './components/KompetensOmradenCard';

export function InledningScreen() {
  const navigate = useNavigate();
  const { state, updateState } = useAppStore();

  const handleNext = () => {
    navigate('/korprov/korning');
  };

  const toggleCheck = (field: keyof typeof state.checklist) => {
    triggerHaptic('light');
    updateState((prev) => ({
      ...prev,
      checklist: { ...(prev.checklist || {}), [field]: !(prev.checklist?.[field]) }
    }));
  };

  const checks = [
    { id: 'identityChecked', label: 'Identitet fastställd', desc: 'Kontrollera giltig legitimation', icon: <UserCheck size={20} /> },
    { id: 'licenseTypeCorrect', label: 'Behörighet & villkor', desc: 'Provtyp överensstämmer med ansökan', icon: <FileText size={20} /> },
    { id: 'vehicleCorrect', label: 'Fordon', desc: 'Uppfyller formella krav för prov', icon: <Car size={20} /> },
    { id: 'studentInformed', label: 'Information & Syfte', desc: 'Förklarat bedömningsgrunderna för provet', icon: <BookOpen size={20} /> },
    { id: 'questionsAnswered', label: 'Frågor', desc: 'Besvarat eventuella inledande frågor', icon: <HelpCircle size={20} /> }
  ] as const;

  const allChecked = checks.every(c => state.checklist?.[c.id]);

  const toggleAllChecks = () => {
    triggerHaptic('medium');
    const targetState = !allChecked;
    const updated: Record<string, boolean> = {};
    checks.forEach(c => {
      updated[c.id] = targetState;
    });
    updateState((prev) => ({
      ...prev,
      checklist: { ...(prev.checklist || {}), ...updated }
    }));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 px-4 sm:px-6 w-full pb-24 font-sans text-gray-900 dark:text-gray-100 antialiased">
      
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-zinc-800 pb-5">
        <div className="flex items-center gap-3 text-gray-500 dark:text-zinc-400 mb-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs font-black tracking-widest uppercase">
            Steg 3 av 5
          </span>
          <span className="text-xs font-bold text-gray-400">|</span>
          <span className="text-xs font-semibold text-gray-500 dark:text-zinc-400">Obligatoriska moment innan start</span>
        </div>
        <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
          <span>Inledning & Information</span>
          {allChecked && (
            <span className="inline-flex items-center gap-1 text-xs font-bold bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 px-2.5 py-0.5 rounded-full">
              Klar för start
            </span>
          )}
        </h1>
        <p className="text-sm text-gray-600 dark:text-zinc-400 mt-2 max-w-2xl leading-relaxed">
          Genomför de obligatoriska kontrollerna och informera kandidaten om provets fem kompetensområden innan provstart.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Checklist */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#002f6c] text-white flex items-center justify-center text-xs">1</span>
              Checklista för provstart
            </h2>
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-bold text-gray-500 dark:text-zinc-400">
                {checks.filter(c => state.checklist?.[c.id]).length}/{checks.length}
              </span>
              <button
                type="button"
                onClick={toggleAllChecks}
                className="text-xs font-bold text-[#002f6c] dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline cursor-pointer"
              >
                {allChecked ? 'Avmarkera alla' : 'Markera alla'}
              </button>
            </div>
          </div>
          
          <Card className="border-2 border-gray-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900 overflow-hidden rounded-2xl">
            <div className="divide-y divide-gray-100 dark:divide-zinc-800">
              {checks.map((check) => {
                const isChecked = state.checklist?.[check.id];
                return (
                  <button
                    key={check.id}
                    onClick={() => toggleCheck(check.id)}
                    className={cn(
                      "w-full text-left p-4 flex items-start gap-3.5 transition-all cursor-pointer group",
                      isChecked 
                        ? "bg-blue-50/40 dark:bg-blue-900/15 hover:bg-blue-50/60 dark:hover:bg-blue-900/25" 
                        : "hover:bg-gray-50 dark:hover:bg-zinc-800/60"
                    )}
                  >
                    <div className={cn(
                      "shrink-0 mt-0.5 p-2 rounded-xl transition-colors",
                      isChecked
                        ? "bg-blue-100 dark:bg-blue-900/50 text-[#002f6c] dark:text-blue-300"
                        : "bg-gray-100 dark:bg-zinc-800 text-gray-400 dark:text-zinc-500 group-hover:text-gray-600 dark:group-hover:text-zinc-400"
                    )}>
                      {check.icon}
                    </div>
                    <div className="flex-1">
                      <div className={cn(
                        "font-bold text-sm",
                        isChecked ? "text-[#002f6c] dark:text-blue-400" : "text-gray-900 dark:text-white"
                      )}>
                        {check.label}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                        {check.desc}
                      </div>
                    </div>
                    <div className="shrink-0 flex items-center justify-center pt-1">
                      {isChecked ? (
                        <CheckCircle className="w-6 h-6 text-[#002f6c] dark:text-blue-400 transition-all scale-110" />
                      ) : (
                        <Circle className="w-6 h-6 text-gray-300 dark:text-zinc-600 group-hover:text-gray-400 transition-all" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Right: The 5 Competence Areas matching photo */}
        <div className="lg:col-span-7 space-y-4">
          <KompetensOmradenCard />
        </div>
      </div>

      <div className="pt-8 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3">
        {!allChecked && (
          <p className="text-xs font-semibold text-gray-500 dark:text-zinc-400 text-center sm:text-right">
            Bocka av {checks.length - checks.filter(c => state.checklist?.[c.id]).length} kvarvarande punkt{checks.length - checks.filter(c => state.checklist?.[c.id]).length === 1 ? '' : 'er'} i checklistan för att fortsätta.
          </p>
        )}
        <Button
          onClick={handleNext}
          disabled={!allChecked}
          className={cn(
            "rounded-xl px-10 h-14 font-black text-sm tracking-widest uppercase transition-all",
            allChecked 
              ? "bg-[#002f6c] hover:bg-[#00204a] text-white shadow-lg shadow-blue-900/20 hover:scale-[1.02]" 
              : "bg-gray-200 text-gray-400 dark:bg-zinc-800 dark:text-zinc-600 cursor-not-allowed"
          )}
        >
          Gå till Prövning
        </Button>
      </div>
    </div>
  );
}
