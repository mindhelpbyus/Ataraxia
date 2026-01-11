import React, { useState, useEffect } from 'react';
import { LoginPage } from './components/LoginPage';
import { RoleSelectionPage } from './components/RoleSelectionPage';
import { DashboardLayout } from './components/DashboardLayout';
import { OrganizationManagementView } from './components/OrganizationManagementView';
import { UserRole } from './types/appointment';
import { Notification } from './types/appointment';
import { Toaster } from './components/ui/sonner';
import { notificationService } from './api';

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
    } else if (path === '/register-therapist') {
      setCurrentView('register');
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
      // Seed mock notifications if needed (for demo purposes)
      await notificationService.seedMockNotifications(currentUserId);

      const data = await notificationService.getNotifications(currentUserId);
      setNotifications(data);
    } catch (error) {
      logger.error('Failed to load notifications:', error);
    }
  };

  // Handle login
  const handleLogin = (emailOrIdentifier: string, passwordOrName: string, role: string, userId: string, onboardingStatus?: string) => {
    setUserEmail(emailOrIdentifier);
    setUserName(passwordOrName);
    setCurrentUserId(userId);

    // Convert role to UserRole type and go directly to dashboard
    // Convert backend role to frontend state
    // We now support direct mapping of super_admin and org_admin
    if (role === 'therapist') {
      setUserRole('therapist');

      // Strict Onboarding Status Check
      if (onboardingStatus === 'pending') {
        setCurrentView('verification-pending');
      } else if (onboardingStatus === 'active' || onboardingStatus === 'approved') {
        setCurrentView('dashboard');
      } else if (onboardingStatus === 'draft' || onboardingStatus === 'incomplete') {
        setCurrentView('register'); // Resume onboarding
      } else {
        // Fallback for legacy users or undefined status
        setCurrentView('dashboard');
      }
    } else if (role === 'super_admin' || role === 'superadmin') {
      setUserRole('super_admin'); // Use snake_case internally
      setCurrentView('dashboard');
    } else if (role === 'org_admin' || role === 'admin') {
      setUserRole('org_admin'); // Use snake_case internally
      setCurrentView('dashboard');
    } else {
      // Fallback for any other roles
      setUserRole(role as UserRole);
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
  };

  // Handle back to home from login
  const handleBackToHome = () => {
    setCurrentView('login');
  };

  // Handle registration
  const handleRegisterTherapist = () => {
    setCurrentView('register');
  };

  const handleRegistrationComplete = () => {
    setCurrentView('login');
  };

  // Notification handlers
  const handleMarkNotificationAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      // Optimistic update
      setNotifications(prev => prev.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      ));
    } catch (error) {
      logger.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllNotificationsAsRead = async () => {
    try {
      await notificationService.markAllAsRead(currentUserId);
      // Optimistic update
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

  return null;
}
