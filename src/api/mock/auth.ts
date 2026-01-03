import { IAuthService, AuthResponse, User } from '../types';

const STORAGE_KEY_USER = 'ataraxia_mock_user';
const STORAGE_KEY_TOKEN = 'ataraxia_mock_token';

export const MockAuthService: IAuthService = {
    async login(email: string, password?: string): Promise<AuthResponse> {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));

        // Simple mock logic
        let role: 'admin' | 'therapist' | 'superadmin' | 'client' = 'therapist';

        if (email.includes('superadmin')) {
            role = 'superadmin';
        } else if (email.includes('admin')) {
            role = 'admin';
        } else if (email.includes('client') || email.includes('client')) {
            role = 'client';
        }

        const mockUser: User = {
            id: 'mock-user-' + Date.now(),
            email,
            name: email.split('@')[0],
            role,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
        };

        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(mockUser));
        localStorage.setItem(STORAGE_KEY_TOKEN, 'mock-jwt-token');

        return {
            user: mockUser,
            token: 'mock-jwt-token'
        };
    },

    async loginWithPhone(phoneNumber: string, otp: string): Promise<AuthResponse> {
        await new Promise(resolve => setTimeout(resolve, 800));

        if (otp !== '123456') {
            throw new Error('Invalid OTP');
        }

        const mockUser: User = {
            id: 'mock-phone-user-' + Date.now(),
            email: `${phoneNumber}@phone.com`,
            name: 'Phone User',
            role: 'therapist',
        };

        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(mockUser));
        localStorage.setItem(STORAGE_KEY_TOKEN, 'mock-jwt-token');

        return {
            user: mockUser,
            token: 'mock-jwt-token'
        };
    },

    async sendOTP(phoneNumber: string): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log(`[MockAuth] OTP sent to ${phoneNumber}: 123456`);
    },

    async logout(): Promise<void> {
        localStorage.removeItem(STORAGE_KEY_USER);
        localStorage.removeItem(STORAGE_KEY_TOKEN);
    },

    async getCurrentUser(): Promise<User | null> {
        const stored = localStorage.getItem(STORAGE_KEY_USER);
        return stored ? JSON.parse(stored) : null;
    }
};
