import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Eye, EyeOff, Mail, ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription } from "../ui/alert";
import { firebaseGoogleAuth } from '../../api/auth';
import { RealAuthService as authService } from '../../api/auth';

interface TherapistGoogleRegistrationProps {
  onRegistrationComplete: (email: string, userName: string, role: 'therapist', userId: string, onboardingStatus: string, token: string) => void;
  onBackToLogin: () => void;
}

export function TherapistGoogleRegistration({ onRegistrationComplete, onBackToLogin }: TherapistGoogleRegistrationProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<'google' | 'details'>('google');

  // Google OAuth state
  const [googleUser, setGoogleUser] = useState<any>(null);
  const [idToken, setIdToken] = useState<string>('');

  // Step 1 details state (auto-populated from Google)
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [createPassword, setCreatePassword] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await firebaseGoogleAuth.signInWithPopup();

      if (result.user && result.idToken) {
        // Store Google user data
        setGoogleUser(result.user);
        setIdToken(result.idToken);

        // Auto-populate form fields from Google profile
        const displayName = result.user.displayName || '';
        const nameParts = displayName.split(' ');
        setFirstName(nameParts[0] || '');
        setLastName(nameParts.slice(1).join(' ') || '');
        setEmail(result.user.email || '');

        // Check if user already exists
        try {
          const userCheck = await authService.checkEmailPhoneExists(result.user.email);

          if (userCheck.exists) {
            // User already exists - show error
            setError('An account already exists with this email. Please try signing in instead.');
            return;
          }

          // User doesn't exist - proceed to Step 1 form
          setCurrentStep('details');
          toast.success('Google authentication successful! Please complete your profile.');

        } catch (checkError: any) {
          console.error('User existence check error:', checkError);
          // If check fails, proceed to form anyway
          setCurrentStep('details');
          toast.success('Google authentication successful! Please complete your profile.');
        }
      }
    } catch (err: any) {
      console.error('Google sign-in error:', err);

      // Handle specific Google OAuth errors
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign-in was cancelled');
      } else if (err.code === 'auth/popup-blocked') {
        setError('Popup was blocked. Please allow popups and try again.');
      } else if (err.code === 'auth/cancelled-popup-request') {
        setError('Another sign-in popup is already open');
      } else {
        setError(err.message || 'Google sign-in failed');
      }

      toast.error(err.message || 'Google sign-in failed');
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

      if (!idToken) {
        throw new Error('Google authentication expired. Please start over.');
      }

      // Call therapist Google registration endpoint
      const response = await authService.registerTherapistWithGoogle(
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

      if (err.message.includes('already exists')) {
        setError('An account with this email already exists. Please try signing in instead.');
      } else if (err.message.includes('constraint')) {
        setError('Account already exists. Please try signing in instead.');
      } else {
        setError(err.message || 'Registration failed');
      }

      toast.error(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-semibold text-foreground">
            {currentStep === 'google' && 'Therapist Registration'}
            {currentStep === 'details' && 'Complete Your Profile'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {currentStep === 'google' && 'Sign in with your Google account to get started'}
            {currentStep === 'details' && 'Basic Information'}
          </p>
        </div>

        {/* Back button */}
        <Button
          type="button"
          variant="ghost"
          onClick={currentStep === 'google' ? onBackToLogin : () => setCurrentStep('google')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          {currentStep === 'google' ? 'Back to Login' : 'Back'}
        </Button>

        {error && (
          <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-2">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Google OAuth Step */}
        {currentStep === 'google' && (
          <div className="space-y-4">
            <motion.div whileTap={{ scale: 0.98 }}>
              <Button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full h-12 border-border/50 bg-background/30 hover:bg-background/80 text-foreground font-medium transition-all rounded-xl shadow-none hover:shadow-md flex items-center justify-center gap-3"
                variant="outline"
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none">
                  <path d="M23.7662 9.64963H22.7996V9.59983H11.9998V14.3998H18.7815C17.7921 17.1939 15.1335 19.1997 11.9998 19.1997C8.02366 19.1997 4.79992 15.9759 4.79992 11.9998C4.79992 8.02366 8.02366 4.79992 11.9998 4.79992C13.8352 4.79992 15.5049 5.49231 16.7763 6.62329L20.1705 3.22914C18.0273 1.23178 15.1605 0 11.9998 0C5.37291 0 0 5.37291 0 11.9998C0 18.6267 5.37291 23.9996 11.9998 23.9996C18.6267 23.9996 23.9996 18.6267 23.9996 11.9998C23.9996 11.1952 23.9168 10.4098 23.7662 9.64963Z" fill="#FFC107" />
                  <path d="M1.38279 6.41449L5.32532 9.30584C6.3921 6.66468 8.97566 4.79992 11.999 4.79992C13.8344 4.79992 15.5041 5.4923 16.7755 6.62328L20.1697 3.22914C18.0265 1.23178 15.1598 0 11.999 0C7.38989 0 3.39275 2.60215 1.38279 6.41449Z" fill="#FF3D00" />
                  <path d="M12 24C15.0995 24 17.9159 22.8138 20.0452 20.8849L16.3313 17.7421C15.0861 18.6891 13.5644 19.2013 12 19.2001C8.87883 19.2001 6.22868 17.2099 5.2303 14.4326L1.31716 17.4475C3.30313 21.3336 7.37626 24 12 24Z" fill="#4CAF50" />
                  <path d="M23.7662 9.64963H22.7996V9.59983H11.9998V14.3998H18.7815C18.3082 15.7296 17.4557 16.8916 16.3293 17.7423L16.3311 17.7411L20.0451 20.8838C19.7823 21.1226 23.9996 17.9997 23.9996 11.9998C23.9996 11.1952 23.9168 10.4098 23.7662 9.64963Z" fill="#1976D2" />
                </svg>
                <span>{isLoading ? 'Signing in...' : 'Continue with Google'}</span>
              </Button>
            </motion.div>

            <p className="text-xs text-center text-muted-foreground">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        )}

        {/* Profile Details Step (Step 1 of Onboarding) */}
        {currentStep === 'details' && (
          <form onSubmit={handleCompleteRegistration} className="space-y-4">
            {/* Google account display (read-only) */}
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                Google Account (Verified)
              </Label>
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl">
                <Mail className="w-4 h-4 text-green-600" />
                <span className="text-green-800 font-medium">{email}</span>
              </div>
            </div>

            {/* Name fields (auto-populated from Google) */}
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

            {/* Email field (auto-populated from Google, editable) */}
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
              <p className="text-xs text-muted-foreground">
                Auto-populated from Google. You can edit if needed.
              </p>
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
                  Create a password (optional - you can always use Google login)
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
                {isLoading ? 'Creating Account...' : 'Complete Registration'}
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