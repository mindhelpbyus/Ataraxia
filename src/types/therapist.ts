export type VerificationStage = 'registration_submitted' | 'documents' | 'background_check' | 'final' | 'final_review' | 'completed' | 'account_created';
export type VerificationStatus = 'approved' | 'rejected' | 'pending';

export interface Therapist {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    profile_image_url?: string;
    specialty?: string;

    account_status: 'onboarding_pending' | 'active' | 'rejected' | 'suspended' | 'pending_verification' | 'incomplete_registration' | 'documents_review' | 'registration_submitted';
    verification_stage: VerificationStage;

    license_number?: string;
    license_state?: string;
    license_verified: boolean;

    background_check_status: 'pending' | 'in_progress' | 'completed' | 'failed';

    verification_notes?: string;
    created_at: string;
}
