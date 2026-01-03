import React, { useState, useEffect } from 'react';
import { Appointment, Therapist, Client } from '../types/appointment';
import { appointmentsApi } from '../api/appointments';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Checkbox } from './ui/checkbox';
import { X, Calendar as CalendarIcon, Clock, User, FileText, Flag, Palette, Coffee, Users, Building2, Sparkles, Video, Phone } from 'lucide-react';
import { Badge } from './ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Separator } from './ui/separator';
import { generateRoomName, getJitsiDomain, generateJitsiJWT } from '../services/jitsiService';

interface EnhancedAppointmentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (appointment: Omit<Appointment, 'id'>) => void;
  therapists: Therapist[];
  initialData?: {
    date?: Date;
    time?: string;
    therapistId?: string;
  } | null;
  editingAppointment?: Appointment;
}

const PRESET_COLORS = [
  { name: 'Ocean Blue', value: '#0176d3' },
  { name: 'Emerald', value: '#2e844a' },
  { name: 'Amethyst', value: '#9050e9' },
  { name: 'Sunset', value: '#F97316' },
  { name: 'Ruby', value: '#ea001e' },
  { name: 'Turquoise', value: '#06a59a' },
  { name: 'Rose', value: '#e91e63' },
  { name: 'Indigo', value: '#5e35b1' },
  { name: 'Amber', value: '#F59E0B' },
  { name: 'Cyan', value: '#00acc1' },
];

const APPOINTMENT_TYPES = [
  { value: 'appointment', label: 'Client Session', icon: User },
  { value: 'break', label: 'Break', icon: Coffee },
  { value: 'internal', label: 'Team Meeting', icon: Users },
  { value: 'external', label: 'External', icon: Building2 },
];

const DURATION_PRESETS = [
  { value: '30', label: '30 min' },
  { value: '45', label: '45 min' },
  { value: '60', label: '1 hour' },
  { value: '90', label: '1.5 hours' },
  { value: '120', label: '2 hours' },
];

export function EnhancedAppointmentForm({
  isOpen,
  onClose,
  onSave,
  therapists,
  initialData,
  editingAppointment,
}: EnhancedAppointmentFormProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [formData, setFormData] = useState({
    therapistId: '',
    clientId: '',
    title: '',
    date: '',
    startTime: '',
    endTime: '',
    type: 'appointment' as 'appointment' | 'break' | 'internal' | 'external',
    status: 'confirmed' as 'confirmed' | 'pending',
    notes: '',
    color: '',
    customColor: '',
    flagged: false,
    flagNote: '',
    isVideoCall: false,
    videoCallType: 'video' as 'video' | 'audio',
  });

  useEffect(() => {
    if (isOpen) {
      loadClients();
      initializeForm();
    }
  }, [isOpen, initialData, editingAppointment]);

  const loadClients = async () => {
    try {
      const clientsData = await appointmentsApi.getClients();
      setClients(clientsData);
    } catch (error) {
      console.error('Failed to load clients:', error);
    }
  };

  const initializeForm = () => {
    if (editingAppointment) {
      const startDate = new Date(editingAppointment.startTime);
      const endDate = new Date(editingAppointment.endTime);
      
      setFormData({
        therapistId: editingAppointment.therapistId,
        clientId: editingAppointment.clientId,
        title: editingAppointment.title,
        date: startDate.toISOString().split('T')[0],
        startTime: startDate.toTimeString().slice(0, 5),
        endTime: endDate.toTimeString().slice(0, 5),
        type: editingAppointment.type,
        status: editingAppointment.status,
        notes: editingAppointment.notes || '',
        color: editingAppointment.color,
        customColor: editingAppointment.customColor || '',
        flagged: editingAppointment.flagged || false,
        flagNote: editingAppointment.flagNote || '',
        isVideoCall: editingAppointment.isVideoCall || false,
        videoCallType: editingAppointment.videoCallType || 'video',
      });
    } else {
      const date = initialData?.date || new Date();
      const time = initialData?.time || '09:00';
      const therapistId = initialData?.therapistId || therapists[0]?.id || '';
      const selectedTherapist = therapists.find(t => t.id === therapistId);
      
      const [hours, minutes] = time.split(':').map(Number);
      const endHours = hours + 1;
      const endTime = `${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      
      setFormData({
        therapistId,
        clientId: '',
        title: '',
        date: date.toISOString().split('T')[0],
        startTime: time,
        endTime,
        type: 'appointment',
        status: 'confirmed',
        notes: '',
        color: selectedTherapist?.color || '#0176d3',
        customColor: '',
        flagged: false,
        flagNote: '',
        isVideoCall: false,
        videoCallType: 'video',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const startDateTime = new Date(`${formData.date}T${formData.startTime}`);
      const endDateTime = new Date(`${formData.date}T${formData.endTime}`);
      
      const selectedClient = clients.find(c => c.id === formData.clientId);
      const selectedTherapist = therapists.find(t => t.id === formData.therapistId);
      
      let title = formData.title;
      if (!title) {
        if (formData.type === 'break') {
          title = 'Break';
        } else if (formData.type === 'internal') {
          title = 'Internal Meeting';
        } else if (formData.type === 'external') {
          title = 'External Meeting';
        } else {
          title = `Session with ${selectedClient?.name || 'Client'}`;
        }
      }
      
      const appointmentData: Omit<Appointment, 'id'> = {
        therapistId: formData.therapistId,
        clientId: formData.clientId,
        title,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        type: formData.type,
        status: formData.status,
        color: formData.customColor || formData.color || selectedTherapist?.color || '#0176d3',
        customColor: formData.customColor,
        createdBy: 'therapist',
        notes: formData.notes,
        clientName: selectedClient?.name,
        therapistName: selectedTherapist?.name,
        flagged: formData.flagged,
        flagNote: formData.flagNote,
        isVideoCall: formData.isVideoCall,
        videoCallType: formData.videoCallType,
      };

      // Generate video call data if enabled
      if (formData.isVideoCall) {
        try {
          const roomName = generateRoomName(Date.now().toString());
          const domain = getJitsiDomain();
          
          // Generate JWT token for the therapist (moderator)
          const jwt = await generateJitsiJWT(
            roomName,
            selectedTherapist?.name || 'Therapist',
            selectedTherapist?.email,
            formData.therapistId,
            true, // therapist is moderator
            undefined // appointmentId will be added after creation
          );
          
          appointmentData.videoCallRoomName = roomName;
          appointmentData.videoCallUrl = `https://${domain}/${roomName}`;
          appointmentData.videoCallJWT = jwt;
        } catch (error) {
          console.error('Failed to generate video call data:', error);
          // Continue with saving appointment even if video call setup fails
        }
      }

      await onSave(appointmentData);
      onClose();
    } catch (error) {
      console.error('Failed to save appointment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (field === 'therapistId' && !formData.customColor) {
      const therapist = therapists.find(t => t.id === value);
      if (therapist) {
        setFormData(prev => ({ ...prev, color: therapist.color }));
      }
    }
  };

  const handleDurationChange = (duration: string) => {
    const [startHours, startMinutes] = formData.startTime.split(':').map(Number);
    const durationMinutes = parseInt(duration);
    
    const endTime = new Date();
    endTime.setHours(startHours, startMinutes + durationMinutes, 0, 0);
    
    const endTimeString = `${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}`;
    setFormData(prev => ({ ...prev, endTime: endTimeString }));
  };

  const handleColorSelect = (color: string) => {
    setFormData(prev => ({ ...prev, customColor: color, color }));
    setShowColorPicker(false);
  };

  const currentDisplayColor = formData.customColor || formData.color;
  const selectedType = APPOINTMENT_TYPES.find(t => t.value === formData.type);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-3xl p-0 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-8 pt-8 pb-6 bg-gradient-to-b from-muted/30 to-background border-b flex-shrink-0">
          <SheetHeader>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-[#F97316]/10 flex items-center justify-center">
                <CalendarIcon className="h-5 w-5 text-[#F97316]" />
              </div>
              <div>
                <SheetTitle className="text-2xl font-medium leading-7">
                  {editingAppointment ? 'Edit Appointment' : 'New Appointment'}
                </SheetTitle>
                <SheetDescription className="text-sm text-muted-foreground mt-1">
                  {editingAppointment 
                    ? 'Update appointment details and save changes'
                    : 'Schedule a new session or block time on calendar'
                  }
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="overflow-y-auto px-8 pb-8 flex-1">
          <div className="space-y-8 py-6">
            {/* Appointment Type Section */}
            <div className="space-y-5">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#F97316]" />
                <Label className="text-base">Appointment Type</Label>
              </div>
              <RadioGroup
                value={formData.type}
                onValueChange={(value: 'appointment' | 'break' | 'internal' | 'external') => 
                  handleInputChange('type', value)
                }
                className="grid grid-cols-2 gap-4"
              >
                {APPOINTMENT_TYPES.map((type) => {
                  const Icon = type.icon;
                  const isSelected = formData.type === type.value;
                  return (
                    <Label
                      key={type.value}
                      htmlFor={type.value}
                      className={`
                        relative flex items-center gap-4 border-2 rounded-xl p-5 cursor-pointer transition-all group
                        ${isSelected 
                          ? 'border-[#F97316] bg-[#F97316]/5 shadow-sm' 
                          : 'border-border hover:border-[#F97316]/30 hover:bg-accent/50'
                        }
                      `}
                    >
                      <RadioGroupItem value={type.value} id={type.value} className="sr-only" />
                      <div className={`
                        w-14 h-14 rounded-xl flex items-center justify-center transition-all flex-shrink-0
                        ${isSelected ? 'bg-[#F97316] text-white shadow-md shadow-[#F97316]/20' : 'bg-muted text-muted-foreground group-hover:bg-muted/80'}
                      `}>
                        <Icon className="h-7 w-7" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`text-base ${isSelected ? '' : ''}`}>
                          {type.label}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {type.value === 'appointment' && 'One-on-one therapy session'}
                          {type.value === 'break' && 'Personal break or lunch'}
                          {type.value === 'internal' && 'Internal staff meeting'}
                          {type.value === 'external' && 'Outside appointment'}
                        </div>
                      </div>
                    </Label>
                  );
                })}
              </RadioGroup>
            </div>

            <Separator />

            {/* Provider & Styling */}
            <div className="space-y-5">
              <Label className="text-base">Provider & Styling</Label>
              <div className="grid grid-cols-2 gap-6">
                {/* Therapist Selection */}
                <div className="space-y-2.5">
                  <Label htmlFor="therapist" className="text-sm text-muted-foreground">
                    Therapist / Provider
                  </Label>
                  <Select value={formData.therapistId} onValueChange={(value) => handleInputChange('therapistId', value)}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select therapist" />
                    </SelectTrigger>
                    <SelectContent>
                      {therapists.map(therapist => (
                        <SelectItem key={therapist.id} value={therapist.id}>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full flex-shrink-0"
                              style={{ backgroundColor: therapist.color }}
                            />
                            <span>{therapist.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Color Picker */}
                <div className="space-y-2.5">
                  <Label className="text-sm text-muted-foreground">
                    Calendar Color
                  </Label>
                  <Popover open={showColorPicker} onOpenChange={setShowColorPicker}>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full h-12 justify-start"
                      >
                        <div
                          className="w-7 h-7 rounded-md border border-border mr-2.5 flex-shrink-0"
                          style={{ backgroundColor: currentDisplayColor }}
                        />
                        <span className="text-sm">{formData.customColor ? 'Custom Color' : 'Default Color'}</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-5">
                      <div className="space-y-5">
                        <div>
                          <h4 className="text-sm mb-3.5">Preset Colors</h4>
                          <div className="grid grid-cols-5 gap-2.5">
                            {PRESET_COLORS.map((color) => (
                              <button
                                key={color.value}
                                type="button"
                                onClick={() => handleColorSelect(color.value)}
                                className="w-full aspect-square rounded-lg border-2 transition-all hover:scale-105"
                                style={{ 
                                  backgroundColor: color.value,
                                  borderColor: currentDisplayColor === color.value ? '#F97316' : 'transparent'
                                }}
                                title={color.name}
                              />
                            ))}
                          </div>
                        </div>
                        <Separator />
                        <div className="space-y-2.5">
                          <Label className="text-sm">Custom Color</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              type="color"
                              value={currentDisplayColor}
                              onChange={(e) => handleColorSelect(e.target.value)}
                              className="w-16 h-11 cursor-pointer p-1"
                            />
                          </div>
                        </div>
                        {formData.customColor && (
                          <>
                            <Separator />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="w-full"
                              onClick={() => {
                                setFormData(prev => ({ ...prev, customColor: '' }));
                                const therapist = therapists.find(t => t.id === formData.therapistId);
                                if (therapist) {
                                  setFormData(prev => ({ ...prev, color: therapist.color }));
                                }
                                setShowColorPicker(false);
                              }}
                            >
                              Reset to Provider Color
                            </Button>
                          </>
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            {/* Client Selection (only for appointments) */}
            {formData.type === 'appointment' && (
              <>
                <Separator />
                <div className="space-y-5">
                  <Label className="text-base">Client Information</Label>
                  <div className="space-y-2.5">
                    <Label htmlFor="client" className="text-sm text-muted-foreground">
                      Select Client
                    </Label>
                    <Select value={formData.clientId} onValueChange={(value) => handleInputChange('clientId', value)}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Choose a client for this session" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map(client => (
                          <SelectItem key={client.id} value={client.id}>
                            <div className="py-1">
                              <div>{client.name}</div>
                              <div className="text-xs text-muted-foreground mt-0.5">
                                <Badge variant="secondary" className="mr-2 text-xs">{client.membershipType}</Badge>
                                {client.phone}
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Title Override */}
                  <div className="space-y-2.5">
                    <Label htmlFor="title" className="text-sm text-muted-foreground">
                      Session Title <span className="text-xs">(optional)</span>
                    </Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="Auto-generated from client name"
                      className="h-12"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Title for non-appointments */}
            {formData.type !== 'appointment' && (
              <>
                <Separator />
                <div className="space-y-2.5">
                  <Label htmlFor="title" className="text-sm text-muted-foreground">
                    Title
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder={
                      formData.type === 'break' ? 'e.g., Lunch Break' : 
                      formData.type === 'internal' ? 'e.g., Team Standup' :
                      'e.g., Conference, Training'
                    }
                    className="h-12"
                  />
                </div>
              </>
            )}

            <Separator />

            {/* Date & Time Section */}
            <div className="space-y-5">
              <Label className="text-base">Schedule</Label>
              
              {/* Date */}
              <div className="space-y-2.5">
                <Label htmlFor="date" className="text-sm text-muted-foreground">
                  Date
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  required
                  className="h-12"
                />
              </div>

              {/* Time */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2.5">
                  <Label htmlFor="startTime" className="text-sm text-muted-foreground">
                    Start Time
                  </Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => handleInputChange('startTime', e.target.value)}
                    required
                    className="h-12"
                  />
                </div>
                <div className="space-y-2.5">
                  <Label htmlFor="endTime" className="text-sm text-muted-foreground">
                    End Time
                  </Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => handleInputChange('endTime', e.target.value)}
                    required
                    className="h-12"
                  />
                </div>
              </div>

              {/* Duration Quick Selects */}
              <div className="space-y-2.5">
                <Label className="text-sm text-muted-foreground">Quick Duration</Label>
                <div className="flex flex-wrap gap-2">
                  {DURATION_PRESETS.map(preset => (
                    <Button
                      key={preset.value}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleDurationChange(preset.value)}
                      className="h-10 px-4"
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Video Call Section - Only for appointments */}
            {formData.type === 'appointment' && (
              <>
                <Separator />
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Video Call</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Enable video/audio calling for this appointment
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="isVideoCall"
                        checked={formData.isVideoCall}
                        onCheckedChange={(checked) => handleInputChange('isVideoCall', checked as boolean)}
                      />
                      <Label htmlFor="isVideoCall" className="cursor-pointer text-sm">
                        Enable
                      </Label>
                    </div>
                  </div>

                  {/* Video Call Type Selection */}
                  {formData.isVideoCall && (
                    <div className="mt-4 space-y-3 p-5 bg-muted/30 rounded-xl border border-border">
                      <Label className="text-sm text-muted-foreground">Call Type</Label>
                      <RadioGroup
                        value={formData.videoCallType}
                        onValueChange={(value: 'video' | 'audio') => 
                          handleInputChange('videoCallType', value)
                        }
                        className="grid grid-cols-2 gap-3"
                      >
                        <Label
                          htmlFor="video-call"
                          className={`
                            flex items-center gap-3 border-2 rounded-lg p-4 cursor-pointer transition-all
                            ${formData.videoCallType === 'video'
                              ? 'border-[#F97316] bg-[#F97316]/5' 
                              : 'border-border hover:border-[#F97316]/30'
                            }
                          `}
                        >
                          <RadioGroupItem value="video" id="video-call" className="sr-only" />
                          <div className={`
                            w-10 h-10 rounded-lg flex items-center justify-center
                            ${formData.videoCallType === 'video' ? 'bg-[#F97316] text-white' : 'bg-muted text-muted-foreground'}
                          `}>
                            <Video className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">Video Call</div>
                            <div className="text-xs text-muted-foreground">Camera + Audio</div>
                          </div>
                        </Label>

                        <Label
                          htmlFor="audio-call"
                          className={`
                            flex items-center gap-3 border-2 rounded-lg p-4 cursor-pointer transition-all
                            ${formData.videoCallType === 'audio'
                              ? 'border-[#F97316] bg-[#F97316]/5' 
                              : 'border-border hover:border-[#F97316]/30'
                            }
                          `}
                        >
                          <RadioGroupItem value="audio" id="audio-call" className="sr-only" />
                          <div className={`
                            w-10 h-10 rounded-lg flex items-center justify-center
                            ${formData.videoCallType === 'audio' ? 'bg-[#F97316] text-white' : 'bg-muted text-muted-foreground'}
                          `}>
                            <Phone className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">Audio Only</div>
                            <div className="text-xs text-muted-foreground">Voice call</div>
                          </div>
                        </Label>
                      </RadioGroup>

                      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-start gap-2">
                          <Video className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-blue-700">
                            A unique video call link will be generated. Both you and the client will be able to join the call from the appointment details.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            <Separator />

            {/* Status */}
            <div className="space-y-5">
              <Label className="text-base">Status</Label>
              <Select value={formData.status} onValueChange={(value: 'confirmed' | 'pending') => handleInputChange('status', value)}>
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="confirmed">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      Confirmed
                    </div>
                  </SelectItem>
                  <SelectItem value="pending">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-amber-500" />
                      Pending Confirmation
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Follow-up Flag */}
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <Label className="text-base">Follow-up Actions</Label>
                <Checkbox
                  id="flagged"
                  checked={formData.flagged}
                  onCheckedChange={(checked) => handleInputChange('flagged', checked as boolean)}
                />
              </div>
              
              {formData.flagged && (
                <div className="rounded-xl border-2 border-[#F97316]/20 bg-[#F97316]/5 p-5 space-y-3">
                  <div className="flex items-center gap-2 text-[#F97316]">
                    <Flag className="h-4 w-4" />
                    <span className="text-sm">This appointment is flagged for follow-up</span>
                  </div>
                  <Input
                    id="flagNote"
                    value={formData.flagNote}
                    onChange={(e) => handleInputChange('flagNote', e.target.value)}
                    placeholder="e.g., Schedule next session, Send intake forms, Follow up on homework..."
                    className="h-12 bg-background"
                  />
                </div>
              )}
            </div>

            <Separator />

            {/* Notes */}
            <div className="space-y-4">
              <Label className="text-base">Additional Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Add any relevant notes, special instructions, or reminders for this appointment..."
                rows={5}
                className="resize-none"
              />
            </div>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="px-8 py-5 bg-background border-t flex justify-end gap-3 flex-shrink-0">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
            className="px-8 h-11"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={loading}
            className="px-8 h-11 bg-[#F97316] hover:bg-[#ea580c] text-white shadow-lg shadow-[#F97316]/20"
            onClick={handleSubmit}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </span>
            ) : (
              <span>{editingAppointment ? 'Update' : 'Create'} Appointment</span>
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}