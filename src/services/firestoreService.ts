/**
 * Firestore Service - Direct Implementation
 * Uses Firebase SDK for real persistence
 */

import { db } from '../lib/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { OnboardingData } from '../types/onboarding';
import { logger, AuditEventType } from './secureLogger';

// Keep existing interfaces for compatibility
export interface TherapistProfile extends Partial<OnboardingData> {
  uid: string;
  email: string;
  displayName: string;
  role: 'therapist' | 'admin' | 'client';
  createdAt?: any;
  updatedAt?: any;
  onboardingCompleted?: boolean;
  onboardingStep?: number;
  signupMethod?: 'email' | 'google' | 'apple' | 'phone';
  profilePhotoUrl?: string | null;
  avatarUrl?: string | null;
  photoType?: 'custom' | 'avatar' | null;
}

/**
 * Save therapist profile
 */
export async function saveTherapistProfile(
  userId: string,
  profileData: Partial<TherapistProfile>
): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, profileData, { merge: true });

    logger.info('Therapist profile saved', { userId });
    logger.audit({
      eventType: AuditEventType.PHI_MODIFY,
      userId,
      resourceType: 'therapist_profile',
      action: 'Profile saved',
      success: true,
    });
  } catch (error) {
    logger.error('Failed to save therapist profile', error, { userId });
    throw error;
  }
}

/**
 * Get therapist profile
 */
export async function getTherapistProfile(userId: string): Promise<TherapistProfile | null> {
  try {
    const userRef = doc(db, 'users', userId);
    const snap = await getDoc(userRef);

    if (snap.exists()) {
      return snap.data() as TherapistProfile;
    }
    return null;
  } catch (error) {
    logger.error('Failed to get therapist profile', error, { userId });
    return null;
  }
}

/**
 * Update onboarding progress
 */
export async function updateOnboardingProgress(
  userId: string,
  step: number,
  data: Partial<OnboardingData>
): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      onboardingStep: step,
      ...data
    }, { merge: true });

    logger.info('Onboarding progress saved', { userId, step });
  } catch (error) {
    logger.error('Failed to update onboarding progress', error, { userId, step });
    throw error;
  }
}

/**
 * Mark onboarding as complete
 */
export async function completeOnboarding(
  userId: string,
  finalData: Partial<OnboardingData>
): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      ...finalData,
      onboardingCompleted: true,
      onboardingStep: 10 // Final step
    }, { merge: true });

    logger.info('Onboarding completed', { userId });
    logger.audit({
      eventType: AuditEventType.PHI_MODIFY,
      userId,
      resourceType: 'therapist_profile',
      action: 'Onboarding completed',
      success: true,
    });
  } catch (error) {
    logger.error('Failed to complete onboarding', error, { userId });
    throw error;
  }
}

/**
 * Save OAuth user initial data
 */
export async function saveOAuthUserData(
  userId: string,
  email: string,
  displayName: string,
  signupMethod: 'google' | 'apple'
): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    const snap = await getDoc(userRef);

    if (!snap.exists()) {
      await setDoc(userRef, {
        id: userId,
        uid: userId,
        email,
        displayName,
        fullName: displayName,
        role: 'therapist',
        signupMethod,
        onboardingCompleted: false,
        onboardingStep: 2, // Start at Phone Verification
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      console.log(`✅ OAuth user data saved for ${signupMethod} user: ${userId}`);
    }
  } catch (error) {
    console.error('Error saving OAuth user:', error);
    throw error;
  }
}

/**
 * Update user profile photo
 */
export async function updateProfilePhoto(
  userId: string,
  photoUrl: string
): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      profilePhotoUrl: photoUrl,
      photoType: 'custom'
    });
  } catch (error) {
    console.error('Error updating photo:', error);
    throw error;
  }
}

/**
 * Update user avatar
 */
export async function updateAvatar(
  userId: string,
  avatarUrl: string
): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      avatarUrl: avatarUrl,
      photoType: 'avatar'
    });
  } catch (error) {
    console.error('Error updating avatar:', error);
    throw error;
  }
}

/**
 * Remove user profile photo/avatar
 */
export async function removeProfilePhoto(
  userId: string
): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      profilePhotoUrl: null,
      avatarUrl: null,
      photoType: null
    });
  } catch (error) {
    console.error('Error removing photo:', error);
    throw error;
  }
}

/**
 * Get user's current profile photo/avatar
 */
export async function getUserPhoto(userId: string): Promise<{
  url: string | null;
  type: 'custom' | 'avatar' | null;
}> {
  try {
    const profile = await getTherapistProfile(userId);

    if (!profile) {
      return { url: null, type: null };
    }

    const type = profile.photoType || null;
    const url = type === 'custom'
      ? profile.profilePhotoUrl || null
      : type === 'avatar'
        ? profile.avatarUrl || null
        : null;

    return { url, type };
  } catch (error) {
    console.error('Error getting user photo:', error);
    return { url: null, type: null };
  }
}
