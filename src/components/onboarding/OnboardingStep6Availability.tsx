import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Card } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Clock, Plus, Trash2, Calendar } from 'lucide-react';
import { WeeklySchedule, TimeSlot, SessionType } from '../../types/onboarding';
import { LANGUAGES } from '../../types/onboarding';

interface OnboardingStep6Props {
  data: {
    weeklySchedule: WeeklySchedule;
    sessionDurations: number[];
    breakTimeBetweenSessions: number;
    sessionTypes: SessionType[];
    supportedLanguages: string[];
  };
  spokenLanguages?: string[]; // Languages from Step 3
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

const SESSION_DURATIONS = [30, 45, 60, 90];
const BREAK_TIMES = [0, 5, 10, 15, 30];

export function OnboardingStep6Availability({ data, spokenLanguages, onUpdate, onNext, onBack }: OnboardingStep6Props) {
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

  const toggleSessionDuration = (duration: number) => {
    const newDurations = data.sessionDurations.includes(duration)
      ? data.sessionDurations.filter((d) => d !== duration)
      : [...data.sessionDurations, duration];
    onUpdate({ sessionDurations: newDurations });
  };

  const toggleSessionType = (type: SessionType) => {
    const newTypes = data.sessionTypes.includes(type)
      ? data.sessionTypes.filter((t) => t !== type)
      : [...data.sessionTypes, type];
    onUpdate({ sessionTypes: newTypes });
  };

  const toggleLanguage = (language: string) => {
    const newLanguages = data.supportedLanguages.includes(language)
      ? data.supportedLanguages.filter((l) => l !== language)
      : [...data.supportedLanguages, language];
    onUpdate({ supportedLanguages: newLanguages });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Check if at least one time slot is added
    const hasTimeSlots = DAYS.some((day) => data.weeklySchedule[day].length > 0);
    if (!hasTimeSlots) {
      newErrors.schedule = 'Add at least one availability time slot';
    }

    if (data.sessionDurations.length === 0) {
      newErrors.durations = 'Select at least one session duration';
    }

    if (data.sessionTypes.length === 0) {
      newErrors.types = 'Select at least one session type';
    }

    if (data.supportedLanguages.length === 0) {
      newErrors.languages = 'Select at least one language';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onNext();
    }
  };

  // Prioritize spoken languages from Step 3 in supported languages
  useEffect(() => {
    if (spokenLanguages && spokenLanguages.length > 0 && data.supportedLanguages.length === 0) {
      // Only auto-populate on first visit to this step
      onUpdate({ supportedLanguages: [...spokenLanguages] });
    }
  }, []);

  // Sort languages to show spoken languages first
  const getSortedLanguages = () => {
    if (!spokenLanguages || spokenLanguages.length === 0) {
      return LANGUAGES;
    }
    
    // Spoken languages first, then others
    const spokenLangs = LANGUAGES.filter(lang => spokenLanguages.includes(lang));
    const otherLangs = LANGUAGES.filter(lang => !spokenLanguages.includes(lang));
    
    return [...spokenLangs, ...otherLangs];
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-6">
      <div className="p-8 shadow-lg rounded-lg bg-white/80 backdrop-blur-md border border-gray-100">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#bee3f8] flex items-center justify-center mb-4">
            <Calendar className="h-6 w-6 text-[#0176d3]" />
          </div>
          <h1 className="text-3xl font-medium leading-8 text-gray-900 mb-2">Availability & Preferences</h1>
          <p className="text-sm text-muted-foreground">
            Set your working hours and session preferences to help clients book appointments
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Weekly Schedule */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Weekly Schedule *</Label>
              {errors.schedule && <p className="text-xs text-red-500">{errors.schedule}</p>}
            </div>

            {/* Day Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {DAYS.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => setSelectedDay(day)}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors
                    ${
                      selectedDay === day
                        ? 'bg-[#0176d3] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                  `}
                >
                  {DAY_LABELS[day].slice(0, 3)}
                  {data.weeklySchedule[day].length > 0 && (
                    <span className="ml-1.5 text-xs">({data.weeklySchedule[day].length})</span>
                  )}
                </button>
              ))}
            </div>

            {/* Time Slots for Selected Day */}
            <div className="bg-gray-50 rounded-lg p-4 min-h-[200px]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-gray-900">{DAY_LABELS[selectedDay]}</h3>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => addTimeSlot(selectedDay)}
                  className="text-[#0176d3] border-[#0176d3] hover:bg-[#0176d3]/10"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Time Slot
                </Button>
              </div>

              {data.weeklySchedule[selectedDay].length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">
                  No availability set for this day. Click "Add Time Slot" to get started.
                </div>
              ) : (
                <div className="space-y-3">
                  {data.weeklySchedule[selectedDay].map((slot) => (
                    <div key={slot.id} className="flex items-center gap-3 bg-white p-3 rounded-lg">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <input
                        type="time"
                        value={slot.startTime}
                        onChange={(e) =>
                          updateTimeSlot(selectedDay, slot.id, 'startTime', e.target.value)
                        }
                        className="px-3 py-2 border rounded-md text-sm"
                      />
                      <span className="text-gray-500">to</span>
                      <input
                        type="time"
                        value={slot.endTime}
                        onChange={(e) =>
                          updateTimeSlot(selectedDay, slot.id, 'endTime', e.target.value)
                        }
                        className="px-3 py-2 border rounded-md text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => removeTimeSlot(selectedDay, slot.id)}
                        className="ml-auto p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Session Duration */}
            <div className="space-y-3">
              <Label>Session Duration Options *</Label>
              <div className="flex flex-wrap gap-2">
                {SESSION_DURATIONS.map((duration) => (
                  <button
                    key={duration}
                    type="button"
                    onClick={() => toggleSessionDuration(duration)}
                    className={`
                      px-4 py-2 rounded-lg text-sm font-medium transition-colors
                      ${
                        data.sessionDurations.includes(duration)
                          ? 'bg-[#0176d3] text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }
                    `}
                  >
                    {duration} min
                  </button>
                ))}
              </div>
              {errors.durations && <p className="text-xs text-red-500">{errors.durations}</p>}
            </div>

            {/* Break Time */}
            <div className="space-y-3">
              <Label>Break Time Between Sessions</Label>
              <Select
                value={data.breakTimeBetweenSessions.toString()}
                onValueChange={(value) =>
                  onUpdate({ breakTimeBetweenSessions: parseInt(value) })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BREAK_TIMES.map((time) => (
                    <SelectItem key={time} value={time.toString()}>
                      {time === 0 ? 'No break' : `${time} minutes`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Session Types */}
          <div className="space-y-3">
            <Label>Session Types *</Label>
            <div className="flex flex-wrap gap-3">
              {(['video', 'audio', 'chat'] as SessionType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => toggleSessionType(type)}
                  className={`
                    px-6 py-3 rounded-lg text-sm font-medium capitalize transition-colors
                    ${
                      data.sessionTypes.includes(type)
                        ? 'bg-[#0176d3] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                  `}
                >
                  {type === 'video' && '🎥 '}
                  {type === 'audio' && '🎧 '}
                  {type === 'chat' && '💬 '}
                  {type}
                </button>
              ))}
            </div>
            {errors.types && <p className="text-xs text-red-500">{errors.types}</p>}
          </div>

          {/* Supported Languages */}
          <div className="space-y-3">
            <Label>Supported Languages for Sessions *</Label>
            <div className="flex flex-wrap gap-2">
              {getSortedLanguages().slice(0, 10).map((language) => (
                <button
                  key={language}
                  type="button"
                  onClick={() => toggleLanguage(language)}
                  className={`
                    px-4 py-2 rounded-lg text-sm transition-colors
                    ${
                      data.supportedLanguages.includes(language)
                        ? 'bg-[#0176d3] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                  `}
                >
                  {language}
                </button>
              ))}
            </div>
            {errors.languages && <p className="text-xs text-red-500">{errors.languages}</p>}
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <Button type="button" variant="outline" onClick={onBack} className="flex-1">
              Back
            </Button>
            <Button type="submit" className="flex-1 bg-[#0176d3] hover:bg-[#014486]">
              Continue
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}