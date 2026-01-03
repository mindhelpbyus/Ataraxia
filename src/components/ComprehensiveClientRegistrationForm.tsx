import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Progress } from './ui/progress';
import { Switch } from './ui/switch';
import { toast } from 'sonner';
import {
  User, Phone, Mail, MapPin, Shield, CreditCard, FileText,
  Stethoscope, Users, Calendar as CalendarIcon, Upload,
  CheckCircle2, AlertCircle, Building2, Heart, Brain,
  Clock, Video, DollarSign, Lock, ChevronRight, ChevronLeft,
  Check, X, Eye, EyeOff, Save, Send, Camera
} from 'lucide-react';
import { format } from 'date-fns';
import { PhoneInput } from './PhoneInput';
import { PresentingConcerns, PresentingConcernsData } from './PresentingConcerns';
import { SafetyRiskScreening, SafetyScreeningData } from './SafetyRiskScreening';
import { SignatureCapture, SignatureData } from './SignatureCapture';
import { AddressAutocomplete } from './AddressAutocomplete';
import { Country, State, City } from 'country-state-city';
import { getCrisisResources } from '../data/crisisResources';
import { AvatarGalleryDialog } from './AvatarGalleryDialog';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';



// Comprehensive client data interface
interface ComprehensiveClientData {
  // A. Basic Info
  firstName: string;
  lastName: string;
  middleName?: string;
  gender: string;
  dateOfBirth: Date | null;
  phone: string;
  countryCode: string;
  email: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  emergencyContactName: string;
  emergencyContactRelationship: string;
  emergencyContactPhone: string;
  emergencyContactCountryCode: string;
  preferredLanguage: string;

  // B. Insurance/Benefits
  hasInsurance: boolean;
  insuranceProvider?: string;
  insurancePlan?: string;
  memberID?: string;
  groupNumber?: string;
  insuranceCardFront?: File;
  insuranceCardBack?: File;
  copayAmount?: string;
  deductibleMet?: boolean;

  // C. Intake Forms (Consents)
  consentToTreat: boolean;
  hipaaConsent: boolean;
  financialPolicyConsent: boolean;
  telehealthConsent: boolean;
  releaseOfInformation: boolean;
  safetyPlanAcknowledged?: boolean;
  minorConsentProvided?: boolean;
  dataUsageConsent?: boolean;

  // D. Clinical Intake
  presentingConcerns: string; // Legacy field - now using structured data below
  symptoms: string[];
  currentMedications: string;
  pastDiagnoses: string;
  substanceUse: string;
  suicidalIdeation: string; // Legacy - now using safety screening
  selfHarmHistory: string; // Legacy - now using safety screening
  previousTherapyExperience: string;

  // D1. Presenting Concerns (Structured - NEW)
  presentingConcernsData: PresentingConcernsData;

  // D2. Safety & Risk Screening (NEW - CRITICAL)
  safetyScreeningData: SafetyScreeningData;

  // E. Matching Preferences
  preferredTherapistGender?: string;
  preferredSpecialty: string[];
  preferredAvailability: string[];
  preferredLanguageTherapy: string;
  preferredModality: string[];

  // F. Payment Setup
  paymentMethod: string;
  cardOnFile?: boolean;
  billingAddress1?: string;
  billingAddress2?: string;
  billingAddressSameAsPrimary?: boolean;
  billingCity?: string;
  billingState?: string;
  billingZipCode?: string;
  slidingScale?: boolean;
  financialAid?: boolean;

  // G. Portal Account
  username: string;
  password: string;
  allowViewNotes: boolean;
  allowViewInvoices: boolean;

  // G1. Digital Signature (NEW - CRITICAL)
  signature: SignatureData | null;

  // H. Documents
  idProof?: File;
  medicalRecords?: File[];
  authorizationForms?: File[];

  // I. Appointment Setup
  preferredFrequency: string;
  preferredTherapist?: string;
  careTeamNotes?: string;

  // J. Organization (if enterprise)
  employerProgramID?: string;
  employeeID?: string;
  preApprovedSessions?: number;
}

interface Props {
  clientEmail: string;
  clientPhone: string;
  clientFirstName: string;
  clientLastName: string;
  registrationToken: string;
  onComplete: (data: ComprehensiveClientData) => void;
  organizationMode?: boolean; // For enterprise/employer programs
}

export function ComprehensiveClientRegistrationForm({
  clientEmail,
  clientPhone,
  clientFirstName,
  clientLastName,
  registrationToken,
  onComplete,
  organizationMode = false
}: Props) {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [verificationType, setVerificationType] = useState<'email' | 'sms'>('email');
  const [showPassword, setShowPassword] = useState(false);
  const [insuranceEligibilityChecked, setInsuranceEligibilityChecked] = useState(false);
  const [insuranceEligible, setInsuranceEligible] = useState<boolean | null>(null);
  const [showAvatarGallery, setShowAvatarGallery] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<string>('');

  // Form data state
  const [formData, setFormData] = useState<ComprehensiveClientData>({
    firstName: clientFirstName,
    lastName: clientLastName,
    gender: '',
    dateOfBirth: null,
    phone: clientPhone,
    countryCode: '+1',
    email: clientEmail,
    address1: '',
    address2: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
    emergencyContactName: '',
    emergencyContactRelationship: '',
    emergencyContactPhone: '',
    emergencyContactCountryCode: '+1',
    preferredLanguage: 'English',
    hasInsurance: false,
    consentToTreat: false,
    hipaaConsent: false,
    financialPolicyConsent: false,
    telehealthConsent: false,
    releaseOfInformation: false,
    dataUsageConsent: false,
    presentingConcerns: '',
    symptoms: [],
    currentMedications: '',
    pastDiagnoses: '',
    substanceUse: 'none',
    suicidalIdeation: 'none',
    selfHarmHistory: 'none',
    previousTherapyExperience: '',
    // New structured data
    presentingConcernsData: {
      mainReason: '',
      primaryConcerns: [],
      severityLevel: '',
      otherConcernDetails: ''
    },
    safetyScreeningData: {
      suicidalThoughts: '',
      selfHarmThoughts: '',
      suicidePlan: '',
      accessToMeans: '',
      suicideIntent: '',
      pastSuicideAttempts: '',
      pastSelfHarm: '',
      safeAtHome: '',
      experiencedAbuse: '',
      afraidOfSomeone: '',
      psychoticSymptoms: '',
      substanceUseControl: '',
      hasSocialSupport: '',
      copingStrategies: '',
      additionalSafetyConcerns: '',
      wantsSafetyPlan: false
    },
    preferredSpecialty: [],
    preferredAvailability: [],
    preferredLanguageTherapy: 'English',
    preferredModality: [],
    paymentMethod: '',
    billingAddressSameAsPrimary: false,
    username: '',
    password: '',
    allowViewNotes: true,
    allowViewInvoices: true,
    preferredFrequency: 'weekly',
    signature: null
  });

  const totalSteps = organizationMode ? 13 : 12;
  const progressPercent = ((currentStep - 1) / totalSteps) * 100;

  // Step configuration
  const stepTitles = [
    'Verify Identity',
    'Basic Information',
    'What Brings You Here', // NEW: Presenting Concerns
    'Safety & Wellness', // NEW: Safety Screening
    'Insurance & Benefits',
    'Consent Forms',
    'Clinical History',
    'Therapist Preferences',
    'Payment Setup',
    'Document Upload',
    'Appointment Setup',
    'Sign & Submit', // NEW: Signature
    ...(organizationMode ? ['Organization Info'] : [])
  ];

  // Mock OTP send
  const handleSendOTP = () => {
    toast.success(`OTP sent to ${verificationType === 'email' ? clientEmail : clientPhone}`, {
      description: 'For testing, use: 123456, 111111, or 000000'
    });
    setOtpSent(true);
  };

  // Mock OTP verify
  const handleVerifyOTP = () => {
    const validCodes = ['123456', '111111', '000000'];
    if (validCodes.includes(otpCode)) {
      setOtpVerified(true);
      setCurrentStep(2);
      toast.success('Identity verified successfully!');
    } else {
      toast.error('Invalid OTP code', {
        description: 'Please try again or request a new code'
      });
    }
  };

  // Mock insurance eligibility check
  const handleCheckInsurance = () => {
    setInsuranceEligibilityChecked(true);
    // Mock 80% success rate
    const eligible = Math.random() > 0.2;
    setInsuranceEligible(eligible);

    if (eligible) {
      toast.success('Insurance Verified!', {
        description: 'Your insurance is active and covers mental health services'
      });
    } else {
      toast.warning('Insurance Not Verified', {
        description: 'Please contact your insurance provider or choose self-pay'
      });
    }
  };

  // Update form data
  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Toggle array values (for multi-select)
  const toggleArrayValue = (field: keyof ComprehensiveClientData, value: string) => {
    const currentArray = (formData[field] as string[]) || [];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    updateFormData(field, newArray);
  };

  // Validate current step
  const validateStep = (): boolean => {
    switch (currentStep) {
      case 1:
        return otpVerified;
      case 2:
        return !!(
          formData.firstName &&
          formData.lastName &&
          formData.gender &&
          formData.dateOfBirth &&
          formData.phone &&
          formData.email &&
          formData.emergencyContactName &&
          formData.emergencyContactPhone
        );
      case 3: // Presenting Concerns
        return !!(
          formData.presentingConcernsData.mainReason &&
          formData.presentingConcernsData.primaryConcerns.length > 0 &&
          formData.presentingConcernsData.severityLevel
        );
      case 4: // Safety Screening - all questions must be answered
        return !!(
          formData.safetyScreeningData.suicidalThoughts &&
          formData.safetyScreeningData.selfHarmThoughts &&
          formData.safetyScreeningData.suicidePlan &&
          formData.safetyScreeningData.accessToMeans &&
          formData.safetyScreeningData.suicideIntent &&
          formData.safetyScreeningData.pastSuicideAttempts &&
          formData.safetyScreeningData.pastSelfHarm &&
          formData.safetyScreeningData.safeAtHome &&
          formData.safetyScreeningData.afraidOfSomeone &&
          formData.safetyScreeningData.psychoticSymptoms &&
          formData.safetyScreeningData.substanceUseControl &&
          formData.safetyScreeningData.hasSocialSupport
        );
      case 5: // Insurance
        if (!formData.hasInsurance) return true;
        return !!(formData.insuranceProvider && formData.memberID);
      case 6: // Consent Forms
        return !!(
          formData.consentToTreat &&
          formData.hipaaConsent &&
          formData.financialPolicyConsent &&
          formData.telehealthConsent &&
          formData.dataUsageConsent
        );
      case 7: // Clinical History
        return !!(formData.presentingConcerns); // Legacy field, optional
      case 8: // Matching Preferences
        return formData.preferredSpecialty.length > 0;
      case 9: // Payment
        return !!(formData.paymentMethod);
      case 10: // Documents
        return true; // Documents are optional
      case 11: // Appointment Setup
        return !!(formData.username && formData.password);
      case 12: // Signature - REQUIRED
        return !!(formData.signature);
      case 13: // Organization Info
        if (!organizationMode) return true;
        return !!(formData.employeeID);
      default:
        return true;
    }
  };

  // Handle next step
  const handleNext = () => {
    if (!validateStep()) {
      toast.error('Please complete all required fields');
      return;
    }
    if (currentStep < totalSteps + 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  // Handle previous step
  const handlePrevious = () => {
    if (currentStep > 2) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Handle form submission
  const handleSubmit = () => {
    toast.success('Registration Completed! 🎉', {
      description: 'Your profile has been created successfully'
    });
    onComplete(formData);
  };

  // Render current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderOTPVerification();
      case 2:
        return renderBasicInformation();
      case 3:
        return renderPresentingConcerns(); // NEW
      case 4:
        return renderSafetyScreening(); // NEW
      case 5:
        return renderInsuranceBenefits();
      case 6:
        return renderConsentForms();
      case 7:
        return renderClinicalIntake();
      case 8:
        return renderMatchingPreferences();
      case 9:
        return renderPaymentSetup();
      case 10:
        return renderDocumentUpload();
      case 11:
        return renderAppointmentSetup();
      case 12:
        return renderSignature(); // NEW
      case 13:
        if (organizationMode) return renderOrganizationInfo();
        return null;
      default:
        return null;
    }
  };

  // Step 1: OTP Verification
  const renderOTPVerification = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Shield className="h-16 w-16 text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Verify Your Identity</h2>
        <p className="text-muted-foreground">
          To ensure your security, please verify your identity using a one-time password
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Choose Verification Method</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup value={verificationType} onValueChange={(v: 'email' | 'sms') => setVerificationType(v)}>
            <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-accent">
              <RadioGroupItem value="email" id="email" />
              <Label htmlFor="email" className="flex items-center gap-2 cursor-pointer flex-1">
                <Mail className="h-4 w-4" />
                <div>
                  <div className="font-medium">Email Verification</div>
                  <div className="text-sm text-muted-foreground">{clientEmail}</div>
                </div>
              </Label>
            </div>
            <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-accent">
              <RadioGroupItem value="sms" id="sms" />
              <Label htmlFor="sms" className="flex items-center gap-2 cursor-pointer flex-1">
                <Phone className="h-4 w-4" />
                <div>
                  <div className="font-medium">SMS Verification</div>
                  <div className="text-sm text-muted-foreground">{clientPhone}</div>
                </div>
              </Label>
            </div>
          </RadioGroup>

          {!otpSent ? (
            <Button onClick={handleSendOTP} className="w-full" size="lg">
              <Send className="h-4 w-4 mr-2" />
              Send Verification Code
            </Button>
          ) : (
            <div className="space-y-4">
              <div>
                <Label>Enter 6-Digit Code</Label>
                <Input
                  type="text"
                  maxLength={6}
                  placeholder="000000"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  className="text-center text-2xl tracking-widest"
                />
              </div>
              <Button onClick={handleVerifyOTP} className="w-full" size="lg">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Verify Code
              </Button>
              <Button variant="ghost" onClick={handleSendOTP} className="w-full">
                Resend Code
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  // Step 2: Basic Information
  const renderBasicInformation = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Basic Information</h2>
        <p className="text-muted-foreground">Tell us about yourself</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Profile Avatar
          </CardTitle>
          <CardDescription>Choose an avatar for your profile</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <Avatar className="w-24 h-24 border-4 border-background shadow-lg">
              <AvatarImage src={selectedAvatar} />
              <AvatarFallback className="text-2xl bg-muted text-muted-foreground font-semibold">
                {formData.firstName[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center sm:text-left">
              <p className="text-sm text-muted-foreground mb-3">
                Select an illustrated avatar from our gallery
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAvatarGallery(true)}
                className="w-full sm:w-auto"
              >
                <User className="h-4 w-4 mr-2" />
                Choose Avatar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Personal Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>First Name *</Label>
              <Input
                value={formData.firstName}
                onChange={(e) => updateFormData('firstName', e.target.value)}
              />
            </div>
            <div>
              <Label>Middle Name</Label>
              <Input
                value={formData.middleName || ''}
                onChange={(e) => updateFormData('middleName', e.target.value)}
              />
            </div>
            <div>
              <Label>Last Name *</Label>
              <Input
                value={formData.lastName}
                onChange={(e) => updateFormData('lastName', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Gender *</Label>
              <Select value={formData.gender} onValueChange={(v) => updateFormData('gender', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="non-binary">Non-binary</SelectItem>
                  <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="dob">Date of Birth *</Label>
              <Input
                id="dob"
                type="date"
                value={formData.dateOfBirth ? format(formData.dateOfBirth, 'yyyy-MM-dd') : ''}
                onChange={(e) => {
                  const dateStr = e.target.value;
                  if (dateStr) {
                    const [year, month, day] = dateStr.split('-').map(Number);
                    const date = new Date(year, month - 1, day);
                    updateFormData('dateOfBirth', date);
                  } else {
                    updateFormData('dateOfBirth', null);
                  }
                }}
                max={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PhoneInput
              value={formData.phone}
              countryCode={formData.countryCode}
              onChange={(phone, code) => {
                updateFormData('phone', phone);
                updateFormData('countryCode', code);
                // Also update emergency contact country code to match
                updateFormData('emergencyContactCountryCode', code);
              }}
              label="Phone"
              required
              disabled={!!clientPhone}
            />
            <div>
              <Label>Email *</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => updateFormData('email', e.target.value)}
                disabled={!!clientEmail}
                className={clientEmail ? "bg-muted" : ""}
              />
            </div>
          </div>

          <div>
            <Label>Preferred Language *</Label>
            <Select value={formData.preferredLanguage} onValueChange={(v) => updateFormData('preferredLanguage', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="English">English</SelectItem>
                <SelectItem value="Spanish">Spanish</SelectItem>
                <SelectItem value="French">French</SelectItem>
                <SelectItem value="Mandarin">Mandarin</SelectItem>
                <SelectItem value="Arabic">Arabic</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Address
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <AddressAutocomplete
              label="Street Address 1"
              value={formData.address1}
              onChange={(value, components) => {
                updateFormData('address1', value);
                if (components) {
                  updateFormData('city', components.city);
                  updateFormData('state', components.state);
                  updateFormData('zipCode', components.zip);
                  if (components.countryCode) {
                    updateFormData('country', components.countryCode);
                    // Update phone codes based on address country
                    const countryData = Country.getCountryByCode(components.countryCode);
                    if (countryData) {
                      const dialCode = `+${countryData.phonecode}`;
                      updateFormData('countryCode', dialCode);
                      updateFormData('emergencyContactCountryCode', dialCode);
                    }
                  }
                }
              }}
              placeholder="123 Main Street"
              required
            />
          </div>
          <div>
            <Label>Street Address 2</Label>
            <Input
              value={formData.address2 || ''}
              onChange={(e) => updateFormData('address2', e.target.value)}
              placeholder="Apt, Suite, Unit, Building (optional)"
            />
          </div>

          <div>
            <Label>Country</Label>
            <Select value={formData.country} onValueChange={(v) => {
              updateFormData('country', v);
              // Update phone codes based on selected country
              const countryData = Country.getCountryByCode(v);
              if (countryData) {
                const dialCode = `+${countryData.phonecode}`;
                updateFormData('countryCode', dialCode);
                updateFormData('emergencyContactCountryCode', dialCode);
              }
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {Country.getAllCountries().map((country) => (
                  <SelectItem key={country.isoCode} value={country.isoCode}>
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>City</Label>
              <Select value={formData.city} onValueChange={(v) => updateFormData('city', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                  {City.getCitiesOfState(formData.country, formData.state).map((city) => (
                    <SelectItem key={city.name} value={city.name}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>State</Label>
              <Select value={formData.state} onValueChange={(v) => updateFormData('state', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {State.getStatesOfCountry(formData.country).map((state) => (
                    <SelectItem key={state.isoCode} value={state.isoCode}>
                      {state.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Zip Code</Label>
              <Input
                value={formData.zipCode}
                onChange={(e) => updateFormData('zipCode', e.target.value)}
                maxLength={10}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Emergency Contact *
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Contact Name *</Label>
              <Input
                value={formData.emergencyContactName}
                onChange={(e) => updateFormData('emergencyContactName', e.target.value)}
                placeholder="Full name"
              />
            </div>
            <div>
              <Label>Relationship *</Label>
              <Input
                value={formData.emergencyContactRelationship}
                onChange={(e) => updateFormData('emergencyContactRelationship', e.target.value)}
                placeholder="e.g., Spouse, Parent, Friend"
              />
            </div>
          </div>
          <PhoneInput
            value={formData.emergencyContactPhone}
            countryCode={formData.emergencyContactCountryCode}
            onChange={(phone, code) => {
              updateFormData('emergencyContactPhone', phone);
              updateFormData('emergencyContactCountryCode', code);
            }}
            label="Contact Phone"
            required
          />
        </CardContent>
      </Card>
    </div>
  );

  // Step 3: Presenting Concerns (NEW)
  const renderPresentingConcerns = () => (
    <div className="space-y-6">
      <PresentingConcerns
        data={formData.presentingConcernsData}
        onChange={(data) => updateFormData('presentingConcernsData', data)}
      />
    </div>
  );

  // Step 4: Safety & Risk Screening (NEW - CRITICAL)
  const renderSafetyScreening = () => (
    <div className="space-y-6">
      <SafetyRiskScreening
        data={formData.safetyScreeningData}
        onChange={(data) => updateFormData('safetyScreeningData', data)}
        countryCode={formData.country}
      />
    </div>
  );

  // Step 5: Insurance & Benefits
  const renderInsuranceBenefits = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Insurance & Benefits</h2>
        <p className="text-muted-foreground">Help us verify your coverage</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Insurance Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Do you have insurance?</Label>
              <p className="text-sm text-muted-foreground">We accept most major insurance providers</p>
            </div>
            <Switch
              checked={formData.hasInsurance}
              onCheckedChange={(checked) => updateFormData('hasInsurance', checked)}
            />
          </div>

          {formData.hasInsurance && (
            <>
              <Separator />
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Insurance Provider *</Label>
                    <Select value={formData.insuranceProvider} onValueChange={(v) => updateFormData('insuranceProvider', v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select provider" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="aetna">Aetna</SelectItem>
                        <SelectItem value="anthem">Anthem Blue Cross</SelectItem>
                        <SelectItem value="bcbs">Blue Cross Blue Shield</SelectItem>
                        <SelectItem value="cigna">Cigna</SelectItem>
                        <SelectItem value="humana">Humana</SelectItem>
                        <SelectItem value="kaiser">Kaiser Permanente</SelectItem>
                        <SelectItem value="united">UnitedHealthcare</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Insurance Plan</Label>
                    <Input
                      value={formData.insurancePlan || ''}
                      onChange={(e) => updateFormData('insurancePlan', e.target.value)}
                      placeholder="e.g., PPO, HMO"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Member ID *</Label>
                    <Input
                      value={formData.memberID || ''}
                      onChange={(e) => updateFormData('memberID', e.target.value)}
                      placeholder="As shown on insurance card"
                    />
                  </div>
                  <div>
                    <Label>Group Number</Label>
                    <Input
                      value={formData.groupNumber || ''}
                      onChange={(e) => updateFormData('groupNumber', e.target.value)}
                      placeholder="Optional"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Copay Amount</Label>
                    <Input
                      type="number"
                      value={formData.copayAmount || ''}
                      onChange={(e) => updateFormData('copayAmount', e.target.value)}
                      placeholder="$0"
                    />
                  </div>
                  <div className="flex items-center space-x-2 pt-6">
                    <Checkbox
                      id="deductible"
                      checked={formData.deductibleMet}
                      onCheckedChange={(checked) => updateFormData('deductibleMet', checked)}
                    />
                    <Label htmlFor="deductible">Deductible already met this year</Label>
                  </div>
                </div>

                <div>
                  <Label>Upload Insurance Card</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-accent cursor-pointer">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm font-medium">Front of Card</p>
                      <p className="text-xs text-muted-foreground">Click to upload</p>
                    </div>
                    <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-accent cursor-pointer">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm font-medium">Back of Card</p>
                      <p className="text-xs text-muted-foreground">Click to upload</p>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleCheckInsurance}
                  variant="outline"
                  className="w-full"
                  disabled={!formData.insuranceProvider || !formData.memberID}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  {insuranceEligibilityChecked ? 'Re-check' : 'Verify'} Insurance Eligibility
                </Button>

                {insuranceEligibilityChecked && insuranceEligible !== null && (
                  <div className={`flex items-center gap-2 p-4 rounded-lg ${insuranceEligible ? 'bg-green-50 text-green-900' : 'bg-yellow-50 text-yellow-900'
                    }`}>
                    {insuranceEligible ? (
                      <>
                        <CheckCircle2 className="h-5 w-5" />
                        <div>
                          <p className="font-medium">Insurance Verified</p>
                          <p className="text-sm">Your insurance is active and covers mental health services</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-5 w-5" />
                        <div>
                          <p className="font-medium">Unable to Verify</p>
                          <p className="text-sm">Please contact your insurance or choose self-pay option</p>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </>
          )}

          {!formData.hasInsurance && (
            <div className="flex items-center gap-2 p-4 rounded-lg bg-blue-50 text-blue-900">
              <DollarSign className="h-5 w-5" />
              <div>
                <p className="font-medium">Self-Pay Option</p>
                <p className="text-sm">We offer competitive rates and sliding scale fees based on income</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  // Step 4: Consent Forms
  const renderConsentForms = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Consent & Agreements</h2>
        <p className="text-muted-foreground">Please review and accept the required consents</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Required Consents
          </CardTitle>
          <CardDescription>All consents are required to proceed</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start space-x-3 p-4 border rounded-lg">
            <Checkbox
              id="consent-treat"
              checked={formData.consentToTreat}
              onCheckedChange={(checked) => updateFormData('consentToTreat', checked)}
            />
            <div className="flex-1">
              <Label htmlFor="consent-treat" className="text-base font-medium cursor-pointer">
                Consent to Treat *
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                I consent to receive mental health treatment and understand the nature of therapy services
              </p>
              <Button variant="link" className="p-0 h-auto text-sm">View full document</Button>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg">
            <Checkbox
              id="hipaa"
              checked={formData.hipaaConsent}
              onCheckedChange={(checked) => updateFormData('hipaaConsent', checked)}
            />
            <div className="flex-1">
              <Label htmlFor="hipaa" className="text-base font-medium cursor-pointer">
                HIPAA Notice of Privacy Practices *
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                I acknowledge receipt of the Notice of Privacy Practices and understand my privacy rights
              </p>
              <Button variant="link" className="p-0 h-auto text-sm">View full document</Button>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg">
            <Checkbox
              id="financial"
              checked={formData.financialPolicyConsent}
              onCheckedChange={(checked) => updateFormData('financialPolicyConsent', checked)}
            />
            <div className="flex-1">
              <Label htmlFor="financial" className="text-base font-medium cursor-pointer">
                Financial Policy Agreement *
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                I understand the payment policies, cancellation fees, and financial responsibilities
              </p>
              <Button variant="link" className="p-0 h-auto text-sm">View full document</Button>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg">
            <Checkbox
              id="telehealth"
              checked={formData.telehealthConsent}
              onCheckedChange={(checked) => updateFormData('telehealthConsent', checked)}
            />
            <div className="flex-1">
              <Label htmlFor="telehealth" className="text-base font-medium cursor-pointer">
                Telehealth Consent *
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                I consent to receive therapy services via secure video conferencing technology
              </p>
              <Button variant="link" className="p-0 h-auto text-sm">View full document</Button>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg bg-blue-50/50">
            <Checkbox
              id="data-usage"
              checked={formData.dataUsageConsent}
              onCheckedChange={(checked) => updateFormData('dataUsageConsent', checked)}
            />
            <div className="flex-1">
              <Label htmlFor="data-usage" className="text-base font-medium cursor-pointer">
                Data Usage & AI Safety Monitoring *
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                I understand that my safety assessment data will be used to:
              </p>
              <ul className="list-disc list-inside text-sm text-muted-foreground mt-1 space-y-1">
                <li>Match me with the most appropriate therapist</li>
                <li>Provide personalized care recommendations</li>
                <li>Monitor safety risks and predict trends</li>
                <li>Prepare my therapist for sessions</li>
                <li>Classify case severity for proper care allocation</li>
              </ul>
              <p className="text-sm text-muted-foreground mt-1">
                AI systems may assist in these processes under strict clinical supervision. Your data is never sold or used for unauthorized purposes.
              </p>
            </div>
          </div>

          <Separator />

          <div className="flex items-start space-x-3 p-4 border rounded-lg">
            <Checkbox
              id="roi"
              checked={formData.releaseOfInformation}
              onCheckedChange={(checked) => updateFormData('releaseOfInformation', checked)}
            />
            <div className="flex-1">
              <Label htmlFor="roi" className="text-base font-medium cursor-pointer">
                Release of Information (Optional)
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Authorize sharing of information with other healthcare providers if needed
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg">
            <Checkbox
              id="safety"
              checked={formData.safetyPlanAcknowledged}
              onCheckedChange={(checked) => updateFormData('safetyPlanAcknowledged', checked)}
            />
            <div className="flex-1">
              <Label htmlFor="safety" className="text-base font-medium cursor-pointer">
                Safety Plan Acknowledgment (Optional)
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                I understand the crisis resources and safety planning procedures
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex gap-2">
          <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-yellow-900">
            <p className="font-medium mb-1">Important Legal Information</p>
            <p>By checking these boxes, you are electronically signing these documents. This signature has the same legal effect as a handwritten signature.</p>
          </div>
        </div>
      </div>
    </div>
  );

  // Step 5: Clinical Intake
  const renderClinicalIntake = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Clinical Intake</h2>
        <p className="text-muted-foreground">Help us understand your mental health needs</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5" />
            Primary Concerns
          </CardTitle>
          <CardDescription>What brings you to therapy today?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Presenting Concerns *</Label>
            <Textarea
              value={formData.presentingConcerns}
              onChange={(e) => updateFormData('presentingConcerns', e.target.value)}
              placeholder="Please describe what you'd like help with..."
              rows={4}
            />
          </div>

          <div>
            <Label>Current Symptoms (Select all that apply)</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
              {['Anxiety', 'Depression', 'Stress', 'Sleep issues', 'Trauma', 'Grief', 'Relationship issues', 'Anger', 'Mood swings'].map(symptom => (
                <div key={symptom} className="flex items-center space-x-2">
                  <Checkbox
                    id={symptom}
                    checked={formData.symptoms.includes(symptom)}
                    onCheckedChange={() => toggleArrayValue('symptoms', symptom)}
                  />
                  <Label htmlFor={symptom} className="cursor-pointer">{symptom}</Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Medical History
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Current Medications</Label>
            <Textarea
              value={formData.currentMedications}
              onChange={(e) => updateFormData('currentMedications', e.target.value)}
              placeholder="List any medications you're currently taking (including psychiatric medications)"
              rows={3}
            />
          </div>

          <div>
            <Label>Past Mental Health Diagnoses</Label>
            <Textarea
              value={formData.pastDiagnoses}
              onChange={(e) => updateFormData('pastDiagnoses', e.target.value)}
              placeholder="Have you been diagnosed with any mental health conditions? If yes, please list them"
              rows={3}
            />
          </div>

          <div>
            <Label>Previous Therapy Experience</Label>
            <Textarea
              value={formData.previousTherapyExperience}
              onChange={(e) => updateFormData('previousTherapyExperience', e.target.value)}
              placeholder="Have you been in therapy before? What was helpful or unhelpful?"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Substance Use & Risk Assessment
          </CardTitle>
          <CardDescription>Confidential information to ensure your safety</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Substance Use</Label>
            <Select value={formData.substanceUse} onValueChange={(v) => updateFormData('substanceUse', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No current use</SelectItem>
                <SelectItem value="occasional">Occasional use</SelectItem>
                <SelectItem value="regular">Regular use</SelectItem>
                <SelectItem value="concerned">Concerned about my use</SelectItem>
                <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Suicidal Thoughts</Label>
            <Select value={formData.suicidalIdeation} onValueChange={(v) => updateFormData('suicidalIdeation', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No current thoughts</SelectItem>
                <SelectItem value="past">Had thoughts in the past</SelectItem>
                <SelectItem value="passive">Passive thoughts (no plan)</SelectItem>
                <SelectItem value="active">Active thoughts (with plan)</SelectItem>
                <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Self-Harm History</Label>
            <Select value={formData.selfHarmHistory} onValueChange={(v) => updateFormData('selfHarmHistory', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No history</SelectItem>
                <SelectItem value="past">Past history (not current)</SelectItem>
                <SelectItem value="current">Current behaviors</SelectItem>
                <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex gap-2">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-900 w-full">
                <p className="font-medium mb-1">Crisis Resources</p>
                <p className="mb-2">If you're in crisis or having thoughts of suicide:</p>
                <div className="grid gap-2 mt-2">
                  {getCrisisResources(formData.country).map((resource) => (
                    <div key={resource.id} className="flex items-center justify-between bg-white/50 p-2 rounded border border-red-100">
                      <div>
                        <span className="font-bold">{resource.name}:</span> {resource.number}
                      </div>
                      <div className="flex gap-1">
                        {resource.method.includes('call') && <Badge variant="outline" className="bg-white text-[10px] h-5">Call</Badge>}
                        {resource.method.includes('text') && <Badge variant="outline" className="bg-white text-[10px] h-5">Text</Badge>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Step 6: Matching Preferences
  const renderMatchingPreferences = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Therapist Preferences</h2>
        <p className="text-muted-foreground">Help us match you with the right therapist</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Therapist Matching
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Preferred Therapist Gender</Label>
            <Select value={formData.preferredTherapistGender} onValueChange={(v) => updateFormData('preferredTherapistGender', v)}>
              <SelectTrigger>
                <SelectValue placeholder="No preference" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no-preference">No preference</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="non-binary">Non-binary</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Specialty Areas * (Select at least one)</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
              {['Anxiety & Depression', 'Trauma & PTSD', 'Relationship Issues', 'Family Therapy', 'Grief & Loss', 'Addiction', 'LGBTQ+ Issues', 'Career Counseling', 'Eating Disorders', 'Child Therapy'].map(specialty => (
                <div key={specialty} className="flex items-center space-x-2">
                  <Checkbox
                    id={specialty}
                    checked={formData.preferredSpecialty.includes(specialty)}
                    onCheckedChange={() => toggleArrayValue('preferredSpecialty', specialty)}
                  />
                  <Label htmlFor={specialty} className="cursor-pointer">{specialty}</Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label>Preferred Language for Therapy</Label>
            <Select value={formData.preferredLanguageTherapy} onValueChange={(v) => updateFormData('preferredLanguageTherapy', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="English">English</SelectItem>
                <SelectItem value="Spanish">Spanish</SelectItem>
                <SelectItem value="French">French</SelectItem>
                <SelectItem value="Mandarin">Mandarin</SelectItem>
                <SelectItem value="Arabic">Arabic</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Therapy Modality Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Preferred Therapy Approaches (Select all that interest you)</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
              {['CBT (Cognitive Behavioral)', 'DBT (Dialectical Behavioral)', 'Psychodynamic', 'Mindfulness-Based', 'Solution-Focused', 'Trauma-Focused', 'Family Systems', 'Couples Therapy'].map(modality => (
                <div key={modality} className="flex items-center space-x-2">
                  <Checkbox
                    id={modality}
                    checked={formData.preferredModality.includes(modality)}
                    onCheckedChange={() => toggleArrayValue('preferredModality', modality)}
                  />
                  <Label htmlFor={modality} className="cursor-pointer">{modality}</Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Availability Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Preferred Times (Select all that work for you)</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
              {['Weekday Mornings', 'Weekday Afternoons', 'Weekday Evenings', 'Weekend Mornings', 'Weekend Afternoons', 'Weekend Evenings'].map(time => (
                <div key={time} className="flex items-center space-x-2">
                  <Checkbox
                    id={time}
                    checked={formData.preferredAvailability.includes(time)}
                    onCheckedChange={() => toggleArrayValue('preferredAvailability', time)}
                  />
                  <Label htmlFor={time} className="cursor-pointer text-sm">{time}</Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Step 7: Payment Setup
  const renderPaymentSetup = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Payment Information</h2>
        <p className="text-muted-foreground">Secure payment setup</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Method *
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup value={formData.paymentMethod} onValueChange={(v) => updateFormData('paymentMethod', v)}>
            <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-accent">
              <RadioGroupItem value="insurance" id="pay-insurance" />
              <Label htmlFor="pay-insurance" className="flex items-center gap-2 cursor-pointer flex-1">
                <Shield className="h-4 w-4" />
                <div>
                  <div className="font-medium">Use Insurance</div>
                  <div className="text-sm text-muted-foreground">Bill my insurance provider</div>
                </div>
              </Label>
            </div>
            <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-accent">
              <RadioGroupItem value="card" id="pay-card" />
              <Label htmlFor="pay-card" className="flex items-center gap-2 cursor-pointer flex-1">
                <CreditCard className="h-4 w-4" />
                <div>
                  <div className="font-medium">Credit/Debit Card</div>
                  <div className="text-sm text-muted-foreground">Pay with card on file</div>
                </div>
              </Label>
            </div>
            <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-accent">
              <RadioGroupItem value="sliding-scale" id="pay-sliding" />
              <Label htmlFor="pay-sliding" className="flex items-center gap-2 cursor-pointer flex-1">
                <DollarSign className="h-4 w-4" />
                <div>
                  <div className="font-medium">Sliding Scale</div>
                  <div className="text-sm text-muted-foreground">Income-based reduced fee</div>
                </div>
              </Label>
            </div>
          </RadioGroup>

          {formData.paymentMethod === 'card' && (
            <>
              <Separator />
              <div className="space-y-4">
                <div>
                  <Label>Card Number</Label>
                  <Input placeholder="1234 5678 9012 3456" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <Label>Expiration Date</Label>
                    <Input placeholder="MM/YY" />
                  </div>
                  <div>
                    <Label>CVV</Label>
                    <Input placeholder="123" maxLength={3} />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Billing Address</Label>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="billing-same-as-primary"
                        checked={formData.billingAddressSameAsPrimary}
                        onCheckedChange={(checked) => {
                          updateFormData('billingAddressSameAsPrimary', checked);
                          if (checked) {
                            // Auto-populate billing address from primary address
                            updateFormData('billingAddress1', formData.address1);
                            updateFormData('billingAddress2', formData.address2);
                            updateFormData('billingCity', formData.city);
                            updateFormData('billingState', formData.state);
                            updateFormData('billingZipCode', formData.zipCode);
                          } else {
                            // Clear billing address fields
                            updateFormData('billingAddress1', '');
                            updateFormData('billingAddress2', '');
                            updateFormData('billingCity', '');
                            updateFormData('billingState', '');
                            updateFormData('billingZipCode', '');
                          }
                        }}
                      />
                      <Label htmlFor="billing-same-as-primary" className="cursor-pointer text-sm font-normal">
                        Same as primary address
                      </Label>
                    </div>
                  </div>

                  <div>
                    <AddressAutocomplete
                      label="Billing Address 1"
                      value={formData.billingAddress1 || ''}
                      onChange={(value, components) => {
                        updateFormData('billingAddress1', value);
                        if (components) {
                          updateFormData('billingCity', components.city);
                          updateFormData('billingState', components.state);
                          updateFormData('billingZipCode', components.zip);
                        }
                      }}
                      placeholder="123 Billing Street"
                      disabled={formData.billingAddressSameAsPrimary}
                    />
                  </div>

                  <div>
                    <Label>Billing Address 2</Label>
                    <Input
                      value={formData.billingAddress2 || ''}
                      onChange={(e) => updateFormData('billingAddress2', e.target.value)}
                      placeholder="Apt, Suite, Unit (optional)"
                      disabled={formData.billingAddressSameAsPrimary}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Billing City</Label>
                      <Input
                        value={formData.billingCity || ''}
                        onChange={(e) => updateFormData('billingCity', e.target.value)}
                        placeholder="City"
                        disabled={formData.billingAddressSameAsPrimary}
                      />
                    </div>
                    <div>
                      <Label>Billing State</Label>
                      <Input
                        value={formData.billingState || ''}
                        onChange={(e) => updateFormData('billingState', e.target.value)}
                        placeholder="State"
                        maxLength={2}
                        disabled={formData.billingAddressSameAsPrimary}
                      />
                    </div>
                    <div>
                      <Label>Billing ZIP Code</Label>
                      <Input
                        value={formData.billingZipCode || ''}
                        onChange={(e) => updateFormData('billingZipCode', e.target.value)}
                        placeholder="ZIP"
                        disabled={formData.billingAddressSameAsPrimary}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {formData.paymentMethod === 'sliding-scale' && (
            <>
              <Separator />
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900 mb-2">
                  <strong>Sliding Scale Information:</strong> We offer reduced fees based on income. Our financial coordinator will contact you to discuss available options.
                </p>
                <div className="flex items-center space-x-2 mt-2">
                  <Checkbox
                    id="financial-aid"
                    checked={formData.financialAid}
                    onCheckedChange={(checked) => updateFormData('financialAid', checked)}
                  />
                  <Label htmlFor="financial-aid" className="cursor-pointer">
                    I would like to apply for financial assistance
                  </Label>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <div className="bg-gray-50 border rounded-lg p-4">
        <div className="flex gap-2 items-start">
          <Lock className="h-5 w-5 text-gray-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-gray-700">
            <p className="font-medium mb-1">Your payment information is secure</p>
            <p>We use industry-standard encryption to protect your financial data. Your card information is never stored on our servers.</p>
          </div>
        </div>
      </div>
    </div>
  );

  // Step 8: Document Upload
  const renderDocumentUpload = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Document Upload</h2>
        <p className="text-muted-foreground">Upload any supporting documents (optional)</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Supporting Documents
          </CardTitle>
          <CardDescription>All uploads are optional but may help with your care</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>ID Proof (Optional)</Label>
            <div className="border-2 border-dashed rounded-lg p-8 text-center hover:bg-accent cursor-pointer mt-2">
              <Upload className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <p className="font-medium mb-1">Click to upload ID</p>
              <p className="text-sm text-muted-foreground">Driver's license, passport, or state ID</p>
            </div>
          </div>

          <Separator />

          <div>
            <Label>Past Medical Records (Optional)</Label>
            <div className="border-2 border-dashed rounded-lg p-8 text-center hover:bg-accent cursor-pointer mt-2">
              <Upload className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <p className="font-medium mb-1">Click to upload medical records</p>
              <p className="text-sm text-muted-foreground">Previous therapy records, psychiatric evaluations, etc.</p>
            </div>
          </div>

          <Separator />

          <div>
            <Label>Authorization Forms (Optional)</Label>
            <div className="border-2 border-dashed rounded-lg p-8 text-center hover:bg-accent cursor-pointer mt-2">
              <Upload className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <p className="font-medium mb-1">Click to upload authorization forms</p>
              <p className="text-sm text-muted-foreground">ROI forms, court documents, etc.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-2">
          <Shield className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-medium mb-1">Your privacy is protected</p>
            <p>All uploaded documents are encrypted and HIPAA-compliant. Only authorized healthcare providers will have access to your information.</p>
          </div>
        </div>
      </div>
    </div>
  );

  // Step 9: Appointment Setup
  const renderAppointmentSetup = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Account & Appointment Setup</h2>
        <p className="text-muted-foreground">Create your portal account and set preferences</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Portal Account *
          </CardTitle>
          <CardDescription>Create a secure account to access your client portal</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Username *</Label>
            <Input
              value={formData.username}
              onChange={(e) => updateFormData('username', e.target.value)}
              placeholder="Choose a username"
            />
          </div>
          <div>
            <Label>Password *</Label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => updateFormData('password', e.target.value)}
                placeholder="Create a strong password"
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Must be at least 8 characters with uppercase, lowercase, number, and special character
            </p>
          </div>

          <Separator />

          <div className="space-y-3">
            <Label>Portal Permissions</Label>
            <div className="flex items-center justify-between">
              <Label htmlFor="view-notes" className="cursor-pointer">Allow me to view therapy notes</Label>
              <Switch
                id="view-notes"
                checked={formData.allowViewNotes}
                onCheckedChange={(checked) => updateFormData('allowViewNotes', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="view-invoices" className="cursor-pointer">Allow me to view invoices</Label>
              <Switch
                id="view-invoices"
                checked={formData.allowViewInvoices}
                onCheckedChange={(checked) => updateFormData('allowViewInvoices', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Appointment Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Preferred Session Frequency</Label>
            <Select value={formData.preferredFrequency} onValueChange={(v) => updateFormData('preferredFrequency', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="bi-weekly">Bi-weekly (every 2 weeks)</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="as-needed">As needed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Care Team Notes (Optional)</Label>
            <Textarea
              value={formData.careTeamNotes || ''}
              onChange={(e) => updateFormData('careTeamNotes', e.target.value)}
              placeholder="Any additional information for your care team..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Step 12: Signature Capture (NEW - CRITICAL)
  const renderSignature = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">Sign & Submit</h2>
        <p className="text-muted-foreground">
          Please review and sign to confirm all information is accurate and complete.
        </p>
      </div>

      {/* Summary of what they're signing */}
      <Card className="border-2 border-[#F97316]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-[#F97316]" />
            What You're Agreeing To
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium">Consent to Treatment</div>
                <p className="text-sm text-muted-foreground">You agree to receive mental health services</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium">HIPAA Privacy Policy</div>
                <p className="text-sm text-muted-foreground">You've read and understand how your health information is protected</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium">Financial Agreement</div>
                <p className="text-sm text-muted-foreground">You understand the payment terms and cancellation policy</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium">Telehealth Consent</div>
                <p className="text-sm text-muted-foreground">You consent to video/phone therapy sessions</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium">Accuracy of Information</div>
                <p className="text-sm text-muted-foreground">All information provided in this intake is true and accurate</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Signature Component */}
      <SignatureCapture
        signature={formData.signature}
        onSignatureChange={(sig) => updateFormData('signature', sig)}
        fullName={`${formData.firstName} ${formData.lastName}`}
        label="Your Legal Signature"
        required
      />

      {/* Legal Notice */}
      <Card className="bg-gray-50">
        <CardContent className="pt-6">
          <p className="text-xs text-muted-foreground leading-relaxed">
            By signing this document, you acknowledge that you have read, understood, and agree to all policies,
            consents, and terms outlined in this intake form. This electronic signature is legally binding and has
            the same force and effect as a handwritten signature. You also confirm that all information provided
            is true and accurate to the best of your knowledge.
          </p>
          <p className="text-xs text-muted-foreground mt-3">
            <strong>Date:</strong> {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </CardContent>
      </Card>
    </div>
  );

  // Step 13: Organization Info (Enterprise only)
  const renderOrganizationInfo = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Organization Information</h2>
        <p className="text-muted-foreground">Employer-sponsored wellness program details</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Employer Program
          </CardTitle>
          <CardDescription>Your benefits are sponsored by your employer</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Employer Program ID</Label>
            <Input
              value={formData.employerProgramID || ''}
              onChange={(e) => updateFormData('employerProgramID', e.target.value)}
              placeholder="Provided by your HR department"
            />
          </div>
          <div>
            <Label>Employee ID *</Label>
            <Input
              value={formData.employeeID || ''}
              onChange={(e) => updateFormData('employeeID', e.target.value)}
              placeholder="Your employee identification number"
            />
          </div>
          <div>
            <Label>Pre-Approved Sessions</Label>
            <Input
              type="number"
              value={formData.preApprovedSessions || ''}
              onChange={(e) => updateFormData('preApprovedSessions', parseInt(e.target.value))}
              placeholder="Number of sessions covered"
            />
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-green-900">
                <p className="font-medium mb-1">Employer-Sponsored Benefits</p>
                <p>Your therapy sessions are covered by your employer's wellness program at no cost to you.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Handle Save & Exit
  const handleSaveAndExit = () => {
    toast.success('Progress Saved', {
      description: 'You can return to complete your registration at any time. A link has been sent to your email.'
    });
  };

  // Get current phase
  const getPhase = () => {
    if (currentStep <= 2) return "Phase 1: Account Setup";
    if (currentStep <= 4) return "Phase 2: Clinical Intake";
    if (currentStep <= 9) return "Phase 3: Preferences & Admin";
    return "Phase 4: Finalization";
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header Actions */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground bg-secondary px-2 py-1 rounded">
              {getPhase()}
            </span>
          </div>
          {currentStep > 1 && (
            <Button variant="ghost" size="sm" onClick={handleSaveAndExit} className="text-muted-foreground hover:text-primary">
              <Save className="h-4 w-4 mr-2" />
              Save & Finish Later
            </Button>
          )}
        </div>

        {/* Progress Header */}
        {currentStep > 1 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Step {currentStep - 1} of {totalSteps}
                </h3>
                <h2 className="text-xl font-semibold">{stepTitles[currentStep - 1]}</h2>
              </div>
              <Badge variant="outline" className="bg-white">
                {Math.round(progressPercent)}% Complete
              </Badge>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>
        )}

        {/* Step Content */}
        <div className="mb-8 min-h-[400px]">
          {renderStepContent()}
        </div>

        {/* Navigation Buttons */}
        {currentStep > 1 && (
          <div className="flex items-center justify-between gap-4 py-4 border-t mt-8">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 2}
              className="w-32"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={handleSaveAndExit}
                className="hidden sm:flex"
              >
                Save Draft
              </Button>
              <Button
                onClick={handleNext}
                disabled={!validateStep()}
                size="lg"
                className="w-40 bg-zinc-900 hover:bg-zinc-800 text-white"
              >
                {currentStep === totalSteps + 1 ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Complete
                  </>
                ) : (
                  <>
                    Next Step
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>

      <AvatarGalleryDialog
        open={showAvatarGallery}
        onOpenChange={setShowAvatarGallery}
        onSelectAvatar={(avatarUrl) => {
          setSelectedAvatar(avatarUrl);
          toast.success('Avatar selected!');
        }}
        selectedAvatar={selectedAvatar}
      />
    </div>
  );
}
