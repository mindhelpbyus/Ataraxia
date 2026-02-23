// Real services only - no mock services in production
import { RealAuthService } from './auth';
import { RealDataService } from './data';

export const authService = RealAuthService;
export const dataService = RealDataService;

// ✅ P2 FIX: Removed placeholder chatService - use api/messaging.ts instead

// Placeholder services - these will show warnings when used until implemented
export const notificationService = {
  async getNotifications(_userId: string) {
    console.warn('Notification service not implemented yet - getNotifications');
    return [];
  },
  async markAsRead(_notificationId: string) {
    console.warn('Notification service not implemented yet - markAsRead');
  },
  async markAllAsRead(_userId: string) {
    console.warn('Notification service not implemented yet - markAllAsRead');
  },
  async seedMockNotifications(_userId: string) {
    return;
  }
};

export const callService = {
  async createCallLog(..._args: any[]) {
    console.warn('Call service not implemented yet - createCallLog');
    return 'placeholder-call-id';
  },
  async updateCallStatus(..._args: any[]) {
    console.warn('Call service not implemented yet - updateCallStatus');
  },
  async endCall(..._args: any[]) {
    console.warn('Call service not implemented yet - endCall');
  },
  async createCallInvitation(..._args: any[]) {
    console.warn('Call service not implemented yet - createCallInvitation');
    return 'placeholder-invitation-id';
  },
  async updateCallInvitationStatus(..._args: any[]) {
    console.warn('Call service not implemented yet - updateCallInvitationStatus');
  },
  subscribeToCallInvitations(..._args: any[]) {
    console.warn('Call service not implemented yet - subscribeToCallInvitations');
    return () => { };
  }
};

export const appointmentService = {
  async createAppointment(..._args: any[]) {
    console.warn('Appointment service not implemented yet - createAppointment');
    throw new Error('Appointment service not implemented yet');
  },
  async getAppointmentDetails(..._args: any[]) {
    console.warn('Appointment service not implemented yet - getAppointmentDetails');
    throw new Error('Appointment service not implemented yet');
  },
  async getTherapistAppointments(..._args: any[]) {
    console.warn('Appointment service not implemented yet - getTherapistAppointments');
    return [];
  },
  async getClientAppointments(..._args: any[]) {
    console.warn('Appointment service not implemented yet - getClientAppointments');
    return [];
  },
  async cancelAppointment(..._args: any[]) {
    console.warn('Appointment service not implemented yet - cancelAppointment');
  },
  async getAppointmentJoinLink(..._args: any[]) {
    console.warn('Appointment service not implemented yet - getAppointmentJoinLink');
    throw new Error('Appointment service not implemented yet');
  },
  async updateAppointmentStatus(..._args: any[]) {
    console.warn('Appointment service not implemented yet - updateAppointmentStatus');
    throw new Error('Appointment service not implemented yet');
  },
  async rescheduleAppointment(..._args: any[]) {
    console.warn('Appointment service not implemented yet - rescheduleAppointment');
    throw new Error('Appointment service not implemented yet');
  }
};

export * from './types';
