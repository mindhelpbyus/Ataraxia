/**
 * api/verification.ts — Therapist Verification Admin API
 *
 * ✅ SECURITY FIX (Feb 22 2026): Removed localStorage.getItem('token').
 *    Auth is handled by HTTP-only cookies via api/client.ts — the frontend
 *    never needs to read or pass tokens manually.
 *
 * ✅ Used by:
 *    - TherapistVerificationView.tsx
 *    - VerificationPendingPage.tsx
 */

import { get, post } from './client';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface VerificationUpdatePayload {
    stage: 'documents' | 'background_check' | 'final';
    status?: 'approved' | 'rejected';
    action?: 'approve' | 'reject';
    notes?: string;
    details?: Record<string, unknown>;
}

export interface PendingTherapist {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string | null;
    license_number: string | null;
    license_state: string | null;
    account_status: string;
    verification_stage: string;
    background_check_status: string | null;
    created_at: string;
    specialty: string;
    profile_image_url: string | null;
    license_verified: boolean;
    verification_notes: string | null;
}

export interface RegistrationStatus {
    registration?: {
        status: string;
        workflow_stage: string;
        background_check_status?: string;
    };
    message?: string;
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const verificationService = {
    /**
     * Fetch all pending therapist verifications.
     * Calls backend verification endpoint — no auth token needed client-side.
     */
    async getAllTherapists(): Promise<PendingTherapist[]> {
        interface PendingResponse {
            registrations: Array<{
                id: string;
                first_name: string;
                last_name: string;
                email: string;
                phone_number: string | null;
                license_number: string | null;
                license_state: string | null;
                registration_status: string;
                workflow_stage: string;
                background_check_status: string | null;
                created_at: string;
                specializations?: string;
            }>;
        }

        const data = await get<PendingResponse>('/api/verification/pending');

        return (data.registrations ?? []).map((reg) => ({
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
            specialty: reg.specializations ?? 'General',
            profile_image_url: null,
            license_verified: false,
            verification_notes: null,
        }));
    },

    /**
     * Get registration status for a specific therapist (by user ID).
     */
    async getRegistrationStatus(userId: string): Promise<RegistrationStatus> {
        return get<RegistrationStatus>(`/api/verification/status/${userId}`);
    },

    /**
     * Update therapist verification stage.
     * Final approval triggers account activation.
     */
    async updateVerificationStage(
        id: string,
        payload: VerificationUpdatePayload
    ): Promise<unknown> {
        if (payload.stage === 'final' && payload.status === 'approved') {
            return this.activateTherapistAccount(id);
        }

        // ✅ Uses api/client.ts post() — credentials sent via HTTP-only cookie automatically
        return post(`/api/therapists/${id}/verification`, payload);
    },

    /**
     * Activate a therapist account after all verification stages pass.
     */
    async activateTherapistAccount(therapistId: string): Promise<unknown> {
        // Direct backend logic using unified id — no more firebase_uid tracking
        return post(`/api/verification/${therapistId}/activate`);
    },

    /**
     * Reject a therapist application.
     */
    async rejectTherapist(therapistId: string, reason: string): Promise<unknown> {
        return post(`/api/verification/${therapistId}/reject`, { reason });
    },
};
