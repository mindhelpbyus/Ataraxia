import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import {
  CheckCircle2,
  User,
  GraduationCap,
  Shield,
  Calendar,
  ChevronDown,
  ChevronUp,
  Loader2,
} from 'lucide-react';
import { OnboardingData } from '../../types/onboarding';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';

interface OnboardingStep7Props {
  data: OnboardingData;
  onBack: () => void;
  onSubmit: () => void;
  onComplete?: () => void; // New callback for when user clicks "Back to Login"
}

export function OnboardingStep7Review({ data, onBack, onSubmit, onComplete }: OnboardingStep7Props) {
  const [openSections, setOpenSections] = useState({
    personal: true,
    credentials: true,
    license: true,
    availability: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    // Simulate API call (save progress)
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Continue to next step
    onSubmit();
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-6">
      <Card className="p-8 shadow-lg border-0 bg-white">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Review Your Profile (So Far)</h1>
          <p className="text-sm text-gray-600">
            Please review your information before continuing to additional details
          </p>
        </div>

        <div className="space-y-4">
          {/* Personal Info */}
          <Collapsible open={openSections.personal}>
            <Card className="overflow-hidden">
              <CollapsibleTrigger
                className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                onClick={() => toggleSection('personal')}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#0176d3]/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-[#0176d3]" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900">Personal Information</h3>
                    <p className="text-xs text-gray-500">Basic details and contact</p>
                  </div>
                </div>
                {openSections.personal ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="p-4 pt-0 border-t">
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                    <div>
                      <dt className="text-gray-500">Full Name</dt>
                      <dd className="font-medium text-gray-900">{data.fullName}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">Email</dt>
                      <dd className="font-medium text-gray-900">{data.email}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">Phone</dt>
                      <dd className="font-medium text-gray-900">
                        {data.countryCode} {data.phoneNumber}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">Gender</dt>
                      <dd className="font-medium text-gray-900">{data.gender}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">Location</dt>
                      <dd className="font-medium text-gray-900">
                        {data.city}, {data.state}, {data.country}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">Languages</dt>
                      <dd className="flex flex-wrap gap-1">
                        {data.languages.map((lang) => (
                          <Badge key={lang} variant="secondary" className="text-xs">
                            {lang}
                          </Badge>
                        ))}
                      </dd>
                    </div>
                  </dl>
                </div>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Credentials */}
          <Collapsible open={openSections.credentials}>
            <Card className="overflow-hidden">
              <CollapsibleTrigger
                className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                onClick={() => toggleSection('credentials')}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#0176d3]/10 flex items-center justify-center">
                    <GraduationCap className="h-5 w-5 text-[#0176d3]" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900">Professional Credentials</h3>
                    <p className="text-xs text-gray-500">Education and experience</p>
                  </div>
                </div>
                {openSections.credentials ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="p-4 pt-0 border-t">
                  <dl className="space-y-3 text-sm">
                    <div>
                      <dt className="text-gray-500">Highest Degree</dt>
                      <dd className="font-medium text-gray-900">{data.highestDegree}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">Institution</dt>
                      <dd className="font-medium text-gray-900">
                        {data.institutionName} ({data.graduationYear})
                      </dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">Years of Experience</dt>
                      <dd className="font-medium text-gray-900">{data.yearsOfExperience} years</dd>
                    </div>
                    <div>
                      <dt className="text-gray-500 mb-2">Specializations</dt>
                      <dd className="flex flex-wrap gap-1">
                        {data.specializations.map((spec) => (
                          <Badge
                            key={spec}
                            variant="secondary"
                            className="bg-[#0176d3]/10 text-[#0176d3]"
                          >
                            {spec}
                          </Badge>
                        ))}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-gray-500 mb-2">Bio</dt>
                      <dd className="text-gray-700 bg-gray-50 p-3 rounded-md">{data.bio}</dd>
                    </div>
                  </dl>
                </div>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* License */}
          <Collapsible open={openSections.license}>
            <Card className="overflow-hidden">
              <CollapsibleTrigger
                className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                onClick={() => toggleSection('license')}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#0176d3]/10 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-[#0176d3]" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900">License & Compliance</h3>
                    <p className="text-xs text-gray-500">Verification documents</p>
                  </div>
                </div>
                {openSections.license ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="p-4 pt-0 border-t">
                  <dl className="space-y-3 text-sm">
                    <div>
                      <dt className="text-gray-500">License Number</dt>
                      <dd className="font-medium text-gray-900">{data.licenseNumber}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">Licensing Authority</dt>
                      <dd className="font-medium text-gray-900">{data.licensingAuthority}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">Expiry Date</dt>
                      <dd className="font-medium text-gray-900">{data.licenseExpiryDate}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">Documents</dt>
                      <dd className="flex gap-2">
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          ✓ License Uploaded
                        </Badge>
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          ✓ ID Uploaded
                        </Badge>
                      </dd>
                    </div>
                  </dl>
                </div>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Availability */}
          <Collapsible open={openSections.availability}>
            <Card className="overflow-hidden">
              <CollapsibleTrigger
                className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                onClick={() => toggleSection('availability')}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#0176d3]/10 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-[#0176d3]" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900">Availability & Preferences</h3>
                    <p className="text-xs text-gray-500">Schedule and session options</p>
                  </div>
                </div>
                {openSections.availability ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="p-4 pt-0 border-t">
                  <dl className="space-y-3 text-sm">
                    <div>
                      <dt className="text-gray-500 mb-2">Session Durations</dt>
                      <dd className="flex gap-2">
                        {data.sessionDurations.map((duration) => (
                          <Badge key={duration} variant="secondary">
                            {duration} min
                          </Badge>
                        ))}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-gray-500 mb-2">Session Types</dt>
                      <dd className="flex gap-2">
                        {data.sessionTypes.map((type) => (
                          <Badge key={type} variant="secondary" className="capitalize">
                            {type}
                          </Badge>
                        ))}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">Break Time</dt>
                      <dd className="font-medium text-gray-900">
                        {data.breakTimeBetweenSessions === 0
                          ? 'No break'
                          : `${data.breakTimeBetweenSessions} minutes`}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-gray-500 mb-2">Supported Languages</dt>
                      <dd className="flex flex-wrap gap-1">
                        {data.supportedLanguages.map((lang) => (
                          <Badge key={lang} variant="secondary" className="text-xs">
                            {lang}
                          </Badge>
                        ))}
                      </dd>
                    </div>
                  </dl>
                </div>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        </div>

        {/* Buttons */}
        <div className="flex gap-4 pt-8">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={isSubmitting}
            className="flex-1"
          >
            Back
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 bg-[#F97316] hover:bg-[#ea580c]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Continue to Demographics'
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}