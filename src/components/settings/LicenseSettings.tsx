import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { toast } from 'sonner';
import { SettingsSection } from './SettingsSection';
import { Shield, Check } from "lucide-react";
import { LICENSE_TYPES } from '@/types/onboarding';
import { State } from 'country-state-city';

interface LicenseSettingsProps {
    userId: string;
}

export const LicenseSettings: React.FC<LicenseSettingsProps> = ({ userId }) => {
    const [isLoading, setIsLoading] = useState(false);

    const [licenseData, setLicenseData] = useState({
        licenseType: '',
        licenseNumber: '',
        issuingStates: [] as string[],
        additionalPracticeStates: [] as string[],
        licenseExpiryDate: '',
        licenseDocument: null as File | string | null,
        malpracticeInsurance: '',
        malpracticeInsuranceDocument: null as File | string | null,
        npiNumber: '',
        deaNumber: '',
        governmentId: null as File | string | null,
        informationAccurate: false,
        country: 'US' // Default
    });

    const availableStates = State.getStatesOfCountry(licenseData.country);

    const handleLicenseFileUpload = (field: string, file: File | null) => {
        if (file) {
            // Mock upload
            setLicenseData(prev => ({ ...prev, [field]: file.name }));
            toast.success('Document uploaded');
        }
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 800));

            const { licenseType, licenseNumber, issuingStates, licenseExpiryDate } = licenseData;
            let isComplete = false;

            if (licenseType && licenseNumber && issuingStates.length > 0 && licenseExpiryDate) {
                isComplete = true;
            } else {
                toast.warning('Please fill all mandatory license information.');
            }

            const completionKey = `profileCompletionStatus_${userId}`;
            const currentStatus = JSON.parse(localStorage.getItem(completionKey) || '{}');
            currentStatus['license'] = isComplete ? 'completed' : 'pending';
            localStorage.setItem(completionKey, JSON.stringify(currentStatus));
            window.dispatchEvent(new Event('profile-updated'));

            if (isComplete) {
                toast.success(`License settings saved!`);
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
                            <strong>AI Matching:</strong> License and state information helps us route clients to therapists authorized to practice in their state.
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Label>License Type <span className="text-base text-rose-500">*</span></Label>
                            <Select
                                value={licenseData.licenseType}
                                onValueChange={(val) => setLicenseData(prev => ({ ...prev, licenseType: val }))}
                            >
                                <SelectTrigger className="h-10">
                                    <SelectValue placeholder="Select your license type..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {LICENSE_TYPES.map((type) => (
                                        <SelectItem key={type} value={type}>{type}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>License Number <span className="text-base text-rose-500">*</span></Label>
                            <Input
                                placeholder="e.g., LCSW12345"
                                value={licenseData.licenseNumber}
                                onChange={(e) => setLicenseData(prev => ({ ...prev, licenseNumber: e.target.value }))}
                                className="h-10"
                            />
                        </div>

                        <div className="space-y-3">
                            <Label>Issuing State / Province ({licenseData.country}) <span className="text-red-500">*</span></Label>
                            <Select
                                value={licenseData.issuingStates[0] || ''}
                                onValueChange={(val) => setLicenseData(prev => ({ ...prev, issuingStates: [val] }))}
                            >
                                <SelectTrigger className="h-10">
                                    <SelectValue placeholder="Select state where licensed..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableStates.map((state) => (
                                        <SelectItem key={state.isoCode} value={state.isoCode}>{state.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>License Expiry Date <span className="text-red-500">*</span></Label>
                            <Input
                                type="date"
                                value={licenseData.licenseExpiryDate}
                                onChange={(e) => setLicenseData(prev => ({ ...prev, licenseExpiryDate: e.target.value }))}
                                className="h-10"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Upload License Document <span className="text-muted-foreground font-normal ml-1">(Recommended)</span></Label>
                            <Input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={(e) => handleLicenseFileUpload('licenseDocument', e.target.files?.[0] || null)}
                                className="cursor-pointer file:cursor-pointer"
                            />
                            {licenseData.licenseDocument && (
                                <p className="text-sm text-green-600 flex items-center gap-1">
                                    <Check className="w-3 h-3" /> File uploaded
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label>NPI Number <span className="text-muted-foreground font-normal ml-1">(Optional)</span></Label>
                            <Input
                                placeholder="10-digit NPI number"
                                value={licenseData.npiNumber}
                                onChange={(e) => setLicenseData(prev => ({ ...prev, npiNumber: e.target.value }))}
                                maxLength={10}
                                className="h-10"
                            />
                        </div>


                        <div className="space-y-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                            <div className="flex items-start gap-3">
                                <Checkbox
                                    id="informationAccurate"
                                    checked={licenseData.informationAccurate}
                                    onCheckedChange={(checked) => setLicenseData(prev => ({ ...prev, informationAccurate: checked as boolean }))}
                                />
                                <div className="flex-1">
                                    <Label htmlFor="informationAccurate" className="cursor-pointer font-medium text-amber-900">
                                        I certify that the information provided is accurate and complete
                                    </Label>
                                    <p className="text-sm text-amber-800/80 mt-1">
                                        Providing false information may result in termination from the platform and legal consequences.
                                    </p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                <div className="pt-6 flex justify-end">
                    <Button onClick={handleSave} disabled={isLoading} className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-8 h-10 shadow-sm transition-all rounded-full">
                        {isLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </SettingsSection >
        </div>
    );
};
