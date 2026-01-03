import React, { useState } from 'react';
import { Phone, Mail, MapPin, User, MoreVertical, ChevronUp, ChevronDown, Search, Filter, Plus, Send } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Label } from './ui/label';
import { PhoneInput } from './PhoneInput';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
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
  PaginationEllipsis,
} from './ui/pagination';
import { UserRole } from '../types/appointment';
import { toast } from 'sonner@2.0.3';
import { dataService } from '../api';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  countryCode?: string;
  category: string;
  location: string;
  gender: 'Male' | 'Female' | 'Other';
  status: 'active' | 'inactive' | 'pending';
  avatar?: string;
}

interface EnhancedClientsTableProps {
  userRole: UserRole;
}

type SortField = 'name' | 'email' | 'phone' | 'category' | 'location' | 'gender' | null;
type SortDirection = 'asc' | 'desc';

export function EnhancedClientsTable({ userRole }: EnhancedClientsTableProps) {
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState<number>(20);

  // Add Client Dialog state
  const [isAddClientDialogOpen, setIsAddClientDialogOpen] = useState(false);
  const [newClientData, setNewClientData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    countryCode: '+1',
  });
  const [sendRegistrationLink, setSendRegistrationLink] = useState(true);
  const [clients, setClients] = useState<Client[]>([]);

  // Initialize clients with data from API
  React.useEffect(() => {
    const fetchClients = async () => {
      try {
        const data = await dataService.list('clients');
        if (data && data.length > 0) {
          setClients(data);
        } else {
          // Fallback to initial mock data if API returns empty
          const initialMockData: Client[] = [
            {
              id: '1',
              name: 'Robert Fox',
              email: 'willie.jennings@example.com',
              phone: '(671) 555-0110',
              category: 'Customers',
              location: 'Austin',
              gender: 'Male',
              status: 'active',
            },
            {
              id: '2',
              name: 'Sarah Johnson',
              email: 'sarah.johnson@example.com',
              phone: '(555) 123-4567',
              category: 'Therapy',
              location: 'New York',
              gender: 'Female',
              status: 'active',
            },
            {
              id: '3',
              name: 'Michael Chen',
              email: 'michael.chen@example.com',
              phone: '(555) 234-5678',
              category: 'Counseling',
              location: 'San Francisco',
              gender: 'Male',
              status: 'pending',
            },
            {
              id: '4',
              name: 'Emma Davis',
              email: 'emma.davis@example.com',
              phone: '(555) 345-6789',
              category: 'Therapy',
              location: 'Los Angeles',
              gender: 'Female',
              status: 'active',
            },
            {
              id: '5',
              name: 'James Wilson',
              email: 'james.wilson@example.com',
              phone: '(555) 456-7890',
              category: 'Wellness',
              location: 'Chicago',
              gender: 'Male',
              status: 'inactive',
            },
            {
              id: '6',
              name: 'Lisa Anderson',
              email: 'lisa.anderson@example.com',
              phone: '(555) 567-8901',
              category: 'Customers',
              location: 'Seattle',
              gender: 'Female',
              status: 'active',
            },
          ];
          setClients(initialMockData);

          // Seed the mock data service
          initialMockData.forEach(client => {
            dataService.create('clients', client);
          });
        }
      } catch (error) {
        console.error('Failed to fetch clients:', error);
        toast.error('Failed to load clients');
      }
    };

    fetchClients();
  }, []);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedClients(filteredClients.map(p => p.id));
    } else {
      setSelectedClients([]);
    }
  };

  const handleSelectClient = (clientId: string, checked: boolean) => {
    if (checked) {
      setSelectedClients([...selectedClients, clientId]);
    } else {
      setSelectedClients(selectedClients.filter(id => id !== clientId));
    }
  };

  const handleAddClient = async () => {
    // Validation
    if (!newClientData.firstName || !newClientData.lastName || !newClientData.email || !newClientData.phone) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newClientData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    // Phone validation (basic - check if has digits)
    if (newClientData.phone.length < 8) {
      toast.error('Please enter a valid phone number');
      return;
    }

    // Create new client
    const newClient: Omit<Client, 'id'> = {
      name: `${newClientData.firstName} ${newClientData.lastName}`,
      email: newClientData.email,
      phone: newClientData.phone,
      category: 'Customers',
      location: 'Pending',
      gender: 'Male', // Default, will be updated by client
      status: 'pending',
    };

    try {
      const createdClient = await dataService.create('clients', newClient);

      // Add to clients list
      setClients(prev => [createdClient, ...prev]);

      // If send registration link is checked, send email
      if (sendRegistrationLink) {
        // TODO: Integrate with backend API to send registration link
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

        toast.success(`Client added! Registration link sent to ${newClientData.email}`);
      } else {
        toast.success('Client added successfully!');
      }

      // Reset form and close dialog
      setNewClientData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        countryCode: '+1',
      });
      setSendRegistrationLink(true);
      setIsAddClientDialogOpen(false);
    } catch (error) {
      console.error('Error adding client:', error);
      toast.error('Failed to add client');
    }
  };

  const filteredClients = clients.filter(client => {
    const query = searchQuery.toLowerCase();
    return (
      client.name.toLowerCase().includes(query) ||
      client.email.toLowerCase().includes(query) ||
      client.phone.includes(query) ||
      client.location.toLowerCase().includes(query)
    );
  });

  const sortedClients = [...filteredClients].sort((a, b) => {
    if (!sortField) return 0;

    const aValue = a[sortField]?.toString().toLowerCase() || '';
    const bValue = b[sortField]?.toString().toLowerCase() || '';

    if (sortDirection === 'asc') {
      return aValue.localeCompare(bValue);
    } else {
      return bValue.localeCompare(aValue);
    }
  });

  // Pagination calculations
  const totalRecords = sortedClients.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = startIndex + recordsPerPage;
  const paginatedClients = sortedClients.slice(startIndex, endIndex);

  // Pagination handlers
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleRecordsPerPageChange = (value: string) => {
    setRecordsPerPage(Number(value));
    setCurrentPage(1); // Reset to first page when changing records per page
  };

  // Reset to page 1 when search query changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: 'bg-[#ecf7ed] text-[#2e844a] border-[#2e844a]', label: 'Active' },
      pending: { color: 'bg-[#fef7e6] text-[#f59e0b] border-[#f59e0b]', label: 'Pending' },
      inactive: { color: 'bg-gray-100 text-gray-600 border-gray-400', label: 'Inactive' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;

    return (
      <div className={`px-2 py-1 ${config.color} rounded-full inline-flex items-center gap-2 border`}>
        <div className={`w-2 h-2 rounded-full ${config.color.includes('2e844a') ? 'bg-[#2e844a]' : config.color.includes('f59e0b') ? 'bg-[#f59e0b]' : 'bg-gray-600'}`}></div>
        <span className="text-xs font-medium">{config.label}</span>
      </div>
    );
  };

  const getCategoryBadge = (category: string) => {
    const categoryConfig = {
      Customers: 'bg-[#d1e7fd] text-[#0176d3]',
      Therapy: 'bg-[#ecf7ed] text-[#2e844a]',
      Counseling: 'bg-[#fef7e6] text-[#f59e0b]',
      Wellness: 'bg-[#fce8ec] text-[#dc2626]',
    };

    const color = categoryConfig[category as keyof typeof categoryConfig] || categoryConfig.Customers;

    return (
      <div className={`px-1.5 py-1 ${color} rounded inline-flex items-center`}>
        <span className="text-xs font-medium">{category}</span>
      </div>
    );
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return (
        <div className="w-3 h-3 relative">
          <ChevronUp className="w-4 h-2 absolute -top-0.5 left-0 text-muted-foreground" strokeWidth={1.5} />
          <ChevronDown className="w-4 h-2 absolute top-0.5 left-0 text-muted-foreground" strokeWidth={1.5} />
        </div>
      );
    }

    return sortDirection === 'asc' ? (
      <ChevronUp className="w-3 h-3 text-muted-foreground" strokeWidth={1.5} />
    ) : (
      <ChevronDown className="w-3 h-3 text-muted-foreground" strokeWidth={1.5} />
    );
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="w-full px-1 md:px-2 lg:px-3 pt-10 pb-14 bg-white inline-flex flex-col justify-start items-center gap-10">
      {/* Search and Actions Bar */}
      <div className="w-full flex justify-between items-center gap-4">
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>

          <Button
            size="sm"
            className="gap-2 bg-[#F97316] hover:bg-[#ea580c] text-white rounded-full"
            onClick={() => setIsAddClientDialogOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Add Client
          </Button>
        </div>
      </div>

      {/* Main Table Section */}
      <div className="w-full flex flex-col justify-start items-start gap-4">
        <div className="text-[#0c0a09] text-3xl font-medium leading-8">Client Records</div>

        {/* Table Container - Responsive with overflow scroll */}
        <div className="w-full bg-[#f9fafb] rounded border border-[#dddbda] overflow-x-auto">
          <div className="min-w-[1600px] w-full">
            {/* Table Header */}
            <div className="w-full bg-[#f9fafb] border-b border-[#dddbda] flex justify-start items-start gap-x-4">
              <div className="min-w-[240px] flex-[3.5] flex-shrink-0 px-6 py-3 flex justify-start items-center gap-2">
                <Checkbox
                  checked={selectedClients.length === filteredClients.length && filteredClients.length > 0}
                  onCheckedChange={handleSelectAll}
                />
                <button
                  onClick={() => handleSort('name')}
                  className="flex items-center gap-2 hover:text-foreground transition-colors"
                >
                  <span className="text-muted-foreground text-sm font-normal leading-5">Name</span>
                  <SortIcon field="name" />
                </button>
              </div>

              <button
                onClick={() => handleSort('email')}
                className="min-w-[280px] flex-[4.5] flex-shrink-0 px-6 py-3 flex justify-start items-center gap-2 hover:bg-gray-50 transition-colors"
              >
                <span className="text-muted-foreground text-sm font-normal leading-5">Email</span>
                <SortIcon field="email" />
              </button>

              <button
                onClick={() => handleSort('phone')}
                className="min-w-[200px] flex-[2.5] flex-shrink-0 px-6 py-3 flex justify-start items-center gap-2 hover:bg-gray-50 transition-colors"
              >
                <span className="text-muted-foreground text-sm font-normal leading-5">Phone</span>
                <SortIcon field="phone" />
              </button>

              <button
                onClick={() => handleSort('category')}
                className="min-w-[180px] flex-[2] flex-shrink-0 px-6 py-3 flex justify-start items-center gap-2 hover:bg-gray-50 transition-colors"
              >
                <span className="text-muted-foreground text-sm font-normal leading-5">Category</span>
                <SortIcon field="category" />
              </button>

              <button
                onClick={() => handleSort('location')}
                className="min-w-[190px] flex-[2.5] flex-shrink-0 px-6 py-3 flex justify-start items-center gap-2 hover:bg-gray-50 transition-colors"
              >
                <span className="text-muted-foreground text-sm font-normal leading-5">Location</span>
                <SortIcon field="location" />
              </button>

              <button
                onClick={() => handleSort('gender')}
                className="min-w-[150px] flex-[1.5] flex-shrink-0 px-6 py-3 flex justify-start items-center gap-2 hover:bg-gray-50 transition-colors"
              >
                <span className="text-muted-foreground text-sm font-normal leading-5">Gender</span>
                <SortIcon field="gender" />
              </button>

              <div className="min-w-[240px] flex-[3.5] flex-shrink-0 px-6 py-3 flex justify-start items-center gap-2">
                <span className="text-muted-foreground text-sm font-normal leading-5">Action</span>
              </div>
            </div>

            {/* Table Rows */}
            {paginatedClients.map((client, index) => (
              <div
                key={client.id}
                className={`w-full bg-white ${index !== paginatedClients.length - 1 ? 'border-b border-[#dddbda]' : ''} flex justify-start items-start gap-x-4 hover:bg-gray-50 transition-colors`}
              >
                {/* Name Column with Avatar */}
                <div className="min-w-[240px] flex-[3.5] flex-shrink-0 px-6 py-2.5 flex justify-start items-center gap-3 overflow-hidden">
                  <Checkbox
                    checked={selectedClients.includes(client.id)}
                    onCheckedChange={(checked) => handleSelectClient(client.id, checked as boolean)}
                  />
                  <div className="flex-1 flex justify-start items-center gap-2 overflow-hidden">
                    <Avatar className="w-6 h-6 flex-shrink-0">
                      <AvatarImage src={client.avatar} />
                      <AvatarFallback className="text-xs bg-[#F97316] text-white">
                        {getInitials(client.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 inline-flex flex-col justify-center items-start overflow-hidden">
                      <div className="text-[#0c0a09] text-sm font-normal leading-5 truncate w-full">
                        {client.name}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Email Column */}
                <div className="min-w-[280px] flex-[4.5] flex-shrink-0 px-6 py-2.5 flex justify-start items-center gap-3 overflow-hidden">
                  <div className="flex-1 flex justify-start items-center gap-2 overflow-hidden">
                    <Mail className="w-5 h-5 text-muted-foreground flex-shrink-0" strokeWidth={1.5} />
                    <div className="flex-1 inline-flex flex-col justify-center items-start overflow-hidden">
                      <div className="text-[#0c0a09] text-sm font-medium underline leading-5 truncate w-full hover:text-[#F97316] cursor-pointer">
                        {client.email}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Phone Column */}
                <div className="min-w-[200px] flex-[2.5] flex-shrink-0 px-6 py-2.5 flex justify-start items-center gap-3 overflow-hidden">
                  <div className="flex justify-start items-center gap-2">
                    <Phone className="w-5 h-5 text-muted-foreground flex-shrink-0" strokeWidth={1.5} />
                    <div className="inline-flex flex-col justify-center items-start">
                      <div className="text-muted-foreground text-sm font-normal leading-5 whitespace-nowrap">
                        {client.phone}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Category Column */}
                <div className="min-w-[180px] flex-[2] flex-shrink-0 px-6 py-2.5 flex justify-start items-center gap-3 overflow-hidden">
                  {getCategoryBadge(client.category)}
                </div>

                {/* Location Column */}
                <div className="min-w-[190px] flex-[2.5] flex-shrink-0 px-6 py-2.5 flex justify-start items-center gap-3 overflow-hidden">
                  <div className="flex-1 flex justify-start items-center gap-2 overflow-hidden">
                    <MapPin className="w-5 h-5 text-muted-foreground flex-shrink-0" strokeWidth={1.5} />
                    <div className="inline-flex flex-col justify-center items-start overflow-hidden">
                      <div className="text-muted-foreground text-sm font-normal leading-5 truncate w-full">
                        {client.location}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Gender Column */}
                <div className="min-w-[150px] flex-[1.5] flex-shrink-0 px-6 py-2.5 flex justify-start items-center gap-3 overflow-hidden">
                  <div className="flex justify-start items-center gap-2">
                    <User className="w-5 h-5 text-muted-foreground flex-shrink-0" strokeWidth={1.5} />
                    <div className="inline-flex flex-col justify-center items-start">
                      <div className="text-muted-foreground text-sm font-normal leading-5 whitespace-nowrap">
                        {client.gender}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Column */}
                <div className="min-w-[240px] flex-[3.5] flex-shrink-0 px-6 py-2.5 flex justify-start items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="px-2.5 py-1.5 h-auto rounded flex items-center gap-1 border-[#dddbda]"
                  >
                    <Phone className="h-3.5 w-3.5" strokeWidth={1.5} />
                    <span className="text-xs font-medium">Call</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="px-2.5 py-1.5 h-auto rounded flex items-center gap-1 border-[#dddbda]"
                  >
                    <Mail className="h-3.5 w-3.5" strokeWidth={1.5} />
                    <span className="text-xs font-medium">Mail</span>
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded transition-colors">
                        <MoreVertical className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem>Edit Client</DropdownMenuItem>
                      <DropdownMenuItem>Schedule Appointment</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">Delete Client</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pagination Controls - Single Line */}
        <div className="w-full flex items-center justify-center gap-6 pt-4">
          {/* Records info */}
          <div className="text-sm text-muted-foreground whitespace-nowrap">
            Showing <span className="font-medium text-foreground">{startIndex + 1}</span> to{' '}
            <span className="font-medium text-foreground">{Math.min(endIndex, totalRecords)}</span> of{' '}
            <span className="font-medium text-foreground">{totalRecords}</span> records
            {searchQuery && (
              <span className="ml-1">
                (filtered from {clients.length} total)
              </span>
            )}
          </div>

          {/* Records per page selector */}
          <div className="flex items-center gap-2 whitespace-nowrap">
            <span className="text-sm text-muted-foreground">Show</span>
            <Select value={recordsPerPage.toString()} onValueChange={handleRecordsPerPageChange}>
              <SelectTrigger className="w-[80px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">per page</span>
          </div>

          {/* Page navigation */}
          <Pagination>
            <PaginationContent>
              <PaginationPrevious
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              />

              {/* Show sliding window of 5 pages */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;

                // Logic to show relevant page numbers (sliding window)
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
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}

              <PaginationNext
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              />
            </PaginationContent>
          </Pagination>

          {/* Page info */}
          <div className="text-sm text-muted-foreground whitespace-nowrap">
            Page <span className="font-medium text-foreground">{currentPage}</span> of{' '}
            <span className="font-medium text-foreground">{totalPages}</span>
          </div>
        </div>
      </div>

      {/* Add Client Dialog */}
      <Dialog open={isAddClientDialogOpen} onOpenChange={setIsAddClientDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Client</DialogTitle>
            <DialogDescription>
              Enter basic client information. The client will receive a secure link to complete their registration.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">
                  First Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="firstName"
                  placeholder="John"
                  value={newClientData.firstName}
                  onChange={(e) => setNewClientData({ ...newClientData, firstName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">
                  Last Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="lastName"
                  placeholder="Doe"
                  value={newClientData.lastName}
                  onChange={(e) => setNewClientData({ ...newClientData, lastName: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                Email Address <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="john.doe@example.com"
                value={newClientData.email}
                onChange={(e) => setNewClientData({ ...newClientData, email: e.target.value })}
              />
            </div>

            <PhoneInput
              value={newClientData.phone}
              countryCode={newClientData.countryCode}
              onChange={(phone, code) => {
                setNewClientData({ ...newClientData, phone, countryCode: code });
              }}
              label="Phone Number"
              required
              id="phone"
            />

            <div className="flex items-start space-x-2 pt-2">
              <Checkbox
                id="sendLink"
                checked={sendRegistrationLink}
                onCheckedChange={(checked) => setSendRegistrationLink(checked as boolean)}
              />
              <div className="space-y-1">
                <Label htmlFor="sendLink" className="cursor-pointer">
                  Send registration link to client
                </Label>
                <p className="text-xs text-muted-foreground">
                  The client will receive a secure link via email to complete their profile with additional information (address, insurance, health history, etc.)
                </p>
              </div>
            </div>

            {sendRegistrationLink && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
                <Send className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-blue-800">
                  <strong>Registration Link Process:</strong>
                  <ol className="list-decimal list-inside mt-1 space-y-0.5">
                    <li>Client receives email with secure registration link</li>
                    <li>Client verifies identity via OTP (email or SMS)</li>
                    <li>Client completes comprehensive profile form</li>
                    <li>You'll be notified when registration is complete</li>
                  </ol>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddClientDialogOpen(false);
                setNewClientData({ firstName: '', lastName: '', email: '', phone: '', countryCode: '+1' });
                setSendRegistrationLink(true);
              }}
            >
              Cancel
            </Button>
            <Button
              className="bg-[#F97316] hover:bg-[#ea580c] text-white"
              onClick={handleAddClient}
            >
              Add Client
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}