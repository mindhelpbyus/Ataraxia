import React from 'react';
import { SettingsSection } from './SettingsSection';
import { CardContent } from '../ui/card';
import { Switch } from '../ui/switch';
import { Moon, Sun } from 'lucide-react';

interface QuietHoursProps {
    quietHours: {
        enabled: boolean;
        startTime: string;
        endTime: string;
        timezone: string;
    };
    onChange: (settings: QuietHoursProps['quietHours']) => void;
}

export const QuietHoursSettings: React.FC<QuietHoursProps> = ({ quietHours, onChange }) => {
    return (
        <SettingsSection
            title="Quiet Hours"
            description="Pause non-critical notifications during specific hours. Security alerts will still come through."
        >
            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 rounded-lg">
                            <Moon className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                            <div className="font-medium text-gray-900">Enable Quiet Hours</div>
                            <p className="text-sm text-gray-500">Mute notifications during sleep hours</p>
                        </div>
                    </div>
                    <Switch
                        checked={quietHours.enabled}
                        onCheckedChange={(checked) => onChange({ ...quietHours, enabled: checked })}
                    />
                </div>

                {quietHours.enabled && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                    <Moon className="w-4 h-4 text-gray-400" />
                                    Start Time
                                </label>
                                <input
                                    type="time"
                                    value={quietHours.startTime}
                                    onChange={(e) => onChange({ ...quietHours, startTime: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                    <Sun className="w-4 h-4 text-gray-400" />
                                    End Time
                                </label>
                                <input
                                    type="time"
                                    value={quietHours.endTime}
                                    onChange={(e) => onChange({ ...quietHours, endTime: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                                Timezone
                            </label>
                            <select
                                value={quietHours.timezone}
                                onChange={(e) => onChange({ ...quietHours, timezone: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                            >
                                <option value="Asia/Kolkata">India (IST)</option>
                                <option value="America/New_York">New York (EST)</option>
                                <option value="America/Los_Angeles">Los Angeles (PST)</option>
                                <option value="Europe/London">London (GMT)</option>
                                <option value="Asia/Tokyo">Tokyo (JST)</option>
                                <option value="Australia/Sydney">Sydney (AEST)</option>
                            </select>
                        </div>

                        <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                            <p className="text-sm text-indigo-900">
                                <strong>Active:</strong> Quiet hours from {quietHours.startTime} to {quietHours.endTime}
                            </p>
                            <p className="text-xs text-indigo-700 mt-1">
                                Critical security alerts will bypass quiet hours
                            </p>
                        </div>
                    </div>
                )}
            </CardContent>
        </SettingsSection>
    );
};
