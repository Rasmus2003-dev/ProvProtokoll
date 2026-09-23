import { useEffect, useMemo, useState } from 'react';
import { Navigation, Play, Pause, Square, ChevronDown, Trash2, AlertTriangle } from 'lucide-react';
import { useAppStore } from '../../store/ProvContext';
import { useGeo } from '../../lib/geoStore';
import { EVENT_META, formatDistance, formatElapsed, routeDistanceM, routeStartTime, simplifyRoute } from '../../lib/route';
import { sortedEvents } from '../../lib/drivingEvents';
import { DrivingEventKind } from '../../types';
import { RouteMap } from './RouteMap';

interface NavigatorPanelProps {
  onMark: (kind: DrivingEventKind) => void;
}

// Diskret GPS-panel: en rad som standard, fälls ut för karta, markering och händelser
export function NavigatorPanel({ onMark }: NavigatorPanelProps) {
  const { state, updateState } = useAppStore();
  const { fix, error } = useGeo();
  const [expanded, setExpanded] = useState(false);
  const [now, setNow] = useState(Date.now());

  const route = state.route;
  const recording = Boolean(route?.recording);
  const started = Boolean(route?.startedAt);
  const finished = Boolean(route?.stoppedAt);
  const points = route?.points || [];
  const events = useMemo(() => sortedEvents(state.events), [state.events]);
  const distance = useMemo(() => routeDistanceM(points), [points]);
  const start = routeStartTime(route, state.events);

  useEffect(() => {
    if (!recording) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [recording]);

  const elapsedMs = start ? (recording ? now : (route?.stoppedAt || now)) - start : 0;
  const speedKmh = recording && fix?.speed != null && Date.now() - fix.t < 10000 ? Math.round(fix.speed * 3.6) : null;

  const startRecording = () => {
    updateState(prev => ({
      ...prev,
      // Starta provtimern samtidigt om den inte redan går
      testStartTime: prev.testStartTime ?? Date.now(),
      route: {
        recording: true,
        startedAt: prev.route?.startedAt ?? Date.now(),
        stoppedAt: null,
        points: prev.route?.points || [],
      },
    }));
  };

  const pauseRecording = () => {
    updateState(prev => prev.route ? { ...prev, route: { ...prev.route, recording: false } } : prev);
  };

  const finishRecording = () => {
    updateState(prev => prev.route ? {
      ...prev,
      route: { ...prev.route, recording: false, stoppedAt: Date.now(), points: simplifyRoute(prev.route.points) },
    } : prev);
  };

  const clearRoute = () => {
    if (!window.confirm('Radera den inspelade rutten och alla markerade händelser?')) return;
    updateState(prev => ({ ...prev, route: undefined, events: [] }));
  };

  const removeEvent = (id: string) => {
    updateState(prev => ({ ...prev, events: (prev.events || []).filter(e => e.id !== id) }));
  };

  const status = recording ? 'Spelar in' : finished ? 'Klar' : started ? 'Pausad' : 'Av';
  const statusColor = recording ? 'text-red-600 dark:text-red-400' : finished ? 'text-emerald-600 dark:text-emerald-400' : started ? 'text-amber-600 dark:text-amber-400' : 'text-gray-400';

  return (
    <div className="rounded-xl border border-gray-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 overflow-hidden">
      {/* Kompakt rad */}
      <div className="flex items-center gap-3 px-3 py-2">
        <button
          type="button"
          onClick={() => setExpanded(v => !v)}
          className="flex-1 min-w-0 flex items-center gap-2.5 text-left cursor-pointer"
          aria-expanded={expanded}
        >
          <Navigation size={15} className={`shrink-0 ${recording ? 'text-red-600 animate-pulse' : 'text-gray-400'}`} />
          <span className="text-xs font-bold text-gray-700 dark:text-slate-300">Navigator</span>
          <span className={`text-[11px] font-semibold ${statusColor}`}>{status}</span>
          {started && (
            <span className="hidden sm:inline text-[11px] font-mono text-gray-500 dark:text-slate-400 truncate">
              {formatElapsed(elapsedMs)} · {formatDistance(distance)}{speedKmh != null ? ` · ${speedKmh} km/h` : ''}
            </span>
          )}
          {events.length > 0 && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300">
              {events.length} händelse{events.length > 1 ? 'r' : ''}
            </span>
          )}
          <ChevronDown size={15} className={`ml-auto shrink-0 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </button>

        <div className="flex items-center gap-1.5 shrink-0">
          {!recording ? (
            <button
              type="button"
              onClick={startRecording}
              className="h-8 px-3 rounded-lg border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800"
            >
              <Play size={12} className="fill-current" /> {started ? 'Fortsätt' : 'Starta GPS'}
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={pauseRecording}
                className="w-8 h-8 rounded-lg border border-gray-300 dark:border-slate-700 text-gray-600 dark:text-slate-300 flex items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800"
                title="Pausa" aria-label="Pausa"
              >
                <Pause size={13} />
              </button>
              <button
                type="button"
                onClick={finishRecording}
                className="w-8 h-8 rounded-lg border border-red-200 dark:border-red-900/60 text-red-600 flex items-center justify-center cursor-pointer hover:bg-red-50 dark:hover:bg-red-950/30"
                title="Avsluta inspelningen" aria-label="Avsluta inspelningen"
              >
                <Square size={11} className="fill-current" />
              </button>
            </>
          )}
        </div>
      </div>

      {recording && error && (
        <div className="px-3 py-2 bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 text-xs font-semibold flex items-center gap-2 border-t border-amber-200 dark:border-amber-900/50">
          <AlertTriangle size={13} className="shrink-0" /> {error}
        </div>
      )}

      {/* Utfällt innehåll */}
      {expanded && (
        <div className="border-t border-gray-100 dark:border-slate-800 p-3 space-y-3 animate-in fade-in duration-150">
          <div className="flex flex-wrap gap-2">
            {(['brist', 'ingripande', 'notering'] as DrivingEventKind[]).map(kind => (
              <button
                key={kind}
                type="button"
                onClick={() => onMark(kind)}
                className={`h-9 px-3.5 rounded-lg border text-xs font-bold cursor-pointer active:scale-95 transition-all ${EVENT_META[kind].badge}`}
              >
                + {EVENT_META[kind].label}
              </button>
            ))}
          </div>

          <RouteMap
            points={points}
            events={events}
            follow={recording}
            livePosition={recording && fix ? { lat: fix.lat, lng: fix.lng, accuracy: fix.accuracy } : null}
            className="h-60"
          />

          {events.length > 0 && (
            <div className="space-y-0.5 max-h-44 overflow-y-auto">
              {events.map((ev, idx) => ({ ev, idx })).reverse().map(({ ev, idx }) => (
                <div key={ev.id} className="flex items-center gap-2.5 py-1 text-xs">
                  <span
                    className="w-5 h-5 rounded-full text-white font-black text-[10px] flex items-center justify-center shrink-0"
                    style={{ background: EVENT_META[ev.kind].color }}
                  >
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0 truncate">
                    <span className="font-semibold text-gray-800 dark:text-white">{ev.situation || EVENT_META[ev.kind].label}</span>
                    {ev.note && <span className="text-gray-500 dark:text-slate-400"> – {ev.note}</span>}
                  </div>
                  <span className="font-mono text-[10px] text-gray-400 shrink-0">{start ? formatElapsed(ev.t - start) : ''}</span>
                  <button
                    type="button"
                    onClick={() => removeEvent(ev.id)}
                    className="p-1 rounded text-gray-300 hover:text-red-600 cursor-pointer"
                    aria-label="Ta bort händelse"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {(points.length > 0 || events.length > 0) && (
            <div className="flex justify-end">
              <button type="button" onClick={clearRoute} className="text-[11px] font-semibold text-gray-400 hover:text-red-600 cursor-pointer">
                Rensa rutt & händelser
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
