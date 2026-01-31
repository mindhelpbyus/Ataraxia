import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ParallaxAntiGravity } from './ui/parallax-anti-gravity';
import PixelSnow from './ui/PixelSnow';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { BedrockLogo } from '../imports/BedrockLogo';
import { Eye, EyeOff, Mail, Phone } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { Alert, AlertDescription } from "./ui/alert";
import illustrationImage from 'figma:asset/25680757734faa188ce1cb1feebb30b3ebb124bb.png';
import { authService } from '../api';
import { PhoneInput, validatePhoneNumber as validatePhone } from './PhoneInput';
import { Spotlight } from './ui/spotlight';

type LoginMode = 'email' | 'phone';

interface LoginPageProps {
  onLogin: (email: string, userName: string, role: 'therapist' | 'admin' | 'superadmin' | 'client', userId: string, onboardingStatus?: string, token?: string) => void;
  onRegisterTherapist?: () => void;
  onBackToHome?: () => void;
}

export function LoginPage({ onLogin, onRegisterTherapist }: LoginPageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loginMode, setLoginMode] = useState<LoginMode>('email');

  // Email state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isSignup, setIsSignup] = useState(false); // Used for phone and Google
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneCountryCode, setPhoneCountryCode] = useState('US');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  // Daily Quote
  const [dailyQuote, setDailyQuote] = useState<string>('');

  useEffect(() => {
    // Array of inspirational mental health quotes
    const quotes = [
      "Mental health is not a destination, but a process. It's about how you drive, not where you're going.",
      "Your mental health is a priority. Your happiness is essential. Your self-care is a necessity.",
      "It's okay to not be okay. It's okay to ask for help. You are not alone.",
      "Healing takes time, and asking for help is a courageous step.",
      "You don't have to be positive all the time. It's perfectly okay to feel sad, angry, annoyed, frustrated, scared, or anxious.",
      "Self-care is how you take your power back.",
      "There is hope, even when your brain tells you there isn't.",
      "Recovery is not one and done. It is a lifelong journey that takes place one day, one step at a time.",
      "You are stronger than you think, braver than you believe, and more loved than you know.",
      "Mental health needs a great deal of attention. It's the final taboo and it needs to be faced and dealt with.",
      "The only way out is through.",
      "You are not your illness. You have an individual story to tell. You have a name, a history, a personality.",
      "Sometimes the people around you won't understand your journey. They don't need to, it's not for them.",
      "What mental health needs is more sunlight, more candor, and more unashamed conversation.",
      "Courage doesn't always roar. Sometimes courage is the quiet voice at the end of the day saying, 'I will try again tomorrow.'",
      "You are allowed to be both a masterpiece and a work in progress simultaneously.",
      "Healing doesn't mean the damage never existed. It means the damage no longer controls our lives.",
      "Be patient with yourself. Self-growth is tender; it's holy ground.",
      "Your present circumstances don't determine where you can go; they merely determine where you start.",
      "The strongest people are not those who show strength in front of us, but those who win battles we know nothing about.",
      "Taking care of yourself doesn't mean me first, it means me too.",
      "You are not a burden. You have a burden, which by definition is too heavy to carry on your own.",
      "Mental health is just as important as physical health and deserves the same quality of support.",
      "Sometimes you need to step outside, get some air, and remind yourself of who you are and where you want to be.",
      "The most beautiful people we have known are those who have known defeat, known suffering, known struggle, known loss.",
      "You are not weak for struggling. You are strong for continuing.",
      "Vulnerability is not winning or losing; it's having the courage to show up and be seen when we have no control over the outcome.",
      "You don't have to control your thoughts. You just have to stop letting them control you.",
      "Growth is painful. Change is painful. But nothing is as painful as staying stuck somewhere you don't belong.",
      "The greatest glory in living lies not in never falling, but in rising every time we fall."
    ];

    // Get quote based on day of year (changes daily)
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);

    // Use day of year to select quote (cycles through all quotes)
    const quoteIndex = dayOfYear % quotes.length;
    setDailyQuote(quotes[quoteIndex]);
  }, []);



  // Switch Login Mode
  const switchToPhoneLogin = () => {
    setLoginMode('phone');
    setError(null);
  };

  const switchToEmailLogin = () => {
    setLoginMode('email');
    setError(null);
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast.error("Please enter your email address first");
      return;
    }

    try {
      // Call our backend to initiate password reset with Cognito
      // For now, show a message that this feature is coming soon
      toast.info("Password reset coming soon", {
        description: "Please contact support for password reset assistance."
      });
    } catch (error) {
      toast.error("Password reset failed. Please try again.");
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (!email || !password) {
        throw new Error('Please enter both email and password');
      }

      const response = await authService.login(email, password);

      // Defensive check for response structure
      if (!response || !response.user) {
        console.error('Invalid login response:', response);
        throw new Error('Invalid response from server. Please try again.');
      }

      // Option A: Check account_status (single source of truth)
      const accountStatus = response.user.account_status || 'active';

      // Map account_status to onboardingStatus for App.tsx routing
      let onboardingStatus = 'active';
      if (accountStatus === 'pending_verification' ||
        accountStatus === 'documents_review' ||
        accountStatus === 'background_check' ||
        accountStatus === 'onboarding_pending' ||
        accountStatus === 'registration_submitted' ||
        accountStatus === 'final_review' ||
        accountStatus === 'account_created') {
        onboardingStatus = 'pending';
      } else if (accountStatus === 'rejected') {
        onboardingStatus = 'rejected';
      } else if (accountStatus === 'suspended') {
        onboardingStatus = 'suspended';
      } else if (accountStatus === 'incomplete_registration' || accountStatus === 'draft') {
        onboardingStatus = 'incomplete';
      }

      onLogin(
        email,
        response.user.name || `${response.user.first_name || ''} ${response.user.last_name || ''}`.trim() || email,
        response.user.role as any,
        response.user.id,
        onboardingStatus,
        response.tokens?.accessToken || response.token
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (!otpSent) {
        if (!validatePhone(phoneNumber, phoneCountryCode)) {
          throw new Error('Please enter a valid phone number');
        }

        if (isSignup && (!firstName || !lastName)) {
          throw new Error('Please enter your name');
        }

        // Use Cognito Phone Auth via our backend
        const fullPhoneNumber = `${phoneCountryCode}${phoneNumber}`;

        // Call our backend to initiate phone auth
        // For now, we'll show a message that phone auth is coming soon
        toast.info("Phone authentication coming soon", {
          description: "Please use email login for now."
        });

        setLoginMode('email');
        return;

      } else {
        if (otp.length !== 6) {
          throw new Error('Please enter a valid 6-digit OTP');
        }

        // This would verify OTP with Cognito via our backend
        toast.success('Phone verified successfully!');
      }
    } catch (err: any) {
      console.error('Phone auth error:', err);
      setError(err.message || 'An error occurred');
      toast.error(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOTP = async () => {
    // Resend logic
    toast.success("OTP resent successfully");
  };

  return (
    <TooltipProvider>
      {/* Invisible reCAPTCHA container for Firebase Phone Auth */}
      <div id="recaptcha-container"></div>

      <div className="relative min-h-screen bg-background transition-colors duration-300 flex items-center justify-center p-4 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <ParallaxAntiGravity
            shapes={80}
            intensity={0.5}
            className="w-full h-full"
          >
            <></>
          </ParallaxAntiGravity>
        </div>

        {/* Content wrapper with higher z-index */}
        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">


          {/* Keep Spotlight for ambient center glow */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <Spotlight className="w-full h-full opacity-40 mix-blend-soft-light" fill="#ea580c" />
          </div>

          {/* Invisible Static Container */}
          <div className="w-full relative z-10 p-8 md:p-10 flex justify-center">
            <motion.div
              className="w-full"
              style={{
                maxWidth: '420px',
                width: '100%',
              }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              {/* Static Container (No Bobbing) */}
              <div className="space-y-8">
                {/* Header */}
                <div className="space-y-4 text-center">
                  <div className="flex justify-center mb-4">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex flex-col items-center justify-center gap-4">
                          <BedrockLogo variant="icon" size={72} />
                          <h1 className="text-3xl font-semibold text-foreground tracking-tight">Ataraxia</h1>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Ataraxia by Bedrock Health Solutions</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground italic max-w-xs mx-auto leading-relaxed">
                      "{dailyQuote}"
                    </p>
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-2">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={loginMode === 'email' ? handleEmailSubmit : handlePhoneSubmit} className="space-y-5">
                  {loginMode === 'email' ? (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="ml-1 text-xs uppercase tracking-wider text-muted-foreground font-semibold">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="hello@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          disabled={isLoading}
                          className="h-12 rounded-xl bg-background/50 border-transparent focus:border-primary/20 focus:bg-background transition-all text-foreground"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="password" className="ml-1 text-xs uppercase tracking-wider text-muted-foreground font-semibold">Password</Label>
                        <div className="relative">
                          <Input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={isLoading}
                            className="h-12 rounded-xl pr-10 bg-background/50 border-transparent focus:border-primary/20 focus:bg-background transition-all text-foreground"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-2 rounded-full hover:bg-muted/50 transition-colors"
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="text-right">
                        <button
                          type="button"
                          onClick={handleForgotPassword}
                          className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
                        >
                          Forgot Password?
                        </button>
                      </div>

                      <motion.div whileTap={{ scale: 0.98 }}>
                        <Button
                          type="submit"
                          className="w-full text-base font-bold h-12 rounded-2xl shadow-xl shadow-orange-500/20 active:scale-[0.98]"
                          style={{ backgroundColor: '#ea580c', color: '#ffffff' }}
                          disabled={isLoading}
                        >
                          {isLoading ? 'Signing in...' : 'Sign in'}
                        </Button>
                      </motion.div>
                    </>
                  ) : (
                    <>
                      {!otpSent ? (
                        <>
                          {isSignup && (
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-2">
                                <Label htmlFor="firstName">First Name</Label>
                                <Input
                                  id="firstName"
                                  type="text"
                                  placeholder="Jane"
                                  value={firstName}
                                  onChange={(e) => setFirstName(e.target.value)}
                                  required
                                  disabled={isLoading}
                                  className="h-11 bg-background/50 border-transparent text-foreground"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="lastName">Last Name</Label>
                                <Input
                                  id="lastName"
                                  type="text"
                                  placeholder="Doe"
                                  value={lastName}
                                  onChange={(e) => setLastName(e.target.value)}
                                  required
                                  disabled={isLoading}
                                  className="h-11 bg-background/50 border-transparent text-foreground"
                                />
                              </div>
                            </div>
                          )}

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

                          <div className="flex justify-center mt-4">
                            <Button
                              type="submit"
                              className="w-full font-bold h-12 rounded-2xl shadow-xl shadow-orange-500/20 active:scale-[0.98]"
                              style={{ backgroundColor: '#ea580c', color: '#ffffff' }}
                              disabled={isLoading}
                            >
                              {isLoading ? 'Sending OTP...' : 'Send OTP'}
                            </Button>
                          </div>

                          <div className="text-center text-sm mt-4">
                            {isSignup ? (
                              <span className="text-muted-foreground">
                                Already have an account?{' '}
                                <button
                                  type="button"
                                  onClick={() => setIsSignup(false)}
                                  className="text-foreground font-semibold hover:underline"
                                >
                                  Sign In
                                </button>
                              </span>
                            ) : (
                              <span className="text-muted-foreground">
                                New user?{' '}
                                <button
                                  type="button"
                                  onClick={() => setIsSignup(true)}
                                  className="text-foreground font-semibold hover:underline"
                                >
                                  Sign Up
                                </button>
                              </span>
                            )}
                          </div>
                        </>
                      ) : (
                        <div className="space-y-6">
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
                              Sent to {phoneNumber}
                            </p>
                          </div>

                          <div className="flex justify-center">
                            <Button
                              type="submit"
                              className="w-full font-bold h-12 rounded-2xl shadow-xl shadow-orange-500/20 active:scale-[0.98]"
                              style={{ backgroundColor: '#ea580c', color: '#ffffff' }}
                              disabled={isLoading}
                            >
                              {isLoading ? 'Verifying...' : 'Verify & Sign In'}
                            </Button>
                          </div>

                          <div className="flex justify-between text-xs text-muted-foreground px-2">
                            <button type="button" onClick={() => setOtpSent(false)} className="hover:text-foreground">Change Number</button>
                            <button type="button" onClick={handleSendOTP} className="hover:text-foreground">Resend Code</button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </form>

                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border/50" />
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
                    <span className="bg-card px-3 text-muted-foreground/60 font-semibold">Or continue with</span>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-3">

                  {loginMode === 'email' ? (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={switchToPhoneLogin}
                        className="w-full h-11 border-border/50 bg-background/30 hover:bg-background/80 text-foreground font-medium transition-all rounded-xl shadow-none hover:shadow-md flex items-center justify-center gap-3"
                      >
                        <Phone className="w-4 h-4 shrink-0" />
                        <span>Continue with Phone</span>
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        onClick={async () => {
                          // Google Sign-in with Cognito coming soon
                          toast.info("Google Sign-in coming soon", {
                            description: "Please use email login for now."
                          });
                        }}
                        className="w-full h-11 border-border/50 bg-background/30 hover:bg-background/80 text-foreground font-medium transition-all rounded-xl shadow-none hover:shadow-md flex items-center justify-center gap-3"
                      >
                        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none">
                          <path d="M23.7662 9.64963H22.7996V9.59983H11.9998V14.3998H18.7815C17.7921 17.1939 15.1335 19.1997 11.9998 19.1997C8.02366 19.1997 4.79992 15.9759 4.79992 11.9998C4.79992 8.02366 8.02366 4.79992 11.9998 4.79992C13.8352 4.79992 15.5049 5.49231 16.7763 6.62329L20.1705 3.22914C18.0273 1.23178 15.1605 0 11.9998 0C5.37291 0 0 5.37291 0 11.9998C0 18.6267 5.37291 23.9996 11.9998 23.9996C18.6267 23.9996 23.9996 18.6267 23.9996 11.9998C23.9996 11.1952 23.9168 10.4098 23.7662 9.64963Z" fill="#FFC107" />
                          <path d="M1.38279 6.41449L5.32532 9.30584C6.3921 6.66468 8.97566 4.79992 11.999 4.79992C13.8344 4.79992 15.5041 5.4923 16.7755 6.62328L20.1697 3.22914C18.0265 1.23178 15.1598 0 11.999 0C7.38989 0 3.39275 2.60215 1.38279 6.41449Z" fill="#FF3D00" />
                          <path d="M12 24C15.0995 24 17.9159 22.8138 20.0452 20.8849L16.3313 17.7421C15.0861 18.6891 13.5644 19.2013 12 19.2001C8.87883 19.2001 6.22868 17.2099 5.2303 14.4326L1.31716 17.4475C3.30313 21.3336 7.37626 24 12 24Z" fill="#4CAF50" />
                          <path d="M23.7662 9.64963H22.7996V9.59983H11.9998V14.3998H18.7815C18.3082 15.7296 17.4557 16.8916 16.3293 17.7423L16.3311 17.7411L20.0451 20.8838C19.7823 21.1226 23.9996 17.9997 23.9996 11.9998C23.9996 11.1952 23.9168 10.4098 23.7662 9.64963Z" fill="#1976D2" />
                        </svg>
                        <span>Continue with Google</span>
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        onClick={async () => {
                          // Apple Sign-in with Cognito coming soon
                          toast.info("Apple Sign-in coming soon", {
                            description: "Please use email login for now."
                          });
                        }}
                        className="w-full h-11 border-border/50 bg-background/30 hover:bg-background/80 text-foreground font-medium transition-all rounded-xl shadow-none hover:shadow-md flex items-center justify-center gap-3"
                      >
                        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none">
                          <path d="M17.05 20.28C16.03 21.23 14.96 21.08 13.93 20.63C12.83 20.17 11.83 20.15 10.68 20.63C9.26 21.23 8.46 21.04 7.55 20.28C2.24 14.97 3.02 6.96 8.96 6.68C10.35 6.75 11.31 7.44 12.11 7.5C13.35 7.23 14.54 6.52 15.87 6.61C17.48 6.74 18.7 7.39 19.47 8.56C16.12 10.55 16.94 15.15 20.03 16.43C19.42 18.02 18.61 19.59 17.04 20.29L17.05 20.28ZM12.03 6.64C11.89 4.27 13.75 2.35 15.98 2.19C16.27 4.91 13.51 6.9 12.03 6.64Z" fill="currentColor" />
                        </svg>
                        <span>Continue with Apple</span>
                      </Button>
                    </>

                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={switchToEmailLogin}
                      className="w-full h-11 rounded-xl bg-background/50 border-border/50"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Back to Email Login
                    </Button>
                  )}
                </div>

                {loginMode === 'email' && onRegisterTherapist && (
                  <div className="text-center text-sm mt-6">
                    <span className="text-muted-foreground">Don't have an account yet?</span>{' '}
                    <button
                      type="button"
                      onClick={onRegisterTherapist}
                      className="hover:underline font-bold transition-all"
                      style={{ color: '#ea580c' }}
                    >
                      Register for free
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}