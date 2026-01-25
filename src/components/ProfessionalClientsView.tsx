import React, { useState, useEffect } from 'react';
import { dataService } from '../api';
import { Search, Filter, Plus, MoreVertical, Phone, Mail, Calendar, User, MapPin, AlertCircle, TrendingUp, AlertTriangle, Shield, Brain, CheckCircle2, Stethoscope, Clock, FileText, ChevronRight, Eye, Send, Sparkles, ShieldAlert, Files, MessageSquare, Activity, Target, Upload, XCircle, Download, Video } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Progress } from './ui/progress';
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
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { ComprehensiveClientRegistrationForm } from './ComprehensiveClientRegistrationForm';
import { toast } from 'sonner';
import { Switch } from './ui/switch';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from './ui/sheet';
import { ClientDetailView, ClientDetailData } from './ClientDetailView';
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
}

// Helper to map simple Client data to detailed view data
const mapClientToDetailData = (client: Client): ClientDetailData => {
  const [firstName, lastName] = client.name.split(' ');

  // Mock rich data for Sarah Lopez (or any client for demo purposes)
  // In a real app, this would come from a detailed API call
  const isSarah = client.name.includes('Sarah') || client.id === 'cl_982374';

  if (isSarah) {
    return {
      clientId: "cl_982374",
      profile: {
        identity: {
          firstName: "Sarah",
          lastName: "Lopez",
          preferredName: "Sarah",
          avatarUrl: "https://cdn.app.com/clients/cl_982374/avatar.jpg",
          dob: "1992-09-14",
          age: 32,
          pronouns: "she/her",
          gender: "female"
        },
        status: {
          accountStatus: "active",
          riskLevel: "medium",
          riskColor: "orange",
          riskBanner: "Recent suicidal ideation reported on 2025-01-21. Review safety plan.",
          therapyStatus: "in_treatment"
        },
        contact: {
          email: "sarah@example.com",
          phone: "+1-213-555-0943",
          emergencyContact: {
            name: "Maria Lopez",
            relationship: "Mother",
            phone: "+1-213-555-0202"
          },
          location: {
            country: "USA",
            addressLine1: "1350 Sunset Blvd",
            addressLine2: null,
            city: "Los Angeles",
            state: "CA",
            postalCode: "90026",
            timezone: "America/Los_Angeles"
          }
        }
      },
      sessions: {
        nextSession: {
          sessionId: "sess_100293",
          date: "2025-02-05",
          startTime: "15:30",
          mode: "video",
          joinUrl: "https://session.app.com/join/sess_100293",
          status: "scheduled"
        },
        lastSession: {
          sessionId: "sess_98234",
          date: "2025-01-29",
          startTime: "15:30",
          summary: "Processed anxiety triggers related to work. Introduced grounding techniques.",
          goalsDiscussed: [
            "Reduce work-related anxiety",
            "Improve coping strategies"
          ],
          actionItems: [
            "Practice grounding 3x daily",
            "Track anxiety episodes"
          ],
          fullNoteUrl: "https://api.app.com/v1/notes/sess_98234"
        },
        stats: {
          totalSessions: 14,
          cancelled: 1,
          noShows: 0,
          frequency: "weekly"
        }
      },
      clinical: {
        diagnoses: {
          primary: {
            code: "F41.1",
            description: "Generalized Anxiety Disorder"
          },
          secondary: [
            {
              code: "F32.0",
              description: "Mild Depressive Episode"
            }
          ],
          provisional: []
        },
        medications: [
          {
            name: "Sertraline",
            dosage: "50mg daily",
            prescribedBy: "Dr. John Kim",
            lastUpdated: "2025-01-10"
          }
        ],
        treatmentPlan: {
          mainGoal: "Reduce anxiety symptoms & improve daily functioning",
          subGoals: [
            "Increase coping skills",
            "Improve emotional regulation",
            "Reduce physical anxiety symptoms"
          ],
          modality: "CBT",
          progress: "on_track",
          progressPercent: 45
        },
        safety: {
          riskLevel: "medium",
          lastSafetyAssessment: {
            type: "PHQ-9",
            date: "2025-01-21",
            score: 14,
            suicidalIdeation: "yes"
          },
          safetyPlanUrl: "https://api.app.com/v1/clients/cl_982374/safety-plan"
        }
      },
      assessments: {
        latest: {
          PHQ9: {
            score: 14,
            lastUpdated: "2025-01-21",
            trend: "increasing"
          },
          GAD7: {
            score: 11,
            lastUpdated: "2025-01-21",
            trend: "stable"
          }
        },
        history: {
          PHQ9: [12, 11, 9, 14],
          GAD7: [10, 11, 11, 11],
          dates: [
            "2024-12-01",
            "2024-12-15",
            "2025-01-07",
            "2025-01-21"
          ]
        }
      },
      background: {
        presentingProblem: "Experiencing increased anxiety and difficulty concentrating at work.",
        clientHistory: {
          previousTherapy: "2 years ago for stress management",
          traumaHistory: "None reported",
          medicalConditions: ["Asthma"],
          substanceUse: "None"
        },
        personalContext: {
          relationshipStatus: "Single",
          household: "Lives alone",
          employment: {
            status: "Employed",
            occupation: "Product Designer"
          }
        }
      },
      documents: {
        notesCount: 14,
        documentsCount: 3,
        assessmentsCount: 12,
        links: {
          notes: "https://api.app.com/v1/clients/cl_982374/notes",
          documents: "https://api.app.com/v1/clients/cl_982374/documents",
          assessments: "https://api.app.com/v1/clients/cl_982374/assessments"
        }
      },
      billing: {
        insuranceProvider: "Aetna",
        copay: 20,
        claims: [
          {
            claimId: "clm_3201",
            status: "submitted",
            date: "2025-01-29",
            amount: 140
          }
        ],
        outstandingBalance: 0
      },
      communication: {
        unreadMessages: 2,
        threadsUrl: "https://api.app.com/v1/messages/cl_982374"
      },
      aiInsights: {
        progressSummary: "Client showing increased anxiety over the last 2 weeks. Recommended to reinforce grounding techniques.",
        documentationAlerts: [
          "Missing progress note for session on 2025-01-15"
        ],
        trendAlerts: [
          {
            type: "PHQ9",
            message: "Score increased from 9 to 14. Review safety assessment."
          }
        ]
      }
    };
  }

  // Fallback for other clients (using existing mock logic but matching new structure)
  return {
    clientId: client.id,
    profile: {
      identity: {
        firstName: firstName || '',
        lastName: lastName || '',
        preferredName: firstName || '',
        dob: '1990-01-01', // Mock
        age: 34, // Mock
        pronouns: 'they/them', // Mock
        gender: 'Non-binary', // Mock
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
        email: 'client@example.com',
        phone: '(555) 123-4567',
        emergencyContact: {
          name: 'Emergency Contact',
          relationship: 'Partner',
          phone: '(555) 987-6543'
        },
        location: {
          country: 'USA',
          addressLine1: '123 Main St',
          city: 'New York',
          state: 'NY',
          postalCode: '10001',
          timezone: 'America/New_York'
        }
      }
    },
    sessions: {
      stats: {
        totalSessions: 12,
        cancelled: 1,
        noShows: 0,
        frequency: 'Weekly'
      },
      nextSession: {
        sessionId: '1',
        date: 'Oct 24, 2025',
        startTime: '2:00 PM',
        mode: 'Video',
        joinUrl: '#',
        status: 'Scheduled'
      },
      lastSession: {
        sessionId: '0',
        date: 'Oct 17, 2025',
        startTime: '2:00 PM',
        summary: 'Client reported feeling better about work stress.',
        goalsDiscussed: ['Work boundaries', 'Sleep hygiene'],
        actionItems: ['Practice breathing exercises'],
        fullNoteUrl: '#'
      }
    },
    clinical: {
      diagnoses: {
        primary: { code: 'F41.1', description: 'Generalized Anxiety Disorder' },
        secondary: [],
        provisional: []
      },
      medications: [],
      treatmentPlan: {
        mainGoal: 'Reduce anxiety symptoms',
        subGoals: ['Improve sleep', 'Reduce panic attacks'],
        modality: 'CBT',
        progress: 'on_track',
        progressPercent: 65
      },
      safety: {
        riskLevel: client.safetyRisk || 'low',
        lastSafetyAssessment: {
          type: 'C-SSRS',
          date: 'Oct 1, 2025',
          score: 0,
          suicidalIdeation: 'no'
        },
        safetyPlanUrl: '#'
      }
    },
    assessments: {
      latest: {
        PHQ9: { score: 8, lastUpdated: 'Oct 15, 2025', trend: 'stable' },
        GAD7: { score: 6, lastUpdated: 'Oct 15, 2025', trend: 'decreasing' }
      },
      history: {
        PHQ9: [12, 10, 8, 8],
        GAD7: [14, 12, 8, 6],
        dates: ['2025-09-01', '2025-09-15', '2025-10-01', '2025-10-15']
      }
    },
    background: {
      presentingProblem: 'Anxiety related to work stress',
      clientHistory: {
        previousTherapy: 'None',
        traumaHistory: 'None',
        medicalConditions: [],
        substanceUse: 'None'
      },
      personalContext: {
        relationshipStatus: 'Single',
        household: 'Alone',
        employment: { status: 'Employed', occupation: 'Unknown' }
      }
    },
    documents: {
      notesCount: 12,
      documentsCount: 2,
      assessmentsCount: 4,
      links: { notes: '#', documents: '#', assessments: '#' }
    },
    billing: {
      insuranceProvider: 'Blue Cross',
      copay: 25,
      claims: [],
      outstandingBalance: 0
    },
    communication: {
      unreadMessages: 0,
      threadsUrl: '#'
    },
    aiInsights: {
      progressSummary: 'Client is making steady progress.',
      documentationAlerts: [],
      trendAlerts: []
    }
  };
};

export function ProfessionalClientsView({ userRole }: ProfessionalClientsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [newClient, setNewClient] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    sendLink: true
  });

  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      // Call the real client service backend
      const response = await fetch('http://localhost:3003/api/clients', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Transform backend data to frontend format
        const transformedClients: Client[] = data.map((client: any) => ({
          id: client.id,
          name: `${client.first_name || ''} ${client.last_name || ''}`.trim() || client.email,
          email: client.email,
          phone: client.phone_number || 'N/A',
          status: client.account_status === 'active' ? 'active' : 'inactive',
          lastVisit: client.created_at ? new Date(client.created_at).toISOString().split('T')[0] : 'N/A',
          nextAppointment: null, // TODO: Get from appointment service
          therapist: client.assigned_therapist_name || 'Unassigned',
          totalSessions: 0, // TODO: Get from appointment service
          condition: 'General Therapy', // TODO: Get from client profile
          safetyRisk: client.safety_risk_level || 'low',
          safetyFlags: [] // TODO: Get from client profile
        }));
        setClients(transformedClients);
      } else {
        console.warn('Failed to fetch clients from backend, using empty list');
        setClients([]);
      }
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
          <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-red-200 whitespace-nowrap">
            <AlertCircle className="w-3 h-3 mr-1" />
            High Safety Concern
          </Badge>
          {client.safetyFlags?.includes('abuse_environment') && (
            <div className="flex items-center text-xs text-red-600 font-medium ml-1">
              <Shield className="w-3 h-3 mr-1" /> Environment unsafe
            </div>
          )}
          {client.safetyFlags?.includes('psychosis') && (
            <div className="flex items-center text-xs text-red-600 font-medium ml-1">
              <Brain className="w-3 h-3 mr-1" /> Needs higher care
            </div>
          )}
          {client.safetyFlags?.includes('substance') && (
            <div className="flex items-center text-xs text-red-600 font-medium ml-1">
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
      <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200 whitespace-nowrap">
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
  const [showEmergencyContact, setShowEmergencyContact] = useState(false);

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
          <Card className="border-border/50 bg-gradient-to-br from-card to-card/50 shadow-sm hover:shadow-lg hover:border-green-500/20 transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Active</p>
                  <p className="text-3xl font-bold tracking-tight text-green-600">{clients.filter((p: Client) => p.status === 'active').length}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/20 transition-colors duration-300">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={statsVariants}>
          <Card className="border-border/50 bg-gradient-to-br from-card to-card/50 shadow-sm hover:shadow-lg hover:border-blue-500/20 transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">New This Month</p>
                  <p className="text-3xl font-bold tracking-tight text-blue-600">{clients.filter((p: Client) => p.status === 'new').length}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors duration-300">
                  <User className="h-6 w-6 text-blue-600" />
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
                            <DropdownMenuItem className="text-red-600">
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
            <SheetContent side="right" className="sm:max-w-6xl w-[90vw] p-0 border-l border-zinc-200 shadow-2xl bg-white overflow-hidden flex flex-col">
              {(() => {
                const detailData = mapClientToDetailData(selectedClient);
                return (
                  <>
                    {/* 1. Top Header (Identity + Safety Banner) */}
                    <div className="bg-white border-b border-zinc-200 px-8 py-6 flex-shrink-0 z-10 shadow-sm">
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
                          <Avatar className="h-20 w-20 ring-4 ring-zinc-50 shadow-md rounded-2xl">
                            <AvatarFallback className="bg-zinc-900 text-white text-2xl font-light">
                              {detailData.profile.identity.firstName[0]}{detailData.profile.identity.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="pt-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h2 className="text-2xl font-bold tracking-tight text-zinc-900">
                                {detailData.profile.identity.firstName} {detailData.profile.identity.lastName}
                              </h2>
                              <span className="text-sm text-zinc-500 font-medium">({detailData.profile.identity.preferredName})</span>
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${detailData.profile.status.riskLevel === 'high' ? 'bg-red-100 text-red-700' :
                                detailData.profile.status.riskLevel === 'medium' ? 'bg-orange-100 text-orange-700' :
                                  'bg-emerald-100 text-emerald-700'
                                }`}>
                                {detailData.profile.status.riskLevel} Risk
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm font-medium text-zinc-500">
                              <span>{detailData.profile.identity.age} yrs</span>
                              <span className="text-zinc-300">•</span>
                              <span>{detailData.profile.identity.pronouns}</span>
                              <span className="text-zinc-300">•</span>
                              <span className={`capitalize ${detailData.profile.status.accountStatus === 'active' ? 'text-emerald-600' : 'text-zinc-500'}`}>
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
                        <div className={`mt-6 p-3 rounded-lg flex items-center gap-3 ${detailData.profile.status.riskLevel === 'high' ? 'bg-red-50 border border-red-100 text-red-800' : 'bg-orange-50 border border-orange-100 text-orange-800'}`}>
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

                    <div className="flex-1 overflow-y-auto bg-zinc-50/50 p-8 space-y-8">

                      {/* AI Insights Section - Feature Flagged: Disabled */}
                      {false && (detailData.aiInsights.documentationAlerts.length > 0 || detailData.aiInsights.trendAlerts.length > 0) && (
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 shadow-sm">
                          <div className="flex items-center gap-2 mb-3">
                            <Brain className="h-5 w-5 text-blue-600" />
                            <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wider">AI Insights & Alerts</h3>
                          </div>
                          <p className="text-sm text-blue-800 mb-4 leading-relaxed">
                            {detailData.aiInsights.progressSummary}
                          </p>
                          <div className="space-y-3">
                            {detailData.aiInsights.documentationAlerts.map((alert, i) => (
                              <div key={`doc-${i}`} className="flex items-start gap-3 bg-white/60 p-3 rounded-lg border border-blue-100/50">
                                <AlertTriangle className="h-4 w-4 text-orange-500 flex-shrink-0 mt-0.5" />
                                <span className="text-sm text-zinc-700">{alert}</span>
                              </div>
                            ))}
                            {detailData.aiInsights.trendAlerts.map((alert, i) => (
                              <div key={`trend-${i}`} className="flex items-start gap-3 bg-white/60 p-3 rounded-lg border border-blue-100/50">
                                <TrendingUp className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                                <span className="text-sm text-zinc-700">
                                  <span className="font-semibold text-zinc-900">{alert.type}:</span> {alert.message}
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
                        <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm flex flex-col justify-between h-48 relative overflow-hidden">
                          <div>
                            <div className="flex items-center gap-2 text-zinc-500 mb-3">
                              <Calendar className="h-4 w-4" />
                              <span className="text-xs font-bold uppercase tracking-wider">Next Session</span>
                            </div>
                            {detailData.sessions.nextSession ? (
                              <>
                                <div className="text-xl font-semibold text-zinc-900 mb-1">
                                  {new Date(detailData.sessions.nextSession.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                </div>
                                <div className="text-sm text-zinc-600 mb-2">
                                  {detailData.sessions.nextSession.startTime} • {detailData.sessions.nextSession.mode}
                                </div>
                              </>
                            ) : (
                              <div className="text-sm text-zinc-500 italic">No upcoming sessions</div>
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
                        <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm flex flex-col justify-between h-48">
                          <div>
                            <div className="flex items-center gap-2 text-zinc-500 mb-3">
                              <Clock className="h-4 w-4" />
                              <span className="text-xs font-bold uppercase tracking-wider">Last Session</span>
                            </div>
                            {detailData.sessions.lastSession ? (
                              <>
                                <div className="text-sm font-medium text-zinc-900 mb-1">
                                  {new Date(detailData.sessions.lastSession.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </div>
                                <p className="text-xs text-zinc-600 line-clamp-3 leading-relaxed">
                                  {detailData.sessions.lastSession.summary}
                                </p>
                              </>
                            ) : (
                              <div className="text-sm text-zinc-500 italic">No previous sessions</div>
                            )}
                          </div>
                          {detailData.sessions.lastSession && (
                            <Button size="sm" variant="outline" className="w-full mt-auto shadow-sm">
                              View Full Note
                            </Button>
                          )}
                        </div>

                        {/* Tile 3: Assessments Overview */}
                        <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm flex flex-col justify-between h-48">
                          <div>
                            <div className="flex items-center gap-2 text-zinc-500 mb-3">
                              <Activity className="h-4 w-4" />
                              <span className="text-xs font-bold uppercase tracking-wider">Assessments</span>
                            </div>
                            <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-zinc-700">PHQ-9</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-lg font-bold text-zinc-900">{detailData.assessments.latest.PHQ9.score}</span>
                                  <span className={`text-xs ${detailData.assessments.latest.PHQ9.trend === 'increasing' ? 'text-red-500' : 'text-emerald-500'}`}>
                                    {detailData.assessments.latest.PHQ9.trend === 'increasing' ? '↑' : '↓'}
                                  </span>
                                </div>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-zinc-700">GAD-7</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-lg font-bold text-zinc-900">{detailData.assessments.latest.GAD7.score}</span>
                                  <span className="text-xs text-zinc-400">→</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="text-xs text-zinc-400 mt-auto text-center">
                            Last updated: {detailData.assessments.latest.PHQ9.lastUpdated}
                          </div>
                        </div>

                        {/* Tile 4: Treatment Plan Snapshot */}
                        <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm flex flex-col justify-between h-48">
                          <div>
                            <div className="flex items-center gap-2 text-zinc-500 mb-3">
                              <Target className="h-4 w-4" />
                              <span className="text-xs font-bold uppercase tracking-wider">Treatment Plan</span>
                            </div>
                            <div className="text-sm font-medium text-zinc-900 mb-1 line-clamp-1">
                              {detailData.clinical.treatmentPlan.mainGoal}
                            </div>
                            <div className="flex gap-2 mb-3">
                              <span className="px-2 py-0.5 bg-zinc-100 text-zinc-600 text-xs rounded border border-zinc-200">
                                {detailData.clinical.treatmentPlan.modality}
                              </span>
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs text-zinc-500">
                                <span>Progress</span>
                                <span>{detailData.clinical.treatmentPlan.progressPercent}%</span>
                              </div>
                              <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
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
                      <section className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-zinc-100 bg-zinc-50/50 flex justify-between items-center">
                          <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
                            <Brain className="h-4 w-4 text-zinc-500" />
                            Clinical Overview
                          </h3>
                          <Button variant="ghost" size="sm" className="h-8 text-xs">Edit Clinical Data</Button>
                        </div>
                        <div className="p-6 grid grid-cols-4 gap-8">
                          {/* Diagnoses */}
                          <div className="col-span-1 border-r border-zinc-100 pr-6">
                            <p className="text-xs font-bold text-zinc-400 uppercase mb-3">Diagnoses</p>
                            <div className="space-y-3">
                              <div>
                                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded mb-1 inline-block">Primary</span>
                                <p className="text-sm font-semibold text-zinc-900">{detailData.clinical.diagnoses.primary.description}</p>
                                <p className="text-xs text-zinc-500 font-mono">{detailData.clinical.diagnoses.primary.code}</p>
                              </div>
                              {detailData.clinical.diagnoses.secondary.map((diag, i) => (
                                <div key={i}>
                                  <span className="text-xs font-semibold text-zinc-500 bg-zinc-100 px-1.5 py-0.5 rounded mb-1 inline-block">Secondary</span>
                                  <p className="text-sm font-medium text-zinc-700">{diag.description}</p>
                                  <p className="text-xs text-zinc-500 font-mono">{diag.code}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Medications */}
                          <div className="col-span-1 border-r border-zinc-100 pr-6">
                            <p className="text-xs font-bold text-zinc-400 uppercase mb-3">Medications</p>
                            <div className="space-y-3">
                              {detailData.clinical.medications.map((med, i) => (
                                <div key={i} className="bg-zinc-50 p-3 rounded-lg border border-zinc-100">
                                  <div className="flex justify-between items-start mb-1">
                                    <span className="text-sm font-semibold text-zinc-900">{med.name}</span>
                                  </div>
                                  <p className="text-xs text-zinc-600 mb-1">{med.dosage}</p>
                                  <p className="text-[10px] text-zinc-400 uppercase">Rx: {med.prescribedBy}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Risk & Safety */}
                          <div className="col-span-1 border-r border-zinc-100 pr-6">
                            <p className="text-xs font-bold text-zinc-400 uppercase mb-3">Risk & Safety</p>
                            <div className="space-y-4">
                              <div>
                                <p className="text-xs text-zinc-500 mb-1">Last Safety Assessment</p>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-zinc-900">{detailData.clinical.safety.lastSafetyAssessment.date}</span>
                                  <span className="text-xs bg-zinc-100 text-zinc-600 px-1.5 py-0.5 rounded">{detailData.clinical.safety.lastSafetyAssessment.type}</span>
                                </div>
                              </div>
                              <div>
                                <p className="text-xs text-zinc-500 mb-1">Suicidal Ideation</p>
                                <span className={`text-sm font-semibold ${detailData.clinical.safety.lastSafetyAssessment.suicidalIdeation === 'yes' ? 'text-red-600' : 'text-zinc-900'}`}>
                                  {detailData.clinical.safety.lastSafetyAssessment.suicidalIdeation === 'yes' ? 'PRESENT' : 'None Reported'}
                                </span>
                              </div>
                              <div>
                                <p className="text-xs text-zinc-500 mb-1">Emergency Contact</p>
                                <p className="text-sm font-medium text-zinc-900">{detailData.profile.contact.emergencyContact.name}</p>
                                <p className="text-xs text-zinc-500">{detailData.profile.contact.emergencyContact.phone}</p>
                              </div>
                            </div>
                          </div>

                          {/* Sessions & Attendance */}
                          <div className="col-span-1">
                            <p className="text-xs font-bold text-zinc-400 uppercase mb-3">Attendance</p>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="bg-zinc-50 p-3 rounded-lg text-center">
                                <span className="block text-2xl font-bold text-zinc-900">{detailData.sessions.stats.totalSessions}</span>
                                <span className="text-xs text-zinc-500 uppercase">Total</span>
                              </div>
                              <div className="bg-zinc-50 p-3 rounded-lg text-center">
                                <span className="block text-2xl font-bold text-zinc-900">{detailData.sessions.stats.cancelled}</span>
                                <span className="text-xs text-zinc-500 uppercase">Cancelled</span>
                              </div>
                            </div>
                            <div className="mt-4">
                              <div className="flex justify-between text-xs text-zinc-500 mb-1">
                                <span>Frequency</span>
                                <span className="font-medium text-zinc-900 capitalize">{detailData.sessions.stats.frequency}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </section>

                      {/* 4. Client Background */}
                      <section className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6">
                        <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                          <User className="h-4 w-4 text-zinc-500" />
                          Client Background
                        </h3>
                        <div className="grid grid-cols-3 gap-8">
                          <div className="col-span-2">
                            <p className="text-xs font-bold text-zinc-400 uppercase mb-2">Presenting Problem</p>
                            <p className="text-sm text-zinc-700 leading-relaxed mb-4">
                              {detailData.background.presentingProblem}
                            </p>
                            <div className="grid grid-cols-2 gap-6">
                              <div>
                                <p className="text-xs font-bold text-zinc-400 uppercase mb-2">History</p>
                                <ul className="space-y-1 text-sm text-zinc-600">
                                  <li><span className="text-zinc-400">•</span> {detailData.background.clientHistory.previousTherapy}</li>
                                  <li><span className="text-zinc-400">•</span> {detailData.background.clientHistory.traumaHistory}</li>
                                </ul>
                              </div>
                              <div>
                                <p className="text-xs font-bold text-zinc-400 uppercase mb-2">Context</p>
                                <ul className="space-y-1 text-sm text-zinc-600">
                                  <li><span className="text-zinc-400">•</span> {detailData.background.personalContext.employment.occupation}</li>
                                  <li><span className="text-zinc-400">•</span> {detailData.background.personalContext.household}</li>
                                </ul>
                              </div>
                            </div>
                          </div>
                          <div className="col-span-1 bg-zinc-50 rounded-xl p-4 border border-zinc-100">
                            <p className="text-xs font-bold text-zinc-400 uppercase mb-3">Insurance & Billing</p>
                            <div className="space-y-3">
                              <div className="flex justify-between">
                                <span className="text-sm text-zinc-600">Provider</span>
                                <span className="text-sm font-medium text-zinc-900">{detailData.billing.insuranceProvider}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-zinc-600">Copay</span>
                                <span className="text-sm font-medium text-zinc-900">${detailData.billing.copay}</span>
                              </div>
                              <div className="h-px bg-zinc-200 my-1" />
                              <div className="flex justify-between">
                                <span className="text-sm text-zinc-600">Outstanding</span>
                                <span className="text-sm font-bold text-zinc-900">${detailData.billing.outstandingBalance}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </section>

                      {/* 5. Communication & Documents Area (Tabs) */}
                      <section className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden min-h-[500px]">
                        <Tabs defaultValue="notes" className="w-full">
                          <div className="px-6 py-3 border-b border-zinc-100 bg-zinc-50/50">
                            <TabsList className="bg-zinc-100/50 p-1">
                              <TabsTrigger value="notes" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                <FileText className="h-4 w-4 mr-2" />
                                Notes
                              </TabsTrigger>
                              <TabsTrigger value="documents" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                <Files className="h-4 w-4 mr-2" />
                                Documents
                              </TabsTrigger>
                              <TabsTrigger value="assessments" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                <Activity className="h-4 w-4 mr-2" />
                                Assessments
                              </TabsTrigger>
                              <TabsTrigger value="messages" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Messages
                              </TabsTrigger>
                            </TabsList>
                          </div>

                          <div className="p-6">
                            <TabsContent value="notes" className="mt-0 space-y-4">
                              <div className="flex justify-between items-center mb-4">
                                <h4 className="text-sm font-bold text-zinc-900">Session Notes</h4>
                                <Button size="sm" className="h-8"><Plus className="h-3 w-3 mr-2" /> New Note</Button>
                              </div>
                              {[1, 2, 3].map((_, i) => (
                                <div key={i} className="border border-zinc-100 rounded-lg p-4 hover:bg-zinc-50 transition-colors cursor-pointer">
                                  <div className="flex justify-between items-start mb-2">
                                    <div>
                                      <span className="text-sm font-semibold text-zinc-900">Psychotherapy Session</span>
                                      <span className="text-xs text-zinc-500 ml-2">Oct {20 - i * 7}, 2025</span>
                                    </div>
                                    <span className="text-xs bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-medium">Signed</span>
                                  </div>
                                  <p className="text-sm text-zinc-600 line-clamp-2">
                                    Patient discussed progress with anxiety management techniques. Reported reduced frequency of panic attacks...
                                  </p>
                                </div>
                              ))}
                            </TabsContent>

                            <TabsContent value="documents" className="mt-0">
                              <div className="flex justify-between items-center mb-4">
                                <h4 className="text-sm font-bold text-zinc-900">Clinical Documents</h4>
                                <Button size="sm" variant="outline" className="h-8"><Upload className="h-3 w-3 mr-2" /> Upload</Button>
                              </div>
                              <div className="grid grid-cols-3 gap-4">
                                {['Intake Assessment', 'Safety Plan', 'Consent to Treat', 'Release of Information'].map((doc, i) => (
                                  <div key={i} className="border border-zinc-100 rounded-lg p-4 flex items-center gap-3 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all cursor-pointer group">
                                    <div className="h-10 w-10 bg-zinc-100 rounded-lg flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all">
                                      <FileText className="h-5 w-5 text-zinc-400 group-hover:text-indigo-500" />
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-zinc-900">{doc}</p>
                                      <p className="text-xs text-zinc-500">PDF • 1.2 MB</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </TabsContent>

                            <TabsContent value="assessments" className="mt-0">
                              <div className="flex justify-between items-center mb-6">
                                <h4 className="text-sm font-bold text-zinc-900">Assessment History</h4>
                                <Button size="sm" variant="outline" className="h-8">Send Assessment</Button>
                              </div>
                              <div className="h-[300px] w-full border border-zinc-100 rounded-xl p-4 mb-6">
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
                                    <Line type="monotone" dataKey="PHQ9" stroke="#F97316" strokeWidth={2} dot={{ r: 4 }} />
                                    <Line type="monotone" dataKey="GAD7" stroke="#3B82F6" strokeWidth={2} dot={{ r: 4 }} />
                                  </LineChart>
                                </ResponsiveContainer>
                              </div>
                            </TabsContent>

                            <TabsContent value="messages" className="mt-0">
                              <div className="text-center py-12">
                                <MessageSquare className="h-12 w-12 text-zinc-200 mx-auto mb-3" />
                                <h3 className="text-lg font-medium text-zinc-900">Secure Messaging</h3>
                                <p className="text-zinc-500 max-w-sm mx-auto mt-2">
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
                <Label htmlFor="phone" className="text-sm font-medium text-muted-foreground">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={newClient.phone}
                  onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                  className="h-11 bg-muted/20 border-border/50 focus:bg-background transition-all"
                  placeholder="(555) 123-4567"
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
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Mail className="h-4 w-4 text-blue-600" />
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
                          view: 'client-registration',
                          email: newClient.email,
                          firstName: newClient.firstName,
                          lastName: newClient.lastName,
                          phone: newClient.phone,
                          token: 'preview-token-' + Date.now()
                        });
                        window.open(`${window.location.origin}/?${params.toString()}`, '_blank');
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
                setNewClient({ firstName: '', lastName: '', email: '', phone: '', sendLink: true });
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
      <Dialog open={isSafetyPlanOpen} onOpenChange={setIsSafetyPlanOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col p-0 overflow-hidden gap-0 border-0 shadow-2xl z-[100]">
          <div className="bg-red-50 p-6 border-b border-red-100 flex-shrink-0 relative">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200 uppercase tracking-widest text-[10px]">
                  Legal Record
                </Badge>
                <Badge variant="outline" className="bg-white text-zinc-600 border-zinc-200 uppercase tracking-widest text-[10px]">
                  Established: Jan 21, 2025
                </Badge>
              </div>
              <DialogTitle className="text-2xl font-semibold flex items-center gap-2 text-red-900">
                <ShieldAlert className="h-6 w-6 text-red-600" />
                Active Safety Plan
              </DialogTitle>
              <DialogDescription className="text-red-800">
                Current active safety protocol. Digitally signed and locked.
              </DialogDescription>
            </DialogHeader>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 rounded-full"
              onClick={() => setIsSafetyPlanOpen(false)}
            >
              <XCircle className="h-5 w-5" />
            </Button>
          </div>

          <div className="p-6 flex-1 overflow-y-auto space-y-8 bg-zinc-50/50">

            {/* 1. Risk Overview */}
            <section className="bg-white rounded-xl border border-zinc-200 p-5 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
                  <Activity className="h-4 w-4 text-zinc-500" />
                  1. Risk Overview
                </h3>
                <Badge variant="secondary" className="text-[10px]">Clinician Verified</Badge>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-100">
                  <span className="text-xs text-zinc-500 uppercase font-semibold">Current Risk Status</span>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      Medium Risk
                    </span>
                  </div>
                </div>
                <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-100">
                  <span className="text-xs text-zinc-500 uppercase font-semibold">Clinical Basis</span>
                  <div className="mt-1 text-sm font-medium text-zinc-900">PHQ-9 Score: 14 • Clinical Interview</div>
                </div>
              </div>
            </section>

            {/* 2. Warning Signs */}
            <section className="bg-white rounded-xl border border-zinc-200 p-5 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-zinc-500" />
                  2. Warning Signs
                </h3>
                <Badge variant="secondary" className="text-[10px]">Patient Reported</Badge>
              </div>
              <ul className="list-disc list-inside space-y-2 text-sm text-zinc-700">
                <li>Increased isolation and withdrawal from social activities</li>
                <li>Changes in sleep patterns (insomnia)</li>
                <li>Expressing feelings of hopelessness</li>
              </ul>
            </section>

            {/* 3. Internal Coping Strategies */}
            <section className="bg-white rounded-xl border border-zinc-200 p-5 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
                  <Brain className="h-4 w-4 text-zinc-500" />
                  3. Internal Coping Strategies
                </h3>
                <Badge variant="secondary" className="text-[10px]">Patient Reported</Badge>
              </div>
              <ul className="list-disc list-inside space-y-2 text-sm text-zinc-700">
                <li>Deep breathing exercises (4-7-8 technique)</li>
                <li>Listening to calming music playlist</li>
                <li>Journaling thoughts and feelings</li>
              </ul>
            </section>

            {/* 4. Social Distractions */}
            <section className="bg-white rounded-xl border border-zinc-200 p-5 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
                  <User className="h-4 w-4 text-zinc-500" />
                  4. Social Distractions
                </h3>
                <Badge variant="secondary" className="text-[10px]">Patient Reported</Badge>
              </div>
              <div className="text-sm text-zinc-700 space-y-2">
                <p><span className="font-semibold text-zinc-900">People:</span> Call sister (Maria), Visit local coffee shop</p>
                <p><span className="font-semibold text-zinc-900">Places:</span> Public library, Community park</p>
              </div>
            </section>

            {/* 5. Contacts in Crisis */}
            <section className="bg-white rounded-xl border border-zinc-200 p-5 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
                  <Phone className="h-4 w-4 text-zinc-500" />
                  5. Contacts in Crisis
                </h3>
                <Badge variant="secondary" className="text-[10px]">Verified</Badge>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center bg-zinc-50 p-3 rounded-lg border border-zinc-100">
                  <div>
                    <p className="text-sm font-semibold text-zinc-900">Maria Lopez (Sister)</p>
                    <p className="text-xs text-zinc-500">Emergency Contact</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {showEmergencyContact ? (
                      <span className="text-sm font-mono text-zinc-900 bg-white px-2 py-1 rounded border border-zinc-200">+1-213-555-0202</span>
                    ) : (
                      <span className="text-sm text-zinc-400 italic">Hidden for privacy</span>
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
            <section className="bg-white rounded-xl border border-zinc-200 p-5 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
                  <Stethoscope className="h-4 w-4 text-zinc-500" />
                  6. Professional Support
                </h3>
                <Badge variant="secondary" className="text-[10px]">Verified</Badge>
              </div>
              <div className="text-sm text-zinc-700 space-y-1">
                <p className="font-semibold text-zinc-900">Dr. Sarah Chen (Therapist)</p>
                <p>Ataraxia Clinic - (555) 123-4567</p>
                <div className="mt-3 pt-3 border-t border-zinc-100">
                  <p className="font-semibold text-zinc-900">National Suicide Prevention Lifeline</p>
                  <p className="text-lg font-mono text-zinc-900">988</p>
                </div>
              </div>
            </section>

            {/* 7. Safe Environment Steps */}
            <section className="bg-white rounded-xl border border-zinc-200 p-5 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
                  <Shield className="h-4 w-4 text-zinc-500" />
                  7. Safe Environment Steps
                </h3>
                <Badge variant="secondary" className="text-[10px]">Agreed</Badge>
              </div>
              <ul className="list-disc list-inside space-y-2 text-sm text-zinc-700">
                <li>Remove access to sharp objects in the bedroom</li>
                <li>Give medication to sister for dispensing</li>
              </ul>
            </section>

            {/* 8. Signatures & Validation */}
            <section className="bg-zinc-100 rounded-xl border border-zinc-200 p-6">
              <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider mb-6">
                8. Validation & Signatures
              </h3>

              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Client Signature</p>
                  <div className="font-handwriting text-2xl text-zinc-800 mb-1">Sarah Lopez</div>
                  <div className="text-xs text-zinc-500">Digitally signed on Jan 21, 2025 at 14:30 PST</div>
                  <div className="text-[10px] text-zinc-400 font-mono mt-1">IP: 192.168.1.1 • ID: sig_982374</div>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Clinician Signature</p>
                  <div className="font-handwriting text-2xl text-zinc-800 mb-1">Dr. Sarah Chen</div>
                  <div className="text-xs text-zinc-500">Digitally signed on Jan 21, 2025 at 14:35 PST</div>
                  <div className="text-[10px] text-zinc-400 font-mono mt-1">License: PSY-29384 • ID: sig_admin_22</div>
                </div>
              </div>
            </section>

          </div>
          <div className="p-6 bg-white border-t border-zinc-200 flex justify-between items-center flex-shrink-0">
            <div className="text-xs text-zinc-500">
              Document ID: SP-2025-001 • Version 1.0 (Final)
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
          onSave={async (data) => {
            try {
              // Update the client data in the dataService
              await dataService.update('professional_clients', selectedClient.id, {
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
        <div className="bg-emerald-50 p-6 border-b border-emerald-100 flex-shrink-0 relative">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-emerald-200 uppercase tracking-widest text-[10px]">
                Active Plan
              </Badge>
              <Badge variant="outline" className="bg-white text-zinc-600 border-zinc-200 uppercase tracking-widest text-[10px]">
                Review: Feb 28, 2025
              </Badge>
            </div>
            <DialogTitle className="text-2xl font-semibold flex items-center gap-2 text-emerald-900">
              <Target className="h-6 w-6 text-emerald-600" />
              Treatment Plan
            </DialogTitle>
            <DialogDescription className="text-emerald-800">
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

        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-white">
          {/* 1. Primary Goal */}
          <section>
            <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-2 mb-3">
              <Target className="h-4 w-4 text-zinc-500" />
              Primary Goal
            </h3>
            <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100">
              <p className="text-lg font-medium text-zinc-900 mb-2">{plan.mainGoal}</p>
              <div className="flex gap-2">
                <Badge variant="secondary" className="bg-white border-zinc-200">{plan.modality}</Badge>
                <Badge variant="secondary" className="bg-white border-zinc-200">Weekly Sessions</Badge>
              </div>
            </div>
          </section>

          {/* 2. Objectives */}
          <section>
            <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-2 mb-3">
              <CheckCircle2 className="h-4 w-4 text-zinc-500" />
              Objectives & Interventions
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg border border-zinc-100 hover:bg-zinc-50 transition-colors">
                <div className="mt-1 h-5 w-5 rounded-full border-2 border-emerald-500 flex items-center justify-center">
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                </div>
                <div>
                  <p className="font-medium text-zinc-900">Identify Anxiety Triggers</p>
                  <p className="text-sm text-zinc-600">Log daily anxiety levels and associated context.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg border border-zinc-100 hover:bg-zinc-50 transition-colors">
                <div className="mt-1 h-5 w-5 rounded-full border-2 border-zinc-300" />
                <div>
                  <p className="font-medium text-zinc-900">Practice Grounding Techniques</p>
                  <p className="text-sm text-zinc-600">Apply 5-4-3-2-1 technique during high stress moments.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg border border-zinc-100 hover:bg-zinc-50 transition-colors">
                <div className="mt-1 h-5 w-5 rounded-full border-2 border-zinc-300" />
                <div>
                  <p className="font-medium text-zinc-900">Sleep Hygiene Improvement</p>
                  <p className="text-sm text-zinc-600">Establish consistent 11 PM bedtime routine.</p>
                </div>
              </div>
            </div>
          </section>

          {/* 3. Progress */}
          <section>
            <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-zinc-500" />
              Progress Tracking
            </h3>
            <div className="bg-white rounded-xl border border-zinc-200 p-5">
              <div className="flex justify-between items-end mb-2">
                <span className="text-sm font-medium text-zinc-600">Overall Progress</span>
                <span className="text-2xl font-bold text-emerald-600">{plan.progressPercent}%</span>
              </div>
              <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden mb-4">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${plan.progressPercent}%` }} />
              </div>
              <p className="text-sm text-zinc-500">
                Client is showing consistent improvement in identifying triggers. Sleep hygiene remains a challenge area.
              </p>
            </div>
          </section>
        </div>

        <div className="p-6 bg-white border-t border-zinc-200 flex justify-end gap-3 flex-shrink-0">
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