import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Badge } from '../ui/badge';
import { ArrowLeft, GraduationCap, Brain, Heart } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';
import {
  DEGREES,
  CLINICAL_SPECIALTIES,
  LIFE_CONTEXT_SPECIALTIES,
  THERAPEUTIC_MODALITIES,
  PERSONAL_STYLES,
  SPECIALIZATIONS
} from '../../types/onboarding';

interface OnboardingStep4Props {
  data: {
    // Legacy fields
    highestDegree: string;
    institutionName: string;
    graduationYear: string;
    yearsOfExperience: number;
    specializations: string[];
    bio: string;

    // Section C - Clinical Specialties
    clinicalSpecialties: {
      anxiety: boolean;
      depression: boolean;
      trauma_ptsd: boolean;
      ocd: boolean;
      adhd: boolean;
      bipolar: boolean;
      personalityDisorders: boolean;
      autismSupport: boolean;
      couplesTherapy: boolean;
      familyTherapy: boolean;
      parenting: boolean;
      substanceUse: boolean;
      disorderedEating: boolean;
      chronicIllness: boolean;
      veterans: boolean;
      lgbtqPlus: boolean;
      grief: boolean;
      anger: boolean;
      stressBurnout: boolean;
      workCareerIssues: boolean;
    };

    // Section C - Life Context Specialties
    lifeContextSpecialties: {
      immigrantPopulations: boolean;
      firstGenerationSupport: boolean;
      veterans: boolean;
      bipocCommunities: boolean;
      highAchievingProfessionals: boolean;
      collegeStudents: boolean;
      children0to6: boolean;
      kids7to12: boolean;
      teens13to17: boolean;
      adults: boolean;
      seniors: boolean;
    };

    // Section D - Therapeutic Modalities
    cbt: boolean;
    dbt: boolean;
    act: boolean;
    emdr: boolean;
    humanistic: boolean;
    psychodynamic: boolean;
    gottman: boolean;
    eft: boolean;
    exposureTherapy: boolean;
    somaticTherapies: boolean;
    ifs: boolean;
    mindfulnessBased: boolean;
    motivationalInterviewing: boolean;
    traumaInformedCare: boolean;
    playTherapy: boolean;
    artTherapy: boolean;
    narrativeTherapy: boolean;
    solutionFocused: boolean;

    // Section E - Personal Style
    warmCompassionate: boolean;
    structuredGoalOriented: boolean;
    skillsBased: boolean;
    directHonest: boolean;
    insightOriented: boolean;
    culturallySensitive: boolean;
    faithBased: boolean;
    lgbtqAffirming: boolean;
  };
  onUpdate: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

export function OnboardingStep4CredentialsEnhanced({ data, onUpdate, onNext, onBack }: OnboardingStep4Props) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleCheckboxChange = (section: string, field: string, checked: boolean) => {
    if (section === 'clinical') {
      onUpdate({
        clinicalSpecialties: {
          ...data.clinicalSpecialties,
          [field]: checked
        }
      });
    } else if (section === 'lifeContext') {
      onUpdate({
        lifeContextSpecialties: {
          ...data.lifeContextSpecialties,
          [field]: checked
        }
      });
    } else if (section === 'modality') {
      onUpdate({ [field]: checked });
    } else if (section === 'style') {
      onUpdate({ [field]: checked });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Basic credentials
    if (!data.highestDegree) newErrors.degree = 'Degree is required';
    if (!data.institutionName.trim()) newErrors.institution = 'Institution name is required';
    if (!data.graduationYear) newErrors.year = 'Graduation year is required';
    if (!data.yearsOfExperience || data.yearsOfExperience < 0) {
      newErrors.experience = 'Years of experience is required';
    }

    // At least one clinical specialty
    const hasClinicalSpecialty = Object.values(data.clinicalSpecialties).some(v => v);
    if (!hasClinicalSpecialty) {
      newErrors.clinical = 'Select at least one clinical specialty';
    }

    // At least one life context specialty
    const hasLifeContext = Object.values(data.lifeContextSpecialties).some(v => v);
    if (!hasLifeContext) {
      newErrors.lifeContext = 'Select at least one age group or population';
    }

    // At least one modality
    const hasModality = THERAPEUTIC_MODALITIES.some(m => data[m.value as keyof typeof data]);
    if (!hasModality) {
      newErrors.modality = 'Select at least one therapeutic modality';
    }

    // At least one personal style
    const hasStyle = PERSONAL_STYLES.some(s => data[s.value as keyof typeof data]);
    if (!hasStyle) {
      newErrors.style = 'Select at least one personal style';
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

  const clinicalCount = Object.values(data.clinicalSpecialties).filter(v => v).length;
  const lifeContextCount = Object.values(data.lifeContextSpecialties).filter(v => v).length;
  const modalityCount = THERAPEUTIC_MODALITIES.filter(m => data[m.value as keyof typeof data]).length;
  const styleCount = PERSONAL_STYLES.filter(s => data[s.value as keyof typeof data]).length;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Card className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-orange-100 rounded-full">
              <GraduationCap className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h2 className="text-2xl">Professional Credentials & Specializations</h2>
              <p className="text-gray-600 mt-1">
                Share your education, expertise, and therapeutic approach
              </p>
            </div>
          </div>
        </div>

        <Alert className="mb-6 bg-blue-50 border-blue-200">
          <AlertDescription className="text-blue-900">
            <strong>🤖 AI Matching:</strong> These details power our AI to match you with ideal clients based on their needs and preferences.
          </AlertDescription>
        </Alert>

        <div className="space-y-8">
          {/* BASIC CREDENTIALS */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Education & Experience</h3>

            <div className="space-y-2">
              <Label>Highest Degree <span className="text-red-500">*</span></Label>
              <Select
                value={data.highestDegree}
                onValueChange={(value) => onUpdate({ highestDegree: value })}
              >
                <SelectTrigger className={errors.degree ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select your degree" />
                </SelectTrigger>
                <SelectContent>
                  {DEGREES.map((degree) => (
                    <SelectItem key={degree} value={degree}>
                      {degree}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.degree && <p className="text-sm text-red-600">{errors.degree}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Institution Name <span className="text-red-500">*</span></Label>
                <Input
                  placeholder="e.g., Stanford University"
                  className={errors.institution ? 'border-red-500' : ''}
                  value={data.institutionName}
                  onChange={(e) => onUpdate({ institutionName: e.target.value })}
                />
                {errors.institution && <p className="text-sm text-red-600">{errors.institution}</p>}
              </div>

              <div className="space-y-2">
                <Label>Graduation Year <span className="text-red-500">*</span></Label>
                <Select
                  value={data.graduationYear}
                  onValueChange={(value) => onUpdate({ graduationYear: value })}
                >
                  <SelectTrigger className={errors.year ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.year && <p className="text-sm text-red-600">{errors.year}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Years of Clinical Experience <span className="text-red-500">*</span></Label>
              <Input
                type="number"
                min="0"
                max="60"
                placeholder="e.g., 5"
                className={errors.experience ? 'border-red-500' : ''}
                value={data.yearsOfExperience || ''}
                onChange={(e) => onUpdate({ yearsOfExperience: parseInt(e.target.value) || 0 })}
              />
              {errors.experience && <p className="text-sm text-red-600">{errors.experience}</p>}
            </div>
          </div>

          {/* SECTION C: CLINICAL SPECIALTIES */}
          <div className="space-y-6 pt-6 border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-orange-600" />
                <h3 className="text-lg font-medium">Clinical Specialties</h3>
              </div>
              {clinicalCount > 0 && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {clinicalCount} selected
                </Badge>
              )}
            </div>

            {errors.clinical && (
              <Alert className="bg-red-50 border-red-200">
                <AlertDescription className="text-red-800">{errors.clinical}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {CLINICAL_SPECIALTIES.map((spec) => (
                <div
                  key={spec.value}
                  className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${data.clinicalSpecialties[spec.value as keyof typeof data.clinicalSpecialties]
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-orange-300'
                    }`}
                  onClick={() => handleCheckboxChange('clinical', spec.value, !data.clinicalSpecialties[spec.value as keyof typeof data.clinicalSpecialties])}
                >
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={data.clinicalSpecialties[spec.value as keyof typeof data.clinicalSpecialties]}
                      onCheckedChange={(checked) => handleCheckboxChange('clinical', spec.value, checked as boolean)}
                    />
                    <Label className="cursor-pointer text-sm">{spec.label}</Label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION C: LIFE CONTEXT SPECIALTIES */}
          <div className="space-y-6 pt-6 border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-orange-600" />
                <h3 className="text-lg font-medium">Age Groups & Populations</h3>
              </div>
              {lifeContextCount > 0 && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {lifeContextCount} selected
                </Badge>
              )}
            </div>

            {errors.lifeContext && (
              <Alert className="bg-red-50 border-red-200">
                <AlertDescription className="text-red-800">{errors.lifeContext}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {LIFE_CONTEXT_SPECIALTIES.map((spec) => (
                <div
                  key={spec.value}
                  className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${data.lifeContextSpecialties[spec.value as keyof typeof data.lifeContextSpecialties]
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-orange-300'
                    }`}
                  onClick={() => handleCheckboxChange('lifeContext', spec.value, !data.lifeContextSpecialties[spec.value as keyof typeof data.lifeContextSpecialties])}
                >
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={data.lifeContextSpecialties[spec.value as keyof typeof data.lifeContextSpecialties]}
                      onCheckedChange={(checked) => handleCheckboxChange('lifeContext', spec.value, checked as boolean)}
                    />
                    <Label className="cursor-pointer text-sm">{spec.label}</Label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION D: THERAPEUTIC MODALITIES */}
          <div className="space-y-6 pt-6 border-t">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Therapeutic Modalities</h3>
              {modalityCount > 0 && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {modalityCount} selected
                </Badge>
              )}
            </div>

            {errors.modality && (
              <Alert className="bg-red-50 border-red-200">
                <AlertDescription className="text-red-800">{errors.modality}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {THERAPEUTIC_MODALITIES.map((modality) => (
                <div
                  key={modality.value}
                  className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${data[modality.value as keyof typeof data]
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-orange-300'
                    }`}
                  onClick={() => handleCheckboxChange('modality', modality.value, !data[modality.value as keyof typeof data])}
                >
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={data[modality.value as keyof typeof data] as boolean}
                      onCheckedChange={(checked) => handleCheckboxChange('modality', modality.value, checked as boolean)}
                    />
                    <Label className="cursor-pointer text-sm">{modality.label}</Label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION E: PERSONAL STYLE */}
          <div className="space-y-6 pt-6 border-t">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Your Therapeutic Style</h3>
              {styleCount > 0 && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {styleCount} selected
                </Badge>
              )}
            </div>

            {errors.style && (
              <Alert className="bg-red-50 border-red-200">
                <AlertDescription className="text-red-800">{errors.style}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {PERSONAL_STYLES.map((style) => (
                <div
                  key={style.value}
                  className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${data[style.value as keyof typeof data]
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-orange-300'
                    }`}
                  onClick={() => handleCheckboxChange('style', style.value, !data[style.value as keyof typeof data])}
                >
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={data[style.value as keyof typeof data] as boolean}
                      onCheckedChange={(checked) => handleCheckboxChange('style', style.value, checked as boolean)}
                    />
                    <Label className="cursor-pointer text-sm">{style.label}</Label>
                  </div>
                </div>
              ))}
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
