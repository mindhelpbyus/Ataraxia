import { MockAuthService } from './mock/auth';
import { MockDataService } from './mock/data';
import { MockChatService } from './mock/chat';
import { MockCallService } from './mock/call';
import { MockAppointmentService } from './mock/appointment';
import { MockNotificationService } from './mock/notification';
import { IAuthService, IDataService } from './types';

// In the future, we can switch this based on environment variables
const USE_MOCK = true;

import { RealAuthService } from './services/auth';
export const authService: IAuthService = RealAuthService;
export const dataService: IDataService = MockDataService;
export const chatService = MockChatService;
export const callService = MockCallService;
export const appointmentService = MockAppointmentService;
export const notificationService = MockNotificationService;

export * from './types';
