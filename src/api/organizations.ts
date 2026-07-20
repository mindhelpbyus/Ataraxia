/**
 * api/organizations.ts — backend-initial `/organizations` thin client.
 *
 * Wire shape: `{ success: true, data: Organization[], pagination: { page,
 * limit, total, totalPages } }` — same envelope convention as `/clients` and
 * `/therapists` (NOT the `/admin/*` `{ ok, data }` shape `admin.ts` uses).
 * `apiRequest`'s auto-unwrap would strip the outer `data` and drop the
 * sibling `pagination` key, so this uses `rawEnvelope: true` and validates
 * the whole envelope, matching the `pagination` type this route actually
 * returns (`limit`, not `pageSize`).
 */

import { z } from 'zod';
import { apiFetch } from './client';

const OrganizationSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  city: z.string().nullable(),
  state: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z.string(),
});
export type Organization = z.infer<typeof OrganizationSchema>;

const PaginationSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number(),
});
export type Pagination = z.infer<typeof PaginationSchema>;

const ListOrganizationsResponseSchema = z.object({
  success: z.literal(true),
  data: z.array(OrganizationSchema),
  pagination: PaginationSchema,
});

export type OrganizationSortBy = 'name' | 'isActive' | 'createdAt';

export interface ListOrganizationsQuery {
  page?: number;
  limit?: number;
  sortBy?: OrganizationSortBy;
  sortOrder?: 'asc' | 'desc';
  isActive?: boolean;
}

export interface ListOrganizationsResult {
  data: Organization[];
  pagination: Pagination;
}

function withQuery(path: string, query: Record<string, string | number | boolean | undefined>): string {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([k, v]) => {
    if (v !== undefined) params.append(k, String(v));
  });
  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
}

export async function listOrganizations(query: ListOrganizationsQuery = {}): Promise<ListOrganizationsResult> {
  const { page, limit, sortBy, sortOrder, isActive } = query;
  const res = await apiFetch(
    withQuery('/organizations', { page, limit, sortBy, sortOrder, isActive }),
    { rawEnvelope: true, schema: ListOrganizationsResponseSchema }
  );
  return { data: res.data, pagination: res.pagination };
}
