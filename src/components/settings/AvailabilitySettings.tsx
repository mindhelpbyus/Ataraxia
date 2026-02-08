import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { toast } from 'sonner';
import { SettingsSection } from './SettingsSection';
import { Clock, Laptop, User, Smartphone, Mail, Hourglass, Calendar as CalendarIcon, Plus, Trash2 } from "lucide-react";
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { WeeklySchedule, SESSION_DURATIONS } from '@/types/onboarding';
import { TIMEZONES } from '../../utils/timezones';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
const DAY_LABELS: Record<string, string> = {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday',
};

interface AvailabilitySettingsProps {
    userId: string;
}

export const AvailabilitySettings: React.FC<AvailabilitySettingsProps> = ({ userId }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [selectedDay, setSelectedDay] = useState<keyof WeeklySchedule>('monday');

    const [availabilityData, setAvailabilityData] = useState({
        video: false,
        inPerson: false,
        phone: false,
        messaging: false,
        sessionLengthsOffered: [] as number[],
        newClientsCapacity: 0,
        maxCaseloadCapacity: 0,
        clientIntakeSpeed: 'moderate' as 'slow' | 'moderate' | 'fast',
        emergencySameDayCapacity: false,
        weeklySchedule: {
            monday: [], tuesday: [], wednesday: [], thursday: [], friday: [], saturday: [], sunday: []
        } as WeeklySchedule,
        timezone: 'Asia/Kolkata',
        preferredSchedulingDensity: 'spread-out' as 'spread-out' | 'clustered',
    });

    const addTimeSlot = (day: keyof WeeklySchedule) => {
        setAvailabilityData(prev => ({
            ...prev,
            weeklySchedule: {
                ...prev.weeklySchedule,
                [day]: [...prev.weeklySchedule[day], { id: `${String(day)}-${Date.now()}`, startTime: '09:00', endTime: '17:00' }]
            }
        }));
    };

    const removeTimeSlot = (day: keyof WeeklySchedule, slotId: string) => {
        setAvailabilityData(prev => ({
            ...prev,
            weeklySchedule: {
                ...prev.weeklySchedule,
                [day]: prev.weeklySchedule[day].filter(slot => slot.id !== slotId)
            }
        }));
    };

    const updateTimeSlot = (day: keyof WeeklySchedule, slotId: string, field: 'startTime' | 'endTime', value: string) => {
        setAvailabilityData(prev => {
            const newSchedule = { ...prev.weeklySchedule };
            const slotIndex = newSchedule[day].findIndex(slot => slot.id === slotId);
            if (slotIndex !== -1) {
                newSchedule[day] = [...newSchedule[day]]; // Copy array
                newSchedule[day][slotIndex] = { ...newSchedule[day][slotIndex], [field]: value };
            }
            return { ...prev, weeklySchedule: newSchedule };
        });
    };

    const toggleSessionLength = (length: number) => {
        setAvailabilityData(prev => ({
            ...prev,
            sessionLengthsOffered: prev.sessionLengthsOffered.includes(length)
                ? prev.sessionLengthsOffered.filter(l => l !== length)
                : [...prev.sessionLengthsOffered, length]
        }));
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 800));

            const { video, inPerson, phone, messaging, sessionLengthsOffered, weeklySchedule } = availabilityData;
            const hasFormat = video || inPerson || phone || messaging;
            const hasLength = sessionLengthsOffered.length > 0;
            const hasSchedule = Object.values(weeklySchedule).some((daySlots: any) => daySlots.length > 0);

            let isComplete = false;
            if (hasFormat && hasLength && hasSchedule) {
                isComplete = true;
            } else {
                toast.warning('Please select at least one session format, length, and add availability slots.');
            }

            const completionKey = `profileCompletionStatus_${userId}`;
            const currentStatus = JSON.parse(localStorage.getItem(completionKey) || '{}');
            currentStatus['availability'] = isComplete ? 'completed' : 'pending';
            localStorage.setItem(completionKey, JSON.stringify(currentStatus));
            window.dispatchEvent(new Event('profile-updated'));

            if (isComplete) {
                toast.success(`Availability settings saved!`);
            } else {
                toast.info('Changes saved, but section is still incomplete.');
            }
        } catch (error) {
            console.error('Save error:', error);
            toast.error('Failed to save changes');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <SettingsSection>
                <div className="space-y-8">

                    {/* SECTION G: SESSION FORMAT */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-orange-600" />
                            <h3 className="text-lg font-medium">Session Formats <span className="text-red-500">*</span></h3>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { id: 'video', label: 'Video', icon: Laptop },
                                { id: 'inPerson', label: 'In-Person', icon: User },
                                { id: 'phone', label: 'Phone', icon: Smartphone },
                                { id: 'messaging', label: 'Messaging', icon: Mail }
                            ].map((format) => (
                                <div
                                    key={format.id}
                                    className={`p-4 border-2 rounded-lg cursor-pointer ${availabilityData[format.id as keyof typeof availabilityData] ? 'border-orange-500 bg-orange-50' : 'border-border/50 bg-card'}`}
                                    onClick={() => setAvailabilityData(prev => ({ ...prev, [format.id]: !prev[format.id as keyof typeof availabilityData] }))}
                                >
                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            checked={!!availabilityData[format.id as keyof typeof availabilityData]}
                                            onCheckedChange={(c) => setAvailabilityData(prev => ({ ...prev, [format.id]: c }))}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                        <Label className="cursor-pointer font-medium">{format.label}</Label>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Hourglass className="w-5 h-5 text-orange-600" />
                                <h3 className="text-lg font-medium">Session Length <span className="text-red-500">*</span></h3>
                            </div>
                            <div className="grid grid-cols-4 gap-3">
                                {SESSION_DURATIONS.map((duration) => (
                                    <div
                                        key={duration}
                                        className={`p-4 border-2 rounded-lg cursor-pointer flex flex-row items-center justify-center gap-3 ${availabilityData.sessionLengthsOffered.includes(duration)
                                            ? 'border-orange-500 bg-orange-50'
                                            : 'border-border/50 bg-card'
                                            }`}
                                        onClick={() => toggleSessionLength(duration)}
                                    >
                                        <Checkbox
                                            checked={availabilityData.sessionLengthsOffered.includes(duration)}
                                            onCheckedChange={() => toggleSessionLength(duration)}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                        <div className="font-medium">{duration} min</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label>New Clients Capacity (per month)</Label>
                                <Input
                                    type="number"
                                    min="1"
                                    max="100"
                                    value={availabilityData.newClientsCapacity || ''}
                                    onChange={(e) => setAvailabilityData(prev => ({ ...prev, newClientsCapacity: parseInt(e.target.value) || 0 }))}
                                    className="h-10"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Max Total Caseload</Label>
                                <Input
                                    type="number"
                                    min="1"
                                    max="200"
                                    value={availabilityData.maxCaseloadCapacity || ''}
                                    onChange={(e) => setAvailabilityData(prev => ({ ...prev, maxCaseloadCapacity: parseInt(e.target.value) || 0 }))}
                                    className="h-10"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 border border-border/50 rounded-lg bg-card">
                            <Checkbox
                                id="emergency"
                                checked={availabilityData.emergencySameDayCapacity}
                                onCheckedChange={(checked) => setAvailabilityData(prev => ({ ...prev, emergencySameDayCapacity: checked as boolean }))}
                            />
                            <div>
                                <Label htmlFor="emergency" className="cursor-pointer font-medium">Emergency Same-Day Capacity</Label>
                                <p className="text-sm text-muted-foreground">I can occasionally accommodate urgent same-day sessions</p>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* SECTION H: WEEKLY SCHEDULE */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2">
                            <CalendarIcon className="w-5 h-5 text-orange-600" />
                            <h3 className="text-lg font-medium">Weekly Schedule <span className="text-red-500">*</span></h3>
                        </div>

                        <div className="space-y-2">
                            <Label>Your Timezone</Label>
                            <Select
                                value={availabilityData.timezone}
                                onValueChange={(value) => setAvailabilityData(prev => ({ ...prev, timezone: value }))}
                            >
                                <SelectTrigger className="h-10">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {TIMEZONES.map((tz) => (
                                        <SelectItem key={tz.value} value={tz.value}>{tz.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex flex-wrap gap-2 pt-2">
                            {DAYS.map((day) => (
                                <Badge
                                    key={day}
                                    variant={selectedDay === day ? 'default' : 'outline'}
                                    className={`cursor-pointer px-4 py-2 h-9 text-sm font-medium transition-all ${selectedDay === day ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-background hover:bg-muted'
                                        } ${availabilityData.weeklySchedule[day as keyof WeeklySchedule].length > 0 ? 'border-green-500 text-green-700' : ''
                                        }`}
                                    onClick={() => setSelectedDay(day)}
                                >
                                    {DAY_LABELS[day as keyof typeof DAY_LABELS]}
                                    {availabilityData.weeklySchedule[day as keyof WeeklySchedule].length > 0 && (
                                        <span className="ml-2 bg-green-100 text-green-800 rounded-full px-1.5 py-0.5 text-[10px]">
                                            {availabilityData.weeklySchedule[day as keyof WeeklySchedule].length}
                                        </span>
                                    )}
                                </Badge>
                            ))}
                        </div>

                        <div className="bg-card border border-border/50 rounded-xl p-6 space-y-4">
                            <div className="flex justify-between items-center">
                                <Label className="text-base">{DAY_LABELS[selectedDay as keyof typeof DAY_LABELS]} Availability</Label>
                                <Button
                                    type="button"
                                    onClick={() => addTimeSlot(selectedDay)}
                                    variant="outline"
                                    size="sm"
                                    className="flex items-center gap-2 h-9"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Time Block
                                </Button>
                            </div>

                            {availabilityData.weeklySchedule[selectedDay as keyof WeeklySchedule].length === 0 ? (
                                <div className="text-center p-8 border-2 border-dashed border-border/50 rounded-lg text-muted-foreground flex flex-col items-center justify-center gap-2">
                                    <CalendarIcon className="w-8 h-8 text-muted-foreground/30" />
                                    <p>No availability set for {DAY_LABELS[selectedDay as keyof typeof DAY_LABELS]}.</p>
                                </div>
                            ) : (
                                <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                                    {availabilityData.weeklySchedule[selectedDay as keyof WeeklySchedule].map((slot) => (
                                        <div key={slot.id} className="flex items-center gap-3 p-3 border border-border/50 rounded-lg bg-background group hover:border-border transition-colors">
                                            <Input
                                                type="time"
                                                value={slot.startTime}
                                                onChange={(e) => updateTimeSlot(selectedDay, slot.id, 'startTime', e.target.value)}
                                                className="flex-1 h-10"
                                            />
                                            <span className="text-muted-foreground">to</span>
                                            <Input
                                                type="time"
                                                value={slot.endTime}
                                                onChange={(e) => updateTimeSlot(selectedDay, slot.id, 'endTime', e.target.value)}
                                                className="flex-1 h-10"
                                            />
                                            <Button
                                                type="button"
                                                onClick={() => removeTimeSlot(selectedDay, slot.id)}
                                                variant="ghost"
                                                size="icon"
                                                className="text-muted-foreground hover:text-red-600 hover:bg-red-50"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                    </div>
                </div>

                <div className="pt-8 mt-8 border-t flex justify-end">
                    <Button onClick={handleSave} disabled={isLoading} className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-8 h-10 shadow-sm transition-all rounded-full">
                        {isLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </SettingsSection>
        </div>
    );
};
