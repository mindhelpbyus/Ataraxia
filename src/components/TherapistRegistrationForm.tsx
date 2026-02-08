import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ParallaxAntiGravity } from './ui/parallax-anti-gravity';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { BedrockLogo } from '../imports/BedrockLogo';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { Alert, AlertDescription } from "./ui/alert";
import { PhoneInput, validatePhoneNumber as validatePhone } from './PhoneInput';
import { Spotlight } from './ui/spotlight';
import { localAuthService } from '../services/localAuthService'; // Use Local Service for now


interface TherapistRegistrationFormProps {
  onRegisterComplete: (userData: any) => void;
  onBackToLogin: () => void;
}

export function TherapistRegistrationForm({ onRegisterComplete, onBackToLogin }: TherapistRegistrationFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneCountryCode, setPhoneCountryCode] = useState('US');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // 1. Validation
      if (!firstName || !lastName || !email || !phoneNumber || !password) {
        throw new Error('Please fill in all fields');
      }

      if (!validatePhone(phoneNumber, phoneCountryCode)) {
        throw new Error('Please enter a valid phone number');
      }

      if (password.length < 8) {
        throw new Error('Password must be at least 8 characters');
      }

      if (password !== confirmPassword) {
        throw new Error('Passwords do not match');
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Please enter a valid email address');
      }

      const fullPhoneNumber = `+${phoneCountryCode}${phoneNumber}`;

      // 2. Local Registration Logic (Simulating Backend w/ Prisma/Local DB)
      // Pending backend API integration: This uses the local service to mimic the DB call

      const newUser = await localAuthService.register({
        email,
        password,
        firstName,
        lastName,
        role: 'therapist', // Hardcoded for this form
        phoneNumber: fullPhoneNumber,
        countryCode: phoneCountryCode
      });

      // 3. Success Handling
      toast.success('Registration successful! Welcome aboard.');

      // Store country code for settings autopopulation
      localStorage.setItem('registration_country_code', phoneCountryCode);

      // Pass the full user object back up (which includes the mock JWT token)
      onRegisterComplete(newUser);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
      toast.error(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TooltipProvider>
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

          {/* Registration Form Container */}
          <div className="w-full relative z-10 p-8 md:p-10 flex justify-center">
            <motion.div
              className="w-full"
              style={{
                maxWidth: '480px',
                width: '100%',
              }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="space-y-8">
                {/* Header */}
                <div className="space-y-4 text-center">
                  <div className="flex justify-center mb-4">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex flex-col items-center justify-center gap-4">
                          <BedrockLogo variant="icon" size={72} />
                          <h1 className="text-3xl font-semibold text-foreground tracking-tight">Create Account</h1>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Ataraxia by Bedrock Health Solutions</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
                      Join our community of mental health professionals
                    </p>
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-2">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Name Fields */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="ml-1 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                        First Name
                      </Label>
                      <Input
                        id="firstName"
                        type="text"
                        placeholder="Jane"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                        disabled={isLoading}
                        className="h-12 rounded-xl bg-background/50 border-transparent focus:border-primary/20 focus:bg-background transition-all text-foreground"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="ml-1 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                        Last Name
                      </Label>
                      <Input
                        id="lastName"
                        type="text"
                        placeholder="Doe"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                        disabled={isLoading}
                        className="h-12 rounded-xl bg-background/50 border-transparent focus:border-primary/20 focus:bg-background transition-all text-foreground"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="ml-1 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
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
                      className="h-12 rounded-xl bg-background/50 border-transparent focus:border-primary/20 focus:bg-background transition-all text-foreground"
                    />
                  </div>

                  {/* Phone */}
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

                  {/* Password */}
                  <div className="space-y-2">
                    <Label htmlFor="password" className="ml-1 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
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
                        minLength={8}
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
                    <p className="text-xs text-muted-foreground ml-1">
                      At least 8 characters
                    </p>
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="ml-1 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        disabled={isLoading}
                        className="h-12 rounded-xl pr-10 bg-background/50 border-transparent focus:border-primary/20 focus:bg-background transition-all text-foreground"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-2 rounded-full hover:bg-muted/50 transition-colors"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <motion.div whileTap={{ scale: 0.98 }}>
                    <Button
                      type="submit"
                      className="w-full text-base font-bold h-12 rounded-2xl shadow-xl shadow-orange-500/20 active:scale-[0.98]"
                      style={{ backgroundColor: '#ea580c', color: '#ffffff' }}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Creating Account...' : 'Create Account'}
                    </Button>
                  </motion.div>

                  {/* Back to Login */}
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={onBackToLogin}
                      className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back to Login
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
