/**
 * Therapist Onboarding Types - Enterprise/Lyra-Level (132 Fields)
 * Supports AI-driven matching, compliance, and workforce management
 */

// ============================================================================
// SECTION A — IDENTITY & CONTACT (13 fields)
// ============================================================================
export interface IdentityContactData {
  firstName: string;
  lastName: string;
  middleName: string;
  preferredName: string;
  fullName: string; // Kept for backward compatibility
  email: string;
  phoneNumber: string;
  countryCode: string;
  password: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  country: string;
  zipCode: string; // Added for address completion
  timezone: string; // AI Match Required
  languagesSpokenFluently: string[]; // AI Match Required
  canConductSessionsInLanguage: { [language: string]: boolean }; // AI Match Required
  videoCallReadinessTest: boolean;
}

// ============================================================================
// SECTION B — LICENSE & CREDENTIALS (9 fields)
// ============================================================================
export interface LicenseCredentialsData {
  licenseType: string; // LCSW, LMFT, LPC, PsyD, etc.
  licenseNumber: string;
  issuingStates: string[]; // AI Match Required
  additionalPracticeStates: string[]; // AI Match Required
  licenseExpiryDate: string;
  licenseDocument?: File | string;
  malpracticeInsurance: string; // Compliance
  malpracticeInsuranceDocument?: File | string;
  npiNumber: string;
  deaNumber: string; // If prescribing
}

// ============================================================================
// SECTION C — SPECIALIZATIONS (Deep-Level) (40 fields)
// ============================================================================
export interface SpecializationsData {
  // Clinical Specialties (AI Match Required)
  clinicalSpecialties: {
    anxiety: boolean;
    depression: boolean;
    trauma_ptsd: boolean;
    ocd: boolean;
    adhd: boolean;
    bipolar: boolean;
    personalityDisorders: boolean;
    autismSupport: boolean;
    couplesTherapy: boolean;
    familyTherapy: boolean;
    parenting: boolean;
    substanceUse: boolean;
    disorderedEating: boolean;
    chronicIllness: boolean;
    veterans: boolean;
    lgbtqPlus: boolean;
    grief: boolean;
    anger: boolean;
    stressBurnout: boolean;
    workCareerIssues: boolean;
  };

  // Life Context Specialties (AI Match Required)
  lifeContextSpecialties: {
    immigrantPopulations: boolean;
    firstGenerationSupport: boolean;
    veterans: boolean;
    bipocCommunities: boolean;
    highAchievingProfessionals: boolean;
    collegeStudents: boolean;
    children0to6: boolean;
    kids7to12: boolean;
    teens13to17: boolean;
    adults: boolean;
    seniors: boolean;
  };
}

// ============================================================================
// SECTION D — THERAPEUTIC MODALITIES (18 fields) (AI Match Required)
// ============================================================================
export interface TherapeuticModalitiesData {
  cbt: boolean;
  dbt: boolean;
  act: boolean;
  emdr: boolean;
  humanistic: boolean;
  psychodynamic: boolean;
  gottman: boolean;
  eft: boolean; // Emotionally Focused Therapy
  exposureTherapy: boolean;
  somaticTherapies: boolean;
  ifs: boolean; // Internal Family Systems
  mindfulnessBased: boolean;
  motivationalInterviewing: boolean;
  traumaInformedCare: boolean;
  playTherapy: boolean;
  artTherapy: boolean;
  narrativeTherapy: boolean;
  solutionFocused: boolean;
}

// ============================================================================
// SECTION E — THERAPIST PERSONAL STYLE (8 fields) (AI Match Required)
// ============================================================================
export interface PersonalStyleData {
  warmCompassionate: boolean;
  structuredGoalOriented: boolean;
  skillsBased: boolean;
  directHonest: boolean;
  insightOriented: boolean;
  culturallySensitive: boolean;
  faithBased: boolean;
  lgbtqAffirming: boolean;
}

// ============================================================================
// SECTION F — DEMOGRAPHIC PREFERENCES (14 fields) (AI Match Required)
// ============================================================================
export interface DemographicPreferencesData {
  kids: boolean;
  teens: boolean;
  adults: boolean;
  seniors: boolean;
  couples: boolean;
  families: boolean;
  lgbtqPlus: boolean;
  highRiskClients: boolean;
  adhdClients: boolean;
  neurodivergentGroups: boolean;
  courtOrderedClients: boolean;
  bipocCommunities: boolean;
  immigrants: boolean;
  veteransCommunity: boolean;
}

// ============================================================================
// SECTION G — SESSION FORMAT & CAPACITY (9 fields)
// ============================================================================
export interface SessionFormatCapacityData {
  video: boolean; // AI Match Required
  inPerson: boolean; // AI Match Required
  phone: boolean; // AI Match Required
  messaging: boolean; // AI Match Required
  newClientsCapacity: number;
  maxCaseloadCapacity: number;
  clientIntakeSpeed: 'slow' | 'moderate' | 'fast';
  sessionLengthsOffered: number[]; // [30, 45, 60, 90]
  emergencySameDayCapacity: boolean; // AI Match Required
}

// ============================================================================
// SECTION H — AVAILABILITY (Weekly Calendar UI) (6 fields)
// ============================================================================
export interface AvailabilityData {
  weeklySchedule: WeeklySchedule;
  timezone: string;
  hoursPerDay: number;
  daysAvailable: string[];
  emergencySameDayCapacity: boolean; // AI Match Required
  preferredSchedulingDensity: 'spread-out' | 'clustered';
}

// ============================================================================
// SECTION I — INSURANCE & PAYOR SUPPORT (6 fields)
// ============================================================================
export interface InsurancePayorData {
  insurancePanelsAccepted: string[];
  medicaidAcceptance: boolean;
  medicareAcceptance: boolean;
  selfPayAccepted: boolean;
  slidingScale: boolean;
  employerEaps: string[];
}

// ============================================================================
// SECTION J — WORKFLOW & OPERATIONAL DATA (9 fields)
// ============================================================================
export interface WorkflowOperationalData {
  preferredSessionLength: number;
  preferredCommunicationStyle: 'email' | 'phone' | 'sms' | 'app';
  willingToCompleteNotesInPlatform: boolean;
  crisisResponseCapability: boolean;
  telehealthPlatformExperience: string[];
  maximumDailySessions: number;
  breakSchedulePreferences: number; // minutes between sessions
  sessionTypes: SessionType[]; // video, audio, chat
  supportedLanguages: string[];
}

// ============================================================================
// SECTION K — COMPLIANCE (8 fields)
// ============================================================================
export interface ComplianceData {
  backgroundCheckResults: string; // uploaded file or status
  backgroundCheckDocument?: File | string;
  hipaaTrainingCompleted: boolean;
  hipaaTrainingDocument?: File | string;
  ethicsCertification: boolean;
  ethicsCertificationDocument?: File | string;
  signedBaa: boolean;
  w9Document?: File | string;
  // malpracticeInsurance moved to Section B
  // deaLicense moved to Section B
}

// ============================================================================
// SECTION L — THERAPIST PROFILE (Client-facing) (5 fields)
// ============================================================================
export interface TherapistProfileData {
  shortBio: string; // 80 characters
  extendedBio: string; // 500-700 characters
  headshot?: File | string;
  profilePhoto?: File | string; // Kept for backward compatibility
  whatClientsCanExpect: string;
  myApproachToTherapy: string;
}

// ============================================================================
// LEGACY FIELDS (for backward compatibility)
// ============================================================================
export interface LegacyData {
  // Step 2: Verification
  verificationCode: string;
  isVerified: boolean;

  // Step 3: Personal Details (now split into sections)
  gender: string;
  dateOfBirth: string;
  country: string;
  state: string;
  city: string;
  languages: string[];
  termsAccepted: boolean;

  // Step 4: Professional Credentials (now in Section C & D)
  highestDegree: string;
  institutionName: string;
  graduationYear: string;
  yearsOfExperience: number;
  specializations: string[];
  bio: string;

  // Step 5: License & Compliance (now in Section B & K)
  licensingAuthority: string;
  governmentId?: File | string;
  informationAccurate: boolean;

  // Step 6: Availability (now in Section G & H)
  sessionDurations: number[];
  breakTimeBetweenSessions: number;

  // OAuth fields
  firebaseUid?: string;
  authMethod?: 'email' | 'google' | 'apple';
}

// ============================================================================
// COMBINED ONBOARDING DATA (132 fields total)
// ============================================================================
export interface OnboardingData extends
  IdentityContactData,
  LicenseCredentialsData,
  SpecializationsData,
  TherapeuticModalitiesData,
  PersonalStyleData,
  DemographicPreferencesData,
  SessionFormatCapacityData,
  AvailabilityData,
  InsurancePayorData,
  WorkflowOperationalData,
  ComplianceData,
  TherapistProfileData,
  LegacyData { }

// ============================================================================
// SUPPORTING TYPES
// ============================================================================
export interface WeeklySchedule {
  monday: TimeSlot[];
  tuesday: TimeSlot[];
  wednesday: TimeSlot[];
  thursday: TimeSlot[];
  friday: TimeSlot[];
  saturday: TimeSlot[];
  sunday: TimeSlot[];
}

export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
}

export type SessionType = 'video' | 'audio' | 'chat' | 'in-person';

export type OnboardingStep = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

// ============================================================================
// CONSTANTS - SPECIALIZATIONS
// ============================================================================
export const CLINICAL_SPECIALTIES = [
  { value: 'anxiety', label: 'Anxiety' },
  { value: 'depression', label: 'Depression' },
  { value: 'trauma_ptsd', label: 'Trauma & PTSD' },
  { value: 'ocd', label: 'OCD' },
  { value: 'adhd', label: 'ADHD' },
  { value: 'bipolar', label: 'Bipolar' },
  { value: 'personalityDisorders', label: 'Personality Disorders' },
  { value: 'autismSupport', label: 'Autism Support' },
  { value: 'couplesTherapy', label: 'Couples Therapy' },
  { value: 'familyTherapy', label: 'Family Therapy' },
  { value: 'parenting', label: 'Parenting' },
  { value: 'substanceUse', label: 'Substance Use' },
  { value: 'disorderedEating', label: 'Disordered Eating' },
  { value: 'chronicIllness', label: 'Chronic Illness' },
  { value: 'veterans', label: 'Veterans' },
  { value: 'lgbtqPlus', label: 'LGBTQ+' },
  { value: 'grief', label: 'Grief' },
  { value: 'anger', label: 'Anger' },
  { value: 'stressBurnout', label: 'Stress/Burnout' },
  { value: 'workCareerIssues', label: 'Work/Career Issues' }
];

export const LIFE_CONTEXT_SPECIALTIES = [
  { value: 'immigrantPopulations', label: 'Immigrant Populations' },
  { value: 'firstGenerationSupport', label: 'First-Generation Support' },
  { value: 'veterans', label: 'Veterans' },
  { value: 'bipocCommunities', label: 'BIPOC Communities' },
  { value: 'highAchievingProfessionals', label: 'High-Achieving Professionals' },
  { value: 'collegeStudents', label: 'College Students' },
  { value: 'children0to6', label: 'Children (0-6)' },
  { value: 'kids7to12', label: 'Kids (7-12)' },
  { value: 'teens13to17', label: 'Teens (13-17)' },
  { value: 'adults', label: 'Adults' },
  { value: 'seniors', label: 'Seniors' }
];

// ============================================================================
// CONSTANTS - MODALITIES
// ============================================================================
export const THERAPEUTIC_MODALITIES = [
  { value: 'cbt', label: 'CBT (Cognitive Behavioral Therapy)' },
  { value: 'dbt', label: 'DBT (Dialectical Behavior Therapy)' },
  { value: 'act', label: 'ACT (Acceptance and Commitment Therapy)' },
  { value: 'emdr', label: 'EMDR' },
  { value: 'humanistic', label: 'Humanistic' },
  { value: 'psychodynamic', label: 'Psychodynamic' },
  { value: 'gottman', label: 'Gottman' },
  { value: 'eft', label: 'EFT (Emotionally Focused Therapy)' },
  { value: 'exposureTherapy', label: 'Exposure Therapy' },
  { value: 'somaticTherapies', label: 'Somatic Therapies' },
  { value: 'ifs', label: 'IFS (Internal Family Systems)' },
  { value: 'mindfulnessBased', label: 'Mindfulness-Based' },
  { value: 'motivationalInterviewing', label: 'Motivational Interviewing' },
  { value: 'traumaInformedCare', label: 'Trauma-Informed Care' },
  { value: 'playTherapy', label: 'Play Therapy' },
  { value: 'artTherapy', label: 'Art Therapy' },
  { value: 'narrativeTherapy', label: 'Narrative Therapy' },
  { value: 'solutionFocused', label: 'Solution-Focused' }
];

// ============================================================================
// CONSTANTS - PERSONAL STYLE
// ============================================================================
export const PERSONAL_STYLES = [
  { value: 'warmCompassionate', label: 'Warm / Compassionate' },
  { value: 'structuredGoalOriented', label: 'Structured / Goal-Oriented' },
  { value: 'skillsBased', label: 'Skills-Based' },
  { value: 'directHonest', label: 'Direct / Honest' },
  { value: 'insightOriented', label: 'Insight-Oriented' },
  { value: 'culturallySensitive', label: 'Culturally Sensitive' },
  { value: 'faithBased', label: 'Faith-Based' },
  { value: 'lgbtqAffirming', label: 'LGBTQ+ Affirming' }
];

// ============================================================================
// CONSTANTS - LICENSE TYPES
// ============================================================================
export const LICENSE_TYPES = [
  'LCSW (Licensed Clinical Social Worker)',
  'LMFT (Licensed Marriage & Family Therapist)',
  'LPC (Licensed Professional Counselor)',
  'PsyD (Doctor of Psychology)',
  'PhD in Psychology',
  'MD (Psychiatry)',
  'LMHC (Licensed Mental Health Counselor)',
  'LPCC (Licensed Professional Clinical Counselor)',
  'LCPC (Licensed Clinical Professional Counselor)',
  'Other'
];

// ============================================================================
// CONSTANTS - US STATES
// ============================================================================
export const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado',
  'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho',
  'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana',
  'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota',
  'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada',
  'New Hampshire', 'New Jersey', 'New Mexico', 'New York',
  'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon',
  'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington',
  'West Virginia', 'Wisconsin', 'Wyoming'
];

// ============================================================================
// LEGACY CONSTANTS (kept for backward compatibility)
// ============================================================================
export const SPECIALIZATIONS = [
  'Anxiety',
  'Depression',
  'Couples Therapy',
  'Family Therapy',
  'Trauma & PTSD',
  'Grief & Loss',
  'Stress Management',
  'Relationship Issues',
  'Life Transitions',
  'Self-Esteem',
  'Career Counseling',
  'Substance Abuse',
  'Eating Disorders',
  'OCD',
  'Bipolar Disorder',
  'ADHD',
  'Child & Adolescent',
  'LGBTQ+ Issues',
  'Cultural Issues',
  'Chronic Pain'
];

export const LANGUAGES = [
  'English',
  'Spanish',
  'French',
  'German',
  'Italian',
  'Portuguese',
  'Chinese (Mandarin)',
  'Japanese',
  'Korean',
  'Arabic',
  'Hindi',
  'Bengali',
  'Tamil',
  'Telugu',
  'Marathi',
  'Gujarati',
  'Kannada',
  'Malayalam',
  'Punjabi',
  'Urdu'
];

export const DEGREES = [
  'Ph.D. in Psychology',
  'Psy.D.',
  'M.D. (Psychiatry)',
  'Master\'s in Clinical Psychology',
  'Master\'s in Counseling',
  'Master\'s in Social Work (MSW)',
  'Master\'s in Marriage and Family Therapy',
  'Licensed Professional Counselor (LPC)',
  'Licensed Clinical Social Worker (LCSW)',
  'Other'
];

export const COUNTRIES = [
  'United States',
  'Canada',
  'United Kingdom',
  'Australia',
  'India',
  'Germany',
  'France',
  'Spain',
  'Italy',
  'Japan',
  'Other'
];

export const INSURANCE_PROVIDERS = [
  'Aetna',
  'Blue Cross Blue Shield',
  'Cigna',
  'UnitedHealthcare',
  'Humana',
  'Kaiser Permanente',
  'Anthem',
  'Medicare',
  'Medicaid',
  'Tricare',
  'Optum',
  'Lyra Health',
  'Talkspace',
  'BetterHelp',
  'Other'
];

export const SESSION_DURATIONS = [30, 45, 60, 90];
