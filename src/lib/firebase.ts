
import { initializeApp } from "firebase/app";
import {
    getAuth,
    GoogleAuthProvider,
    OAuthProvider,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendEmailVerification,
    sendPasswordResetEmail,
    updateEmail,
    updatePassword,
    User
} from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For MVP, user can paste their config here or use env vars
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCM2W8UE5gJekK2vV2d-UE5fVe3ZXzk1vQ",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "ataraxia-c150f.firebaseapp.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "ataraxia-c150f",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "ataraxia-c150f.firebasestorage.app",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "481172000503",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:481172000503:web:b98df3fbeb3c3c527e0df2"
};


// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

// Apple Sign-In Provider (works with iCloud email - no Apple Developer account needed for users)
export const appleProvider = new OAuthProvider('apple.com');
appleProvider.addScope('email');
appleProvider.addScope('name');

// Initialize Analytics conditionally
isSupported().then(supported => {
    if (supported) {
        getAnalytics(app);
    }
}).catch(console.error);

// Firebase Email/Password Authentication Helpers
export const firebaseEmailAuth = {
    // Sign up with email and password
    signUp: async (email: string, password: string) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        return userCredential;
    },

    // Sign in with email and password
    signIn: async (email: string, password: string) => {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential;
    },

    // Send email verification
    sendVerification: async (user: User) => {
        await sendEmailVerification(user);
    },

    // Send password reset email
    resetPassword: async (email: string) => {
        await sendPasswordResetEmail(auth, email);
    },

    // Update email
    changeEmail: async (user: User, newEmail: string) => {
        await updateEmail(user, newEmail);
    },

    // Update password
    changePassword: async (user: User, newPassword: string) => {
        await updatePassword(user, newPassword);
    },

    // Sign out
    signOut: async () => {
        await auth.signOut();
    }
};
