import React from 'react';
import { AlertTriangle, Phone, MessageSquare, Heart, Shield, AlertCircle, Brain, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Textarea } from './ui/textarea';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

export interface SafetyScreeningData {
  // A. Current Safety
  suicidalThoughts: 'no' | 'yes' | '';
  selfHarmThoughts: 'no' | 'yes' | '';
  suicidePlan: 'no' | 'yes' | '';
  accessToMeans: 'no' | 'yes' | '';
  suicideIntent: 'no' | 'yes' | '';

  // B. Past Safety
  pastSuicideAttempts: 'no' | 'yes' | '';
  pastSelfHarm: 'no' | 'yes' | '';

  // C. Abuse / Violence
  safeAtHome: 'no' | 'yes' | '';
  experiencedAbuse: 'no' | 'yes' | ''; // Conditional if safeAtHome is No
  afraidOfSomeone: 'no' | 'yes' | '';

  // D. Psychotic Symptoms
  psychoticSymptoms: 'no' | 'yes' | '';

  // E. Substance Use
  substanceUseControl: 'no' | 'yes' | '';

  // F. Protective Factors
  hasSocialSupport: 'no' | 'yes' | '';
  copingStrategies: string;

  additionalSafetyConcerns?: string;
  wantsSafetyPlan: boolean;
}

import { getCrisisResources, RiskFlags } from '../data/crisisResources';
import { Badge } from './ui/badge';

interface SafetyRiskScreeningProps {
  data: SafetyScreeningData;
  onChange: (data: SafetyScreeningData) => void;
  countryCode?: string;
}

export function SafetyRiskScreening({ data, onChange, countryCode = 'US' }: SafetyRiskScreeningProps) {
  const updateField = (field: keyof SafetyScreeningData, value: any) => {
    const updated = { ...data, [field]: value };
    onChange(updated);
  };

  // Determine if crisis resources should be shown based on current answers
  const shouldShowCrisisResources = [
    'suicidalThoughts',
    'selfHarmThoughts',
    'suicidePlan',
    'accessToMeans',
    'suicideIntent',
    'pastSuicideAttempts',
    'afraidOfSomeone',
    'psychoticSymptoms'
  ].some(field => data[field as keyof SafetyScreeningData] === 'yes') || data.safeAtHome === 'no';

  // Calculate Risk Level (Internal Logic for Display/Alerts)
  const getRiskLevel = (): 'low' | 'moderate' | 'high' => {
    const hasActiveThoughts = data.suicidalThoughts === 'yes';
    const hasPlanOrIntent = data.suicidePlan === 'yes' || data.suicideIntent === 'yes';
    const hasMeans = data.accessToMeans === 'yes';
    const hasPastAttempts = data.pastSuicideAttempts === 'yes';
    const noSupport = data.hasSocialSupport === 'no';
    const feelsUnsafe = data.safeAtHome === 'no' || data.afraidOfSomeone === 'yes';
    const hasPsychosis = data.psychoticSymptoms === 'yes';

    if (
      (hasActiveThoughts && hasPlanOrIntent) ||
      (hasActiveThoughts && hasMeans) ||
      (hasActiveThoughts && hasPastAttempts) ||
      (hasActiveThoughts && noSupport) ||
      hasPsychosis ||
      feelsUnsafe
    ) {
      return 'high';
    }

    if (hasActiveThoughts) {
      return 'moderate';
    }

    return 'low';
  };

  const riskLevel = getRiskLevel();
  const isHighRisk = riskLevel === 'high';
  const showResources = shouldShowCrisisResources || isHighRisk;

  // Calculate Risk Flags for filtering resources
  const riskFlags: RiskFlags = {
    suicide: data.suicidalThoughts === 'yes' || data.selfHarmThoughts === 'yes' || data.pastSuicideAttempts === 'yes',
    violence: data.safeAtHome === 'no' || data.afraidOfSomeone === 'yes' || data.experiencedAbuse === 'yes',
    substance: data.substanceUseControl === 'yes'
  };

  const resources = getCrisisResources(countryCode, riskFlags);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-[#F97316]" />
          <h2 className="text-2xl font-semibold">Safety & Wellness Screening</h2>
        </div>
        <p className="text-muted-foreground">
          Your safety is our top priority. Please answer the following questions honestly.
          This information helps us provide you with the most appropriate care.
        </p>
      </div>

      {/* Privacy Notice */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertTitle>Confidential Information</AlertTitle>
        <AlertDescription>
          Your responses are confidential and will be shared only with your care team.
          If you indicate immediate safety concerns, we may need to take action to ensure your safety.
        </AlertDescription>
      </Alert>

      {/* Crisis Alert */}
      {showResources && (
        <Alert className="border-red-600 bg-red-50">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <AlertTitle className="text-red-900 text-lg">Immediate Help Available</AlertTitle>
          <AlertDescription className="space-y-4">
            <p className="text-red-800">
              If you're in immediate danger or having thoughts of harming yourself or others,
              please contact emergency services or use one of these crisis resources right now:
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              {resources.map((resource) => (
                <div key={resource.id} className="bg-white border border-red-200 rounded-lg p-3 flex flex-col gap-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {resource.type === 'emergency' && <AlertTriangle className="h-5 w-5 text-red-600" />}
                      {resource.type === 'suicide' && <Heart className="h-5 w-5 text-pink-600" />}
                      {resource.type === 'domestic_violence' && <Shield className="h-5 w-5 text-purple-600" />}
                      {resource.type === 'general' && <MessageSquare className="h-5 w-5 text-blue-600" />}
                      {resource.type === 'substance_use' && <Brain className="h-5 w-5 text-green-600" />}
                      <span className="font-bold text-red-900">{resource.name}</span>
                    </div>
                    <Badge variant="outline" className="text-xs bg-red-50 text-red-800 border-red-200">
                      {resource.availability}
                    </Badge>
                  </div>

                  <div className="text-lg font-bold text-gray-900">{resource.number}</div>
                  <div className="text-xs text-gray-600">{resource.description}</div>

                  <div className="flex gap-2 mt-1">
                    {resource.method.includes('call') && <Badge variant="secondary" className="text-[10px] h-5">Call</Badge>}
                    {resource.method.includes('text') && <Badge variant="secondary" className="text-[10px] h-5">Text</Badge>}
                    {resource.method.includes('chat') && <Badge variant="secondary" className="text-[10px] h-5">Chat</Badge>}
                  </div>
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* A. Current Safety */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-blue-600" />
            Current Safety
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <YesNoQuestion
            id="suicidalThoughts"
            question="Over the past few weeks, have you had thoughts about wanting to end your life?"
            value={data.suicidalThoughts}
            onChange={(val) => updateField('suicidalThoughts', val)}
          />
          <YesNoQuestion
            id="selfHarmThoughts"
            question="Have you thought about harming yourself in any way?"
            value={data.selfHarmThoughts}
            onChange={(val) => updateField('selfHarmThoughts', val)}
          />
          <YesNoQuestion
            id="suicidePlan"
            question="Have you made any plans about how you would harm yourself or end your life?"
            value={data.suicidePlan}
            onChange={(val) => updateField('suicidePlan', val)}
          />
          <YesNoQuestion
            id="accessToMeans"
            question="Do you have access to anything that you could use to harm yourself?"
            value={data.accessToMeans}
            onChange={(val) => updateField('accessToMeans', val)}
          />
          <YesNoQuestion
            id="suicideIntent"
            question="Do you feel you might act on these thoughts?"
            value={data.suicideIntent}
            onChange={(val) => updateField('suicideIntent', val)}
          />
        </CardContent>
      </Card>

      {/* B. Past Safety */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            Past History
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <YesNoQuestion
            id="pastSuicideAttempts"
            question="Have you ever attempted to take your life in the past?"
            value={data.pastSuicideAttempts}
            onChange={(val) => updateField('pastSuicideAttempts', val)}
          />
          <YesNoQuestion
            id="pastSelfHarm"
            question="Have you harmed yourself intentionally in the past?"
            value={data.pastSelfHarm}
            onChange={(val) => updateField('pastSelfHarm', val)}
          />
        </CardContent>
      </Card>

      {/* C. Abuse / Violence */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Safety & Environment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <YesNoQuestion
            id="safeAtHome"
            question="Do you feel safe at home?"
            value={data.safeAtHome}
            onChange={(val) => updateField('safeAtHome', val)}
            yesLabel="Yes"
            noLabel="No"
          />

          {data.safeAtHome === 'no' && (
            <YesNoQuestion
              id="experiencedAbuse"
              question="Has anyone hurt you physically, emotionally, or sexually?"
              value={data.experiencedAbuse}
              onChange={(val) => updateField('experiencedAbuse', val)}
            />
          )}

          <YesNoQuestion
            id="afraidOfSomeone"
            question="Is there someone you are afraid of right now?"
            value={data.afraidOfSomeone}
            onChange={(val) => updateField('afraidOfSomeone', val)}
          />
        </CardContent>
      </Card>

      {/* D. Psychotic Symptoms & E. Substance Use */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-600" />
            Wellness Check
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <YesNoQuestion
            id="psychoticSymptoms"
            question="Are you hearing voices or seeing things that others cannot?"
            value={data.psychoticSymptoms}
            onChange={(val) => updateField('psychoticSymptoms', val)}
          />
          <YesNoQuestion
            id="substanceUseControl"
            question="Have alcohol or drugs made you feel out of control recently?"
            value={data.substanceUseControl}
            onChange={(val) => updateField('substanceUseControl', val)}
          />
        </CardContent>
      </Card>

      {/* F. Protective Factors */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Heart className="h-5 w-5 text-blue-600" />
            Support & Coping
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <YesNoQuestion
            id="hasSocialSupport"
            question="Is there someone you can reach out to when you feel distressed?"
            value={data.hasSocialSupport}
            onChange={(val) => updateField('hasSocialSupport', val)}
          />

          <div className="space-y-3">
            <Label htmlFor="copingStrategies" className="text-base font-medium">
              What helps you feel safe when you’re overwhelmed?
            </Label>
            <Textarea
              id="copingStrategies"
              value={data.copingStrategies}
              onChange={(e) => updateField('copingStrategies', e.target.value)}
              placeholder="E.g., Talking to a friend, listening to music, walking..."
              className="resize-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* Safety Plan Option */}
      <Card className="border-2 border-[#F97316]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-[#F97316]" />
            Safety Plan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            A safety plan is a personalized, practical plan that can help you through difficult moments.
            It includes coping strategies, people you can contact, and steps to keep yourself safe.
          </p>

          <RadioGroup
            value={data.wantsSafetyPlan ? 'yes' : 'no'}
            onValueChange={(val) => updateField('wantsSafetyPlan', val === 'yes')}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="safety-plan-yes" />
              <Label htmlFor="safety-plan-yes" className="cursor-pointer font-normal">
                Yes, I'd like to create a safety plan
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="safety-plan-no" />
              <Label htmlFor="safety-plan-no" className="cursor-pointer font-normal">
                No, not at this time
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>
    </div>
  );
}

function YesNoQuestion({
  id,
  question,
  value,
  onChange,
  yesLabel = "Yes",
  noLabel = "No"
}: {
  id: string;
  question: string;
  value: string;
  onChange: (val: string) => void;
  yesLabel?: string;
  noLabel?: string;
}) {
  return (
    <div className="space-y-3">
      <Label className="text-base font-medium leading-relaxed">
        {question}
      </Label>
      <RadioGroup
        value={value}
        onValueChange={onChange}
        className="flex gap-4"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="no" id={`${id}-no`} />
          <Label htmlFor={`${id}-no`} className="cursor-pointer font-normal">
            {noLabel}
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="yes" id={`${id}-yes`} />
          <Label htmlFor={`${id}-yes`} className="cursor-pointer font-normal">
            {yesLabel}
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
}
