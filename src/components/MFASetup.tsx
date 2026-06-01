/**
 * MFA Setup Component
 *
 * Provides UI for setting up AWS Cognito software TOTP MFA (authenticator app).
 * Cognito does not offer SMS MFA or backup codes through this flow.
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import {
  Shield,
  QrCode,
  Copy,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import { setupMFA, verifyMFA, getMFAStatus } from '../api/auth';

interface MFASetupProps {
  onComplete?: () => void;
  onCancel?: () => void;
}

export const MFASetup: React.FC<MFASetupProps> = ({ onComplete, onCancel }) => {
  const [step, setStep] = useState<'choose' | 'setup-totp' | 'verify'>('choose');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // TOTP Setup
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [manualEntryKey, setManualEntryKey] = useState('');

  // Verification
  const [verificationCode, setVerificationCode] = useState('');

  // MFA Status
  const [mfaStatus, setMfaStatus] = useState<any>(null);

  useEffect(() => {
    loadMFAStatus();
  }, []);

  const loadMFAStatus = async () => {
    try {
      const status = await getMFAStatus();
      setMfaStatus(status);
    } catch (error) {
      console.error('Failed to load MFA status:', error);
    }
  };

  const handleSetupTOTP = async () => {
    setLoading(true);
    setError(null);

    try {
      // Cognito returns the TOTP secret; build an otpauth:// URI for QR rendering.
      const { secret, otpauthIssuer } = await setupMFA();
      const account = encodeURIComponent('Ataraxia');
      const otpauth = `otpauth://totp/${otpauthIssuer}:${account}?secret=${secret}&issuer=${otpauthIssuer}`;
      setManualEntryKey(secret);
      // Render via a public QR image service (secret never leaves the client otherwise).
      setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpauth)}`);
      setStep('setup-totp');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyMFA = async () => {
    if (!verificationCode) {
      setError('Please enter the verification code');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await verifyMFA(verificationCode);

      if (result.verified) {
        toast.success('MFA enabled successfully!');
        onComplete?.();
      } else {
        setError('Invalid verification code');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (mfaStatus?.enabled) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-green-600" />
          </div>
          <CardTitle>MFA Already Enabled</CardTitle>
          <CardDescription>
            Your account is already protected with multi-factor authentication
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center gap-2 rounded-md border bg-muted/40 px-3 py-2 text-sm font-medium">
            <QrCode className="w-4 h-4" />
            Authenticator App Enabled
          </div>
          <Button onClick={onCancel} variant="outline" className="w-full">
            Close
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {step === 'choose' && (
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle>Enable Two-Factor Authentication</CardTitle>
              <CardDescription>
                Add an extra layer of security to your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Cognito supports software TOTP MFA (authenticator app) only. */}
              <div className="space-y-4">
                <div className="text-center space-y-2">
                  <QrCode className="w-8 h-8 mx-auto text-blue-600" />
                  <h3 className="font-semibold">Authenticator App</h3>
                  <p className="text-sm text-muted-foreground">
                    Use Google Authenticator, Authy, or a similar app
                  </p>
                </div>
                <Button onClick={handleSetupTOTP} disabled={loading} className="w-full">
                  {loading ? 'Setting up...' : 'Setup Authenticator App'}
                </Button>
              </div>

              {error && (
                <Alert variant="destructive" className="mt-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2 mt-6">
                <Button onClick={onCancel} variant="outline" className="flex-1">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 'setup-totp' && (
          <Card>
            <CardHeader className="text-center">
              <CardTitle>Setup Authenticator App</CardTitle>
              <CardDescription>
                Scan the QR code with your authenticator app
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {qrCodeUrl && (
                <div className="text-center">
                  <div className="inline-block p-4 bg-card rounded-lg">
                    <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>Manual Entry Key</Label>
                <div className="flex gap-2">
                  <Input value={manualEntryKey} readOnly className="font-mono text-sm" />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(manualEntryKey);
                      toast.success('Key copied to clipboard');
                    }}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Use this key if you can't scan the QR code
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="totp-code">Enter verification code from your app</Label>
                <Input
                  id="totp-code"
                  type="text"
                  placeholder="123456"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  className="text-center text-lg tracking-widest font-mono"
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2">
                <Button onClick={() => setStep('choose')} variant="outline" className="flex-1">
                  Back
                </Button>
                <Button
                  onClick={handleVerifyMFA}
                  disabled={loading || verificationCode.length !== 6}
                  className="flex-1"
                >
                  {loading ? 'Verifying...' : 'Verify & Enable'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

      </motion.div>
    </div>
  );
};

export default MFASetup;