import React, { useState, useEffect } from 'react';
import { Phone, Mail, MapPin, User, MoreVertical, Search, Filter, Plus, Award, TrendingUp, UserCheck, Clock, Building2, Check, X, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { AvailabilityModal } from './AvailabilityModal';
import { dataService } from '../api';
import { UserRole } from '../types/appointment';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from './ui/pagination';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Card, CardContent } from './ui/card';


interface Therapist {
  id: string;
  name: string;
  email: string;
  phone: string;
  countryCode?: string;
  specialty: string;
  location: string;
  credentials: string;
  status: 'active' | 'inactive' | 'pending';
  organization?: string;
  avatar?: string;
}

interface EnhancedTherapistsTableProps {
  userRole: UserRole;
  organizationId?: string;
}

export function EnhancedTherapistsTable({ userRole, organizationId }: EnhancedTherapistsTableProps) {
  const [availabilityModalOpen, setAvailabilityModalOpen] = useState(false);
  const [selectedTherapistId, setSelectedTherapistId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(10);
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadTherapists();
  }, []);

  const loadTherapists = async () => {
    try {
      setLoading(true);
      const data = await dataService.list('therapists');

      if (data.length === 0) {
        const mockData: Therapist[] = [
          {
            id: '1',
            name: 'Dr. Sarah Anderson',
            email: 'sarah.anderson@example.com',
            phone: '(555) 101-2020',
            specialty: 'Cognitive Behavioral Therapy',
            location: 'San Francisco',
            credentials: 'PhD, LMFT',
            status: 'active',
            organization: 'Wellness Center SF',
          },
          {
            id: '2',
            name: 'Dr. Michael Chen',
            email: 'michael.chen@example.com',
            phone: '(555) 202-3030',
            specialty: 'Trauma & EMDR',
            location: 'Los Angeles',
            credentials: 'PsyD, LCSW',
            status: 'active',
            organization: 'LA Therapy Group',
          },
          {
            id: '3',
            name: 'Dr. Emily Rodriguez',
            email: 'emily.rodriguez@example.com',
            phone: '(555) 303-4040',
            specialty: 'Family Therapy',
            location: 'New York',
            credentials: 'LMFT, MSW',
            status: 'active',
            organization: 'NYC Mental Health',
          },
          {
            id: '4',
            name: 'Dr. James Wilson',
            email: 'james.wilson@example.com',
            phone: '(555) 404-5050',
            specialty: 'Anxiety & Depression',
            location: 'Chicago',
            credentials: 'PhD, LPC',
            status: 'pending',
            organization: 'Chicago Wellness',
          },
          {
            id: '5',
            name: 'Dr. Lisa Thompson',
            email: 'lisa.thompson@example.com',
            phone: '(555) 505-6060',
            specialty: 'Substance Abuse',
            location: 'Austin',
            credentials: 'LCSW, CAC',
            status: 'active',
            organization: 'Austin Recovery',
          },
          {
            id: '6',
            name: 'Dr. David Kim',
            email: 'david.kim@example.com',
            phone: '(555) 606-7070',
            specialty: 'Child & Adolescent',
            location: 'Seattle',
            credentials: 'PsyD, LPC',
            status: 'active',
            organization: 'Seattle Family Care',
          },
          {
            id: '7',
            name: 'Dr. Maria Garcia',
            email: 'maria.garcia@example.com',
            phone: '(555) 707-8080',
            specialty: 'Couples Therapy',
            location: 'Miami',
            credentials: 'LMFT, PhD',
            status: 'inactive',
            organization: 'Miami Relationship Center',
          },
          {
            id: '8',
            name: 'Dr. Robert Taylor',
            email: 'robert.taylor@example.com',
            phone: '(555) 808-9090',
            specialty: 'PTSD & Veterans',
            location: 'Boston',
            credentials: 'PhD, LCSW',
            status: 'active',
            organization: 'Boston VA Clinic',
          },
        ];

        for (const therapist of mockData) {
          await dataService.create('therapists', therapist);
        }
        setTherapists(mockData);
      } else {
        setTherapists(data as Therapist[]);
      }
    } catch (error) {
      console.error('Failed to load therapists:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (therapistId: string, newStatus: string) => {
    try {
      await dataService.update('therapists', therapistId, { status: newStatus });
      toast.success(`Therapist status updated to ${newStatus}`);
      loadTherapists();
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('Failed to update therapist status');
    }
  };

  const handleViewSchedule = (id: string) => {
    setSelectedTherapistId(id);
    setAvailabilityModalOpen(true);
  };

  const filteredByOrg = userRole === 'admin' && organizationId
    ? therapists.filter((t: Therapist) => t.organization === organizationId)
    : therapists;

  const filteredTherapists = filteredByOrg.filter((therapist: Therapist) => {
    const matchesSearch =
      therapist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      therapist.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      therapist.phone.includes(searchQuery) ||
      therapist.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      therapist.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      therapist.credentials.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || therapist.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredTherapists.length / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = startIndex + recordsPerPage;
  const paginatedTherapists = filteredTherapists.slice(startIndex, endIndex);

  const getStatusBadge = (status: Therapist['status']) => {
    switch (status) {
      case 'active':
        return (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50  border border-green-200 ">
            <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
            <span className="text-xs font-medium text-green-700 ">Active</span>
          </div>
        );
      case 'pending':
        return (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-50  border border-yellow-200 ">
            <div className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
            <span className="text-xs font-medium text-yellow-700 ">Pending</span>
          </div>
        );
      case 'inactive':
        return (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-50  border border-gray-200 ">
            <div className="h-1.5 w-1.5 rounded-full bg-gray-400" />
            <span className="text-xs font-medium text-gray-600 ">Inactive</span>
          </div>
        );
      default:
        return null;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03
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

  return (
    <div className="w-full min-h-screen bg-background px-6 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="mb-8"
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              {userRole === 'admin' ? 'Therapists' : 'All Therapists'}
            </h1>
            <p className="text-muted-foreground mt-1">Manage and view all therapist information</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all duration-200 hover:shadow-xl hover:shadow-primary/30 hover:scale-105">
            <Plus className="h-4 w-4 mr-2" />
            Add Therapist
          </Button>
        </div>

        {/* Search Bar */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <Input
                  placeholder="Search therapists by name, email, specialty..."
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
                  <SelectItem value="all">All Therapists</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Cards */}
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
                  <p className="text-sm font-medium text-muted-foreground mb-1">Total Therapists</p>
                  <p className="text-3xl font-bold tracking-tight">{therapists.length}</p>
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
                  <p className="text-3xl font-bold tracking-tight text-green-600">
                    {therapists.filter((t: Therapist) => t.status === 'active').length}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/20 transition-colors duration-300">
                  <UserCheck className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={statsVariants}>
          <Card className="border-border/50 bg-gradient-to-br from-card to-card/50 shadow-sm hover:shadow-lg hover:border-yellow-500/20 transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Pending</p>
                  <p className="text-3xl font-bold tracking-tight text-yellow-600">
                    {therapists.filter((t: Therapist) => t.status === 'pending').length}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-yellow-500/10 flex items-center justify-center group-hover:bg-yellow-500/20 transition-colors duration-300">
                  <Clock className="h-6 w-6 text-yellow-600" />
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
                  <p className="text-3xl font-bold tracking-tight text-muted-foreground">
                    {therapists.filter((t: Therapist) => t.status === 'inactive').length}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-muted/50 flex items-center justify-center group-hover:bg-muted transition-colors duration-300">
                  <User className="h-6 w-6 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Clean Modern Table */}
      <Card className="border-border/50 shadow-lg overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30 border-border/50">
                  <TableHead className="w-[280px] font-semibold text-muted-foreground uppercase tracking-wider">Therapist</TableHead>
                  <TableHead className="font-semibold text-muted-foreground uppercase tracking-wider">Email</TableHead>
                  <TableHead className="w-[140px] font-semibold text-muted-foreground uppercase tracking-wider">Phone</TableHead>
                  <TableHead className="w-[180px] font-semibold text-muted-foreground uppercase tracking-wider">Specialty</TableHead>
                  <TableHead className="w-[140px] font-semibold text-muted-foreground uppercase tracking-wider">Location</TableHead>
                  <TableHead className="w-[110px] font-semibold text-muted-foreground uppercase tracking-wider">Status</TableHead>
                  <TableHead className="w-[40px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence mode="popLayout">
                  {paginatedTherapists.map((therapist: Therapist) => (
                    <motion.tr
                      key={therapist.id}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      layout
                      className="group hover:bg-muted/30 transition-colors duration-200 border-b border-border/30 last:border-0"
                    >
                      <TableCell className="py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 ring-2 ring-background shadow-sm group-hover:ring-primary/20 transition-all duration-200">
                            <AvatarImage src={therapist.avatar} />
                            <AvatarFallback className="text-xs bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold">
                              {getInitials(therapist.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                              {therapist.name}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {therapist.credentials}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-2 min-w-0">
                          <Mail className="h-3.5 w-3.5 text-muted-foreground/60 flex-shrink-0" strokeWidth={2} />
                          <span className="text-sm text-muted-foreground truncate">{therapist.email}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-2">
                          <Phone className="h-3.5 w-3.5 text-muted-foreground/60 flex-shrink-0" strokeWidth={2} />
                          <span className="text-sm text-muted-foreground">{therapist.phone}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-2 min-w-0">
                          <Award className="h-3.5 w-3.5 text-muted-foreground/60 flex-shrink-0" strokeWidth={2} />
                          <span className="text-sm text-muted-foreground truncate" title={therapist.specialty}>
                            {therapist.specialty}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5 text-muted-foreground/60 flex-shrink-0" strokeWidth={2} />
                          <span className="text-sm text-muted-foreground">{therapist.location}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        {getStatusBadge(therapist.status)}
                      </TableCell>
                      <TableCell className="py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-muted"
                            >
                              <MoreVertical className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem>View Profile</DropdownMenuItem>
                            <DropdownMenuItem>Edit Details</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleViewSchedule(therapist.id)}>View Schedule</DropdownMenuItem>

                            {therapist.status === 'pending' && (
                              <>
                                <DropdownMenuItem onClick={() => handleStatusUpdate(therapist.id, 'active')} className="text-green-600 focus:text-green-700 focus:bg-green-50">
                                  <Check className="mr-2 h-4 w-4" /> Approve
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStatusUpdate(therapist.id, 'inactive')} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                                  <X className="mr-2 h-4 w-4" /> Reject
                                </DropdownMenuItem>
                              </>
                            )}

                            {therapist.status === 'active' && (
                              <DropdownMenuItem onClick={() => handleStatusUpdate(therapist.id, 'inactive')} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                                <ShieldAlert className="mr-2 h-4 w-4" /> Deactivate
                              </DropdownMenuItem>
                            )}

                            {therapist.status === 'inactive' && (
                              <DropdownMenuItem onClick={() => handleStatusUpdate(therapist.id, 'active')} className="text-green-600 focus:text-green-700 focus:bg-green-50">
                                <Check className="mr-2 h-4 w-4" /> Reactivate
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="w-full flex items-center justify-between px-6 py-4 border-t border-border/50 bg-muted/20">
            <div className="text-sm text-muted-foreground">
              Showing <span className="font-medium text-foreground">{startIndex + 1}</span> to{' '}
              <span className="font-medium text-foreground">{Math.min(endIndex, filteredTherapists.length)}</span> of{' '}
              <span className="font-medium text-foreground">{filteredTherapists.length}</span> therapists
            </div>

            <Pagination>
              <PaginationContent>
                <PaginationPrevious
                  size="icon"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number;

                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        size="icon"
                        isActive={currentPage === pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className="cursor-pointer"
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}

                <PaginationNext
                  size="icon"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>
      <AvailabilityModal
        therapistId={selectedTherapistId}
        isOpen={availabilityModalOpen}
        onClose={() => setAvailabilityModalOpen(false)}
      />
    </div>
  );
}