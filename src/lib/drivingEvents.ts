import { v4 as uuidv4 } from 'uuid';
import { AppState, DrivingEvent, DrivingEventKind } from '../types';
import { recentFix } from './geoStore';

// Skapar en händelse med tidpunkt och – om GPS finns – aktuell position
export function createDrivingEvent(kind: DrivingEventKind, situation?: string, note?: string): DrivingEvent {
  const fix = recentFix();
  return {
    id: uuidv4(),
    t: Date.now(),
    kind,
    ...(situation ? { situation } : {}),
    ...(note?.trim() ? { note: note.trim() } : {}),
    ...(fix ? { lat: Math.round(fix.lat * 1e5) / 1e5, lng: Math.round(fix.lng * 1e5) / 1e5 } : {}),
  };
}

export function withEvent(prev: AppState, event: DrivingEvent): AppState {
  return { ...prev, events: [...(prev.events || []), event] };
}

export function sortedEvents(events: DrivingEvent[] | undefined): DrivingEvent[] {
  return [...(events || [])].sort((a, b) => a.t - b.t);
}
