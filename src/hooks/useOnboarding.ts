/**
 * Onboarding Hook
 * 
 * Provides seamless onboarding experience with:
 * ✅ Session persistence
 * ✅ Auto-save functionality
 * ✅ Step navigation
 * ✅ Verification management
 * ✅ Progress tracking
 */

import { useState, useEffect, useCallback } from 'react';
import { onboardingSessionManager, OnboardingSession } from '../services/onboardingSessionManager';
import { useEnhancedAuth } from './useEnhancedAuth';

interface OnboardingState {
  // Session state
  session: OnboardingSession | null;
  currentStep: number;
  isLoading: boolean;
  error: string | null;
  
  // Progress tracking
  progress: {
    completed: number;
    total: number;
    percentage: number;
  };
  
  // Verification state
  verificationRequired: {
    email: boolean;
    phone: boolean;
  };
  
  // Actions
  startOnboarding: (initialData?: Record<string, any>) => Promise<void>;
  updateStepData: (stepNumber: number, data: Record<string, any>, markCompleted?: boolean) => Promise<void>;
  goToStep: (stepNumber: number) => boolean;
  
  // Verification actions
  verifyEmail: (code?: string) => Promise<boolean>;
  sendPhoneVerification: (phoneNumber: string) => Promise<void>;
  verifyPhone: (phoneNumber: string, code: string) => Promise<boolean>;
  
  // Completion
  completeOnboarding: () => Promise<void>;
  
  // Utilities
  getStepData: (stepNumber: number) => Record<string, any>;
  isStepCompleted: (stepNumber: number) => boolean;
  canNavigateToStep: (stepNumber: number) => boolean;
  clearSession: () => void;
  clearError: () => void;
}

export function useOnboarding(): OnboardingState {
  const { user, isAuthenticated } = useEnhancedAuth();
  const [session, setSession] = useState<OnboardingSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize session on mount
  useEffect(() => {
    const currentSession = onboardingSessionManager.getCurrentSession();
    setSession(currentSession);
  }, []);

  // Clear error helper
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Start new onboarding session
  const startOnboarding = useCallback(async (initialData?: Record<string, any>) => {
    if (!user || !isAuthenticated) {
      setError('User must be authenticated to start onboarding');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const authProvider = 'cognito'; // Determine from your auth system
      const newSession = await onboardingSessionManager.startOnboarding(
        user.uid,
        user.email!,
        authProvider,
        initialData
      );

      setSession(newSession);
      console.log('🚀 Onboarding started successfully');
    } catch (err: any) {
      console.error('❌ Failed to start onboarding:', err);
      setError(err.message || 'Failed to start onboarding');
    } finally {
      setIsLoading(false);
    }
  }, [user, isAuthenticated]);

  // Update step data
  const updateStepData = useCallback(async (
    stepNumber: number,
    data: Record<string, any>,
    markCompleted: boolean = false
  ) => {
    try {
      setError(null);
      
      await onboardingSessionManager.updateStepData(stepNumber, data, markCompleted);
      
      // Refresh session state
      const updatedSession = onboardingSessionManager.getCurrentSession();
      setSession(updatedSession);
      
      console.log(`📝 Step ${stepNumber} updated successfully`);
    } catch (err: any) {
      console.error(`❌ Failed to update step ${stepNumber}:`, err);
      setError(err.message || `Failed to update step ${stepNumber}`);
    }
  }, []);

  // Navigate to step
  const goToStep = useCallback((stepNumber: number): boolean => {
    try {
      setError(null);
      
      const success = onboardingSessionManager.goToStep(stepNumber);
      
      if (success) {
        const updatedSession = onboardingSessionManager.getCurrentSession();
        setSession(updatedSession);
        console.log(`➡️ Navigated to step ${stepNumber}`);
      } else {
        setError(`Cannot navigate to step ${stepNumber}. Complete previous steps first.`);
      }
      
      return success;
    } catch (err: any) {
      console.error(`❌ Failed to navigate to step ${stepNumber}:`, err);
      setError(err.message || `Failed to navigate to step ${stepNumber}`);
      return false;
    }
  }, []);

  // Email verification
  const verifyEmail = useCallback(async (code?: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const success = await onboardingSessionManager.verifyEmail(code);
      
      if (success) {
        const updatedSession = onboardingSessionManager.getCurrentSession();
        setSession(updatedSession);
        console.log('✅ Email verified successfully');
      }
      
      return success;
    } catch (err: any) {
      console.error('❌ Email verification failed:', err);
      setError(err.message || 'Email verification failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Send phone verification
  const sendPhoneVerification = useCallback(async (phoneNumber: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      await onboardingSessionManager.sendPhoneVerification(phoneNumber);
      
      console.log('📱 Phone verification code sent');
    } catch (err: any) {
      console.error('❌ Failed to send phone verification:', err);
      setError(err.message || 'Failed to send phone verification');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Verify phone
  const verifyPhone = useCallback(async (phoneNumber: string, code: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const success = await onboardingSessionManager.verifyPhone(phoneNumber, code);
      
      if (success) {
        const updatedSession = onboardingSessionManager.getCurrentSession();
        setSession(updatedSession);
        console.log('✅ Phone verified successfully');
      }
      
      return success;
    } catch (err: any) {
      console.error('❌ Phone verification failed:', err);
      setError(err.message || 'Phone verification failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Complete onboarding
  const completeOnboarding = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      await onboardingSessionManager.completeOnboarding();
      
      const updatedSession = onboardingSessionManager.getCurrentSession();
      setSession(updatedSession);
      
      console.log('🏁 Onboarding completed successfully');
    } catch (err: any) {
      console.error('❌ Failed to complete onboarding:', err);
      setError(err.message || 'Failed to complete onboarding');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get step data
  const getStepData = useCallback((stepNumber: number): Record<string, any> => {
    return onboardingSessionManager.getStepData(stepNumber);
  }, []);

  // Check if step is completed
  const isStepCompleted = useCallback((stepNumber: number): boolean => {
    return session?.steps.find(s => s.stepNumber === stepNumber)?.isCompleted || false;
  }, [session]);

  // Check if can navigate to step
  const canNavigateToStep = useCallback((stepNumber: number): boolean => {
    if (!session) return false;
    
    return stepNumber <= session.currentStep || 
           session.steps[stepNumber - 1]?.isCompleted || false;
  }, [session]);

  // Clear session
  const clearSession = useCallback(() => {
    onboardingSessionManager.clearSession();
    setSession(null);
    setError(null);
  }, []);

  // Computed values
  const currentStep = session?.currentStep || 1;
  const progress = onboardingSessionManager.getProgress();
  const verificationRequired = onboardingSessionManager.isVerificationRequired();

  return {
    // Session state
    session,
    currentStep,
    isLoading,
    error,
    
    // Progress tracking
    progress,
    
    // Verification state
    verificationRequired,
    
    // Actions
    startOnboarding,
    updateStepData,
    goToStep,
    
    // Verification actions
    verifyEmail,
    sendPhoneVerification,
    verifyPhone,
    
    // Completion
    completeOnboarding,
    
    // Utilities
    getStepData,
    isStepCompleted,
    canNavigateToStep,
    clearSession,
    clearError
  };
}

export default useOnboarding;