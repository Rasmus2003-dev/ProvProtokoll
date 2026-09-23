import { useEffect, useState } from 'react';
import { X, MapPin, MapPinOff } from 'lucide-react';
import { DrivingEventKind } from '../../types';
import { EVENT_META } from '../../lib/route';
import { useGeo } from '../../lib/geoStore';
import { Portal } from '../Portal';

export interface EventDialogResult {
  kind: DrivingEventKind;
  situation?: string;
  note?: string;
}

interface EventDialogProps {
  open: boolean;
  title: string;
  description?: string;
  situations: string[];
  initialKind?: DrivingEventKind;
  initialSituation?: string;
  kinds?: DrivingEventKind[];
  saveLabel?: string;
  // Valfri extra åtgärd, t.ex. "Ångra ingripande"
  secondaryAction?: { label: string; onClick: () => void };
  onSave: (result: EventDialogResult) => void;
  onClose: () => void;
}

export function EventDialog({
  open,
  title,
  description,
  situations,
  initialKind = 'notering',
  initialSituation,
  kinds = ['brist', 'ingripande', 'notering'],
  saveLabel = 'Spara',
  secondaryAction,
  onSave,
  onClose,
}: EventDialogProps) {
  const [kind, setKind] = useState<DrivingEventKind>(initialKind);
  const [situation, setSituation] = useState<string | undefined>(initialSituation);
  const [note, setNote] = useState('');
  const { fix } = useGeo();
  const hasPosition = Boolean(fix && Date.now() - fix.t <= 30000);

  useEffect(() => {
    if (open) {
      setKind(initialKind);
      setSituation(initialSituation);
      setNote('');
    }
  }, [open, initialKind, initialSituation]);

  if (!open) return null;

  return (
    <Portal>
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-lg max-h-[90dvh] flex flex-col bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-3 border-b border-gray-100 dark:border-slate-800">
          <div>
            <h3 className="text-base font-black text-gray-900 dark:text-white">{title}</h3>
            {description && <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{description}</p>}
            <div className={`mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold ${hasPosition ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'}`}>
              {hasPosition ? <MapPin size={12} /> : <MapPinOff size={12} />}
              {hasPosition ? 'Platsen sparas på kartan' : 'Ingen GPS-position – sparas utan plats'}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 -mr-2 -mt-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-slate-800 cursor-pointer"
            aria-label="Stäng"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {kinds.length > 1 && (
            <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${kinds.length}, minmax(0, 1fr))` }}>
              {kinds.map(k => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setKind(k)}
                  className={`h-11 rounded-xl border-2 text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                    kind === k ? EVENT_META[k].badge : 'bg-white dark:bg-slate-900 text-gray-500 dark:text-slate-400 border-gray-200 dark:border-slate-700'
                  }`}
                >
                  {EVENT_META[k].label}
                </button>
              ))}
            </div>
          )}

          <div className="space-y-2">
            <div className="text-[11px] font-black uppercase tracking-wider text-gray-500 dark:text-slate-400">Situation</div>
            <div className="flex flex-wrap gap-2">
              {situations.map(sit => {
                const selected = situation === sit;
                return (
                  <button
                    key={sit}
                    type="button"
                    onClick={() => setSituation(selected ? undefined : sit)}
                    className={`px-3 py-2 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                      selected
                        ? 'bg-[#002f6c] dark:bg-blue-600 text-white border-[#002f6c] dark:border-blue-500'
                        : 'bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-300 border-gray-200 dark:border-slate-700 hover:border-gray-300'
                    }`}
                  >
                    {sit}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-black uppercase tracking-wider text-gray-500 dark:text-slate-400" htmlFor="event-note">
              Kommentar <span className="normal-case font-medium">(valfritt)</span>
            </label>
            <textarea
              id="event-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="t.ex. sen avsökning åt vänster"
              className="w-full rounded-xl border-2 border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#002f6c] dark:focus:border-blue-500 resize-none"
            />
          </div>
        </div>

        <div className="px-5 py-4 border-t border-gray-100 dark:border-slate-800 flex flex-col-reverse sm:flex-row gap-2 sm:justify-between pb-[max(1rem,env(safe-area-inset-bottom))]">
          {secondaryAction ? (
            <button
              type="button"
              onClick={secondaryAction.onClick}
              className="h-11 px-4 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer"
            >
              {secondaryAction.label}
            </button>
          ) : <span />}
          <button
            type="button"
            onClick={() => onSave({ kind, situation, note })}
            className="h-12 px-6 rounded-xl bg-[#002f6c] hover:bg-[#00204a] dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-sm font-black uppercase tracking-wider cursor-pointer active:scale-[0.98] transition-all"
          >
            {saveLabel}
          </button>
        </div>
      </div>
    </div>
    </Portal>
  );
}
