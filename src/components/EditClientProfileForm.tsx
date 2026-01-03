import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { AlertCircle, CheckCircle2, Plus, X, User, FileText, Target, Heart } from 'lucide-react';

interface EditClientProfileFormProps {
    clientId: string;
    clientName: string;
    initialData: any;
    onSave: (data: any) => void;
    onCancel: () => void;
    open: boolean;
}

export function EditClientProfileForm({ clientId, clientName, initialData, onSave, onCancel, open }: EditClientProfileFormProps) {
    const [formData, setFormData] = useState(initialData);
    const [appendData, setAppendData] = useState({
        historyNote: '',
        medicalCondition: '',
        substanceUseNote: ''
    });

    // Temporary input states for adding items to arrays
    const [newGoal, setNewGoal] = useState('');
    const [newSubGoal, setNewSubGoal] = useState('');
    const [newActionItem, setNewActionItem] = useState('');

    const handleChange = (field: string, value: any) => {
        setFormData((prev: any) => ({ ...prev, [field]: value }));
    };

    const handleNestedChange = (path: string[], value: any) => {
        setFormData((prev: any) => {
            const setDeep = (obj: any, p: string[], v: any): any => {
                const [head, ...tail] = p;
                if (tail.length === 0) {
                    return { ...obj, [head]: v };
                }
                return {
                    ...obj,
                    [head]: setDeep(obj[head] || {}, tail, v)
                };
            };
            return setDeep(prev, path, value);
        });
    };

    const handleSave = () => {
        // Deep clone to avoid mutation during updates
        const finalData = JSON.parse(JSON.stringify(formData));

        if (appendData.historyNote) {
            finalData.background.clientHistory.previousTherapy += `\n\n[${new Date().toLocaleDateString()}] ${appendData.historyNote}`;
        }
        if (appendData.substanceUseNote) {
            finalData.background.clientHistory.substanceUse += `\n\n[${new Date().toLocaleDateString()}] ${appendData.substanceUseNote}`;
        }
        if (appendData.medicalCondition) {
            // Ensure array exists
            if (!finalData.background.clientHistory.medicalConditions) {
                finalData.background.clientHistory.medicalConditions = [];
            }
            finalData.background.clientHistory.medicalConditions.push(appendData.medicalCondition);
        }

        onSave(finalData);
    };

    // Helper functions for array management
    const addGoalDiscussed = () => {
        if (newGoal.trim() && formData.sessions?.lastSession) {
            const currentGoals = formData.sessions.lastSession.goalsDiscussed || [];
            handleNestedChange(['sessions', 'lastSession', 'goalsDiscussed'], [...currentGoals, newGoal.trim()]);
            setNewGoal('');
        }
    };

    const removeGoalDiscussed = (index: number) => {
        if (formData.sessions?.lastSession?.goalsDiscussed) {
            const newGoals = formData.sessions.lastSession.goalsDiscussed.filter((_: any, i: number) => i !== index);
            handleNestedChange(['sessions', 'lastSession', 'goalsDiscussed'], newGoals);
        }
    };

    const addSubGoal = () => {
        if (newSubGoal.trim() && formData.clinical?.treatmentPlan) {
            const currentSubGoals = formData.clinical.treatmentPlan.subGoals || [];
            handleNestedChange(['clinical', 'treatmentPlan', 'subGoals'], [...currentSubGoals, newSubGoal.trim()]);
            setNewSubGoal('');
        }
    };

    const removeSubGoal = (index: number) => {
        if (formData.clinical?.treatmentPlan?.subGoals) {
            const newSubGoals = formData.clinical.treatmentPlan.subGoals.filter((_: any, i: number) => i !== index);
            handleNestedChange(['clinical', 'treatmentPlan', 'subGoals'], newSubGoals);
        }
    };

    const addActionItem = () => {
        if (newActionItem.trim() && formData.sessions?.lastSession) {
            const currentItems = formData.sessions.lastSession.actionItems || [];
            handleNestedChange(['sessions', 'lastSession', 'actionItems'], [...currentItems, newActionItem.trim()]);
            setNewActionItem('');
        }
    };

    const removeActionItem = (index: number) => {
        if (formData.sessions?.lastSession?.actionItems) {
            const newItems = formData.sessions.lastSession.actionItems.filter((_: any, i: number) => i !== index);
            handleNestedChange(['sessions', 'lastSession', 'actionItems'], newItems);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
            <DialogContent className="sm:max-w-[900px] h-[90vh] flex flex-col p-0 gap-0 z-[100] bg-zinc-50/50">
                <DialogHeader className="p-6 border-b border-zinc-200 bg-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <DialogTitle className="text-xl font-semibold text-zinc-900">Edit Client Profile</DialogTitle>
                            <p className="text-sm text-zinc-500 mt-1">{clientName} • ID: {clientId}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                Therapist Edit Mode
                            </Badge>
                        </div>
                    </div>
                </DialogHeader>

                <div className="bg-blue-50 border-b border-blue-100 p-3 px-6 flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <h3 className="text-sm font-semibold text-blue-900">Restricted Access</h3>
                        <p className="text-xs text-blue-800 mt-0.5 leading-relaxed">
                            You can only edit clinical notes, treatment plans, and contextual information.
                            Protected fields like demographics, contact info, diagnoses, and assessments cannot be modified here.
                        </p>
                    </div>
                </div>

                <Tabs defaultValue="context" className="flex-1 flex flex-col overflow-hidden bg-white">
                    <div className="px-6 pt-2 border-b border-zinc-200 bg-white sticky top-0 z-10">
                        <TabsList className="w-full justify-start h-12 bg-transparent p-0 space-x-6">
                            <TabsTrigger
                                value="context"
                                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-orange-500 rounded-none px-0 pb-2 text-zinc-500 data-[state=active]:text-zinc-900 font-medium"
                            >
                                Identity & Context
                            </TabsTrigger>
                            <TabsTrigger
                                value="background"
                                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-orange-500 rounded-none px-0 pb-2 text-zinc-500 data-[state=active]:text-zinc-900 font-medium"
                            >
                                Background History
                            </TabsTrigger>
                            <TabsTrigger
                                value="treatment"
                                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-orange-500 rounded-none px-0 pb-2 text-zinc-500 data-[state=active]:text-zinc-900 font-medium"
                            >
                                Treatment Plan
                            </TabsTrigger>
                            <TabsTrigger
                                value="clinical"
                                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-orange-500 rounded-none px-0 pb-2 text-zinc-500 data-[state=active]:text-zinc-900 font-medium"
                            >
                                Clinical Notes
                            </TabsTrigger>
                            <TabsTrigger
                                value="metadata"
                                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-orange-500 rounded-none px-0 pb-2 text-zinc-500 data-[state=active]:text-zinc-900 font-medium"
                            >
                                Metadata & Settings
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="flex-1 min-h-0 overflow-y-auto bg-zinc-50/30 pb-40">
                        <div className="p-8 max-w-4xl mx-auto space-y-8">

                            {/* TAB: CONTEXT */}
                            <TabsContent value="context" className="mt-0 space-y-6">
                                <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm space-y-6">
                                    <div className="flex items-center gap-2 mb-2">
                                        <User className="h-5 w-5 text-orange-500" />
                                        <h3 className="text-lg font-semibold text-zinc-900">Identity Information</h3>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label>Preferred Name</Label>
                                            <Input
                                                value={formData.profile?.identity?.preferredName || ''}
                                                onChange={(e) => handleNestedChange(['profile', 'identity', 'preferredName'], e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Pronouns</Label>
                                            <Select
                                                value={formData.profile?.identity?.pronouns || ''}
                                                onValueChange={(val) => handleNestedChange(['profile', 'identity', 'pronouns'], val)}
                                            >
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="she/her">she/her</SelectItem>
                                                    <SelectItem value="he/him">he/him</SelectItem>
                                                    <SelectItem value="they/them">they/them</SelectItem>
                                                    <SelectItem value="other">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="bg-zinc-50 p-4 rounded-lg border border-zinc-100 text-sm text-zinc-500">
                                        <strong>Note:</strong> Avatar URL and personal context (relationship status, household, employment) are client-controlled fields and cannot be edited by therapists for privacy and autonomy reasons.
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm space-y-6 opacity-70">
                                    <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">Read Only Context</h3>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-1">
                                            <Label className="text-xs text-zinc-500">Full Name</Label>
                                            <div className="font-medium text-zinc-900">{formData.profile?.identity?.firstName} {formData.profile?.identity?.lastName}</div>
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs text-zinc-500">Contact</Label>
                                            <div className="font-medium text-zinc-900">{formData.profile?.contact?.email}</div>
                                            <div className="text-sm text-zinc-500">{formData.profile?.contact?.phone}</div>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            {/* TAB: BACKGROUND */}
                            <TabsContent value="background" className="mt-0 space-y-6">
                                <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm space-y-6">
                                    <div className="flex items-center gap-2 mb-2">
                                        <FileText className="h-5 w-5 text-orange-500" />
                                        <h3 className="text-lg font-semibold text-zinc-900">Client History (Append Only)</h3>
                                    </div>

                                    <div className="space-y-3">
                                        <Label>Client History</Label>
                                        <Textarea
                                            disabled
                                            className="bg-zinc-50 text-zinc-600 min-h-[120px] resize-none"
                                            value={formData.background?.clientHistory?.previousTherapy || ''}
                                        />
                                        <Textarea
                                            placeholder="Add new history note..."
                                            className="min-h-[80px] border-dashed focus:border-solid transition-all"
                                            value={appendData.historyNote}
                                            onChange={(e) => setAppendData(prev => ({ ...prev, historyNote: e.target.value }))}
                                        />
                                    </div>

                                    <Separator />

                                    <div className="space-y-3">
                                        <Label>Medical Conditions</Label>
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            {formData.background?.clientHistory?.medicalConditions?.map((cond: string, i: number) => (
                                                <Badge key={i} variant="secondary" className="px-3 py-1 text-sm font-normal">{cond}</Badge>
                                            ))}
                                        </div>
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="Add condition..."
                                                value={appendData.medicalCondition}
                                                onChange={(e) => setAppendData(prev => ({ ...prev, medicalCondition: e.target.value }))}
                                                className="max-w-xs"
                                            />
                                            <Button
                                                variant="outline"
                                                onClick={() => {
                                                    if (appendData.medicalCondition) {
                                                        handleNestedChange(['background', 'clientHistory', 'medicalConditions'], [...(formData.background?.clientHistory?.medicalConditions || []), appendData.medicalCondition]);
                                                        setAppendData(prev => ({ ...prev, medicalCondition: '' }));
                                                    }
                                                }}
                                            >
                                                <Plus className="h-4 w-4 mr-1" /> Add
                                            </Button>
                                        </div>
                                    </div>

                                    <Separator />

                                    <div className="space-y-3">
                                        <Label>Substance Use</Label>
                                        <Textarea
                                            disabled
                                            className="bg-zinc-50 text-zinc-600 resize-none"
                                            value={formData.background?.clientHistory?.substanceUse || ''}
                                        />
                                        <Textarea
                                            placeholder="Add substance use note..."
                                            className="min-h-[80px] border-dashed focus:border-solid transition-all"
                                            value={appendData.substanceUseNote}
                                            onChange={(e) => setAppendData(prev => ({ ...prev, substanceUseNote: e.target.value }))}
                                        />
                                    </div>
                                </div>
                            </TabsContent>

                            {/* TAB: TREATMENT PLAN */}
                            <TabsContent value="treatment" className="mt-0 space-y-6">
                                <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm space-y-4">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Target className="h-5 w-5 text-orange-500" />
                                        <h3 className="text-lg font-semibold text-zinc-900">Treatment Plan</h3>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="space-y-1.5">
                                            <Label>Main Goal</Label>
                                            <Textarea
                                                value={formData.clinical?.treatmentPlan?.mainGoal || ''}
                                                onChange={(e) => handleNestedChange(['clinical', 'treatmentPlan', 'mainGoal'], e.target.value)}
                                                className="resize-none min-h-[60px]"
                                                rows={2}
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <Label>Modality</Label>
                                                <Select
                                                    value={formData.clinical?.treatmentPlan?.modality || ''}
                                                    onValueChange={(val) => handleNestedChange(['clinical', 'treatmentPlan', 'modality'], val)}
                                                >
                                                    <SelectTrigger className="h-9"><SelectValue placeholder="Select modality" /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="CBT">CBT</SelectItem>
                                                        <SelectItem value="DBT">DBT</SelectItem>
                                                        <SelectItem value="ACT">ACT</SelectItem>
                                                        <SelectItem value="Psychodynamic">Psychodynamic</SelectItem>
                                                        <SelectItem value="EMDR">EMDR</SelectItem>
                                                        <SelectItem value="Integrative">Integrative</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label>Progress Status</Label>
                                                <Select
                                                    value={formData.clinical?.treatmentPlan?.progress || 'on_track'}
                                                    onValueChange={(val) => handleNestedChange(['clinical', 'treatmentPlan', 'progress'], val)}
                                                >
                                                    <SelectTrigger className="h-9"><SelectValue placeholder="Select Status" /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="on_track">On Track</SelectItem>
                                                        <SelectItem value="excellent">Excellent Progress</SelectItem>
                                                        <SelectItem value="slow">Slow Progress</SelectItem>
                                                        <SelectItem value="stalled">Stalled</SelectItem>
                                                        <SelectItem value="regressed">Regressed</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label className="text-xs text-zinc-500">Progress: {formData.clinical?.treatmentPlan?.progressPercent || 0}%</Label>
                                            <div className="flex items-center gap-3">
                                                <Input
                                                    type="range"
                                                    min="0" max="100" step="5"
                                                    value={formData.clinical?.treatmentPlan?.progressPercent || 0}
                                                    onChange={(e) => handleNestedChange(['clinical', 'treatmentPlan', 'progressPercent'], parseInt(e.target.value))}
                                                    className="flex-1 h-2"
                                                />
                                            </div>
                                        </div>

                                        <Separator className="my-2" />

                                        <div className="space-y-2">
                                            <Label>Sub-Goals</Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    value={newSubGoal}
                                                    onChange={(e) => setNewSubGoal(e.target.value)}
                                                    placeholder="Add sub-goal..."
                                                    onKeyPress={(e) => e.key === 'Enter' && addSubGoal()}
                                                    className="h-9"
                                                />
                                                <Button variant="outline" onClick={addSubGoal} size="icon" className="h-9 w-9"><Plus className="h-4 w-4" /></Button>
                                            </div>
                                            <div className="space-y-1.5">
                                                {formData.clinical?.treatmentPlan?.subGoals?.map((goal: string, i: number) => (
                                                    <div key={i} className="flex items-center gap-2 p-1.5 bg-purple-50 rounded-md border border-purple-100">
                                                        <Target className="h-3.5 w-3.5 text-purple-600 flex-shrink-0" />
                                                        <span className="flex-1 text-sm text-zinc-700 truncate">{goal}</span>
                                                        <button onClick={() => removeSubGoal(i)} className="text-zinc-400 hover:text-red-500 transition-colors">
                                                            <X className="h-3.5 w-3.5" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            {/* TAB: CLINICAL NOTES */}
                            <TabsContent value="clinical" className="mt-0 space-y-6">
                                <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm space-y-6">
                                    <div className="flex items-center gap-2 mb-2">
                                        <FileText className="h-5 w-5 text-orange-500" />
                                        <h3 className="text-lg font-semibold text-zinc-900">Last Session Notes</h3>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Summary</Label>
                                            <Textarea
                                                value={formData.sessions?.lastSession?.summary || ''}
                                                onChange={(e) => handleNestedChange(['sessions', 'lastSession', 'summary'], e.target.value)}
                                                className="min-h-[100px]"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-3">
                                                <Label>Goals Discussed</Label>
                                                <div className="flex gap-2">
                                                    <Input
                                                        value={newGoal}
                                                        onChange={(e) => setNewGoal(e.target.value)}
                                                        placeholder="Add goal..."
                                                        onKeyPress={(e) => e.key === 'Enter' && addGoalDiscussed()}
                                                    />
                                                    <Button variant="outline" onClick={addGoalDiscussed} size="icon"><Plus className="h-4 w-4" /></Button>
                                                </div>
                                                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                                                    {formData.sessions?.lastSession?.goalsDiscussed?.map((goal: string, i: number) => (
                                                        <div key={i} className="flex items-center gap-2 p-2 bg-blue-50 rounded-md border border-blue-100">
                                                            <CheckCircle2 className="h-4 w-4 text-blue-600 flex-shrink-0" />
                                                            <span className="flex-1 text-sm text-zinc-700">{goal}</span>
                                                            <button onClick={() => removeGoalDiscussed(i)} className="text-zinc-400 hover:text-red-500 transition-colors">
                                                                <X className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <Label>Action Items</Label>
                                                <div className="flex gap-2">
                                                    <Input
                                                        value={newActionItem}
                                                        onChange={(e) => setNewActionItem(e.target.value)}
                                                        placeholder="Add item..."
                                                        onKeyPress={(e) => e.key === 'Enter' && addActionItem()}
                                                    />
                                                    <Button variant="outline" onClick={addActionItem} size="icon"><Plus className="h-4 w-4" /></Button>
                                                </div>
                                                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                                                    {formData.sessions?.lastSession?.actionItems?.map((item: string, i: number) => (
                                                        <div key={i} className="flex items-center gap-2 p-2 bg-green-50 rounded-md border border-green-100">
                                                            <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                                                            <span className="flex-1 text-sm text-zinc-700">{item}</span>
                                                            <button onClick={() => removeActionItem(i)} className="text-zinc-400 hover:text-red-500 transition-colors">
                                                                <X className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            {/* TAB: METADATA */}
                            <TabsContent value="metadata" className="mt-0 space-y-6">
                                <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm space-y-6">
                                    <h3 className="text-lg font-semibold text-zinc-900">Therapy Settings</h3>
                                    <div className="space-y-2 max-w-md">
                                        <Label>Session Frequency</Label>
                                        <Select
                                            value={formData.sessions?.stats?.frequency || ''}
                                            onValueChange={(val) => handleNestedChange(['sessions', 'stats', 'frequency'], val)}
                                        >
                                            <SelectTrigger><SelectValue placeholder="Select frequency" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="weekly">Weekly</SelectItem>
                                                <SelectItem value="biweekly">Bi-weekly</SelectItem>
                                                <SelectItem value="monthly">Monthly</SelectItem>
                                                <SelectItem value="as_needed">As Needed</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm space-y-6 opacity-70">
                                    <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">System Data (Read Only)</h3>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-xs text-zinc-500">Insurance Provider</Label>
                                            <Input disabled value={formData.billing?.insuranceProvider || ''} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs text-zinc-500">Account Status</Label>
                                            <Input disabled value={formData.profile?.status?.accountStatus || ''} />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs text-zinc-500">AI Alerts</Label>
                                        <div className="space-y-2">
                                            {formData.aiInsights?.trendAlerts?.map((alert: any, i: number) => (
                                                <div key={i} className="text-sm bg-zinc-50 p-3 rounded border border-zinc-100 flex items-start gap-2">
                                                    <span className="font-semibold text-zinc-900">{alert.type}:</span>
                                                    <span className="text-zinc-600">{alert.message}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                        </div>
                    </div>

                    <div className="p-6 border-t border-zinc-200 bg-white flex justify-between items-center z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                        <p className="text-sm text-zinc-500">Changes will be saved to the client's profile</p>
                        <div className="flex gap-3">
                            <Button variant="outline" onClick={onCancel}>Cancel</Button>
                            <Button onClick={handleSave} className="bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-500/20">Save Changes</Button>
                        </div>
                    </div>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
