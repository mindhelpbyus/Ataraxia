import React from 'react';
import { motion, Variants } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  Users, UserPlus, TrendingUp, Activity, Video,
  MessageSquare, AlertTriangle, Clock, Server, Database,
  ArrowUpRight, ArrowDownRight, Zap, Shield, Globe
} from 'lucide-react';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';

interface SuperAdminReportsProps {
  dateRange: '7days' | '30days' | '90days' | '1year';
}

// --- Mock Data ---
const onboardingData = [
  { month: 'Jan', therapists: 12, clients: 145 },
  { month: 'Feb', therapists: 15, clients: 168 },
  { month: 'Mar', therapists: 18, clients: 192 },
  { month: 'Apr', therapists: 14, clients: 215 },
  { month: 'May', therapists: 22, clients: 248 },
  { month: 'Jun', therapists: 19, clients: 276 },
];

const activeUsersData = [
  { date: 'Mon', dau: 1245, mau: 3850 },
  { date: 'Tue', dau: 1380, mau: 3925 },
  { date: 'Wed', dau: 1520, mau: 4015 },
  { date: 'Thu', dau: 1450, mau: 4080 },
  { date: 'Fri', dau: 1680, mau: 4150 },
  { date: 'Sat', dau: 890, mau: 4150 },
  { date: 'Sun', dau: 720, mau: 4150 },
];

const sessionVolumeData = [
  { week: 'Week 1', videoCalls: 456, chatMessages: 2340, videoMinutes: 18240 },
  { week: 'Week 2', videoCalls: 512, chatMessages: 2580, videoMinutes: 20480 },
  { week: 'Week 3', videoCalls: 489, chatMessages: 2420, videoMinutes: 19560 },
  { week: 'Week 4', videoCalls: 534, chatMessages: 2690, videoMinutes: 21360 },
];

const retentionData = [
  { cohort: 'Jan 2024', retention: 87, churn: 13 },
  { cohort: 'Feb 2024', retention: 85, churn: 15 },
  { cohort: 'Mar 2024', retention: 89, churn: 11 },
  { cohort: 'Apr 2024', retention: 91, churn: 9 },
  { cohort: 'May 2024', retention: 88, churn: 12 },
  { cohort: 'Jun 2024', retention: 92, churn: 8 },
];

const systemHealthData = [
  { service: 'API Gateway', uptime: 99.8, avgResponse: 142 },
  { service: 'Video Server', uptime: 99.6, avgResponse: 89 },
  { service: 'Database', uptime: 99.9, avgResponse: 45 },
  { service: 'Auth Service', uptime: 99.7, avgResponse: 67 },
  { service: 'Storage', uptime: 99.9, avgResponse: 123 },
];

const slowEndpoints = [
  { endpoint: '/api/appointments/list', avgTime: 1850, calls: 12450, p95: 3200 },
  { endpoint: '/api/sessions/history', avgTime: 1620, calls: 8920, p95: 2800 },
  { endpoint: '/api/reports/generate', avgTime: 2340, calls: 1250, p95: 4100 },
  { endpoint: '/api/files/upload', avgTime: 1480, calls: 3680, p95: 2500 },
];

const errorLogs = [
  { type: 'Authentication Failed', count: 145, severity: 'warning', trend: -12 },
  { type: 'Database Timeout', count: 23, severity: 'critical', trend: 5 },
  { type: 'Rate Limit Exceeded', count: 89, severity: 'warning', trend: -8 },
  { type: 'Video Call Failed', count: 12, severity: 'high', trend: -3 },
  { type: 'File Upload Error', count: 34, severity: 'medium', trend: 2 },
];

// --- Animation Variants ---
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
};

const MetricCard = ({ title, value, trend, trendValue, icon: Icon, colorClass, subtitle }: any) => (
  <motion.div
    variants={itemVariants}
    whileHover={{ y: -2 }}
    className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all hover:shadow-md"
  >
    <div className="flex items-center justify-between">
      <div className={`rounded-xl p-2.5 ${colorClass} bg-opacity-10`}>
        <Icon className={`h-5 w-5 ${colorClass.replace('bg-', 'text-')}`} />
      </div>
      {trend && (
        <div className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
          {trend === 'up' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          {trendValue}
        </div>
      )}
    </div>
    <div className="mt-4">
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <h3 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{value}</h3>
      {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
    </div>
  </motion.div>
);

export function SuperAdminReports({ dateRange }: SuperAdminReportsProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 font-sans"
    >
      {/* Platform Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Therapists"
          value="125"
          icon={Users}
          trend="up"
          trendValue="+19"
          colorClass="bg-orange-500"
        />
        <MetricCard
          title="Total Clients"
          value="1,842"
          icon={UserPlus}
          trend="up"
          trendValue="+276"
          colorClass="bg-emerald-500"
        />
        <MetricCard
          title="Daily Active Users"
          value="1,520"
          icon={Activity}
          subtitle="4,150 monthly active"
          colorClass="bg-blue-500"
        />
        <MetricCard
          title="Platform Uptime"
          value="99.8%"
          icon={Server}
          trend="up"
          trendValue="Above SLA"
          colorClass="bg-violet-500"
        />
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* User Onboarding Trends - Large Card */}
        <motion.div variants={itemVariants} className="col-span-1 lg:col-span-8">
          <Card className="h-full border-slate-100 shadow-sm">
            <CardHeader>
              <CardTitle>User Onboarding Trends</CardTitle>
              <CardDescription>Therapists and clients joining the platform over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl">
                  <p className="text-sm font-medium text-orange-900 mb-1">Therapists</p>
                  <p className="text-2xl font-bold text-orange-900">125</p>
                  <p className="text-xs text-orange-700 mt-1">Avg 21/month</p>
                </div>
                <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                  <p className="text-sm font-medium text-blue-900 mb-1">Clients</p>
                  <p className="text-2xl font-bold text-blue-900">1,842</p>
                  <p className="text-xs text-blue-700 mt-1">Avg 307/month</p>
                </div>
                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                  <p className="text-sm font-medium text-emerald-900 mb-1">Ratio</p>
                  <p className="text-2xl font-bold text-emerald-900">14.7:1</p>
                  <p className="text-xs text-emerald-700 mt-1">Healthy balance</p>
                </div>
              </div>

              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={onboardingData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="therapists" fill="#f97316" name="Therapists" radius={[4, 4, 0, 0]} barSize={20} />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="clients"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                    name="Clients"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Platform Summary - Side Card */}
        <motion.div variants={itemVariants} className="col-span-1 lg:col-span-4">
          <Card className="h-full border-slate-100 shadow-sm bg-gradient-to-br from-slate-900 to-slate-800 text-white">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Shield className="h-5 w-5 text-emerald-400" />
                System Status
              </CardTitle>
              <CardDescription className="text-slate-300">Real-time platform health</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="p-4 bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-medium">All Systems Operational</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-slate-300">
                      <span>Uptime</span>
                      <span className="text-emerald-400">99.98%</span>
                    </div>
                    <Progress value={99.9} className="h-1.5 bg-white/10" indicatorClassName="bg-emerald-400" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-white/5 rounded-lg">
                    <Database className="h-4 w-4 text-blue-400 mb-2" />
                    <p className="text-xs text-slate-400">Database</p>
                    <p className="text-lg font-bold">Healthy</p>
                  </div>
                  <div className="p-3 bg-white/5 rounded-lg">
                    <Globe className="h-4 w-4 text-violet-400 mb-2" />
                    <p className="text-xs text-slate-400">CDN</p>
                    <p className="text-lg font-bold">Fast</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-300">Current Load</span>
                    <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full">Moderate</span>
                  </div>
                  <Progress value={65} className="h-1.5 bg-white/10" indicatorClassName="bg-amber-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Active Users */}
        <motion.div variants={itemVariants} className="col-span-1 lg:col-span-6">
          <Card className="h-full border-slate-100 shadow-sm">
            <CardHeader>
              <CardTitle>Active Users</CardTitle>
              <CardDescription>Daily vs Monthly engagement</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={activeUsersData}>
                  <defs>
                    <linearGradient id="colorDau" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorMau" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="dau"
                    stackId="1"
                    stroke="#f97316"
                    fill="url(#colorDau)"
                    name="Daily Active"
                  />
                  <Area
                    type="monotone"
                    dataKey="mau"
                    stackId="2"
                    stroke="#3b82f6"
                    fill="url(#colorMau)"
                    name="Monthly Active"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Retention & Churn */}
        <motion.div variants={itemVariants} className="col-span-1 lg:col-span-6">
          <Card className="h-full border-slate-100 shadow-sm">
            <CardHeader>
              <CardTitle>Retention & Churn</CardTitle>
              <CardDescription>User retention trends by cohort</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={retentionData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="cohort" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="retention"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                    name="Retention %"
                  />
                  <Line
                    type="monotone"
                    dataKey="churn"
                    stroke="#ef4444"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ r: 4, fill: '#ef4444', strokeWidth: 2, stroke: '#fff' }}
                    name="Churn %"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* System Health */}
        <motion.div variants={itemVariants} className="col-span-1 lg:col-span-8">
          <Card className="h-full border-slate-100 shadow-sm">
            <CardHeader>
              <CardTitle>System Health</CardTitle>
              <CardDescription>Service uptime and performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {systemHealthData.map((service) => (
                  <div key={service.service} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
                          <Server className="h-5 w-5 text-slate-600" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{service.service}</p>
                          <p className="text-sm text-slate-500">
                            Avg response: {service.avgResponse}ms
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge
                          variant={service.uptime >= 99.5 ? "default" : "destructive"}
                          className={service.uptime >= 99.5 ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : ""}
                        >
                          {service.uptime}% uptime
                        </Badge>
                      </div>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${service.uptime >= 99.5 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                        style={{ width: `${service.uptime}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Slow Endpoints */}
        <motion.div variants={itemVariants} className="col-span-1 lg:col-span-4">
          <Card className="h-full border-slate-100 shadow-sm">
            <CardHeader>
              <CardTitle>Slow Endpoints</CardTitle>
              <CardDescription>Optimization candidates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {slowEndpoints.map((endpoint, index) => (
                  <div
                    key={endpoint.endpoint}
                    className="p-3 border border-slate-100 rounded-xl hover:border-orange-200 hover:bg-orange-50/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 overflow-hidden">
                        <code className="text-xs font-mono bg-slate-100 text-slate-700 px-2 py-1 rounded block truncate">
                          {endpoint.endpoint}
                        </code>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">{endpoint.calls.toLocaleString()} calls</span>
                      <Badge
                        variant={endpoint.avgTime > 2000 ? "destructive" : "secondary"}
                        className="rounded-full"
                      >
                        {endpoint.avgTime}ms
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

      </div>
    </motion.div>
  );
}
