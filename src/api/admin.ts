/**
 * api/admin.ts — Admin Lambda thin client (backend-initial `/admin/*`).
 *
 * Response envelope: every admin route returns `{ ok: true, data }` or
 * `{ ok: false, error: { code, message, fields? } }` — unwrapped here so
 * callers get the payload directly (types mirror src/shared/admin-types.ts
 * in backend-initial; keep the two in sync).
 */

import { get, post, put } from './client';
import { ApiException } from './client';

// ── Types (mirror backend-initial src/shared/admin-types.ts) ─────────────────

export interface DashboardCounts {
    pendingTherapists: number;
    pendingPayouts: number;
    totalClients: number;
    totalTherapists: number;
}

export interface Pagination {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
}

export interface Paginated<T> {
    data: T[];
    pagination: Pagination;
}

export interface TherapistRow {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    verificationStatus: string;
    modalities: string[];
    registeredAt: string;
    isActive: boolean;
}

export interface TherapistDetail extends TherapistRow {
    title: string | null;
    licenseNumber: string | null;
    licenseState: string | null;
    licenseExpiration: string | null;
    clinicalSpecialties: string[];
    languagesSpoken: string[];
    introFee: number | null;
    regularFee: number | null;
    bio: string | null;
    yearsOfExperience: number | null;
    location: string | null;
    bankVerified: boolean;
    verifiedAt: string | null;
    rejectedAt: string | null;
    rejectedReason: string | null;
}

export interface ClientRow {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    assignedTherapistName: string | null;
    registeredAt: string;
}

export interface ClientDetail extends ClientRow {
    assignedTherapistId: number | null;
    recentAppointments: {
        id: number;
        scheduledAt: string;
        status: string;
        therapistName: string;
    }[];
}

export interface AppointmentRow {
    id: number;
    clientId: number;
    clientName: string;
    therapistId: number;
    therapistName: string;
    serviceType: string;
    scheduledAt: string;
    status: string;
    paymentStatus: string;
    bookedBy: string;
    /** Paise (₹1 = 100 paise) — like every money field on the platform. */
    price: number;
}

export interface AdminActivityRow {
    id: number;
    actor: { id: number; firstName: string; lastName: string; email: string };
    action: string;
    targetType: string;
    targetId: number;
    metadata: unknown;
    createdAt: string;
}

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

// ── Envelope unwrap ───────────────────────────────────────────────────────────

type Envelope<T> =
    | { ok: true; data: T }
    | { ok: false; error: { code: string; message: string; fields?: Record<string, string> } };

function unwrap<T>(env: Envelope<T>): T {
    if (env.ok) return env.data;
    throw new ApiException({ message: env.error.message, code: env.error.code, details: env.error.fields });
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

export async function getDashboardCounts(): Promise<DashboardCounts> {
    return unwrap(await get<Envelope<DashboardCounts>>('/admin/dashboard/counts'));
}

export async function listTherapists(query?: ListQuery): Promise<Paginated<TherapistRow>> {
    return unwrap(await get<Envelope<Paginated<TherapistRow>>>(withQuery('/admin/therapists', query)));
}

export async function getTherapist(therapistId: number): Promise<TherapistDetail> {
    return unwrap(await get<Envelope<TherapistDetail>>(`/admin/therapists/${therapistId}`));
}

export async function approveTherapist(therapistId: number): Promise<TherapistDetail> {
    return unwrap(await post<Envelope<TherapistDetail>>(`/admin/therapists/${therapistId}/approve`, {}));
}

export async function rejectTherapist(therapistId: number, reason: string): Promise<TherapistDetail> {
    return unwrap(await post<Envelope<TherapistDetail>>(`/admin/therapists/${therapistId}/reject`, { reason }));
}

export async function listClients(query?: ListQuery): Promise<Paginated<ClientRow>> {
    return unwrap(await get<Envelope<Paginated<ClientRow>>>(withQuery('/admin/clients', query)));
}

export async function getClient(clientId: number): Promise<ClientDetail> {
    return unwrap(await get<Envelope<ClientDetail>>(`/admin/clients/${clientId}`));
}

export async function updateClient(
    clientId: number,
    updates: Partial<Pick<ClientRow, 'firstName' | 'lastName' | 'email' | 'phone'>> & { assignedTherapistId?: number | null }
): Promise<ClientDetail> {
    return unwrap(await put<Envelope<ClientDetail>>(`/admin/clients/${clientId}`, updates));
}

export async function listAppointments(query?: ListQuery): Promise<Paginated<AppointmentRow>> {
    return unwrap(await get<Envelope<Paginated<AppointmentRow>>>(withQuery('/admin/appointments', query)));
}

export async function listActivity(query?: ListQuery): Promise<Paginated<AdminActivityRow>> {
    return unwrap(await get<Envelope<Paginated<AdminActivityRow>>>(withQuery('/admin/activity', query)));
}
