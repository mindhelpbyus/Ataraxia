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
 */

import { apiRequest } from './client';
import { getCurrentSession } from '../lib/cognito';

// ─── Transport ────────────────────────────────────────────────────────────────

async function billingHeaders(mutating: boolean): Promise<Record<string, string>> {
    const session = await getCurrentSession();
    const headers: Record<string, string> = {};
    if (session?.idToken) headers['Authorization'] = `Bearer ${session.idToken}`;
    if (mutating) headers['Idempotency-Key'] = crypto.randomUUID();
    return headers;
}

async function bGet<T>(path: string): Promise<T> {
    return apiRequest<T>(path, { headers: await billingHeaders(false) });
}

async function bPost<T>(path: string, body?: unknown): Promise<T> {
    return apiRequest<T>(path, { method: 'POST', body, headers: await billingHeaders(true) });
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

// ─── Types (fields per billing_payment pgStore/Prisma shapes) ────────────────

export interface WalletBalance {
    clientId: number;
    /** Paise. */
    walletBalance: number;
    currency: string;
}

export interface Payment {
    id: string;
    sessionId?: string | null;
    razorpayPaymentId?: string | null;
    /** Paise. */
    amount: number;
    currency?: string;
    status: string;
    settlementState?: string | null;
    capturedAt?: string | null;
    createdAt: string;
}

export interface BillingSession {
    id: string;
    appointmentId?: number | string | null;
    clientId: number | string;
    therapistId: number | string;
    /** Paise. */
    feeAmount: number;
    currency?: string;
    status: string;
    payoutState?: string;
    settlementState?: string;
    disputeState?: string;
    refundState?: string;
    startsAt?: string;
    createdAt: string;
}

export interface Invoice {
    id: string;
    type: string;
    docNumber: string;
    sessionId?: string | null;
    paymentId?: string | null;
    recipientType: string;
    recipientId: number;
    /** Paise. */
    totalPaise?: number | null;
    /** Alias of totalPaise (server maps it). */
    total?: number | null;
    title?: string | null;
    status?: string | null;
    currency?: string | null;
    pdfStatus?: 'pending' | 'generated' | 'failed' | null;
    generatedAt?: string;
    createdAt: string;
}

export interface InvoiceDownload {
    downloadUrl: string | null;
    pdfStatus: 'pending' | 'generated' | 'failed';
    pdfFailureReason?: string | null;
}

export interface Refund {
    id: string;
    sessionId?: string | null;
    paymentId?: string | null;
    /** Paise. */
    amount: number;
    status: string;
    createdAt: string;
}

export interface Dispute {
    id: string;
    paymentId?: string | null;
    sessionId?: string | null;
    /** Paise. */
    amount?: number;
    status: string;
    respondBy?: string | null;
    createdAt: string;
}

export interface LedgerEntry {
    id: string;
    category: 'debit' | 'credit';
    account?: string;
    entryType?: string;
    /** Paise. */
    amount: number;
    sessionId?: string | null;
    therapistId?: number | string | null;
    clientId?: number | string | null;
    balanceAfter?: number | null;
    createdAt: string;
}

export interface Payout {
    id: string;
    therapistId: number | string;
    batchId?: string | null;
    /** Paise. */
    amount?: number;
    netAmount?: number;
    status: string;
    utr?: string | null;
    createdAt: string;
}

export interface PayoutBatch {
    id: string;
    periodStart?: string;
    periodEnd?: string;
    status: string;
    createdAt: string;
}

// ─── Wallet ───────────────────────────────────────────────────────────────────

export function getMyWalletBalance(): Promise<WalletBalance> {
    return bGet<WalletBalance>('/billing/wallet/balance');
}

export function getClientWallet(clientId: number | string): Promise<WalletBalance> {
    return bGet<WalletBalance>(`/billing/clients/${clientId}/wallet`);
}

export function getClientWalletTransactions(clientId: number | string): Promise<unknown[]> {
    return bGet<unknown[]>(`/billing/clients/${clientId}/wallet/transactions`);
}

// ─── Payments & sessions ──────────────────────────────────────────────────────

export function listPayments(): Promise<Payment[]> {
    return bGet<Payment[]>('/billing/payments');
}

export function listBillingSessions(query?: {
    clientId?: string | number; therapistId?: string | number; status?: string;
}): Promise<BillingSession[]> {
    return bGet<BillingSession[]>(withQuery('/billing/sessions', query as Record<string, string | number | undefined>));
}

export function getBillingSession(appointmentId: string | number): Promise<BillingSession> {
    return bGet<BillingSession>(`/billing/sessions/${appointmentId}`);
}

// ─── Invoices ─────────────────────────────────────────────────────────────────

export function listInvoices(query?: {
    recipientId?: number | string; recipientType?: string; type?: string;
    sessionId?: string; limit?: number;
}): Promise<Invoice[]> {
    return bGet<Invoice[]>(withQuery('/billing/invoices', query as Record<string, string | number | undefined>));
}

export function getInvoice(invoiceId: string): Promise<Invoice> {
    return bGet<Invoice>(`/billing/invoices/${invoiceId}`);
}

/** Fresh 1-hour presigned S3 URL; every call is access-logged (DPDP). */
export function getInvoiceDownload(invoiceId: string): Promise<InvoiceDownload> {
    return bGet<InvoiceDownload>(`/billing/invoices/${invoiceId}/download`);
}

// ─── Finance (admin) ──────────────────────────────────────────────────────────

export function listRefunds(): Promise<Refund[]> {
    return bGet<Refund[]>('/billing/refunds');
}

export function listDisputes(): Promise<Dispute[]> {
    return bGet<Dispute[]>('/billing/disputes');
}

export function getDisputeRateCheck(): Promise<{ status: string;[k: string]: unknown }> {
    return bGet<{ status: string }>('/billing/disputes/rate-check');
}

export function listLedger(query?: {
    clientId?: string | number; therapistId?: string | number; sessionId?: string;
}): Promise<LedgerEntry[]> {
    return bGet<LedgerEntry[]>(withQuery('/billing/ledger', query as Record<string, string | number | undefined>));
}

// ─── Payouts (admin) ──────────────────────────────────────────────────────────

export function listPayouts(): Promise<Payout[]> {
    return bGet<Payout[]>('/billing/payouts');
}

export function listPayoutBatches(): Promise<PayoutBatch[]> {
    return bGet<PayoutBatch[]>('/billing/payouts/batches');
}

export function createPayoutBatch(endDate?: string): Promise<PayoutBatch> {
    return bPost<PayoutBatch>('/billing/payouts/batches', endDate ? { endDate } : {});
}

export function processPayoutBatch(batchId: string): Promise<PayoutBatch> {
    return bPost<PayoutBatch>(`/billing/payouts/batches/${batchId}/process`);
}

// ─── Config (admin) ───────────────────────────────────────────────────────────

export function listBillingConfig(): Promise<Record<string, unknown>> {
    return bGet<Record<string, unknown>>('/billing/admin/billing-config');
}
