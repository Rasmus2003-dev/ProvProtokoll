import QRCode from 'qrcode';
import { AppState } from '../types';
import { supabase, isSupabaseConfigured } from './supabase';
import { readJSON, writeJSON } from './safeStorage';

export interface SharedProtocolSummary {
  id: string;
  createdAt: string;
  studentName: string;
  personalNumber: string;
  licenseType: string;
  transmission: string;
  testType: string;
  testDate: string;
  examiner: string;
  drivingResult: 'Godkänt' | 'Underkänt' | '-' | null;
  safetyCheckResult: 'Godkänt' | 'Underkänt' | '-' | null;
  isPassed: boolean;
  includedTestItems: string[];
  drivingFailure?: AppState['result']['drivingFailure'];
  safetyCheckFailure?: AppState['result']['safetyCheckFailure'];
  interventionOccurred: boolean;
  testAborted: boolean;
  notes?: string;
}

/**
 * Komprimerar nödvändig provdata till ett kompakt format för delningslänk
 */
export function extractShareablePayload(state: AppState, examinerName?: string, customId?: string): SharedProtocolSummary {
  const isSafetyRequired = !['B', 'B1', 'AM'].includes(state.properties.licenseType || 'B');
  const drivingPassed = state.result.drivingResult === 'Godkänt';
  const safetyPassed = !isSafetyRequired || state.result.safetyCheckResult === 'Godkänt';
  const isPassed = !state.result.testAborted && drivingPassed && safetyPassed;

  const id = customId || 'PROV-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();

  return {
    id,
    createdAt: new Date().toISOString(),
    studentName: state.properties.studentName || 'Kandidat',
    personalNumber: state.properties.personalNumber || '',
    licenseType: state.properties.licenseType || 'B',
    transmission: state.properties.transmission || 'Manuell',
    testType: state.properties.testType || 'Förstaprov',
    testDate: state.properties.testDate || new Date().toISOString().split('T')[0],
    examiner: examinerName || state.properties.examiner || 'Trafikinspektör',
    drivingResult: state.result.drivingResult,
    safetyCheckResult: state.result.safetyCheckResult,
    isPassed,
    includedTestItems: state.includedTestItems || [],
    drivingFailure: state.result.drivingResult === 'Underkänt' ? state.result.drivingFailure : undefined,
    safetyCheckFailure: state.result.safetyCheckResult === 'Underkänt' ? state.result.safetyCheckFailure : undefined,
    interventionOccurred: Boolean(state.result.interventionOccurred),
    testAborted: Boolean(state.result.testAborted),
    notes: state.testNotes ? state.testNotes.slice(0, 300) : undefined,
  };
}

/**
 * Sparar och skapar en delningsbar unik URL för kandidaten
 */
export async function createCandidateShareLink(state: AppState, examinerName?: string): Promise<{
  url: string;
  id: string;
  qrDataUrl: string;
  summary: SharedProtocolSummary;
}> {
  const summary = extractShareablePayload(state, examinerName);

  // 1. Spara lokalt i listan över delade protokoll
  const existingShares = readJSON<Record<string, SharedProtocolSummary>>('provprotokoll_public_shares', {});
  existingShares[summary.id] = summary;
  writeJSON('provprotokoll_public_shares', existingShares);

  // 2. Om Supabase är konfigurerat, synka dit
  if (isSupabaseConfigured()) {
    try {
      await supabase.from('protocols').upsert([{
        id: summary.id,
        student_name: summary.studentName,
        personal_number: summary.personalNumber,
        license_type: summary.licenseType,
        test_type: summary.testType,
        transmission: summary.transmission,
        driving_result: summary.drivingResult,
        safety_result: summary.safetyCheckResult,
        examiner: summary.examiner,
        full_state: state
      }]);
    } catch (e) {
      console.warn('Could not sync share link to Supabase:', e);
    }
  }

  // 3. Skapa självbärande URL-hash med Base64-payload så länken alltid fungerar,
  // även utan databas eller nätverksuppkoppling!
  const jsonStr = JSON.stringify(summary);
  const base64Data = btoa(encodeURIComponent(jsonStr));

  const origin = window.location.origin;
  const url = `${origin}/p/${summary.id}#d=${base64Data}`;

  // 4. Skapa offline QR-kod (data-URL)
  let qrDataUrl = '';
  try {
    qrDataUrl = await QRCode.toDataURL(url, {
      width: 320,
      margin: 1.5,
      color: {
        dark: '#002F6C',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'M'
    });
  } catch (err) {
    console.error('QR code generation failed:', err);
  }

  return {
    url,
    id: summary.id,
    qrDataUrl,
    summary
  };
}

/**
 * Läser in delat protokoll från hash-parameter eller lokal databas/Supabase
 */
export async function loadSharedProtocol(id?: string, hashParam?: string): Promise<SharedProtocolSummary | null> {
  // 1. Försök avkoda från hash (#d=...)
  if (hashParam) {
    try {
      const match = hashParam.match(/[#&?]d=([^&]+)/);
      if (match && match[1]) {
        const decodedJson = decodeURIComponent(atob(match[1]));
        const parsed = JSON.parse(decodedJson);
        if (parsed && parsed.studentName) {
          return parsed as SharedProtocolSummary;
        }
      }
    } catch (e) {
      console.warn('Failed to parse URL hash payload:', e);
    }
  }

  // 2. Försök från lokalt sparade delningar
  if (id) {
    const existingShares = readJSON<Record<string, SharedProtocolSummary>>('provprotokoll_public_shares', {});
    if (existingShares[id]) {
      return existingShares[id];
    }

    // Kolla i provprotokoll_saved_db
    const savedDb = readJSON<any[]>('provprotokoll_saved_db', []);
    const foundLocal = savedDb.find(item => item.id === id);
    if (foundLocal) {
      return extractShareablePayload(foundLocal.full_state, foundLocal.examiner, foundLocal.id);
    }

    // 3. Försök hämta från Supabase
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('protocols')
          .select('*')
          .eq('id', id)
          .single();

        if (data && !error && data.full_state) {
          return extractShareablePayload(data.full_state, data.examiner, data.id);
        }
      } catch (err) {
        console.warn('Supabase fetch failed for id:', id, err);
      }
    }
  }

  return null;
}
