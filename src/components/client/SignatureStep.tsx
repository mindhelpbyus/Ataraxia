import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { FileText, Check } from 'lucide-react';
import { StepProps } from './types';
import { SignatureCapture } from '../SignatureCapture';

export function SignatureStep({ formData, updateFormData }: StepProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">Sign & Submit</h2>
        <p className="text-muted-foreground">
          Please review and sign to confirm all information is accurate and complete.
        </p>
      </div>

      {/* Summary of what they're signing */}
      <Card className="border-2 border-orange-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-orange-500" />
            What You're Agreeing To
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium">Consent to Treatment</div>
                <p className="text-sm text-muted-foreground">You agree to receive mental health services</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium">HIPAA Privacy Policy</div>
                <p className="text-sm text-muted-foreground">You've read and understand how your health information is protected</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium">Financial Agreement</div>
                <p className="text-sm text-muted-foreground">You understand the payment terms and cancellation policy</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium">Telehealth Consent</div>
                <p className="text-sm text-muted-foreground">You consent to video/phone therapy sessions</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium">Accuracy of Information</div>
                <p className="text-sm text-muted-foreground">All information provided in this intake is true and accurate</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Signature Component */}
      <SignatureCapture
        signature={formData.signature}
        onSignatureChange={(sig) => updateFormData('signature', sig)}
        fullName={`${formData.firstName} ${formData.lastName}`}
        label="Your Legal Signature"
        required
      />

      {/* Legal Notice */}
      <Card className="bg-gray-50">
        <CardContent className="pt-6">
          <p className="text-xs text-muted-foreground leading-relaxed">
            By signing this document, you acknowledge that you have read, understood, and agree to all policies,
            consents, and terms outlined in this intake form. This electronic signature is legally binding and has
            the same force and effect as a handwritten signature. You also confirm that all information provided
            is true and accurate to the best of your knowledge.
          </p>
          <p className="text-xs text-muted-foreground mt-3">
            <strong>Date:</strong> {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}