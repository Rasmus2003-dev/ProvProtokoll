import { supabase, isSupabaseConfigured } from './supabase';
import { hashPassword, verifyPassword } from './passwordHash';
import { MIN_PASSWORD_LENGTH, usernameToEmail } from './authConfig';
import type { Inspector } from '../types';

// Inloggning sker via Supabase Auth: sessionen är en signerad token som
// databasens RLS-policyer kontrollerar. Utan Supabase-konfiguration (lokal
// utveckling/demo) används ett enkelt lokalt läge som INTE är säkert.

interface InspectorRow {
  id: string;
  username: string;
  name: string;
  email: string | null;
  role: 'admin' | 'inspector';
  depots: string[];
  vehicle_categories: string[];
  must_change_password: boolean;
  active: boolean;
  auth_id?: string | null;
  // Endast lokalt läge
  password_hash?: string;
  password_salt?: string;
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

export interface LoginResult {
  success: boolean;
  inspector?: Inspector;
  mustChangePassword?: boolean;
  error?: string;
}

const ALL_VEHICLE_CATEGORIES = ['AM', 'A1', 'A2', 'A', 'B', 'BE', 'C1', 'C', 'C1E', 'CE', 'D1', 'D', 'D1E', 'DE', 'TAXI'];

// ======================================================================
// Supabase-läge
// ======================================================================

async function fetchOwnInspector(authId: string): Promise<InspectorRow | null> {
  const { data, error } = await supabase.from('inspectors').select('*').eq('auth_id', authId).maybeSingle();
  if (error) throw error;
  return (data as InspectorRow) || null;
}

/** Inspektören för den aktuella sessionen, eller null. Kastar vid nätverksfel. */
export async function getSessionInspector(): Promise<Inspector | null> {
  const { data } = await supabase.auth.getSession();
  const user = data.session?.user;
  if (!user) return null;
  const row = await fetchOwnInspector(user.id);
  return row && row.active ? rowToInspector(row) : null;
}

export async function hasSession(): Promise<boolean> {
  const { data } = await supabase.auth.getSession();
  return Boolean(data.session);
}

/** Lägger till inloggningstoken på anrop till våra egna /api-endpoints */
export async function authHeaders(): Promise<Record<string, string>> {
  if (!isSupabaseConfigured()) return {};
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function adminRequest(body: Record<string, unknown>): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch('/api/admin/inspectors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(await authHeaders()) },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { success: false, error: data.error || `Serverfel (${res.status})` };
    return { success: true };
  } catch {
    return { success: false, error: 'Kunde inte nå servern. Kontrollera anslutningen.' };
  }
}

// ======================================================================
// Publika funktioner (väljer läge automatiskt)
// ======================================================================

export async function attemptLogin(username: string, password: string): Promise<LoginResult> {
  if (!isSupabaseConfigured()) return localAttemptLogin(username, password);

  const { data, error } = await supabase.auth.signInWithPassword({ email: usernameToEmail(username), password });
  if (error || !data.user) {
    const offline = !navigator.onLine || /fetch|network/i.test(error?.message || '');
    return { success: false, error: offline ? 'Ingen anslutning – inloggning kräver internet första gången.' : 'Okänt användarnamn eller lösenord.' };
  }

  let row: InspectorRow | null = null;
  try {
    row = await fetchOwnInspector(data.user.id);
  } catch {
    await supabase.auth.signOut();
    return { success: false, error: 'Kunde inte hämta din profil. Försök igen.' };
  }
  if (!row) {
    await supabase.auth.signOut();
    return { success: false, error: `Kontot ${data.user.email || ''} saknar inspektörsprofil. Kontakta en administratör.` };
  }
  if (!row.active) {
    await supabase.auth.signOut();
    return { success: false, error: 'Kontot är inaktiverat. Kontakta din administratör.' };
  }
  return { success: true, inspector: rowToInspector(row), mustChangePassword: row.must_change_password };
}

export async function changePassword(inspectorId: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
  if (newPassword.length < MIN_PASSWORD_LENGTH) {
    return { success: false, error: `Lösenordet måste innehålla minst ${MIN_PASSWORD_LENGTH} tecken.` };
  }
  if (!isSupabaseConfigured()) return localChangePassword(inspectorId, newPassword);

  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) {
    return { success: false, error: /same|different/i.test(error.message) ? 'Välj ett annat lösenord än det tillfälliga.' : 'Kunde inte byta lösenord.' };
  }
  await supabase.rpc('mark_password_changed');
  return { success: true };
}

export async function signOut(): Promise<void> {
  if (isSupabaseConfigured()) await supabase.auth.signOut().catch(() => {});
  localStorage.removeItem('provprotokoll-is-logged-in');
  localStorage.removeItem('provprotokoll-logged-in-inspector-id');
}

export async function fetchAllInspectors(): Promise<Inspector[]> {
  if (!isSupabaseConfigured()) return readLocal().map(rowToInspector);
  const { data, error } = await supabase.from('inspectors').select('*').order('created_at', { ascending: true });
  if (error || !data) return [];
  return (data as InspectorRow[]).map(rowToInspector);
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
  if (!isSupabaseConfigured()) return localCreateInspector(input);
  return adminRequest({ action: 'create', ...input });
}

export async function resetInspectorPassword(id: string, temporaryPassword: string): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    const row = readLocal().find(r => r.id === id);
    if (!row) return { success: false, error: 'Kontot hittades inte.' };
    const { hash, salt } = await hashPassword(temporaryPassword);
    writeLocalRow({ ...row, password_hash: hash, password_salt: salt, must_change_password: true });
    return { success: true };
  }
  return adminRequest({ action: 'reset-password', id, temporaryPassword });
}

export async function setInspectorActive(id: string, active: boolean): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    const row = readLocal().find(r => r.id === id);
    if (row) writeLocalRow({ ...row, active });
    return { success: true };
  }
  const { error } = await supabase.from('inspectors').update({ active }).eq('id', id);
  return error ? { success: false, error: 'Kunde inte ändra kontot.' } : { success: true };
}

export async function deleteInspector(id: string): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    writeLocal(readLocal().filter(r => r.id !== id));
    return { success: true };
  }
  return adminRequest({ action: 'delete', id });
}

/** Skapar demo-admin i lokalt läge. I Supabase-läge skapas första admin via SQL-migreringen. */
export async function ensureSuperAdminExists(): Promise<void> {
  if (isSupabaseConfigured()) return;
  if (readLocal().some(r => r.username === 'rasmus')) return;
  const { hash, salt } = await hashPassword('1234');
  writeLocalRow({
    id: 'insp-rasmus', username: 'rasmus', name: 'Rasmus Lundin', email: 'Rasmus.03@hotmail.se', role: 'admin',
    depots: ['Samtliga orter / Hela Sverige'], vehicle_categories: ALL_VEHICLE_CATEGORIES,
    password_hash: hash, password_salt: salt, must_change_password: true, active: true,
  });
}

// ======================================================================
// Lokalt läge (endast utan Supabase – ej säkert, bara för demo/utveckling)
// ======================================================================

const LOCAL_KEY = 'provprotokoll_inspectors';

function readLocal(): InspectorRow[] {
  try { return JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]'); } catch { return []; }
}
function writeLocal(rows: InspectorRow[]) {
  try { localStorage.setItem(LOCAL_KEY, JSON.stringify(rows)); } catch (_) {}
}
function writeLocalRow(row: InspectorRow) {
  const rows = readLocal();
  const idx = rows.findIndex(r => r.id === row.id);
  if (idx >= 0) rows[idx] = row; else rows.push(row);
  writeLocal(rows);
}

async function localAttemptLogin(username: string, password: string): Promise<LoginResult> {
  const row = readLocal().find(r => r.username === username.trim().toLowerCase());
  if (!row || !row.password_hash || !row.password_salt || !(await verifyPassword(password, row.password_hash, row.password_salt))) {
    return { success: false, error: 'Okänt användarnamn eller lösenord.' };
  }
  if (!row.active) return { success: false, error: 'Kontot är inaktiverat. Kontakta din administratör.' };
  return { success: true, inspector: rowToInspector(row), mustChangePassword: row.must_change_password };
}

async function localChangePassword(inspectorId: string, newPassword: string) {
  const row = readLocal().find(r => r.id === inspectorId);
  if (!row) return { success: false, error: 'Kunde inte hitta inspektörskontot.' };
  const { hash, salt } = await hashPassword(newPassword);
  writeLocalRow({ ...row, password_hash: hash, password_salt: salt, must_change_password: false });
  return { success: true };
}

async function localCreateInspector(input: CreateInspectorInput) {
  const username = input.username.trim().toLowerCase();
  if (readLocal().some(r => r.username === username)) return { success: false, error: 'Ett konto med det användarnamnet finns redan.' };
  const { hash, salt } = await hashPassword(input.temporaryPassword);
  writeLocalRow({
    id: 'insp-' + Date.now(), username, name: input.name.trim(), email: input.email.trim() || null, role: input.role,
    depots: input.depots, vehicle_categories: input.vehicleCategories, password_hash: hash, password_salt: salt,
    must_change_password: true, active: true,
  });
  return { success: true };
}
