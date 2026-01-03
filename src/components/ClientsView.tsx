import React, { useState, useEffect } from 'react';
import { dataService } from '../api';
import { Search, Filter, Plus, MoreVertical, Phone, Mail, Calendar, User, X, MapPin, Edit } from 'lucide-react';
import { FirstAidKit, ClipboardText, Warning, IdentificationCard, Heart, NotePencil } from '@phosphor-icons/react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Tag } from './ui/tag';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Textarea } from './ui/textarea';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'pending';
  lastAppointment: string | null;
  nextAppointment: string | null;
  therapist: string;
  joinedDate: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  medicalInfo: {
    diagnosis: string;
    medications: string[];
    allergies: string[];
    notes: string;
  };
  treatmentPlan: {
    goals: string[];
    frequency: string;
    duration: string;
  };
  appointmentHistory: Array<{
    date: string;
    type: string;
    notes: string;
  }>;
  sessionNotes: Array<{
    id: string;
    date: string;
    appointmentType: string;
    duration: string;
    assessment: string;
    interventions: string;
    progress: string;
    nextSessionPlan: string;
    therapist: string;
  }>;
}

export function ClientsView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const data = await dataService.list('clients');

      if (data.length === 0) {
        // Seed mock data
        const mockData: Client[] = [
          {
            id: '1',
            name: 'Sarah Johnson',
            email: 'sarah.j@email.com',
            phone: '(555) 123-4567',
            status: 'active',
            lastAppointment: '2025-10-08',
            nextAppointment: '2025-10-15',
            therapist: 'Dr. Smith',
            joinedDate: '2024-06-15',
            dateOfBirth: '1988-03-22',
            gender: 'Female',
            address: '123 Main St, Apt 4B, New York, NY 10001',
            emergencyContact: {
              name: 'John Johnson',
              relationship: 'Spouse',
              phone: '(555) 123-4568'
            },
            medicalInfo: {
              diagnosis: 'Anxiety Disorder, Depression',
              medications: ['Sertraline 50mg', 'Lorazepam 0.5mg PRN'],
              allergies: ['Penicillin'],
              notes: 'Client responds well to CBT. Prefers morning appointments.'
            },
            treatmentPlan: {
              goals: ['Reduce anxiety symptoms', 'Improve sleep quality', 'Develop coping strategies'],
              frequency: 'Weekly sessions',
              duration: '6 months (ongoing)'
            },
            appointmentHistory: [
              { date: '2025-10-08', type: 'Therapy Session', notes: 'Discussed stress management techniques' },
              { date: '2025-10-01', type: 'Therapy Session', notes: 'Review of weekly progress' },
              { date: '2025-09-24', type: 'Initial Assessment', notes: 'Completed intake forms and assessment' }
            ],
            sessionNotes: [
              {
                id: 'note-1',
                date: '2025-10-08',
                appointmentType: 'Individual Therapy Session',
                duration: '50 minutes',
                assessment: 'Client presented with moderate anxiety levels (6/10). Reported improved sleep over past week following implementation of relaxation techniques. Discussed recent workplace stressors and interpersonal conflicts.',
                interventions: 'Applied CBT techniques including cognitive restructuring around workplace anxiety. Practiced progressive muscle relaxation. Reviewed thought records from previous week. Assigned behavioral activation homework.',
                progress: 'Client demonstrates good understanding of CBT concepts and is actively engaging with homework assignments. Anxiety levels trending downward from initial assessment (was 8/10, now 6/10). Sleep quality improved from 3/10 to 6/10.',
                nextSessionPlan: 'Continue cognitive restructuring work. Introduce mindfulness techniques. Review progress on behavioral activation goals. Prepare for potential exposure work if client feels ready.',
                therapist: 'Dr. Smith'
              },
              {
                id: 'note-2',
                date: '2025-10-01',
                appointmentType: 'Individual Therapy Session',
                duration: '50 minutes',
                assessment: 'Client reported continued anxiety related to work deadlines. Sleep disturbances persist (waking 2-3 times per night). Mood stable, no suicidal ideation.',
                interventions: 'Reviewed and reinforced CBT techniques for managing anxious thoughts. Introduced sleep hygiene education and relaxation exercises. Practiced deep breathing techniques in session.',
                progress: 'Client showing gradual improvement in recognizing automatic negative thoughts. Beginning to challenge cognitive distortions independently. Motivated to implement sleep hygiene recommendations.',
                nextSessionPlan: 'Follow up on sleep hygiene implementation. Continue work on thought challenging. Begin exploring underlying core beliefs contributing to anxiety.',
                therapist: 'Dr. Smith'
              }
            ]
          },
          {
            id: '2',
            name: 'Michael Chen',
            email: 'michael.chen@email.com',
            phone: '(555) 234-5678',
            status: 'active',
            lastAppointment: '2025-10-09',
            nextAppointment: '2025-10-16',
            therapist: 'Dr. Johnson',
            joinedDate: '2024-08-20',
            dateOfBirth: '1992-07-15',
            gender: 'Male',
            address: '456 Oak Avenue, Brooklyn, NY 11201',
            emergencyContact: {
              name: 'Lisa Chen',
              relationship: 'Sister',
              phone: '(555) 234-5679'
            },
            medicalInfo: {
              diagnosis: 'PTSD, Social Anxiety',
              medications: ['Paroxetine 20mg'],
              allergies: ['None reported'],
              notes: 'Veteran, prefers structured sessions. Comfortable with exposure therapy.'
            },
            treatmentPlan: {
              goals: ['Process traumatic experiences', 'Build social confidence', 'Establish daily routines'],
              frequency: 'Twice weekly',
              duration: '12 months'
            },
            appointmentHistory: [
              { date: '2025-10-09', type: 'Therapy Session', notes: 'EMDR session focused on trigger management' },
              { date: '2025-10-05', type: 'Therapy Session', notes: 'Social skills practice through role-play' }
            ],
            sessionNotes: [
              {
                id: 'note-3',
                date: '2025-10-09',
                appointmentType: 'EMDR Therapy Session',
                duration: '60 minutes',
                assessment: 'Client presented with elevated PTSD symptoms following recent triggering event. SUDS rating 7/10 at start of session. Client appears motivated for processing work.',
                interventions: 'Conducted EMDR processing on recent trigger. Utilized bilateral stimulation (eye movements). Installed positive cognition "I am safe now." Completed body scan. Taught grounding techniques for between sessions.',
                progress: 'SUDS rating decreased to 3/10 by end of session. Client successfully processed traumatic memory with reduced emotional charge. Reports feeling more in control.',
                nextSessionPlan: 'Continue EMDR protocol on remaining trauma targets. Check in on grounding technique practice. Begin preparation phase for social anxiety exposure work.',
                therapist: 'Dr. Johnson'
              }
            ]
          },
          {
            id: '3',
            name: 'Emily Rodriguez',
            email: 'emily.r@email.com',
            phone: '(555) 345-6789',
            status: 'active',
            lastAppointment: '2025-10-07',
            nextAppointment: '2025-10-14',
            therapist: 'Dr. Smith',
            joinedDate: '2024-09-10',
            dateOfBirth: '1995-11-30',
            gender: 'Female',
            address: '789 Park Place, Manhattan, NY 10019',
            emergencyContact: {
              name: 'Maria Rodriguez',
              relationship: 'Mother',
              phone: '(555) 345-6790'
            },
            medicalInfo: {
              diagnosis: 'Bipolar II Disorder',
              medications: ['Lamotrigine 100mg', 'Quetiapine 50mg'],
              allergies: ['Latex'],
              notes: 'Client is an artist, uses art therapy effectively. Monitor mood cycles.'
            },
            treatmentPlan: {
              goals: ['Mood stabilization', 'Creative expression through art', 'Sleep hygiene improvement'],
              frequency: 'Weekly sessions',
              duration: 'Ongoing'
            },
            appointmentHistory: [
              { date: '2025-10-07', type: 'Therapy Session', notes: 'Art therapy: emotional expression through painting' }
            ],
            sessionNotes: [
              {
                id: 'note-4',
                date: '2025-10-07',
                appointmentType: 'Art Therapy Session',
                duration: '50 minutes',
                assessment: 'Client mood stable, reporting good medication adherence. Creative energy high this week.',
                interventions: 'Art therapy session using painting to express emotions. Discussed connections between artwork and current mood state.',
                progress: 'Client demonstrating improved emotional regulation through artistic expression.',
                nextSessionPlan: 'Continue art therapy. Monitor mood cycling.',
                therapist: 'Dr. Smith'
              }
            ]
          },
          {
            id: '4',
            name: 'David Kim',
            email: 'david.kim@email.com',
            phone: '(555) 456-7890',
            status: 'pending',
            lastAppointment: null,
            nextAppointment: '2025-10-12',
            therapist: 'Dr. Williams',
            joinedDate: '2025-10-05',
            dateOfBirth: '1990-05-18',
            gender: 'Male',
            address: '321 Broadway, Queens, NY 11375',
            emergencyContact: {
              name: 'Jennifer Kim',
              relationship: 'Wife',
              phone: '(555) 456-7891'
            },
            medicalInfo: {
              diagnosis: 'Pending initial assessment',
              medications: [],
              allergies: ['None reported'],
              notes: 'New client referral from primary care physician for stress management.'
            },
            treatmentPlan: {
              goals: ['Complete initial assessment', 'Identify treatment goals', 'Establish therapeutic relationship'],
              frequency: 'To be determined',
              duration: 'To be determined'
            },
            appointmentHistory: [],
            sessionNotes: []
          },
          {
            id: '5',
            name: 'Jessica Martinez',
            email: 'jessica.m@email.com',
            phone: '(555) 567-8901',
            status: 'active',
            lastAppointment: '2025-10-06',
            nextAppointment: '2025-10-13',
            therapist: 'Dr. Johnson',
            joinedDate: '2024-07-22',
            dateOfBirth: '1985-09-08',
            gender: 'Female',
            address: '654 Elm Street, Bronx, NY 10451',
            emergencyContact: {
              name: 'Carlos Martinez',
              relationship: 'Brother',
              phone: '(555) 567-8902'
            },
            medicalInfo: {
              diagnosis: 'Major Depressive Disorder',
              medications: ['Bupropion 150mg', 'Trazodone 50mg'],
              allergies: ['Sulfa drugs'],
              notes: 'Single mother of two. Financial stress is a major factor. Responds well to solution-focused therapy.'
            },
            treatmentPlan: {
              goals: ['Improve mood and energy levels', 'Develop parenting strategies', 'Build support network'],
              frequency: 'Bi-weekly sessions',
              duration: '9 months'
            },
            appointmentHistory: [
              { date: '2025-10-06', type: 'Therapy Session', notes: 'Discussed childcare challenges and coping mechanisms' }
            ],
            sessionNotes: []
          },
          {
            id: '6',
            name: 'Robert Taylor',
            email: 'robert.t@email.com',
            phone: '(555) 678-9012',
            status: 'inactive',
            lastAppointment: '2025-09-20',
            nextAppointment: null,
            therapist: 'Dr. Smith',
            joinedDate: '2024-05-10',
            dateOfBirth: '1978-12-03',
            gender: 'Male',
            address: '987 Pine Road, Staten Island, NY 10301',
            emergencyContact: {
              name: 'Margaret Taylor',
              relationship: 'Mother',
              phone: '(555) 678-9013'
            },
            medicalInfo: {
              diagnosis: 'Substance Use Disorder (in remission), Depression',
              medications: ['Naltrexone 50mg', 'Fluoxetine 40mg'],
              allergies: ['None reported'],
              notes: '18 months sober. Completed treatment program. Currently on maintenance plan.'
            },
            treatmentPlan: {
              goals: ['Maintain sobriety', 'Rebuild family relationships', 'Return to workforce'],
              frequency: 'Monthly check-ins',
              duration: 'Ongoing maintenance'
            },
            appointmentHistory: [
              { date: '2025-09-20', type: 'Check-in', notes: 'Maintaining sobriety. Job interview scheduled.' }
            ],
            sessionNotes: []
          },
          {
            id: '7',
            name: 'Amanda Wilson',
            email: 'amanda.w@email.com',
            phone: '(555) 789-0123',
            status: 'active',
            lastAppointment: '2025-10-05',
            nextAppointment: '2025-10-19',
            therapist: 'Dr. Williams',
            joinedDate: '2024-11-30',
            dateOfBirth: '2000-04-25',
            gender: 'Female',
            address: '147 College Ave, Manhattan, NY 10003',
            emergencyContact: {
              name: 'Susan Wilson',
              relationship: 'Mother',
              phone: '(555) 789-0124'
            },
            medicalInfo: {
              diagnosis: 'Generalized Anxiety Disorder, Panic Disorder',
              medications: ['Escitalopram 10mg'],
              allergies: ['Shellfish'],
              notes: 'College student. Test anxiety is primary concern. Uses mindfulness apps regularly.'
            },
            treatmentPlan: {
              goals: ['Reduce panic attacks', 'Manage academic stress', 'Improve self-confidence'],
              frequency: 'Weekly during semester',
              duration: 'Academic year'
            },
            appointmentHistory: [
              { date: '2025-10-05', type: 'Therapy Session', notes: 'Practiced breathing exercises for exam anxiety' }
            ],
            sessionNotes: []
          },
          {
            id: '8',
            name: 'Christopher Lee',
            email: 'chris.lee@email.com',
            phone: '(555) 890-1234',
            status: 'active',
            lastAppointment: '2025-10-10',
            nextAppointment: '2025-10-17',
            therapist: 'Dr. Johnson',
            joinedDate: '2024-10-15',
            dateOfBirth: '1987-02-14',
            gender: 'Male',
            address: '258 Harbor View, Brooklyn, NY 11234',
            emergencyContact: {
              name: 'Rachel Lee',
              relationship: 'Wife',
              phone: '(555) 890-1235'
            },
            medicalInfo: {
              diagnosis: 'OCD, Health Anxiety',
              medications: ['Fluvoxamine 100mg'],
              allergies: ['None reported'],
              notes: 'Works in healthcare. Contamination fears and compulsive behaviors. ERP showing good progress.'
            },
            treatmentPlan: {
              goals: ['Reduce compulsive rituals', 'Manage health anxiety', 'Improve quality of life'],
              frequency: 'Weekly sessions',
              duration: '12 months'
            },
            appointmentHistory: [
              { date: '2025-10-10', type: 'Therapy Session', notes: 'ERP homework review. Gradual exposure to triggers.' }
            ],
            sessionNotes: []
          }
        ];

        for (const client of mockData) {
          await dataService.create('clients', client);
        }
        setClients(mockData);
      } else {
        setClients(data as Client[]);
      }
    } catch (error) {
      console.error('Failed to load clients:', error);
    } finally {
      setLoading(false);
    }
  };
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [sessionNotesClient, setSessionNotesClient] = useState<Client | null>(null);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const getStatusVariant = (status: Client['status']): "green" | "yellow" | "neutral" => {
    switch (status) {
      case 'active':
        return 'green';
      case 'pending':
        return 'yellow';
      case 'inactive':
      default:
        return 'neutral';
    }
  };

  const getAvatarStatus = (status: Client['status']): "online" | "away" | "offline" => {
    switch (status) {
      case 'active':
        return 'online';
      case 'pending':
        return 'away';
      case 'inactive':
      default:
        return 'offline';
    }
  };

  const getStatusColor = (status: Client['status']): string => {
    switch (status) {
      case 'active':
        return 'text-green-600 border-green-600';
      case 'pending':
        return 'text-yellow-600 border-yellow-600';
      case 'inactive':
      default:
        return 'text-gray-600 border-gray-600';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch =
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.phone.includes(searchQuery);

    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-medium leading-8 text-foreground">Clients</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage and view all client information
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" weight="bold" />
            Add Client
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" weight="bold" />
            <Input
              type="text"
              placeholder="Search clients by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <div className="flex items-center gap-2">
                <Funnel className="h-4 w-4" weight="bold" />
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Clients Table */}
      <div className="flex-1 overflow-auto">
        <div className="px-6 py-4">
          {filteredClients.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <User className="h-12 w-12 text-muted-foreground opacity-50 mb-4" weight="duotone" />
              <h3 className="font-medium mb-1">No clients found</h3>
              <p className="text-sm text-muted-foreground">
                {searchQuery ? 'Try adjusting your search criteria' : 'Get started by adding your first client'}
              </p>
            </div>
          ) : (
            <div className="border border-border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted/30">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-foreground">Client</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-foreground">Contact</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-foreground">Status</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-foreground">Last Appointment</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-foreground">Next Appointment</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-foreground">Therapist</th>
                    <th className="text-right px-4 py-3 text-sm font-semibold text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredClients.map((client) => (
                    <tr key={client.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar
                            className="h-10 w-10"
                            status={getAvatarStatus(client.status)}
                          >
                            <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                              {getInitials(client.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-foreground">{client.name}</div>
                            <div className="text-xs text-muted-foreground">
                              Joined {formatDate(client.joinedDate)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <EnvelopeSimple className="h-3.5 w-3.5 text-muted-foreground" weight="bold" />
                            <span className="text-foreground">{client.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-3.5 w-3.5 text-muted-foreground" weight="bold" />
                            <span className="text-foreground">{client.phone}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <Badge
                          variant={getStatusVariant(client.status)}
                          dot
                          size="sm"
                        >
                          {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-foreground">
                          {formatDate(client.lastAppointment)}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          {client.nextAppointment ? (
                            <>
                              <CalendarBlank className="h-4 w-4 text-muted-foreground" weight="bold" />
                              <span className="text-sm text-foreground">
                                {formatDate(client.nextAppointment)}
                              </span>
                            </>
                          ) : (
                            <span className="text-sm text-muted-foreground">-</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-foreground">{client.therapist}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <DotsThree className="h-5 w-5" weight="bold" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setSelectedClient(client)}>
                                <User className="mr-2 h-4 w-4" weight="duotone" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setSessionNotesClient(client)}>
                                <ClipboardText className="mr-2 h-4 w-4" weight="duotone" />
                                Session Notes
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <CalendarBlank className="mr-2 h-4 w-4" weight="duotone" />
                                Schedule Appointment
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <EnvelopeSimple className="mr-2 h-4 w-4" weight="duotone" />
                                Send Message
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Summary */}
          {filteredClients.length > 0 && (
            <div className="mt-4 text-sm text-muted-foreground">
              Showing {filteredClients.length} of {clients.length} clients
            </div>
          )}
        </div>
      </div>

      {/* Client Details Dialog */}
      <Dialog open={!!selectedClient} onOpenChange={() => setSelectedClient(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedClient && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                        {getInitials(selectedClient.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <DialogTitle className="text-2xl mb-1">{selectedClient.name}</DialogTitle>
                      <DialogDescription className="flex items-center gap-3">
                        <Badge
                          variant="outline"
                          className={`capitalize ${getStatusColor(selectedClient.status)}`}
                        >
                          {selectedClient.status}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          Client since {formatDate(selectedClient.joinedDate)}
                        </span>
                      </DialogDescription>
                    </div>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6 mt-6">
                {/* Personal Information */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <IdentificationCard className="h-5 w-5 text-foreground" weight="duotone" />
                    <h3 className="font-semibold text-foreground">Personal Information</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4 bg-muted/30 rounded-lg p-4">
                    <div>
                      <label className="text-sm text-muted-foreground">Date of Birth</label>
                      <p className="text-sm font-medium">{formatDate(selectedClient.dateOfBirth)}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Gender</label>
                      <p className="text-sm font-medium">{selectedClient.gender}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Email</label>
                      <p className="text-sm font-medium">{selectedClient.email}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Phone</label>
                      <p className="text-sm font-medium">{selectedClient.phone}</p>
                    </div>
                    <div className="col-span-2">
                      <label className="text-sm text-muted-foreground">Address</label>
                      <p className="text-sm font-medium flex items-start gap-2">
                        <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" weight="duotone" />
                        {selectedClient.address}
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Emergency Contact */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Warning className="h-5 w-5 text-foreground" weight="duotone" />
                    <h3 className="font-semibold text-foreground">Emergency Contact</h3>
                  </div>
                  <div className="grid grid-cols-3 gap-4 bg-muted/30 rounded-lg p-4">
                    <div>
                      <label className="text-sm text-muted-foreground">Name</label>
                      <p className="text-sm font-medium">{selectedClient.emergencyContact.name}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Relationship</label>
                      <p className="text-sm font-medium">{selectedClient.emergencyContact.relationship}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Phone</label>
                      <p className="text-sm font-medium">{selectedClient.emergencyContact.phone}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Medical Information */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <FirstAidKit className="h-5 w-5 text-foreground" weight="duotone" />
                    <h3 className="font-semibold text-foreground">Medical Information</h3>
                  </div>
                  <div className="space-y-4 bg-muted/30 rounded-lg p-4">
                    <div>
                      <label className="text-sm text-muted-foreground">Diagnosis</label>
                      <p className="text-sm font-medium">{selectedClient.medicalInfo.diagnosis}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Current Medications</label>
                      {selectedClient.medicalInfo.medications.length > 0 ? (
                        <ul className="mt-1 space-y-1">
                          {selectedClient.medicalInfo.medications.map((med, idx) => (
                            <li key={idx} className="text-sm font-medium flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-foreground rounded-full"></span>
                              {med}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm font-medium">None</p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Allergies</label>
                      {selectedClient.medicalInfo.allergies.length > 0 ? (
                        <div className="flex flex-wrap gap-2 mt-1">
                          {selectedClient.medicalInfo.allergies.map((allergy, idx) => (
                            <Badge key={idx} variant="destructive" className="text-xs">
                              {allergy}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm font-medium">None</p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Clinical Notes</label>
                      <p className="text-sm font-medium">{selectedClient.medicalInfo.notes}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Treatment Plan */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Heart className="h-5 w-5 text-foreground" weight="duotone" />
                    <h3 className="font-semibold text-foreground">Treatment Plan</h3>
                  </div>
                  <div className="space-y-4 bg-muted/30 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-muted-foreground">Assigned Therapist</label>
                        <p className="text-sm font-medium">{selectedClient.therapist}</p>
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">Session Frequency</label>
                        <p className="text-sm font-medium">{selectedClient.treatmentPlan.frequency}</p>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Treatment Duration</label>
                      <p className="text-sm font-medium">{selectedClient.treatmentPlan.duration}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Treatment Goals</label>
                      <ul className="mt-2 space-y-2">
                        {selectedClient.treatmentPlan.goals.map((goal, idx) => (
                          <li key={idx} className="text-sm font-medium flex items-start gap-2">
                            <span className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 flex-shrink-0"></span>
                            {goal}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Appointment History */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <ClipboardText className="h-5 w-5 text-foreground" weight="duotone" />
                    <h3 className="font-semibold text-foreground">Recent Appointment History</h3>
                  </div>
                  {selectedClient.appointmentHistory.length > 0 ? (
                    <div className="space-y-3">
                      {selectedClient.appointmentHistory.map((apt, idx) => (
                        <div key={idx} className="bg-muted/30 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold">{apt.type}</span>
                            <span className="text-sm text-muted-foreground">{formatDate(apt.date)}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{apt.notes}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-muted/30 rounded-lg p-4 text-center">
                      <p className="text-sm text-muted-foreground">No appointment history available</p>
                    </div>
                  )}
                </div>

                {/* Upcoming Appointments */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <CalendarBlank className="h-5 w-5 text-foreground" weight="duotone" />
                    <h3 className="font-semibold text-foreground">Upcoming Appointments</h3>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-4">
                    {selectedClient.nextAppointment ? (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Next Session</span>
                        <span className="text-sm font-semibold">{formatDate(selectedClient.nextAppointment)}</span>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center">No upcoming appointments scheduled</p>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Session Notes Dialog */}
      <Dialog open={!!sessionNotesClient} onOpenChange={() => setSessionNotesClient(null)}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
          {sessionNotesClient && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getInitials(sessionNotesClient.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <DialogTitle className="text-xl">Session Notes - {sessionNotesClient.name}</DialogTitle>
                      <DialogDescription>
                        Clinical documentation and progress notes
                      </DialogDescription>
                    </div>
                  </div>
                  <Button size="sm" className="gap-2">
                    <Plus className="h-4 w-4" weight="bold" />
                    New Note
                  </Button>
                </div>
              </DialogHeader>

              <div className="flex-1 overflow-auto mt-6">
                {sessionNotesClient.sessionNotes.length > 0 ? (
                  <div className="space-y-4">
                    {sessionNotesClient.sessionNotes.map((note) => (
                      <div key={note.id} className="border border-border rounded-lg p-5 space-y-4 bg-muted/20">
                        {/* Header */}
                        <div className="flex items-start justify-between pb-3 border-b border-border">
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <h4 className="font-semibold text-foreground">{note.appointmentType}</h4>
                              <Badge variant="outline" className="text-xs">
                                {note.duration}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1.5">
                                <CalendarBlank className="h-3.5 w-3.5" weight="bold" />
                                {formatDate(note.date)}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <User className="h-3.5 w-3.5" weight="bold" />
                                {note.therapist}
                              </span>
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <DotsThree className="h-5 w-5" weight="bold" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <NotePencil className="mr-2 h-4 w-4" weight="duotone" />
                                Edit Note
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">
                                <X className="mr-2 h-4 w-4" weight="duotone" />
                                Delete Note
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        {/* Content Sections */}
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-semibold text-foreground mb-1.5 block">Assessment</label>
                            <p className="text-sm text-muted-foreground leading-relaxed">{note.assessment}</p>
                          </div>

                          <Separator />

                          <div>
                            <label className="text-sm font-semibold text-foreground mb-1.5 block">Interventions</label>
                            <p className="text-sm text-muted-foreground leading-relaxed">{note.interventions}</p>
                          </div>

                          <Separator />

                          <div>
                            <label className="text-sm font-semibold text-foreground mb-1.5 block">Progress</label>
                            <p className="text-sm text-muted-foreground leading-relaxed">{note.progress}</p>
                          </div>

                          <Separator />

                          <div>
                            <label className="text-sm font-semibold text-foreground mb-1.5 block">Next Session Plan</label>
                            <p className="text-sm text-muted-foreground leading-relaxed">{note.nextSessionPlan}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <ClipboardText className="h-16 w-16 mb-4 text-muted-foreground opacity-20" weight="duotone" />
                    <h3 className="mb-2">No session notes yet</h3>
                    <p className="text-sm text-muted-foreground mb-4 max-w-md">
                      Start documenting clinical sessions for {sessionNotesClient.name}
                    </p>
                    <Button className="gap-2">
                      <Plus className="h-4 w-4" weight="bold" />
                      Create First Note
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}