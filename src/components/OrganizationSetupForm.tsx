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
import { Progress } from './ui/progress';
import { Switch } from './ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from 'sonner';
import {
  Building2, User, Shield, Palette, CreditCard, FileText,
  Settings, Users, BarChart3, Mail, Upload, Check,
  ChevronRight, ChevronLeft, AlertCircle, CheckCircle2,
  Globe, Lock, Bell, Video, Database, Zap, Phone,
  Calendar, Stethoscope, DollarSign, MapPin, Clock,
  Eye, EyeOff, Plus, X, Save, Send, Copy, ExternalLink
} from 'lucide-react';
import { PhoneInput } from './PhoneInput';
import { AddressAutocomplete } from './AddressAutocomplete';
import { Country, State, City } from 'country-state-city';

// Comprehensive organization data interface
export interface OrganizationData {
  // A. Basic Details
  organizationName: string;
  legalName: string;
  dba?: string;
  taxId: string;
  npi?: string;
  organizationType: string;
  primaryContactName: string;
  primaryContactEmail: string;
  primaryContactPhone: string;
  primaryContactCountryCode: string;
  hqAddress1: string;
  hqAddress2: string;
  hqCity: string;
  hqState: string;
  hqZip: string;
  hqCountry: string;
  billingAddressSameAsHQ: boolean;
  billingAddress1?: string;
  billingAddress2?: string;
  billingCity?: string;
  billingState?: string;
  billingZip?: string;
  billingCountry?: string;
  timezone: string;
  serviceLocations: ServiceLocation[];

  // B. Size & Structure
  numberOfClinicians: number;
  numberOfAdminStaff: number;
  numberOfLocations: number;
  departments: string[];
  divisions: string[];
  organizationStructure?: string;

  // C. Compliance
  hipaaBAASigned: boolean;
  dataProcessingAgreementSigned: boolean;
  auditLoggingLevel: string;
  mfaRequired: boolean;
  passwordMinLength: number;
  passwordRotationDays: number;
  sessionTimeoutMinutes: number;
  ipAllowlist?: string[];

  // D. Branding
  logo?: File;
  brandColorPrimary: string;
  brandColorSecondary: string;
  customDomain?: string;
  emailSenderName: string;
  smsSenderName: string;
  customLoginBranding: boolean;

  // E. Billing & Subscription
  subscriptionPlan: string;
  billingContactName: string;
  billingContactEmail: string;
  paymentMethod: string;

  // F. Insurance & Payor
  acceptedInsurancePlans: string[];
  clearinghouseProvider?: string;
  ediEnrolled: boolean;

  // G. Clinical Workflow
  defaultSessionTypes: string[];
  defaultSessionDuration: number;
  noShowPolicy: string;
  cancellationPolicy: string;
  consentForms: string[];
  documentationTemplates: string[];
  telehealthProvider: string;

  // H. Staff Management
  supervisorHierarchy: boolean;
  caseloadLimitsEnabled: boolean;

  // I. Integrations
  ehrIntegration?: string;
  videoProvider: string;
  calendarIntegration?: string;
  identityProvider?: string;

  // J. Analytics
  analyticsEnabled: boolean;
  revenueReports: boolean;
  clinicalOutcomes: boolean;

  // K. Communications
  appointmentReminders: boolean;
  smsEnabled: boolean;
  emailEnabled: boolean;

  // L. Data Import
  dataImportPlanned: boolean;
  recordCount?: number;
}

interface ServiceLocation {
  id: string;
  name: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
  phoneCountryCode: string;
  isPrimary: boolean;
}

interface Props {
  onComplete: (data: OrganizationData) => void;
  onCancel?: () => void;
  editMode?: boolean;
  existingData?: Partial<OrganizationData>;
}

export function OrganizationSetupForm({ onComplete, onCancel, editMode = false, existingData }: Props) {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const totalSteps = 12;

  // Form data state
  const [formData, setFormData] = useState<OrganizationData>({
    organizationName: existingData?.organizationName || '',
    legalName: existingData?.legalName || '',
    taxId: existingData?.taxId || '',
    organizationType: existingData?.organizationType || '',
    primaryContactName: existingData?.primaryContactName || '',
    primaryContactEmail: existingData?.primaryContactEmail || '',
    primaryContactPhone: existingData?.primaryContactPhone || '',
    primaryContactCountryCode: existingData?.primaryContactCountryCode || '+1',
    hqAddress1: existingData?.hqAddress1 || '',
    hqAddress2: existingData?.hqAddress2 || '',
    hqCity: existingData?.hqCity || '',
    hqState: existingData?.hqState || '',
    hqZip: existingData?.hqZip || '',
    hqCountry: existingData?.hqCountry || 'US',
    billingAddressSameAsHQ: existingData?.billingAddressSameAsHQ ?? true,
    billingAddress1: existingData?.billingAddress1 || '',
    billingAddress2: existingData?.billingAddress2 || '',
    billingCity: existingData?.billingCity || '',
    billingState: existingData?.billingState || '',
    billingZip: existingData?.billingZip || '',
    billingCountry: existingData?.billingCountry || 'US',
    timezone: existingData?.timezone || 'America/New_York',
    serviceLocations: existingData?.serviceLocations || [],
    numberOfClinicians: existingData?.numberOfClinicians || 1,
    numberOfAdminStaff: existingData?.numberOfAdminStaff || 0,
    numberOfLocations: existingData?.numberOfLocations || 1,
    departments: existingData?.departments || [],
    divisions: existingData?.divisions || [],
    hipaaBAASigned: existingData?.hipaaBAASigned || false,
    dataProcessingAgreementSigned: existingData?.dataProcessingAgreementSigned || false,
    auditLoggingLevel: existingData?.auditLoggingLevel || 'standard',
    mfaRequired: existingData?.mfaRequired || true,
    passwordMinLength: existingData?.passwordMinLength || 12,
    passwordRotationDays: existingData?.passwordRotationDays || 90,
    sessionTimeoutMinutes: existingData?.sessionTimeoutMinutes || 30,
    brandColorPrimary: existingData?.brandColorPrimary || '#F97316',
    brandColorSecondary: existingData?.brandColorSecondary || '#F59E0B',
    emailSenderName: existingData?.emailSenderName || '',
    smsSenderName: existingData?.smsSenderName || '',
    customLoginBranding: existingData?.customLoginBranding || false,
    subscriptionPlan: existingData?.subscriptionPlan || '',
    billingContactName: existingData?.billingContactName || '',
    billingContactEmail: existingData?.billingContactEmail || '',
    paymentMethod: existingData?.paymentMethod || '',
    acceptedInsurancePlans: existingData?.acceptedInsurancePlans || [],
    ediEnrolled: existingData?.ediEnrolled || false,
    defaultSessionTypes: existingData?.defaultSessionTypes || ['therapy'],
    defaultSessionDuration: existingData?.defaultSessionDuration || 50,
    noShowPolicy: existingData?.noShowPolicy || '',
    cancellationPolicy: existingData?.cancellationPolicy || '',
    consentForms: existingData?.consentForms || [],
    documentationTemplates: existingData?.documentationTemplates || [],
    telehealthProvider: existingData?.telehealthProvider || 'jitsi',
    supervisorHierarchy: existingData?.supervisorHierarchy || false,
    caseloadLimitsEnabled: existingData?.caseloadLimitsEnabled || false,
    videoProvider: existingData?.videoProvider || 'jitsi',
    analyticsEnabled: existingData?.analyticsEnabled || true,
    revenueReports: existingData?.revenueReports || true,
    clinicalOutcomes: existingData?.clinicalOutcomes || true,
    appointmentReminders: existingData?.appointmentReminders || true,
    smsEnabled: existingData?.smsEnabled || true,
    emailEnabled: existingData?.emailEnabled || true,
    dataImportPlanned: existingData?.dataImportPlanned || false,
  });

  const progressPercent = ((currentStep - 1) / (totalSteps - 1)) * 100;

  // Step configuration
  const stepTitles = [
    'Basic Details',
    'Organization Size',
    'HIPAA Compliance',
    'Security Settings',
    'Branding',
    'Billing & Subscription',
    'Insurance Setup',
    'Clinical Workflow',
    'Staff Management',
    'Integrations',
    'Analytics & Reports',
    'Communications'
  ];

  // Update form data
  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Toggle array values
  const toggleArrayValue = (field: keyof OrganizationData, value: string) => {
    const currentArray = (formData[field] as string[]) || [];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    updateFormData(field, newArray);
  };

  // Add service location
  const addServiceLocation = () => {
    const newLocation: ServiceLocation = {
      id: Date.now().toString(),
      name: '',
      address1: '',
      address2: '',
      city: '',
      state: '',
      zip: '',
      country: 'US',
      phone: '',
      phoneCountryCode: '+1',
      isPrimary: formData.serviceLocations.length === 0
    };
    updateFormData('serviceLocations', [...formData.serviceLocations, newLocation]);
  };

  // Update service location
  const updateServiceLocation = (id: string, field: string, value: any) => {
    const updated = formData.serviceLocations.map(loc =>
      loc.id === id ? { ...loc, [field]: value } : loc
    );
    updateFormData('serviceLocations', updated);
  };

  // Remove service location
  const removeServiceLocation = (id: string) => {
    updateFormData('serviceLocations', formData.serviceLocations.filter(loc => loc.id !== id));
  };

  // Validate current step
  const validateStep = (): boolean => {
    switch (currentStep) {
      case 1:
        return !!(
          formData.organizationName &&
          formData.legalName &&
          formData.taxId &&
          formData.organizationType &&
          formData.primaryContactName &&
          formData.primaryContactEmail &&
          formData.primaryContactPhone
        );
      case 2:
        return formData.numberOfClinicians > 0;
      case 3:
        return formData.hipaaBAASigned && formData.dataProcessingAgreementSigned;
      case 4:
        return true;
      case 5:
        return !!(formData.emailSenderName && formData.smsSenderName);
      case 6:
        return !!(formData.subscriptionPlan && formData.billingContactEmail);
      case 7:
        return true;
      case 8:
        return formData.defaultSessionTypes.length > 0;
      case 9:
        return true;
      case 10:
        return !!(formData.videoProvider);
      case 11:
        return true;
      case 12:
        return true;
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
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  // Handle previous step
  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Handle form submission
  const handleSubmit = () => {
    toast.success(editMode ? 'Organization Updated! 🎉' : 'Organization Created! 🎉', {
      description: 'The organization has been successfully configured'
    });
    onComplete(formData);
  };

  // Render current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderBasicDetails();
      case 2:
        return renderOrganizationSize();
      case 3:
        return renderHIPAACompliance();
      case 4:
        return renderSecuritySettings();
      case 5:
        return renderBranding();
      case 6:
        return renderBillingSubscription();
      case 7:
        return renderInsuranceSetup();
      case 8:
        return renderClinicalWorkflow();
      case 9:
        return renderStaffManagement();
      case 10:
        return renderIntegrations();
      case 11:
        return renderAnalyticsReports();
      case 12:
        return renderCommunications();
      default:
        return null;
    }
  };

  // Step 1: Basic Details
  const renderBasicDetails = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Basic Organization Details</h2>
        <p className="text-muted-foreground">Essential information about your organization</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Organization Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Organization Name *</Label>
              <Input
                value={formData.organizationName}
                onChange={(e) => updateFormData('organizationName', e.target.value)}
                placeholder="Wellness Center"
              />
            </div>
            <div>
              <Label>Legal Name *</Label>
              <Input
                value={formData.legalName}
                onChange={(e) => updateFormData('legalName', e.target.value)}
                placeholder="Legal business name"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>DBA (Doing Business As)</Label>
              <Input
                value={formData.dba || ''}
                onChange={(e) => updateFormData('dba', e.target.value)}
                placeholder="Optional"
              />
            </div>
            <div>
              <Label>Tax ID / EIN *</Label>
              <Input
                value={formData.taxId}
                onChange={(e) => updateFormData('taxId', e.target.value)}
                placeholder="XX-XXXXXXX"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>NPI (National Provider Identifier)</Label>
              <Input
                value={formData.npi || ''}
                onChange={(e) => updateFormData('npi', e.target.value)}
                placeholder="10-digit number"
                maxLength={10}
              />
            </div>
            <div>
              <Label>Organization Type *</Label>
              <Select value={formData.organizationType} onValueChange={(v) => updateFormData('organizationType', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="solo">Solo Practice</SelectItem>
                  <SelectItem value="small-group">Small Group (2-10 clinicians)</SelectItem>
                  <SelectItem value="mid-size">Mid-size Clinic (11-50 clinicians)</SelectItem>
                  <SelectItem value="large-enterprise">Large Enterprise (50+ clinicians)</SelectItem>
                  <SelectItem value="telehealth-only">Telehealth-Only</SelectItem>
                  <SelectItem value="multi-location">Multi-Location</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Primary Contact Person
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Full Name *</Label>
            <Input
              value={formData.primaryContactName}
              onChange={(e) => updateFormData('primaryContactName', e.target.value)}
              placeholder="John Doe"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Email *</Label>
              <Input
                type="email"
                value={formData.primaryContactEmail}
                onChange={(e) => updateFormData('primaryContactEmail', e.target.value)}
                placeholder="contact@organization.com"
              />
            </div>
            <PhoneInput
              value={formData.primaryContactPhone}
              countryCode={formData.primaryContactCountryCode}
              onChange={(phone, code) => {
                updateFormData('primaryContactPhone', phone);
                updateFormData('primaryContactCountryCode', code);
              }}
              label="Phone"
              required
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Address Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <Label className="flex items-center gap-2">
              Headquarters Address *
              <Badge variant="secondary">Primary</Badge>
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <AddressAutocomplete
                  label="Street Address Line 1"
                  value={formData.hqAddress1}
                  onChange={(value, components) => {
                    updateFormData('hqAddress1', value);
                    if (components) {
                      updateFormData('hqCity', components.city);
                      updateFormData('hqState', components.state);
                      updateFormData('hqZip', components.zip);
                      if (components.countryCode) {
                        updateFormData('hqCountry', components.countryCode);
                        // Sync primary contact phone code
                        const countryData = Country.getCountryByCode(components.countryCode);
                        if (countryData) {
                          updateFormData('primaryContactCountryCode', `+${countryData.phonecode}`);
                        }
                      }
                    }
                  }}
                  placeholder="123 Main Street"
                  showIcon={false}
                />
              </div>
              <div className="space-y-2">
                <Label>Street Address Line 2 (Optional)</Label>
                <Input
                  value={formData.hqAddress2}
                  onChange={(e) => updateFormData('hqAddress2', e.target.value)}
                  placeholder="Apt, Suite, Floor, etc."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Country</Label>
                <Select value={formData.hqCountry} onValueChange={(v) => {
                  updateFormData('hqCountry', v);
                  // Sync primary contact phone code
                  const countryData = Country.getCountryByCode(v);
                  if (countryData) {
                    updateFormData('primaryContactCountryCode', `+${countryData.phonecode}`);
                  }
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Country" />
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
              <div>
                <Label>State / Province</Label>
                <Select value={formData.hqState} onValueChange={(v) => updateFormData('hqState', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select State" />
                  </SelectTrigger>
                  <SelectContent>
                    {State.getStatesOfCountry(formData.hqCountry).map((state) => (
                      <SelectItem key={state.isoCode} value={state.isoCode}>
                        {state.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>City</Label>
                <Select value={formData.hqCity} onValueChange={(v) => updateFormData('hqCity', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select City" />
                  </SelectTrigger>
                  <SelectContent>
                    {City.getCitiesOfState(formData.hqCountry, formData.hqState).map((city) => (
                      <SelectItem key={city.name} value={city.name}>
                        {city.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Input
                value={formData.hqZip}
                onChange={(e) => updateFormData('hqZip', e.target.value)}
                placeholder="Zip / Postal Code"
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Checkbox
                id="billingAddressSameAsHQ"
                checked={formData.billingAddressSameAsHQ}
                onCheckedChange={(checked) => {
                  updateFormData('billingAddressSameAsHQ', checked);
                  if (checked) {
                    // Auto-populate billing address with HQ address
                    updateFormData('billingAddress1', formData.hqAddress1);
                    updateFormData('billingAddress2', formData.hqAddress2);
                    updateFormData('billingCity', formData.hqCity);
                    updateFormData('billingState', formData.hqState);
                    updateFormData('billingZip', formData.hqZip);
                  }
                }}
              />
              <Label htmlFor="billingAddressSameAsHQ" className="cursor-pointer">
                Billing address is same as headquarters address
              </Label>
            </div>

            {!formData.billingAddressSameAsHQ && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <AddressAutocomplete
                      label="Billing Street Address Line 1"
                      value={formData.billingAddress1 || ''}
                      onChange={(value, components) => {
                        updateFormData('billingAddress1', value);
                        if (components) {
                          updateFormData('billingCity', components.city);
                          updateFormData('billingState', components.state);
                          updateFormData('billingZip', components.zip);
                          if (components.countryCode) {
                            updateFormData('billingCountry', components.countryCode);
                          }
                        }
                      }}
                      placeholder="123 Billing Street"
                      showIcon={false}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Billing Street Address Line 2 (Optional)</Label>
                    <Input
                      value={formData.billingAddress2 || ''}
                      onChange={(e) => updateFormData('billingAddress2', e.target.value)}
                      placeholder="Apt, Suite, Floor, etc."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Country</Label>
                    <Select value={formData.billingCountry} onValueChange={(v) => updateFormData('billingCountry', v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Country" />
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
                  <div>
                    <Label>State / Province</Label>
                    <Select value={formData.billingState || ''} onValueChange={(v) => updateFormData('billingState', v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select State" />
                      </SelectTrigger>
                      <SelectContent>
                        {State.getStatesOfCountry(formData.billingCountry || 'US').map((state) => (
                          <SelectItem key={state.isoCode} value={state.isoCode}>
                            {state.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>City</Label>
                    <Select value={formData.billingCity || ''} onValueChange={(v) => updateFormData('billingCity', v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select City" />
                      </SelectTrigger>
                      <SelectContent>
                        {City.getCitiesOfState(formData.billingCountry || 'US', formData.billingState || '').map((city) => (
                          <SelectItem key={city.name} value={city.name}>
                            {city.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Input
                    value={formData.billingZip || ''}
                    onChange={(e) => updateFormData('billingZip', e.target.value)}
                    placeholder="Billing Zip / Postal Code"
                  />
                </div>
              </>
            )}
          </div>

          <Separator />

          <div>
            <Label>Primary Timezone *</Label>
            <Select value={formData.timezone} onValueChange={(v) => updateFormData('timezone', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                <SelectItem value="America/Phoenix">Arizona Time (AZ)</SelectItem>
                <SelectItem value="America/Anchorage">Alaska Time (AK)</SelectItem>
                <SelectItem value="Pacific/Honolulu">Hawaii Time (HI)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Service Locations
          </CardTitle>
          <CardDescription>Add all physical locations where services are provided</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {formData.serviceLocations.map((location, index) => (
            <Card key={location.id} className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Location {index + 1}</Label>
                  {formData.serviceLocations.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeServiceLocation(location.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <Input
                  placeholder="Location name"
                  value={location.name}
                  onChange={(e) => updateServiceLocation(location.id, 'name', e.target.value)}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <AddressAutocomplete
                    placeholder="Street Address Line 1"
                    value={location.address1}
                    onChange={(value, components) => {
                      updateServiceLocation(location.id, 'address1', value);
                      if (components) {
                        updateServiceLocation(location.id, 'city', components.city);
                        updateServiceLocation(location.id, 'state', components.state);
                        updateServiceLocation(location.id, 'zip', components.zip);
                        if (components.countryCode) {
                          updateServiceLocation(location.id, 'country', components.countryCode);
                          // Sync location phone code
                          const countryData = Country.getCountryByCode(components.countryCode);
                          if (countryData) {
                            updateServiceLocation(location.id, 'phoneCountryCode', `+${countryData.phonecode}`);
                          }
                        }
                      }
                    }}
                    showIcon={false}
                  />
                  <Input
                    placeholder="Street Address Line 2 (Optional)"
                    value={location.address2}
                    onChange={(e) => updateServiceLocation(location.id, 'address2', e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Select value={location.country} onValueChange={(v) => {
                    updateServiceLocation(location.id, 'country', v);
                    // Sync location phone code
                    const countryData = Country.getCountryByCode(v);
                    if (countryData) {
                      updateServiceLocation(location.id, 'phoneCountryCode', `+${countryData.phonecode}`);
                    }
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Country" />
                    </SelectTrigger>
                    <SelectContent>
                      {Country.getAllCountries().map((country) => (
                        <SelectItem key={country.isoCode} value={country.isoCode}>
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={location.state} onValueChange={(v) => updateServiceLocation(location.id, 'state', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="State" />
                    </SelectTrigger>
                    <SelectContent>
                      {State.getStatesOfCountry(location.country || 'US').map((state) => (
                        <SelectItem key={state.isoCode} value={state.isoCode}>
                          {state.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Select value={location.city} onValueChange={(v) => updateServiceLocation(location.id, 'city', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="City" />
                    </SelectTrigger>
                    <SelectContent>
                      {City.getCitiesOfState(location.country || 'US', location.state || '').map((city) => (
                        <SelectItem key={city.name} value={city.name}>
                          {city.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Zip / Postal Code"
                    value={location.zip}
                    onChange={(e) => updateServiceLocation(location.id, 'zip', e.target.value)}
                  />
                </div>
                <PhoneInput
                  value={location.phone}
                  countryCode={location.phoneCountryCode || '+1'}
                  onChange={(phone, code) => {
                    updateServiceLocation(location.id, 'phone', phone);
                    updateServiceLocation(location.id, 'phoneCountryCode', code);
                  }}
                  placeholder="Phone"
                />
              </div>
            </Card>
          ))}
          <Button onClick={addServiceLocation} variant="outline" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Service Location
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  // Step 2: Organization Size
  const renderOrganizationSize = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Organization Size & Structure</h2>
        <p className="text-muted-foreground">Tell us about your team and structure</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Size
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Number of Clinicians *</Label>
              <Input
                type="number"
                min="1"
                value={formData.numberOfClinicians}
                onChange={(e) => updateFormData('numberOfClinicians', parseInt(e.target.value) || 0)}
              />
              <p className="text-xs text-muted-foreground mt-1">Therapists, psychiatrists, counselors</p>
            </div>
            <div>
              <Label>Number of Admin Staff</Label>
              <Input
                type="number"
                min="0"
                value={formData.numberOfAdminStaff}
                onChange={(e) => updateFormData('numberOfAdminStaff', parseInt(e.target.value) || 0)}
              />
              <p className="text-xs text-muted-foreground mt-1">Schedulers, billers, managers</p>
            </div>
            <div>
              <Label>Number of Locations</Label>
              <Input
                type="number"
                min="1"
                value={formData.numberOfLocations}
                onChange={(e) => updateFormData('numberOfLocations', parseInt(e.target.value) || 1)}
              />
              <p className="text-xs text-muted-foreground mt-1">Physical practice locations</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Organization Structure</CardTitle>
          <CardDescription>Define departments and divisions (optional)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Departments</Label>
            <div className="flex gap-2 mb-2">
              <Input placeholder="Add department name" id="dept-input" />
              <Button onClick={() => {
                const input = document.getElementById('dept-input') as HTMLInputElement;
                if (input.value) {
                  updateFormData('departments', [...formData.departments, input.value]);
                  input.value = '';
                }
              }}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.departments.map((dept, i) => (
                <Badge key={i} variant="secondary" className="gap-1">
                  {dept}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => updateFormData('departments', formData.departments.filter((_, idx) => idx !== i))}
                  />
                </Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">e.g., Adult Services, Child & Adolescent, Psychiatry</p>
          </div>

          <div>
            <Label>Divisions</Label>
            <div className="flex gap-2 mb-2">
              <Input placeholder="Add division name" id="div-input" />
              <Button onClick={() => {
                const input = document.getElementById('div-input') as HTMLInputElement;
                if (input.value) {
                  updateFormData('divisions', [...formData.divisions, input.value]);
                  input.value = '';
                }
              }}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.divisions.map((div, i) => (
                <Badge key={i} variant="secondary" className="gap-1">
                  {div}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => updateFormData('divisions', formData.divisions.filter((_, idx) => idx !== i))}
                  />
                </Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">e.g., North Region, South Region, Telehealth Division</p>
          </div>

          <div>
            <Label>Organization Structure Notes</Label>
            <Textarea
              value={formData.organizationStructure || ''}
              onChange={(e) => updateFormData('organizationStructure', e.target.value)}
              placeholder="Describe your organizational hierarchy, care teams, reporting structure..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-2">
          <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-medium mb-1">Billing Impact</p>
            <p>Your subscription will be calculated based on the number of active clinicians: {formData.numberOfClinicians} clinician{formData.numberOfClinicians !== 1 ? 's' : ''}</p>
          </div>
        </div>
      </div>
    </div>
  );

  // Step 3: HIPAA Compliance
  const renderHIPAACompliance = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">HIPAA Compliance Setup</h2>
        <p className="text-muted-foreground">Required compliance and data processing agreements</p>
      </div>

      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700">
            <Shield className="h-5 w-5" />
            Required Compliance Agreements
          </CardTitle>
          <CardDescription>These must be accepted to proceed</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start space-x-3 p-4 border-2 border-red-200 rounded-lg bg-red-50">
            <Checkbox
              id="hipaa-baa"
              checked={formData.hipaaBAASigned}
              onCheckedChange={(checked) => updateFormData('hipaaBAASigned', checked)}
            />
            <div className="flex-1">
              <Label htmlFor="hipaa-baa" className="text-base font-medium cursor-pointer">
                HIPAA Business Associate Agreement (BAA) *
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                I acknowledge that this organization will comply with HIPAA regulations and will act as a Business Associate or Covered Entity as defined by HIPAA.
              </p>
              <Button variant="link" className="p-0 h-auto text-sm mt-2">
                <FileText className="h-3 w-3 mr-1" />
                View & Download BAA Document
              </Button>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border-2 border-red-200 rounded-lg bg-red-50">
            <Checkbox
              id="dpa"
              checked={formData.dataProcessingAgreementSigned}
              onCheckedChange={(checked) => updateFormData('dataProcessingAgreementSigned', checked)}
            />
            <div className="flex-1">
              <Label htmlFor="dpa" className="text-base font-medium cursor-pointer">
                Data Processing Agreement (DPA) *
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                I agree to the data processing terms, including data storage, transmission, and security requirements.
              </p>
              <Button variant="link" className="p-0 h-auto text-sm mt-2">
                <FileText className="h-3 w-3 mr-1" />
                View & Download DPA Document
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Audit & Logging Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Audit Logging Level</Label>
            <RadioGroup value={formData.auditLoggingLevel} onValueChange={(v) => updateFormData('auditLoggingLevel', v)}>
              <div className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-accent">
                <RadioGroupItem value="standard" id="log-standard" />
                <Label htmlFor="log-standard" className="flex-1 cursor-pointer">
                  <div className="font-medium">Standard Logging</div>
                  <div className="text-sm text-muted-foreground">
                    Log user actions, access attempts, and system changes (Recommended for most organizations)
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-accent">
                <RadioGroupItem value="strict" id="log-strict" />
                <Label htmlFor="log-strict" className="flex-1 cursor-pointer">
                  <div className="font-medium">Strict Logging</div>
                  <div className="text-sm text-muted-foreground">
                    Log all actions including data views, searches, and detailed PHI access (Healthcare organizations)
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-accent">
                <RadioGroupItem value="phi-restricted" id="log-phi" />
                <Label htmlFor="log-phi" className="flex-1 cursor-pointer">
                  <div className="font-medium">PHI-Restricted Logging</div>
                  <div className="text-sm text-muted-foreground">
                    Maximum logging with PHI data restrictions and anonymization (High-security environments)
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex gap-2">
          <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-yellow-900">
            <p className="font-medium mb-1">Legal Compliance Notice</p>
            <p>By checking these boxes and proceeding, you confirm that:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Your organization has read and understands all compliance requirements</li>
              <li>You have authority to bind the organization to these agreements</li>
              <li>Your organization will implement required HIPAA safeguards</li>
              <li>Staff will receive appropriate HIPAA training</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  // Step 4: Security Settings
  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Security Settings</h2>
        <p className="text-muted-foreground">Configure authentication and access policies</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Authentication Policies
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <Label>Require Multi-Factor Authentication (MFA)</Label>
              <p className="text-sm text-muted-foreground">All users must use 2FA to login</p>
            </div>
            <Switch
              checked={formData.mfaRequired}
              onCheckedChange={(checked) => updateFormData('mfaRequired', checked)}
            />
          </div>

          <div>
            <Label>Password Minimum Length</Label>
            <Select
              value={formData.passwordMinLength.toString()}
              onValueChange={(v) => updateFormData('passwordMinLength', parseInt(v))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="8">8 characters (Basic)</SelectItem>
                <SelectItem value="10">10 characters (Recommended)</SelectItem>
                <SelectItem value="12">12 characters (Strict)</SelectItem>
                <SelectItem value="14">14 characters (Maximum)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Password Rotation Policy</Label>
            <Select
              value={formData.passwordRotationDays.toString()}
              onValueChange={(v) => updateFormData('passwordRotationDays', parseInt(v))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Never expire</SelectItem>
                <SelectItem value="30">Every 30 days</SelectItem>
                <SelectItem value="60">Every 60 days</SelectItem>
                <SelectItem value="90">Every 90 days (Recommended)</SelectItem>
                <SelectItem value="180">Every 180 days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Session Timeout</Label>
            <Select
              value={formData.sessionTimeoutMinutes.toString()}
              onValueChange={(v) => updateFormData('sessionTimeoutMinutes', parseInt(v))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutes (High security)</SelectItem>
                <SelectItem value="30">30 minutes (Recommended)</SelectItem>
                <SelectItem value="60">60 minutes (Standard)</SelectItem>
                <SelectItem value="120">120 minutes (Extended)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              Users will be logged out after this period of inactivity
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            IP Allowlist & Geofencing
          </CardTitle>
          <CardDescription>Enterprise feature - restrict access by IP address</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>IP Allowlist (Optional)</Label>
            <Textarea
              value={formData.ipAllowlist?.join('\n') || ''}
              onChange={(e) => updateFormData('ipAllowlist', e.target.value.split('\n').filter(Boolean))}
              placeholder="Enter IP addresses (one per line)&#10;192.168.1.1&#10;10.0.0.0/24"
              rows={4}
            />
            <p className="text-xs text-muted-foreground mt-1">
              If specified, only these IP addresses/ranges can access the system
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-green-900">
            <p className="font-medium mb-1">Security Best Practices</p>
            <p>Your current configuration follows HIPAA security guidelines. MFA is enabled and password policies meet compliance requirements.</p>
          </div>
        </div>
      </div>
    </div>
  );

  // Continue with remaining steps...
  // For brevity, I'll create placeholders for steps 5-12
  // These would follow the same pattern as above

  const renderBranding = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Branding & Customization</h2>
        <p className="text-muted-foreground">Customize the look and feel for your organization</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Visual Branding
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Organization Logo</Label>
            <div className="border-2 border-dashed rounded-lg p-8 text-center hover:bg-accent cursor-pointer">
              <Upload className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <p className="font-medium mb-1">Click to upload logo</p>
              <p className="text-sm text-muted-foreground">PNG, JPG or SVG (max 2MB)</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Primary Brand Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={formData.brandColorPrimary}
                  onChange={(e) => updateFormData('brandColorPrimary', e.target.value)}
                  className="w-20 h-10"
                />
                <Input
                  value={formData.brandColorPrimary}
                  onChange={(e) => updateFormData('brandColorPrimary', e.target.value)}
                  placeholder="#F97316"
                />
              </div>
            </div>
            <div>
              <Label>Secondary Brand Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={formData.brandColorSecondary}
                  onChange={(e) => updateFormData('brandColorSecondary', e.target.value)}
                  className="w-20 h-10"
                />
                <Input
                  value={formData.brandColorSecondary}
                  onChange={(e) => updateFormData('brandColorSecondary', e.target.value)}
                  placeholder="#F59E0B"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Email Sender Name *</Label>
              <Input
                value={formData.emailSenderName}
                onChange={(e) => updateFormData('emailSenderName', e.target.value)}
                placeholder="Wellness Center"
              />
            </div>
            <div>
              <Label>SMS Sender Name *</Label>
              <Input
                value={formData.smsSenderName}
                onChange={(e) => updateFormData('smsSenderName', e.target.value)}
                placeholder="WellnessCenter"
                maxLength={11}
              />
              <p className="text-xs text-muted-foreground mt-1">Max 11 characters</p>
            </div>
          </div>

          <div>
            <Label>Custom Domain</Label>
            <Input
              value={formData.customDomain || ''}
              onChange={(e) => updateFormData('customDomain', e.target.value)}
              placeholder="portal.yourorganization.com"
            />
            <p className="text-xs text-muted-foreground mt-1">Enterprise feature - contact support to configure DNS</p>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <Label>Custom Login Page Branding</Label>
              <p className="text-sm text-muted-foreground">Use your logo and colors on the login page</p>
            </div>
            <Switch
              checked={formData.customLoginBranding}
              onCheckedChange={(checked) => updateFormData('customLoginBranding', checked)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderBillingSubscription = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Billing & Subscription</h2>
        <p className="text-muted-foreground">Choose your plan and payment method</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Subscription Plan *
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup value={formData.subscriptionPlan} onValueChange={(v) => updateFormData('subscriptionPlan', v)}>
            <div className="flex items-start space-x-2 p-4 border-2 rounded-lg cursor-pointer hover:bg-accent">
              <RadioGroupItem value="per-provider" id="plan-provider" />
              <Label htmlFor="plan-provider" className="flex-1 cursor-pointer">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">Per Provider</div>
                    <div className="text-sm text-muted-foreground">$99/month per clinician</div>
                  </div>
                  <Badge>Most Popular</Badge>
                </div>
              </Label>
            </div>
            <div className="flex items-start space-x-2 p-4 border-2 rounded-lg cursor-pointer hover:bg-accent">
              <RadioGroupItem value="per-location" id="plan-location" />
              <Label htmlFor="plan-location" className="flex-1 cursor-pointer">
                <div>
                  <div className="font-medium">Per Location</div>
                  <div className="text-sm text-muted-foreground">$499/month per location (unlimited providers)</div>
                </div>
              </Label>
            </div>
            <div className="flex items-start space-x-2 p-4 border-2 rounded-lg cursor-pointer hover:bg-accent">
              <RadioGroupItem value="enterprise" id="plan-enterprise" />
              <Label htmlFor="plan-enterprise" className="flex-1 cursor-pointer">
                <div>
                  <div className="font-medium">Enterprise License</div>
                  <div className="text-sm text-muted-foreground">Custom pricing for 50+ providers</div>
                </div>
              </Label>
            </div>
          </RadioGroup>

          {formData.subscriptionPlan === 'per-provider' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                <strong>Estimated Monthly Cost:</strong> ${formData.numberOfClinicians * 99}/month for {formData.numberOfClinicians} clinician{formData.numberOfClinicians !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Billing Contact *</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Contact Name</Label>
              <Input
                value={formData.billingContactName}
                onChange={(e) => updateFormData('billingContactName', e.target.value)}
                placeholder="John Doe"
              />
            </div>
            <div>
              <Label>Contact Email *</Label>
              <Input
                type="email"
                value={formData.billingContactEmail}
                onChange={(e) => updateFormData('billingContactEmail', e.target.value)}
                placeholder="billing@organization.com"
              />
            </div>
          </div>

          <div>
            <Label>Payment Method *</Label>
            <Select value={formData.paymentMethod} onValueChange={(v) => updateFormData('paymentMethod', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="credit-card">Credit Card</SelectItem>
                <SelectItem value="ach">ACH / Bank Transfer</SelectItem>
                <SelectItem value="invoice">Invoice (Enterprise only)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderInsuranceSetup = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Insurance & Payor Setup</h2>
        <p className="text-muted-foreground">Configure accepted insurance and billing settings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Accepted Insurance Plans
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {['Aetna', 'Anthem BCBS', 'Blue Cross Blue Shield', 'Cigna', 'Humana', 'Kaiser Permanente', 'UnitedHealthcare', 'Medicare', 'Medicaid'].map(plan => (
              <div key={plan} className="flex items-center space-x-2">
                <Checkbox
                  id={plan}
                  checked={formData.acceptedInsurancePlans.includes(plan)}
                  onCheckedChange={() => toggleArrayValue('acceptedInsurancePlans', plan)}
                />
                <Label htmlFor={plan} className="cursor-pointer">{plan}</Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Clearinghouse Setup</CardTitle>
          <CardDescription>Electronic claims submission configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Clearinghouse Provider</Label>
            <Select value={formData.clearinghouseProvider} onValueChange={(v) => updateFormData('clearinghouseProvider', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select clearinghouse" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="availity">Availity</SelectItem>
                <SelectItem value="change-healthcare">Change Healthcare</SelectItem>
                <SelectItem value="waystar">Waystar</SelectItem>
                <SelectItem value="office-ally">Office Ally</SelectItem>
                <SelectItem value="none">Not using clearinghouse</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <Label>EDI Enrolled</Label>
              <p className="text-sm text-muted-foreground">Electronic Data Interchange for claims</p>
            </div>
            <Switch
              checked={formData.ediEnrolled}
              onCheckedChange={(checked) => updateFormData('ediEnrolled', checked)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderClinicalWorkflow = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Clinical Workflow Settings</h2>
        <p className="text-muted-foreground">Configure session types and documentation</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5" />
            Session Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Default Session Types *</Label>
            <div className="grid grid-cols-2 gap-3 mt-2">
              {['Therapy', 'Psychiatry', 'Intake Assessment', 'Follow-up', 'Group Therapy', 'Family Therapy', 'Couples Therapy', 'Crisis Session'].map(type => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    id={type}
                    checked={formData.defaultSessionTypes.includes(type)}
                    onCheckedChange={() => toggleArrayValue('defaultSessionTypes', type)}
                  />
                  <Label htmlFor={type} className="cursor-pointer">{type}</Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label>Default Session Duration</Label>
            <Select
              value={formData.defaultSessionDuration.toString()}
              onValueChange={(v) => updateFormData('defaultSessionDuration', parseInt(v))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="45">45 minutes</SelectItem>
                <SelectItem value="50">50 minutes (Standard)</SelectItem>
                <SelectItem value="60">60 minutes</SelectItem>
                <SelectItem value="90">90 minutes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>No-Show Policy</Label>
            <Textarea
              value={formData.noShowPolicy}
              onChange={(e) => updateFormData('noShowPolicy', e.target.value)}
              placeholder="Describe your no-show policy and fees..."
              rows={2}
            />
          </div>

          <div>
            <Label>Cancellation Policy</Label>
            <Textarea
              value={formData.cancellationPolicy}
              onChange={(e) => updateFormData('cancellationPolicy', e.target.value)}
              placeholder="Describe your cancellation policy and timeframe..."
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Documentation Templates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {['SOAP Notes', 'DAP Notes', 'Treatment Plans', 'Progress Notes', 'Psychiatric Evaluation', 'Discharge Summary'].map(template => (
            <div key={template} className="flex items-center space-x-2">
              <Checkbox
                id={template}
                checked={formData.documentationTemplates.includes(template)}
                onCheckedChange={() => toggleArrayValue('documentationTemplates', template)}
              />
              <Label htmlFor={template} className="cursor-pointer">{template}</Label>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Telehealth Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Video Provider *</Label>
            <Select value={formData.telehealthProvider} onValueChange={(v) => updateFormData('telehealthProvider', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="jitsi">Jitsi (Self-hosted - Secure)</SelectItem>
                <SelectItem value="zoom">Zoom for Healthcare</SelectItem>
                <SelectItem value="doxy">Doxy.me</SelectItem>
                <SelectItem value="vsee">VSee</SelectItem>
                <SelectItem value="twilio">Twilio Video</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderStaffManagement = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Staff Management Settings</h2>
        <p className="text-muted-foreground">Configure clinician and admin settings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Clinician Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <Label>Enable Supervisor Hierarchy</Label>
              <p className="text-sm text-muted-foreground">Allow supervisors to oversee other clinicians</p>
            </div>
            <Switch
              checked={formData.supervisorHierarchy}
              onCheckedChange={(checked) => updateFormData('supervisorHierarchy', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <Label>Enable Caseload Limits</Label>
              <p className="text-sm text-muted-foreground">Set maximum active clients per clinician</p>
            </div>
            <Switch
              checked={formData.caseloadLimitsEnabled}
              onCheckedChange={(checked) => updateFormData('caseloadLimitsEnabled', checked)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderIntegrations = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Integrations</h2>
        <p className="text-muted-foreground">Connect with external services</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            System Integrations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>EHR Integration</Label>
            <Select value={formData.ehrIntegration} onValueChange={(v) => updateFormData('ehrIntegration', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select EHR" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="athena">Athenahealth</SelectItem>
                <SelectItem value="eclinical">eClinicalWorks</SelectItem>
                <SelectItem value="epic">Epic / MyChart</SelectItem>
                <SelectItem value="cerner">Cerner</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Video Provider *</Label>
            <Select value={formData.videoProvider} onValueChange={(v) => updateFormData('videoProvider', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="jitsi">Jitsi (Self-hosted)</SelectItem>
                <SelectItem value="zoom">Zoom</SelectItem>
                <SelectItem value="twilio">Twilio</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Calendar Integration</Label>
            <Select value={formData.calendarIntegration} onValueChange={(v) => updateFormData('calendarIntegration', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select calendar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="google">Google Calendar</SelectItem>
                <SelectItem value="outlook">Microsoft Outlook</SelectItem>
                <SelectItem value="both">Both</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Identity Provider (SSO)</Label>
            <Select value={formData.identityProvider} onValueChange={(v) => updateFormData('identityProvider', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None (Standard auth)</SelectItem>
                <SelectItem value="okta">Okta</SelectItem>
                <SelectItem value="azure">Azure AD</SelectItem>
                <SelectItem value="google">Google Workspace</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAnalyticsReports = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Analytics & Reporting</h2>
        <p className="text-muted-foreground">Configure dashboards and reports</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Enabled Reports
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <Label>Revenue Dashboard</Label>
            <Switch
              checked={formData.revenueReports}
              onCheckedChange={(checked) => updateFormData('revenueReports', checked)}
            />
          </div>
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <Label>Clinical Outcomes</Label>
            <Switch
              checked={formData.clinicalOutcomes}
              onCheckedChange={(checked) => updateFormData('clinicalOutcomes', checked)}
            />
          </div>
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <Label>Analytics Enabled</Label>
            <Switch
              checked={formData.analyticsEnabled}
              onCheckedChange={(checked) => updateFormData('analyticsEnabled', checked)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderCommunications = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Communication Settings</h2>
        <p className="text-muted-foreground">Configure automated messaging and notifications</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Notification Channels
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <Label>Email Notifications</Label>
              <p className="text-sm text-muted-foreground">Appointment reminders, updates</p>
            </div>
            <Switch
              checked={formData.emailEnabled}
              onCheckedChange={(checked) => updateFormData('emailEnabled', checked)}
            />
          </div>
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <Label>SMS Notifications</Label>
              <p className="text-sm text-muted-foreground">Text message reminders</p>
            </div>
            <Switch
              checked={formData.smsEnabled}
              onCheckedChange={(checked) => updateFormData('smsEnabled', checked)}
            />
          </div>
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <Label>Appointment Reminders</Label>
              <p className="text-sm text-muted-foreground">Automatic reminder 24hrs before</p>
            </div>
            <Switch
              checked={formData.appointmentReminders}
              onCheckedChange={(checked) => updateFormData('appointmentReminders', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-green-900">
            <p className="font-medium mb-1">Configuration Complete!</p>
            <p>Your organization is ready to be created. Review all settings and click "Create Organization" to finalize.</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-5xl mx-auto">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                Step {currentStep} of {totalSteps}
              </h3>
              <h2 className="text-xl font-semibold">{stepTitles[currentStep - 1]}</h2>
            </div>
            <Badge variant="outline">
              {Math.round(progressPercent)}% Complete
            </Badge>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        {/* Step Content */}
        <div className="mb-8">
          {renderStepContent()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            {onCancel && (
              <Button variant="ghost" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
          <Button
            onClick={handleNext}
            disabled={!validateStep()}
            size="lg"
          >
            {currentStep === totalSteps ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                {editMode ? 'Update Organization' : 'Create Organization'}
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
    </div>
  );
}
