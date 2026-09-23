import { useEffect, useMemo, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, X, MapPinOff } from 'lucide-react';
import { DrivingEvent, RouteRecording } from '../../types';
import { EVENT_META, formatDistance, formatElapsed, positionAt, routeDistanceM, routeStartTime } from '../../lib/route';
import { sortedEvents } from '../../lib/drivingEvents';
import { RouteMap } from './RouteMap';
import { Portal } from '../Portal';

interface RouteReviewProps {
  route?: RouteRecording;
  events?: DrivingEvent[];
  large?: boolean; // större text/karta, t.ex. när kandidaten tittar
  mapClassName?: string;
}

const SPEEDS = [10, 30, 60];

export function RouteReview({ route, events: rawEvents, large = false, mapClassName }: RouteReviewProps) {
  const points = route?.points || [];
  const events = useMemo(() => sortedEvents(rawEvents), [rawEvents]);
  const start = routeStartTime(route, rawEvents) ?? 0;
  const end = Math.max(
    route?.stoppedAt || 0,
    points.length ? points[points.length - 1][2] : 0,
    events.length ? events[events.length - 1].t : 0,
    start
  );
  const duration = end - start;
  const distance = useMemo(() => routeDistanceM(points), [points]);
  const canPlay = points.length > 1 && duration > 0;

  const [time, setTime] = useState(end);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(SPEEDS[1]);
  const [focusId, setFocusId] = useState<string | null>(null);
  const lastFrame = useRef<number | null>(null);

  useEffect(() => { setTime(end); }, [end]);

  // Uppspelning av körningen i x-faldig hastighet
  useEffect(() => {
    if (!playing) { lastFrame.current = null; return; }
    let raf = 0;
    const tick = (ts: number) => {
      if (lastFrame.current != null) {
        const delta = (ts - lastFrame.current) * speed;
        setTime(t => {
          const next = t + delta;
          if (next >= end) { setPlaying(false); return end; }
          return next;
        });
      }
      lastFrame.current = ts;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, speed, end]);

  const playbackPosition = canPlay && (playing || time < end) ? positionAt(points, time) : null;

  const togglePlay = () => {
    if (!playing && time >= end) setTime(start);
    setPlaying(p => !p);
  };

  const selectEvent = (ev: DrivingEvent) => {
    setPlaying(false);
    setFocusId(ev.id);
    setTime(ev.t);
  };

  const counts = events.reduce<Record<string, number>>((acc, e) => { acc[e.kind] = (acc[e.kind] || 0) + 1; return acc; }, {});
  const textSize = large ? 'text-base' : 'text-sm';

  return (
    <div className={`flex flex-col lg:flex-row gap-4 ${large ? 'h-full' : ''}`}>
      <div className={`flex flex-col gap-3 ${large ? 'flex-1 min-h-0' : 'lg:flex-[3]'}`}>
        {points.length > 1 || events.some(e => typeof e.lat === 'number') ? (
          <RouteMap
            points={points}
            events={events}
            focusEventId={focusId}
            onEventClick={(id) => { const ev = events.find(e => e.id === id); if (ev) selectEvent(ev); }}
            playbackPosition={playbackPosition}
            className={mapClassName || (large ? 'flex-1 min-h-[300px]' : 'h-80')}
          />
        ) : (
          <div className="h-40 rounded-xl border border-dashed border-gray-300 dark:border-slate-700 flex flex-col items-center justify-center text-gray-400 text-sm gap-2">
            <MapPinOff size={22} />
            Ingen inspelad rutt – händelserna visas i listan.
          </div>
        )}

        {canPlay && (
          <div className="rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2.5 flex items-center gap-3">
            <button
              type="button"
              onClick={togglePlay}
              className="w-10 h-10 rounded-full bg-[#002f6c] dark:bg-blue-600 text-white flex items-center justify-center shrink-0 cursor-pointer active:scale-95"
              aria-label={playing ? 'Pausa' : 'Spela upp körningen'}
            >
              {playing ? <Pause size={16} className="fill-current" /> : <Play size={16} className="fill-current ml-0.5" />}
            </button>
            <div className="flex-1 min-w-0">
              <div className="relative h-6 flex items-center">
                {/* Händelser som prickar längs tidslinjen */}
                {events.map((ev, idx) => (
                  <button
                    key={ev.id}
                    type="button"
                    onClick={() => selectEvent(ev)}
                    className="absolute top-0 w-3 h-3 -ml-1.5 rounded-full border-2 border-white dark:border-slate-900 cursor-pointer z-10"
                    style={{ left: `${duration ? ((ev.t - start) / duration) * 100 : 0}%`, background: EVENT_META[ev.kind].color }}
                    title={`${idx + 1}. ${EVENT_META[ev.kind].label}${ev.situation ? ` – ${ev.situation}` : ''}`}
                  />
                ))}
                <input
                  type="range"
                  min={start}
                  max={end}
                  step={1000}
                  value={time}
                  onChange={(e) => { setPlaying(false); setTime(Number(e.target.value)); }}
                  className="w-full mt-3 accent-[#002f6c] dark:accent-blue-500 cursor-pointer"
                  aria-label="Tidslinje"
                />
              </div>
              <div className="flex justify-between text-[11px] font-mono text-gray-500 dark:text-slate-400 mt-1">
                <span className="font-bold text-gray-900 dark:text-white">{formatElapsed(time - start)}</span>
                <span>{formatElapsed(duration)}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {SPEEDS.map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSpeed(s)}
                  className={`px-2 h-7 rounded-md text-[11px] font-black cursor-pointer ${speed === s ? 'bg-gray-900 text-white dark:bg-white dark:text-slate-900' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800'}`}
                >
                  {s}×
                </button>
              ))}
              <button
                type="button"
                onClick={() => { setPlaying(false); setTime(start); }}
                className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-slate-800 cursor-pointer"
                aria-label="Till början"
              >
                <RotateCcw size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Händelselista */}
      <div className={`flex flex-col gap-2 ${large ? 'lg:w-96 lg:overflow-y-auto' : 'lg:flex-[2]'}`}>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {points.length > 1 && (
            <span className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-slate-800 font-bold text-gray-700 dark:text-slate-300">
              {formatDistance(distance)} · {formatElapsed(duration)}
            </span>
          )}
          {(['brist', 'ingripande', 'notering'] as const).filter(k => counts[k]).map(k => (
            <span key={k} className={`px-2.5 py-1 rounded-lg border font-bold ${EVENT_META[k].badge}`}>
              {counts[k]} {EVENT_META[k].label.toLowerCase()}{counts[k] > 1 && k !== 'ingripande' ? (k === 'brist' ? 'er' : 'ar') : ''}
            </span>
          ))}
        </div>

        {events.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-slate-400 py-4">Inga händelser markerades under körningen.</p>
        ) : (
          <ol className="space-y-2">
            {events.map((ev, idx) => {
              const passed = !playing || ev.t <= time;
              const focused = ev.id === focusId;
              return (
                <li key={ev.id}>
                  <button
                    type="button"
                    onClick={() => selectEvent(ev)}
                    className={`w-full text-left flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                      focused
                        ? 'border-[#002f6c] dark:border-blue-500 bg-blue-50/60 dark:bg-blue-950/30 ring-1 ring-[#002f6c]/30'
                        : 'border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-gray-300'
                    } ${passed ? '' : 'opacity-40'}`}
                  >
                    <span
                      className={`rounded-full text-white font-black flex items-center justify-center shrink-0 ${large ? 'w-8 h-8 text-sm' : 'w-7 h-7 text-xs'}`}
                      style={{ background: EVENT_META[ev.kind].color }}
                    >
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className={`${textSize} font-bold text-gray-900 dark:text-white`}>
                        {ev.situation || EVENT_META[ev.kind].label}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border ${EVENT_META[ev.kind].badge}`}>
                          {EVENT_META[ev.kind].label}
                        </span>
                        <span className="text-[11px] font-mono text-gray-500 dark:text-slate-400">
                          {formatElapsed(ev.t - start)} in i provet
                        </span>
                        {typeof ev.lat !== 'number' && <span className="text-[10px] text-gray-400">(ingen plats)</span>}
                      </div>
                      {ev.note && <p className={`${large ? 'text-sm' : 'text-xs'} text-gray-600 dark:text-slate-300 mt-1.5`}>{ev.note}</p>}
                    </div>
                  </button>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </div>
  );
}

interface RouteReviewModalProps extends RouteReviewProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
}

// Helskärmsvy för att gå igenom körningen tillsammans med kandidaten
export function RouteReviewModal({ open, onClose, title = 'Genomgång av körningen', subtitle, ...rest }: RouteReviewModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <Portal>
    <div className="fixed inset-0 z-[60] bg-slate-50 dark:bg-slate-950 flex flex-col animate-in fade-in duration-150">
      <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3 bg-[#002f6c] text-white shrink-0">
        <div className="min-w-0">
          <h2 className="font-black text-base sm:text-lg truncate">{title}</h2>
          {subtitle && <p className="text-xs text-blue-200 truncate">{subtitle}</p>}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="min-w-10 min-h-10 flex items-center justify-center rounded-xl hover:bg-white/10 cursor-pointer"
          aria-label="Stäng"
        >
          <X size={22} />
        </button>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-5">
        <RouteReview {...rest} large />
      </div>
    </div>
    </Portal>
  );
}
