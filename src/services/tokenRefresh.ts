/**
 * Token Refresh Service
 * 
 * Handles automatic token refresh for both Firebase and Cognito providers
 * with seamless provider switching and database synchronization
 */

import { auth } from './firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { CognitoIdentityProviderClient, InitiateAuthCommand } from '@aws-sdk/client-cognito-identity-provider';
import { logger } from './secureLogger';

interface TokenSet {
  accessToken: string;
  idToken: string;
  refreshToken: string;
  expiresAt: number;
  provider: 'firebase' | 'cognito';
}

interface RefreshResult {
  success: boolean;
  tokens?: TokenSet;
  error?: string;
  needsReauth?: boolean;
}

class TokenRefreshService {
  private refreshTimer: NodeJS.Timeout | null = null;
  private cognitoClient: CognitoIdentityProviderClient;
  private isRefreshing = false;
  private refreshPromise: Promise<RefreshResult> | null = null;

  constructor() {
    this.cognitoClient = new CognitoIdentityProviderClient({
      region: import.meta.env.VITE_AWS_REGION || 'us-west-2'
    });

    this.initializeAutoRefresh();
  }

  /**
   * Initialize automatic token refresh monitoring
   */
  private initializeAutoRefresh() {
    // Monitor Firebase auth state changes
    onAuthStateChanged(auth, (user) => {
      if (user) {
        this.scheduleTokenRefresh('firebase', user);
      } else {
        this.clearRefreshTimer();
      }
    });

    // Monitor stored Cognito tokens
    this.monitorCognitoTokens();
  }

  /**
   * Schedule token refresh before expiration
   */
  private scheduleTokenRefresh(provider: 'firebase' | 'cognito', user?: FirebaseUser) {
    this.clearRefreshTimer();

    const refreshInterval = provider === 'firebase' ? 
      50 * 60 * 1000 : // Firebase: 50 minutes (tokens expire in 1 hour)
      25 * 60 * 1000;  // Cognito: 25 minutes (tokens expire in 30 minutes)

    this.refreshTimer = setTimeout(async () => {
      try {
        if (provider === 'firebase' && user) {
          await this.refreshFirebaseToken(user);
        } else if (provider === 'cognito') {
          await this.refreshCognitoToken();
        }
      } catch (error) {
        logger.error('Scheduled token refresh failed', { provider, error });
      }
    }, refreshInterval);

    logger.info('Token refresh scheduled', { provider, intervalMs: refreshInterval });
  }

  /**
   * Refresh Firebase token
   */
  private async refreshFirebaseToken(user: FirebaseUser): Promise<RefreshResult> {
    try {
      logger.info('Refreshing Firebase token', { uid: user.uid });

      // Firebase automatically handles token refresh
      const idToken = await user.getIdToken(true); // Force refresh
      const tokenResult = await user.getIdTokenResult();

      const tokens: TokenSet = {
        accessToken: idToken,
        idToken: idToken,
        refreshToken: user.refreshToken,
        expiresAt: new Date(tokenResult.expirationTime).getTime(),
        provider: 'firebase'
      };

      // Store tokens
      this.storeTokens(tokens);

      // Schedule next refresh
      this.scheduleTokenRefresh('firebase', user);

      logger.info('Firebase token refreshed successfully', { 
        uid: user.uid,
        expiresAt: new Date(tokens.expiresAt).toISOString()
      });

      return { success: true, tokens };

    } catch (error: any) {
      logger.error('Firebase token refresh failed', { error: error.message });
      
      if (error.code === 'auth/user-token-expired') {
        return { success: false, error: 'Token expired', needsReauth: true };
      }

      return { success: false, error: error.message };
    }
  }

  /**
   * Refresh Cognito token
   */
  private async refreshCognitoToken(): Promise<RefreshResult> {
    try {
      const refreshToken = localStorage.getItem('cognito_refresh_token');
      if (!refreshToken) {
        return { success: false, error: 'No refresh token available', needsReauth: true };
      }

      logger.info('Refreshing Cognito token');

      const command = new InitiateAuthCommand({
        AuthFlow: 'REFRESH_TOKEN_AUTH',
        ClientId: import.meta.env.VITE_COGNITO_CLIENT_ID,
        AuthParameters: {
          REFRESH_TOKEN: refreshToken
        }
      });

      const response = await this.cognitoClient.send(command);

      if (!response.AuthenticationResult) {
        return { success: false, error: 'No authentication result', needsReauth: true };
      }

      const tokens: TokenSet = {
        accessToken: response.AuthenticationResult.AccessToken!,
        idToken: response.AuthenticationResult.IdToken!,
        refreshToken: response.AuthenticationResult.RefreshToken || refreshToken,
        expiresAt: Date.now() + (response.AuthenticationResult.ExpiresIn! * 1000),
        provider: 'cognito'
      };

      // Store tokens
      this.storeTokens(tokens);

      // Schedule next refresh
      this.scheduleTokenRefresh('cognito');

      logger.info('Cognito token refreshed successfully', {
        expiresAt: new Date(tokens.expiresAt).toISOString()
      });

      return { success: true, tokens };

    } catch (error: any) {
      logger.error('Cognito token refresh failed', { error: error.message });

      if (error.name === 'NotAuthorizedException') {
        return { success: false, error: 'Refresh token expired', needsReauth: true };
      }

      return { success: false, error: error.message };
    }
  }

  /**
   * Monitor Cognito tokens for expiration
   */
  private monitorCognitoTokens() {
    const checkInterval = 5 * 60 * 1000; // Check every 5 minutes

    setInterval(() => {
      const expiresAt = localStorage.getItem('cognito_expires_at');
      if (expiresAt) {
        const expirationTime = parseInt(expiresAt);
        const timeUntilExpiry = expirationTime - Date.now();
        const refreshThreshold = 5 * 60 * 1000; // Refresh 5 minutes before expiry

        if (timeUntilExpiry <= refreshThreshold && timeUntilExpiry > 0) {
          this.refreshCognitoToken();
        }
      }
    }, checkInterval);
  }

  /**
   * Manual token refresh (can be called by components)
   */
  public async refreshToken(): Promise<RefreshResult> {
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;

    try {
      // Determine current provider
      const currentProvider = this.getCurrentProvider();
      
      if (currentProvider === 'firebase') {
        const user = auth.currentUser;
        if (user) {
          this.refreshPromise = this.refreshFirebaseToken(user);
        } else {
          this.refreshPromise = Promise.resolve({ 
            success: false, 
            error: 'No Firebase user', 
            needsReauth: true 
          });
        }
      } else {
        this.refreshPromise = this.refreshCognitoToken();
      }

      const result = await this.refreshPromise;
      return result;

    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  /**
   * Get current authentication provider
   */
  private getCurrentProvider(): 'firebase' | 'cognito' {
    const firebaseUser = auth.currentUser;
    const cognitoToken = localStorage.getItem('cognito_access_token');

    if (firebaseUser) return 'firebase';
    if (cognitoToken) return 'cognito';

    // Default based on environment
    return import.meta.env.VITE_AUTH_PROVIDER_TYPE === 'firebase' ? 'firebase' : 'cognito';
  }

  /**
   * Store tokens securely
   */
  private storeTokens(tokens: TokenSet) {
    if (tokens.provider === 'firebase') {
      localStorage.setItem('firebase_access_token', tokens.accessToken);
      localStorage.setItem('firebase_id_token', tokens.idToken);
      localStorage.setItem('firebase_expires_at', tokens.expiresAt.toString());
    } else {
      localStorage.setItem('cognito_access_token', tokens.accessToken);
      localStorage.setItem('cognito_id_token', tokens.idToken);
      localStorage.setItem('cognito_refresh_token', tokens.refreshToken);
      localStorage.setItem('cognito_expires_at', tokens.expiresAt.toString());
    }

    // Update last refresh time
    localStorage.setItem('last_token_refresh', Date.now().toString());
  }

  /**
   * Clear refresh timer
   */
  private clearRefreshTimer() {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  /**
   * Get token expiration info
   */
  public getTokenInfo(): { provider: string; expiresAt: number; timeUntilExpiry: number } | null {
    const provider = this.getCurrentProvider();
    const expiresAtKey = provider === 'firebase' ? 'firebase_expires_at' : 'cognito_expires_at';
    const expiresAt = localStorage.getItem(expiresAtKey);

    if (!expiresAt) return null;

    const expirationTime = parseInt(expiresAt);
    const timeUntilExpiry = expirationTime - Date.now();

    return {
      provider,
      expiresAt: expirationTime,
      timeUntilExpiry
    };
  }

  /**
   * Check if token needs refresh
   */
  public needsRefresh(): boolean {
    const tokenInfo = this.getTokenInfo();
    if (!tokenInfo) return true;

    const refreshThreshold = 5 * 60 * 1000; // 5 minutes
    return tokenInfo.timeUntilExpiry <= refreshThreshold;
  }

  /**
   * Cleanup on logout
   */
  public cleanup() {
    this.clearRefreshTimer();
    this.isRefreshing = false;
    this.refreshPromise = null;
  }
}

// Export singleton instance
export const tokenRefreshService = new TokenRefreshService();
export default tokenRefreshService;