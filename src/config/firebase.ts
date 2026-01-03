// Re-export specific instances from lib/firebase
// This maintains compatibility with existing imports while using the centralized configuration
import { app as libApp, auth as libAuth, db as libDb, storage as libStorage } from '../lib/firebase';

export const app = libApp;
export const auth = libAuth;
export const db = libDb;
export const storage = libStorage;
export const isFirebaseConfigured = true;

export default app;