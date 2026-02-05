import React, { useState, useEffect } from 'react';
import { OnboardingStep1Signup } from './onboarding/OnboardingStep1Signup';
import { TherapistOnboarding } from './onboarding/TherapistOnboarding';
import { Toaster } from './ui/sonner';
import { logger } from '../services/secureLogger';

// Initial state for the signup form
const initialSignupData = {
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    countryCode: '+91',
    password: ''
};

// Registration Page - Step 1 Only (Decoupled) OR Resume Wizard
export function TherapistRegistrationPage() {
    const [signupData, setSignupData] = useState(initialSignupData);
    const [isResuming, setIsResuming] = useState(false);
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        // Check if we should show the full wizard (Resuming steps 2-10)
        const checkResumeState = () => {
            try {
                const savedStep = localStorage.getItem('therapistOnboardingStep');
                const step = savedStep ? parseInt(savedStep) : 1;

                // If step is greater than 1, we are in the wizard flow
                if (step > 1) {
                    setIsResuming(true);
                }
            } catch (e) {
                logger.error('Failed to check resume state', e);
            } finally {
                setIsChecking(false);
            }
        };

        checkResumeState();
    }, []);

    const handleUpdate = (newData: any) => {
        setSignupData(prev => ({ ...prev, ...newData }));
    };

    const handleNext = () => {
        // Save data so Steps 2-10 can resume from here later if needed
        try {
            localStorage.setItem('therapistOnboardingData', JSON.stringify(signupData));
            localStorage.setItem('therapistOnboardingStep', '2');
        } catch (e) {
            console.error('Failed to save progress', e);
        }

        logger.info('✅ Registration completed, redirecting to dashboard');
        window.location.href = '/welcome-dashboard';
    };

    const handleBackToLogin = () => {
        window.location.href = '/';
    };

    const handleWizardComplete = () => {
        // Wizard finished: Update status and go to Main Dashboard
        localStorage.setItem('accountStatus', 'onboarding_completed');
        window.location.href = '/';
    };

    const handleWizardExit = () => {
        window.location.href = '/welcome-dashboard';
    };

    if (isChecking) {
        return <div className="min-h-screen bg-gray-50" />;
    }

    // RESUME MODE: Show full wizard for steps 2-10
    if (isResuming) {
        return (
            <div className="min-h-screen bg-gray-50">
                <TherapistOnboarding
                    onComplete={handleWizardComplete}
                    onExit={handleWizardExit}
                />
                <Toaster />
            </div>
        );
    }

    // REGISTRATION MODE: Show Step 1 Only (Decoupled)
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Create your account
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Join Ataraxia as a therapist
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <OnboardingStep1Signup
                    data={signupData}
                    onUpdate={handleUpdate}
                    onNext={handleNext}
                    onBackToLogin={handleBackToLogin}
                />
            </div>
            <Toaster />
        </div>
    );
}
