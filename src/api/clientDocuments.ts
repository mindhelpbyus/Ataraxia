/**
 * api/clientDocuments.ts — Client document storage (therapist-facing).
 *
 * Backend: backend-initial file-upload Lambda, PHI-dedicated bucket (distinct
 * from the generic /files route). Upload flow:
 *   1. GET /client-documents/upload-url  → { uploadUrl, s3Key } (presigned PUT)
 *   2. Client PUTs the file bytes directly to `uploadUrl`
 *   3. POST /client-documents             → registers the ClientDocument row
 * Only a therapist (or admin acting on a therapist's behalf) may call these —
 * enforced server-side (403 FORBIDDEN_NOT_THERAPIST otherwise).
 */

import { get, post } from './client';

export const ALLOWED_DOCUMENT_MIME_TYPES = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/heic', 'image/heif', 'image/webp',
    'application/pdf',
] as const;

export interface ClientDocument {
    id: string;
    clientId: number;
    therapistId: number;
    appointmentId: number | null;
    docType: string;
    sessionDate: string;
    s3Key: string;
    mimeType: string;
    sizeBytes: number;
    originalFilename: string | null;
    uploadedByRole: string;
    uploadedByUserId: number;
    createdAt: string;
    /** Presigned GET URL, present only when the caller may view content (short-lived). */
    contentUrl?: string;
}

interface Envelope<T> { success: boolean; data: T }

function withQuery(path: string, params: Record<string, string | number | undefined>): string {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== '') q.append(k, String(v)); });
    const qs = q.toString();
    return qs ? `${path}?${qs}` : path;
}

export async function listClientDocuments(clientId: number | string): Promise<ClientDocument[]> {
    const res = await get<Envelope<ClientDocument[]>>(withQuery('/client-documents', { clientId }));
    return res.data;
}

/**
 * Upload a file to a client's document record end-to-end: gets a presigned
 * URL, PUTs the bytes, then registers the ClientDocument row.
 */
export async function uploadClientDocument(params: {
    clientId: number | string;
    file: File;
    appointmentId?: number | string;
    sessionDate?: string;
}): Promise<ClientDocument> {
    const { clientId, file, appointmentId, sessionDate } = params;

    const { uploadUrl, s3Key } = await get<{ uploadUrl: string; s3Key: string }>(
        withQuery('/client-documents/upload-url', {
            clientId,
            mimeType: file.type,
            filename: file.name,
            appointmentId,
            sessionDate,
        })
    );

    const putRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
    });
    if (!putRes.ok) {
        throw new Error(`Upload to storage failed: HTTP ${putRes.status}`);
    }

    const res = await post<Envelope<ClientDocument>>('/client-documents', {
        s3Key,
        clientId,
        mimeType: file.type,
        sizeBytes: file.size,
        originalFilename: file.name,
        appointmentId,
        sessionDate: sessionDate ?? new Date().toISOString(),
    });
    return res.data;
}
