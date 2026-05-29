import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from 'react';
import { AppState, FailureAssessment, InspectorProfile } from '../types';

const APP_VERSION = "provprotokoll-v1";
const DATA_SCHEMA_VERSION = 1;
const STORAGE_KEY = `${APP_VERSION}-data`;
const QUEUE_STORAGE_KEY = `${APP_VERSION}-sync-queue`;
const PROFILE_STORAGE_KEY = `${APP_VERSION}-inspector-profile`;

const defaultProfile: InspectorProfile = {
  name: 'Rasmus Lundin',
  inspectorId: 'INSP-2045',
  email: 'rasmus.lundin@forarprov.se',
  phone: '070-987 65 43',
  depot: 'Göteborg Hisingen',
  signatureText: 'Rasmus Lundin',
  vehicleCategories: ['AM', 'A1', 'A2', 'A', 'B', 'BE', 'C1', 'C', 'C1E', 'CE', 'D1', 'D', 'D1E', 'DE', 'TAXI'],
  autoSign: true
};

const defaultFailure: FailureAssessment = {
  primaryCause: { area: '', deficiencies: [] },
  consequences: [],
  situations: [],
  interventionOccurred: false,
  testAborted: false
};

const getDefaultState = (): AppState => ({
  properties: {
    studentName: '',
    personalNumber: '',
    email: '',
    examiner: '',
    testDate: new Date().toISOString().split('T')[0],
    testType: '',
    licenseType: '',
    transmission: 'Manuell'
  },
  checklist: {
    identityChecked: false,
    studentInformed: false,
    licenseTypeCorrect: false,
    vehicleCorrect: false,
    questionsAnswered: false
  },
  includedTestItems: [],
  result: {
    drivingResult: null,
    safetyCheckResult: null,
    interventionOccurred: false,
    testAborted: false,
    drivingFailure: JSON.parse(JSON.stringify(defaultFailure)),
    safetyCheckFailure: JSON.parse(JSON.stringify(defaultFailure))
  }
});

const defaultState = getDefaultState();

type AppContextType = {
  state: AppState;
  updateState: (updater: (prevState: AppState) => AppState) => void;
  resetState: () => void;
  syncQueue: AppState[];
  saveTest: () => void;
  syncTests: () => Promise<void>;
  isSyncing: boolean;
  profile: InspectorProfile;
  updateProfile: (updater: (prev: InspectorProfile) => InspectorProfile) => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed._schemaVersion !== DATA_SCHEMA_VERSION) {
          console.warn("Schema version mismatch, resetting state");
          return defaultState;
        }
        return {
          ...defaultState,
          ...parsed,
          properties: { ...defaultState.properties, ...(parsed.properties || {}) },
          checklist: { ...defaultState.checklist, ...(parsed.checklist || {}) },
          includedTestItems: parsed.includedTestItems || [],
          result: {
            ...defaultState.result,
            ...(parsed.result || {}),
            drivingFailure: { ...defaultState.result.drivingFailure, ...(parsed.result?.drivingFailure || {}) },
            safetyCheckFailure: { ...defaultState.result.safetyCheckFailure, ...(parsed.result?.safetyCheckFailure || {}) }
          }
        };
      }
    } catch (e) {
      console.error("Failed to load state", e);
    }
    return defaultState;
  });

  const [profile, setProfile] = useState<InspectorProfile>(() => {
    try {
      const stored = localStorage.getItem(PROFILE_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.name === 'Anna Svensson') {
          return defaultProfile;
        }
        return {
          ...defaultProfile,
          ...parsed
        };
      }
    } catch (e) {
      console.error("Failed to load profile", e);
    }
    return defaultProfile;
  });

  const [syncQueue, setSyncQueue] = useState<AppState[]>(() => {
    try {
      const storedQueue = localStorage.getItem(QUEUE_STORAGE_KEY);
      if (storedQueue) {
        return JSON.parse(storedQueue);
      }
    } catch (e) {
      console.error("Failed to load sync queue", e);
    }
    return [];
  });

  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    try {
      const toSave = { ...state, _schemaVersion: DATA_SCHEMA_VERSION };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (e) {
      console.error("Failed to save state", e);
    }
  }, [state]);

  useEffect(() => {
    try {
      localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(syncQueue));
    } catch (e) {
      console.error("Failed to save sync queue", e);
    }
  }, [syncQueue]);

  useEffect(() => {
    try {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
    } catch (e) {
      console.error("Failed to save profile", e);
    }
  }, [profile]);

  const updateState = useCallback((updater: (prevState: AppState) => AppState) => {
    setState(updater);
  }, []);

  const resetState = useCallback(() => {
    setState(getDefaultState());
  }, []);

  const updateProfile = useCallback((updater: (prev: InspectorProfile) => InspectorProfile) => {
    setProfile(updater);
  }, []);

  const saveTest = useCallback(() => {
    setSyncQueue(prev => [...prev, state]);
    resetState();
  }, [state, resetState]);

  const syncTests = useCallback(async () => {
    if (syncQueue.length === 0 || isSyncing || !navigator.onLine) return;
    
    setIsSyncing(true);
    
    // Simulate network delay for sync
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setSyncQueue([]);
    setIsSyncing(false);
  }, [syncQueue, isSyncing]);

  // Handle automatic syncing when coming online
  useEffect(() => {
    const handleOnline = () => {
      if (syncQueue.length > 0) {
        syncTests();
      }
    };
    
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [syncQueue.length, syncTests]);

  return (
    <AppContext.Provider value={{ state, updateState, resetState, syncQueue, saveTest, syncTests, isSyncing, profile, updateProfile }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppStore() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppStore must be used within AppProvider");
  return context;
}
