export interface Appointment {
  id: string;
  therapistId: string;
  clientId: string;
  title: string;
  startTime: string; // ISO format
  endTime: string;
  color: string;
  type: 'appointment' | 'break' | 'internal' | 'external';
  status: 'confirmed' | 'pending';
  createdBy: 'therapist' | 'client';
  notes?: string;
  clientName?: string;
  therapistName?: string;
  customColor?: string; // User-selected color override
  flagged?: boolean; // Follow-up flag
  flagNote?: string; // Flag description
  // Video call fields
  isVideoCall?: boolean; // Whether this is a video call appointment
  videoCallRoomName?: string; // Jitsi room name
  videoCallUrl?: string; // Direct join URL
  videoCallJWT?: string; // JWT token for authentication
  videoCallType?: 'video' | 'audio'; // Type of call
}

export interface Therapist {
  id: string;
  name: string;
  color: string;
  email: string;
  workingDays?: number[]; // 0 = Sunday, 1 = Monday, etc.
  workingHours?: {
    start: string; // "09:00"
    end: string; // "18:00"
  };
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  membershipType?: string;
}

export type CalendarView = 'day' | 'week' | 'month';
export type UserRole = 'therapist' | 'admin' | 'org_admin' | 'superadmin' | 'super_admin' | 'client';

export interface CalendarState {
  currentDate: Date;
  view: CalendarView;
  selectedTherapistIds: string[];
  userRole: UserRole;
  currentUserId: string;
}

export interface Notification {
  id: string;
  type: 'appointment' | 'cancellation' | 'message' | 'reminder' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  from?: string;
  appointmentId?: string;
}