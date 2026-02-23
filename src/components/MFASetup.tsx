/**
 * MFA Setup Component
 * 
 * Provides UI for setting up Multi-Factor Authentication
 * - TOTP (Authenticator App)
 * - SMS-based MFA
 * - Backup codes management
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  Shield,
  Smartphone,
  QrCode,
  Copy,
  Check,
  AlertTriangle,
  Key,
  Download
} from 'lucide-react';
import { toast } from 'sonner';
import { setupMFA, verifyMFA, getMFAStatus } from '../api/auth';

interface MFASetupProps {
  onComplete?: () => void;
  onCancel?: () => void;
}

export const MFASetup: React.FC<MFASetupProps> = ({ onComplete, onCancel }) => {
  const [step, setStep] = useState<'choose' | 'setup-totp' | 'setup-sms' | 'verify' | 'backup-codes'>('choose');
  const [method, setMethod] = useState<'totp' | 'sms'>('totp');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // TOTP Setup
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [totpSecret, setTotpSecret] = useState('');
  const [manualEntryKey, setManualEntryKey] = useState('');

  // SMS Setup
  const [phoneNumber, setPhoneNumber] = useState('');

  // Verification
  const [verificationCode, setVerificationCode] = useState('');

  // Backup Codes
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [copiedCodes, setCopiedCodes] = useState(false);

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
      const result = await setupMFA('totp');
      setQrCodeUrl(result.qrCodeUrl);
      setTotpSecret(result.secret);
      setManualEntryKey(result.manualEntryKey);
      setBackupCodes(result.backupCodes || []);
      setStep('setup-totp');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSetupSMS = async () => {
    if (!phoneNumber) {
      setError('Please enter a phone number');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await setupMFA('sms', phoneNumber);
      setStep('verify');
      toast.success('SMS verification code sent!');
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
      const result = await verifyMFA(method, verificationCode, method === 'sms' ? phoneNumber : undefined);

      if (result.verified) {
        if (method === 'totp' && backupCodes.length > 0) {
          setStep('backup-codes');
        } else {
          toast.success('MFA enabled successfully!');
          onComplete?.();
        }
      } else {
        setError('Invalid verification code');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyBackupCodes = () => {
    const codesText = backupCodes.join('\n');
    navigator.clipboard.writeText(codesText);
    setCopiedCodes(true);
    toast.success('Backup codes copied to clipboard');
    setTimeout(() => setCopiedCodes(false), 2000);
  };

  const downloadBackupCodes = () => {
    const codesText = `Ataraxia MFA Backup Codes\n\nGenerated: ${new Date().toLocaleString()}\n\n${backupCodes.join('\n')}\n\nKeep these codes safe and secure!`;
    const blob = new Blob([codesText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ataraxia-backup-codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Backup codes downloaded');
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
          <div className="space-y-2">
            {mfaStatus.type === 'totp' && (
              <Badge variant="secondary" className="w-full justify-center">
                <QrCode className="w-4 h-4 mr-2" />
                Authenticator App Enabled
              </Badge>
            )}
            {mfaStatus.type === 'sms' && (
              <Badge variant="secondary" className="w-full justify-center">
                <Smartphone className="w-4 h-4 mr-2" />
                SMS Enabled
              </Badge>
            )}
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
              <Tabs value={method} onValueChange={(value) => setMethod(value as 'totp' | 'sms')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="totp">Authenticator App</TabsTrigger>
                  <TabsTrigger value="sms">SMS</TabsTrigger>
                </TabsList>

                <TabsContent value="totp" className="space-y-4">
                  <div className="text-center space-y-2">
                    <QrCode className="w-8 h-8 mx-auto text-blue-600" />
                    <h3 className="font-semibold">Authenticator App</h3>
                    <p className="text-sm text-muted-foreground">
                      Use Google Authenticator, Authy, or similar apps
                    </p>
                  </div>
                  <Button onClick={handleSetupTOTP} disabled={loading} className="w-full">
                    {loading ? 'Setting up...' : 'Setup Authenticator App'}
                  </Button>
                </TabsContent>

                <TabsContent value="sms" className="space-y-4">
                  <div className="text-center space-y-2">
                    <Smartphone className="w-8 h-8 mx-auto text-green-600" />
                    <h3 className="font-semibold">SMS Verification</h3>
                    <p className="text-sm text-muted-foreground">
                      Receive codes via text message
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1234567890"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleSetupSMS} disabled={loading || !phoneNumber} className="w-full">
                    {loading ? 'Sending code...' : 'Setup SMS MFA'}
                  </Button>
                </TabsContent>
              </Tabs>

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
                  <div className="inline-block p-4 bg-white rounded-lg">
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

        {step === 'verify' && method === 'sms' && (
          <Card>
            <CardHeader className="text-center">
              <CardTitle>Verify SMS Code</CardTitle>
              <CardDescription>
                Enter the 6-digit code sent to {phoneNumber}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sms-code">Verification Code</Label>
                <Input
                  id="sms-code"
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

        {step === 'backup-codes' && (
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                <Key className="w-6 h-6 text-yellow-600" />
              </div>
              <CardTitle>Save Your Backup Codes</CardTitle>
              <CardDescription>
                These codes can be used if you lose access to your authenticator app
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Store these codes in a safe place. Each code can only be used once.
                </AlertDescription>
              </Alert>

              <div className="bg-muted p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                  {backupCodes.map((code, index) => (
                    <div key={index} className="text-center py-1">
                      {code}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={copyBackupCodes} variant="outline" className="flex-1">
                  {copiedCodes ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Codes
                    </>
                  )}
                </Button>
                <Button onClick={downloadBackupCodes} variant="outline" className="flex-1">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>

              <Button onClick={onComplete} className="w-full">
                I've Saved My Backup Codes
              </Button>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  );
};

export default MFASetup;