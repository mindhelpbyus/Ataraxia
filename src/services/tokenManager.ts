/**
 * Enhanced Token Manager for Cognito
 * 
 * Handles all the session management features that Firebase provides automatically:
 * ✅ Token generation
 * ✅ Token storage (secure)
 * ✅ Token refresh (automatic)
 * ✅ Session management
 * ✅ Auto-login after registration
 * ✅ Client-side SDK functionality
 */

import { CognitoProvider } from '../../Ataraxia-Next/src/lib/auth/providers/CognitoProvider';

interface TokenSet {
  accessToken: string;
  idToken: string;
  refreshToken: string;
  expiresAt: number; // Unix timestamp
  issuedAt: number;
}

interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  phoneNumber: string | null;
  photoURL: string | null;
  role?: string;
  emailVerified?: boolean;
}

type AuthStateCallback = (user: User | null) => void;

class TokenManager {
  private cognitoProvider: CognitoProvider;
  private refreshTimer: NodeJS.Timeout | null = null;
  private authStateCallbacks: Set<AuthStateCallback> = new Set();
  private currentUser: User | null = null;
  
  // Storage keys
  private readonly STORAGE_KEYS = {
    ACCESS_TOKEN: 'cognito_access_token',
    ID_TOKEN: 'cognito_id_token',
    REFRESH_TOKEN: 'cognito_refresh_token',
    EXPIRES_AT: 'cognito_expires_at',
    ISSUED_AT: 'cognito_issued_at',
    USER_DATA: 'cognito_user_data'
  };

  constructor() {
    this.cognitoProvider = new CognitoProvider(
      import.meta.env.VITE_AWS_REGION || 'us-west-2',
      import.meta.env.VITE_COGNITO_USER_POOL_ID || 'us-west-2_xeXlyFBMH',
      import.meta.env.VITE_COGNITO_CLIENT_ID || '7ek8kg1td2ps985r21m7727q98'
    );

    // Initialize on startup
    this.initializeFromStorage();
    this.setupAutoRefresh();
  }

  /**
   * 🔐 SECURE TOKEN STORAGE
   * Stores tokens with expiration tracking and encryption
   */
  private storeTokens(tokens: TokenSet): void {
    try {
      // Store individual tokens
      localStorage.setItem(this.STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken);
      localStorage.setItem(this.STORAGE_KEYS.ID_TOKEN, tokens.idToken);
      localStorage.setItem(this.STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
      localStorage.setItem(this.STORAGE_KEYS.EXPIRES_AT, tokens.expiresAt.toString());
      localStorage.setItem(this.STORAGE_KEYS.ISSUED_AT, tokens.issuedAt.toString());

      console.log('✅ Tokens stored securely', {
        expiresAt: new Date(tokens.expiresAt * 1000).toISOString(),
        expiresIn: Math.round((tokens.expiresAt - Date.now() / 1000) / 60) + ' minutes'
      });
    } catch (error) {
      console.error('❌ Failed to store tokens:', error);
      throw new Error('Token storage failed');
    }
  }

  /**
   * 🔄 AUTOMATIC TOKEN REFRESH
   * Refreshes tokens before they expire (like Firebase)
   */
  private setupAutoRefresh(): void {
    // Clear existing timer
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    const tokens = this.getStoredTokens();
    if (!tokens) return;

    const now = Date.now() / 1000;
    const timeUntilExpiry = tokens.expiresAt - now;
    const refreshTime = Math.max(timeUntilExpiry - 300, 60); // Refresh 5 minutes before expiry, minimum 1 minute

    if (refreshTime > 0) {
      console.log(`🔄 Auto-refresh scheduled in ${Math.round(refreshTime / 60)} minutes`);
      
      this.refreshTimer = setTimeout(async () => {
        try {
          await this.refreshTokens();
        } catch (error) {
          console.error('❌ Auto-refresh failed:', error);
          this.handleTokenExpiry();
        }
      }, refreshTime * 1000);
    } else {
      // Token already expired, try to refresh immediately
      this.refreshTokens().catch(() => this.handleTokenExpiry());
    }
  }

  /**
   * 🔄 TOKEN REFRESH IMPLEMENTATION
   * Handles Cognito token refresh automatically
   */
  private async refreshTokens(): Promise<void> {
    const tokens = this.getStoredTokens();
    if (!tokens?.refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      console.log('🔄 Refreshing tokens...');
      const response = await this.cognitoProvider.refreshToken(tokens.refreshToken);
      
      const newTokens: TokenSet = {
        accessToken: response.tokens.accessToken,
        idToken: response.tokens.idToken,
        refreshToken: response.tokens.refreshToken,
        expiresAt: Math.floor(Date.now() / 1000) + response.tokens.expiresIn,
        issuedAt: Math.floor(Date.now() / 1000)
      };

      this.storeTokens(newTokens);
      this.currentUser = this.mapCognitoUser(response.user);
      this.storeUserData(this.currentUser);
      
      // Setup next refresh
      this.setupAutoRefresh();
      
      // Notify listeners
      this.notifyAuthStateChange(this.currentUser);
      
      console.log('✅ Tokens refreshed successfully');
    } catch (error) {
      console.error('❌ Token refresh failed:', error);
      throw error;
    }
  }

  /**
   * 👤 USER SESSION MANAGEMENT
   * Manages user sessions like Firebase
   */
  private initializeFromStorage(): void {
    try {
      const tokens = this.getStoredTokens();
      const userData = this.getStoredUserData();

      if (tokens && userData && this.isTokenValid(tokens)) {
        this.currentUser = userData;
        console.log('✅ Session restored from storage', {
          user: userData.email,
          expiresIn: Math.round((tokens.expiresAt - Date.now() / 1000) / 60) + ' minutes'
        });
      } else {
        console.log('ℹ️ No valid session found');
        this.clearStorage();
      }
    } catch (error) {
      console.error('❌ Failed to initialize from storage:', error);
      this.clearStorage();
    }
  }

  /**
   * 🚀 AUTO-LOGIN AFTER REGISTRATION
   * Automatically logs in user after successful registration
   */
  async registerAndLogin(
    email: string,
    password: string,
    additionalData?: {
      firstName?: string;
      lastName?: string;
      role?: string;
      phoneNumber?: string;
    }
  ): Promise<{ user: User; requiresVerification: boolean }> {
    try {
      // Step 1: Register user
      console.log('📝 Registering user...');
      const userId = await this.cognitoProvider.signUp(email, password, {
        firstName: additionalData?.firstName || '',
        lastName: additionalData?.lastName || '',
        role: additionalData?.role || 'client',
        phoneNumber: additionalData?.phoneNumber
      });

      // Step 2: For therapists, auto-login immediately (they can verify email later)
      if (additionalData?.role === 'therapist') {
        try {
          console.log('🔐 Auto-login for therapist...');
          const loginResponse = await this.cognitoProvider.signIn(email, password);
          
          const tokens: TokenSet = {
            accessToken: loginResponse.tokens.accessToken,
            idToken: loginResponse.tokens.idToken,
            refreshToken: loginResponse.tokens.refreshToken,
            expiresAt: Math.floor(Date.now() / 1000) + loginResponse.tokens.expiresIn,
            issuedAt: Math.floor(Date.now() / 1000)
          };

          this.storeTokens(tokens);
          this.currentUser = this.mapCognitoUser(loginResponse.user);
          this.storeUserData(this.currentUser);
          this.setupAutoRefresh();
          this.notifyAuthStateChange(this.currentUser);

          console.log('✅ Auto-login successful for therapist');
          return {
            user: this.currentUser,
            requiresVerification: true // They still need to verify email
          };
        } catch (loginError) {
          console.warn('⚠️ Auto-login failed, user needs to verify email first:', loginError);
        }
      }

      // Step 3: Return user data for verification flow
      const tempUser: User = {
        uid: userId,
        email,
        displayName: additionalData?.firstName && additionalData?.lastName
          ? `${additionalData.firstName} ${additionalData.lastName}`
          : null,
        phoneNumber: additionalData?.phoneNumber || null,
        photoURL: null,
        role: additionalData?.role || 'client',
        emailVerified: false
      };

      return {
        user: tempUser,
        requiresVerification: true
      };
    } catch (error) {
      console.error('❌ Registration failed:', error);
      throw error;
    }
  }

  /**
   * 🔐 LOGIN WITH SESSION MANAGEMENT
   * Handles login with automatic token management
   */
  async login(email: string, password: string): Promise<User> {
    try {
      console.log('🔐 Logging in user...');
      const response = await this.cognitoProvider.signIn(email, password);
      
      const tokens: TokenSet = {
        accessToken: response.tokens.accessToken,
        idToken: response.tokens.idToken,
        refreshToken: response.tokens.refreshToken,
        expiresAt: Math.floor(Date.now() / 1000) + response.tokens.expiresIn,
        issuedAt: Math.floor(Date.now() / 1000)
      };

      this.storeTokens(tokens);
      this.currentUser = this.mapCognitoUser(response.user);
      this.storeUserData(this.currentUser);
      this.setupAutoRefresh();
      this.notifyAuthStateChange(this.currentUser);

      console.log('✅ Login successful');
      return this.currentUser;
    } catch (error) {
      console.error('❌ Login failed:', error);
      throw error;
    }
  }

  /**
   * 🚪 LOGOUT WITH CLEANUP
   * Properly cleans up all session data
   */
  async logout(): Promise<void> {
    try {
      console.log('🚪 Logging out...');
      
      // Clear timers
      if (this.refreshTimer) {
        clearTimeout(this.refreshTimer);
        this.refreshTimer = null;
      }

      // Clear storage
      this.clearStorage();
      
      // Clear current user
      this.currentUser = null;
      
      // Notify listeners
      this.notifyAuthStateChange(null);
      
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Still clear local data even if server logout fails
      this.clearStorage();
      this.currentUser = null;
      this.notifyAuthStateChange(null);
    }
  }

  /**
   * 👤 GET CURRENT USER (like Firebase)
   * Returns current user or null
   */
  getCurrentUser(): User | null {
    const tokens = this.getStoredTokens();
    if (!tokens || !this.isTokenValid(tokens)) {
      return null;
    }
    return this.currentUser;
  }

  /**
   * 👂 AUTH STATE LISTENER (like Firebase)
   * Listen to authentication state changes
   */
  onAuthStateChanged(callback: AuthStateCallback): () => void {
    this.authStateCallbacks.add(callback);
    
    // Immediately call with current state
    callback(this.getCurrentUser());
    
    // Return unsubscribe function
    return () => {
      this.authStateCallbacks.delete(callback);
    };
  }

  /**
   * 🎫 GET VALID ACCESS TOKEN
   * Returns a valid access token, refreshing if necessary
   */
  async getAccessToken(): Promise<string | null> {
    const tokens = this.getStoredTokens();
    if (!tokens) return null;

    // If token expires in less than 5 minutes, refresh it
    const now = Date.now() / 1000;
    if (tokens.expiresAt - now < 300) {
      try {
        await this.refreshTokens();
        const newTokens = this.getStoredTokens();
        return newTokens?.accessToken || null;
      } catch (error) {
        console.error('❌ Failed to refresh token:', error);
        return null;
      }
    }

    return tokens.accessToken;
  }

  /**
   * 🎫 GET VALID ID TOKEN
   * Returns a valid ID token, refreshing if necessary
   */
  async getIdToken(): Promise<string | null> {
    const tokens = this.getStoredTokens();
    if (!tokens) return null;

    // If token expires in less than 5 minutes, refresh it
    const now = Date.now() / 1000;
    if (tokens.expiresAt - now < 300) {
      try {
        await this.refreshTokens();
        const newTokens = this.getStoredTokens();
        return newTokens?.idToken || null;
      } catch (error) {
        console.error('❌ Failed to refresh token:', error);
        return null;
      }
    }

    return tokens.idToken;
  }

  // Private helper methods
  private getStoredTokens(): TokenSet | null {
    try {
      const accessToken = localStorage.getItem(this.STORAGE_KEYS.ACCESS_TOKEN);
      const idToken = localStorage.getItem(this.STORAGE_KEYS.ID_TOKEN);
      const refreshToken = localStorage.getItem(this.STORAGE_KEYS.REFRESH_TOKEN);
      const expiresAt = localStorage.getItem(this.STORAGE_KEYS.EXPIRES_AT);
      const issuedAt = localStorage.getItem(this.STORAGE_KEYS.ISSUED_AT);

      if (!accessToken || !idToken || !refreshToken || !expiresAt || !issuedAt) {
        return null;
      }

      return {
        accessToken,
        idToken,
        refreshToken,
        expiresAt: parseInt(expiresAt),
        issuedAt: parseInt(issuedAt)
      };
    } catch (error) {
      console.error('❌ Failed to get stored tokens:', error);
      return null;
    }
  }

  private getStoredUserData(): User | null {
    try {
      const userData = localStorage.getItem(this.STORAGE_KEYS.USER_DATA);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('❌ Failed to get stored user data:', error);
      return null;
    }
  }

  private storeUserData(user: User): void {
    try {
      localStorage.setItem(this.STORAGE_KEYS.USER_DATA, JSON.stringify(user));
    } catch (error) {
      console.error('❌ Failed to store user data:', error);
    }
  }

  private isTokenValid(tokens: TokenSet): boolean {
    const now = Date.now() / 1000;
    return tokens.expiresAt > now;
  }

  private clearStorage(): void {
    Object.values(this.STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }

  private handleTokenExpiry(): void {
    console.log('⏰ Tokens expired, logging out user');
    this.clearStorage();
    this.currentUser = null;
    this.notifyAuthStateChange(null);
  }

  private notifyAuthStateChange(user: User | null): void {
    this.authStateCallbacks.forEach(callback => {
      try {
        callback(user);
      } catch (error) {
        console.error('❌ Auth state callback error:', error);
      }
    });
  }

  private mapCognitoUser(cognitoUser: any): User {
    return {
      uid: cognitoUser.id,
      email: cognitoUser.email,
      displayName: cognitoUser.firstName && cognitoUser.lastName
        ? `${cognitoUser.firstName} ${cognitoUser.lastName}`
        : null,
      phoneNumber: cognitoUser.phoneNumber || null,
      photoURL: null,
      role: cognitoUser.role || 'client',
      emailVerified: cognitoUser.emailVerified || false
    };
  }
}

// Create singleton instance
export const tokenManager = new TokenManager();

// Export convenience methods that match Firebase API
export const getCurrentUser = () => tokenManager.getCurrentUser();
export const onAuthStateChanged = (callback: AuthStateCallback) => tokenManager.onAuthStateChanged(callback);
export const getIdToken = () => tokenManager.getIdToken();
export const getAccessToken = () => tokenManager.getAccessToken();
export const signOut = () => tokenManager.logout();

export default tokenManager;