// Comprehensive field definitions for therapist registration
// Used for AI matching, compliance, and workforce management

export const LICENSE_TYPES = [
  'LCSW - Licensed Clinical Social Worker',
  'LMFT - Licensed Marriage and Family Therapist',
  'LPC - Licensed Professional Counselor',
  'LPCC - Licensed Professional Clinical Counselor',
  'PsyD - Doctor of Psychology',
  'PhD - Doctor of Philosophy (Psychology)',
  'MD - Medical Doctor (Psychiatrist)',
  'DO - Doctor of Osteopathic Medicine (Psychiatrist)',
  'LMHC - Licensed Mental Health Counselor',
  'LCPC - Licensed Clinical Professional Counselor',
  'LCSW-C - Licensed Certified Social Worker-Clinical',
  'LCP - Licensed Clinical Psychologist',
  'Other'
];

export const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC'
];

// C. Clinical Specialties (AI Match Required)
export const CLINICAL_SPECIALTIES = [
  { id: 'anxiety', label: 'Anxiety', icon: '😰' },
  { id: 'depression', label: 'Depression', icon: '😔' },
  { id: 'trauma', label: 'Trauma/PTSD', icon: '🛡️' },
  { id: 'ocd', label: 'OCD', icon: '🔄' },
  { id: 'adhd', label: 'ADHD', icon: '⚡' },
  { id: 'bipolar', label: 'Bipolar Disorder', icon: '🎭' },
  { id: 'personality', label: 'Personality Disorders', icon: '👤' },
  { id: 'autism', label: 'Autism Support', icon: '🧩' },
  { id: 'couples', label: 'Couples Therapy', icon: '💑' },
  { id: 'family', label: 'Family Therapy', icon: '👨‍👩‍👧‍👦' },
  { id: 'parenting', label: 'Parenting', icon: '👶' },
  { id: 'substance', label: 'Substance Use', icon: '🚭' },
  { id: 'eating', label: 'Disordered Eating', icon: '🍽️' },
  { id: 'chronic_illness', label: 'Chronic Illness', icon: '🏥' },
  { id: 'veterans', label: 'Veterans', icon: '🎖️' },
  { id: 'lgbtq', label: 'LGBTQ+', icon: '🏳️‍🌈' },
  { id: 'grief', label: 'Grief & Loss', icon: '🕊️' },
  { id: 'anger', label: 'Anger Management', icon: '😤' },
  { id: 'stress', label: 'Stress/Burnout', icon: '😓' },
  { id: 'work', label: 'Work/Career Issues', icon: '💼' }
];

// Life Context Specialties (AI Match Required)
export const LIFE_CONTEXT_SPECIALTIES = [
  { id: 'immigrant', label: 'Immigrant Populations', icon: '🌍' },
  { id: 'first_gen', label: 'First-Generation Support', icon: '🎓' },
  { id: 'veterans_context', label: 'Veterans', icon: '🎖️' },
  { id: 'bipoc', label: 'BIPOC Communities', icon: '✊' },
  { id: 'high_achievers', label: 'High-Achieving Professionals', icon: '🎯' },
  { id: 'college', label: 'College Students', icon: '📚' },
  { id: 'children_0_6', label: 'Children (0-6)', icon: '👶' },
  { id: 'kids_7_12', label: 'Kids (7-12)', icon: '🧒' },
  { id: 'teens_13_17', label: 'Teens (13-17)', icon: '👦' },
  { id: 'adults', label: 'Adults', icon: '👨' },
  { id: 'seniors', label: 'Seniors (65+)', icon: '👴' }
];

// D. Therapeutic Modalities (AI Match Required)
export const THERAPEUTIC_MODALITIES = [
  { id: 'cbt', label: 'CBT (Cognitive Behavioral Therapy)', icon: '🧠' },
  { id: 'dbt', label: 'DBT (Dialectical Behavior Therapy)', icon: '⚖️' },
  { id: 'act', label: 'ACT (Acceptance & Commitment Therapy)', icon: '🎯' },
  { id: 'emdr', label: 'EMDR (Eye Movement Desensitization)', icon: '👁️' },
  { id: 'humanistic', label: 'Humanistic Therapy', icon: '🌟' },
  { id: 'psychodynamic', label: 'Psychodynamic Therapy', icon: '💭' },
  { id: 'gottman', label: 'Gottman Method (Couples)', icon: '💑' },
  { id: 'eft', label: 'EFT (Emotionally Focused Therapy)', icon: '❤️' },
  { id: 'exposure', label: 'Exposure Therapy', icon: '🚪' },
  { id: 'somatic', label: 'Somatic Therapies', icon: '🧘' },
  { id: 'ifs', label: 'IFS (Internal Family Systems)', icon: '👨‍👩‍👧‍👦' },
  { id: 'mindfulness', label: 'Mindfulness-Based', icon: '🧘‍♀️' },
  { id: 'motivational', label: 'Motivational Interviewing', icon: '💬' },
  { id: 'trauma_informed', label: 'Trauma-Informed Care', icon: '🛡️' },
  { id: 'play_therapy', label: 'Play Therapy', icon: '🎨' },
  { id: 'art_therapy', label: 'Art Therapy', icon: '🎨' },
  { id: 'narrative', label: 'Narrative Therapy', icon: '📖' },
  { id: 'solution_focused', label: 'Solution-Focused', icon: '✅' }
];

// E. Personal Style (AI Match Required)
export const PERSONAL_STYLES = [
  { id: 'warm', label: 'Warm / Compassionate', icon: '🤗' },
  { id: 'structured', label: 'Structured / Goal-Oriented', icon: '📋' },
  { id: 'skills_based', label: 'Skills-Based', icon: '🛠️' },
  { id: 'direct', label: 'Direct / Honest', icon: '💬' },
  { id: 'insight', label: 'Insight-Oriented', icon: '💡' },
  { id: 'culturally_sensitive', label: 'Culturally Sensitive', icon: '🌍' },
  { id: 'faith_based', label: 'Faith-Based', icon: '🙏' },
  { id: 'lgbtq_affirming', label: 'LGBTQ+ Affirming', icon: '🏳️‍🌈' }
];

// F. Demographic Preferences (AI Match Required)
export const DEMOGRAPHIC_PREFERENCES = [
  { id: 'kids', label: 'Kids (0-12)', icon: '👶' },
  { id: 'teens', label: 'Teens (13-17)', icon: '👦' },
  { id: 'adults', label: 'Adults (18-64)', icon: '👨' },
  { id: 'seniors', label: 'Seniors (65+)', icon: '👴' },
  { id: 'couples', label: 'Couples', icon: '💑' },
  { id: 'families', label: 'Families', icon: '👨‍👩‍👧‍👦' },
  { id: 'lgbtq', label: 'LGBTQ+ Individuals', icon: '🏳️‍🌈' },
  { id: 'high_risk', label: 'High-Risk Clients', icon: '⚠️' },
  { id: 'adhd_clients', label: 'ADHD Clients', icon: '⚡' },
  { id: 'neurodivergent', label: 'Neurodivergent Individuals', icon: '🧩' },
  { id: 'court_ordered', label: 'Court-Ordered Clients', icon: '⚖️' },
  { id: 'bipoc', label: 'BIPOC Communities', icon: '✊' },
  { id: 'immigrants', label: 'Immigrants', icon: '🌍' },
  { id: 'veterans', label: 'Veterans', icon: '🎖️' }
];

// G. Session Formats
export const SESSION_FORMATS = [
  { id: 'video', label: 'Video (Telehealth)', icon: '📹' },
  { id: 'in_person', label: 'In-Person', icon: '🏢' },
  { id: 'phone', label: 'Phone', icon: '📞' },
  { id: 'messaging', label: 'Secure Messaging', icon: '💬' }
];

export const SESSION_LENGTHS = [
  { id: 30, label: '30 minutes' },
  { id: 45, label: '45 minutes' },
  { id: 60, label: '60 minutes' },
  { id: 90, label: '90 minutes' },
  { id: 120, label: '120 minutes (couples/family)' }
];

// I. Insurance Panels
export const INSURANCE_PANELS = [
  'Aetna',
  'Anthem',
  'Blue Cross Blue Shield',
  'Cigna',
  'UnitedHealthcare',
  'Humana',
  'Kaiser Permanente',
  'Optum',
  'Tricare',
  'Medicare',
  'Medicaid',
  'Multiplan',
  'ComPsych',
  'Lyra Health',
  'Spring Health',
  'Modern Health',
  'Talkspace',
  'BetterHelp',
  'Ginger',
  'Other'
];

// J. Telehealth Platforms
export const TELEHEALTH_PLATFORMS = [
  'Zoom for Healthcare',
  'Doxy.me',
  'SimplePractice',
  'TherapyNotes',
  'VSee',
  'Google Meet',
  'Microsoft Teams',
  'Jitsi',
  'Other'
];

// Days of week
export const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

// Time slots
export const TIME_SLOTS = [
  '12:00 AM', '12:30 AM', '1:00 AM', '1:30 AM', '2:00 AM', '2:30 AM',
  '3:00 AM', '3:30 AM', '4:00 AM', '4:30 AM', '5:00 AM', '5:30 AM',
  '6:00 AM', '6:30 AM', '7:00 AM', '7:30 AM', '8:00 AM', '8:30 AM',
  '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
  '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM',
  '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM',
  '9:00 PM', '9:30 PM', '10:00 PM', '10:30 PM', '11:00 PM', '11:30 PM'
];
