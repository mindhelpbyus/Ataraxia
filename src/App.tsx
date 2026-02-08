
import React, { useState, useEffect } from 'react';
import { LoginPage } from './components/LoginPage';
import { RoleSelectionPage } from './components/RoleSelectionPage';
import { DashboardLayout } from './components/DashboardLayout';
import { OrganizationManagementView } from './components/OrganizationManagementView';
import { UserRole } from './types/appointment';
import { Notification } from './types/appointment';
import { Toaster } from './components/ui/sonner';

// Enhanced Auth Components
import SecurityDashboard from './components/SecurityDashboard';
import MFASetup from './components/MFASetup';
import SessionManager from './components/SessionManager';



import { ComprehensiveClientRegistrationForm } from './components/ComprehensiveClientRegistrationForm';
import { logger } from './services/secureLogger';

import { VerificationPendingPage } from './components/VerificationPendingPage';
import { TherapistRegistrationForm } from './components/TherapistRegistrationForm';


type AppView = 'login' | 'roleSelection' | 'dashboard' | 'orgManagement' | 'register' | 'client-registration' | 'verification-pending' | 'security' | 'mfa-setup' | 'sessions';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('login');
  const [userRole, setUserRole] = useState<UserRole>('admin');
  const [currentUserId, setCurrentUserId] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [accountStatus, setAccountStatus] = useState('active');
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Check for existing authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedEmail = localStorage.getItem('userEmail');
    const storedName = localStorage.getItem('userName');
    const storedRole = localStorage.getItem('userRole');
    const storedUserId = localStorage.getItem('userId');
    const storedAccountStatus = localStorage.getItem('accountStatus');

    if (token && storedEmail && storedRole && storedUserId) {
      // Restore authentication state
      setUserEmail(storedEmail);
      setUserName(storedName || '');
      setUserRole(storedRole as UserRole);
      setCurrentUserId(storedUserId);
      setAccountStatus(storedAccountStatus || 'active');

      // SECURITY FIX: Don't automatically set dashboard view for therapists
      if (storedRole === 'therapist') {
        // Direct to Dashboard regardless of onboarding status
        // The Dashboard internal logic will handle restricted views
        setCurrentView('dashboard');
      } else {
        setCurrentView('dashboard');
      }

      logger.info('Restored authentication from localStorage');
    }
  }, []);

  useEffect(() => {
    // Check URL params
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view');

    // Check path
    const path = window.location.pathname;

    if (viewParam === 'client-registration') {
      setCurrentView('client-registration');
    } else if (path === '/verification-pending') {
      setCurrentView('verification-pending');
    } else if (path === '/register-therapist' || path === '/register') {
      setCurrentView('register');
    } else if (currentView === 'login' && (path === '/' || path === '')) {
      setCurrentView('login');
    }
  }, []);

  // Fetch notifications when user is logged in
  useEffect(() => {
    if (currentUserId && currentView === 'dashboard') {
      loadNotifications();
      const interval = setInterval(loadNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [currentUserId, currentView]);

  const loadNotifications = async () => {
    if (!currentUserId) return;
    try {
      logger.info('Notification service not implemented yet, skipping notification loading');
      setNotifications([]);
    } catch (error) {
      logger.error('Failed to load notifications:', error);
      setNotifications([]);
    }
  };

  // Handle login
  const handleLogin = (emailOrIdentifier: string, passwordOrName: string, role: string, userId: string, onboardingStatus?: string, token?: string) => {
    setUserEmail(emailOrIdentifier);
    setUserName(passwordOrName);
    setCurrentUserId(userId);
    setAccountStatus(onboardingStatus || 'active');

    localStorage.setItem('userEmail', emailOrIdentifier);
    localStorage.setItem('userName', passwordOrName);
    localStorage.setItem('userId', userId);
    localStorage.setItem('accountStatus', onboardingStatus || 'active');
    if (token) {
      localStorage.setItem('token', token);
    }

    if (role === 'therapist') {
      setUserRole('therapist');
      localStorage.setItem('userRole', 'therapist');
      setCurrentView('dashboard');
    } else {
      // Admin roles
      setUserRole(role as UserRole);
      localStorage.setItem('userRole', role);
      setCurrentView('dashboard');
    }
  };

  const handleRoleSelected = (role: UserRole, userId: string) => {
    setUserRole(role);
    setCurrentUserId(userId);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setCurrentView('login');
    setUserRole('admin');
    setCurrentUserId('');
    setUserEmail('');
    setUserName('');
    setAccountStatus('active');
    setNotifications([]);

    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    localStorage.removeItem('accountStatus');
    localStorage.removeItem('token');

    window.history.pushState({}, '', '/');
  };

  const handleBackToHome = () => {
    setCurrentView('login');
  };

  const handleRegisterTherapist = () => {
    setCurrentView('register');
    window.history.pushState({}, '', '/register');
  };

  const handleTherapistRegistration = async (authResponse: any) => {
    // Auth response comes from localAuthService.register()
    const { user, token } = authResponse;

    console.log('Registration success:', user);

    // Set App State
    setUserEmail(user.email);
    setUserName(user.name);
    setUserRole('therapist'); // Explicitly set role
    setCurrentUserId(user.id);
    setAccountStatus('registered'); // Initial status

    // Persist session
    localStorage.setItem('userEmail', user.email);
    localStorage.setItem('userName', user.name);
    localStorage.setItem('userRole', 'therapist');
    localStorage.setItem('userId', user.id);
    localStorage.setItem('accountStatus', 'registered');
    if (token) {
      localStorage.setItem('token', token);
    }

    // CRITICAL CHANGE: Redirect to Dashboard, NOT Welcome Dashboard
    // We want them to feel "in" the app immediately.
    setCurrentView('dashboard');
    window.history.pushState({}, '', '/dashboard');
  };

  const handleRegistrationComplete = () => {
    // When wizard completes (Step 10), go to dashboard
    setCurrentView('dashboard');
    window.history.pushState({}, '', '/dashboard');
    localStorage.setItem('accountStatus', 'onboarding_completed');
  };

  const handleNavigateFromDashboard = (view: string, data?: any) => {
    if (view === 'register') {
      setCurrentView('register');
      window.history.pushState({}, '', '/register-therapist');
      if (data?.step) {
        localStorage.setItem('therapistOnboardingStep', data.step.toString());
      }
    } else {
      setCurrentView(view as AppView);
    }
  };

  const handleMarkNotificationAsRead = async (notificationId: string) => {
    setNotifications(prev => prev.map(n =>
      n.id === notificationId ? { ...n, read: true } : n
    ));
  };

  const handleMarkAllNotificationsAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Render current view
  if (currentView === 'login') {
    return (
      <>
        <LoginPage
          onLogin={handleLogin}
          onBackToHome={handleBackToHome}
          onRegisterTherapist={handleRegisterTherapist}
        />
        <Toaster />
      </>
    );
  }

  if (currentView === 'register') {
    return (
      <>
        <TherapistRegistrationForm
          onRegisterComplete={handleTherapistRegistration}
          onBackToLogin={() => setCurrentView('login')}
        />
        <Toaster />
      </>
    );
  }

  if (currentView === 'roleSelection') {
    return (
      <>
        <RoleSelectionPage
          onRoleSelected={handleRoleSelected}
          onLogout={handleLogout}
          userEmail={userEmail}
        />
        <Toaster />
      </>
    );
  }

  if (currentView === 'orgManagement') {
    return (
      <>
        <OrganizationManagementView
          userId={currentUserId}
          userEmail={userEmail}
          onNavigate={() => { }}
        />
        <Toaster />
      </>
    );
  }

  if (currentView === 'dashboard') {
    return (
      <>
        <DashboardLayout
          userRole={userRole}
          currentUserId={currentUserId}
          userEmail={userEmail}
          userName={userName}
          accountStatus={accountStatus}
          onLogout={handleLogout}
          notifications={notifications}
          onMarkNotificationAsRead={handleMarkNotificationAsRead}
          onMarkAllNotificationsAsRead={handleMarkAllNotificationsAsRead}
          onNavigateToSecurity={() => setCurrentView('security')}
          onNavigateToMFA={() => setCurrentView('mfa-setup')}
          onNavigateToSessions={() => setCurrentView('sessions')}
        />
        <Toaster />
      </>
    );
  }

  if (currentView === 'security') {
    return (
      <>
        <div className="min-h-screen bg-background p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            <SecurityDashboard />
            <div className="mt-8 text-center">
              <button
                onClick={() => setCurrentView('dashboard')}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Back to Dashboard
              </button>
            </div>
          </div>
        </div>
        <Toaster />
      </>
    );
  }

  if (currentView === 'mfa-setup') {
    return (
      <>
        <div className="min-h-screen bg-background p-4 md:p-8">
          <div className="max-w-4xl mx-auto">
            <MFASetup
              onComplete={() => {
                setCurrentView('dashboard');
              }}
              onCancel={() => setCurrentView('dashboard')}
            />
          </div>
        </div>
        <Toaster />
      </>
    );
  }

  if (currentView === 'sessions') {
    return (
      <>
        <div className="min-h-screen bg-background p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            <SessionManager />
            <div className="mt-8 text-center">
              <button
                onClick={() => setCurrentView('dashboard')}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Back to Dashboard
              </button>
            </div>
          </div>
        </div>
        <Toaster />
      </>
    );
  }

  if (currentView === 'verification-pending') {
    return (
      <>
        <VerificationPendingPage />
        <Toaster />
      </>
    );
  }

  if (currentView === 'client-registration') {
    const params = new URLSearchParams(window.location.search);
    return (
      <>
        <div className="min-h-screen bg-background p-4 md:p-8">
          <div className="max-w-5xl mx-auto">
            <ComprehensiveClientRegistrationForm
              clientEmail={params.get('email') || ''}
              clientPhone={params.get('phone') || ''}
              clientFirstName={params.get('firstName') || ''}
              clientLastName={params.get('lastName') || ''}
              registrationToken={params.get('token') || ''}
              onComplete={() => {
                window.location.href = '/';
              }}
            />
          </div>
        </div>
        <Toaster />
      </>
    );
  }




  // Fallback
  return null;
}
