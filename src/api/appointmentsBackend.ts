/**
 * api/appointmentsBackend.ts — Appointments API
 *
 * ✅ All appointment operations call the Gravity Reunion backend.
 * ✅ No mock data, no hardcoded defaults.
 *
 * Backend (backend-initial — NO /api/ prefix):
 *   GET    /appointments
 *   POST   /appointments
 *   GET    /appointments/{appointmentId}
 *   PATCH  /appointments/{appointmentId}
 *   DELETE /appointments/{appointmentId}
 */

import { get, post, patch, del } from './client';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AppointmentDetails {
  id: string;
  therapistId: string;
  therapistName: string;
  clientId: string;
  clientName: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  type: 'video' | 'audio' | 'in-person';
  notes?: string;
  meetingLink?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAppointmentRequest {
  therapistId: string;
  clientId: string;
  startTime: string;
  endTime: string;
  type: 'video' | 'audio' | 'in-person';
  notes?: string;
}

export interface JoinLinkResponse {
  joinLink: string;
  sessionId: string;
}

export interface AppointmentFilters {
  startDate?: string;
  endDate?: string;
  status?: string;
  therapistId?: string;
  clientId?: string;
}

// ─── API Functions ────────────────────────────────────────────────────────────

export function getAppointments(filters?: AppointmentFilters): Promise<AppointmentDetails[]> {
  const params = filters ? '?' + new URLSearchParams(filters as Record<string, string>).toString() : '';
  return get<AppointmentDetails[]>(`/appointments${params}`);
}

export function createAppointment(request: CreateAppointmentRequest): Promise<AppointmentDetails> {
  return post<AppointmentDetails>('/appointments', request);
}

export function getAppointmentDetails(appointmentId: string): Promise<AppointmentDetails> {
  return get<AppointmentDetails>(`/appointments/${appointmentId}`);
}

export function getTherapistAppointments(
  therapistId: string,
  filters?: Omit<AppointmentFilters, 'therapistId'>
): Promise<AppointmentDetails[]> {
  return getAppointments({ ...filters, therapistId });
}

export function getClientAppointments(
  clientId: string,
  filters?: Omit<AppointmentFilters, 'clientId'>
): Promise<AppointmentDetails[]> {
  return getAppointments({ ...filters, clientId });
}

export function cancelAppointment(appointmentId: string, reason?: string): Promise<void> {
  return patch<void>(`/appointments/${appointmentId}`, {
    status: 'cancelled',
    reason,
  });
}

export function updateAppointmentStatus(
  appointmentId: string,
  status: 'confirmed' | 'completed' | 'cancelled' | 'no-show'
): Promise<AppointmentDetails> {
  return patch<AppointmentDetails>(`/appointments/${appointmentId}`, { status });
}

export function rescheduleAppointment(
  appointmentId: string,
  newStartTime: string,
  newEndTime: string
): Promise<AppointmentDetails> {
  return patch<AppointmentDetails>(`/appointments/${appointmentId}`, {
    startTime: newStartTime,
    endTime: newEndTime,
  });
}

// TODO(backend): no dedicated join-link route on backend-initial yet; the link
// currently comes from the appointment record's `meetingLink`. Adjust when a
// /appointments/{id}/join-link route exists.
export function getAppointmentJoinLink(appointmentId: string): Promise<JoinLinkResponse> {
  return get<JoinLinkResponse>(`/appointments/${appointmentId}`).then((a: any) => ({
    joinLink: a?.meetingLink ?? '',
    sessionId: a?.id ?? appointmentId,
  }));
}

export function deleteAppointment(appointmentId: string): Promise<void> {
  return del<void>(`/appointments/${appointmentId}`);
}
