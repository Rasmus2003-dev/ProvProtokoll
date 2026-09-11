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
    examiner: examinerName || state.properties.examiner || 'Rasmus Lundin',
    full_state: state
  };

  // Always save in local backend store for instant offline persistence
  try {
    const existing = JSON.parse(localStorage.getItem('provprotokoll_saved_db') || '[]');
    existing.unshift(payload);
    localStorage.setItem('provprotokoll_saved_db', JSON.stringify(existing.slice(0, 100)));
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
