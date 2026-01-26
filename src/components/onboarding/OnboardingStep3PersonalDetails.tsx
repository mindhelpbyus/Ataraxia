import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Badge } from '../ui/badge';
import { Camera, X, ImageIcon, Clock, MapPin } from 'lucide-react';
import { LANGUAGES } from '../../types/onboarding';
import { Country, State, City } from 'country-state-city';
import { UserCircle2 } from 'lucide-react';
import { AvatarGalleryDialog } from '../AvatarGalleryDialog';
import { 
  getTimezonesForCountry, 
  getDefaultTimezone, 
  formatTimezoneWithTime,
  getPopularTimezones,
  TIMEZONES 
} from '../../utils/timezones';
// @ts-ignore
import { lookup } from 'india-pincode-lookup';

interface OnboardingStep3Props {
  data: {
    profilePhoto?: File | string;
    selectedAvatarUrl?: string;
    gender: string;
    dateOfBirth: string;
    address1: string;
    address2: string;
    country: string;
    state: string;
    city: string;
    zipCode: string;
    languages: string[];
    timezone: string;
    termsAccepted: boolean;
  };
  onUpdate: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

const GENDERS = ['Male', 'Female', 'Non-binary', 'Prefer not to say'];

export function OnboardingStep3PersonalDetails({ data, onUpdate, onNext, onBack }: OnboardingStep3Props) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [photoPreview, setPhotoPreview] = useState<string | null>(() => {
    // Initialize from existing data if available
    if (data.profilePhoto) {
      if (typeof data.profilePhoto === 'string') return data.profilePhoto;
      // If it's a File, we'll read it in useEffect
    }
    return null;
  });
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [availableStates, setAvailableStates] = useState<any[]>([]);
  const [availableCities, setAvailableCities] = useState<any[]>([]);

  const [showAvatarGallery, setShowAvatarGallery] = useState(false);

  // Display priority: selectedAvatarUrl > photoPreview > camera icon
  const displayAvatar = data.selectedAvatarUrl || photoPreview;

  // Initialize photo preview from File if exists
  useEffect(() => {
    if (data.profilePhoto && data.profilePhoto instanceof File) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(data.profilePhoto);
    }
  }, []);

  // Set India as default country on mount (primary market)
  useEffect(() => {
    if (!data.country) {
      onUpdate({ country: 'IN', countryCode: '+91' }); // Set India as default with correct country code
    }
  }, []);

  // Auto-update timezone when country or zipCode changes
  useEffect(() => {
    if (data.country) {
      const suggestedTimezone = getDefaultTimezone(data.country, data.zipCode);
      
      // Only update if timezone is not already set or if it's different from suggestion
      if (!data.timezone || data.timezone !== suggestedTimezone) {
        console.log(`🕐 Suggesting timezone for ${data.country}: ${suggestedTimezone}`);
        onUpdate({ timezone: suggestedTimezone });
      }
    }
  }, [data.country, data.zipCode]);

  // Populate states when country changes
  useEffect(() => {
    if (data.country) {
      const states = State.getStatesOfCountry(data.country);
      setAvailableStates(states);

      // Reset state and city if country changes
      if (data.state) {
        const stateExists = states.some(s => s.isoCode === data.state);
        if (!stateExists) {
          onUpdate({ state: '', city: '' });
          setAvailableCities([]);
        }
      }
    } else {
      setAvailableStates([]);
      setAvailableCities([]);
    }
  }, [data.country]);

  // Populate cities when state changes
  useEffect(() => {
    if (data.country && data.state) {
      const cities = City.getCitiesOfState(data.country, data.state);
      setAvailableCities(cities);

      // Reset city if state changes
      if (data.city) {
        const cityExists = cities.some(c => c.name === data.city);
        if (!cityExists) {
          onUpdate({ city: '' });
        }
      }
    } else {
      setAvailableCities([]);
    }
  }, [data.state]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('File size must be less than 2MB');
        e.target.value = ''; // Reset input
        return;
      }

      // Validate file type
      if (!file.type.match(/image\/(jpeg|jpg|png|gif)/)) {
        alert('Only JPG, PNG, and GIF files are allowed');
        e.target.value = ''; // Reset input
        return;
      }

      onUpdate({ profilePhoto: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    onUpdate({ profilePhoto: undefined, selectedAvatarUrl: undefined });
    setPhotoPreview(null);
  };

  const handleSelectAvatar = (avatarUrl: string) => {
    onUpdate({ selectedAvatarUrl: avatarUrl, profilePhoto: undefined });
    setPhotoPreview(null); // Clear custom uploaded photo when selecting from gallery
  };

  const toggleLanguage = (language: string) => {
    const currentLanguages = data.languages || [];
    const newLanguages = currentLanguages.includes(language)
      ? currentLanguages.filter((l) => l !== language)
      : [...currentLanguages, language];
    onUpdate({ languages: newLanguages });
  };

  const removeLanguage = (language: string) => {
    onUpdate({ languages: (data.languages || []).filter((l) => l !== language) });
  };

  // Get country-specific languages (prioritized)
  const getLanguagesForCountry = (countryCode: string): string[] => {
    const indiaLanguages = ['Hindi', 'Bengali', 'Tamil', 'Telugu', 'Marathi', 'Gujarati', 'Kannada', 'Malayalam', 'Punjabi', 'Urdu', 'English'];
    const usLanguages = ['English', 'Spanish'];
    const ukLanguages = ['English'];
    const allLanguages = LANGUAGES;

    let prioritizedLanguages: string[] = [];
    let otherLanguages: string[] = [];

    if (countryCode === 'IN') {
      prioritizedLanguages = indiaLanguages;
      otherLanguages = allLanguages.filter(lang => !indiaLanguages.includes(lang));
    } else if (countryCode === 'US') {
      prioritizedLanguages = usLanguages;
      otherLanguages = allLanguages.filter(lang => !usLanguages.includes(lang));
    } else if (countryCode === 'GB') {
      prioritizedLanguages = ukLanguages;
      otherLanguages = allLanguages.filter(lang => !ukLanguages.includes(lang));
    } else {
      return allLanguages;
    }

    return [...prioritizedLanguages, ...otherLanguages];
  };

  const displayLanguages = data.country ? getLanguagesForCountry(data.country) : LANGUAGES;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!data.gender) newErrors.gender = 'Gender is required';
    if (!data.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!data.country) newErrors.country = 'Country is required';
    if (!data.state) newErrors.state = 'State is required';
    if (!data.city) newErrors.city = 'City is required';
    if (!data.zipCode) newErrors.zipCode = 'Zip/Postal Code is required';
    if (!data.timezone) newErrors.timezone = 'Timezone is required';
    if ((data.languages || []).length === 0) newErrors.languages = 'Select at least one language';
    if (!data.termsAccepted) newErrors.terms = 'You must accept the terms';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (validateForm()) {
      setIsSubmitting(true);
      onNext();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-6">
      <div className="p-8 shadow-lg rounded-lg bg-white/80 backdrop-blur-md border border-gray-100">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-orange-200 flex items-center justify-center mb-4">
            <UserCircle2 className="h-6 w-6 text-orange-500" />
          </div>
          <h1 className="text-3xl font-medium leading-8 text-gray-900 mb-2">Personal Details</h1>
          <p className="text-sm text-muted-foreground">
            Help us get to know you better and personalize your experience
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Photo */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                {displayAvatar ? (
                  <img src={displayAvatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="h-12 w-12 text-gray-400" />
                )}
              </div>
              <input
                type="file"
                id="photo-upload"
                accept="image/jpeg,image/jpg,image/png,image/gif"
                onChange={handlePhotoUpload}
                className="hidden"
              />
              <label
                htmlFor="photo-upload"
                className="absolute bottom-2 right-2 w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-orange-600 shadow-lg transition-colors"
                title="Upload profile photo"
              >
                <Camera className="h-5 w-5 text-white" />
              </label>
              {displayAvatar && (
                <button
                  type="button"
                  onClick={removePhoto}
                  className="absolute top-2 right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 shadow-lg transition-colors"
                  title="Remove photo"
                >
                  <X className="h-4 w-4 text-white" />
                </button>
              )}
            </div>
            <div className="mt-3 flex gap-2">
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
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Upload your own photo or choose from our gallery • Max 2MB
            </p>
          </div>

          {/* Avatar Gallery Dialog */}
          <AvatarGalleryDialog
            open={showAvatarGallery}
            onOpenChange={setShowAvatarGallery}
            onSelectAvatar={handleSelectAvatar}
            selectedAvatar={data.selectedAvatarUrl}
          />

          <div className="grid grid-cols-2 gap-6">
            {/* Gender */}
            <div className="space-y-2">
              <Label htmlFor="gender">Gender *</Label>
              <Select value={data.gender} onValueChange={(value) => onUpdate({ gender: value })}>
                <SelectTrigger className={errors.gender ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  {GENDERS.map((gender) => (
                    <SelectItem key={gender} value={gender}>
                      {gender}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.gender && <p className="text-xs text-red-500">{errors.gender}</p>}
            </div>

            {/* Date of Birth */}
            <div className="space-y-2">
              <Label htmlFor="dob">Date of Birth *</Label>
              <Input
                id="dob"
                type="date"
                className={errors.dateOfBirth ? 'border-red-500' : ''}
                value={data.dateOfBirth}
                onChange={(e) => onUpdate({ dateOfBirth: e.target.value })}
                max={new Date().toISOString().split('T')[0]}
              />
              {errors.dateOfBirth && <p className="text-xs text-red-500">{errors.dateOfBirth}</p>}
            </div>
          </div>

          {/* Street Address */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address1">Street Address Line 1 *</Label>
              <Input
                id="address1"
                value={data.address1 || ''}
                onChange={(e) => onUpdate({ address1: e.target.value })}
                placeholder="123 Main Street"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address2">Street Address Line 2 (Optional)</Label>
              <Input
                id="address2"
                value={data.address2 || ''}
                onChange={(e) => onUpdate({ address2: e.target.value })}
                placeholder="Apt, Suite, Floor, etc."
              />
            </div>
          </div>

          {/* Country */}
          <div className="space-y-2">
            <Label htmlFor="country">Country *</Label>
            <Select value={data.country} onValueChange={(value) => onUpdate({ country: value })}>
              <SelectTrigger className={errors.country ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {/* India first (primary market) */}
                {Country.getAllCountries()
                  .filter(c => c.isoCode === 'IN')
                  .map((country) => (
                    <SelectItem key={country.isoCode} value={country.isoCode}>
                      🇮🇳 {country.name}
                    </SelectItem>
                  ))}
                {/* USA second (secondary market) */}
                {Country.getAllCountries()
                  .filter(c => c.isoCode === 'US')
                  .map((country) => (
                    <SelectItem key={country.isoCode} value={country.isoCode}>
                      🇺🇸 {country.name}
                    </SelectItem>
                  ))}
                {/* Separator */}
                <SelectItem disabled value="separator" className="text-xs text-gray-400">───────────</SelectItem>
                {/* All other countries alphabetically */}
                {Country.getAllCountries()
                  .filter(c => c.isoCode !== 'IN' && c.isoCode !== 'US')
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((country) => (
                    <SelectItem key={country.isoCode} value={country.isoCode}>
                      {country.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {errors.country && <p className="text-xs text-red-500">{errors.country}</p>}
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* State */}
            <div className="space-y-2">
              <Label htmlFor="state">State / Province *</Label>
              {availableStates.length > 0 ? (
                <Select value={data.state} onValueChange={(value) => onUpdate({ state: value })}>
                  <SelectTrigger className={errors.state ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableStates.map((state) => (
                      <SelectItem key={state.isoCode} value={state.isoCode}>
                        {state.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id="state"
                  type="text"
                  placeholder="e.g., California"
                  className={errors.state ? 'border-red-500' : ''}
                  value={data.state}
                  onChange={(e) => onUpdate({ state: e.target.value })}
                />
              )}
              {errors.state && <p className="text-xs text-red-500">{errors.state}</p>}
            </div>

            {/* City */}
            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              {availableCities.length > 0 ? (
                <Select value={data.city} onValueChange={(value) => onUpdate({ city: value })}>
                  <SelectTrigger className={errors.city ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCities.map((city) => (
                      <SelectItem key={city.name} value={city.name}>
                        {city.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id="city"
                  type="text"
                  placeholder="e.g., Los Angeles"
                  className={errors.city ? 'border-red-500' : ''}
                  value={data.city}
                  onChange={(e) => onUpdate({ city: e.target.value })}
                />
              )}
              {errors.city && <p className="text-xs text-red-500">{errors.city}</p>}
            </div>
          </div>

          {/* Zip & Timezone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="zipCode">Zip / Postal Code</Label>
              <Input
                id="zipCode"
                value={data.zipCode || ''}
                onChange={(e) => {
                  const zipCode = e.target.value;
                  onUpdate({ zipCode });

                  // Auto-populate city/state for Indian pincodes
                  if (data.country === 'IN' && zipCode.length === 6 && /^\d{6}$/.test(zipCode)) {
                    try {
                      const pincodeData = lookup(zipCode);
                      if (pincodeData && pincodeData.length > 0) {
                        const location = pincodeData[0];
                        console.log('📍 Pincode lookup result:', location);

                        // Find matching state from country-state-city library
                        const states = State.getStatesOfCountry('IN');
                        const matchingState = states.find(s =>
                          s.name.toLowerCase() === location.stateName.toLowerCase()
                        );

                        if (matchingState) {
                          onUpdate({
                            state: matchingState.isoCode,
                            city: location.districtName || location.taluk
                          });
                          console.log('✅ Auto-populated from pincode:', {
                            state: matchingState.name,
                            city: location.districtName || location.taluk
                          });
                        }
                      }
                    } catch (error) {
                      console.log('ℹ️ Pincode not found or invalid');
                    }
                  }
                }}
                placeholder={data.country === 'IN' ? '600001' : '10001'}
                className={errors.zipCode ? 'border-red-500' : ''}
              />
              {errors.zipCode && <p className="text-xs text-red-500">{errors.zipCode}</p>}
              {data.country === 'IN' && (
                <p className="text-xs text-gray-500">
                  💡 Enter 6-digit pincode to auto-fill city/state
                </p>
              )}
            </div>

            {/* Timezone (Smart Selection) */}
            <div className="space-y-2">
              <Label htmlFor="timezone">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Timezone *
                </div>
              </Label>
              <Select 
                value={data.timezone} 
                onValueChange={(value) => onUpdate({ timezone: value })}
              >
                <SelectTrigger className={errors.timezone ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select timezone">
                    {data.timezone && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3 text-gray-400" />
                        <span className="truncate">
                          {formatTimezoneWithTime(data.timezone)}
                        </span>
                      </div>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="max-h-80">
                  {/* Country-specific timezones first */}
                  {data.country && getTimezonesForCountry(data.country).filter(tz => tz.country === data.country).length > 0 && (
                    <>
                      <div className="px-2 py-1 text-xs font-medium text-gray-500 bg-gray-50">
                        📍 {Country.getCountryByCode(data.country)?.name || 'Your Country'}
                      </div>
                      {getTimezonesForCountry(data.country)
                        .filter(tz => tz.country === data.country)
                        .map((timezone) => (
                          <SelectItem key={timezone.value} value={timezone.value}>
                            <div className="flex items-center justify-between w-full">
                              <span>{timezone.label}</span>
                              <span className="text-xs text-gray-400 ml-2">
                                {formatTimezoneWithTime(timezone.value).split('(')[1]?.replace(')', '')}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      <div className="border-t my-1"></div>
                    </>
                  )}
                  
                  {/* Popular timezones */}
                  <div className="px-2 py-1 text-xs font-medium text-gray-500 bg-gray-50">
                    🌟 Popular Timezones
                  </div>
                  {getPopularTimezones()
                    .filter(tz => !data.country || tz.country !== data.country)
                    .map((timezone) => (
                      <SelectItem key={timezone.value} value={timezone.value}>
                        <div className="flex items-center justify-between w-full">
                          <span>{timezone.label}</span>
                          <span className="text-xs text-gray-400 ml-2">
                            {formatTimezoneWithTime(timezone.value).split('(')[1]?.replace(')', '')}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  
                  <div className="border-t my-1"></div>
                  
                  {/* All other timezones */}
                  <div className="px-2 py-1 text-xs font-medium text-gray-500 bg-gray-50">
                    🌍 All Timezones
                  </div>
                  {TIMEZONES
                    .filter(tz => !tz.popular && (!data.country || tz.country !== data.country))
                    .map((timezone) => (
                      <SelectItem key={timezone.value} value={timezone.value}>
                        <div className="flex items-center justify-between w-full">
                          <span>{timezone.label}</span>
                          <span className="text-xs text-gray-400 ml-2">
                            {formatTimezoneWithTime(timezone.value).split('(')[1]?.replace(')', '')}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {errors.timezone && <p className="text-xs text-red-500">{errors.timezone}</p>}
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="h-3 w-3" />
                {data.timezone ? (
                  <span>
                    Current time: {new Date().toLocaleTimeString('en-US', {
                      timeZone: data.timezone,
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true
                    })}
                  </span>
                ) : (
                  <span>Select your timezone for accurate scheduling</span>
                )}
              </div>
            </div>
          </div>

          {/* Languages Spoken */}
          <div className="space-y-2">
            <Label>Languages Spoken *</Label>
            <div className="relative">
              <Select
                open={showLanguageDropdown}
                onOpenChange={setShowLanguageDropdown}
              >
                <SelectTrigger className={errors.languages ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select languages" />
                </SelectTrigger>
                <SelectContent>
                  {displayLanguages.map((language) => (
                    <div
                      key={language}
                      className="flex items-center gap-2 px-2 py-2 cursor-pointer hover:bg-gray-100"
                      onClick={() => toggleLanguage(language)}
                    >
                      <Checkbox checked={(data.languages || []).includes(language)} />
                      <span className="text-sm">{language}</span>
                    </div>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {(data.languages || []).length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {(data.languages || []).map((language) => (
                  <Badge
                    key={language}
                    variant="secondary"
                    className="px-3 py-1 bg-orange-500/10 text-orange-500 hover:bg-orange-500/20"
                  >
                    {language}
                    <button
                      type="button"
                      onClick={() => removeLanguage(language)}
                      className="ml-2 hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            {errors.languages && <p className="text-xs text-red-500">{errors.languages}</p>}
          </div>

          {/* Terms and Conditions */}
          <div className="flex items-start gap-2">
            <Checkbox
              id="terms"
              checked={data.termsAccepted}
              onCheckedChange={(checked) => onUpdate({ termsAccepted: checked })}
              className={errors.terms ? 'border-red-500' : ''}
            />
            <label htmlFor="terms" className="text-sm text-gray-700 cursor-pointer">
              I agree to the{' '}
              <a href="#" className="text-orange-500 hover:underline">
                Terms and Conditions
              </a>{' '}
              and{' '}
              <a href="#" className="text-orange-500 hover:underline">
                Privacy Policy
              </a>
            </label>
          </div>
          {errors.terms && <p className="text-xs text-red-500">{errors.terms}</p>}

          {/* Navigation Buttons */}
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
              disabled={isSubmitting}
              className="flex-1 bg-orange-500 hover:bg-orange-600 rounded-full"
            >
              {isSubmitting ? 'Processing...' : 'Continue'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}