
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  CalendarDays,
  DollarSign,
  Clock,
  BarChart3,
  ChevronRight,
  Activity,
  ShieldCheck,
  UserCheck,
  CalendarCheck
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Progress } from './ui/progress';
import {
  getDashboardCounts,
  listAppointments,
  listActivity,
  type DashboardCounts,
  type AppointmentRow,
  type AdminActivityRow
} from '../api/admin';
import { logger } from '../utils/secureLogger';

interface AdminDashboardViewProps {
  userId: string;
  userEmail: string;
  onNavigate: (tab: 'dashboard' | 'calendar' | 'clients' | 'notes' | 'messages' | 'tasks' | 'analytics' | 'settings') => void;
}

// ─── Derivations from real appointment rows ──────────────────────────────────

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MISSED_STATUSES = new Set(['no-show', 'no_show', 'cancelled']);

function startOfWeek(d: Date): Date {
  const out = new Date(d);
  const day = (out.getDay() + 6) % 7; // Monday = 0
  out.setDate(out.getDate() - day);
  out.setHours(0, 0, 0, 0);
  return out;
}

function weeklyVolume(appointments: AppointmentRow[]) {
  const rows = WEEKDAYS.map(day => ({ day, completed: 0, missed: 0 }));
  for (const a of appointments) {
    const idx = (new Date(a.scheduledAt).getDay() + 6) % 7;
    if (a.status === 'completed') rows[idx].completed++;
    else if (MISSED_STATUSES.has(a.status)) rows[idx].missed++;
  }
  return rows;
}

interface TherapistAgg {
  id: number;
  name: string;
  initials: string;
  sessions: number;
  completed: number;
  revenuePaise: number;
}

function therapistLeaderboard(appointments: AppointmentRow[]): TherapistAgg[] {
  const byId = new Map<number, TherapistAgg>();
  for (const a of appointments) {
    let t = byId.get(a.therapistId);
    if (!t) {
      const initials = a.therapistName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
      t = { id: a.therapistId, name: a.therapistName, initials, sessions: 0, completed: 0, revenuePaise: 0 };
      byId.set(a.therapistId, t);
    }
    t.sessions++;
    if (a.status === 'completed') {
      t.completed++;
      t.revenuePaise += a.price;
    }
  }
  return [...byId.values()].sort((a, b) => b.revenuePaise - a.revenuePaise).slice(0, 5);
}

const PIPELINE_STAGES: { stage: string; statuses: string[]; color: string }[] = [
  { stage: 'Awaiting Payment', statuses: ['initiated'], color: '#F59E0B' },
  { stage: 'Scheduled', statuses: ['scheduled'], color: '#3B82F6' },
  { stage: 'Confirmed', statuses: ['confirmed'], color: '#8B5CF6' },
  { stage: 'In Session', statuses: ['in_progress', 'in-progress'], color: '#10B981' },
  { stage: 'Completed', statuses: ['completed'], color: '#1E7048' }
];

function pipeline(appointments: AppointmentRow[]) {
  return PIPELINE_STAGES.map(({ stage, statuses, color }) => ({
    stage,
    color,
    count: appointments.filter(a => statuses.includes(a.status)).length
  }));
}

function formatRupees(paise: number): string {
  return `₹${(paise / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

const ACTIVITY_LABELS: Record<string, string> = {
  'therapist.approve': 'approved a therapist',
  'therapist.reject': 'rejected a therapist',
  'client.create': 'added a client',
  'appointment.book': 'booked an appointment',
  'payout.approve': 'approved a payout',
  'payout.hold': 'held a payout'
};

// ─── Premium Components ───────────────────────────────────────────────────────

const PremiumMetricCard = ({ title, value, icon: Icon, colorClass, index }: {
  title: string; value: string; icon: typeof Users; colorClass: string; index: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.05 }}
    whileHover={{ y: -5 }}
    className="relative overflow-hidden rounded-[2rem] bg-card p-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] transition-all duration-300 hover:shadow-[0_8px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)] cursor-pointer group"
  >
    {/* Subtle gradient splash on hover */}
    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colorClass} opacity-0 group-hover:opacity-10 rounded-full blur-3xl -mr-10 -mt-10 transition-opacity duration-500`} />

    <div className="flex items-center justify-between mb-4 relative z-10">
      <div className={`rounded-2xl p-3 ${colorClass.replace('from-', 'bg-').split(' ')[0].replace('400', '50')} text-slate-700 group-hover:text-white group-hover:bg-slate-900 transition-colors duration-300`}>
        <Icon className="h-6 w-6" />
      </div>
    </div>
    <div className="relative z-10">
      <h3 className="text-3xl font-bold tracking-tight text-slate-900 mb-1 font-sans">{value}</h3>
      <p className="text-sm font-medium text-slate-500 tracking-wide">{title}</p>
    </div>
  </motion.div>
);

export function AdminDashboardView({ userEmail, onNavigate }: AdminDashboardViewProps) {
  const userName = userEmail.split('@')[0].split('.').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');

  const [counts, setCounts] = useState<DashboardCounts | null>(null);
  const [appointments, setAppointments] = useState<AppointmentRow[]>([]);
  const [activity, setActivity] = useState<AdminActivityRow[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const weekStart = startOfWeek(new Date());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 7);
        const [countsRes, apptRes, activityRes] = await Promise.all([
          getDashboardCounts(),
          listAppointments({
            dateFrom: weekStart.toISOString(),
            dateTo: weekEnd.toISOString(),
            pageSize: 500
          }),
          listActivity({ limit: 8 })
        ]);
        if (cancelled) return;
        setCounts(countsRes);
        setAppointments(apptRes.data);
        setActivity(activityRes.data);
      } catch (e) {
        if (cancelled) return;
        logger.error('Admin dashboard load failed', { code: (e as { code?: string }).code });
        setLoadError('Could not load dashboard data. Check your connection and retry.');
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const weeklySessionsData = useMemo(() => weeklyVolume(appointments), [appointments]);
  const leaderboard = useMemo(() => therapistLeaderboard(appointments), [appointments]);
  const clientJourneyData = useMemo(() => pipeline(appointments), [appointments]);
  const maxStage = Math.max(1, ...clientJourneyData.map(s => s.count));

  return (
    <div className="min-h-screen bg-background p-8 lg:p-12 font-sans selection:bg-indigo-100 selection:text-indigo-900">

      {/* Premium Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6"
      >
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-semibold mb-2 text-sm uppercase tracking-wider">
            <Activity className="h-4 w-4" />
            <span>Executive Overview</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 mb-3">
            Welcome back, {userName}.
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl leading-relaxed">
            {loadError
              ? <span className="text-rose-600">{loadError}</span>
              : counts
                ? <>
                    <span className="text-indigo-600 font-semibold">{counts.pendingTherapists}</span> therapist{counts.pendingTherapists === 1 ? '' : 's'} awaiting verification
                    {' · '}
                    <span className="text-indigo-600 font-semibold">{counts.pendingPayouts}</span> payout{counts.pendingPayouts === 1 ? '' : 's'} pending
                  </>
                : 'Loading platform overview…'}
          </p>
        </div>

        <div className="flex gap-4">
          <Button variant="outline" onClick={() => onNavigate('analytics')} className="h-12 px-6 rounded-xl border-slate-200 text-slate-600 hover:bg-card hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm bg-card/50 backdrop-blur-sm">
            <BarChart3 className="mr-2 h-5 w-5" /> Insights
          </Button>
          <Button onClick={() => onNavigate('calendar')} className="h-12 px-6 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all">
            <CalendarDays className="mr-2 h-5 w-5" /> Schedule
          </Button>
        </div>
      </motion.div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-12 gap-8">

        {/* Row 1: Key Metrics (live /admin/dashboard/counts) */}
        <div className="col-span-12 xl:col-span-3 lg:col-span-6">
          <PremiumMetricCard
            title="Active Clients"
            value={counts ? counts.totalClients.toLocaleString('en-IN') : '—'}
            icon={Users}
            colorClass="from-violet-400 to-purple-500"
            index={0}
          />
        </div>
        <div className="col-span-12 xl:col-span-3 lg:col-span-6">
          <PremiumMetricCard
            title="Active Therapists"
            value={counts ? counts.totalTherapists.toLocaleString('en-IN') : '—'}
            icon={UserCheck}
            colorClass="from-blue-400 to-indigo-500"
            index={1}
          />
        </div>
        <div className="col-span-12 xl:col-span-3 lg:col-span-6">
          <PremiumMetricCard
            title="Pending Verifications"
            value={counts ? counts.pendingTherapists.toLocaleString('en-IN') : '—'}
            icon={Clock}
            colorClass="from-action to-amber-500"
            index={2}
          />
        </div>
        <div className="col-span-12 xl:col-span-3 lg:col-span-6">
          <PremiumMetricCard
            title="Pending Payouts"
            value={counts ? counts.pendingPayouts.toLocaleString('en-IN') : '—'}
            icon={DollarSign}
            colorClass="from-emerald-400 to-teal-500"
            index={3}
          />
        </div>

        {/* Row 2: Charts Area - Clean & Borderless */}
        <div className="col-span-12 lg:col-span-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-[2rem] p-8 shadow-sm border border-slate-100 h-[450px]"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">Session Volume</h3>
                <p className="text-slate-500 text-sm">Completed vs missed sessions, this week</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-full border border-slate-100">
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                <span className="text-xs font-semibold text-slate-700">{appointments.length} appointments</span>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={weeklySessionsData} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} allowDecimals={false} />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', padding: '12px' }}
                />
                <Bar dataKey="completed" name="Completed" stackId="a" fill="#6366f1" radius={[0, 0, 6, 6]} />
                <Bar dataKey="missed" name="Missed" stackId="a" fill="#cbd5e1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        <div className="col-span-12 lg:col-span-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25 }}
            className="bg-card rounded-[2rem] p-8 shadow-sm border border-slate-100 h-[450px] flex flex-col"
          >
            <div className="mb-6">
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">Recent Activity</h3>
              <p className="text-slate-500 text-sm">Latest admin actions (audit trail)</p>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto space-y-4 pr-1">
              {activity.length === 0 && (
                <p className="text-sm text-slate-400">No admin activity recorded yet.</p>
              )}
              {activity.map(item => (
                <div key={item.id} className="flex items-start gap-3">
                  <div className="rounded-full bg-indigo-50 p-2 mt-0.5">
                    <ShieldCheck className="h-4 w-4 text-indigo-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-slate-700 leading-snug">
                      <span className="font-semibold text-slate-900">{item.actor.firstName} {item.actor.lastName}</span>{' '}
                      {ACTIVITY_LABELS[item.action] ?? item.action}
                    </p>
                    <p className="text-xs text-slate-400">{new Date(item.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Row 3: Leaderboard & Pipeline */}
        <div className="col-span-12 lg:col-span-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden"
          >
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">Top Performers</h3>
                <p className="text-slate-500 text-sm">By completed-session revenue, this week</p>
              </div>
              <Button variant="ghost" onClick={() => onNavigate('analytics')} className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-full text-sm">
                View Full Report <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
            <div className="p-4">
              {leaderboard.length === 0 && (
                <p className="p-4 text-sm text-slate-400">No sessions recorded this week yet.</p>
              )}
              {leaderboard.map((therapist, i) => {
                const completion = therapist.sessions ? Math.round((therapist.completed / therapist.sessions) * 100) : 0;
                return (
                  <div key={therapist.id} className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition-colors group cursor-pointer duration-200">
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-slate-300 font-bold text-lg w-6">{i + 1}</span>
                      <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                        <AvatarFallback className="bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-700 font-bold">{therapist.initials}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-bold text-slate-900 text-base">{therapist.name}</p>
                        <p className="text-slate-500 text-sm">{therapist.completed} of {therapist.sessions} sessions completed</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-8 text-right">
                      <div>
                        <p className="font-bold text-slate-900">{formatRupees(therapist.revenuePaise)}</p>
                        <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Revenue</p>
                      </div>
                      <div className="w-32 hidden md:block">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-500">Completion</span>
                          <span className="font-bold text-indigo-600">{completion}%</span>
                        </div>
                        <Progress value={completion} className="h-2 bg-slate-100" indicatorClassName="bg-indigo-500 rounded-full" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>

        <div className="col-span-12 lg:col-span-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-card rounded-[2rem] shadow-sm border border-slate-100 p-8 h-full"
          >
            <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-6">Client Pipeline</h3>
            <div className="space-y-6">
              {clientJourneyData.map((stage, index) => (
                <div key={stage.stage} className="space-y-3 group cursor-pointer">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">{stage.stage}</span>
                    <span className="px-2 py-0.5 bg-slate-100 rounded-md text-slate-600 font-medium text-xs group-hover:bg-slate-200 transition-colors">{stage.count}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(stage.count / maxStage) * 100}%` }}
                      transition={{ duration: 1.5, delay: index * 0.1, ease: 'easeOut' }}
                      className="h-full rounded-full shadow-[0_0_10px_rgba(0,0,0,0.1)]"
                      style={{ backgroundColor: stage.color }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-50">
              <Button variant="outline" onClick={() => onNavigate('calendar')} className="w-full rounded-xl border-dashed border-slate-300 text-slate-500 hover:text-slate-700 hover:border-slate-400">
                <CalendarCheck className="mr-2 h-4 w-4" /> View This Week's Schedule
              </Button>
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  );
}
