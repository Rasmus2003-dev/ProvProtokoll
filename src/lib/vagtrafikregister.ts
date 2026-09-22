import { supabase, isSupabaseConfigured } from './supabase';
import type { VagtrafikregisterEntry } from '../types';

const LOCAL_KEY = 'provprotokoll_vagtrafikregister';

interface VtrRow {
  personal_number: string;
  license_status: VagtrafikregisterEntry['licenseStatus'];
  license_classes: string[];
  status_reason: string | null;
  status_since: string | null;
  remarks: string[];
  previous_revocations: number;
  medical_restriction: string | null;
}

function rowToEntry(row: VtrRow): VagtrafikregisterEntry {
  return {
    personalNumber: row.personal_number,
    licenseStatus: row.license_status,
    licenseClasses: row.license_classes || [],
    statusReason: row.status_reason || undefined,
    statusSince: row.status_since || undefined,
    remarks: row.remarks || [],
    previousRevocations: row.previous_revocations || 0,
    medicalRestriction: row.medical_restriction || undefined,
  };
}

function entryToRow(entry: VagtrafikregisterEntry): VtrRow {
  return {
    personal_number: entry.personalNumber,
    license_status: entry.licenseStatus,
    license_classes: entry.licenseClasses,
    status_reason: entry.statusReason || null,
    status_since: entry.statusSince || null,
    remarks: entry.remarks,
    previous_revocations: entry.previousRevocations,
    medical_restriction: entry.medicalRestriction || null,
  };
}

function readLocal(): Record<string, VtrRow> {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || '{}');
  } catch {
    return {};
  }
}

function writeLocal(map: Record<string, VtrRow>) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(map));
  } catch (_) {}
}

/**
 * Hämtar fiktiv "vägtrafikregister"-data för ett personnummer. Detta är
 * TESTDATA - inte en riktig koppling till Transportstyrelsens vägtrafikregister.
 * Returnerar null om ingen post finns (behandlas som "Giltigt körkort, inga
 * anmärkningar" i UI:t).
 */
export async function fetchVtrEntry(personalNumber: string): Promise<VagtrafikregisterEntry | null> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('vagtrafikregister')
        .select('*')
        .eq('personal_number', personalNumber)
        .maybeSingle();
      if (!error && data) return rowToEntry(data as VtrRow);
      if (!error && !data) return null;
    } catch (_) {}
  }

  const local = readLocal();
  const row = local[personalNumber];
  return row ? rowToEntry(row) : null;
}

export async function fetchAllVtrEntries(): Promise<VagtrafikregisterEntry[]> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.from('vagtrafikregister').select('*');
      if (!error && data) {
        const rows = data as VtrRow[];
        const map: Record<string, VtrRow> = {};
        rows.forEach((r) => { map[r.personal_number] = r; });
        writeLocal(map);
        return rows.map(rowToEntry);
      }
    } catch (_) {}
  }
  return Object.values(readLocal()).map(rowToEntry);
}

export async function upsertVtrEntry(entry: VagtrafikregisterEntry): Promise<void> {
  const local = readLocal();
  local[entry.personalNumber] = entryToRow(entry);
  writeLocal(local);

  if (isSupabaseConfigured()) {
    try {
      await supabase.from('vagtrafikregister').upsert([entryToRow(entry)]);
    } catch (_) {}
  }
}
