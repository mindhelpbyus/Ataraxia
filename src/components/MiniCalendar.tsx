import React, { useMemo } from 'react';
import { CaretLeft, CaretRight } from '@phosphor-icons/react';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Appointment, Therapist } from '../types/appointment';

interface MiniCalendarProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onNavigate: (direction: 'prev' | 'next') => void;
  appointments: Appointment[];
  therapists: Therapist[];
}

export function MiniCalendar({
  currentDate,
  onDateChange,
  onNavigate,
  appointments,
  therapists
}: MiniCalendarProps) {
  const today = new Date();

  // Get first day of the month
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

  // Get starting date for calendar grid (including previous month days)
  const startDate = new Date(firstDayOfMonth);
  startDate.setDate(startDate.getDate() - firstDayOfMonth.getDay());

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const days = [];
    const currentDateForLoop = new Date(startDate);

    for (let i = 0; i < 42; i++) { // 6 weeks * 7 days
      days.push(new Date(currentDateForLoop));
      currentDateForLoop.setDate(currentDateForLoop.getDate() + 1);
    }
    return days;
  }, [startDate]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // --- Availability Logic (Copied/Adapted from SlotAvailability for consistency) ---
  const generateTimeSlots = (therapist?: Therapist): string[] => {
    const slots: string[] = [];
    const startHour = therapist?.workingHours?.start ? parseInt(therapist.workingHours.start.split(':')[0]) : 9;
    const endHour = therapist?.workingHours?.end ? parseInt(therapist.workingHours.end.split(':')[0]) : 18;

    for (let hour = startHour; hour <= endHour; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      if (hour < endHour) slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    return slots;
  };

  const isWorkingDay = (date: Date, therapist: Therapist): boolean => {
    const day = date.getDay();
    const workingDays = therapist.workingDays || [1, 2, 3, 4, 5];
    return workingDays.includes(day);
  };

  const isSlotAvailable = (date: Date, time: string, therapistId: string): boolean => {
    const therapist = therapists.find(t => t.id === therapistId);
    if (!therapist || !isWorkingDay(date, therapist)) return false;

    // Mock Availability to match SlotAvailability
    const dateStr = date.toISOString().split('T')[0];
    const seed = dateStr + time + therapistId;
    const hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return hash % 3 !== 0;
  };

  const getAvailabilityCount = (date: Date) => {
    let total = 0;
    therapists.forEach(therapist => {
      if (!isWorkingDay(date, therapist)) return;
      const slots = generateTimeSlots(therapist);
      const count = slots.filter(time => isSlotAvailable(date, time, therapist.id)).length;
      total += count;
    });
    return total;
  };

  const isToday = (date: Date) => date.toDateString() === today.toDateString();
  const isCurrentMonth = (date: Date) => date.getMonth() === currentDate.getMonth();
  const isSelected = (date: Date) => date.toDateString() === currentDate.toDateString();

  return (
    <div className="p-4 bg-sidebar border-b border-sidebar-border">
      {/* Month Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-sidebar-foreground">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 hover:bg-sidebar-accent text-sidebar-foreground"
            onClick={() => onNavigate('prev')}
          >
            <CaretLeft className="h-4 w-4" weight="bold" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 hover:bg-sidebar-accent text-sidebar-foreground"
            onClick={() => onNavigate('next')}
          >
            <CaretRight className="h-4 w-4" weight="bold" />
          </Button>
        </div>
      </div>

      {/* Days of Week */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
          <div key={index} className="text-xs text-sidebar-foreground/60 text-center p-1 font-medium">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <TooltipProvider>
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.slice(0, 35).map((date, index) => {
            const todayDay = isToday(date);
            const selected = isSelected(date);
            const currentMonth = isCurrentMonth(date);
            const availability = getAvailabilityCount(date);

            return (
              <Tooltip key={index}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onDateChange(date)}
                    className={`
                      text-xs h-7 w-7 rounded-md transition-colors font-medium
                      flex items-center justify-center relative
                      ${!currentMonth ? 'text-muted-foreground/40' : 'text-foreground'}
                      ${selected
                        ? 'shadow-sm font-bold'
                        : todayDay
                          ? 'text-orange-600 bg-orange-50 font-bold hover:bg-orange-100'
                          : 'hover:bg-muted'
                      }
                    `}
                    style={selected ? { backgroundColor: '#ea580c', color: 'white' } : {}}
                  >
                    <span className="">{date.getDate()}</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <div className="text-xs">
                    <div className="font-medium">{date.toDateString()}</div>
                    <div className="text-orange-300">
                      {availability > 0 ? `${availability} Available Slots` : 'No Availability'}
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </TooltipProvider>
    </div>
  );
}