import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { ArrowLeft, User, Upload, CheckCircle2, ImageIcon } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';
import { AvatarGalleryDialog } from '../AvatarGalleryDialog';

interface OnboardingStep10Props {
  data: {
    // Section L - Therapist Profile (Client-facing)
    shortBio: string; // 80 characters
    extendedBio: string; // 500-700 characters
    headshot?: File | string;
    profilePhoto?: File | string;
    whatClientsCanExpect: string;
    myApproachToTherapy: string;
  };
  onUpdate: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export function OnboardingStep10Profile({ data, onUpdate, onNext, onBack }: OnboardingStep10Props) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showAvatarGallery, setShowAvatarGallery] = useState(false);

  const handleFileUpload = (file: File | null) => {
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors({ ...errors, headshot: 'Please upload an image file' });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, headshot: 'Image must be less than 5MB' });
        return;
      }

      onUpdate({ headshot: file, profilePhoto: file });

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectAvatar = (avatarUrl: string) => {
    onUpdate({ headshot: avatarUrl, profilePhoto: avatarUrl });
    setPreviewImage(null); // Clear file preview if any
    setShowAvatarGallery(false);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Short bio validation
    if (!data.shortBio.trim()) {
      newErrors.shortBio = 'Short bio is required';
    } else if (data.shortBio.length > 80) {
      newErrors.shortBio = 'Short bio must be 80 characters or less';
    }

    // Extended bio validation
    if (!data.extendedBio.trim()) {
      newErrors.extendedBio = 'Extended bio is required';
    } else if (data.extendedBio.length < 100) {
      newErrors.extendedBio = 'Extended bio must be at least 100 characters';
    } else if (data.extendedBio.length > 700) {
      newErrors.extendedBio = 'Extended bio must be 700 characters or less';
    }

    // What clients can expect (Optional per user request)
    // if (!data.whatClientsCanExpect.trim()) {
    //   newErrors.whatClientsCanExpect = 'Please describe what clients can expect';
    // } 

    // My approach to therapy (Optional per user request)
    // if (!data.myApproachToTherapy.trim()) {
    //   newErrors.myApproachToTherapy = 'Please describe your approach to therapy';
    // }

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

  const shortBioRemaining = 80 - data.shortBio.length;
  const extendedBioRemaining = 700 - data.extendedBio.length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Card className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-orange-100 rounded-full">
              <User className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h2 className="text-2xl">Your Professional Profile</h2>
              <p className="text-gray-600 mt-1">
                Create a compelling profile that helps clients connect with you
              </p>
            </div>
          </div>

          <Alert className="bg-blue-50 border-blue-200">
            <AlertDescription className="text-blue-900">
              <strong>💡 Tip:</strong> A great profile helps clients feel comfortable and confident in choosing you as their therapist.
            </AlertDescription>
          </Alert>
        </div>

        <div className="space-y-6">
          {/* Profile Photo */}
          <div className="space-y-3">
            <Label>
              Professional Headshot
              <span className="text-sm text-gray-500 ml-2">(Recommended)</span>
            </Label>
            <div className="flex items-start gap-6">
              <div className="flex-1">
                <div className="flex flex-wrap gap-2 mb-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => document.getElementById('headshot-upload')?.click()}
                  >
                    <Upload className="h-4 w-4" />
                    Upload Photo
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => setShowAvatarGallery(true)}
                  >
                    <ImageIcon className="h-4 w-4" />
                    Choose Avatar
                  </Button>
                </div>
                <Input
                  id="headshot-upload"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e.target.files?.[0] || null)}
                  className="hidden"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Upload a professional photo or choose from our avatar gallery. Max size: 5MB.
                </p>
                {errors.headshot && (
                  <p className="text-sm text-red-600 mt-1">{errors.headshot}</p>
                )}
              </div>
              {(previewImage || data.headshot) && (
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-orange-200">
                  <img
                    src={previewImage || (typeof data.headshot === 'string' ? data.headshot : '')}
                    alt="Profile preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Short Bio */}
          <div className="space-y-3">
            <Label>
              Short Bio (80 characters) <span className="text-red-500">*</span>
            </Label>
            <Input
              placeholder="e.g., Compassionate therapist specializing in anxiety, trauma, and life transitions"
              value={data.shortBio}
              onChange={(e) => onUpdate({ shortBio: e.target.value })}
              maxLength={80}
              className={errors.shortBio ? 'border-red-500' : ''}
            />
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500">
                This appears in search results and client browsing
              </p>
              <p className={`text-sm ${shortBioRemaining < 10 ? 'text-orange-600' : 'text-gray-500'}`}>
                {shortBioRemaining} characters remaining
              </p>
            </div>
            {errors.shortBio && (
              <p className="text-sm text-red-600">{errors.shortBio}</p>
            )}
          </div>

          {/* Extended Bio */}
          <div className="space-y-3">
            <Label>
              Extended Bio (500-700 characters) <span className="text-red-500">*</span>
            </Label>
            <Textarea
              placeholder="Share your background, education, experience, and what drew you to therapy. Help clients understand who you are as a person and professional..."
              value={data.extendedBio}
              onChange={(e) => onUpdate({ extendedBio: e.target.value })}
              rows={6}
              maxLength={700}
              className={errors.extendedBio ? 'border-red-500' : ''}
            />
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500">
                Tell your story and help clients get to know you
              </p>
              <p className={`text-sm ${data.extendedBio.length < 500 ? 'text-orange-600' : 'text-gray-500'}`}>
                {data.extendedBio.length}/700 characters
                {data.extendedBio.length >= 500 && data.extendedBio.length <= 700 && (
                  <CheckCircle2 className="w-4 h-4 text-green-600 inline ml-2" />
                )}
              </p>
            </div>
            {errors.extendedBio && (
              <p className="text-sm text-red-600">{errors.extendedBio}</p>
            )}
          </div>

          {/* What Clients Can Expect */}
          <div className="space-y-3">
            <Label>
              What Clients Can Expect From Me <span className="text-sm text-gray-500 ml-2">(Optional)</span>
            </Label>
            <Textarea
              placeholder="Describe your therapeutic style, what a typical session looks like, and what clients can expect when working with you..."
              value={data.whatClientsCanExpect}
              onChange={(e) => onUpdate({ whatClientsCanExpect: e.target.value })}
              rows={4}
              maxLength={500}
              className={errors.whatClientsCanExpect ? 'border-red-500' : ''}
            />
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500">
                Help clients understand your session structure and communication style
              </p>
              <p className="text-sm text-gray-500">{data.whatClientsCanExpect.length}/500</p>
            </div>
            {errors.whatClientsCanExpect && (
              <p className="text-sm text-red-600">{errors.whatClientsCanExpect}</p>
            )}
          </div>

          {/* My Approach to Therapy */}
          <div className="space-y-3">
            <Label>
              My Approach to Therapy <span className="text-sm text-gray-500 ml-2">(Optional)</span>
            </Label>
            <Textarea
              placeholder="Share your therapeutic philosophy, the modalities you use, and how you work with clients to achieve their goals..."
              value={data.myApproachToTherapy}
              onChange={(e) => onUpdate({ myApproachToTherapy: e.target.value })}
              rows={4}
              maxLength={500}
              className={errors.myApproachToTherapy ? 'border-red-500' : ''}
            />
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500">
                Explain your therapeutic approach and how you help clients
              </p>
              <p className="text-sm text-gray-500">{data.myApproachToTherapy.length}/500</p>
            </div>
            {errors.myApproachToTherapy && (
              <p className="text-sm text-red-600">{errors.myApproachToTherapy}</p>
            )}
          </div>

          {/* Profile Preview */}
          <Alert className="bg-green-50 border-green-200">
            <AlertDescription className="text-green-900">
              <strong>✓ Final Step:</strong> Review and submit your profile on the next page
            </AlertDescription>
          </Alert>
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
            {isSubmitting ? 'Processing...' : 'Review & Submit'}
          </Button>
        </div>
      </Card>

      <AvatarGalleryDialog
        open={showAvatarGallery}
        onOpenChange={setShowAvatarGallery}
        onSelectAvatar={handleSelectAvatar}
        selectedAvatar={typeof data.headshot === 'string' ? data.headshot : null}
      />
    </div>
  );
}
