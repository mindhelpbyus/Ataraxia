import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { toast } from 'sonner';
import { SettingsSection } from './SettingsSection';
import { Lock } from "lucide-react";
import { CardContent } from '../ui/card';

interface NotificationSettingsProps {
    userId: string;
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({ userId }) => {
    const [isLoading, setIsLoading] = useState(false);

    const [notificationSettings, setNotificationSettings] = useState({
        securityAlerts: true,
        systemMaintenance: true,
        appointmentReminders: true,
        clientMessages: true,
        billingReports: false,
    });

    const handleSave = async () => {
        setIsLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 800));

            const completionKey = `profileCompletionStatus_${userId}`;
            const currentStatus = JSON.parse(localStorage.getItem(completionKey) || '{}');
            currentStatus['notifications'] = 'completed';
            localStorage.setItem(completionKey, JSON.stringify(currentStatus));
            window.dispatchEvent(new Event('profile-updated'));

            toast.success(`Notification preferences saved!`);
        } catch (error) {
            console.error('Save error:', error);
            toast.error('Failed to save changes');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <div className="mb-10 pt-2">
                <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">Notifications</h1>
                <p className="text-muted-foreground text-lg">Control when and how you receive updates.</p>
            </div>

            <SettingsSection title="System Alerts" description="Critical updates regarding security and system health. system alerts can not be fully disabled.">
                <CardContent className="p-0 divide-y divide-border/50">
                    {[
                        { id: 'securityAlerts', title: 'Security Alerts', desc: 'Unusual login attempts and password changes', locked: true },
                        { id: 'systemMaintenance', title: 'System Maintenance', desc: 'Planned downtime and platform updates', locked: false },
                    ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-6 hover:bg-muted/20 transition-colors">
                            <div className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                    <div className="font-medium text-foreground text-base">{item.title}</div>
                                    {item.locked && <Lock className="w-3 h-3 text-muted-foreground" />}
                                </div>
                                <p className="text-sm text-muted-foreground max-w-sm">{item.desc}</p>
                            </div>
                            <Checkbox
                                id={`checkbox-${item.id}`}
                                checked={notificationSettings[item.id as keyof typeof notificationSettings]}
                                onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, [item.id]: checked as boolean }))}
                                disabled={item.locked}
                            />
                        </div>
                    ))}
                </CardContent>
            </SettingsSection>

            <SettingsSection title="Email Notifications" description="Sent to your registered email address.">
                <CardContent className="p-0 divide-y divide-border/50">
                    {[
                        { id: 'appointmentReminders', title: 'Appointment Reminders', desc: 'Daily summary of upcoming sessions' },
                        { id: 'clientMessages', title: 'Client Messages', desc: 'When clients send you a message' },
                        { id: 'billingReports', title: 'Billing Reports', desc: 'Monthly invoices and revenue summaries' },
                    ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-6 hover:bg-muted/20 transition-colors">
                            <div className="space-y-0.5">
                                <div className="font-medium text-foreground text-base">{item.title}</div>
                                <p className="text-sm text-muted-foreground max-w-sm">{item.desc}</p>
                            </div>
                            <Checkbox
                                id={`checkbox-${item.id}`}
                                checked={notificationSettings[item.id as keyof typeof notificationSettings]}
                                onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, [item.id]: checked as boolean }))}
                            />
                        </div>
                    ))}
                </CardContent>
            </SettingsSection>

            <div className="pt-8 mt-8 border-t flex justify-end">
                <Button onClick={handleSave} disabled={isLoading} className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-8 h-10 shadow-sm transition-all rounded-full">
                    {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>
        </div>
    );
};
