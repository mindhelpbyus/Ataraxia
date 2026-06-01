import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Eye, EyeOff, Mail, Phone, Check, ShieldCheck, Lock } from 'lucide-react';
import { TooltipProvider } from "./ui/tooltip";
import { Alert, AlertDescription } from "./ui/alert";
import { login as cognitoLogin, completeMfaLogin, forgotPassword, MfaRequiredError } from '../api/auth';
import { startGoogleSignIn, phoneSignIn, phoneConfirm, phoneSignUp } from '../lib/cognito';
import { PhoneInput, validatePhoneNumber as validatePhone } from './PhoneInput';
import type { AuthUser } from '../api/auth';
import { useNavigate } from 'react-router-dom';

type LoginMode = 'email' | 'phone';

interface LoginPageProps {
  onLogin: (user: AuthUser) => void;
  onRegisterTherapist?: () => void;
  onBackToHome?: () => void;
}

export function LoginPage({ onLogin, onRegisterTherapist }: LoginPageProps) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loginMode, setLoginMode] = useState<LoginMode>('email');

  // Email state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Phone state (UI retained; phone auth not enabled on Cognito for now)
  const [isSignup, setIsSignup] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneCountryCode, setPhoneCountryCode] = useState('US');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  // MFA (TOTP) challenge state
  const [mfaChallenge, setMfaChallenge] = useState<MfaRequiredError['challenge'] | null>(null);
  const [mfaCode, setMfaCode] = useState('');

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const handleRegister = () => {
    if (onRegisterTherapist) {
      onRegisterTherapist();
    } else {
      navigate('/register');
    }
  };

  const handleForgotPassword = async () => {
    if (!email) { toast.error('Please enter your email address first'); return; }
    try {
      await forgotPassword(email);
      toast.success('Password reset code sent', { description: 'Check your email for the verification code.' });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not send reset code');
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (!email || !password) throw new Error('Please enter both email and password');
      // AWS Cognito SRP sign-in. Throws MfaRequiredError if TOTP MFA is enabled.
      const user = await cognitoLogin(email, password);
      toast.success(`Welcome back, ${user.name}`, { icon: '🌿' });
      onLogin(user);
    } catch (err) {
      if (err instanceof MfaRequiredError) {
        setMfaChallenge(err.challenge);
      } else {
        setError(err instanceof Error ? err.message : 'Invalid credentials');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mfaChallenge) return;
    setIsLoading(true);
    setError(null);
    try {
      const user = await completeMfaLogin(mfaChallenge, mfaCode.trim());
      toast.success(`Welcome back, ${user.name}`, { icon: '🌿' });
      onLogin(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid authentication code');
    } finally {
      setIsLoading(false);
    }
  };

  // Phone sign-in via Cognito SMS. (Pool must enable phone sign-in/SMS — backend backlog.)
  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const fullPhoneNumber = `+${phoneCountryCode}${phoneNumber}`;
      if (!otpSent) {
        if (!validatePhone(phoneNumber, phoneCountryCode)) throw new Error('Please enter a valid phone number');
        if (isSignup) {
          if (!firstName || !lastName) throw new Error('Please enter your name');
          // A password is required by Cognito; phone OTP confirms the account.
          await phoneSignUp(fullPhoneNumber, `${crypto.randomUUID()}A1!`);
        }
        setOtpSent(true);
        toast.success('Verification code sent to your phone');
      } else {
        if (otp.length !== 6) throw new Error('Please enter a valid 6-digit code');
        if (isSignup) await phoneConfirm(fullPhoneNumber, otp);
        // After confirm/login, exchange via SRP (requires the user's password flow).
        const tokens = await phoneSignIn(fullPhoneNumber, otp);
        onLogin({ id: tokens.claims.sub, email: null, phone: fullPhoneNumber, name: `${firstName} ${lastName}`.trim() || fullPhoneNumber, role: 'client' });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Phone authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Google sign-in via Cognito Hosted UI (redirects out; returns to /callback).
  const handleGoogleSignIn = async () => {
    setError(null);
    startGoogleSignIn();
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <TooltipProvider>
      <div id="recaptcha-container" />

      <div className="relative min-h-screen bg-canvas flex items-center justify-center p-4 sm:p-6 overflow-hidden">
        {/* Calm, subtle ambient wash — no busy decoration */}
        <div
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            background:
              'radial-gradient(60rem 40rem at 50% -10%, rgba(30,112,72,0.06), transparent 60%), radial-gradient(50rem 40rem at 100% 110%, rgba(122,158,136,0.07), transparent 60%)',
          }}
        />

        {/* Two-panel: brand + form (matches the register flow) */}
        <div
          className="relative z-10 w-full max-w-[56rem] grid grid-cols-1 md:grid-cols-2 rounded-2xl overflow-hidden border border-rule"
          style={{ boxShadow: '0 1px 2px rgba(28,24,18,0.04), 0 16px 40px rgba(28,24,18,0.08)' }}
        >
          {/* Left brand panel */}
          <div
            className="hidden md:flex flex-col justify-between p-10 text-white"
            style={{ background: 'linear-gradient(160deg, var(--action) 0%, var(--action-dark) 100%)' }}
          >
            <div className="flex items-center gap-2.5">
              <span aria-hidden className="inline-block h-6 w-6 rounded-full" style={{ border: '3px solid rgba(255,255,255,0.85)' }} />
              <span className="text-[15px] font-semibold tracking-tight">Bedrock&nbsp;Health</span>
            </div>
            <div className="space-y-5">
              <h2 className="text-[2rem] leading-[1.12] font-semibold tracking-tight" style={{ letterSpacing: '-0.02em' }}>
                Care,<br />simplified.
              </h2>
              <p className="text-[15px] leading-relaxed text-white/85">
                Scheduling, clinical notes, telehealth and billing — one calm workspace for your practice.
              </p>
              <ul className="space-y-3 text-[15px] text-white/90">
                {['Everything in one place', 'Secure telehealth & messaging', 'AI-assisted progress notes'].map((t) => (
                  <li key={t} className="flex items-start gap-2.5">
                    <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/20 shrink-0">
                      <Check className="h-3 w-3" />
                    </span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex items-center gap-5 text-white/80 text-xs">
              <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-4 w-4" /> DPDP-aligned</span>
              <span className="inline-flex items-center gap-1.5"><Lock className="h-4 w-4" /> Encrypted &amp; private</span>
            </div>
          </div>

          {/* Right form panel */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="bg-card p-8 sm:p-10 space-y-6"
            >
              {/* ─── Header ─────────────────────────────────────────────── */}
              <div className="space-y-2">
                {/* Brand mark only on mobile — the left panel already shows it on desktop */}
                <div className="flex md:hidden items-center gap-2.5">
                  <span
                    aria-hidden
                    className="inline-block h-6 w-6 rounded-full shrink-0"
                    style={{ border: '3px solid var(--action)' }}
                  />
                  <span
                    className="text-[15px] font-semibold tracking-tight"
                    style={{ color: 'var(--ink)' }}
                  >
                    Bedrock&nbsp;Health
                  </span>
                </div>
                <h1
                  className="text-[1.7rem] leading-tight tracking-tight pt-2"
                  style={{ fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.02em' }}
                >
                  Welcome back
                </h1>
                <p className="text-sm" style={{ color: 'var(--muted-text)' }}>
                  Sign in to your Ataraxia account
                </p>
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

              {/* ─── MFA challenge (TOTP) ───────────────────────────────── */}
              {mfaChallenge ? (
                <form onSubmit={handleMfaSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="mfa" className="ml-1 text-[10px] uppercase tracking-widest font-bold" style={{ color: 'var(--muted-text)' }}>
                      Authentication code
                    </Label>
                    <Input
                      id="mfa"
                      inputMode="numeric"
                      maxLength={6}
                      autoFocus
                      placeholder="123456"
                      value={mfaCode}
                      onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                      className="text-center text-lg tracking-[0.5em]"
                    />
                    <p className="text-xs px-1" style={{ color: 'var(--muted-text)' }}>
                      Enter the 6-digit code from your authenticator app.
                    </p>
                  </div>
                  <Button type="submit" disabled={isLoading || mfaCode.length < 6} className="w-full"
                    style={{ background: 'var(--action)', boxShadow: 'var(--shadow-action)' }}>
                    {isLoading ? 'Verifying…' : 'Verify & Sign In'}
                  </Button>
                  <button type="button" onClick={() => { setMfaChallenge(null); setMfaCode(''); }}
                    className="w-full text-xs hover:underline" style={{ color: 'var(--muted-text)' }}>
                    Back to sign in
                  </button>
                </form>
              ) : (
              /* ─── Form ───────────────────────────────────────────────── */
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
                          <button type="button" onClick={() => {
                            // Re-trigger by going back to the send step.
                            setOtpSent(false);
                            toast.info('Re-enter your number to receive a new code');
                          }} className="hover:underline">Resend Code</button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </form>
              )}

              {/* ─── Divider + Social (hidden during MFA step) ───────────── */}
              {!mfaChallenge && (
              <>
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
                  </>
                ) : (
                  <SocialButton onClick={() => { setLoginMode('email'); setError(null); }} icon={<Mail className="w-4 h-4" />} label="Back to Email Login" />
                )}
              </div>
              </>
              )}

              {/* ─── Register CTA ────────────────────────────────────────── */}
              {!mfaChallenge && loginMode === 'email' && (
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

