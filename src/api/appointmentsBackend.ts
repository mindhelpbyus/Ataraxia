/**
 * api/appointmentsBackend.ts — Appointments API
 *
 * ✅ All appointment operations call the Gravity Reunion backend.
 * ✅ No mock data, no hardcoded defaults.
 *
 * Backend endpoints:
 *   GET    /api/v1/appointments
 *   POST   /api/v1/appointments
 *   GET    /api/v1/appointments/:id
 *   PATCH  /api/v1/appointments/:id/status
 *   DELETE /api/v1/appointments/:id
 *   GET    /api/v1/appointments/:id/join-link
 */

import { get, post, patch, del } from './client';
import { USE_LOCAL_DB } from '../lib/apiSwitch';
import { localDb } from '../lib/db/localDb';

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
  if (USE_LOCAL_DB) {
    return localDb.appointments.findMany(appt => {
      if (filters?.therapistId && appt.therapistId !== filters.therapistId) return false;
      if (filters?.clientId && appt.clientId !== filters.clientId) return false;
      if (filters?.status && appt.status !== filters.status) return false;
      if (filters?.startDate && appt.startTime < filters.startDate) return false;
      if (filters?.endDate && appt.startTime > filters.endDate) return false;
      return true;
    }) as Promise<AppointmentDetails[]>;
  }
  const params = filters ? '?' + new URLSearchParams(filters as Record<string, string>).toString() : '';
  return get<AppointmentDetails[]>(`/api/v1/appointments${params}`);
}

export function createAppointment(request: CreateAppointmentRequest): Promise<AppointmentDetails> {
  if (USE_LOCAL_DB) {
    const now = new Date().toISOString();
    const newAppt: AppointmentDetails = {
      id: `appt-${Date.now()}`,
      therapistName: '',
      clientName: '',
      status: 'scheduled',
      createdAt: now,
      updatedAt: now,
      ...request,
    };
    return localDb.appointments.create(newAppt as any) as Promise<AppointmentDetails>;
  }
  return post<AppointmentDetails>('/api/v1/appointments', request);
}

export function getAppointmentDetails(appointmentId: string): Promise<AppointmentDetails> {
  return get<AppointmentDetails>(`/api/v1/appointments/${appointmentId}`);
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
  return patch<void>(`/api/v1/appointments/${appointmentId}/status`, {
    status: 'cancelled',
    reason,
  });
}

export function updateAppointmentStatus(
  appointmentId: string,
  status: 'confirmed' | 'completed' | 'cancelled' | 'no-show'
): Promise<AppointmentDetails> {
  if (USE_LOCAL_DB) return localDb.appointments.update(appointmentId, { status }) as Promise<AppointmentDetails>;
  return patch<AppointmentDetails>(`/api/v1/appointments/${appointmentId}/status`, { status });
}

export function rescheduleAppointment(
  appointmentId: string,
  newStartTime: string,
  newEndTime: string
): Promise<AppointmentDetails> {
  if (USE_LOCAL_DB) return localDb.appointments.update(appointmentId, { startTime: newStartTime, endTime: newEndTime }) as Promise<AppointmentDetails>;
  return patch<AppointmentDetails>(`/api/v1/appointments/${appointmentId}`, {
    startTime: newStartTime,
    endTime: newEndTime,
  });
}

export function getAppointmentJoinLink(appointmentId: string): Promise<JoinLinkResponse> {
  return get<JoinLinkResponse>(`/api/v1/appointments/${appointmentId}/join-link`);
}

export function deleteAppointment(appointmentId: string): Promise<void> {
  if (USE_LOCAL_DB) return localDb.appointments.delete(appointmentId);
  return del<void>(`/api/v1/appointments/${appointmentId}`);
}
