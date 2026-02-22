import React, { useState, useMemo } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { User, MapPin, AlertCircle, Camera, Upload } from 'lucide-react';
import { format } from 'date-fns';
import { PhoneInputV2 } from '../PhoneInputV2';
import { AddressSection } from './AddressSection';
import { Country } from 'country-state-city';
import { StepProps } from './types';
import { AvatarGalleryDialog } from '../AvatarGalleryDialog';
import { CameraCaptureDialog } from './CameraCaptureDialog';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { toast } from 'sonner';
import ReactSelect from 'react-select';
import langs from 'langs';

export function BasicInformationStep({ formData, updateFormData, clientEmail, clientPhone }: StepProps) {
    const [showAvatarGallery, setShowAvatarGallery] = useState(false);
    const [showCamera, setShowCamera] = useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    // Get all languages
    const languages = useMemo(() => {
        const allLangs = langs.all();
        return allLangs.map((lang: any) => ({
            value: lang.name,
            label: lang.name,
        }));
    }, []);

    const customSelectStyles = {
        control: (base: any) => ({
            ...base,
            borderColor: '#e5e7eb',
            borderRadius: '0.375rem',
            minHeight: '42px',
            boxShadow: 'none',
            '&:hover': {
                borderColor: '#d1d5db',
            },
        }),
        menu: (base: any) => ({
            ...base,
            zIndex: 9999,
        }),
    };

    const selectedLanguages = Array.isArray(formData.preferredLanguage)
        ? formData.preferredLanguage.map((lang: string) => ({
            value: lang,
            label: lang,
        }))
        : [];

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                updateFormData('profileImage', reader.result as string);
                updateFormData('selectedAvatar', '');
                toast.success('Photo uploaded successfully!');
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCameraCapture = () => {
        setShowCamera(true);
    };

    const handleCameraPhotoCapture = (imageData: string) => {
        updateFormData('profileImage', imageData);
        updateFormData('selectedAvatar', '');
        toast.success('Photo captured successfully!');
    };

    const displayImage = formData.profileImage || formData.selectedAvatar;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-semibold mb-2">Personal Information</h2>
                <p className="text-sm text-gray-500">Tell us about yourself</p>
            </div>

            <Card className="border-gray-200">
                <CardContent className="pt-6 space-y-6">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <Camera className="h-5 w-5 text-gray-700" />
                            <h3 className="text-base font-semibold">Profile Photo</h3>
                        </div>
                        <p className="text-sm text-gray-500 mb-4">Upload a headshot, take a photo, or choose an avatar</p>

                        <div className="flex flex-col sm:flex-row items-center gap-6 bg-gray-50 border border-gray-200 rounded-lg p-6">
                            <Avatar className="w-24 h-24 border-2 border-white shadow-sm">
                                <AvatarImage src={displayImage} />
                                <AvatarFallback className="text-xl bg-gray-200 text-gray-600 font-medium">
                                    {formData.firstName[0]?.toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 text-center sm:text-left">
                                <p className="text-sm font-medium text-gray-700 mb-3">
                                    {displayImage ? 'Update your photo' : 'Add your photo'}
                                </p>
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                    />
                                    <Button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="bg-[#F97316] hover:bg-[#ea6b0f] text-white"
                                        size="sm"
                                    >
                                        <Upload className="h-4 w-4 mr-2" />
                                        Upload Photo
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleCameraCapture}
                                        className="border-gray-300 hover:bg-gray-50"
                                        size="sm"
                                    >
                                        <Camera className="h-4 w-4 mr-2" />
                                        Take Photo
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setShowAvatarGallery(true)}
                                        className="border-gray-300 hover:bg-gray-50"
                                        size="sm"
                                    >
                                        <User className="h-4 w-4 mr-2" />
                                        Choose Avatar
                                    </Button>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">
                                    JPG, PNG or GIF (max. 5MB)
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-gray-200">
                <CardContent className="pt-6 space-y-6">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <User className="h-5 w-5 text-gray-700" />
                            <h3 className="text-base font-semibold">Personal Details</h3>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <Label className="text-sm font-medium text-gray-700">First Name <span className="text-red-500">*</span></Label>
                            <Input
                                value={formData.firstName}
                                onChange={(e) => updateFormData('firstName', e.target.value)}
                                className="mt-1.5 border-gray-300"
                            />
                        </div>
                        <div>
                            <Label className="text-sm font-medium text-gray-700">Middle Name</Label>
                            <Input
                                value={formData.middleName || ''}
                                onChange={(e) => updateFormData('middleName', e.target.value)}
                                className="mt-1.5 border-gray-300"
                            />
                        </div>
                        <div>
                            <Label className="text-sm font-medium text-gray-700">Last Name <span className="text-red-500">*</span></Label>
                            <Input
                                value={formData.lastName}
                                onChange={(e) => updateFormData('lastName', e.target.value)}
                                className="mt-1.5 border-gray-300"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label className="text-sm font-medium text-gray-700">Gender <span className="text-red-500">*</span></Label>
                            <Select value={formData.gender} onValueChange={(v) => updateFormData('gender', v)}>
                                <SelectTrigger className="mt-1.5 border-gray-300">
                                    <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="female">Female</SelectItem>
                                    <SelectItem value="male">Male</SelectItem>
                                    <SelectItem value="non-binary">Non-binary</SelectItem>
                                    <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="dob" className="text-sm font-medium text-gray-700">Date of Birth <span className="text-red-500">*</span></Label>
                            <Input
                                id="dob"
                                type="date"
                                value={formData.dateOfBirth ? format(formData.dateOfBirth, 'yyyy-MM-dd') : ''}
                                onChange={(e) => {
                                    const dateStr = e.target.value;
                                    if (dateStr) {
                                        const [year, month, day] = dateStr.split('-').map(Number);
                                        const date = new Date(year, month - 1, day);
                                        updateFormData('dateOfBirth', date);
                                    } else {
                                        updateFormData('dateOfBirth', null);
                                    }
                                }}
                                max={new Date().toISOString().split('T')[0]}
                                required
                                className="mt-1.5 border-gray-300"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <PhoneInputV2
                            value={formData.phone}
                            onChange={(value) => updateFormData('phone', value || '')}
                            label="Phone"
                            required
                            disabled={!!clientPhone}
                            defaultCountry="US"
                        />
                        <div>
                            <Label className="text-sm font-medium text-gray-700">Email <span className="text-red-500">*</span></Label>
                            <Input
                                type="email"
                                value={formData.email}
                                onChange={(e) => updateFormData('email', e.target.value)}
                                disabled={!!clientEmail}
                                className={`mt-1.5 border-gray-300 ${formData.email ? "bg-gray-50" : ""}`}
                            />
                        </div>
                    </div>

                    <div>
                        <Label className="text-sm font-medium text-gray-700">Preferred Language <span className="text-red-500">*</span></Label>
                        <ReactSelect
                            value={selectedLanguages}
                            onChange={(langs) => updateFormData('preferredLanguage', langs ? langs.map((l: any) => l.value) : [])}
                            options={languages}
                            placeholder="Select languages..."
                            styles={customSelectStyles}
                            isMulti
                            className="mt-1.5"
                        />
                    </div>
                </CardContent>
            </Card>

            <Card className="border-gray-200">
                <CardContent className="pt-6">
                    <AddressSection formData={formData} updateFormData={updateFormData} />
                </CardContent>
            </Card>

            <Card className="border-gray-200">
                <CardContent className="pt-6 space-y-6">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <AlertCircle className="h-5 w-5 text-gray-700" />
                            <h3 className="text-base font-semibold">Emergency Contact <span className="text-red-500">*</span></h3>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label className="text-sm font-medium text-gray-700">Contact Name <span className="text-red-500">*</span></Label>
                            <Input
                                value={formData.emergencyContactName}
                                onChange={(e) => updateFormData('emergencyContactName', e.target.value)}
                                placeholder="Full name"
                                className="mt-1.5 border-gray-300"
                            />
                        </div>
                        <div>
                            <Label className="text-sm font-medium text-gray-700">Relationship <span className="text-red-500">*</span></Label>
                            <Input
                                value={formData.emergencyContactRelationship}
                                onChange={(e) => updateFormData('emergencyContactRelationship', e.target.value)}
                                placeholder="e.g., Spouse, Parent, Friend"
                                className="mt-1.5 border-gray-300"
                            />
                        </div>
                    </div>
                    <PhoneInputV2
                        value={formData.emergencyContactPhone}
                        onChange={(value) => updateFormData('emergencyContactPhone', value || '')}
                        label="Contact Phone"
                        required
                        defaultCountry="US"
                    />
                </CardContent>
            </Card>

            <AvatarGalleryDialog
                open={showAvatarGallery}
                onOpenChange={setShowAvatarGallery}
                onSelectAvatar={(avatarUrl) => {
                    updateFormData('selectedAvatar', avatarUrl);
                    toast.success('Avatar selected!');
                }}
                selectedAvatar={formData.selectedAvatar || ''}
            />

            <CameraCaptureDialog
                open={showCamera}
                onOpenChange={setShowCamera}
                onCapture={handleCameraPhotoCapture}
            />
        </div>
    );
}
