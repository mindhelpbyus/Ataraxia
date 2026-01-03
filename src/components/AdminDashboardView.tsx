import React from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  CalendarDays,
  DollarSign,
  TrendingUp,
  Clock,
  BarChart3,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  ChevronRight,
  Activity
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Progress } from './ui/progress';

interface AdminDashboardViewProps {
  userId: string;
  userEmail: string;
  onNavigate: (tab: 'dashboard' | 'calendar' | 'clients' | 'notes' | 'messages' | 'tasks' | 'analytics' | 'settings') => void;
}

// --- Mock Data ---
const revenueMetrics = {
  daily: 4250,
  mtd: 127500,
  ytd: 1485000,
  forecast: 150000,
  forecastProgress: 85
};

const therapistMetrics = [
  { id: '1', name: 'Dr. Sarah Chen', avatar: 'SC', sessions: 28, completed: 26, revenue: 12600, utilization: 87, rating: 4.8 },
  { id: '2', name: 'Dr. Michael Roberts', avatar: 'MR', sessions: 32, completed: 30, revenue: 15400, utilization: 94, rating: 4.9 },
  { id: '3', name: 'Dr. Emily Thompson', avatar: 'ET', sessions: 24, completed: 22, revenue: 10200, utilization: 75, rating: 4.7 },
  { id: '4', name: 'Dr. James Wilson', avatar: 'JW', sessions: 30, completed: 28, revenue: 13800, utilization: 91, rating: 4.9 }
];

const weeklySessionsData = [
  { day: 'Mon', completed: 40, missed: 2 },
  { day: 'Tue', completed: 45, missed: 3 },
  { day: 'Wed', completed: 43, missed: 2 },
  { day: 'Thu', completed: 48, missed: 2 },
  { day: 'Fri', completed: 42, missed: 2 },
  { day: 'Sat', completed: 11, missed: 1 },
  { day: 'Sun', completed: 8, missed: 0 }
];

const performanceComparison = therapistMetrics.map(t => ({
  therapist: t.name.split(' ').slice(-1)[0],
  utilization: t.utilization,
  satisfaction: t.rating * 20,
  revenue: (t.revenue / 15400) * 100
}));

const clientJourneyData = [
  { stage: 'New Intake', count: 24, color: '#F97316' },
  { stage: 'Assigned', count: 18, color: '#F59E0B' },
  { stage: 'First Session', count: 15, color: '#10B981' },
  { stage: 'Active', count: 86, color: '#3B82F6' },
  { stage: 'Progress', count: 72, color: '#8B5CF6' }
];

// --- Premium Components ---

const PremiumMetricCard = ({ title, value, trend, trendValue, icon: Icon, colorClass, index }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.05 }}
    whileHover={{ y: -5 }}
    className="relative overflow-hidden rounded-[2rem] bg-white p-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] transition-all duration-300 hover:shadow-[0_8px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)] cursor-pointer group"
  >
    {/* Subtle gradient splash on hover */}
    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colorClass} opacity-0 group-hover:opacity-10 rounded-full blur-3xl -mr-10 -mt-10 transition-opacity duration-500`} />

    <div className="flex items-center justify-between mb-4 relative z-10">
      <div className={`rounded-2xl p-3 ${colorClass.replace('from-', 'bg-').split(' ')[0].replace('400', '50')} text-slate-700 group-hover:text-white group-hover:bg-slate-900 transition-colors duration-300`}>
        <Icon className="h-6 w-6" />
      </div>
      {trend && (
        <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${trend === 'up' ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'}`}>
          {trend === 'up' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          {trendValue}
        </span>
      )}
    </div>
    <div className="relative z-10">
      <h3 className="text-3xl font-bold tracking-tight text-slate-900 mb-1 font-sans">{value}</h3>
      <p className="text-sm font-medium text-slate-500 tracking-wide">{title}</p>
    </div>
  </motion.div>
);

export function AdminDashboardView({ userId, userEmail, onNavigate }: AdminDashboardViewProps) {
  const userName = userEmail.split('@')[0].split('.').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
  const today = new Date();

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
            Your practice is performing well today. Revenue is tracking <span className="text-emerald-600 font-semibold">+12%</span> above projection.
          </p>
        </div>

        <div className="flex gap-4">
          <Button variant="outline" onClick={() => onNavigate('analytics')} className="h-12 px-6 rounded-xl border-slate-200 text-slate-600 hover:bg-white hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm bg-white/50 backdrop-blur-sm">
            <BarChart3 className="mr-2 h-5 w-5" /> Insights
          </Button>
          <Button onClick={() => onNavigate('calendar')} className="h-12 px-6 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all">
            <CalendarDays className="mr-2 h-5 w-5" /> Schedule
          </Button>
        </div>
      </motion.div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-12 gap-8">

        {/* Row 1: Key Metrics */}
        <div className="col-span-12 xl:col-span-3 lg:col-span-6">
          <PremiumMetricCard
            title="Daily Revenue"
            value={`$${revenueMetrics.daily.toLocaleString()}`}
            trend="up"
            trendValue="+12%"
            icon={DollarSign}
            colorClass="from-emerald-400 to-teal-500"
            index={0}
          />
        </div>
        <div className="col-span-12 xl:col-span-3 lg:col-span-6">
          <PremiumMetricCard
            title="MTD Revenue"
            value={`$${revenueMetrics.mtd.toLocaleString()}`}
            trend="up"
            trendValue="85% Goal"
            icon={Target}
            colorClass="from-blue-400 to-indigo-500"
            index={1}
          />
        </div>
        <div className="col-span-12 xl:col-span-3 lg:col-span-6">
          <PremiumMetricCard
            title="Active Clients"
            value="215"
            trend="up"
            trendValue="+5 Net"
            icon={Users}
            colorClass="from-violet-400 to-purple-500"
            index={2}
          />
        </div>
        <div className="col-span-12 xl:col-span-3 lg:col-span-6">
          <PremiumMetricCard
            title="Avg Wait Time"
            value="8.5 days"
            trend="down"
            trendValue="-1.2 days"
            icon={Clock}
            colorClass="from-orange-400 to-amber-500"
            index={3}
          />
        </div>

        {/* Row 2: Charts Area - Clean & Borderless */}
        <div className="col-span-12 lg:col-span-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 h-[450px]"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">Session Volume</h3>
                <p className="text-slate-500 text-sm">Completed vs Missed Sessions</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-full border border-slate-100">
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                <span className="text-xs font-semibold text-slate-700">Live Updates</span>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={weeklySessionsData} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
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
            className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 h-[450px] flex flex-col"
          >
            <div className="mb-6">
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">Performance Radar</h3>
              <p className="text-slate-500 text-sm">Efficiency vs Satisfaction</p>
            </div>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={performanceComparison}>
                  <PolarGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                  <PolarAngleAxis dataKey="therapist" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name="Utilization" dataKey="utilization" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
                  <Radar name="Satisfaction" dataKey="satisfaction" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                  <Legend />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Row 3: Leaderboard & Pipeline */}
        <div className="col-span-12 lg:col-span-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden"
          >
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">Top Performers</h3>
                <p className="text-slate-500 text-sm">Based on revenue & satisfaction scores</p>
              </div>
              <Button variant="ghost" className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-full text-sm">
                View Full Report <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
            <div className="p-4">
              {therapistMetrics.map((therapist, i) => (
                <div key={therapist.id} className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition-colors group cursor-pointer duration-200">
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-slate-300 font-bold text-lg w-6">{i + 1}</span>
                    <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                      <AvatarFallback className="bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-700 font-bold">{therapist.avatar}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-bold text-slate-900 text-base">{therapist.name}</p>
                      <p className="text-slate-500 text-sm">{therapist.sessions} sessions completed</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-8 text-right">
                    <div>
                      <p className="font-bold text-slate-900">${(therapist.revenue / 1000).toFixed(1)}k</p>
                      <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Revenue</p>
                    </div>
                    <div className="w-32 hidden md:block">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-500">Capacity</span>
                        <span className="font-bold text-indigo-600">{therapist.utilization}%</span>
                      </div>
                      <Progress value={therapist.utilization} className="h-2 bg-slate-100" indicatorClassName="bg-indigo-500 rounded-full" />
                    </div>
                    <div className="flex items-center gap-1 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100">
                      <span className="font-bold text-amber-700">{therapist.rating}</span>
                      <span className="text-amber-500 text-xs text-shadow">★</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="col-span-12 lg:col-span-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8 h-full"
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
                      animate={{ width: `${(stage.count / 100) * 100}%` }}
                      transition={{ duration: 1.5, delay: index * 0.1, ease: 'easeOut' }}
                      className="h-full rounded-full shadow-[0_0_10px_rgba(0,0,0,0.1)]"
                      style={{ backgroundColor: stage.color }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-50">
              <Button variant="outline" className="w-full rounded-xl border-dashed border-slate-300 text-slate-500 hover:text-slate-700 hover:border-slate-400">
                View Pipeline Report
              </Button>
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  );
}