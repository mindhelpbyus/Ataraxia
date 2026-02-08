import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { toast } from 'sonner';
import { SettingsSection } from './SettingsSection';
import { CreditCard, Plus, Trash2 } from "lucide-react";
import { Badge } from '../ui/badge';
import { INSURANCE_PROVIDERS } from '@/types/onboarding';

interface InsuranceSettingsProps {
    userId: string;
}

export const InsuranceSettings: React.FC<InsuranceSettingsProps> = ({ userId }) => {
    const [isLoading, setIsLoading] = useState(false);

    const [insuranceData, setInsuranceData] = useState({
        insurancePanelsAccepted: [] as string[],
        medicaidAcceptance: false,
        medicareAcceptance: false,
        selfPayAccepted: false,
        slidingScale: false,
        employerEaps: [] as string[],
    });

    const [currentInsurance, setCurrentInsurance] = useState('');
    const [currentEap, setCurrentEap] = useState('');

    const handleSave = async () => {
        setIsLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 800));

            // Insurance is usually optional or loosely validated
            let isComplete = true;

            const completionKey = `profileCompletionStatus_${userId}`;
            const currentStatus = JSON.parse(localStorage.getItem(completionKey) || '{}');
            currentStatus['insurance'] = isComplete ? 'completed' : 'pending';
            localStorage.setItem(completionKey, JSON.stringify(currentStatus));
            window.dispatchEvent(new Event('profile-updated'));

            if (isComplete) {
                toast.success(`Insurance settings saved!`);
            }
        } catch (error) {
            console.error('Save error:', error);
            toast.error('Failed to save changes');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto pb-20 pt-0">
            <SettingsSection>
                <div className="space-y-8">
                    <div className="space-y-6">
                        <div className="flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-orange-600" />
                            <h3 className="text-lg font-medium">Payment & Insurance</h3>
                        </div>

                        <div className="space-y-3">
                            <Label>Insurance Panels Accepted</Label>
                            <div className="flex gap-2">
                                <Select value={currentInsurance} onValueChange={setCurrentInsurance}>
                                    <SelectTrigger className="flex-1 h-10">
                                        <SelectValue placeholder="Select insurance provider..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {INSURANCE_PROVIDERS.map((provider) => (
                                            <SelectItem key={provider} value={provider}>{provider}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Button
                                    type="button"
                                    onClick={() => {
                                        if (currentInsurance && !insuranceData.insurancePanelsAccepted.includes(currentInsurance)) {
                                            setInsuranceData(prev => ({ ...prev, insurancePanelsAccepted: [...prev.insurancePanelsAccepted, currentInsurance] }));
                                            setCurrentInsurance('');
                                        }
                                    }}
                                    disabled={!currentInsurance}
                                    variant="outline"
                                    className="h-10"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add
                                </Button>
                            </div>
                            {insuranceData.insurancePanelsAccepted.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-3 p-3 bg-muted/20 rounded-lg border border-border/50">
                                    {insuranceData.insurancePanelsAccepted.map((insurance) => (
                                        <Badge key={insurance} variant="outline" className="px-3 py-1 bg-background">
                                            {insurance}
                                            <button
                                                onClick={() => setInsuranceData(prev => ({ ...prev, insurancePanelsAccepted: prev.insurancePanelsAccepted.filter(i => i !== insurance) }))}
                                                className="ml-2 hover:text-red-600"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
                                <span className="font-medium">Accept Medicaid</span>
                                <Checkbox
                                    id="medicaid"
                                    checked={insuranceData.medicaidAcceptance}
                                    onCheckedChange={(checked) => setInsuranceData(prev => ({ ...prev, medicaidAcceptance: checked as boolean }))}
                                />
                            </div>
                            <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
                                <span className="font-medium">Accept Medicare</span>
                                <Checkbox
                                    id="medicare"
                                    checked={insuranceData.medicareAcceptance}
                                    onCheckedChange={(checked) => setInsuranceData(prev => ({ ...prev, medicareAcceptance: checked as boolean }))}
                                />
                            </div>
                            <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
                                <span className="font-medium">Accept Self-Pay</span>
                                <Checkbox
                                    id="selfpay"
                                    checked={insuranceData.selfPayAccepted}
                                    onCheckedChange={(checked) => setInsuranceData(prev => ({ ...prev, selfPayAccepted: checked as boolean }))}
                                />
                            </div>
                            <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
                                <span className="font-medium">Offer Sliding Scale</span>
                                <Checkbox
                                    id="sliding"
                                    checked={insuranceData.slidingScale}
                                    onCheckedChange={(checked) => setInsuranceData(prev => ({ ...prev, slidingScale: checked as boolean }))}
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label>Employer EAP Programs <span className="text-muted-foreground font-normal ml-1">(Optional)</span></Label>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="e.g., Company ABC EAP"
                                    value={currentEap}
                                    onChange={(e) => setCurrentEap(e.target.value)}
                                    className="h-10"
                                />
                                <Button
                                    type="button"
                                    onClick={() => {
                                        if (currentEap.trim() && !insuranceData.employerEaps.includes(currentEap.trim())) {
                                            setInsuranceData(prev => ({ ...prev, employerEaps: [...prev.employerEaps, currentEap.trim()] }));
                                            setCurrentEap('');
                                        }
                                    }}
                                    disabled={!currentEap.trim()}
                                    variant="outline"
                                    className="h-10"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add
                                </Button>
                            </div>
                            {insuranceData.employerEaps.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-3 p-3 bg-muted/20 rounded-lg border border-border/50">
                                    {insuranceData.employerEaps.map((eap) => (
                                        <Badge key={eap} variant="outline" className="px-3 py-1 bg-background">
                                            {eap}
                                            <button
                                                onClick={() => setInsuranceData(prev => ({ ...prev, employerEaps: prev.employerEaps.filter(e => e !== eap) }))}
                                                className="ml-2 hover:text-red-600"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="pt-8 mt-8 border-t flex justify-end">
                    <Button onClick={handleSave} disabled={isLoading} className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-8 h-10 shadow-sm transition-all rounded-full">
                        {isLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </SettingsSection>
        </div>
    );
};
