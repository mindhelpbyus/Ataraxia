import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card } from '../ui/card';
import { Checkbox } from '../ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { ArrowLeft, Shield, CreditCard, Upload, X } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';
import { INSURANCE_PROVIDERS } from '../../types/onboarding';

interface OnboardingStep9Props {
  data: {
    // Section I - Insurance & Payor Support
    insurancePanelsAccepted: string[];
    medicaidAcceptance: boolean;
    medicareAcceptance: boolean;
    selfPayAccepted: boolean;
    slidingScale: boolean;
    employerEaps: string[];

    // Section K - Compliance
    backgroundCheckResults: string;
    backgroundCheckDocument?: File | string;
    hipaaTrainingCompleted: boolean;
    hipaaTrainingDocument?: File | string;
    ethicsCertification: boolean;
    ethicsCertificationDocument?: File | string;
    signedBaa: boolean;
    w9Document?: File | string;
    country?: string;
  };
  onUpdate: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export function OnboardingStep9Insurance({ data, onUpdate, onNext, onBack }: OnboardingStep9Props) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentInsurance, setCurrentInsurance] = useState('');
  const [currentEap, setCurrentEap] = useState('');

  const handleCheckboxChange = (field: string, checked: boolean) => {
    onUpdate({ [field]: checked });
  };

  const addInsurancePanel = (insurance: string) => {
    if (insurance && !data.insurancePanelsAccepted.includes(insurance)) {
      onUpdate({
        insurancePanelsAccepted: [...data.insurancePanelsAccepted, insurance]
      });
    }
    setCurrentInsurance('');
  };

  const removeInsurancePanel = (insurance: string) => {
    onUpdate({
      insurancePanelsAccepted: data.insurancePanelsAccepted.filter(i => i !== insurance)
    });
  };

  const addEap = () => {
    if (currentEap.trim() && !data.employerEaps.includes(currentEap.trim())) {
      onUpdate({
        employerEaps: [...data.employerEaps, currentEap.trim()]
      });
      setCurrentEap('');
    }
  };

  const removeEap = (eap: string) => {
    onUpdate({
      employerEaps: data.employerEaps.filter(e => e !== eap)
    });
  };

  const handleFileUpload = (field: string, file: File | null) => {
    if (file) {
      onUpdate({ [field]: file });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // At least one payment method required
    const hasPaymentMethod = data.selfPayAccepted ||
      data.medicaidAcceptance ||
      data.medicareAcceptance ||
      data.insurancePanelsAccepted.length > 0;

    if (!hasPaymentMethod) {
      newErrors.payment = 'Please select at least one payment method (insurance, self-pay, etc.)';
    }

    // HIPAA training is no longer mandatory per user request
    // if (!data.hipaaTrainingCompleted) {
    //   newErrors.hipaa = 'HIPAA training completion is required';
    // }

    // BAA signature is required
    if (!data.signedBaa) {
      newErrors.baa = 'Business Associate Agreement signature is required';
    }

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
              <CreditCard className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h2 className="text-2xl">Insurance & Compliance</h2>
              <p className="text-gray-600 mt-1">
                Payment methods and required compliance documentation
              </p>
            </div>
          </div>
        </div>

        {/* Error Messages */}
        {Object.keys(errors).length > 0 && (
          <Alert className="mb-6 bg-red-50 border-red-200">
            <AlertDescription className="text-red-800">
              <ul className="list-disc list-inside space-y-1">
                {Object.values(errors).map((error, idx) => (
                  <li key={idx}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-8">
          {/* SECTION I: INSURANCE & PAYMENT */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-orange-600" />
              <h3 className="text-lg font-medium">Payment & Insurance</h3>
            </div>

            {/* Insurance Panels (US Only) */}
            {(data.country === 'US' || !data.country) && (
              <div className="space-y-3">
                <Label>Insurance Panels Accepted</Label>
                <div className="flex gap-2">
                  <Select value={currentInsurance} onValueChange={setCurrentInsurance}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select insurance provider..." />
                    </SelectTrigger>
                    <SelectContent>
                      {INSURANCE_PROVIDERS.map((provider) => (
                        <SelectItem key={provider} value={provider}>
                          {provider}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    onClick={() => addInsurancePanel(currentInsurance)}
                    disabled={!currentInsurance}
                    variant="outline"
                  >
                    Add
                  </Button>
                </div>

                {data.insurancePanelsAccepted.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {data.insurancePanelsAccepted.map((insurance) => (
                      <Badge key={insurance} variant="secondary" className="px-3 py-1">
                        {insurance}
                        <button
                          onClick={() => removeInsurancePanel(insurance)}
                          className="ml-2 hover:text-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Payment Options */}
            <div className="grid grid-cols-2 gap-4">
              {(data.country === 'US' || !data.country) && (
                <>
                  <div className="flex items-center gap-3 p-4 border rounded-lg">
                    <Checkbox
                      id="medicaid"
                      checked={data.medicaidAcceptance}
                      onCheckedChange={(checked) => handleCheckboxChange('medicaidAcceptance', checked as boolean)}
                    />
                    <Label htmlFor="medicaid" className="cursor-pointer">Accept Medicaid</Label>
                  </div>

                  <div className="flex items-center gap-3 p-4 border rounded-lg">
                    <Checkbox
                      id="medicare"
                      checked={data.medicareAcceptance}
                      onCheckedChange={(checked) => handleCheckboxChange('medicareAcceptance', checked as boolean)}
                    />
                    <Label htmlFor="medicare" className="cursor-pointer">Accept Medicare</Label>
                  </div>
                </>
              )}

              <div className="flex items-center gap-3 p-4 border rounded-lg">
                <Checkbox
                  id="selfPay"
                  checked={data.selfPayAccepted}
                  onCheckedChange={(checked) => handleCheckboxChange('selfPayAccepted', checked as boolean)}
                />
                <Label htmlFor="selfPay" className="cursor-pointer">Accept Self-Pay</Label>
              </div>

              <div className="flex items-center gap-3 p-4 border rounded-lg">
                <Checkbox
                  id="slidingScale"
                  checked={data.slidingScale}
                  onCheckedChange={(checked) => handleCheckboxChange('slidingScale', checked as boolean)}
                />
                <Label htmlFor="slidingScale" className="cursor-pointer">Offer Sliding Scale</Label>
              </div>
            </div>

            {/* Employer EAPs (US Only) */}
            {(data.country === 'US' || !data.country) && (
              <div className="space-y-3">
                <Label>Employer EAP Programs (Optional)</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g., Company ABC EAP"
                    value={currentEap}
                    onChange={(e) => setCurrentEap(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addEap())}
                  />
                  <Button
                    type="button"
                    onClick={addEap}
                    disabled={!currentEap.trim()}
                    variant="outline"
                  >
                    Add
                  </Button>
                </div>

                {data.employerEaps.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {data.employerEaps.map((eap) => (
                      <Badge key={eap} variant="secondary" className="px-3 py-1">
                        {eap}
                        <button
                          onClick={() => removeEap(eap)}
                          className="ml-2 hover:text-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* SECTION K: COMPLIANCE */}
          <div className="space-y-6 pt-6 border-t">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-orange-600" />
              <h3 className="text-lg font-medium">Compliance Documents</h3>
            </div>

            <Alert className="bg-blue-50 border-blue-200">
              <AlertDescription className="text-blue-900">
                <strong>HIPAA Compliance:</strong> All therapists must complete HIPAA training and sign a Business Associate Agreement (BAA).
              </AlertDescription>
            </Alert>

            {/* HIPAA Training */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Checkbox
                  id="hipaa"
                  checked={data.hipaaTrainingCompleted}
                  onCheckedChange={(checked) => handleCheckboxChange('hipaaTrainingCompleted', checked as boolean)}
                />
                <Label htmlFor="hipaa" className="cursor-pointer">
                  I have completed HIPAA training
                </Label>
              </div>

              {data.hipaaTrainingCompleted && (
                <div>
                  <Label>Upload HIPAA Training Certificate (Optional)</Label>
                  <Input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileUpload('hipaaTrainingDocument', e.target.files?.[0] || null)}
                    className="mt-2"
                  />
                  {data.hipaaTrainingDocument && (
                    <p className="text-sm text-green-600 mt-2">
                      ✓ File uploaded: {typeof data.hipaaTrainingDocument === 'string' ? data.hipaaTrainingDocument : data.hipaaTrainingDocument.name}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Ethics Certification */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Checkbox
                  id="ethics"
                  checked={data.ethicsCertification}
                  onCheckedChange={(checked) => handleCheckboxChange('ethicsCertification', checked as boolean)}
                />
                <Label htmlFor="ethics" className="cursor-pointer">
                  I have current ethics certification
                </Label>
              </div>

              {data.ethicsCertification && (
                <div>
                  <Label>Upload Ethics Certificate (Optional)</Label>
                  <Input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileUpload('ethicsCertificationDocument', e.target.files?.[0] || null)}
                    className="mt-2"
                  />
                  {data.ethicsCertificationDocument && (
                    <p className="text-sm text-green-600 mt-2">
                      ✓ File uploaded: {typeof data.ethicsCertificationDocument === 'string' ? data.ethicsCertificationDocument : data.ethicsCertificationDocument.name}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* BAA Signature */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Checkbox
                  id="baa"
                  checked={data.signedBaa}
                  onCheckedChange={(checked) => handleCheckboxChange('signedBaa', checked as boolean)}
                />
                <Label htmlFor="baa" className="cursor-pointer">
                  I agree to sign the Business Associate Agreement (BAA) <span className="text-red-500">*</span>
                </Label>
              </div>
            </div>

            {/* Background Check */}
            <div className="space-y-3">
              <Label>Background Check Consent</Label>
              <div className="p-4 border border-border rounded-lg bg-muted/30">
                <p className="text-sm text-muted-foreground mb-3">
                  Background checks are required for all therapists and will be conducted by our verification team after registration.
                </p>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="backgroundCheckConsent"
                    checked={data.backgroundCheckConsent || false}
                    onChange={(e) => onUpdate({ 
                      backgroundCheckConsent: e.target.checked,
                      backgroundCheckResults: 'pending' // Always set to pending
                    })}
                    className="rounded border-border"
                  />
                  <Label htmlFor="backgroundCheckConsent" className="text-sm">
                    I consent to a background check being conducted
                  </Label>
                </div>
              </div>
            </div>

            {/* W9 */}
            <div className="space-y-3">
              <Label>W-9 Tax Form (Optional)</Label>
              <Input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleFileUpload('w9Document', e.target.files?.[0] || null)}
              />
              {data.w9Document && (
                <p className="text-sm text-green-600 mt-2">
                  ✓ File uploaded: {typeof data.w9Document === 'string' ? data.w9Document : data.w9Document.name}
                </p>
              )}
            </div>
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
