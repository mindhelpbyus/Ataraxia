import React, { useState, useEffect } from 'react';
import { get } from '../api/client';
import { dataService } from '../api';
import { getTherapistAppointments, type AppointmentDetails } from '../api/appointmentsBackend';
import { Search, Filter, Plus, MoreVertical, Phone, Mail, Calendar, User, AlertCircle, TrendingUp, AlertTriangle, Shield, Brain, CheckCircle2, Stethoscope, Clock, FileText, ChevronRight, Eye, Send, Sparkles, ShieldAlert, Files, MessageSquare, Activity, Target, Upload, XCircle, Download, Video } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { EditClientProfileForm } from './EditClientProfileForm';
import { Separator } from './ui/separator';
import { Label } from './ui/label';
import { PhoneInputV2 } from './PhoneInputV2';

import { toast } from 'sonner';
import { Switch } from './ui/switch';
import { Sheet, SheetContent } from './ui/sheet';
import { ClientDetailData } from './ClientDetailView';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'new';
  lastVisit: string;
  nextAppointment: string | null;
  therapist: string;
  totalSessions: number;
  condition: string;
  safetyRisk?: 'low' | 'moderate' | 'high';
  safetyFlags?: string[];
}

interface ProfessionalClientsViewProps {
  userRole: 'admin' | 'therapist' | 'superadmin' | 'client' | string;
  currentUserId?: string;
}

// Helper to map simple Client data to detailed view data
// Helper to map simple Client data to detailed view data
const mapClientToDetailData = (client: Client): ClientDetailData => {
  const [firstName, lastName] = client.name.split(' ');

  // Return a structured object with default values.
  // In a real application, you would likely fetch this detailed data from an API
  // based on the client.id, or the initial client object would already contain more details.
  return {
    clientId: client.id,
    profile: {
      identity: {
        firstName: firstName || '',
        lastName: lastName || '',
        preferredName: firstName || '',
        dob: '', // Placeholder
        age: 0, // Placeholder
        pronouns: '', // Placeholder
        gender: '', // Placeholder
        avatarUrl: undefined
      },
      status: {
        accountStatus: client.status,
        riskLevel: client.safetyRisk || 'low',
        riskColor: client.safetyRisk === 'high' ? 'red' : 'green',
        riskBanner: client.safetyRisk === 'high' ? 'Client has reported recent suicidal ideation. Safety plan is active.' : undefined,
        therapyStatus: 'Active Treatment'
      },
      contact: {
        email: client.email,
        phone: client.phone,
        emergencyContact: {
          name: '',
          relationship: '',
          phone: ''
        },
        location: {
          country: '',
          addressLine1: '',
          city: '',
          state: '',
          postalCode: '',
          timezone: ''
        }
      }
    },
    sessions: {
      stats: {
        totalSessions: client.totalSessions || 0,
        cancelled: 0,
        noShows: 0,
        frequency: 'Weekly'
      },
      nextSession: client.nextAppointment ? {
        sessionId: 'future-1',
        date: client.nextAppointment,
        startTime: '',
        mode: 'Video',
        joinUrl: '#',
        status: 'Scheduled'
      } : undefined,
      lastSession: client.lastVisit !== 'N/A' ? {
        sessionId: 'past-1',
        date: client.lastVisit,
        startTime: '',
        summary: 'Session summary not available.',
        goalsDiscussed: [],
        actionItems: [],
        fullNoteUrl: '#'
      } : undefined
    },
    clinical: {
      diagnoses: {
        primary: { code: '', description: client.condition },
        secondary: [],
        provisional: []
      },
      medications: [],
      treatmentPlan: {
        mainGoal: '',
        subGoals: [],
        modality: '',
        progress: 'on_track',
        progressPercent: 0
      },
      safety: {
        riskLevel: client.safetyRisk || 'low',
        lastSafetyAssessment: {
          type: '',
          date: '',
          score: 0,
          suicidalIdeation: 'no'
        },
        safetyPlanUrl: '#'
      }
    },
    assessments: {
      latest: {},
      history: {
        PHQ9: [],
        GAD7: [],
        dates: []
      }
    },
    background: {
      presentingProblem: '',
      clientHistory: {
        previousTherapy: '',
        traumaHistory: '',
        medicalConditions: [],
        substanceUse: ''
      },
      personalContext: {
        relationshipStatus: '',
        household: '',
        employment: { status: '', occupation: '' }
      }
    },
    documents: {
      notesCount: 0,
      documentsCount: 0,
      assessmentsCount: 0,
      links: { notes: '#', documents: '#', assessments: '#' }
    },
    billing: {
      insuranceProvider: '',
      copay: 0,
      claims: [],
      outstandingBalance: 0
    },
    communication: {
      unreadMessages: 0,
      threadsUrl: '#'
    },
    aiInsights: {
      progressSummary: 'No insights available yet.',
      documentationAlerts: [],
      trendAlerts: []
    }
  };
};



export function ProfessionalClientsView({ userRole, currentUserId }: ProfessionalClientsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [newClient, setNewClient] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    countryCode: '+1',
    sendLink: true
  });

  const [clients, setClients] = useState<Client[]>([]);
  const [, setLoading] = useState(true);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    interface BackendClient {
      id: number;
      email: string;
      firstName: string;
      lastName: string;
      createdAt?: string;
      profilePhoto?: string | null;
    }
    try {
      // backend-initial: therapists see only their clients; admins see all.
      //   therapist → GET /therapist/{id}/clients → { data: { assignedClients, appointmentClients } }
      //   admin     → GET /clients                → { data: BackendClient[] }
      let rows: BackendClient[];
      // Per-client session stats joined from the therapist's own appointments.
      const sessionStats = new Map<number, { total: number; next: string | null; last: string | null }>();

      if (userRole === 'therapist' && currentUserId) {
        const [clientsRes, appointments] = await Promise.all([
          get<{ data: { assignedClients: BackendClient[]; appointmentClients: BackendClient[] } }>(
            `/therapist/${currentUserId}/clients`
          ),
          getTherapistAppointments(currentUserId, {}).catch(() => [] as AppointmentDetails[])
        ]);
        rows = [...clientsRes.data.assignedClients, ...clientsRes.data.appointmentClients];

        const now = Date.now();
        for (const a of appointments) {
          const cid = Number(a.clientId);
          const s = sessionStats.get(cid) ?? { total: 0, next: null, last: null };
          if (a.status === 'completed') {
            s.total++;
            if (!s.last || a.startTime > s.last) s.last = a.startTime;
          }
          const t = new Date(a.startTime).getTime();
          if (t > now && (a.status === 'confirmed' || a.status === 'scheduled')) {
            if (!s.next || a.startTime < s.next) s.next = a.startTime;
          }
          sessionStats.set(cid, s);
        }
      } else {
        const res = await get<{ data: BackendClient[] }>('/clients');
        rows = res.data;
      }

      const transformedClients: Client[] = rows.map((client) => {
        const stats = sessionStats.get(client.id);
        return {
          id: String(client.id),
          name: `${client.firstName || ''} ${client.lastName || ''}`.trim() || client.email,
          email: client.email,
          phone: 'N/A', // not exposed by these endpoints
          status: 'active',
          lastVisit: stats?.last
            ? new Date(stats.last).toISOString().split('T')[0]
            : client.createdAt ? new Date(client.createdAt).toISOString().split('T')[0] : 'N/A',
          nextAppointment: stats?.next ?? null,
          therapist: userRole === 'therapist' ? 'You' : 'Unassigned',
          totalSessions: stats?.total ?? 0,
          condition: '—', // clinical concern lives in intake/notes, not this endpoint
          safetyRisk: undefined, // renders "Not Screened" until assessments (MVP1.2) provide it
          safetyFlags: undefined
        };
      });
      setClients(transformedClients);
    } catch (error) {
      console.error('Failed to load clients:', error);
      // Gracefully handle error by showing empty list
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clients.filter((client: Client) => {
    const matchesSearch =
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.phone.includes(searchQuery) ||
      client.therapist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.condition.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="green" dot={true} size="sm">Active</Badge>;
      case 'inactive':
        return <Badge variant="neutral" dot={true} size="sm">Inactive</Badge>;
      case 'new':
        return <Badge variant="blue" dot={true} size="sm">New</Badge>;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getSafetyBadge = (client: Client) => {
    if (!client.safetyRisk) return <Badge variant="outline" className="text-muted-foreground">Not Screened</Badge>;

    if (client.safetyRisk === 'high') {
      return (
        <div className="flex flex-col gap-1 items-start">
          <Badge className="bg-danger-light text-danger hover:bg-danger/30 border-danger/30 whitespace-nowrap">
            <AlertCircle className="w-3 h-3 mr-1" />
            High Safety Concern
          </Badge>
          {client.safetyFlags?.includes('abuse_environment') && (
            <div className="flex items-center text-xs text-danger font-medium ml-1">
              <Shield className="w-3 h-3 mr-1" /> Environment unsafe
            </div>
          )}
          {client.safetyFlags?.includes('psychosis') && (
            <div className="flex items-center text-xs text-danger font-medium ml-1">
              <Brain className="w-3 h-3 mr-1" /> Needs higher care
            </div>
          )}
          {client.safetyFlags?.includes('substance') && (
            <div className="flex items-center text-xs text-danger font-medium ml-1">
              <AlertTriangle className="w-3 h-3 mr-1" /> Substance risk
            </div>
          )}
        </div>
      );
    }

    if (client.safetyRisk === 'moderate') {
      return (
        <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-200 whitespace-nowrap">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Monitor closely
        </Badge>
      );
    }

    return (
      <Badge className="bg-action-light text-action-dark hover:bg-action/30 border-action/30 whitespace-nowrap">
        <CheckCircle2 className="w-3 h-3 mr-1" />
        Stable
      </Badge>
    );
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 24
      }
    },
    exit: {
      opacity: 0,
      x: -20,
      transition: {
        duration: 0.2
      }
    }
  };

  const statsVariants = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 400,
        damping: 25
      }
    }
  };



  const [isSafetyPlanOpen, setIsSafetyPlanOpen] = useState(false);
  const [isTreatmentPlanOpen, setIsTreatmentPlanOpen] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [] = useState(false);

  return (
    <div className="min-h-screen bg-background p-8 max-w-[1600px] mx-auto">
      {/* Header with gradient accent */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="mb-8"
      >
        <div className="flex items-center justify-end mb-6">
          <Button
            onClick={() => setIsAddClientOpen(true)}
            className="shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Client
          </Button>
        </div>

        {/* Filters and Search with glassmorphism effect */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <Input
                  placeholder="Search clients by name, email, phone, therapist, or condition..."
                  value={searchQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                  className="pl-9 border-border/50 focus-visible:ring-primary/20 focus-visible:border-primary transition-all duration-200"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px] border-border/50 focus:ring-primary/20">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Clients</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Cards with enhanced depth */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
      >
        <motion.div variants={statsVariants}>
          <Card className="border-border/50 bg-gradient-to-br from-card to-card/50 shadow-sm hover:shadow-lg hover:border-primary/20 transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Total Clients</p>
                  <p className="text-3xl font-bold tracking-tight">{clients.length}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                  <User className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={statsVariants}>
          <Card className="border-border/50 bg-gradient-to-br from-card to-card/50 shadow-sm hover:shadow-lg hover:border-action/20 transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Active</p>
                  <p className="text-3xl font-bold tracking-tight text-action">{clients.filter((p: Client) => p.status === 'active').length}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-action/10 flex items-center justify-center group-hover:bg-action/20 transition-colors duration-300">
                  <TrendingUp className="h-6 w-6 text-action" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={statsVariants}>
          <Card className="border-border/50 bg-gradient-to-br from-card to-card/50 shadow-sm hover:shadow-lg hover:border-info/20 transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">New This Month</p>
                  <p className="text-3xl font-bold tracking-tight text-info">{clients.filter((p: Client) => p.status === 'new').length}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-info/10 flex items-center justify-center group-hover:bg-info/20 transition-colors duration-300">
                  <User className="h-6 w-6 text-info" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={statsVariants}>
          <Card className="border-border/50 bg-gradient-to-br from-card to-card/50 shadow-sm hover:shadow-lg hover:border-muted transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Inactive</p>
                  <p className="text-3xl font-bold tracking-tight text-muted-foreground">{clients.filter((p: Client) => p.status === 'inactive').length}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-muted/50 flex items-center justify-center group-hover:bg-muted transition-colors duration-300">
                  <User className="h-6 w-6 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Clients Table with smooth animations */}
      <Card className="border-border/50 shadow-lg overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30 border-border/50">
                  <TableHead className="font-semibold text-foreground">Client</TableHead>
                  <TableHead className="font-semibold text-foreground">Contact</TableHead>
                  <TableHead className="font-semibold text-foreground">Status</TableHead>
                  <TableHead className="font-semibold text-foreground">Condition</TableHead>
                  <TableHead className="font-semibold text-foreground">Safety</TableHead>
                  <TableHead className="font-semibold text-foreground">Last Visit</TableHead>
                  <TableHead className="font-semibold text-foreground">Next Appointment</TableHead>
                  <TableHead className="font-semibold text-foreground">Sessions</TableHead>
                  <TableHead className="text-right font-semibold text-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence mode="popLayout">
                  {filteredClients.map((client: Client) => (
                    <motion.tr
                      key={client.id}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      layout
                      className="group hover:bg-muted/50 cursor-pointer border-border/30 transition-colors duration-150"
                      onClick={() => setSelectedClient(client)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 ring-2 ring-background shadow-sm group-hover:ring-primary/20 transition-all duration-200">
                            <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm group-hover:bg-primary/20 transition-colors">
                              {client.name.split(' ').map((n: string) => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-foreground group-hover:text-primary transition-colors">{client.name}</p>
                            <p className="text-sm text-muted-foreground">{client.therapist}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="h-3.5 w-3.5" />
                            {client.email}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="h-3.5 w-3.5" />
                            {client.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(client.status)}</TableCell>
                      <TableCell>
                        <span className="text-sm text-foreground font-medium">{client.condition}</span>
                      </TableCell>
                      <TableCell>
                        {getSafetyBadge(client)}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-foreground">{formatDate(client.lastVisit)}</span>
                      </TableCell>
                      <TableCell>
                        {client.nextAppointment ? (
                          <span className="text-sm text-foreground">{formatDate(client.nextAppointment)}</span>
                        ) : (
                          <span className="text-sm text-muted-foreground">Not scheduled</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-semibold text-foreground">{client.totalSessions}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                              onClick={(e: React.MouseEvent) => e.stopPropagation()}
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-[160px]">
                            <DropdownMenuItem onClick={() => setSelectedClient(client)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setSelectedClient(client);
                              setShowEditForm(true);
                            }}>
                              <FileText className="mr-2 h-4 w-4" />
                              Edit Client
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-danger">
                              Delete Client
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </TableBody>
            </Table>
          </div>

          <AnimatePresence>
            {filteredClients.length === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center py-16"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/50 mb-4">
                  <User className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No clients found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filters</p>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Detailed Client Profile Sheet - Hybrid Design */}
      <AnimatePresence>
        {selectedClient && (
          <Sheet open={!!selectedClient} onOpenChange={(open) => !open && setSelectedClient(null)}>
            <SheetContent side="right" className="sm:max-w-6xl w-[90vw] p-0 border-l border-rule-hi shadow-2xl bg-card overflow-hidden flex flex-col">
              {(() => {
                const detailData = mapClientToDetailData(selectedClient);
                return (
                  <>
                    {/* 1. Top Header (Identity + Safety Banner) */}
                    <div className="bg-card border-b border-rule-hi px-8 py-6 flex-shrink-0 z-10 shadow-sm">
                      <div className="flex items-start justify-between">
                        <div className="flex gap-6">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="mr-4 -ml-2"
                            onClick={() => setSelectedClient(null)}
                          >
                            <ChevronRight className="h-6 w-6 rotate-180" />
                          </Button>
                          <Avatar className="h-20 w-20 ring-4 ring-surface-warm shadow-md rounded-2xl">
                            <AvatarFallback className="bg-ink text-white text-2xl font-light">
                              {detailData.profile.identity.firstName[0]}{detailData.profile.identity.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="pt-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h2 className="text-2xl font-bold tracking-tight text-ink">
                                {detailData.profile.identity.firstName} {detailData.profile.identity.lastName}
                              </h2>
                              <span className="text-sm text-muted-text font-medium">({detailData.profile.identity.preferredName})</span>
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${detailData.profile.status.riskLevel === 'high' ? 'bg-danger-light text-danger' :
                                detailData.profile.status.riskLevel === 'medium' ? 'bg-action-light text-action-dark' :
                                  'bg-action-light text-action-dark'
                                }`}>
                                {detailData.profile.status.riskLevel} Risk
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm font-medium text-muted-text">
                              <span>{detailData.profile.identity.age} yrs</span>
                              <span className="text-rule-hi">•</span>
                              <span>{detailData.profile.identity.pronouns}</span>
                              <span className="text-rule-hi">•</span>
                              <span className={`capitalize ${detailData.profile.status.accountStatus === 'active' ? 'text-action' : 'text-muted-text'}`}>
                                {detailData.profile.status.accountStatus}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <Button variant="outline" onClick={() => setShowEditForm(true)}>
                            <FileText className="h-4 w-4 mr-2" />
                            Edit Profile
                          </Button>
                          <Button>
                            Schedule Visit
                          </Button>
                        </div>
                      </div>

                      {/* Safety Banner - Feature Flagged: Disabled */}
                      {false && (detailData.profile.status.riskLevel === 'high' || detailData.profile.status.riskLevel === 'medium') && (
                        <div className={`mt-6 p-3 rounded-lg flex items-center gap-3 ${detailData.profile.status.riskLevel === 'high' ? 'bg-danger-light border border-danger-light text-danger' : 'bg-action-light border border-action-light text-action-dark'}`}>
                          <ShieldAlert className="h-5 w-5 flex-shrink-0" />
                          <span className="text-sm font-medium">
                            {detailData.profile.status.riskBanner || "Safety Alert: Please review recent assessments."}
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="ml-auto h-8"
                            onClick={() => setIsSafetyPlanOpen(true)}
                          >
                            Review Safety Plan
                          </Button>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 overflow-y-auto bg-surface-warm/50 p-8 space-y-8">

                      {/* AI Insights Section - Feature Flagged: Disabled */}
                      {false && (detailData.aiInsights.documentationAlerts.length > 0 || detailData.aiInsights.trendAlerts.length > 0) && (
                        <div className="bg-info/10 border border-info/15 rounded-xl p-5 shadow-sm">
                          <div className="flex items-center gap-2 mb-3">
                            <Brain className="h-5 w-5 text-info" />
                            <h3 className="text-sm font-bold text-ink uppercase tracking-wider">AI Insights & Alerts</h3>
                          </div>
                          <p className="text-sm text-info-foreground mb-4 leading-relaxed">
                            {detailData.aiInsights.progressSummary}
                          </p>
                          <div className="space-y-3">
                            {detailData.aiInsights.documentationAlerts.map((alert, i) => (
                              <div key={`doc-${i}`} className="flex items-start gap-3 bg-card/60 p-3 rounded-lg border border-info/40">
                                <AlertTriangle className="h-4 w-4 text-action flex-shrink-0 mt-0.5" />
                                <span className="text-sm text-body-text">{alert}</span>
                              </div>
                            ))}
                            {detailData.aiInsights.trendAlerts.map((alert, i) => (
                              <div key={`trend-${i}`} className="flex items-start gap-3 bg-card/60 p-3 rounded-lg border border-info/40">
                                <TrendingUp className="h-4 w-4 text-danger flex-shrink-0 mt-0.5" />
                                <span className="text-sm text-body-text">
                                  <span className="font-semibold text-ink">{alert.type}:</span> {alert.message}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 2. Mini-Summary Block (4-tile grid) */}
                      <div className="grid grid-cols-4 gap-6">
                        {/* Tile 1: Next Session */}
                        {/* Tile 1: Next Session */}
                        <div className="bg-card p-5 rounded-xl border border-rule-hi shadow-sm flex flex-col justify-between h-48 relative overflow-hidden">
                          <div>
                            <div className="flex items-center gap-2 text-muted-text mb-3">
                              <Calendar className="h-4 w-4" />
                              <span className="text-xs font-bold uppercase tracking-wider">Next Session</span>
                            </div>
                            {detailData.sessions.nextSession ? (
                              <>
                                <div className="text-xl font-semibold text-ink mb-1">
                                  {new Date(detailData.sessions.nextSession.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                </div>
                                <div className="text-sm text-muted-text mb-2">
                                  {detailData.sessions.nextSession.startTime} • {detailData.sessions.nextSession.mode}
                                </div>
                              </>
                            ) : (
                              <div className="text-sm text-muted-text italic">No upcoming sessions</div>
                            )}
                          </div>

                          {detailData.sessions.nextSession && (
                            <div className="flex gap-2 mt-auto w-full z-10">
                              {(() => {
                                // Logic to check if session is joinable (within 15 mins of start time)
                                // For demo purposes, we'll assume the session is "Tue, Feb 4" at "15:30"
                                // In a real app, compare with current time.
                                // Let's mock it as NOT joinable for now unless we force it, or make it always active for demo if needed.
                                // But per user request: "only active 15 min before".
                                // Since we can't easily mock "now" to match a static future date without changing the date,
                                // we will implement the logic but it will likely be disabled in this static view.
                                // To make it testable/visible, we could add a "Demo Active" toggle, but strict logic is requested.

                                // Parsing the date string "2025-02-04" and time "15:30"
                                const sessionDate = new Date(detailData.sessions.nextSession!.date + 'T' + detailData.sessions.nextSession!.startTime);
                                const now = new Date();
                                const diffInMinutes = (sessionDate.getTime() - now.getTime()) / 1000 / 60;
                                const isJoinable = diffInMinutes <= 15 && diffInMinutes >= -60; // Active from 15 min before to 60 min after start

                                return (
                                  <Button
                                    size="sm"
                                    className="flex-1 shadow-sm gap-2"
                                    disabled={!isJoinable}
                                  >
                                    <Video className="h-4 w-4" />
                                    Join
                                  </Button>
                                );
                              })()}
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 shadow-sm"
                              >
                                Reschedule
                              </Button>
                            </div>
                          )}
                        </div>

                        {/* Tile 2: Last Session */}
                        <div className="bg-card p-5 rounded-xl border border-rule-hi shadow-sm flex flex-col justify-between h-48">
                          <div>
                            <div className="flex items-center gap-2 text-muted-text mb-3">
                              <Clock className="h-4 w-4" />
                              <span className="text-xs font-bold uppercase tracking-wider">Last Session</span>
                            </div>
                            {detailData.sessions.lastSession ? (
                              <>
                                <div className="text-sm font-medium text-ink mb-1">
                                  {new Date(detailData.sessions.lastSession.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </div>
                                <p className="text-xs text-muted-text line-clamp-3 leading-relaxed">
                                  {detailData.sessions.lastSession.summary}
                                </p>
                              </>
                            ) : (
                              <div className="text-sm text-muted-text italic">No previous sessions</div>
                            )}
                          </div>
                          {detailData.sessions.lastSession && (
                            <Button size="sm" variant="outline" className="w-full mt-auto shadow-sm">
                              View Full Note
                            </Button>
                          )}
                        </div>

                        {/* Tile 3: Assessments Overview */}
                        <div className="bg-card p-5 rounded-xl border border-rule-hi shadow-sm flex flex-col justify-between h-48">
                          <div>
                            <div className="flex items-center gap-2 text-muted-text mb-3">
                              <Activity className="h-4 w-4" />
                              <span className="text-xs font-bold uppercase tracking-wider">Assessments</span>
                            </div>
                            <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-body-text">PHQ-9</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-lg font-bold text-ink">{detailData.assessments.latest.PHQ9?.score ?? '—'}</span>
                                  <span className={`text-xs ${detailData.assessments.latest.PHQ9?.trend === 'increasing' ? 'text-danger' : 'text-action'}`}>
                                    {detailData.assessments.latest.PHQ9?.trend === 'increasing' ? '↑' : '↓'}
                                  </span>
                                </div>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-body-text">GAD-7</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-lg font-bold text-ink">{detailData.assessments.latest.GAD7?.score ?? '—'}</span>
                                  <span className="text-xs text-dim">→</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="text-xs text-dim mt-auto text-center">
                            Last updated: {detailData.assessments.latest.PHQ9?.lastUpdated ?? '—'}
                          </div>
                        </div>

                        {/* Tile 4: Treatment Plan Snapshot */}
                        <div className="bg-card p-5 rounded-xl border border-rule-hi shadow-sm flex flex-col justify-between h-48">
                          <div>
                            <div className="flex items-center gap-2 text-muted-text mb-3">
                              <Target className="h-4 w-4" />
                              <span className="text-xs font-bold uppercase tracking-wider">Treatment Plan</span>
                            </div>
                            <div className="text-sm font-medium text-ink mb-1 line-clamp-1">
                              {detailData.clinical.treatmentPlan.mainGoal}
                            </div>
                            <div className="flex gap-2 mb-3">
                              <span className="px-2 py-0.5 bg-rule text-muted-text text-xs rounded border border-rule-hi">
                                {detailData.clinical.treatmentPlan.modality}
                              </span>
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs text-muted-text">
                                <span>Progress</span>
                                <span>{detailData.clinical.treatmentPlan.progressPercent}%</span>
                              </div>
                              <div className="h-1.5 w-full bg-rule rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-action rounded-full transition-all duration-500"
                                  style={{ width: `${detailData.clinical.treatmentPlan.progressPercent}%` }}
                                />
                              </div>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full mt-auto shadow-sm"
                            onClick={() => setIsTreatmentPlanOpen(true)}
                          >
                            View Plan
                          </Button>
                        </div>
                      </div>

                      {/* 3. Clinical Overview Panel */}
                      <section className="bg-card rounded-2xl border border-rule-hi shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-rule bg-surface-warm/50 flex justify-between items-center">
                          <h3 className="text-sm font-bold text-ink uppercase tracking-wider flex items-center gap-2">
                            <Brain className="h-4 w-4 text-muted-text" />
                            Clinical Overview
                          </h3>
                          <Button variant="ghost" size="sm" className="h-8 text-xs">Edit Clinical Data</Button>
                        </div>
                        <div className="p-6 grid grid-cols-4 gap-8">
                          {/* Diagnoses */}
                          <div className="col-span-1 border-r border-rule pr-6">
                            <p className="text-xs font-bold text-dim uppercase mb-3">Diagnoses</p>
                            <div className="space-y-3">
                              <div>
                                <span className="text-xs font-semibold text-action bg-action-light px-1.5 py-0.5 rounded mb-1 inline-block">Primary</span>
                                <p className="text-sm font-semibold text-ink">{detailData.clinical.diagnoses.primary.description}</p>
                                <p className="text-xs text-muted-text font-mono">{detailData.clinical.diagnoses.primary.code}</p>
                              </div>
                              {detailData.clinical.diagnoses.secondary.map((diag, i) => (
                                <div key={i}>
                                  <span className="text-xs font-semibold text-muted-text bg-rule px-1.5 py-0.5 rounded mb-1 inline-block">Secondary</span>
                                  <p className="text-sm font-medium text-body-text">{diag.description}</p>
                                  <p className="text-xs text-muted-text font-mono">{diag.code}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Medications */}
                          <div className="col-span-1 border-r border-rule pr-6">
                            <p className="text-xs font-bold text-dim uppercase mb-3">Medications</p>
                            <div className="space-y-3">
                              {detailData.clinical.medications.map((med, i) => (
                                <div key={i} className="bg-surface-warm p-3 rounded-lg border border-rule">
                                  <div className="flex justify-between items-start mb-1">
                                    <span className="text-sm font-semibold text-ink">{med.name}</span>
                                  </div>
                                  <p className="text-xs text-muted-text mb-1">{med.dosage}</p>
                                  <p className="text-[10px] text-dim uppercase">Rx: {med.prescribedBy}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Risk & Safety */}
                          <div className="col-span-1 border-r border-rule pr-6">
                            <p className="text-xs font-bold text-dim uppercase mb-3">Risk & Safety</p>
                            <div className="space-y-4">
                              <div>
                                <p className="text-xs text-muted-text mb-1">Last Safety Assessment</p>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-ink">{detailData.clinical.safety.lastSafetyAssessment.date}</span>
                                  <span className="text-xs bg-rule text-muted-text px-1.5 py-0.5 rounded">{detailData.clinical.safety.lastSafetyAssessment.type}</span>
                                </div>
                              </div>
                              <div>
                                <p className="text-xs text-muted-text mb-1">Suicidal Ideation</p>
                                <span className={`text-sm font-semibold ${detailData.clinical.safety.lastSafetyAssessment.suicidalIdeation === 'yes' ? 'text-danger' : 'text-ink'}`}>
                                  {detailData.clinical.safety.lastSafetyAssessment.suicidalIdeation === 'yes' ? 'PRESENT' : 'None Reported'}
                                </span>
                              </div>
                              <div>
                                <p className="text-xs text-muted-text mb-1">Emergency Contact</p>
                                <p className="text-sm font-medium text-ink">{detailData.profile.contact.emergencyContact.name}</p>
                                <p className="text-xs text-muted-text">{detailData.profile.contact.emergencyContact.phone}</p>
                              </div>
                            </div>
                          </div>

                          {/* Sessions & Attendance */}
                          <div className="col-span-1">
                            <p className="text-xs font-bold text-dim uppercase mb-3">Attendance</p>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="bg-surface-warm p-3 rounded-lg text-center">
                                <span className="block text-2xl font-bold text-ink">{detailData.sessions.stats.totalSessions}</span>
                                <span className="text-xs text-muted-text uppercase">Total</span>
                              </div>
                              <div className="bg-surface-warm p-3 rounded-lg text-center">
                                <span className="block text-2xl font-bold text-ink">{detailData.sessions.stats.cancelled}</span>
                                <span className="text-xs text-muted-text uppercase">Cancelled</span>
                              </div>
                            </div>
                            <div className="mt-4">
                              <div className="flex justify-between text-xs text-muted-text mb-1">
                                <span>Frequency</span>
                                <span className="font-medium text-ink capitalize">{detailData.sessions.stats.frequency}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </section>

                      {/* 4. Client Background */}
                      <section className="bg-card rounded-2xl border border-rule-hi shadow-sm p-6">
                        <h3 className="text-sm font-bold text-ink uppercase tracking-wider mb-4 flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-text" />
                          Client Background
                        </h3>
                        <div className="grid grid-cols-3 gap-8">
                          <div className="col-span-2">
                            <p className="text-xs font-bold text-dim uppercase mb-2">Presenting Problem</p>
                            <p className="text-sm text-body-text leading-relaxed mb-4">
                              {detailData.background.presentingProblem}
                            </p>
                            <div className="grid grid-cols-2 gap-6">
                              <div>
                                <p className="text-xs font-bold text-dim uppercase mb-2">History</p>
                                <ul className="space-y-1 text-sm text-muted-text">
                                  <li><span className="text-dim">•</span> {detailData.background.clientHistory.previousTherapy}</li>
                                  <li><span className="text-dim">•</span> {detailData.background.clientHistory.traumaHistory}</li>
                                </ul>
                              </div>
                              <div>
                                <p className="text-xs font-bold text-dim uppercase mb-2">Context</p>
                                <ul className="space-y-1 text-sm text-muted-text">
                                  <li><span className="text-dim">•</span> {detailData.background.personalContext.employment.occupation}</li>
                                  <li><span className="text-dim">•</span> {detailData.background.personalContext.household}</li>
                                </ul>
                              </div>
                            </div>
                          </div>
                          <div className="col-span-1 bg-surface-warm rounded-xl p-4 border border-rule">
                            <p className="text-xs font-bold text-dim uppercase mb-3">Insurance & Billing</p>
                            <div className="space-y-3">
                              <div className="flex justify-between">
                                <span className="text-sm text-muted-text">Provider</span>
                                <span className="text-sm font-medium text-ink">{detailData.billing.insuranceProvider}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-muted-text">Copay</span>
                                <span className="text-sm font-medium text-ink">${detailData.billing.copay}</span>
                              </div>
                              <div className="h-px bg-rule-hi my-1" />
                              <div className="flex justify-between">
                                <span className="text-sm text-muted-text">Outstanding</span>
                                <span className="text-sm font-bold text-ink">${detailData.billing.outstandingBalance}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </section>

                      {/* 5. Communication & Documents Area (Tabs) */}
                      <section className="bg-card rounded-2xl border border-rule-hi shadow-sm overflow-hidden min-h-[500px]">
                        <Tabs defaultValue="notes" className="w-full">
                          <div className="px-6 py-3 border-b border-rule bg-surface-warm/50">
                            <TabsList className="bg-rule/50 p-1">
                              <TabsTrigger value="notes" className="data-[state=active]:bg-card data-[state=active]:shadow-sm">
                                <FileText className="h-4 w-4 mr-2" />
                                Notes
                              </TabsTrigger>
                              <TabsTrigger value="documents" className="data-[state=active]:bg-card data-[state=active]:shadow-sm">
                                <Files className="h-4 w-4 mr-2" />
                                Documents
                              </TabsTrigger>
                              <TabsTrigger value="assessments" className="data-[state=active]:bg-card data-[state=active]:shadow-sm">
                                <Activity className="h-4 w-4 mr-2" />
                                Assessments
                              </TabsTrigger>
                              <TabsTrigger value="messages" className="data-[state=active]:bg-card data-[state=active]:shadow-sm">
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Messages
                              </TabsTrigger>
                            </TabsList>
                          </div>

                          <div className="p-6">
                            <TabsContent value="notes" className="mt-0 space-y-4">
                              <div className="flex justify-between items-center mb-4">
                                <h4 className="text-sm font-bold text-ink">Session Notes</h4>
                                <Button size="sm" className="h-8"><Plus className="h-3 w-3 mr-2" /> New Note</Button>
                              </div>
                              {[1, 2, 3].map((_, i) => (
                                <div key={i} className="border border-rule rounded-lg p-4 hover:bg-surface-warm transition-colors cursor-pointer">
                                  <div className="flex justify-between items-start mb-2">
                                    <div>
                                      <span className="text-sm font-semibold text-ink">Psychotherapy Session</span>
                                      <span className="text-xs text-muted-text ml-2">Oct {20 - i * 7}, 2025</span>
                                    </div>
                                    <span className="text-xs bg-action-light text-action px-2 py-0.5 rounded-full font-medium">Signed</span>
                                  </div>
                                  <p className="text-sm text-muted-text line-clamp-2">
                                    Patient discussed progress with anxiety management techniques. Reported reduced frequency of panic attacks...
                                  </p>
                                </div>
                              ))}
                            </TabsContent>

                            <TabsContent value="documents" className="mt-0">
                              <div className="flex justify-between items-center mb-4">
                                <h4 className="text-sm font-bold text-ink">Clinical Documents</h4>
                                <Button size="sm" variant="outline" className="h-8"><Upload className="h-3 w-3 mr-2" /> Upload</Button>
                              </div>
                              <div className="grid grid-cols-3 gap-4">
                                {['Intake Assessment', 'Safety Plan', 'Consent to Treat', 'Release of Information'].map((doc, i) => (
                                  <div key={i} className="border border-rule rounded-lg p-4 flex items-center gap-3 hover:border-info/30 hover:bg-info/15 transition-all cursor-pointer group">
                                    <div className="h-10 w-10 bg-rule rounded-lg flex items-center justify-center group-hover:bg-card group-hover:shadow-sm transition-all">
                                      <FileText className="h-5 w-5 text-dim group-hover:text-info" />
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-ink">{doc}</p>
                                      <p className="text-xs text-muted-text">PDF • 1.2 MB</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </TabsContent>

                            <TabsContent value="assessments" className="mt-0">
                              <div className="flex justify-between items-center mb-6">
                                <h4 className="text-sm font-bold text-ink">Assessment History</h4>
                                <Button size="sm" variant="outline" className="h-8">Send Assessment</Button>
                              </div>
                              <div className="h-[300px] w-full border border-rule rounded-xl p-4 mb-6">
                                <ResponsiveContainer width="100%" height="100%">
                                  <LineChart data={detailData.assessments.history.dates.map((date, i) => ({
                                    date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                                    PHQ9: detailData.assessments.history.PHQ9[i],
                                    GAD7: detailData.assessments.history.GAD7[i]
                                  }))}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E4E7" />
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#71717A', fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#71717A', fontSize: 12 }} />
                                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                    <Legend />
                                    <Line type="monotone" dataKey="PHQ9" stroke="#1E7048" strokeWidth={2} dot={{ r: 4 }} />
                                    <Line type="monotone" dataKey="GAD7" stroke="#3B82F6" strokeWidth={2} dot={{ r: 4 }} />
                                  </LineChart>
                                </ResponsiveContainer>
                              </div>
                            </TabsContent>

                            <TabsContent value="messages" className="mt-0">
                              <div className="text-center py-12">
                                <MessageSquare className="h-12 w-12 text-rule-hi mx-auto mb-3" />
                                <h3 className="text-lg font-medium text-ink">Secure Messaging</h3>
                                <p className="text-muted-text max-w-sm mx-auto mt-2">
                                  Encrypted communication channel with {detailData.profile.identity.firstName}. All messages are HIPAA compliant.
                                </p>
                                <Button className="mt-6">Start New Conversation</Button>
                              </div>
                            </TabsContent>
                          </div>
                        </Tabs>
                      </section>
                    </div>
                  </>
                );
              })()}
            </SheetContent>
          </Sheet>
        )}
      </AnimatePresence>

      {/* Add Client Dialog */}
      <Dialog open={isAddClientOpen} onOpenChange={setIsAddClientOpen}>
        <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden gap-0 border-0 shadow-2xl">
          <div className="bg-primary/5 p-6 border-b border-border/50">
            <DialogHeader>
              <DialogTitle className="text-2xl font-semibold flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Invite New Client
              </DialogTitle>
              <DialogDescription className="text-base">
                Add a new client and send them a secure onboarding link.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-6 space-y-8">
            {/* Personal Info Grid */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-medium text-muted-foreground">First Name</Label>
                <Input
                  id="firstName"
                  value={newClient.firstName}
                  onChange={(e) => setNewClient({ ...newClient, firstName: e.target.value })}
                  className="h-11 bg-muted/20 border-border/50 focus:bg-background transition-all"
                  placeholder="Jane"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-medium text-muted-foreground">Last Name</Label>
                <Input
                  id="lastName"
                  value={newClient.lastName}
                  onChange={(e) => setNewClient({ ...newClient, lastName: e.target.value })}
                  className="h-11 bg-muted/20 border-border/50 focus:bg-background transition-all"
                  placeholder="Doe"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-muted-foreground">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={newClient.email}
                  onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                  className="h-11 bg-muted/20 border-border/50 focus:bg-background transition-all"
                  placeholder="jane@example.com"
                />
              </div>
              <div className="space-y-2">
                <PhoneInputV2
                  value={newClient.phone}
                  onChange={(value) => setNewClient({ ...newClient, phone: value || '' })}
                  label="Phone Number"
                  placeholder="(555) 123-4567"
                  className="h-11"
                  defaultCountry="US"
                />
              </div>
            </div>

            <Separator className="bg-border/50" />

            {/* Onboarding Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base font-medium">Send Onboarding Email</Label>
                  <p className="text-sm text-muted-foreground">Automatically send a secure registration link</p>
                </div>
                <Switch
                  checked={newClient.sendLink}
                  onCheckedChange={(checked) => setNewClient({ ...newClient, sendLink: checked })}
                />
              </div>

              {newClient.sendLink && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-muted/30 rounded-xl p-4 border border-border/50"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-info/15 flex items-center justify-center flex-shrink-0">
                      <Mail className="h-4 w-4 text-info" />
                    </div>
                    <div className="space-y-1 flex-1">
                      <p className="text-sm font-medium text-foreground">Email Preview</p>
                      <p className="text-xs text-muted-foreground">Subject: Welcome to Ataraxia - Complete your registration</p>
                      <div className="mt-2 inline-flex items-center text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">
                        Secure Link Included
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-xs"
                      onClick={() => {
                        const params = new URLSearchParams({
                          email: newClient.email,
                          firstName: newClient.firstName,
                          lastName: newClient.lastName,
                          phone: newClient.phone,
                          countryCode: newClient.countryCode,
                          token: 'preview-token-' + Date.now()
                        });
                        window.open(`${window.location.origin}/client-registration?${params.toString()}`, '_blank');
                      }}
                    >
                      <Eye className="h-3 w-3 mr-2" />
                      Preview Form
                    </Button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          <div className="p-6 bg-muted/10 border-t border-border/50 flex items-center justify-end gap-3">
            <Button variant="ghost" onClick={() => setIsAddClientOpen(false)}>Cancel</Button>
            <Button
              onClick={() => {
                toast.success('Client added successfully');
                if (newClient.sendLink) {
                  toast.success(`Registration link sent to ${newClient.email}`);
                }
                setIsAddClientOpen(false);
                setIsAddClientOpen(false);
                setNewClient({ firstName: '', lastName: '', email: '', phone: '', countryCode: '+1', sendLink: true });
              }}
              className="shadow-lg min-w-[140px]"
            >
              {newClient.sendLink ? (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Invite
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Client
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Safety Plan Dialog */}
      {selectedClient && (
        <SafetyPlanDialog
          open={isSafetyPlanOpen}
          onOpenChange={setIsSafetyPlanOpen}
          clientData={mapClientToDetailData(selectedClient)}
        />
      )}

      {/* Treatment Plan Dialog */}
      {selectedClient && (
        <TreatmentPlanDialog
          open={isTreatmentPlanOpen}
          onOpenChange={setIsTreatmentPlanOpen}
          plan={mapClientToDetailData(selectedClient).clinical.treatmentPlan}
        />
      )}

      {selectedClient && (
        <EditClientProfileForm
          open={showEditForm}
          clientId={selectedClient.id}
          clientName={selectedClient.name}
          initialData={mapClientToDetailData(selectedClient)}
          onSave={async (_data) => {
            try {
              // backend-initial: PUT /clients/{id}
              await dataService.update('/clients', selectedClient.id, {
                ...selectedClient,
                // Map the detailed data back to the client format
                // You can expand this mapping as needed
                lastUpdated: new Date().toISOString()
              });

              // Update local state
              setClients(prevClients =>
                prevClients.map(c =>
                  c.id === selectedClient.id
                    ? { ...c, lastUpdated: new Date().toISOString() }
                    : c
                )
              );

              toast.success('Client profile updated successfully');
              setShowEditForm(false);
            } catch (error) {
              console.error('Failed to save client data:', error);
              toast.error('Failed to save changes. Please try again.');
            }
          }}
          onCancel={() => setShowEditForm(false)}
        />
      )}

    </div >
  );
}

function TreatmentPlanDialog({ open, onOpenChange, plan }: { open: boolean, onOpenChange: (open: boolean) => void, plan: any }) {
  if (!plan) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] flex flex-col p-0 overflow-hidden gap-0 border-0 shadow-2xl z-[100]">
        <div className="bg-action-light p-6 border-b border-action-light flex-shrink-0 relative">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <Badge variant="outline" className="bg-action-light text-action-dark border-action/30 uppercase tracking-widest text-[10px]">
                Active Plan
              </Badge>
              <Badge variant="outline" className="bg-card text-muted-text border-rule-hi uppercase tracking-widest text-[10px]">
                Review: {new Date(new Date().setMonth(new Date().getMonth() + 1)).toLocaleDateString()}
              </Badge>
            </div>
            <DialogTitle className="text-2xl font-semibold flex items-center gap-2 text-ink">
              <Target className="h-6 w-6 text-action" />
              Treatment Plan
            </DialogTitle>
            <DialogDescription className="text-action-dark">
              Comprehensive clinical roadmap and progress tracking.
            </DialogDescription>
          </DialogHeader>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 rounded-full"
            onClick={() => onOpenChange(false)}
          >
            <XCircle className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-card">
          {/* 1. Primary Goal */}
          <section>
            <h3 className="text-sm font-bold text-ink uppercase tracking-wider flex items-center gap-2 mb-3">
              <Target className="h-4 w-4 text-muted-text" />
              Primary Goal
            </h3>
            <div className="bg-surface-warm p-4 rounded-xl border border-rule">
              <p className="text-lg font-medium text-ink mb-2">{plan.mainGoal}</p>
              <div className="flex gap-2">
                <Badge variant="secondary" className="bg-card border-rule-hi">{plan.modality}</Badge>
                <Badge variant="secondary" className="bg-card border-rule-hi">Weekly Sessions</Badge>
              </div>
            </div>
          </section>

          {/* 2. Objectives */}
          <section>
            <h3 className="text-sm font-bold text-ink uppercase tracking-wider flex items-center gap-2 mb-3">
              <CheckCircle2 className="h-4 w-4 text-muted-text" />
              Objectives & Interventions
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg border border-rule hover:bg-surface-warm transition-colors">
                <div className="mt-1 h-5 w-5 rounded-full border-2 border-action flex items-center justify-center">
                  <div className="h-2.5 w-2.5 rounded-full bg-action" />
                </div>
                <div>
                  <p className="font-medium text-ink">Identify Anxiety Triggers</p>
                  <p className="text-sm text-muted-text">Log daily anxiety levels and associated context.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg border border-rule hover:bg-surface-warm transition-colors">
                <div className="mt-1 h-5 w-5 rounded-full border-2 border-rule-hi" />
                <div>
                  <p className="font-medium text-ink">Practice Grounding Techniques</p>
                  <p className="text-sm text-muted-text">Apply 5-4-3-2-1 technique during high stress moments.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg border border-rule hover:bg-surface-warm transition-colors">
                <div className="mt-1 h-5 w-5 rounded-full border-2 border-rule-hi" />
                <div>
                  <p className="font-medium text-ink">Sleep Hygiene Improvement</p>
                  <p className="text-sm text-muted-text">Establish consistent 11 PM bedtime routine.</p>
                </div>
              </div>
            </div>
          </section>

          {/* 3. Progress */}
          <section>
            <h3 className="text-sm font-bold text-ink uppercase tracking-wider flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-muted-text" />
              Progress Tracking
            </h3>
            <div className="bg-card rounded-xl border border-rule-hi p-5">
              <div className="flex justify-between items-end mb-2">
                <span className="text-sm font-medium text-muted-text">Overall Progress</span>
                <span className="text-2xl font-bold text-action">{plan.progressPercent}%</span>
              </div>
              <div className="h-2 w-full bg-rule rounded-full overflow-hidden mb-4">
                <div className="h-full bg-action rounded-full" style={{ width: `${plan.progressPercent}%` }} />
              </div>
              <p className="text-sm text-muted-text">
                Client is showing consistent improvement in identifying triggers. Sleep hygiene remains a challenge area.
              </p>
            </div>
          </section>
        </div>

        <div className="p-6 bg-card border-t border-rule-hi flex justify-end gap-3 flex-shrink-0">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export Plan
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Update Goals
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SafetyPlanDialog({ open, onOpenChange, clientData }: { open: boolean, onOpenChange: (open: boolean) => void, clientData: ClientDetailData }) {
  const [showEmergencyContact, setShowEmergencyContact] = useState(false);

  if (!clientData) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col p-0 overflow-hidden gap-0 border-0 shadow-2xl z-[100]">
        <div className="bg-danger-light p-6 border-b border-danger-light flex-shrink-0 relative">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <Badge variant="outline" className="bg-danger-light text-danger border-danger/30 uppercase tracking-widest text-[10px]">
                Legal Record
              </Badge>
              <Badge variant="outline" className="bg-card text-muted-text border-rule-hi uppercase tracking-widest text-[10px]">
                Established: {new Date().toLocaleDateString()}
              </Badge>
            </div>
            <DialogTitle className="text-2xl font-semibold flex items-center gap-2 text-ink">
              <ShieldAlert className="h-6 w-6 text-danger" />
              Active Safety Plan
            </DialogTitle>
            <DialogDescription className="text-danger">
              Current active safety protocol. Digitally signed and locked.
            </DialogDescription>
          </DialogHeader>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 rounded-full"
            onClick={() => onOpenChange(false)}
          >
            <XCircle className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto space-y-8 bg-surface-warm/50">

          {/* 1. Risk Overview */}
          <section className="bg-card rounded-xl border border-rule-hi p-5 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-sm font-bold text-ink uppercase tracking-wider flex items-center gap-2">
                <Activity className="h-4 w-4 text-muted-text" />
                1. Risk Overview
              </h3>
              <Badge variant="secondary" className="text-[10px]">Clinician Verified</Badge>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-surface-warm p-3 rounded-lg border border-rule">
                <span className="text-xs text-muted-text uppercase font-semibold">Current Risk Status</span>
                <div className="mt-1 flex items-center gap-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${clientData.profile.status.riskLevel === 'high' ? 'bg-danger-light text-danger' : 'bg-action-light text-action-dark'}`}>
                    {clientData.profile.status.riskLevel.toUpperCase()} Risk
                  </span>
                </div>
              </div>
              <div className="bg-surface-warm p-3 rounded-lg border border-rule">
                <span className="text-xs text-muted-text uppercase font-semibold">Clinical Basis</span>
                <div className="mt-1 text-sm font-medium text-ink">Clinical Interview & Assessment</div>
              </div>
            </div>
          </section>

          {/* 2. Warning Signs */}
          <section className="bg-card rounded-xl border border-rule-hi p-5 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-sm font-bold text-ink uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-muted-text" />
                2. Warning Signs
              </h3>
              <Badge variant="secondary" className="text-[10px]">Patient Reported</Badge>
            </div>
            <ul className="list-disc list-inside space-y-2 text-sm text-body-text">
              <li>Increased isolation and withdrawal from social activities</li>
              <li>Changes in sleep patterns</li>
              <li>Expressing feelings of hopelessness</li>
            </ul>
          </section>

          {/* 3. Internal Coping Strategies */}
          <section className="bg-card rounded-xl border border-rule-hi p-5 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-sm font-bold text-ink uppercase tracking-wider flex items-center gap-2">
                <Brain className="h-4 w-4 text-muted-text" />
                3. Internal Coping Strategies
              </h3>
              <Badge variant="secondary" className="text-[10px]">Patient Reported</Badge>
            </div>
            <ul className="list-disc list-inside space-y-2 text-sm text-body-text">
              <li>Deep breathing exercises</li>
              <li>Listening to calming music</li>
              <li>Journaling thoughts and feelings</li>
            </ul>
          </section>

          {/* 4. Social Distractions */}
          <section className="bg-card rounded-xl border border-rule-hi p-5 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-sm font-bold text-ink uppercase tracking-wider flex items-center gap-2">
                <User className="h-4 w-4 text-muted-text" />
                4. Social Distractions
              </h3>
              <Badge variant="secondary" className="text-[10px]">Patient Reported</Badge>
            </div>
            <div className="text-sm text-body-text space-y-2">
              <p><span className="font-semibold text-ink">People:</span> Family and Friends</p>
              <p><span className="font-semibold text-ink">Places:</span> Public places, Parks</p>
            </div>
          </section>

          {/* 5. Contacts in Crisis */}
          <section className="bg-card rounded-xl border border-rule-hi p-5 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-sm font-bold text-ink uppercase tracking-wider flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-text" />
                5. Contacts in Crisis
              </h3>
              <Badge variant="secondary" className="text-[10px]">Verified</Badge>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center bg-surface-warm p-3 rounded-lg border border-rule">
                <div>
                  <p className="text-sm font-semibold text-ink">{clientData.profile.contact.emergencyContact.name || 'Emergency Contact'}</p>
                  <p className="text-xs text-muted-text">Emergency Contact</p>
                </div>
                <div className="flex items-center gap-2">
                  {showEmergencyContact ? (
                    <span className="text-sm font-mono text-ink bg-card px-2 py-1 rounded border border-rule-hi">{clientData.profile.contact.emergencyContact.phone || 'N/A'}</span>
                  ) : (
                    <span className="text-sm text-dim italic">Hidden for privacy</span>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => setShowEmergencyContact(!showEmergencyContact)}
                  >
                    {showEmergencyContact ? 'Hide' : 'Show'}
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* 6. Professional Support */}
          <section className="bg-card rounded-xl border border-rule-hi p-5 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-sm font-bold text-ink uppercase tracking-wider flex items-center gap-2">
                <Stethoscope className="h-4 w-4 text-muted-text" />
                6. Professional Support
              </h3>
              <Badge variant="secondary" className="text-[10px]">Verified</Badge>
            </div>
            <div className="text-sm text-body-text space-y-1">
              <p className="font-semibold text-ink">Assigned Therapist</p>
              <div className="mt-3 pt-3 border-t border-rule">
                <p className="font-semibold text-ink">National Suicide Prevention Lifeline</p>
                <p className="text-lg font-mono text-ink">988</p>
              </div>
            </div>
          </section>

          {/* 7. Safe Environment Steps */}
          <section className="bg-card rounded-xl border border-rule-hi p-5 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-sm font-bold text-ink uppercase tracking-wider flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-text" />
                7. Safe Environment Steps
              </h3>
              <Badge variant="secondary" className="text-[10px]">Agreed</Badge>
            </div>
            <ul className="list-disc list-inside space-y-2 text-sm text-body-text">
              <li>Remove access to lethal means</li>
              <li>Ensure environment is safe and supportive</li>
            </ul>
          </section>

          {/* 8. Signatures & Validation */}
          <section className="bg-rule rounded-xl border border-rule-hi p-6">
            <h3 className="text-sm font-bold text-ink uppercase tracking-wider mb-6">
              8. Validation & Signatures
            </h3>

            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="text-xs text-muted-text uppercase tracking-wider mb-2">Client Signature</p>
                <div className="font-handwriting text-2xl text-ink mb-1">{clientData.profile.identity.firstName} {clientData.profile.identity.lastName}</div>
                <div className="text-xs text-muted-text">Digitally signed on {new Date().toLocaleDateString()}</div>
                <div className="text-[10px] text-dim font-mono mt-1">IP: Verified • ID: sig_{clientData.clientId.substring(0, 8)}</div>
              </div>
              <div>
                <p className="text-xs text-muted-text uppercase tracking-wider mb-2">Clinician Signature</p>
                <div className="font-handwriting text-2xl text-ink mb-1">Clinician Signature</div>
                <div className="text-xs text-muted-text">Digitally signed on {new Date().toLocaleDateString()}</div>
                <div className="text-[10px] text-dim font-mono mt-1">License: Verified • ID: sig_admin</div>
              </div>
            </div>
          </section>

        </div>
        <div className="p-6 bg-card border-t border-rule-hi flex justify-between items-center flex-shrink-0">
          <div className="text-xs text-muted-text">
            Document ID: SP-{new Date().getFullYear()}-{clientData.clientId.substring(0, 4)} • Version 1.0
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
            <Button variant="outline" className="gap-2">
              <Files className="h-4 w-4" />
              Archive
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}