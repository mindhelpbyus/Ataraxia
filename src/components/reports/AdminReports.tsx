/**
 * AdminReports — practice-wide operations report, computed from real
 * /admin/appointments rows for the selected period.
 */
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarCheck, UserX, IndianRupee, Users } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { listAppointments, type AppointmentRow } from '../../api/admin';
import { logger } from '../../utils/secureLogger';
import { type ReportDateRange, type ExportableReport, rangeToDates, formatRupees, bucketByDay } from './reportUtils';

interface AdminReportsProps {
  dateRange: ReportDateRange;
  onExportReady?: (report: ExportableReport | null) => void;
}

const StatCard = ({ title, value, subtitle, icon: Icon }: {
  title: string; value: string; subtitle?: string; icon: typeof Users;
}) => (
  <motion.div whileHover={{ y: -2 }} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
    <div className="flex items-center justify-between">
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </div>
    <h3 className="mt-1 text-2xl font-bold tracking-tight text-ink">{value}</h3>
    {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
  </motion.div>
);

export function AdminReports({ dateRange, onExportReady }: AdminReportsProps) {
  const [appointments, setAppointments] = useState<AppointmentRow[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { from, to } = rangeToDates(dateRange);
      try {
        const res = await listAppointments({
          dateFrom: from.toISOString(),
          dateTo: to.toISOString(),
          pageSize: 500
        });
        if (cancelled) return;
        setAppointments(res.data);
        setLoadError(null);
      } catch (e) {
        if (cancelled) return;
        logger.error('Admin reports load failed', { code: (e as { code?: string }).code });
        setLoadError('Could not load report data.');
      }
    })();
    return () => { cancelled = true; };
  }, [dateRange]);

  const { from, to } = useMemo(() => rangeToDates(dateRange), [dateRange]);
  const completed = appointments.filter(a => a.status === 'completed');
  const noShows = appointments.filter(a => a.status === 'no-show' || a.status === 'no_show').length;
  const revenuePaise = completed.reduce((sum, a) => sum + a.price, 0);
  const activeTherapists = new Set(appointments.map(a => a.therapistId)).size;
  const volume = useMemo(
    () => bucketByDay(appointments, a => a.scheduledAt, from, to),
    [appointments, from, to]
  );

  const byTherapist = useMemo(() => {
    const map = new Map<number, { name: string; sessions: number; revenuePaise: number }>();
    for (const a of appointments) {
      let t = map.get(a.therapistId);
      if (!t) { t = { name: a.therapistName, sessions: 0, revenuePaise: 0 }; map.set(a.therapistId, t); }
      t.sessions++;
      if (a.status === 'completed') t.revenuePaise += a.price;
    }
    return [...map.values()]
      .sort((x, y) => y.sessions - x.sessions)
      .slice(0, 10)
      .map(t => ({ ...t, revenue: t.revenuePaise / 100, shortName: t.name.split(' ')[0] }));
  }, [appointments]);

  useEffect(() => {
    if (!onExportReady) return;
    if (appointments.length === 0) { onExportReady(null); return; }
    onExportReady({
      slug: 'practice-report',
      headers: ['Client', 'Therapist', 'Service Type', 'Scheduled At', 'Status', 'Payment Status', 'Fee (paise)'],
      rows: appointments.map(a => [
        a.clientName, a.therapistName, a.serviceType,
        new Date(a.scheduledAt).toLocaleString('en-IN'),
        a.status, a.paymentStatus, a.price
      ])
    });
    return () => onExportReady(null);
  }, [appointments, onExportReady]);

  return (
    <div className="space-y-6">
      {loadError && <p className="text-sm text-danger">{loadError}</p>}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Sessions" value={String(appointments.length)} subtitle={`${completed.length} completed`} icon={CalendarCheck} />
        <StatCard title="Active Therapists" value={String(activeTherapists)} subtitle="with sessions in period" icon={Users} />
        <StatCard title="Completed Revenue" value={formatRupees(revenuePaise)} subtitle="sum of completed session fees" icon={IndianRupee} />
        <StatCard title="No-Shows" value={String(noShows)} subtitle={appointments.length ? `${Math.round((noShows / appointments.length) * 100)}% of sessions` : undefined} icon={UserX} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle>Session Volume</CardTitle>
            <CardDescription>Appointments across the selected period</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={volume} barSize={18}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--rule)" />
                <XAxis dataKey="day" tick={{ fill: 'var(--muted-text)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fill: 'var(--muted-text)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: 'var(--surface-warm)' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow-card-hi)' }} />
                <Bar dataKey="count" name="Appointments" fill="var(--action)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle>Sessions per Therapist</CardTitle>
            <CardDescription>Top providers by session count (revenue = completed fees)</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byTherapist} layout="vertical" barSize={16}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--rule)" />
                <XAxis type="number" allowDecimals={false} tick={{ fill: 'var(--muted-text)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="shortName" width={80} tick={{ fill: 'var(--muted-text)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: 'var(--surface-warm)' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow-card-hi)' }}
                  formatter={(value: number, name: string) => name === 'Revenue (₹)' ? [`₹${value.toLocaleString('en-IN')}`, name] : [value, name]}
                />
                <Bar dataKey="sessions" name="Sessions" fill="var(--info)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
