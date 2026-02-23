/**
 * components/pages/index.ts
 *
 * PAGES: Full route-level views. These are the components mounted
 * directly by the router. They compose templates + organisms and
 * own the top-level data-fetching concern for their route.
 *
 * Chief Architect Atomic Design §4 (FRONTEND_ARCHITECTURE.md)
 */

// ─── Role-based Dashboard Pages ───────────────────────────────────────────────
export { DashboardView } from '../DashboardView';
export { AdminDashboardView } from '../AdminDashboardView';
export { TherapistHomeView } from '../TherapistHomeView';
export { ProfessionalDashboard } from '../ProfessionalDashboard';
export { ProfessionalClientsView } from '../ProfessionalClientsView';
export { ClientDashboardView } from '../ClientDashboardView';
export { SuperAdminDashboardView } from '../SuperAdminDashboardView';
export { SuperAdminView } from '../SuperAdminView';
export { HomeView } from '../HomeView';

// ─── Special Pages ────────────────────────────────────────────────────────────
export { ApplicationRejectedPage } from '../ApplicationRejectedPage';
export { UnauthorizedDomainAlert } from '../UnauthorizedDomainAlert';
export { default as DocumentViewer } from '../DocumentViewer';
// LoggingDashboard is an empty stub — not exported until implemented
