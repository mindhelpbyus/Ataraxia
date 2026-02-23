import React from 'react';
import { Appointment, Therapist } from '../types/appointment';
import { EnhancedAppointmentCard } from './EnhancedAppointmentCard';
import { useDrop } from 'react-dnd';

interface DayViewProps {
  date: Date;
  appointments: Appointment[];
  therapists: Therapist[];
  onSlotClick: (date: Date, time: string, therapistId?: string) => void;
  onAppointmentClick: (appointment: Appointment) => void;
  onAppointmentUpdate: (appointmentId: string, updates: Partial<Appointment>) => void;
  showMultipleTherapists: boolean;
  isAdminMode?: boolean;
}

export function DayView({
  date,
  appointments,
  therapists,
  onSlotClick,
  onAppointmentClick,
  onAppointmentUpdate,
  showMultipleTherapists,
  isAdminMode = false,
}: DayViewProps) {
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
  const isWorkingDay = (therapist: Therapist): boolean => {
    const day = date.getDay();
    const workingDays = therapist.workingDays || [1, 2, 3, 4, 5];
    return workingDays.includes(day);
  };

  // Filter appointments for this day
  const dayAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.startTime);
    return (
      aptDate.getFullYear() === date.getFullYear() &&
      aptDate.getMonth() === date.getMonth() &&
      aptDate.getDate() === date.getDate()
    );
  });

  const getAppointmentsForSlot = (hour: number, therapistId?: string) => {
    return dayAppointments.filter(apt => {
      const aptStart = new Date(apt.startTime);
      const aptHour = aptStart.getHours();
      const matchesTherapist = !therapistId || apt.therapistId === therapistId;
      return aptHour === hour && matchesTherapist;
    });
  };

  const handleSlotClick = (hour: number, therapistId?: string) => {
    const time = `${hour.toString().padStart(2, '0')}:00`;
    onSlotClick(date, time, therapistId);
  };

  const handleDrop = (item: { appointment: Appointment }, hour: number, therapistId?: string) => {
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

  if (showMultipleTherapists) {
    return (
      <div className="h-full flex flex-col overflow-hidden">
        {/* Warning for many therapists */}
        {therapists.length > 6 && (
          <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2 text-sm text-yellow-800 flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full" />
              Viewing {therapists.length} therapists. Consider filtering to improve performance and readability.
            </div>
          </div>
        )}
        <div className="flex-1 overflow-auto">
          <div className="flex min-h-full">
            {/* Time Column */}
            <div className="w-20 border-r border-border bg-white flex-shrink-0 sticky left-0 z-30">
              <div className="h-16 border-b border-border flex items-center justify-center text-sm font-medium sticky top-0 bg-white z-50 border-r border-border">
                Time
              </div>
              {timeSlots.map(slot => (
                <div
                  key={slot.hour}
                  className="h-24 border-b border-border flex items-center justify-center text-xs text-muted-foreground bg-white"
                >
                  {slot.displayTime}
                </div>
              ))}
            </div>

            {/* Therapist Columns */}
            {therapists.map(therapist => {
              const isDayWorking = isWorkingDay(therapist);

              return (
                <div key={therapist.id} className="flex-1 min-w-64 border-r border-border">
                  {/* Therapist Header */}
                  <div className="h-16 border-b border-border p-3 bg-card sticky top-0 z-40">
                    <div className="flex items-center gap-2 mb-1">
                      <div
                        className="w-4 h-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: therapist.color }}
                      />
                      <span className="font-medium text-sm truncate">{therapist.name}</span>
                    </div>
                    <div className="text-xs text-muted-foreground truncate">{therapist.email}</div>
                    {!isDayWorking && (
                      <div className="text-xs text-muted-foreground mt-1">Non-working day</div>
                    )}
                  </div>

                  {/* Time Slots */}
                  {timeSlots.map(slot => {
                    const isWorking = isDayWorking && isWorkingHour(slot.hour, therapist);

                    return (
                      <DaySlot
                        key={`${therapist.id}-${slot.hour}`}
                        hour={slot.hour}
                        appointments={getAppointmentsForSlot(slot.hour, therapist.id)}
                        therapist={therapist}
                        isWorkingHour={isWorking}
                        onSlotClick={() => handleSlotClick(slot.hour, therapist.id)}
                        onAppointmentClick={onAppointmentClick}
                        onDrop={(item) => handleDrop(item, slot.hour, therapist.id)}
                        allowAllSlots={true}
                      />
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
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

  const isDayWorking = isWorkingDay(therapist);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {!isDayWorking && (
        <div className="bg-[rgb(255,255,255)] border-b border-gray-300 px-4 py-2 text-sm text-gray-700 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-gray-500 rounded-full" />
            This is a non-working day for {therapist.name}.
          </div>
        </div>
      )}
      <div className="flex-1 overflow-auto">
        <div className="flex">
          {/* Time Column */}
          <div className="w-20 border-r border-border bg-white flex-shrink-0 sticky left-0 z-30">
            {timeSlots.map(slot => (
              <div
                key={slot.hour}
                className="h-24 border-b border-border flex items-center justify-center text-xs text-muted-foreground bg-white"
              >
                {slot.displayTime}
              </div>
            ))}
          </div>

          {/* Single Therapist Column */}
          <div className="flex-1">
            {timeSlots.map(slot => {
              const isWorking = isDayWorking && isWorkingHour(slot.hour, therapist);

              return (
                <DaySlot
                  key={slot.hour}
                  hour={slot.hour}
                  appointments={getAppointmentsForSlot(slot.hour, therapist.id)}
                  therapist={therapist}
                  isWorkingHour={isWorking}
                  onSlotClick={() => handleSlotClick(slot.hour, therapist.id)}
                  onAppointmentClick={onAppointmentClick}
                  onDrop={(item) => handleDrop(item, slot.hour, therapist.id)}
                  allowAllSlots={true}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

interface DaySlotProps {
  hour: number;
  appointments: Appointment[];
  therapist?: Therapist;
  isWorkingHour: boolean;
  onSlotClick: () => void;
  onAppointmentClick: (appointment: Appointment) => void;
  onDrop: (item: { appointment: Appointment }) => void;
  allowAllSlots?: boolean;
}

function DaySlot({
  hour,
  appointments,
  therapist,
  isWorkingHour,
  onSlotClick,
  onAppointmentClick,
  onDrop,
  allowAllSlots = false,
}: DaySlotProps) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'appointment',
    drop: (item: { appointment: Appointment }) => onDrop(item),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  const now = new Date();
  const isCurrentHour = now.getHours() === hour;
  const isPastHour = now.getHours() > hour;

  // Allow clicking if: allowAllSlots is true OR it's a working hour
  // NOTE: In CRM, allowAllSlots is ALWAYS true to allow booking outside business hours
  // Working hours are only used for visual styling (grayed out background)
  const isClickable = allowAllSlots || isWorkingHour;

  // Debug logging for slot clickability
  if (hour === 10) { // Only log for 10 AM to avoid spam
  }

  return (
    <div
      ref={drop as any}
      className={`
        h-24 border-b border-border p-2 transition-colors cursor-pointer
        ${!isWorkingHour ? '' : ''}
        ${isOver ? 'bg-primary/10' : isClickable ? 'hover:bg-muted/50' : ''}
        ${isCurrentHour ? 'bg-orange-50' : ''}
        ${isPastHour && isWorkingHour ? '' : ''}
      `}
      onClick={isClickable ? onSlotClick : undefined}
    >
      <div className="h-full overflow-auto space-y-1 bg-[rgba(255,255,255,0)]">
        {appointments.map(appointment => (
          <EnhancedAppointmentCard
            key={appointment.id}
            appointment={appointment}
            onClick={(e) => {
              e.stopPropagation();
              onAppointmentClick(appointment);
            }}
            view="day"
          />
        ))}
      </div>
    </div>
  );
}
