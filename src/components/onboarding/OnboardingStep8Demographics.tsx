import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Card } from '../ui/card';
import { Checkbox } from '../ui/checkbox';
import { ArrowLeft, Users } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';

interface OnboardingStep8Props {
  data: {
    // Section F - Demographic Preferences (AI Match Required)
    kids: boolean;
    teens: boolean;
    adults: boolean;
    seniors: boolean;
    couples: boolean;
    families: boolean;
    lgbtqPlus: boolean;
    highRiskClients: boolean;
    adhdClients: boolean;
    neurodivergentGroups: boolean;
    courtOrderedClients: boolean;
    bipocCommunities: boolean;
    immigrants: boolean;
    veteransCommunity: boolean;
  };
  onUpdate: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

const DEMOGRAPHIC_PREFERENCES = [
  { value: 'kids', label: 'Kids (Children under 12)', description: 'Child therapy and developmental support' },
  { value: 'teens', label: 'Teens (13-17)', description: 'Adolescent therapy and youth counseling' },
  { value: 'adults', label: 'Adults (18-64)', description: 'Adult therapy and counseling' },
  { value: 'seniors', label: 'Seniors (65+)', description: 'Senior therapy and aging support' },
  { value: 'couples', label: 'Couples', description: 'Couples therapy and relationship counseling' },
  { value: 'families', label: 'Families', description: 'Family therapy and family systems work' },
  { value: 'lgbtqPlus', label: 'LGBTQ+ Community', description: 'LGBTQ+ affirming therapy' },
  { value: 'highRiskClients', label: 'High-Risk Clients', description: 'Clients with severe mental health challenges' },
  { value: 'adhdClients', label: 'ADHD Clients', description: 'Specialized ADHD support and coaching' },
  { value: 'neurodivergentGroups', label: 'Neurodivergent Groups', description: 'Autism, ADHD, and other neurodivergent populations' },
  { value: 'courtOrderedClients', label: 'Court-Ordered Clients', description: 'Mandated therapy and legal requirement support' },
  { value: 'bipocCommunities', label: 'BIPOC Communities', description: 'Culturally sensitive therapy for BIPOC clients' },
  { value: 'immigrants', label: 'Immigrants', description: 'Immigration-related stress and cultural adjustment' },
  { value: 'veteransCommunity', label: 'Veterans', description: 'Military and veteran-specific therapy' }
];

export function OnboardingStep8Demographics({ data, onUpdate, onNext, onBack }: OnboardingStep8Props) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleCheckboxChange = (field: string, checked: boolean) => {
    onUpdate({ [field]: checked });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Check if at least one demographic preference is selected
    const hasSelection = DEMOGRAPHIC_PREFERENCES.some(pref => data[pref.value as keyof typeof data]);
    if (!hasSelection) {
      newErrors.preferences = 'Please select at least one client demographic you are comfortable working with';
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

  const selectedCount = DEMOGRAPHIC_PREFERENCES.filter(pref => data[pref.value as keyof typeof data]).length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Card className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-orange-100 rounded-full">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h2 className="text-2xl">Client Demographics & Preferences</h2>
              <p className="text-gray-600 mt-1">
                Who do you feel most comfortable and effective working with?
              </p>
            </div>
          </div>

          {selectedCount > 0 && (
            <Alert className="bg-green-50 border-green-200">
              <AlertDescription className="text-green-800">
                ✓ You've selected {selectedCount} demographic group{selectedCount !== 1 ? 's' : ''}
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Error Message */}
        {errors.preferences && (
          <Alert className="mb-6 bg-red-50 border-red-200">
            <AlertDescription className="text-red-800">
              {errors.preferences}
            </AlertDescription>
          </Alert>
        )}

        {/* AI Matching Notice */}
        <Alert className="mb-6 bg-blue-50 border-blue-200">
          <AlertDescription className="text-blue-900">
            <strong>🤖 AI Matching:</strong> These preferences help our AI match you with the right clients based on your comfort level and expertise.
          </AlertDescription>
        </Alert>

        {/* Demographic Preferences Grid */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {DEMOGRAPHIC_PREFERENCES.map((pref) => (
              <div
                key={pref.value}
                className={`p-4 border-2 rounded-lg transition-all cursor-pointer ${data[pref.value as keyof typeof data]
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 hover:border-orange-300'
                  }`}
                onClick={() => handleCheckboxChange(pref.value, !data[pref.value as keyof typeof data])}
              >
                <div className="flex items-start gap-3">
                  <Checkbox
                    id={pref.value}
                    checked={data[pref.value as keyof typeof data]}
                    onCheckedChange={(checked) => handleCheckboxChange(pref.value, checked as boolean)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <Label
                      htmlFor={pref.value}
                      className="font-medium cursor-pointer"
                    >
                      {pref.label}
                    </Label>
                    <p className="text-sm text-gray-600 mt-1">{pref.description}</p>
                  </div>
                </div>
              </div>
            ))}
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
