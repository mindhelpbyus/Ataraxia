import { Appointment, Therapist, Client } from '../types/appointment';
import { dataService } from './index';

// API functions using real backend services
export const appointmentsApi = {
  async getAppointments(startDate?: string, endDate?: string, therapistIds?: string[]): Promise<Appointment[]> {
    // TODO: Implement real appointment service
    console.warn('Appointment service not implemented yet');
    return [];
  },

  async createAppointment(appointment: Omit<Appointment, 'id'>): Promise<Appointment> {
    // TODO: Implement real appointment service
    throw new Error('Appointment creation not implemented yet');
  },

  async updateAppointment(id: string, updates: Partial<Appointment>): Promise<Appointment> {
    // TODO: Implement real appointment service
    throw new Error('Appointment update not implemented yet');
  },

  async deleteAppointment(id: string): Promise<void> {
    // TODO: Implement real appointment service
    throw new Error('Appointment deletion not implemented yet');
  },

  async getTherapists(): Promise<Therapist[]> {
    try {
      // Use real therapist service
      const therapists = await dataService.list('therapists');
      
      // Transform to expected format
      return therapists.map((t: any) => ({
        id: t.id,
        name: `${t.first_name} ${t.last_name}`,
        color: '#3b82f6', // Default color, TODO: add color field to therapist profile
        email: t.email,
        workingDays: [1, 2, 3, 4, 5], // Default Mon-Fri, TODO: get from therapist schedule
        workingHours: { start: '09:00', end: '17:00' } // Default hours, TODO: get from therapist schedule
      }));
    } catch (error) {
      console.error('Failed to load therapists:', error);
      return [];
    }
  },

  async getClients(): Promise<Client[]> {
    try {
      // Use real client service
      const clients = await dataService.list('clients');
      
      // Transform to expected format
      return clients.map((c: any) => ({
        id: c.id,
        name: `${c.first_name} ${c.last_name}`,
        email: c.email,
        phone: c.phone_number || '',
        membershipType: 'Standard' // Default membership, TODO: add membership field to client profile
      }));
    } catch (error) {
      console.error('Failed to load clients:', error);
      return [];
    }
  },
};