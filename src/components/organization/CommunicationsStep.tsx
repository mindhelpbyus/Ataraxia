import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Mail } from 'lucide-react';
import { StepProps } from './types';

export function CommunicationsStep({ formData, updateFormData }: StepProps) {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-semibold mb-2">Communication Settings</h2>
                <p className="text-muted-foreground">Configure automated messaging and notifications</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Mail className="h-5 w-5" />
                        Notification Channels
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                            <Label>Email Notifications</Label>
                            <p className="text-sm text-muted-foreground">Appointment reminders, updates</p>
                        </div>
                        <Switch
                            checked={formData.emailEnabled}
                            onCheckedChange={(checked) => updateFormData('emailEnabled', checked)}
                        />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                            <Label>SMS Notifications</Label>
                            <p className="text-sm text-muted-foreground">Text message reminders</p>
                        </div>
                        <Switch
                            checked={formData.smsEnabled}
                            onCheckedChange={(checked) => updateFormData('smsEnabled', checked)}
                        />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                            <Label>Appointment Reminders</Label>
                            <p className="text-sm text-muted-foreground">Automatic reminder 24hrs before</p>
                        </div>
                        <Switch
                            checked={formData.appointmentReminders}
                            onCheckedChange={(checked) => updateFormData('appointmentReminders', checked)}
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
