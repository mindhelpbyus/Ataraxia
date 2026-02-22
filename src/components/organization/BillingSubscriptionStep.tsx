import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { FileText, Building2, Scale } from 'lucide-react';
import { StepProps } from './types';

export function BillingSubscriptionStep({ formData, updateFormData }: StepProps) {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-semibold mb-2">Billing</h2>
                <p className="text-muted-foreground">Configure your billing and subscription preferences</p>
            </div>

            {/* Billing Configuration */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Billing Configuration *
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label>Billing Model *</Label>
                        <Select value={formData.billingModel} onValueChange={(v) => updateFormData('billingModel', v)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select billing model" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="per-session">Per Session</SelectItem>
                                <SelectItem value="per-therapist">Per Therapist</SelectItem>
                                <SelectItem value="per-resource">Per Resource</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Rate Card based on Billing Model */}
                    <div className="border-t pt-4">
                        <Label className="text-base font-medium mb-3 block">Rate Card *</Label>

                        {formData.billingModel === 'per-session' && (
                            <div>
                                <Label>Rate per Session</Label>
                                <Input
                                    type="number"
                                    value={formData.ratePerSession || ''}
                                    onChange={(e) => updateFormData('ratePerSession', parseFloat(e.target.value) || 0)}
                                    placeholder="150.00"
                                    step="0.01"
                                />
                            </div>
                        )}

                        {formData.billingModel === 'per-therapist' && (
                            <div>
                                <Label>Rate per Therapist/Month</Label>
                                <Input
                                    type="number"
                                    value={formData.ratePerTherapistMonth || ''}
                                    onChange={(e) => updateFormData('ratePerTherapistMonth', parseFloat(e.target.value) || 0)}
                                    placeholder="5000.00"
                                    step="0.01"
                                />
                            </div>
                        )}

                        {formData.billingModel === 'per-resource' && (
                            <div className="space-y-3">
                                <div>
                                    <Label>Rate per Therapy Session</Label>
                                    <Input
                                        type="number"
                                        value={formData.ratePerSessionType?.therapy || ''}
                                        onChange={(e) => updateFormData('ratePerSessionType', {
                                            ...formData.ratePerSessionType,
                                            therapy: parseFloat(e.target.value) || 0
                                        })}
                                        placeholder="150.00"
                                        step="0.01"
                                    />
                                </div>
                                <div>
                                    <Label>Rate per Couples Session</Label>
                                    <Input
                                        type="number"
                                        value={formData.ratePerSessionType?.couples || ''}
                                        onChange={(e) => updateFormData('ratePerSessionType', {
                                            ...formData.ratePerSessionType,
                                            couples: parseFloat(e.target.value) || 0
                                        })}
                                        placeholder="200.00"
                                        step="0.01"
                                    />
                                </div>
                                <div>
                                    <Label>Rate per Intake Session</Label>
                                    <Input
                                        type="number"
                                        value={formData.ratePerSessionType?.intake || ''}
                                        onChange={(e) => updateFormData('ratePerSessionType', {
                                            ...formData.ratePerSessionType,
                                            intake: parseFloat(e.target.value) || 0
                                        })}
                                        placeholder="175.00"
                                        step="0.01"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Billing Cycle *</Label>
                            <Select value={formData.billingCycle} onValueChange={(v) => updateFormData('billingCycle', v)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select cycle" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="weekly">Weekly</SelectItem>
                                    <SelectItem value="monthly">Monthly</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Billing Period Rules *</Label>
                            <Select value={formData.billingPeriodRules} onValueChange={(v) => updateFormData('billingPeriodRules', v)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select rules" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="calendar-month">Calendar Month</SelectItem>
                                    <SelectItem value="30-day">30-Day Period</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div>
                        <Label>Payment Terms *</Label>
                        <Select value={formData.paymentTerms} onValueChange={(v) => updateFormData('paymentTerms', v)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select payment terms" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="net-15">Net 15</SelectItem>
                                <SelectItem value="net-30">Net 30</SelectItem>
                                <SelectItem value="prepaid">Prepaid</SelectItem>
                                <SelectItem value="autopay">Autopay</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Finance Details */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        Finance Details *
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label>Legal Business Name *</Label>
                        <Input
                            value={formData.legalBusinessName}
                            onChange={(e) => updateFormData('legalBusinessName', e.target.value)}
                            placeholder="ABC Healthcare Inc."
                        />
                    </div>

                    <div>
                        <Label>Billing Address Line 1 *</Label>
                        <Input
                            value={formData.billingAddressLine1}
                            onChange={(e) => updateFormData('billingAddressLine1', e.target.value)}
                            placeholder="123 Main Street"
                        />
                    </div>

                    <div>
                        <Label>Billing Address Line 2</Label>
                        <Input
                            value={formData.billingAddressLine2 || ''}
                            onChange={(e) => updateFormData('billingAddressLine2', e.target.value)}
                            placeholder="Suite 200"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>City *</Label>
                            <Input
                                value={formData.billingAddressCity}
                                onChange={(e) => updateFormData('billingAddressCity', e.target.value)}
                                placeholder="New York"
                            />
                        </div>
                        <div>
                            <Label>State *</Label>
                            <Input
                                value={formData.billingAddressState}
                                onChange={(e) => updateFormData('billingAddressState', e.target.value)}
                                placeholder="NY"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Zip Code *</Label>
                            <Input
                                value={formData.billingAddressZip}
                                onChange={(e) => updateFormData('billingAddressZip', e.target.value)}
                                placeholder="10001"
                            />
                        </div>
                        <div>
                            <Label>Country *</Label>
                            <Select value={formData.billingAddressCountry} onValueChange={(v) => updateFormData('billingAddressCountry', v)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select country" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="US">United States</SelectItem>
                                    <SelectItem value="IN">India</SelectItem>
                                    <SelectItem value="CA">Canada</SelectItem>
                                    <SelectItem value="UK">United Kingdom</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div>
                        <Label>Billing Email *</Label>
                        <Input
                            type="email"
                            value={formData.billingEmail}
                            onChange={(e) => updateFormData('billingEmail', e.target.value)}
                            placeholder="billing@organization.com"
                        />
                    </div>

                    <div>
                        <Label>PO Number (if required)</Label>
                        <Input
                            value={formData.poNumber || ''}
                            onChange={(e) => updateFormData('poNumber', e.target.value)}
                            placeholder="PO-12345"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Tax ID / EIN (US)</Label>
                            <Input
                                value={formData.taxIdEin || ''}
                                onChange={(e) => updateFormData('taxIdEin', e.target.value)}
                                placeholder="12-3456789"
                            />
                        </div>
                        <div>
                            <Label>GSTIN (India)</Label>
                            <Input
                                value={formData.gstin || ''}
                                onChange={(e) => updateFormData('gstin', e.target.value)}
                                placeholder="22AAAAA0000A1Z5"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Contract Rules */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Scale className="h-5 w-5" />
                        Contract Rules *
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label>Cancellation Policy *</Label>
                        <Select value={formData.cancellationPolicy} onValueChange={(v) => updateFormData('cancellationPolicy', v)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select cancellation policy" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="not-billable">Not billable</SelectItem>
                                <SelectItem value="billable-24h">Billable if cancelled within 24 hours</SelectItem>
                                <SelectItem value="billable-48h">Billable if cancelled within 48 hours</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label>No-Show Policy *</Label>
                        <Select value={formData.noShowPolicy} onValueChange={(v) => updateFormData('noShowPolicy', v)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select no-show policy" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="not-billable">Not billable</SelectItem>
                                <SelectItem value="billable-full">Billable as full session</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label>Reschedule Policy *</Label>
                        <Select value={formData.reschedulePolicy} onValueChange={(v) => updateFormData('reschedulePolicy', v)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select reschedule policy" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="free-24h">Free if rescheduled before 24 hours</SelectItem>
                                <SelectItem value="counts-as-cancellation">Counts as cancellation if within 24 hours</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label>Dispute Window *</Label>
                        <Select value={formData.disputeWindow} onValueChange={(v) => updateFormData('disputeWindow', v)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select dispute window" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="7-days">Within 7 days</SelectItem>
                                <SelectItem value="14-days">Within 14 days</SelectItem>
                                <SelectItem value="30-days">Within 30 days</SelectItem>
                                <SelectItem value="60-days">Within 60 days</SelectItem>
                                <SelectItem value="90-days">Within 90 days</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
