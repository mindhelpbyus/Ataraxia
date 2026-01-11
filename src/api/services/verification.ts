import { config } from '../../config';

export interface TherapistRegistrationData {
    firebase_uid: string;
    email: string;
    phone_number?: string;
    first_name: string;
    last_name: string;
    date_of_birth?: string;
    license_number: string;
    license_state: string;
    license_type?: string;
    license_expiry: string;
    degree?: string;
    specializations?: string[];
    years_of_experience?: number;
    practice_name?: string;
    practice_type?: string;
    npi_number?: string;
    malpractice_insurance_provider?: string;
    malpractice_policy_number?: string;
    malpractice_expiry?: string;
    background_check_consent: boolean;
    org_invite_code?: string; // For organization invites
    profile_image_url?: string; // From Google/Apple
    signup_method?: 'email' | 'google' | 'apple';
}

export interface RegistrationResponse {
    success: boolean;
    registration?: {
        id: number;
        status: string;
        workflow_stage: string;
        message: string;
        estimated_time?: string;
    };
    user?: {
        id: number;
        email: string;
        first_name: string;
        last_name: string;
        account_status: string;
    };
    organization?: string;
    can_login: boolean;
    message?: string;
    error?: string;
}

export interface RegistrationStatus {
    success: boolean;
    status: string;
    registration?: {
        id: number;
        status: string;
        workflow_stage: string;
        background_check_status: string;
        can_login: boolean;
        message: string;
    };
    user?: {
        id: number;
        email: string;
        first_name: string;
        last_name: string;
        account_status: string;
        is_verified: boolean;
    };
    can_login: boolean;
    message: string;
}

/**
 * Register therapist (solo or organization)
 */
const VERIFICATION_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

// Use local constant instead of config.api.baseUrl for all calls
export const registerTherapist = async (data: TherapistRegistrationData): Promise<RegistrationResponse> => {
    try {
        const response = await fetch(`${VERIFICATION_API_URL}/api/verification/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Registration failed');
        }

        return await response.json();
    } catch (error: any) {
        console.error('Register therapist error:', error);
        throw error;
    }
};

/**
 * Get registration status by firebase_uid
 */
export const getRegistrationStatus = async (firebase_uid: string): Promise<RegistrationStatus> => {
    try {
        // Normalize URL to handle .env misconfiguration
        let apiUrl = VERIFICATION_API_URL;
        apiUrl = apiUrl.replace(/\/$/, '').replace(/\/api$/, ''); // Remove trailing /api or /

        const response = await fetch(`${apiUrl}/api/auth/therapist/status/${firebase_uid}`);

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to get status');
        }

        return await response.json();
    } catch (error: any) {
        console.error('Get registration status error:', error);
        throw error;
    }
};

/**
 * Upload verification document
 */
export const uploadDocument = async (
    registrationId: number,
    documentType: string,
    documentUrl: string
): Promise<{ success: boolean; message: string }> => {
    try {
        const response = await fetch(
            `${VERIFICATION_API_URL}/api/verification/${registrationId}/upload-document`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    document_type: documentType,
                    document_url: documentUrl,
                }),
            }
        );

        if (!response.ok) {
            throw new Error('Document upload failed');
        }

        return await response.json();
    } catch (error: any) {
        console.error('Upload document error:', error);
        throw error;
    }
};

/**
 * Get pending verifications (admin only)
 */
export const getPendingVerifications = async (token: string) => {
    try {
        const response = await fetch(`${VERIFICATION_API_URL}/api/verification/pending`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to get pending verifications');
        }

        return await response.json();
    } catch (error: any) {
        console.error('Get pending verifications error:', error);
        throw error;
    }
};

/**
 * Approve therapist registration (admin only)
 */
export const approveTherapist = async (registrationId: number, token: string) => {
    try {
        const response = await fetch(
            `${VERIFICATION_API_URL}/api/verification/${registrationId}/approve`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        if (!response.ok) {
            throw new Error('Failed to approve therapist');
        }

        return await response.json();
    } catch (error: any) {
        console.error('Approve therapist error:', error);
        throw error;
    }
};

/**
 * Reject therapist registration (admin only)
 */
export const rejectTherapist = async (
    registrationId: number,
    rejectionReason: string,
    token: string
) => {
    try {
        const response = await fetch(
            `${VERIFICATION_API_URL}/api/verification/${registrationId}/reject`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ rejection_reason: rejectionReason }),
            }
        );

        if (!response.ok) {
            throw new Error('Failed to reject therapist');
        }

        return await response.json();
    } catch (error: any) {
        console.error('Reject therapist error:', error);
        throw error;
    }
};

export const verificationService = {
    registerTherapist,
    getRegistrationStatus,
    uploadDocument,
    getPendingVerifications,
    approveTherapist,
    rejectTherapist,
};
