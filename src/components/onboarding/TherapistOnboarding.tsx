import React, { useState, useEffect } from 'react';
import { OnboardingData, OnboardingStep } from '../../types/onboarding';
import { OnboardingProgress } from './OnboardingProgress';
import { OnboardingStep1Signup } from './OnboardingStep1Signup';
import { OnboardingStep2Verification } from './OnboardingStep2Verification';
import { OnboardingStep3PersonalDetails } from './OnboardingStep3PersonalDetails';
import { OnboardingStep4CredentialsEnhanced } from './OnboardingStep4CredentialsEnhanced';
import { OnboardingStep5LicenseEnhanced } from './OnboardingStep5LicenseEnhanced';
import { OnboardingStep6AvailabilityEnhanced } from './OnboardingStep6AvailabilityEnhanced';
import { OnboardingStep7Review } from './OnboardingStep7Review';
import { OnboardingStep8Demographics } from './OnboardingStep8Demographics';
import { OnboardingStep9Insurance } from './OnboardingStep9Insurance';
import { OnboardingStep10Profile } from './OnboardingStep10Profile';
import { Button } from '../ui/button';
import { CheckCircle2 } from 'lucide-react';
import { logger } from '../../services/secureLogger';
import { verificationService } from '../../api/services/verification';
import { authService, signOut } from '../../services/authService';
import { isAuthenticated } from '../../api/client'; // Direct check for tokens
import { post } from '../../api/client';


const TOTAL_STEPS = 10;

const initialOnboardingData: OnboardingData = {
  // SECTION A — IDENTITY & CONTACT
  firstName: '',
  lastName: '',
  middleName: '',
  preferredName: '',
  fullName: '', // Added
  email: '',
  phoneNumber: '',
  countryCode: '+91', // Default to India (primary market)
  password: '',
  address1: '',
  address2: '',
  city: '',
  state: '',
  country: 'IN', // Changed to India as primary market
  zipCode: '',
  timezone: 'Asia/Kolkata', // Default to India timezone
  languagesSpokenFluently: [],
  canConductSessionsInLanguage: {},
  videoCallReadinessTest: false,

  // SECTION B — LICENSE & CREDENTIALS
  licenseType: '',
  licenseNumber: '',
  issuingStates: [],
  additionalPracticeStates: [],
  licenseExpiryDate: '',
  licenseDocument: '',
  malpracticeInsurance: '',
  malpracticeInsuranceDocument: '',
  npiNumber: '',
  deaNumber: '',

  // SECTION C — SPECIALIZATIONS
  clinicalSpecialties: {
    anxiety: false,
    depression: false,
    trauma_ptsd: false,
    ocd: false,
    adhd: false,
    bipolar: false,
    personalityDisorders: false,
    autismSupport: false,
    couplesTherapy: false,
    familyTherapy: false,
    parenting: false,
    substanceUse: false,
    disorderedEating: false,
    chronicIllness: false,
    veterans: false,
    lgbtqPlus: false,
    grief: false,
    anger: false,
    stressBurnout: false,
    workCareerIssues: false,
  },
  lifeContextSpecialties: {
    immigrantPopulations: false,
    firstGenerationSupport: false,
    veterans: false,
    bipocCommunities: false,
    highAchievingProfessionals: false,
    collegeStudents: false,
    children0to6: false,
    kids7to12: false,
    teens13to17: false,
    adults: false,
    seniors: false,
  },

  // SECTION D — THERAPEUTIC MODALITIES
  cbt: false,
  dbt: false,
  act: false,
  emdr: false,
  humanistic: false,
  psychodynamic: false,
  gottman: false,
  eft: false,
  exposureTherapy: false,
  somaticTherapies: false,
  ifs: false,
  mindfulnessBased: false,
  motivationalInterviewing: false,
  traumaInformedCare: false,
  playTherapy: false,
  artTherapy: false,
  narrativeTherapy: false,
  solutionFocused: false,

  // SECTION E — PERSONAL STYLE
  warmCompassionate: false,
  structuredGoalOriented: false,
  skillsBased: false,
  directHonest: false,
  insightOriented: false,
  culturallySensitive: false,
  faithBased: false,
  lgbtqAffirming: false,

  // SECTION F — DEMOGRAPHIC PREFERENCES
  kids: false,
  teens: false,
  adults: false,
  seniors: false,
  couples: false,
  families: false,
  lgbtqPlus: false,
  highRiskClients: false,
  adhdClients: false,
  neurodivergentGroups: false,
  courtOrderedClients: false,
  bipocCommunities: false,
  immigrants: false,
  veteransCommunity: false,

  // SECTION G — SESSION FORMAT & CAPACITY
  video: false,
  inPerson: false,
  phone: false,
  messaging: false,
  newClientsCapacity: 0,
  maxCaseloadCapacity: 0,
  clientIntakeSpeed: 'moderate',
  sessionLengthsOffered: [],
  emergencySameDayCapacity: false,

  // SECTION H — AVAILABILITY
  weeklySchedule: {
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
    sunday: [],
  },
  hoursPerDay: 0,
  daysAvailable: [],
  preferredSchedulingDensity: 'spread-out',

  // SECTION I — INSURANCE & PAYOR
  insurancePanelsAccepted: [],
  medicaidAcceptance: false,
  medicareAcceptance: false,
  selfPayAccepted: false,
  slidingScale: false,
  employerEaps: [],

  // SECTION J — WORKFLOW & OPERATIONAL
  preferredSessionLength: 60,
  preferredCommunicationStyle: 'email',
  willingToCompleteNotesInPlatform: false,
  crisisResponseCapability: false,
  telehealthPlatformExperience: [],
  maximumDailySessions: 0,
  breakSchedulePreferences: 10,
  sessionTypes: [],
  supportedLanguages: [],

  // SECTION K — COMPLIANCE
  backgroundCheckResults: 'pending',
  backgroundCheckDocument: '',
  hipaaTrainingCompleted: false,
  hipaaTrainingDocument: '',
  ethicsCertification: false,
  ethicsCertificationDocument: '',
  signedBaa: false,
  w9Document: '',

  // SECTION L — THERAPIST PROFILE
  shortBio: '',
  extendedBio: '',
  headshot: '',
  profilePhoto: '',
  whatClientsCanExpect: '',
  myApproachToTherapy: '',

  // LEGACY FIELDS
  verificationCode: '',
  isVerified: false,
  gender: '',
  dateOfBirth: '',

  languages: [],
  termsAccepted: false,
  highestDegree: '',
  institutionName: '',
  graduationYear: '',
  yearsOfExperience: 0,
  specializations: [],
  bio: '',
  licensingAuthority: '',
  governmentId: '',
  informationAccurate: false,
  sessionDurations: [],
  breakTimeBetweenSessions: 10,
};

interface TherapistOnboardingProps {
  onComplete?: () => void;
  onExit?: () => void;
}

export function TherapistOnboarding({ onComplete, onExit }: TherapistOnboardingProps = {}) {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(1);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>(initialOnboardingData);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resumeStep, setResumeStep] = useState<OnboardingStep | null>(null);
  const [showResumePrompt, setShowResumePrompt] = useState(false); // Restored
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [idleTimer, setIdleTimer] = useState<NodeJS.Timeout | null>(null);
  const [authenticatedUser, setAuthenticatedUser] = useState<any>(null);

  // Helper for synchronous checks
  const getCurrentUserSync = () => {
    const email = localStorage.getItem('userEmail');
    if (email) return { email };
    return null;
  };

  useEffect(() => {
    const fetchUser = async () => {
      if (isAuthenticated()) {
        const user = await authService.getCurrentUser();
        if (user) setAuthenticatedUser(user);
      }
    };
    fetchUser();
  }, [currentStep]);

  // Load from localStorage on mount (for persistence) - only if it's the same session
  useEffect(() => {
    // Set URL for onboarding to maintain state on refresh
    if (window.location.pathname !== '/register-therapist' && window.location.pathname !== '/register') {
      window.history.pushState({}, '', '/register-therapist');
    }

    const savedData = localStorage.getItem('therapistOnboardingData');
    const savedStep = localStorage.getItem('therapistOnboardingStep');
    const savedSessionId = localStorage.getItem('therapistOnboardingSessionId');
    const savedEmail = localStorage.getItem('therapistOnboardingEmail');

    // Only load saved data if:
    // 1. There is saved data
    // 2. The session ID matches (same browser session)
    // 3. We're not at step 1 (to allow fresh starts)
    if (savedData && savedStep && savedSessionId) {
      try {
        const parsedData = JSON.parse(savedData);
        const parsedStep = parseInt(savedStep) as OnboardingStep;

        // Load the saved data
        setOnboardingData(parsedData);

        if (parsedStep > 1) {
          setResumeStep(parsedStep);
          setShowResumePrompt(true);
        } else {
          setCurrentStep(parsedStep);
        }

        logger.info('✅ Restored onboarding progress:', { step: parsedStep, email: savedEmail });
      } catch (error) {
        logger.error('Error loading saved onboarding data:', error);
        // Clear corrupted data
        clearLocalStorage();
      }
    } else {
      // Fresh start or check server for existing progress
      const hydrateFromServer = async () => {
        // Only check server if we don't have local data
        if (getCurrentUserSync()) {
          try {
            // For now, skip server hydration since we're migrating to new auth system
            // TODO: Implement server-side onboarding progress retrieval
            logger.info('Skipping server hydration during auth migration');
          } catch (error) {
            logger.error('Error hydrating from server', error);
          }
        }
      };

      // Attempt hydration (setTimeout to allow auth to settle if coming from redirect, 
      // though typically auth state requires a listener. For now we check immediate state 
      // or assume parent handled auth wait)
      hydrateFromServer();

      clearLocalStorage();
    }

    // Setup idle timeout monitoring
    setupIdleTimeout();

    // Setup periodic token refresh (every 10 minutes as backup)
    const refreshInterval = setInterval(async () => {
      const sessionId = localStorage.getItem('onboardingSessionId');
      const token = localStorage.getItem('authToken');

      if (sessionId && token && currentStep > 1) {
        try {
          logger.info('🔄 Periodic token refresh...');
          await handleStepTransition(currentStep, currentStep); // Refresh current step
        } catch (error) {
          logger.warn('Periodic token refresh failed:', error);
        }
      }
    }, 10 * 60 * 1000); // Every 10 minutes

    // Cleanup on unmount
    return () => {
      if (idleTimer) {
        clearTimeout(idleTimer);
      }
      clearInterval(refreshInterval);
    };
  }, []);

  // NEW: Setup idle timeout monitoring (30 minutes)
  const setupIdleTimeout = () => {
    const IDLE_TIMEOUT = 30 * 60 * 1000; // 30 minutes

    const resetIdleTimer = () => {
      setLastActivity(Date.now());

      if (idleTimer) {
        clearTimeout(idleTimer);
      }

      const timer = setTimeout(() => {
        // Auto-logout after 30 minutes of inactivity
        logger.warn('Session expired due to inactivity');
        alert('Your session has expired due to inactivity. Please log in again to continue.');

        // Clear tokens and redirect to login
        localStorage.removeItem('authToken');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('onboardingSessionId');

        // Preserve onboarding data for resume
        // Don't clear therapistOnboardingData, therapistOnboardingStep, etc.

        window.location.href = '/';
      }, IDLE_TIMEOUT);

      setIdleTimer(timer);
    };

    // Track user activity
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

    const handleActivity = () => {
      resetIdleTimer();
    };

    // Add event listeners
    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Initial timer setup
    resetIdleTimer();

    // Cleanup function
    return () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
      if (idleTimer) {
        clearTimeout(idleTimer);
      }
    };
  };

  // Save to localStorage whenever data or step changes
  useEffect(() => {
    // Only save if we have some data (not initial empty state)
    if (onboardingData.email || onboardingData.firstName || onboardingData.lastName || currentStep > 1) {
      // Create a serializable copy of the data
      const serializableData = { ...onboardingData };

      // Convert File objects to metadata for localStorage
      if (onboardingData.licenseDocument instanceof File) {
        serializableData.licenseDocument = onboardingData.licenseDocument.name;
      }
      if (onboardingData.governmentId instanceof File) {
        serializableData.governmentId = onboardingData.governmentId.name;
      }
      if (onboardingData.profilePhoto instanceof File) {
        serializableData.profilePhoto = onboardingData.profilePhoto.name;
      }

      localStorage.setItem('therapistOnboardingData', JSON.stringify(serializableData));
      localStorage.setItem('therapistOnboardingStep', currentStep.toString());
      localStorage.setItem('therapistOnboardingSessionId', sessionId);
      localStorage.setItem('therapistOnboardingEmail', onboardingData.email || '');
    }
  }, [onboardingData, currentStep, sessionId]);

  const clearLocalStorage = () => {
    localStorage.removeItem('therapistOnboardingData');
    localStorage.removeItem('therapistOnboardingStep');
    localStorage.removeItem('therapistOnboardingSessionId');
    localStorage.removeItem('therapistOnboardingEmail');
  };

  const updateData = (newData: Partial<OnboardingData>) => {
    console.log('🔍 DEBUG: updateData called with:', newData);
    setOnboardingData((prev) => {
      const updated = { ...prev, ...newData };
      console.log('🔍 DEBUG: Updated onboarding data countryCode:', updated.countryCode);
      return updated;
    });
  };

  const goToNextStep = async () => {
    // NEW: After Step 1 (Registration), immediately exit to dashboard/verification
    if (currentStep === 1) {
      if (onExit) {
        onExit();
        return;
      }
      // If no onExit provided, fallback to redirection manually
      window.location.href = '/welcome-dashboard';
      return;
    }

    // ENHANCED: Auto-refresh token and save progress on EVERY step transition
    if (currentStep > 1) {
      await handleStepTransition(currentStep, currentStep + 1);
    }

    // EXISTING: Continue to next step (preserve resume UX)
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep((prev) => (prev + 1) as OnboardingStep);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // NEW: Handle step transitions with token refresh and data persistence
  const handleStepTransition = async (fromStep: number, toStep: number) => {
    try {
      const sessionId = localStorage.getItem('onboardingSessionId');
      const token = localStorage.getItem('authToken');

      if (!sessionId || !token) {
        logger.warn('No session or token found for step transition');
        return;
      }

      // Prepare current step data for saving
      const stepData = getCurrentStepData(fromStep);

      logger.info(`🔄 Step transition: ${fromStep} → ${toStep}, refreshing token and saving data...`);

      // Call refresh endpoint with current step data
      const response = await post('/auth/refresh-onboarding', {
        sessionId: sessionId,
        currentStep: toStep,
        stepData: stepData
      });

      if ((response as any).success) {
        // Update token in localStorage
        localStorage.setItem('authToken', (response as any).token);
        localStorage.setItem('accessToken', (response as any).token);

        logger.info(`✅ Step ${toStep}: Token refreshed, session extended, data saved`);
      } else {
        throw new Error((response as any).message || 'Token refresh failed');
      }
    } catch (error: any) {
      logger.error(`❌ Step transition failed (${fromStep} → ${toStep}):`, error);

      // Don't block UX, but warn user
      console.warn('Session refresh failed, you may need to login again if idle too long');
    }
  };

  // NEW: Extract current step data for persistence
  const getCurrentStepData = (step: number) => {
    switch (step) {
      case 2: // Phone verification
        return {
          phoneNumber: onboardingData.phoneNumber,
          countryCode: onboardingData.countryCode,
          isVerified: onboardingData.isVerified
        };
      case 3: // Personal details
        return {
          gender: onboardingData.gender,
          dateOfBirth: onboardingData.dateOfBirth,
          address1: onboardingData.address1,
          address2: onboardingData.address2,
          city: onboardingData.city,
          state: onboardingData.state,
          zipCode: onboardingData.zipCode,
          country: onboardingData.country,
          timezone: onboardingData.timezone,
          languages: onboardingData.languages
        };
      case 4: // Credentials
        return {
          highestDegree: onboardingData.highestDegree,
          institutionName: onboardingData.institutionName,
          graduationYear: onboardingData.graduationYear,
          yearsOfExperience: onboardingData.yearsOfExperience,
          specializations: onboardingData.specializations,
          clinicalSpecialties: onboardingData.clinicalSpecialties,
          therapeuticModalities: {
            cbt: onboardingData.cbt,
            dbt: onboardingData.dbt,
            act: onboardingData.act,
            emdr: onboardingData.emdr
          }
        };
      case 5: // License
        return {
          licenseType: onboardingData.licenseType,
          licenseNumber: onboardingData.licenseNumber,
          licenseState: onboardingData.issuingStates?.[0],
          licenseExpiry: onboardingData.licenseExpiryDate,
          npiNumber: onboardingData.npiNumber
        };
      case 6: // Availability
        return {
          sessionFormats: {
            video: onboardingData.video,
            inPerson: onboardingData.inPerson,
            phone: onboardingData.phone,
            messaging: onboardingData.messaging
          },
          newClientsCapacity: onboardingData.newClientsCapacity,
          weeklySchedule: onboardingData.weeklySchedule
        };
      default:
        return {}; // Return empty object for steps without specific data
    }
  };

  // NEW: Lightweight registration after Step 1
  const handleLightweightRegistration = async () => {
    try {
      const step1Data = {
        email: onboardingData.email,
        password: onboardingData.password,
        firstName: onboardingData.firstName,
        lastName: onboardingData.lastName,
        phoneNumber: onboardingData.phoneNumber,
        countryCode: onboardingData.countryCode,
        role: 'therapist'
      };

      logger.info('🔄 Creating user profile after Step 1...', { email: step1Data.email });

      // Call lightweight registration endpoint
      const response = await post<any>('/auth/register-lightweight', step1Data);

      if (response.success) {
        logger.info('✅ Step 1 registration successful - user can now login', {
          userId: response.user?.id,
          email: response.user?.email,
          canLogin: response.canLogin,
          sessionId: response.sessionId
        });

        // Store auth info for potential login and API calls
        if (response.token) {
          localStorage.setItem('authToken', response.token);
          localStorage.setItem('accessToken', response.token); // For API client
        }
        if (response.user?.id) {
          localStorage.setItem('therapistAuthUid', response.user.id);
        }
        // CRITICAL: Store session ID for token refresh
        if (response.sessionId) {
          localStorage.setItem('onboardingSessionId', response.sessionId);
        }

        // Continue with existing UX - no interruption
        logger.info('🔄 Continuing to Step 2 with existing UX...');
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error: any) {
      logger.error('❌ Step 1 registration failed:', error);

      // Don't block the UX - just log the error and continue
      // User can still complete onboarding and register at the end
      console.warn('Step 1 registration failed, continuing with existing flow:', error.message);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as OnboardingStep);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      // Get org invite code from URL if present
      const urlParams = new URLSearchParams(window.location.search);
      const orgCode = urlParams.get('org') || '';

      // Get current user - try multiple sources
      let user: any = getCurrentUserSync();
      let userUid = user?.uid;

      // Fallback 1: Check if UID is stored in onboarding data
      if (!userUid && onboardingData.firebaseUid) {
        userUid = onboardingData.firebaseUid;
        console.log('🔄 Using UID from onboarding data:', userUid);
      }

      // Fallback 2: Check localStorage for stored UID
      if (!userUid) {
        const storedUid = localStorage.getItem('therapistAuthUid') || localStorage.getItem('authToken');
        if (storedUid) {
          userUid = storedUid;
          console.log('🔄 Using UID from localStorage:', userUid);
        }
      }

      // Fallback 3: Try to extract from stored token
      if (!userUid) {
        try {
          const token = localStorage.getItem('authToken');
          if (token) {
            const payload = JSON.parse(atob(token.split('.')[1]));
            userUid = payload.user?.id?.toString() || payload.sub || payload.userId;
            console.log('🔄 Extracted UID from token:', userUid);
          }
        } catch (error) {
          console.log('⚠️ Could not extract UID from token');
        }
      }

      if (!userUid) {
        throw new Error('User not authenticated. Please log in again and complete the registration.');
      }

      console.log('✅ Using UID for onboarding completion:', userUid);

      // Save user UID to localStorage for verification page
      localStorage.setItem('therapistAuthUid', userUid);

      // CHANGE: Construct payload for onboarding completion (not full registration)
      const businessData = {
        // Personal Information (Step 3)
        gender: onboardingData.gender,
        dateOfBirth: onboardingData.dateOfBirth,
        address1: onboardingData.address1,
        address2: onboardingData.address2,
        city: onboardingData.city,
        state: onboardingData.state,
        zipCode: onboardingData.zipCode,
        country: onboardingData.country,
        timezone: onboardingData.timezone,
        languages: onboardingData.languagesSpokenFluently || onboardingData.languages,
        profilePhotoUrl: typeof onboardingData.profilePhoto === 'string' ? onboardingData.profilePhoto : undefined,
        selectedAvatarUrl: onboardingData.selectedAvatarUrl,
        headshotUrl: typeof onboardingData.headshot === 'string' ? onboardingData.headshot : undefined,

        // Step 4 Credentials
        highestDegree: onboardingData.highestDegree,
        institutionName: onboardingData.institutionName,
        graduationYear: onboardingData.graduationYear,
        yearsOfExperience: onboardingData.yearsOfExperience,
        bio: onboardingData.bio,
        specializations: onboardingData.specializations,
        clinicalSpecialties: onboardingData.clinicalSpecialties,
        lifeContextSpecialties: onboardingData.lifeContextSpecialties,

        // Therapeutic Modalities
        therapeuticModalities: {
          cbt: onboardingData.cbt,
          dbt: onboardingData.dbt,
          act: onboardingData.act,
          emdr: onboardingData.emdr,
          humanistic: onboardingData.humanistic,
          psychodynamic: onboardingData.psychodynamic,
          gottman: onboardingData.gottman,
          eft: onboardingData.eft,
          exposureTherapy: onboardingData.exposureTherapy,
          somaticTherapies: onboardingData.somaticTherapies,
          ifs: onboardingData.ifs,
          mindfulnessBased: onboardingData.mindfulnessBased,
          motivationalInterviewing: onboardingData.motivationalInterviewing,
          traumaInformedCare: onboardingData.traumaInformedCare,
          playTherapy: onboardingData.playTherapy,
          artTherapy: onboardingData.artTherapy,
          narrativeTherapy: onboardingData.narrativeTherapy,
          solutionFocused: onboardingData.solutionFocused
        },

        // Personal Style
        personalStyle: {
          warmCompassionate: onboardingData.warmCompassionate,
          structuredGoalOriented: onboardingData.structuredGoalOriented,
          skillsBased: onboardingData.skillsBased,
          directHonest: onboardingData.directHonest,
          insightOriented: onboardingData.insightOriented,
          culturallySensitive: onboardingData.culturallySensitive,
          faithBased: onboardingData.faithBased,
          lgbtqAffirming: onboardingData.lgbtqAffirming
        },

        // Demographic Preferences (Step 8)
        demographicPreferences: {
          kids: onboardingData.kids,
          teens: onboardingData.teens,
          adults: onboardingData.adults,
          seniors: onboardingData.seniors,
          couples: onboardingData.couples,
          families: onboardingData.families,
          lgbtqPlus: onboardingData.lgbtqPlus,
          highRiskClients: onboardingData.highRiskClients,
          adhdClients: onboardingData.adhdClients,
          neurodivergentGroups: onboardingData.neurodivergentGroups,
          courtOrderedClients: onboardingData.courtOrderedClients,
          bipocCommunities: onboardingData.bipocCommunities,
          immigrants: onboardingData.immigrants,
          veteransCommunity: onboardingData.veteransCommunity
        },

        // Step 9 Insurance & Compliance
        insurancePanelsAccepted: onboardingData.insurancePanelsAccepted,
        medicaidAcceptance: onboardingData.medicaidAcceptance,
        medicareAcceptance: onboardingData.medicareAcceptance,
        selfPayAccepted: onboardingData.selfPayAccepted,
        slidingScale: onboardingData.slidingScale,
        employerEaps: onboardingData.employerEaps,
        backgroundCheckResults: onboardingData.backgroundCheckResults || 'pending',
        hipaaTrainingCompleted: onboardingData.hipaaTrainingCompleted,
        ethicsCertification: onboardingData.ethicsCertification,
        signedBaa: onboardingData.signedBaa,

        // Document URLs
        licenseDocumentUrl: typeof onboardingData.licenseDocument === 'string' ? onboardingData.licenseDocument : undefined,
        malpracticeDocumentUrl: typeof onboardingData.malpracticeInsuranceDocument === 'string' ? onboardingData.malpracticeInsuranceDocument : undefined,
        degreeDocumentUrl: typeof onboardingData.degreeDocument === 'string' ? onboardingData.degreeDocument : undefined,
        photoIdUrl: typeof onboardingData.governmentId === 'string' ? onboardingData.governmentId : undefined,
        hipaaDocumentUrl: typeof onboardingData.hipaaTrainingDocument === 'string' ? onboardingData.hipaaTrainingDocument : undefined,
        ethicsDocumentUrl: typeof onboardingData.ethicsCertificationDocument === 'string' ? onboardingData.ethicsCertificationDocument : undefined,
        backgroundCheckDocumentUrl: typeof onboardingData.backgroundCheckDocument === 'string' ? onboardingData.backgroundCheckDocument : undefined,
        w9DocumentUrl: typeof onboardingData.w9Document === 'string' ? onboardingData.w9Document : undefined,

        // Step 10 Profile
        shortBio: onboardingData.shortBio,
        extendedBio: onboardingData.extendedBio,
        whatClientsCanExpect: onboardingData.whatClientsCanExpect,
        myApproachToTherapy: onboardingData.myApproachToTherapy,

        // Step 5 License
        licenseNumber: onboardingData.licenseNumber,
        licenseState: onboardingData.issuingStates?.[0] || '',
        licenseType: onboardingData.licenseType,
        licenseExpiry: onboardingData.licenseExpiryDate,
        malpracticeInsurance: onboardingData.malpracticeInsurance,
        malpracticePolicyNumber: onboardingData.malpracticePolicyNumber,
        malpracticeExpiry: onboardingData.malpracticeExpiryDate,
        npiNumber: onboardingData.npiNumber,
        deaNumber: onboardingData.deaNumber,
        licensingAuthority: onboardingData.licensingAuthority,

        // Step 6 Availability & Preferences
        sessionFormats: {
          video: onboardingData.video,
          inPerson: onboardingData.inPerson,
          phone: onboardingData.phone,
          messaging: onboardingData.messaging
        },
        newClientsCapacity: onboardingData.newClientsCapacity,
        maxCaseloadCapacity: onboardingData.maxCaseloadCapacity,
        clientIntakeSpeed: onboardingData.clientIntakeSpeed,
        emergencySameDayCapacity: onboardingData.emergencySameDayCapacity,
        weeklySchedule: onboardingData.weeklySchedule,
        sessionLengthsOffered: onboardingData.sessionLengthsOffered,
        preferredSchedulingDensity: onboardingData.preferredSchedulingDensity,
      };

      logger.info('Submitting onboarding completion to API');

      // CHANGE: Call new onboarding completion endpoint
      const result = await post('/onboarding/therapist-complete', businessData) as any;

      console.log('✅ Onboarding completion response:', result);

      if (result.success) {
        // Clear onboarding data from localStorage
        clearLocalStorage();

        logger.info('Therapist onboarding completed successfully', {
          accountStatus: result.accountStatus
        });

        // Show success message
        alert('✅ Onboarding Completed Successfully!\n\nYour application has been received and is under review.\n\nYou can now log in to access your dashboard. You\'ll get full access to clients once approved (typically 24-48 hours).');

        // Sign out the user
        await signOut();

        // Clear URL and redirect to login page
        window.history.pushState({}, '', '/');
        window.location.href = '/';
      } else {
        throw new Error(result.message || 'Onboarding completion failed');
      }

    } catch (error: any) {
      logger.error('Onboarding completion failed:', error);

      // Parse error response
      let errorMessage = 'Onboarding completion failed. Please try again or contact support.';
      let errorTitle = 'Onboarding Error';

      try {
        // Try to parse JSON error from backend
        const errorData = typeof error === 'string' ? JSON.parse(error) : error;

        if (errorData.error === 'DUPLICATE_ACCOUNT') {
          errorTitle = 'Account Already Exists';
          errorMessage = errorData.message || 'This email or phone number is already registered. Please login instead.';

          // Show login option
          if (confirm(`${errorMessage}\n\nWould you like to go to the login page?`)) {
            window.location.href = '/';
            return;
          }
        } else if (errorData.error === 'ALREADY_REGISTERED') {
          errorTitle = 'Application Already Submitted';
          errorMessage = errorData.message || 'You have already submitted an onboarding application. Please login to check your application status.';

          // Redirect to login
          alert(errorMessage);
          window.location.href = '/';
          return;
        } else if (errorData.error === 'ALREADY_APPROVED') {
          errorTitle = 'Account Already Approved';
          errorMessage = errorData.message || 'Your account is already approved! Please login to access your dashboard.';

          // Redirect to login
          alert(errorMessage);
          window.location.href = '/';
          return;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch (parseError) {
        // Use default error message
        errorMessage = error.message || errorMessage;
      }

      alert(`${errorTitle}\n\n${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ NEW: Handler for OAuth signup - skip phone verification
  const handleOAuthSignup = (email: string, displayName: string, uid: string, method: 'google' | 'phone' | 'apple') => {
    logger.info(`✅ OAuth signup with ${method}:`, { email, displayName, uid });

    // Update onboarding data with OAuth info
    updateData({
      firstName: displayName?.split(' ')[0] || '',
      lastName: displayName?.split(' ').slice(1).join(' ') || '',
      email: email,
      firebaseUid: uid,
      authMethod: method,
    });

    // Go to Step 2 (Phone Verification) so user can enter/verify phone number
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onCompleteCallback = () => {
    // Add any additional logic you want to execute after onboarding is complete
    logger.info('Onboarding completed successfully!');
  };

  // Session Resume Prompt
  if (showResumePrompt && resumeStep) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg border border-gray-100 p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
            {getCurrentUserSync()?.email?.charAt(0).toUpperCase() || onboardingData.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Welcome Back!</h2>
            <p className="text-gray-500 mt-2">
              We found an application in progress for <span className="font-medium text-gray-900">{getCurrentUserSync()?.email || onboardingData.email}</span> at Step {resumeStep}.
            </p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => {
                setCurrentStep(resumeStep);
                setShowResumePrompt(false);
              }}
              className="w-full bg-[#F97316] hover:bg-[#ea580c] h-12 text-lg"
            >
              Continue Application
            </Button>
            <Button
              variant="outline"
              onClick={async () => {
                await signOut();
                clearLocalStorage();
                window.history.pushState({}, '', '/');
                window.location.reload();
              }}
              className="w-full text-gray-600 border-gray-200 hover:bg-gray-50 h-12"
            >
              Sign Out & Start New
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Success screen after final submission
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="w-full max-w-2xl mx-auto px-6">
          <div className="p-12 shadow-lg rounded-lg bg-white/80 backdrop-blur-md border border-gray-100 text-center">
            {/* Success Icon */}
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>

            {/* Success Message */}
            <h1 className="text-3xl font-medium leading-8 text-gray-900 mb-3">
              Profile Submitted Successfully!
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Your profile is under review. We will notify you once approved.
            </p>

            {/* Status Badge */}
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-amber-50 border border-amber-200 rounded-full mb-8">
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
              <span className="font-medium text-amber-800">Pending Approval</span>
            </div>

            {/* What's Next */}
            <div className="bg-gray-50 rounded-lg p-6 text-left">
              <h3 className="font-semibold text-gray-900 mb-4">What happens next?</h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#F97316] text-white flex items-center justify-center text-xs font-semibold shrink-0">
                    1
                  </div>
                  <span>
                    Our team will review your credentials and documents within <strong>24-48 hours</strong>
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#F97316] text-white flex items-center justify-center text-xs font-semibold shrink-0">
                    2
                  </div>
                  <span>You'll receive an email notification once your profile is approved</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#F97316] text-white flex items-center justify-center text-xs font-semibold shrink-0">
                    3
                  </div>
                  <span>After approval, you can start accepting client appointments</span>
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="mt-8">
              <Button
                className="w-full bg-[#F97316] hover:bg-[#ea580c]"
                onClick={() => {
                  window.history.pushState({}, '', '/');
                  if (onComplete) {
                    onComplete();
                  } else {
                    window.location.href = '/';
                  }
                }}
              >
                Back to Login
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      {/* Session Header */}
      <div className="max-w-4xl mx-auto px-4 mb-2 flex justify-between items-center">
        {/* Left Side: Save & Exit (Only for Steps > 1) */}
        <div>
          {currentStep > 1 && (
            <button
              onClick={() => onExit && onExit()}
              className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1 bg-white px-3 py-1.5 rounded-md shadow-sm border border-blue-100 transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              Save & Exit
            </button>
          )}
        </div>

        {/* Right Side: User Info */}
        <div className="text-xs text-muted-foreground flex items-center gap-3 bg-white/80 px-4 py-2 rounded-full backdrop-blur-sm border border-gray-100 shadow-sm">
          {isAuthenticated() ? (
            <>
              <span className="flex items-center gap-2 truncate max-w-[200px]">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                {authenticatedUser?.email || localStorage.getItem('userEmail')}
              </span>
              <span className="text-gray-300">|</span>
              <button
                onClick={async () => {
                  await authService.logout();
                  clearLocalStorage();
                  window.history.pushState({}, '', '/');
                  window.location.reload();
                }}
                className="text-orange-600 hover:text-orange-700 font-medium hover:underline transition-all whitespace-nowrap"
              >
                Sign Out / Start Over
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                clearLocalStorage();
                window.history.pushState({}, '', '/');
                if (onComplete) {
                  onComplete();
                } else {
                  window.location.href = '/';
                }
              }}
              className="text-orange-600 hover:text-orange-700 font-medium hover:underline transition-all whitespace-nowrap"
            >
              ← Back to Login
            </button>
          )}
        </div>
      </div>

      {/* Progress Indicator */}
      {currentStep <= TOTAL_STEPS && (
        <OnboardingProgress currentStep={currentStep} totalSteps={TOTAL_STEPS} />
      )}

      {/* Step Content */}
      <div className="mt-8">
        {currentStep === 1 && (
          <OnboardingStep1Signup
            data={{
              firstName: onboardingData.firstName || '',
              lastName: onboardingData.lastName || '',
              email: onboardingData.email || '',
              phoneNumber: onboardingData.phoneNumber || '',
              countryCode: onboardingData.countryCode || '+91',
              password: onboardingData.password || '',
            }}
            onUpdate={updateData}
            onNext={goToNextStep}
            onBackToLogin={onComplete} // ✅ Use same callback to go back to login
            onOAuthSignup={handleOAuthSignup} // ✅ Add OAuth signup handler
          />
        )}

        {currentStep === 2 && (
          <OnboardingStep2Verification
            phoneNumber={onboardingData.phoneNumber}
            countryCode={onboardingData.countryCode}
            onBack={goToPreviousStep}
            onNext={goToNextStep}
            onUpdate={updateData}
          />
        )}

        {currentStep === 3 && (
          <OnboardingStep3PersonalDetails
            data={{
              profilePhoto: onboardingData.profilePhoto,
              gender: onboardingData.gender,
              dateOfBirth: onboardingData.dateOfBirth,
              address1: onboardingData.address1,
              address2: onboardingData.address2,
              country: onboardingData.country,
              state: onboardingData.state,
              city: onboardingData.city,
              zipCode: onboardingData.zipCode,
              languages: onboardingData.languages,
              timezone: onboardingData.timezone,
              termsAccepted: onboardingData.termsAccepted,
            }}
            onUpdate={updateData}
            onNext={goToNextStep}
            onBack={goToPreviousStep}
          />
        )}

        {currentStep === 4 && (
          <OnboardingStep4CredentialsEnhanced
            data={{
              highestDegree: onboardingData.highestDegree,
              institutionName: onboardingData.institutionName,
              graduationYear: onboardingData.graduationYear,
              yearsOfExperience: onboardingData.yearsOfExperience,
              specializations: onboardingData.specializations,
              bio: onboardingData.bio,
              clinicalSpecialties: onboardingData.clinicalSpecialties,
              lifeContextSpecialties: onboardingData.lifeContextSpecialties,
              cbt: onboardingData.cbt,
              dbt: onboardingData.dbt,
              act: onboardingData.act,
              emdr: onboardingData.emdr,
              humanistic: onboardingData.humanistic,
              psychodynamic: onboardingData.psychodynamic,
              gottman: onboardingData.gottman,
              eft: onboardingData.eft,
              exposureTherapy: onboardingData.exposureTherapy,
              somaticTherapies: onboardingData.somaticTherapies,
              ifs: onboardingData.ifs,
              mindfulnessBased: onboardingData.mindfulnessBased,
              motivationalInterviewing: onboardingData.motivationalInterviewing,
              traumaInformedCare: onboardingData.traumaInformedCare,
              playTherapy: onboardingData.playTherapy,
              artTherapy: onboardingData.artTherapy,
              narrativeTherapy: onboardingData.narrativeTherapy,
              solutionFocused: onboardingData.solutionFocused,
              warmCompassionate: onboardingData.warmCompassionate,
              structuredGoalOriented: onboardingData.structuredGoalOriented,
              skillsBased: onboardingData.skillsBased,
              directHonest: onboardingData.directHonest,
              insightOriented: onboardingData.insightOriented,
              culturallySensitive: onboardingData.culturallySensitive,
              faithBased: onboardingData.faithBased,
              lgbtqAffirming: onboardingData.lgbtqAffirming,
            }}
            onUpdate={updateData}
            onNext={goToNextStep}
            onBack={goToPreviousStep}
          />
        )}

        {currentStep === 5 && (
          <OnboardingStep5LicenseEnhanced
            data={{
              licenseType: onboardingData.licenseType,
              licenseNumber: onboardingData.licenseNumber,
              issuingStates: onboardingData.issuingStates,
              additionalPracticeStates: onboardingData.additionalPracticeStates,
              licenseExpiryDate: onboardingData.licenseExpiryDate,
              licenseDocument: onboardingData.licenseDocument,
              malpracticeInsurance: onboardingData.malpracticeInsurance,
              malpracticeInsuranceDocument: onboardingData.malpracticeInsuranceDocument,
              npiNumber: onboardingData.npiNumber,
              deaNumber: onboardingData.deaNumber,
              licensingAuthority: onboardingData.licensingAuthority,
              governmentId: onboardingData.governmentId,
              informationAccurate: onboardingData.informationAccurate,
              country: onboardingData.country,
            }}
            onUpdate={updateData}
            onNext={goToNextStep}
            onBack={goToPreviousStep}
          />
        )}

        {currentStep === 6 && (
          <OnboardingStep6AvailabilityEnhanced
            data={{
              video: onboardingData.video,
              inPerson: onboardingData.inPerson,
              phone: onboardingData.phone,
              messaging: onboardingData.messaging,
              newClientsCapacity: onboardingData.newClientsCapacity,
              maxCaseloadCapacity: onboardingData.maxCaseloadCapacity,
              clientIntakeSpeed: onboardingData.clientIntakeSpeed,
              sessionLengthsOffered: onboardingData.sessionLengthsOffered,
              emergencySameDayCapacity: onboardingData.emergencySameDayCapacity,
              weeklySchedule: onboardingData.weeklySchedule,
              timezone: onboardingData.timezone,
              hoursPerDay: onboardingData.hoursPerDay,
              daysAvailable: onboardingData.daysAvailable,
              preferredSchedulingDensity: onboardingData.preferredSchedulingDensity,
              sessionDurations: onboardingData.sessionDurations,
              breakTimeBetweenSessions: onboardingData.breakTimeBetweenSessions,
              sessionTypes: onboardingData.sessionTypes,
              supportedLanguages: onboardingData.supportedLanguages,
            }}
            spokenLanguages={onboardingData.languages}
            onUpdate={updateData}
            onNext={goToNextStep}
            onBack={goToPreviousStep}
          />
        )}

        {currentStep === 7 && (
          <OnboardingStep7Review
            data={onboardingData}
            onBack={goToPreviousStep}
            onSubmit={goToNextStep}
            onComplete={onComplete}
          />
        )}

        {currentStep === 8 && (
          <OnboardingStep8Demographics
            data={{
              kids: onboardingData.kids,
              teens: onboardingData.teens,
              adults: onboardingData.adults,
              seniors: onboardingData.seniors,
              couples: onboardingData.couples,
              families: onboardingData.families,
              lgbtqPlus: onboardingData.lgbtqPlus,
              highRiskClients: onboardingData.highRiskClients,
              adhdClients: onboardingData.adhdClients,
              neurodivergentGroups: onboardingData.neurodivergentGroups,
              courtOrderedClients: onboardingData.courtOrderedClients,
              bipocCommunities: onboardingData.bipocCommunities,
              immigrants: onboardingData.immigrants,
              veteransCommunity: onboardingData.veteransCommunity,
            }}
            onUpdate={updateData}
            onNext={goToNextStep}
            onBack={goToPreviousStep}
          />
        )}

        {currentStep === 9 && (
          <OnboardingStep9Insurance
            data={{
              insurancePanelsAccepted: onboardingData.insurancePanelsAccepted,
              medicaidAcceptance: onboardingData.medicaidAcceptance,
              medicareAcceptance: onboardingData.medicareAcceptance,
              selfPayAccepted: onboardingData.selfPayAccepted,
              slidingScale: onboardingData.slidingScale,
              employerEaps: onboardingData.employerEaps,
              backgroundCheckResults: onboardingData.backgroundCheckResults,
              backgroundCheckDocument: onboardingData.backgroundCheckDocument,
              hipaaTrainingCompleted: onboardingData.hipaaTrainingCompleted,
              hipaaTrainingDocument: onboardingData.hipaaTrainingDocument,
              ethicsCertification: onboardingData.ethicsCertification,
              ethicsCertificationDocument: onboardingData.ethicsCertificationDocument,
              signedBaa: onboardingData.signedBaa,
              w9Document: onboardingData.w9Document,
              country: onboardingData.country,
            }}
            onUpdate={updateData}
            onNext={goToNextStep}
            onBack={goToPreviousStep}
          />
        )}

        {currentStep === 10 && (
          <OnboardingStep10Profile
            data={{
              shortBio: onboardingData.shortBio,
              extendedBio: onboardingData.extendedBio,
              headshot: onboardingData.headshot,
              profilePhoto: onboardingData.profilePhoto,
              whatClientsCanExpect: onboardingData.whatClientsCanExpect,
              myApproachToTherapy: onboardingData.myApproachToTherapy,
            }}
            onUpdate={updateData}
            onNext={handleSubmit}
            onBack={goToPreviousStep}
          />
        )}
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-sm text-gray-500 space-y-1">
        <p>Need help? Contact us at info@bedrockhealthsolutions.com</p>
        <p className="text-xs">© 2024 Bedrock Health Solutions. All rights reserved.</p>
      </div>
    </div>
  );
}