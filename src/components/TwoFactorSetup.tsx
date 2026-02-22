import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Shield, ShieldCheck, ShieldAlert, Smartphone, Loader2 } from 'lucide-react';
import { PhoneInputV2 } from './PhoneInputV2';
// Fallback stubs for migrated functionality
const isFirebaseConfigured = false;
const enrollIn2FA = async (phone: string): Promise<string> => '';
const complete2FAEnrollment = async (vid: string, code: string, dn: string) => { };
const unenroll2FA = async (uid: string) => { };
const get2FAStatus = async (): Promise<{ enabled: boolean, enrolledFactors: any[] }> => ({ enabled: false, enrolledFactors: [] });
const initializeRecaptcha = (id: string, v: boolean) => { };
const clearRecaptcha = () => { };

interface TwoFactorSetupProps {
  userId: string;
  phoneNumber?: string;
}

export function TwoFactorSetup({ userId, phoneNumber }: TwoFactorSetupProps) {
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [enrolledFactors, setEnrolledFactors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Enrollment flow state
  const [showEnrollment, setShowEnrollment] = useState(false);
  const [enrollmentPhone, setEnrollmentPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+1');
  const [verificationId, setVerificationId] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  // Check 2FA status on mount
  useEffect(() => {
    checkStatus();
  }, []);

  // Initialize reCAPTCHA when enrollment dialog is shown
  useEffect(() => {
    if (showEnrollment && isFirebaseConfigured) {
      try {
        initializeRecaptcha('recaptcha-container-2fa', true);
      } catch (err) {
        console.error('Error initializing reCAPTCHA:', err);
      }
    }

    return () => {
      if (!showEnrollment && isFirebaseConfigured) {
        clearRecaptcha();
      }
    };
  }, [showEnrollment]);

  const checkStatus = async () => {
    if (!isFirebaseConfigured) {
      return;
    }

    try {
      const status = await get2FAStatus();
      setIs2FAEnabled(status.enabled);
      setEnrolledFactors(status.enrolledFactors);
    } catch (err: any) {
      console.error('Error checking 2FA status:', err);
    }
  };

  const handleStartEnrollment = () => {
    setShowEnrollment(true);
    setError('');
    setSuccess('');
    // Pre-fill with user's phone number if available
    if (phoneNumber) {
      setEnrollmentPhone(phoneNumber);
    }
  };

  const handleCancelEnrollment = () => {
    setShowEnrollment(false);
    setOtpSent(false);
    setVerificationId('');
    setOtp('');
    setEnrollmentPhone('');
    setError('');
    clearRecaptcha();
  };

  const handleSendOTP = async () => {
    setError('');
    setSuccess('');

    if (!enrollmentPhone || enrollmentPhone.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }

    setIsLoading(true);

    try {
      // Format phone number to E.164
      const formattedPhone = `${countryCode}${enrollmentPhone}`;

      const verificationId = await enrollIn2FA(formattedPhone);
      setVerificationId(verificationId);
      setOtpSent(true);
      setSuccess('Verification code sent to your phone');
    } catch (err: any) {
      setError(err.message || 'Failed to send verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    setError('');
    setSuccess('');

    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setIsLoading(true);

    try {
      await complete2FAEnrollment(verificationId, otp, 'My Phone');
      setSuccess('Two-factor authentication enabled successfully!');
      await checkStatus();

      // Reset enrollment flow
      setTimeout(() => {
        handleCancelEnrollment();
        setSuccess('');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Invalid verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnenroll = async (factorUid: string) => {
    if (!confirm('Are you sure you want to disable two-factor authentication? This will make your account less secure.')) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await unenroll2FA(factorUid);
      setSuccess('Two-factor authentication disabled');
      await checkStatus();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to disable 2FA');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isFirebaseConfigured) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>
            Add an extra layer of security to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <ShieldAlert className="w-4 h-4" />
            <AlertDescription>
              Firebase is not configured. 2FA requires Firebase Authentication.
              Please configure Firebase credentials in /config/firebase.ts
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Two-Factor Authentication (2FA)
        </CardTitle>
        <CardDescription>
          Add an extra layer of security to your account with SMS verification
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Badge */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Status:</span>
          {is2FAEnabled ? (
            <Badge className="bg-green-100 text-green-800 border-green-300">
              <ShieldCheck className="w-3 h-3 mr-1" />
              Enabled
            </Badge>
          ) : (
            <Badge variant="outline" className="text-gray-600">
              <ShieldAlert className="w-3 h-3 mr-1" />
              Disabled
            </Badge>
          )}
        </div>

        {/* Error/Success Messages */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="bg-green-50 border-green-200">
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {/* Enrolled Factors */}
        {is2FAEnabled && enrolledFactors.length > 0 && (
          <div className="space-y-2">
            <Label>Enrolled Devices</Label>
            {enrolledFactors.map((factor) => (
              <div
                key={factor.uid}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-gray-600" />
                  <div>
                    <p className="text-sm font-medium">{factor.displayName || 'Phone'}</p>
                    <p className="text-xs text-gray-500">{factor.phoneNumber}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUnenroll(factor.uid)}
                  disabled={isLoading}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Enrollment Form */}
        {showEnrollment ? (
          <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 text-blue-900">
              <Smartphone className="w-4 h-4" />
              <h3 className="font-medium">Enable Two-Factor Authentication</h3>
            </div>

            {!otpSent ? (
              <div className="space-y-3">
                <div>
                  <PhoneInputV2
                    id="enrollment-phone"
                    label="Phone Number"
                    value={enrollmentPhone}
                    onChange={(value) => setEnrollmentPhone(value || '')}
                    disabled={isLoading}
                    helperText="Enter your phone number"
                    defaultCountry="US"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleSendOTP}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      'Send Verification Code'
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancelEnrollment}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="enrollment-otp">Verification Code</Label>
                  <Input
                    id="enrollment-otp"
                    type="text"
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    disabled={isLoading}
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    Enter the 6-digit code sent to {enrollmentPhone}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleVerifyOTP}
                    disabled={isLoading || otp.length !== 6}
                    className="flex-1"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      'Verify & Enable 2FA'
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancelEnrollment}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* reCAPTCHA container */}
            <div id="recaptcha-container-2fa"></div>
          </div>
        ) : (
          !is2FAEnabled && (
            <div className="space-y-3">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700 mb-2">
                  Two-factor authentication adds an extra layer of security to your account.
                  After enabling 2FA, you'll need to enter a code from your phone in addition
                  to your password when signing in.
                </p>
                <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                  <li>Protects your account even if your password is compromised</li>
                  <li>Receive verification codes via SMS</li>
                  <li>Can be disabled at any time</li>
                </ul>
              </div>

              <Button onClick={handleStartEnrollment} disabled={isLoading}>
                <Shield className="w-4 h-4 mr-2" />
                Enable Two-Factor Authentication
              </Button>
            </div>
          )
        )}

        {/* Info for enrolled users */}
        {is2FAEnabled && !showEnrollment && (
          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm text-green-800">
              ✓ Your account is protected with two-factor authentication.
              You'll need to enter a verification code when signing in from a new device.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
