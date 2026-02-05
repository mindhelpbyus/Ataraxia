// Helper to get production API base URL
const getBaseUrl = () => {
    const url = import.meta.env.VITE_API_BASE_URL;
    if (!url) {
        throw new Error('VITE_API_BASE_URL not configured');
    }
    // Remove trailing slash
    let cleanUrl = url.endsWith('/') ? url.slice(0, -1) : url;
    // If url ends with /api, remove it so we can append it consistently
    if (cleanUrl.endsWith('/api')) cleanUrl = cleanUrl.slice(0, -4);
    return cleanUrl;
};

const getVerificationServiceUrl = () => {
    const url = import.meta.env.VITE_API_BASE_URL;
    if (!url) {
        throw new Error('VITE_API_BASE_URL not configured');
    }
    // Remove trailing slash
    let cleanUrl = url.endsWith('/') ? url.slice(0, -1) : url;
    // If url ends with /api, remove it so we can append it consistently
    if (cleanUrl.endsWith('/api')) cleanUrl = cleanUrl.slice(0, -4);
    return cleanUrl;
};

const BASE_URL = getBaseUrl();
const VERIFICATION_BASE_URL = getVerificationServiceUrl();

export interface VerificationUpdatePayload {
    stage: 'documents' | 'background_check' | 'final';
    status: 'approved' | 'rejected';
    notes?: string;
    details?: any;
}

export interface ActivateTherapistPayload {
    registration_id: string;
}

export const verificationService = {
    async getAllTherapists() {
        try {
            // FIXED: Use verification service for pending verifications, not therapist service
            const response = await fetch(`${VERIFICATION_BASE_URL}/api/verification/pending`);
            if (!response.ok) {
                throw new Error('Failed to fetch pending verifications');
            }
            const data = await response.json();
            
            // Transform the data to match the expected format
            return data.registrations?.map((reg: any) => ({
                id: reg.id,
                first_name: reg.first_name,
                last_name: reg.last_name,
                email: reg.email,
                phone_number: reg.phone_number,
                license_number: reg.license_number,
                license_state: reg.license_state,
                account_status: reg.registration_status,
                verification_stage: reg.workflow_stage,
                background_check_status: reg.background_check_status,
                created_at: reg.created_at,
                specialty: reg.specializations || 'General',
                // Map temp registration fields to expected format
                profile_image_url: null,
                license_verified: false,
                verification_notes: null
            })) || [];
        } catch (error) {
            console.error('Error fetching verification list:', error);
            throw error;
        }
    },

    async updateVerificationStage(id: string, payload: VerificationUpdatePayload) {
        try {
            // For final approval, use the new activation endpoint
            if (payload.stage === 'final' && payload.status === 'approved') {
                return await this.activateTherapistAccount(id);
            }

            // For other stages, use the existing therapist service endpoint
            const response = await fetch(`${BASE_URL}/api/therapists/${id}/verification`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Add Authorization header here if needed, e.g. from local storage or auth context
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error('Failed to update verification stage');
            }
            return await response.json();
        } catch (error) {
            console.error('Error updating verification stage:', error);
            throw error;
        }
    },

    async activateTherapistAccount(therapistId: string) {
        try {
            // First, get the registration_id from the therapist
            const therapistResponse = await fetch(`${BASE_URL}/api/therapists/${therapistId}`);
            if (!therapistResponse.ok) {
                throw new Error('Failed to fetch therapist details');
            }
            const therapist = await therapistResponse.json();

            // Get temp registration to find registration_id
            const tempRegResponse = await fetch(`${VERIFICATION_BASE_URL}/api/verification/pending`);
            if (!tempRegResponse.ok) {
                throw new Error('Failed to fetch pending registrations');
            }
            const pendingData = await tempRegResponse.json();
            
            // Find the registration by firebase_uid or email
            const registration = pendingData.registrations?.find((reg: any) => 
                reg.firebase_uid === therapist.firebase_uid || reg.email === therapist.email
            );

            if (!registration) {
                throw new Error('Registration not found for this therapist');
            }

            // Call the new activation endpoint
            const response = await fetch(`${VERIFICATION_BASE_URL}/api/verification/${registration.id}/activate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to activate therapist account');
            }
            return await response.json();
        } catch (error) {
            console.error('Error activating therapist account:', error);
            throw error;
        }
    }
};
