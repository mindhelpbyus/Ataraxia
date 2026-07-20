import React, { useState, useEffect } from 'react';
import { Phone, Mail, User, MoreVertical, Search, Filter, Plus, Award, UserCheck, Clock, Check, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { Input } from './ui/input';
// import { AvailabilityModal } from './AvailabilityModal';
// REMOVED: TherapistVerificationDetailModal - verification is handled in separate screen
import { dataService } from '../api';
import { apiRequest } from '../api/client';
import { UserRole } from '../types/appointment';
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
import { SortableTableHead } from './ui/sortable-table-head';
import { ColumnVisibilityMenu } from './ui/column-visibility-menu';
import { useSortableList } from '../hooks/useSortableList';
import { useColumnVisibility, type ColumnDef } from '../hooks/useColumnVisibility';


interface Therapist {
  id: string;
  name: string;
  email: string;
  phone: string;
  countryCode?: string;
  specialty: string;
  location: string;
  credentials: string;
  status: 'active' | 'inactive';
  verificationStatus: string;
  organization?: string;
  avatar?: string;
}

type TherapistSortField = 'lastName' | 'verificationStatus' | 'isActive' | 'createdAt';
const RECORDS_PER_PAGE = 25;

const THERAPIST_COLUMNS: ColumnDef[] = [
  { id: 'name', label: 'Name', locked: true },
  { id: 'email', label: 'Email' },
  { id: 'phone', label: 'Phone' },
  { id: 'specialty', label: 'Specialty' },
  { id: 'verification', label: 'Verification' },
  { id: 'status', label: 'Status', locked: true },
];

interface EnhancedTherapistsTableProps {
  userRole: UserRole;
  organizationId?: string;
  currentUserId?: string;
}

export function EnhancedTherapistsTable({ userRole, organizationId }: EnhancedTherapistsTableProps) {
  // const [availabilityModalOpen, setAvailabilityModalOpen] = useState(false);
  // REMOVED: verificationModalOpen - verification handled in separate screen
  const [, setSelectedTherapistId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [verificationFilter, setVerificationFilter] = useState<string>('all');
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [, setLoading] = useState(true);

  const { sortBy, sortOrder, page, setPage, toggleSort } = useSortableList<TherapistSortField>('createdAt');
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const { isVisible, toggle } = useColumnVisibility('ataraxia.therapists.columns', THERAPIST_COLUMNS);

  useEffect(() => {
    loadTherapists();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy, sortOrder, page, statusFilter, verificationFilter]);

  const loadTherapists = async () => {
    try {
      setLoading(true);
      // backend-initial: GET /therapists (no /api/ prefix). Backend scopes
      // results by the authenticated Cognito identity/role.
      //
      // Wire shape is { success, data: { items, count, totalCount }, requestId,
      // timestamp } (formatPaginatedResponse) — need `totalCount` for the page
      // controls, so this bypasses get()'s auto-unwrap (which would strip
      // `data` down to bare `items` and drop the sibling `totalCount`) via
      // apiRequest's rawEnvelope option directly.
      const query = new URLSearchParams({
        skip: String((page - 1) * RECORDS_PER_PAGE),
        limit: String(RECORDS_PER_PAGE),
        sortBy,
        sortOrder,
      });
      if (statusFilter !== 'all') query.set('isActive', statusFilter === 'active' ? 'true' : 'false');
      if (verificationFilter !== 'all') query.set('verificationStatus', verificationFilter);
      const res = await apiRequest<{ data: { items: any[]; count: number; totalCount: number } }>(
        `/therapists?${query.toString()}`,
        { rawEnvelope: true }
      );
      const data = res?.data?.items;

      if (data) {
        // Transform backend data to frontend format
        const transformedTherapists: Therapist[] = data.map((therapist: any) => ({
          id: therapist.id,
          name: `${therapist.first_name || ''} ${therapist.last_name || ''}`.trim() || therapist.email,
          email: therapist.email,
          phone: therapist.phone || 'N/A',
          specialty: therapist.therapist_profile?.clinical_specialties?.[0] || 'General Therapy',
          location: therapist.therapist_profile?.location || 'N/A',
          credentials: therapist.therapist_profile?.title || 'N/A',
          status: therapist.is_active === false ? 'inactive' : 'active',
          verificationStatus: therapist.therapist_profile?.verification_status || 'pending',
          organization: therapist.organization_name || 'Independent'
        }));
        setTherapists(transformedTherapists);
        setTotalPages(Math.ceil((res.data.totalCount ?? 0) / RECORDS_PER_PAGE) || 1);
        setTotalCount(res.data.totalCount ?? 0);
      } else {
        console.warn('Failed to fetch therapists from backend, using empty list');
        setTherapists([]);
      }
    } catch (error) {
      console.error('Failed to load therapists:', error);
      // Gracefully handle error by showing empty list
      setTherapists([]);
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
    // setAvailabilityModalOpen(true);
    toast.info("Schedule view coming soon");
  };


  // REMOVED: handleOpenVerification - verification handled in separate screen

  const filteredByOrg = userRole === 'admin' && organizationId
    ? therapists.filter((t: Therapist) => t.organization === organizationId)
    : therapists;

  // Status/verification filters are sent server-side (query params in
  // loadTherapists); search stays client-side (filters the current page
  // only) — the backend has no full-text search param yet on /therapists.
  const filteredTherapists = filteredByOrg.filter((therapist: Therapist) => {
    return (
      therapist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      therapist.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      therapist.phone.includes(searchQuery) ||
      therapist.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      therapist.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      therapist.credentials.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const getStatusBadge = (status: Therapist['status']) => {
    switch (status) {
      case 'active':
        return (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-action-light border border-action-border">
            <div className="h-1.5 w-1.5 rounded-full bg-action" />
            <span className="text-xs font-medium text-action-dark">Active</span>
          </div>
        );
      case 'inactive':
        return (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--surface-warm)] border border-border">
            <div className="h-1.5 w-1.5 rounded-full bg-[var(--dim)]" />
            <span className="text-xs font-medium text-muted-foreground">Inactive</span>
          </div>
        );
      default:
        return null;
    }
  };

  const getVerificationBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-action-light border border-action-border">
            <div className="h-1.5 w-1.5 rounded-full bg-action" />
            <span className="text-xs font-medium text-action-dark">Approved</span>
          </div>
        );
      case 'rejected':
        return (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-danger-light border border-danger-border">
            <div className="h-1.5 w-1.5 rounded-full bg-danger" />
            <span className="text-xs font-medium text-danger">Rejected</span>
          </div>
        );
      default:
        return (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-ochre-light border border-ochre-border">
            <div className="h-1.5 w-1.5 rounded-full bg-ochre" />
            <span className="text-xs font-medium text-ochre">Pending</span>
          </div>
        );
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
        <div className="flex justify-end items-center mb-6">
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
              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
                <SelectTrigger className="w-[160px] border-border/50 focus:ring-primary/20">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Therapists</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Select value={verificationFilter} onValueChange={(v) => { setVerificationFilter(v); setPage(1); }}>
                <SelectTrigger className="w-[170px] border-border/50 focus:ring-primary/20">
                  <SelectValue placeholder="Verification" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Verification</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <ColumnVisibilityMenu columns={THERAPIST_COLUMNS} isVisible={isVisible} onToggle={toggle} />
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
          <Card className="border-border/50 bg-gradient-to-br from-card to-card/50 shadow-sm hover:shadow-lg hover:border-action/20 transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Active</p>
                  <p className="text-3xl font-bold tracking-tight text-action">
                    {therapists.filter((t: Therapist) => t.status === 'active').length}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-action/10 flex items-center justify-center group-hover:bg-action/20 transition-colors duration-300">
                  <UserCheck className="h-6 w-6 text-action" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={statsVariants}>
          <Card className="border-border/50 bg-gradient-to-br from-card to-card/50 shadow-sm hover:shadow-lg hover:border-ochre/20 transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Pending Verification</p>
                  <p className="text-3xl font-bold tracking-tight text-ochre">
                    {therapists.filter((t: Therapist) => t.verificationStatus === 'pending').length}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-ochre-light flex items-center justify-center group-hover:bg-ochre-light/70 transition-colors duration-300">
                  <Clock className="h-6 w-6 text-ochre" />
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
                  <SortableTableHead field="lastName" label="Therapist" activeField={sortBy} sortOrder={sortOrder} onSort={toggleSort} className="w-[280px]" />
                  {isVisible('email') && <TableHead className="font-semibold text-muted-foreground uppercase tracking-wider">Email</TableHead>}
                  {isVisible('phone') && <TableHead className="w-[140px] font-semibold text-muted-foreground uppercase tracking-wider">Phone</TableHead>}
                  {isVisible('specialty') && <TableHead className="w-[180px] font-semibold text-muted-foreground uppercase tracking-wider">Specialty</TableHead>}
                  {isVisible('verification') && (
                    <SortableTableHead field="verificationStatus" label="Verification" activeField={sortBy} sortOrder={sortOrder} onSort={toggleSort} className="w-[150px]" />
                  )}
                  {isVisible('status') && (
                    <SortableTableHead field="isActive" label="Status" activeField={sortBy} sortOrder={sortOrder} onSort={toggleSort} className="w-[110px]" />
                  )}
                  <TableHead className="w-[40px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence mode="popLayout">
                  {filteredTherapists.map((therapist: Therapist) => (
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
                      {isVisible('email') && (
                        <TableCell className="py-4">
                          <div className="flex items-center gap-2 min-w-0">
                            <Mail className="h-3.5 w-3.5 text-muted-foreground/60 flex-shrink-0" strokeWidth={2} />
                            <span className="text-sm text-muted-foreground truncate">{therapist.email}</span>
                          </div>
                        </TableCell>
                      )}
                      {isVisible('phone') && (
                        <TableCell className="py-4">
                          <div className="flex items-center gap-2">
                            <Phone className="h-3.5 w-3.5 text-muted-foreground/60 flex-shrink-0" strokeWidth={2} />
                            <span className="text-sm text-muted-foreground">{therapist.phone}</span>
                          </div>
                        </TableCell>
                      )}
                      {isVisible('specialty') && (
                        <TableCell className="py-4">
                          <div className="flex items-center gap-2 min-w-0">
                            <Award className="h-3.5 w-3.5 text-muted-foreground/60 flex-shrink-0" strokeWidth={2} />
                            <span className="text-sm text-muted-foreground truncate" title={therapist.specialty}>
                              {therapist.specialty}
                            </span>
                          </div>
                        </TableCell>
                      )}
                      {isVisible('verification') && (
                        <TableCell className="py-4">
                          {getVerificationBadge(therapist.verificationStatus)}
                        </TableCell>
                      )}
                      {isVisible('status') && (
                        <TableCell className="py-4">
                          {getStatusBadge(therapist.status)}
                        </TableCell>
                      )}
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

                            {/* REMOVED: Verification actions - these are handled in separate TherapistVerificationView */}
                            {/* Therapist management screen only shows active therapists from therapists table */}

                            {therapist.status === 'active' && (
                              <DropdownMenuItem onClick={() => handleStatusUpdate(therapist.id, 'inactive')} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                                <ShieldAlert className="mr-2 h-4 w-4" /> Deactivate
                              </DropdownMenuItem>
                            )}

                            {therapist.status === 'inactive' && (
                              <DropdownMenuItem onClick={() => handleStatusUpdate(therapist.id, 'active')} className="text-action focus:text-action-dark focus:bg-action-light">
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
          {totalPages > 1 && (
            <div className="w-full flex items-center justify-between px-6 py-4 border-t border-border/50 bg-muted/20">
              <div className="text-sm text-muted-foreground">
                Page <span className="font-medium text-foreground">{page}</span> of{' '}
                <span className="font-medium text-foreground">{totalPages}</span> · {totalCount} therapists
              </div>

              <Pagination>
                <PaginationContent>
                  <PaginationPrevious
                    size="icon"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className={page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number;

                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }

                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          size="icon"
                          isActive={page === pageNum}
                          onClick={() => setPage(pageNum)}
                          className="cursor-pointer"
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}

                  <PaginationNext
                    size="icon"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className={page === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
      {/* <AvailabilityModal
        therapistId={selectedTherapistId}
        isOpen={availabilityModalOpen}
        onClose={() => setAvailabilityModalOpen(false)}
      /> */}
      {/* REMOVED: TherapistVerificationDetailModal - verification handled in separate screen */}
    </div>
  );
}