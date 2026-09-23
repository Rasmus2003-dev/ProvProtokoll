import { useSyncExternalStore } from 'react';

// Senast kända GPS-position, delad mellan inspelaren och Navigator-panelen
// utan att varje positionsuppdatering behöver skrivas till provets state.
export interface GeoFix {
  lat: number;
  lng: number;
  accuracy: number;
  speed: number | null; // m/s
  t: number;
}

interface GeoSnapshot {
  fix: GeoFix | null;
  error: string | null;
}

let snapshot: GeoSnapshot = { fix: null, error: null };
const listeners = new Set<() => void>();

export function setGeo(update: Partial<GeoSnapshot>) {
  snapshot = { ...snapshot, ...update };
  listeners.forEach(l => l());
}

export function getGeo(): GeoSnapshot {
  return snapshot;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useGeo(): GeoSnapshot {
  return useSyncExternalStore(subscribe, getGeo, getGeo);
}

// Position som är tillräckligt färsk för att knyta en händelse till kartan
export function recentFix(maxAgeMs = 30000): GeoFix | null {
  const fix = snapshot.fix;
  return fix && Date.now() - fix.t <= maxAgeMs ? fix : null;
}
