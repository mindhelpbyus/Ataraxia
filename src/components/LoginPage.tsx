import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ParallaxAntiGravity } from './ui/parallax-anti-gravity';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { BedrockLogo } from '../imports/BedrockLogo';
import { Eye, EyeOff, Mail, Phone, Sparkles, ChevronRight } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { Alert, AlertDescription } from "./ui/alert";
import { verifyPhoneOtp, getGoogleOAuthUrl, sendPhoneOtp } from '../api/auth';
import { PhoneInput, validatePhoneNumber as validatePhone } from './PhoneInput';
import { Spotlight } from './ui/spotlight';
import { tryMockLogin, MOCK_USERS } from '../lib/devMockUser';
import type { AuthUser } from '../api/auth';
import { useNavigate } from 'react-router-dom';

type LoginMode = 'email' | 'phone';

interface LoginPageProps {
  onLogin: (user: AuthUser) => void;
  onRegisterTherapist?: () => void;
  onBackToHome?: () => void;
}

const QUOTES = [
  "Mental health is not a destination, but a process. It's about how you drive, not where you're going.",
  "Your mental health is a priority. Your happiness is essential. Your self-care is a necessity.",
  "It's okay to not be okay. It's okay to ask for help. You are not alone.",
  "Healing takes time, and asking for help is a courageous step.",
  "You don't have to be positive all the time. It's perfectly okay to feel sad, angry, or anxious.",
  "Self-care is how you take your power back.",
  "There is hope, even when your brain tells you there isn't.",
  "Recovery is a lifelong journey that takes place one day, one step at a time.",
  "You are stronger than you think, braver than you believe, and more loved than you know.",
  "Courage doesn't always roar. Sometimes courage is the quiet voice saying, 'I will try again tomorrow.'",
  "You are allowed to be both a masterpiece and a work in progress simultaneously.",
  "Healing doesn't mean the damage never existed. It means the damage no longer controls our lives.",
  "Be patient with yourself. Self-growth is tender; it's holy ground.",
  "The strongest people are not those who show strength in front of us, but those who win battles we know nothing about.",
];

const DEV_MODE = import.meta.env.DEV;

export function LoginPage({ onLogin, onRegisterTherapist }: LoginPageProps) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loginMode, setLoginMode] = useState<LoginMode>('email');
  const [showDevPanel, setShowDevPanel] = useState(false);

  // Email state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Phone state
  const [isSignup, setIsSignup] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneCountryCode, setPhoneCountryCode] = useState('US');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<any>(null);

  // Quote of the day
  const [dailyQuote, setDailyQuote] = useState('');
  useEffect(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const dayOfYear = Math.floor((now.getTime() - start.getTime()) / 86400000);
    setDailyQuote(QUOTES[dayOfYear % QUOTES.length]);
  }, []);

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const handleRegister = () => {
    if (onRegisterTherapist) {
      onRegisterTherapist();
    } else {
      navigate('/register');
    }
  };

  const handleForgotPassword = () => {
    if (!email) { toast.error('Please enter your email address first'); return; }
    toast.info('Password reset coming soon', { description: 'Please contact support for password reset assistance.' });
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (!email || !password) throw new Error('Please enter both email and password');

      // ─── Dev mock login bypass ──────────────────────────────────────────
      if (DEV_MODE) {
        const mockUser = tryMockLogin(email, password);
        if (mockUser) {
          await new Promise(r => setTimeout(r, 400)); // simulate network
          toast.success(`Signed in as ${mockUser.name} (mock)`, { icon: '🌿' });
          onLogin(mockUser);
          return;
        }
      }

      // ─── Real backend login ─────────────────────────────────────────────
      const { login: loginFn } = await import('../api/auth');
      const user = await loginFn(email, password);
      onLogin(user);
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
        if (!validatePhone(phoneNumber, phoneCountryCode)) throw new Error('Please enter a valid phone number');
        if (isSignup && (!firstName || !lastName)) throw new Error('Please enter your name');
        const fullPhoneNumber = `+${phoneCountryCode}${phoneNumber}`;
        const { sessionId } = await sendPhoneOtp(fullPhoneNumber);
        setConfirmationResult(sessionId);
        setOtpSent(true);
        toast.success('Verification code sent to your phone');
      } else {
        if (otp.length !== 6) throw new Error('Please enter a valid 6-digit OTP');
        const user = await verifyPhoneOtp(confirmationResult as string, otp);
        onLogin(user);
      }
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { url } = await getGoogleOAuthUrl();
      window.location.href = url;
    } catch (err) {
      const e = err as { message?: string };
      setError(e.message || 'Google sign-in failed');
      toast.error(e.message || 'Google sign-in failed');
      setIsLoading(false);
    }
  };

  const handleMockLogin = async (mockEmail: string) => {
    setEmail(mockEmail);
    setPassword(MOCK_USERS[mockEmail].password);
    setIsLoading(true);
    setError(null);
    await new Promise(r => setTimeout(r, 500));
    const mockUser = MOCK_USERS[mockEmail].user;
    toast.success(`Signed in as ${mockUser.name}`, { icon: '🌿' });
    onLogin(mockUser);
    setIsLoading(false);
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <TooltipProvider>
      <div id="recaptcha-container" />

      <div className="relative min-h-screen bg-canvas transition-colors duration-300 flex items-center justify-center p-4 overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 z-0">
          <ParallaxAntiGravity shapes={60} intensity={0.4} className="w-full h-full">
            <></>
          </ParallaxAntiGravity>
        </div>

        {/* Sage-green ambient glow */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <Spotlight className="w-full h-full opacity-30 mix-blend-soft-light" fill="#1E7048" />
        </div>

        {/* Main content */}
        <div className="relative z-10 w-full flex flex-col items-center justify-center">
          <div className="w-full max-w-md px-4 py-8">
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-7"
            >
              {/* ─── Header ─────────────────────────────────────────────── */}
              <div className="text-center space-y-4">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex flex-col items-center gap-3 cursor-default">
                      <BedrockLogo variant="icon" size={68} />
                      <h1
                        className="text-4xl tracking-tight"
                        style={{ fontFamily: 'var(--font-display)', fontWeight: 500, color: 'var(--ink)', letterSpacing: '-0.03em' }}
                      >
                        Ataraxia
                      </h1>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p className="text-xs">by Bedrock Health Solutions</p>
                  </TooltipContent>
                </Tooltip>

                {dailyQuote && (
                  <p
                    className="text-sm italic leading-relaxed max-w-xs mx-auto"
                    style={{ color: 'var(--muted-text)', fontFamily: 'var(--font-display)', fontWeight: 400 }}
                  >
                    "{dailyQuote}"
                  </p>
                )}
              </div>

              {/* ─── Error ──────────────────────────────────────────────── */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ─── Dev Panel ──────────────────────────────────────────── */}
              {DEV_MODE && (
                <div className="rounded-2xl border border-dashed overflow-hidden" style={{ borderColor: 'var(--action-border)', background: 'var(--action-light)' }}>
                  <button
                    type="button"
                    onClick={() => setShowDevPanel(v => !v)}
                    className="w-full flex items-center justify-between px-4 py-3 text-xs font-bold uppercase tracking-widest transition-colors"
                    style={{ color: 'var(--action)', background: 'transparent' }}
                  >
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5" />
                      Dev Quick Login
                    </span>
                    <ChevronRight
                      className="w-3.5 h-3.5 transition-transform"
                      style={{ transform: showDevPanel ? 'rotate(90deg)' : 'none' }}
                    />
                  </button>
                  <AnimatePresence>
                    {showDevPanel && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 pt-1 grid gap-2">
                          {Object.entries(MOCK_USERS).map(([mockEmail, { label }]) => (
                            <button
                              key={mockEmail}
                              type="button"
                              onClick={() => handleMockLogin(mockEmail)}
                              disabled={isLoading}
                              className="flex items-center gap-3 text-left px-3 py-2.5 rounded-xl border text-sm font-medium transition-all active:scale-[0.98]"
                              style={{
                                background: 'var(--surface)',
                                borderColor: 'var(--action-border)',
                                color: 'var(--ink)',
                              }}
                            >
                              <span className="flex-1">{label}</span>
                              <ChevronRight className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--muted-text)' }} />
                            </button>
                          ))}
                          <p className="text-[10px] leading-relaxed mt-1" style={{ color: 'var(--muted-text)' }}>
                            These mock accounts only exist in development mode and are stripped from production builds.
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* ─── Form ───────────────────────────────────────────────── */}
              <form onSubmit={loginMode === 'email' ? handleEmailSubmit : handlePhoneSubmit} className="space-y-5">
                {loginMode === 'email' ? (
                  <>
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="email"
                        className="ml-1 text-[10px] uppercase tracking-widest font-bold"
                        style={{ color: 'var(--muted-text)' }}
                      >
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="hello@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isLoading}
                        className="h-12 rounded-xl transition-all"
                        style={{
                          background: 'var(--surface)',
                          borderColor: 'var(--rule)',
                          color: 'var(--ink)',
                        }}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label
                        htmlFor="password"
                        className="ml-1 text-[10px] uppercase tracking-widest font-bold"
                        style={{ color: 'var(--muted-text)' }}
                      >
                        Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          disabled={isLoading}
                          className="h-12 rounded-xl pr-10 transition-all"
                          style={{
                            background: 'var(--surface)',
                            borderColor: 'var(--rule)',
                            color: 'var(--ink)',
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full transition-colors"
                          style={{ color: 'var(--muted-text)' }}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="text-right">
                      <button
                        type="button"
                        onClick={handleForgotPassword}
                        className="text-xs font-semibold transition-colors hover:opacity-80"
                        style={{ color: 'var(--action)' }}
                      >
                        Forgot password?
                      </button>
                    </div>

                    <motion.div whileTap={{ scale: 0.98 }}>
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-12 rounded-2xl text-base font-bold text-white transition-all"
                        style={{
                          background: isLoading ? 'var(--action-dark)' : 'var(--action)',
                          boxShadow: 'var(--shadow-action)',
                        }}
                      >
                        {isLoading ? 'Signing in…' : 'Sign in'}
                      </Button>
                    </motion.div>
                  </>
                ) : (
                  <>
                    {!otpSent ? (
                      <>
                        {isSignup && (
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                              <Label htmlFor="firstName" style={{ color: 'var(--muted-text)' }}>First Name</Label>
                              <Input id="firstName" type="text" placeholder="Jane" value={firstName} onChange={e => setFirstName(e.target.value)} required disabled={isLoading} className="h-11 rounded-xl" style={{ background: 'var(--surface)', borderColor: 'var(--rule)', color: 'var(--ink)' }} />
                            </div>
                            <div className="space-y-1.5">
                              <Label htmlFor="lastName" style={{ color: 'var(--muted-text)' }}>Last Name</Label>
                              <Input id="lastName" type="text" placeholder="Doe" value={lastName} onChange={e => setLastName(e.target.value)} required disabled={isLoading} className="h-11 rounded-xl" style={{ background: 'var(--surface)', borderColor: 'var(--rule)', color: 'var(--ink)' }} />
                            </div>
                          </div>
                        )}
                        <PhoneInput
                          value={phoneNumber}
                          countryCode={phoneCountryCode}
                          onChange={(phone, code) => { setPhoneNumber(phone); setPhoneCountryCode(code); }}
                          label="Phone Number"
                          required
                          disabled={isLoading}
                        />
                        <motion.div whileTap={{ scale: 0.98 }}>
                          <Button type="submit" disabled={isLoading} className="w-full h-12 rounded-2xl font-bold text-white"
                            style={{ background: 'var(--action)', boxShadow: 'var(--shadow-action)' }}>
                            {isLoading ? 'Sending…' : 'Send OTP'}
                          </Button>
                        </motion.div>
                        <div className="text-center text-sm">
                          {isSignup ? (
                            <span style={{ color: 'var(--muted-text)' }}>
                              Already have an account?{' '}
                              <button type="button" onClick={() => setIsSignup(false)} className="font-bold hover:underline" style={{ color: 'var(--action)' }}>Sign In</button>
                            </span>
                          ) : (
                            <span style={{ color: 'var(--muted-text)' }}>
                              New user?{' '}
                              <button type="button" onClick={() => setIsSignup(true)} className="font-bold hover:underline" style={{ color: 'var(--action)' }}>Sign Up</button>
                            </span>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="space-y-6">
                        <div className="space-y-2 text-center">
                          <Label htmlFor="otp" style={{ color: 'var(--muted-text)' }}>Verification Code</Label>
                          <Input
                            id="otp"
                            type="text"
                            placeholder="000 000"
                            value={otp}
                            onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            required
                            disabled={isLoading}
                            maxLength={6}
                            className="text-center text-2xl tracking-[0.5em] font-mono h-14 rounded-xl"
                            style={{ background: 'var(--surface)', borderColor: 'var(--rule)', color: 'var(--ink)' }}
                          />
                          <p className="text-xs" style={{ color: 'var(--muted-text)' }}>Sent to {phoneNumber}</p>
                        </div>
                        <motion.div whileTap={{ scale: 0.98 }}>
                          <Button type="submit" disabled={isLoading} className="w-full h-12 rounded-2xl font-bold text-white"
                            style={{ background: 'var(--action)', boxShadow: 'var(--shadow-action)' }}>
                            {isLoading ? 'Verifying…' : 'Verify & Sign In'}
                          </Button>
                        </motion.div>
                        <div className="flex justify-between text-xs px-2" style={{ color: 'var(--muted-text)' }}>
                          <button type="button" onClick={() => setOtpSent(false)} className="hover:underline">Change Number</button>
                          <button type="button" onClick={async () => {
                            const fp = `+${phoneCountryCode}${phoneNumber}`;
                            const { sessionId } = await sendPhoneOtp(fp);
                            setConfirmationResult(sessionId);
                            toast.success('OTP resent');
                          }} className="hover:underline">Resend Code</button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </form>

              {/* ─── Divider + Social ────────────────────────────────────── */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" style={{ borderColor: 'var(--rule)' }} />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
                  <span className="px-3 font-semibold" style={{ background: 'var(--canvas)', color: 'var(--dim)' }}>
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {loginMode === 'email' ? (
                  <>
                    <SocialButton onClick={() => { setLoginMode('phone'); setError(null); }} icon={<Phone className="w-4 h-4" />} label="Continue with Phone" />
                    <SocialButton onClick={handleGoogleSignIn} disabled={isLoading} icon={<GoogleIcon />} label={isLoading ? 'Signing in…' : 'Continue with Google'} />
                    <SocialButton onClick={() => toast.info('Apple Sign-in coming soon', { description: 'Please use email login for now.' })} icon={<AppleIcon />} label="Continue with Apple" />
                  </>
                ) : (
                  <SocialButton onClick={() => { setLoginMode('email'); setError(null); }} icon={<Mail className="w-4 h-4" />} label="Back to Email Login" />
                )}
              </div>

              {/* ─── Register CTA ────────────────────────────────────────── */}
              {loginMode === 'email' && (
                <div className="text-center text-sm pt-2">
                  <span style={{ color: 'var(--muted-text)' }}>Don't have an account? </span>
                  <button
                    type="button"
                    onClick={handleRegister}
                    className="font-bold transition-all hover:opacity-80 hover:underline underline-offset-2"
                    style={{ color: 'var(--action)' }}
                  >
                    Register for free →
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function SocialButton({
  onClick, icon, label, disabled = false,
}: { onClick: () => void; icon: React.ReactNode; label: string; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full h-11 flex items-center justify-center gap-3 rounded-xl border font-medium text-sm transition-all hover:shadow-md active:scale-[0.98] disabled:opacity-60"
      style={{
        background: 'var(--surface)',
        borderColor: 'var(--rule)',
        color: 'var(--ink)',
      }}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function GoogleIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none">
      <path d="M23.766 9.65h-1v-.05H12v4.8h6.782C17.792 17.194 15.133 19.2 12 19.2c-3.976 0-7.2-3.224-7.2-7.2S8.024 4.8 12 4.8c1.835 0 3.505.692 4.776 1.823l3.394-3.394C18.027 1.232 15.16 0 12 0 5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12c0-.805-.082-1.59-.234-2.35z" fill="#FFC107" />
      <path d="M1.383 6.414l3.942 2.892C6.392 6.665 8.975 4.8 12 4.8c1.835 0 3.504.692 4.775 1.823l3.394-3.394C18.027 1.232 15.16 0 12 0 7.39 0 3.393 2.602 1.383 6.414z" fill="#FF3D00" />
      <path d="M12 24c3.1 0 5.916-1.186 8.045-3.115l-3.714-3.143C15.086 18.69 13.564 19.2 12 19.2c-3.121 0-5.771-1.99-6.77-4.767l-3.912 3.015C3.303 21.334 7.376 24 12 24z" fill="#4CAF50" />
      <path d="M23.766 9.65h-1v-.05H12v4.8h6.782c-.473 1.33-1.325 2.492-2.451 3.343l3.714 3.143c-.262.238 4.456-3.085 4.456-9.086 0-.805-.082-1.59-.234-2.35z" fill="#1976D2" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none">
      <path d="M17.05 20.28c-1.02.95-2.09.8-3.12.35-1.1-.46-2.1-.48-3.25.1-1.42.6-2.22.41-3.13-.35C2.24 14.97 3.02 6.96 8.96 6.68c1.39.07 2.35.76 3.15.82 1.24-.27 2.43-.98 3.76-.89 1.61.13 2.83.78 3.6 1.95-3.35 1.99-2.53 6.59.56 7.87-.61 1.59-1.42 3.16-2.99 3.86zM12.03 6.64c-.14-2.37 1.72-4.29 3.95-4.45.29 2.72-2.47 4.71-3.95 4.45z" fill="currentColor" />
    </svg>
  );
}