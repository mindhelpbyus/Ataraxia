export interface User {
    id: string;
    email: string;
    name: string;
    first_name?: string;
    last_name?: string;
    role: 'admin' | 'therapist' | 'superadmin' | 'super_admin' | 'client';
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

// Standardized Registration Payload (CamelCase)
export interface RegisterRequest {
    email: string;
    password?: string;
    firstName: string;
    lastName: string;
    role: 'therapist' | 'client';
    phoneNumber?: string;
    countryCode?: string;
}

export interface AuthUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    isVerified: boolean;
}

export interface IAuthService {
    login(email: string, password?: string): Promise<AuthResponse>;
    loginWithFirebase(idToken: string, firstName?: string, lastName?: string, email?: string, linkAccount?: boolean): Promise<AuthResponse>;
    loginWithPhone(phoneNumber: string, otp: string): Promise<AuthResponse>;
    sendOTP(phoneNumber: string): Promise<void>;
    logout(): Promise<void>;
    getCurrentUser(): Promise<User | null>;

    // Phone authentication methods
    checkPhoneUserExists(idToken: string): Promise<{ exists: boolean; userType?: 'therapist' | 'client'; user?: any }>;
    loginTherapistWithPhone(idToken: string): Promise<AuthResponse>;
    registerTherapistWithPhone(idToken: string, firstName: string, lastName: string, email: string, password?: string): Promise<AuthResponse>;

    // Google authentication methods
    registerTherapistWithGoogle(idToken: string, firstName: string, lastName: string, email: string, password?: string): Promise<AuthResponse>;

    // Duplicate check method
    checkEmailPhoneExists(email?: string, phoneNumber?: string): Promise<{ emailExists: boolean; phoneExists: boolean }>;
}

export interface IDataService {
    get(collection: string, id: string): Promise<any>;
    list(collection: string, filters?: any): Promise<any[]>;
    create(collection: string, data: any): Promise<any>;
    update(collection: string, id: string, data: any): Promise<any>;
    delete(collection: string, id: string): Promise<void>;
}
