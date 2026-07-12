/**
 * TherapistReports — the therapist's own practice numbers, all real:
 * appointments from backend-initial, money from GET /therapists/me/earnings-summary
 * (Payout projections: period + FY-to-date gross/net/TDS in paise).
 */
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarCheck, UserX, IndianRupee, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { getTherapistAppointments, type AppointmentDetails } from '../../api/appointmentsBackend';
import { get } from '../../api/client';
import { logger } from '../../utils/secureLogger';
import { type ReportDateRange, rangeToDates, formatRupees, bucketByDay } from './reportUtils';

interface TherapistReportsProps {
  currentUserId: string;
  userEmail: string;
  dateRange: ReportDateRange;
}

/** GET /therapists/me/earnings-summary — see backend-initial therapists Lambda. */
interface EarningsSummary {
  current_period_start: string;
  current_period_end: string;
  next_payout_date: string;
  current_period_sessions: number;
  current_period_gross_paise: number;
  current_period_tds_paise: number;
  current_period_net_paise: number;
  ytd_gross_paise: number;
  ytd_net_paise: number;
  ytd_tds_deducted_paise: number;
  ytd_session_count: number;
  last_payout_amount_paise: number | null;
  last_payout_date: string | null;
}

const StatCard = ({ title, value, subtitle, icon: Icon }: {
  title: string; value: string; subtitle?: string; icon: typeof CalendarCheck;
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

export function TherapistReports({ currentUserId, dateRange }: TherapistReportsProps) {
  const [appointments, setAppointments] = useState<AppointmentDetails[]>([]);
  const [earnings, setEarnings] = useState<EarningsSummary | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { from, to } = rangeToDates(dateRange);
      try {
        const [appts, earn] = await Promise.all([
          getTherapistAppointments(currentUserId, {
            startDate: from.toISOString(),
            endDate: to.toISOString()
          }),
          get<EarningsSummary>('/therapists/me/earnings-summary')
        ]);
        if (cancelled) return;
        setAppointments(appts);
        setEarnings(earn);
        setLoadError(null);
      } catch (e) {
        if (cancelled) return;
        logger.error('Therapist reports load failed', { code: (e as { code?: string }).code });
        setLoadError('Could not load your report data.');
      }
    })();
    return () => { cancelled = true; };
  }, [currentUserId, dateRange]);

  const { from, to } = useMemo(() => rangeToDates(dateRange), [dateRange]);
  const completed = appointments.filter(a => a.status === 'completed').length;
  const noShows = appointments.filter(a => a.status === 'no-show').length;
  const cancelledCount = appointments.filter(a => a.status === 'cancelled').length;
  const noShowRate = appointments.length ? Math.round((noShows / appointments.length) * 100) : 0;
  const volume = useMemo(
    () => bucketByDay(appointments, a => a.startTime, from, to),
    [appointments, from, to]
  );

  return (
    <div className="space-y-6">
      {loadError && <p className="text-sm text-rose-600">{loadError}</p>}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Sessions"
          value={String(appointments.length)}
          subtitle={`${completed} completed`}
          icon={CalendarCheck}
        />
        <StatCard
          title="No-Show Rate"
          value={`${noShowRate}%`}
          subtitle={`${noShows} no-shows · ${cancelledCount} cancelled`}
          icon={UserX}
        />
        <StatCard
          title="Period Net Earnings"
          value={earnings ? formatRupees(earnings.current_period_net_paise) : '—'}
          subtitle={earnings ? `${earnings.current_period_sessions} paid sessions this cycle` : undefined}
          icon={IndianRupee}
        />
        <StatCard
          title="Next Payout"
          value={earnings ? new Date(earnings.next_payout_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}
          subtitle={earnings?.last_payout_amount_paise != null
            ? `Last: ${formatRupees(earnings.last_payout_amount_paise)}`
            : 'No payouts yet'}
          icon={Clock}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Session volume */}
        <Card className="lg:col-span-2 border-border shadow-sm">
          <CardHeader>
            <CardTitle>Appointments & Attendance</CardTitle>
            <CardDescription>Your session volume across the selected period</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={volume} barSize={18}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="count" name="Appointments" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Earnings summary (real payout projection) */}
        <Card className="border-border shadow-sm bg-gradient-to-br from-indigo-600 to-violet-700 text-white">
          <CardHeader>
            <CardTitle className="text-white">Earnings Summary</CardTitle>
            <CardDescription className="text-indigo-100">
              {earnings
                ? `Cycle ${new Date(earnings.current_period_start).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} – ${new Date(earnings.current_period_end).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`
                : 'Current payout cycle'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {earnings ? (
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="opacity-80">Gross</span>
                  <span className="font-bold">{formatRupees(earnings.current_period_gross_paise)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="opacity-80">TDS deducted</span>
                  <span className="font-bold">−{formatRupees(earnings.current_period_tds_paise)}</span>
                </div>
                <div className="flex justify-between border-t border-white/20 pt-3">
                  <span className="font-semibold">Net</span>
                  <span className="text-xl font-bold">{formatRupees(earnings.current_period_net_paise)}</span>
                </div>
                <div className="rounded-lg bg-card/10 p-3 backdrop-blur-sm mt-4">
                  <p className="text-xs opacity-70">Financial year to date</p>
                  <p className="text-lg font-bold">{formatRupees(earnings.ytd_net_paise)} net</p>
                  <p className="text-xs opacity-70">{earnings.ytd_session_count} sessions · {formatRupees(earnings.ytd_tds_deducted_paise)} TDS</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-indigo-100">Loading earnings…</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
