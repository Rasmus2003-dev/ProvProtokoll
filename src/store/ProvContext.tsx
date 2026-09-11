import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppState, InspectorProfile } from '../types';
import { saveProtocolToBackend } from '../lib/supabase';

export interface ProvContextType {
  state: AppState;
  updateState: (update: Partial<AppState> | AppState | ((prev: AppState) => AppState)) => void;
  resetCurrentTest: (candidateOverrides?: Partial<AppState['properties']>) => void;
  profile: InspectorProfile;
  updateProfile: (update: Partial<InspectorProfile> | ((prev: InspectorProfile) => InspectorProfile) | ((prev: InspectorProfile) => Partial<InspectorProfile>)) => void;
  syncQueue: AppState[];
  testHistory: AppState[];
  isSyncing: boolean;
  saveTest: () => void;
  syncTests: () => Promise<void>;
  addTestToHistory: (test: AppState) => void;
}

const defaultState: AppState = {
  properties: {
    studentName: 'Simon Svensson',
    personalNumber: '19970613-9876',
    email: 'simon.svensson@exempel.se',
    examiner: 'Rasmus Lundin',
    testDate: '2026-05-19',
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
  name: "Rasmus Lundin",
  inspectorId: "INSP-2045",
  email: "rasmus.lundin@provprotokoll.se",
  phone: "070-123 45 67",
  depot: "Göteborg Hisingen",
  signatureText: "Rasmus Lundin / ProvProtokoll",
  autoSign: true,
  vehicleCategories: ["AM", "A1", "A2", "A", "B", "BE", "C1", "C", "D1", "D", "TAXI"],
};

const ProvContext = createContext<ProvContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('provprotokoll-active-state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
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
    const saved = localStorage.getItem('provprotokoll-profile');
    if (saved) {
      try {
         return { ...defaultProfile, ...JSON.parse(saved) };
      } catch (e) {
         return defaultProfile;
      }
    }
    return defaultProfile;
  });

  const [syncQueue, setSyncQueue] = useState<AppState[]>(() => {
    const saved = localStorage.getItem('provprotokoll-sync-queue');
    return saved ? JSON.parse(saved) : [];
  });

  const [testHistory, setTestHistory] = useState<AppState[]>(() => {
    const saved = localStorage.getItem('provprotokoll-test-history');
    return saved ? JSON.parse(saved) : [];
  });

  const [isSyncing, setIsSyncing] = useState(false);

  // Auto-sync state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('provprotokoll-active-state', JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    localStorage.setItem('provprotokoll-profile', JSON.stringify(profile));
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
        testDate: new Date().toISOString().split('T')[0],
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

  const saveTest = () => {
    // Add current active test state to queue and history
    setTestHistory((prev) => {
      const updated = [...prev, state];
      localStorage.setItem('provprotokoll-test-history', JSON.stringify(updated));
      return updated;
    });
    setSyncQueue((prev) => {
      const updated = [...prev, state];
      localStorage.setItem('provprotokoll-sync-queue', JSON.stringify(updated));
      return updated;
    });

    // Save directly to Supabase & backend database
    saveProtocolToBackend(state, profile?.name).catch(console.warn);
  };

  const syncTests = React.useCallback(async () => {
    if (!navigator.onLine) return;
    setIsSyncing(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setSyncQueue([]);
    localStorage.setItem('provprotokoll-sync-queue', JSON.stringify([]));
    setIsSyncing(false);
  }, []);

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
      localStorage.setItem('provprotokoll-test-history', JSON.stringify(updated));
      return updated;
    });
    setSyncQueue((prev) => {
      const updated = [...prev, test];
      localStorage.setItem('provprotokoll-sync-queue', JSON.stringify(updated));
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
