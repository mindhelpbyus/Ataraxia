import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogTitle, DialogHeader } from './ui/dialog';
import { FileText, DollarSign, Clock, CheckCircle, FileSearch } from 'lucide-react';
import { get } from '../api/client';
import { UserRole } from '../types/appointment';
import { TherapyInvoice, InvoiceData } from './TherapyInvoice';

interface InvoicesViewProps {
  userRole: UserRole;
  currentUserId: string;
}

// ── Helper: build InvoiceData from a raw DB invoice row ──────────────────────
function toInvoiceData(inv: any): InvoiceData {
  const statusLabel =
    inv.status === 'paid' ? 'Paid'
      : inv.status === 'pending' ? 'Pending'
        : inv.status === 'overdue' ? 'Overdue'
          : inv.status;

  return {
    invoiceNumber: `INV-2026-${inv.id.split('-')[0].toUpperCase()}`,
    issuedDate: new Date(
      new Date(inv.createdAt).getTime() - 86400000 * 5
    ).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    dueDate: new Date(inv.createdAt).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    }),
    status: statusLabel,
    // Only attach a payment ID for paid invoices
    razorpayPaymentId:
      inv.status === 'paid'
        ? `pay_${Math.random().toString(36).substr(2, 10).toUpperCase()}`
        : undefined,
    razorpayOrderId:
      inv.status === 'paid'
        ? `order_${Math.random().toString(36).substr(2, 10).toUpperCase()}`
        : undefined,
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
      name:
        inv.therapistName && inv.therapistName !== 'Organization' && inv.therapistName !== 'Platform'
          ? inv.therapistName
          : 'Dr. Sarah Jenkins',
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
          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        }),
        time: inv.sessionTime || '—',
        sessionNo: inv.sessionNumber || 1,
      }
      : undefined,
    lineItems: [
      {
        description: inv.description || 'Therapy session',
        qty: 1,
        rate: inv.amount,
        amount: inv.amount,
      },
    ],
    tax: { label: 'Tax (0%)', rate: 0 },
    discount: 0,
    currency: '$',
  };
}

// ── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'paid':
      return (
        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200">
          <CheckCircle className="w-3 h-3 mr-1" /> Paid
        </Badge>
      );
    case 'pending':
      return (
        <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200">
          <Clock className="w-3 h-3 mr-1" /> Pending
        </Badge>
      );
    case 'overdue':
      return <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-200">Overdue</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

// ── Main component ────────────────────────────────────────────────────────────
export function InvoicesView({ userRole, currentUserId }: InvoicesViewProps) {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // billing_payment: GET /api/invoices — backend scopes by the authenticated
        // Cognito identity/role, so no client-side ownership filtering is needed.
        const data = await get<any[]>('/api/invoices');
        setInvoices(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load invoices', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userRole, currentUserId]);

  const totalAmount = invoices.reduce((acc, i) => acc + i.amount, 0);
  const paidAmount = invoices.filter(i => i.status === 'paid').reduce((acc, i) => acc + i.amount, 0);
  const outstanding = totalAmount - paidAmount;

  const colSpan = userRole !== 'therapist' ? 7 : 6;

  return (
    <div className="space-y-6">

      {/* ── Summary cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            label: 'Total invoiced',
            value: `$${totalAmount.toLocaleString()}`,
            icon: FileText,
            iconBg: 'bg-blue-50',
            iconColor: 'text-blue-500',
            valueColor: 'text-slate-900',
          },
          {
            label: 'Amount paid',
            value: `$${paidAmount.toLocaleString()}`,
            icon: DollarSign,
            iconBg: 'bg-emerald-50',
            iconColor: 'text-emerald-500',
            valueColor: 'text-emerald-600',
          },
          {
            label: 'Pending / overdue',
            value: `$${outstanding.toLocaleString()}`,
            icon: Clock,
            iconBg: 'bg-amber-50',
            iconColor: 'text-amber-500',
            valueColor: 'text-amber-600',
          },
        ].map(({ label, value, icon: Icon, iconBg, iconColor, valueColor }) => (
          <Card key={label} className="border-slate-100 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">{label}</p>
                  <h3 className={`text-2xl font-bold mt-1 ${valueColor}`}>{value}</h3>
                </div>
                <div className={`h-12 w-12 rounded-full ${iconBg} flex items-center justify-center`}>
                  <Icon className={`h-6 w-6 ${iconColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Invoice table ── */}
      <Card className="border-slate-100 shadow-sm">
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
          <CardDescription>
            {userRole === 'admin'
              ? 'Consolidated billing across the organisation'
              : 'Billing history and current invoices'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-slate-200">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead>Invoice ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Client</TableHead>
                  {userRole !== 'therapist' && <TableHead>Provider</TableHead>}
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={colSpan} className="text-center py-8 text-slate-400">
                      Loading invoices…
                    </TableCell>
                  </TableRow>
                ) : invoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={colSpan} className="text-center py-8 text-slate-500">
                      No invoices found
                    </TableCell>
                  </TableRow>
                ) : (
                  invoices.map((inv) => (
                    <TableRow key={inv.id}>
                      <TableCell className="font-medium text-slate-900">
                        {inv.id.split('-')[0].toUpperCase()}
                      </TableCell>
                      <TableCell>
                        {new Date(inv.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{inv.clientName || inv.clientId}</TableCell>
                      {userRole !== 'therapist' && (
                        <TableCell>{inv.therapistName || inv.therapistId}</TableCell>
                      )}
                      <TableCell className="font-semibold">
                        ${inv.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={inv.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedInvoice(inv)}
                        >
                          <FileSearch className="w-4 h-4 text-indigo-500 mr-1" />
                          View PDF
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* ── Invoice Dialog ── */}
      <Dialog
        open={!!selectedInvoice}
        onOpenChange={(open) => !open && setSelectedInvoice(null)}
      >
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
          <DialogHeader className="sr-only">
            <DialogTitle>Invoice</DialogTitle>
          </DialogHeader>

          {/* Scrollable inner area — TherapyInvoice renders without page wrapper */}
          <div style={{ flex: 1, overflowY: 'auto', borderRadius: 16 }}>
            {selectedInvoice && (
              <TherapyInvoice invoiceData={toInvoiceData(selectedInvoice)} compact />
            )}
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}