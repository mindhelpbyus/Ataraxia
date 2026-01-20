import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Calendar, Clock, ChevronLeft, ChevronRight, User } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { CalendarView, Therapist } from '../types/appointment';

interface SlotAvailabilityProps {
  currentDate: Date;
  therapistIds: string[];
  therapists: Therapist[];
  viewType: CalendarView;
  onSlotClick: (date: Date, time: string, therapistId: string) => void;
}

export function SlotAvailability({ currentDate, therapistIds, therapists, viewType, onSlotClick }: SlotAvailabilityProps) {
  const [selectedDate, setSelectedDate] = useState(currentDate);
  const [showDaySlots, setShowDaySlots] = useState(viewType === 'day');

  useEffect(() => {
    setSelectedDate(currentDate);
    setShowDaySlots(viewType === 'day');
  }, [currentDate, viewType]);

  // Get selected therapists
  const selectedTherapists = therapists.filter(t => therapistIds.includes(t.id));
  const isMultiTherapist = selectedTherapists.length > 1;

  const generateTimeSlots = (therapist?: Therapist): string[] => {
    const slots: string[] = [];
    // Use therapist's working hours or default to 6 AM - 10 PM
    const startHour = therapist?.workingHours?.start
      ? parseInt(therapist.workingHours.start.split(':')[0])
      : 9;
    const endHour = therapist?.workingHours?.end
      ? parseInt(therapist.workingHours.end.split(':')[0])
      : 18;

    for (let hour = startHour; hour <= endHour; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      if (hour < endHour) {
        slots.push(`${hour.toString().padStart(2, '0')}:30`);
      }
    }
    return slots;
  };

  const isWorkingDay = (date: Date, therapist: Therapist): boolean => {
    const day = date.getDay();
    // If no working days specified, default to Mon-Fri (1-5)
    const workingDays = therapist.workingDays || [1, 2, 3, 4, 5];
    return workingDays.includes(day);
  };

  const isSlotAvailable = (date: Date, time: string, therapistId: string): boolean => {
    const therapist = therapists.find(t => t.id === therapistId);
    if (!therapist || !isWorkingDay(date, therapist)) {
      return false;
    }

    const dateStr = date.toISOString().split('T')[0];
    const seed = dateStr + time + therapistId;
    const hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return hash % 3 !== 0;
  };

  // Get availability count for a date across all selected therapists
  const getAvailabilityForDate = (date: Date): {
    total: number;
    byTherapist: Record<string, { name: string; count: number; color: string }>
  } => {
    const byTherapist: Record<string, { name: string; count: number; color: string }> = {};
    let total = 0;

    selectedTherapists.forEach(therapist => {
      if (!isWorkingDay(date, therapist)) {
        byTherapist[therapist.id] = { name: therapist.name, count: 0, color: therapist.color };
        return;
      }

      const timeSlots = generateTimeSlots(therapist);
      const count = timeSlots.filter(time => isSlotAvailable(date, time, therapist.id)).length;
      byTherapist[therapist.id] = { name: therapist.name, count, color: therapist.color };
      total += count;
    });

    return { total, byTherapist };
  };

  const timeSlots = generateTimeSlots();

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    if (viewType === 'day') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    } else if (viewType === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    setSelectedDate(newDate);
    setShowDaySlots(false);
  };

  const getWeekDays = (date: Date): Date[] => {
    const days: Date[] = [];
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    startOfWeek.setDate(startOfWeek.getDate() + diff);

    for (let i = 0; i < 7; i++) {
      const newDate = new Date(startOfWeek);
      newDate.setDate(newDate.getDate() + i);
      days.push(newDate);
    }
    return days;
  };

  const getMonthWeeks = (date: Date): Date[][] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const weeks: Date[][] = [];
    let currentWeek: Date[] = [];

    const firstDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;

    for (let i = 0; i < firstDayOfWeek; i++) {
      const prevDate = new Date(firstDay);
      prevDate.setDate(prevDate.getDate() - (firstDayOfWeek - i));
      currentWeek.push(prevDate);
    }

    for (let day = 1; day <= lastDay.getDate(); day++) {
      currentWeek.push(new Date(year, month, day));
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }

    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        const nextDate = new Date(lastDay);
        nextDate.setDate(nextDate.getDate() + (currentWeek.length - firstDayOfWeek - lastDay.getDate() + 1));
        currentWeek.push(nextDate);
      }
      weeks.push(currentWeek);
    }

    return weeks;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatDayName = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSameMonth = (date: Date, compareDate: Date) => {
    return date.getMonth() === compareDate.getMonth() && date.getFullYear() === compareDate.getFullYear();
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setShowDaySlots(true);
  };

  const DaySlots = ({ date }: { date: Date }) => {
    // For multi-therapist, show slots grouped by therapist
    if (isMultiTherapist) {
      return (
        <div className="space-y-4">
          {selectedTherapists.map((therapist) => {
            const therapistSlots = generateTimeSlots(therapist);
            const isWorking = isWorkingDay(date, therapist);

            return (
              <div key={therapist.id} className="space-y-2">
                {/* Therapist Header */}
                <div className="flex items-center gap-2 px-2 py-1.5 bg-muted/50 rounded-md sticky top-0 z-10">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: therapist.color }}
                  />
                  <span className="text-sm font-medium">{therapist.name}</span>
                  {!isWorking && (
                    <Badge variant="secondary" className="text-xs ml-auto">Non-working day</Badge>
                  )}
                </div>

                {/* Slots for this therapist */}
                {isWorking && (
                  <div className="space-y-1.5 pl-2">
                    {therapistSlots.map((time) => {
                      const available = isSlotAvailable(date, time, therapist.id);
                      return (
                        <button
                          key={`${therapist.id}-${time}`}
                          onClick={() => available && onSlotClick(date, time, therapist.id)}
                          disabled={!available}
                          className={`
                            w-full text-left px-3 py-2 rounded-md text-sm
                            transition-all border
                            ${available
                              ? 'border-[#dddbda] hover:border-[#ea580c] hover:bg-orange-50 cursor-pointer'
                              : 'border-[#f3f4f6] bg-[#f9fafb] text-muted-foreground cursor-not-allowed opacity-50'
                            }
                          `}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Clock className="h-3.5 w-3.5" />
                              <span className="font-medium">{time}</span>
                            </div>
                            {available ? (
                              <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200 border-orange-200">
                                Available
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="bg-[#f3f4f6] text-muted-foreground text-xs">
                                Booked
                              </Badge>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      );
    }

    // Single therapist view
    const therapist = selectedTherapists[0];
    const therapistSlots = generateTimeSlots(therapist);
    const isWorking = therapist && isWorkingDay(date, therapist);

    if (!isWorking) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>Non-working day</p>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {therapistSlots.map((time) => {
          const available = isSlotAvailable(date, time, therapist?.id || therapistIds[0]);
          return (
            <button
              key={time}
              onClick={() => available && onSlotClick(date, time, therapist?.id || therapistIds[0])}
              disabled={!available}
              className={`
                w-full text-left px-3 py-2 rounded-md text-sm
                transition-all border
                ${available
                  ? 'border-[#dddbda] hover:border-[#ea580c] hover:bg-orange-50 cursor-pointer'
                  : 'border-[#f3f4f6] bg-[#f9fafb] text-muted-foreground cursor-not-allowed opacity-50'
                }
              `}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5" />
                  <span className="font-medium">{time}</span>
                </div>
                {available ? (
                  <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200 border-orange-200">
                    Available
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-[#f3f4f6] text-muted-foreground text-xs">
                    Booked
                  </Badge>
                )}
              </div>
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <TooltipProvider>
      <div className="h-full flex flex-col">
        {/* Navigation Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-sidebar-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateDate('prev')}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">
            {viewType === 'day' && formatDate(selectedDate)}
            {viewType === 'week' && `Week of ${formatDate(getWeekDays(selectedDate)[0])}`}
            {viewType === 'month' && selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateDate('next')}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4">
            {/* Day View */}
            {viewType === 'day' && <DaySlots date={selectedDate} />}

            {/* Week View */}
            {viewType === 'week' && !showDaySlots && (
              <div className="space-y-2">
                {getWeekDays(selectedDate).map((date) => {
                  const { total, byTherapist } = getAvailabilityForDate(date);
                  const totalPossibleSlots = Object.values(byTherapist).reduce((sum, t) => {
                    const therapist = therapists.find(th => th.name === t.name);
                    return sum + (therapist ? generateTimeSlots(therapist).length : 0);
                  }, 0);

                  return (
                    <button
                      key={date.toISOString()}
                      onClick={() => handleDateClick(date)}
                      className={`
                        w-full p-3 rounded-lg border border-[#dddbda] hover:border-[#ea580c]
                        hover:bg-orange-50 transition-all cursor-pointer text-left
                        ${isToday(date) ? 'ring-2 ring-[#ea580c]' : ''}
                      `}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-xs text-muted-foreground">{formatDayName(date)}</div>
                            <div className="font-semibold">{date.getDate()}</div>
                          </div>
                          <div className="text-right text-xs">
                            <div className="text-orange-600 font-medium">{total} slots</div>
                            <div className="text-muted-foreground">{totalPossibleSlots - total} booked</div>
                          </div>
                        </div>

                        {/* Show availability by therapist */}
                        {isMultiTherapist && (
                          <div className="flex flex-wrap gap-1.5 pt-1 border-t border-[#dddbda]">
                            {Object.entries(byTherapist).map(([id, data]) => (
                              <Tooltip key={id}>
                                <TooltipTrigger asChild>
                                  <div className="flex items-center gap-1 text-xs cursor-help">
                                    <div
                                      className="w-2 h-2 rounded-full"
                                      style={{ backgroundColor: data.color }}
                                    />
                                    <span className="text-muted-foreground">{data.count}</span>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                  <div className="text-xs text-white">
                                    <div className="font-medium">{data.name}</div>
                                    <div className="text-gray-300">{data.count} available slot{data.count !== 1 ? 's' : ''}</div>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            ))}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Week View - Day Slots */}
            {viewType === 'week' && showDaySlots && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDaySlots(false)}
                    className="text-xs text-orange-600 hover:text-orange-700"
                  >
                    ← Back to week
                  </Button>
                  <span className="text-sm font-medium">{formatDate(selectedDate)}</span>
                </div>
                <DaySlots date={selectedDate} />
              </div>
            )}

            {/* Month View */}
            {viewType === 'month' && !showDaySlots && (
              <div>
                <div className="mb-2 grid grid-cols-7 gap-1">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                    <div key={idx} className="text-center text-xs font-medium text-sidebar-foreground/60 py-1">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {getMonthWeeks(selectedDate).map((week, weekIdx) => (
                    <React.Fragment key={weekIdx}>
                      {week.map((date, dayIdx) => {
                        const { total, byTherapist } = getAvailabilityForDate(date);
                        const isCurrentMonth = isSameMonth(date, selectedDate);

                        return (
                          <Tooltip key={dayIdx}>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() => handleDateClick(date)}
                                className={`
                                  text-xs h-7 w-7 rounded-md transition-colors font-medium
                                  flex items-center justify-center relative
                                  ${!isCurrentMonth ? 'text-sidebar-foreground/40' : 'text-sidebar-foreground'}
                                  ${isToday(date) ? 'shadow-sm font-bold' : 'hover:bg-sidebar-accent'}
                                `}
                                style={isToday(date) ? { backgroundColor: '#ea580c', color: 'white' } : {}}
                              >
                                {date.getDate()}
                                {isCurrentMonth && total > 0 && !isToday(date) && (
                                  <span className="absolute bottom-0 text-[8px] text-orange-600 font-medium leading-none">
                                    {total}
                                  </span>
                                )}
                                {isToday(date) && isCurrentMonth && total > 0 && (
                                  <span className="absolute bottom-0 text-[8px] text-white font-medium leading-none opacity-80">
                                    {total}
                                  </span>
                                )}
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="right" className="max-w-xs">
                              <div className="space-y-1.5">
                                <div className="font-medium text-white">{formatDate(date)}</div>
                                {total > 0 ? (
                                  <>
                                    <div className="text-xs text-white">
                                      {total} available slot{total !== 1 ? 's' : ''}
                                    </div>
                                    {isMultiTherapist && (
                                      <div className="space-y-1 pt-1 border-t border-gray-700">
                                        {Object.entries(byTherapist).map(([id, data]) => (
                                          <div key={id} className="flex items-center justify-between gap-2 text-xs">
                                            <div className="flex items-center gap-1.5">
                                              <div
                                                className="w-2 h-2 rounded-full"
                                                style={{ backgroundColor: data.color }}
                                              />
                                              <span className="text-white">{data.name}</span>
                                            </div>
                                            <span className="text-gray-300">{data.count} slots</span>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </>
                                ) : (
                                  <div className="text-xs text-gray-300">No slots available</div>
                                )}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}

            {/* Month View - Day Slots */}
            {viewType === 'month' && showDaySlots && (
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-sidebar-border">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDaySlots(false)}
                    className="text-xs text-[#0176d3]"
                  >
                    ← Back to month
                  </Button>
                  <span className="text-sm font-medium">{formatDate(selectedDate)}</span>
                </div>
                <DaySlots date={selectedDate} />
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </TooltipProvider>
  );
}