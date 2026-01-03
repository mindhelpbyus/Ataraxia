import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { Separator } from './components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from './components/ui/alert';
import { Progress } from './components/ui/progress';
import { 
  CheckCircle2, AlertTriangle, FileText, ChevronRight, ChevronLeft,
  Shield, MessageCircle, PenTool 
} from 'lucide-react';
import { PresentingConcerns, PresentingConcernsData } from './components/PresentingConcerns';
import { SafetyRiskScreening, SafetyScreeningData } from './components/SafetyRiskScreening';
import { SignatureCapture, SignatureData } from './components/SignatureCapture';

/**
 * PHASE 1 IMPLEMENTATION DEMO
 * 
 * This demo showcases the three critical components implemented in Phase 1:
 * 1. Presenting Concerns - Structured intake with symptom checklist
 * 2. Safety & Risk Screening - Crisis intervention with hotlines
 * 3. Signature Capture - Digital signature (drawn or typed)
 * 
 * These are CRITICAL for HIPAA compliance and legal liability protection.
 */

export default function Demo_Phase1_AllComponents() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isComplete, setIsComplete] = useState(false);

  // Form data for all three components
  const [presentingConcernsData, setPresentingConcernsData] = useState<PresentingConcernsData>({
    mainReason: '',
    primaryConcerns: [],
    severityLevel: '',
    otherConcernDetails: ''
  });

  const [safetyScreeningData, setSafetyScreeningData] = useState<SafetyScreeningData>({
    selfHarmThoughts: '',
    selfHarmPlans: '',
    recentSuicideAttempt: '',
    harmToOthersThoughts: '',
    domesticViolenceConcerns: '',
    feelUnsafeAtHome: '',
    additionalSafetyConcerns: '',
    wantsSafetyPlan: false
  });

  const [signatureData, setSignatureData] = useState<SignatureData | null>(null);

  // Validation for each step
  const validateStep = () => {
    switch (currentStep) {
      case 1:
        return !!(
          presentingConcernsData.mainReason &&
          presentingConcernsData.primaryConcerns.length > 0 &&
          presentingConcernsData.severityLevel
        );
      case 2:
        return !!(
          safetyScreeningData.selfHarmThoughts &&
          safetyScreeningData.selfHarmPlans &&
          safetyScreeningData.recentSuicideAttempt &&
          safetyScreeningData.harmToOthersThoughts &&
          safetyScreeningData.domesticViolenceConcerns &&
          safetyScreeningData.feelUnsafeAtHome
        );
      case 3:
        return !!signatureData;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (!validateStep()) {
      alert('Please complete all required fields');
      return;
    }
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setIsComplete(true);
    console.log('=== PHASE 1 DEMO COMPLETE ===');
    console.log('Presenting Concerns:', presentingConcernsData);
    console.log('Safety Screening:', safetyScreeningData);
    console.log('Signature:', signatureData);
  };

  const resetDemo = () => {
    setCurrentStep(1);
    setIsComplete(false);
    setPresentingConcernsData({
      mainReason: '',
      primaryConcerns: [],
      severityLevel: '',
      otherConcernDetails: ''
    });
    setSafetyScreeningData({
      selfHarmThoughts: '',
      selfHarmPlans: '',
      recentSuicideAttempt: '',
      harmToOthersThoughts: '',
      domesticViolenceConcerns: '',
      feelUnsafeAtHome: '',
      additionalSafetyConcerns: '',
      wantsSafetyPlan: false
    });
    setSignatureData(null);
  };

  const progressPercent = ((currentStep - 1) / 3) * 100;

  const stepIcons = [
    { icon: MessageCircle, label: 'Presenting Concerns', color: 'text-[#F97316]' },
    { icon: Shield, label: 'Safety Screening', color: 'text-red-600' },
    { icon: PenTool, label: 'Signature', color: 'text-green-600' }
  ];

  if (isComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="border-2 border-green-500">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4">
                <CheckCircle2 className="h-20 w-20 text-green-600" />
              </div>
              <CardTitle className="text-3xl">Phase 1 Implementation Complete! 🎉</CardTitle>
              <CardDescription className="text-lg">
                All three critical components have been successfully implemented
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-orange-200 bg-orange-50">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MessageCircle className="h-5 w-5 text-[#F97316]" />
                      Concerns
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-[#F97316]">
                      {presentingConcernsData.primaryConcerns.length}
                    </div>
                    <div className="text-sm text-muted-foreground">Selected concerns</div>
                    <Badge className="mt-2" variant="secondary">
                      {presentingConcernsData.severityLevel}
                    </Badge>
                  </CardContent>
                </Card>

                <Card className="border-red-200 bg-red-50">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Shield className="h-5 w-5 text-red-600" />
                      Safety
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">
                      {Object.values(safetyScreeningData).filter(v => v === 'yes').length}
                    </div>
                    <div className="text-sm text-muted-foreground">Safety concerns</div>
                    <Badge className="mt-2" variant={
                      Object.values(safetyScreeningData).some(v => v === 'yes') 
                        ? "destructive" 
                        : "secondary"
                    }>
                      {Object.values(safetyScreeningData).some(v => v === 'yes') 
                        ? 'Requires attention' 
                        : 'No concerns'
                      }
                    </Badge>
                  </CardContent>
                </Card>

                <Card className="border-green-200 bg-green-50">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <PenTool className="h-5 w-5 text-green-600" />
                      Signature
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      <CheckCircle2 className="h-8 w-8" />
                    </div>
                    <div className="text-sm text-muted-foreground">Legally signed</div>
                    <Badge className="mt-2 bg-green-600">
                      {signatureData?.type === 'drawn' ? 'Hand-drawn' : 'Typed'}
                    </Badge>
                  </CardContent>
                </Card>
              </div>

              <Separator />

              {/* Data Preview */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Captured Data</h3>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">1. Presenting Concerns</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Main Reason:</div>
                      <div className="text-sm">{presentingConcernsData.mainReason.substring(0, 100)}...</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Concerns:</div>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {presentingConcernsData.primaryConcerns.map(concern => (
                          <Badge key={concern} variant="outline">{concern}</Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">2. Safety Screening</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>Self-harm thoughts: <Badge variant="outline">{safetyScreeningData.selfHarmThoughts}</Badge></div>
                      <div>Self-harm plans: <Badge variant="outline">{safetyScreeningData.selfHarmPlans}</Badge></div>
                      <div>Recent attempt: <Badge variant="outline">{safetyScreeningData.recentSuicideAttempt}</Badge></div>
                      <div>Harm to others: <Badge variant="outline">{safetyScreeningData.harmToOthersThoughts}</Badge></div>
                      <div>Domestic violence: <Badge variant="outline">{safetyScreeningData.domesticViolenceConcerns}</Badge></div>
                      <div>Feel unsafe: <Badge variant="outline">{safetyScreeningData.feelUnsafeAtHome}</Badge></div>
                    </div>
                    {safetyScreeningData.wantsSafetyPlan && (
                      <Badge className="mt-2 bg-blue-600">Wants safety plan</Badge>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">3. Signature</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-white border rounded-lg p-4">
                      {signatureData?.type === 'drawn' ? (
                        <img src={signatureData.data} alt="Signature" className="h-20 mx-auto" />
                      ) : (
                        <div className="text-center font-serif italic text-2xl">
                          {signatureData?.fullName}
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">
                      Signed on: {signatureData && new Date(signatureData.timestamp).toLocaleString()}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Separator />

              <div className="flex gap-4">
                <Button onClick={resetDemo} variant="outline" className="flex-1">
                  Try Again
                </Button>
                <Button 
                  onClick={() => console.log('Data submitted to backend')} 
                  className="flex-1 bg-[#F97316] hover:bg-[#ea580c]"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Submit to Backend
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Phase 1 Implementation Demo</h1>
              <p className="text-muted-foreground mt-1">
                Testing: Presenting Concerns + Safety Screening + Signature
              </p>
            </div>
            <Badge variant="outline" className="text-lg px-4 py-2">
              🚀 ATARAXIA
            </Badge>
          </div>

          {/* Step Indicators */}
          <div className="flex items-center justify-between mb-4">
            {stepIcons.map((step, index) => {
              const Icon = step.icon;
              const stepNumber = index + 1;
              const isCompleted = currentStep > stepNumber;
              const isCurrent = currentStep === stepNumber;

              return (
                <React.Fragment key={stepNumber}>
                  <div className="flex flex-col items-center">
                    <div
                      className={`
                        w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all
                        ${isCurrent ? 'border-[#F97316] bg-[#F97316] text-white' : ''}
                        ${isCompleted ? 'border-green-600 bg-green-600 text-white' : ''}
                        ${!isCurrent && !isCompleted ? 'border-gray-300 bg-white text-gray-400' : ''}
                      `}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="h-6 w-6" />
                      ) : (
                        <Icon className="h-6 w-6" />
                      )}
                    </div>
                    <div className={`text-xs mt-2 font-medium ${isCurrent ? 'text-[#F97316]' : 'text-gray-500'}`}>
                      {step.label}
                    </div>
                  </div>
                  {index < stepIcons.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 ${isCompleted ? 'bg-green-600' : 'bg-gray-300'}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          <Progress value={progressPercent} className="h-2" />
          <div className="flex items-center justify-between mt-2 text-sm text-muted-foreground">
            <span>Step {currentStep} of 3</span>
            <span>{Math.round(progressPercent)}% Complete</span>
          </div>
        </div>

        {/* Alert for Critical Implementation */}
        <Alert className="mb-6 border-orange-500 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertTitle className="text-orange-900">Critical Phase 1 Components</AlertTitle>
          <AlertDescription className="text-orange-800">
            These three components are essential for HIPAA compliance, legal liability protection, 
            and matching quality. Test thoroughly before production deployment.
          </AlertDescription>
        </Alert>

        {/* Step Content */}
        <Card>
          <CardContent className="pt-6">
            {currentStep === 1 && (
              <PresentingConcerns
                data={presentingConcernsData}
                onChange={setPresentingConcernsData}
              />
            )}

            {currentStep === 2 && (
              <SafetyRiskScreening
                data={safetyScreeningData}
                onChange={setSafetyScreeningData}
              />
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold mb-2">Sign to Complete</h2>
                  <p className="text-muted-foreground">
                    Your signature confirms all information is accurate and you agree to the terms.
                  </p>
                </div>

                <SignatureCapture
                  signature={signatureData}
                  onSignatureChange={setSignatureData}
                  fullName="Demo User"
                  label="Your Legal Signature"
                  required
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-4 mt-6">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            size="lg"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <div className="flex items-center gap-2">
            {!validateStep() && (
              <Badge variant="destructive" className="animate-pulse">
                Complete all fields to continue
              </Badge>
            )}
          </div>

          <Button
            onClick={handleNext}
            disabled={!validateStep()}
            size="lg"
            className="bg-[#F97316] hover:bg-[#ea580c]"
          >
            {currentStep === 3 ? (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Complete Demo
              </>
            ) : (
              <>
                Next Step
                <ChevronRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>

        {/* Validation Status */}
        <Card className="mt-6 bg-gray-50">
          <CardHeader>
            <CardTitle className="text-sm">Validation Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-xs">
              <div>
                <div className="font-medium mb-1">Step 1: Concerns</div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    {presentingConcernsData.mainReason ? (
                      <CheckCircle2 className="h-3 w-3 text-green-600" />
                    ) : (
                      <div className="h-3 w-3 rounded-full border border-gray-300" />
                    )}
                    <span>Main reason</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {presentingConcernsData.primaryConcerns.length > 0 ? (
                      <CheckCircle2 className="h-3 w-3 text-green-600" />
                    ) : (
                      <div className="h-3 w-3 rounded-full border border-gray-300" />
                    )}
                    <span>Concerns ({presentingConcernsData.primaryConcerns.length})</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {presentingConcernsData.severityLevel ? (
                      <CheckCircle2 className="h-3 w-3 text-green-600" />
                    ) : (
                      <div className="h-3 w-3 rounded-full border border-gray-300" />
                    )}
                    <span>Severity</span>
                  </div>
                </div>
              </div>

              <div>
                <div className="font-medium mb-1">Step 2: Safety</div>
                <div className="text-muted-foreground">
                  {Object.values(safetyScreeningData).filter(v => v).length} / 6 answered
                </div>
              </div>

              <div>
                <div className="font-medium mb-1">Step 3: Signature</div>
                <div className="flex items-center gap-1">
                  {signatureData ? (
                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                  ) : (
                    <div className="h-3 w-3 rounded-full border border-gray-300" />
                  )}
                  <span>{signatureData ? 'Signed' : 'Not signed'}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
