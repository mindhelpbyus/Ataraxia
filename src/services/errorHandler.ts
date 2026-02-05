/**
 * Comprehensive Error Handler
 * 
 * Handles API failures, authentication errors, and network issues
 * with user-friendly messages and automatic recovery strategies
 */

import { logger } from './secureLogger';
import { tokenRefreshService } from './tokenRefresh';

export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  provider?: 'firebase' | 'cognito';
  endpoint?: string;
  requestId?: string;
}

export interface ErrorResult {
  message: string;
  userMessage: string;
  shouldRetry: boolean;
  shouldReauth: boolean;
  retryAfter?: number;
  errorCode?: string;
}

export class ErrorHandler {
  private retryAttempts = new Map<string, number>();
  private readonly MAX_RETRY_ATTEMPTS = 3;
  private readonly RETRY_DELAYS = [1000, 2000, 4000]; // Progressive delays

  /**
   * Handle API errors with automatic retry and recovery
   */
  async handleApiError(error: any, context: ErrorContext): Promise<ErrorResult> {
    const errorKey = `${context.endpoint || 'unknown'}_${context.action || 'unknown'}`;
    const attempts = this.retryAttempts.get(errorKey) || 0;

    logger.error('API Error occurred', {
      error: error.message,
      context,
      attempts,
      stack: error.stack
    });

    // Authentication errors
    if (this.isAuthError(error)) {
      return this.handleAuthError(error, context);
    }

    // Network errors
    if (this.isNetworkError(error)) {
      return this.handleNetworkError(error, context, attempts);
    }

    // Rate limiting errors
    if (this.isRateLimitError(error)) {
      return this.handleRateLimitError(error, context);
    }

    // Validation errors
    if (this.isValidationError(error)) {
      return this.handleValidationError(error, context);
    }

    // Server errors
    if (this.isServerError(error)) {
      return this.handleServerError(error, context, attempts);
    }

    // Unknown errors
    return this.handleUnknownError(error, context);
  }

  /**
   * Handle authentication errors
   */
  private async handleAuthError(error: any, context: ErrorContext): Promise<ErrorResult> {
    const errorCode = error.code || error.name || 'AUTH_ERROR';

    // Token expired - try refresh
    if (this.isTokenExpiredError(error)) {
      logger.info('Token expired, attempting refresh', { context });

      try {
        const refreshResult = await tokenRefreshService.refreshToken();
        
        if (refreshResult.success) {
          return {
            message: 'Token refreshed successfully',
            userMessage: 'Session renewed. Please try again.',
            shouldRetry: true,
            shouldReauth: false,
            errorCode
          };
        } else if (refreshResult.needsReauth) {
          return {
            message: 'Refresh failed, reauthentication required',
            userMessage: 'Your session has expired. Please sign in again.',
            shouldRetry: false,
            shouldReauth: true,
            errorCode
          };
        }
      } catch (refreshError) {
        logger.error('Token refresh failed', { refreshError, context });
      }
    }

    // Invalid credentials
    if (this.isInvalidCredentialsError(error)) {
      return {
        message: 'Invalid credentials provided',
        userMessage: 'Invalid email or password. Please check your credentials.',
        shouldRetry: false,
        shouldReauth: false,
        errorCode
      };
    }

    // Account locked/disabled
    if (this.isAccountLockedError(error)) {
      return {
        message: 'Account is locked or disabled',
        userMessage: 'Your account has been temporarily locked. Please contact support.',
        shouldRetry: false,
        shouldReauth: false,
        errorCode
      };
    }

    // MFA required
    if (this.isMfaRequiredError(error)) {
      return {
        message: 'MFA verification required',
        userMessage: 'Please complete multi-factor authentication.',
        shouldRetry: false,
        shouldReauth: false,
        errorCode
      };
    }

    // Generic auth error
    return {
      message: `Authentication error: ${error.message}`,
      userMessage: 'Authentication failed. Please sign in again.',
      shouldRetry: false,
      shouldReauth: true,
      errorCode
    };
  }

  /**
   * Handle network errors with retry logic
   */
  private handleNetworkError(error: any, context: ErrorContext, attempts: number): ErrorResult {
    const errorKey = `${context.endpoint || 'unknown'}_${context.action || 'unknown'}`;

    if (attempts < this.MAX_RETRY_ATTEMPTS) {
      this.retryAttempts.set(errorKey, attempts + 1);
      const retryAfter = this.RETRY_DELAYS[attempts] || 4000;

      return {
        message: `Network error, retry attempt ${attempts + 1}`,
        userMessage: 'Connection issue. Retrying...',
        shouldRetry: true,
        shouldReauth: false,
        retryAfter,
        errorCode: 'NETWORK_ERROR'
      };
    }

    // Max retries reached
    this.retryAttempts.delete(errorKey);
    return {
      message: 'Network error after max retries',
      userMessage: 'Unable to connect to server. Please check your internet connection.',
      shouldRetry: false,
      shouldReauth: false,
      errorCode: 'NETWORK_ERROR_MAX_RETRIES'
    };
  }

  /**
   * Handle rate limiting errors
   */
  private handleRateLimitError(error: any, context: ErrorContext): ErrorResult {
    const retryAfter = this.extractRetryAfter(error) || 60000; // Default 1 minute

    return {
      message: 'Rate limit exceeded',
      userMessage: 'Too many requests. Please wait a moment and try again.',
      shouldRetry: true,
      shouldReauth: false,
      retryAfter,
      errorCode: 'RATE_LIMIT_EXCEEDED'
    };
  }

  /**
   * Handle validation errors
   */
  private handleValidationError(error: any, context: ErrorContext): ErrorResult {
    const validationDetails = this.extractValidationDetails(error);

    return {
      message: `Validation error: ${error.message}`,
      userMessage: validationDetails || 'Please check your input and try again.',
      shouldRetry: false,
      shouldReauth: false,
      errorCode: 'VALIDATION_ERROR'
    };
  }

  /**
   * Handle server errors with retry logic
   */
  private handleServerError(error: any, context: ErrorContext, attempts: number): ErrorResult {
    const errorKey = `${context.endpoint || 'unknown'}_${context.action || 'unknown'}`;
    const statusCode = error.status || error.statusCode || 500;

    // 5xx errors are retryable
    if (statusCode >= 500 && attempts < this.MAX_RETRY_ATTEMPTS) {
      this.retryAttempts.set(errorKey, attempts + 1);
      const retryAfter = this.RETRY_DELAYS[attempts] || 4000;

      return {
        message: `Server error ${statusCode}, retry attempt ${attempts + 1}`,
        userMessage: 'Server temporarily unavailable. Retrying...',
        shouldRetry: true,
        shouldReauth: false,
        retryAfter,
        errorCode: `SERVER_ERROR_${statusCode}`
      };
    }

    // 4xx errors are not retryable (except auth errors handled above)
    return {
      message: `Server error ${statusCode}: ${error.message}`,
      userMessage: statusCode >= 500 
        ? 'Server error. Please try again later.'
        : 'Request failed. Please check your input.',
      shouldRetry: false,
      shouldReauth: false,
      errorCode: `SERVER_ERROR_${statusCode}`
    };
  }

  /**
   * Handle unknown errors
   */
  private handleUnknownError(error: any, context: ErrorContext): ErrorResult {
    return {
      message: `Unknown error: ${error.message || 'Unexpected error occurred'}`,
      userMessage: 'An unexpected error occurred. Please try again.',
      shouldRetry: false,
      shouldReauth: false,
      errorCode: 'UNKNOWN_ERROR'
    };
  }

  /**
   * Error type detection methods
   */
  private isAuthError(error: any): boolean {
    const authErrorCodes = [
      'auth/invalid-credential',
      'auth/user-not-found',
      'auth/wrong-password',
      'auth/too-many-requests',
      'auth/user-disabled',
      'auth/user-token-expired',
      'NotAuthorizedException',
      'UserNotFoundException',
      'InvalidParameterException',
      'UserNotConfirmedException'
    ];

    return authErrorCodes.some(code => 
      error.code === code || 
      error.name === code || 
      error.message?.includes(code)
    ) || error.status === 401;
  }

  private isTokenExpiredError(error: any): boolean {
    const expiredCodes = [
      'auth/user-token-expired',
      'auth/id-token-expired',
      'TokenExpiredError',
      'JwtExpiredError'
    ];

    return expiredCodes.some(code => 
      error.code === code || 
      error.name === code
    ) || error.message?.includes('expired');
  }

  private isInvalidCredentialsError(error: any): boolean {
    const invalidCodes = [
      'auth/invalid-credential',
      'auth/wrong-password',
      'NotAuthorizedException'
    ];

    return invalidCodes.some(code => 
      error.code === code || 
      error.name === code
    );
  }

  private isAccountLockedError(error: any): boolean {
    const lockedCodes = [
      'auth/user-disabled',
      'auth/too-many-requests',
      'UserNotConfirmedException'
    ];

    return lockedCodes.some(code => 
      error.code === code || 
      error.name === code
    );
  }

  private isMfaRequiredError(error: any): boolean {
    return error.code === 'auth/multi-factor-auth-required' ||
           error.name === 'MfaRequiredError';
  }

  private isNetworkError(error: any): boolean {
    return error.name === 'NetworkError' ||
           error.code === 'NETWORK_ERROR' ||
           error.message?.includes('fetch') ||
           error.message?.includes('network') ||
           !navigator.onLine;
  }

  private isRateLimitError(error: any): boolean {
    return error.status === 429 ||
           error.code === 'auth/too-many-requests' ||
           error.message?.includes('rate limit');
  }

  private isValidationError(error: any): boolean {
    return error.status === 400 ||
           error.name === 'ValidationError' ||
           error.code?.includes('invalid-') ||
           error.message?.includes('validation');
  }

  private isServerError(error: any): boolean {
    const status = error.status || error.statusCode;
    return status >= 500 || error.name === 'InternalServerError';
  }

  /**
   * Utility methods
   */
  private extractRetryAfter(error: any): number | undefined {
    const retryAfter = error.headers?.['retry-after'] || error.retryAfter;
    return retryAfter ? parseInt(retryAfter) * 1000 : undefined;
  }

  private extractValidationDetails(error: any): string | undefined {
    if (error.details) {
      return Array.isArray(error.details) 
        ? error.details.map((d: any) => d.message).join(', ')
        : error.details;
    }
    return error.message;
  }

  /**
   * Clear retry attempts for successful requests
   */
  clearRetryAttempts(endpoint: string, action: string) {
    const errorKey = `${endpoint}_${action}`;
    this.retryAttempts.delete(errorKey);
  }

  /**
   * Get retry attempt count
   */
  getRetryAttempts(endpoint: string, action: string): number {
    const errorKey = `${endpoint}_${action}`;
    return this.retryAttempts.get(errorKey) || 0;
  }
}

// Export singleton instance
export const errorHandler = new ErrorHandler();
export default errorHandler;