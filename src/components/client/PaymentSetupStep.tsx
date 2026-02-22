import React from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Checkbox } from '../ui/checkbox';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Separator } from '../ui/separator';
import { CreditCard, Shield, Lock, Wallet } from 'lucide-react';
import { StepProps } from './types';
import { AddressAutocomplete } from '../AddressAutocomplete';

export function PaymentSetupStep({ formData, updateFormData }: StepProps) {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-semibold mb-2">Payment Information</h2>
                <p className="text-muted-foreground">Secure payment setup</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Payment Method <span className="text-red-500">*</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <RadioGroup value={formData.paymentMethod} onValueChange={(v) => updateFormData('paymentMethod', v)}>
                        <div
                            className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-accent"
                            onClick={() => updateFormData('paymentMethod', 'insurance')}
                        >
                            <RadioGroupItem value="insurance" id="pay-insurance" />
                            <Label htmlFor="pay-insurance" className="flex items-center gap-2 cursor-pointer flex-1">
                                <Shield className="h-4 w-4" />
                                <div>
                                    <div className="font-medium">Use Insurance</div>
                                    <div className="text-sm text-muted-foreground">Bill my insurance provider</div>
                                </div>
                            </Label>
                        </div>

                        <div
                            className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-accent"
                            onClick={() => updateFormData('paymentMethod', 'self-pay')}
                        >
                            <RadioGroupItem value="self-pay" id="pay-self" />
                            <Label htmlFor="pay-self" className="flex items-center gap-2 cursor-pointer flex-1">
                                <Wallet className="h-4 w-4" />
                                <div>
                                    <div className="font-medium">Self Pay</div>
                                    <div className="text-sm text-muted-foreground">Pay directly without insurance</div>
                                </div>
                            </Label>
                        </div>

                        <div
                            className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-accent"
                            onClick={() => updateFormData('paymentMethod', 'card')}
                        >
                            <RadioGroupItem value="card" id="pay-card" />
                            <Label htmlFor="pay-card" className="flex items-center gap-2 cursor-pointer flex-1">
                                <CreditCard className="h-4 w-4" />
                                <div>
                                    <div className="font-medium">Credit/Debit Card</div>
                                    <div className="text-sm text-muted-foreground">Pay with card on file</div>
                                </div>
                            </Label>
                        </div>
                    </RadioGroup>

                    {formData.paymentMethod === 'self-pay' && (
                        <>
                            <Separator />
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-sm text-blue-900 mb-2">
                                    <strong>Self-Pay Rates:</strong>
                                </p>
                                <ul className="list-disc pl-5 mt-1 space-y-1 text-sm text-blue-900">
                                    <li>Initial Assessment (60 mins): $150</li>
                                    <li>Individual Session (50 mins): $120</li>
                                </ul>
                            </div>
                        </>
                    )}

                    {formData.paymentMethod === 'card' && (
                        <>
                            <Separator />
                            <div className="space-y-4">
                                <div>
                                    <Label>Card Number</Label>
                                    <Input placeholder="1234 5678 9012 3456" />
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="col-span-2">
                                        <Label>Expiration Date</Label>
                                        <Input placeholder="MM/YY" />
                                    </div>
                                    <div>
                                        <Label>CVV</Label>
                                        <Input placeholder="123" maxLength={3} />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Label>Billing Address</Label>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="billing-same-as-primary"
                                                checked={formData.billingAddressSameAsPrimary}
                                                onCheckedChange={(checked) => {
                                                    updateFormData('billingAddressSameAsPrimary', checked);
                                                    if (checked) {
                                                        updateFormData('billingAddress1', formData.address1);
                                                        updateFormData('billingAddress2', formData.address2);
                                                        updateFormData('billingCity', formData.city);
                                                        updateFormData('billingState', formData.state);
                                                        updateFormData('billingZipCode', formData.zipCode);
                                                    } else {
                                                        updateFormData('billingAddress1', '');
                                                        updateFormData('billingAddress2', '');
                                                        updateFormData('billingCity', '');
                                                        updateFormData('billingState', '');
                                                        updateFormData('billingZipCode', '');
                                                    }
                                                }}
                                            />
                                            <Label htmlFor="billing-same-as-primary" className="cursor-pointer text-sm font-normal">
                                                Same as primary address
                                            </Label>
                                        </div>
                                    </div>

                                    <div>
                                        <AddressAutocomplete
                                            label="Billing Address 1"
                                            value={formData.billingAddress1 || ''}
                                            onChange={(value, components) => {
                                                updateFormData('billingAddress1', value);
                                                if (components) {
                                                    updateFormData('billingCity', components.city);
                                                    updateFormData('billingState', components.state);
                                                    updateFormData('billingZipCode', components.zip);
                                                }
                                            }}
                                            placeholder="123 Billing Street"
                                            disabled={formData.billingAddressSameAsPrimary}
                                        />
                                    </div>

                                    <div>
                                        <Label>Billing Address 2</Label>
                                        <Input
                                            value={formData.billingAddress2 || ''}
                                            onChange={(e) => updateFormData('billingAddress2', e.target.value)}
                                            placeholder="Apt, Suite, Unit (optional)"
                                            disabled={formData.billingAddressSameAsPrimary}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <Label>Billing City</Label>
                                            <Input
                                                value={formData.billingCity || ''}
                                                onChange={(e) => updateFormData('billingCity', e.target.value)}
                                                placeholder="City"
                                                disabled={formData.billingAddressSameAsPrimary}
                                            />
                                        </div>
                                        <div>
                                            <Label>Billing State</Label>
                                            <Input
                                                value={formData.billingState || ''}
                                                onChange={(e) => updateFormData('billingState', e.target.value)}
                                                placeholder="State"
                                                maxLength={2}
                                                disabled={formData.billingAddressSameAsPrimary}
                                            />
                                        </div>
                                        <div>
                                            <Label>Billing ZIP Code</Label>
                                            <Input
                                                value={formData.billingZipCode || ''}
                                                onChange={(e) => updateFormData('billingZipCode', e.target.value)}
                                                placeholder="ZIP"
                                                disabled={formData.billingAddressSameAsPrimary}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            <div className="bg-gray-50 border rounded-lg p-4">
                <div className="flex gap-2 items-start">
                    <Lock className="h-5 w-5 text-gray-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-gray-700">
                        <p className="font-medium mb-1">Your payment information is secure</p>
                        <p>We use industry-standard encryption to protect your financial data. Your card information is never stored on our servers.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}