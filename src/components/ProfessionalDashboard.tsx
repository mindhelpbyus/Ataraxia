import React from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  DollarSign,
  Activity,
  Clock,
  CheckCircle,
  ArrowRight,
  Video,
  FileText,
  Plus,
  Mail,
  Zap,
  Heart,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  CalendarDays
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Progress } from './ui/progress';
import { UserRole } from '../types/appointment';

interface ProfessionalDashboardProps {
  userRole: UserRole;
  userEmail: string;
  onNavigate: (tab: 'dashboard' | 'calendar' | 'clients' | 'notes' | 'messages' | 'tasks' | 'analytics' | 'settings') => void;
}

// --- Mock Data ---
const todayAppointments = [
  { id: '1', time: '9:00 AM', client: 'Sarah Johnson', type: 'Initial Consultation', status: 'confirmed', duration: '60 min', initials: 'SJ', color: 'bg-emerald-100 text-emerald-700' },
  { id: '2', time: '10:30 AM', client: 'Michael Chen', type: 'Follow-up Session', status: 'confirmed', duration: '45 min', initials: 'MC', color: 'bg-blue-100 text-blue-700' },
  { id: '3', time: '2:00 PM', client: 'Emma Davis', type: 'Therapy Session', status: 'pending', duration: '60 min', initials: 'ED', color: 'bg-violet-100 text-violet-700' },
  { id: '4', time: '3:30 PM', client: 'James Wilson', type: 'Progress Review', status: 'confirmed', duration: '45 min', initials: 'JW', color: 'bg-amber-100 text-amber-700' }
];

const recentActivity = [
  { id: '1', action: 'New client registered', client: 'Alex Martinez', time: '2 hours ago', type: 'client', icon: Users, color: 'text-blue-600 bg-blue-50' },
  { id: '2', action: 'Appointment completed', client: 'Sarah Johnson', time: '3 hours ago', type: 'appointment', icon: CheckCircle, color: 'text-emerald-600 bg-emerald-50' },
  { id: '3', action: 'Session notes submitted', client: 'Michael Chen', time: '5 hours ago', type: 'notes', icon: FileText, color: 'text-violet-600 bg-violet-50' }
];

// --- Components ---

const MetricCard = ({ title, value, trend, trendValue, icon: Icon, colorClass }: any) => (
  <motion.div
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

export function ProfessionalDashboard({ userRole, userEmail, onNavigate }: ProfessionalDashboardProps) {
  const userName = userEmail.split('@')[0].split('.').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
  const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="min-h-screen bg-background p-8 font-sans">
      {/* Header */}
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">{greeting}, {userName}</h1>
          <p className="mt-2 text-slate-500">Here's your schedule and activity for today.</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => onNavigate('calendar')} className="!bg-indigo-600 !text-white hover:!bg-indigo-700 shadow-sm">
            <Plus className="mr-2 h-4 w-4" /> New Appointment
          </Button>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-12 gap-6">

        {/* Row 1: Key Metrics */}
        <div className="col-span-3">
          <MetricCard
            title="Today's Clients"
            value="4"
            trend="up"
            trendValue="+2"
            icon={Users}
            colorClass="bg-blue-500"
          />
        </div>
        <div className="col-span-3">
          <MetricCard
            title="This Week"
            value="18"
            trend="up"
            trendValue="+3"
            icon={Calendar}
            colorClass="bg-emerald-500"
          />
        </div>
        <div className="col-span-3">
          <MetricCard
            title="Active Clients"
            value="28"
            trend="up"
            trendValue="+5"
            icon={Activity}
            colorClass="bg-violet-500"
          />
        </div>
        <div className="col-span-3">
          <MetricCard
            title="Pending Notes"
            value="2"
            trend="down"
            trendValue="-1"
            icon={FileText}
            colorClass="bg-orange-500"
          />
        </div>

        {/* Row 2: Schedule & Quick Actions */}
        <div className="col-span-8 row-span-2">
          <Card className="h-full border-slate-100 shadow-sm">
            <CardHeader className="pb-4 border-b border-slate-50">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Today's Schedule</CardTitle>
                  <CardDescription>You have {todayAppointments.length} appointments today</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => onNavigate('calendar')}>
                  View Calendar <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-50">
                {todayAppointments.map((apt) => (
                  <div key={apt.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center gap-4 group">
                    <div className="w-20 text-center">
                      <p className="font-bold text-slate-900">{apt.time.split(' ')[0]}</p>
                      <p className="text-xs text-slate-500">{apt.time.split(' ')[1]}</p>
                    </div>
                    <div className="h-10 w-1 rounded-full bg-slate-200 group-hover:bg-indigo-500 transition-colors" />
                    <Avatar className="h-10 w-10 border border-slate-100">
                      <AvatarFallback className={apt.color}>{apt.initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-slate-900">{apt.client}</p>
                        <Badge variant="secondary" className={`text-xs ${apt.status === 'confirmed' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                          }`}>
                          {apt.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><FileText className="h-3 w-3" /> {apt.type}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {apt.duration}</span>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" className="opacity-0 group-hover:opacity-100 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
                      <Video className="mr-2 h-4 w-4" /> Join
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-4">
          <Card className="border-slate-100 shadow-sm bg-gradient-to-br from-indigo-600 to-violet-700 text-white">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-300" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="secondary"
                className="w-full justify-start bg-white/10 hover:bg-white/20 text-white border-none h-12"
                onClick={() => onNavigate('clients')}
              >
                <Users className="mr-3 h-5 w-5" /> Add New Client
              </Button>
              <Button
                variant="secondary"
                className="w-full justify-start bg-white/10 hover:bg-white/20 text-white border-none h-12"
                onClick={() => onNavigate('notes')}
              >
                <FileText className="mr-3 h-5 w-5" /> Write Session Notes
              </Button>
              <Button
                variant="secondary"
                className="w-full justify-start bg-white/10 hover:bg-white/20 text-white border-none h-12"
                onClick={() => onNavigate('messages')}
              >
                <Mail className="mr-3 h-5 w-5" /> Send Message
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Row 3: Activity & Goals */}
        <div className="col-span-4">
          <Card className="border-slate-100 shadow-sm h-full">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex gap-3">
                    <div className={`mt-1 p-1.5 rounded-full ${activity.color}`}>
                      <activity.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{activity.action}</p>
                      <p className="text-xs text-slate-500">{activity.client} • {activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-4">
          <Card className="border-slate-100 shadow-sm h-full bg-gradient-to-br from-amber-50 to-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-900">
                <Star className="h-5 w-5 text-amber-500" /> Weekly Goal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="flex items-end gap-2 mb-2">
                  <span className="text-4xl font-bold text-amber-900">18</span>
                  <span className="text-sm text-amber-700 mb-1">/ 20 sessions</span>
                </div>
                <Progress value={90} className="h-2 bg-amber-200" indicatorClassName="bg-amber-500" />
              </div>
              <p className="text-sm text-amber-800">You're 90% there! Just 2 more sessions to reach your weekly target.</p>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-4">
          <Card className="border-slate-100 shadow-sm h-full">
            <CardHeader>
              <CardTitle>Client Satisfaction</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-slate-900">4.9</span>
                    <span className="text-sm text-slate-500">/ 5.0</span>
                  </div>
                  <p className="text-xs text-emerald-600 font-medium mt-1">Top 5% of therapists</p>
                </div>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-5 w-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>5 Stars</span>
                  <span>92%</span>
                </div>
                <Progress value={92} className="h-1.5" indicatorClassName="bg-amber-400" />
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
