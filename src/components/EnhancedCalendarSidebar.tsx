import React, { useState } from 'react';
import { MiniCalendar } from './MiniCalendar';
import { AgendaView } from './AgendaView';
import { SlotAvailability } from './SlotAvailability';
import { Appointment, Therapist, CalendarView } from '../types/appointment';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Calendar, ListTodo, Clock, ChevronRight, ChevronLeft, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { Separator } from './ui/separator';

interface EnhancedCalendarSidebarProps {
  currentDate: Date;
  appointments: Appointment[];
  therapists: Therapist[];
  selectedTherapistIds: string[];
  currentView: CalendarView; // Pass current view from main calendar
  onDateChange: (date: Date) => void;
  onNavigate: (direction: 'prev' | 'next') => void;
  onAppointmentClick: (appointment: Appointment) => void;
  onSlotClick: (date: Date, time: string, therapistId: string) => void;
  isExpanded: boolean;
  onToggleExpanded: (expanded: boolean) => void;
}

type Step = 'calendar' | 'agenda' | 'slots';

export function EnhancedCalendarSidebar({
  currentDate,
  appointments,
  therapists,
  selectedTherapistIds,
  currentView,
  onDateChange,
  onNavigate,
  onAppointmentClick,
  onSlotClick,
  isExpanded,
  onToggleExpanded
}: EnhancedCalendarSidebarProps) {
  const [activeStep, setActiveStep] = useState<Step>('calendar');

  const steps: { id: Step; label: string; icon: any }[] = [
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'agenda', label: 'Agenda', icon: ListTodo },
    { id: 'slots', label: 'Available Slots', icon: Clock },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === activeStep);

  return (
    <div className="relative flex h-full">
      {/* Main Sidebar with Horizontal Collapse */}
      <div
        className={`
          bg-sidebar border-r border-sidebar-border flex flex-col h-full
          transition-all duration-300 ease-in-out
          ${isExpanded ? 'w-80' : 'w-0'}
        `}
      >
        <div className={`w-80 flex flex-col h-full ${isExpanded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}>
          {/* Step Indicator */}
          <div className="p-4 border-b border-sidebar-border bg-white">
            <div className="flex items-start justify-between">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = activeStep === step.id;
                const isCompleted = index < currentStepIndex;
                const isLast = index === steps.length - 1;

                return (
                  <React.Fragment key={step.id}>
                    <button
                      onClick={() => setActiveStep(step.id)}
                      className="flex flex-col items-center gap-1.5 group flex-1"
                    >
                      <div
                        className={`
                          w-9 h-9 rounded-full flex items-center justify-center
                          transition-all border-2
                          ${isActive
                            ? 'shadow-md font-bold'
                            : isCompleted
                              ? 'bg-[#fff7ed] border-[#f97316] text-[#ea580c]'
                              : 'bg-white border-[#dddbda] text-muted-foreground group-hover:border-orange-600'
                          }
                        `}
                        style={isActive ? { backgroundColor: '#ea580c', borderColor: '#ea580c', color: 'white' } : {}}
                      >
                        <Icon className="h-4.5 w-4.5" />
                      </div>
                      <span
                        className={`
                          text-xs font-medium text-center
                          ${isActive ? 'text-orange-600' : 'text-muted-foreground'}
                        `}
                      >
                        {step.label}
                      </span>
                    </button>
                    {!isLast && (
                      <div className="flex-shrink-0 w-6 h-0.5 bg-[#dddbda] mt-4" />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-hidden">
            {activeStep === 'calendar' && (
              <MiniCalendar
                currentDate={currentDate}
                onDateChange={onDateChange}
                onNavigate={(dir) => onNavigate(dir)}
                appointments={appointments}
                therapists={therapists}
              />
            )}

            {activeStep === 'agenda' && (
              <AgendaView
                appointments={appointments}
                therapists={therapists}
                currentDate={currentDate}
                onAppointmentClick={onAppointmentClick}
              />
            )}

            {activeStep === 'slots' && (
              <div className="h-full overflow-auto p-4">
                <SlotAvailability
                  currentDate={currentDate}
                  therapistIds={selectedTherapistIds}
                  therapists={therapists}
                  viewType={currentView}
                  onSlotClick={(date, time, therapistId) => {
                    onSlotClick(date, time, therapistId);
                  }}
                />
              </div>
            )}
          </div>

          {/* Quick Info Footer */}
          <div className="p-4 border-t border-sidebar-border bg-white">
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Selected Date:</span>
                <span className="font-medium">{currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total Appointments:</span>
                <Badge variant="secondary" className="text-xs">
                  {appointments.filter(apt => {
                    const aptDate = new Date(apt.startTime);
                    return aptDate.toDateString() === currentDate.toDateString();
                  }).length}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Collapse/Expand Toggle Button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onToggleExpanded(!isExpanded);
        }}
        className={`
          absolute top-20 z-[9999]
          bg-white border border-sidebar-border rounded-r-md
          hover:bg-gray-50 transition-all duration-200
          flex items-center justify-center
          shadow-sm hover:shadow-md
          group
          cursor-pointer
          ${isExpanded ? 'left-[319px]' : 'left-0'}
        `}
        style={{
          width: '24px',
          height: '48px',
          pointerEvents: 'auto'
        }}
        aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
        title={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
      >
        {isExpanded ? (
          <ChevronLeft className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        )}
      </button>
    </div>
  );
}