import { useEffect, useState } from 'react';
import { Shuffle, ChevronDown, ShieldCheck } from 'lucide-react';
import { useAppStore } from '../../../store/ProvContext';
import { getLightSafetyTask, pickLightSafetyTasks } from '../../../data/lightSafetyCheck';

// Liten ruta med förslag på vad kandidaten ska kontrollera vid säkerhetskontrollen
// (lätta fordon). Nya förslag för varje prov; sparas i provet så de står kvar
// om man byter flik.
export function LightSafetySuggestion() {
  const { state, updateState } = useAppStore();
  const [openId, setOpenId] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const ids = state.lightSafetyTasks;

  useEffect(() => {
    if (!ids || ids.length === 0) {
      updateState(prev => (prev.lightSafetyTasks?.length ? prev : { ...prev, lightSafetyTasks: pickLightSafetyTasks() }));
    }
  }, [ids, updateState]);

  const reshuffle = () => {
    setOpenId(null);
    updateState(prev => ({ ...prev, lightSafetyTasks: pickLightSafetyTasks(prev.lightSafetyTasks || []) }));
  };

  const tasks = (ids || []).map(getLightSafetyTask).filter(Boolean);
  if (tasks.length === 0) return null;

  return (
    <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20">
      <div className="flex items-center gap-2 px-3.5 py-2">
        <button
          type="button"
          onClick={() => setCollapsed(c => !c)}
          className="flex-1 flex items-center gap-2 text-left cursor-pointer min-w-0"
          aria-expanded={!collapsed}
        >
          <ShieldCheck size={15} className="text-emerald-700 dark:text-emerald-400 shrink-0" />
          <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200">Säkerhetskontroll – förslag</span>
          {collapsed && <span className="text-[11px] text-emerald-700/70 dark:text-emerald-400/70 truncate">{tasks.length} uppgifter</span>}
          <ChevronDown size={14} className={`ml-auto shrink-0 text-emerald-700/60 transition-transform ${collapsed ? '' : 'rotate-180'}`} />
        </button>
        <button
          type="button"
          onClick={reshuffle}
          className="h-7 px-2 rounded-md text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 flex items-center gap-1 cursor-pointer shrink-0"
          title="Slumpa nya uppgifter"
        >
          <Shuffle size={12} /> Slumpa nya
        </button>
      </div>

      {!collapsed && (
        <ol className="px-3.5 pb-3 grid gap-1.5 sm:grid-cols-3">
          {tasks.map((t, i) => {
            const open = openId === t!.id;
            return (
              <li key={t!.id}>
                <button
                  type="button"
                  onClick={() => setOpenId(open ? null : t!.id)}
                  className="w-full h-full text-left rounded-lg bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-900/40 px-3 py-2 cursor-pointer hover:border-emerald-300 transition-colors"
                >
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-emerald-700/80 dark:text-emerald-400/80">
                    {i + 1}. {t!.area}
                  </div>
                  <div className="text-[13px] font-medium text-slate-800 dark:text-slate-100 leading-snug mt-0.5">{t!.task}</div>
                  {open && (
                    <div className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 pt-1.5 border-t border-slate-100 dark:border-slate-800 leading-snug">
                      {t!.lookFor}
                    </div>
                  )}
                </button>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
