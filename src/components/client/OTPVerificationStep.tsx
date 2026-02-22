import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Shield, Mail, Phone, Send, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface OTPVerificationStepProps {
    clientEmail: string;
    clientPhone: string;
    onVerified: () => void;
}

export function OTPVerificationStep({
    clientEmail,
    clientPhone,
    onVerified
}: OTPVerificationStepProps) {
    const [otpSent, setOtpSent] = useState(false);
    const [otpCode, setOtpCode] = useState('');
    const [verificationType, setVerificationType] = useState<'email' | 'sms'>('email');

    const handleSendOTP = () => {
        toast.success(`OTP sent to ${verificationType === 'email' ? clientEmail : clientPhone}`, {
            description: 'For testing, use: 123456, 111111, or 000000'
        });
        setOtpSent(true);
    };

    const handleVerifyOTP = () => {
        const validCodes = ['123456', '111111', '000000'];
        if (validCodes.includes(otpCode)) {
            toast.success('Identity verified successfully!');
            onVerified();
        } else {
            toast.error('Invalid OTP code', {
                description: 'Please try again or request a new code'
            });
        }
    };

    return (
        <div className="space-y-8">
            <div className="text-center">
                <Shield className="h-20 w-20 text-[#F97316] mx-auto mb-6" strokeWidth={1.5} />
                <h2 className="text-2xl font-semibold mb-3">Verify Your Identity</h2>
                <p className="text-muted-foreground text-sm">
                    To ensure your security, please verify your identity using a one-time password
                </p>
            </div>

            <Card className="border-gray-200">
                <CardContent className="pt-6 space-y-6">
                    <div>
                        <h3 className="text-base font-semibold mb-4">Choose Verification Method</h3>
                        <RadioGroup value={verificationType} onValueChange={(v: 'email' | 'sms') => setVerificationType(v)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div
                                className={`flex items-start space-x-3 border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 ${verificationType === 'email'
                                        ? 'border-[#F97316] bg-orange-50 shadow-sm'
                                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                    }`}
                                onClick={() => setVerificationType('email')}
                            >
                                <RadioGroupItem value="email" id="email" className="mt-1 data-[state=checked]:border-[#F97316] data-[state=checked]:text-[#F97316]" />
                                <Label htmlFor="email" className="flex flex-col gap-1 cursor-pointer flex-1 font-normal">
                                    <div className="flex items-center gap-2 font-medium text-gray-900">
                                        <Mail className={`h-4 w-4 ${verificationType === 'email' ? 'text-[#F97316]' : 'text-gray-500'}`} />
                                        Email Verification
                                    </div>
                                    <div className="text-sm text-muted-foreground break-all">{clientEmail}</div>
                                </Label>
                            </div>

                            <div
                                className={`flex items-start space-x-3 border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 ${verificationType === 'sms'
                                        ? 'border-[#F97316] bg-orange-50 shadow-sm'
                                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                    }`}
                                onClick={() => setVerificationType('sms')}
                            >
                                <RadioGroupItem value="sms" id="sms" className="mt-1 data-[state=checked]:border-[#F97316] data-[state=checked]:text-[#F97316]" />
                                <Label htmlFor="sms" className="flex flex-col gap-1 cursor-pointer flex-1 font-normal">
                                    <div className="flex items-center gap-2 font-medium text-gray-900">
                                        <Phone className={`h-4 w-4 ${verificationType === 'sms' ? 'text-[#F97316]' : 'text-gray-500'}`} />
                                        SMS Verification
                                    </div>
                                    <div className="text-sm text-muted-foreground">{clientPhone}</div>
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>

                    {!otpSent ? (
                        <Button onClick={handleSendOTP} className="w-full bg-[#F97316] hover:bg-[#ea6b0f] text-white" size="lg">
                            <Send className="h-4 w-4 mr-2" />
                            Send Verification Code
                        </Button>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <Label className="text-sm font-medium mb-2">Enter 6-Digit Code</Label>
                                <Input
                                    type="text"
                                    maxLength={6}
                                    placeholder="000000"
                                    value={otpCode}
                                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                                    className="text-center text-2xl tracking-widest"
                                />
                            </div>
                            <Button onClick={handleVerifyOTP} className="w-full bg-[#F97316] hover:bg-[#ea6b0f] text-white" size="lg">
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Verify Code
                            </Button>
                            <Button variant="ghost" onClick={handleSendOTP} className="w-full text-gray-600 hover:text-gray-900">
                                Resend Code
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
