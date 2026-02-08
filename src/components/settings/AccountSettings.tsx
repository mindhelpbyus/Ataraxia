import React, { useState, useRef } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner';
import { AvatarGalleryDialog } from '../AvatarGalleryDialog';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Check as CheckIcon, ChevronsUpDown, UserCircle, Camera, User, MapPin, Check } from "lucide-react";
import { SettingsSection } from './SettingsSection';
import { Country, State, City } from 'country-state-city';
import { LANGUAGES } from '@/types/onboarding';
import Link from 'iso-639-1';
import { Badge } from '../ui/badge';
import { cn } from '../ui/utils';

// Helper for Languages
const ALL_LANGUAGES = LANGUAGES.map(langName => {
    const code = Link.getCode(langName);
    return {
        code: code || langName.toLowerCase().substring(0, 2),
        name: langName,
        native: code ? Link.getNativeName(code) : langName
    };
});

// Placeholder for updateProfilePhoto
const updateProfilePhoto = async (userId: string, photoUrl: string) => {
    console.log('Profile photo update not yet implemented with new auth system');
    // In a real implementation, this would upload the file and return the URL
    return photoUrl;
};

interface AccountSettingsProps {
    userId: string;
    userEmail: string;
}

export const AccountSettings: React.FC<AccountSettingsProps> = ({ userId, userEmail }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [showAvatarGallery, setShowAvatarGallery] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [profileData, setProfileData] = useState({
        firstName: userEmail.split('@')[0].split('.')[0] || 'User',
        lastName: userEmail.split('@')[0].split('.')[1] || '',
        email: userEmail,
        photoURL: '',
        gender: '',
        dateOfBirth: '',
        address: {
            street: '',
            street2: '',
            city: '',
            state: '',
            zip: '',
            country: ''
        },
        languages: [] as string[],
        shortBio: '',
        extendedBio: ''
    });

    const [openLanguage, setOpenLanguage] = useState(false);

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('File size must be less than 5MB');
                return;
            }
            setIsLoading(true);
            try {
                const downloadURL = URL.createObjectURL(file);
                await updateProfilePhoto(userId, downloadURL);
                setProfileData(prev => ({ ...prev, photoURL: downloadURL }));
                toast.success('Profile photo updated');
            } catch (error) {
                console.error('Error updating photo:', error);
                toast.error('Failed to update profile photo');
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleAvatarSelect = (avatarUrl: string) => {
        setProfileData(prev => ({ ...prev, photoURL: avatarUrl }));
        toast.success('Avatar selected! Click "Save Changes" to update your profile.');
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 800));

            const { firstName, lastName, email, gender, dateOfBirth, address, shortBio, extendedBio } = profileData;
            const hasAddress = address.street && address.city && address.state && address.zip && address.country;

            let isComplete = false;
            if (firstName && lastName && email && gender && dateOfBirth && hasAddress && shortBio && extendedBio) {
                isComplete = true;
            } else {
                toast.warning('Please fill all mandatory personal information fields to complete this section.');
            }

            // Logic to update completion status in localStorage
            const completionKey = `profileCompletionStatus_${userId}`;
            const currentStatus = JSON.parse(localStorage.getItem(completionKey) || '{}');
            currentStatus['account'] = isComplete ? 'completed' : 'pending';

            // We read specific mandatory sections to calc percentage, but we can't fully do it here without knowing others.
            // Ideally this logic should be centralized, but mimicking existing behavior:
            localStorage.setItem(completionKey, JSON.stringify(currentStatus));

            // Dispatch event
            window.dispatchEvent(new Event('profile-updated'));

            if (isComplete) {
                toast.success(`Account settings saved!`);
            } else {
                toast.info('Changes saved, but section is still incomplete.');
            }
        } catch (error) {
            console.error('Save error:', error);
            toast.error('Failed to save changes');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto pb-20 pt-0">
            <SettingsSection>
                <div className="space-y-8">
                    {/* Header Area */}
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-3 bg-orange-100 rounded-full">
                            <UserCircle className="w-6 h-6 text-orange-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold">Personal Information</h2>
                            <p className="text-muted-foreground text-sm">
                                Manage your personal details and public profile
                            </p>
                        </div>
                    </div>

                    {/* Headshot */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <Label className="text-base font-semibold">Professional Headshot <span className="text-muted-foreground font-normal text-sm ml-2">(Recommended)</span></Label>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="relative group shrink-0">
                                <Avatar className="w-24 h-24 border-2 border-border shadow-sm">
                                    <AvatarImage src={profileData.photoURL} />
                                    <AvatarFallback className="text-2xl bg-orange-100 text-orange-600 font-semibold">
                                        {profileData.firstName[0]?.toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileSelect} />
                            </div>
                            <div className="space-y-3">
                                <div className="flex gap-3">
                                    <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="h-9 font-medium"><Camera className="w-4 h-4 mr-2" /> Upload Photo</Button>
                                    <Button variant="outline" onClick={() => setShowAvatarGallery(true)} className="h-9 font-medium"><User className="w-4 h-4 mr-2" /> Choose Avatar</Button>
                                </div>
                                <p className="text-xs text-muted-foreground">Max size: 5MB. JPG, PNG.</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">First Name <span className="text-red-500">*</span></Label>
                            <Input value={profileData.firstName} onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })} className="h-10" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Last Name <span className="text-red-500">*</span></Label>
                            <Input value={profileData.lastName} onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })} className="h-10" />
                        </div>
                        <div className="space-y-2">
                            <Label>Gender <span className="text-red-500">*</span></Label>
                            <Select onValueChange={(val) => setProfileData(prev => ({ ...prev, gender: val }))} value={profileData.gender}>
                                <SelectTrigger className="h-10">
                                    <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="female">Female</SelectItem>
                                    <SelectItem value="male">Male</SelectItem>
                                    <SelectItem value="non-binary">Non-binary</SelectItem>
                                    <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Date of Birth <span className="text-red-500">*</span></Label>
                            <Input type="date" className="h-10" value={profileData.dateOfBirth} onChange={(e) => setProfileData(prev => ({ ...prev, dateOfBirth: e.target.value }))} />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <Label className="flex items-center gap-2"><MapPin className="w-4 h-4 text-muted-foreground" /> Address <span className="text-red-500">*</span></Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2 md:col-span-2">
                                <Label className="text-xs text-muted-foreground">Street Address Line 1 *</Label>
                                <Input
                                    placeholder="123 Main Street, Building Name"
                                    value={profileData.address.street}
                                    onChange={(e) => setProfileData(prev => ({ ...prev, address: { ...prev.address, street: e.target.value } }))}
                                    className="h-10"
                                />
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label className="text-xs text-muted-foreground">Street Address Line 2 (Optional)</Label>
                                <Input
                                    placeholder="Apartment, Suite, Floor, Locality (e.g., T. Nagar, Adyar)"
                                    value={profileData.address.street2 || ''}
                                    onChange={(e) => setProfileData(prev => ({ ...prev, address: { ...prev.address, street2: e.target.value } }))}
                                    className="h-10"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground">Country</Label>
                                <Select
                                    value={profileData.address.country}
                                    onValueChange={(val) => {
                                        setProfileData(prev => ({ ...prev, address: { ...prev.address, country: val, state: '', city: '' } }));
                                    }}
                                >
                                    <SelectTrigger className="h-10">
                                        <SelectValue placeholder="Select Country" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Country.getAllCountries().map((country) => (
                                            <SelectItem key={country.isoCode} value={country.name}>{country.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground">State / Province</Label>
                                <Select
                                    value={profileData.address.state}
                                    disabled={!profileData.address.country}
                                    onValueChange={(val) => setProfileData(prev => ({ ...prev, address: { ...prev.address, state: val, city: '' } }))}
                                >
                                    <SelectTrigger className="h-10">
                                        <SelectValue placeholder="Select State" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {State.getStatesOfCountry(Country.getAllCountries().find(c => c.name === profileData.address.country)?.isoCode || '').map((state) => (
                                            <SelectItem key={state.isoCode} value={state.name}>{state.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground">City</Label>
                                <Select
                                    value={profileData.address.city}
                                    disabled={!profileData.address.state}
                                    onValueChange={(val) => setProfileData(prev => ({ ...prev, address: { ...prev.address, city: val } }))}
                                >
                                    <SelectTrigger className="h-10">
                                        <SelectValue placeholder="Select City" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(() => {
                                            const countryCode = Country.getAllCountries().find(c => c.name === profileData.address.country)?.isoCode;
                                            const stateCode = State.getStatesOfCountry(countryCode || '').find(s => s.name === profileData.address.state)?.isoCode;
                                            return City.getCitiesOfState(countryCode || '', stateCode || '').map((city) => (
                                                <SelectItem key={city.name} value={city.name}>{city.name}</SelectItem>
                                            ));
                                        })()}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground">ZIP / Postal Code</Label>
                                <Input
                                    value={profileData.address.zip}
                                    onChange={(e) => setProfileData(prev => ({ ...prev, address: { ...prev.address, zip: e.target.value } }))}
                                    className="h-10"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Languages */}
                    <div className="space-y-3">
                        <Label>Languages Spoken <span className="text-red-500">*</span></Label>
                        <Popover open={openLanguage} onOpenChange={setOpenLanguage}>
                            <PopoverTrigger asChild>
                                <Button variant="outline" role="combobox" aria-expanded={openLanguage} className="justify-between w-full h-10">
                                    {profileData.languages.length > 0 ? `${profileData.languages.length} languages selected` : "Select languages..."}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[300px] p-0">
                                <Command>
                                    <CommandInput placeholder="Search language..." />
                                    <CommandList>
                                        <CommandEmpty>No language found.</CommandEmpty>
                                        <CommandGroup>
                                            {ALL_LANGUAGES.map((language) => (
                                                <CommandItem
                                                    key={language.code}
                                                    value={language.name}
                                                    onSelect={(currentValue) => {
                                                        setProfileData(prev => {
                                                            const exists = prev.languages.includes(currentValue);
                                                            const newLanguages = exists
                                                                ? prev.languages.filter(l => l !== currentValue)
                                                                : [...prev.languages, currentValue];
                                                            return { ...prev, languages: newLanguages };
                                                        });
                                                    }}
                                                >
                                                    <CheckIcon className={cn("mr-2 h-4 w-4", profileData.languages.includes(language.name) ? "opacity-100" : "opacity-0")} />
                                                    {language.name} <span className="ml-1 text-muted-foreground text-xs">({language.native})</span>
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {profileData.languages.map((lang) => (
                                <Badge key={lang} variant="secondary" className="px-3 py-1 bg-orange-50 text-orange-700 hover:bg-orange-100 border-none">
                                    {lang}
                                    <button className="ml-2 hover:text-orange-900" onClick={() => setProfileData(prev => ({ ...prev, languages: prev.languages.filter(l => l !== lang) }))}>×</button>
                                </Badge>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2 md:col-span-2">
                            <Label>Short Bio <span className="text-red-500">*</span></Label>
                            <Textarea
                                placeholder="A brief introduction (150 chars max)"
                                maxLength={150}
                                className="h-[120px] resize-none"
                                value={profileData.shortBio}
                                onChange={(e) => setProfileData(prev => ({ ...prev, shortBio: e.target.value }))}
                            />
                            <div className="flex justify-end text-xs text-muted-foreground">
                                <span className={profileData.shortBio.length > 150 ? "text-rose-600 font-medium" : ""}>{profileData.shortBio.length}/150 characters</span>
                            </div>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <Label>Extended Bio <span className="text-red-500">*</span></Label>
                            <Textarea
                                placeholder="Detailed professional biography..."
                                className="h-[120px] resize-none"
                                value={profileData.extendedBio}
                                onChange={(e) => setProfileData(prev => ({ ...prev, extendedBio: e.target.value }))}
                            />
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Tell your story and help clients get to know you</span>
                                <span className={profileData.extendedBio.length > 700 ? "text-rose-600 font-medium" : ""}>{profileData.extendedBio.length}/700 characters</span>
                            </div>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <Label>What Clients Can Expect From Me <span className="text-muted-foreground font-normal ml-1">(Optional)</span></Label>
                            <Textarea
                                placeholder="Describe your therapeutic style, what a typical session looks like, and what clients can expect when working with you..."
                                className="min-h-[120px] resize-y p-3"
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-6 flex justify-end">
                    <Button onClick={handleSave} disabled={isLoading} className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-8 h-10 shadow-sm transition-all rounded-full">
                        {isLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </SettingsSection>

            <AvatarGalleryDialog
                open={showAvatarGallery}
                onOpenChange={setShowAvatarGallery}
                onSelectAvatar={handleAvatarSelect}
                gender={profileData.gender as any}
            />
        </div>
    );
};
