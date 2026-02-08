import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Eye, EyeOff, Phone, ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription } from "../ui/alert";
import { PhoneInput, validatePhoneNumber as validatePhone } from '../PhoneInput';
import { firebasePhoneAuth } from '../../services/firebase';
import { RealAuthService as authService } from '../../api/services/auth';

interface TherapistPhoneRegistrationProps {
  onRegistrationComplete: (email: string, userName: string, role: 'therapist', userId: string, onboardingStatus: string, token: string) => void;
  onBackToLogin: () => void;
}

export function TherapistPhoneRegistration({ onRegistrationComplete, onBackToLogin }: TherapistPhoneRegistrationProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<'phone' | 'otp' | 'details'>('phone');

  // Phone verification state
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneCountryCode, setPhoneCountryCode] = useState('US');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<any>(null);

  // Step 1 details state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [createPassword, setCreatePassword] = useState(false);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (!validatePhone(phoneNumber, phoneCountryCode)) {
        throw new Error('Please enter a valid phone number');
      }

      const fullPhoneNumber = `+${phoneCountryCode}${phoneNumber}`;

      // Use Firebase Phone Auth
      const confirmation = await firebasePhoneAuth.sendPhoneVerification(fullPhoneNumber);
      setConfirmationResult(confirmation);
      setCurrentStep('otp');

      toast.success('Verification code sent to your phone');

    } catch (err: any) {
      console.error('Phone verification error:', err);

      if (err.code === 'auth/invalid-phone-number') {
        setError('Invalid phone number format');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many requests. Please try again later.');
      } else {
        setError(err.message || 'Failed to send verification code');
      }

      toast.error(err.message || 'Failed to send verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (otp.length !== 6) {
        throw new Error('Please enter a valid 6-digit OTP');
      }

      if (!confirmationResult) {
        throw new Error('Please request a new verification code');
      }

      const result = await firebasePhoneAuth.verifyPhoneCode(confirmationResult, otp);

      if (result.user) {
        // Phone verified successfully - move to Step 1 details
        setCurrentStep('details');
        toast.success('Phone verified successfully! Please complete your profile.');
      }

    } catch (err: any) {
      console.error('OTP verification error:', err);

      if (err.code === 'auth/invalid-verification-code') {
        setError('Invalid verification code');
      } else {
        setError(err.message || 'Verification failed');
      }

      toast.error(err.message || 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Validate required fields
      if (!firstName || !lastName || !email) {
        throw new Error('Please fill in all required fields');
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Please enter a valid email address');
      }

      // Get Firebase ID token
      if (!confirmationResult?.user) {
        throw new Error('Phone verification expired. Please start over.');
      }

      const idToken = await confirmationResult.user.getIdToken();

      // Call therapist phone registration endpoint
      const response = await authService.registerTherapistWithPhone(
        idToken,
        firstName,
        lastName,
        email,
        createPassword ? password : undefined
      );

      if (response.user) {
        toast.success('Registration successful! Welcome to Ataraxia.');

        // Route to onboarding (Step 1 completed, continue with Steps 2-10)
        onRegistrationComplete(
          response.user.email,
          response.user.name,
          'therapist',
          response.user.id,
          response.user.account_status,
          response.token
        );
      }

    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Registration failed');
      toast.error(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      const fullPhoneNumber = `+${phoneCountryCode}${phoneNumber}`;
      const confirmation = await firebasePhoneAuth.sendPhoneVerification(fullPhoneNumber);
      setConfirmationResult(confirmation);
      toast.success("OTP resent successfully");
    } catch (error: any) {
      toast.error("Failed to resend OTP");
    }
  };

  // Cleanup Firebase auth on unmount
  useEffect(() => {
    return () => {
      firebasePhoneAuth.cleanup();
    };
  }, []);

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Invisible reCAPTCHA container for Firebase Phone Auth */}
      <div id="recaptcha-container"></div>

      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-semibold text-foreground">
            {currentStep === 'phone' && 'Therapist Registration'}
            {currentStep === 'otp' && 'Verify Phone Number'}
            {currentStep === 'details' && 'Complete Your Profile'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {currentStep === 'phone' && 'Enter your phone number to get started'}
            {currentStep === 'otp' && `Enter the code sent to ${phoneNumber}`}
            {currentStep === 'details' && 'Basic Information'}
          </p>
        </div>

        {/* Back button */}
        <Button
          type="button"
          variant="ghost"
          onClick={currentStep === 'phone' ? onBackToLogin : () => setCurrentStep(currentStep === 'otp' ? 'phone' : 'otp')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          {currentStep === 'phone' ? 'Back to Login' : 'Back'}
        </Button>

        {error && (
          <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-2">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Phone Number Step */}
        {currentStep === 'phone' && (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <PhoneInput
              value={phoneNumber}
              countryCode={phoneCountryCode}
              onChange={(phone, code) => {
                setPhoneNumber(phone);
                setPhoneCountryCode(code);
              }}
              label="Phone Number"
              required
              disabled={isLoading}
            />

            <motion.div whileTap={{ scale: 0.98 }}>
              <Button
                type="submit"
                className="w-full font-bold h-12 rounded-2xl shadow-xl shadow-orange-500/20"
                style={{ backgroundColor: '#ea580c', color: '#ffffff' }}
                disabled={isLoading}
              >
                {isLoading ? 'Sending Code...' : 'Send Verification Code'}
              </Button>
            </motion.div>
          </form>
        )}

        {/* OTP Verification Step */}
        {currentStep === 'otp' && (
          <form onSubmit={handleVerifyOTP} className="space-y-6">
            <div className="space-y-2 text-center">
              <Label htmlFor="otp" className="text-muted-foreground">Verification Code</Label>
              <Input
                id="otp"
                type="text"
                placeholder="000 000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
                disabled={isLoading}
                maxLength={6}
                className="text-center text-2xl tracking-[0.5em] font-mono h-14 bg-background/50 border-transparent focus:bg-background text-foreground"
              />
              <p className="text-xs text-muted-foreground">
                Sent to +{phoneCountryCode}{phoneNumber}
              </p>
            </div>

            <motion.div whileTap={{ scale: 0.98 }}>
              <Button
                type="submit"
                className="w-full font-bold h-12 rounded-2xl shadow-xl shadow-orange-500/20"
                style={{ backgroundColor: '#ea580c', color: '#ffffff' }}
                disabled={isLoading}
              >
                {isLoading ? 'Verifying...' : 'Verify Code'}
              </Button>
            </motion.div>

            <div className="flex justify-between text-xs text-muted-foreground px-2">
              <button type="button" onClick={() => setCurrentStep('phone')} className="hover:text-foreground">
                Change Number
              </button>
              <button type="button" onClick={handleResendOTP} className="hover:text-foreground">
                Resend Code
              </button>
            </div>
          </form>
        )}

        {/* Profile Details Step (Step 1 of Onboarding) */}
        {currentStep === 'details' && (
          <form onSubmit={handleCompleteRegistration} className="space-y-4">
            {/* Phone number display (read-only) */}
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                Phone Number (Verified)
              </Label>
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl">
                <Phone className="w-4 h-4 text-green-600" />
                <span className="text-green-800 font-medium">+{phoneCountryCode}{phoneNumber}</span>
              </div>
            </div>

            {/* Name fields */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                  First Name *
                </Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-12 rounded-xl bg-background/50 border-transparent focus:border-primary/20 focus:bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                  Last Name *
                </Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-12 rounded-xl bg-background/50 border-transparent focus:border-primary/20 focus:bg-background"
                />
              </div>
            </div>

            {/* Email field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                Email Address *
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="john.doe@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="h-12 rounded-xl bg-background/50 border-transparent focus:border-primary/20 focus:bg-background"
              />
            </div>

            {/* Optional password */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="createPassword"
                  checked={createPassword}
                  onChange={(e) => setCreatePassword(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="createPassword" className="text-sm text-muted-foreground">
                  Create a password (optional - you can always use phone login)
                </Label>
              </div>

              {createPassword && (
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                      className="h-12 rounded-xl pr-10 bg-background/50 border-transparent focus:border-primary/20 focus:bg-background"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-2 rounded-full hover:bg-muted/50 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <motion.div whileTap={{ scale: 0.98 }}>
              <Button
                type="submit"
                className="w-full font-bold h-12 rounded-2xl shadow-xl shadow-orange-500/20"
                style={{ backgroundColor: '#ea580c', color: '#ffffff' }}
                disabled={isLoading}
              >
                {isLoading ? 'Creating Account...' : 'Complete Step 1 & Continue'}
              </Button>
            </motion.div>

            <p className="text-xs text-center text-muted-foreground">
              Complete your registration to access the dashboard.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}