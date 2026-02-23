import React, { useState, useEffect, useMemo } from 'react';
import { CalendarView, UserRole, Appointment, Therapist, CalendarState } from '../types/appointment';
import { appointmentsApi } from '../api/appointments';
import { DayView } from './DayView';
import { WeekView } from './WeekView';
import { MonthView } from './MonthView';
import { EnhancedAppointmentForm } from './EnhancedAppointmentForm';
import { AppointmentPanel } from './AppointmentPanel';
import { EnhancedCalendarSidebar } from './EnhancedCalendarSidebar';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Checkbox } from './ui/checkbox';
import { CaretLeft, CaretRight, Plus, CalendarBlank, Users, CaretDown, MagnifyingGlass } from '@phosphor-icons/react';

interface CalendarContainerProps {
  userRole: UserRole;
  currentUserId: string;
  searchQuery?: string;
  triggerNewAppointment?: number; // Counter that increments to trigger form
}

export function CalendarContainer({ userRole, currentUserId, searchQuery = '', triggerNewAppointment = 0 }: CalendarContainerProps) {
  const [state, setState] = useState<CalendarState>({
    currentDate: new Date(),
    view: 'week',
    selectedTherapistIds: userRole === 'therapist' ? [currentUserId] : [],
    userRole,
    currentUserId,
  });

  // Track if initial selection has been made to prevent auto-selection
  const [initialSelectionDone, setInitialSelectionDone] = useState(userRole === 'therapist');

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [formInitialData, setFormInitialData] = useState<{
    date?: Date;
    time?: string;
    therapistId?: string;
  } | null>(null);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  useEffect(() => {
    loadData();
  }, [state.currentDate, state.view, state.selectedTherapistIds]);

  // Handle external trigger to open appointment form (from "New" button)
  useEffect(() => {
    if (triggerNewAppointment > 0) {
      setFormInitialData(null); // No pre-filled data
      setShowAppointmentForm(true);
    }
  }, [triggerNewAppointment]);

  // Automatically collapse sidebar when appointment form opens
  useEffect(() => {
    if (showAppointmentForm) {
      setSidebarExpanded(false);
    }
  }, [showAppointmentForm]);

  // Note: Removed auto-selection - let admin users manually choose therapists



  const loadData = async () => {
    setLoading(true);
    try {
      const [appointmentsData, therapistsData] = await Promise.all([
        appointmentsApi.getAppointments(
          getStartDate().toISOString(),
          getEndDate().toISOString(),
          state.selectedTherapistIds.length > 0 ? state.selectedTherapistIds : undefined
        ),
        appointmentsApi.getTherapists(),
      ]);

      setAppointments(appointmentsData as unknown as Appointment[]);
      setTherapists(therapistsData);
    } catch (error) {
      console.error('Failed to load data:', error);
      // Set empty arrays as fallback
      setAppointments([]);
      setTherapists([]);
    } finally {
      setLoading(false);
    }
  };

  const getStartDate = () => {
    const date = new Date(state.currentDate);
    if (state.view === 'day') {
      date.setHours(0, 0, 0, 0);
      return date;
    } else if (state.view === 'week') {
      const dayOfWeek = date.getDay();
      const diff = date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust when day is Sunday
      date.setDate(diff);
      date.setHours(0, 0, 0, 0);
      return date;
    } else {
      date.setDate(1);
      date.setHours(0, 0, 0, 0);
      return date;
    }
  };

  const getEndDate = () => {
    const date = new Date(state.currentDate);
    if (state.view === 'day') {
      date.setHours(23, 59, 59, 999);
      return date;
    } else if (state.view === 'week') {
      const dayOfWeek = date.getDay();
      const diff = date.getDate() - dayOfWeek + (dayOfWeek === 0 ? 0 : 7);
      date.setDate(diff);
      date.setHours(23, 59, 59, 999);
      return date;
    } else {
      date.setMonth(date.getMonth() + 1, 0);
      date.setHours(23, 59, 59, 999);
      return date;
    }
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(state.currentDate);

    if (state.view === 'day') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    } else if (state.view === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    }

    setState(prev => ({ ...prev, currentDate: newDate }));
  };

  const handleViewChange = (view: CalendarView) => {
    setState(prev => ({ ...prev, view }));
  };

  const handleTherapistToggle = (therapistId: string, checked: boolean) => {
    if (userRole === 'therapist') return; // Therapists can't change this


    setState(prev => {
      const newSelectedIds = checked
        ? [...prev.selectedTherapistIds, therapistId]
        : prev.selectedTherapistIds.filter(id => id !== therapistId);


      return {
        ...prev,
        selectedTherapistIds: newSelectedIds
      };
    });
  };

  const handleSlotClick = (date: Date, time: string, therapistId?: string) => {
    setFormInitialData({ date, time, therapistId });
    setShowAppointmentForm(true);
  };

  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
  };

  const handleAppointmentUpdate = async (appointmentId: string, updates: Partial<Appointment>) => {
    try {
      await appointmentsApi.updateAppointment(appointmentId, updates as any);
      await loadData();
      setSelectedAppointment(null);
    } catch (error) {
      console.error('Failed to update appointment:', error);
    }
  };

  const handleAppointmentDelete = async (appointmentId: string) => {
    try {
      await appointmentsApi.deleteAppointment(appointmentId);
      await loadData();
      setSelectedAppointment(null);
    } catch (error) {
      console.error('Failed to delete appointment:', error);
    }
  };

  const handleAppointmentCreate = async (appointmentData: Omit<Appointment, 'id'>) => {
    try {
      await appointmentsApi.createAppointment(appointmentData as any);
      await loadData();
      setShowAppointmentForm(false);
      setFormInitialData(null);
    } catch (error) {
      console.error('Failed to create appointment:', error);
    }
  };

  const formatDateHeader = () => {
    const date = state.currentDate;
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long'
    };

    if (state.view === 'day') {
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } else if (state.view === 'week') {
      const startOfWeek = getStartDate();
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      return `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    } else {
      return date.toLocaleDateString('en-US', options);
    }
  };

  const currentTherapists = useMemo(() => {
    if (userRole === 'admin') {
      return therapists.filter(t => state.selectedTherapistIds.includes(t.id));
    } else if (userRole === 'therapist') {
      // For therapists, try to find their profile in the therapists list
      const therapistProfile = therapists.find(t => t.id === currentUserId);

      if (therapistProfile) {
        return [therapistProfile];
      } else {
        // If therapist profile not found, create a minimal profile so calendar still works
        console.warn(`Therapist profile not found for ID: ${currentUserId}. Creating minimal profile.`);
        return [{
          id: currentUserId,
          name: 'You',
          email: '',
          color: '#0176d3',
          availability: []
        }];
      }
    }
    return [];
  }, [userRole, therapists, currentUserId, state.selectedTherapistIds]);

  // Debug logging for therapist filtering

  // Filter appointments based on search query
  const filteredAppointments = useMemo(() => {
    if (!searchQuery || searchQuery.trim() === '') {
      return appointments;
    }

    const query = searchQuery.toLowerCase().trim();

    const filtered = appointments.filter(appointment => {
      // Search in client name (using clientName field)
      if (appointment.clientName?.toLowerCase().includes(query)) {
        return true;
      }

      // Search in title
      if (appointment.title?.toLowerCase().includes(query)) {
        return true;
      }

      // Search in appointment type
      if (appointment.type?.toLowerCase().includes(query)) {
        return true;
      }

      // Search in notes
      if (appointment.notes?.toLowerCase().includes(query)) {
        return true;
      }

      // Search in therapist name
      const therapist = therapists.find(t => t.id === appointment.therapistId);
      if (therapist?.name?.toLowerCase().includes(query)) {
        return true;
      }

      return false;
    });

    return filtered;
  }, [appointments, searchQuery, therapists]);

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header - Fantastical Style */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-[rgb(255,255,255)]">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={() => navigateDate('prev')} className="h-8 w-8 p-0">
              <CaretLeft className="h-4 w-4" weight="bold" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigateDate('next')} className="h-8 w-8 p-0">
              <CaretRight className="h-4 w-4" weight="bold" />
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setState(prev => ({ ...prev, currentDate: new Date() }))}
            className="px-3 py-1 h-8"
          >
            Today
          </Button>

          <h1 className="text-xl font-semibold text-foreground">{formatDateHeader()}</h1>

          {/* Search Results Indicator */}
          {searchQuery && searchQuery.trim() !== '' && (
            <div className="ml-4 px-3 py-1 bg-blue-50 border border-blue-200 rounded-md flex items-center gap-2">
              <MagnifyingGlass className="h-4 w-4 text-blue-600" weight="bold" />
              <span className="text-sm text-blue-700">
                {filteredAppointments.length} {filteredAppointments.length === 1 ? 'result' : 'results'} found
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* View Switcher - Fantastical Style */}
          <div className="flex items-center bg-white border border-border rounded-lg p-0.5">
            {(['day', 'week', 'month'] as CalendarView[]).map((view) => (
              <Button
                key={view}
                variant={state.view === view ? "default" : "ghost"}
                size="sm"
                onClick={() => handleViewChange(view)}
                className="capitalize text-sm px-4 py-1.5 h-8"
              >
                {view}
              </Button>
            ))}
          </div>

          {/* Therapist Filter (Admin only) - Simplified */}
          {userRole === 'admin' && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9">
                  <Users className="h-4 w-4 mr-2" weight="duotone" />
                  {state.selectedTherapistIds.length === 0
                    ? "Doctors"
                    : state.selectedTherapistIds.length === therapists.length && therapists.length > 0
                      ? "All Doctors"
                      : `${state.selectedTherapistIds.length} Doctor${state.selectedTherapistIds.length !== 1 ? 's' : ''}`
                  }
                  <CaretDown className="h-4 w-4 ml-2" weight="bold" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-80 max-h-96 overflow-y-auto">
                <DropdownMenuLabel>Select Doctors</DropdownMenuLabel>
                <DropdownMenuSeparator />

                {/* Quick Actions */}
                <div className="flex gap-2 p-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setState(prev => ({ ...prev, selectedTherapistIds: therapists.map(t => t.id) }));
                    }}
                  >
                    Select All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setState(prev => ({ ...prev, selectedTherapistIds: [] }));
                    }}
                  >
                    Select None
                  </Button>
                </div>

                <DropdownMenuSeparator />

                {/* Doctor List */}
                {therapists.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No doctors available
                  </div>
                ) : (
                  therapists.map(therapist => (
                    <DropdownMenuItem
                      key={therapist.id}
                      className="flex items-center gap-3 p-3 cursor-pointer focus:bg-accent"
                      onSelect={(e) => e.preventDefault()}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const isCurrentlySelected = state.selectedTherapistIds.includes(therapist.id);
                        handleTherapistToggle(therapist.id, !isCurrentlySelected);
                      }}
                    >
                      <Checkbox
                        id={`dropdown-${therapist.id}`}
                        checked={state.selectedTherapistIds.includes(therapist.id)}
                        onCheckedChange={(checked) => {
                          handleTherapistToggle(therapist.id, checked as boolean);
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div
                        className="w-4 h-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: therapist.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{therapist.name}</div>
                        <div className="text-xs text-muted-foreground truncate">{therapist.email}</div>
                      </div>
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <Button onClick={() => setShowAppointmentForm(true)} size="sm" className="h-9">
            <Plus className="h-4 w-4 mr-2" weight="bold" />
            New
          </Button>
        </div>
      </div>

      {/* Main Content Area with Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Enhanced Sidebar with Stepper */}
        <EnhancedCalendarSidebar
          currentDate={state.currentDate}
          appointments={filteredAppointments}
          therapists={therapists}
          selectedTherapistIds={state.selectedTherapistIds}
          currentView={state.view}
          onDateChange={(date) => setState(prev => ({ ...prev, currentDate: date, view: 'day' }))}
          onNavigate={navigateDate}
          onAppointmentClick={handleAppointmentClick}
          onSlotClick={handleSlotClick}
          isExpanded={sidebarExpanded}
          onToggleExpanded={setSidebarExpanded}
        />

        {/* Calendar Content */}
        <div className="flex-1 overflow-hidden h-full relative min-h-0">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : userRole === 'admin' && state.selectedTherapistIds.length === 0 ? (
            <div className="flex items-center justify-center h-full bg-white">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-muted/50 rounded-full flex items-center justify-center">
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-muted-foreground">No Doctors Selected</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Please select one or more doctors from the dropdown to view their calendars.
                  </p>
                </div>
              </div>
            </div>
          ) : userRole === 'therapist' && currentTherapists.length === 0 ? (
            <div className="flex items-center justify-center h-full bg-white">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-blue-50 rounded-full flex items-center justify-center">
                  <CalendarBlank className="h-8 w-8 text-blue-600" weight="duotone" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-foreground">Your Calendar</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {filteredAppointments.length === 0
                      ? "You don't have any appointments scheduled yet."
                      : "Loading your calendar..."}
                  </p>
                  <Button
                    onClick={() => setShowAppointmentForm(true)}
                    className="mt-4"
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-2" weight="bold" />
                    Schedule Appointment
                  </Button>
                </div>
              </div>
            </div>
          ) : searchQuery && filteredAppointments.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-blue-50 rounded-full flex items-center justify-center">
                  <MagnifyingGlass className="h-8 w-8 text-blue-600" weight="bold" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-foreground">No Results Found</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    No appointments match "{searchQuery}"
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Try searching by client name, therapist, or appointment type
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
              {state.view === 'day' && (
                <DayView
                  date={state.currentDate}
                  appointments={filteredAppointments}
                  therapists={currentTherapists}
                  onSlotClick={handleSlotClick}
                  onAppointmentClick={handleAppointmentClick}
                  onAppointmentUpdate={handleAppointmentUpdate}
                  showMultipleTherapists={userRole === 'admin' && currentTherapists.length > 1}
                  isAdminMode={userRole === 'admin'}
                />
              )}
              {state.view === 'week' && (
                <WeekView
                  startDate={getStartDate()}
                  appointments={filteredAppointments}
                  therapists={currentTherapists}
                  onSlotClick={handleSlotClick}
                  onAppointmentClick={handleAppointmentClick}
                  onAppointmentUpdate={handleAppointmentUpdate}
                  showMultipleTherapists={userRole === 'admin' && currentTherapists.length > 1}
                  isAdminMode={userRole === 'admin'}
                />
              )}
              {state.view === 'month' && (
                <MonthView
                  date={state.currentDate}
                  appointments={filteredAppointments}
                  therapists={currentTherapists}
                  onDayClick={(date) => setState(prev => ({ ...prev, currentDate: date, view: 'day' }))}
                  onAppointmentClick={handleAppointmentClick}
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* Enhanced Appointment Form Modal */}
      {showAppointmentForm && (
        <EnhancedAppointmentForm
          isOpen={showAppointmentForm}
          onClose={() => {
            setShowAppointmentForm(false);
            setFormInitialData(null);
          }}
          onSave={handleAppointmentCreate}
          therapists={therapists}
          initialData={formInitialData}
        />
      )}

      {/* Appointment Detail Panel */}
      {selectedAppointment && (
        <AppointmentPanel
          appointment={selectedAppointment}
          isOpen={!!selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
          onUpdate={handleAppointmentUpdate}
          onDelete={handleAppointmentDelete}
          therapists={therapists}
        />
      )}
    </div>
  );
}