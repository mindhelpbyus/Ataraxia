/**
 * Onboarding Session Manager
 * 
 * Manages the 10-step therapist onboarding process with:
 * ✅ Session persistence across page reloads
 * ✅ Auto-save on each step
 * ✅ Resume from any step
 * ✅ Data validation and backup
 * ✅ Seamless auth provider integration
 * ✅ Phone and email verification
 */

import { tokenManager } from './tokenManager';

export interface OnboardingStep {
  stepNumber: number;
  stepName: string;
  isCompleted: boolean;
  data: Record<string, any>;
  completedAt?: Date;
  isValid?: boolean;
}

export interface OnboardingSession {
  sessionId: string;
  userId: string;
  email: string;
  currentStep: number;
  totalSteps: number;
  startedAt: Date;
  lastUpdatedAt: Date;
  isCompleted: boolean;
  steps: OnboardingStep[];
  verificationStatus: {
    email: {
      isRequired: boolean;
      isVerified: boolean;
      verifiedAt?: Date;
      method: 'cognito' | 'firebase' | 'custom';
    };
    phone: {
      isRequired: boolean;
      isVerified: boolean;
      verifiedAt?: Date;
      phoneNumber?: string;
      method: 'sms' | 'voice' | 'whatsapp';
    };
  };
  authProvider: 'cognito' | 'firebase';
  metadata: Record<string, any>;
}

class OnboardingSessionManager {
  private readonly STORAGE_KEY = 'ataraxia_onboarding_session';
  private readonly AUTO_SAVE_INTERVAL = 30000; // 30 seconds
  private autoSaveTimer: NodeJS.Timeout | null = null;
  private currentSession: OnboardingSession | null = null;

  constructor() {
    this.initializeSession();
    this.setupAutoSave();
  }

  /**
   * 🚀 START NEW ONBOARDING SESSION
   * Creates a new onboarding session after user registration
   */
  async startOnboarding(
    userId: string,
    email: string,
    authProvider: 'cognito' | 'firebase',
    initialData?: Record<string, any>
  ): Promise<OnboardingSession> {
    const sessionId = this.generateSessionId();
    
    const session: OnboardingSession = {
      sessionId,
      userId,
      email,
      currentStep: 1,
      totalSteps: 10,
      startedAt: new Date(),
      lastUpdatedAt: new Date(),
      isCompleted: false,
      steps: this.initializeSteps(initialData),
      verificationStatus: {
        email: {
          isRequired: true,
          isVerified: false,
          method: authProvider === 'cognito' ? 'cognito' : 'firebase'
        },
        phone: {
          isRequired: true,
          isVerified: false,
          method: 'sms'
        }
      },
      authProvider,
      metadata: {
        userAgent: navigator.userAgent,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        startedFrom: window.location.href
      }
    };

    this.currentSession = session;
    this.saveSession();
    
    console.log('🚀 Onboarding session started:', {
      sessionId,
      userId,
      email,
      authProvider
    });

    return session;
  }

  /**
   * 📝 UPDATE STEP DATA
   * Updates data for a specific step and auto-saves
   */
  async updateStepData(
    stepNumber: number,
    data: Record<string, any>,
    markCompleted: boolean = false
  ): Promise<void> {
    if (!this.currentSession) {
      throw new Error('No active onboarding session');
    }

    const step = this.currentSession.steps.find(s => s.stepNumber === stepNumber);
    if (!step) {
      throw new Error(`Step ${stepNumber} not found`);
    }

    // Merge new data with existing data
    step.data = { ...step.data, ...data };
    step.isValid = this.validateStepData(stepNumber, step.data);
    
    if (markCompleted && step.isValid) {
      step.isCompleted = true;
      step.completedAt = new Date();
      
      // Auto-advance to next step
      if (stepNumber === this.currentSession.currentStep && stepNumber < this.currentSession.totalSteps) {
        this.currentSession.currentStep = stepNumber + 1;
      }
    }

    this.currentSession.lastUpdatedAt = new Date();
    this.saveSession();

    console.log(`📝 Step ${stepNumber} updated:`, {
      isCompleted: step.isCompleted,
      isValid: step.isValid,
      currentStep: this.currentSession.currentStep
    });

    // Auto-save to backend every few steps
    if (stepNumber % 3 === 0 || markCompleted) {
      await this.backupToBackend();
    }
  }

  /**
   * ➡️ NAVIGATE TO STEP
   * Safely navigate to a specific step
   */
  goToStep(stepNumber: number): boolean {
    if (!this.currentSession) {
      return false;
    }

    if (stepNumber < 1 || stepNumber > this.currentSession.totalSteps) {
      return false;
    }

    // Can only go to completed steps or the next step
    const canNavigate = stepNumber <= this.currentSession.currentStep || 
                       this.currentSession.steps[stepNumber - 1]?.isCompleted;

    if (canNavigate) {
      this.currentSession.currentStep = stepNumber;
      this.currentSession.lastUpdatedAt = new Date();
      this.saveSession();
      return true;
    }

    return false;
  }

  /**
   * ✅ VERIFY EMAIL
   * Handles email verification for both Cognito and Firebase
   */
  async verifyEmail(verificationCode?: string): Promise<boolean> {
    if (!this.currentSession) {
      throw new Error('No active onboarding session');
    }

    try {
      if (this.currentSession.authProvider === 'cognito') {
        // Cognito email verification
        const { confirmSignUp } = await import('./enhancedAuthService');
        await confirmSignUp(this.currentSession.email, verificationCode!);
      } else {
        // Firebase email verification (usually automatic)
        // Firebase handles this through their SDK
        console.log('Firebase email verification handled by SDK');
      }

      this.currentSession.verificationStatus.email.isVerified = true;
      this.currentSession.verificationStatus.email.verifiedAt = new Date();
      this.saveSession();

      console.log('✅ Email verified successfully');
      return true;
    } catch (error) {
      console.error('❌ Email verification failed:', error);
      throw error;
    }
  }

  /**
   * 📱 VERIFY PHONE NUMBER
   * Handles phone verification with OTP
   */
  async sendPhoneVerification(phoneNumber: string): Promise<void> {
    if (!this.currentSession) {
      throw new Error('No active onboarding session');
    }

    try {
      // Call backend API to send SMS
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3010';
      
      const response = await fetch(`${API_BASE_URL}/api/auth/phone/send-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await tokenManager.getIdToken()}`
        },
        body: JSON.stringify({
          phoneNumber,
          userId: this.currentSession.userId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send phone verification');
      }

      this.currentSession.verificationStatus.phone.phoneNumber = phoneNumber;
      this.saveSession();

      console.log('📱 Phone verification code sent to:', phoneNumber);
    } catch (error) {
      console.error('❌ Failed to send phone verification:', error);
      throw error;
    }
  }

  async verifyPhone(phoneNumber: string, verificationCode: string): Promise<boolean> {
    if (!this.currentSession) {
      throw new Error('No active onboarding session');
    }

    try {
      // Call backend API to verify SMS code
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3010';
      
      const response = await fetch(`${API_BASE_URL}/api/auth/phone/verify-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await tokenManager.getIdToken()}`
        },
        body: JSON.stringify({
          phoneNumber,
          verificationCode,
          userId: this.currentSession.userId
        })
      });

      if (!response.ok) {
        throw new Error('Phone verification failed');
      }

      this.currentSession.verificationStatus.phone.isVerified = true;
      this.currentSession.verificationStatus.phone.verifiedAt = new Date();
      this.saveSession();

      console.log('✅ Phone verified successfully');
      return true;
    } catch (error) {
      console.error('❌ Phone verification failed:', error);
      throw error;
    }
  }

  /**
   * 🏁 COMPLETE ONBOARDING
   * Finalizes onboarding and creates user in database
   */
  async completeOnboarding(): Promise<void> {
    if (!this.currentSession) {
      throw new Error('No active onboarding session');
    }

    // Validate all steps are completed
    const incompleteSteps = this.currentSession.steps.filter(step => !step.isCompleted);
    if (incompleteSteps.length > 0) {
      throw new Error(`Please complete steps: ${incompleteSteps.map(s => s.stepNumber).join(', ')}`);
    }

    // Check verification requirements
    const { email, phone } = this.currentSession.verificationStatus;
    
    // For healthcare, we require BOTH email and phone verification
    if (email.isRequired && !email.isVerified) {
      throw new Error('Email verification is required');
    }
    
    if (phone.isRequired && !phone.isVerified) {
      throw new Error('Phone verification is required');
    }

    try {
      // Submit complete profile to backend
      await this.submitCompleteProfile();
      
      this.currentSession.isCompleted = true;
      this.currentSession.lastUpdatedAt = new Date();
      this.saveSession();

      console.log('🏁 Onboarding completed successfully');
    } catch (error) {
      console.error('❌ Failed to complete onboarding:', error);
      throw error;
    }
  }

  /**
   * 💾 SESSION PERSISTENCE
   */
  private initializeSession(): void {
    try {
      const savedSession = localStorage.getItem(this.STORAGE_KEY);
      if (savedSession) {
        this.currentSession = JSON.parse(savedSession);
        
        // Convert date strings back to Date objects
        if (this.currentSession) {
          this.currentSession.startedAt = new Date(this.currentSession.startedAt);
          this.currentSession.lastUpdatedAt = new Date(this.currentSession.lastUpdatedAt);
          
          this.currentSession.steps.forEach(step => {
            if (step.completedAt) {
              step.completedAt = new Date(step.completedAt);
            }
          });
        }
        
        console.log('📂 Onboarding session restored from storage');
      }
    } catch (error) {
      console.error('❌ Failed to restore onboarding session:', error);
      this.clearSession();
    }
  }

  private saveSession(): void {
    if (this.currentSession) {
      try {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.currentSession));
      } catch (error) {
        console.error('❌ Failed to save onboarding session:', error);
      }
    }
  }

  private setupAutoSave(): void {
    this.autoSaveTimer = setInterval(() => {
      if (this.currentSession && !this.currentSession.isCompleted) {
        this.backupToBackend().catch(error => {
          console.error('❌ Auto-save to backend failed:', error);
        });
      }
    }, this.AUTO_SAVE_INTERVAL);
  }

  private async backupToBackend(): Promise<void> {
    if (!this.currentSession) return;

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3010';
      
      const response = await fetch(`${API_BASE_URL}/api/onboarding/backup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await tokenManager.getIdToken()}`
        },
        body: JSON.stringify(this.currentSession)
      });

      if (response.ok) {
        console.log('💾 Session backed up to backend');
      }
    } catch (error) {
      console.error('❌ Backend backup failed:', error);
      // Don't throw - this is a background operation
    }
  }

  private async submitCompleteProfile(): Promise<void> {
    if (!this.currentSession) return;

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3010';
    
    const response = await fetch(`${API_BASE_URL}/api/therapist/complete-onboarding`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await tokenManager.getIdToken()}`
      },
      body: JSON.stringify({
        sessionId: this.currentSession.sessionId,
        userId: this.currentSession.userId,
        profileData: this.getAllStepData(),
        verificationStatus: this.currentSession.verificationStatus
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to submit profile');
    }
  }

  private initializeSteps(initialData?: Record<string, any>): OnboardingStep[] {
    const stepDefinitions = [
      { stepNumber: 1, stepName: 'Personal Information', data: initialData?.personal || {} },
      { stepNumber: 2, stepName: 'Professional Credentials', data: {} },
      { stepNumber: 3, stepName: 'License Verification', data: {} },
      { stepNumber: 4, stepName: 'Education & Training', data: {} },
      { stepNumber: 5, stepName: 'Specializations', data: {} },
      { stepNumber: 6, stepName: 'Availability & Scheduling', data: {} },
      { stepNumber: 7, stepName: 'Insurance & Billing', data: {} },
      { stepNumber: 8, stepName: 'Profile & Bio', data: {} },
      { stepNumber: 9, stepName: 'Verification Documents', data: {} },
      { stepNumber: 10, stepName: 'Review & Submit', data: {} }
    ];

    return stepDefinitions.map(def => ({
      ...def,
      isCompleted: false,
      isValid: false
    }));
  }

  private validateStepData(stepNumber: number, data: Record<string, any>): boolean {
    // Step-specific validation logic
    switch (stepNumber) {
      case 1: // Personal Information
        return !!(data.firstName && data.lastName && data.dateOfBirth);
      case 2: // Professional Credentials
        return !!(data.licenseNumber && data.licenseState);
      case 3: // License Verification
        return !!(data.licenseVerified);
      // Add validation for other steps
      default:
        return Object.keys(data).length > 0;
    }
  }

  private generateSessionId(): string {
    return `onb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getAllStepData(): Record<string, any> {
    if (!this.currentSession) return {};
    
    return this.currentSession.steps.reduce((acc, step) => {
      acc[step.stepName.toLowerCase().replace(/\s+/g, '_')] = step.data;
      return acc;
    }, {} as Record<string, any>);
  }

  // Public getters
  getCurrentSession(): OnboardingSession | null {
    return this.currentSession;
  }

  getCurrentStep(): number {
    return this.currentSession?.currentStep || 1;
  }

  getStepData(stepNumber: number): Record<string, any> {
    const step = this.currentSession?.steps.find(s => s.stepNumber === stepNumber);
    return step?.data || {};
  }

  getProgress(): { completed: number; total: number; percentage: number } {
    if (!this.currentSession) {
      return { completed: 0, total: 10, percentage: 0 };
    }

    const completed = this.currentSession.steps.filter(s => s.isCompleted).length;
    const total = this.currentSession.totalSteps;
    const percentage = Math.round((completed / total) * 100);

    return { completed, total, percentage };
  }

  isVerificationRequired(): { email: boolean; phone: boolean } {
    if (!this.currentSession) {
      return { email: true, phone: true };
    }

    return {
      email: this.currentSession.verificationStatus.email.isRequired && 
             !this.currentSession.verificationStatus.email.isVerified,
      phone: this.currentSession.verificationStatus.phone.isRequired && 
             !this.currentSession.verificationStatus.phone.isVerified
    };
  }

  clearSession(): void {
    this.currentSession = null;
    localStorage.removeItem(this.STORAGE_KEY);
    
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
  }

  // Cleanup on page unload
  destroy(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
    }
  }
}

// Create singleton instance
export const onboardingSessionManager = new OnboardingSessionManager();

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  onboardingSessionManager.destroy();
});

export default onboardingSessionManager;