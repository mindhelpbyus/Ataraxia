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
 *
 * Wire shape is { success: true, data } on every route here — apiRequest's
 * auto-unwrap already strips that to bare `data`, so schemas below validate
 * the *inner* payload (default rawEnvelope: false), matching what the old
 * hand-rolled `Envelope<T>` + `res.data` here actually received (a second
 * `.data` access on an already-unwrapped value — same bug class as admin.ts
 * and roles.ts, all three fixed in the same pass).
 */

import { z } from 'zod';
import { apiFetch } from './client';

export const ALLOWED_DOCUMENT_MIME_TYPES = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/heic', 'image/heif', 'image/webp',
    'application/pdf',
] as const;

const ClientDocumentSchema = z.object({
    id: z.string(),
    clientId: z.number(),
    therapistId: z.number(),
    appointmentId: z.number().nullable(),
    docType: z.string(),
    sessionDate: z.string(),
    s3Key: z.string(),
    mimeType: z.string(),
    sizeBytes: z.number(),
    originalFilename: z.string().nullable(),
    uploadedByRole: z.string(),
    uploadedByUserId: z.number(),
    createdAt: z.string(),
    /** Presigned GET URL, present only when the caller may view content (short-lived). */
    contentUrl: z.string().optional(),
});
export type ClientDocument = z.infer<typeof ClientDocumentSchema>;

const UploadUrlSchema = z.object({ uploadUrl: z.string(), s3Key: z.string() });

function withQuery(path: string, params: Record<string, string | number | undefined>): string {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== '') q.append(k, String(v)); });
    const qs = q.toString();
    return qs ? `${path}?${qs}` : path;
}

export function listClientDocuments(clientId: number | string): Promise<ClientDocument[]> {
    return apiFetch(withQuery('/client-documents', { clientId }), { schema: z.array(ClientDocumentSchema) });
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

    const { uploadUrl, s3Key } = await apiFetch(
        withQuery('/client-documents/upload-url', {
            clientId,
            mimeType: file.type,
            filename: file.name,
            appointmentId,
            sessionDate,
        }),
        { schema: UploadUrlSchema }
    );

    const putRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
    });
    if (!putRes.ok) {
        throw new Error(`Upload to storage failed: HTTP ${putRes.status}`);
    }

    return apiFetch('/client-documents', {
        method: 'POST',
        body: {
            s3Key,
            clientId,
            mimeType: file.type,
            sizeBytes: file.size,
            originalFilename: file.name,
            appointmentId,
            sessionDate: sessionDate ?? new Date().toISOString(),
        },
        schema: ClientDocumentSchema,
    });
}
