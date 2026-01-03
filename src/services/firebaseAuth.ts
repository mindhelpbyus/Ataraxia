/**
 * Firebase Auth Service - REAL Implementation
 * Uses src/lib/firebase configuration
 */

import { auth, googleProvider, appleProvider } from '../lib/firebase';
import {
  signInWithPopup,
  createUserWithEmailAndPassword,
  User as FirebaseUser,
  RecaptchaVerifier,
  signInWithPhoneNumber
} from 'firebase/auth';

// Types aligned with previous mock types
export type User = {
  uid: string;
  email: string | null;
  displayName: string | null;
  phoneNumber: string | null;
  photoURL: string | null;
};

export type UserProfile = {
  uid: string;
  email?: string;
  phoneNumber?: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  role: 'admin' | 'therapist' | 'client';
  createdAt: any;
  updatedAt: any;
  mfaEnabled?: boolean;
};

export type UserCredential = {
  user: User;
};

// Map Firebase User to our User type
const mapUser = (user: FirebaseUser): User => ({
  uid: user.uid,
  email: user.email,
  displayName: user.displayName,
  phoneNumber: user.phoneNumber,
  photoURL: user.photoURL
});

export const isFirebaseConfigured = true;

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    return {
      user: mapUser(user),
      isNewUser: false, // In real app, we check if user exists in DB
      userProfile: {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || '',
        role: 'therapist', // Default role for signup context
        createdAt: new Date(),
        updatedAt: new Date()
      } as UserProfile
    };
  } catch (error) {
    console.error("Google Sign In Error", error);
    throw error;
  }
};

export const signInWithApple = async () => {
  try {
    const result = await signInWithPopup(auth, appleProvider);
    const user = result.user;

    return {
      user: mapUser(user),
      isNewUser: false,
      userProfile: {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || '',
        role: 'therapist',
        createdAt: new Date(),
        updatedAt: new Date()
      } as UserProfile
    };
  } catch (error) {
    console.error("Apple Sign In Error", error);
    throw error;
  }
};

export const createUserWithEmail = async (email: string, password: string): Promise<UserCredential> => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return {
      user: mapUser(result.user)
    };
  } catch (error) {
    console.error("Email API Error", error);
    throw error;
  }
};

export const signOut = async () => {
  await auth.signOut();
};

export const getAuthErrorMessage = (error: any) => {
  if (error.code === 'auth/popup-closed-by-user') return 'Sign in cancelled';
  if (error.code === 'auth/email-already-in-use') return 'Email already in use';
  return error.message || 'Unknown authentication error';
};

// 2FA / Phone Auth stubs (implement if needed)
export const sendPhoneOTP = async (phoneNumber: string) => {
  // Requires invisible recaptcha setup
  throw new Error("Phone auth requires setup");
};

export const verifyPhoneOTP = async (confirmationResult: any, otp: string) => {
  throw new Error("Phone auth requires setup");
};

export const completePhoneAuth = async (confirmationResult: any, otp: string) => {
  throw new Error("Phone auth requires setup");
};