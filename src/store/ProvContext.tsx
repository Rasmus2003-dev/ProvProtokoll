import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppState, InspectorProfile } from '../types';
import { saveProtocolToBackend } from '../lib/supabase';
import { readJSON, writeJSON } from '../lib/safeStorage';
import { getLayoutPreference } from '../lib/protocolLayout';

export interface ProvContextType {
  state: AppState;
  updateState: (update: Partial<AppState> | AppState | ((prev: AppState) => AppState)) => void;
  resetCurrentTest: (candidateOverrides?: Partial<AppState['properties']>) => void;
  profile: InspectorProfile;
  updateProfile: (update: Partial<InspectorProfile> | ((prev: InspectorProfile) => InspectorProfile) | ((prev: InspectorProfile) => Partial<InspectorProfile>)) => void;
  syncQueue: AppState[];
  testHistory: AppState[];
  isSyncing: boolean;
  saveTest: () => Promise<{ success: boolean; error?: string }>;
  syncTests: () => Promise<void>;
  addTestToHistory: (test: AppState) => void;
}

const defaultState: AppState = {
  properties: {
    studentName: '',
    personalNumber: '',
    email: '',
    examiner: '',
    testDate: new Date().toLocaleDateString('sv-SE'),
    testType: 'Förstaprov',
    licenseType: 'B',
    transmission: 'Manuell',
    tachograph: 'Med färdskrivare',
  },
  checklist: {
    identityChecked: false,
    studentInformed: false,
    licenseTypeCorrect: false,
    vehicleCorrect: false,
    questionsAnswered: false,
  },
  includedTestItems: [],
  result: {
    drivingResult: null,
    safetyCheckResult: null,
    interventionOccurred: false,
    testAborted: false,
    drivingFailure: {
      primaryCause: { area: '', deficiencies: [] },
      consequences: [],
      situations: [],
      interventionOccurred: false,
      testAborted: false,
    },
    safetyCheckFailure: {
      primaryCause: { area: '', deficiencies: [] },
      consequences: [],
      situations: [],
      interventionOccurred: false,
      testAborted: false,
    },
  },
  testStartTime: null,
  testNotes: '',
};

const defaultProfile: InspectorProfile = {
  // Fylls i från inspektörskontot vid inloggning
  name: "",
  inspectorId: "",
  email: "",
  phone: "",
  depot: "",
  signatureText: "",
  autoSign: true,
  vehicleCategories: ["AM", "A1", "A2", "A", "B", "BE", "C1", "C", "C1E", "CE", "D1", "D", "D1E", "DE", "TAXI"],
};

const ProvContext = createContext<ProvContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(() => {
    const parsed = readJSON<any>('provprotokoll-active-state', null);
    if (parsed && typeof parsed === 'object') {
      try {
        return {
          ...defaultState,
          ...parsed,
          properties: { ...defaultState.properties, ...(parsed.properties || {}) },
          checklist: { ...defaultState.checklist, ...(parsed.checklist || {}) },
          result: {
            ...defaultState.result,
            ...(parsed.result || {}),
            drivingFailure: { ...defaultState.result.drivingFailure, ...(parsed.result?.drivingFailure || {}) },
            safetyCheckFailure: { ...defaultState.result.safetyCheckFailure, ...(parsed.result?.safetyCheckFailure || {}) }
          }
        };
      } catch (e) {
        return defaultState;
      }
    }
    return defaultState;
  });

  const [profile, setProfile] = useState<InspectorProfile>(() => {
    const parsed = readJSON<Partial<InspectorProfile> | null>('provprotokoll-profile', null);
    return parsed && typeof parsed === 'object' ? { ...defaultProfile, ...parsed } : defaultProfile;
  });

  const [syncQueue, setSyncQueue] = useState<AppState[]>(() => {
    const parsed = readJSON<AppState[]>('provprotokoll-sync-queue', []);
    return Array.isArray(parsed) ? parsed : [];
  });

  const [testHistory, setTestHistory] = useState<AppState[]>(() => {
    const parsed = readJSON<AppState[]>('provprotokoll-test-history', []);
    return Array.isArray(parsed) ? parsed : [];
  });

  const [isSyncing, setIsSyncing] = useState(false);

  // Auto-sync state to localStorage whenever it changes
  useEffect(() => {
    writeJSON('provprotokoll-active-state', state);
  }, [state]);

  useEffect(() => {
    writeJSON('provprotokoll-profile', profile);
  }, [profile]);

  const updateState = React.useCallback((update: Partial<AppState> | AppState | ((prev: AppState) => AppState)) => {
    setState((prev) => {
      let resolved: AppState;
      if (typeof update === 'function') {
        resolved = update(prev);
      } else {
        resolved = { ...prev, ...update };
      }
      return resolved;
    });
  }, []);

  const resetCurrentTest = React.useCallback((candidateOverrides?: Partial<AppState['properties']>) => {
    setState({
      properties: {
        studentName: '',
        personalNumber: '',
        email: '',
        examiner: profile?.name || '',
        testDate: new Date().toLocaleDateString('sv-SE'),
        testType: 'Förstaprov',
        licenseType: 'B',
        transmission: 'Manuell',
        ...(candidateOverrides || {})
      },
      checklist: {
        identityChecked: false,
        studentInformed: false,
        licenseTypeCorrect: false,
        vehicleCorrect: false,
        questionsAnswered: false,
      },
      includedTestItems: [],
      result: {
        drivingResult: null,
        safetyCheckResult: null,
        interventionOccurred: false,
        testAborted: false,
        drivingFailure: {
          primaryCause: { area: '', deficiencies: [] },
          consequences: [],
          situations: [],
          interventionOccurred: false,
          testAborted: false,
        },
        safetyCheckFailure: {
          primaryCause: { area: '', deficiencies: [] },
          consequences: [],
          situations: [],
          interventionOccurred: false,
          testAborted: false,
        },
      },
      testStartTime: null,
      testNotes: '',
      protocolLayout: getLayoutPreference(),
    });
  }, [profile?.name]);

  const updateProfile = React.useCallback((update: Partial<InspectorProfile> | ((prev: InspectorProfile) => InspectorProfile) | ((prev: InspectorProfile) => Partial<InspectorProfile>)) => {
    setProfile((prev) => {
      let resolved: InspectorProfile;
      if (typeof update === 'function') {
        const result = update(prev);
        resolved = { ...prev, ...result } as InspectorProfile;
      } else {
        resolved = { ...prev, ...update } as InspectorProfile;
      }
      return resolved;
    });
  }, []);

  // Tar bort ett prov ur kön när det väl ligger i molnet
  const dropFromQueue = (protocolId: string) => {
    setSyncQueue((prev) => {
      const updated = prev.filter(t => t.protocolId !== protocolId);
      writeJSON('provprotokoll-sync-queue', updated);
      return updated;
    });
  };

  const saveTest = async (): Promise<{ success: boolean; error?: string }> => {
    // Provet får ett fast id direkt, så att det aldrig kan sparas två gånger
    const saved: AppState = { ...state, protocolId: state.protocolId || `PROV-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` };

    // Säkra lokalt först: historik + kö (kön töms när molnet tagit emot provet)
    setTestHistory((prev) => {
      const updated = [...prev.filter(t => t.protocolId !== saved.protocolId), saved];
      writeJSON('provprotokoll-test-history', updated);
      return updated;
    });
    setSyncQueue((prev) => {
      const updated = [...prev.filter(t => t.protocolId !== saved.protocolId), saved];
      writeJSON('provprotokoll-sync-queue', updated);
      return updated;
    });

    try {
      const result = await saveProtocolToBackend(saved, profile?.name);
      if (result.error) {
        return { success: false, error: result.error };
      }
      dropFromQueue(saved.protocolId!);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Nätverksfel vid molnsynk' };
    }
  };

  const syncTests = React.useCallback(async () => {
    if (!navigator.onLine) return;
    setIsSyncing(true);

    let remaining: AppState[] = [];
    setSyncQueue((current) => {
      remaining = current;
      return current;
    });

    const stillFailing: AppState[] = [];
    for (const queued of remaining) {
      // Äldre köade prov saknar id – ge dem ett nu, så att ett nytt försök inte dubblerar
      const queuedTest = queued.protocolId ? queued : { ...queued, protocolId: `PROV-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` };
      try {
        const result = await saveProtocolToBackend(queuedTest, profile?.name);
        if (result.error) {
          stillFailing.push(queuedTest);
        }
      } catch (_) {
        stillFailing.push(queuedTest);
      }
    }

    setSyncQueue((current) => {
      // Behåll eventuella prov som lades till i kön under tiden synken pågick
      const newlyAdded = current.filter(item => !remaining.includes(item));
      const nextQueue = [...stillFailing, ...newlyAdded];
      writeJSON('provprotokoll-sync-queue', nextQueue);
      return nextQueue;
    });
    setIsSyncing(false);
  }, [profile?.name]);

  // Automatically flush the sync queue once the connection returns
  useEffect(() => {
    const handleOnline = () => {
      setSyncQueue((current) => {
        if (current.length > 0) {
          syncTests();
        }
        return current;
      });
    };
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [syncTests]);

  const addTestToHistory = (test: AppState) => {
    setTestHistory((prev) => {
      const updated = [...prev, test];
      writeJSON('provprotokoll-test-history', updated);
      return updated;
    });
    setSyncQueue((prev) => {
      const updated = [...prev, test];
      writeJSON('provprotokoll-sync-queue', updated);
      return updated;
    });
  };

  return (
    <ProvContext.Provider
      value={{
        state,
        updateState,
        resetCurrentTest,
        profile,
        updateProfile,
        syncQueue,
        testHistory,
        isSyncing,
        saveTest,
        syncTests,
        addTestToHistory,
      }}
    >
      {children}
    </ProvContext.Provider>
  );
}

export function useAppStore() {
  const context = useContext(ProvContext);
  if (!context) {
    throw new Error('useAppStore must be used within an AppProvider');
  }
  return context;
}
