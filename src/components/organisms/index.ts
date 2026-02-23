/**
 * components/organisms/index.ts
 *
 * ORGANISMS: Complex components that combine molecules and atoms,
 * often with API calls, business logic, and rich internal state.
 * These are the "sections" of your UI.
 *
 * Chief Architect Atomic Design §4 (FRONTEND_ARCHITECTURE.md)
 */

// ─── Auth ─────────────────────────────────────────────────────────────────────
export { LoginPage } from '../LoginPage';
export { TherapistRegistrationForm } from '../TherapistRegistrationForm';
export { ClientRegistrationForm } from '../ClientRegistrationForm';
export { MFASetup } from '../MFASetup';
export { TwoFactorSetup } from '../TwoFactorSetup';
export { RoleSelectionPage } from '../RoleSelectionPage';
export { VerificationPendingPage } from '../VerificationPendingPage';
export { SecurityDashboard } from '../SecurityDashboard';
export { SessionManager } from '../SessionManager';

// ─── Calendar ─────────────────────────────────────────────────────────────────
export { CalendarContainer } from '../CalendarContainer';
export { AgendaView } from '../AgendaView';
export { DayView } from '../DayView';
export { WeekView } from '../WeekView';
export { MonthView } from '../MonthView';
export { EnhancedCalendarSidebar } from '../EnhancedCalendarSidebar';
export { SlotAvailability } from '../SlotAvailability';

// ─── Appointments ─────────────────────────────────────────────────────────────
export { AppointmentPanel } from '../AppointmentPanel';
export { EnhancedAppointmentForm } from '../EnhancedAppointmentForm';

// ─── Clients ──────────────────────────────────────────────────────────────────
export { ClientDetailView } from '../ClientDetailView';
export { ClientDetailsSidebar } from '../ClientDetailsSidebar';
export { ClientJournalView } from '../ClientJournalView';
export { ClientSidebar } from '../ClientSidebar';
export { EditClientProfileForm } from '../EditClientProfileForm';
export { EnhancedTherapistsTable } from '../EnhancedTherapistsTable';
export { PatientIntakeForm } from '../PatientIntakeForm';
export { PresentingConcerns } from '../PresentingConcerns';
export { SafetyRiskScreening } from '../SafetyRiskScreening';

// ─── Video ────────────────────────────────────────────────────────────────────
export { VideoRoomsView } from '../VideoRoomsView';
export { VideoCallRoom } from '../VideoCallRoom';
export { JitsiVideoRoom } from '../JitsiVideoRoom';

// ─── Admin ────────────────────────────────────────────────────────────────────
export { OrganizationManagementView } from '../OrganizationManagementView';
export { TherapistVerificationView } from '../TherapistVerificationView';
export { TherapistVerificationDetailModal } from '../TherapistVerificationDetailModal';

// ─── Misc Panels ──────────────────────────────────────────────────────────────
export { QuickNotesView } from '../QuickNotesView';
export { MessagesView } from '../MessagesView';
export { TasksView } from '../TasksView';
export { ReportsView } from '../ReportsView';
export { SessionNotesView } from '../SessionNotesView';
export { SettingsView } from '../SettingsView';
export { SettingsSidebar } from '../SettingsSidebar';
export { SystemStatusChecker } from '../SystemStatusChecker';
export { ErrorBoundary } from '../ErrorBoundary';
