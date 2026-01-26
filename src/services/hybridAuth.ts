/**
 * Hybrid Authentication Service for Ataraxia
 * 
 * STRATEGY:
 * - Predominantly uses Lambda API service (recommended)
 * - Falls back to direct AWS SDK when needed
 * - Provides both options for maximum flexibility
 * - Maintains Firebase interface compatibility
 */

import { 
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  SignUpCommand,
  ConfirmSignUpCommand,
  ResendConfirmationCodeCommand,
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand,
  AuthFlowType
} from '@aws-sdk/client-cognito-identity-provider';
import { CognitoJwtVerifier } from 'aws-jwt-verify';

// Configuration
const CONFIG = {
  // Lambda API (Primary)
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'https://zojyvoao3c.execute-api.us-west-2.amazonaws.com/dev/',
  
  // Direct Cognito (Fallback)
  cognito: {
    userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID || 'us-west-2_xeXlyFBMH',
    clientId: import.meta.env.VITE_COGNITO_CLIENT_ID || '7ek8kg1td2ps985r21m7727q98',
    region: import.meta.env.VITE_AWS_REGION || 'us-west-2'
  },
  
  // Strategy selection
  useApiFirst: true, // Set to false to use direct Cognito first
  timeout: 10000
};

// Initialize Cognito client for direct operations
const cognitoClient = new CognitoIdentityProviderClient({
  region: CONFIG.cognito.region
});

// JWT Verifier for token validation
const jwtVerifier = CognitoJwtVerifier.create({
  userPoolId: CONFIG.cognito.userPoolId,
  tokenUse: 'id',
  clientId: CONFIG.cognito.clientId,
});

// Types (Firebase compatible)
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

export type AuthResult = {
  user: User;
  isNewUser: boolean;
  userProfile: UserProfile;
};

interface AuthResponse {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}

/**
 * OPTION A: Lambda API Service Calls (Primary Method)
 */
class ApiAuthService {
  private async apiCall(endpoint: string, method: string = 'GET', body?: any): Promise<AuthResponse> {
    try {
      const response = await fetch(`${CONFIG.apiBaseUrl}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: AbortSignal.timeout(CONFIG.timeout)
      });

      const data = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          error: data.error || `HTTP ${response.status}`,
          message: data.message
        };
      }

      return {
        success: true,
        data: data.data || data,
        message: data.message
      };
    } catch (error: any) {
      console.error('API call failed:', error);
      return {
        success: false,
        error: error.message || 'Network error',
        message: 'Failed to connect to authentication service'
      };
    }
  }

  async register(email: string, password: string, additionalData?: any): Promise<UserCredential> {
    const response = await this.apiCall('api/auth/register', 'POST', {
      email,
      password,
      first_name: additionalData?.firstName || '',
      last_name: additionalData?.lastName || '',
      role: additionalData?.role || 'client',
      phone_number: additionalData?.phoneNumber
    });

    if (!response.success) {
      throw new Error(response.error || 'Registration failed');
    }

    const user = this.mapApiUser(response.data.user);
    return { user };
  }

  async login(email: string, password: string): Promise<UserCredential> {
    const response = await this.apiCall('api/auth/login', 'POST', {
      email,
      password
    });

    if (!response.success) {
      throw new Error(response.error || 'Login failed');
    }

    // Store tokens
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
    }
    if (response.data.cognitoTokens) {
      localStorage.setItem('cognitoTokens', JSON.stringify(response.data.cognitoTokens));
    }

    const user = this.mapApiUser(response.data.user);
    return { user };
  }

  async confirmEmail(email: string, code: string): Promise<void> {
    const response = await this.apiCall('api/auth/confirm', 'POST', {
      email,
      confirmationCode: code
    });

    if (!response.success) {
      throw new Error(response.error || 'Email confirmation failed');
    }
  }

  async resendCode(email: string): Promise<void> {
    const response = await this.apiCall('api/auth/resend-code', 'POST', {
      email
    });

    if (!response.success) {
      throw new Error(response.error || 'Failed to resend confirmation code');
    }
  }

  async forgotPassword(email: string): Promise<void> {
    const response = await this.apiCall('api/auth/forgot-password', 'POST', {
      email
    });

    if (!response.success) {
      throw new Error(response.error || 'Failed to send password reset email');
    }
  }

  async resetPassword(email: string, code: string, newPassword: string): Promise<void> {
    const response = await this.apiCall('api/auth/reset-password', 'POST', {
      email,
      confirmationCode: code,
      newPassword
    });

    if (!response.success) {
      throw new Error(response.error || 'Password reset failed');
    }
  }

  async getTherapistStatus(uid: string): Promise<any> {
    const response = await this.apiCall(`api/auth/therapist/status/${uid}`);
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to get therapist status');
    }

    return response.data;
  }

  private mapApiUser(apiUser: any): User {
    return {
      uid: apiUser.auth_provider_id || apiUser.id?.toString(),
      email: apiUser.email || null,
      displayName: apiUser.first_name && apiUser.last_name 
        ? `${apiUser.first_name} ${apiUser.last_name}` 
        : null,
      phoneNumber: apiUser.phone_number || null,
      photoURL: null
    };
  }
}

/**
 * OPTION B: Direct AWS SDK Cognito Calls (Fallback Method)
 */
class DirectCognitoService {
  async register(email: string, password: string, additionalData?: any): Promise<UserCredential> {
    try {
      const command = new SignUpCommand({
        ClientId: CONFIG.cognito.clientId,
        Username: email,
        Password: password,
        UserAttributes: [
          { Name: 'email', Value: email },
          { Name: 'given_name', Value: additionalData?.firstName || '' },
          { Name: 'family_name', Value: additionalData?.lastName || '' },
          { Name: 'custom:role', Value: additionalData?.role || 'client' }
        ]
      });

      const result = await cognitoClient.send(command);
      
      const user: User = {
        uid: result.UserSub || email,
        email: email,
        displayName: additionalData?.firstName && additionalData?.lastName 
          ? `${additionalData.firstName} ${additionalData.lastName}` 
          : null,
        phoneNumber: additionalData?.phoneNumber || null,
        photoURL: null
      };

      return { user };
    } catch (error: any) {
      console.error('Direct Cognito registration failed:', error);
      throw new Error(error.message || 'Registration failed');
    }
  }

  async login(email: string, password: string): Promise<UserCredential> {
    try {
      const command = new InitiateAuthCommand({
        ClientId: CONFIG.cognito.clientId,
        AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
        AuthParameters: {
          USERNAME: email,
          PASSWORD: password
        }
      });

      const result = await cognitoClient.send(command);
      
      if (!result.AuthenticationResult?.IdToken) {
        throw new Error('Authentication failed');
      }

      // Verify and decode the JWT token
      const payload = await jwtVerifier.verify(result.AuthenticationResult.IdToken);
      
      // Store tokens
      localStorage.setItem('cognitoIdToken', result.AuthenticationResult.IdToken);
      localStorage.setItem('cognitoAccessToken', result.AuthenticationResult.AccessToken || '');
      localStorage.setItem('cognitoRefreshToken', result.AuthenticationResult.RefreshToken || '');

      const user: User = {
        uid: payload.sub,
        email: payload.email || null,
        displayName: payload.given_name && payload.family_name 
          ? `${payload.given_name} ${payload.family_name}` 
          : null,
        phoneNumber: payload.phone_number || null,
        photoURL: null
      };

      return { user };
    } catch (error: any) {
      console.error('Direct Cognito login failed:', error);
      throw new Error(error.message || 'Login failed');
    }
  }

  async confirmEmail(email: string, code: string): Promise<void> {
    try {
      const command = new ConfirmSignUpCommand({
        ClientId: CONFIG.cognito.clientId,
        Username: email,
        ConfirmationCode: code
      });

      await cognitoClient.send(command);
    } catch (error: any) {
      console.error('Direct Cognito email confirmation failed:', error);
      throw new Error(error.message || 'Email confirmation failed');
    }
  }

  async resendCode(email: string): Promise<void> {
    try {
      const command = new ResendConfirmationCodeCommand({
        ClientId: CONFIG.cognito.clientId,
        Username: email
      });

      await cognitoClient.send(command);
    } catch (error: any) {
      console.error('Direct Cognito resend code failed:', error);
      throw new Error(error.message || 'Failed to resend confirmation code');
    }
  }

  async forgotPassword(email: string): Promise<void> {
    try {
      const command = new ForgotPasswordCommand({
        ClientId: CONFIG.cognito.clientId,
        Username: email
      });

      await cognitoClient.send(command);
    } catch (error: any) {
      console.error('Direct Cognito forgot password failed:', error);
      throw new Error(error.message || 'Failed to send password reset email');
    }
  }

  async resetPassword(email: string, code: string, newPassword: string): Promise<void> {
    try {
      const command = new ConfirmForgotPasswordCommand({
        ClientId: CONFIG.cognito.clientId,
        Username: email,
        ConfirmationCode: code,
        Password: newPassword
      });

      await cognitoClient.send(command);
    } catch (error: any) {
      console.error('Direct Cognito password reset failed:', error);
      throw new Error(error.message || 'Password reset failed');
    }
  }
}

/**
 * HYBRID AUTH SERVICE - Combines both approaches
 */
class HybridAuthService {
  private apiService = new ApiAuthService();
  private cognitoService = new DirectCognitoService();

  private async tryBothMethods<T>(
    apiMethod: () => Promise<T>,
    cognitoMethod: () => Promise<T>,
    operation: string
  ): Promise<T> {
    if (CONFIG.useApiFirst) {
      try {
        console.log(`🚀 Trying Lambda API for ${operation}...`);
        return await apiMethod();
      } catch (apiError) {
        console.warn(`⚠️ Lambda API failed for ${operation}, falling back to direct Cognito:`, apiError);
        try {
          return await cognitoMethod();
        } catch (cognitoError) {
          console.error(`❌ Both methods failed for ${operation}:`, { apiError, cognitoError });
          throw apiError; // Throw the original API error
        }
      }
    } else {
      try {
        console.log(`🔗 Trying direct Cognito for ${operation}...`);
        return await cognitoMethod();
      } catch (cognitoError) {
        console.warn(`⚠️ Direct Cognito failed for ${operation}, falling back to Lambda API:`, cognitoError);
        try {
          return await apiMethod();
        } catch (apiError) {
          console.error(`❌ Both methods failed for ${operation}:`, { cognitoError, apiError });
          throw cognitoError; // Throw the original Cognito error
        }
      }
    }
  }

  // Public API methods (Firebase compatible)
  async createUserWithEmailAndPassword(
    email: string, 
    password: string,
    additionalData?: any
  ): Promise<UserCredential> {
    return this.tryBothMethods(
      () => this.apiService.register(email, password, additionalData),
      () => this.cognitoService.register(email, password, additionalData),
      'registration'
    );
  }

  async signInWithEmailAndPassword(email: string, password: string): Promise<UserCredential> {
    return this.tryBothMethods(
      () => this.apiService.login(email, password),
      () => this.cognitoService.login(email, password),
      'login'
    );
  }

  async confirmSignUp(email: string, confirmationCode: string): Promise<void> {
    return this.tryBothMethods(
      () => this.apiService.confirmEmail(email, confirmationCode),
      () => this.cognitoService.confirmEmail(email, confirmationCode),
      'email confirmation'
    );
  }

  async resendConfirmationCode(email: string): Promise<void> {
    return this.tryBothMethods(
      () => this.apiService.resendCode(email),
      () => this.cognitoService.resendCode(email),
      'resend confirmation code'
    );
  }

  async sendPasswordResetEmail(email: string): Promise<void> {
    return this.tryBothMethods(
      () => this.apiService.forgotPassword(email),
      () => this.cognitoService.forgotPassword(email),
      'forgot password'
    );
  }

  async confirmPasswordReset(email: string, code: string, newPassword: string): Promise<void> {
    return this.tryBothMethods(
      () => this.apiService.resetPassword(email, code, newPassword),
      () => this.cognitoService.resetPassword(email, code, newPassword),
      'password reset'
    );
  }

  // Therapist-specific methods (API only)
  async getTherapistStatus(uid: string): Promise<any> {
    return this.apiService.getTherapistStatus(uid);
  }

  // Utility methods
  async signOut(): Promise<void> {
    localStorage.removeItem('authToken');
    localStorage.removeItem('cognitoTokens');
    localStorage.removeItem('cognitoIdToken');
    localStorage.removeItem('cognitoAccessToken');
    localStorage.removeItem('cognitoRefreshToken');
  }

  getCurrentUser(): User | null {
    try {
      // Try API token first
      const apiToken = localStorage.getItem('authToken');
      if (apiToken) {
        const payload = JSON.parse(atob(apiToken.split('.')[1]));
        if (payload.exp && payload.exp > Date.now() / 1000) {
          return {
            uid: payload.user?.id?.toString() || payload.sub,
            email: payload.user?.email || payload.email,
            displayName: null,
            phoneNumber: null,
            photoURL: null
          };
        }
      }

      // Try Cognito token
      const cognitoToken = localStorage.getItem('cognitoIdToken');
      if (cognitoToken) {
        const payload = JSON.parse(atob(cognitoToken.split('.')[1]));
        if (payload.exp && payload.exp > Date.now() / 1000) {
          return {
            uid: payload.sub,
            email: payload.email || null,
            displayName: payload.given_name && payload.family_name 
              ? `${payload.given_name} ${payload.family_name}` 
              : null,
            phoneNumber: payload.phone_number || null,
            photoURL: null
          };
        }
      }

      return null;
    } catch (error) {
      console.error('Failed to get current user:', error);
      return null;
    }
  }

  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    const currentUser = this.getCurrentUser();
    callback(currentUser);

    const interval = setInterval(() => {
      const user = this.getCurrentUser();
      callback(user);
    }, 60000);

    return () => clearInterval(interval);
  }

  // Configuration methods
  setUseApiFirst(useApi: boolean): void {
    CONFIG.useApiFirst = useApi;
    console.log(`🔧 Auth strategy changed: ${useApi ? 'API First' : 'Cognito First'}`);
  }

  getConfig() {
    return { ...CONFIG };
  }
}

// Create and export the hybrid service instance
export const hybridAuth = new HybridAuthService();

// Export individual services for direct access if needed
export const apiAuth = new ApiAuthService();
export const cognitoAuth = new DirectCognitoService();

// Export Firebase-compatible interface
export const createUserWithEmailAndPassword = hybridAuth.createUserWithEmailAndPassword.bind(hybridAuth);
export const signInWithEmailAndPassword = hybridAuth.signInWithEmailAndPassword.bind(hybridAuth);
export const confirmSignUp = hybridAuth.confirmSignUp.bind(hybridAuth);
export const resendConfirmationCode = hybridAuth.resendConfirmationCode.bind(hybridAuth);
export const sendPasswordResetEmail = hybridAuth.sendPasswordResetEmail.bind(hybridAuth);
export const confirmPasswordReset = hybridAuth.confirmPasswordReset.bind(hybridAuth);
export const signOut = hybridAuth.signOut.bind(hybridAuth);
export const getCurrentUser = hybridAuth.getCurrentUser.bind(hybridAuth);
export const onAuthStateChanged = hybridAuth.onAuthStateChanged.bind(hybridAuth);
export const getTherapistStatus = hybridAuth.getTherapistStatus.bind(hybridAuth);

// Configuration flag
export const isCognitoConfigured = true;

// Default export
export default hybridAuth;