/**
 * Firebase Configuration and Initialization
 * 
 * Initializes Firebase with production credentials for:
 * - Authentication (primary provider)
 * - Firestore (data storage)
 * - Cloud Storage (file uploads)
 * - Phone Authentication (SMS OTP)
 * - Google OAuth (Social login)
 */

import { initializeApp } from 'firebase/app';
import {
  getAuth,
  connectAuthEmulator,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  PhoneAuthProvider,
  signInWithCredential
} from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Validate Firebase configuration
function validateFirebaseConfig() {
  const requiredFields = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
  const missing = requiredFields.filter(field => !firebaseConfig[field as keyof typeof firebaseConfig]);

  if (missing.length > 0) {
    throw new Error(`Missing Firebase configuration: ${missing.join(', ')}`);
  }
}

// Initialize Firebase
validateFirebaseConfig();
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Connect to emulators in development
if (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true') {
  try {
    connectAuthEmulator(auth, 'http://localhost:9099');
    connectFirestoreEmulator(db, 'localhost', 8080);
    connectStorageEmulator(storage, 'localhost', 9199);
    console.log('🔥 Connected to Firebase emulators');
  } catch (error) {
    console.warn('Firebase emulators not available:', error);
  }
}

// Phone Authentication Service
export class FirebasePhoneAuth {
  private recaptchaVerifier: RecaptchaVerifier | null = null;

  initializeRecaptcha() {
    // Ensure clean slate
    const container = document.getElementById('recaptcha-container');
    if (container) container.innerHTML = '';

    if (!this.recaptchaVerifier) {
      this.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'normal',
        callback: () => {
          console.log('✅ reCAPTCHA solved');
        },
        'expired-callback': () => {
          console.log('⚠️ reCAPTCHA expired');
        }
      });
    }
    return this.recaptchaVerifier;
  }

  async sendPhoneVerification(phoneNumber: string) {
    try {
      this.cleanup(); // Force fresh reCAPTCHA on retry
      const recaptcha = this.initializeRecaptcha();
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptcha);
      console.log('📱 SMS verification code sent to:', phoneNumber);
      return confirmationResult;
    } catch (error: any) {
      console.error('❌ Phone verification failed:', error);
      throw error;
    }
  }

  async verifyPhoneCode(confirmationResult: any, code: string) {
    try {
      const result = await confirmationResult.confirm(code);
      console.log('✅ Phone verification successful');
      return result;
    } catch (error: any) {
      console.error('❌ Phone code verification failed:', error);
      throw error;
    }
  }

  cleanup() {
    if (this.recaptchaVerifier) {
      this.recaptchaVerifier.clear();
      this.recaptchaVerifier = null;
    }
  }
}

// Google OAuth Service
export class FirebaseGoogleAuth {
  private provider: GoogleAuthProvider;

  constructor() {
    this.provider = new GoogleAuthProvider();
    // Request additional scopes
    this.provider.addScope('email');
    this.provider.addScope('profile');
    // Force account selection
    this.provider.setCustomParameters({
      prompt: 'select_account'
    });
  }

  async signInWithPopup() {
    try {
      const result = await signInWithPopup(auth, this.provider);
      const idToken = await result.user.getIdToken();

      console.log('✅ Google OAuth successful:', {
        email: result.user.email,
        name: result.user.displayName
      });

      return {
        user: result.user,
        credential: GoogleAuthProvider.credentialFromResult(result),
        idToken
      };
    } catch (error: any) {
      console.error('❌ Google popup sign-in failed:', error);
      throw error;
    }
  }

  async signInWithRedirect() {
    try {
      await signInWithRedirect(auth, this.provider);
    } catch (error: any) {
      console.error('❌ Google redirect sign-in failed:', error);
      throw error;
    }
  }
}

// Export service instances
export const firebasePhoneAuth = new FirebasePhoneAuth();
export const firebaseGoogleAuth = new FirebaseGoogleAuth();

// Export the app instance
export default app;

// Configuration validation helper
export function getFirebaseConfig() {
  return {
    ...firebaseConfig,
    isConfigured: Object.values(firebaseConfig).every(value => value !== undefined && value !== ''),
    environment: import.meta.env.DEV ? 'development' : 'production'
  };
}

console.log('🔥 Firebase initialized:', {
  projectId: firebaseConfig.projectId,
  environment: import.meta.env.DEV ? 'development' : 'production',
  authDomain: firebaseConfig.authDomain,
  phoneAuthEnabled: true,
  googleOAuthEnabled: true
});