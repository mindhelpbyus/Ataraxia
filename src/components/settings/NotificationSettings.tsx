import React, { useState } from 'react';
import { Button } from '../ui/button';
import { toast } from 'sonner';
import { SettingsSection } from './SettingsSection';
import {
    Lock,
    Bell,
    Mail,
    Smartphone,
    MessageSquare,
    Calendar,
    DollarSign,
    AlertTriangle,
    Users,
    FileText,
    Clock,
    Moon,
    Volume2,
    VolumeX,
    Send,
    Info
} from "lucide-react";
import { CardContent } from '../ui/card';
import { Switch } from '../ui/switch';
import { NotificationChannelCard } from './NotificationChannelCard';
import { QuietHoursSettings } from './QuietHoursSettings';


interface NotificationSettingsProps {
    userId: string;
}

type NotificationType =
    | 'securityAlerts'
    | 'systemMaintenance'
    | 'appointmentReminders'
    | 'appointmentChanges'
    | 'newAppointments'
    | 'appointmentCancellations'
    | 'clientMessages'
    | 'billingReports'
    | 'paymentReceived'
    | 'documentRequests'
    | 'teamUpdates'
    | 'platformNews';

interface NotificationChannel {
    email: boolean;
    push: boolean;
    sms: boolean;
    inApp: boolean;
}

type NotificationPreferences = {
    [key in NotificationType]: NotificationChannel;
};

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({ userId }) => {
    const [isLoading, setIsLoading] = useState(false);


    // Master channel toggles
    const [masterChannels, setMasterChannels] = useState({
        email: true,
        push: true,
        sms: true,
        inApp: true,
    });

    // Quiet hours settings
    const [quietHours, setQuietHours] = useState({
        enabled: false,
        startTime: '22:00',
        endTime: '08:00',
        timezone: 'Asia/Kolkata',
    });

    // Digest settings
    const [digestSettings, setDigestSettings] = useState({
        dailyDigest: false,
        weeklyDigest: true,
        digestTime: '09:00',
    });

    // Individual notification preferences
    const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreferences>({
        // Security & System (Critical)
        securityAlerts: { email: true, push: true, sms: true, inApp: true },
        systemMaintenance: { email: true, push: true, sms: false, inApp: true },

        // Appointments
        appointmentReminders: { email: true, push: true, sms: true, inApp: true },
        appointmentChanges: { email: true, push: true, sms: true, inApp: true },
        newAppointments: { email: true, push: true, sms: false, inApp: true },
        appointmentCancellations: { email: true, push: true, sms: false, inApp: true },

        // Communication
        clientMessages: { email: true, push: true, sms: false, inApp: true },

        // Financial
        billingReports: { email: true, push: false, sms: false, inApp: false },
        paymentReceived: { email: true, push: true, sms: false, inApp: true },

        // Documents & Compliance
        documentRequests: { email: true, push: true, sms: false, inApp: true },

        // Updates
        teamUpdates: { email: false, push: false, sms: false, inApp: true },
        platformNews: { email: false, push: false, sms: false, inApp: false },
    });

    const updateNotificationChannel = (
        type: NotificationType,
        channel: keyof NotificationChannel,
        value: boolean
    ) => {
        setNotificationPrefs(prev => ({
            ...prev,
            [type]: {
                ...prev[type],
                [channel]: value,
            }
        }));
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 800));

            // Save to localStorage
            localStorage.setItem(`notificationPrefs_${userId}`, JSON.stringify(notificationPrefs));
            localStorage.setItem(`quietHours_${userId}`, JSON.stringify(quietHours));
            localStorage.setItem(`digestSettings_${userId}`, JSON.stringify(digestSettings));
            localStorage.setItem(`masterChannels_${userId}`, JSON.stringify(masterChannels));

            const completionKey = `profileCompletionStatus_${userId}`;
            const currentStatus = JSON.parse(localStorage.getItem(completionKey) || '{}');
            currentStatus['notifications'] = 'completed';
            localStorage.setItem(completionKey, JSON.stringify(currentStatus));
            window.dispatchEvent(new Event('profile-updated'));

            toast.success('Notification preferences saved successfully!', {
                description: 'Your changes have been applied.',
            });
        } catch (error) {
            console.error('Save error:', error);
            toast.error('Failed to save changes', {
                description: 'Please try again.',
            });
        } finally {
            setIsLoading(false);
        }
    };


    const handleResetToDefaults = () => {
        // Disable all master channels
        setMasterChannels({
            email: false,
            push: false,
            sms: false,
            inApp: false,
        });

        // Disable all individual preferences
        const disabledPrefs = Object.keys(notificationPrefs).reduce((acc, key) => {
            acc[key as NotificationType] = { email: false, push: false, sms: false, inApp: false };
            return acc;
        }, {} as NotificationPreferences);

        setNotificationPrefs(disabledPrefs);

        // Disable email digests
        setDigestSettings(prev => ({
            ...prev,
            dailyDigest: false,
            weeklyDigest: false,
        }));

        toast.info("All notifications have been turned off.");
    };

    const notificationCategories = [
        {
            title: 'Security & System',
            description: 'Critical alerts that cannot be fully disabled',
            icon: AlertTriangle,
            iconColor: 'text-red-500',
            items: [
                {
                    id: 'securityAlerts' as NotificationType,
                    title: 'Security Alerts',
                    description: 'Login attempts, password changes, and security events',
                    icon: Lock,
                    critical: true,
                    locked: false,
                },
                {
                    id: 'systemMaintenance' as NotificationType,
                    title: 'System Maintenance',
                    description: 'Scheduled downtime and platform updates',
                    icon: AlertTriangle,
                    critical: true,
                    locked: false,
                },
            ],
        },
        {
            title: 'Appointments & Scheduling',
            description: 'Stay informed about your calendar',
            icon: Calendar,
            iconColor: 'text-blue-500',
            items: [
                {
                    id: 'appointmentReminders' as NotificationType,
                    title: 'Appointment Reminders',
                    description: '24h, 1h, and 15min reminders before sessions',
                    icon: Clock,
                    critical: false,
                    locked: false,
                },
                {
                    id: 'appointmentChanges' as NotificationType,
                    title: 'Appointment Changes',
                    description: 'Reschedules and time modifications by clients',
                    icon: Calendar,
                    critical: false,
                    locked: false,
                },
                {
                    id: 'newAppointments' as NotificationType,
                    title: 'New Bookings',
                    description: 'When clients book new sessions with you',
                    icon: Calendar,
                    critical: false,
                    locked: false,
                },
                {
                    id: 'appointmentCancellations' as NotificationType,
                    title: 'Cancellations',
                    description: 'When clients cancel scheduled appointments',
                    icon: Calendar,
                    critical: false,
                    locked: false,
                },
            ],
        },
        {
            title: 'Messages & Communication',
            description: 'Client and team messages',
            icon: MessageSquare,
            iconColor: 'text-green-500',
            items: [
                {
                    id: 'clientMessages' as NotificationType,
                    title: 'Client Messages',
                    description: 'Direct messages from your clients',
                    icon: MessageSquare,
                    critical: false,
                    locked: false,
                },
                {
                    id: 'teamUpdates' as NotificationType,
                    title: 'Team Updates',
                    description: 'Messages from your care team and administrators',
                    icon: Users,
                    critical: false,
                    locked: false,
                },
            ],
        },
        {
            title: 'Financial & Billing',
            description: 'Payments and revenue updates',
            icon: DollarSign,
            iconColor: 'text-emerald-500',
            items: [
                {
                    id: 'billingReports' as NotificationType,
                    title: 'Billing Reports',
                    description: 'Monthly invoices, revenue summaries, and statements',
                    icon: FileText,
                    critical: false,
                    locked: false,
                },
                {
                    id: 'paymentReceived' as NotificationType,
                    title: 'Payment Confirmations',
                    description: 'When clients complete payments',
                    icon: DollarSign,
                    critical: false,
                    locked: false,
                },
            ],
        },
        {
            title: 'Documents & Compliance',
            description: 'Forms, consents, and document requests',
            icon: FileText,
            iconColor: 'text-purple-500',
            items: [
                {
                    id: 'documentRequests' as NotificationType,
                    title: 'Document Requests',
                    description: 'When clients need to sign forms or upload documents',
                    icon: FileText,
                    critical: false,
                    locked: false,
                },
            ],
        },
        {
            title: 'Platform Updates',
            description: 'News and feature announcements',
            icon: Bell,
            iconColor: 'text-gray-500',
            items: [
                {
                    id: 'platformNews' as NotificationType,
                    title: 'Product Updates',
                    description: 'New features, improvements, and announcements',
                    icon: Bell,
                    critical: false,
                    locked: false,
                },
            ],
        },
    ];

    return (
        <div className="max-w-5xl pl-6 pb-20 pt-0">
            {/* Header with Stats */}
            <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                <div className="flex items-start justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-1">Notification Preferences</h2>
                        <p className="text-sm text-gray-600 mb-4">
                            Control how and when you receive updates across all channels
                        </p>
                        <div className="flex items-center gap-6 text-sm">
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${masterChannels.email ? 'bg-green-500' : 'bg-red-500'}`} />
                                <span className="text-gray-700">Email</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${masterChannels.push ? 'bg-green-500' : 'bg-red-500'}`} />
                                <span className="text-gray-700">Push</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${masterChannels.sms ? 'bg-green-500' : 'bg-red-500'}`} />
                                <span className="text-gray-700">SMS</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${masterChannels.inApp ? 'bg-green-500' : 'bg-red-500'}`} />
                                <span className="text-gray-700">In-App</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Master Channel Controls */}
            <SettingsSection
                title="Notification Channels"
                description="Enable or disable entire notification channels. Individual preferences below will respect these settings."
            >
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <NotificationChannelCard
                            icon={Mail}
                            title="Email Notifications"
                            description="Sent to your registered email address"
                            enabled={masterChannels.email}
                            onToggle={(checked) => setMasterChannels(prev => ({ ...prev, email: checked }))}
                            color="blue"
                        />
                        <NotificationChannelCard
                            icon={Smartphone}
                            title="Push Notifications"
                            description="Mobile and desktop push alerts"
                            enabled={masterChannels.push}
                            onToggle={(checked) => setMasterChannels(prev => ({ ...prev, push: checked }))}
                            color="green"
                        />
                        <NotificationChannelCard
                            icon={MessageSquare}
                            title="SMS Notifications"
                            description="Text messages to your phone"
                            enabled={masterChannels.sms}
                            onToggle={(checked) => setMasterChannels(prev => ({ ...prev, sms: checked }))}
                            color="purple"
                        />
                        <NotificationChannelCard
                            icon={Bell}
                            title="In-App Notifications"
                            description="Alerts within the platform"
                            enabled={masterChannels.inApp}
                            onToggle={(checked) => setMasterChannels(prev => ({ ...prev, inApp: checked }))}
                            color="orange"
                        />
                    </div>
                </CardContent>
            </SettingsSection>

            {/* Quiet Hours */}
            <QuietHoursSettings
                quietHours={quietHours}
                onChange={setQuietHours}
            />

            {/* Digest Settings */}
            <SettingsSection
                title="Email Digest"
                description="Receive bundled updates instead of individual emails"
            >
                <CardContent className="p-6 space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                        <div className="space-y-1">
                            <div className="font-medium text-gray-900">Daily Digest</div>
                            <p className="text-sm text-gray-500">Receive one email per day with all updates</p>
                        </div>
                        <Switch
                            checked={digestSettings.dailyDigest}
                            onCheckedChange={(checked) => setDigestSettings(prev => ({ ...prev, dailyDigest: checked }))}
                        />
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                        <div className="space-y-1">
                            <div className="font-medium text-gray-900">Weekly Summary</div>
                            <p className="text-sm text-gray-500">Weekly recap every Monday morning</p>
                        </div>
                        <Switch
                            checked={digestSettings.weeklyDigest}
                            onCheckedChange={(checked) => setDigestSettings(prev => ({ ...prev, weeklyDigest: checked }))}
                        />
                    </div>
                    {(digestSettings.dailyDigest || digestSettings.weeklyDigest) && (
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                                Preferred Delivery Time
                            </label>
                            <input
                                type="time"
                                value={digestSettings.digestTime}
                                onChange={(e) => setDigestSettings(prev => ({ ...prev, digestTime: e.target.value }))}
                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            />
                        </div>
                    )}
                </CardContent>
            </SettingsSection>

            {/* Individual Notification Preferences */}
            {
                notificationCategories.map((category, categoryIndex) => (
                    <SettingsSection
                        key={categoryIndex}
                        title={category.title}
                        description={category.description}
                    >
                        <CardContent className="p-0">
                            <div className="divide-y divide-gray-100">
                                {category.items.map((item, itemIndex) => {
                                    const prefs = notificationPrefs[item.id];
                                    const Icon = item.icon;

                                    return (
                                        <div
                                            key={itemIndex}
                                            className="p-6 hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className={`p-2 rounded-lg ${item.critical ? 'bg-red-50' : 'bg-gray-50'
                                                    }`}>
                                                    <Icon className={`w-5 h-5 ${item.critical ? 'text-red-600' : category.iconColor
                                                        }`} />
                                                </div>

                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className="font-medium text-gray-900">{item.title}</h4>
                                                        {item.critical && (
                                                            <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded">
                                                                Critical
                                                            </span>
                                                        )}
                                                        {item.locked && <Lock className="w-3.5 h-3.5 text-gray-400" />}
                                                    </div>
                                                    <p className="text-sm text-gray-500 mb-4">{item.description}</p>

                                                    {/* Channel Toggles */}
                                                    <div className="flex flex-wrap gap-3">
                                                        <div className="flex items-center gap-2 group">
                                                            <Switch
                                                                key={`email-${item.id}-${prefs.email}`}
                                                                checked={prefs.email}
                                                                onCheckedChange={(checked) => updateNotificationChannel(item.id, 'email', checked)}
                                                                disabled={item.locked || !masterChannels.email}
                                                            />
                                                            <Mail className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                                                            <span className="text-sm text-gray-600">Email</span>
                                                        </div>

                                                        <div className="flex items-center gap-2 group">
                                                            <Switch
                                                                key={`push-${item.id}-${prefs.push}`}
                                                                checked={prefs.push}
                                                                onCheckedChange={(checked) => updateNotificationChannel(item.id, 'push', checked)}
                                                                disabled={item.locked || !masterChannels.push}
                                                            />
                                                            <Smartphone className="w-4 h-4 text-gray-400 group-hover:text-green-500 transition-colors" />
                                                            <span className="text-sm text-gray-600">Push</span>
                                                        </div>

                                                        <div className="flex items-center gap-2 group">
                                                            <Switch
                                                                key={`sms-${item.id}-${prefs.sms}`}
                                                                checked={prefs.sms}
                                                                onCheckedChange={(checked) => updateNotificationChannel(item.id, 'sms', checked)}
                                                                disabled={item.critical ? item.locked : !masterChannels.sms}
                                                            />
                                                            <MessageSquare className="w-4 h-4 text-gray-400 group-hover:text-purple-500 transition-colors" />
                                                            <span className="text-sm text-gray-600">SMS</span>
                                                        </div>

                                                        <div className="flex items-center gap-2 group">
                                                            <Switch
                                                                key={`inApp-${item.id}-${prefs.inApp}`}
                                                                checked={prefs.inApp}
                                                                onCheckedChange={(checked) => updateNotificationChannel(item.id, 'inApp', checked)}
                                                                disabled={item.locked || !masterChannels.inApp}
                                                            />
                                                            <Bell className="w-4 h-4 text-gray-400 group-hover:text-orange-500 transition-colors" />
                                                            <span className="text-sm text-gray-600">In-App</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </SettingsSection>
                ))
            }

            {/* Action Buttons */}
            <div className="pt-6 flex items-center justify-between sticky bottom-0 bg-white py-4 border-t border-gray-200 mt-8">
                <div className="flex gap-3 ml-auto">
                    <Button
                        variant="outline"
                        onClick={handleResetToDefaults}
                    >
                        Reset to Defaults
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={isLoading}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-8 h-10 shadow-sm transition-all"
                    >
                        {isLoading ? 'Saving...' : 'Save Preferences'}
                    </Button>
                </div>
            </div>
        </div >
    );
};
