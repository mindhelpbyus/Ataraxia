/**
 * Complete Onboarding Flow Component
 * 
 * Demonstrates the 10-step therapist onboarding with:
 * ✅ Session persistence across page reloads
 * ✅ Auto-save on each step
 * ✅ Email and phone verification
 * ✅ Progress tracking
 * ✅ Seamless user experience
 */

import React, { useState, useEffect } from 'react';
import { useOnboarding } from '../hooks/useOnboarding';
import { useEnhancedAuth } from '../hooks/useEnhancedAuth';

// Step Components
const PersonalInformationStep: React.FC<{ onNext: (data: any) => void; initialData: any }> = ({ onNext, initialData }) => {
  const [formData, setFormData] = useState({
    firstName: initialData.firstName || '',
    lastName: initialData.lastName || '',
    dateOfBirth: initialData.dateOfBirth || '',
    gender: initialData.gender || '',
    address: initialData.address || '',
    city: initialData.city || '',
    state: initialData.state || '',
    zipCode: initialData.zipCode || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext(formData);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Personal Information</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="First Name"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            className="px-3 py-2 border rounded-lg"
            required
          />
          <input
            type="text"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            className="px-3 py-2 border rounded-lg"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <input
            type="date"
            placeholder="Date of Birth"
            value={formData.dateOfBirth}
            onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
            className="px-3 py-2 border rounded-lg"
            required
          />
          <select
            value={formData.gender}
            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
            className="px-3 py-2 border rounded-lg"
            required
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="non-binary">Non-binary</option>
            <option value="prefer-not-to-say">Prefer not to say</option>
          </select>
        </div>
        <input
          type="text"
          placeholder="Address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          className="w-full px-3 py-2 border rounded-lg"
          required
        />
        <div className="grid grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="City"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            className="px-3 py-2 border rounded-lg"
            required
          />
          <input
            type="text"
            placeholder="State"
            value={formData.state}
            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
            className="px-3 py-2 border rounded-lg"
            required
          />
          <input
            type="text"
            placeholder="ZIP Code"
            value={formData.zipCode}
            onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
            className="px-3 py-2 border rounded-lg"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Continue to Professional Credentials
        </button>
      </form>
    </div>
  );
};

const ProfessionalCredentialsStep: React.FC<{ onNext: (data: any) => void; initialData: any }> = ({ onNext, initialData }) => {
  const [formData, setFormData] = useState({
    licenseNumber: initialData.licenseNumber || '',
    licenseState: initialData.licenseState || '',
    licenseExpiry: initialData.licenseExpiry || '',
    specializations: initialData.specializations || [],
    yearsExperience: initialData.yearsExperience || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext(formData);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Professional Credentials</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="License Number"
            value={formData.licenseNumber}
            onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
            className="px-3 py-2 border rounded-lg"
            required
          />
          <input
            type="text"
            placeholder="License State"
            value={formData.licenseState}
            onChange={(e) => setFormData({ ...formData, licenseState: e.target.value })}
            className="px-3 py-2 border rounded-lg"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <input
            type="date"
            placeholder="License Expiry"
            value={formData.licenseExpiry}
            onChange={(e) => setFormData({ ...formData, licenseExpiry: e.target.value })}
            className="px-3 py-2 border rounded-lg"
            required
          />
          <input
            type="number"
            placeholder="Years of Experience"
            value={formData.yearsExperience}
            onChange={(e) => setFormData({ ...formData, yearsExperience: e.target.value })}
            className="px-3 py-2 border rounded-lg"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Continue to License Verification
        </button>
      </form>
    </div>
  );
};

const VerificationStep: React.FC<{ 
  onNext: () => void; 
  verifyEmail: (code?: string) => Promise<boolean>;
  sendPhoneVerification: (phone: string) => Promise<void>;
  verifyPhone: (phone: string, code: string) => Promise<boolean>;
  verificationRequired: { email: boolean; phone: boolean };
}> = ({ onNext, verifyEmail, sendPhoneVerification, verifyPhone, verificationRequired }) => {
  const [emailCode, setEmailCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneCode, setPhoneCode] = useState('');
  const [phoneCodeSent, setPhoneCodeSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(!verificationRequired.email);
  const [phoneVerified, setPhoneVerified] = useState(!verificationRequired.phone);
  const [loading, setLoading] = useState(false);

  const handleEmailVerification = async () => {
    setLoading(true);
    try {
      const success = await verifyEmail(emailCode);
      if (success) {
        setEmailVerified(true);
      }
    } catch (error) {
      console.error('Email verification failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendPhoneCode = async () => {
    setLoading(true);
    try {
      await sendPhoneVerification(phoneNumber);
      setPhoneCodeSent(true);
    } catch (error) {
      console.error('Failed to send phone code:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneVerification = async () => {
    setLoading(true);
    try {
      const success = await verifyPhone(phoneNumber, phoneCode);
      if (success) {
        setPhoneVerified(true);
      }
    } catch (error) {
      console.error('Phone verification failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const canContinue = emailVerified && phoneVerified;

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Verification Required</h3>
      <p className="text-gray-600">For healthcare compliance, we need to verify both your email and phone number.</p>
      
      {/* Email Verification */}
      {verificationRequired.email && !emailVerified && (
        <div className="p-4 border rounded-lg">
          <h4 className="font-medium mb-2">📧 Email Verification</h4>
          <p className="text-sm text-gray-600 mb-3">Please check your email for a verification code.</p>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter verification code"
              value={emailCode}
              onChange={(e) => setEmailCode(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-lg"
            />
            <button
              onClick={handleEmailVerification}
              disabled={loading || !emailCode}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify'}
            </button>
          </div>
        </div>
      )}

      {emailVerified && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800">✅ Email verified successfully!</p>
        </div>
      )}

      {/* Phone Verification */}
      {verificationRequired.phone && !phoneVerified && (
        <div className="p-4 border rounded-lg">
          <h4 className="font-medium mb-2">📱 Phone Verification</h4>
          <p className="text-sm text-gray-600 mb-3">We'll send you an SMS code to verify your phone number.</p>
          
          {!phoneCodeSent ? (
            <div className="flex gap-2">
              <input
                type="tel"
                placeholder="Enter phone number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-lg"
              />
              <button
                onClick={handleSendPhoneCode}
                disabled={loading || !phoneNumber}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Code'}
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-green-600">Code sent to {phoneNumber}</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter SMS code"
                  value={phoneCode}
                  onChange={(e) => setPhoneCode(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-lg"
                />
                <button
                  onClick={handlePhoneVerification}
                  disabled={loading || !phoneCode}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                >
                  {loading ? 'Verifying...' : 'Verify'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {phoneVerified && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800">✅ Phone verified successfully!</p>
        </div>
      )}

      {/* Continue Button */}
      {canContinue && (
        <button
          onClick={onNext}
          className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
        >
          Continue to Next Step
        </button>
      )}
    </div>
  );
};

// Main Onboarding Flow Component
export const OnboardingFlow: React.FC = () => {
  const { user, isAuthenticated } = useEnhancedAuth();
  const {
    session,
    currentStep,
    isLoading,
    error,
    progress,
    verificationRequired,
    startOnboarding,
    updateStepData,
    goToStep,
    verifyEmail,
    sendPhoneVerification,
    verifyPhone,
    completeOnboarding,
    getStepData,
    isStepCompleted,
    canNavigateToStep,
    clearSession,
    clearError
  } = useOnboarding();

  const [showVerification, setShowVerification] = useState(false);

  // Auto-start onboarding if user is authenticated but no session exists
  useEffect(() => {
    if (isAuthenticated && user && !session) {
      const initialData = {
        personal: {
          firstName: user.displayName?.split(' ')[0] || '',
          lastName: user.displayName?.split(' ').slice(1).join(' ') || ''
        }
      };
      startOnboarding(initialData);
    }
  }, [isAuthenticated, user, session, startOnboarding]);

  // Check if verification is needed
  useEffect(() => {
    if (session && (verificationRequired.email || verificationRequired.phone)) {
      setShowVerification(true);
    }
  }, [session, verificationRequired]);

  const handleStepComplete = async (stepNumber: number, data: any) => {
    await updateStepData(stepNumber, data, true);
  };

  const handleVerificationComplete = () => {
    setShowVerification(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
        <p>Please log in to start your therapist onboarding process.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading onboarding session...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Start Your Onboarding</h2>
        <p className="mb-4">Welcome! Let's get you set up as a therapist on our platform.</p>
        <button
          onClick={() => startOnboarding()}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Start Onboarding Process
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Therapist Onboarding</h2>
        <div className="flex items-center justify-between">
          <p className="text-gray-600">Complete your profile to start helping clients</p>
          <button
            onClick={clearSession}
            className="text-sm text-red-500 hover:text-red-700"
          >
            Reset Session
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Progress</span>
          <span className="text-sm text-gray-600">{progress.completed}/{progress.total} steps completed</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress.percentage}%` }}
          ></div>
        </div>
      </div>

      {/* Step Navigation */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((stepNum) => (
            <button
              key={stepNum}
              onClick={() => goToStep(stepNum)}
              disabled={!canNavigateToStep(stepNum)}
              className={`
                px-3 py-1 rounded-full text-sm font-medium transition-colors
                ${stepNum === currentStep 
                  ? 'bg-blue-500 text-white' 
                  : isStepCompleted(stepNum)
                  ? 'bg-green-500 text-white'
                  : canNavigateToStep(stepNum)
                  ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }
              `}
            >
              {stepNum}
            </button>
          ))}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex justify-between items-start">
            <p className="text-red-700">{error}</p>
            <button
              onClick={clearError}
              className="text-red-500 hover:text-red-700"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Verification Modal */}
      {showVerification && (
        <div className="mb-6">
          <VerificationStep
            onNext={handleVerificationComplete}
            verifyEmail={verifyEmail}
            sendPhoneVerification={sendPhoneVerification}
            verifyPhone={verifyPhone}
            verificationRequired={verificationRequired}
          />
        </div>
      )}

      {/* Step Content */}
      {!showVerification && (
        <div className="mb-6">
          {currentStep === 1 && (
            <PersonalInformationStep
              onNext={(data) => handleStepComplete(1, data)}
              initialData={getStepData(1)}
            />
          )}
          
          {currentStep === 2 && (
            <ProfessionalCredentialsStep
              onNext={(data) => handleStepComplete(2, data)}
              initialData={getStepData(2)}
            />
          )}
          
          {currentStep >= 3 && currentStep <= 9 && (
            <div className="text-center py-8">
              <h3 className="text-lg font-semibold mb-4">Step {currentStep} - Coming Soon</h3>
              <p className="text-gray-600 mb-4">This step is under development.</p>
              <button
                onClick={() => handleStepComplete(currentStep, { placeholder: true })}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Continue to Next Step
              </button>
            </div>
          )}
          
          {currentStep === 10 && (
            <div className="text-center py-8">
              <h3 className="text-lg font-semibold mb-4">Review & Submit</h3>
              <p className="text-gray-600 mb-6">
                Please review your information and submit your application.
              </p>
              <button
                onClick={completeOnboarding}
                disabled={isLoading}
                className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
              >
                {isLoading ? 'Submitting...' : 'Complete Onboarding'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Session Info */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg text-sm">
        <h4 className="font-medium mb-2">Session Information</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p><strong>Session ID:</strong> {session.sessionId}</p>
            <p><strong>Started:</strong> {session.startedAt.toLocaleString()}</p>
            <p><strong>Last Updated:</strong> {session.lastUpdatedAt.toLocaleString()}</p>
          </div>
          <div>
            <p><strong>Current Step:</strong> {currentStep}/10</p>
            <p><strong>Email Verified:</strong> {session.verificationStatus.email.isVerified ? '✅' : '❌'}</p>
            <p><strong>Phone Verified:</strong> {session.verificationStatus.phone.isVerified ? '✅' : '❌'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingFlow;