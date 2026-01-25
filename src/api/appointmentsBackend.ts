/**
 * Appointments Backend API - Refactored to use API Abstraction Layer
 */

// Define types locally since mock files are removed
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
  jwt: string;
}

// TODO: Implement real appointment service when needed
// For now, these are placeholder functions

/**
 * Create a new appointment
 */
export async function createAppointment(
  request: CreateAppointmentRequest
): Promise<AppointmentDetails> {
  throw new Error('Appointment service not implemented yet');
}

/**
 * Get appointment details
 */
export async function getAppointmentDetails(
  appointmentId: string
): Promise<AppointmentDetails> {
  throw new Error('Appointment service not implemented yet');
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
  throw new Error('Appointment service not implemented yet');
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
  throw new Error('Appointment service not implemented yet');
}

/**
 * Cancel an appointment
 */
export async function cancelAppointment(
  appointmentId: string,
  reason?: string
): Promise<void> {
  throw new Error('Appointment service not implemented yet');
}

/**
 * Get meeting join link for appointment
 */
export async function getAppointmentJoinLink(
  appointmentId: string
): Promise<JoinLinkResponse> {
  throw new Error('Appointment service not implemented yet');
}

/**
 * Update appointment status
 */
export async function updateAppointmentStatus(
  appointmentId: string,
  status: 'confirmed' | 'completed' | 'cancelled' | 'no-show'
): Promise<AppointmentDetails> {
  throw new Error('Appointment service not implemented yet');
}

/**
 * Reschedule appointment
 */
export async function rescheduleAppointment(
  appointmentId: string,
  newStartTime: string,
  newEndTime: string
): Promise<AppointmentDetails> {
  throw new Error('Appointment service not implemented yet');
}
