/**
 * api/admin.ts — Admin Lambda thin client (backend-initial `/admin/*`).
 *
 * Response envelope: every admin route returns the RAW body
 * `{ ok: true, data }` or `{ ok: false, error: { code, message, fields? } }`
 * (see backend-initial src/lambdas/admin/src/handler.ts `ok()`/`err()`).
 *
 * Uses `apiFetch` with `rawEnvelope: true` + a Zod schema over the *whole*
 * envelope — validated then unwrapped here. This replaced a hand-rolled
 * `unwrap()` that operated on `apiRequest`'s auto-unwrapped body (which had
 * already stripped `{ ok, data }` down to bare `data`), so `env.ok` was always
 * `undefined` and every call in this module threw and was silently swallowed
 * by callers' try/catch fallback UI — dashboards were rendering the "could
 * not load" state, not real numbers, since MVP0.2.
 */

import { z } from 'zod';
import { apiFetch, ApiFetchError } from './client';

// ── Schemas (mirror backend-initial src/shared/admin-types.ts) ───────────────

const DashboardCountsSchema = z.object({
    pendingTherapists: z.number(),
    pendingPayouts: z.number(),
    totalClients: z.number(),
    totalTherapists: z.number(),
});
export type DashboardCounts = z.infer<typeof DashboardCountsSchema>;

const PaginationSchema = z.object({
    page: z.number(),
    pageSize: z.number(),
    total: z.number(),
    totalPages: z.number(),
});
export type Pagination = z.infer<typeof PaginationSchema>;

function paginated<T extends z.ZodType>(item: T) {
    return z.object({ data: z.array(item), pagination: PaginationSchema });
}
export type Paginated<T> = { data: T[]; pagination: Pagination };

const TherapistRowSchema = z.object({
    id: z.number(),
    firstName: z.string(),
    lastName: z.string(),
    email: z.string(),
    phone: z.string().nullable(),
    verificationStatus: z.string(),
    modalities: z.array(z.string()),
    registeredAt: z.string(),
    isActive: z.boolean(),
});
export type TherapistRow = z.infer<typeof TherapistRowSchema>;

const TherapistDetailSchema = TherapistRowSchema.extend({
    title: z.string().nullable(),
    licenseNumber: z.string().nullable(),
    licenseState: z.string().nullable(),
    licenseExpiration: z.string().nullable(),
    clinicalSpecialties: z.array(z.string()),
    languagesSpoken: z.array(z.string()),
    introFee: z.number().nullable(),
    regularFee: z.number().nullable(),
    bio: z.string().nullable(),
    yearsOfExperience: z.number().nullable(),
    location: z.string().nullable(),
    bankVerified: z.boolean(),
    verifiedAt: z.string().nullable(),
    rejectedAt: z.string().nullable(),
    rejectedReason: z.string().nullable(),
});
export type TherapistDetail = z.infer<typeof TherapistDetailSchema>;

const ClientRowSchema = z.object({
    id: z.number(),
    firstName: z.string(),
    lastName: z.string(),
    email: z.string(),
    phone: z.string().nullable(),
    assignedTherapistName: z.string().nullable(),
    registeredAt: z.string(),
});
export type ClientRow = z.infer<typeof ClientRowSchema>;

const ClientDetailSchema = ClientRowSchema.extend({
    assignedTherapistId: z.number().nullable(),
    recentAppointments: z.array(z.object({
        id: z.number(),
        scheduledAt: z.string(),
        status: z.string(),
        therapistName: z.string(),
    })),
});
export type ClientDetail = z.infer<typeof ClientDetailSchema>;

const AppointmentRowSchema = z.object({
    id: z.number(),
    clientId: z.number(),
    clientName: z.string(),
    therapistId: z.number(),
    therapistName: z.string(),
    serviceType: z.string(),
    scheduledAt: z.string(),
    status: z.string(),
    paymentStatus: z.string(),
    bookedBy: z.string(),
    /** Paise (₹1 = 100 paise) — like every money field on the platform. */
    price: z.number(),
});
export type AppointmentRow = z.infer<typeof AppointmentRowSchema>;

const AdminActivityRowSchema = z.object({
    id: z.number(),
    actor: z.object({ id: z.number(), firstName: z.string(), lastName: z.string(), email: z.string() }),
    action: z.string(),
    targetType: z.string(),
    targetId: z.number(),
    metadata: z.unknown(),
    createdAt: z.string(),
});
export type AdminActivityRow = z.infer<typeof AdminActivityRowSchema>;

export interface ListQuery {
    page?: number;
    pageSize?: number;
    limit?: number;
    search?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    therapistId?: number;
    clientId?: number;
}

// ── Envelope ───────────────────────────────────────────────────────────────

function envelope<T extends z.ZodType>(data: T) {
    return z.discriminatedUnion('ok', [
        z.object({ ok: z.literal(true), data }),
        z.object({ ok: z.literal(false), error: z.object({ code: z.string(), message: z.string(), fields: z.record(z.string(), z.string()).optional() }) }),
    ]);
}

type AdminEnvelope<T> =
    | { ok: true; data: T }
    | { ok: false; error: { code: string; message: string; fields?: Record<string, string> } };

async function callAdmin<T extends z.ZodType>(
    endpoint: string,
    schema: T,
    opts: { method?: 'GET' | 'POST' | 'PUT'; body?: unknown } = {}
): Promise<z.infer<T>> {
    const result = (await apiFetch(endpoint, {
        method: opts.method ?? 'GET',
        body: opts.body,
        rawEnvelope: true,
        schema: envelope(schema),
    })) as AdminEnvelope<z.infer<T>>;
    if (!result.ok) {
        throw new ApiFetchError(0, result.error.code, result.error.message, result.error.fields);
    }
    return result.data;
}

function withQuery(path: string, query?: ListQuery): string {
    if (!query) return path;
    const params = new URLSearchParams();
    Object.entries(query).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') params.append(k, String(v));
    });
    const qs = params.toString();
    return qs ? `${path}?${qs}` : path;
}

// ── Endpoints ─────────────────────────────────────────────────────────────────

export function getDashboardCounts(): Promise<DashboardCounts> {
    return callAdmin('/admin/dashboard/counts', DashboardCountsSchema);
}

export function listTherapists(query?: ListQuery): Promise<Paginated<TherapistRow>> {
    return callAdmin(withQuery('/admin/therapists', query), paginated(TherapistRowSchema));
}

export function getTherapist(therapistId: number): Promise<TherapistDetail> {
    return callAdmin(`/admin/therapists/${therapistId}`, TherapistDetailSchema);
}

export function approveTherapist(therapistId: number): Promise<TherapistDetail> {
    return callAdmin(`/admin/therapists/${therapistId}/approve`, TherapistDetailSchema, { method: 'POST', body: {} });
}

export function rejectTherapist(therapistId: number, reason: string): Promise<TherapistDetail> {
    return callAdmin(`/admin/therapists/${therapistId}/reject`, TherapistDetailSchema, { method: 'POST', body: { reason } });
}

export function listClients(query?: ListQuery): Promise<Paginated<ClientRow>> {
    return callAdmin(withQuery('/admin/clients', query), paginated(ClientRowSchema));
}

export function getClient(clientId: number): Promise<ClientDetail> {
    return callAdmin(`/admin/clients/${clientId}`, ClientDetailSchema);
}

export function updateClient(
    clientId: number,
    updates: Partial<Pick<ClientRow, 'firstName' | 'lastName' | 'email' | 'phone'>> & { assignedTherapistId?: number | null }
): Promise<ClientDetail> {
    return callAdmin(`/admin/clients/${clientId}`, ClientDetailSchema, { method: 'PUT', body: updates });
}

export function listAppointments(query?: ListQuery): Promise<Paginated<AppointmentRow>> {
    return callAdmin(withQuery('/admin/appointments', query), paginated(AppointmentRowSchema));
}

export function listActivity(query?: ListQuery): Promise<Paginated<AdminActivityRow>> {
    return callAdmin(withQuery('/admin/activity', query), paginated(AdminActivityRowSchema));
}
