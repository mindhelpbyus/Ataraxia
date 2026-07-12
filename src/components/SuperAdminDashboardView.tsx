import React from 'react';
import { motion } from 'framer-motion';
import {
    Users,
    Activity,
    DollarSign,
    Clock,
    UserCheck,
    ShieldCheck
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import {
    getDashboardCounts,
    listAppointments,
    listActivity,
    type DashboardCounts,
    type AppointmentRow,
    type AdminActivityRow
} from '../api/admin';
import { logger } from '../utils/secureLogger';

// --- Types & Interfaces ---
interface SuperAdminDashboardViewProps {
    userId: string;
    userEmail: string;
    userName?: string;
    onNavigate: (tab: 'dashboard' | 'calendar' | 'clients' | 'notes' | 'messages' | 'tasks' | 'analytics' | 'settings') => void;
}

const ACTIVITY_LABELS: Record<string, string> = {
    'therapist.approve': 'approved a therapist',
    'therapist.reject': 'rejected a therapist',
    'client.create': 'added a client',
    'appointment.book': 'booked an appointment',
    'payout.approve': 'approved a payout',
    'payout.hold': 'held a payout'
};

/** Appointments per day for the last 30 days — the platform's real volume trend. */
function dailyVolume(appointments: AppointmentRow[]) {
    const byDay = new Map<string, number>();
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        byDay.set(d.toISOString().slice(0, 10), 0);
    }
    for (const a of appointments) {
        const key = a.scheduledAt.slice(0, 10);
        if (byDay.has(key)) byDay.set(key, (byDay.get(key) ?? 0) + 1);
    }
    return [...byDay.entries()].map(([date, count]) => ({
        day: new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        count
    }));
}

// --- Components ---

const MetricCard = ({ title, value, icon: Icon, colorClass }: {
    title: string; value: string; icon: typeof Users; colorClass: string;
}) => (
    <motion.div
        whileHover={{ y: -2 }}
        className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md"
    >
        <div className="flex items-center justify-between">
            <div className={`rounded-xl p-2.5 ${colorClass} bg-opacity-10`}>
                <Icon className={`h-5 w-5 ${colorClass.replace('bg-', 'text-')}`} />
            </div>
        </div>
        <div className="mt-4">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="mt-1 text-2xl font-bold tracking-tight text-foreground">{value}</h3>
        </div>
        {/* Decorative background gradient blob */}
        <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full ${colorClass} opacity-5 blur-2xl`} />
    </motion.div>
);

export function SuperAdminDashboardView({ userName }: SuperAdminDashboardViewProps) {
    const [counts, setCounts] = React.useState<DashboardCounts | null>(null);
    const [appointments, setAppointments] = React.useState<AppointmentRow[]>([]);
    const [activity, setActivity] = React.useState<AdminActivityRow[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [loadError, setLoadError] = React.useState<string | null>(null);

    React.useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const from = new Date();
                from.setDate(from.getDate() - 30);
                const [countsRes, apptRes, activityRes] = await Promise.all([
                    getDashboardCounts(),
                    listAppointments({ dateFrom: from.toISOString(), pageSize: 500 }),
                    listActivity({ limit: 10 })
                ]);
                if (cancelled) return;
                setCounts(countsRes);
                setAppointments(apptRes.data);
                setActivity(activityRes.data);
            } catch (e) {
                if (cancelled) return;
                logger.error('Super admin dashboard load failed', { code: (e as { code?: string }).code });
                setLoadError('Could not load platform data. Check your connection and retry.');
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    const volumeTrend = React.useMemo(() => dailyVolume(appointments), [appointments]);
    const completedThisMonth = appointments.filter(a => a.status === 'completed').length;

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    if (loading) {
        return <div className="flex items-center justify-center h-screen text-muted-foreground">Loading platform insights...</div>;
    }

    return (
        <div className="min-h-screen bg-background p-8 max-w-[1600px] mx-auto font-sans">
            {/* Header Section */}
            <div className="mb-8 flex items-end justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                        {getGreeting()}, {userName || 'Super Admin'}!
                    </h1>
                    <p className="mt-2 text-muted-foreground">
                        {loadError
                            ? <span className="text-rose-600">{loadError}</span>
                            : 'Live platform overview — every number below is real.'}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-6">
                {/* Row 1: Key Metrics (live /admin/dashboard/counts) */}
                <div className="col-span-3">
                    <MetricCard
                        title="Total Clients"
                        value={counts ? counts.totalClients.toLocaleString('en-IN') : '—'}
                        icon={Users}
                        colorClass="bg-action"
                    />
                </div>
                <div className="col-span-3">
                    <MetricCard
                        title="Total Therapists"
                        value={counts ? counts.totalTherapists.toLocaleString('en-IN') : '—'}
                        icon={UserCheck}
                        colorClass="bg-violet-500"
                    />
                </div>
                <div className="col-span-3">
                    <MetricCard
                        title="Pending Verifications"
                        value={counts ? counts.pendingTherapists.toLocaleString('en-IN') : '—'}
                        icon={Clock}
                        colorClass="bg-blue-500"
                    />
                </div>
                <div className="col-span-3">
                    <MetricCard
                        title="Pending Payouts"
                        value={counts ? counts.pendingPayouts.toLocaleString('en-IN') : '—'}
                        icon={DollarSign}
                        colorClass="bg-emerald-500"
                    />
                </div>

                {/* Row 2: Volume trend + live audit trail */}
                <div className="col-span-8">
                    <Card className="h-full border-border shadow-sm">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Session Volume</CardTitle>
                                    <CardDescription>Appointments per day, last 30 days</CardDescription>
                                </div>
                                <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
                                    {completedThisMonth} completed
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={volumeTrend}>
                                    <defs>
                                        <linearGradient id="volume-gradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#10b981" stopOpacity={0.2} />
                                            <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 11 }} interval={4} axisLine={false} tickLine={false} />
                                    <YAxis allowDecimals={false} tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        cursor={{ stroke: '#10b981', strokeWidth: 1, strokeDasharray: '4 4' }}
                                    />
                                    <Area type="monotone" dataKey="count" name="Appointments" stroke="#10b981" strokeWidth={3} fill="url(#volume-gradient)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                <div className="col-span-4">
                    <Card className="h-full border-border shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Activity className="h-4 w-4 text-indigo-500" /> Admin Activity
                            </CardTitle>
                            <CardDescription>Append-only audit trail</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
                                {activity.length === 0 && (
                                    <p className="text-sm text-muted-foreground">No admin activity recorded yet.</p>
                                )}
                                {activity.map(item => (
                                    <div key={item.id} className="flex items-start gap-3">
                                        <div className="rounded-full bg-indigo-50 p-2 mt-0.5">
                                            <ShieldCheck className="h-4 w-4 text-indigo-600" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm text-foreground leading-snug">
                                                <span className="font-semibold">{item.actor.firstName} {item.actor.lastName}</span>{' '}
                                                {ACTIVITY_LABELS[item.action] ?? item.action}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(item.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Financial tiles arrive with the billing connection (MVP0.3) — no fabricated
                    MRR/ARR/churn/uptime panels are rendered until a real source exists. */}
            </div>
        </div>
    );
}
