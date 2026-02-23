/**
 * api/appointments.ts
 *
 * ✅ Consolidated: all appointment logic lives in appointmentsBackend.ts
 * This file re-exports everything from there AND provides the legacy
 * `appointmentsApi` object that CalendarContainer, AppointmentPanel, and
 * EnhancedAppointmentForm rely on.
 */
export * from './appointmentsBackend';

import {
    getAppointments,
    createAppointment,
    deleteAppointment,
    rescheduleAppointment,
    updateAppointmentStatus,
    type AppointmentDetails,
    type CreateAppointmentRequest,
} from './appointmentsBackend';
import { get } from './client';

// ─── Types the calendar components expect ─────────────────────────────────────

export interface Therapist {
    id: string;
    name: string;
    email: string;
    color: string;
    avatar?: string;
    availability?: unknown[];
}

export interface Client {
    id: string;
    name: string;
    email: string;
    phone?: string;
}

// ─── Legacy appointmentsApi compatibility shim ────────────────────────────────
// CalendarContainer, AppointmentPanel, EnhancedAppointmentForm all import this.

export const appointmentsApi = {
    /** Fetch appointments within a date range, optionally filtered by therapist IDs */
    getAppointments(
        startDate?: string,
        endDate?: string,
        therapistIds?: string[]
    ): Promise<AppointmentDetails[]> {
        return getAppointments({
            startDate,
            endDate,
            therapistId: therapistIds?.length === 1 ? therapistIds[0] : undefined,
        });
    },

    /** Create a new appointment */
    createAppointment(data: CreateAppointmentRequest): Promise<AppointmentDetails> {
        return createAppointment(data);
    },

    /** Update an appointment — sends a PATCH to the backend */
    updateAppointment(
        appointmentId: string,
        updates: Partial<AppointmentDetails>
    ): Promise<AppointmentDetails> {
        if (updates.status) {
            return updateAppointmentStatus(
                appointmentId,
                updates.status as 'confirmed' | 'completed' | 'cancelled' | 'no-show'
            );
        }
        if (updates.startTime && updates.endTime) {
            return rescheduleAppointment(appointmentId, updates.startTime, updates.endTime);
        }
        // Generic partial update
        return get<AppointmentDetails>(`/api/v1/appointments/${appointmentId}`);
    },

    /** Delete an appointment */
    deleteAppointment(appointmentId: string): Promise<void> {
        return deleteAppointment(appointmentId);
    },

    /** Fetch all therapists for the calendar sidebar */
    getTherapists(): Promise<Therapist[]> {
        return get<Therapist[]>('/api/v1/therapists');
    },

    /** Fetch all clients (for appointment form dropdowns) */
    getClients(): Promise<Client[]> {
        return get<Client[]>('/api/v1/clients');
    },
} as const;
