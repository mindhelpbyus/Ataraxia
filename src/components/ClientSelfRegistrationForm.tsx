import React, { useState } from 'react';
import { Mail, Phone, MapPin, Calendar, User, Shield, CreditCard, Heart, Lock, Send, CheckCircle2, X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { Textarea } from './ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Separator } from './ui/separator';
import { toast } from 'sonner';
import { AddressAutocomplete } from './AddressAutocomplete';

interface ClientSelfRegistrationFormProps {
  clientEmail: string;
  clientPhone: string;
  clientFirstName: string;
  clientLastName: string;
  registrationToken?: string;
  onComplete?: () => void;
}

type VerificationStep = 'verify' | 'register' | 'complete';

export function ClientSelfRegistrationForm({
  clientEmail,
  clientPhone,
  clientFirstName,
  clientLastName,
  registrationToken,
  onComplete
}: ClientSelfRegistrationFormProps) {
  const [currentStep, setCurrentStep] = useState<VerificationStep>('verify');
  const [verificationMethod, setVerificationMethod] = useState<'email' | 'sms'>('email');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    // Section 1: Identifying Information (pre-filled from therapist)
    firstName: clientFirstName,
    lastName: clientLastName,
    preferredName: '',
    dateOfBirth: '',
    gender: '',
    pronouns: '',
    email: clientEmail,
    phone: clientPhone,
    address1: '',
    address2: '',
    city: '',
    state: '',
    zipCode: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    preferredContactMethod: 'email',

    // Section 2: Account / Login
    username: clientEmail,
    password: '',
    confirmPassword: '',
    consentPortalAccess: false,
    consent2FA: false,

    // Section 3: Insurance & Payment (optional)
    insuranceProvider: '',
    policyNumber: '',
    groupNumber: '',
    primaryInsuredName: '',
    primaryInsuredDOB: '',
    billingAddressSameAsPrimary: true,
    billingAddress1: '',
    billingAddress2: '',
    billingCity: '',
    billingState: '',
    billingZipCode: '',
    paymentMethod: '',

    // Section 4: Clinical & Health Information
    reasonForTherapy: '',
    currentMedications: '',
    allergies: '',
    primaryCarePhysician: '',
    previousTherapyHistory: '',
    riskAssessment: '',
    diagnoses: '',
  });

  const handleSendOTP = async () => {
    setIsVerifying(true);
    // TODO: Integrate with backend API to send OTP
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call

    setOtpSent(true);
    setIsVerifying(false);
    toast.success(`Verification code sent to your ${verificationMethod === 'email' ? 'email' : 'phone'}!`);
  };

  const handleVerifyOTP = async () => {
    if (otpCode.length !== 6) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }

    setIsVerifying(true);
    // TODO: Integrate with backend API to verify OTP
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

    // For demo purposes, accept any 6-digit code
    setIsVerifying(false);
    setCurrentStep('register');
    toast.success('Verification successful!');
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmitRegistration = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!formData.consentPortalAccess) {
      toast.error('You must consent to portal access to continue');
      return;
    }

    // TODO: Integrate with backend API to save client data
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call

    setCurrentStep('complete');
    toast.success('Registration completed successfully!');
  };

  // Verification Step
  if (currentStep === 'verify') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#fef7e6] to-[#fff7ed] flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-[#F97316] rounded-full flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <CardTitle>Verify Your Identity</CardTitle>
            <CardDescription>
              Welcome {clientFirstName}! Please verify your identity to complete your registration.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Choose verification method</Label>
              <Select value={verificationMethod} onValueChange={(value: 'email' | 'sms') => setVerificationMethod(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email - {clientEmail}
                    </div>
                  </SelectItem>
                  <SelectItem value="sms">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      SMS - {clientPhone}
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {!otpSent ? (
              <Button
                className="w-full bg-[#F97316] hover:bg-[#ea580c] text-white rounded-full"
                onClick={handleSendOTP}
                disabled={isVerifying}
              >
                {isVerifying ? 'Sending...' : 'Send Verification Code'}
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp">Enter 6-digit code</Label>
                  <Input
                    id="otp"
                    type="text"
                    maxLength={6}
                    placeholder="000000"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    className="text-center text-2xl tracking-widest"
                  />
                </div>
                <Button
                  className="w-full bg-[#F97316] hover:bg-[#ea580c] text-white rounded-full"
                  onClick={handleVerifyOTP}
                  disabled={isVerifying || otpCode.length !== 6}
                >
                  {isVerifying ? 'Verifying...' : 'Verify & Continue'}
                </Button>
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => {
                    setOtpSent(false);
                    setOtpCode('');
                  }}
                >
                  Resend Code
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Registration Form Step
  if (currentStep === 'register') {
    return (
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl mb-2">Complete Your Profile</h1>
            <p className="text-muted-foreground">
              Please provide additional information to help us serve you better
            </p>
          </div>

          <form onSubmit={handleSubmitRegistration} className="space-y-6">
            {/* Section 1: Identifying Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-[#F97316]" />
                  Identifying Information
                </CardTitle>
                <CardDescription>Basic information about you</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preferredName">Preferred Name / Nickname (Optional)</Label>
                  <Input
                    id="preferredName"
                    value={formData.preferredName}
                    onChange={(e) => handleInputChange('preferredName', e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="non-binary">Non-binary</SelectItem>
                        <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pronouns">Pronouns (Optional)</Label>
                  <Input
                    id="pronouns"
                    placeholder="e.g., she/her, he/him, they/them"
                    value={formData.pronouns}
                    onChange={(e) => handleInputChange('pronouns', e.target.value)}
                  />
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                      disabled
                    />
                  </div>
                  <div className="space-y-0.5">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <AddressAutocomplete
                      id="address1"
                      label="Street Address Line 1"
                      value={formData.address1}
                      onChange={(value, components) => {
                        handleInputChange('address1', value);
                        if (components) {
                          handleInputChange('city', components.city);
                          handleInputChange('state', components.state);
                          handleInputChange('zipCode', components.zip);
                        }
                      }}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address2">Street Address Line 2 (Optional)</Label>
                    <Input
                      id="address2"
                      placeholder="Apt, Suite, Floor, etc."
                      value={formData.address2}
                      onChange={(e) => handleInputChange('address2', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">ZIP Code *</Label>
                    <Input
                      id="zipCode"
                      value={formData.zipCode}
                      onChange={(e) => handleInputChange('zipCode', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContactName">Emergency Contact Name</Label>
                    <Input
                      id="emergencyContactName"
                      value={formData.emergencyContactName}
                      onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
                    />
                  </div>
                  <div className="space-y-0.5">
                    <Label htmlFor="emergencyContactPhone">Emergency Contact Phone</Label>
                    <Input
                      id="emergencyContactPhone"
                      type="tel"
                      value={formData.emergencyContactPhone}
                      onChange={(e) => handleInputChange('emergencyContactPhone', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preferredContactMethod">Preferred Contact Method</Label>
                  <Select value={formData.preferredContactMethod} onValueChange={(value) => handleInputChange('preferredContactMethod', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="phone">Phone Call</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Section 2: Account / Login Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-[#F97316]" />
                  Account & Login Information
                </CardTitle>
                <CardDescription>Set up your secure portal access</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username (Email)</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    disabled
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Password *</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      required
                      placeholder="Min. 8 characters"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password *</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="consentPortalAccess"
                    checked={formData.consentPortalAccess}
                    onCheckedChange={(checked) => handleInputChange('consentPortalAccess', checked)}
                  />
                  <Label htmlFor="consentPortalAccess" className="text-sm leading-relaxed cursor-pointer">
                    I consent to portal access and agree to the HIPAA Privacy Notice and Terms of Service *
                  </Label>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="consent2FA"
                    checked={formData.consent2FA}
                    onCheckedChange={(checked) => handleInputChange('consent2FA', checked)}
                  />
                  <Label htmlFor="consent2FA" className="text-sm leading-relaxed cursor-pointer">
                    Enable Two-Factor Authentication (2FA) for added security (Recommended)
                  </Label>
                </div>
              </CardContent>
            </Card>

            {/* Section 3: Insurance & Payment Information (Optional) */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-[#F97316]" />
                  Insurance & Payment Information
                  <span className="text-sm text-muted-foreground ml-2">(Optional)</span>
                </CardTitle>
                <CardDescription>You can skip this section and set up billing later</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="insuranceProvider">Insurance Provider</Label>
                    <Input
                      id="insuranceProvider"
                      value={formData.insuranceProvider}
                      onChange={(e) => handleInputChange('insuranceProvider', e.target.value)}
                      placeholder="e.g., Blue Cross Blue Shield"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="policyNumber">Policy Number</Label>
                    <Input
                      id="policyNumber"
                      value={formData.policyNumber}
                      onChange={(e) => handleInputChange('policyNumber', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="groupNumber">Group Number</Label>
                    <Input
                      id="groupNumber"
                      value={formData.groupNumber}
                      onChange={(e) => handleInputChange('groupNumber', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="paymentMethod">Payment Method</Label>
                    <Select value={formData.paymentMethod} onValueChange={(value) => handleInputChange('paymentMethod', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="insurance">Insurance</SelectItem>
                        <SelectItem value="credit-card">Credit Card</SelectItem>
                        <SelectItem value="ach">ACH / Bank Transfer</SelectItem>
                        <SelectItem value="self-pay">Self Pay</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="primaryInsuredName">Primary Insured Name</Label>
                    <Input
                      id="primaryInsuredName"
                      value={formData.primaryInsuredName}
                      onChange={(e) => handleInputChange('primaryInsuredName', e.target.value)}
                      placeholder="If different from client"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="primaryInsuredDOB">Primary Insured Date of Birth</Label>
                    <Input
                      id="primaryInsuredDOB"
                      type="date"
                      value={formData.primaryInsuredDOB}
                      onChange={(e) => handleInputChange('primaryInsuredDOB', e.target.value)}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="billingAddressSameAsPrimary"
                      checked={formData.billingAddressSameAsPrimary}
                      onCheckedChange={(checked) => {
                        handleInputChange('billingAddressSameAsPrimary', checked);
                        if (checked) {
                          // Auto-populate billing address with primary address
                          handleInputChange('billingAddress1', formData.address1);
                          handleInputChange('billingAddress2', formData.address2);
                          handleInputChange('billingCity', formData.city);
                          handleInputChange('billingState', formData.state);
                          handleInputChange('billingZipCode', formData.zipCode);
                        }
                      }}
                    />
                    <Label htmlFor="billingAddressSameAsPrimary" className="cursor-pointer">
                      Billing address is same as primary address
                    </Label>
                  </div>

                  {!formData.billingAddressSameAsPrimary && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <AddressAutocomplete
                            id="billingAddress1"
                            label="Billing Street Address Line 1"
                            value={formData.billingAddress1}
                            onChange={(value, components) => {
                              handleInputChange('billingAddress1', value);
                              if (components) {
                                handleInputChange('billingCity', components.city);
                                handleInputChange('billingState', components.state);
                                handleInputChange('billingZipCode', components.zip);
                              }
                            }}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="billingAddress2">Billing Street Address Line 2 (Optional)</Label>
                          <Input
                            id="billingAddress2"
                            placeholder="Apt, Suite, Floor, etc."
                            value={formData.billingAddress2}
                            onChange={(e) => handleInputChange('billingAddress2', e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="billingCity">Billing City</Label>
                          <Input
                            id="billingCity"
                            value={formData.billingCity}
                            onChange={(e) => handleInputChange('billingCity', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="billingState">Billing State</Label>
                          <Input
                            id="billingState"
                            value={formData.billingState}
                            onChange={(e) => handleInputChange('billingState', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="billingZipCode">Billing ZIP Code</Label>
                          <Input
                            id="billingZipCode"
                            value={formData.billingZipCode}
                            onChange={(e) => handleInputChange('billingZipCode', e.target.value)}
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Section 4: Clinical & Health Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-[#F97316]" />
                  Clinical & Health Information
                </CardTitle>
                <CardDescription>This information helps your therapist provide better care</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reasonForTherapy">Reason for Therapy / Goals</Label>
                  <Textarea
                    id="reasonForTherapy"
                    value={formData.reasonForTherapy}
                    onChange={(e) => handleInputChange('reasonForTherapy', e.target.value)}
                    placeholder="What brings you to therapy? What would you like to work on?"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentMedications">Current Medications (Optional)</Label>
                  <Textarea
                    id="currentMedications"
                    value={formData.currentMedications}
                    onChange={(e) => handleInputChange('currentMedications', e.target.value)}
                    placeholder="List any medications you're currently taking"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="allergies">Allergies (Optional)</Label>
                  <Input
                    id="allergies"
                    value={formData.allergies}
                    onChange={(e) => handleInputChange('allergies', e.target.value)}
                    placeholder="Any allergies we should know about?"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="primaryCarePhysician">Primary Care Physician (Optional)</Label>
                  <Input
                    id="primaryCarePhysician"
                    value={formData.primaryCarePhysician}
                    onChange={(e) => handleInputChange('primaryCarePhysician', e.target.value)}
                    placeholder="Name and contact information"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="previousTherapyHistory">Previous Therapy / Mental Health History (Optional)</Label>
                  <Textarea
                    id="previousTherapyHistory"
                    value={formData.previousTherapyHistory}
                    onChange={(e) => handleInputChange('previousTherapyHistory', e.target.value)}
                    placeholder="Have you received therapy or mental health treatment before?"
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setCurrentStep('verify')}
              >
                Back
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-[#F97316] hover:bg-[#ea580c] text-white rounded-full"
                disabled={!formData.consentPortalAccess}
              >
                Complete Registration
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Complete Step
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#ecf7ed] to-[#d1f4e0] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-[#2e844a] rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="h-8 w-8 text-white" />
          </div>
          <CardTitle>Registration Complete!</CardTitle>
          <CardDescription>
            Welcome to Ataraxia, {clientFirstName}! Your profile has been successfully created.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <p className="text-sm">
              <strong>What's next?</strong>
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>You'll receive a confirmation email shortly</li>
              <li>Your therapist will review your information</li>
              <li>You can now log in to your client portal</li>
              <li>Schedule your first appointment</li>
            </ul>
          </div>

          <Button
            className="w-full bg-[#F97316] hover:bg-[#ea580c] text-white rounded-full"
            onClick={() => {
              if (onComplete) onComplete();
              // Redirect to login page
              window.location.href = '/login';
            }}
          >
            Go to Login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
