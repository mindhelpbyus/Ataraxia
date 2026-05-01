import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { CreditCard, Wallet, Calendar, ShieldCheck, CheckCircle2, FileSearch, X } from 'lucide-react';
import { USE_LOCAL_DB } from '../lib/apiSwitch';
import { localDb } from '../lib/db/localDb';
import { UserRole } from '../types/appointment';
import { Dialog, DialogContent, DialogTitle, DialogHeader } from './ui/dialog';
import { TherapyInvoice, InvoiceData } from './TherapyInvoice';

interface BillingViewProps {
  userRole: UserRole;
  currentUserId: string;
  tab: 'billing' | 'payments' | 'plans';
}

export function BillingView({ userRole, currentUserId, tab }: BillingViewProps) {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);

  const getInvoiceData = (inv: any): InvoiceData => ({
    invoiceNumber: `INV-2026-${inv.id.split('-')[0].toUpperCase()}`,
    issuedDate: new Date(
      new Date(inv.paidAt || inv.createdAt).getTime() - 86400000 * 5
    ).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    dueDate: new Date(inv.paidAt || inv.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    status: inv.status === 'paid' ? 'Paid' : inv.status || 'Paid',
    razorpayPaymentId: `pay_${Math.random().toString(36).substr(2, 10).toUpperCase()}`,
    razorpayOrderId: `order_${Math.random().toString(36).substr(2, 10).toUpperCase()}`,
    organization: {
      name: 'Ataraxia Health',
      tagline: 'Mental wellness platform',
      email: 'billing@ataraxia.health',
      gstin: '27AABCA1234C1Z5',
      website: 'ataraxia.health',
    },
    client: {
      name: inv.clientName || 'Valued Client',
      email: inv.clientEmail || 'client@example.com',
      phone: inv.clientPhone || '+1 555-0100',
      initials: (inv.clientName || 'VC').substring(0, 2).toUpperCase(),
    },
    therapist: {
      name: inv.therapistName || 'Dr. Sarah Jenkins',
      credentials: inv.therapistCredentials || 'PhD, LMFT',
      clinic: inv.organizationId ? 'Ataraxia Clinic' : 'Independent Practice',
      email: inv.therapistEmail || 'billing@ataraxia.com',
      license: inv.therapistLicense,
    },
    session: inv.sessionDate
      ? {
        type: inv.description || 'Individual Therapy Session',
        modality: inv.modality || 'Video Call (50 min)',
        date: new Date(inv.sessionDate).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        time: inv.sessionTime || '—',
        sessionNo: inv.sessionNumber || 1,
      }
      : undefined,
    lineItems: [
      {
        description: inv.description || 'Therapy Session',
        qty: 1,
        rate: inv.amount,
        amount: inv.amount,
      },
    ],
    tax: { label: 'Tax (0%)', rate: 0 },
    discount: 0,
    currency: '$',
  });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        if (USE_LOCAL_DB) {
          let userSubs = await localDb.subscriptions.findMany();
          let userInvoices = await localDb.invoices.findMany();

          if (userRole === 'admin' || userRole === 'org_admin') {
            const user = (await localDb.users.findMany((u: any) => u.id === currentUserId))[0];
            if (user?.organizationId) {
              userSubs = userSubs.filter((s: any) => s.organizationId === user.organizationId);
              userInvoices = userInvoices.filter(
                (i: any) => i.organizationId === user.organizationId && i.status === 'paid'
              );
            }
          } else if (userRole === 'therapist') {
            userSubs = userSubs.filter((s: any) => s.userId === currentUserId);
            const therapist = (
              await localDb.therapists.findMany((t: any) => t.userId === currentUserId)
            )[0];
            userInvoices = therapist
              ? (await localDb.getTherapistInvoices(therapist.id)).filter(
                (i: any) => i.status === 'paid'
              )
              : [];
          } else if (userRole === 'client') {
            userSubs = [];
            userInvoices = userInvoices.filter(
              (i: any) => i.userId === currentUserId && i.status === 'paid'
            );
          }

          setSubscriptions(userSubs);
          setPayments(userInvoices);
        }
      } catch (err) {
        console.error('Failed to load billing data', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [userRole, currentUserId, tab]);

  // ── Plans tab ──────────────────────────────────────────────────────────────
  if (tab === 'plans') {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight mb-6">Available plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              name: 'Starter',
              desc: 'Perfect for solo practitioners',
              price: '$79',
              features: ['Up to 50 clients', 'Basic telehealth', 'HIPAA compliant'],
              action: 'Current plan',
              variant: 'outline' as const,
              highlight: false,
            },
            {
              name: 'Professional',
              desc: 'For growing practices',
              price: '$149',
              features: ['Unlimited clients', 'Premium telehealth', 'Advanced reporting'],
              action: 'Upgrade',
              variant: 'default' as const,
              highlight: true,
            },
            {
              name: 'Enterprise',
              desc: 'For large organizations',
              price: '$399',
              features: ['Multiple locations', 'API access', 'Dedicated account manager'],
              action: 'Contact sales',
              variant: 'outline' as const,
              highlight: false,
            },
          ].map((plan) => (
            <Card
              key={plan.name}
              className={`relative overflow-hidden ${plan.highlight
                  ? 'border-indigo-200 bg-indigo-50/30 shadow-md'
                  : 'border-slate-200'
                }`}
            >
              {plan.highlight && (
                <div className="absolute top-0 right-0 bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                  POPULAR
                </div>
              )}
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.desc}</CardDescription>
                <h3 className="text-3xl font-bold mt-4">
                  {plan.price}
                  <span className="text-sm font-normal text-slate-500">/mo</span>
                </h3>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  className={`w-full ${plan.highlight ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : ''
                    }`}
                  variant={plan.highlight ? 'default' : 'outline'}
                >
                  {plan.action}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // ── Payments tab ───────────────────────────────────────────────────────────
  if (tab === 'payments') {
    return (
      <>
        <Card className="border-slate-100 shadow-sm">
          <CardHeader>
            <CardTitle>Payment history</CardTitle>
            <CardDescription>Record of all completed transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Invoice</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-slate-400">
                      Loading payments…
                    </TableCell>
                  </TableRow>
                ) : payments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                      No payment history found
                    </TableCell>
                  </TableRow>
                ) : (
                  payments.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-mono text-xs">{p.id.toUpperCase()}</TableCell>
                      <TableCell>
                        {new Date(p.paidAt || p.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{p.description || 'Service payment'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-slate-400" />
                          <span className="text-sm">
                            ••••{p.id.slice(-4).replace(/\D/g, '4').padEnd(4, '2')}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-emerald-600">
                        ${p.amount.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedInvoice(p)}
                        >
                          <FileSearch className="w-4 h-4 text-indigo-500 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* ── Invoice Dialog ── */}
        <Dialog open={!!selectedInvoice} onOpenChange={(open) => !open && setSelectedInvoice(null)}>
          <DialogContent
            className="p-0 border-none bg-transparent shadow-none"
            style={{
              maxWidth: 780,
              width: '95vw',
              maxHeight: '92vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Accessible title (visually hidden) */}
            <DialogHeader className="sr-only">
              <DialogTitle>Invoice</DialogTitle>
            </DialogHeader>

            {/* Scrollable invoice area */}
            <div style={{ flex: 1, overflowY: 'auto', borderRadius: 16 }}>
              {selectedInvoice && (
                <TherapyInvoice invoiceData={getInvoiceData(selectedInvoice)} compact />
              )}
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // ── Billing overview (default) ─────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-slate-100 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-500" />
              Current subscription
            </CardTitle>
          </CardHeader>
          <CardContent>
            {subscriptions.length > 0 ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b">
                  <div>
                    <p className="text-sm text-slate-500 uppercase tracking-wider font-semibold">
                      Plan
                    </p>
                    <p className="text-2xl font-bold capitalize mt-1">
                      {subscriptions[0].plan}
                    </p>
                  </div>
                  <Badge
                    className={
                      subscriptions[0].status === 'active'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100 text-amber-700'
                    }
                  >
                    {subscriptions[0].status.toUpperCase()}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-slate-500">Next billing date</p>
                    <p className="font-medium flex items-center gap-2 mt-1">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      {new Date(
                        subscriptions[0].nextBillingDate || new Date()
                      ).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-500">Amount</p>
                    <p className="font-bold text-lg">
                      ${subscriptions[0].amount} / {subscriptions[0].billingCycle}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-500">
                No active subscription found.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-100 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-indigo-500" />
              Payment methods
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-xl border-indigo-200 bg-indigo-50/30">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-8 bg-slate-800 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold italic">VISA</span>
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Visa ending in 4242</p>
                    <p className="text-xs text-slate-500">Expires 12/2026</p>
                  </div>
                </div>
                <Badge variant="outline" className="border-indigo-200 text-indigo-700">
                  Default
                </Badge>
              </div>
              <Button variant="outline" className="w-full border-dashed">
                + Add payment method
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}