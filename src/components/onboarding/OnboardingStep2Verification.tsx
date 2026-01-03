import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/button';
import { Smartphone, Pencil, ArrowLeft } from 'lucide-react';
import { PhoneInput } from '../PhoneInput';

interface OnboardingStep2Props {
  phoneNumber: string;
  countryCode: string;
  onBack: () => void;
  onNext: () => void;
  onUpdate: (data: any) => void;
}

export function OnboardingStep2Verification({
  phoneNumber,
  countryCode,
  onBack,
  onNext,
  onUpdate
}: OnboardingStep2Props) {
  const [isEditing, setIsEditing] = useState(!phoneNumber);
  const [internalPhone, setInternalPhone] = useState(phoneNumber);
  const [internalCountryCode, setInternalCountryCode] = useState(countryCode || '+1');
  const [internalIsoCode, setInternalIsoCode] = useState('US');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isEditing && timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (timer === 0) {
      setCanResend(true);
    }
  }, [timer, isEditing]);

  useEffect(() => {
    // Start timer when entering verify mode
    if (!isEditing) {
      setTimer(60);
      setCanResend(false);
      // Auto-focus first input
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [isEditing]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = pastedData.split('');
    setOtp([...newOtp, ...Array(6 - newOtp.length).fill('')]);

    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleResend = () => {
    setTimer(60);
    setCanResend(false);
    setOtp(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
  };

  const handleVerify = () => {
    if (isSubmitting) return;

    const code = otp.join('');
    if (code.length === 6) {
      setIsSubmitting(true);
      onNext();
    }
  };

  const handleSendCode = () => {
    if (internalPhone) {
      // Update parent state
      // Also set country for next step based on phone
      onUpdate({
        phoneNumber: internalPhone,
        countryCode: internalCountryCode,
        country: internalIsoCode
      });
      setIsEditing(false);
    }
  };

  const isComplete = otp.every((digit) => digit !== '');

  return (
    <div className="w-full max-w-md mx-auto px-6">
      <div className="p-8 shadow-lg rounded-lg bg-white/80 backdrop-blur-md border border-gray-100">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#F97316]/10 rounded-full mb-4">
            <Smartphone className="h-8 w-8 text-[#F97316]" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Verify your phone number
          </h1>
          <p className="text-sm text-muted-foreground">
            We need to verify your phone number to secure your account.
          </p>
        </div>

        {isEditing ? (
          <div className="space-y-6">
            <PhoneInput
              label="Phone Number"
              value={internalPhone}
              countryCode={internalCountryCode}
              onChange={(phone, code, iso) => {
                setInternalPhone(phone);
                setInternalCountryCode(code);
                setInternalIsoCode(iso);
              }}
              required
              helperText="We'll send a 6-digit verification code"
            />

            <Button
              onClick={handleSendCode}
              disabled={!internalPhone || internalPhone.length < 10}
              className="w-full bg-[#F97316] hover:bg-[#ea580c] rounded-full"
            >
              Send Verification Code
            </Button>

            <button
              onClick={onBack}
              className="w-full text-center text-sm text-gray-500 hover:text-gray-900 mt-4 flex items-center justify-center gap-1"
            >
              Back
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center mb-4">
              <p className="text-sm text-gray-600">
                Code sent to <span className="font-medium text-gray-900">{internalCountryCode} {internalPhone}</span>
              </p>
              <button
                onClick={() => setIsEditing(true)}
                className="text-xs text-[#F97316] hover:underline flex items-center justify-center gap-1 mx-auto mt-1"
              >
                <Pencil className="h-3 w-3" /> Edit number
              </button>
            </div>

            <div className="flex gap-3 justify-center">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className="w-12 h-14 text-center text-xl font-semibold border-2 rounded-lg focus:border-[#F97316] focus:outline-none transition-colors"
                />
              ))}
            </div>

            <div className="text-center">
              {canResend ? (
                <button
                  onClick={handleResend}
                  className="text-sm text-[#F97316] hover:underline font-medium"
                >
                  Resend OTP
                </button>
              ) : (
                <p className="text-sm text-gray-600">
                  Resend code in <span className="font-medium text-gray-900">{timer}s</span>
                </p>
              )}
            </div>

            <Button
              onClick={handleVerify}
              disabled={!isComplete || isSubmitting}
              className="w-full bg-[#F97316] hover:bg-[#ea580c] disabled:opacity-50 rounded-full"
            >
              {isSubmitting ? 'Verifying...' : 'Verify & Continue'}
            </Button>

            <button
              onClick={() => setIsEditing(true)}
              className="w-full text-center text-sm text-gray-500 hover:text-gray-900 mt-2"
            >
              Change Phone Number
            </button>
          </div>
        )}
      </div>
    </div>
  );
}