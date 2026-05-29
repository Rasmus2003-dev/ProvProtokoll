export type FailureAssessment = {
  primaryCause: {
    area: string;
    deficiencies: string[];
  };
  consequences: {
    id: string;
    area: string;
    deficiencies: string[];
  }[];
  situations: string[];
  interventionOccurred: boolean;
  testAborted: boolean;
};

export type ResultDecisionState = {
  drivingResult: "Godkänt" | "Underkänt" | null;
  safetyCheckResult: "Godkänt" | "Underkänt" | "-" | null;
  interventionOccurred: boolean;
  testAborted: boolean;
  drivingFailure: FailureAssessment;
  safetyCheckFailure: FailureAssessment;
};

export type TestProperties = {
  studentName: string;
  personalNumber: string;
  email: string;
  examiner: string;
  testDate: string;
  testType: string;
  licenseType: string;
  transmission?: string;
};

export type ChecklistState = {
  identityChecked: boolean;
  studentInformed: boolean;
  licenseTypeCorrect: boolean;
  vehicleCorrect: boolean;
  questionsAnswered: boolean;
};

export type AppState = {
  properties: TestProperties;
  checklist: ChecklistState;
  includedTestItems: string[];
  result: ResultDecisionState;
};

export type InspectorProfile = {
  name: string;
  inspectorId: string;
  email: string;
  phone: string;
  depot: string;
  signatureText: string;
  vehicleCategories: string[];
  autoSign: boolean;
};

