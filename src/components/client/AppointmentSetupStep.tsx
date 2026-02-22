import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Separator } from '../ui/separator';
import { Switch } from '../ui/switch';
import { Lock, Calendar as CalendarIcon, Eye, EyeOff } from 'lucide-react';
import { StepProps } from './types';

export function AppointmentSetupStep({ formData, updateFormData }: StepProps) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-semibold mb-2">Account & Appointment Setup</h2>
                <p className="text-muted-foreground">Create your portal account and set preferences</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Lock className="h-5 w-5" />
                        Portal Account *
                    </CardTitle>
                    <CardDescription>Create a secure account to access your client portal</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label>Username *</Label>
                        <Input
                            value={formData.username}
                            onChange={(e) => updateFormData('username', e.target.value)}
                            placeholder="Choose a username"
                        />
                    </div>
                    <div>
                        <Label>Password *</Label>
                        <div className="relative">
                            <Input
                                type={showPassword ? 'text' : 'password'}
                                value={formData.password}
                                onChange={(e) => updateFormData('password', e.target.value)}
                                placeholder="Create a strong password"
                            />
                            <Button
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Must be at least 8 characters with uppercase, lowercase, number, and special character
                        </p>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                        <Label>Portal Permissions</Label>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="view-notes" className="cursor-pointer">Allow me to view therapy notes</Label>
                            <Switch
                                id="view-notes"
                                checked={formData.allowViewNotes}
                                onCheckedChange={(checked) => updateFormData('allowViewNotes', checked)}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="view-invoices" className="cursor-pointer">Allow me to view invoices</Label>
                            <Switch
                                id="view-invoices"
                                checked={formData.allowViewInvoices}
                                onCheckedChange={(checked) => updateFormData('allowViewInvoices', checked)}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CalendarIcon className="h-5 w-5" />
                        Appointment Preferences
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label>Preferred Session Frequency</Label>
                        <Select value={formData.preferredFrequency} onValueChange={(v) => updateFormData('preferredFrequency', v)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="bi-weekly">Bi-weekly (every 2 weeks)</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                                <SelectItem value="as-needed">As needed</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label>Care Team Notes (Optional)</Label>
                        <Textarea
                            value={formData.careTeamNotes || ''}
                            onChange={(e) => updateFormData('careTeamNotes', e.target.value)}
                            placeholder="Any additional information for your care team..."
                            rows={3}
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
