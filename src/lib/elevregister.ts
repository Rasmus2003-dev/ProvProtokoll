import { supabase, isSupabaseConfigured } from './supabase';
import type { ElevRecord } from '../types';

const LOCAL_KEY = 'provprotokoll_elevregister';

function readLocal(): ElevRecord[] {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]');
  } catch {
    return [];
  }
}

function writeLocal(records: ElevRecord[]) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(records));
  } catch (_) {}
}

interface ElevRow {
  id: string;
  created_at: string;
  source: 'trv' | 'trafikskola';
  name: string;
  personal_number: string;
  email: string | null;
  phone: string | null;
  license_type: string;
  transmission: 'Manuell' | 'Automat';
  test_type: string | null;
  booking_time: string | null;
  status: ElevRecord['status'];
  teacher: string | null;
  created_date: string;
}

function rowToRecord(row: ElevRow): ElevRecord {
  return {
    id: row.id,
    source: row.source,
    name: row.name,
    personalNumber: row.personal_number,
    email: row.email || '',
    phone: row.phone || undefined,
    licenseType: row.license_type,
    transmission: row.transmission,
    testType: row.test_type || undefined,
    bookingTime: row.booking_time || undefined,
    status: row.status,
    teacher: row.teacher || undefined,
    createdDate: row.created_date,
  };
}

function recordToRow(record: ElevRecord): ElevRow {
  return {
    id: record.id,
    created_at: new Date().toISOString(),
    source: record.source,
    name: record.name,
    personal_number: record.personalNumber,
    email: record.email || null,
    phone: record.phone || null,
    license_type: record.licenseType,
    transmission: record.transmission,
    test_type: record.testType || null,
    booking_time: record.bookingTime || null,
    status: record.status,
    teacher: record.teacher || null,
    created_date: record.createdDate,
  };
}

/**
 * Hämta hela elevregistret. Försöker Supabase först (delat mellan enheter),
 * faller tillbaka på lokal lagring om molnet inte är konfigurerat eller
 * inte svarar.
 */
export async function fetchElever(): Promise<ElevRecord[]> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('elever')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) {
        const records = (data as ElevRow[]).map(rowToRecord);
        writeLocal(records);
        return records;
      }
    } catch (_) {}
  }
  return readLocal();
}

export async function addElev(record: ElevRecord): Promise<{ success: boolean; error?: string }> {
  // Alltid säkra lokalt direkt, oavsett molnstatus.
  const existing = readLocal();
  writeLocal([record, ...existing]);

  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase.from('elever').insert([recordToRow(record)]);
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Nätverksfel vid molnsynk' };
    }
  }
  return { success: true };
}

export async function deleteElev(id: string): Promise<{ success: boolean; error?: string }> {
  const existing = readLocal();
  writeLocal(existing.filter(e => e.id !== id));

  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase.from('elever').delete().eq('id', id);
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Nätverksfel vid molnsynk' };
    }
  }
  return { success: true };
}

/**
 * Prenumerera på live-ändringar i elevregistret (andra inspektörer som
 * lägger till/tar bort elever). Anropar callback med den fulla, uppdaterade
 * listan varje gång något ändras. Returnerar en unsubscribe-funktion.
 */
export function subscribeToElever(onChange: (records: ElevRecord[]) => void): () => void {
  if (!isSupabaseConfigured()) {
    return () => {};
  }

  const channel = supabase
    .channel('elever-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'elever' }, () => {
      fetchElever().then(onChange);
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
