export interface InspectorProfile {
  name: string;
  inspectorId: string;
  email: string;
  phone: string;
  depot: string;
  signatureText: string;
  autoSign: boolean;
  vehicleCategories: string[];
}

export interface Consequence {
  id: string;
  area: string;
  deficiencies: string[];
}

export interface FailureAssessment {
  primaryCause: {
    area: string;
    deficiencies: string[];
  };
  consequences: Consequence[];
  situations: string[];
  interventionOccurred: boolean;
  testAborted: boolean;
}

export interface AppState {
  properties: {
    studentName: string;
    personalNumber: string;
    email: string;
    examiner: string;
    testDate: string;
    testType: string;
    licenseType: string;
    transmission: string;
    tachograph?: 'Med färdskrivare' | 'Utan färdskrivare' | 'Ej tillämpligt' | string;
  };
  checklist: {
    identityChecked: boolean;
    studentInformed: boolean;
    licenseTypeCorrect: boolean;
    vehicleCorrect: boolean;
    questionsAnswered: boolean;
  };
  includedTestItems: string[];
  result: {
    drivingResult: 'Godkänt' | 'Underkänt' | null;
    safetyCheckResult: 'Godkänt' | 'Underkänt' | null;
    interventionOccurred: boolean;
    testAborted: boolean;
    drivingFailure: FailureAssessment;
    safetyCheckFailure: FailureAssessment;
  };
  testStartTime: number | null;
  testNotes: string;
}

export interface ElevRecord {
  id: string;
  source: 'trv' | 'trafikskola';
  name: string;
  personalNumber: string;
  email: string;
  phone?: string;
  licenseType: string;
  transmission: 'Manuell' | 'Automat';
  testType?: string; // e.g. 'Förstaprov', 'Omprov'
  bookingTime?: string;
  status: 'Inbokad' | 'Klar för start' | 'Aktiv elev' | 'Genomförd';
  teacher?: string;
  createdDate: string;
}
