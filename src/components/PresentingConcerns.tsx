import React from 'react';
import { Heart, Brain, Users, Utensils, Wine, Clock, Briefcase, Home, Baby, MessageCircle, Activity, Moon, Scale, Frown, Zap, Shield, Palette, Plus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Badge } from './ui/badge';

export interface PresentingConcernsData {
  mainReason: string; // "What brings you to therapy?" - short answer
  primaryConcerns: string[]; // Array of selected concerns
  severityLevel: 'mild' | 'moderate' | 'severe' | 'unsure' | '';
  otherConcernDetails?: string; // If "Other" is selected
}

interface PresentingConcernsProps {
  data: PresentingConcernsData;
  onChange: (data: PresentingConcernsData) => void;
}

// Available concerns with icons and colors
const CONCERN_OPTIONS = [
  { id: 'anxiety', label: 'Anxiety', icon: Zap, color: 'text-yellow-600', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200' },
  { id: 'depression', label: 'Depression', icon: Frown, color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' },
  { id: 'trauma', label: 'Trauma / PTSD', icon: Shield, color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200' },
  { id: 'adhd', label: 'ADHD', icon: Brain, color: 'text-purple-600', bgColor: 'bg-purple-50', borderColor: 'border-purple-200' },
  { id: 'relationship', label: 'Relationship Issues', icon: Heart, color: 'text-pink-600', bgColor: 'bg-pink-50', borderColor: 'border-pink-200' },
  { id: 'family', label: 'Family Conflict', icon: Users, color: 'text-orange-600', bgColor: 'bg-orange-50', borderColor: 'border-orange-200' },
  { id: 'parenting', label: 'Parenting Support', icon: Baby, color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200' },
  { id: 'transitions', label: 'Life Transitions', icon: Home, color: 'text-indigo-600', bgColor: 'bg-indigo-50', borderColor: 'border-indigo-200' },
  { id: 'stress', label: 'Stress / Burnout', icon: Activity, color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200' },
  { id: 'eating', label: 'Eating Concerns', icon: Utensils, color: 'text-teal-600', bgColor: 'bg-teal-50', borderColor: 'border-teal-200' },
  { id: 'substance', label: 'Substance Use', icon: Wine, color: 'text-amber-600', bgColor: 'bg-amber-50', borderColor: 'border-amber-200' },
  { id: 'grief', label: 'Grief or Loss', icon: Heart, color: 'text-gray-600', bgColor: 'bg-gray-50', borderColor: 'border-gray-200' },
  { id: 'anger', label: 'Anger / Emotional Regulation', icon: Zap, color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200' },
  { id: 'lgbtq', label: 'LGBTQ+ Identity Support', icon: Palette, color: 'text-rainbow-600', bgColor: 'bg-purple-50', borderColor: 'border-purple-200' },
  { id: 'pain', label: 'Chronic Pain', icon: Activity, color: 'text-orange-600', bgColor: 'bg-orange-50', borderColor: 'border-orange-200' },
  { id: 'sleep', label: 'Sleep Issues', icon: Moon, color: 'text-indigo-600', bgColor: 'bg-indigo-50', borderColor: 'border-indigo-200' },
  { id: 'work', label: 'Work-Related Concerns', icon: Briefcase, color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' },
  { id: 'other', label: 'Other', icon: Plus, color: 'text-gray-600', bgColor: 'bg-gray-50', borderColor: 'border-gray-200' },
];

export function PresentingConcerns({ data, onChange }: PresentingConcernsProps) {
  const updateField = (field: keyof PresentingConcernsData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const toggleConcern = (concernId: string) => {
    const current = data.primaryConcerns || [];
    const updated = current.includes(concernId)
      ? current.filter(id => id !== concernId)
      : [...current, concernId];
    updateField('primaryConcerns', updated);
  };

  const isConcernSelected = (concernId: string) => {
    return (data.primaryConcerns || []).includes(concernId);
  };

  const selectedCount = (data.primaryConcerns || []).length;
  const hasOtherSelected = isConcernSelected('other');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-6 w-6 text-[#F97316]" />
          <h2 className="text-2xl font-semibold">What Brings You Here?</h2>
        </div>
        <p className="text-muted-foreground">
          Help us understand your needs so we can match you with the right therapist and provide the best care.
        </p>
      </div>

      {/* Main Reason - Free Text */}
      <Card>
        <CardHeader>
          <CardTitle>Tell Us About Your Situation</CardTitle>
          <CardDescription>
            In your own words, what brings you to therapy? (This helps us understand your unique situation)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={data.mainReason}
            onChange={(e) => updateField('mainReason', e.target.value)}
            placeholder="For example: 'I've been feeling anxious about work and it's affecting my sleep and relationships...' or 'I'm going through a major life change and need support processing my feelings...'"
            rows={6}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground mt-2">
            {data.mainReason.length} / 1000 characters
          </p>
        </CardContent>
      </Card>

      {/* Primary Concerns Checklist */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Primary Concerns</span>
            {selectedCount > 0 && (
              <Badge variant="secondary">
                {selectedCount} selected
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Select all that apply. This helps us match you with a therapist who specializes in these areas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {CONCERN_OPTIONS.map((concern) => {
              const Icon = concern.icon;
              const isSelected = isConcernSelected(concern.id);
              
              return (
                <div
                  key={concern.id}
                  className={`
                    relative flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all
                    ${isSelected 
                      ? `${concern.borderColor} ${concern.bgColor} shadow-sm` 
                      : 'border-gray-200 bg-white hover:border-gray-300'
                    }
                  `}
                  onClick={() => toggleConcern(concern.id)}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => toggleConcern(concern.id)}
                    className="mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Icon className={`h-5 w-5 ${isSelected ? concern.color : 'text-gray-400'} flex-shrink-0`} />
                      <Label 
                        className={`cursor-pointer font-medium ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}
                      >
                        {concern.label}
                      </Label>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Other Details - Show if "Other" is selected */}
          {hasOtherSelected && (
            <div className="mt-4 space-y-2">
              <Label htmlFor="other-details">
                Please specify other concerns <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="other-details"
                value={data.otherConcernDetails || ''}
                onChange={(e) => updateField('otherConcernDetails', e.target.value)}
                placeholder="Describe other concerns you'd like to address in therapy..."
                rows={3}
                className="resize-none"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Severity Level */}
      <Card>
        <CardHeader>
          <CardTitle>How Much Are These Concerns Affecting You?</CardTitle>
          <CardDescription>
            This helps us understand the urgency and intensity of support you may need.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup 
            value={data.severityLevel} 
            onValueChange={(val) => updateField('severityLevel', val)}
            className="space-y-3"
          >
            <div 
              className={`
                flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all
                ${data.severityLevel === 'mild' ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-white hover:border-gray-300'}
              `}
            >
              <RadioGroupItem value="mild" id="severity-mild" className="mt-1" />
              <div className="flex-1">
                <Label htmlFor="severity-mild" className="cursor-pointer font-medium text-base">
                  Mild
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  I'm managing day-to-day, but would like support to feel better
                </p>
              </div>
            </div>

            <div 
              className={`
                flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all
                ${data.severityLevel === 'moderate' ? 'border-yellow-300 bg-yellow-50' : 'border-gray-200 bg-white hover:border-gray-300'}
              `}
            >
              <RadioGroupItem value="moderate" id="severity-moderate" className="mt-1" />
              <div className="flex-1">
                <Label htmlFor="severity-moderate" className="cursor-pointer font-medium text-base">
                  Moderate
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  It's affecting my daily life, work, or relationships in noticeable ways
                </p>
              </div>
            </div>

            <div 
              className={`
                flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all
                ${data.severityLevel === 'severe' ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white hover:border-gray-300'}
              `}
            >
              <RadioGroupItem value="severe" id="severity-severe" className="mt-1" />
              <div className="flex-1">
                <Label htmlFor="severity-severe" className="cursor-pointer font-medium text-base">
                  Severe
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  I'm struggling significantly and it's very difficult to function
                </p>
              </div>
            </div>

            <div 
              className={`
                flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all
                ${data.severityLevel === 'unsure' ? 'border-gray-300 bg-gray-50' : 'border-gray-200 bg-white hover:border-gray-300'}
              `}
            >
              <RadioGroupItem value="unsure" id="severity-unsure" className="mt-1" />
              <div className="flex-1">
                <Label htmlFor="severity-unsure" className="cursor-pointer font-medium text-base">
                  I'm Not Sure
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  I'd like to discuss this with a therapist to better understand
                </p>
              </div>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Summary */}
      {selectedCount > 0 && data.severityLevel && (
        <Card className="border-2 border-[#F97316] bg-orange-50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-[#F97316]" />
              Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="text-sm font-medium text-gray-700 mb-1">Selected Concerns:</div>
              <div className="flex flex-wrap gap-2">
                {data.primaryConcerns.map(concernId => {
                  const concern = CONCERN_OPTIONS.find(c => c.id === concernId);
                  if (!concern) return null;
                  const Icon = concern.icon;
                  return (
                    <Badge key={concernId} variant="secondary" className="flex items-center gap-1">
                      <Icon className="h-3 w-3" />
                      {concern.label}
                    </Badge>
                  );
                })}
              </div>
            </div>
            
            <div>
              <div className="text-sm font-medium text-gray-700 mb-1">Impact Level:</div>
              <Badge 
                variant="secondary"
                className={`
                  ${data.severityLevel === 'mild' ? 'bg-green-100 text-green-800' : ''}
                  ${data.severityLevel === 'moderate' ? 'bg-yellow-100 text-yellow-800' : ''}
                  ${data.severityLevel === 'severe' ? 'bg-red-100 text-red-800' : ''}
                  ${data.severityLevel === 'unsure' ? 'bg-gray-100 text-gray-800' : ''}
                `}
              >
                {data.severityLevel.charAt(0).toUpperCase() + data.severityLevel.slice(1)}
              </Badge>
            </div>

            <p className="text-sm text-gray-700 mt-3">
              Based on your input, we'll match you with a therapist who specializes in these areas and can provide 
              the appropriate level of support.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
