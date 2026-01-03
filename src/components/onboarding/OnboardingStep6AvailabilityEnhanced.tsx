import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Badge } from '../ui/badge';
import { ArrowLeft, Calendar, Clock, Plus, Trash2 } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';
import { WeeklySchedule, TimeSlot, SessionType, SESSION_DURATIONS } from '../../types/onboarding';

interface OnboardingStep6Props {
  data: {
    // Section G - Session Format & Capacity
    video: boolean;
    inPerson: boolean;
    phone: boolean;
    messaging: boolean;
    newClientsCapacity: number;
    maxCaseloadCapacity: number;
    clientIntakeSpeed: 'slow' | 'moderate' | 'fast';
    sessionLengthsOffered: number[];
    emergencySameDayCapacity: boolean;

    // Section H - Availability
    weeklySchedule: WeeklySchedule;
    timezone: string;
    hoursPerDay: number;
    daysAvailable: string[];
    preferredSchedulingDensity: 'spread-out' | 'clustered';

    // Legacy fields
    sessionDurations: number[];
    breakTimeBetweenSessions: number;
    sessionTypes: SessionType[];
    supportedLanguages: string[];
  };
  spokenLanguages?: string[];
  onUpdate: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

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

const TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Phoenix',
  'America/Los_Angeles',
  'America/Anchorage',
  'Pacific/Honolulu',
  'Europe/London',
  'Europe/Paris',
  'Asia/Kolkata',
  'Asia/Tokyo'
];

export function OnboardingStep6AvailabilityEnhanced({ data, spokenLanguages, onUpdate, onNext, onBack }: OnboardingStep6Props) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedDay, setSelectedDay] = useState<keyof WeeklySchedule>('monday');

  const addTimeSlot = (day: keyof WeeklySchedule) => {
    const newSchedule = { ...data.weeklySchedule };
    newSchedule[day] = [
      ...newSchedule[day],
      {
        id: `${day}-${Date.now()}`,
        startTime: '09:00',
        endTime: '17:00',
      },
    ];
    onUpdate({ weeklySchedule: newSchedule });
  };

  const removeTimeSlot = (day: keyof WeeklySchedule, slotId: string) => {
    const newSchedule = { ...data.weeklySchedule };
    newSchedule[day] = newSchedule[day].filter((slot) => slot.id !== slotId);
    onUpdate({ weeklySchedule: newSchedule });
  };

  const updateTimeSlot = (
    day: keyof WeeklySchedule,
    slotId: string,
    field: 'startTime' | 'endTime',
    value: string
  ) => {
    const newSchedule = { ...data.weeklySchedule };
    const slotIndex = newSchedule[day].findIndex((slot) => slot.id === slotId);
    if (slotIndex !== -1) {
      newSchedule[day][slotIndex][field] = value;
      onUpdate({ weeklySchedule: newSchedule });
    }
  };

  const toggleSessionLength = (length: number) => {
    const newLengths = data.sessionLengthsOffered.includes(length)
      ? data.sessionLengthsOffered.filter((l) => l !== length)
      : [...data.sessionLengthsOffered, length];
    onUpdate({
      sessionLengthsOffered: newLengths,
      sessionDurations: newLengths // Keep legacy field in sync
    });
  };

  const handleFormatChange = (format: string, checked: boolean) => {
    onUpdate({ [format]: checked });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // At least one session format
    if (!data.video && !data.inPerson && !data.phone && !data.messaging) {
      newErrors.format = 'Select at least one session format';
    }

    // At least one session length
    if (data.sessionLengthsOffered.length === 0) {
      newErrors.sessionLength = 'Select at least one session length';
    }

    // Capacity validation
    if (data.newClientsCapacity <= 0) {
      newErrors.newClients = 'New clients capacity must be greater than 0';
    }
    if (data.maxCaseloadCapacity <= 0) {
      newErrors.maxCaseload = 'Max caseload capacity must be greater than 0';
    }
    if (data.newClientsCapacity > data.maxCaseloadCapacity) {
      newErrors.newClients = 'New clients capacity cannot exceed max caseload';
    }

    // At least one day with availability
    const hasSchedule = DAYS.some(day => data.weeklySchedule[day].length > 0);
    if (!hasSchedule) {
      newErrors.schedule = 'Please add availability for at least one day';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNext = () => {
    if (isSubmitting) return;

    if (validateForm()) {
      setIsSubmitting(true);
      onNext();
    }
  };

  const totalHoursScheduled = DAYS.reduce((total, day) => {
    return total + data.weeklySchedule[day].reduce((dayTotal, slot) => {
      const start = new Date(`1970-01-01T${slot.startTime}`);
      const end = new Date(`1970-01-01T${slot.endTime}`);
      return dayTotal + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    }, 0);
  }, 0);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Card className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-orange-100 rounded-full">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h2 className="text-2xl">Availability & Session Preferences</h2>
              <p className="text-gray-600 mt-1">
                Set your schedule and session preferences
              </p>
            </div>
          </div>

          {totalHoursScheduled > 0 && (
            <Alert className="bg-green-50 border-green-200">
              <AlertDescription className="text-green-800">
                ✓ Total weekly hours: {totalHoursScheduled.toFixed(1)} hours
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Error Messages */}
        {Object.keys(errors).length > 0 && (
          <Alert className="mb-6 bg-red-50 border-red-200">
            <AlertDescription className="text-red-800">
              <ul className="list-disc list-inside space-y-1">
                {Object.values(errors).map((error, idx) => (
                  <li key={idx}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-8">
          {/* SECTION G: SESSION FORMAT & CAPACITY */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-600" />
              <h3 className="text-lg font-medium">Session Formats</h3>
            </div>

            {/* Session Formats (AI Match Required) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className={`p-4 border-2 rounded-lg cursor-pointer ${data.video ? 'border-orange-500 bg-orange-50' : 'border-gray-200'}`}
                onClick={() => handleFormatChange('video', !data.video)}>
                <div className="flex items-center gap-2">
                  <Checkbox checked={data.video} onCheckedChange={(c) => handleFormatChange('video', c as boolean)} />
                  <Label className="cursor-pointer">Video</Label>
                </div>
              </div>

              <div className={`p-4 border-2 rounded-lg cursor-pointer ${data.inPerson ? 'border-orange-500 bg-orange-50' : 'border-gray-200'}`}
                onClick={() => handleFormatChange('inPerson', !data.inPerson)}>
                <div className="flex items-center gap-2">
                  <Checkbox checked={data.inPerson} onCheckedChange={(c) => handleFormatChange('inPerson', c as boolean)} />
                  <Label className="cursor-pointer">In-Person</Label>
                </div>
              </div>

              <div className={`p-4 border-2 rounded-lg cursor-pointer ${data.phone ? 'border-orange-500 bg-orange-50' : 'border-gray-200'}`}
                onClick={() => handleFormatChange('phone', !data.phone)}>
                <div className="flex items-center gap-2">
                  <Checkbox checked={data.phone} onCheckedChange={(c) => handleFormatChange('phone', c as boolean)} />
                  <Label className="cursor-pointer">Phone</Label>
                </div>
              </div>

              <div className={`p-4 border-2 rounded-lg cursor-pointer ${data.messaging ? 'border-orange-500 bg-orange-50' : 'border-gray-200'}`}
                onClick={() => handleFormatChange('messaging', !data.messaging)}>
                <div className="flex items-center gap-2">
                  <Checkbox checked={data.messaging} onCheckedChange={(c) => handleFormatChange('messaging', c as boolean)} />
                  <Label className="cursor-pointer">Messaging</Label>
                </div>
              </div>
            </div>

            {/* Session Lengths */}
            <div className="space-y-3">
              <Label>Session Lengths Offered <span className="text-red-500">*</span></Label>
              <div className="grid grid-cols-4 gap-3">
                {SESSION_DURATIONS.map((duration) => (
                  <div
                    key={duration}
                    className={`p-4 border-2 rounded-lg cursor-pointer text-center ${data.sessionLengthsOffered.includes(duration)
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200'
                      }`}
                    onClick={() => toggleSessionLength(duration)}
                  >
                    <Checkbox
                      checked={data.sessionLengthsOffered.includes(duration)}
                      className="mb-2"
                    />
                    <div className="font-medium">{duration} min</div>
                  </div>
                ))}
              </div>
              {errors.sessionLength && <p className="text-sm text-red-600">{errors.sessionLength}</p>}
            </div>

            {/* Capacity */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>New Clients Capacity (per month) <span className="text-red-500">*</span></Label>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={data.newClientsCapacity || ''}
                  onChange={(e) => onUpdate({ newClientsCapacity: parseInt(e.target.value) || 0 })}
                  className={errors.newClients ? 'border-red-500' : ''}
                />
                {errors.newClients && <p className="text-sm text-red-600">{errors.newClients}</p>}
              </div>

              <div className="space-y-2">
                <Label>Max Total Caseload <span className="text-red-500">*</span></Label>
                <Input
                  type="number"
                  min="1"
                  max="200"
                  value={data.maxCaseloadCapacity || ''}
                  onChange={(e) => onUpdate({ maxCaseloadCapacity: parseInt(e.target.value) || 0 })}
                  className={errors.maxCaseload ? 'border-red-500' : ''}
                />
                {errors.maxCaseload && <p className="text-sm text-red-600">{errors.maxCaseload}</p>}
              </div>
            </div>

            {/* Client Intake Speed */}
            <div className="space-y-2">
              <Label>Preferred Client Intake Speed</Label>
              <Select
                value={data.clientIntakeSpeed}
                onValueChange={(value: 'slow' | 'moderate' | 'fast') => onUpdate({ clientIntakeSpeed: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="slow">Slow - Gradual client growth</SelectItem>
                  <SelectItem value="moderate">Moderate - Steady intake</SelectItem>
                  <SelectItem value="fast">Fast - Fill schedule quickly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Emergency Same-Day Capacity */}
            <div className="flex items-center gap-3 p-4 border-2 rounded-lg">
              <Checkbox
                id="emergency"
                checked={data.emergencySameDayCapacity}
                onCheckedChange={(checked) => onUpdate({ emergencySameDayCapacity: checked as boolean })}
              />
              <div>
                <Label htmlFor="emergency" className="cursor-pointer">Emergency Same-Day Capacity</Label>
                <p className="text-sm text-gray-600">I can occasionally accommodate urgent same-day sessions</p>
              </div>
            </div>
          </div>

          {/* SECTION H: WEEKLY SCHEDULE */}
          <div className="space-y-6 pt-6 border-t">
            <h3 className="text-lg font-medium">Weekly Schedule</h3>

            {/* Timezone */}
            <div className="space-y-2">
              <Label>Your Timezone <span className="text-red-500">*</span></Label>
              <Select
                value={data.timezone}
                onValueChange={(value) => onUpdate({ timezone: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map((tz) => (
                    <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Scheduling Density Preference */}
            <div className="space-y-2">
              <Label>Scheduling Preference</Label>
              <Select
                value={data.preferredSchedulingDensity}
                onValueChange={(value: 'spread-out' | 'clustered') => onUpdate({ preferredSchedulingDensity: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="spread-out">Spread Out - Distribute sessions evenly</SelectItem>
                  <SelectItem value="clustered">Clustered - Group sessions together</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Day Selector */}
            <div className="flex flex-wrap gap-2">
              {DAYS.map((day) => (
                <Badge
                  key={day}
                  variant={selectedDay === day ? 'default' : 'outline'}
                  className={`cursor-pointer px-4 py-2 ${selectedDay === day ? 'bg-orange-500 text-white' : ''
                    } ${data.weeklySchedule[day].length > 0 ? 'border-green-500' : ''
                    }`}
                  onClick={() => setSelectedDay(day)}
                >
                  {DAY_LABELS[day]}
                  {data.weeklySchedule[day].length > 0 && (
                    <span className="ml-2 text-xs">({data.weeklySchedule[day].length})</span>
                  )}
                </Badge>
              ))}
            </div>

            {/* Time Slots for Selected Day */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label>{DAY_LABELS[selectedDay]} Availability</Label>
                <Button
                  type="button"
                  onClick={() => addTimeSlot(selectedDay)}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Time Block
                </Button>
              </div>

              {data.weeklySchedule[selectedDay].length === 0 ? (
                <div className="text-center p-8 border-2 border-dashed rounded-lg text-gray-500">
                  No availability set for {DAY_LABELS[selectedDay]}. Click "Add Time Block" to add hours.
                </div>
              ) : (
                <div className="space-y-3">
                  {data.weeklySchedule[selectedDay].map((slot) => (
                    <div key={slot.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <Input
                        type="time"
                        value={slot.startTime}
                        onChange={(e) => updateTimeSlot(selectedDay, slot.id, 'startTime', e.target.value)}
                        className="flex-1"
                      />
                      <span className="text-gray-500">to</span>
                      <Input
                        type="time"
                        value={slot.endTime}
                        onChange={(e) => updateTimeSlot(selectedDay, slot.id, 'endTime', e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        onClick={() => removeTimeSlot(selectedDay, slot.id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {errors.schedule && <p className="text-sm text-red-600">{errors.schedule}</p>}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between gap-4 mt-8 pt-6 border-t">
          <Button
            type="button"
            onClick={onBack}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <Button
            onClick={handleNext}
            disabled={isSubmitting}
            className="bg-orange-500 hover:bg-orange-600 text-white px-8"
          >
            {isSubmitting ? 'Processing...' : 'Continue'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
