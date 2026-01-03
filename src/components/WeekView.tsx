import React from 'react';
import { Appointment, Therapist } from '../types/appointment';
import { EnhancedAppointmentCard } from './EnhancedAppointmentCard';
import { useDrop } from 'react-dnd';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

interface WeekViewProps {
  startDate: Date;
  appointments: Appointment[];
  therapists: Therapist[];
  onSlotClick: (date: Date, time: string, therapistId?: string) => void;
  onAppointmentClick: (appointment: Appointment) => void;
  onAppointmentUpdate: (appointmentId: string, updates: Partial<Appointment>) => void;
  showMultipleTherapists: boolean;
  isAdminMode?: boolean;
}

export function WeekView({
  startDate,
  appointments,
  therapists,
  onSlotClick,
  onAppointmentClick,
  onAppointmentUpdate,
  showMultipleTherapists,
  isAdminMode = false,
}: WeekViewProps) {
  // Generate 7 days starting from startDate
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    return date;
  });

  // Generate ALL 24 hour time slots
  const timeSlots = Array.from({ length: 24 }, (_, i) => {
    const hour = i;
    return {
      hour,
      time: `${hour.toString().padStart(2, '0')}:00`,
      displayTime: new Date(0, 0, 0, hour).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }),
    };
  });

  // Check if hour is within working hours for a therapist
  // NOTE: Working hours are for visual indication and mobile app sync ONLY
  // All slots are clickable in CRM to allow booking outside business hours
  const isWorkingHour = (hour: number, therapist: Therapist): boolean => {
    const start = therapist.workingHours?.start 
      ? parseInt(therapist.workingHours.start.split(':')[0])
      : 9;
    const end = therapist.workingHours?.end
      ? parseInt(therapist.workingHours.end.split(':')[0])
      : 18;
    
    return hour >= start && hour <= end;
  };

  // Check if day is a working day for a therapist
  // NOTE: Working days are for visual indication and mobile app sync ONLY
  // All days are clickable in CRM to allow booking on non-working days
  const isWorkingDay = (date: Date, therapist: Therapist): boolean => {
    const day = date.getDay();
    const workingDays = therapist.workingDays || [1, 2, 3, 4, 5]; // Default Mon-Fri
    return workingDays.includes(day);
  };

  const getAppointmentsForSlot = (date: Date, hour: number, therapistId?: string) => {
    return appointments.filter(apt => {
      const aptDate = new Date(apt.startTime);
      const aptHour = aptDate.getHours();
      const matchesDate = (
        aptDate.getFullYear() === date.getFullYear() &&
        aptDate.getMonth() === date.getMonth() &&
        aptDate.getDate() === date.getDate()
      );
      const matchesHour = aptHour === hour;
      const matchesTherapist = !therapistId || apt.therapistId === therapistId;
      
      return matchesDate && matchesHour && matchesTherapist;
    });
  };

  const handleSlotClick = (date: Date, hour: number, therapistId?: string) => {
    const time = `${hour.toString().padStart(2, '0')}:00`;
    onSlotClick(date, time, therapistId);
  };

  const handleDrop = (item: { appointment: Appointment }, date: Date, hour: number, therapistId?: string) => {
    const newStartTime = new Date(date);
    newStartTime.setHours(hour, 0, 0, 0);
    
    const originalStart = new Date(item.appointment.startTime);
    const originalEnd = new Date(item.appointment.endTime);
    const duration = originalEnd.getTime() - originalStart.getTime();
    
    const newEndTime = new Date(newStartTime.getTime() + duration);
    
    onAppointmentUpdate(item.appointment.id, {
      startTime: newStartTime.toISOString(),
      endTime: newEndTime.toISOString(),
      ...(therapistId && { therapistId }),
    });
  };

  const formatDayHeader = (date: Date) => {
    const today = new Date();
    const isToday = (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );

    return {
      dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNumber: date.getDate(),
      isToday,
    };
  };

  // Get available slots for a specific date and therapist
  const getAvailableSlots = (date: Date, therapist: Therapist): number => {
    if (!isWorkingDay(date, therapist)) return 0;
    
    const workingSlots = timeSlots.filter(slot => isWorkingHour(slot.hour, therapist));
    const bookedSlots = appointments.filter(apt => {
      const aptDate = new Date(apt.startTime);
      return (
        aptDate.getFullYear() === date.getFullYear() &&
        aptDate.getMonth() === date.getMonth() &&
        aptDate.getDate() === date.getDate() &&
        apt.therapistId === therapist.id
      );
    });
    
    return Math.max(0, workingSlots.length - bookedSlots.length);
  };

  if (showMultipleTherapists) {
    return (
      <TooltipProvider>
        <div className="h-full overflow-auto relative">
          {/* Warning for many therapists */}
          {therapists.length > 6 && (
            <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2 text-sm text-yellow-800">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                Viewing {therapists.length} therapists. Consider filtering to improve performance and readability.
              </div>
            </div>
          )}
          <div className="min-w-full inline-block">
            {/* Header Row */}
            <div className="sticky top-0 bg-background z-40 border-b border-border">
              {/* Time Label Row */}
              <div className="flex">
                <div className="w-20 flex-shrink-0 border-r border-border bg-muted/30 flex items-center justify-center text-sm font-medium p-2 sticky left-0 z-50 border-b border-border">
                  Time
                </div>
                {therapists.map(therapist => (
                  <div 
                    key={therapist.id} 
                    className="flex-shrink-0 border-r border-border"
                    style={{ width: '840px' }}
                  >
                    <div className="bg-card p-3 text-center border-b border-border">
                      <div className="flex items-center justify-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full flex-shrink-0"
                          style={{ backgroundColor: therapist.color }}
                        />
                        <span className="font-medium text-sm truncate">{therapist.name}</span>
                      </div>
                      <div className="text-xs text-muted-foreground truncate">{therapist.email}</div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Days Row */}
              <div className="flex">
                <div className="w-20 flex-shrink-0 border-r border-border sticky left-0 z-50 bg-muted/30" />
                {therapists.map(therapist => (
                  <div 
                    key={`days-${therapist.id}`}
                    className="flex-shrink-0 border-r border-border"
                    style={{ width: '840px' }}
                  >
                    <div className="flex">
                      {weekDays.map(date => {
                        const dayInfo = formatDayHeader(date);
                        const isWorking = isWorkingDay(date, therapist);
                        const availableSlots = getAvailableSlots(date, therapist);
                        
                        return (
                          <Tooltip key={date.toISOString()}>
                            <TooltipTrigger asChild>
                              <div
                                className={`
                                  flex-1 p-2 text-center border-r border-border bg-card text-xs cursor-help
                                  ${dayInfo.isToday ? 'bg-blue-50 text-blue-900' : ''}
                                  ${!isWorking ? 'bg-gray-100 opacity-60' : ''}
                                `}
                                style={{ width: '120px' }}
                              >
                                <div className="font-medium">{dayInfo.dayName}</div>
                                <div className={`text-lg ${dayInfo.isToday ? 'font-bold' : ''}`}>
                                  {dayInfo.dayNumber}
                                </div>
                                {!isWorking && (
                                  <div className="text-[9px] text-muted-foreground mt-0.5">Off</div>
                                )}
                                {isWorking && availableSlots > 0 && (
                                  <div className="text-[9px] text-[#2e844a] mt-0.5 font-medium">
                                    {availableSlots} slots
                                  </div>
                                )}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">
                              <div className="space-y-1">
                                <div className="font-medium text-white">{therapist.name}</div>
                                <div className="text-xs text-white">
                                  {date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                                </div>
                                {isWorking ? (
                                  <div className="text-xs text-white">
                                    {availableSlots} available slot{availableSlots !== 1 ? 's' : ''}
                                  </div>
                                ) : (
                                  <div className="text-xs text-gray-300">Non-working day</div>
                                )}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Time Slots */}
            {timeSlots.map(slot => (
              <div key={slot.hour} className="flex border-b border-border">
                <div className="w-20 flex-shrink-0 border-r border-border bg-muted/30 flex items-center justify-center text-xs text-muted-foreground p-2 sticky left-0 z-30 bg-muted/30">
                  {slot.displayTime}
                </div>
                {therapists.map(therapist => {
                  const isWorking = isWorkingHour(slot.hour, therapist);
                  
                  return (
                    <div 
                      key={therapist.id} 
                      className="flex-shrink-0 border-r border-border"
                      style={{ width: '840px' }}
                    >
                      <div className="flex h-20">
                        {weekDays.map(date => {
                          const isDayWorking = isWorkingDay(date, therapist);
                          
                          return (
                            <WeekSlot
                              key={`${therapist.id}-${date.toISOString()}-${slot.hour}`}
                              date={date}
                              hour={slot.hour}
                              appointments={getAppointmentsForSlot(date, slot.hour, therapist.id)}
                              therapist={therapist}
                              isWorkingHour={isWorking && isDayWorking}
                              onSlotClick={() => handleSlotClick(date, slot.hour, therapist.id)}
                              onAppointmentClick={onAppointmentClick}
                              onDrop={(item) => handleDrop(item, date, slot.hour, therapist.id)}
                              allowAllSlots={true}
                            />
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </TooltipProvider>
    );
  }

  // Single therapist view
  const therapist = therapists[0];
  
  // If no therapist data, show error message
  if (!therapist) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <p>No therapist data available</p>
          <p className="text-sm mt-2">Please refresh the page or contact support</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="h-full overflow-auto">
      <div className="min-w-max">
        {/* Header Row */}
        <div className="sticky top-0 bg-background z-40 border-b border-border">
          <div className="flex">
            <div className="w-16 border-r bg-muted/30 flex items-center justify-center text-sm font-medium p-2 sticky left-0 z-50 border-b border-border bg-[rgba(255,255,255,0.3)]">
              Time
            </div>
            {weekDays.map(date => {
              const dayInfo = formatDayHeader(date);
              const isWorking = isWorkingDay(date, therapist);
              
              return (
                <div
                  key={date.toISOString()}
                  className={`
                    flex-1 min-w-32 p-3 text-center border-r border-border bg-card
                    ${dayInfo.isToday ? 'bg-blue-50 text-blue-900' : ''}
                    ${!isWorking ? 'bg-gray-100' : ''}
                  `}
                >
                  <div className="font-medium text-sm">{dayInfo.dayName}</div>
                  <div className={`text-xl ${dayInfo.isToday ? 'font-bold' : ''}`}>
                    {dayInfo.dayNumber}
                  </div>
                  {!isWorking && (
                    <div className="text-xs text-muted-foreground mt-1">Off</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Time Slots */}
        {timeSlots.map(slot => {
          const isWorking = isWorkingHour(slot.hour, therapist);
          
          return (
            <div key={slot.hour} className="flex border-b border-border">
              <div className="w-16 border-r border-border bg-muted/30 flex items-center justify-center text-xs text-muted-foreground p-2 sticky left-0 z-30 bg-muted/30">
                {slot.displayTime}
              </div>
              {weekDays.map(date => {
                const isDayWorking = therapist && isWorkingDay(date, therapist);
                
                return (
                  <WeekSlot
                    key={`${date.toISOString()}-${slot.hour}`}
                    date={date}
                    hour={slot.hour}
                    appointments={getAppointmentsForSlot(date, slot.hour, therapist.id)}
                    therapist={therapist}
                    isWorkingHour={isWorking && isDayWorking}
                    onSlotClick={() => handleSlotClick(date, slot.hour, therapist.id)}
                    onAppointmentClick={onAppointmentClick}
                    onDrop={(item) => handleDrop(item, date, slot.hour, therapist.id)}
                    allowAllSlots={true}
                  />
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface WeekSlotProps {
  date: Date;
  hour: number;
  appointments: Appointment[];
  therapist?: Therapist;
  isWorkingHour: boolean;
  onSlotClick: () => void;
  onAppointmentClick: (appointment: Appointment) => void;
  onDrop: (item: { appointment: Appointment }) => void;
  allowAllSlots?: boolean;
}

function WeekSlot({
  date,
  hour,
  appointments,
  therapist,
  isWorkingHour,
  onSlotClick,
  onAppointmentClick,
  onDrop,
  allowAllSlots = false,
}: WeekSlotProps) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'appointment',
    drop: (item: { appointment: Appointment }) => onDrop(item),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  const now = new Date();
  const isCurrentHour = (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate() &&
    hour === now.getHours()
  );

  const isPastHour = date.getTime() + (hour * 60 * 60 * 1000) < now.getTime();
  
  // Allow clicking if: allowAllSlots is true OR it's a working hour
  // NOTE: In CRM, allowAllSlots is ALWAYS true to allow booking outside business hours
  // Working hours are only used for visual styling (grayed out background)
  const isClickable = allowAllSlots || isWorkingHour;

  return (
    <div
      ref={drop}
      className={`
        flex-1 h-20 border-r border-border p-1 transition-colors cursor-pointer
        ${!isWorkingHour ? 'bg-gray-50/80' : ''}
        ${isOver ? 'bg-primary/10' : isClickable ? 'hover:bg-muted/50' : ''}
        ${isCurrentHour ? 'bg-blue-50' : ''}
        ${isPastHour && isWorkingHour ? 'bg-gray-50/50' : ''}
      `}
      style={{ minWidth: '28px' }}
      onClick={isClickable ? onSlotClick : undefined}
    >
      <div className="h-full overflow-hidden bg-[rgba(255,255,255,0)]">
        {appointments.map(appointment => (
          <EnhancedAppointmentCard
            key={appointment.id}
            appointment={appointment}
            onClick={(e) => {
              e?.stopPropagation();
              onAppointmentClick(appointment);
            }}
            view="week"
          />
        ))}
      </div>
    </div>
  );
}
