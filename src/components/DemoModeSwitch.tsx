import { FlaskConical, RotateCcw, LogOut } from 'lucide-react';
import { DEMO_INSPECTOR, enterDemoMode, exitDemoMode, isDemoMode, resetDemoDay } from '../lib/demoMode';

// Kort i Profil: byt till demoinspektören och tillbaka
export function DemoModeCard() {
  const active = isDemoMode();
  return (
    <div className={`rounded-control border p-4 ${active ? 'border-violet-300 bg-violet-50/70 dark:border-violet-800/60 dark:bg-violet-950/20' : 'border-line bg-surface-2'}`}>
      <div className="flex items-start gap-3">
        <span className="w-9 h-9 rounded-full bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300 flex items-center justify-center shrink-0">
          <FlaskConical size={17} />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-ink">Demoinspektör – {DEMO_INSPECTOR.name}</p>
          <p className="text-[13px] text-ink-2 leading-snug mt-0.5">
            En påhittad arbetsdag med 30 prov: förstaprov, omprov med tidigare protokoll och några redan klara.
            Allt stannar på den här enheten och din riktiga data ligger kvar orörd.
          </p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {active ? (
          <>
            <button type="button" onClick={exitDemoMode} className="h-10 px-4 rounded-control bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold flex items-center gap-1.5 cursor-pointer">
              <LogOut size={15} /> Tillbaka till mitt konto
            </button>
            <button type="button" onClick={() => { if (window.confirm('Börja om demodagen från början? Prov du gjort i demoläget försvinner.')) resetDemoDay(); }} className="h-10 px-3.5 rounded-control border border-line text-ink-2 hover:text-ink hover:bg-surface text-sm font-medium flex items-center gap-1.5 cursor-pointer">
              <RotateCcw size={15} /> Börja om dagen
            </button>
          </>
        ) : (
          <button type="button" onClick={enterDemoMode} className="h-10 px-4 rounded-control bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold flex items-center gap-1.5 cursor-pointer">
            <FlaskConical size={15} /> Byt till demoinspektören
          </button>
        )}
      </div>
    </div>
  );
}

// Smal list överst i appen så länge demoläget är på
export function DemoModeBar() {
  if (!isDemoMode()) return null;
  return (
    <div className="shrink-0 print:hidden bg-violet-600 text-white text-[13px]">
      <div className="max-w-7xl mx-auto px-4 h-9 flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 min-w-0 truncate">
          <FlaskConical size={14} className="shrink-0" />
          <span className="truncate">Demoläge – du arbetar som {DEMO_INSPECTOR.name}. Inget sparas i molnet.</span>
        </span>
        <button type="button" onClick={exitDemoMode} className="shrink-0 h-7 px-2.5 rounded-md bg-white/15 hover:bg-white/25 font-semibold cursor-pointer">
          Avsluta
        </button>
      </div>
    </div>
  );
}
