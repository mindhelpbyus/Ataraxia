import { IAuthService, IDataService } from './types';

// Real services only - no mock services in production
import { RealAuthService } from './auth';
import { RealDataService } from './data';

export const authService = RealAuthService;
export const dataService = RealDataService;

// Placeholder services - these will show warnings when used until implemented
export const notificationService = {
  async getNotifications(userId: string) {
    console.warn('Notification service not implemented yet - getNotifications');
    return [];
  },
  async markAsRead(notificationId: string) {
    console.warn('Notification service not implemented yet - markAsRead');
    // No-op for now
  },
  async markAllAsRead(userId: string) {
    console.warn('Notification service not implemented yet - markAllAsRead');
    // No-op for now
  },
  async seedMockNotifications(userId: string) {
    // No-op for now
    return;
  }
};

export const chatService = {
  async getOrCreateChatRoom(...args: any[]) {
    console.warn('Chat service not implemented yet - getOrCreateChatRoom');
    return 'placeholder-room-id';
  },
  async sendMessage(...args: any[]) {
    console.warn('Chat service not implemented yet - sendMessage');
    return 'placeholder-message-id';
  },
  subscribeToMessages(...args: any[]) {
    console.warn('Chat service not implemented yet - subscribeToMessages');
    return () => { };
  },
  subscribeToChatRooms(...args: any[]) {
    console.warn('Chat service not implemented yet - subscribeToChatRooms');
    return () => { };
  }
};

export const callService = {
  async createCallLog(...args: any[]) {
    console.warn('Call service not implemented yet - createCallLog');
    return 'placeholder-call-id';
  },
  async updateCallStatus(...args: any[]) {
    console.warn('Call service not implemented yet - updateCallStatus');
    // No-op for now
  },
  async endCall(...args: any[]) {
    console.warn('Call service not implemented yet - endCall');
    // No-op for now
  },
  async createCallInvitation(...args: any[]) {
    console.warn('Call service not implemented yet - createCallInvitation');
    return 'placeholder-invitation-id';
  },
  async updateCallInvitationStatus(...args: any[]) {
    console.warn('Call service not implemented yet - updateCallInvitationStatus');
    // No-op for now
  },
  subscribeToCallInvitations(...args: any[]) {
    console.warn('Call service not implemented yet - subscribeToCallInvitations');
    return () => { };
  }
};

export const appointmentService = {
  async createAppointment(...args: any[]) {
    console.warn('Appointment service not implemented yet - createAppointment');
    throw new Error('Appointment service not implemented yet');
  },
  async getAppointmentDetails(...args: any[]) {
    console.warn('Appointment service not implemented yet - getAppointmentDetails');
    throw new Error('Appointment service not implemented yet');
  },
  async getTherapistAppointments(...args: any[]) {
    console.warn('Appointment service not implemented yet - getTherapistAppointments');
    return [];
  },
  async getClientAppointments(...args: any[]) {
    console.warn('Appointment service not implemented yet - getClientAppointments');
    return [];
  },
  async cancelAppointment(...args: any[]) {
    console.warn('Appointment service not implemented yet - cancelAppointment');
    // No-op for now
  },
  async getAppointmentJoinLink(...args: any[]) {
    console.warn('Appointment service not implemented yet - getAppointmentJoinLink');
    throw new Error('Appointment service not implemented yet');
  },
  async updateAppointmentStatus(...args: any[]) {
    console.warn('Appointment service not implemented yet - updateAppointmentStatus');
    throw new Error('Appointment service not implemented yet');
  },
  async rescheduleAppointment(...args: any[]) {
    console.warn('Appointment service not implemented yet - rescheduleAppointment');
    throw new Error('Appointment service not implemented yet');
  }
};

export * from './types';
