import React, { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Checkbox } from './ui/checkbox';
import { Avatar, AvatarFallback } from './ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  Mail,
  Building2,
  Users,
  User,
  ClipboardList,
  Search,
  Command,
  SlidersHorizontal,
  ArrowUpDown,
  Phone,
  MapPin,
  MoreVertical,
  TrendingUp,
  ChevronDown
} from 'lucide-react';
import { UserRole } from '../types/appointment';

interface HomeViewProps {
  userRole: UserRole;
  userEmail: string;
  onNavigate: (tab: 'dashboard' | 'calendar' | 'clients' | 'notes' | 'messages' | 'tasks' | 'analytics' | 'settings') => void;
}

export function HomeView({ userRole, userEmail, onNavigate }: HomeViewProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data
  const statsData = [
    {
      icon: <Mail className="h-5 w-5 text-content-secondary" />,
      label: 'Sessions Sent',
      value: '1,251',
      unit: 'Sessions'
    },
    {
      icon: <Building2 className="h-5 w-5 text-content-secondary" />,
      label: 'Active Therapists',
      value: '43',
      unit: 'Therapists'
    },
    {
      icon: <Users className="h-5 w-5 text-content-secondary" />,
      label: 'Total Clients',
      value: '162',
      unit: 'Clients'
    },
    {
      icon: <ClipboardList className="h-5 w-5 text-content-secondary" />,
      label: 'Ongoing Sessions',
      value: '5',
      unit: 'Sessions'
    }
  ];

  const upcomingAgenda = [
    {
      id: '1',
      time: '11:00 - 12:00 Feb 2, 2025',
      title: 'Session with Client',
      description: 'This monthly progress session',
      badgeColor: 'bg-[#FED7AA] text-[#F97316]'
    },
    {
      id: '2',
      time: '14:00 - 15:00 Feb 2, 2025',
      title: 'Session with Client',
      description: 'This monthly progress session',
      badgeColor: 'bg-[#BFDBFE] text-[#3B82F6]'
    },
    {
      id: '3',
      time: '16:00 - 17:00 Feb 2, 2025',
      title: 'Session with Client',
      description: 'This monthly progress session',
      badgeColor: 'bg-[#DDD6FE] text-[#8B5CF6]'
    },
    {
      id: '4',
      time: '09:00 - 10:00 Feb 3, 2025',
      title: 'Session with Client',
      description: 'This monthly progress session',
      badgeColor: 'bg-[#FECACA] text-[#EF4444]'
    }
  ];

  // Chart data
  const chartData = [
    { month: 'Jan', value: 87 },
    { month: 'Feb', value: 53 },
    { month: 'Mar', value: 100 },
    { month: 'Apr', value: 73 },
    { month: 'May', value: 87 },
    { month: 'Jun', value: 47 },
    { month: 'Jul', value: 73 },
    { month: 'Aug', value: 60 },
    { month: 'Sep', value: 80 },
    { month: 'Oct', value: 60 },
    { month: 'Nov', value: 93 },
    { month: 'Dec', value: 73 }
  ];

  const maxChartValue = Math.max(...chartData.map(d => d.value));

  // People data
  const peopleData = [
    {
      id: '1',
      name: 'Robert Fox',
      email: 'robertfox@example.com',
      phone: '(671) 555-0110',
      category: 'Employee',
      categoryColor: 'bg-[#DDD6FE] text-[#8B5CF6]',
      location: 'Austin',
      gender: 'Male'
    },
    {
      id: '2',
      name: 'Cody Fisher',
      email: 'codyfisher@example.com',
      phone: '(505) 555-0125',
      category: 'Customers',
      categoryColor: 'bg-[#BFDBFE] text-[#3B82F6]',
      location: 'Orange',
      gender: 'Male'
    },
    {
      id: '3',
      name: 'Albert Flores',
      email: 'albertflores@example.com',
      phone: '(704) 555-0127',
      category: 'Customers',
      categoryColor: 'bg-[#BFDBFE] text-[#3B82F6]',
      location: 'Pembroke Pines',
      gender: 'Female'
    },
    {
      id: '4',
      name: 'Floyd Miles',
      email: 'floydmiles@example.com',
      phone: '(405) 555-0128',
      category: 'Employee',
      categoryColor: 'bg-[#DDD6FE] text-[#8B5CF6]',
      location: 'Fairfield',
      gender: 'Male'
    },
    {
      id: '5',
      name: 'Arlene McCoy',
      email: 'arlenemccoy@example.com',
      phone: '(219) 555-0114',
      category: 'Partners',
      categoryColor: 'bg-[#FED7AA] text-[#F97316]',
      location: 'Toledo',
      gender: 'Female'
    }
  ];

  // Companies data
  const companiesData = [
    {
      id: '1',
      name: 'Therapy Center North',
      industry: 'Mental Health',
      location: 'San Francisco, CA',
      status: 'Active',
      statusColor: 'bg-[#BFDBFE] text-[#3B82F6]',
      logo: '🏥'
    },
    {
      id: '2',
      name: 'Wellness Hub',
      industry: 'Counseling Services',
      location: 'Oakland, CA',
      status: 'Active',
      statusColor: 'bg-[#BFDBFE] text-[#3B82F6]',
      logo: '🧘'
    },
    {
      id: '3',
      name: 'Mindful Practice',
      industry: 'Psychology Clinic',
      location: 'Berkeley, CA',
      status: 'Active',
      statusColor: 'bg-[#BFDBFE] text-[#3B82F6]',
      logo: '🧠'
    },
    {
      id: '4',
      name: 'Recovery Center',
      industry: 'Addiction Treatment',
      location: 'San Jose, CA',
      status: 'Lead',
      statusColor: 'bg-[#FED7AA] text-[#F97316]',
      logo: '🌱'
    },
    {
      id: '5',
      name: 'Family Therapy Group',
      industry: 'Family Counseling',
      location: 'Palo Alto, CA',
      status: 'Lead',
      statusColor: 'bg-[#FED7AA] text-[#F97316]',
      logo: '👨‍👩‍👧‍👦'
    }
  ];

  return (
    <div className="h-full overflow-y-auto bg-white">
      {/* Main Content */}
      <div className="p-8 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-5">
          {statsData.map((stat, index) => (
            <Card key={index} className="border border-border rounded">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-1 bg-muted rounded">
                    {stat.icon}
                  </div>
                  <ChevronDown className="h-3 w-3 text-foreground" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <div className="flex items-center gap-3">
                    <p className="text-3xl text-foreground">{stat.value} <span className="text-base">{stat.unit}</span></p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Upcoming Agenda, Company Categories & Chart */}
        <div className="grid grid-cols-[264px_264px_1fr] gap-6">
          {/* Upcoming Agenda */}
          <Card className="border border-border rounded">
            <CardContent className="p-5 space-y-4">
              <h3 className="text-xl text-foreground">Upcoming Agenda</h3>
              <div className="space-y-4">
                {upcomingAgenda.map((item) => (
                  <div key={item.id} className="py-1 rounded space-y-2">
                    <div className={`px-1.5 py-1 ${item.badgeColor} rounded inline-flex text-xs`}>
                      {item.time}
                    </div>
                    <p className="text-sm text-foreground">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Company Categories Donut Chart */}
          <Card className="border border-border rounded">
            <CardContent className="p-5 space-y-4">
              <h3 className="text-xl text-foreground">Company Categories</h3>

              {/* Donut Chart */}
              <div className="relative h-52 w-52 mx-auto">
                <svg viewBox="0 0 216 216" className="transform -rotate-90">
                  {/* Background circle */}
                  <circle
                    cx="108"
                    cy="108"
                    r="86"
                    fill="none"
                    stroke="#D1D5DB"
                    strokeWidth="40"
                    opacity="0.1"
                  />

                  {/* Pie segments */}
                  <circle
                    cx="108"
                    cy="108"
                    r="86"
                    fill="none"
                    stroke="#1F2937"
                    strokeWidth="40"
                    strokeDasharray="189 540"
                    strokeDashoffset="0"
                  />
                  <circle
                    cx="108"
                    cy="108"
                    r="86"
                    fill="none"
                    stroke="#4B5563"
                    strokeWidth="40"
                    strokeDasharray="135 540"
                    strokeDashoffset="-189"
                  />
                  <circle
                    cx="108"
                    cy="108"
                    r="86"
                    fill="none"
                    stroke="#6B7280"
                    strokeWidth="40"
                    strokeDasharray="108 540"
                    strokeDashoffset="-324"
                  />
                  <circle
                    cx="108"
                    cy="108"
                    r="86"
                    fill="none"
                    stroke="#9CA3AF"
                    strokeWidth="40"
                    strokeDasharray="65 540"
                    strokeDashoffset="-432"
                  />
                  <circle
                    cx="108"
                    cy="108"
                    r="86"
                    fill="none"
                    stroke="#D1D5DB"
                    strokeWidth="40"
                    strokeDasharray="43 540"
                    strokeDashoffset="-497"
                  />

                  {/* Center white circle */}
                  <circle cx="108" cy="108" r="62" fill="white" />
                </svg>

                {/* Center text */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-lg text-foreground">341</p>
                    <p className="text-lg text-foreground">Companies</p>
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="space-y-1">
                <div className="flex items-center gap-4 px-3 py-1 rounded">
                  <div className="w-2 h-2 rounded-full bg-[#1F2937]"></div>
                  <span className="text-foreground">Therapy Centers</span>
                </div>
                <div className="flex items-center gap-4 px-3 py-1 rounded">
                  <div className="w-2 h-2 rounded-full bg-[#4B5563]"></div>
                  <span className="text-foreground">Counseling Services</span>
                </div>
                <div className="flex items-center gap-4 px-3 py-1 rounded">
                  <div className="w-2 h-2 rounded-full bg-[#6B7280]"></div>
                  <span className="text-foreground">Psychology Clinics</span>
                </div>
                <div className="flex items-center gap-4 px-3 py-1 rounded">
                  <div className="w-2 h-2 rounded-full bg-[#9CA3AF]"></div>
                  <span className="text-foreground">Addiction Treatment</span>
                </div>
                <div className="flex items-center gap-4 px-3 py-1 rounded">
                  <div className="w-2 h-2 rounded-full bg-[#D1D5DB]"></div>
                  <span className="text-foreground">Family Counseling</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Average Email Open Rate Chart */}
          <Card className="border border-border rounded">
            <CardContent className="p-5 space-y-4">
              <h3 className="text-xl text-foreground">Average Session Completion Rate</h3>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <p className="text-3xl text-foreground">64.23%</p>
                    <div className="px-2 py-1 bg-[#D1FAE5] rounded-[36px] flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-[#10B981]" />
                      <span className="text-xs text-[#10B981]">12%</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">Average Completion Rate</p>
                </div>
                <div className="flex gap-4">
                  <Button variant="outline" size="sm" className="rounded border-border">
                    January, 2023 - December, 2023
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                  <Button variant="outline" size="sm" className="rounded border-border">
                    Month
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>

              {/* Chart */}
              <div className="relative space-y-10">
                {/* Grid lines */}
                {[100, 75, 50, 25, 0].map((value) => (
                  <div key={value} className="flex items-center gap-8">
                    <span className="text-foreground w-12 text-right">{value}%</span>
                    <div className="flex-1 border-t border-border"></div>
                  </div>
                ))}

                {/* Bar Chart */}
                <div className="absolute inset-0 left-[80px] flex items-end justify-between gap-2 pb-6">
                  {chartData.map((data, index) => (
                    <div key={data.month} className="flex flex-col items-center gap-4 flex-1">
                      <div
                        className={`w-8 rounded ${index === 6 ? 'bg-foreground' : 'bg-muted'}`}
                        style={{ height: `${(data.value / maxChartValue) * 100}%` }}
                      ></div>
                      <span className="text-foreground">{data.month}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* People Table */}
        <Card className="border border-border rounded relative">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl text-foreground">People</h3>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-20 w-96 rounded border-border"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <div className="w-5 h-5 bg-muted rounded-sm flex items-center justify-center">
                      <Command className="h-3 w-3 text-muted-foreground" />
                    </div>
                    <div className="w-5 h-5 bg-muted rounded-sm flex items-center justify-center">
                      <span className="text-muted-foreground">F</span>
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="rounded border-border">
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  Sort By
                </Button>
                <Button variant="outline" size="sm" className="rounded border-border">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>

            {/* Table */}
            {/* Table Container - Responsive with horizontal scroll */}
            <div className="w-full bg-[#f9fafb] rounded border border-[#dddbda] overflow-x-auto">
              <div className="min-w-[1600px] w-full">
                {/* Table Header */}
                <div className="w-full bg-[#f9fafb] border-b border-[#dddbda] flex justify-start items-start gap-x-4">
                  <div className="min-w-[240px] flex-[3.5] flex-shrink-0 px-6 py-3 flex items-center gap-2">
                    <Checkbox />
                    <span className="text-sm text-muted-foreground">Name</span>
                    <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                  </div>
                  <div className="min-w-[280px] flex-[4.5] flex-shrink-0 px-6 py-3 flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Email</span>
                    <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                  </div>
                  <div className="min-w-[200px] flex-[2.5] flex-shrink-0 px-6 py-3 flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Phone</span>
                    <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                  </div>
                  <div className="min-w-[180px] flex-[2] flex-shrink-0 px-6 py-3 flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Category</span>
                    <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                  </div>
                  <div className="min-w-[190px] flex-[2.5] flex-shrink-0 px-6 py-3 flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Location</span>
                    <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                  </div>
                  <div className="min-w-[150px] flex-[1.5] flex-shrink-0 px-6 py-3 flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Gender</span>
                    <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                  </div>
                  <div className="min-w-[240px] flex-[3.5] flex-shrink-0 px-6 py-3">
                    <span className="text-sm text-muted-foreground">Action</span>
                  </div>
                </div>

                {/* Table Rows */}
                {peopleData.map((person, index) => (
                  <div
                    key={person.id}
                    className={`w-full bg-white ${index !== peopleData.length - 1 ? 'border-b border-[#dddbda]' : ''} flex justify-start items-start gap-x-4 hover:bg-gray-50 transition-colors`}
                  >
                    <div className="min-w-[240px] flex-[3.5] flex-shrink-0 px-6 py-2.5 flex items-center gap-3 overflow-hidden">
                      <Checkbox />
                      <div className="flex-1 flex items-center gap-2 overflow-hidden">
                        <Avatar className="w-6 h-6 flex-shrink-0">
                          <AvatarFallback className="text-xs bg-[#F97316] text-white">
                            {person.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 inline-flex flex-col justify-center items-start overflow-hidden">
                          <div className="text-[#0c0a09] text-sm truncate w-full">
                            {person.name}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="min-w-[280px] flex-[4.5] flex-shrink-0 px-6 py-2.5 flex items-center gap-3 overflow-hidden">
                      <div className="flex-1 flex items-center gap-2 overflow-hidden">
                        <Mail className="h-5 w-5 text-muted-foreground flex-shrink-0" strokeWidth={1.5} />
                        <div className="flex-1 inline-flex flex-col justify-center items-start overflow-hidden">
                          <div className="text-[#0c0a09] text-sm font-medium underline truncate w-full hover:text-[#F97316] cursor-pointer">
                            {person.email}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="min-w-[200px] flex-[2.5] flex-shrink-0 px-6 py-2.5 flex items-center gap-3 overflow-hidden">
                      <div className="flex items-center gap-2">
                        <Phone className="h-5 w-5 text-muted-foreground flex-shrink-0" strokeWidth={1.5} />
                        <div className="inline-flex flex-col justify-center items-start">
                          <div className="text-muted-foreground text-sm whitespace-nowrap">
                            {person.phone}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="min-w-[180px] flex-[2] flex-shrink-0 px-6 py-2.5 flex items-center gap-3 overflow-hidden">
                      <div className={`px-1.5 py-1 ${person.categoryColor} rounded inline-flex items-center`}>
                        <span className="text-xs font-medium">{person.category}</span>
                      </div>
                    </div>
                    <div className="min-w-[190px] flex-[2.5] flex-shrink-0 px-6 py-2.5 flex items-center gap-3 overflow-hidden">
                      <div className="flex-1 flex items-center gap-2 overflow-hidden">
                        <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0" strokeWidth={1.5} />
                        <div className="inline-flex flex-col justify-center items-start overflow-hidden">
                          <div className="text-muted-foreground text-sm truncate w-full">
                            {person.location}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="min-w-[150px] flex-[1.5] flex-shrink-0 px-6 py-2.5 flex items-center gap-3 overflow-hidden">
                      <div className="flex items-center gap-2">
                        <User className="h-5 w-5 text-muted-foreground flex-shrink-0" strokeWidth={1.5} />
                        <div className="inline-flex flex-col justify-center items-start">
                          <div className="text-muted-foreground text-sm whitespace-nowrap">
                            {person.gender}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="min-w-[240px] flex-[3.5] flex-shrink-0 px-6 py-2.5 flex items-center gap-2">
                      <Button variant="outline" size="sm" className="px-3 py-2 h-auto rounded flex items-center gap-1 border-[#dddbda]">
                        <Phone className="h-3.5 w-3.5" strokeWidth={1.5} />
                        <span className="text-xs font-medium">Call</span>
                      </Button>
                      <Button variant="outline" size="sm" className="px-3 py-2 h-auto rounded flex items-center gap-1 border-[#dddbda]">
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
                          <DropdownMenuItem>Edit Person</DropdownMenuItem>
                          <DropdownMenuItem>Send Message</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">Remove</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Companies Table - Full Width */}
        <Card className="border border-border rounded">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl text-foreground">Companies</h3>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Search"
                    className="pl-10 pr-20 w-96 rounded border-border"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <div className="w-5 h-5 bg-muted rounded-sm flex items-center justify-center">
                      <Command className="h-3 w-3 text-muted-foreground" />
                    </div>
                    <div className="w-5 h-5 bg-muted rounded-sm flex items-center justify-center">
                      <span className="text-muted-foreground">F</span>
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="rounded border-border">
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  Sort By
                </Button>
                <Button variant="outline" size="sm" className="rounded border-border">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>

            {/* Table Container - Responsive with horizontal scroll */}
            <div className="w-full bg-[#f9fafb] rounded border border-[#dddbda] overflow-x-auto">
              <div className="min-w-[1400px] w-full">
                {/* Table Header */}
                <div className="w-full bg-[#f9fafb] border-b border-[#dddbda] flex justify-start items-start gap-x-4">
                  <div className="min-w-[320px] flex-[4] flex-shrink-0 px-6 py-3 flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Companies Name</span>
                    <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                  </div>
                  <div className="min-w-[280px] flex-[3.5] flex-shrink-0 px-6 py-3 flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Industry</span>
                    <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                  </div>
                  <div className="min-w-[280px] flex-[3.5] flex-shrink-0 px-6 py-3 flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Location</span>
                    <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                  </div>
                  <div className="min-w-[200px] flex-[2] flex-shrink-0 px-6 py-3 flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                  </div>
                </div>

                {/* Table Rows */}
                {companiesData.map((company, index) => (
                  <div
                    key={company.id}
                    className={`w-full bg-white ${index !== companiesData.length - 1 ? 'border-b border-[#dddbda]' : ''} flex justify-start items-start gap-x-4 hover:bg-gray-50 transition-colors`}
                  >
                    <div className="min-w-[320px] flex-[4] flex-shrink-0 px-6 py-2.5 flex items-center gap-3 overflow-hidden">
                      <div className="w-7 h-7 bg-muted rounded flex items-center justify-center text-lg flex-shrink-0">
                        {company.logo}
                      </div>
                      <span className="text-sm text-foreground truncate flex-1">{company.name}</span>
                    </div>
                    <div className="min-w-[280px] flex-[3.5] flex-shrink-0 px-6 py-2.5 flex items-center overflow-hidden">
                      <span className="text-sm text-muted-foreground truncate w-full">{company.industry}</span>
                    </div>
                    <div className="min-w-[280px] flex-[3.5] flex-shrink-0 px-6 py-2.5 flex items-center gap-2 overflow-hidden">
                      <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0" strokeWidth={1.5} />
                      <span className="text-sm text-muted-foreground truncate flex-1">{company.location}</span>
                    </div>
                    <div className="min-w-[200px] flex-[2] flex-shrink-0 px-6 py-2.5 flex items-center overflow-hidden">
                      <div className={`px-2 py-1 ${company.statusColor} rounded-[36px] inline-flex items-center gap-2 text-xs`}>
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${company.status === 'Active' ? 'bg-[#3B82F6]' : 'bg-[#F97316]'}`}></div>
                        <span className="whitespace-nowrap">{company.status}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default HomeView;
