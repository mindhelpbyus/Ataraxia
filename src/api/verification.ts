/**
 * api/verification.ts — Therapist Verification Admin API
 *
 * Real backend routes (backend-initial admin Lambda):
 *   - list pending:  GET  /admin/therapists?status=pending
 *   - approve:       POST /admin/therapists/{id}/approve
 *   - reject:        POST /admin/therapists/{id}/reject   { reason }
 *   - own status:    GET  /therapists/me   (therapist checking their application)
 *
 * ✅ Used by:
 *    - TherapistVerificationView.tsx
 *    - VerificationPendingPage.tsx
 */

import { get } from './client';
import {
    listTherapists,
    approveTherapist,
    rejectTherapist as adminRejectTherapist,
    type TherapistRow,
} from './admin';

// ─── Types (UI shape kept stable for existing consumers) ─────────────────────

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

function toPendingTherapist(row: TherapistRow): PendingTherapist {
    return {
        id: String(row.id),
        first_name: row.firstName,
        last_name: row.lastName,
        email: row.email,
        phone_number: row.phone,
        license_number: null, // detail-only field — fetch getTherapist(id) when needed
        license_state: null,
        account_status: row.isActive ? 'active' : 'inactive',
        verification_stage: row.verificationStatus,
        background_check_status: null, // no background-check service on the platform yet
        created_at: row.registeredAt,
        specialty: row.modalities.join(', ') || 'General',
        profile_image_url: null,
        license_verified: row.verificationStatus === 'verified',
        verification_notes: null,
    };
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const verificationService = {
    /** All therapists awaiting verification (admin view). */
    async getAllTherapists(): Promise<PendingTherapist[]> {
        const result = await listTherapists({ status: 'pending', pageSize: 100 });
        return result.data.map(toPendingTherapist);
    },

    /**
     * A therapist's own application status (VerificationPendingPage).
     * Reads GET /therapists/me and maps whichever status field the record carries.
     */
    async getRegistrationStatus(_userId: string): Promise<RegistrationStatus> {
        const me = await get<Record<string, unknown>>('/therapists/me');
        const status = String(
            me.verificationStatus ?? me.verification_status ??
            me.accountStatus ?? me.account_status ??
            (me.isVerified ? 'verified' : 'pending')
        );
        return { registration: { status, workflow_stage: status } };
    },

    /** Approve = the admin Lambda's approve action (sets isVerified, writes audit row). */
    async activateTherapistAccount(therapistId: string): Promise<unknown> {
        return approveTherapist(Number(therapistId));
    },

    /** Reject with a reason (min 3 chars — enforced server-side). */
    async rejectTherapist(therapistId: string, reason: string): Promise<unknown> {
        return adminRejectTherapist(Number(therapistId), reason);
    },
};
