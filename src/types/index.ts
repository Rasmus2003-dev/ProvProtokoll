export interface InspectorProfile {
  name: string;
  inspectorId: string;
  email: string;
  phone: string;
  depot: string;
  signatureText: string;
  autoSign: boolean;
  vehicleCategories: string[];
  role?: 'admin' | 'inspector';
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
    specialConditions?: string[];
    interpreterPresent?: boolean;
    interpreterLanguage?: string;
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
    interventionSituations?: string[];
    testAborted: boolean;
    drivingFailure: FailureAssessment;
    safetyCheckFailure: FailureAssessment;
  };
  testStartTime: number | null;
  testNotes: string;
  // Senaste steget i provflödet, så att ett avbrutet/kraschat prov kan återupptas
  activeStep?: string | null;
  // Händelser markerade under körningen (brist, ingripande, notering), med position om GPS finns
  events?: DrivingEvent[];
  // Inspelad körväg (Navigator)
  route?: RouteRecording;
  // Slumpade förslag för säkerhetskontroll, lätta fordon (id:n i lightSafetyCheck)
  lightSafetyTasks?: string[];
}

export type DrivingEventKind = 'brist' | 'ingripande' | 'notering';

export interface DrivingEvent {
  id: string;
  t: number; // epoch ms
  kind: DrivingEventKind;
  situation?: string;
  note?: string;
  lat?: number;
  lng?: number;
}

export interface RouteRecording {
  recording: boolean;
  startedAt: number | null;
  stoppedAt?: number | null;
  // Kompakt format för att hålla nere lagringen: [lat, lng, epoch ms]
  points: [number, number, number][];
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

export interface Inspector {
  id: string;
  username: string;
  name: string;
  email: string;
  role: 'admin' | 'inspector';
  depots: string[];
  vehicleCategories: string[];
  mustChangePassword: boolean;
  active: boolean;
}

export type LicenseStatus = 'Giltigt' | 'Indraget' | 'Spärrat' | 'Återkallat tillfälligt' | 'Saknar körkort';

export interface VagtrafikregisterEntry {
  personalNumber: string;
  licenseStatus: LicenseStatus;
  licenseClasses: string[];
  statusReason?: string;
  statusSince?: string;
  remarks: string[];
  previousRevocations: number;
  medicalRestriction?: string;
}
