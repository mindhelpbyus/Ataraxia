import React, { useState, useEffect } from 'react';
import { Appointment, Therapist, Client } from '../types/appointment';
import { appointmentsApi } from '../api/appointments';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  FileText,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle2,
  MapPin,
  X,
  Save,
  XCircle,
  Video,
  PhoneCall
} from 'lucide-react';
import { VideoCallRoom } from './VideoCallRoom';
import { generateRoomName } from '../api/jitsi';
import { createCallInvitation } from '../api/calls';

interface AppointmentPanelProps {
  appointment: Appointment;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (appointmentId: string, updates: Partial<Appointment>) => void;
  onDelete: (appointmentId: string) => void;
  therapists: Therapist[];
  currentUserId?: string;
  currentUserName?: string;
  currentUserEmail?: string;
}

export function AppointmentPanel({
  appointment,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
  therapists,
  currentUserId = '1',
  currentUserName = 'User',
  currentUserEmail = 'user@bedrock.health',
}: AppointmentPanelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [callType, setCallType] = useState<'video' | 'audio'>('video');

  // Form state
  const [formData, setFormData] = useState({
    therapistId: appointment.therapistId,
    clientId: '',
    clientName: appointment.clientName || '',
    title: appointment.title,
    date: new Date(appointment.startTime).toISOString().split('T')[0],
    startTime: new Date(appointment.startTime).toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    }),
    duration: '60',
    type: appointment.type,
    status: appointment.status as 'confirmed' | 'pending',
    notes: appointment.notes || '',
  });

  useEffect(() => {
    if (isOpen) {
      loadClients();
      // Reset form when appointment changes
      setFormData({
        therapistId: appointment.therapistId,
        clientId: '',
        clientName: appointment.clientName || '',
        title: appointment.title,
        date: new Date(appointment.startTime).toISOString().split('T')[0],
        startTime: new Date(appointment.startTime).toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit'
        }),
        duration: calculateDuration(),
        type: appointment.type,
        status: appointment.status as 'confirmed' | 'pending',
        notes: appointment.notes || '',
      });
      setIsEditing(false);
    }
  }, [isOpen, appointment]);

  const loadClients = async () => {
    try {
      const clientsData = await appointmentsApi.getClients();
      setClients(clientsData as unknown as Client[]);
    } catch (error) {
      console.error('Failed to load clients:', error);
    }
  };

  const calculateDuration = () => {
    const start = new Date(appointment.startTime);
    const end = new Date(appointment.endTime);
    const minutes = (end.getTime() - start.getTime()) / (1000 * 60);
    return minutes.toString();
  };

  const therapist = therapists.find(t => t.id === formData.therapistId);

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }),
    };
  };

  const getDuration = () => {
    const start = new Date(appointment.startTime);
    const end = new Date(appointment.endTime);
    const minutes = (end.getTime() - start.getTime()) / (1000 * 60);

    if (minutes < 60) {
      return `${minutes} minutes`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours} hour${hours > 1 ? 's' : ''}${remainingMinutes > 0 ? ` ${remainingMinutes} minutes` : ''}`;
    }
  };

  const handleStatusToggle = async () => {
    setLoading(true);
    try {
      const newStatus = appointment.status === 'confirmed' ? 'pending' : 'confirmed';
      await onUpdate(appointment.id, { status: newStatus });
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      setLoading(true);
      try {
        await onDelete(appointment.id);
        onClose();
      } catch (error) {
        console.error('Failed to delete appointment:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Create start datetime
      const startDateTime = new Date(`${formData.date}T${formData.startTime}`);

      // Calculate end datetime
      const endDateTime = new Date(startDateTime);
      endDateTime.setMinutes(startDateTime.getMinutes() + parseInt(formData.duration));

      // Find selected therapist for color
      const selectedTherapist = therapists.find(t => t.id === formData.therapistId);

      const updates: Partial<Appointment> = {
        therapistId: formData.therapistId,
        clientName: formData.clientName,
        title: formData.title,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        type: formData.type,
        status: formData.status,
        notes: formData.notes,
        color: selectedTherapist?.color || appointment.color,
      };

      await onUpdate(appointment.id, updates);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update appointment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form to original values
    setFormData({
      therapistId: appointment.therapistId,
      clientId: '',
      clientName: appointment.clientName || '',
      title: appointment.title,
      date: new Date(appointment.startTime).toISOString().split('T')[0],
      startTime: new Date(appointment.startTime).toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit'
      }),
      duration: calculateDuration(),
      type: appointment.type,
      status: appointment.status as 'confirmed' | 'pending',
      notes: appointment.notes || '',
    });
    setIsEditing(false);
  };

  const startDateTime = formatDateTime(appointment.startTime);
  const endDateTime = formatDateTime(appointment.endTime);

  const handleStartCall = async (type: 'video' | 'audio') => {
    setCallType(type);

    // If appointment has video call scheduled, use stored room and JWT
    if (appointment.isVideoCall && appointment.videoCallRoomName) {
      setShowVideoCall(true);
    } else {
      // Create ad-hoc call
      setShowVideoCall(true);

      // Create call invitation if appointment has a client
      if (appointment.clientName) {
        try {
          const roomName = generateRoomName(appointment.id);
          // In production, get actual client ID and details
          await createCallInvitation(
            type,
            roomName,
            currentUserId,
            currentUserName,
            'client-id', // Replace with actual client ID
            appointment.clientName
          );
        } catch (error) {
          console.error('Error creating call invitation:', error);
        }
      }
    }
  };

  return (
    <>
      {/* Video Call Modal */}
      {showVideoCall && (
        <VideoCallRoom
          roomName={appointment.videoCallRoomName || generateRoomName(appointment.id)}
          userName={currentUserName}
          userEmail={currentUserEmail}
          userId={currentUserId}
          participantIds={[appointment.therapistId]}
          participantNames={{ [appointment.therapistId]: therapist?.name || 'Therapist' }}
          onClose={() => setShowVideoCall(false)}
          appointmentId={appointment.id}
          callType={appointment.videoCallType || callType}
          jwtToken={appointment.videoCallJWT}
          isModerator={currentUserId === appointment.therapistId}
        />
      )}

      {/* Appointment Panel */}
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="w-96 overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: therapist?.color || appointment.color }}
              />
              {isEditing ? 'Edit Appointment' : appointment.title}
            </SheetTitle>
            <SheetDescription>
              {isEditing ? 'Update the appointment details below' : 'View and manage appointment details'}
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            {!isEditing ? (
              <>
                {/* View Mode */}
                {/* Status and Type Badges */}
                <div className="flex gap-2 flex-wrap">
                  <Badge
                    variant={appointment.status === 'confirmed' ? 'orange' : 'yellow'}
                    dot
                    size="sm"
                  >
                    {appointment.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                  </Badge>

                  {appointment.type === 'break' && (
                    <Badge variant="neutral-square" size="sm">Break</Badge>
                  )}

                  {appointment.type === 'internal' && (
                    <Badge variant="purple-square" size="sm">Tentative</Badge>
                  )}

                  {appointment.createdBy === 'client' && (
                    <Badge variant="green" size="sm">
                      Self-booked
                    </Badge>
                  )}
                </div>

                {/* Date and Time */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{startDateTime.date}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">
                        {startDateTime.time} - {endDateTime.time}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Duration: {getDuration()}
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Therapist Information */}
                {therapist && (
                  <div className="space-y-3">
                    <h3 className="font-medium flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Therapist
                    </h3>

                    <div className="bg-muted/30 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: therapist.color }}
                        />
                        <span className="font-medium">{therapist.name}</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        <span>{therapist.email}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Client Information (for appointments) */}
                {appointment.type !== 'break' && appointment.clientName && (
                  <div className="space-y-3">
                    <h3 className="font-medium flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Client
                    </h3>

                    <div className="bg-muted/30 rounded-lg p-3">
                      <div className="font-medium mb-2">{appointment.clientName}</div>

                      {/* Mock client details - in real app, this would come from client data */}
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Phone className="h-3 w-3" />
                          <span>+1 (555) 123-4567</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="h-3 w-3" />
                          <span>{appointment.clientName?.toLowerCase().replace(' ', '.')}@email.com</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notes */}
                {appointment.notes && (
                  <div className="space-y-3">
                    <h3 className="font-medium flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Notes
                    </h3>

                    <div className="bg-muted/30 rounded-lg p-3">
                      <p className="text-sm whitespace-pre-wrap">{appointment.notes}</p>
                    </div>
                  </div>
                )}

                <Separator />

                {/* Call Actions */}
                {appointment.type === 'appointment' && appointment.clientName && (
                  <>
                    <div className="space-y-3">
                      {/* Show scheduled video call section if appointment has video call enabled */}
                      {appointment.isVideoCall ? (
                        <>
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium text-sm flex items-center gap-2">
                              {appointment.videoCallType === 'video' ? (
                                <Video className="h-4 w-4 text-blue-600" />
                              ) : (
                                <PhoneCall className="h-4 w-4 text-green-600" />
                              )}
                              Scheduled {appointment.videoCallType === 'video' ? 'Video' : 'Audio'} Call
                            </h3>
                            <Badge variant="secondary" className="text-xs">
                              Jitsi
                            </Badge>
                          </div>

                          {/* Video Call Info */}
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                            <p className="text-sm text-blue-700">
                              A secure video call room has been created for this appointment.
                              Click the button below to join.
                            </p>

                            {appointment.videoCallUrl && (
                              <div className="text-xs text-blue-600 font-mono bg-white p-2 rounded border border-blue-200 truncate">
                                {appointment.videoCallUrl}
                              </div>
                            )}

                            <Button
                              size="sm"
                              onClick={() => handleStartCall(appointment.videoCallType || 'video')}
                              disabled={loading}
                              className="w-full bg-[#F97316] hover:bg-[#F97316]/90 text-white"
                            >
                              {appointment.videoCallType === 'video' ? (
                                <Video className="h-4 w-4 mr-2" />
                              ) : (
                                <PhoneCall className="h-4 w-4 mr-2" />
                              )}
                              Join {appointment.videoCallType === 'video' ? 'Video' : 'Audio'} Call
                            </Button>
                          </div>
                        </>
                      ) : (
                        <>
                          {/* Quick start video/audio call (not pre-scheduled) */}
                          <h3 className="font-medium text-sm">Quick Actions</h3>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStartCall('video')}
                              disabled={loading}
                              className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200"
                            >
                              <Video className="h-4 w-4 mr-2" />
                              Video Call
                            </Button>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStartCall('audio')}
                              disabled={loading}
                              className="flex-1 bg-green-50 hover:bg-green-100 text-green-600 border-green-200"
                            >
                              <PhoneCall className="h-4 w-4 mr-2" />
                              Audio Call
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                    <Separator />
                  </>
                )}

                {/* Actions */}
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                      disabled={loading}
                      className="flex-1"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleStatusToggle}
                      disabled={loading}
                      className="flex-1"
                    >
                      {appointment.status === 'confirmed' ? (
                        <>
                          <AlertCircle className="h-4 w-4 mr-2" />
                          Mark Pending
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Confirm
                        </>
                      )}
                    </Button>
                  </div>

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDelete}
                    disabled={loading}
                    className="w-full"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Appointment
                  </Button>
                </div>
              </>
            ) : (
              <>
                {/* Edit Mode */}
                <div className="space-y-4">
                  {/* Appointment Type */}
                  <div className="space-y-2">
                    <Label>Appointment Type</Label>
                    <RadioGroup
                      value={formData.type}
                      onValueChange={(value) => setFormData({ ...formData, type: value as any })}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="appointment" id="appointment" />
                        <Label htmlFor="appointment" className="cursor-pointer">Client Appointment</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="break" id="break" />
                        <Label htmlFor="break" className="cursor-pointer">Break/Lunch</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="internal" id="internal" />
                        <Label htmlFor="internal" className="cursor-pointer">Internal</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Therapist */}
                  <div className="space-y-2">
                    <Label>Therapist</Label>
                    <Select value={formData.therapistId} onValueChange={(value) => setFormData({ ...formData, therapistId: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {therapists.map((t) => (
                          <SelectItem key={t.id} value={t.id}>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: t.color }}
                              />
                              {t.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Client */}
                  {formData.type !== 'break' && (
                    <div className="space-y-2">
                      <Label>Client</Label>
                      <Input
                        value={formData.clientName}
                        onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                        placeholder="Enter client name"
                      />
                    </div>
                  )}

                  {/* Title */}
                  <div className="space-y-2">
                    <Label>Title (optional)</Label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g., Session with John Doe"
                    />
                  </div>

                  {/* Date and Time */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Date</Label>
                      <Input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Start Time</Label>
                      <Input
                        type="time"
                        value={formData.startTime}
                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Duration */}
                  <div className="space-y-2">
                    <Label>Duration</Label>
                    <div className="flex gap-2">
                      {['30', '45', '60', '90'].map((duration) => (
                        <Button
                          key={duration}
                          type="button"
                          variant={formData.duration === duration ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setFormData({ ...formData, duration })}
                          className="flex-1"
                        >
                          {duration}min
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Status */}
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as any })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Notes */}
                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <Textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Add any additional notes..."
                      rows={4}
                    />
                  </div>

                  {/* Edit Actions */}
                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={handleSave}
                      disabled={loading}
                      className="flex-1 bg-[#0176d3] hover:bg-[#014486]"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      disabled={loading}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              </>
            )}

            {/* Metadata */}
            {!isEditing && (
              <div className="pt-4 border-t text-xs text-muted-foreground space-y-1">
                <div>Created by: {appointment.createdBy}</div>
                <div>Appointment ID: {appointment.id}</div>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}