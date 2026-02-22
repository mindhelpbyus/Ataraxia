import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Users } from 'lucide-react';
import { StepProps } from './types';

export function OrganizationSizeStep({ formData, updateFormData }: StepProps) {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-semibold mb-2">Organization Size & Structure</h2>
                <p className="text-muted-foreground">Tell us about your team and structure</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Team Size
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <Label>Number of Clinicians *</Label>
                            <Input
                                type="number"
                                min="1"
                                value={formData.numberOfClinicians}
                                onChange={(e) => updateFormData('numberOfClinicians', parseInt(e.target.value) || 0)}
                            />
                            <p className="text-xs text-muted-foreground mt-1">Therapists, psychiatrists, counselors</p>
                        </div>
                        <div>
                            <Label>Number of Admin Staff</Label>
                            <Input
                                type="number"
                                min="0"
                                value={formData.numberOfAdminStaff}
                                onChange={(e) => updateFormData('numberOfAdminStaff', parseInt(e.target.value) || 0)}
                            />
                            <p className="text-xs text-muted-foreground mt-1">Schedulers, billers, managers</p>
                        </div>
                        <div>
                            <Label>Number of Locations</Label>
                            <Input
                                type="number"
                                min="1"
                                value={formData.numberOfLocations}
                                onChange={(e) => updateFormData('numberOfLocations', parseInt(e.target.value) || 1)}
                            />
                            <p className="text-xs text-muted-foreground mt-1">Physical practice locations</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Billing Contact *</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Contact Name</Label>
                            <Input
                                value={formData.billingContactName}
                                onChange={(e) => updateFormData('billingContactName', e.target.value)}
                                placeholder="John Doe"
                            />
                        </div>
                        <div>
                            <Label>Contact Email *</Label>
                            <Input
                                type="email"
                                value={formData.billingContactEmail}
                                onChange={(e) => updateFormData('billingContactEmail', e.target.value)}
                                placeholder="billing@organization.com"
                            />
                        </div>
                    </div>

                    <div>
                        <Label>Payment Method *</Label>
                        <Select value={formData.paymentMethod} onValueChange={(v) => updateFormData('paymentMethod', v)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select payment method" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="credit-card">Credit Card</SelectItem>
                                <SelectItem value="ach">ACH / Bank Transfer</SelectItem>
                                <SelectItem value="invoice">Invoice (Enterprise only)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
