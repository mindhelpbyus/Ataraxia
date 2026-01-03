import React from 'react';
import { motion, Variants } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart
} from 'recharts';
import {
  Users, DollarSign, TrendingUp, Activity, Clock,
  AlertCircle, Calendar, FileText, Target, Briefcase,
  ArrowUpRight, ArrowDownRight, CheckCircle, Zap
} from 'lucide-react';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';

interface AdminReportsProps {
  dateRange: '7days' | '30days' | '90days' | '1year';
}

// --- Mock Data ---
const therapistPerformanceData = [
  { name: 'Dr. Sarah Johnson', sessions: 62, hours: 62.5, revenue: 9300, utilization: 87 },
  { name: 'Dr. Michael Chen', sessions: 58, hours: 60.0, revenue: 8700, utilization: 82 },
  { name: 'Dr. Emily Rodriguez', sessions: 54, hours: 55.5, revenue: 8100, utilization: 78 },
  { name: 'Dr. James Wilson', sessions: 48, hours: 49.0, revenue: 7200, utilization: 71 },
  { name: 'Dr. Amanda Lee', sessions: 52, hours: 53.5, revenue: 7800, utilization: 75 },
];

const attendanceTrendsData = [
  { month: 'Jan', showRate: 94, improvement: 2 },
  { month: 'Feb', showRate: 96, improvement: 2 },
  { month: 'Mar', showRate: 95, improvement: -1 },
  { month: 'Apr', showRate: 97, improvement: 2 },
  { month: 'May', showRate: 96, improvement: -1 },
  { month: 'Jun', showRate: 97, improvement: 1 },
];

const revenueByProviderData = [
  { therapist: 'S. Johnson', amount: 9300 },
  { therapist: 'M. Chen', amount: 8700 },
  { therapist: 'E. Rodriguez', amount: 8100 },
  { therapist: 'A. Lee', amount: 7800 },
  { therapist: 'J. Wilson', amount: 7200 },
];

const revenueByServiceData = [
  { name: 'Individual Therapy', value: 28500, color: '#F97316' },
  { name: 'Family Therapy', value: 8200, color: '#F59E0B' },
  { name: 'Group Therapy', value: 4100, color: '#10b981' },
  { name: 'Psychiatric Eval', value: 5800, color: '#3b82f6' },
  { name: 'Couples Therapy', value: 6200, color: '#8b5cf6' },
];

const roomUtilizationData = [
  { room: 'Room A', utilization: 85, sessions: 68 },
  { room: 'Room B', utilization: 78, sessions: 62 },
  { room: 'Room C', utilization: 72, sessions: 58 },
  { room: 'Room D', utilization: 65, sessions: 52 },
  { room: 'Virtual', utilization: 92, sessions: 147 },
];

const capacityForecastData = [
  { week: 'Week 1', capacity: 160, scheduled: 142, available: 18 },
  { week: 'Week 2', capacity: 160, scheduled: 155, available: 5 },
  { week: 'Week 3', capacity: 160, scheduled: 148, available: 12 },
  { week: 'Week 4', capacity: 160, scheduled: 158, available: 2 },
];

const clinicalOutcomesData = [
  { metric: 'PHQ-9 Improvement', baseline: 18.2, current: 12.4, change: -5.8, target: -6.0 },
  { metric: 'GAD-7 Reduction', baseline: 16.8, current: 10.2, change: -6.6, target: -5.0 },
  { metric: 'Client Satisfaction', baseline: 4.2, current: 4.7, change: 0.5, target: 4.5 },
  { metric: 'Treatment Adherence', baseline: 78, current: 89, change: 11, target: 85 },
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

const MetricCard = ({ title, value, trend, trendValue, icon: Icon, colorClass }: any) => (
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
    </div>
  </motion.div>
);

export function AdminReports({ dateRange }: AdminReportsProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 font-sans"
    >
      {/* Key Metrics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Sessions"
          value="274"
          icon={Calendar}
          trend="up"
          trendValue="+15%"
          colorClass="bg-orange-500"
        />
        <MetricCard
          title="Active Therapists"
          value="5"
          icon={Users}
          trend="up"
          trendValue="+1"
          colorClass="bg-emerald-500"
        />
        <MetricCard
          title="Total Revenue"
          value="$41,100"
          icon={DollarSign}
          trend="up"
          trendValue="+12%"
          colorClass="bg-blue-500"
        />
        <MetricCard
          title="Avg Utilization"
          value="78.6%"
          icon={Activity}
          trend="up"
          trendValue="+3.2%"
          colorClass="bg-violet-500"
        />
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Sessions by Therapist - Large Card */}
        <motion.div variants={itemVariants} className="col-span-1 lg:col-span-8">
          <Card className="h-full border-slate-100 shadow-sm">
            <CardHeader>
              <CardTitle>Sessions Delivered per Therapist</CardTitle>
              <CardDescription>Productivity and workload distribution across providers</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={therapistPerformanceData} layout="vertical" barSize={20}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis dataKey="name" type="category" width={150} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    cursor={{ fill: '#f1f5f9' }}
                  />
                  <Legend />
                  <Bar dataKey="sessions" fill="#F97316" name="Sessions" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="hours" fill="#F59E0B" name="Hours" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Clinical Outcomes - Side Card */}
        <motion.div variants={itemVariants} className="col-span-1 lg:col-span-4">
          <Card className="h-full border-slate-100 shadow-sm bg-gradient-to-br from-emerald-50 to-teal-50">
            <CardHeader>
              <CardTitle className="text-emerald-900 flex items-center gap-2">
                <Target className="h-5 w-5 text-emerald-600" />
                Clinical Outcomes
              </CardTitle>
              <CardDescription className="text-emerald-700">Key therapeutic progress indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {clinicalOutcomesData.map((outcome) => (
                  <div key={outcome.metric} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-emerald-900">{outcome.metric}</span>
                      <Badge
                        variant="secondary"
                        className="bg-white text-emerald-700 hover:bg-white"
                      >
                        {outcome.change > 0 ? '+' : ''}{outcome.change}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress
                        value={Math.min(100, (Math.abs(outcome.change) / Math.abs(outcome.target)) * 100)}
                        className="h-2 bg-emerald-200"
                        indicatorClassName="bg-emerald-500"
                      />
                    </div>
                    <div className="flex justify-between text-xs text-emerald-700">
                      <span>Current: {Math.abs(outcome.current)}</span>
                      <span>Target: {Math.abs(outcome.target)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Attendance Trends */}
        <motion.div variants={itemVariants} className="col-span-1 lg:col-span-6">
          <Card className="h-full border-slate-100 shadow-sm">
            <CardHeader>
              <CardTitle>Attendance Improvement</CardTitle>
              <CardDescription>Monthly show rate and trend analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={attendanceTrendsData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis domain={[90, 100]} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="showRate"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                    name="Show Rate %"
                  />
                </LineChart>
              </ResponsiveContainer>
              <div className="mt-4 p-3 bg-emerald-50 rounded-lg flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-emerald-900">Positive Trend</p>
                  <p className="text-xs text-emerald-700">Show rate improved by 3% over the last 6 months</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Revenue by Provider */}
        <motion.div variants={itemVariants} className="col-span-1 lg:col-span-6">
          <Card className="h-full border-slate-100 shadow-sm">
            <CardHeader>
              <CardTitle>Revenue by Provider</CardTitle>
              <CardDescription>Individual therapist revenue contribution</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueByProviderData} barSize={40}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="therapist" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(value) => `$${value / 1000}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: any) => [`$${value.toLocaleString()}`, 'Revenue']}
                    cursor={{ fill: '#f1f5f9' }}
                  />
                  <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Therapist Utilization */}
        <motion.div variants={itemVariants} className="col-span-1 lg:col-span-8">
          <Card className="h-full border-slate-100 shadow-sm">
            <CardHeader>
              <CardTitle>Therapist Utilization & Productivity</CardTitle>
              <CardDescription>Staff efficiency and capacity analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {therapistPerformanceData.map((therapist) => (
                  <div key={therapist.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
                          <Users className="h-5 w-5 text-slate-600" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{therapist.name}</p>
                          <p className="text-sm text-slate-500">
                            {therapist.sessions} sessions · {therapist.hours} hours
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                          ${therapist.revenue.toLocaleString()}
                        </Badge>
                        <div className="text-right w-24">
                          <p className="text-sm font-bold text-slate-900">{therapist.utilization}%</p>
                          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Utilization</p>
                        </div>
                      </div>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${therapist.utilization > 80 ? 'bg-emerald-500' :
                          therapist.utilization > 70 ? 'bg-blue-500' : 'bg-amber-500'
                          }`}
                        style={{ width: `${therapist.utilization}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Capacity Forecasting */}
        <motion.div variants={itemVariants} className="col-span-1 lg:col-span-4">
          <Card className="h-full border-slate-100 shadow-sm">
            <CardHeader>
              <CardTitle>Capacity Forecast</CardTitle>
              <CardDescription>Upcoming availability</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {capacityForecastData.map((week, i) => (
                  <div key={week.week} className="p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-slate-900">{week.week}</span>
                      <Badge variant={week.available < 10 ? "destructive" : "outline"}>
                        {week.available} hrs left
                      </Badge>
                    </div>
                    <div className="flex gap-1 h-2 mb-2">
                      <div className="bg-blue-500 rounded-l-full" style={{ width: `${(week.scheduled / week.capacity) * 100}%` }} />
                      <div className="bg-slate-200 rounded-r-full flex-1" />
                    </div>
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>{week.scheduled} scheduled</span>
                      <span>{week.capacity} total</span>
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
