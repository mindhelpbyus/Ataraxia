/**
 * Firebase Error Handler
 * 
 * Catches and displays Firebase errors in a readable format
 */

import { FirebaseError } from 'firebase/app';
import { logger } from '../services/secureLogger';


export interface FirebaseErrorDetails {
  code: string;
  message: string;
  fullError: any;
  userMessage: string;
}

/**
 * Parse Firebase error into readable format
 */
export function parseFirebaseError(error: any): FirebaseErrorDetails {
  // Handle FirebaseError objects
  if (error instanceof FirebaseError) {
    return {
      code: error.code,
      message: error.message,
      fullError: error,
      userMessage: getReadableMessage(error.code, error.message)
    };
  }

  // Handle generic errors
  if (error instanceof Error) {
    return {
      code: 'unknown',
      message: error.message,
      fullError: error,
      userMessage: error.message
    };
  }

  // Handle string errors
  if (typeof error === 'string') {
    return {
      code: 'unknown',
      message: error,
      fullError: error,
      userMessage: error
    };
  }

  // Unknown error type
  return {
    code: 'unknown',
    message: String(error),
    fullError: error,
    userMessage: 'An unknown error occurred'
  };
}

/**
 * Convert Firebase error codes to user-friendly messages
 */
function getReadableMessage(code: string, originalMessage: string): string {
  const errorMessages: Record<string, string> = {
    // Firestore errors
    'permission-denied': 'You do not have permission to access this data. Please check your authentication.',
    'not-found': 'The requested data was not found.',
    'already-exists': 'This data already exists.',
    'failed-precondition': 'The operation was rejected. Please try again.',
    'aborted': 'The operation was aborted. Please try again.',
    'out-of-range': 'The operation was attempted past the valid range.',
    'unimplemented': 'This operation is not implemented or supported.',
    'internal': 'Internal server error. Please try again later.',
    'unavailable': 'The service is currently unavailable. Please check your internet connection.',
    'data-loss': 'Data loss or corruption detected.',
    'unauthenticated': 'You must be logged in to perform this action.',
    
    // Auth errors
    'auth/user-not-found': 'No user found with these credentials.',
    'auth/wrong-password': 'Incorrect password.',
    'auth/invalid-email': 'Invalid email address.',
    'auth/user-disabled': 'This user account has been disabled.',
    'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
    'auth/network-request-failed': 'Network error. Please check your internet connection.',
    
    // Network errors
    'network-request-failed': 'Network error. Please check your internet connection and try again.',
    'timeout': 'The operation timed out. Please try again.',
  };

  // Extract base code (remove auth/ prefix if present)
  const baseCode = code.replace('auth/', '');
  
  return errorMessages[code] || errorMessages[baseCode] || originalMessage || 'An error occurred';
}

/**
 * Log Firebase error in a structured format
 */
export function logFirebaseError(error: any, context?: string) {
  const parsed = parseFirebaseError(error);
  
  console.group(`🔥 Firebase Error${context ? ` - ${context}` : ''}`);
  logger.error('Error Code:', parsed.code);
  logger.error('Error Message:', parsed.message);
  logger.error('User Message:', parsed.userMessage);
  logger.error('Full Error:', parsed.fullError);
  console.groupEnd();
}

/**
 * Wrap async Firebase operations with error handling
 */
export async function withFirebaseErrorHandling<T>(
  operation: () => Promise<T>,
  context?: string
): Promise<T | null> {
  try {
    return await operation();
  } catch (error) {
    logFirebaseError(error, context);
    return null;
  }
}

/**
 * Check if error is a Firebase permission error
 */
export function isPermissionError(error: any): boolean {
  const parsed = parseFirebaseError(error);
  return parsed.code === 'permission-denied' || parsed.code === 'auth/unauthenticated';
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: any): boolean {
  const parsed = parseFirebaseError(error);
  return parsed.code.includes('network') || 
         parsed.code.includes('unavailable') ||
         parsed.code.includes('timeout');
}

/**
 * Suppress specific error codes (for expected errors)
 */
export function shouldSuppressError(error: any, suppressCodes: string[]): boolean {
  const parsed = parseFirebaseError(error);
  return suppressCodes.includes(parsed.code);
}
