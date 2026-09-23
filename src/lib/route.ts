import { DrivingEvent, DrivingEventKind, RouteRecording } from '../types';

export type RoutePoint = [number, number, number];

export const EVENT_META: Record<DrivingEventKind, { label: string; color: string; badge: string }> = {
  brist: { label: 'Brist', color: '#C0504D', badge: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-950/50 dark:text-red-300 dark:border-red-800' },
  ingripande: { label: 'Ingripande', color: '#E8870E', badge: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800' },
  notering: { label: 'Notering', color: '#2563EB', badge: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800' },
};

// Avstånd i meter mellan två koordinater (haversine)
export function distanceM(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export function routeDistanceM(points: RoutePoint[]): number {
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    total += distanceM(points[i - 1][0], points[i - 1][1], points[i][0], points[i][1]);
  }
  return total;
}

export function formatDistance(m: number): string {
  return m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(1).replace('.', ',')} km`;
}

export function formatElapsed(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60).toString().padStart(2, '0');
  const s = (total % 60).toString().padStart(2, '0');
  return h > 0 ? `${h}:${m}:${s}` : `${m}:${s}`;
}

// Förenkla körvägen (Ramer–Douglas–Peucker) så att den tar mindre plats i
// historiken utan att formen på rutten förändras synbart. Toleransen i meter.
export function simplifyRoute(points: RoutePoint[], toleranceM = 4): RoutePoint[] {
  if (points.length < 3) return points;

  // Projicera till lokalt plan (meter) runt första punkten
  const lat0 = (points[0][0] * Math.PI) / 180;
  const mPerDegLat = 111320;
  const mPerDegLng = 111320 * Math.cos(lat0);
  const xy = points.map(p => [p[1] * mPerDegLng, p[0] * mPerDegLat]);

  const perpDist = (i: number, a: number, b: number) => {
    const [x, y] = xy[i];
    const [x1, y1] = xy[a];
    const [x2, y2] = xy[b];
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = dx * dx + dy * dy;
    if (len === 0) return Math.hypot(x - x1, y - y1);
    const t = Math.max(0, Math.min(1, ((x - x1) * dx + (y - y1) * dy) / len));
    return Math.hypot(x - (x1 + t * dx), y - (y1 + t * dy));
  };

  const keep = new Uint8Array(points.length);
  keep[0] = 1;
  keep[points.length - 1] = 1;
  const stack: [number, number][] = [[0, points.length - 1]];
  while (stack.length) {
    const [a, b] = stack.pop()!;
    let maxD = 0;
    let idx = -1;
    for (let i = a + 1; i < b; i++) {
      const d = perpDist(i, a, b);
      if (d > maxD) { maxD = d; idx = i; }
    }
    if (idx !== -1 && maxD > toleranceM) {
      keep[idx] = 1;
      stack.push([a, idx], [idx, b]);
    }
  }
  return points.filter((_, i) => keep[i]);
}

// Position vid en given tidpunkt (för uppspelning), interpolerad mellan punkter
export function positionAt(points: RoutePoint[], t: number): [number, number] | null {
  if (points.length === 0) return null;
  if (t <= points[0][2]) return [points[0][0], points[0][1]];
  for (let i = 1; i < points.length; i++) {
    if (points[i][2] >= t) {
      const [aLat, aLng, aT] = points[i - 1];
      const [bLat, bLng, bT] = points[i];
      const f = bT === aT ? 1 : (t - aT) / (bT - aT);
      return [aLat + (bLat - aLat) * f, aLng + (bLng - aLng) * f];
    }
  }
  const last = points[points.length - 1];
  return [last[0], last[1]];
}

export function hasRouteData(state: { route?: RouteRecording; events?: DrivingEvent[] } | null | undefined): boolean {
  return Boolean(state && ((state.route?.points?.length ?? 0) > 1 || (state.events?.length ?? 0) > 0));
}

// Referenstid för "hur långt in i provet" en händelse skedde
export function routeStartTime(route: RouteRecording | undefined, events: DrivingEvent[] | undefined): number | null {
  const candidates = [
    route?.startedAt ?? null,
    route?.points?.[0]?.[2] ?? null,
    ...(events || []).map(e => e.t),
  ].filter((v): v is number => typeof v === 'number');
  return candidates.length ? Math.min(...candidates) : null;
}
