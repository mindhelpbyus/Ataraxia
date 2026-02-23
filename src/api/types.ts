export type UserRole = 'super_admin' | 'org_admin' | 'org_receptionist' | 'therapist' | 'client';

export interface User {
    id: string;
    email: string;
    name: string;
    first_name?: string;
    last_name?: string;
    role: UserRole; // Primary role for default dashboard view
    additional_roles?: UserRole[]; // Supporting multiple personas (e.g. Org Admin who sees patients)
    permissions?: string[]; // Granular capabilities (e.g. 'view_clinical_notes', 'manage_billing')

    avatar?: string;
    onboardingStatus?: string; // e.g. 'active', 'pending', 'draft'
    onboardingStep?: number;
    account_status?: string;
    verification_stage?: string;
    is_active?: boolean;
    organizationId?: string; // Links staff to their Organization
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
    role: UserRole;
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
    loginWithPhone?(phoneNumber: string, otp: string): Promise<AuthResponse>;
    sendOTP?(phoneNumber: string): Promise<void>;
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

    // OTP / phone verification (backend-driven)
    verifyPhoneOtp(sessionId: string, otp: string): Promise<AuthResponse>;

    // Google OAuth (backend-driven, returns redirect URL)
    getGoogleOAuthUrl(): Promise<{ url: string }>;
}

export interface IDataService {
    get(collection: string, id: string): Promise<any>;
    list(collection: string, filters?: any): Promise<any[]>;
    create(collection: string, data: any): Promise<any>;
    update(collection: string, id: string, data: any): Promise<any>;
    delete(collection: string, id: string): Promise<void>;
}
