import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Checkbox } from './ui/checkbox';
import {
  Building2,
  Search,
  Filter,
  Download,
  Mail,
  Eye,
  Edit,
  UserCircle,
  Ban,
  MoreHorizontal,
  CheckCircle2,
  AlertCircle,
  Clock,
  TrendingUp,
  Users,
  Database,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from './ui/pagination';
import { format } from 'date-fns';
import { dataService } from '../api';
import { OrganizationSetupForm, OrganizationData } from './organization';

interface Organization {
  orgId: string;
  organizationName: string;
  type: 'Small' | 'Mid' | 'Large' | 'Enterprise';
  accountStatus: 'Active' | 'Suspended' | 'Pending Setup' | 'Closed';
  primaryAdminName: string;
  primaryAdminEmail: string;
  domain: string;
  subscriptionPlan: 'Free' | 'Standard' | 'Pro' | 'Enterprise';
  billingStatus: 'Active' | 'Delinquent' | 'Trial' | 'Overdue';
  providersCount: number;
  clientsCount: number;
  storageUsed: string;
  createdDate: string;
  lastActivity: string;
  featureFlagsActive: string[];
  region: string;
  complianceScore: number;
}

interface SuperAdminViewProps {
  userId: string;
  userEmail: string;
}

export function SuperAdminView({ userId, userEmail }: SuperAdminViewProps) {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [filteredOrgs, setFilteredOrgs] = useState<Organization[]>([]);
  const [selectedOrgs, setSelectedOrgs] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showSetupForm, setShowSetupForm] = useState(false);

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [billingFilter, setBillingFilter] = useState<string>('all');

  useEffect(() => {
    loadOrganizations();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, statusFilter, regionFilter, planFilter, billingFilter, organizations]);

  const loadOrganizations = async () => {
    try {
      const data = await dataService.list('organizations');

      if (data.length === 0) {
        const mockOrgs: Organization[] = [
          {
            orgId: 'ORG-001',
            organizationName: 'Wellness Care Center',
            type: 'Mid',
            accountStatus: 'Active',
            primaryAdminName: 'Sarah Johnson',
            primaryAdminEmail: 'sarah.j@wellnesscare.com',
            domain: 'wellnesscare.ataraxia.com',
            subscriptionPlan: 'Pro',
            billingStatus: 'Active',
            providersCount: 12,
            clientsCount: 245,
            storageUsed: '8.5 / 50 GB',
            createdDate: '2024-01-15',
            lastActivity: '2025-11-23',
            featureFlagsActive: ['Telehealth', 'Insurance', 'AI'],
            region: 'US',
            complianceScore: 98,
          },
          {
            orgId: 'ORG-002',
            organizationName: 'Mindful Therapy Group',
            type: 'Large',
            accountStatus: 'Active',
            primaryAdminName: 'Michael Chen',
            primaryAdminEmail: 'michael@mindfultherapy.com',
            domain: 'mindfultherapy.ataraxia.com',
            subscriptionPlan: 'Enterprise',
            billingStatus: 'Active',
            providersCount: 45,
            clientsCount: 892,
            storageUsed: '125 / 200 GB',
            createdDate: '2023-08-20',
            lastActivity: '2025-11-24',
            featureFlagsActive: ['Telehealth', 'Insurance', 'AI', 'Analytics'],
            region: 'US',
            complianceScore: 95,
          },
          {
            orgId: 'ORG-003',
            organizationName: 'Hope Counseling Services',
            type: 'Small',
            accountStatus: 'Active',
            primaryAdminName: 'Emily Rodriguez',
            primaryAdminEmail: 'emily@hopecounseling.com',
            domain: 'hopecounseling.ataraxia.com',
            subscriptionPlan: 'Standard',
            billingStatus: 'Active',
            providersCount: 5,
            clientsCount: 78,
            storageUsed: '2.3 / 20 GB',
            createdDate: '2024-06-10',
            lastActivity: '2025-11-22',
            featureFlagsActive: ['Telehealth'],
            region: 'US',
            complianceScore: 92,
          },
          {
            orgId: 'ORG-004',
            organizationName: 'Toronto Mental Health',
            type: 'Mid',
            accountStatus: 'Active',
            primaryAdminName: 'David Kim',
            primaryAdminEmail: 'david@torontomental.ca',
            domain: 'torontomental.ataraxia.com',
            subscriptionPlan: 'Pro',
            billingStatus: 'Trial',
            providersCount: 18,
            clientsCount: 312,
            storageUsed: '12 / 50 GB',
            createdDate: '2024-10-01',
            lastActivity: '2025-11-24',
            featureFlagsActive: ['Telehealth', 'Insurance'],
            region: 'CA',
            complianceScore: 88,
          },
          {
            orgId: 'ORG-005',
            organizationName: 'Serenity Wellness',
            type: 'Small',
            accountStatus: 'Pending Setup',
            primaryAdminName: 'Lisa Anderson',
            primaryAdminEmail: 'lisa@serenitywellness.com',
            domain: 'serenitywellness.ataraxia.com',
            subscriptionPlan: 'Standard',
            billingStatus: 'Trial',
            providersCount: 3,
            clientsCount: 0,
            storageUsed: '0.1 / 20 GB',
            createdDate: '2025-11-10',
            lastActivity: '2025-11-20',
            featureFlagsActive: ['Telehealth'],
            region: 'US',
            complianceScore: 75,
          },
          {
            orgId: 'ORG-006',
            organizationName: 'Berlin Psychiatry Center',
            type: 'Large',
            accountStatus: 'Active',
            primaryAdminName: 'Hans Mueller',
            primaryAdminEmail: 'h.mueller@berlinpsych.de',
            domain: 'berlinpsych.ataraxia.com',
            subscriptionPlan: 'Enterprise',
            billingStatus: 'Active',
            providersCount: 52,
            clientsCount: 1024,
            storageUsed: '180 / 200 GB',
            createdDate: '2023-11-05',
            lastActivity: '2025-11-24',
            featureFlagsActive: ['Telehealth', 'Insurance', 'AI', 'Analytics'],
            region: 'EU',
            complianceScore: 97,
          },
          {
            orgId: 'ORG-007',
            organizationName: 'Peaceful Path Therapy',
            type: 'Small',
            accountStatus: 'Suspended',
            primaryAdminName: 'Jennifer White',
            primaryAdminEmail: 'jen@peacefulpath.com',
            domain: 'peacefulpath.ataraxia.com',
            subscriptionPlan: 'Free',
            billingStatus: 'Delinquent',
            providersCount: 4,
            clientsCount: 45,
            storageUsed: '1.8 / 10 GB',
            createdDate: '2024-03-12',
            lastActivity: '2025-10-15',
            featureFlagsActive: [],
            region: 'US',
            complianceScore: 65,
          },
          {
            orgId: 'ORG-008',
            organizationName: 'Harmony Health Network',
            type: 'Enterprise',
            accountStatus: 'Active',
            primaryAdminName: 'Robert Martinez',
            primaryAdminEmail: 'r.martinez@harmonyhealth.com',
            domain: 'harmonyhealth.ataraxia.com',
            subscriptionPlan: 'Enterprise',
            billingStatus: 'Active',
            providersCount: 120,
            clientsCount: 2450,
            storageUsed: '450 / 500 GB',
            createdDate: '2023-05-18',
            lastActivity: '2025-11-24',
            featureFlagsActive: ['Telehealth', 'Insurance', 'AI', 'Analytics', 'Custom API'],
            region: 'US',
            complianceScore: 99,
          },
        ];

        for (const org of mockOrgs) {
          await dataService.create('organizations', org);
        }
        setOrganizations(mockOrgs);
        setFilteredOrgs(mockOrgs);
      } else {
        setOrganizations(data as Organization[]);
        setFilteredOrgs(data as Organization[]);
      }
    } catch (error) {
      console.error('Failed to load organizations:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...organizations];

    if (searchQuery) {
      filtered = filtered.filter((org: Organization) =>
        org.organizationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        org.primaryAdminName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        org.primaryAdminEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        org.orgId.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((org: Organization) => org.accountStatus === statusFilter);
    }

    if (regionFilter !== 'all') {
      filtered = filtered.filter((org: Organization) => org.region === regionFilter);
    }

    if (planFilter !== 'all') {
      filtered = filtered.filter((org: Organization) => org.subscriptionPlan === planFilter);
    }

    if (billingFilter !== 'all') {
      filtered = filtered.filter((org: Organization) => org.billingStatus === billingFilter);
    }

    setFilteredOrgs(filtered);
    setCurrentPage(1);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return <Badge variant="green" dot size="sm">Active</Badge>;
      case 'Suspended':
        return <Badge variant="red" dot size="sm">Suspended</Badge>;
      case 'Pending Setup':
        return <Badge variant="yellow" dot size="sm">Pending Setup</Badge>;
      case 'Closed':
        return <Badge variant="neutral" dot size="sm">Closed</Badge>;
      default:
        return null;
    }
  };

  const getBillingBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return <Badge variant="green" size="sm">Active</Badge>;
      case 'Delinquent':
        return <Badge variant="red" size="sm">Delinquent</Badge>;
      case 'Trial':
        return <Badge variant="blue" size="sm">Trial</Badge>;
      case 'Overdue':
        return <Badge variant="orange" size="sm">Overdue</Badge>;
      default:
        return null;
    }
  };

  const getPlanBadge = (plan: string) => {
    const variants: Record<string, any> = {
      'Enterprise': 'purple',
      'Pro': 'blue',
      'Standard': 'green',
      'Free': 'neutral'
    };
    return <Badge variant={variants[plan] || 'neutral'} size="sm">{plan}</Badge>;
  };

  const getComplianceColor = (score: number) => {
    if (score >= 95) return 'text-green-600';
    if (score >= 85) return 'text-yellow-600';
    return 'text-red-600';
  };

  const toggleOrgSelection = (orgId: string) => {
    setSelectedOrgs(prev =>
      prev.includes(orgId) ? prev.filter((id: string) => id !== orgId) : [...prev, orgId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedOrgs.length === filteredOrgs.length) {
      setSelectedOrgs([]);
    } else {
      setSelectedOrgs(filteredOrgs.map((org: Organization) => org.orgId));
    }
  };

  const handleBulkAction = (action: string) => {
    console.log(`Bulk action: ${action} for orgs:`, selectedOrgs);
  };

  const handleExport = () => {
    console.log('Exporting organizations...');
  };

  const handleCreateOrganization = () => {
    setShowSetupForm(true);
  };

  const handleOrganizationComplete = async (data: OrganizationData) => {
    // Map form data to Organization interface
    const newOrg: Organization = {
      orgId: `ORG-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
      organizationName: data.organizationName,
      type: (data.organizationType === 'large-enterprise' ? 'Enterprise' :
        data.organizationType === 'mid-size' ? 'Mid' :
          data.organizationType === 'small-group' ? 'Small' : 'Small'),
      accountStatus: 'Active',
      primaryAdminName: data.primaryContactName,
      primaryAdminEmail: data.primaryContactEmail,
      domain: data.customDomain || `${data.organizationName.toLowerCase().replace(/\s+/g, '-')}.ataraxia.com`,
      subscriptionPlan: (data.subscriptionPlan as any) || 'Standard',
      billingStatus: 'Active',
      providersCount: data.numberOfClinicians,
      clientsCount: 0,
      storageUsed: '0 / 50 GB',
      createdDate: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      featureFlagsActive: [],
      region: data.hqCountry,
      complianceScore: 100,
    };

    try {
      // In a real app, this would be an API call
      // await dataService.create('organizations', newOrg);

      setOrganizations(prev => [newOrg, ...prev]);
      setFilteredOrgs(prev => [newOrg, ...prev]);
      setShowSetupForm(false);
    } catch (error) {
      console.error('Failed to create organization:', error);
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrgs = filteredOrgs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredOrgs.length / itemsPerPage);

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
        type: "spring",
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
        type: "spring",
        stiffness: 400,
        damping: 25
      }
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-background">
      {showSetupForm ? (
        <div className="p-8 max-w-[1200px] mx-auto">
          <Button
            variant="ghost"
            onClick={() => setShowSetupForm(false)}
            className="mb-4"
          >
            ← Back to Organizations
          </Button>
          <OrganizationSetupForm
            onComplete={handleOrganizationComplete}
            onCancel={() => setShowSetupForm(false)}
          />
        </div>
      ) : (
        <div className="p-8 space-y-6 max-w-[1800px] mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-xl">
                <Building2 className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-semibold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  Organizations
                </h1>
                <p className="text-muted-foreground mt-1">
                  Manage all organizations on the platform
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                className="border-border/50 hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-all"
                onClick={handleExport}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button
                className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all duration-200 hover:shadow-xl hover:shadow-primary/30 hover:scale-105"
                onClick={handleCreateOrganization}
              >
                <Building2 className="h-4 w-4 mr-2" />
                Add Organization
              </Button>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-5 gap-4"
          >
            <motion.div variants={statsVariants as any}>
              <Card className="border-border/50 bg-gradient-to-br from-card to-card/50 shadow-sm hover:shadow-lg hover:border-primary/20 transition-all duration-300 group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Total Organizations</p>
                      <p className="text-2xl font-bold tracking-tight">{organizations.length}</p>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={statsVariants as any}>
              <Card className="border-border/50 bg-gradient-to-br from-card to-card/50 shadow-sm hover:shadow-lg hover:border-green-500/20 transition-all duration-300 group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Active</p>
                      <p className="text-2xl font-bold tracking-tight text-green-600">
                        {organizations.filter((o: Organization) => o.accountStatus === 'Active').length}
                      </p>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/20 transition-colors duration-300">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={statsVariants as any}>
              <Card className="border-border/50 bg-gradient-to-br from-card to-card/50 shadow-sm hover:shadow-lg hover:border-yellow-500/20 transition-all duration-300 group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Pending Setup</p>
                      <p className="text-2xl font-bold tracking-tight text-yellow-600">
                        {organizations.filter((o: Organization) => o.accountStatus === 'Pending Setup').length}
                      </p>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-yellow-500/10 flex items-center justify-center group-hover:bg-yellow-500/20 transition-colors duration-300">
                      <Clock className="h-5 w-5 text-yellow-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={statsVariants as any}>
              <Card className="border-border/50 bg-gradient-to-br from-card to-card/50 shadow-sm hover:shadow-lg hover:border-red-500/20 transition-all duration-300 group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Suspended</p>
                      <p className="text-2xl font-bold tracking-tight text-red-600">
                        {organizations.filter((o: Organization) => o.accountStatus === 'Suspended').length}
                      </p>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 transition-colors duration-300">
                      <Ban className="h-5 w-5 text-red-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={statsVariants as any}>
              <Card className="border-border/50 bg-gradient-to-br from-card to-card/50 shadow-sm hover:shadow-lg hover:border-blue-500/20 transition-all duration-300 group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Total Providers</p>
                      <p className="text-2xl font-bold tracking-tight text-blue-600">
                        {organizations.reduce((acc: number, org: Organization) => acc + org.providersCount, 0)}
                      </p>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors duration-300">
                      <UserCircle className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Filters and Search */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex-1 relative group">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                  <Input
                    placeholder="Search organizations, admins, or IDs..."
                    value={searchQuery}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                    className="pl-10 border-border/50 focus-visible:ring-primary/20 focus-visible:border-primary transition-all duration-200"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48 border-border/50 focus:ring-primary/20">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Suspended">Suspended</SelectItem>
                    <SelectItem value="Pending Setup">Pending Setup</SelectItem>
                    <SelectItem value="Closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={regionFilter} onValueChange={setRegionFilter}>
                  <SelectTrigger className="w-32 border-border/50 focus:ring-primary/20">
                    <SelectValue placeholder="Region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Regions</SelectItem>
                    <SelectItem value="US">US</SelectItem>
                    <SelectItem value="CA">CA</SelectItem>
                    <SelectItem value="EU">EU</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={planFilter} onValueChange={setPlanFilter}>
                  <SelectTrigger className="w-40 border-border/50 focus:ring-primary/20">
                    <SelectValue placeholder="Plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Plans</SelectItem>
                    <SelectItem value="Free">Free</SelectItem>
                    <SelectItem value="Standard">Standard</SelectItem>
                    <SelectItem value="Pro">Pro</SelectItem>
                    <SelectItem value="Enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={billingFilter} onValueChange={setBillingFilter}>
                  <SelectTrigger className="w-40 border-border/50 focus:ring-primary/20">
                    <SelectValue placeholder="Billing" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Billing</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Trial">Trial</SelectItem>
                    <SelectItem value="Delinquent">Delinquent</SelectItem>
                    <SelectItem value="Overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Bulk Actions */}
          <AnimatePresence>
            {selectedOrgs.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Card className="border-primary/50 bg-primary/5 backdrop-blur-sm shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-foreground">
                        <span className="font-semibold">{selectedOrgs.length}</span> organization(s) selected
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-border/50 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50 transition-all"
                          onClick={() => handleBulkAction('suspend')}
                        >
                          <Ban className="h-4 w-4 mr-2" />
                          Suspend
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-border/50 hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-all"
                          onClick={() => handleBulkAction('email')}
                        >
                          <Mail className="h-4 w-4 mr-2" />
                          Send Email
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-border/50 hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-all"
                          onClick={() => handleBulkAction('export')}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Export Selected
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Organizations Table */}
          <Card className="border-border/50 shadow-lg overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/50 hover:bg-transparent bg-muted/30">
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedOrgs.length === filteredOrgs.length && filteredOrgs.length > 0}
                          onCheckedChange={toggleSelectAll}
                        />
                      </TableHead>
                      <TableHead className="font-semibold text-foreground">Org ID</TableHead>
                      <TableHead className="font-semibold text-foreground">Organization</TableHead>
                      <TableHead className="font-semibold text-foreground">Type</TableHead>
                      <TableHead className="font-semibold text-foreground">Status</TableHead>
                      <TableHead className="font-semibold text-foreground">Primary Admin</TableHead>
                      <TableHead className="font-semibold text-foreground">Domain</TableHead>
                      <TableHead className="font-semibold text-foreground">Plan</TableHead>
                      <TableHead className="font-semibold text-foreground">Billing</TableHead>
                      <TableHead className="font-semibold text-foreground">Providers</TableHead>
                      <TableHead className="font-semibold text-foreground">Clients</TableHead>
                      <TableHead className="font-semibold text-foreground">Storage</TableHead>
                      <TableHead className="font-semibold text-foreground">Region</TableHead>
                      <TableHead className="font-semibold text-foreground">Compliance</TableHead>
                      <TableHead className="font-semibold text-foreground">Created</TableHead>
                      <TableHead className="font-semibold text-foreground">Last Activity</TableHead>
                      <TableHead className="text-right font-semibold text-foreground">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence mode="popLayout">
                      {currentOrgs.map((org: Organization) => (
                        <motion.tr
                          key={org.orgId}
                          variants={itemVariants as any}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          layout
                          className="group border-border/30 hover:bg-muted/50 transition-colors duration-150"
                        >
                          <TableCell>
                            <Checkbox
                              checked={selectedOrgs.includes(org.orgId)}
                              onCheckedChange={() => toggleOrgSelection(org.orgId)}
                            />
                          </TableCell>
                          <TableCell className="font-mono text-xs text-muted-foreground">
                            {org.orgId}
                          </TableCell>
                          <TableCell>
                            <button className="font-medium text-primary hover:text-primary/80 text-left transition-colors">
                              {org.organizationName}
                            </button>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" size="sm" className="border-border/50">
                              {org.type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(org.accountStatus)}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="text-sm font-medium text-foreground">{org.primaryAdminName}</p>
                              <p className="text-xs text-muted-foreground">{org.primaryAdminEmail}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {org.domain}
                          </TableCell>
                          <TableCell>
                            {getPlanBadge(org.subscriptionPlan)}
                          </TableCell>
                          <TableCell>
                            {getBillingBadge(org.billingStatus)}
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="font-semibold text-foreground">{org.providersCount}</span>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="font-semibold text-foreground">{org.clientsCount}</span>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {org.storageUsed}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" size="sm" className="border-border/50">
                              {org.region}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className={`font-semibold ${getComplianceColor(org.complianceScore)}`}>
                              {org.complianceScore}%
                            </span>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {format(new Date(org.createdDate), 'MMM dd, yyyy')}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {format(new Date(org.lastActivity), 'MMM dd, yyyy')}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <UserCircle className="h-4 w-4 mr-2" />
                                  Impersonate
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Mail className="h-4 w-4 mr-2" />
                                  Send Email
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive">
                                  <Ban className="h-4 w-4 mr-2" />
                                  Suspend
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

              {/* Pagination */}
              <div className="w-full flex items-center justify-center gap-6 p-4 border-t border-border/50">
                <div className="text-sm text-muted-foreground whitespace-nowrap">
                  Showing <span className="font-medium text-foreground">{indexOfFirstItem + 1}</span> to{' '}
                  <span className="font-medium text-foreground">{Math.min(indexOfLastItem, filteredOrgs.length)}</span> of{' '}
                  <span className="font-medium text-foreground">{filteredOrgs.length}</span> records
                  {searchQuery && (
                    <span className="ml-1">
                      (filtered from {organizations.length} total)
                    </span>
                  )}
                </div>

                <Pagination>
                  <PaginationContent>
                    <PaginationPrevious
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      size="default"
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
                            isActive={currentPage === pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className="cursor-pointer"
                            size="default"
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}

                    <PaginationNext
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      size="default"
                    />
                  </PaginationContent>
                </Pagination>

                <div className="text-sm text-muted-foreground whitespace-nowrap">
                  Page <span className="font-medium text-foreground">{currentPage}</span> of{' '}
                  <span className="font-medium text-foreground">{totalPages}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}