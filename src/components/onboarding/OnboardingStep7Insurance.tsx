import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { Badge } from '../ui/badge';
import { X, DollarSign, CreditCard } from 'lucide-react';
import { INSURANCE_PANELS } from '../../types/onboarding';

interface OnboardingStep7Props {
  data: {
    insurancePanelsAccepted: string[];
    acceptsMedicaid: boolean;
    acceptsMedicare: boolean;
    acceptsSelfPay: boolean;
    acceptsSlidingScale: boolean;
    slidingScaleMin?: number;
    slidingScaleMax?: number;
    employerEAPs: string[];
  };
  onUpdate: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export function OnboardingStep7Insurance({ data, onUpdate, onNext, onBack }: OnboardingStep7Props) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [customEAP, setCustomEAP] = useState('');

  const toggleInsurancePanel = (panel: string) => {
    const newPanels = data.insurancePanelsAccepted.includes(panel)
      ? data.insurancePanelsAccepted.filter((p) => p !== panel)
      : [...data.insurancePanelsAccepted, panel];
    onUpdate({ insurancePanelsAccepted: newPanels });
  };

  const removeInsurancePanel = (panel: string) => {
    onUpdate({ insurancePanelsAccepted: data.insurancePanelsAccepted.filter((p) => p !== panel) });
  };

  const addEAP = () => {
    if (customEAP.trim() && !data.employerEAPs.includes(customEAP.trim())) {
      onUpdate({ employerEAPs: [...data.employerEAPs, customEAP.trim()] });
      setCustomEAP('');
    }
  };

  const removeEAP = (eap: string) => {
    onUpdate({ employerEAPs: data.employerEAPs.filter((e) => e !== eap) });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {}; 

    // At least one payment method must be selected
    if (
      data.insurancePanelsAccepted.length === 0 &&
      !data.acceptsMedicaid &&
      !data.acceptsMedicare &&
      !data.acceptsSelfPay &&
      !data.acceptsSlidingScale
    ) {
      newErrors.paymentMethod = 'Select at least one payment method';
    }

    // If sliding scale is enabled, validate min/max
    if (data.acceptsSlidingScale) {
      if (!data.slidingScaleMin || data.slidingScaleMin <= 0) {
        newErrors.slidingScaleMin = 'Enter minimum rate';
      }
      if (!data.slidingScaleMax || data.slidingScaleMax <= 0) {
        newErrors.slidingScaleMax = 'Enter maximum rate';
      }
      if (data.slidingScaleMin && data.slidingScaleMax && data.slidingScaleMin > data.slidingScaleMax) {
        newErrors.slidingScale = 'Minimum rate cannot exceed maximum rate';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onNext();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-6">
      <div className="p-8 shadow-lg rounded-lg bg-white/80 backdrop-blur-md border border-gray-100">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#FED7AA] mb-4">
            <CreditCard className="h-6 w-6 text-[#F97316]" />
          </div>
          <h1 className="text-3xl font-medium leading-8 text-gray-900 mb-2">
            Insurance & Payment Options
          </h1>
          <p className="text-sm text-muted-foreground">
            Select the insurance panels and payment methods you accept
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Insurance Panels */}
          <div className="space-y-3">
            <Label>Insurance Panels Accepted</Label>
            <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto p-4 border border-gray-200 rounded-md bg-gray-50">
              {INSURANCE_PANELS.map((panel) => (
                <div key={panel} className="flex items-center gap-2">
                  <Checkbox
                    id={`panel-${panel}`}
                    checked={data.insurancePanelsAccepted.includes(panel)}
                    onCheckedChange={() => toggleInsurancePanel(panel)}
                  />
                  <Label htmlFor={`panel-${panel}`} className="cursor-pointer text-sm">
                    {panel}
                  </Label>
                </div>
              ))}
            </div>
            {data.insurancePanelsAccepted.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {data.insurancePanelsAccepted.map((panel) => (
                  <Badge
                    key={panel}
                    variant="secondary"
                    className="px-3 py-1 bg-[#F97316]/10 text-[#F97316]"
                  >
                    {panel}
                    <button
                      type="button"
                      onClick={() => removeInsurancePanel(panel)}
                      className="ml-2 hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Government Programs */}
          <div className="space-y-3 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <Label className="text-sm font-medium">Government Programs</Label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="medicaid"
                  checked={data.acceptsMedicaid}
                  onCheckedChange={(checked) => onUpdate({ acceptsMedicaid: checked })}
                />
                <Label htmlFor="medicaid" className="cursor-pointer text-sm">
                  Accept Medicaid
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="medicare"
                  checked={data.acceptsMedicare}
                  onCheckedChange={(checked) => onUpdate({ acceptsMedicare: checked })}
                />
                <Label htmlFor="medicare" className="cursor-pointer text-sm">
                  Accept Medicare
                </Label>
              </div>
            </div>
          </div>

          {/* Self-Pay & Sliding Scale */}
          <div className="space-y-3 p-4 bg-green-50 border border-green-200 rounded-md">
            <Label className="text-sm font-medium">Direct Payment Options</Label>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="selfPay"
                  checked={data.acceptsSelfPay}
                  onCheckedChange={(checked) => onUpdate({ acceptsSelfPay: checked })}
                />
                <Label htmlFor="selfPay" className="cursor-pointer text-sm">
                  Accept Self-Pay (Out-of-Pocket)
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="slidingScale"
                  checked={data.acceptsSlidingScale}
                  onCheckedChange={(checked) => onUpdate({ acceptsSlidingScale: checked })}
                />
                <Label htmlFor="slidingScale" className="cursor-pointer text-sm">
                  Offer Sliding Scale (Income-based Pricing)
                </Label>
              </div>
              
              {/* Sliding Scale Range */}
              {data.acceptsSlidingScale && (
                <div className="ml-6 mt-3 space-y-3">
                  <Label className="text-xs text-gray-600">Sliding Scale Rate Range</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="slidingMin" className="text-xs">
                        Minimum ($)
                      </Label>
                      <Input
                        id="slidingMin"
                        type="number"
                        min="0"
                        value={data.slidingScaleMin || ''}
                        onChange={(e) => onUpdate({ slidingScaleMin: Number(e.target.value) })}
                        placeholder="50"
                        className={errors.slidingScaleMin ? 'border-red-500' : ''}
                      />
                      {errors.slidingScaleMin && (
                        <p className="text-xs text-red-500">{errors.slidingScaleMin}</p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="slidingMax" className="text-xs">
                        Maximum ($)
                      </Label>
                      <Input
                        id="slidingMax"
                        type="number"
                        min="0"
                        value={data.slidingScaleMax || ''}
                        onChange={(e) => onUpdate({ slidingScaleMax: Number(e.target.value) })}
                        placeholder="150"
                        className={errors.slidingScaleMax ? 'border-red-500' : ''}
                      />
                      {errors.slidingScaleMax && (
                        <p className="text-xs text-red-500">{errors.slidingScaleMax}</p>
                      )}
                    </div>
                  </div>
                  {errors.slidingScale && (
                    <p className="text-xs text-red-500">{errors.slidingScale}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Employer EAPs */}
          <div className="space-y-3">
            <Label>Employer EAP Programs (Optional)</Label>
            <p className="text-xs text-gray-500">
              Add any Employee Assistance Programs you're contracted with
            </p>
            <div className="flex gap-2">
              <Input
                value={customEAP}
                onChange={(e) => setCustomEAP(e.target.value)}
                placeholder="e.g., ComPsych, Magellan Health"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addEAP();
                  }
                }}
              />
              <Button type="button" onClick={addEAP} variant="outline">
                Add
              </Button>
            </div>
            {data.employerEAPs.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {data.employerEAPs.map((eap) => (
                  <Badge
                    key={eap}
                    variant="secondary"
                    className="px-3 py-1 bg-[#F97316]/10 text-[#F97316]"
                  >
                    {eap}
                    <button
                      type="button"
                      onClick={() => removeEAP(eap)}
                      className="ml-2 hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {errors.paymentMethod && (
            <p className="text-sm text-red-500 p-3 bg-red-50 rounded-md border border-red-200">
              {errors.paymentMethod}
            </p>
          )}

          {/* Navigation */}
          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              className="flex-1 rounded-full"
            >
              Back
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-[#F97316] hover:bg-[#ea580c] rounded-full"
            >
              Continue
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
