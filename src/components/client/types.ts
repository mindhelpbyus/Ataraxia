// Comprehensive client registration types and interfaces

export interface PresentingConcernsData {
  mainReason: string;
  primaryConcerns: string[];
  severityLevel: '' | 'mild' | 'moderate' | 'severe' | 'unsure';
  otherConcernDetails?: string;
}

export interface SafetyScreeningData {
  suicidalThoughts: '' | 'no' | 'yes';
  selfHarmThoughts: '' | 'no' | 'yes';
  suicidePlan: '' | 'no' | 'yes';
  accessToMeans: '' | 'no' | 'yes';
  suicideIntent: '' | 'no' | 'yes';
  pastSuicideAttempts: '' | 'no' | 'yes';
  pastSelfHarm: '' | 'no' | 'yes';
  safeAtHome: '' | 'no' | 'yes';
  experiencedAbuse: '' | 'no' | 'yes';
  afraidOfSomeone: '' | 'no' | 'yes';
  psychoticSymptoms: '' | 'no' | 'yes';
  substanceUseControl: '' | 'no' | 'yes';
  hasSocialSupport: '' | 'no' | 'yes';
  copingStrategies: string;
  additionalSafetyConcerns?: string;
  wantsSafetyPlan: boolean;
}

export interface SignatureData {
  type: 'drawn' | 'typed';
  data: string; // Base64 for drawn, text for typed
  timestamp: string;
  fullName: string;
}

export interface ComprehensiveClientData {
  // A. Basic Info
  firstName: string;
  lastName: string;
  middleName?: string;
  gender: string;
  dateOfBirth: Date | null;
  phone: string;
  countryCode: string;
  email: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  timezone?: string;
  languages?: string[];
  emergencyContactName: string;
  emergencyContactRelationship: string;
  emergencyContactPhone: string;
  emergencyContactCountryCode: string;
  preferredLanguage: string[];
  selectedAvatar?: string;
  profileImage?: string;

  // B. Insurance/Benefits
  hasInsurance: boolean;
  insuranceProvider?: string;
  insurancePlan?: string;
  memberID?: string;
  groupNumber?: string;
  insuranceCardFront?: File;
  insuranceCardBack?: File;
  copayAmount?: string;
  deductibleMet?: boolean;

  // C. Intake Forms (Consents)
  consentToTreat: boolean;
  hipaaConsent: boolean;
  financialPolicyConsent: boolean;
  telehealthConsent: boolean;
  releaseOfInformation: boolean;
  safetyPlanAcknowledged?: boolean;
  minorConsentProvided?: boolean;
  dataUsageConsent?: boolean;

  // D. Clinical Intake
  presentingConcerns: string;
  symptoms: string[];
  currentMedications: string;
  pastDiagnoses: string;
  substanceUse: string;
  suicidalIdeation: string;
  selfHarmHistory: string;
  previousTherapyExperience: string;

  // D1. Presenting Concerns (Structured)
  presentingConcernsData: PresentingConcernsData;

  // D2. Safety & Risk Screening
  safetyScreeningData: SafetyScreeningData;

  // E. Matching Preferences
  preferredTherapistGender?: string;
  preferredSpecialty: string[];
  preferredAvailability: string[];
  preferredLanguageTherapy: string;
  preferredModality: string[];

  // F. Payment Setup
  paymentMethod: string;
  cardOnFile?: boolean;
  billingAddress1?: string;
  billingAddress2?: string;
  billingAddressSameAsPrimary?: boolean;
  billingCity?: string;
  billingState?: string;
  billingZipCode?: string;
  slidingScale?: boolean;
  financialAid?: boolean;

  // G. Portal Account
  username: string;
  password: string;
  allowViewNotes: boolean;
  allowViewInvoices: boolean;

  // G1. Digital Signature
  signature: SignatureData | null;

  // H. Documents
  idProof?: File;
  medicalRecords?: File[];
  authorizationForms?: File[];

  // I. Appointment Setup
  preferredFrequency: string;
  preferredTherapist?: string;
  careTeamNotes?: string;

  // J. Organization (if enterprise)
  employerProgramID?: string;
  employeeID?: string;
  preApprovedSessions?: number;
}

export interface ClientRegistrationProps {
  clientEmail: string;
  clientPhone: string;
  clientFirstName: string;
  clientLastName: string;
  registrationToken: string;
  onComplete: (data: ComprehensiveClientData) => void;
  organizationMode?: boolean;
}

export interface StepProps {
  formData: ComprehensiveClientData;
  updateFormData: (field: string, value: any) => void;
  toggleArrayValue: (field: keyof ComprehensiveClientData, value: string) => void;
  clientEmail?: string;
  clientPhone?: string;
}