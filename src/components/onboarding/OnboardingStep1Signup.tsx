import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Phone } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Separator } from '../ui/separator';
import { PhoneInput } from '../PhoneInput';
import { UnauthorizedDomainAlert } from '../UnauthorizedDomainAlert';
import { BedrockLogo } from '../../imports/BedrockLogo';
import { signInWithGoogle, signInWithApple, createUserWithEmail, getAuthErrorMessage } from '../../services/firebaseAuth';
import { saveOAuthUserData } from '../../services/firestoreService';
import { isFirebaseConfigured } from '../../config/firebase';
import { logger } from '../../services/secureLogger';
import { verificationService } from '../../api/services/verification';


interface OnboardingStep1Props {
  data: {
    fullName: string;
    email: string;
    phoneNumber: string;
    countryCode: string;
    password: string;
  };
  onUpdate: (data: any) => void;
  onNext: () => void;
  onOAuthSignup?: (email: string, displayName: string, uid: string, method: 'google' | 'apple') => void;
  onBackToLogin?: () => void;
}



export function OnboardingStep1Signup({ data, onUpdate, onNext, onOAuthSignup, onBackToLogin }: OnboardingStep1Props) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showUnauthorizedDomainError, setShowUnauthorizedDomainError] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  const handleBackToLogin = () => {
    localStorage.removeItem('therapistOnboardingData');
    localStorage.removeItem('therapistOnboardingStep');
    localStorage.removeItem('therapistOnboardingSessionId');
    localStorage.removeItem('therapistOnboardingEmail');

    if (onBackToLogin) {
      onBackToLogin();
    }
  };

  const validateForm = async () => {
    const newErrors: Record<string, string> = {};

    if (!data.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!data.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!data.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\d{10,15}$/.test(data.phoneNumber.replace(/\s/g, ''))) {
      newErrors.phoneNumber = 'Invalid phone number';
    }

    if (!data.password) {
      newErrors.password = 'Password is required';
    } else if (data.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    // Check for duplicates if basic validation passes
    if (!newErrors.email && !newErrors.phoneNumber) {
      setIsValidating(true);
      try {
        const duplicateCheck = await verificationService.checkDuplicateRegistration(
          data.email,
          data.phoneNumber
        );

        if (!duplicateCheck.success) {
          if (duplicateCheck.emailExists) {
            newErrors.email = 'This email address is already registered';
          }
          if (duplicateCheck.phoneExists) {
            newErrors.phoneNumber = 'This phone number is already registered';
          }
        }
      } catch (error) {
        console.error('Error checking duplicates:', error);
        // Don't block registration if duplicate check fails - log and continue
        logger.error('Duplicate check failed:', error);
      } finally {
        setIsValidating(false);
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);

    const isValid = await validateForm();
    if (isValid) {
      if (!isFirebaseConfigured) {
        alert('Firebase not configured. Please configure Firebase to use email sign-in.');
        setIsSubmitting(false);
        return;
      }

      try {
        const result = await createUserWithEmail(data.email, data.password);
        const { user } = result;

        onUpdate({
          fullName: data.fullName,
          email: user.email || data.email,
        });

        onNext();
      } catch (error: any) {
        logger.error('Email signup error:', error);
        alert(getAuthErrorMessage(error) || 'Email sign-in failed. Please try again.');
        setIsSubmitting(false);
      }
    }
  };

  const handleGoogleSignup = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    if (!isFirebaseConfigured) {
      alert('Firebase not configured. Please configure Firebase to use Google sign-in.');
      setIsSubmitting(false);
      return;
    }

    setShowUnauthorizedDomainError(false);

    try {
      const result = await signInWithGoogle();
      const { user, userProfile } = result;

      await saveOAuthUserData(
        user.uid,
        userProfile.email,
        userProfile.displayName,
        'google'
      );

      onUpdate({
        fullName: userProfile.displayName,
        email: userProfile.email,
      });

      if (onOAuthSignup) {
        onOAuthSignup(userProfile.email, userProfile.displayName, user.uid, 'google');
      } else {
        onNext();
      }
    } catch (error: any) {
      logger.error('Google signup error:', error);
      setIsSubmitting(false);

      if (error.code === 'auth/unauthorized-domain' || error.message?.includes('unauthorized-domain')) {
        setShowUnauthorizedDomainError(true);
      } else {
        alert(getAuthErrorMessage(error) || 'Google sign-in failed. Please try again.');
      }
    }
  };

  const handleAppleSignup = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    if (!isFirebaseConfigured) {
      alert('Firebase not configured. Please configure Firebase to use Apple sign-in.');
      setIsSubmitting(false);
      return;
    }

    setShowUnauthorizedDomainError(false);

    try {
      const result = await signInWithApple();
      const { user, userProfile } = result;

      await saveOAuthUserData(
        user.uid,
        userProfile.email,
        userProfile.displayName,
        'apple'
      );

      onUpdate({
        fullName: userProfile.displayName,
        email: userProfile.email,
      });

      if (onOAuthSignup) {
        onOAuthSignup(userProfile.email, userProfile.displayName, user.uid, 'apple');
      } else {
        onNext();
      }
    } catch (error: any) {
      logger.error('Apple signup error:', error);
      setIsSubmitting(false);

      if (error.code === 'auth/unauthorized-domain' || error.message?.includes('unauthorized-domain')) {
        setShowUnauthorizedDomainError(true);
      } else {
        alert(getAuthErrorMessage(error) || 'Apple sign-in failed. Please try again.');
      }
    }
  };



  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full max-w-md mx-auto px-6"
    >
      {showUnauthorizedDomainError && (
        <div className="mb-6">
          <UnauthorizedDomainAlert currentDomain={window.location.hostname} />
        </div>
      )}

      <div className="p-8 shadow-lg rounded-lg bg-white/80 backdrop-blur-md border border-gray-100">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12">
              <BedrockLogo variant="icon" className="w-full h-full" />
            </div>
          </div>
          <h1 className="text-3xl font-medium leading-8 text-gray-900 mb-2">Join as a Therapist</h1>
          <p className="text-sm text-muted-foreground">Create your professional account to get started</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name *</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="fullName"
                type="text"
                placeholder="Dr. Jane Smith"
                className={`pl-10 ${errors.fullName ? 'border-red-500' : ''}`}
                value={data.fullName}
                onChange={(e) => onUpdate({ fullName: e.target.value })}
                disabled={isSubmitting}
              />
            </div>
            {errors.fullName && <p className="text-xs text-red-500">{errors.fullName}</p>}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="jane.smith@example.com"
                className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                value={data.email}
                onChange={(e) => onUpdate({ email: e.target.value })}
                disabled={isSubmitting}
              />
            </div>
            {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
          </div>

          {/* Phone Number */}
          <PhoneInput
            label="Phone Number"
            value={data.phoneNumber}
            countryCode={data.countryCode}
            onChange={(phone, code, iso) => onUpdate({ phoneNumber: phone, countryCode: code, country: iso })} /* Added iso */
            error={errors.phoneNumber}
            required
            helperText={errors.phoneNumber || "We'll use this for verification"}
            disabled={isSubmitting}
          />

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">Password *</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="password"
                type="password"
                placeholder="Minimum 8 characters"
                className={`pl-10 ${errors.password ? 'border-red-500' : ''}`}
                value={data.password}
                onChange={(e) => onUpdate({ password: e.target.value })}
                disabled={isSubmitting}
              />
            </div>
            {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
          </div>

          {/* Continue Button */}
          <Button type="submit" disabled={isSubmitting || isValidating} className="w-full bg-[#F97316] hover:bg-[#ea580c] rounded-full">
            {isValidating ? 'Checking availability...' : isSubmitting ? 'Processing...' : 'Continue'}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <Separator />
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-xs text-gray-500">
            or sign up with
          </span>
        </div>

        {/* Social Login */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignup}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleAppleSignup}
          >
            <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
            </svg>
            Apple
          </Button>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <button
            type="button"
            onClick={handleBackToLogin}
            className="text-[#F97316] hover:underline font-medium bg-transparent border-0 cursor-pointer"
          >
            Log in
          </button>
        </p>
      </div>
    </motion.div>
  );
}