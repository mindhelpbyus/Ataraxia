export interface User {
    id: string;
    email: string;
    name: string;
    first_name?: string;
    last_name?: string;
    role: 'admin' | 'therapist' | 'superadmin' | 'client';
    avatar?: string;
    onboardingStatus?: string; // e.g. 'active', 'pending', 'draft'
    onboardingStep?: number;
    account_status?: string; // Option A: 'pending_verification', 'documents_review', 'background_check', 'active', 'suspended', 'rejected'
    verification_stage?: string; // Option A: workflow stage
    is_active?: boolean;
}

export interface AuthResponse {
    user: User;
    token?: string; // Legacy field
    tokens?: {
        accessToken: string;
        refreshToken?: string;
        idToken?: string;
        expiresIn?: number;
    };
    pending_registration?: boolean;
    registration_status?: string;
    message?: string;
}

export interface ApiError {
    code: string;
    message: string;
}

export interface IAuthService {
    login(email: string, password?: string): Promise<AuthResponse>;
    loginWithFirebase?(idToken: string, firstName?: string, lastName?: string, email?: string): Promise<AuthResponse>;
    loginWithPhone(phoneNumber: string, otp: string): Promise<AuthResponse>;
    sendOTP(phoneNumber: string): Promise<void>;
    logout(): Promise<void>;
    getCurrentUser(): Promise<User | null>;
}

export interface IDataService {
    get(collection: string, id: string): Promise<any>;
    list(collection: string, filters?: any): Promise<any[]>;
    create(collection: string, data: any): Promise<any>;
    update(collection: string, id: string, data: any): Promise<any>;
    delete(collection: string, id: string): Promise<void>;
}
