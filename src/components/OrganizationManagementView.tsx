import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { OrganizationSetupForm } from './organization';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Building2, Plus, Search, Mail, Phone, MapPin,
  DollarSign, Activity,
  Filter
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { SortableTableHead } from './ui/sortable-table-head';
import { ColumnVisibilityMenu } from './ui/column-visibility-menu';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from './ui/pagination';
import { Card, CardContent } from './ui/card';
import { Avatar, AvatarFallback } from './ui/avatar';
import { toast } from 'sonner';
import { listOrganizations, type Organization as BackendOrganization } from '../api/organizations';
import { useSortableList } from '../hooks/useSortableList';
import { useColumnVisibility, type ColumnDef } from '../hooks/useColumnVisibility';

interface Organization {
  id: string;
  organizationName: string;
  primaryContactEmail: string;
  phone: string;
  city: string;
  state: string;
  status: 'active' | 'inactive';
  createdAt: Date;
}

interface OrganizationManagementViewProps {
  userId: string;
  userEmail: string;
  onNavigate: () => void;
}

type OrgSortField = 'name' | 'isActive' | 'createdAt';
const RECORDS_PER_PAGE = 25;

const ORG_COLUMNS: ColumnDef[] = [
  { id: 'name', label: 'Name', locked: true },
  { id: 'email', label: 'Email' },
  { id: 'phone', label: 'Phone' },
  { id: 'location', label: 'City / State' },
  { id: 'status', label: 'Status', locked: true },
  { id: 'created', label: 'Created' },
];

export function OrganizationManagementView(_props: OrganizationManagementViewProps) {
  const [showSetupForm, setShowSetupForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);

  const { sortBy, sortOrder, page, setPage, toggleSort } = useSortableList<OrgSortField>('createdAt');
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const { isVisible, toggle } = useColumnVisibility('ataraxia.organizations.columns', ORG_COLUMNS);

  const loadOrganizations = async () => {
    try {
      setLoading(true);
      const result = await listOrganizations({
        page,
        limit: RECORDS_PER_PAGE,
        sortBy,
        sortOrder,
        isActive: statusFilter === 'all' ? undefined : statusFilter === 'active',
      });
      const mapped: Organization[] = result.data.map((org: BackendOrganization) => ({
        id: String(org.id),
        organizationName: org.name,
        primaryContactEmail: org.email ?? 'N/A',
        phone: org.phone ?? 'N/A',
        city: org.city ?? '',
        state: org.state ?? '',
        status: org.isActive ? 'active' : 'inactive',
        createdAt: new Date(org.createdAt),
      }));
      setOrganizations(mapped);
      setTotalPages(result.pagination.totalPages || 1);
      setTotalCount(result.pagination.total);
    } catch (e) {
      console.error('Failed to load organizations', e);
      toast.error('Failed to load organizations');
      setOrganizations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrganizations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy, sortOrder, page, statusFilter]);

  const handleCreateOrganization = () => {
    setShowSetupForm(true);
  };

  const handleOrganizationComplete = () => {
    // No POST /organizations route exists yet — the setup form is UI-only
    // until that's built. Just close it; nothing to persist.
    toast.info('Organization setup isn’t wired to the backend yet — nothing was saved.');
    setShowSetupForm(false);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-action-light text-action-dark border-action-border',
      inactive: 'bg-muted text-muted-foreground border-border',
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status as keyof typeof styles] || styles.active}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Search stays client-side (filters the current page only) — the backend
  // has no full-text search param yet on /organizations.
  const filteredOrganizations = organizations.filter(org =>
    org.organizationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    org.primaryContactEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  if (showSetupForm) {
    return (
      <OrganizationSetupForm
        onComplete={handleOrganizationComplete}
        onCancel={() => setShowSetupForm(false)}
        editMode={false}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background p-8 max-w-[1600px] mx-auto font-sans selection:bg-action-light">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="mb-8"
      >
        <div className="flex items-center justify-end gap-3 mb-6">
          <Button onClick={handleCreateOrganization} className="bg-primary hover:bg-primary/90 shadow-sm transition-colors font-medium">
            <Plus className="h-4 w-4 mr-2" />
            Add Organization
          </Button>
        </div>

        {/* Search Bar - Modern Card Style */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <Input
                  placeholder="Search organizations by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 border-border/50 focus-visible:ring-primary/20 focus-visible:border-primary transition-all duration-200"
                />
              </div>
              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
                <SelectTrigger className="w-[160px] border-border/50 focus:ring-primary/20">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Organizations</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <ColumnVisibilityMenu columns={ORG_COLUMNS} isVisible={isVisible} onToggle={toggle} />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
      >
        <motion.div variants={statsVariants}>
          <Card className="border-border/50 bg-gradient-to-br from-card to-card/50 shadow-sm hover:shadow-lg hover:border-primary/20 transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Total Organizations</p>
                  <p className="text-3xl font-bold tracking-tight">{totalCount}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                  <Building2 className="h-6 w-6 text-primary" />
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
                  <p className="text-sm font-medium text-muted-foreground mb-1">Active (this page)</p>
                  <p className="text-3xl font-bold tracking-tight text-action">
                    {organizations.filter((org) => org.status === 'active').length}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-action/10 flex items-center justify-center group-hover:bg-action/20 transition-colors duration-300">
                  <Activity className="h-6 w-6 text-action" />
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
                  <p className="text-sm font-medium text-muted-foreground mb-1">Inactive (this page)</p>
                  <p className="text-3xl font-bold tracking-tight text-ochre">
                    {organizations.filter((org) => org.status === 'inactive').length}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-ochre-light flex items-center justify-center group-hover:bg-ochre-light/70 transition-colors duration-300">
                  <DollarSign className="h-6 w-6 text-ochre" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Organizations Table */}
      <Card className="border-border/50 shadow-lg overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30 border-border/50">
                  <SortableTableHead field="name" label="Organization" activeField={sortBy} sortOrder={sortOrder} onSort={toggleSort} className="w-[300px]" />
                  {isVisible('email') && <TableHead className="font-semibold text-muted-foreground uppercase tracking-wider">Email</TableHead>}
                  {isVisible('phone') && <TableHead className="font-semibold text-muted-foreground uppercase tracking-wider">Phone</TableHead>}
                  {isVisible('location') && <TableHead className="font-semibold text-muted-foreground uppercase tracking-wider">City / State</TableHead>}
                  {isVisible('status') && (
                    <SortableTableHead field="isActive" label="Status" activeField={sortBy} sortOrder={sortOrder} onSort={toggleSort} />
                  )}
                  {isVisible('created') && (
                    <SortableTableHead field="createdAt" label="Created" activeField={sortBy} sortOrder={sortOrder} onSort={toggleSort} />
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence mode="popLayout">
                  {filteredOrganizations.map((org) => (
                    <motion.tr
                      key={org.id}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      layout
                      className="group hover:bg-muted/30 transition-colors duration-200 border-b border-border/30 last:border-0"
                    >
                      <TableCell className="py-4">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12 ring-2 ring-background shadow-sm group-hover:ring-primary/20 transition-all duration-200">
                            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-bold">
                              {org.organizationName.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{org.organizationName}</h3>
                        </div>
                      </TableCell>
                      {isVisible('email') && (
                        <TableCell className="py-4">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="h-3.5 w-3.5" />
                            {org.primaryContactEmail}
                          </div>
                        </TableCell>
                      )}
                      {isVisible('phone') && (
                        <TableCell className="py-4">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="h-3.5 w-3.5" />
                            {org.phone}
                          </div>
                        </TableCell>
                      )}
                      {isVisible('location') && (
                        <TableCell className="py-4">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5" />
                            {[org.city, org.state].filter(Boolean).join(', ') || 'N/A'}
                          </div>
                        </TableCell>
                      )}
                      {isVisible('status') && <TableCell className="py-4">{getStatusBadge(org.status)}</TableCell>}
                      {isVisible('created') && (
                        <TableCell className="py-4">
                          <span className="text-sm text-muted-foreground">
                            {org.createdAt.toLocaleDateString()}
                          </span>
                        </TableCell>
                      )}
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </TableBody>
              {!loading && filteredOrganizations.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    No organizations found{searchQuery ? ` matching "${searchQuery}"` : ''}
                  </TableCell>
                </TableRow>
              )}
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="w-full flex items-center justify-between px-6 py-4 border-t border-border/50 bg-muted/20">
              <div className="text-sm text-muted-foreground">
                Page <span className="font-medium text-foreground">{page}</span> of{' '}
                <span className="font-medium text-foreground">{totalPages}</span> · {totalCount} organizations
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
                    if (totalPages <= 5) pageNum = i + 1;
                    else if (page <= 3) pageNum = i + 1;
                    else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
                    else pageNum = page - 2 + i;
                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink size="icon" isActive={page === pageNum} onClick={() => setPage(pageNum)} className="cursor-pointer">
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
    </div>
  );
}
