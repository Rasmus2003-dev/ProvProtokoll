import { createClient } from '@supabase/supabase-js';
import { AppState } from '../types';

// Read Supabase credentials from env or fallback to local storage configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || localStorage.getItem('supabase_url') || 'https://demo-provprotokoll.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || localStorage.getItem('supabase_anon_key') || 'public-anon-key-placeholder';

export const isSupabaseConfigured = () => {
  const url = import.meta.env.VITE_SUPABASE_URL || localStorage.getItem('supabase_url');
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY || localStorage.getItem('supabase_anon_key');
  return !!(url && key && url !== 'https://demo-provprotokoll.supabase.co');
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface SavedProtocolRow {
  id: string;
  created_at: string;
  student_name: string;
  personal_number: string;
  license_type: string;
  test_type: string;
  transmission: string;
  tachograph?: string;
  driving_result: string | null;
  safety_result: string | null;
  examiner: string;
  full_state: AppState;
}

/**
 * Save protocol to Supabase with automatic local fallback & offline sync queue
 */
export async function saveProtocolToBackend(state: AppState, examinerName?: string): Promise<{ success: boolean; id: string; error?: string }> {
  const protocolId = 'PROV-' + Date.now();
  const payload = {
    id: protocolId,
    created_at: new Date().toISOString(),
    student_name: state.properties.studentName || 'Kandidat',
    personal_number: state.properties.personalNumber || '',
    license_type: state.properties.licenseType || 'B',
    test_type: state.properties.testType || 'Körprov',
    transmission: state.properties.transmission || 'Manuell',
    tachograph: state.properties.tachograph || 'Med färdskrivare',
    driving_result: state.result.drivingResult,
    safety_result: state.result.safetyCheckResult,
    examiner: examinerName || state.properties.examiner || 'Okänd provförrättare',
    full_state: state
  };

  // Always save in local backend store for instant offline persistence
  try {
    const existing = JSON.parse(localStorage.getItem('provprotokoll_saved_db') || '[]');
    existing.unshift(payload);
    // Inspelade rutter tar plats – behåll dem bara för de senaste protokollen lokalt
    // (molnet och exporterade säkerhetskopior har kvar hela rutten).
    const trimmed = existing.slice(0, 100).map((row: SavedProtocolRow, idx: number) =>
      idx < LOCAL_ROUTE_KEEP || !row.full_state?.route
        ? row
        : { ...row, full_state: { ...row.full_state, route: undefined } }
    );
    localStorage.setItem('provprotokoll_saved_db', JSON.stringify(trimmed));
  } catch (err) {
    console.warn('LocalStorage save failed:', err);
  }

  // If Supabase credentials exist, sync directly to Cloud Supabase
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('protocols')
        .insert([payload])
        .select();

      if (error) {
        console.warn('Supabase cloud insert notice:', error.message);
        return { success: true, id: protocolId, error: error.message };
      }
      return { success: true, id: data?.[0]?.id || protocolId };
    } catch (err: any) {
      console.warn('Network sync notice:', err);
    }
  }

  // Also sync with node backend /api/protocols if available
  try {
    await fetch('/api/protocols', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (_) {}

  return { success: true, id: protocolId };
}

const LOCAL_ROUTE_KEEP = 20;

export const BACKUP_FORMAT = 'provprotokoll-backup';

/**
 * Återställ protokoll från en säkerhetskopia. Befintliga protokoll (samma id)
 * hoppas över. Läggs alltid in lokalt och – om molnet är konfigurerat – även där.
 */
export async function importProtocols(rows: SavedProtocolRow[]): Promise<{ added: number; skipped: number }> {
  const valid = rows.filter(r => r && typeof r.id === 'string' && r.full_state && typeof r.full_state === 'object');
  let existing: SavedProtocolRow[] = [];
  try {
    existing = JSON.parse(localStorage.getItem('provprotokoll_saved_db') || '[]');
  } catch (_) {}

  const existingIds = new Set(existing.map(r => r.id));
  const toAdd = valid.filter(r => !existingIds.has(r.id));
  const merged = [...existing, ...toAdd].sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));

  try {
    localStorage.setItem('provprotokoll_saved_db', JSON.stringify(merged));
  } catch (err) {
    throw new Error('Lagringen på enheten är full – importen kunde inte sparas lokalt.');
  }

  if (isSupabaseConfigured() && toAdd.length > 0) {
    try {
      await supabase.from('protocols').upsert(toAdd, { onConflict: 'id', ignoreDuplicates: true });
    } catch (err) {
      console.warn('Kunde inte importera till molnet:', err);
    }
  }

  return { added: toAdd.length, skipped: rows.length - toAdd.length };
}

/**
 * Fetch all saved protocols from backend / local database
 */
export async function fetchAllProtocols(): Promise<SavedProtocolRow[]> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('protocols')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) {
        return data as SavedProtocolRow[];
      }
    } catch (_) {}
  }

  // Local fallback
  try {
    return JSON.parse(localStorage.getItem('provprotokoll_saved_db') || '[]');
  } catch {
    return [];
  }
}

export interface ProtocolQuery {
  search?: string;
  resultFilter?: 'all' | 'passed' | 'failed';
  licenseType?: string;
  page?: number;
  pageSize?: number;
}

export interface ProtocolPage {
  rows: SavedProtocolRow[];
  total: number;
  isCloud: boolean;
}

/**
 * Server-side filtrerad och paginerad hämtning av protokoll. Görs som
 * riktiga databasfrågor mot Supabase (sök, resultat- och behörighetsfilter,
 * pagination) istället för att hämta allt och filtrera i webbläsaren, vilket
 * blir tungt när registret växer till tusentals rader. Faller tillbaka på
 * lokal in-memory-filtrering av localStorage-datan om molnet inte är
 * konfigurerat eller inte svarar.
 */
export async function fetchProtocolsPage(query: ProtocolQuery = {}): Promise<ProtocolPage> {
  const page = query.page ?? 0;
  const pageSize = query.pageSize ?? 25;
  const search = query.search?.trim() || '';

  if (isSupabaseConfigured()) {
    try {
      let builder = supabase
        .from('protocols')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (search) {
        builder = builder.or(
          `student_name.ilike.%${search}%,personal_number.ilike.%${search}%`
        );
      }
      if (query.licenseType && query.licenseType !== 'all') {
        builder = builder.eq('license_type', query.licenseType);
      }
      if (query.resultFilter === 'passed') {
        builder = builder.eq('driving_result', 'Godkänt');
      } else if (query.resultFilter === 'failed') {
        builder = builder.neq('driving_result', 'Godkänt');
      }

      const from = page * pageSize;
      const to = from + pageSize - 1;
      const { data, error, count } = await builder.range(from, to);

      if (!error && data) {
        return { rows: data as SavedProtocolRow[], total: count || 0, isCloud: true };
      }
    } catch (_) {}
  }

  // Local fallback: filtrera i minnet på samma villkor
  let rows: SavedProtocolRow[] = [];
  try {
    rows = JSON.parse(localStorage.getItem('provprotokoll_saved_db') || '[]');
  } catch {
    rows = [];
  }

  if (search) {
    const term = search.toLowerCase();
    rows = rows.filter(r =>
      (r.student_name || '').toLowerCase().includes(term) ||
      (r.personal_number || '').toLowerCase().includes(term)
    );
  }
  if (query.licenseType && query.licenseType !== 'all') {
    rows = rows.filter(r => r.license_type === query.licenseType);
  }
  if (query.resultFilter === 'passed') {
    rows = rows.filter(r => r.driving_result === 'Godkänt');
  } else if (query.resultFilter === 'failed') {
    rows = rows.filter(r => r.driving_result !== 'Godkänt');
  }

  const total = rows.length;
  const from = page * pageSize;
  const paged = rows.slice(from, from + pageSize);
  return { rows: paged, total, isCloud: false };
}

export interface ProtocolStats {
  total: number;
  passed: number;
  failed: number;
  passRate: number;
  availableLicenses: string[];
}

/**
 * Snabba aggregat (antal totalt/godkänt/underkänt) via count-frågor istället
 * för att hämta alla rader till klienten för att räkna dem där.
 */
export async function fetchProtocolStats(): Promise<ProtocolStats> {
  if (isSupabaseConfigured()) {
    try {
      const [totalRes, passedRes, licenseRes] = await Promise.all([
        supabase.from('protocols').select('id', { count: 'exact', head: true }),
        supabase.from('protocols').select('id', { count: 'exact', head: true }).eq('driving_result', 'Godkänt'),
        supabase.from('protocols').select('license_type')
      ]);

      const total = totalRes.count || 0;
      const passed = passedRes.count || 0;
      const availableLicenses = Array.from(
        new Set((licenseRes.data || []).map((r: any) => r.license_type).filter(Boolean))
      ).sort();

      return {
        total,
        passed,
        failed: total - passed,
        passRate: total > 0 ? Math.round((passed / total) * 100) : 0,
        availableLicenses
      };
    } catch (_) {}
  }

  // Local fallback
  let rows: SavedProtocolRow[] = [];
  try {
    rows = JSON.parse(localStorage.getItem('provprotokoll_saved_db') || '[]');
  } catch {
    rows = [];
  }
  const total = rows.length;
  const passed = rows.filter(r => r.driving_result === 'Godkänt').length;
  const availableLicenses = Array.from(new Set(rows.map(r => r.license_type).filter(Boolean))).sort();
  return {
    total,
    passed,
    failed: total - passed,
    passRate: total > 0 ? Math.round((passed / total) * 100) : 0,
    availableLicenses
  };
}

/**
 * Prenumerera på live-ändringar i protokoll-tabellen (t.ex. en annan
 * inspektör som sparar ett prov på en annan dator). Returnerar en
 * unsubscribe-funktion.
 */
export function subscribeToProtocols(onChange: () => void): () => void {
  if (!isSupabaseConfigured()) {
    return () => {};
  }

  const channel = supabase
    .channel('protocols-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'protocols' }, () => {
      onChange();
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Delete a protocol from Supabase and local storage
 */
export async function deleteProtocolFromBackend(id: string): Promise<boolean> {
  // Delete from local store
  try {
    const existing: SavedProtocolRow[] = JSON.parse(localStorage.getItem('provprotokoll_saved_db') || '[]');
    const filtered = existing.filter(p => p.id !== id);
    localStorage.setItem('provprotokoll_saved_db', JSON.stringify(filtered));
  } catch (_) {}

  // Delete from Supabase
  if (isSupabaseConfigured()) {
    try {
      await supabase.from('protocols').delete().eq('id', id);
    } catch (_) {}
  }

  return true;
}

/**
 * Supabase Authentication helpers
 */
export async function signInWithEmailPassword(email: string, password: string) {
  return await supabase.auth.signInWithPassword({ email, password });
}

export async function signUpWithEmailPassword(email: string, password: string) {
  return await supabase.auth.signUp({ email, password });
}

export async function signOutSupabase() {
  return await supabase.auth.signOut();
}

export async function getSupabaseUser() {
  const { data } = await supabase.auth.getUser();
  return data?.user || null;
}

export async function updateUserPassword(newPassword: string) {
  return await supabase.auth.updateUser({ password: newPassword });
}

