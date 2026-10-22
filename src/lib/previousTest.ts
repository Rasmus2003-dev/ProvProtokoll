import type { AppState } from '../types';
import { readJSON } from './safeStorage';
import { supabase, isCloudDataEnabled, type SavedProtocolRow } from './supabase';

// Hittar kandidatens senaste underkända prov inför ett omprov – oavsett om
// protokollet ligger kvar i synkkön, i historiken på enheten eller i molnet.

/** 199901011234, 9901011234 och 19990101-1234 räknas som samma person */
export function normalizePersonalNumber(pnr: string | undefined | null): string {
  const digits = (pnr || '').replace(/\D/g, '');
  return digits.length >= 10 ? digits.slice(-10) : digits;
}

export function isFailedTest(test: AppState | null | undefined): boolean {
  if (!test?.result) return false;
  return test.result.drivingResult === 'Underkänt' || test.result.safetyCheckResult === 'Underkänt' || Boolean(test.result.testAborted);
}

export function isRetest(testType: string | undefined): boolean {
  return Boolean(testType && (testType.includes('Omprov') || testType.includes('Testprov')));
}

function newestFirst(a: AppState, b: AppState): number {
  return (b.properties.testDate || '').localeCompare(a.properties.testDate || '');
}

/** Snabb lokal sökning – körs direkt utan nätverk */
export function findLatestFailedLocal(personalNumber: string, sources: AppState[][]): AppState | null {
  const key = normalizePersonalNumber(personalNumber);
  if (key.length < 10) return null;

  const savedRows = readJSON<SavedProtocolRow[]>('provprotokoll_saved_db', []);
  const candidates = [
    ...sources.flat(),
    ...(Array.isArray(savedRows) ? savedRows.map(r => r?.full_state).filter(Boolean) : []),
  ].filter(t => normalizePersonalNumber(t?.properties?.personalNumber) === key && isFailedTest(t));

  return candidates.sort(newestFirst)[0] ?? null;
}

/** Söker i molnet (protokoll från andra enheter/inspektörer) */
export async function fetchLatestFailedCloud(personalNumber: string): Promise<AppState | null> {
  const key = normalizePersonalNumber(personalNumber);
  if (key.length < 10 || !isCloudDataEnabled()) return null;

  try {
    // Filtrera grovt på de fyra sista siffrorna i databasen, exakt matchning görs här
    const { data, error } = await supabase
      .from('protocols')
      .select('personal_number, created_at, full_state')
      .ilike('personal_number', `%${key.slice(-4)}`)
      .order('created_at', { ascending: false })
      .limit(50);
    if (error || !data) return null;

    const matches = (data as Pick<SavedProtocolRow, 'personal_number' | 'full_state'>[])
      .filter(r => normalizePersonalNumber(r.personal_number) === key && isFailedTest(r.full_state))
      .map(r => r.full_state);
    return matches.sort(newestFirst)[0] ?? null;
  } catch {
    return null;
  }
}
