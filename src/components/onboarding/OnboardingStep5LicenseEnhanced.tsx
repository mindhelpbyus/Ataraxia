import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Badge } from '../ui/badge';
import { ArrowLeft, Shield, Upload, X } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';
import { LICENSE_TYPES } from '../../types/onboarding';
import { State } from 'country-state-city';

interface OnboardingStep5Props {
  data: {
    // Section B - License & Credentials
    licenseType: string;
    licenseNumber: string;
    issuingStates: string[];
    additionalPracticeStates: string[];
    licenseExpiryDate: string;
    licenseDocument?: File | string;
    malpracticeInsurance: string;
    malpracticeInsuranceDocument?: File | string;
    npiNumber: string;
    deaNumber: string;

    // Legacy fields
    licensingAuthority: string;
    governmentId?: File | string;
    informationAccurate: boolean;

    // Country from previous step
    country?: string;
  };
  onUpdate: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export function OnboardingStep5LicenseEnhanced({ data, onUpdate, onNext, onBack }: OnboardingStep5Props) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  // const [currentIssuingState, setCurrentIssuingState] = useState('');
  const [currentPracticeState, setCurrentPracticeState] = useState('');
  const [availableStates, setAvailableStates] = useState<any[]>([]);

  // Load states based on country
  useEffect(() => {
    const countryCode = data.country || 'US'; // Default to US if not provided
    const states = State.getStatesOfCountry(countryCode);
    setAvailableStates(states);
  }, [data.country]);

  /*
  const addIssuingState = () => {
    if (currentIssuingState && !data.issuingStates.includes(currentIssuingState)) {
      onUpdate({
        issuingStates: [...data.issuingStates, currentIssuingState]
      });
      setCurrentIssuingState('');
    }
  };

  const removeIssuingState = (state: string) => {
    onUpdate({
      issuingStates: data.issuingStates.filter(s => s !== state)
    });
  };
  */

  const addPracticeState = () => {
    if (currentPracticeState && !data.additionalPracticeStates.includes(currentPracticeState)) {
      onUpdate({
        additionalPracticeStates: [...data.additionalPracticeStates, currentPracticeState]
      });
      setCurrentPracticeState('');
    }
  };

  const removePracticeState = (state: string) => {
    onUpdate({
      additionalPracticeStates: data.additionalPracticeStates.filter(s => s !== state)
    });
  };

  const handleFileUpload = (field: string, file: File | null) => {
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        setErrors({ ...errors, [field]: 'Only PDF, JPG, and PNG files are allowed' });
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, [field]: 'File size must be less than 5MB' });
        return;
      }

      onUpdate({ [field]: file });
      setErrors({ ...errors, [field]: '' });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!data.licenseType) newErrors.licenseType = 'License type is required';
    if (!data.licenseNumber.trim()) newErrors.licenseNumber = 'License number is required';
    // if (data.issuingStates.length === 0) newErrors.issuingStates = 'At least one issuing state is required';
    // if (!data.licenseExpiryDate) newErrors.licenseExpiryDate = 'License expiry date is required';

    // Check if expiry date is in the future
    if (data.licenseExpiryDate) {
      const expiryDate = new Date(data.licenseExpiryDate);
      const today = new Date();
      if (expiryDate < today) {
        newErrors.licenseExpiryDate = 'License expiry date must be in the future';
      }
    }

    // if (!data.malpracticeInsurance.trim()) newErrors.malpracticeInsurance = 'Malpractice insurance information is required';
    if (!data.informationAccurate) newErrors.informationAccurate = 'You must certify the accuracy of this information';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNext = () => {
    if (isSubmitting) return;

    if (validateForm()) {
      setIsSubmitting(true);
      onNext();
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Card className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-orange-100 rounded-full">
              <Shield className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h2 className="text-2xl">Professional License & Credentials</h2>
              <p className="text-gray-600 mt-1">
                Provide your licensing information and credentials
              </p>
            </div>
          </div>

          <Alert className="bg-blue-50 border-blue-200">
            <AlertDescription className="text-blue-900">
              <strong>🤖 AI Matching:</strong> License and state information helps us route clients to therapists authorized to practice in their state.
            </AlertDescription>
          </Alert>
        </div>

        {/* Error Messages */}
        {Object.keys(errors).length > 0 && (
          <Alert className="mb-6 bg-red-50 border-red-200">
            <AlertDescription className="text-red-800">
              Please correct the errors below before continuing.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          {/* License Type */}
          <div className="space-y-2">
            <Label>License Type <span className="text-red-500">*</span></Label>
            <Select
              value={data.licenseType}
              onValueChange={(value) => onUpdate({ licenseType: value })}
            >
              <SelectTrigger className={errors.licenseType ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select your license type..." />
              </SelectTrigger>
              <SelectContent>
                {LICENSE_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.licenseType && <p className="text-sm text-red-600">{errors.licenseType}</p>}
          </div>

          {/* License Number */}
          <div className="space-y-2">
            <Label>License Number <span className="text-red-500">*</span></Label>
            <Input
              placeholder="e.g., LCSW12345"
              value={data.licenseNumber}
              onChange={(e) => onUpdate({ licenseNumber: e.target.value })}
              className={errors.licenseNumber ? 'border-red-500' : ''}
            />
            {errors.licenseNumber && <p className="text-sm text-red-600">{errors.licenseNumber}</p>}
          </div>

          {/* Issuing States (AI Match Required) */}
          <div className="space-y-3">
            <Label>Issuing State / Province ({data.country || 'US'})</Label>
            <Select
              value={data.issuingStates[0] || ''}
              onValueChange={(value) => onUpdate({ issuingStates: [value] })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select state where licensed..." />
              </SelectTrigger>
              <SelectContent>
                {availableStates.length > 0 ? (
                  availableStates.map((state) => (
                    <SelectItem key={state.isoCode} value={state.isoCode}>
                      {state.name}
                    </SelectItem>
                  ))
                ) : (
                  // Fallback if no states found (unlikely for major countries, but good practice)
                  <div className="p-2 text-sm text-gray-500">No states found for selected country</div>
                )}
              </SelectContent>
            </Select>
            {errors.issuingStates && <p className="text-sm text-red-600">{errors.issuingStates}</p>}
          </div>

          {/* Additional Practice States (AI Match Required) */}
          <div className="space-y-3">
            <Label>Additional States Where You Can Practice (Optional)</Label>
            <p className="text-sm text-gray-600">
              Add any additional states where you have authorization to practice (e.g., through PSYPACT, teletherapy reciprocity, etc.)
            </p>
            <div className="flex gap-2">
              <Select value={currentPracticeState} onValueChange={setCurrentPracticeState}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select additional practice state..." />
                </SelectTrigger>
                <SelectContent>
                  {availableStates
                    .filter(s => !data.issuingStates.includes(s.isoCode) && !data.additionalPracticeStates.includes(s.isoCode))
                    .map((state) => (
                      <SelectItem key={state.isoCode} value={state.isoCode}>
                        {state.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                onClick={addPracticeState}
                disabled={!currentPracticeState}
                variant="outline"
              >
                Add
              </Button>
            </div>

            {data.additionalPracticeStates.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {data.additionalPracticeStates.map((state) => {
                  const stateObj = availableStates.find(s => s.isoCode === state);
                  const displayName = stateObj ? stateObj.name : state;

                  return (
                    <Badge key={state} variant="outline" className="px-3 py-1">
                      {displayName}
                      <button
                        onClick={() => removePracticeState(state)}
                        className="ml-2 hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  );
                })}
              </div>
            )}
          </div>

          {/* License Expiry Date */}
          <div className="space-y-2">
            <Label>License Expiry Date</Label>
            <Input
              type="date"
              value={data.licenseExpiryDate}
              onChange={(e) => onUpdate({ licenseExpiryDate: e.target.value })}
              className={errors.licenseExpiryDate ? 'border-red-500' : ''}
            />
            {errors.licenseExpiryDate && <p className="text-sm text-red-600">{errors.licenseExpiryDate}</p>}
          </div>

          {/* License Document Upload */}
          <div className="space-y-2">
            <Label>Upload License Document (Recommended)</Label>
            <Input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => handleFileUpload('licenseDocument', e.target.files?.[0] || null)}
            />
            {data.licenseDocument && (
              <p className="text-sm text-green-600 mt-2">
                ✓ File uploaded: {typeof data.licenseDocument === 'string' ? data.licenseDocument : data.licenseDocument.name}
              </p>
            )}
            {errors.licenseDocument && <p className="text-sm text-red-600">{errors.licenseDocument}</p>}
          </div>

          {/* Malpractice Insurance (Compliance) */}
          <div className="space-y-2">
            <Label>Malpractice Insurance Provider</Label>
            <Input
              placeholder="e.g., HPSO, CPH & Associates"
              value={data.malpracticeInsurance}
              onChange={(e) => onUpdate({ malpracticeInsurance: e.target.value })}
              className={errors.malpracticeInsurance ? 'border-red-500' : ''}
            />
            {errors.malpracticeInsurance && <p className="text-sm text-red-600">{errors.malpracticeInsurance}</p>}
          </div>

          {/* Malpractice Insurance Document */}
          <div className="space-y-2">
            <Label>Upload Malpractice Insurance Certificate (Optional)</Label>
            <Input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => handleFileUpload('malpracticeInsuranceDocument', e.target.files?.[0] || null)}
            />
            {data.malpracticeInsuranceDocument && (
              <p className="text-sm text-green-600 mt-2">
                ✓ File uploaded: {typeof data.malpracticeInsuranceDocument === 'string' ? data.malpracticeInsuranceDocument : data.malpracticeInsuranceDocument.name}
              </p>
            )}
          </div>

          {/* NPI Number */}
          <div className="space-y-2">
            <Label>NPI Number (National Provider Identifier)</Label>
            <Input
              placeholder="10-digit NPI number (optional)"
              value={data.npiNumber}
              onChange={(e) => onUpdate({ npiNumber: e.target.value })}
              maxLength={10}
            />
            <p className="text-sm text-gray-600">Required for insurance billing</p>
          </div>

          {/* DEA Number */}
          <div className="space-y-2">
            <Label>DEA Number (If Prescribing)</Label>
            <Input
              placeholder="If you prescribe medication (optional)"
              value={data.deaNumber}
              onChange={(e) => onUpdate({ deaNumber: e.target.value })}
            />
          </div>

          {/* Government ID Upload */}
          <div className="space-y-2">
            <Label>Government-Issued ID (Optional)</Label>
            <Input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => handleFileUpload('governmentId', e.target.files?.[0] || null)}
            />
            {data.governmentId && (
              <p className="text-sm text-green-600 mt-2">
                ✓ File uploaded: {typeof data.governmentId === 'string' ? data.governmentId : data.governmentId.name}
              </p>
            )}
          </div>

          {/* Information Accuracy Certification */}
          <div className="space-y-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-3">
              <Checkbox
                id="informationAccurate"
                checked={data.informationAccurate}
                onCheckedChange={(checked) => onUpdate({ informationAccurate: checked as boolean })}
                className={errors.informationAccurate ? 'border-red-500' : ''}
              />
              <div className="flex-1">
                <Label htmlFor="informationAccurate" className="cursor-pointer">
                  I certify that the information provided is accurate and complete <span className="text-red-500">*</span>
                </Label>
                <p className="text-sm text-gray-600 mt-1">
                  Providing false information may result in termination from the platform and legal consequences.
                </p>
              </div>
            </div>
            {errors.informationAccurate && <p className="text-sm text-red-600">{errors.informationAccurate}</p>}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between gap-4 mt-8 pt-6 border-t">
          <Button
            type="button"
            onClick={onBack}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <Button
            onClick={handleNext}
            disabled={isSubmitting}
            className="bg-orange-500 hover:bg-orange-600 text-white px-8"
          >
            {isSubmitting ? 'Processing...' : 'Continue'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
