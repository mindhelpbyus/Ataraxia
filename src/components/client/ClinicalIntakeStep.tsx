import React from 'react';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Checkbox } from '../ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Stethoscope, Heart, Brain, AlertCircle } from 'lucide-react';
import { StepProps } from './types';
import { getCrisisResources } from '../../data/crisisResources';

export function ClinicalIntakeStep({ formData, updateFormData, toggleArrayValue }: StepProps) {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-semibold mb-2">Clinical Intake</h2>
                <p className="text-muted-foreground">Help us understand your mental health needs</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Stethoscope className="h-5 w-5" />
                        Primary Concerns
                    </CardTitle>
                    <CardDescription>What brings you to therapy today?</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label>Presenting Concerns <span className="text-red-500">*</span></Label>
                        <Textarea
                            value={formData.presentingConcerns}
                            onChange={(e) => updateFormData('presentingConcerns', e.target.value)}
                            placeholder="Please describe what you'd like help with..."
                            rows={4}
                        />
                    </div>

                    <div>
                        <Label>Current Symptoms (Select all that apply)</Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                            {['Anxiety', 'Depression', 'Stress', 'Sleep issues', 'Trauma', 'Grief', 'Relationship issues', 'Anger', 'Mood swings'].map(symptom => (
                                <div key={symptom} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={symptom}
                                        checked={formData.symptoms.includes(symptom)}
                                        onCheckedChange={() => toggleArrayValue('symptoms', symptom)}
                                    />
                                    <Label htmlFor={symptom} className="cursor-pointer">{symptom}</Label>
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Heart className="h-5 w-5" />
                        Medical History
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label>Current Medications</Label>
                        <Textarea
                            value={formData.currentMedications}
                            onChange={(e) => updateFormData('currentMedications', e.target.value)}
                            placeholder="List any medications you're currently taking (including psychiatric medications)"
                            rows={3}
                        />
                    </div>

                    <div>
                        <Label>Past Mental Health Diagnoses</Label>
                        <Textarea
                            value={formData.pastDiagnoses}
                            onChange={(e) => updateFormData('pastDiagnoses', e.target.value)}
                            placeholder="Have you been diagnosed with any mental health conditions? If yes, please list them"
                            rows={3}
                        />
                    </div>

                    <div>
                        <Label>Previous Therapy Experience</Label>
                        <Textarea
                            value={formData.previousTherapyExperience}
                            onChange={(e) => updateFormData('previousTherapyExperience', e.target.value)}
                            placeholder="Have you been in therapy before? What was helpful or unhelpful?"
                            rows={3}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Brain className="h-5 w-5" />
                        Substance Use & Risk Assessment
                    </CardTitle>
                    <CardDescription>Confidential information to ensure your safety</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label>Substance Use [alcohol, tobacco, etc.]</Label>
                        <Select value={formData.substanceUse} onValueChange={(v) => updateFormData('substanceUse', v)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">No current use</SelectItem>
                                <SelectItem value="occasional">Occasional use</SelectItem>
                                <SelectItem value="regular">Regular use</SelectItem>
                                <SelectItem value="concerned">Concerned about my use</SelectItem>
                                <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label>Suicidal Thoughts</Label>
                        <Select value={formData.suicidalIdeation} onValueChange={(v) => updateFormData('suicidalIdeation', v)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">No current thoughts</SelectItem>
                                <SelectItem value="past">Had thoughts in the past</SelectItem>
                                <SelectItem value="passive">Passive thoughts (no plan)</SelectItem>
                                <SelectItem value="active">Active thoughts (with plan)</SelectItem>
                                <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label>Self-Harm History</Label>
                        <Select value={formData.selfHarmHistory} onValueChange={(v) => updateFormData('selfHarmHistory', v)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">No history</SelectItem>
                                <SelectItem value="past">Past history (not current)</SelectItem>
                                <SelectItem value="current">Current behaviors</SelectItem>
                                <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex gap-2">
                            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-red-900 w-full">
                                <p className="font-medium mb-1">Crisis Resources</p>
                                <p className="mb-2">If you're in crisis or having thoughts of suicide:</p>
                                <div className="grid gap-2 mt-2">
                                    {getCrisisResources(formData.country).map((resource) => (
                                        <div key={resource.id} className="flex items-center justify-between bg-white/50 p-2 rounded border border-red-100">
                                            <div>
                                                <span className="font-bold">{resource.name}:</span> {resource.number}
                                            </div>
                                            <div className="flex gap-1">
                                                {resource.method.includes('call') && <Badge variant="outline" className="bg-white text-[10px] h-5">Call</Badge>}
                                                {resource.method.includes('text') && <Badge variant="outline" className="bg-white text-[10px] h-5">Text</Badge>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}