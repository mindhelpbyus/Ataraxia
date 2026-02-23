import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';

import { ScrollArea } from './ui/scroll-area';
import { User, Phone, EnvelopeSimple, MapPin, FirstAidKit, Warning, IdentificationCard, Heart, CheckCircle, ArrowRight, ArrowLeft, Briefcase, Users } from '@phosphor-icons/react';
import { Badge } from './ui/badge';
import { useCometChatUserCreation } from '../integrations/cometchat';
import { toast } from 'sonner';
import { logger } from '../utils/secureLogger';
import { AddressAutocomplete } from './AddressAutocomplete';
import { format } from 'date-fns';

interface ClientIntakeFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (data: ClientIntakeData) => void;
}

export interface ClientIntakeData {
  // Personal Information
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth: Date | null;
  gender: string;
  ssn?: string;
  maritalStatus: string;
  preferredLanguage: string;
  race?: string;
  ethnicity?: string;

  // Contact Information
  email: string;
  phone: string;
  alternatePhone?: string;

  // Address
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zipCode: string;

  // Employment & Demographics
  occupation?: string;
  employer?: string;
  employerPhone?: string;

  // Emergency Contact
  emergencyContactName: string;
  emergencyContactRelationship: string;
  emergencyContactPhone: string;
  emergencyContactAddress1?: string;
  emergencyContactAddress2?: string;

  // Insurance Information
  hasInsurance: boolean;
  insuranceProvider?: string;
  policyNumber?: string;
  groupNumber?: string;
  subscriberName?: string;
  subscriberDOB?: Date | null;
  subscriberRelationship?: string;
  subscriberSSN?: string;
  insurancePhone?: string;

  // Medical Information
  primaryCarePhysician?: string;
  pcpPhone?: string;
  currentMedications: string;
  allergies: string;
  medicalHistory: string;
  chronicConditions?: string;
  pastSurgeries?: string;
  familyMedicalHistory?: string;

  // Mental Health History
  previousTherapy: boolean;
  previousTherapyDetails?: string;
  previousHospitalizations?: string;
  currentSymptoms: string;
  reasonForSeeking: string;
  suicidalThoughts?: string;
  substanceUse?: string;

  // Preferences
  preferredTherapist?: string;
  preferredDays: string[];
  preferredTimeOfDay: string;
  sessionFrequency: string;
  therapyModality?: string;

  // Additional Information
  howDidYouHear: string;
  additionalNotes?: string;

  // Consent & Agreement
  consentToTreatment: boolean;
  privacyPolicyAgreed: boolean;
  emergencyContactConsent: boolean;
  releaseOfInformation: boolean;
}

export function ClientIntakeForm({ open, onOpenChange, onSubmit }: ClientIntakeFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const { createUser } = useCometChatUserCreation();


  const [formData, setFormData] = useState<ClientIntakeData>({
    firstName: '',
    lastName: '',
    middleName: '',
    dateOfBirth: null,
    gender: '',
    ssn: '',
    maritalStatus: '',
    preferredLanguage: 'English',
    race: '',
    ethnicity: '',
    email: '',
    phone: '',
    alternatePhone: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zipCode: '',
    occupation: '',
    employer: '',
    employerPhone: '',
    emergencyContactName: '',
    emergencyContactRelationship: '',
    emergencyContactPhone: '',
    emergencyContactAddress1: '',
    emergencyContactAddress2: '',
    hasInsurance: false,
    insuranceProvider: '',
    policyNumber: '',
    groupNumber: '',
    subscriberName: '',
    subscriberDOB: null,
    subscriberRelationship: '',
    subscriberSSN: '',
    insurancePhone: '',
    primaryCarePhysician: '',
    pcpPhone: '',
    currentMedications: '',
    allergies: '',
    medicalHistory: '',
    chronicConditions: '',
    pastSurgeries: '',
    familyMedicalHistory: '',
    previousTherapy: false,
    previousTherapyDetails: '',
    previousHospitalizations: '',
    currentSymptoms: '',
    reasonForSeeking: '',
    suicidalThoughts: '',
    substanceUse: '',
    preferredTherapist: '',
    preferredDays: [],
    preferredTimeOfDay: '',
    sessionFrequency: '',
    therapyModality: '',
    howDidYouHear: '',
    additionalNotes: '',
    consentToTreatment: false,
    privacyPolicyAgreed: false,
    emergencyContactConsent: false,
    releaseOfInformation: false,
  });

  const updateField = (field: keyof ClientIntakeData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!formData.consentToTreatment || !formData.privacyPolicyAgreed) {
      toast.error('Please agree to the consent and privacy policy');
      return;
    }

    // Show loading toast
    const loadingToast = toast.loading('Creating client profile...', {
      description: 'Setting up account and messaging'
    });

    try {
      // Submit the form to your database
      if (onSubmit) {
        onSubmit(formData);
      }

      // Create messaging user (non-blocking)
      const fullName = `${formData.firstName} ${formData.lastName}`;
      logger.debug(`🚀 Creating messaging user for: ${fullName} (${formData.email})`);

      const userCreated = await createUser({
        email: formData.email,
        name: fullName,
        role: 'client'
      });

      // Dismiss loading toast
      toast.dismiss(loadingToast);

      if (userCreated) {
        toast.success('Client registered successfully! 🎉', {
          description: `${fullName} can now receive messages and notifications`,
          duration: 5000
        });
        logger.debug(`✅ Client ${fullName} registered and ready for messaging`);
      } else {
        toast.success('Client registered', {
          description: 'Profile created (messaging setup pending)'
        });
      }

      // Close sidebar
      onOpenChange(false);

      // Reset form
      resetForm();
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('Error creating client', {
        description: 'Please try again or contact support'
      });
      console.error('Error in client submission:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      middleName: '',
      dateOfBirth: null,
      gender: '',
      ssn: '',
      maritalStatus: '',
      preferredLanguage: 'English',
      race: '',
      ethnicity: '',
      email: '',
      phone: '',
      alternatePhone: '',
      address1: '',
      address2: '',
      city: '',
      state: '',
      zipCode: '',
      occupation: '',
      employer: '',
      employerPhone: '',
      emergencyContactName: '',
      emergencyContactRelationship: '',
      emergencyContactPhone: '',
      emergencyContactAddress1: '',
      emergencyContactAddress2: '',
      hasInsurance: false,
      insuranceProvider: '',
      policyNumber: '',
      groupNumber: '',
      subscriberName: '',
      subscriberDOB: null,
      subscriberRelationship: '',
      subscriberSSN: '',
      insurancePhone: '',
      primaryCarePhysician: '',
      pcpPhone: '',
      currentMedications: '',
      allergies: '',
      medicalHistory: '',
      chronicConditions: '',
      pastSurgeries: '',
      familyMedicalHistory: '',
      previousTherapy: false,
      previousTherapyDetails: '',
      previousHospitalizations: '',
      currentSymptoms: '',
      reasonForSeeking: '',
      suicidalThoughts: '',
      substanceUse: '',
      preferredTherapist: '',
      preferredDays: [],
      preferredTimeOfDay: '',
      sessionFrequency: '',
      therapyModality: '',
      howDidYouHear: '',
      additionalNotes: '',
      consentToTreatment: false,
      privacyPolicyAgreed: false,
      emergencyContactConsent: false,
      releaseOfInformation: false,
    });
    setCurrentStep(0);
  };

  const togglePreferredDay = (day: string) => {
    const days = formData.preferredDays.includes(day)
      ? formData.preferredDays.filter(d => d !== day)
      : [...formData.preferredDays, day];
    updateField('preferredDays', days);
  };

  const steps = [
    { id: 0, title: 'Demographics', icon: User, color: 'blue' },
    { id: 1, title: 'Contact & Emergency', icon: Phone, color: 'green' },
    { id: 2, title: 'Insurance', icon: IdentificationCard, color: 'purple' },
    { id: 3, title: 'Medical History', icon: FirstAidKit, color: 'red' },
    { id: 4, title: 'Mental Health', icon: Heart, color: 'pink' },
    { id: 5, title: 'Preferences', icon: Users, color: 'indigo' },
    { id: 6, title: 'Consent', icon: CheckCircle, color: 'emerald' }
  ];

  const goToNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const goToPrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <User className="h-5 w-5 text-white" weight="bold" />
                </div>
                <div>
                  <h3 className="font-medium text-blue-900">Personal Demographics</h3>
                  <p className="text-sm text-blue-700">Please provide your basic information</p>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="firstName">
                    First Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => updateField('firstName', e.target.value)}
                    placeholder="John"
                    className="h-11 bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="middleName">Middle Name</Label>
                  <Input
                    id="middleName"
                    value={formData.middleName}
                    onChange={(e) => updateField('middleName', e.target.value)}
                    placeholder="Michael"
                    className="h-11 bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">
                    Last Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => updateField('lastName', e.target.value)}
                    placeholder="Doe"
                    className="h-11 bg-white"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>
                    Date of Birth <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth ? format(formData.dateOfBirth, 'yyyy-MM-dd') : ''}
                    onChange={(e) => {
                      const dateStr = e.target.value;
                      if (dateStr) {
                        const [year, month, day] = dateStr.split('-').map(Number);
                        const date = new Date(year, month - 1, day);
                        updateField('dateOfBirth', date);
                      } else {
                        updateField('dateOfBirth', null);
                      }
                    }}
                    className="h-11 bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ssn">Social Security Number</Label>
                  <Input
                    id="ssn"
                    value={formData.ssn}
                    onChange={(e) => updateField('ssn', e.target.value)}
                    placeholder="XXX-XX-XXXX"
                    className="h-11 bg-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Gender <span className="text-red-500">*</span></Label>
                <RadioGroup value={formData.gender} onValueChange={(value) => updateField('gender', value)}>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: 'male', label: 'Male' },
                      { value: 'female', label: 'Female' },
                      { value: 'non-binary', label: 'Non-binary' },
                      { value: 'other', label: 'Other' }
                    ].map((option) => (
                      <label key={option.value} htmlFor={option.value} className="flex items-center space-x-2 border-2 border-gray-200 rounded-lg px-4 py-3 hover:border-blue-400 hover:bg-blue-50/50 cursor-pointer transition-all has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50">
                        <RadioGroupItem value={option.value} id={option.value} className="text-blue-600" />
                        <span className="flex-1">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </RadioGroup>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="maritalStatus">Marital Status</Label>
                  <Select value={formData.maritalStatus} onValueChange={(value) => updateField('maritalStatus', value)}>
                    <SelectTrigger className="h-11 bg-white">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single</SelectItem>
                      <SelectItem value="married">Married</SelectItem>
                      <SelectItem value="divorced">Divorced</SelectItem>
                      <SelectItem value="widowed">Widowed</SelectItem>
                      <SelectItem value="separated">Separated</SelectItem>
                      <SelectItem value="domestic-partnership">Domestic Partnership</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preferredLanguage">Preferred Language</Label>
                  <Select value={formData.preferredLanguage} onValueChange={(value) => updateField('preferredLanguage', value)}>
                    <SelectTrigger className="h-11 bg-white">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="Spanish">Spanish</SelectItem>
                      <SelectItem value="Chinese">Chinese</SelectItem>
                      <SelectItem value="French">French</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="race">Race (Optional)</Label>
                  <Select value={formData.race} onValueChange={(value) => updateField('race', value)}>
                    <SelectTrigger className="h-11 bg-white">
                      <SelectValue placeholder="Select race" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asian">Asian</SelectItem>
                      <SelectItem value="black">Black or African American</SelectItem>
                      <SelectItem value="white">White</SelectItem>
                      <SelectItem value="native-american">American Indian or Alaska Native</SelectItem>
                      <SelectItem value="pacific-islander">Native Hawaiian or Pacific Islander</SelectItem>
                      <SelectItem value="multiple">Two or More Races</SelectItem>
                      <SelectItem value="decline">Prefer not to answer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ethnicity">Ethnicity (Optional)</Label>
                  <Select value={formData.ethnicity} onValueChange={(value) => updateField('ethnicity', value)}>
                    <SelectTrigger className="h-11 bg-white">
                      <SelectValue placeholder="Select ethnicity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hispanic">Hispanic or Latino</SelectItem>
                      <SelectItem value="not-hispanic">Not Hispanic or Latino</SelectItem>
                      <SelectItem value="decline">Prefer not to answer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500 rounded-lg">
                  <Phone className="h-5 w-5 text-white" weight="bold" />
                </div>
                <div>
                  <h3 className="font-medium text-green-900">Contact Information</h3>
                  <p className="text-sm text-green-700">How can we reach you?</p>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email Address <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <EnvelopeSimple className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" weight="duotone" />
                  <Input
                    id="email"
                    type="email"
                    className="pl-11 h-11 bg-white"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    placeholder="john.doe@example.com"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-0.5">
                  <Label htmlFor="phone">
                    Primary Phone <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" weight="duotone" />
                    <Input
                      id="phone"
                      type="tel"
                      className="pl-11 h-11 bg-white"
                      value={formData.phone}
                      onChange={(e) => updateField('phone', e.target.value)}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>

                <div className="space-y-0.5">
                  <Label htmlFor="alternatePhone">Alternate Phone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" weight="duotone" />
                    <Input
                      id="alternatePhone"
                      type="tel"
                      className="pl-11 h-11 bg-white"
                      value={formData.alternatePhone}
                      onChange={(e) => updateField('alternatePhone', e.target.value)}
                      placeholder="(555) 987-6543"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <AddressAutocomplete
                  id="address1"
                  label="Street Address 1"
                  value={formData.address1}
                  onChange={(value, components) => {
                    updateField('address1', value);
                    if (components) {
                      updateField('city', components.city);
                      updateField('state', components.state);
                      updateField('zipCode', components.zip);
                    }
                  }}
                  placeholder="123 Main Street"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address2">Street Address 2</Label>
                <Input
                  id="address2"
                  value={formData.address2}
                  onChange={(e) => updateField('address2', e.target.value)}
                  placeholder="Apt, Suite, Unit, Building (optional)"
                  className="h-11 bg-white"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => updateField('city', e.target.value)}
                    placeholder="New York"
                    className="h-11 bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => updateField('state', e.target.value)}
                    placeholder="NY"
                    maxLength={2}
                    className="h-11 bg-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="zipCode">ZIP Code</Label>
                <Input
                  id="zipCode"
                  value={formData.zipCode}
                  onChange={(e) => updateField('zipCode', e.target.value)}
                  placeholder="10001"
                  className="h-11 bg-white"
                />
              </div>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <Briefcase className="h-5 w-5 text-white" weight="bold" />
                </div>
                <div>
                  <h3 className="font-medium text-blue-900">Employment Information</h3>
                  <p className="text-sm text-blue-700">Optional employment details</p>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="occupation">Occupation</Label>
                  <Input
                    id="occupation"
                    value={formData.occupation}
                    onChange={(e) => updateField('occupation', e.target.value)}
                    placeholder="Software Engineer"
                    className="h-11 bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employer">Employer</Label>
                  <Input
                    id="employer"
                    value={formData.employer}
                    onChange={(e) => updateField('employer', e.target.value)}
                    placeholder="Company Name"
                    className="h-11 bg-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="employerPhone">Employer Phone</Label>
                <Input
                  id="employerPhone"
                  type="tel"
                  value={formData.employerPhone}
                  onChange={(e) => updateField('employerPhone', e.target.value)}
                  placeholder="(555) 123-4567"
                  className="h-11 bg-white"
                />
              </div>
            </div>

            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg mt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500 rounded-lg">
                  <Warning className="h-5 w-5 text-white" weight="fill" />
                </div>
                <div>
                  <h3 className="font-medium text-red-900">Emergency Contact</h3>
                  <p className="text-sm text-red-700">Who should we contact in an emergency?</p>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="emergencyContactName">
                  Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="emergencyContactName"
                  value={formData.emergencyContactName}
                  onChange={(e) => updateField('emergencyContactName', e.target.value)}
                  placeholder="Jane Doe"
                  className="h-11 bg-white"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="emergencyContactRelationship">
                    Relationship <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="emergencyContactRelationship"
                    value={formData.emergencyContactRelationship}
                    onChange={(e) => updateField('emergencyContactRelationship', e.target.value)}
                    placeholder="Spouse"
                    className="h-11 bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergencyContactPhone">
                    Phone <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="emergencyContactPhone"
                    type="tel"
                    value={formData.emergencyContactPhone}
                    onChange={(e) => updateField('emergencyContactPhone', e.target.value)}
                    placeholder="(555) 123-4567"
                    className="h-11 bg-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <AddressAutocomplete
                  id="emergencyContactAddress1"
                  label="Emergency Contact Address 1"
                  value={formData.emergencyContactAddress1 || ''}
                  onChange={(value) => updateField('emergencyContactAddress1', value)}
                  placeholder="123 Emergency St"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergencyContactAddress2">Emergency Contact Address 2</Label>
                <Input
                  id="emergencyContactAddress2"
                  value={formData.emergencyContactAddress2 || ''}
                  onChange={(e) => updateField('emergencyContactAddress2', e.target.value)}
                  placeholder="Apt, Suite, Unit (optional)"
                  className="h-11 bg-white"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-r-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500 rounded-lg">
                  <IdentificationCard className="h-5 w-5 text-white" weight="bold" />
                </div>
                <div>
                  <h3 className="font-medium text-purple-900">Insurance Information</h3>
                  <p className="text-sm text-purple-700">Please provide your insurance details</p>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg border-2 border-purple-200">
                <Checkbox
                  id="hasInsurance"
                  checked={formData.hasInsurance}
                  onCheckedChange={(checked) => updateField('hasInsurance', checked)}
                  className="border-purple-600 h-5 w-5"
                />
                <Label htmlFor="hasInsurance" className="font-medium cursor-pointer text-purple-900">
                  I have health insurance
                </Label>
              </div>

              {formData.hasInsurance && (
                <div className="space-y-5 p-5 bg-purple-50/30 rounded-lg border border-purple-200">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="insuranceProvider">
                        Insurance Provider <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="insuranceProvider"
                        className="h-11 bg-white"
                        value={formData.insuranceProvider}
                        onChange={(e) => updateField('insuranceProvider', e.target.value)}
                        placeholder="Blue Cross Blue Shield"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="insurancePhone">Insurance Phone</Label>
                      <Input
                        id="insurancePhone"
                        type="tel"
                        value={formData.insurancePhone}
                        onChange={(e) => updateField('insurancePhone', e.target.value)}
                        placeholder="(800) 123-4567"
                        className="h-11 bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="policyNumber">
                        Policy Number <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="policyNumber"
                        value={formData.policyNumber}
                        onChange={(e) => updateField('policyNumber', e.target.value)}
                        placeholder="ABC123456789"
                        className="h-11 bg-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="groupNumber">Group Number</Label>
                      <Input
                        id="groupNumber"
                        value={formData.groupNumber}
                        onChange={(e) => updateField('groupNumber', e.target.value)}
                        placeholder="GRP987654"
                        className="h-11 bg-white"
                      />
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-purple-300">
                    <h4 className="font-medium text-purple-900 mb-4">Subscriber Information</h4>

                    <div className="space-y-5">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="subscriberName">Subscriber Name</Label>
                          <Input
                            id="subscriberName"
                            value={formData.subscriberName}
                            onChange={(e) => updateField('subscriberName', e.target.value)}
                            placeholder="If different from client"
                            className="h-11 bg-white"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="subscriberRelationship">Relationship to Client</Label>
                          <Select value={formData.subscriberRelationship} onValueChange={(value) => updateField('subscriberRelationship', value)}>
                            <SelectTrigger className="h-11 bg-white">
                              <SelectValue placeholder="Select relationship" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="self">Self</SelectItem>
                              <SelectItem value="spouse">Spouse</SelectItem>
                              <SelectItem value="parent">Parent</SelectItem>
                              <SelectItem value="child">Child</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Subscriber Date of Birth</Label>
                          <Input
                            type="date"
                            value={formData.subscriberDOB ? format(formData.subscriberDOB, 'yyyy-MM-dd') : ''}
                            onChange={(e) => {
                              const dateStr = e.target.value;
                              if (dateStr) {
                                const [year, month, day] = dateStr.split('-').map(Number);
                                const date = new Date(year, month - 1, day);
                                updateField('subscriberDOB', date);
                              } else {
                                updateField('subscriberDOB', null);
                              }
                            }}
                            className="h-11 bg-white"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="subscriberSSN">Subscriber SSN</Label>
                          <Input
                            id="subscriberSSN"
                            value={formData.subscriberSSN}
                            onChange={(e) => updateField('subscriberSSN', e.target.value)}
                            placeholder="XXX-XX-XXXX"
                            className="h-11 bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900">
                  <strong>Note:</strong> Please bring your insurance card to your first appointment for verification.
                </p>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500 rounded-lg">
                  <FirstAidKit className="h-5 w-5 text-white" weight="bold" />
                </div>
                <div>
                  <h3 className="font-medium text-red-900">Medical History</h3>
                  <p className="text-sm text-red-700">Tell us about your medical background</p>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="primaryCarePhysician">Primary Care Physician</Label>
                  <Input
                    id="primaryCarePhysician"
                    className="h-11 bg-white"
                    value={formData.primaryCarePhysician}
                    onChange={(e) => updateField('primaryCarePhysician', e.target.value)}
                    placeholder="Dr. Smith"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pcpPhone">PCP Phone</Label>
                  <Input
                    id="pcpPhone"
                    type="tel"
                    value={formData.pcpPhone}
                    onChange={(e) => updateField('pcpPhone', e.target.value)}
                    placeholder="(555) 123-4567"
                    className="h-11 bg-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="currentMedications">Current Medications</Label>
                <Textarea
                  id="currentMedications"
                  value={formData.currentMedications}
                  onChange={(e) => updateField('currentMedications', e.target.value)}
                  placeholder="List all current medications, dosages, and frequency..."
                  className="min-h-[100px] bg-white resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="allergies">Allergies</Label>
                <Textarea
                  id="allergies"
                  value={formData.allergies}
                  onChange={(e) => updateField('allergies', e.target.value)}
                  placeholder="List any known allergies (medications, foods, environmental)..."
                  className="min-h-[90px] bg-white resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="chronicConditions">Chronic Conditions</Label>
                <Textarea
                  id="chronicConditions"
                  value={formData.chronicConditions}
                  onChange={(e) => updateField('chronicConditions', e.target.value)}
                  placeholder="Diabetes, hypertension, asthma, etc."
                  className="min-h-[90px] bg-white resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pastSurgeries">Past Surgeries</Label>
                <Textarea
                  id="pastSurgeries"
                  value={formData.pastSurgeries}
                  onChange={(e) => updateField('pastSurgeries', e.target.value)}
                  placeholder="List any past surgeries with approximate dates..."
                  className="min-h-[90px] bg-white resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="medicalHistory">General Medical History</Label>
                <Textarea
                  id="medicalHistory"
                  value={formData.medicalHistory}
                  onChange={(e) => updateField('medicalHistory', e.target.value)}
                  placeholder="Any other relevant medical history..."
                  className="min-h-[90px] bg-white resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="familyMedicalHistory">Family Medical History</Label>
                <Textarea
                  id="familyMedicalHistory"
                  value={formData.familyMedicalHistory}
                  onChange={(e) => updateField('familyMedicalHistory', e.target.value)}
                  placeholder="Family history of mental health conditions, chronic diseases, etc."
                  className="min-h-[90px] bg-white resize-none"
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="bg-pink-50 border-l-4 border-pink-500 p-4 rounded-r-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-pink-500 rounded-lg">
                  <Heart className="h-5 w-5 text-white" weight="fill" />
                </div>
                <div>
                  <h3 className="font-medium text-pink-900">Mental Health History</h3>
                  <p className="text-sm text-pink-700">Help us understand your mental health journey</p>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div className="flex items-center space-x-3 p-4 bg-pink-50 rounded-lg border-2 border-pink-200">
                <Checkbox
                  id="previousTherapy"
                  checked={formData.previousTherapy}
                  onCheckedChange={(checked) => updateField('previousTherapy', checked)}
                  className="border-pink-600 h-5 w-5"
                />
                <Label htmlFor="previousTherapy" className="font-medium cursor-pointer text-pink-900">
                  I have received therapy before
                </Label>
              </div>

              {formData.previousTherapy && (
                <div className="space-y-2 p-4 bg-pink-50/50 rounded-lg border border-pink-200">
                  <Label htmlFor="previousTherapyDetails">Previous Therapy Details</Label>
                  <Textarea
                    id="previousTherapyDetails"
                    value={formData.previousTherapyDetails}
                    onChange={(e) => updateField('previousTherapyDetails', e.target.value)}
                    placeholder="When? What type? What was helpful?"
                    className="min-h-[100px] bg-white resize-none"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="previousHospitalizations">
                  Previous Psychiatric Hospitalizations
                </Label>
                <Textarea
                  id="previousHospitalizations"
                  value={formData.previousHospitalizations}
                  onChange={(e) => updateField('previousHospitalizations', e.target.value)}
                  placeholder="If applicable, when and why?"
                  className="min-h-[90px] bg-white resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reasonForSeeking">
                  Reason for Seeking Therapy <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="reasonForSeeking"
                  value={formData.reasonForSeeking}
                  onChange={(e) => updateField('reasonForSeeking', e.target.value)}
                  placeholder="What brings you to therapy? What are you hoping to achieve?"
                  className="min-h-[110px] bg-white resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currentSymptoms">Current Symptoms</Label>
                <Textarea
                  id="currentSymptoms"
                  value={formData.currentSymptoms}
                  onChange={(e) => updateField('currentSymptoms', e.target.value)}
                  placeholder="Anxiety, depression, sleep issues, etc."
                  className="min-h-[100px] bg-white resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="suicidalThoughts">
                  Suicidal/Self-Harm Thoughts
                </Label>
                <Textarea
                  id="suicidalThoughts"
                  value={formData.suicidalThoughts}
                  onChange={(e) => updateField('suicidalThoughts', e.target.value)}
                  placeholder="Current or past thoughts of self-harm or suicide?"
                  className="min-h-[90px] bg-white resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="substanceUse">
                  Substance Use
                </Label>
                <Textarea
                  id="substanceUse"
                  value={formData.substanceUse}
                  onChange={(e) => updateField('substanceUse', e.target.value)}
                  placeholder="Current or past use of alcohol, tobacco, or other substances"
                  className="min-h-[90px] bg-white resize-none"
                />
              </div>

              <div className="p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-r-lg">
                <p className="text-sm text-yellow-900">
                  <strong>Crisis Resources:</strong> If you're experiencing a mental health crisis, please call 988 (Suicide & Crisis Lifeline) or go to your nearest emergency room.
                </p>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded-r-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500 rounded-lg">
                  <Users className="h-5 w-5 text-white" weight="bold" />
                </div>
                <div>
                  <h3 className="font-medium text-indigo-900">Therapy Preferences</h3>
                  <p className="text-sm text-indigo-700">Help us schedule and personalize your care</p>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <Label>Preferred Days</Label>
                <div className="flex flex-wrap gap-2">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                    <Badge
                      key={day}
                      variant={formData.preferredDays.includes(day) ? 'default' : 'outline'}
                      className={`cursor-pointer px-4 py-2 transition-all ${formData.preferredDays.includes(day)
                        ? 'bg-indigo-600 hover:bg-indigo-700'
                        : 'hover:bg-indigo-50 hover:border-indigo-300'
                        }`}
                      onClick={() => togglePreferredDay(day)}
                    >
                      {day}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Preferred Time of Day</Label>
                <RadioGroup value={formData.preferredTimeOfDay} onValueChange={(value) => updateField('preferredTimeOfDay', value)}>
                  <div className="space-y-2">
                    {[
                      { value: 'morning', label: 'Morning (8am - 12pm)' },
                      { value: 'afternoon', label: 'Afternoon (12pm - 5pm)' },
                      { value: 'evening', label: 'Evening (5pm - 8pm)' },
                      { value: 'flexible', label: 'Flexible' }
                    ].map((option) => (
                      <label key={option.value} htmlFor={`time-${option.value}`} className="flex items-center space-x-2 border-2 border-gray-200 rounded-lg px-4 py-3 hover:border-indigo-400 hover:bg-indigo-50/50 cursor-pointer transition-all has-[:checked]:border-indigo-500 has-[:checked]:bg-indigo-50">
                        <RadioGroupItem value={option.value} id={`time-${option.value}`} className="text-indigo-600" />
                        <span className="flex-1">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label>Session Frequency</Label>
                <RadioGroup value={formData.sessionFrequency} onValueChange={(value) => updateField('sessionFrequency', value)}>
                  <div className="space-y-2">
                    {[
                      { value: 'weekly', label: 'Weekly' },
                      { value: 'biweekly', label: 'Bi-weekly (Every 2 weeks)' },
                      { value: 'monthly', label: 'Monthly' },
                      { value: 'as-needed', label: 'As needed' }
                    ].map((option) => (
                      <label key={option.value} htmlFor={`freq-${option.value}`} className="flex items-center space-x-2 border-2 border-gray-200 rounded-lg px-4 py-3 hover:border-indigo-400 hover:bg-indigo-50/50 cursor-pointer transition-all has-[:checked]:border-indigo-500 has-[:checked]:bg-indigo-50">
                        <RadioGroupItem value={option.value} id={`freq-${option.value}`} className="text-indigo-600" />
                        <span className="flex-1">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="therapyModality">
                  Preferred Therapy Modality
                </Label>
                <Select value={formData.therapyModality} onValueChange={(value) => updateField('therapyModality', value)}>
                  <SelectTrigger className="h-11 bg-white">
                    <SelectValue placeholder="Select modality" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cbt">Cognitive Behavioral Therapy (CBT)</SelectItem>
                    <SelectItem value="dbt">Dialectical Behavior Therapy (DBT)</SelectItem>
                    <SelectItem value="psychodynamic">Psychodynamic Therapy</SelectItem>
                    <SelectItem value="emdr">EMDR</SelectItem>
                    <SelectItem value="mindfulness">Mindfulness-Based</SelectItem>
                    <SelectItem value="no-preference">No Preference</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>How did you hear about us?</Label>
                <RadioGroup value={formData.howDidYouHear} onValueChange={(value) => updateField('howDidYouHear', value)}>
                  <div className="space-y-2">
                    {[
                      { value: 'referral', label: 'Referral from friend/family' },
                      { value: 'doctor', label: 'Referred by doctor' },
                      { value: 'insurance', label: 'Insurance provider' },
                      { value: 'search', label: 'Online search' },
                      { value: 'social-media', label: 'Social media' },
                      { value: 'other', label: 'Other' }
                    ].map((option) => (
                      <label key={option.value} htmlFor={`hear-${option.value}`} className="flex items-center space-x-2 border-2 border-gray-200 rounded-lg px-4 py-3 hover:border-indigo-400 hover:bg-indigo-50/50 cursor-pointer transition-all has-[:checked]:border-indigo-500 has-[:checked]:bg-indigo-50">
                        <RadioGroupItem value={option.value} id={`hear-${option.value}`} className="text-indigo-600" />
                        <span className="flex-1">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="additionalNotes">Additional Notes</Label>
                <Textarea
                  id="additionalNotes"
                  value={formData.additionalNotes}
                  onChange={(e) => updateField('additionalNotes', e.target.value)}
                  placeholder="Any other information you'd like us to know..."
                  className="min-h-[100px] bg-white resize-none"
                />
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-white" weight="fill" />
                </div>
                <div>
                  <h3 className="font-medium text-emerald-900">Consent & Agreement</h3>
                  <p className="text-sm text-emerald-700">Please review and agree to the following</p>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div className="p-5 bg-emerald-50 rounded-lg border border-emerald-200 space-y-4">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="consentToTreatment"
                    checked={formData.consentToTreatment}
                    onCheckedChange={(checked) => updateField('consentToTreatment', checked)}
                    className="mt-1 border-emerald-600 h-5 w-5"
                  />
                  <Label htmlFor="consentToTreatment" className="cursor-pointer leading-relaxed">
                    <span className="font-medium text-emerald-900">Consent to Treatment</span>
                    <p className="text-sm text-emerald-800 mt-1.5">
                      I consent to receive mental health services and understand that I may discontinue treatment at any time. I understand the limits of confidentiality.
                    </p>
                  </Label>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="privacyPolicyAgreed"
                    checked={formData.privacyPolicyAgreed}
                    onCheckedChange={(checked) => updateField('privacyPolicyAgreed', checked)}
                    className="mt-1 border-emerald-600 h-5 w-5"
                  />
                  <Label htmlFor="privacyPolicyAgreed" className="cursor-pointer leading-relaxed">
                    <span className="font-medium text-emerald-900">Privacy Policy & HIPAA</span>
                    <p className="text-sm text-emerald-800 mt-1.5">
                      I have read and agree to the Privacy Policy and HIPAA Notice. I understand how my health information will be protected.
                    </p>
                  </Label>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="emergencyContactConsent"
                    checked={formData.emergencyContactConsent}
                    onCheckedChange={(checked) => updateField('emergencyContactConsent', checked)}
                    className="mt-1 border-emerald-600 h-5 w-5"
                  />
                  <Label htmlFor="emergencyContactConsent" className="cursor-pointer leading-relaxed">
                    <span className="font-medium text-emerald-900">Emergency Contact Authorization</span>
                    <p className="text-sm text-emerald-800 mt-1.5">
                      I authorize the practice to contact my emergency contact in case of a mental health emergency.
                    </p>
                  </Label>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="releaseOfInformation"
                    checked={formData.releaseOfInformation}
                    onCheckedChange={(checked) => updateField('releaseOfInformation', checked)}
                    className="mt-1 border-emerald-600 h-5 w-5"
                  />
                  <Label htmlFor="releaseOfInformation" className="cursor-pointer leading-relaxed">
                    <span className="font-medium text-emerald-900">Release of Information</span>
                    <p className="text-sm text-emerald-800 mt-1.5">
                      I authorize the practice to release information to my insurance company for billing purposes and to coordinate care with my primary care physician if necessary.
                    </p>
                  </Label>
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Important Information</h4>
                <ul className="text-sm text-blue-800 space-y-1.5 list-disc list-inside">
                  <li>All information is confidential and HIPAA protected</li>
                  <li>Your therapist will review this during your first session</li>
                  <li>You can update information anytime through your portal</li>
                  <li>Insurance verification will occur before your first appointment</li>
                  <li>Please arrive 10 minutes early for your first appointment</li>
                </ul>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed border-t pt-4">
                By submitting this form, you acknowledge that all information provided is accurate and complete to the best of your knowledge. You understand that providing false information may result in denial of services.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:w-[66.67vw] sm:max-w-none p-0 flex flex-col border-l shadow-2xl">
        {/* Fixed Header */}
        <div className="flex-shrink-0 px-6 py-5 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-sm">
                <User className="h-5 w-5 text-white" weight="bold" />
              </div>
              <div>
                <SheetTitle className="text-lg">New Client Intake Form</SheetTitle>
                <SheetDescription className="text-sm mt-0.5">
                  Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}
                </SheetDescription>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex gap-1.5">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`h-2 flex-1 rounded-full transition-all duration-300 ${index < currentStep ? 'bg-green-500' :
                    index === currentStep ? 'bg-blue-600' :
                      'bg-gray-200'
                    }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Scrollable Content - with calculated max height */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-6 py-6">
            {renderStep()}
          </div>
        </div>

        {/* Fixed Footer - Always Visible */}
        <div className="flex-shrink-0 px-6 py-4 border-t bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <div className="flex items-center justify-between gap-4">
            <Button
              variant="outline"
              onClick={goToPrevious}
              disabled={currentStep === 0}
              className="gap-2 h-11 px-6 border-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </Button>

            <div className="text-sm text-muted-foreground">
              {currentStep + 1} / {steps.length}
            </div>

            {currentStep === steps.length - 1 ? (
              <Button
                onClick={handleSubmit}
                className="gap-2 h-11 px-6 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-sm"
              >
                <CheckCircle className="h-4 w-4" weight="fill" />
                Submit Form
              </Button>
            ) : (
              <Button onClick={goToNext} className="gap-2 h-11 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-sm">
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
