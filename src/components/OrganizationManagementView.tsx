import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { OrganizationSetupForm } from './OrganizationSetupForm';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Badge } from './ui/badge';
import {
  Building2, Plus, Search, MoreVertical, Edit, Trash2,
  Users, MapPin, Shield, CheckCircle2, XCircle, Eye,
  Settings, TrendingUp, Calendar, DollarSign, Activity,
  Globe, Command, Filter
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Card, CardContent } from './ui/card';
import { Avatar, AvatarFallback } from './ui/avatar';
import { toast } from 'sonner';

interface Organization {
  id: string;
  organizationName: string;
  organizationType: string;
  numberOfClinicians: number;
  numberOfClients: number;
  subscriptionPlan: string;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: Date;
  primaryContactEmail: string;
  hipaaCompliant: boolean;
}

interface OrganizationManagementViewProps {
  userId: string;
  userEmail: string;
  onNavigate: () => void;
}

export function OrganizationManagementView({ userId, userEmail, onNavigate }: OrganizationManagementViewProps) {
  const [showSetupForm, setShowSetupForm] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Mock organizations data
  const [organizations, setOrganizations] = useState<Organization[]>([
    {
      id: 'ORG-001',
      organizationName: 'Wellness Center LA',
      organizationType: 'mid-size',
      numberOfClinicians: 25,
      numberOfClients: 150,
      subscriptionPlan: 'per-provider',
      status: 'active',
      createdAt: new Date('2024-01-15'),
      primaryContactEmail: 'admin@wellnessla.com',
      hipaaCompliant: true
    },
    {
      id: 'ORG-002',
      organizationName: 'Mind & Body Therapy Group',
      organizationType: 'small-group',
      numberOfClinicians: 8,
      numberOfClients: 65,
      subscriptionPlan: 'per-provider',
      status: 'active',
      createdAt: new Date('2024-02-20'),
      primaryContactEmail: 'contact@mindbody.com',
      hipaaCompliant: true
    },
    {
      id: 'ORG-003',
      organizationName: 'Enterprise Health Systems',
      organizationType: 'large-enterprise',
      numberOfClinicians: 120,
      numberOfClients: 1200,
      subscriptionPlan: 'enterprise',
      status: 'active',
      createdAt: new Date('2023-11-10'),
      primaryContactEmail: 'it@enterprisehealth.com',
      hipaaCompliant: true
    },
    {
      id: 'ORG-004',
      organizationName: 'TeleTherapy Connect',
      organizationType: 'telehealth-only',
      numberOfClinicians: 45,
      numberOfClients: 380,
      subscriptionPlan: 'per-provider',
      status: 'active',
      createdAt: new Date('2024-03-05'),
      primaryContactEmail: 'admin@teletherapy.com',
      hipaaCompliant: true
    }
  ]);

  const handleCreateOrganization = () => {
    setEditingOrg(null);
    setShowSetupForm(true);
  };

  const handleEditOrganization = (org: Organization) => {
    setEditingOrg(org);
    setShowSetupForm(true);
  };

  const handleDeleteOrganization = (orgId: string) => {
    toast.success('Organization Deleted', {
      description: 'The organization has been permanently removed'
    });
    setOrganizations(organizations.filter(org => org.id !== orgId));
  };

  const handleOrganizationComplete = (data: any) => {
    if (editingOrg) {
      setOrganizations(organizations.map(org =>
        org.id === editingOrg.id
          ? { ...org, organizationName: data.organizationName }
          : org
      ));
    } else {
      const newOrg: Organization = {
        id: `ORG-${String(organizations.length + 1).padStart(3, '0')}`,
        organizationName: data.organizationName,
        organizationType: data.organizationType,
        numberOfClinicians: data.numberOfClinicians,
        numberOfClients: 0,
        subscriptionPlan: data.subscriptionPlan,
        status: 'active',
        createdAt: new Date(),
        primaryContactEmail: data.primaryContactEmail,
        hipaaCompliant: data.hipaaBAASigned
      };
      setOrganizations([...organizations, newOrg]);
    }
    setShowSetupForm(false);
    setEditingOrg(null);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      inactive: 'bg-muted text-muted-foreground border-border',
      suspended: 'bg-rose-50 text-rose-700 border-rose-100'
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status as keyof typeof styles] || styles.active}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getOrganizationTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      'solo': 'Solo Practice',
      'small-group': 'Small Group',
      'mid-size': 'Mid-size Clinic',
      'large-enterprise': 'Enterprise',
      'telehealth-only': 'Telehealth',
      'multi-location': 'Multi-site'
    };
    return labels[type] || type;
  };

  const filteredOrganizations = organizations.filter(org =>
    org.organizationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    org.primaryContactEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
    org.id.toLowerCase().includes(searchQuery.toLowerCase())
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
        onCancel={() => {
          setShowSetupForm(false);
          setEditingOrg(null);
        }}
        editMode={!!editingOrg}
        existingData={editingOrg || undefined}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background p-8 max-w-[1600px] mx-auto font-sans selection:bg-indigo-100">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="mb-8"
      >
        <div className="flex items-end justify-end gap-6 mb-6">
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
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-indigo-600" />
                <Input
                  placeholder="Search organizations by name, email, or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 border-border/50 focus-visible:ring-indigo-600/20 focus-visible:border-indigo-600 transition-all duration-200"
                />
              </div>
              <Select value="all" onValueChange={() => { }}>
                <SelectTrigger className="w-[180px] border-border/50 focus:ring-indigo-600/20">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Organizations</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
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
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        <motion.div variants={statsVariants}>
          <Card className="border-border/50 bg-gradient-to-br from-card to-card/50 shadow-sm hover:shadow-lg hover:border-blue-500/20 transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Total Organizations</p>
                  <p className="text-3xl font-bold tracking-tight">{organizations.length}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors duration-300">
                  <Building2 className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={statsVariants}>
          <Card className="border-border/50 bg-gradient-to-br from-card to-card/50 shadow-sm hover:shadow-lg hover:border-emerald-500/20 transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Total Clinicians</p>
                  <p className="text-3xl font-bold tracking-tight text-emerald-600">
                    {organizations.reduce((sum, org) => sum + org.numberOfClinicians, 0)}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors duration-300">
                  <Users className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={statsVariants}>
          <Card className="border-border/50 bg-gradient-to-br from-card to-card/50 shadow-sm hover:shadow-lg hover:border-violet-500/20 transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Active Patients</p>
                  <p className="text-3xl font-bold tracking-tight text-violet-600">
                    {organizations.reduce((sum, org) => sum + org.numberOfClients, 0)}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-violet-500/10 flex items-center justify-center group-hover:bg-violet-500/20 transition-colors duration-300">
                  <Activity className="h-6 w-6 text-violet-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={statsVariants}>
          <Card className="border-border/50 bg-gradient-to-br from-card to-card/50 shadow-sm hover:shadow-lg hover:border-orange-500/20 transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Avg. Revenue</p>
                  <p className="text-3xl font-bold tracking-tight text-orange-600">
                    ${((organizations.reduce((sum, org) => sum + org.numberOfClinicians, 0) * 99) / (organizations.length || 1)).toLocaleString()}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-orange-500/10 flex items-center justify-center group-hover:bg-orange-500/20 transition-colors duration-300">
                  <DollarSign className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>



      {/* Organizations Table - Card Directory Style */}
      <Card className="border-border/50 shadow-lg overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30 border-border/50">
                  <TableHead className="w-[300px] font-semibold text-muted-foreground uppercase tracking-wider">Organization</TableHead>
                  <TableHead className="font-semibold text-muted-foreground uppercase tracking-wider">Type & Plan</TableHead>
                  <TableHead className="font-semibold text-muted-foreground uppercase tracking-wider">Stats</TableHead>
                  <TableHead className="font-semibold text-muted-foreground uppercase tracking-wider">Status</TableHead>
                  <TableHead className="font-semibold text-muted-foreground uppercase tracking-wider">Created</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence mode="popLayout">
                  {filteredOrganizations.map((org, index) => (
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
                          <Avatar className="h-12 w-12 ring-2 ring-background shadow-sm group-hover:ring-indigo-600/20 transition-all duration-200">
                            <AvatarFallback className="bg-gradient-to-br from-indigo-50 to-slate-50 text-indigo-600 font-bold">
                              {org.organizationName.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold text-foreground group-hover:text-indigo-600 transition-colors">{org.organizationName}</h3>
                            <div className="flex items-center gap-2 mt-0.5">
                              <Badge variant="outline" className="text-[10px] h-4 px-1 text-muted-foreground border-border">
                                {org.id}
                              </Badge>
                              {org.hipaaCompliant && (
                                <span className="flex items-center gap-0.5 text-[10px] text-emerald-600 font-medium">
                                  <Shield className="w-3 h-3" /> HIPAA
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-foreground">{getOrganizationTypeLabel(org.organizationType)}</span>
                          </div>
                          <p className="text-xs text-muted-foreground capitalize">{org.subscriptionPlan.replace('-', ' ')} Plan</p>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <p className="text-lg font-bold text-foreground leading-none">{org.numberOfClinicians}</p>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Providers</p>
                          </div>
                          <div className="w-px h-8 bg-border/50"></div>
                          <div className="text-center">
                            <p className="text-lg font-bold text-foreground leading-none">{org.numberOfClients}</p>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Patients</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        {getStatusBadge(org.status)}
                      </TableCell>
                      <TableCell className="py-4">
                        <span className="text-sm text-muted-foreground">
                          {org.createdAt.toLocaleDateString()}
                        </span>
                      </TableCell>
                      <TableCell className="py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-muted opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreVertical className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-[160px] rounded-xl border-border shadow-xl p-1">
                            <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleEditOrganization(org)} className="rounded-lg cursor-pointer">
                              <Edit className="h-4 w-4 mr-2" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toast.info('Settings coming soon')} className="rounded-lg cursor-pointer">
                              <Settings className="h-4 w-4 mr-2" /> Configure
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-muted" />
                            <DropdownMenuItem onClick={() => handleDeleteOrganization(org.id)} className="text-red-600 rounded-lg cursor-pointer hover:bg-red-50 focus:bg-red-50">
                              <Trash2 className="h-4 w-4 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </TableBody>
              {filteredOrganizations.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    No organizations found matching "{searchQuery}"
                  </TableCell>
                </TableRow>
              )}
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
