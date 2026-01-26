import React, { useState, useEffect } from 'react';
import { LoginPage } from './components/LoginPage';
import { RoleSelectionPage } from './components/RoleSelectionPage';
import { DashboardLayout } from './components/DashboardLayout';
import { OrganizationManagementView } from './components/OrganizationManagementView';
import { UserRole } from './types/appointment';
import { Notification } from './types/appointment';
import { Toaster } from './components/ui/sonner';


import { TherapistOnboarding } from './components/onboarding/TherapistOnboarding';
import { ComprehensiveClientRegistrationForm } from './components/ComprehensiveClientRegistrationForm';
import { logger } from './services/secureLogger';

import { VerificationPendingPage } from './components/VerificationPendingPage';

type AppView = 'login' | 'roleSelection' | 'dashboard' | 'orgManagement' | 'register' | 'client-registration' | 'verification-pending';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('login');
  const [userRole, setUserRole] = useState<UserRole>('admin');
  const [currentUserId, setCurrentUserId] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Check for existing authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedEmail = localStorage.getItem('userEmail');
    const storedName = localStorage.getItem('userName');
    const storedRole = localStorage.getItem('userRole');
    const storedUserId = localStorage.getItem('userId');

    if (token && storedEmail && storedRole && storedUserId) {
      // Restore authentication state
      setUserEmail(storedEmail);
      setUserName(storedName || '');
      setUserRole(storedRole as UserRole);
      setCurrentUserId(storedUserId);
      
      // SECURITY FIX: Don't automatically set dashboard view for therapists
      // Instead, re-authenticate to check current verification status
      if (storedRole === 'therapist') {
        // For therapists, we need to check their verification status
        // Force re-authentication to ensure they're not bypassing verification
        setCurrentView('login');
      } else {
        // For non-therapists (admin, super_admin, etc.), allow direct dashboard access
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
    } else if (path === '/onboarding' || path === '/therapist-onboarding') {
      // Handle onboarding persistence - if user refreshes during onboarding
      setCurrentView('register');
    } else if (currentView === 'login' && (path === '/' || path === '')) {
      // Default to login view for root path
      setCurrentView('login');
    }
  }, []);

  // Fetch notifications when user is logged in
  useEffect(() => {
    if (currentUserId && currentView === 'dashboard') {
      loadNotifications();
      // Poll for new notifications every minute
      const interval = setInterval(loadNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [currentUserId, currentView]);

  const loadNotifications = async () => {
    if (!currentUserId) return;
    try {
      // Skip notifications for now since service is not implemented
      // TODO: Implement real notification service
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

    // Save to localStorage for persistence
    localStorage.setItem('userEmail', emailOrIdentifier);
    localStorage.setItem('userName', passwordOrName);
    localStorage.setItem('userId', userId);
    if (token) {
      localStorage.setItem('token', token);
    }

    // Convert role to UserRole type and go directly to dashboard
    // Convert backend role to frontend state
    // We now support direct mapping of super_admin and org_admin
    if (role === 'therapist') {
      setUserRole('therapist');
      localStorage.setItem('userRole', 'therapist');

      // Strict Onboarding Status Check
      const pendingStatuses = ['pending', 'onboarding_pending', 'pending_verification', 'documents_review', 'background_check', 'final_review', 'account_created'];

      if (pendingStatuses.includes(onboardingStatus || '')) {
        setCurrentView('verification-pending');
      } else if (onboardingStatus === 'active' || onboardingStatus === 'approved') {
        setCurrentView('dashboard');
      } else if (onboardingStatus === 'draft' || onboardingStatus === 'incomplete') {
        setCurrentView('register'); // Resume onboarding
      } else {
        // Fallback: If status is unknown but role is therapist, safer to show pending than dashboard
        // unless we know for sure it's legacy active. 
        // For now, let's log warning and default to pending if it looks like a verification flow
        console.warn(`Unknown status for therapist: ${onboardingStatus}`);
        setCurrentView('verification-pending');
      }
    } else if (role === 'super_admin' || role === 'superadmin') {
      setUserRole('super_admin'); // Use snake_case internally
      localStorage.setItem('userRole', 'super_admin');
      setCurrentView('dashboard');
    } else if (role === 'org_admin' || role === 'admin') {
      setUserRole('org_admin'); // Use snake_case internally
      localStorage.setItem('userRole', 'org_admin');
      setCurrentView('dashboard');
    } else {
      // Fallback for any other roles
      setUserRole(role as UserRole);
      localStorage.setItem('userRole', role);
      setCurrentView('dashboard');
    }
  };

  // Handle role selection (for admins who can switch roles)
  const handleRoleSelected = (role: UserRole, userId: string) => {
    setUserRole(role);
    setCurrentUserId(userId);
    setCurrentView('dashboard');
  };

  // Handle logout
  const handleLogout = () => {
    setCurrentView('login');
    setUserRole('admin');
    setCurrentUserId('');
    setUserEmail('');
    setUserName('');
    setNotifications([]);

    // Clear localStorage
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    localStorage.removeItem('token');
    
    // Clear URL back to root
    window.history.pushState({}, '', '/');
  };

  // Handle back to home from login
  const handleBackToHome = () => {
    setCurrentView('login');
  };

  // Handle registration
  const handleRegisterTherapist = () => {
    setCurrentView('register');
    // Update URL to maintain state on refresh
    window.history.pushState({}, '', '/register-therapist');
  };

  const handleRegistrationComplete = () => {
    setCurrentView('login');
    // Clear the URL back to root
    window.history.pushState({}, '', '/');
  };

  // Notification handlers
  const handleMarkNotificationAsRead = async (notificationId: string) => {
    try {
      // TODO: Implement real notification service
      logger.info('Notification service not implemented yet');
      // Optimistic update for now
      setNotifications(prev => prev.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      ));
    } catch (error) {
      logger.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllNotificationsAsRead = async () => {
    try {
      // TODO: Implement real notification service
      logger.info('Notification service not implemented yet');
      // Optimistic update for now
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      logger.error('Failed to mark all notifications as read:', error);
    }
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
        <TherapistOnboarding onComplete={handleRegistrationComplete} />
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
          onLogout={handleLogout}
          notifications={notifications}
          onMarkNotificationAsRead={handleMarkNotificationAsRead}
          onMarkAllNotificationsAsRead={handleMarkAllNotificationsAsRead}
        />
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

  // Fallback for unknown routes - redirect to login
  if (currentView !== 'login' && currentView !== 'register' && currentView !== 'roleSelection' && 
      currentView !== 'dashboard' && currentView !== 'orgManagement' && 
      currentView !== 'verification-pending' && currentView !== 'client-registration') {
    setCurrentView('login');
    window.history.pushState({}, '', '/');
  }

  return null;
}
