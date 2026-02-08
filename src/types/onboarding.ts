export type TimeSlot = {
    id: string;
    startTime: string;
    endTime: string;
};

export type WeeklySchedule = {
    monday: TimeSlot[];
    tuesday: TimeSlot[];
    wednesday: TimeSlot[];
    thursday: TimeSlot[];
    friday: TimeSlot[];
    saturday: TimeSlot[];
    sunday: TimeSlot[];
};

export type SessionType = 'video' | 'phone' | 'in-person' | 'messaging';

export const SESSION_DURATIONS = [15, 30, 45, 50, 60, 90];

// Comprehensive language list including major world languages and Indian regional languages
export const LANGUAGES = [
    // Major Indian Languages (Primary Market)
    'Hindi',
    'Bengali',
    'Tamil',
    'Telugu',
    'Marathi',
    'Gujarati',
    'Kannada',
    'Malayalam',
    'Punjabi',
    'Urdu',
    'Odia',
    'Assamese',

    // Major World Languages
    'English',
    'Spanish',
    'French',
    'German',
    'Italian',
    'Portuguese',
    'Russian',
    'Japanese',
    'Korean',
    'Chinese (Mandarin)',
    'Chinese (Cantonese)',
    'Arabic',
    'Dutch',
    'Polish',
    'Turkish',
    'Vietnamese',
    'Thai',
    'Indonesian',
    'Malay',
    'Filipino (Tagalog)',
    'Swedish',
    'Norwegian',
    'Danish',
    'Finnish',
    'Greek',
    'Hebrew',
    'Persian (Farsi)',
    'Ukrainian',
    'Czech',
    'Romanian',
    'Hungarian'
];

export const DEGREES = [
    'PhD',
    'PsyD',
    'MD',
    'LCSW',
    'LMFT',
    'LPC',
    'MA',
    'MS',
    'MEd',
    'Other'
];

export const LICENSE_TYPES = [
    'LCSW',
    'LMFT',
    'LPC',
    'LPCC',
    'Psychologist',
    'Psychiatrist',
    'PMHNP',
    'Other'
];

export const CLINICAL_SPECIALTIES = [
    { value: 'anxiety', label: 'Anxiety' },
    { value: 'depression', label: 'Depression' },
    { value: 'trauma', label: 'Trauma & PTSD' },
    { value: 'relationships', label: 'Relationship Issues' },
    { value: 'addiction', label: 'Addiction & Substance Use' },
    { value: 'eating-disorders', label: 'Eating Disorders' },
    { value: 'grief', label: 'Grief & Loss' },
    { value: 'stress', label: 'Stress Management' },
    { value: 'ocd', label: 'OCD' },
    { value: 'bipolar', label: 'Bipolar Disorder' },
    { value: 'adhd', label: 'ADHD' },
    { value: 'personality-disorders', label: 'Personality Disorders' },
    { value: 'insomnia', label: 'Sleep & Insomnia' },
    { value: 'chronic-pain', label: 'Chronic Pain' },
    { value: 'anger', label: 'Anger Management' }
];

export const LIFE_CONTEXT_SPECIALTIES = [
    { value: 'adolescents', label: 'Adolescents (13-17)' },
    { value: 'adults', label: 'Adults (18-64)' },
    { value: 'seniors', label: 'Seniors (65+)' },
    { value: 'couples', label: 'Couples' },
    { value: 'families', label: 'Families' },
    { value: 'lgbtq', label: 'LGBTQ+' },
    { value: 'veterans', label: 'Veterans' },
    { value: 'parents', label: 'Parents' },
    { value: 'postpartum', label: 'Perinatal / Postpartum' }
];

export const THERAPEUTIC_MODALITIES = [
    { value: 'cbt', label: 'Cognitive Behavioral (CBT)' },
    { value: 'dbt', label: 'Dialectical Behavior (DBT)' },
    { value: 'emdr', label: 'EMDR' },
    { value: 'psychodynamic', label: 'Psychodynamic' },
    { value: 'humanistic', label: 'Humanistic' },
    { value: 'mindfulness', label: 'Mindfulness-Based' },
    { value: 'act', label: 'Acceptance & Commitment (ACT)' },
    { value: 'eft', label: 'Emotionally Focused (EFT)' },
    { value: 'family-systems', label: 'Family Systems' },
    { value: 'somatic', label: 'Somatic' },
    { value: 'play-therapy', label: 'Play Therapy' },
    { value: 'art-therapy', label: 'Art Therapy' }
];

export const PERSONAL_STYLES = [
    { value: 'direct', label: 'Direct & Action-Oriented' },
    { value: 'warm', label: 'Warm & Supportive' },
    { value: 'analytical', label: 'Analytical & Insight-Oriented' },
    { value: 'collaborative', label: 'Collaborative & Coaching' },
    { value: 'listening', label: 'Deep Listening & Reflection' },
    { value: 'structured', label: 'Structured & Goal-Focused' },
    { value: 'holistic', label: 'Holistic & Integrative' }
];

export const INSURANCE_PROVIDERS = [
    'Aetna',
    'Blue Cross Blue Shield',
    'Cigna',
    'UnitedHealthcare',
    'Oxford',
    'Oscar',
    'Humana',
    'Kaiser Permanente',
    'Medicare',
    'Medicaid',
    'TriWest',
    'Magellan'
];

export interface OnboardingData {
    userId?: string;
    email?: string;
    step?: number;

    // Step 2: Verification
    phoneNumber?: string;
    countryCode?: string;
    isPhoneVerified?: boolean;

    // Step 3: Personal Details
    firstName?: string;
    lastName?: string;
    gender?: string;
    dateOfBirth?: string;
    address?: {
        street: string;
        city: string;
        state: string;
        zip: string;
        country: string;
    };
    timezone?: string;
    languages?: string[];

    // Step 4: Credentials
    highestDegree?: string;
    institutionName?: string;
    graduationYear?: string;
    yearsOfExperience?: string;
    clinicalSpecialties?: Record<string, boolean>; // e.g., { anxiety: true }
    lifeContextSpecialties?: Record<string, boolean>;
    modalities?: Record<string, boolean>;
    styles?: Record<string, boolean>;

    // Step 5: License
    licenses?: Array<{
        type: string;
        number: string;
        state: string;
        expiryDate: string;
        documentUrl?: string; // S3 URL
    }>;
    npiNumber?: string;
    deaNumber?: string; // Optional

    // Step 6: Availability (Enhanced)
    availability?: {
        sessionTypes: SessionType[];
        weeklySchedule: WeeklySchedule;
        sessionDurations: number[]; // e.g., [30, 50]
        bufferTime?: number; // Minutes between sessions
        acceptingNewClients: boolean;
    };

    // Step 9: Insurance/Financial
    acceptedInsurances?: string[];
    privatePayRate?: string; // e.g. "$150"
    slidingScale?: boolean;

    // Step 10: Profile
    headshotUrl?: string;
    bio?: string;
    shortBio?: string;
}
