import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { X, FileText, Shield, User, Camera, Upload } from 'lucide-react';
import { COMMUNICATION_STYLES, TELEHEALTH_PLATFORMS } from '../../types/onboarding';

interface OnboardingStep8Props {
  data: {
    // Section J: Workflow
    preferredSessionLength: number;
    preferredCommunicationStyle: string;
    willingToCompleteNotesInPlatform: boolean;
    crisisResponseCapability: boolean;
    telehealthPlatformExperience: string[];
    maxDailySessions: number;
    breakSchedulePreference: string;
    
    // Section K: Compliance
    backgroundCheckCompleted: boolean;
    backgroundCheckDate?: string;
    hipaaTrainingCompleted: boolean;
    hipaaTrainingDate?: string;
    ethicsCertification: boolean;
    ethicsCertificationDate?: string;
    baaSignedDate?: string;
    w9Submitted: boolean;
    w9Document?: File | string;
    
    // Section L: Profile
    shortBio: string;
    extendedBio: string;
    headshot?: File | string;
    whatClientsCanExpect: string;
    myApproachToTherapy: string;
  };
  onUpdate: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export function OnboardingStep8Profile({ data, onUpdate, onNext, onBack }: OnboardingStep8Props) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [headshotPreview, setHeadshotPreview] = useState<string | null>(null);
  const [w9Preview, setW9Preview] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'workflow' | 'compliance' | 'profile'>('workflow');

  const togglePlatform = (platform: string) => {
    const newPlatforms = data.telehealthPlatformExperience.includes(platform)
      ? data.telehealthPlatformExperience.filter((p) => p !== platform)
      : [...data.telehealthPlatformExperience, platform];
    onUpdate({ telehealthPlatformExperience: newPlatforms });
  };

  const removePlatform = (platform: string) => {
    onUpdate({ 
      telehealthPlatformExperience: data.telehealthPlatformExperience.filter((p) => p !== platform) 
    });
  };

  const handleHeadshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      if (!file.type.match(/image\/(jpeg|jpg|png)/)) {
        alert('Only JPG and PNG files are allowed');
        return;
      }
      onUpdate({ headshot: file });
      const reader = new FileReader();
      reader.onloadend = () => setHeadshotPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleW9Upload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
      onUpdate({ w9Document: file, w9Submitted: true });
      setW9Preview(file.name);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Workflow validation
    if (!data.preferredSessionLength || data.preferredSessionLength <= 0) {
      newErrors.preferredSessionLength = 'Select preferred session length';
    }
    if (!data.preferredCommunicationStyle) {
      newErrors.preferredCommunicationStyle = 'Select communication style';
    }
    if (!data.maxDailySessions || data.maxDailySessions <= 0) {
      newErrors.maxDailySessions = 'Enter maximum daily sessions';
    }
    if (data.telehealthPlatformExperience.length === 0) {
      newErrors.telehealthPlatform = 'Select at least one platform';
    }

    // Compliance validation
    if (!data.hipaaTrainingCompleted) {
      newErrors.hipaaTraining = 'HIPAA training is required';
    }
    if (!data.backgroundCheckCompleted) {
      newErrors.backgroundCheck = 'Background check is required';
    }

    // Profile validation
    if (!data.shortBio.trim() || data.shortBio.length > 80) {
      newErrors.shortBio = 'Short bio required (max 80 characters)';
    }
    if (!data.extendedBio.trim() || data.extendedBio.length < 100 || data.extendedBio.length > 700) {
      newErrors.extendedBio = 'Extended bio required (100-700 characters)';
    }
    if (!data.whatClientsCanExpect.trim()) {
      newErrors.whatClientsCanExpect = 'This field is required';
    }
    if (!data.myApproachToTherapy.trim()) {
      newErrors.myApproachToTherapy = 'This field is required';
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
    <div className="w-full max-w-3xl mx-auto px-6">
      <div className="p-8 shadow-lg rounded-lg bg-white/80 backdrop-blur-md border border-gray-100">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#FED7AA] mb-4">
            <FileText className="h-6 w-6 text-[#F97316]" />
          </div>
          <h1 className="text-3xl font-medium leading-8 text-gray-900 mb-2">
            Complete Your Profile
          </h1>
          <p className="text-sm text-muted-foreground">
            Workflow preferences, compliance, and your client-facing profile
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button
            type="button"
            onClick={() => setActiveTab('workflow')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'workflow'
                ? 'border-[#F97316] text-[#F97316]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Workflow & Operations
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('compliance')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'compliance'
                ? 'border-[#F97316] text-[#F97316]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Compliance
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'profile'
                ? 'border-[#F97316] text-[#F97316]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Client-Facing Profile
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* WORKFLOW TAB */}
          {activeTab === 'workflow' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sessionLength">Preferred Session Length *</Label>
                  <Select
                    value={String(data.preferredSessionLength)}
                    onValueChange={(value) => onUpdate({ preferredSessionLength: Number(value) })}
                  >
                    <SelectTrigger className={errors.preferredSessionLength ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select length" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">60 minutes</SelectItem>
                      <SelectItem value="90">90 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.preferredSessionLength && (
                    <p className="text-xs text-red-500">{errors.preferredSessionLength}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxDaily">Max Daily Sessions *</Label>
                  <Input
                    id="maxDaily"
                    type="number"
                    min="1"
                    max="12"
                    value={data.maxDailySessions || ''}
                    onChange={(e) => onUpdate({ maxDailySessions: Number(e.target.value) })}
                    className={errors.maxDailySessions ? 'border-red-500' : ''}
                  />
                  {errors.maxDailySessions && (
                    <p className="text-xs text-red-500">{errors.maxDailySessions}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="commStyle">Preferred Communication Style *</Label>
                <Select
                  value={data.preferredCommunicationStyle}
                  onValueChange={(value) => onUpdate({ preferredCommunicationStyle: value })}
                >
                  <SelectTrigger className={errors.preferredCommunicationStyle ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select style" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMMUNICATION_STYLES.map((style) => (
                      <SelectItem key={style} value={style}>
                        {style}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.preferredCommunicationStyle && (
                  <p className="text-xs text-red-500">{errors.preferredCommunicationStyle}</p>
                )}
              </div>

              <div className="space-y-3">
                <Label>Telehealth Platform Experience *</Label>
                <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto p-4 border border-gray-200 rounded-md bg-gray-50">
                  {TELEHEALTH_PLATFORMS.map((platform) => (
                    <div key={platform} className="flex items-center gap-2">
                      <Checkbox
                        id={`platform-${platform}`}
                        checked={data.telehealthPlatformExperience.includes(platform)}
                        onCheckedChange={() => togglePlatform(platform)}
                      />
                      <Label htmlFor={`platform-${platform}`} className="cursor-pointer text-sm">
                        {platform}
                      </Label>
                    </div>
                  ))}
                </div>
                {data.telehealthPlatformExperience.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {data.telehealthPlatformExperience.map((platform) => (
                      <Badge
                        key={platform}
                        variant="secondary"
                        className="px-3 py-1 bg-[#F97316]/10 text-[#F97316]"
                      >
                        {platform}
                        <button
                          type="button"
                          onClick={() => removePlatform(platform)}
                          className="ml-2 hover:text-red-500"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
                {errors.telehealthPlatform && (
                  <p className="text-xs text-red-500">{errors.telehealthPlatform}</p>
                )}
              </div>

              <div className="space-y-3 p-4 bg-gray-50 border border-gray-200 rounded-md">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="notesInPlatform"
                    checked={data.willingToCompleteNotesInPlatform}
                    onCheckedChange={(checked) => onUpdate({ willingToCompleteNotesInPlatform: checked })}
                  />
                  <Label htmlFor="notesInPlatform" className="cursor-pointer text-sm">
                    Willing to complete clinical notes in platform
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="crisisResponse"
                    checked={data.crisisResponseCapability}
                    onCheckedChange={(checked) => onUpdate({ crisisResponseCapability: checked })}
                  />
                  <Label htmlFor="crisisResponse" className="cursor-pointer text-sm">
                    Available for crisis response situations
                  </Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="breakSchedule">Break Schedule Preference</Label>
                <Input
                  id="breakSchedule"
                  value={data.breakSchedulePreference || ''}
                  onChange={(e) => onUpdate({ breakSchedulePreference: e.target.value })}
                  placeholder="e.g., 10-minute breaks between sessions"
                />
              </div>
            </div>
          )}

          {/* COMPLIANCE TAB */}
          {activeTab === 'compliance' && (
            <div className="space-y-6">
              <div className="space-y-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="hipaaTraining"
                    checked={data.hipaaTrainingCompleted}
                    onCheckedChange={(checked) => onUpdate({ hipaaTrainingCompleted: checked })}
                    className={errors.hipaaTraining ? 'border-red-500' : ''}
                  />
                  <div className="flex-1">
                    <Label htmlFor="hipaaTraining" className="cursor-pointer font-medium">
                      HIPAA Training Completed *
                    </Label>
                    {data.hipaaTrainingCompleted && (
                      <Input
                        type="date"
                        value={data.hipaaTrainingDate || ''}
                        onChange={(e) => onUpdate({ hipaaTrainingDate: e.target.value })}
                        className="mt-2"
                        max={new Date().toISOString().split('T')[0]}
                      />
                    )}
                  </div>
                </div>
                {errors.hipaaTraining && (
                  <p className="text-xs text-red-500">{errors.hipaaTraining}</p>
                )}
              </div>

              <div className="space-y-4 p-4 bg-green-50 border border-green-200 rounded-md">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="backgroundCheck"
                    checked={data.backgroundCheckCompleted}
                    onCheckedChange={(checked) => onUpdate({ backgroundCheckCompleted: checked })}
                    className={errors.backgroundCheck ? 'border-red-500' : ''}
                  />
                  <div className="flex-1">
                    <Label htmlFor="backgroundCheck" className="cursor-pointer font-medium">
                      Background Check Completed *
                    </Label>
                    {data.backgroundCheckCompleted && (
                      <Input
                        type="date"
                        value={data.backgroundCheckDate || ''}
                        onChange={(e) => onUpdate({ backgroundCheckDate: e.target.value })}
                        className="mt-2"
                        max={new Date().toISOString().split('T')[0]}
                      />
                    )}
                  </div>
                </div>
                {errors.backgroundCheck && (
                  <p className="text-xs text-red-500">{errors.backgroundCheck}</p>
                )}
              </div>

              <div className="space-y-4 p-4 bg-purple-50 border border-purple-200 rounded-md">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="ethics"
                    checked={data.ethicsCertification}
                    onCheckedChange={(checked) => onUpdate({ ethicsCertification: checked })}
                  />
                  <div className="flex-1">
                    <Label htmlFor="ethics" className="cursor-pointer font-medium">
                      Ethics Certification (Optional)
                    </Label>
                    {data.ethicsCertification && (
                      <Input
                        type="date"
                        value={data.ethicsCertificationDate || ''}
                        onChange={(e) => onUpdate({ ethicsCertificationDate: e.target.value })}
                        className="mt-2"
                        max={new Date().toISOString().split('T')[0]}
                      />
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label>W-9 Form (Tax Document)</Label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    id="w9-upload"
                    accept=".pdf,.doc,.docx"
                    onChange={handleW9Upload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('w9-upload')?.click()}
                    className="gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    Upload W-9
                  </Button>
                  {w9Preview && (
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      {w9Preview}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-gray-500">PDF, DOC, or DOCX (max 10MB)</p>
              </div>
            </div>
          )}

          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* Headshot */}
              <div className="flex flex-col items-center">
                <Label className="mb-3">Professional Headshot (Optional)</Label>
                <div className="relative">
                  <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                    {headshotPreview ? (
                      <img src={headshotPreview} alt="Headshot" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="h-12 w-12 text-gray-400" />
                    )}
                  </div>
                  <input
                    type="file"
                    id="headshot-upload"
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={handleHeadshotUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="headshot-upload"
                    className="absolute bottom-2 right-2 w-10 h-10 bg-[#F97316] rounded-full flex items-center justify-center cursor-pointer hover:bg-[#ea580c] shadow-lg"
                  >
                    <Camera className="h-5 w-5 text-white" />
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-2">JPG or PNG (max 5MB)</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="shortBio">
                  Short Bio * (80 characters max)
                  <span className="text-xs text-gray-500 ml-2">
                    {data.shortBio.length}/80
                  </span>
                </Label>
                <Input
                  id="shortBio"
                  value={data.shortBio}
                  onChange={(e) => onUpdate({ shortBio: e.target.value })}
                  maxLength={80}
                  placeholder="One-line intro for search results"
                  className={errors.shortBio ? 'border-red-500' : ''}
                />
                {errors.shortBio && <p className="text-xs text-red-500">{errors.shortBio}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="extendedBio">
                  Extended Bio * (100-700 characters)
                  <span className="text-xs text-gray-500 ml-2">
                    {data.extendedBio.length}/700
                  </span>
                </Label>
                <Textarea
                  id="extendedBio"
                  value={data.extendedBio}
                  onChange={(e) => onUpdate({ extendedBio: e.target.value })}
                  maxLength={700}
                  rows={4}
                  placeholder="Tell clients about your background, experience, and what makes you unique..."
                  className={errors.extendedBio ? 'border-red-500' : ''}
                />
                {errors.extendedBio && <p className="text-xs text-red-500">{errors.extendedBio}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientsExpect">What Clients Can Expect From Me *</Label>
                <Textarea
                  id="clientsExpect"
                  value={data.whatClientsCanExpect}
                  onChange={(e) => onUpdate({ whatClientsCanExpect: e.target.value })}
                  rows={3}
                  placeholder="Describe your communication style, session structure, and what clients will experience..."
                  className={errors.whatClientsCanExpect ? 'border-red-500' : ''}
                />
                {errors.whatClientsCanExpect && (
                  <p className="text-xs text-red-500">{errors.whatClientsCanExpect}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="myApproach">My Approach to Therapy *</Label>
                <Textarea
                  id="myApproach"
                  value={data.myApproachToTherapy}
                  onChange={(e) => onUpdate({ myApproachToTherapy: e.target.value })}
                  rows={3}
                  placeholder="Explain your therapeutic philosophy and methods..."
                  className={errors.myApproachToTherapy ? 'border-red-500' : ''}
                />
                {errors.myApproachToTherapy && (
                  <p className="text-xs text-red-500">{errors.myApproachToTherapy}</p>
                )}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-4 pt-6 border-t border-gray-200">
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
              Continue to Review
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
