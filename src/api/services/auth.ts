
import { IAuthService, AuthResponse, User } from '../types';
import { config } from '../../config';

export const RealAuthService: IAuthService = {
    async login(email: string, password?: string): Promise<AuthResponse> {
        const response = await fetch(`${config.api.baseUrl}${config.api.endpoints.auth.login}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.msg || 'Login failed');
        }

        return response.json();
    },

    async loginWithFirebase(idToken: string, firstName?: string, lastName?: string, email?: string, linkAccount?: boolean): Promise<AuthResponse> {
        const response = await fetch(`${config.api.baseUrl}${config.api.endpoints.auth.firebaseLogin}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Platform': 'web' // Track platform
            },
            body: JSON.stringify({
                idToken,
                first_name: firstName,
                last_name: lastName,
                email: email, // Optional email for phone users
                linkAccount: linkAccount // Flag for account linking
            }),
        });

        if (!response.ok) {
            let errorMessage = 'Firebase Login failed';
            try {
                const error = await response.json();
                errorMessage = error.msg || error.message || errorMessage;
            } catch (e) {
                try {
                    const text = await response.text();
                    errorMessage = text || `Request failed with status ${response.status}`;
                } catch (e2) {
                    errorMessage = `Request failed with status ${response.status}`;
                }
            }
            throw new Error(errorMessage);
        }

        return response.json();
    },

    async registerTherapistWithPhone(idToken: string, firstName: string, lastName: string, email: string, password?: string): Promise<AuthResponse> {
        const response = await fetch(`${config.api.baseUrl}/auth/therapist-phone-register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Platform': 'web'
            },
            body: JSON.stringify({
                idToken,
                first_name: firstName,
                last_name: lastName,
                email,
                password
            }),
        });

        if (!response.ok) {
            let errorMessage = 'Therapist phone registration failed';
            try {
                const error = await response.json();
                errorMessage = error.msg || error.message || errorMessage;
            } catch (e) {
                try {
                    const text = await response.text();
                    errorMessage = text || `Request failed with status ${response.status}`;
                } catch (e2) {
                    errorMessage = `Request failed with status ${response.status}`;
                }
            }
            throw new Error(errorMessage);
        }

        return response.json();
    },

    async loginTherapistWithPhone(idToken: string): Promise<AuthResponse> {
        const response = await fetch(`${config.api.baseUrl}/auth/therapist-phone-login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Platform': 'web'
            },
            body: JSON.stringify({
                idToken
            }),
        });

        if (!response.ok) {
            let errorMessage = 'Therapist phone login failed';
            try {
                const error = await response.json();
                errorMessage = error.msg || error.message || errorMessage;
            } catch (e) {
                try {
                    const text = await response.text();
                    errorMessage = text || `Request failed with status ${response.status}`;
                } catch (e2) {
                    errorMessage = `Request failed with status ${response.status}`;
                }
            }
            throw new Error(errorMessage);
        }

        return response.json();
    },

    async checkPhoneUserExists(idToken: string): Promise<{ exists: boolean; userType?: 'therapist' | 'client'; user?: any }> {
        // First verify the Firebase token to get phone number
        try {
            const response = await fetch(`${config.api.baseUrl}/auth/firebase-login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Platform': 'web'
                },
                body: JSON.stringify({
                    idToken,
                    checkOnly: true // Flag to indicate we only want to check, not create
                }),
            });

            if (response.ok) {
                const data = await response.json();
                return { 
                    exists: true, 
                    userType: data.user.role === 'therapist' ? 'therapist' : 'client',
                    user: data.user 
                };
            } else if (response.status === 404) {
                return { exists: false };
            } else {
                throw new Error('Failed to check user existence');
            }
        } catch (error) {
            // If Firebase login fails, user doesn't exist
            return { exists: false };
        }
    },

    async registerTherapistWithGoogle(idToken: string, firstName: string, lastName: string, email: string, password?: string): Promise<AuthResponse> {
        const response = await fetch(`${config.api.baseUrl}/auth/therapist-google-register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Platform': 'web'
            },
            body: JSON.stringify({
                idToken,
                first_name: firstName,
                last_name: lastName,
                email,
                password
            }),
        });

        if (!response.ok) {
            let errorMessage = 'Therapist Google registration failed';
            try {
                const error = await response.json();
                errorMessage = error.msg || error.message || errorMessage;
            } catch (e) {
                try {
                    const text = await response.text();
                    errorMessage = text || `Request failed with status ${response.status}`;
                } catch (e2) {
                    errorMessage = `Request failed with status ${response.status}`;
                }
            }
            throw new Error(errorMessage);
        }

        return response.json();
    },

    async checkEmailPhoneExists(email?: string, phoneNumber?: string): Promise<{ emailExists: boolean; phoneExists: boolean }> {
        const response = await fetch(`${config.api.baseUrl}/auth/check-duplicate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Platform': 'web'
            },
            body: JSON.stringify({
                email,
                phoneNumber
            }),
        });

        if (response.ok) {
            return { emailExists: false, phoneExists: false }; // Available
        } else if (response.status === 409) {
            const error = await response.json();
            return {
                emailExists: error.emailExists || false,
                phoneExists: error.phoneExists || false
            };
        } else {
            throw new Error('Failed to check email/phone existence');
        }
    },

    async loginWithPhone(phoneNumber: string, otp: string): Promise<AuthResponse> {
        // Current backend doesn't have specific "loginWithPhone" endpoint separate from firebase-login usually,
        // but if we implemented it, specific logic would go here.
        // For now, throwing error or mapping to firebase login if token provided.
        throw new Error('Method not implemented in RealAuthService yet (use Firebase Login)');
    },

    async sendOTP(phoneNumber: string): Promise<void> {
        // Trigger firebase verifyPhoneNumber on client side usually
        throw new Error('OTP sending handled by Firebase SDK on client');
    },

    async logout(): Promise<void> {
        // Clear local storage / tokens
        // Optionally call backend to invalidate token
    },

    async getCurrentUser(): Promise<User | null> {
        // Implement calling /me endpoint
        // Needs token storage logic
        return null;
    }
};
