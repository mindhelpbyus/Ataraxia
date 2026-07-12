/**
 * SuperAdminReports — platform-level report from real sources only:
 * /admin/dashboard/counts + /admin/appointments. Financial deep-dives arrive
 * with the billing connection (MVP0.3); no fabricated panels until then.
 */
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, UserCheck, CalendarCheck, IndianRupee } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { getDashboardCounts, listAppointments, type DashboardCounts, type AppointmentRow } from '../../api/admin';
import { logger } from '../../utils/secureLogger';
import { type ReportDateRange, rangeToDates, formatRupees, bucketByDay } from './reportUtils';

interface SuperAdminReportsProps {
  dateRange: ReportDateRange;
}

const StatCard = ({ title, value, subtitle, icon: Icon }: {
  title: string; value: string; subtitle?: string; icon: typeof Users;
}) => (
  <motion.div whileHover={{ y: -2 }} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
    <div className="flex items-center justify-between">
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </div>
    <h3 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{value}</h3>
    {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
  </motion.div>
);

const STATUS_COLORS: Record<string, string> = {
  completed: '#10b981',
  confirmed: '#8b5cf6',
  scheduled: '#3b82f6',
  initiated: '#f59e0b',
  cancelled: '#94a3b8',
  'no-show': '#f43f5e'
};

export function SuperAdminReports({ dateRange }: SuperAdminReportsProps) {
  const [counts, setCounts] = useState<DashboardCounts | null>(null);
  const [appointments, setAppointments] = useState<AppointmentRow[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { from, to } = rangeToDates(dateRange);
      try {
        const [countsRes, apptRes] = await Promise.all([
          getDashboardCounts(),
          listAppointments({ dateFrom: from.toISOString(), dateTo: to.toISOString(), pageSize: 500 })
        ]);
        if (cancelled) return;
        setCounts(countsRes);
        setAppointments(apptRes.data);
        setLoadError(null);
      } catch (e) {
        if (cancelled) return;
        logger.error('Super admin reports load failed', { code: (e as { code?: string }).code });
        setLoadError('Could not load report data.');
      }
    })();
    return () => { cancelled = true; };
  }, [dateRange]);

  const { from, to } = useMemo(() => rangeToDates(dateRange), [dateRange]);
  const completedRevenuePaise = appointments
    .filter(a => a.status === 'completed')
    .reduce((sum, a) => sum + a.price, 0);
  const volume = useMemo(
    () => bucketByDay(appointments, a => a.scheduledAt, from, to),
    [appointments, from, to]
  );

  const statusMix = useMemo(() => {
    const map = new Map<string, number>();
    for (const a of appointments) map.set(a.status, (map.get(a.status) ?? 0) + 1);
    return [...map.entries()]
      .sort((x, y) => y[1] - x[1])
      .map(([status, count]) => ({ status, count }));
  }, [appointments]);

  return (
    <div className="space-y-6">
      {loadError && <p className="text-sm text-rose-600">{loadError}</p>}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Therapists" value={counts ? counts.totalTherapists.toLocaleString('en-IN') : '—'} subtitle={counts ? `${counts.pendingTherapists} pending verification` : undefined} icon={UserCheck} />
        <StatCard title="Total Clients" value={counts ? counts.totalClients.toLocaleString('en-IN') : '—'} icon={Users} />
        <StatCard title="Sessions in Period" value={String(appointments.length)} icon={CalendarCheck} />
        <StatCard title="Completed Revenue" value={formatRupees(completedRevenuePaise)} subtitle="sum of completed session fees" icon={IndianRupee} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-border shadow-sm">
          <CardHeader>
            <CardTitle>Platform Session Volume</CardTitle>
            <CardDescription>All appointments across the selected period</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={volume}>
                <defs>
                  <linearGradient id="sa-volume" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="count" name="Appointments" stroke="#6366f1" strokeWidth={2.5} fill="url(#sa-volume)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle>Status Mix</CardTitle>
            <CardDescription>Appointments by state in this period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {statusMix.length === 0 && <p className="text-sm text-muted-foreground">No appointments in this period.</p>}
              {statusMix.map(({ status, count }) => {
                const pct = appointments.length ? Math.round((count / appointments.length) * 100) : 0;
                return (
                  <div key={status}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="capitalize text-foreground">{status.replace(/[-_]/g, ' ')}</span>
                      <span className="text-muted-foreground">{count} · {pct}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, backgroundColor: STATUS_COLORS[status] ?? '#64748b' }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
