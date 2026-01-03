import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import {
  CalendarDays,
  Users,
  ClipboardList,
  FileText,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  Clock,
  UserPlus,
  CheckCircle2,
  Video,
  Coffee,
  Sun,
  Moon,
  CloudSun
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getTherapistAppointments } from '../api/appointmentsBackend';
import { dataService } from '../api';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isFuture, parseISO, getHours } from 'date-fns';

interface TherapistHomeViewProps {
  userId: string;
  userEmail: string;
  onNavigate: (tab: 'dashboard' | 'calendar' | 'clients' | 'notes' | 'messages' | 'tasks' | 'analytics' | 'settings') => void;
}

// Get user name from email
const getUserName = (email: string) => {
  const name = email.split('@')[0];
  return name.split('.').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
};

// --- Soulful Components ---

// 1. Empathetic Header with Time Awareness
const SoulfulHeader = ({ userName, count, onNavigate }: { userName: string, count: number, onNavigate: any }) => {
  const hour = getHours(new Date());

  let greeting = "Good morning";
  let Icon = Sun;
  let bgGradient = "from-orange-400 via-amber-500 to-amber-600";
  let message = "Let's bring some light to your patients' lives today.";

  if (hour >= 12 && hour < 17) {
    greeting = "Good afternoon";
    Icon = CloudSun;
    bgGradient = "from-blue-400 via-sky-500 to-sky-600";
    message = "Hope your day is flowing smoothly.";
  } else if (hour >= 17) {
    greeting = "Good evening";
    Icon = Moon;
    bgGradient = "from-indigo-900 via-slate-800 to-slate-900";
    message = "Time to wrap up and rest.";
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br ${bgGradient} shadow-2xl shadow-orange-900/10 mb-10`}
    >
      <div className="absolute inset-0 bg-white/5 backdrop-blur-[2px]" />
      {/* Organic Shapes */}
      <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-white/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 -mb-32 -ml-20 w-80 h-80 bg-black/10 rounded-full blur-3xl" />

      <div className="relative z-10 p-10 flex items-center justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-3 font-medium tracking-wide text-sm uppercase">
            <Icon className="w-5 h-5" />
            <span>{format(new Date(), 'EEEE, MMMM do')}</span>
          </div>
          <h1 className="text-5xl font-bold tracking-tighter">
            {greeting}, {userName.split(' ')[0]}.
          </h1>
          <p className="text-xl font-light max-w-lg leading-relaxed">
            {message} You have <span className="font-bold underline underline-offset-4">{count} sessions</span> remaining.
          </p>
        </div>

        <div className="hidden md:block">
          <Button
            onClick={() => onNavigate('calendar')}
            className="bg-primary/20 hover:bg-primary/30 border-primary/20 border backdrop-blur-md shadow-xl rounded-2xl px-8 h-14 text-lg transition-all hover:scale-105 active:scale-95"
          >
            <CalendarDays className="h-5 w-5 mr-3" />
            View Calendar
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

// 2. Breathing Stats Cards
const BreathingStatCard = ({ icon: Icon, label, value, trend, index, delay }: any) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5, delay: delay }}
    whileHover={{ y: -5, boxShadow: "0 20px 40px -10px rgba(0,0,0,0.1)" }}
    className="group relative bg-card border border-border p-6 rounded-3xl shadow-sm overflow-hidden"
  >
    <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
      <div className="w-20 h-20 bg-primary/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700" />
    </div>

    <div className="relative z-10 flex flex-col h-full justify-between gap-4">
      <div className="flex justify-between items-start">
        <div className="p-3 bg-secondary rounded-2xl text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300 shadow-sm">
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <Badge variant="secondary" className="bg-green-50 text-green-700 border-0">
            {trend}
          </Badge>
        )}
      </div>

      <div>
        <h3 className="text-4xl font-bold text-foreground tracking-tighter mb-1 font-sans">{value}</h3>
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
      </div>
    </div>
  </motion.div>
);


export function TherapistHomeView({ userId, userEmail, onNavigate }: TherapistHomeViewProps) {
  const userName = getUserName(userEmail);
  const [loading, setLoading] = useState(true);

  // Metrics State
  const [todaySessionsCount, setTodaySessionsCount] = useState(0);
  const [monthSessions, setMonthSessions] = useState(0);
  const [pendingNotes, setPendingNotes] = useState(0);
  const [riskAlerts, setRiskAlerts] = useState<any[]>([]);
  const [todaySchedule, setTodaySchedule] = useState<any[]>([]);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [revenueThisMonth, setRevenueThisMonth] = useState(0);
  const [activeClients, setActiveClients] = useState(0);

  useEffect(() => {
    loadDashboardData();
  }, [userId]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const now = new Date();
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);

      const data = await getTherapistAppointments(userId, {
        startDate: monthStart.toISOString(),
        endDate: monthEnd.toISOString()
      });

      const alerts = await dataService.list('risk_alerts', { therapistId: userId });
      setRiskAlerts(alerts || []);

      calculateMetrics(data);
    } catch (error: any) {
      console.error("Failed to load dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = (data: any[]) => {
    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);
    const weekStart = startOfWeek(now);
    const weekEnd = endOfWeek(now);
    const monthStart = startOfMonth(now);

    const todaySessions = data.filter(apt => {
      const aptDate = parseISO(apt.startTime);
      return aptDate >= todayStart && aptDate <= todayEnd;
    });
    setTodaySessionsCount(todaySessions.length);
    setTodaySchedule(todaySessions);

    const completedThisMonth = data.filter(apt =>
      apt.status === 'completed' && parseISO(apt.startTime) >= monthStart
    );
    setMonthSessions(completedThisMonth.length);

    const pending = data.filter(apt =>
      apt.status === 'completed' && (!apt.notes || apt.notes.trim() === '')
    );
    setPendingNotes(pending.length);

    const weeklyStats = Array(7).fill(0).map((_, i) => ({
      day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
      sessions: 0
    }));

    data.forEach(apt => {
      const aptDate = parseISO(apt.startTime);
      if (aptDate >= weekStart && aptDate <= weekEnd) {
        let dayIndex = aptDate.getDay() - 1;
        if (dayIndex < 0) dayIndex = 6;
        if (weeklyStats[dayIndex]) weeklyStats[dayIndex].sessions++;
      }
    });
    setWeeklyData(weeklyStats);

    setRevenueThisMonth(completedThisMonth.length * 150);
    setActiveClients(new Set(data.map(apt => apt.clientId)).size);
  };

  return (
    <div className="min-h-full font-sans">
      <div className="max-w-[1600px] mx-auto p-6 lg:p-10">

        <SoulfulHeader userName={userName} count={todaySessionsCount} onNavigate={onNavigate} />

        {/* Bento Grid Layout - Soulful Edition */}
        <div className="grid grid-cols-12 gap-8">

          {/* Row 1: The Essential "Pulse" of the practice */}
          <div className="col-span-12 lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <BreathingStatCard
              index={0} delay={0.1}
              icon={Users}
              label="Active Patients"
              value={activeClients}
              trend="+3 this week"
            />
            <BreathingStatCard
              index={1} delay={0.2}
              icon={CheckCircle2}
              label="Monthly Impact"
              value={monthSessions}
              trend="Sessions held"
            />
            <BreathingStatCard
              index={2} delay={0.3}
              icon={DollarSign}
              label="Est. Revenue"
              value={`$${revenueThisMonth.toLocaleString()}`}
              trend="Solid growth"
            />
          </div>

          <div className="col-span-12 lg:col-span-4">
            {/* Quick Action / Focus Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="h-full bg-card rounded-3xl p-8 border border-border shadow-sm flex flex-col justify-center items-center text-center relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
              <div className="p-4 bg-primary/10 text-primary rounded-full mb-4">
                <Coffee className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Take a moment</h3>
              <p className="text-muted-foreground mb-6">Between sessions, remember to breathe. You're doing important work.</p>
              <div className="flex gap-2 w-full">
                <Button variant="outline" className="flex-1 rounded-xl h-12 border-border" onClick={() => onNavigate('notes')}>
                  Notes ({pendingNotes})
                </Button>
                <Button className="flex-1 rounded-xl h-12 bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => onNavigate('calendar')}>
                  Schedule
                </Button>
              </div>
            </motion.div>
          </div>

          {/* Row 2: The Timeline "Journey" */}
          <div className="col-span-12 lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-card rounded-[2rem] border border-border shadow-sm p-8 h-full"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-foreground tracking-tight">Today's Journey</h2>
                  <p className="text-muted-foreground">Your scheduled flow for the day</p>
                </div>
                <div className="flex -space-x-3">
                  {/* Mock avatars of upcoming patients for delight */}
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-background bg-secondary flex items-center justify-center text-xs font-medium text-muted-foreground">
                      P{i}
                    </div>
                  ))}
                  <div className="w-10 h-10 rounded-full border-2 border-background bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                    +{todaySessionsCount > 3 ? todaySessionsCount - 3 : 0}
                  </div>
                </div>
              </div>

              <div className="relative pl-8 space-y-8 before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-border">
                {todaySchedule.length > 0 ? todaySchedule.map((session, i) => (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + (i * 0.1) }}
                    className="relative group"
                  >
                    {/* Timeline Node */}
                    <div className={`absolute -left-[2.2rem] top-1 w-4 h-4 rounded-full border-[3px] border-background ring-1 ring-border ${session.status === 'confirmed' ? 'bg-primary shadow-[0_0_0_4px_rgba(234,88,12,0.1)]' : 'bg-muted'}`} />

                    <div className="bg-secondary/50 hover:bg-primary/5 p-5 rounded-2xl transition-colors border border-transparent hover:border-sidebar-primary/20 cursor-pointer">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-bold text-foreground text-lg">{session.clientName}</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {format(parseISO(session.startTime), 'h:mm a')} - {format(parseISO(session.endTime), 'h:mm a')}
                            <span className="w-1 h-1 rounded-full bg-border mx-1" />
                            <Video className="w-3 h-3" />
                            Video Call
                          </div>
                        </div>
                        <Badge variant="outline" className={`border-0 ${session.status === 'confirmed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-secondary text-muted-foreground'}`}>
                          {session.status}
                        </Badge>
                      </div>
                    </div>
                  </motion.div>
                )) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                      <Coffee className="w-8 h-8 opacity-50" />
                    </div>
                    <p>No more sessions today. Enjoy your peace.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Row 2 Right: Weekly Insight */}
          <div className="col-span-12 lg:col-span-5">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-card rounded-[2rem] p-8 text-foreground border border-border h-full shadow-sm relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-[100px] pointer-events-none" />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight">Weekly Rhythms</h2>
                    <p className="text-muted-foreground">Session consistency</p>
                  </div>
                  <div className="p-3 bg-secondary rounded-2xl backdrop-blur-md">
                    <TrendingUp className="w-6 h-6 text-orange-500" />
                  </div>
                </div>

                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                      <XAxis
                        dataKey="day"
                        tick={{ fill: '#6b7280', fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                        dy={10}
                      />
                      <Tooltip
                        cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          border: '1px solid #e5e7eb',
                          borderRadius: '12px',
                          color: '#1a1a2e',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Bar
                        dataKey="sessions"
                        fill="#f97316"
                        radius={[6, 6, 6, 6]}
                        barSize={12}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </div>
  );
}