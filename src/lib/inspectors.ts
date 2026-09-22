import { supabase, isSupabaseConfigured } from './supabase';
import { hashPassword, verifyPassword } from './passwordHash';
import type { Inspector } from '../types';

const LOCAL_KEY = 'provprotokoll_inspectors';

interface InspectorRow {
  id: string;
  username: string;
  name: string;
  email: string | null;
  role: 'admin' | 'inspector';
  depots: string[];
  vehicle_categories: string[];
  password_hash: string;
  password_salt: string;
  must_change_password: boolean;
  active: boolean;
}

function rowToInspector(row: InspectorRow): Inspector {
  return {
    id: row.id,
    username: row.username,
    name: row.name,
    email: row.email || '',
    role: row.role,
    depots: row.depots || [],
    vehicleCategories: row.vehicle_categories || [],
    mustChangePassword: row.must_change_password,
    active: row.active,
  };
}

function readLocal(): InspectorRow[] {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]');
  } catch {
    return [];
  }
}

function writeLocal(rows: InspectorRow[]) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(rows));
  } catch (_) {}
}

const ALL_VEHICLE_CATEGORIES = ['AM', 'A1', 'A2', 'A', 'B', 'BE', 'C1', 'C', 'C1E', 'CE', 'D1', 'D', 'D1E', 'DE', 'TAXI'];

/**
 * Säkerställer att superadmin-kontot (Rasmus) alltid finns, med förordnande
 * för alla behörigheter på alla kontor. Körs vid appstart. Om kontot redan
 * finns rörs det inte (byter t.ex. inte ett redan bytt lösenord).
 */
export async function ensureSuperAdminExists(): Promise<void> {
  const existing = await findInspectorByUsername('rasmus');
  if (existing) return;

  const { hash, salt } = await hashPassword('1234');
  const row: InspectorRow = {
    id: 'insp-rasmus',
    username: 'rasmus',
    name: 'Rasmus Lundin',
    email: 'Rasmus.03@hotmail.se',
    role: 'admin',
    depots: ['Samtliga orter / Hela Sverige'],
    vehicle_categories: ALL_VEHICLE_CATEGORIES,
    password_hash: hash,
    password_salt: salt,
    must_change_password: true,
    active: true,
  };

  await upsertInspectorRow(row);
}

async function upsertInspectorRow(row: InspectorRow): Promise<void> {
  const local = readLocal();
  const idx = local.findIndex((r) => r.id === row.id);
  if (idx >= 0) local[idx] = row;
  else local.push(row);
  writeLocal(local);

  if (isSupabaseConfigured()) {
    try {
      await supabase.from('inspectors').upsert([
        {
          id: row.id,
          username: row.username,
          name: row.name,
          email: row.email,
          role: row.role,
          depots: row.depots,
          vehicle_categories: row.vehicle_categories,
          password_hash: row.password_hash,
          password_salt: row.password_salt,
          must_change_password: row.must_change_password,
          active: row.active,
        },
      ]);
    } catch (_) {}
  }
}

export async function findInspectorByUsername(username: string): Promise<InspectorRow | null> {
  const normalized = username.trim().toLowerCase();

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('inspectors')
        .select('*')
        .eq('username', normalized)
        .maybeSingle();
      if (!error && data) return data as InspectorRow;
    } catch (_) {}
  }

  const local = readLocal();
  return local.find((r) => r.username === normalized) || null;
}

export async function fetchAllInspectors(): Promise<Inspector[]> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.from('inspectors').select('*').order('created_at', { ascending: true });
      if (!error && data) {
        const rows = data as InspectorRow[];
        writeLocal(rows);
        return rows.map(rowToInspector);
      }
    } catch (_) {}
  }
  return readLocal().map(rowToInspector);
}

export interface LoginResult {
  success: boolean;
  inspector?: Inspector;
  mustChangePassword?: boolean;
  error?: string;
}

export async function attemptLogin(username: string, password: string): Promise<LoginResult> {
  const row = await findInspectorByUsername(username);
  if (!row) {
    return { success: false, error: 'Okänt användarnamn eller lösenord.' };
  }
  if (!row.active) {
    return { success: false, error: 'Kontot är inaktiverat. Kontakta din administratör.' };
  }

  const valid = await verifyPassword(password, row.password_hash, row.password_salt);
  if (!valid) {
    return { success: false, error: 'Okänt användarnamn eller lösenord.' };
  }

  return { success: true, inspector: rowToInspector(row), mustChangePassword: row.must_change_password };
}

export async function changePassword(inspectorId: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
  if (newPassword.length < 4) {
    return { success: false, error: 'Det nya lösenordet måste innehålla minst 4 tecken.' };
  }

  const local = readLocal();
  const row = local.find((r) => r.id === inspectorId);
  if (!row) {
    return { success: false, error: 'Kunde inte hitta inspektörskontot.' };
  }

  const { hash, salt } = await hashPassword(newPassword);
  const updated: InspectorRow = { ...row, password_hash: hash, password_salt: salt, must_change_password: false };
  await upsertInspectorRow(updated);
  return { success: true };
}

export interface CreateInspectorInput {
  username: string;
  name: string;
  email: string;
  role: 'admin' | 'inspector';
  depots: string[];
  vehicleCategories: string[];
  temporaryPassword: string;
}

export async function createInspector(input: CreateInspectorInput): Promise<{ success: boolean; error?: string }> {
  const normalized = input.username.trim().toLowerCase();
  const existing = await findInspectorByUsername(normalized);
  if (existing) {
    return { success: false, error: 'Ett konto med det användarnamnet finns redan.' };
  }

  const { hash, salt } = await hashPassword(input.temporaryPassword);
  const row: InspectorRow = {
    id: 'insp-' + Date.now(),
    username: normalized,
    name: input.name.trim(),
    email: input.email.trim() || null,
    role: input.role,
    depots: input.depots,
    vehicle_categories: input.vehicleCategories,
    password_hash: hash,
    password_salt: salt,
    must_change_password: true,
    active: true,
  };

  await upsertInspectorRow(row);
  return { success: true };
}

export async function setInspectorActive(id: string, active: boolean): Promise<void> {
  const local = readLocal();
  const row = local.find((r) => r.id === id);
  if (!row) return;
  await upsertInspectorRow({ ...row, active });
}

export async function deleteInspector(id: string): Promise<void> {
  const local = readLocal().filter((r) => r.id !== id);
  writeLocal(local);

  if (isSupabaseConfigured()) {
    try {
      await supabase.from('inspectors').delete().eq('id', id);
    } catch (_) {}
  }
}
