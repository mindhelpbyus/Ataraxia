import { dataService } from '../index';

export interface AppointmentDetails {
    id: string;
    therapistId: string;
    clientId: string;
    therapistName: string;
    clientName: string;
    title: string;
    description?: string;
    startTime: string;
    endTime: string;
    type: 'video' | 'audio' | 'in-person';
    status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
    notes?: string;
    sessionId?: string;
    joinLink?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateAppointmentRequest {
    therapistId: string;
    clientId: string;
    title: string;
    description?: string;
    startTime: string;
    endTime: string;
    type: 'video' | 'audio' | 'in-person';
    notes?: string;
    recurring?: {
        frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
        endDate?: string;
        count?: number;
    };
}

export const MockAppointmentService = {
    async createAppointment(request: CreateAppointmentRequest): Promise<AppointmentDetails> {
        const appointment = await dataService.create('appointments', {
            ...request,
            status: 'scheduled',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
        return appointment as AppointmentDetails;
    },

    async getAppointmentDetails(appointmentId: string): Promise<AppointmentDetails> {
        return dataService.get('appointments', appointmentId) as Promise<AppointmentDetails>;
    },

    async getTherapistAppointments(
        therapistId: string,
        filters?: { startDate?: string; endDate?: string; status?: string }
    ): Promise<AppointmentDetails[]> {
        const allAppointments = await dataService.list('appointments');
        return allAppointments.filter((apt: any) => {
            if (apt.therapistId !== therapistId) return false;
            if (filters?.status && apt.status !== filters.status) return false;
            if (filters?.startDate && new Date(apt.startTime) < new Date(filters.startDate)) return false;
            if (filters?.endDate && new Date(apt.startTime) > new Date(filters.endDate)) return false;
            return true;
        }) as AppointmentDetails[];
    },

    async getClientAppointments(
        clientId: string,
        filters?: { startDate?: string; endDate?: string; status?: string }
    ): Promise<AppointmentDetails[]> {
        const allAppointments = await dataService.list('appointments');
        return allAppointments.filter((apt: any) => {
            if (apt.clientId !== clientId) return false;
            if (filters?.status && apt.status !== filters.status) return false;
            if (filters?.startDate && new Date(apt.startTime) < new Date(filters.startDate)) return false;
            if (filters?.endDate && new Date(apt.startTime) > new Date(filters.endDate)) return false;
            return true;
        }) as AppointmentDetails[];
    },

    async updateAppointmentStatus(
        appointmentId: string,
        status: 'confirmed' | 'completed' | 'cancelled' | 'no-show'
    ): Promise<AppointmentDetails> {
        const updated = await dataService.update('appointments', appointmentId, {
            status,
            updatedAt: new Date().toISOString()
        });
        return updated as AppointmentDetails;
    },

    async rescheduleAppointment(
        appointmentId: string,
        newStartTime: string,
        newEndTime: string
    ): Promise<AppointmentDetails> {
        const updated = await dataService.update('appointments', appointmentId, {
            startTime: newStartTime,
            endTime: newEndTime,
            updatedAt: new Date().toISOString()
        });
        return updated as AppointmentDetails;
    },

    async cancelAppointment(appointmentId: string, reason?: string): Promise<void> {
        await dataService.update('appointments', appointmentId, {
            status: 'cancelled',
            cancellationReason: reason,
            updatedAt: new Date().toISOString()
        });
    },

    async getAppointmentJoinLink(appointmentId: string): Promise<{ joinLink: string; sessionId: string; jwt: string }> {
        return {
            joinLink: `https://meet.jit.si/ataraxia-${appointmentId}`,
            sessionId: `session-${appointmentId}`,
            jwt: 'mock-jwt-token'
        };
    }
};
