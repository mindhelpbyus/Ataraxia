import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Building2,
    Users,
    Activity,
    DollarSign,
    TrendingUp,
    Zap,
    ArrowUpRight,
    ArrowDownRight,
    MoreHorizontal,
    Calendar,
    CreditCard,
    ShieldCheck,
    Globe
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Progress } from './ui/progress';

// --- Types & Interfaces ---
interface SuperAdminDashboardViewProps {
    userId: string;
    userEmail: string;
    userName?: string;
    onNavigate: (tab: 'dashboard' | 'calendar' | 'clients' | 'notes' | 'messages' | 'tasks' | 'analytics' | 'settings') => void;
}

// --- Mock Data (Preserved from previous version) ---
const platformGrowth = {
    totalOrganizations: 142,
    totalProviders: 487,
    totalClients: 3624,
    dailyActiveUsers: 892,
    monthlyActiveUsers: 2847,
    growth: { organizations: 12.4, providers: 18.2, clients: 24.8, dau: 8.4, mau: 15.2 }
};

const revenueMetrics = {
    mrr: 284750,
    arr: 3417000,
    revenueGrowth: 18.5,
    churnRate: 2.8
};

const revenueTrend = [
    { month: 'Jul', mrr: 218000, arr: 2616000 },
    { month: 'Aug', mrr: 234500, arr: 2814000 },
    { month: 'Sep', mrr: 248900, arr: 2986800 },
    { month: 'Oct', mrr: 262300, arr: 3147600 },
    { month: 'Nov', mrr: 273450, arr: 3281400 },
    { month: 'Dec', mrr: 284750, arr: 3417000 }
];

const activeUsersTrend = [
    { time: '00:00', users: 120 }, { time: '04:00', users: 80 },
    { time: '08:00', users: 450 }, { time: '12:00', users: 980 },
    { time: '16:00', users: 850 }, { time: '20:00', users: 340 },
    { time: '23:59', users: 190 }
];

// --- Components ---

const MetricCard = ({ title, value, trend, trendValue, icon: Icon, colorClass }: any) => (
    <motion.div
        whileHover={{ y: -2 }}
        className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md"
    >
        <div className="flex items-center justify-between">
            <div className={`rounded-xl p-2.5 ${colorClass} bg-opacity-10`}>
                <Icon className={`h-5 w-5 ${colorClass.replace('bg-', 'text-')}`} />
            </div>
            {trend && (
                <div className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                    {trend === 'up' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {trendValue}%
                </div>
            )}
        </div>
        <div className="mt-4">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="mt-1 text-2xl font-bold tracking-tight text-foreground">{value}</h3>
        </div>
        {/* Decorative background gradient blob */}
        <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full ${colorClass} opacity-5 blur-2xl`} />
    </motion.div>
);

const CustomAreaChart = ({ data, color = "#6366f1" }: { data: any[], color?: string }) => (
    <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
            <defs>
                <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={0.2} />
                    <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="month" hide />
            <YAxis hide />
            <Tooltip
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                cursor={{ stroke: color, strokeWidth: 1, strokeDasharray: '4 4' }}
            />
            <Area
                type="monotone"
                dataKey="mrr"
                stroke={color}
                strokeWidth={3}
                fill={`url(#gradient-${color})`}
            />
        </AreaChart>
    </ResponsiveContainer>
);

export function SuperAdminDashboardView({ userId, userEmail, userName, onNavigate }: SuperAdminDashboardViewProps) {
    const [activeTab, setActiveTab] = useState('overview');

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    return (
        <div className="min-h-screen bg-background p-8 max-w-[1600px] mx-auto font-sans">
            {/* Header Section */}
            <div className="mb-8 flex items-end justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                        {getGreeting()}, {userName || 'Super Admin'}!
                    </h1>
                    <p className="mt-2 text-muted-foreground">Here is what is happening with your platform today.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/50 p-1 shadow-sm">
                        {['Overview', 'Financials', 'Users', 'System'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab.toLowerCase())}
                                className={`rounded-md px-4 py-2 text-sm font-medium transition-all ${activeTab === tab.toLowerCase()
                                    ? 'bg-card text-foreground shadow-sm ring-1 ring-black/5'
                                    : 'text-muted-foreground hover:bg-card/50 hover:text-foreground'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                    <Button className="!bg-indigo-600 !text-white hover:!bg-indigo-700 shadow-sm">
                        <Zap className="mr-2 h-4 w-4" /> Generate Report
                    </Button>
                </div>
            </div>

            {/* Dynamic Content Based on Active Tab */}
            <div className="mt-6">
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-12 gap-6">
                        {/* Row 1: Key Metrics */}
                        <div className="col-span-3">
                            <MetricCard
                                title="Total Revenue (ARR)"
                                value={`$${(revenueMetrics.arr / 1000000).toFixed(2)}M`}
                                trend="up"
                                trendValue={revenueMetrics.revenueGrowth}
                                icon={DollarSign}
                                colorClass="bg-emerald-500"
                            />
                        </div>
                        <div className="col-span-3">
                            <MetricCard
                                title="Active Organizations"
                                value={platformGrowth.totalOrganizations}
                                trend="up"
                                trendValue={platformGrowth.growth.organizations}
                                icon={Building2}
                                colorClass="bg-blue-500"
                            />
                        </div>
                        <div className="col-span-3">
                            <MetricCard
                                title="Total Providers"
                                value={platformGrowth.totalProviders}
                                trend="up"
                                trendValue={platformGrowth.growth.providers}
                                icon={Activity}
                                colorClass="bg-violet-500"
                            />
                        </div>
                        <div className="col-span-3">
                            <MetricCard
                                title="Total Clients"
                                value={platformGrowth.totalClients.toLocaleString()}
                                trend="up"
                                trendValue={platformGrowth.growth.clients}
                                icon={Users}
                                colorClass="bg-orange-500"
                            />
                        </div>

                        {/* Row 2: Main Chart & Live Activity */}
                        <div className="col-span-8 row-span-2">
                            <Card className="h-full border-border shadow-sm">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle>Revenue Trajectory</CardTitle>
                                            <CardDescription>Monthly Recurring Revenue (MRR) vs Projected</CardDescription>
                                        </div>
                                        <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
                                            +18.5% YoY
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="h-[400px]">
                                    <CustomAreaChart data={revenueTrend} color="#10b981" />
                                </CardContent>
                            </Card>
                        </div>

                        <div className="col-span-4">
                            <Card className="border-border shadow-sm">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg">Live Activity</CardTitle>
                                    <CardDescription>Real-time user sessions</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="mb-4 flex items-baseline gap-2">
                                        <span className="text-3xl font-bold text-foreground">892</span>
                                        <span className="text-sm font-medium text-emerald-600 flex items-center">
                                            <span className="mr-1.5 h-2 w-2 animate-pulse rounded-full bg-emerald-500"></span>
                                            Online now
                                        </span>
                                    </div>
                                    <div className="h-[120px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={activeUsersTrend}>
                                                <Bar dataKey="users" fill="#cbd5e1" radius={[2, 2, 0, 0]}>
                                                    {activeUsersTrend.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={index === 3 ? '#3b82f6' : '#cbd5e1'} />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="col-span-4">
                            <Card className="border-border shadow-sm bg-gradient-to-br from-indigo-600 to-violet-700 text-white">
                                <CardHeader>
                                    <CardTitle className="text-white flex items-center gap-2">
                                        <Zap className="h-5 w-5 text-yellow-300" />
                                        System Health
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex justify-between text-sm mb-1 opacity-90">
                                                <span>API Uptime</span>
                                                <span>99.99%</span>
                                            </div>
                                            <Progress value={99.9} className="h-1.5 bg-card/20" indicatorClassName="bg-emerald-400" />
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-sm mb-1 opacity-90">
                                                <span>Server Load</span>
                                                <span>42%</span>
                                            </div>
                                            <Progress value={42} className="h-1.5 bg-card/20" indicatorClassName="bg-blue-400" />
                                        </div>
                                        <div className="pt-2 flex gap-4">
                                            <div className="rounded-lg bg-card/10 p-3 flex-1 backdrop-blur-sm">
                                                <p className="text-xs opacity-70">Latency</p>
                                                <p className="text-lg font-bold">42ms</p>
                                            </div>
                                            <div className="rounded-lg bg-card/10 p-3 flex-1 backdrop-blur-sm">
                                                <p className="text-xs opacity-70">Errors</p>
                                                <p className="text-lg font-bold">0.01%</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Row 3: Detailed Lists */}
                        <div className="col-span-6">
                            <Card className="border-border shadow-sm">
                                <CardHeader>
                                    <CardTitle>Recent Organizations</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {[
                                            { name: 'Acme Healthcare', plan: 'Enterprise', status: 'Active', date: '2 mins ago' },
                                            { name: 'Wellness Center', plan: 'Professional', status: 'Active', date: '15 mins ago' },
                                            { name: 'Mindful Practice', plan: 'Starter', status: 'Onboarding', date: '1 hour ago' },
                                        ].map((org, i) => (
                                            <div key={i} className="flex items-center justify-between border-b border-slate-50 pb-4 last:border-0 last:pb-0">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground font-bold">
                                                        {org.name[0]}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-foreground">{org.name}</p>
                                                        <p className="text-xs text-muted-foreground">{org.plan}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <Badge variant="secondary" className="bg-muted text-foreground hover:bg-slate-200">
                                                        {org.status}
                                                    </Badge>
                                                    <p className="mt-1 text-xs text-muted-foreground">{org.date}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="col-span-6">
                            <Card className="border-border shadow-sm">
                                <CardHeader>
                                    <CardTitle>Geographic Distribution</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {[
                                            { country: 'United States', users: 2450, percent: 68 },
                                            { country: 'Canada', users: 540, percent: 15 },
                                            { country: 'United Kingdom', users: 320, percent: 9 },
                                            { country: 'Australia', users: 180, percent: 5 },
                                        ].map((geo, i) => (
                                            <div key={i} className="flex items-center gap-4">
                                                <Globe className="h-4 w-4 text-muted-foreground" />
                                                <div className="flex-1">
                                                    <div className="flex justify-between mb-1">
                                                        <span className="text-sm font-medium text-foreground">{geo.country}</span>
                                                        <span className="text-sm text-muted-foreground">{geo.users} users</span>
                                                    </div>
                                                    <Progress value={geo.percent} className="h-2" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}

                {activeTab === 'financials' && (
                    <div className="grid grid-cols-12 gap-6">
                        <div className="col-span-4">
                            <MetricCard
                                title="Monthly Recurring Revenue"
                                value={`$${(revenueMetrics.mrr / 1000).toFixed(0)}K`}
                                trend="up"
                                trendValue={12.5}
                                icon={CreditCard}
                                colorClass="bg-emerald-500"
                            />
                        </div>
                        <div className="col-span-4">
                            <MetricCard
                                title="Avg. Revenue Per User"
                                value="$142"
                                trend="up"
                                trendValue={4.2}
                                icon={Users}
                                colorClass="bg-blue-500"
                            />
                        </div>
                        <div className="col-span-4">
                            <MetricCard
                                title="Churn Rate"
                                value={`${revenueMetrics.churnRate}%`}
                                trend="down"
                                trendValue={0.5}
                                icon={Activity}
                                colorClass="bg-rose-500"
                            />
                        </div>

                        <div className="col-span-8">
                            <Card className="border-border shadow-sm">
                                <CardHeader>
                                    <CardTitle>Revenue Breakdown</CardTitle>
                                    <CardDescription>Income by subscription tier</CardDescription>
                                </CardHeader>
                                <CardContent className="h-[350px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={[
                                            { name: 'Starter', value: 58000 },
                                            { name: 'Professional', value: 136000 },
                                            { name: 'Enterprise', value: 90750 }
                                        ]}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                            <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                            <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={60} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="col-span-4">
                            <Card className="border-border shadow-sm h-full">
                                <CardHeader>
                                    <CardTitle>Recent Transactions</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {[
                                            { org: 'Acme Corp', amount: '$2,400', status: 'Success', date: 'Just now' },
                                            { org: 'HealthPlus', amount: '$850', status: 'Success', date: '15m ago' },
                                            { org: 'MediCare', amount: '$1,200', status: 'Processing', date: '1h ago' },
                                            { org: 'Wellness Inc', amount: '$450', status: 'Failed', date: '2h ago' },
                                        ].map((tx, i) => (
                                            <div key={i} className="flex items-center justify-between border-b border-slate-50 pb-3 last:border-0">
                                                <div>
                                                    <p className="font-medium text-foreground">{tx.org}</p>
                                                    <p className="text-xs text-muted-foreground">{tx.date}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-medium text-foreground">{tx.amount}</p>
                                                    <span className={`text-xs ${tx.status === 'Success' ? 'text-emerald-600' :
                                                        tx.status === 'Processing' ? 'text-amber-600' : 'text-rose-600'
                                                        }`}>{tx.status}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}

                {activeTab === 'users' && (
                    <div className="grid grid-cols-12 gap-6">
                        <div className="col-span-8">
                            <Card className="border-border shadow-sm">
                                <CardHeader>
                                    <CardTitle>User Growth</CardTitle>
                                    <CardDescription>New user registrations over time</CardDescription>
                                </CardHeader>
                                <CardContent className="h-[350px]">
                                    <CustomAreaChart data={[
                                        { month: 'Jul', mrr: 120 }, { month: 'Aug', mrr: 180 },
                                        { month: 'Sep', mrr: 250 }, { month: 'Oct', mrr: 310 },
                                        { month: 'Nov', mrr: 450 }, { month: 'Dec', mrr: 580 }
                                    ]} color="#8b5cf6" />
                                </CardContent>
                            </Card>
                        </div>
                        <div className="col-span-4">
                            <Card className="border-border shadow-sm h-full">
                                <CardHeader>
                                    <CardTitle>User Demographics</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-6">
                                        {[
                                            { label: 'Therapists', val: 65, color: 'bg-violet-500' },
                                            { label: 'Administrators', val: 25, color: 'bg-indigo-500' },
                                            { label: 'Support Staff', val: 10, color: 'bg-blue-500' }
                                        ].map((item, i) => (
                                            <div key={i}>
                                                <div className="flex justify-between text-sm mb-2">
                                                    <span className="text-muted-foreground">{item.label}</span>
                                                    <span className="font-medium text-foreground">{item.val}%</span>
                                                </div>
                                                <Progress value={item.val} className="h-2" indicatorClassName={item.color} />
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}

                {activeTab === 'system' && (
                    <div className="grid grid-cols-12 gap-6">
                        <div className="col-span-6">
                            <Card className="border-border shadow-sm">
                                <CardHeader>
                                    <CardTitle>Server Performance</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div>
                                        <div className="flex justify-between mb-2">
                                            <span className="text-sm font-medium text-foreground">CPU Usage</span>
                                            <span className="text-sm text-muted-foreground">45%</span>
                                        </div>
                                        <Progress value={45} className="h-2" indicatorClassName="bg-blue-500" />
                                    </div>
                                    <div>
                                        <div className="flex justify-between mb-2">
                                            <span className="text-sm font-medium text-foreground">Memory Usage</span>
                                            <span className="text-sm text-muted-foreground">62%</span>
                                        </div>
                                        <Progress value={62} className="h-2" indicatorClassName="bg-violet-500" />
                                    </div>
                                    <div>
                                        <div className="flex justify-between mb-2">
                                            <span className="text-sm font-medium text-foreground">Disk Space</span>
                                            <span className="text-sm text-muted-foreground">28%</span>
                                        </div>
                                        <Progress value={28} className="h-2" indicatorClassName="bg-emerald-500" />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                        <div className="col-span-6">
                            <Card className="border-border shadow-sm">
                                <CardHeader>
                                    <CardTitle>System Logs</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {[
                                            { type: 'info', msg: 'Backup completed successfully', time: '10m ago' },
                                            { type: 'warn', msg: 'High latency detected in US-East', time: '45m ago' },
                                            { type: 'error', msg: 'Failed login attempt from IP 192.168.x.x', time: '1h ago' },
                                            { type: 'info', msg: 'System update scheduled', time: '2h ago' }
                                        ].map((log, i) => (
                                            <div key={i} className="flex items-center gap-3 text-sm p-2 rounded hover:bg-muted">
                                                <div className={`w-2 h-2 rounded-full ${log.type === 'info' ? 'bg-blue-500' :
                                                    log.type === 'warn' ? 'bg-amber-500' : 'bg-rose-500'
                                                    }`} />
                                                <span className="flex-1 text-foreground">{log.msg}</span>
                                                <span className="text-muted-foreground text-xs">{log.time}</span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
