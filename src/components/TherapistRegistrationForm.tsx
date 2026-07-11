import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Eye, EyeOff, ArrowLeft, Check, Loader2, ShieldCheck, Lock } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { PhoneInput, validatePhoneNumber as validatePhone } from './PhoneInput';
import { register } from '../api/auth';

interface TherapistRegistrationFormProps {
  onRegisterComplete: (userData: any) => void;
  onBackToLogin: () => void;
}

// India-appropriate care types for counsellors/psychologists/therapists.
// (No prescriber roles — therapists/counsellors in India do not prescribe.)
const CARE_TYPES = [
  'Counselling',
  'Clinical Psychology',
  'Psychotherapy',
  'Marriage & Family Therapy',
  'Child & Adolescent Psychology',
  'Art / Music Therapy',
  'Rehabilitation / Special Education',
  'Other',
];

const PRACTICE_SIZES = [
  'Solo practitioner',
  'Small clinic (2–5)',
  'Clinic (6–20)',
  'Large group (21+)',
];

const EXPERIENCE = [
  'New (0–1 year)',
  'Established (1–3 years)',
  'Well established (3+ years)',
  'Not licensed yet',
];

const TOTAL_STEPS = 4; // email → practice → essentials  (practice = type+size+experience on one step)

export function TherapistRegistrationForm({ onRegisterComplete, onBackToLogin }: TherapistRegistrationFormProps) {
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // collected fields
  const [email, setEmail] = useState('');
  const [careType, setCareType] = useState('');
  const [practiceSize, setPracticeSize] = useState('');
  const [experience, setExperience] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneCountryCode, setPhoneCountryCode] = useState('91'); // India dial code
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const progress = ((step + 1) / TOTAL_STEPS) * 100;

  const next = () => { setError(null); setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1)); };
  const back = () => { setError(null); setStep((s) => Math.max(s - 1, 0)); };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (!firstName || !lastName || !phoneNumber || !password) throw new Error('Please complete all fields');
      if (!validatePhone(phoneNumber, phoneCountryCode)) throw new Error('Please enter a valid phone number');
      if (password.length < 8) throw new Error('Password must be at least 8 characters');

      const fullPhone = `+${phoneCountryCode}${phoneNumber}`;
      const newUser = await register({ email, password, firstName, lastName, role: 'therapist', phoneNumber: fullPhone });

      // Carry practice context for profile pre-fill later (not PHI).
      try {
        localStorage.setItem('registration_country_code', phoneCountryCode);
        localStorage.setItem('registration_practice', JSON.stringify({ careType, practiceSize, experience }));
      } catch { /* storage may be blocked */ }

      toast.success('Account created — welcome aboard', { icon: '🌿' });
      onRegisterComplete(newUser);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Registration failed';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const fieldCheck = (ok: boolean) =>
    ok ? <Check className="h-4 w-4" style={{ color: 'var(--action)' }} /> : null;

  return (
    <div className="relative min-h-screen bg-canvas flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      {/* calm ambient wash */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{ background: 'radial-gradient(60rem 40rem at 50% -10%, rgba(30,112,72,0.06), transparent 60%)' }}
      />

      <div className="relative z-10 w-full max-w-[56rem] grid grid-cols-1 md:grid-cols-2 rounded-2xl overflow-hidden border border-rule"
        style={{ boxShadow: '0 1px 2px rgba(28,24,18,0.04), 0 16px 40px rgba(28,24,18,0.08)' }}>

        {/* ── Left brand panel ─────────────────────────────────────────────── */}
        <div className="hidden md:flex flex-col justify-between p-10 text-white"
          style={{ background: 'linear-gradient(160deg, var(--action) 0%, var(--action-dark) 100%)' }}>
          <div className="flex items-center gap-2.5">
            <span aria-hidden className="inline-block h-6 w-6 rounded-full" style={{ border: '3px solid rgba(255,255,255,0.85)' }} />
            <span className="text-[15px] font-semibold tracking-tight">Bedrock&nbsp;Health</span>
          </div>

          <div className="space-y-6">
            <h2 className="text-[2.1rem] leading-[1.1] font-semibold tracking-tight" style={{ letterSpacing: '-0.02em' }}>
              Grow your practice<br />with Ataraxia
            </h2>
            <p className="text-[15px] leading-relaxed text-white/85">
              Save time, stay organised, and focus on client care.
            </p>
            <ul className="space-y-3 text-[15px] text-white/90">
              {['Scheduling, clinical notes & billing in one place',
                'Secure telehealth & client communication',
                'AI-assisted progress notes'].map((t) => (
                <li key={t} className="flex items-start gap-2.5">
                  <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/20 shrink-0">
                    <Check className="h-3 w-3" />
                  </span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Honest trust signals — NOT certifications we don't hold. */}
          <div className="flex items-center gap-5 text-white/80 text-xs">
            <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-4 w-4" /> DPDP-aligned</span>
            <span className="inline-flex items-center gap-1.5"><Lock className="h-4 w-4" /> Encrypted &amp; private</span>
          </div>
        </div>

        {/* ── Right form panel ─────────────────────────────────────────────── */}
        <div className="bg-card p-8 sm:p-10 flex flex-col">
          {/* progress */}
          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden mb-8">
            <div className="h-full rounded-full transition-all duration-300" style={{ width: `${progress}%`, background: 'var(--action)' }} />
          </div>

          {error && (
            <Alert variant="destructive" className="mb-5">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2 }}
              className="flex-1"
            >
              {/* Step 0 — email */}
              {step === 0 && (
                <form onSubmit={(e) => { e.preventDefault(); if (emailValid) next(); }} className="space-y-6">
                  <header className="space-y-1.5">
                    <h1 className="text-[1.6rem] font-semibold tracking-tight" style={{ color: 'var(--ink)' }}>Create your free account</h1>
                    <p className="text-sm text-muted-foreground">A few quick questions — no card required.</p>
                  </header>
                  <div className="space-y-2">
                    <Label htmlFor="email">Your email</Label>
                    <div className="relative">
                      <Input id="email" type="email" autoFocus placeholder="you@clinic.com" value={email}
                        onChange={(e) => setEmail(e.target.value)} className="pr-9" />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2">{fieldCheck(emailValid)}</span>
                    </div>
                  </div>
                  <Button type="submit" disabled={!emailValid} className="w-full">Next</Button>
                  <p className="text-center text-sm text-muted-foreground">
                    Already have an account?{' '}
                    <button type="button" onClick={onBackToLogin} className="font-medium" style={{ color: 'var(--action)' }}>Sign in</button>
                  </p>
                </form>
              )}

              {/* Step 1 — practice details */}
              {step === 1 && (
                <div className="space-y-6">
                  <header className="space-y-1.5">
                    <h1 className="text-[1.6rem] font-semibold tracking-tight" style={{ color: 'var(--ink)' }}>Tell us about your practice</h1>
                    <p className="text-sm text-muted-foreground">We’ll tailor your setup to suit you.</p>
                  </header>
                  <Selectish label="What type of care do you provide?" value={careType} onChange={setCareType} options={CARE_TYPES} />
                  <Selectish label="What size is your practice?" value={practiceSize} onChange={setPracticeSize} options={PRACTICE_SIZES} />
                  <Selectish label="Your experience" value={experience} onChange={setExperience} options={EXPERIENCE} />
                  <div className="flex items-center gap-3 pt-2">
                    <Button type="button" variant="ghost" onClick={back}><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button>
                    <Button type="button" onClick={next} disabled={!careType || !practiceSize || !experience} className="flex-1">Next</Button>
                  </div>
                </div>
              )}

              {/* Step 2 — essentials */}
              {step === 2 && (
                <form onSubmit={(e) => { e.preventDefault(); next(); }} className="space-y-5">
                  <header className="space-y-1.5">
                    <h1 className="text-[1.6rem] font-semibold tracking-tight" style={{ color: 'var(--ink)' }}>Add the essentials</h1>
                    <p className="text-sm text-muted-foreground">Your name and contact.</p>
                  </header>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="fn">First name</Label>
                      <div className="relative">
                        <Input id="fn" autoFocus value={firstName} onChange={(e) => setFirstName(e.target.value)} className="pr-9" />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2">{fieldCheck(firstName.trim().length > 0)}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ln">Last name</Label>
                      <div className="relative">
                        <Input id="ln" value={lastName} onChange={(e) => setLastName(e.target.value)} className="pr-9" />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2">{fieldCheck(lastName.trim().length > 0)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <PhoneInput value={phoneNumber} countryCode={phoneCountryCode}
                      onChange={(phone, code) => { setPhoneNumber(phone); setPhoneCountryCode(code); }} />
                  </div>
                  <div className="flex items-center gap-3 pt-1">
                    <Button type="button" variant="ghost" onClick={back}><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button>
                    <Button type="submit" disabled={!firstName || !lastName || !phoneNumber} className="flex-1">Next</Button>
                  </div>
                </form>
              )}

              {/* Step 3 — password */}
              {step === 3 && (
                <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-5">
                  <header className="space-y-1.5">
                    <h1 className="text-[1.6rem] font-semibold tracking-tight" style={{ color: 'var(--ink)' }}>Choose a password</h1>
                    <p className="text-sm text-muted-foreground">At least 8 characters.</p>
                  </header>
                  <div className="space-y-2">
                    <Label htmlFor="pw">Password</Label>
                    <div className="relative">
                      <Input id="pw" type={showPassword ? 'text' : 'password'} autoFocus placeholder="••••••••"
                        value={password} onChange={(e) => setPassword(e.target.value)} className="pr-9" />
                      <button type="button" onClick={() => setShowPassword((s) => !s)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 pt-1">
                    <Button type="button" variant="ghost" onClick={back}><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button>
                    <Button type="submit" disabled={isLoading || password.length < 8} className="flex-1">
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create account'}
                    </Button>
                  </div>
                </form>
              )}
            </motion.div>
          </AnimatePresence>

          <footer className="pt-8 mt-auto text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} Bedrock Health · <a className="hover:underline" href="#">Terms</a> · <a className="hover:underline" href="#">Privacy</a>
          </footer>
        </div>
      </div>
    </div>
  );
}

/** Minimal styled native select to match the calm form look. */
function Selectish({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-10 rounded-md border border-rule bg-card px-3 pr-9 text-sm text-ink appearance-none focus:outline-none focus:ring-2"
          style={{ ['--tw-ring-color' as any]: 'var(--action-border)' }}
        >
          <option value="">Select one</option>
          {options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">▾</span>
      </div>
    </div>
  );
}
