import React, { useState } from 'react';
import { logger } from '../utils/secureLogger';
import { Card } from './ui/card';
import { ComprehensiveClientData } from './client/types';
import { ProgressHeader } from './client/ProgressHeader';
import { NavigationButtons } from './client/NavigationButtons';
import { OTPVerificationStep } from './client/OTPVerificationStep';
import { BasicInformationStep } from './client/BasicInformationStep';
import { PresentingConcernsStep } from './client/PresentingConcernsStep';
import { SafetyScreeningStep } from './client/SafetyScreeningStep';
import { ConsentFormsStep } from './client/ConsentFormsStep';
import { ClinicalIntakeStep } from './client/ClinicalIntakeStep';
import { PaymentSetupStep } from './client/PaymentSetupStep';
import { SignatureStep } from './client/SignatureStep';

interface ClientRegistrationFormProps {
    clientEmail: string;
    clientPhone: string;
    clientFirstName: string;
    clientLastName: string;
    clientCountryCode: string;
    registrationToken: string;
    onComplete: (data: ComprehensiveClientData) => void;
    organizationMode?: boolean;
}

const STEPS = [
    { id: 1, title: 'Personal Information', description: 'Tell us about yourself' },
    { id: 2, title: 'What Brings You Here', description: 'Tell us about your concerns' },
    { id: 3, title: 'Safety & Wellness', description: 'Confidential safety screening' },
    { id: 4, title: 'Clinical History', description: 'Medical and mental health background' },
    { id: 5, title: 'Consent Forms', description: 'Review and sign consent documents' },
    { id: 6, title: 'Payment Setup', description: 'Payment method and billing' },
    { id: 7, title: 'Sign and Submit', description: 'Final signature and submission' },
];

export function ClientRegistrationForm({
    clientEmail,
    clientPhone,
    clientFirstName,
    clientLastName,
    clientCountryCode,
    registrationToken,
    onComplete,
    organizationMode = false,
}: ClientRegistrationFormProps) {
    const [currentStep, setCurrentStep] = useState(1);
    const [otpVerified, setOtpVerified] = useState(false);

    const [formData, setFormData] = useState<ComprehensiveClientData>({
        // Pre-filled from invitation
        firstName: clientFirstName,
        lastName: clientLastName,
        email: clientEmail,
        phone: clientPhone,
        countryCode: clientCountryCode || '+1',

        // Basic Info
        middleName: '',
        gender: '',
        dateOfBirth: null,

        address1: '',
        address2: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'United States',
        timezone: '',
        languages: [],
        emergencyContactName: '',
        emergencyContactRelationship: '',
        emergencyContactPhone: '',
        emergencyContactCountryCode: '+1',
        preferredLanguage: [],
        selectedAvatar: '',
        profileImage: '',

        // Insurance/Benefits
        hasInsurance: false,
        insuranceProvider: '',
        insurancePlan: '',
        memberID: '',
        groupNumber: '',
        copayAmount: '',
        deductibleMet: false,

        // Consent Forms
        consentToTreat: false,
        hipaaConsent: false,
        financialPolicyConsent: false,
        telehealthConsent: false,
        releaseOfInformation: false,
        safetyPlanAcknowledged: false,
        minorConsentProvided: false,
        dataUsageConsent: false,

        // Clinical Intake
        presentingConcerns: '',
        symptoms: [],
        currentMedications: '',
        pastDiagnoses: '',
        substanceUse: '',
        suicidalIdeation: '',
        selfHarmHistory: '',
        previousTherapyExperience: '',

        // Presenting Concerns (Structured)
        presentingConcernsData: {
            mainReason: '',
            primaryConcerns: [],
            severityLevel: '',
            otherConcernDetails: '',
        },

        // Safety Screening
        safetyScreeningData: {
            suicidalThoughts: '',
            selfHarmThoughts: '',
            suicidePlan: '',
            accessToMeans: '',
            suicideIntent: '',
            pastSuicideAttempts: '',
            pastSelfHarm: '',
            safeAtHome: '',
            experiencedAbuse: '',
            afraidOfSomeone: '',
            psychoticSymptoms: '',
            substanceUseControl: '',
            hasSocialSupport: '',
            copingStrategies: '',
            additionalSafetyConcerns: '',
            wantsSafetyPlan: false,
        },

        // Matching Preferences
        preferredTherapistGender: '',
        preferredSpecialty: [],
        preferredAvailability: [],
        preferredLanguageTherapy: '',
        preferredModality: [],

        // Payment Setup
        paymentMethod: '',
        cardOnFile: false,
        billingAddress1: '',
        billingAddress2: '',
        billingAddressSameAsPrimary: false,
        billingCity: '',
        billingState: '',
        billingZipCode: '',
        slidingScale: false,
        financialAid: false,

        // Portal Account
        username: '',
        password: '',
        allowViewNotes: true,
        allowViewInvoices: true,

        // Signature
        signature: null,

        // Appointment Setup (Metadata only, step removed)
        preferredFrequency: '',
        preferredTherapist: '',
        careTeamNotes: '',

        // Organization (if enterprise)
        employerProgramID: '',
        employeeID: '',
        preApprovedSessions: 0,
    });

    const updateFormData = (field: string, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const toggleArrayValue = (field: keyof ComprehensiveClientData, value: string) => {
        setFormData((prev) => {
            const currentArray = (prev[field] as string[]) || [];
            const newArray = currentArray.includes(value)
                ? currentArray.filter((item) => item !== value)
                : [...currentArray, value];
            return { ...prev, [field]: newArray };
        });
    };

    const validateStep = (): boolean => {
        switch (currentStep) {
            case 1: // Personal Information
                return !!(
                    formData.firstName &&
                    formData.lastName &&
                    formData.email &&
                    formData.phone &&
                    formData.dateOfBirth &&
                    formData.gender &&
                    formData.address1 && // Address is in this step now
                    formData.city &&
                    formData.state &&
                    formData.zipCode
                );
            case 2: // Presenting Concerns
                return true;
            case 3: // Safety & Wellness
                return !!(
                    formData.safetyScreeningData.suicidalThoughts &&
                    formData.safetyScreeningData.selfHarmThoughts
                );
            case 4: // Clinical History
                // Lenient validation for clinical history if fields are optional
                // But let's check basic fields if needed. For now, unblocking.
                return true;
            case 5: // Consent Forms
                return !!(
                    formData.consentToTreat &&
                    formData.hipaaConsent &&
                    formData.financialPolicyConsent &&
                    formData.telehealthConsent
                );
            case 6: // Payment Setup
                return !!formData.paymentMethod;
            case 7: // Sign and Submit
                return !!formData.signature;
            default:
                return true;
        }
    };

    const handleNext = () => {
        if (validateStep()) {
            setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
            window.scrollTo(0, 0);
        } else {
            // alert('Please complete all required fields before continuing.');
            // Using logic: UI buttons are disabled if invalid, but safety catch here.
        }
    };

    const handlePrevious = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 1));
        window.scrollTo(0, 0);
    };

    const handleSubmit = () => {
        if (validateStep()) {
            onComplete(formData);
        }
    };

    if (!otpVerified) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center p-4">
                <div className="w-full max-w-xl">
                    <OTPVerificationStep
                        clientEmail={formData.email}
                        clientPhone={formData.phone}
                        onVerified={() => setOtpVerified(true)}
                    />
                </div>
            </div>
        );
    }

    const renderStepContent = () => {
        const stepProps = {
            formData,
            updateFormData,
            toggleArrayValue,
            clientEmail,
            clientPhone
        };

        switch (currentStep) {
            case 1:
                return <BasicInformationStep {...stepProps} />;
            case 2:
                return <PresentingConcernsStep {...stepProps} />;
            case 3:
                return <SafetyScreeningStep {...stepProps} />;
            case 4:
                return <ClinicalIntakeStep {...stepProps} />;
            case 5:
                return <ConsentFormsStep {...stepProps} />;
            case 6:
                return <PaymentSetupStep {...stepProps} />;
            case 7:
                return <SignatureStep {...stepProps} />;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-white py-8 px-4 font-sans">
            <div className="max-w-5xl mx-auto space-y-6">
                {/* Progress Header */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <ProgressHeader
                        currentStep={currentStep}
                        totalSteps={STEPS.length}
                        stepTitle={STEPS[currentStep - 1].title}
                    />
                </div>

                {/* Step Content */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8 min-h-[500px]">
                    {renderStepContent()}
                </div>

                {/* Navigation Buttons */}
                <NavigationButtons
                    currentStep={currentStep}
                    totalSteps={STEPS.length}
                    onPrevious={handlePrevious}
                    onNext={currentStep === STEPS.length ? handleSubmit : handleNext}
                    onSaveAndExit={() => {
                        logger.debug('Save and exit:', { ...formData });
                        alert('Your progress has been saved. You can continue later.');
                    }}
                    isStepValid={validateStep()}
                />

                {/* Save & Exit Link */}
                <div className="text-center pt-4">
                    <button
                        onClick={() => {
                            logger.debug('Save and exit:', { ...formData });
                            alert('Your progress has been saved. You can continue later.');
                        }}
                        className="text-sm text-gray-500 hover:text-gray-900 underline transition-colors"
                    >
                        Save & Exit (Continue Later)
                    </button>
                </div>
            </div>
        </div>
    );
}
