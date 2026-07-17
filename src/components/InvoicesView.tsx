/**
 * InvoicesView — real RBI-numbered invoices from billing_payment
 * (GET /billing/invoices). Every value rendered comes from the Invoice record:
 * docNumber is the gapless RBI sequence, totals are paise, PDFs are 1-hour
 * presigned S3 URLs (each download is access-logged for DPDP).
 */
import { useEffect, useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { FileText, IndianRupee, Clock, Download, Loader2 } from 'lucide-react';
import { listInvoices, getInvoiceDownload, type Invoice } from '../api/billing';
import { get } from '../api/client';
import { UserRole } from '../types/appointment';
import { toast } from 'sonner';

interface InvoicesViewProps {
  userRole: UserRole;
  currentUserId: string;
}

const paiseToRupees = (paise: number | null | undefined) =>
  `₹${((paise ?? 0) / 100).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

const TYPE_LABELS: Record<string, string> = {
  session: 'Session invoice',
  credit_note: 'Credit note',
  receipt: 'Payment receipt',
  payout_statement: 'Payout statement',
  payout_batch: 'Payout statement',
  dispute_statement: 'Dispute statement',
  settlement_statement: 'Settlement statement',
};

function StatusBadge({ invoice }: { invoice: Invoice }) {
  const status = invoice.status ?? 'issued';
  if (status === 'paid') return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200">Paid</Badge>;
  if (status === 'issued') return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200">Issued</Badge>;
  if (status === 'cancelled') return <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-200">Cancelled</Badge>;
  return <Badge variant="outline">{status}</Badge>;
}

export function InvoicesView({ userRole, currentUserId }: InvoicesViewProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // Admin sees all; therapist/client see their own documents.
        //
        // billing_payment's recipientId is the numeric DB User.id, but
        // currentUserId here is the Cognito sub (a UUID) — the frontend's
        // user model is keyed on the JWT subject everywhere else. Resolve
        // the real numeric id first (same pattern as GET /therapists/me)
        // instead of sending the UUID straight through, which billing_payment
        // rejects with a Postgres integer-cast 500.
        let query: { limit: number; recipientId?: number };
        if (userRole === 'admin' || userRole === 'superadmin') {
          query = { limit: 200 };
        } else if (userRole === 'therapist') {
          const me = await get<{ id: number }>('/therapists/me');
          query = { recipientId: me.id, limit: 200 };
        } else {
          const me = await get<{ id: number }>(`/clients/by-cognito-id/${currentUserId}`);
          query = { recipientId: me.id, limit: 200 };
        }
        const data = await listInvoices(query);
        setInvoices(Array.isArray(data) ? data : []);
        setLoadError(null);
      } catch (err) {
        console.error('Failed to load invoices', err);
        setLoadError('Could not load invoices. The billing service may be unreachable.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userRole, currentUserId]);

  const handleDownload = async (invoice: Invoice) => {
    setDownloadingId(invoice.id);
    try {
      const res = await getInvoiceDownload(invoice.id);
      if (res.downloadUrl) {
        window.open(res.downloadUrl, '_blank', 'noopener,noreferrer');
      } else if (res.pdfStatus === 'pending') {
        toast.info('PDF is still being generated — try again in a minute.');
      } else {
        toast.error(`PDF unavailable (${res.pdfStatus})${res.pdfFailureReason ? `: ${res.pdfFailureReason}` : ''}`);
      }
    } catch {
      toast.error('Could not fetch the download link.');
    } finally {
      setDownloadingId(null);
    }
  };

  const totalPaise = invoices.reduce((acc, i) => acc + (i.totalPaise ?? i.total ?? 0), 0);
  const paidPaise = invoices
    .filter(i => (i.status ?? '') === 'paid')
    .reduce((acc, i) => acc + (i.totalPaise ?? i.total ?? 0), 0);

  return (
    <div className="space-y-6">
      {/* ── Summary cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Documents', value: String(invoices.length), icon: FileText, iconBg: 'bg-blue-50', iconColor: 'text-blue-500', valueColor: 'text-slate-900' },
          { label: 'Total invoiced', value: paiseToRupees(totalPaise), icon: IndianRupee, iconBg: 'bg-emerald-50', iconColor: 'text-emerald-500', valueColor: 'text-emerald-600' },
          { label: 'Marked paid', value: paiseToRupees(paidPaise), icon: Clock, iconBg: 'bg-amber-50', iconColor: 'text-amber-500', valueColor: 'text-amber-600' },
        ].map(({ label, value, icon: Icon, iconBg, iconColor, valueColor }) => (
          <Card key={label} className="border-slate-100 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">{label}</p>
                  <h3 className={`text-2xl font-bold mt-1 ${valueColor}`}>{value}</h3>
                </div>
                <div className={`rounded-xl p-3 ${iconBg}`}>
                  <Icon className={`h-5 w-5 ${iconColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Invoice table ── */}
      <Card className="border-slate-100 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document №</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">PDF</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-slate-400">
                    <Loader2 className="h-5 w-5 animate-spin inline mr-2" /> Loading invoices…
                  </TableCell>
                </TableRow>
              )}
              {!loading && loadError && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-rose-600">{loadError}</TableCell>
                </TableRow>
              )}
              {!loading && !loadError && invoices.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-slate-400">
                    No invoices yet — documents appear here after the first payment.
                  </TableCell>
                </TableRow>
              )}
              {!loading && invoices.map(invoice => (
                <TableRow key={invoice.id} className="hover:bg-slate-50">
                  <TableCell className="font-mono text-sm font-medium">{invoice.docNumber}</TableCell>
                  <TableCell className="text-sm">{TYPE_LABELS[invoice.type] ?? invoice.type}</TableCell>
                  <TableCell className="text-sm text-slate-600">{invoice.title ?? '—'}</TableCell>
                  <TableCell className="font-medium">{paiseToRupees(invoice.totalPaise ?? invoice.total)}</TableCell>
                  <TableCell><StatusBadge invoice={invoice} /></TableCell>
                  <TableCell className="text-sm text-slate-500">
                    {new Date(invoice.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={downloadingId === invoice.id || invoice.pdfStatus === 'failed'}
                      onClick={() => handleDownload(invoice)}
                      className="text-indigo-600 hover:text-indigo-700"
                    >
                      {downloadingId === invoice.id
                        ? <Loader2 className="h-4 w-4 animate-spin" />
                        : <Download className="h-4 w-4" />}
                    </Button>
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
