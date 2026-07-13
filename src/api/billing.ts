/**
 * api/billing.ts — billing_payment thin client.
 *
 * Contract (billing_payment/docs/billing_routes.md — the canonical reference):
 *   - External paths are ALWAYS `/billing/*` (the Lambda rewrites to /api/* internally).
 *   - Auth: Cognito **ID token** — billing's Lambda reads `custom:role`/`custom:clientId`
 *     claims which exist only on ID tokens (access tokens 401/misbehave).
 *   - Every POST/PUT/DELETE requires an `Idempotency-Key` header
 *     (else 400 IDEMPOTENCY_KEY_REQUIRED); same key + different body → 422.
 *   - All money in **paise** (₹1 = 100 paise). Lists are unpaginated, newest first.
 *   - Response bodies are NOT enveloped (billing_payment's controllers
 *     `sendJson(response, 200, payload)` the payload directly) — unlike
 *     backend-initial, so schemas below validate the payload as-is.
 *
 * Uses apiFetch (Zod-validated) — a response that stops matching this file's
 * types now throws a readable ApiSchemaError instead of shipping a silent
 * shape mismatch to the UI.
 */

import { apiFetch } from './client';
import { getCurrentSession } from '../lib/cognito';
import { z } from 'zod';

// ─── Transport ────────────────────────────────────────────────────────────────

async function billingHeaders(mutating: boolean): Promise<Record<string, string>> {
    const session = await getCurrentSession();
    const headers: Record<string, string> = {};
    if (session?.idToken) headers['Authorization'] = `Bearer ${session.idToken}`;
    if (mutating) headers['Idempotency-Key'] = crypto.randomUUID();
    return headers;
}

async function bGet<T extends z.ZodType>(path: string, schema: T): Promise<z.infer<T>> {
    return (await apiFetch(path, { schema, headers: await billingHeaders(false) })) as z.infer<T>;
}

async function bPost<T extends z.ZodType>(path: string, schema: T, body?: unknown): Promise<z.infer<T>> {
    return (await apiFetch(path, { method: 'POST', body, schema, headers: await billingHeaders(true) })) as z.infer<T>;
}

function withQuery(path: string, query?: Record<string, string | number | undefined>): string {
    if (!query) return path;
    const params = new URLSearchParams();
    Object.entries(query).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') params.append(k, String(v));
    });
    const qs = params.toString();
    return qs ? `${path}?${qs}` : path;
}

// ─── Schemas (fields per billing_payment pgStore/Prisma shapes) ─────────────

const WalletBalanceSchema = z.object({
    clientId: z.number(),
    /** Paise. */
    walletBalance: z.number(),
    currency: z.string(),
});
export type WalletBalance = z.infer<typeof WalletBalanceSchema>;

const PaymentSchema = z.object({
    id: z.string(),
    sessionId: z.string().nullable().optional(),
    razorpayPaymentId: z.string().nullable().optional(),
    /** Paise. */
    amount: z.number(),
    currency: z.string().optional(),
    status: z.string(),
    settlementState: z.string().nullable().optional(),
    capturedAt: z.string().nullable().optional(),
    createdAt: z.string(),
});
export type Payment = z.infer<typeof PaymentSchema>;

const BillingSessionSchema = z.object({
    id: z.string(),
    appointmentId: z.union([z.number(), z.string()]).nullable().optional(),
    clientId: z.union([z.number(), z.string()]),
    therapistId: z.union([z.number(), z.string()]),
    /** Paise. */
    feeAmount: z.number(),
    currency: z.string().optional(),
    status: z.string(),
    payoutState: z.string().optional(),
    settlementState: z.string().optional(),
    disputeState: z.string().optional(),
    refundState: z.string().optional(),
    startsAt: z.string().optional(),
    createdAt: z.string(),
});
export type BillingSession = z.infer<typeof BillingSessionSchema>;

const InvoiceSchema = z.object({
    id: z.string(),
    type: z.string(),
    docNumber: z.string(),
    sessionId: z.string().nullable().optional(),
    paymentId: z.string().nullable().optional(),
    recipientType: z.string(),
    recipientId: z.number(),
    /** Paise. */
    totalPaise: z.number().nullable().optional(),
    /** Alias of totalPaise (server maps it). */
    total: z.number().nullable().optional(),
    title: z.string().nullable().optional(),
    status: z.string().nullable().optional(),
    currency: z.string().nullable().optional(),
    pdfStatus: z.enum(['pending', 'generated', 'failed']).nullable().optional(),
    generatedAt: z.string().optional(),
    createdAt: z.string(),
});
export type Invoice = z.infer<typeof InvoiceSchema>;

const InvoiceDownloadSchema = z.object({
    downloadUrl: z.string().nullable(),
    pdfStatus: z.enum(['pending', 'generated', 'failed']),
    pdfFailureReason: z.string().nullable().optional(),
});
export type InvoiceDownload = z.infer<typeof InvoiceDownloadSchema>;

const RefundSchema = z.object({
    id: z.string(),
    sessionId: z.string().nullable().optional(),
    paymentId: z.string().nullable().optional(),
    /** Paise. */
    amount: z.number(),
    status: z.string(),
    createdAt: z.string(),
});
export type Refund = z.infer<typeof RefundSchema>;

const DisputeSchema = z.object({
    id: z.string(),
    paymentId: z.string().nullable().optional(),
    sessionId: z.string().nullable().optional(),
    /** Paise. */
    amount: z.number().optional(),
    status: z.string(),
    respondBy: z.string().nullable().optional(),
    createdAt: z.string(),
});
export type Dispute = z.infer<typeof DisputeSchema>;

const LedgerEntrySchema = z.object({
    id: z.string(),
    category: z.enum(['debit', 'credit']),
    account: z.string().optional(),
    entryType: z.string().optional(),
    /** Paise. */
    amount: z.number(),
    sessionId: z.string().nullable().optional(),
    therapistId: z.union([z.number(), z.string()]).nullable().optional(),
    clientId: z.union([z.number(), z.string()]).nullable().optional(),
    balanceAfter: z.number().nullable().optional(),
    createdAt: z.string(),
});
export type LedgerEntry = z.infer<typeof LedgerEntrySchema>;

const PayoutSchema = z.object({
    id: z.string(),
    therapistId: z.union([z.number(), z.string()]),
    batchId: z.string().nullable().optional(),
    /** Paise. */
    amount: z.number().optional(),
    netAmount: z.number().optional(),
    status: z.string(),
    utr: z.string().nullable().optional(),
    createdAt: z.string(),
});
export type Payout = z.infer<typeof PayoutSchema>;

const PayoutBatchSchema = z.object({
    id: z.string(),
    periodStart: z.string().optional(),
    periodEnd: z.string().optional(),
    status: z.string(),
    createdAt: z.string(),
});
export type PayoutBatch = z.infer<typeof PayoutBatchSchema>;

// ─── Wallet ───────────────────────────────────────────────────────────────────

export function getMyWalletBalance(): Promise<WalletBalance> {
    return bGet('/billing/wallet/balance', WalletBalanceSchema);
}

export function getClientWallet(clientId: number | string): Promise<WalletBalance> {
    return bGet(`/billing/clients/${clientId}/wallet`, WalletBalanceSchema);
}

export function getClientWalletTransactions(clientId: number | string): Promise<unknown[]> {
    return bGet(`/billing/clients/${clientId}/wallet/transactions`, z.array(z.unknown()));
}

// ─── Payments & sessions ──────────────────────────────────────────────────────

export function listPayments(): Promise<Payment[]> {
    return bGet('/billing/payments', z.array(PaymentSchema));
}

export function listBillingSessions(query?: {
    clientId?: string | number; therapistId?: string | number; status?: string;
}): Promise<BillingSession[]> {
    return bGet(withQuery('/billing/sessions', query as Record<string, string | number | undefined>), z.array(BillingSessionSchema));
}

export function getBillingSession(appointmentId: string | number): Promise<BillingSession> {
    return bGet(`/billing/sessions/${appointmentId}`, BillingSessionSchema);
}

// ─── Invoices ─────────────────────────────────────────────────────────────────

export function listInvoices(query?: {
    recipientId?: number | string; recipientType?: string; type?: string;
    sessionId?: string; limit?: number;
}): Promise<Invoice[]> {
    return bGet(withQuery('/billing/invoices', query as Record<string, string | number | undefined>), z.array(InvoiceSchema));
}

export function getInvoice(invoiceId: string): Promise<Invoice> {
    return bGet(`/billing/invoices/${invoiceId}`, InvoiceSchema);
}

/** Fresh 1-hour presigned S3 URL; every call is access-logged (DPDP). */
export function getInvoiceDownload(invoiceId: string): Promise<InvoiceDownload> {
    return bGet(`/billing/invoices/${invoiceId}/download`, InvoiceDownloadSchema);
}

// ─── Finance (admin) ──────────────────────────────────────────────────────────

export function listRefunds(): Promise<Refund[]> {
    return bGet('/billing/refunds', z.array(RefundSchema));
}

export function listDisputes(): Promise<Dispute[]> {
    return bGet('/billing/disputes', z.array(DisputeSchema));
}

export function getDisputeRateCheck(): Promise<{ status: string;[k: string]: unknown }> {
    return bGet('/billing/disputes/rate-check', z.object({ status: z.string() }).catchall(z.unknown()));
}

export function listLedger(query?: {
    clientId?: string | number; therapistId?: string | number; sessionId?: string;
}): Promise<LedgerEntry[]> {
    return bGet(withQuery('/billing/ledger', query as Record<string, string | number | undefined>), z.array(LedgerEntrySchema));
}

// ─── Payouts (admin) ──────────────────────────────────────────────────────────

export function listPayouts(): Promise<Payout[]> {
    return bGet('/billing/payouts', z.array(PayoutSchema));
}

export function listPayoutBatches(): Promise<PayoutBatch[]> {
    return bGet('/billing/payouts/batches', z.array(PayoutBatchSchema));
}

export function createPayoutBatch(endDate?: string): Promise<PayoutBatch> {
    return bPost('/billing/payouts/batches', PayoutBatchSchema, endDate ? { endDate } : {});
}

export function processPayoutBatch(batchId: string): Promise<PayoutBatch> {
    return bPost(`/billing/payouts/batches/${batchId}/process`, PayoutBatchSchema);
}

// ─── Config (admin) ───────────────────────────────────────────────────────────

export function listBillingConfig(): Promise<Record<string, unknown>> {
    return bGet('/billing/admin/billing-config', z.record(z.string(), z.unknown()));
}
