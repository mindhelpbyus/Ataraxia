import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { toast } from 'sonner';
import { SettingsSection } from './SettingsSection';
import { GraduationCap, Brain, Heart } from "lucide-react";
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import {
    DEGREES,
    CLINICAL_SPECIALTIES,
    LIFE_CONTEXT_SPECIALTIES,
    THERAPEUTIC_MODALITIES,
    PERSONAL_STYLES
} from '@/types/onboarding';

interface CredentialsSettingsProps {
    userId: string;
}

export const CredentialsSettings: React.FC<CredentialsSettingsProps> = ({ userId }) => {
    const [isLoading, setIsLoading] = useState(false);

    const [profileData, setProfileData] = useState({
        highestDegree: '',
        institutionName: '',
        graduationYear: '',
        yearsOfExperience: '',
        clinicalSpecialties: Object.fromEntries(CLINICAL_SPECIALTIES.map(s => [s.value, false])) as Record<string, boolean>,
        lifeContextSpecialties: Object.fromEntries(LIFE_CONTEXT_SPECIALTIES.map(s => [s.value, false])) as Record<string, boolean>,
        modalities: Object.fromEntries(THERAPEUTIC_MODALITIES.map(m => [m.value, false])) as Record<string, boolean>,
        styles: Object.fromEntries(PERSONAL_STYLES.map(s => [s.value, false])) as Record<string, boolean>,
    });

    const clinicalCount = Object.values(profileData.clinicalSpecialties).filter(Boolean).length;
    const lifeContextCount = Object.values(profileData.lifeContextSpecialties).filter(Boolean).length;
    const modalityCount = Object.values(profileData.modalities).filter(Boolean).length;
    const styleCount = Object.values(profileData.styles).filter(Boolean).length;

    const handleCheckboxChange = (section: 'clinical' | 'lifeContext' | 'modality' | 'style', field: string, checked: boolean) => {
        setProfileData(prev => {
            if (section === 'clinical') {
                return { ...prev, clinicalSpecialties: { ...prev.clinicalSpecialties, [field]: checked } };
            }
            if (section === 'lifeContext') {
                return { ...prev, lifeContextSpecialties: { ...prev.lifeContextSpecialties, [field]: checked } };
            }
            if (section === 'modality') {
                return { ...prev, modalities: { ...prev.modalities, [field]: checked } };
            }
            if (section === 'style') {
                return { ...prev, styles: { ...prev.styles, [field]: checked } };
            }
            return prev;
        });
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 800));

            const { highestDegree, institutionName, graduationYear, yearsOfExperience } = profileData;
            let isComplete = false;

            if (highestDegree && institutionName && graduationYear && yearsOfExperience) {
                isComplete = true;
            } else {
                toast.warning('Please fill all mandatory education & experience fields.');
            }

            const completionKey = `profileCompletionStatus_${userId}`;
            const currentStatus = JSON.parse(localStorage.getItem(completionKey) || '{}');
            currentStatus['credentials'] = isComplete ? 'completed' : 'pending';
            localStorage.setItem(completionKey, JSON.stringify(currentStatus));
            window.dispatchEvent(new Event('profile-updated'));

            if (isComplete) {
                toast.success(`Credentials saved!`);
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
        <div className="max-w-5xl pl-6 pb-20 pt-0">
            <SettingsSection>
                <div className="space-y-8">
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-900 flex gap-3">
                        <div className="shrink-0 mt-0.5">🤖</div>
                        <div>
                            <strong>AI Matching:</strong> These details power our AI to match you with ideal clients based on their needs and preferences.
                        </div>
                    </div>

                    {/* BASIC CREDENTIALS */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-medium">Education & Experience</h3>

                        <div className="space-y-2">
                            <Label>Highest Degree <span className="text-red-500">*</span></Label>
                            <Select
                                value={profileData.highestDegree}
                                onValueChange={(val) => setProfileData(prev => ({ ...prev, highestDegree: val }))}
                            >
                                <SelectTrigger className="h-10">
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
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label>Institution Name <span className="text-red-500">*</span></Label>
                                <Input
                                    placeholder="e.g., Stanford University"
                                    className="h-10"
                                    value={profileData.institutionName}
                                    onChange={(e) => setProfileData(prev => ({ ...prev, institutionName: e.target.value }))}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Graduation Year <span className="text-red-500">*</span></Label>
                                <Select
                                    value={profileData.graduationYear}
                                    onValueChange={(val) => setProfileData(prev => ({ ...prev, graduationYear: val }))}
                                >
                                    <SelectTrigger className="h-10">
                                        <SelectValue placeholder="Select year" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                                            <SelectItem key={year} value={year.toString()}>
                                                {year}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Years of Clinical Experience <span className="text-red-500">*</span></Label>
                            <Input
                                type="number"
                                min="0"
                                max="60"
                                placeholder="e.g., 5"
                                className="h-10"
                                value={profileData.yearsOfExperience}
                                onChange={(e) => setProfileData(prev => ({ ...prev, yearsOfExperience: e.target.value }))}
                            />
                        </div>
                    </div>

                    <Separator />

                    {/* SECTION C: CLINICAL SPECIALTIES */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Brain className="w-5 h-5 text-orange-600" />
                                <h3 className="text-lg font-medium">Clinical Specialties</h3>
                            </div>
                            {clinicalCount > 0 && (
                                <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
                                    {clinicalCount} selected
                                </Badge>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {CLINICAL_SPECIALTIES.map((spec) => (
                                <div
                                    key={spec.value}
                                    className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${profileData.clinicalSpecialties[spec.value]
                                        ? 'border-orange-500 bg-orange-50'
                                        : 'border-border/50 hover:border-orange-300 bg-card'
                                        }`}
                                    onClick={() => handleCheckboxChange('clinical', spec.value, !profileData.clinicalSpecialties[spec.value])}
                                >
                                    <div className="flex items-center gap-3">
                                        <Checkbox
                                            checked={profileData.clinicalSpecialties[spec.value]}
                                            onCheckedChange={(checked) => handleCheckboxChange('clinical', spec.value, checked as boolean)}
                                        />
                                        <Label className="cursor-pointer text-sm font-normal leading-tight">{spec.label}</Label>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <Separator />

                    {/* SECTION C: LIFE CONTEXT SPECIALTIES */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Heart className="w-5 h-5 text-orange-600" />
                                <h3 className="text-lg font-medium">Age Groups & Populations</h3>
                            </div>
                            {lifeContextCount > 0 && (
                                <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
                                    {lifeContextCount} selected
                                </Badge>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {LIFE_CONTEXT_SPECIALTIES.map((spec) => (
                                <div
                                    key={spec.value}
                                    className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${profileData.lifeContextSpecialties[spec.value]
                                        ? 'border-orange-500 bg-orange-50'
                                        : 'border-border/50 hover:border-orange-300 bg-card'
                                        }`}
                                    onClick={() => handleCheckboxChange('lifeContext', spec.value, !profileData.lifeContextSpecialties[spec.value])}
                                >
                                    <div className="flex items-center gap-3">
                                        <Checkbox
                                            checked={profileData.lifeContextSpecialties[spec.value]}
                                            onCheckedChange={(checked) => handleCheckboxChange('lifeContext', spec.value, checked as boolean)}
                                        />
                                        <Label className="cursor-pointer text-sm font-normal leading-tight">{spec.label}</Label>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <Separator />

                    {/* SECTION D: THERAPEUTIC MODALITIES */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium">Therapeutic Modalities</h3>
                            {modalityCount > 0 && (
                                <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
                                    {modalityCount} selected
                                </Badge>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {THERAPEUTIC_MODALITIES.map((modality) => (
                                <div
                                    key={modality.value}
                                    className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${profileData.modalities[modality.value]
                                        ? 'border-orange-500 bg-orange-50'
                                        : 'border-border/50 hover:border-orange-300 bg-card'
                                        }`}
                                    onClick={() => handleCheckboxChange('modality', modality.value, !profileData.modalities[modality.value])}
                                >
                                    <div className="flex items-center gap-3">
                                        <Checkbox
                                            checked={profileData.modalities[modality.value]}
                                            onCheckedChange={(checked) => handleCheckboxChange('modality', modality.value, checked as boolean)}
                                        />
                                        <Label className="cursor-pointer text-sm font-normal leading-tight">{modality.label}</Label>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <Separator />

                    {/* SECTION E: PERSONAL STYLE */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium">Your Therapeutic Style</h3>
                            {styleCount > 0 && (
                                <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
                                    {styleCount} selected
                                </Badge>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {PERSONAL_STYLES.map((style) => (
                                <div
                                    key={style.value}
                                    className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${profileData.styles[style.value]
                                        ? 'border-orange-500 bg-orange-50'
                                        : 'border-border/50 hover:border-orange-300 bg-card'
                                        }`}
                                    onClick={() => handleCheckboxChange('style', style.value, !profileData.styles[style.value])}
                                >
                                    <div className="flex items-center gap-3">
                                        <Checkbox
                                            checked={profileData.styles[style.value]}
                                            onCheckedChange={(checked) => handleCheckboxChange('style', style.value, checked as boolean)}
                                        />
                                        <Label className="cursor-pointer text-sm font-normal leading-tight">{style.label}</Label>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

                <div className="pt-6 flex justify-end">
                    <Button onClick={handleSave} disabled={isLoading} className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-8 h-10 shadow-sm transition-all rounded-full">
                        {isLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </SettingsSection>
        </div>
    );
};
