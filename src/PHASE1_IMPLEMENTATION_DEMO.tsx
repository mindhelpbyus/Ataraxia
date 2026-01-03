/**
 * PHASE 1 CRITICAL FIELDS - DEMO & TESTING
 * 
 * This file demonstrates the three critical Phase 1 components:
 * 1. Presenting Concerns - Structured intake questionnaire
 * 2. Safety & Risk Screening - Crisis intervention and safety assessment
 * 3. Signature Capture - Digital signature with legal compliance
 * 
 * These components are now integrated into ComprehensiveClientRegistrationForm.tsx
 * as Steps 3, 4, and 12 respectively.
 */

import React, { useState } from 'react';
import { PresentingConcerns, PresentingConcernsData } from './components/PresentingConcerns';
import { SafetyRiskScreening, SafetyScreeningData } from './components/SafetyRiskScreening';
import { SignatureCapture, SignatureData } from './components/SignatureCapture';
import { Button } from './components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Badge } from './components/ui/badge';
import { Separator } from './components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from './components/ui/alert';
import { CheckCircle2, AlertTriangle, FileText, Shield, MessageCircle, Pencil } from 'lucide-react';

export default function Phase1Demo() {
  // State for each component
  const [presentingConcerns, setPresentingConcerns] = useState<PresentingConcernsData>({
    mainReason: '',
    primaryConcerns: [],
    severityLevel: '',
    otherConcernDetails: ''
  });

  const [safetyScreening, setSafetyScreening] = useState<SafetyScreeningData>({
    selfHarmThoughts: '',
    selfHarmPlans: '',
    recentSuicideAttempt: '',
    harmToOthersThoughts: '',
    domesticViolenceConcerns: '',
    feelUnsafeAtHome: '',
    additionalSafetyConcerns: '',
    wantsSafetyPlan: false
  });

  const [signature, setSignature] = useState<SignatureData | null>(null);

  // Check completion status
  const isPresentingConcernsComplete = !!(
    presentingConcerns.mainReason &&
    presentingConcerns.primaryConcerns.length > 0 &&
    presentingConcerns.severityLevel
  );

  const isSafetyScreeningComplete = !!(
    safetyScreening.selfHarmThoughts &&
    safetyScreening.selfHarmPlans &&
    safetyScreening.recentSuicideAttempt &&
    safetyScreening.harmToOthersThoughts &&
    safetyScreening.domesticViolenceConcerns &&
    safetyScreening.feelUnsafeAtHome
  );

  const isSignatureComplete = !!signature;

  const allComplete = isPresentingConcernsComplete && isSafetyScreeningComplete && isSignatureComplete;

  // Handle demo submission
  const handleSubmit = () => {
    console.log('=== PHASE 1 DATA SUBMISSION ===');
    console.log('Presenting Concerns:', presentingConcerns);
    console.log('Safety Screening:', safetyScreening);
    console.log('Signature:', signature);
    alert('✅ Phase 1 data submitted! Check console for details.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <Badge className="bg-[#F97316] text-white px-4 py-1 text-sm">
            Phase 1 Implementation - Critical Fields
          </Badge>
          <h1 className="text-4xl font-bold">Ataraxia Intake Form</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Demo of the three critical Phase 1 components integrated into the client registration flow.
            These are now live in the ComprehensiveClientRegistrationForm (Steps 3, 4, and 12).
          </p>
        </div>

        {/* Completion Status */}
        <Card className="border-2 border-[#F97316]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-[#F97316]" />
              Completion Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`p-4 rounded-lg border-2 ${isPresentingConcernsComplete ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    <span className="font-medium">Presenting Concerns</span>
                  </div>
                  {isPresentingConcernsComplete && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                </div>
                <p className="text-xs text-muted-foreground">
                  {isPresentingConcernsComplete ? 'Complete' : 'Incomplete'}
                </p>
              </div>

              <div className={`p-4 rounded-lg border-2 ${isSafetyScreeningComplete ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    <span className="font-medium">Safety Screening</span>
                  </div>
                  {isSafetyScreeningComplete && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                </div>
                <p className="text-xs text-muted-foreground">
                  {isSafetyScreeningComplete ? 'Complete' : 'Incomplete'}
                </p>
              </div>

              <div className={`p-4 rounded-lg border-2 ${isSignatureComplete ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Pencil className="h-5 w-5" />
                    <span className="font-medium">Signature</span>
                  </div>
                  {isSignatureComplete && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                </div>
                <p className="text-xs text-muted-foreground">
                  {isSignatureComplete ? 'Complete' : 'Incomplete'}
                </p>
              </div>
            </div>

            {allComplete && (
              <Alert className="mt-4 border-green-300 bg-green-50">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-900">All Phase 1 Fields Complete!</AlertTitle>
                <AlertDescription className="text-green-800">
                  You can now submit the form. In production, this data will be saved to the database.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Tabs for each component */}
        <Tabs defaultValue="concerns" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="concerns" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              <span>Step 3: Concerns</span>
              {isPresentingConcernsComplete && <CheckCircle2 className="h-4 w-4 text-green-600" />}
            </TabsTrigger>
            <TabsTrigger value="safety" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span>Step 4: Safety</span>
              {isSafetyScreeningComplete && <CheckCircle2 className="h-4 w-4 text-green-600" />}
            </TabsTrigger>
            <TabsTrigger value="signature" className="flex items-center gap-2">
              <Pencil className="h-4 w-4" />
              <span>Step 12: Sign</span>
              {isSignatureComplete && <CheckCircle2 className="h-4 w-4 text-green-600" />}
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Presenting Concerns */}
          <TabsContent value="concerns" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Component 1: Presenting Concerns</CardTitle>
                <CardDescription>
                  Structured intake questionnaire to understand client needs and match them with appropriate therapists.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PresentingConcerns
                  data={presentingConcerns}
                  onChange={setPresentingConcerns}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 2: Safety Screening */}
          <TabsContent value="safety" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Component 2: Safety & Risk Screening</CardTitle>
                <CardDescription>
                  Critical safety assessment with immediate crisis intervention resources. Required for legal compliance.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SafetyRiskScreening
                  data={safetyScreening}
                  onChange={setSafetyScreening}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 3: Signature Capture */}
          <TabsContent value="signature" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Component 3: Digital Signature</CardTitle>
                <CardDescription>
                  Legally binding signature capture supporting both drawn and typed signatures. Required for consent enforcement.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SignatureCapture
                  signature={signature}
                  onSignatureChange={setSignature}
                  fullName="John Doe"
                  label="Your Legal Signature"
                  required
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Submit Button */}
        <Card className="border-2 border-[#F97316]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold mb-1">Ready to Submit?</h3>
                <p className="text-sm text-muted-foreground">
                  {allComplete 
                    ? 'All required Phase 1 fields are complete.' 
                    : 'Please complete all three components above.'}
                </p>
              </div>
              <Button
                onClick={handleSubmit}
                disabled={!allComplete}
                size="lg"
                className="bg-[#F97316] hover:bg-[#ea580c] text-white"
              >
                <CheckCircle2 className="h-5 w-5 mr-2" />
                Submit Demo Data
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Implementation Notes */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Implementation Notes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-sm mb-2">✅ What's Been Implemented</h4>
              <ul className="text-sm space-y-1 text-muted-foreground ml-4 list-disc">
                <li><strong>PresentingConcerns.tsx</strong> - 18 concern categories + severity levels + free-text input</li>
                <li><strong>SafetyRiskScreening.tsx</strong> - 6 critical safety questions + crisis resources + safety plan option</li>
                <li><strong>SignatureCapture.tsx</strong> - Canvas drawing + typed signature + timestamp + legal compliance</li>
                <li><strong>Integration</strong> - All three components added to ComprehensiveClientRegistrationForm as Steps 3, 4, and 12</li>
                <li><strong>Validation</strong> - Required field validation for each step</li>
                <li><strong>Data Structure</strong> - TypeScript interfaces exported for backend integration</li>
              </ul>
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold text-sm mb-2">🔴 Critical Features</h4>
              <ul className="text-sm space-y-1 text-muted-foreground ml-4 list-disc">
                <li><strong>Safety Crisis Intervention</strong> - Automatic display of 988 Lifeline, Crisis Text Line, and emergency resources</li>
                <li><strong>Domestic Violence Resources</strong> - National DV Hotline shown when applicable</li>
                <li><strong>Clinical Escalation</strong> - Note added that supervisor will review safety concerns within 24 hours</li>
                <li><strong>Legal Signature</strong> - Both drawn and typed signatures with timestamp and full audit trail</li>
                <li><strong>Matching Data</strong> - Structured concern data improves therapist matching algorithm accuracy</li>
              </ul>
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold text-sm mb-2">📊 Data Structure Example</h4>
              <pre className="bg-white border border-gray-200 rounded p-3 text-xs overflow-x-auto">
{`{
  presentingConcernsData: {
    mainReason: "I've been feeling anxious...",
    primaryConcerns: ["anxiety", "stress", "sleep"],
    severityLevel: "moderate",
    otherConcernDetails: ""
  },
  safetyScreeningData: {
    selfHarmThoughts: "no",
    selfHarmPlans: "no",
    recentSuicideAttempt: "no",
    harmToOthersThoughts: "no",
    domesticViolenceConcerns: "no",
    feelUnsafeAtHome: "no",
    additionalSafetyConcerns: "",
    wantsSafetyPlan: false
  },
  signature: {
    type: "drawn",
    data: "data:image/png;base64,...",
    timestamp: "2024-11-28T10:30:00Z",
    fullName: "John Doe"
  }
}`}
              </pre>
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold text-sm mb-2">🚀 Next Steps (Phase 2)</h4>
              <ul className="text-sm space-y-1 text-muted-foreground ml-4 list-disc">
                <li>Enhanced Mental Health History with structured diagnosis checklist</li>
                <li>Lifestyle & Functional Impact assessment (sleep, eating, daily functioning)</li>
                <li>PHQ-9 and GAD-7 standardized assessment tools</li>
                <li>Enhanced matching preferences (communication style, urgency level, etc.)</li>
                <li>2FA and portal security enhancements</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Backend Integration Guide */}
        <Card className="bg-purple-50 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-900">
              <Shield className="h-5 w-5" />
              Backend Integration Guide
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Firebase Database Schema Updates Needed:</h4>
              <pre className="bg-white border border-purple-200 rounded p-3 text-xs overflow-x-auto">
{`// Add to clients collection
{
  // ... existing fields ...
  
  // NEW Phase 1 fields
  presentingConcernsData: {
    mainReason: string,
    primaryConcerns: string[],
    severityLevel: 'mild' | 'moderate' | 'severe' | 'unsure',
    otherConcernDetails?: string
  },
  
  safetyScreeningData: {
    selfHarmThoughts: 'yes' | 'no',
    selfHarmPlans: 'yes' | 'no',
    recentSuicideAttempt: 'yes' | 'no',
    harmToOthersThoughts: 'yes' | 'no',
    domesticViolenceConcerns: 'yes' | 'no',
    feelUnsafeAtHome: 'yes' | 'no',
    additionalSafetyConcerns?: string,
    wantsSafetyPlan: boolean,
    flaggedForReview: boolean, // Auto-set if any "yes"
    reviewedBy?: string, // Supervisor who reviewed
    reviewedAt?: timestamp
  },
  
  signature: {
    type: 'drawn' | 'typed',
    data: string, // base64 or text
    timestamp: timestamp,
    fullName: string,
    ipAddress?: string // For audit trail
  },
  
  // Metadata
  intakeCompletedAt: timestamp,
  intakeVersion: 'v2.0' // Track form version
}`}
              </pre>
            </div>

            <Alert className="border-orange-300 bg-orange-50">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertTitle className="text-orange-900">Important: Safety Alert Integration</AlertTitle>
              <AlertDescription className="text-orange-800 text-xs">
                When <code>safetyScreeningData</code> contains any "yes" answers, your backend must:
                <ul className="list-disc ml-4 mt-2 space-y-1">
                  <li>Auto-flag the intake for clinical supervisor review</li>
                  <li>Send real-time notification to on-call supervisor</li>
                  <li>Prioritize this client in the matching queue</li>
                  <li>Log the safety concern in audit trail</li>
                  <li>Ensure 24-hour follow-up protocol is triggered</li>
                </ul>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
