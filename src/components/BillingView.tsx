/**
 * BillingView — wallet + payments from billing_payment, all real:
 *   billing tab  → wallet balance (client) + recent billing sessions
 *   payments tab → captured payments list (GET /billing/payments)
 *   plans tab    → honest statement of marketplace pricing (no fake SaaS tiers)
 * Money is paise everywhere; rendered as ₹.
 */
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Wallet, CreditCard, IndianRupee, Loader2 } from 'lucide-react';
import {
  getMyWalletBalance,
  listPayments,
  listBillingSessions,
  type WalletBalance,
  type Payment,
  type BillingSession,
} from '../api/billing';
import { UserRole } from '../types/appointment';

interface BillingViewProps {
  userRole: UserRole;
  currentUserId: string;
  tab: 'billing' | 'payments' | 'plans';
}

const paiseToRupees = (paise: number | null | undefined) =>
  `₹${((paise ?? 0) / 100).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

function PaymentStatusBadge({ status }: { status: string }) {
  if (status === 'captured') return <Badge className="bg-action-light text-action-dark">Captured</Badge>;
  if (status === 'authorized') return <Badge className="bg-info/15 text-info-foreground">Authorized</Badge>;
  if (status === 'failed') return <Badge className="bg-danger-light text-danger">Failed</Badge>;
  return <Badge variant="outline">{status}</Badge>;
}

export function BillingView({ userRole, currentUserId, tab }: BillingViewProps) {
  const [wallet, setWallet] = useState<WalletBalance | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [sessions, setSessions] = useState<BillingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        if (tab === 'payments') {
          setPayments(await listPayments());
        } else if (tab === 'billing') {
          const [walletRes, sessionsRes] = await Promise.all([
            userRole === 'client' ? getMyWalletBalance().catch(() => null) : Promise.resolve(null),
            userRole === 'therapist'
              ? listBillingSessions({ therapistId: currentUserId })
              : userRole === 'client'
                ? listBillingSessions({ clientId: currentUserId })
                : listBillingSessions(),
          ]);
          setWallet(walletRes);
          setSessions(sessionsRes);
        }
        setLoadError(null);
      } catch (err) {
        console.error('Failed to load billing data', err);
        setLoadError('Could not load billing data. The billing service may be unreachable.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [userRole, currentUserId, tab]);

  // ── Plans tab — honest: marketplace pricing, not seat-based SaaS ────────────
  if (tab === 'plans') {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight mb-6">Pricing</h2>
        <Card className="border-rule shadow-sm max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IndianRupee className="h-5 w-5 text-action" /> Per-session marketplace pricing
            </CardTitle>
            <CardDescription>
              There are no subscription tiers. Clients pay per session (Razorpay); therapists
              receive automated payouts with TDS handled for them; the platform takes a
              commission set in billing configuration. Session fees are set by each therapist
              in Settings → Services.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-dim">
        <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading billing…
      </div>
    );
  }

  if (loadError) {
    return <p className="py-10 text-center text-danger">{loadError}</p>;
  }

  // ── Payments tab ────────────────────────────────────────────────────────────
  if (tab === 'payments') {
    return (
      <div className="space-y-6">
        <Card className="border-rule shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-action" /> Payments
            </CardTitle>
            <CardDescription>Captured and authorized Razorpay payments</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Payment</TableHead>
                  <TableHead>Session</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Settlement</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-dim">
                      No payments recorded yet.
                    </TableCell>
                  </TableRow>
                )}
                {payments.map(p => (
                  <TableRow key={p.id} className="hover:bg-surface-warm">
                    <TableCell className="font-mono text-xs">{p.razorpayPaymentId ?? p.id}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-text">{p.sessionId ?? '—'}</TableCell>
                    <TableCell className="font-medium">{paiseToRupees(p.amount)}</TableCell>
                    <TableCell><PaymentStatusBadge status={p.status} /></TableCell>
                    <TableCell className="text-sm text-muted-text">{p.settlementState ?? '—'}</TableCell>
                    <TableCell className="text-sm text-muted-text">
                      {new Date(p.capturedAt ?? p.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Billing tab (default) ───────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {wallet && (
        <Card className="border-rule shadow-sm max-w-md">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-text">Wallet balance</p>
              <h3 className="text-3xl font-bold text-ink mt-1">{paiseToRupees(wallet.walletBalance)}</h3>
            </div>
            <div className="rounded-xl p-3 bg-action-light">
              <Wallet className="h-6 w-6 text-action" />
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-rule shadow-sm">
        <CardHeader>
          <CardTitle>Billing sessions</CardTitle>
          <CardDescription>Each therapy session's billing state (payment · payout · settlement)</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Session</TableHead>
                <TableHead>Fee</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payout</TableHead>
                <TableHead>Settlement</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-dim">
                    No billing sessions yet.
                  </TableCell>
                </TableRow>
              )}
              {sessions.map(s => (
                <TableRow key={s.id} className="hover:bg-surface-warm">
                  <TableCell className="font-mono text-xs">{s.id}</TableCell>
                  <TableCell className="font-medium">{paiseToRupees(s.feeAmount)}</TableCell>
                  <TableCell><Badge variant="outline">{s.status}</Badge></TableCell>
                  <TableCell className="text-sm text-muted-text">{s.payoutState ?? '—'}</TableCell>
                  <TableCell className="text-sm text-muted-text">{s.settlementState ?? '—'}</TableCell>
                  <TableCell className="text-sm text-muted-text">
                    {new Date(s.startsAt ?? s.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
