import React, { useState, useRef, useEffect } from 'react';
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
import { createUserWithEmailAndPassword, getAuthSystemInfo } from '../../services/authService';
import { logger } from '../../services/secureLogger';
import { validatePasswordSecurity, generateSecurePassword } from '../../utils/passwordSecurity';

// Cognito configuration check
const isCognitoConfigured = () => {
  const authInfo = getAuthSystemInfo();
  return authInfo.cognitoConfigured && authInfo.provider === 'cognito';
};

// Cognito error message handler
const getCognitoErrorMessage = (error: any): string => {
  if (error.message?.includes('UsernameExistsException') || error.message?.includes('already registered')) {
    return 'This email address is already registered. Please use a different email or try logging in.';
  } else if (error.message?.includes('InvalidPasswordException') || error.message?.includes('security requirements')) {
    return 'Password does not meet security requirements. Please choose a stronger password.';
  } else if (error.message?.includes('InvalidParameterException') || error.message?.includes('Invalid email')) {
    return 'Invalid email format. Please check your email address.';
  } else if (error.message?.includes('NotAuthorizedException')) {
    return 'Authentication failed. Please check your credentials.';
  } else if (error.message?.includes('UserNotFoundException')) {
    return 'User not found. Please check your email address.';
  } else if (error.message?.includes('CodeMismatchException')) {
    return 'Invalid verification code. Please try again.';
  } else if (error.message?.includes('ExpiredCodeException')) {
    return 'Verification code has expired. Please request a new one.';
  } else if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred. Please try again.';
};

// Save OAuth user data (for future Google/Apple integration)
const saveOAuthUserData = async (uid: string, email: string, displayName: string, method: 'google' | 'apple') => {
  try {
    // Store OAuth user data in localStorage for now
    const oauthData = {
      uid,
      email,
      displayName,
      method,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('oauthUserData', JSON.stringify(oauthData));
    logger.info(`OAuth user data saved for ${method}:`, { uid, email, displayName });
  } catch (error) {
    logger.error('Failed to save OAuth user data:', error);
  }
};

// Phone number authentication with Cognito
const sendPhoneVerificationCode = async (phoneNumber: string, countryCode: string) => {
  try {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3010';

    const response = await fetch(`${API_BASE_URL}/api/auth/phone/send-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        phoneNumber,
        countryCode
      })
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to send verification code');
    }

    return result;
  } catch (error) {
    logger.error('Phone verification code sending failed:', error);
    throw error;
  }
};

const verifyPhoneCode = async (phoneNumber: string, code: string) => {
  try {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3010';

    const response = await fetch(`${API_BASE_URL}/api/auth/phone/verify-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        phoneNumber,
        code
      })
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Phone verification failed');
    }

    return result;
  } catch (error) {
    logger.error('Phone verification failed:', error);
    throw error;
  }
};

// Google Sign-in with Cognito - REAL IMPLEMENTATION
// Google Sign-in with OAuth2 Popup (Correct for Custom Buttons)
const signInWithGoogle = async () => {
  try {
    // Check for Client ID
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId || clientId.includes('1234567890')) {
      alert('Missing Google Client ID! Please add VITE_GOOGLE_CLIENT_ID to your .env file.');
      throw new Error('Google Client ID not configured.');
    }

    // Load Google Identity Services
    if (!window.google) {
      throw new Error('Google Identity Services not loaded.');
    }

    return new Promise((resolve, reject) => {
      try {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: 'email profile openid',
          callback: async (tokenResponse: any) => {
            if (tokenResponse && tokenResponse.access_token) {
              try {
                // 1. Fetch User Info from Google using the Access Token
                const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                  headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
                });
                const userInfo = await userInfoResponse.json();

                // 2. Send to Backend for Session Creation
                const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3010';

                // We send the access token so the backend can verify it if needed, 
                // or we trust the frontend fetch (less secure, but OK for dev pending backend implementation).
                // Ideally, backend should verify.
                const authResponse = await fetch(`${API_BASE_URL}/api/auth/google`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    accessToken: tokenResponse.access_token,
                    email: userInfo.email,
                    googleId: userInfo.sub,
                    firstName: userInfo.given_name,
                    lastName: userInfo.family_name,
                    photoUrl: userInfo.picture
                  })
                });

                const result = await authResponse.json();

                if (!authResponse.ok) {
                  throw new Error(result.message || 'Google sign-in failed on server');
                }

                if (result.token) {
                  localStorage.setItem('authToken', result.token);
                }

                resolve({
                  user: {
                    uid: result.user?.auth_provider_id || result.userId || userInfo.sub,
                    email: result.user?.email || result.email || userInfo.email,
                    displayName: result.user?.name || userInfo.name
                  },
                  userProfile: {
                    email: userInfo.email,
                    displayName: userInfo.name,
                    firstName: userInfo.given_name,
                    lastName: userInfo.family_name
                  }
                });
              } catch (err) {
                reject(err);
              }
            } else {
              reject(new Error('No access token received from Google'));
            }
          },
          error_callback: (err: any) => {
            console.error('Google Auth Error:', err);
            reject(err);
          }
        });

        // Trigger Popup
        client.requestAccessToken();

      } catch (err) {
        reject(err);
      }
    });
  } catch (error) {
    logger.error('Google sign-in failed:', error);
    throw error;
  }
};



// Create user with email using Cognito
const createUserWithEmail = async (email: string, password: string, additionalData?: any) => {
  try {
    const result = await createUserWithEmailAndPassword(email, password, additionalData);
    return result;
  } catch (error) {
    logger.error('Cognito user creation failed:', error);
    throw error;
  }
};


interface OnboardingStep1Props {
  data: {
    firstName: string;
    lastName: string;
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const validationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }
    };
  }, []);

  // Generate secure password
  const handleGeneratePassword = () => {
    const newPassword = generateSecurePassword(16); // Generate 16-character password
    onUpdate({ password: newPassword });
    clearError('password');
    // Trigger validation for the new password
    debouncedValidateField('password', newPassword);
  };

  // Clear specific error when user starts typing
  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Debounced validation to prevent too many API calls
  const debouncedValidateField = (field: string, value: string) => {
    // Clear any existing timeout
    if (validationTimeoutRef.current) {
      clearTimeout(validationTimeoutRef.current);
    }

    // Set a new timeout for validation
    validationTimeoutRef.current = setTimeout(() => {
      validateField(field, value);
    }, 500); // 500ms delay
  };

  // Real-time field validation on blur
  const validateField = async (field: string, value: string) => {
    // Clear any existing error for this field first
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });

    const newErrors: Record<string, string> = {};

    switch (field) {
      case 'email':
        if (!value.trim()) {
          newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.email = 'Invalid email format';
        }
        // Note: Removed duplicate check for now since we don't have the verification service
        break;

      case 'phoneNumber':
        if (!value.trim()) {
          newErrors.phoneNumber = 'Phone number is required';
        } else if (!/^\d{10,15}$/.test(value.replace(/\s/g, ''))) {
          newErrors.phoneNumber = 'Invalid phone number';
        }
        // Note: Removed duplicate check for now since we don't have the verification service
        break;

      case 'password':
        if (!value) {
          newErrors.password = 'Password is required';
        } else if (value.length < 12) {
          newErrors.password = 'Password must be at least 12 characters long';
        } else if (value.length > 128) {
          newErrors.password = 'Password must be no more than 128 characters long';
        } else {
          // Enhanced password security validation
          try {
            setIsValidating(true);
            const passwordValidation = await validatePasswordSecurity(value);
            if (!passwordValidation.valid) {
              newErrors.password = passwordValidation.errors[0];
            }
          } catch (error) {
            console.error('Password validation error:', error);
            // Don't show error to user for network issues
          } finally {
            setIsValidating(false);
          }
        }
        break;

      case 'firstName':
        if (!value.trim()) {
          newErrors.firstName = 'First name is required';
        }
        break;

      case 'lastName':
        if (!value.trim()) {
          newErrors.lastName = 'Last name is required';
        }
        break;
    }

    // Update errors for this specific field only
    if (Object.keys(newErrors).length > 0) {
      setErrors(prev => ({
        ...prev,
        ...newErrors
      }));
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleBackToLogin = () => {
    localStorage.removeItem('therapistOnboardingData');
    localStorage.removeItem('therapistOnboardingStep');
    localStorage.removeItem('therapistOnboardingSessionId');
    localStorage.removeItem('therapistOnboardingEmail');

    if (onBackToLogin) {
      onBackToLogin();
    }
  };

  const validateForm = () => {
    // Simple validation - just check if required fields are filled and no errors exist
    const requiredFields = ['firstName', 'lastName', 'email', 'phoneNumber', 'password'];
    const missingFields = requiredFields.filter(field => !data[field as keyof typeof data]?.trim());

    if (missingFields.length > 0) {
      const newErrors: Record<string, string> = {};
      missingFields.forEach(field => {
        const fieldName = field === 'firstName' ? 'first name' :
          field === 'lastName' ? 'last name' :
            field.replace(/([A-Z])/g, ' $1').toLowerCase();
        newErrors[field] = `${fieldName} is required`;
      });
      setErrors(prev => ({ ...prev, ...newErrors }));
      return false;
    }

    // Check if there are any existing validation errors
    const hasErrors = Object.keys(errors).length > 0;
    return !hasErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || isValidating) return;

    // Simple validation check
    const isValid = validateForm();
    if (!isValid) {
      return;
    }

    setIsSubmitting(true);

    if (!isCognitoConfigured()) {
      alert('Cognito authentication is not configured. Please contact support.');
      setIsSubmitting(false);
      return;
    }

    try {
      console.log('🔐 Creating Cognito user with:', {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber,
        countryCode: data.countryCode
      });

      // Create user with Cognito via our authService
      const result = await createUserWithEmail(data.email, data.password, {
        firstName: data.firstName,
        lastName: data.lastName,
        role: 'therapist',
        phoneNumber: data.phoneNumber,
        countryCode: data.countryCode
      });

      const { user } = result;
      logger.info('✅ Cognito user created successfully:', user.uid);

      // Update onboarding data with user info
      onUpdate({
        email: user.email || data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber,
        countryCode: data.countryCode,
        firebaseUid: user.uid,
        authMethod: 'email'
      });

      // Move to next step
      onNext();
    } catch (error: any) {
      logger.error('❌ Cognito signup error:', error);
      alert(getCognitoErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignup = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    if (!isCognitoConfigured()) {
      alert('Cognito authentication is not configured. Please contact support.');
      setIsSubmitting(false);
      return;
    }

    setShowUnauthorizedDomainError(false);

    try {
      console.log('🔐 Starting Google Sign-in with Cognito...');
      const result = await signInWithGoogle();
      const { user, userProfile } = result;

      await saveOAuthUserData(
        user.uid,
        userProfile.email,
        userProfile.displayName,
        'google'
      );

      onUpdate({
        firstName: userProfile.firstName || userProfile.displayName?.split(' ')[0] || '',
        lastName: userProfile.lastName || userProfile.displayName?.split(' ').slice(1).join(' ') || '',
        email: userProfile.email,
        authMethod: 'google',
        firebaseUid: user.uid
      });

      logger.info('✅ Google sign-in successful:', user.uid);

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
        alert(getCognitoErrorMessage(error));
      }
    }
  };





  const handlePhoneSignup = async () => {
    // Logic for phone signup (e.g., OTP modal or focus phone field)
    console.log('Phone signup clicked');
    // For now, we might just want to focus the phone input or trigger a specific flow
    document.getElementById('phoneNumber')?.focus();
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
          {/* First Name */}
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name *</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="firstName"
                type="text"
                placeholder="John"
                className={`pl-10 ${errors.firstName ? 'border-red-500' : ''}`}
                value={data.firstName || ''}
                onChange={(e) => {
                  onUpdate({ firstName: e.target.value });
                  clearError('firstName');
                }}
                onBlur={(e) => {
                  const field = 'firstName';
                  const value = e.target.value;
                  // Immediate validation for non-API fields
                  validateField(field, value);
                }}
                disabled={isSubmitting}
              />
            </div>
            {errors.firstName && <p className="text-xs text-red-500">{errors.firstName}</p>}
          </div>

          {/* Last Name */}
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name *</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="lastName"
                type="text"
                placeholder="Smith"
                className={`pl-10 ${errors.lastName ? 'border-red-500' : ''}`}
                value={data.lastName || ''}
                onChange={(e) => {
                  onUpdate({ lastName: e.target.value });
                  clearError('lastName');
                }}
                onBlur={(e) => {
                  const field = 'lastName';
                  const value = e.target.value;
                  // Immediate validation for non-API fields
                  validateField(field, value);
                }}
                disabled={isSubmitting}
              />
            </div>
            {errors.lastName && <p className="text-xs text-red-500">{errors.lastName}</p>}
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
                value={data.email || ''}
                onChange={(e) => {
                  onUpdate({ email: e.target.value });
                  clearError('email');
                }}
                onBlur={(e) => {
                  const field = 'email';
                  const value = e.target.value;
                  // Debounced validation for API fields
                  debouncedValidateField(field, value);
                }}
                disabled={isSubmitting}
              />
              {isValidating && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-orange-500 rounded-full animate-spin"></div>
                </div>
              )}
            </div>
            {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
          </div>

          {/* Phone Number */}
          <PhoneInput
            label="Phone Number"
            value={data.phoneNumber || ''}
            countryCode={data.countryCode || '+91'}
            onChange={(phone, code, iso) => {
              console.log('🔍 DEBUG: PhoneInput onChange called:', { phone, code, iso });
              onUpdate({ phoneNumber: phone, countryCode: code, country: iso });
              clearError('phoneNumber');
            }}
            onBlur={(phone) => {
              // Debounced validation for API fields
              debouncedValidateField('phoneNumber', phone);
            }}
            error={errors.phoneNumber}
            required
            helperText={errors.phoneNumber || (isValidating ? "Checking availability..." : "We'll use this for verification")}
            disabled={isSubmitting}
          />

          {/* Password */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password *</Label>
              <button
                type="button"
                onClick={handleGeneratePassword}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors"
                disabled={isSubmitting}
              >
                Generate Secure Password
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Minimum 12 characters"
                className={`pl-10 pr-20 ${errors.password ? 'border-red-500' : ''}`}
                value={data.password || ''}
                onChange={(e) => {
                  onUpdate({ password: e.target.value });
                  clearError('password');
                }}
                onBlur={(e) => {
                  const field = 'password';
                  const value = e.target.value;
                  // Debounced validation for password (API call for breach check)
                  debouncedValidateField(field, value);
                }}
                disabled={isSubmitting}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                {isValidating && (
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-orange-500 rounded-full animate-spin"></div>
                )}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={isSubmitting}
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Password Requirements - Simplified */}
            <div className="text-xs text-gray-600 space-y-2">
              <div className="flex items-center justify-between">
                <span className={`${(data.password || '').length >= 12 ? 'text-green-600' : 'text-gray-500'}`}>
                  ✓ At least 12 characters ({(data.password || '').length}/128)
                </span>
                {(data.password || '').length >= 12 && (
                  <span className="text-green-600 text-xs">✓ Good</span>
                )}
              </div>

              {/* Show generated password warning */}
              {data.password && data.password.length === 16 && /[A-Z]/.test(data.password) && /[a-z]/.test(data.password) && /[0-9]/.test(data.password) && /[^a-zA-Z0-9]/.test(data.password) && (
                <div className="p-2 bg-amber-50 border border-amber-200 rounded text-amber-800">
                  <p className="text-xs font-medium">⚠️ Save this generated password!</p>
                  <p className="text-xs">Copy it to your password manager or write it down securely before continuing.</p>
                </div>
              )}

              <p className="text-xs text-blue-600">
                💡 Tip: Use a memorable passphrase or click "Generate Secure Password" above
              </p>
            </div>

            {errors.password && <p className="text-xs text-red-500 font-medium">{errors.password}</p>}
          </div>

          {/* Continue Button */}
          <Button type="submit" disabled={isSubmitting || isValidating} className="w-full bg-[#F97316] hover:bg-[#ea580c] rounded-full">
            {isValidating ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Validating...
              </div>
            ) : isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Processing...
              </div>
            ) : (
              'Continue'
            )}
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
            onClick={handlePhoneSignup}
          >
            <Phone className="mr-2 h-4 w-4" />
            Phone
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