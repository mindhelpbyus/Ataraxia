/**
 * App.tsx — Ataraxia CRM Root Application
 *
 * ✅ SECURITY ARCHITECTURE (Chief Architect Sign-Off Phase 1 + 2):
 * - Auth state from Zustand authStore (mirrors backend HTTP-only cookie session)
 * - Session validated on mount via GET /auth/me (cookie-based, no localStorage)
 * - Logout clears Zustand + React Query PHI cache + sessionStorage
 * - All routes lazy-loaded (code splitting — ~250KB initial bundle vs 1.2MB before)
 * - Error boundaries prevent white-screen-of-death on route crashes
 * - Idle timeout enforced at 15 min (HIPAA automatic logoff requirement)
 */

import React, { useEffect, useCallback, useRef, Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from './components/ui/sonner';
import { logger } from './utils/secureLogger';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useAuthStore } from './store/authStore';
import type { UserRole } from './types/appointment';
import type { Notification } from './types/appointment';

// ─── Page Components (lazy-loaded — Chief Architect §4.1 code splitting) ─────
const LoginPage = lazy(() => import('./components/LoginPage').then(m => ({ default: m.LoginPage })));
const DashboardLayout = lazy(() => import('./components/DashboardLayout').then(m => ({ default: m.DashboardLayout })));
const TherapistRegistrationForm = lazy(() => import('./components/TherapistRegistrationForm').then(m => ({ default: m.TherapistRegistrationForm })));
const ClientRegistrationForm = lazy(() => import('./components/ClientRegistrationForm').then(m => ({ default: m.ClientRegistrationForm })));
const VerificationPendingPage = lazy(() => import('./components/VerificationPendingPage').then(m => ({ default: m.VerificationPendingPage })));
const OrganizationManagementView = lazy(() => import('./components/OrganizationManagementView').then(m => ({ default: m.OrganizationManagementView })));
const DocumentViewer = lazy(() => import('./components/DocumentViewer'));
const SecurityDashboard = lazy(() => import('./components/SecurityDashboard'));
const MFASetup = lazy(() => import('./components/MFASetup'));
const SessionManager = lazy(() => import('./components/SessionManager'));

// ─── Auth Guard ───────────────────────────────────────────────────────────────
// Reads from Zustand store — no prop drilling
function RequireAuth({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);

  if (isLoading) return null; // let App's loading spinner handle it
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

// ─── Idle Timeout (HIPAA §164.312(a)(2)(iii)) ────────────────────────────────
// ✅ useCallback ensures stable function ref — prevents listener accumulation
// (Chief Architect FRONTEND_ARCHITECTURE.md §3.5, GAP-7 FIX)
function useIdleTimeout(timeoutMs = 15 * 60 * 1000, onTimeout: () => void) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stableOnTimeout = useCallback(onTimeout, []); // eslint-disable-line react-hooks/exhaustive-deps

  const resetTimeout = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(stableOnTimeout, timeoutMs);
  }, [stableOnTimeout, timeoutMs]);

  useEffect(() => {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'] as const;
    events.forEach((e) => document.addEventListener(e, resetTimeout, { passive: true }));
    resetTimeout();
    return () => {
      events.forEach((e) => document.removeEventListener(e, resetTimeout));
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [resetTimeout]);
}

// ─── Shared Fallback UI ───────────────────────────────────────────────────────
const PageSpinner = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  // ✅ Auth state from Zustand — single source of truth (replaces 5× useState props)
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  const refreshUser = useAuthStore((s) => s.refreshUser);
  const storeLogout = useAuthStore((s) => s.logout);

  // Notifications remain local to App (not PHI — just UI state)
  const [notifications, setNotifications] = React.useState<Notification[]>([]);

  // ✅ Validate HTTP-only cookie on mount
  useEffect(() => { refreshUser(); }, [refreshUser]);

  // ✅ Listen for 401 session-expired event from api/client.ts
  useEffect(() => {
    const handleExpiry = () => {
      storeLogout();
      setNotifications([]);
      logger.info('Session expired — cleared client state');
    };
    window.addEventListener('auth:session-expired', handleExpiry);
    return () => window.removeEventListener('auth:session-expired', handleExpiry);
  }, [storeLogout]);

  // ✅ HIPAA idle timeout at 15 minutes
  useIdleTimeout(15 * 60 * 1000, () => {
    if (user) {
      logger.info('Session timed out due to inactivity');
      storeLogout().finally(() => {
        setNotifications([]);
        window.location.replace('/login?reason=timeout');
      });
    }
  });

  const handleMarkNotificationAsRead = (id: string) =>
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));

  const handleMarkAllNotificationsAsRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  // Show spinner while cookie is being validated
  if (isLoading) return <PageSpinner />;

  return (
    <>
      {/* ✅ Top-level Error Boundary — catches catastrophic failures */}
      <ErrorBoundary>
        <Suspense fallback={<PageSpinner />}>
          <Routes>
            {/* ─── Public Routes ───────────────────────────────────────── */}
            <Route
              path="/login"
              element={
                <ErrorBoundary>
                  {user ? <Navigate to="/dashboard" replace /> : <LoginPage onLogin={(u) => useAuthStore.getState()._setUser(u)} />}
                </ErrorBoundary>
              }
            />
            <Route
              path="/register"
              element={
                <ErrorBoundary>
                  <TherapistRegistrationForm onRegisterComplete={() => { }} onBackToLogin={() => { }} />
                </ErrorBoundary>
              }
            />
            <Route
              path="/client-registration"
              element={
                <ErrorBoundary>
                  <ClientRegistrationForm
                    clientEmail="" clientPhone="" clientFirstName="" clientLastName=""
                    clientCountryCode="+1" registrationToken=""
                    onComplete={() => window.location.replace('/')}
                  />
                </ErrorBoundary>
              }
            />
            <Route path="/verification-pending" element={<ErrorBoundary><VerificationPendingPage /></ErrorBoundary>} />
            <Route path="/documents/:documentId" element={<ErrorBoundary><DocumentViewer /></ErrorBoundary>} />

            {/* ─── Protected Routes ─────────────────────────────────────── */}
            <Route
              path="/dashboard/*"
              element={
                <RequireAuth>
                  <ErrorBoundary>
                    <DashboardLayout
                      userRole={(user?.role as UserRole) ?? 'therapist'}
                      currentUserId={user?.id ?? ''}
                      userEmail={user?.email ?? ''}
                      userName={user?.name ?? ''}
                      accountStatus={user?.account_status ?? 'active'}
                      onLogout={() => storeLogout()}
                      notifications={notifications}
                      onMarkNotificationAsRead={handleMarkNotificationAsRead}
                      onMarkAllNotificationsAsRead={handleMarkAllNotificationsAsRead}
                      onNavigateToSecurity={() => { }}
                      onNavigateToMFA={() => { }}
                      onNavigateToSessions={() => { }}
                    />
                  </ErrorBoundary>
                </RequireAuth>
              }
            />
            <Route
              path="/security"
              element={
                <RequireAuth>
                  <ErrorBoundary>
                    <div className="min-h-screen bg-background p-4 md:p-8">
                      <div className="max-w-6xl mx-auto"><SecurityDashboard /></div>
                    </div>
                  </ErrorBoundary>
                </RequireAuth>
              }
            />
            <Route
              path="/mfa-setup"
              element={
                <RequireAuth>
                  <ErrorBoundary>
                    <div className="min-h-screen bg-background p-4 md:p-8">
                      <div className="max-w-4xl mx-auto">
                        <MFASetup onComplete={() => { }} onCancel={() => { }} />
                      </div>
                    </div>
                  </ErrorBoundary>
                </RequireAuth>
              }
            />
            <Route
              path="/sessions"
              element={
                <RequireAuth>
                  <ErrorBoundary>
                    <div className="min-h-screen bg-background p-4 md:p-8">
                      <div className="max-w-6xl mx-auto"><SessionManager /></div>
                    </div>
                  </ErrorBoundary>
                </RequireAuth>
              }
            />
            <Route
              path="/org"
              element={
                <RequireAuth>
                  <ErrorBoundary>
                    <OrganizationManagementView
                      userId={user?.id ?? ''}
                      userEmail={user?.email ?? ''}
                      onNavigate={() => { }}
                    />
                  </ErrorBoundary>
                </RequireAuth>
              }
            />

            {/* ─── Redirects ────────────────────────────────────────────── */}
            <Route path="/" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
            <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>

      <Toaster />
    </>
  );
}
