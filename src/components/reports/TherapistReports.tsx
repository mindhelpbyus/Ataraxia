import React from 'react';
import { motion, Variants } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart
} from 'recharts';
import {
  TrendingUp, TrendingDown, DollarSign, Calendar,
  Users, Clock, FileText, AlertCircle, Activity,
  ArrowUpRight, ArrowDownRight, CheckCircle
} from 'lucide-react';
import { Badge } from '../ui/badge';

interface TherapistReportsProps {
  currentUserId: string;
  userEmail: string;
  dateRange: '7days' | '30days' | '90days' | '1year';
}

// --- Mock Data ---
const appointmentAttendanceData = [
  { month: 'Jan', scheduled: 45, completed: 40, noShows: 3, cancellations: 2 },
  { month: 'Feb', scheduled: 52, completed: 48, noShows: 2, cancellations: 2 },
  { month: 'Mar', scheduled: 48, completed: 45, noShows: 1, cancellations: 2 },
  { month: 'Apr', scheduled: 55, completed: 50, noShows: 3, cancellations: 2 },
  { month: 'May', scheduled: 60, completed: 55, noShows: 2, cancellations: 3 },
  { month: 'Jun', scheduled: 58, completed: 54, noShows: 2, cancellations: 2 },
];

const bookingTrendsData = [
  { week: 'Week 1', bookings: 12, avgPerDay: 2.4 },
  { week: 'Week 2', bookings: 15, avgPerDay: 3.0 },
  { week: 'Week 3', bookings: 13, avgPerDay: 2.6 },
  { week: 'Week 4', bookings: 14, avgPerDay: 2.8 },
];

const cptCodeData = [
  { code: '90834', name: 'Individual Therapy (45 min)', count: 85, revenue: 12750 },
  { code: '90837', name: 'Individual Therapy (60 min)', count: 42, revenue: 7140 },
  { code: '90791', name: 'Diagnostic Evaluation', count: 15, revenue: 2550 },
  { code: '90847', name: 'Family Therapy', count: 12, revenue: 1920 },
  { code: '90853', name: 'Group Therapy', count: 8, revenue: 960 },
];

const workloadData = [
  { week: 'Week 1', sessions: 14, hours: 14.5 },
  { week: 'Week 2', sessions: 16, hours: 16.0 },
  { week: 'Week 3', sessions: 15, hours: 15.5 },
  { week: 'Week 4', sessions: 17, hours: 17.5 },
];

const cptRevenueSplit = [
  { name: '90834 (45min)', value: 12750, color: '#10b981' }, // Emerald
  { name: '90837 (60min)', value: 7140, color: '#3b82f6' }, // Blue
  { name: '90791 (Eval)', value: 2550, color: '#8b5cf6' }, // Violet
  { name: 'Other', value: 2880, color: '#f59e0b' }, // Amber
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

const MetricCard = ({ title, value, trend, trendValue, icon: Icon, colorClass, delay = 0 }: any) => (
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

export function TherapistReports({ currentUserId, userEmail, dateRange }: TherapistReportsProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 font-sans"
    >
      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Sessions"
          value="162"
          icon={Calendar}
          trend="up"
          trendValue="+12%"
          colorClass="bg-blue-500"
        />
        <MetricCard
          title="No-Show Rate"
          value="3.2%"
          icon={AlertCircle}
          trend="down"
          trendValue="-1.5%"
          colorClass="bg-rose-500"
        />
        <MetricCard
          title="Total Billed"
          value="$25,320"
          icon={DollarSign}
          trend="up"
          trendValue="+8%"
          colorClass="bg-emerald-500"
        />
        <MetricCard
          title="Hours Worked"
          value="63.5"
          icon={Clock}
          trend="up"
          trendValue="Avg 15.9/wk"
          colorClass="bg-violet-500"
        />
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Appointments & Attendance Analytics - Large Card */}
        <motion.div variants={itemVariants} className="col-span-1 lg:col-span-8">
          <Card className="h-full border-slate-100 shadow-sm">
            <CardHeader>
              <CardTitle>Appointments & Attendance</CardTitle>
              <CardDescription>Track scheduling patterns, no-shows, and cancellations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="bg-rose-50 border border-rose-100 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-rose-900">No-Shows</p>
                    <AlertCircle className="h-5 w-5 text-rose-600" />
                  </div>
                  <p className="text-2xl font-bold text-rose-900 mb-1">13</p>
                  <p className="text-xs text-rose-700">3.2% of scheduled appointments</p>
                </div>
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-amber-900">Cancellations</p>
                    <Calendar className="h-5 w-5 text-amber-600" />
                  </div>
                  <p className="text-2xl font-bold text-amber-900 mb-1">13</p>
                  <p className="text-xs text-amber-700">3.2% of scheduled appointments</p>
                </div>
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-emerald-900">Completion Rate</p>
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                  </div>
                  <p className="text-2xl font-bold text-emerald-900 mb-1">93.6%</p>
                  <p className="text-xs text-emerald-700">Above industry average</p>
                </div>
              </div>

              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={appointmentAttendanceData} barSize={20}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    cursor={{ fill: '#f1f5f9' }}
                  />
                  <Legend iconType="circle" />
                  <Bar dataKey="completed" fill="#10b981" name="Completed" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="noShows" fill="#f43f5e" name="No-Shows" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="cancellations" fill="#f59e0b" name="Cancellations" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Revenue Summary - Side Card */}
        <motion.div variants={itemVariants} className="col-span-1 lg:col-span-4">
          <Card className="h-full border-slate-100 shadow-sm bg-gradient-to-br from-slate-900 to-slate-800 text-white">
            <CardHeader>
              <CardTitle className="text-white">Revenue Summary</CardTitle>
              <CardDescription className="text-slate-300">Financial overview for the selected period</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl">
                  <div>
                    <p className="text-sm text-slate-300">Total Billed</p>
                    <p className="text-3xl font-bold text-white">$25,320</p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-emerald-400" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-300">Collected</span>
                    <span className="text-sm font-medium text-white">$23,150</span>
                  </div>
                  <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-[91.4%]" />
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>91.4% Collection Rate</span>
                    <span>Target: 95%</span>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-300">Outstanding</span>
                    <span className="text-sm font-medium text-amber-400">$2,170</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    3 invoices overdue by 30+ days
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Booking Trends */}
        <motion.div variants={itemVariants} className="col-span-1 lg:col-span-6">
          <Card className="h-full border-slate-100 shadow-sm">
            <CardHeader>
              <CardTitle>Booking Trends</CardTitle>
              <CardDescription>Weekly appointment booking patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={bookingTrendsData}>
                  <defs>
                    <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="bookings"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorBookings)"
                    name="Bookings"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* CPT Revenue Split */}
        <motion.div variants={itemVariants} className="col-span-1 lg:col-span-6">
          <Card className="h-full border-slate-100 shadow-sm">
            <CardHeader>
              <CardTitle>Revenue by Procedure</CardTitle>
              <CardDescription>Distribution by CPT code</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div className="w-1/2">
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={cptRevenueSplit}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {cptRevenueSplit.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-1/2 space-y-3">
                  {cptRevenueSplit.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-700">{item.name}</p>
                        <p className="text-xs text-slate-500">${item.value.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Most Used CPT Codes */}
        <motion.div variants={itemVariants} className="col-span-1 lg:col-span-6">
          <Card className="h-full border-slate-100 shadow-sm">
            <CardHeader>
              <CardTitle>Top Procedure Codes</CardTitle>
              <CardDescription>Frequency and revenue by CPT code</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cptCodeData.map((cpt, index) => (
                  <div key={cpt.code} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-slate-100 text-slate-600 font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="font-mono text-xs bg-white">
                          {cpt.code}
                        </Badge>
                        <span className="text-sm font-medium text-slate-900">{cpt.name}</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span>{cpt.count} sessions</span>
                        <span className="text-emerald-600 font-medium">${cpt.revenue.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium text-slate-900">${(cpt.revenue / cpt.count).toFixed(0)}</p>
                      <p className="text-[10px] text-slate-500">avg/session</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Workload Analysis */}
        <motion.div variants={itemVariants} className="col-span-1 lg:col-span-6">
          <Card className="h-full border-slate-100 shadow-sm">
            <CardHeader>
              <CardTitle>Workload Analysis</CardTitle>
              <CardDescription>Sessions delivered vs. hours worked</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="p-3 bg-blue-50 rounded-lg text-center">
                  <p className="text-xs text-blue-600 font-medium uppercase tracking-wider mb-1">Sessions/Wk</p>
                  <p className="text-xl font-bold text-blue-900">15.5</p>
                </div>
                <div className="p-3 bg-violet-50 rounded-lg text-center">
                  <p className="text-xs text-violet-600 font-medium uppercase tracking-wider mb-1">Hours/Wk</p>
                  <p className="text-xl font-bold text-violet-900">15.9</p>
                </div>
                <div className="p-3 bg-indigo-50 rounded-lg text-center">
                  <p className="text-xs text-indigo-600 font-medium uppercase tracking-wider mb-1">Avg Duration</p>
                  <p className="text-xl font-bold text-indigo-900">61m</p>
                </div>
              </div>

              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={workloadData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="sessions"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                    name="Sessions"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="hours"
                    stroke="#8b5cf6"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 2, stroke: '#fff' }}
                    name="Hours"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

      </div>
    </motion.div>
  );
}
