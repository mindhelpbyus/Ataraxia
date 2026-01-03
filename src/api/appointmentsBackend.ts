/**
 * Appointments Backend API - Refactored to use API Abstraction Layer
 */

import { appointmentService } from './index';
import { AppointmentDetails, CreateAppointmentRequest } from './mock/appointment';

export type { AppointmentDetails, CreateAppointmentRequest };

export interface JoinLinkResponse {
  joinLink: string;
  sessionId: string;
  jwt: string;
}

/**
 * Create a new appointment
 */
export async function createAppointment(
  request: CreateAppointmentRequest
): Promise<AppointmentDetails> {
  return appointmentService.createAppointment(request);
}

/**
 * Get appointment details
 */
export async function getAppointmentDetails(
  appointmentId: string
): Promise<AppointmentDetails> {
  return appointmentService.getAppointmentDetails(appointmentId);
}

/**
 * Get therapist's appointments
 */
export async function getTherapistAppointments(
  therapistId: string,
  filters?: {
    startDate?: string;
    endDate?: string;
    status?: string;
  }
): Promise<AppointmentDetails[]> {
  return appointmentService.getTherapistAppointments(therapistId, filters);
}

/**
 * Get client's appointments
 */
export async function getClientAppointments(
  clientId: string,
  filters?: {
    startDate?: string;
    endDate?: string;
    status?: string;
  }
): Promise<AppointmentDetails[]> {
  return appointmentService.getClientAppointments(clientId, filters);
}

/**
 * Cancel an appointment
 */
export async function cancelAppointment(
  appointmentId: string,
  reason?: string
): Promise<void> {
  return appointmentService.cancelAppointment(appointmentId, reason);
}

/**
 * Get meeting join link for appointment
 */
export async function getAppointmentJoinLink(
  appointmentId: string
): Promise<JoinLinkResponse> {
  return appointmentService.getAppointmentJoinLink(appointmentId);
}

/**
 * Update appointment status
 */
export async function updateAppointmentStatus(
  appointmentId: string,
  status: 'confirmed' | 'completed' | 'cancelled' | 'no-show'
): Promise<AppointmentDetails> {
  return appointmentService.updateAppointmentStatus(appointmentId, status);
}

/**
 * Reschedule appointment
 */
export async function rescheduleAppointment(
  appointmentId: string,
  newStartTime: string,
  newEndTime: string
): Promise<AppointmentDetails> {
  return appointmentService.rescheduleAppointment(appointmentId, newStartTime, newEndTime);
}
