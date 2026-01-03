import React, { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Input } from './ui/input';
import { StatusDot } from './ui/status-dot';
import { Tag } from './ui/tag';
import { Checkbox } from './ui/checkbox';
import { SearchBar } from './ui/search-bar';
import { 
  CalendarDays, 
  Users, 
  ClipboardList, 
  FileText, 
  ChevronRight, 
  Search,
  Bell,
  ChevronDown,
  Mail,
  Phone,
  MapPin,
  MoreVertical,
  Calendar as CalendarIcon,
  User as UserIcon,
  TrendingUp
} from 'lucide-react';
import { UserRole } from '../types/appointment';
import { BedrockLogo } from '../imports/BedrockLogo';

interface DashboardViewProps {
  userRole: UserRole;
  userEmail: string;
  onNavigate: (tab: 'dashboard' | 'calendar' | 'clients' | 'notes' | 'messages' | 'tasks' | 'analytics' | 'settings') => void;
}

// Get user name from email
const getUserName = (email: string) => {
  const name = email.split('@')[0];
  return name.split('.').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
};

export function DashboardView({ userRole, userEmail, onNavigate }: DashboardViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const userName = getUserName(userEmail);

  // Mock data adapted for wellness system
  const statsData = [
    {
      icon: <CalendarDays className="h-6 w-6" />,
      label: 'Sessions Completed',
      value: '1,251 Sessions',
      bgColor: 'bg-[#f2f2f2]'
    },
    {
      icon: <Users className="h-6 w-6" />,
      label: 'Active Clients',
      value: '43 Clients',
      bgColor: 'bg-[#f2f2f2]'
    },
    {
      icon: <ClipboardList className="h-6 w-6" />,
      label: 'Total Appointments',
      value: '162 Scheduled',
      bgColor: 'bg-[#f2f2f2]'
    },
    {
      icon: <FileText className="h-6 w-6" />,
      label: 'Pending Notes',
      value: '5 Notes',
      bgColor: 'bg-[#f2f2f2]'
    }
  ];

  const upcomingAgenda = [
    {
      id: '1',
      time: '10:00 - 11:00 Feb 2, 2025',
      title: 'Session with Client',
      description: 'This monthly progress agenda',
      color: 'bg-[#F97316]'
    },
    {
      id: '2',
      time: '14:00 - 15:00 Feb 2, 2025',
      title: 'Session with Client',
      description: 'This monthly progress agenda',
      color: 'bg-[#4B4B4B]'
    },
    {
      id: '3',
      time: '16:00 - 17:00 Feb 2, 2025',
      title: 'Session with Client',
      description: 'This monthly progress agenda',
      color: 'bg-[#727272]'
    },
    {
      id: '4',
      time: '09:00 - 10:00 Feb 3, 2025',
      title: 'Session with Client',
      description: 'This monthly progress agenda',
      color: 'bg-[#AFAFAF]'
    }
  ];

  const chartData = [
    { month: 'Jan', rate: 90 },
    { month: 'Feb', rate: 55 },
    { month: 'Mar', rate: 100 },
    { month: 'Apr', rate: 72 },
    { month: 'May', rate: 86 },
    { month: 'Jun', rate: 49 },
    { month: 'Jul', rate: 74 },
    { month: 'Aug', rate: 58 },
    { month: 'Sep', rate: 82 },
    { month: 'Oct', rate: 64 },
    { month: 'Nov', rate: 95 },
    { month: 'Dec', rate: 74 }
  ];

  const peopleData = [
    {
      id: '1',
      name: 'Robert Fox',
      email: 'robertfox@example.com',
      phone: '(671) 555-0110',
      category: 'Therapist',
      categoryColor: 'bg-[#F8E7F0] text-[#C13584]',
      location: 'Austin',
      gender: 'Male'
    },
    {
      id: '2',
      name: 'Cody Fisher',
      email: 'codyfisher@example.com',
      phone: '(505) 555-0125',
      category: 'Client',
      categoryColor: 'bg-[#E0F2FE] text-[#0284C7]',
      location: 'Orange',
      gender: 'Male'
    },
    {
      id: '3',
      name: 'Albert Flores',
      email: 'albertflores@example.com',
      phone: '(704) 555-0127',
      category: 'Client',
      categoryColor: 'bg-[#E0F2FE] text-[#0284C7]',
      location: 'Panthersville',
      gender: 'Female'
    },
    {
      id: '4',
      name: 'Floyd Miles',
      email: 'floydmiles@example.com',
      phone: '(405) 555-0128',
      category: 'Therapist',
      categoryColor: 'bg-[#F8E7F0] text-[#C13584]',
      location: 'Fairfield',
      gender: 'Male'
    },
    {
      id: '5',
      name: 'Arlene McCoy',
      email: 'arlenemccoy@example.com',
      phone: '(219) 555-0114',
      category: 'Admin',
      categoryColor: 'bg-[#FEF3C7] text-[#D97706]',
      location: 'Toledo',
      gender: 'Female'
    }
  ];

  const therapistsData = [
    {
      id: '1',
      name: 'Dr. Sarah Chen',
      specialty: 'Clinical Psychology',
      location: 'San Francisco, CA',
      status: 'Active',
      statusColor: 'bg-black'
    },
    {
      id: '2',
      name: 'Dr. Michael Roberts',
      specialty: 'Trauma Therapy',
      location: 'Oakland, CA',
      status: 'Active',
      statusColor: 'bg-black'
    },
    {
      id: '3',
      name: 'Dr. Emily Thompson',
      specialty: 'Family Counseling',
      location: 'Berkeley, CA',
      status: 'Active',
      statusColor: 'bg-black'
    },
    {
      id: '4',
      name: 'Dr. James Wilson',
      specialty: 'Addiction Therapy',
      location: 'San Jose, CA',
      status: 'Lead',
      statusColor: 'bg-[#F97316]'
    },
    {
      id: '5',
      name: 'Dr. Maria Garcia',
      specialty: 'Art Therapy',
      location: 'Palo Alto, CA',
      status: 'Lead',
      statusColor: 'bg-[#F97316]'
    }
  ];

  const categoryData = [
    { name: 'Individual Therapy', color: 'black', percentage: 35 },
    { name: 'Group Therapy', color: '#4B4B4B', percentage: 25 },
    { name: 'Family Therapy', color: '#727272', percentage: 20 },
    { name: 'EMDR Sessions', color: '#AFAFAF', percentage: 12 },
    { name: 'Art Therapy', color: '#D8D8D8', percentage: 8 }
  ];

  return (
    <div className="h-full overflow-y-auto bg-[#F9F9F9]">
      {/* Main Content */}
      <div className="flex flex-col">
        {/* Top Header */}
        <div className="bg-white border-b border-[#e4e4e4] px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4 flex-1">
            <div className="flex-1 max-w-md">
              <SearchBar
                placeholder="Search"
                value={searchQuery}
                onValueChange={setSearchQuery}
                showKeyboardShortcut
                containerClassName="border-[#e4e4e4] rounded-full"
              />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-[#F97316] rounded-full"></span>
            </Button>
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-[#F97316] text-white">
                  {userName.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium text-sm">{userName}</span>
              <ChevronDown className="h-4 w-4 text-[#AFAFAF]" />
            </div>
          </div>
        </div>

        {/* Section Header */}
        <div className="bg-white border-b border-[#e4e4e4] px-8 py-4">
          <h1 className="text-black">Dashboard</h1>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-5">
            {statsData.map((stat, index) => (
              <Card key={index} className="border border-[#e4e4e4] rounded bg-white">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`${stat.bgColor} p-1 rounded`}>
                      {stat.icon}
                    </div>
                    <ChevronRight className="h-4 w-4 text-[#AFAFAF]" />
                  </div>
                  <div>
                    <p className="text-sm text-[#727272] mb-1">{stat.label}</p>
                    <p className="text-black">{stat.value}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Upcoming Agenda & Chart */}
          <div className="grid grid-cols-[264px_1fr] gap-6">
            {/* Upcoming Agenda */}
            <Card className="border border-[#e4e4e4] rounded bg-white">
              <CardContent className="p-5 space-y-4">
                <h3 className="text-black">Upcoming Agenda</h3>
                <div className="space-y-4">
                  {upcomingAgenda.map((item) => (
                    <div key={item.id} className="py-1 space-y-2">
                      <div className={`${item.color} h-1.5 w-16 rounded-full`}></div>
                      <p className="font-medium text-sm text-black">{item.title}</p>
                      <p className="text-xs text-[#727272]">{item.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Average Session Completion Rate Chart */}
            <Card className="border border-[#e4e4e4] rounded-lg bg-white">
              <CardContent className="p-5 space-y-4">
                <h3 className="text-black">Average Session Completion Rate</h3>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <p className="text-black text-3xl">64.23%</p>
                      <Badge variant="green-square" size="sm">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        +18%
                      </Badge>
                    </div>
                    <p className="text-sm text-[#727272]">Average Completion Rate</p>
                  </div>
                  <div className="flex gap-4">
                    <Button variant="outline" size="sm" className="rounded border-[#e4e4e4]">
                      January, 2023 - December, 2023
                    </Button>
                    <Button variant="outline" size="sm" className="rounded border-[#e4e4e4]">
                      Month
                    </Button>
                  </div>
                </div>

                {/* Chart Grid Lines */}
                <div className="space-y-10 relative">
                  {[100, 75, 50, 25, 0].map((value) => (
                    <div key={value} className="flex items-center gap-8">
                      <span className="text-black w-10 text-right">{value}%</span>
                      <div className="flex-1 border-t border-dashed border-[#AFAFAF]"></div>
                    </div>
                  ))}

                  {/* Bar Chart */}
                  <div className="absolute inset-0 left-[72px] flex items-end justify-between px-2 pb-6">
                    {chartData.map((data, index) => (
                      <div key={data.month} className="flex flex-col items-center gap-4" style={{ height: '100%', justifyContent: 'flex-end' }}>
                        <div 
                          className={`w-8 rounded ${index === 6 ? 'bg-black' : 'bg-[#d8d8d8]'}`}
                          style={{ height: `${data.rate}%` }}
                        ></div>
                        <span className="text-black">{data.month}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* People Table */}
          <Card className="border border-[#e4e4e4] rounded-lg bg-white">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-black">People</h3>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#AFAFAF]" />
                    <Input 
                      placeholder="Search" 
                      className="pl-10 w-64 border-[#e4e4e4] rounded"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs text-[#AFAFAF]">
                      <span className="px-1 border border-[#e4e4e4] rounded text-[10px]">⌘</span>
                      <span className="px-1 border border-[#e4e4e4] rounded text-[10px]">F</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="rounded border-[#e4e4e4]">
                    Sort By
                  </Button>
                  <Button variant="outline" size="sm" className="rounded border-[#e4e4e4]">
                    Filter
                  </Button>
                </div>
              </div>

              {/* Table */}
              <div className="space-y-3">
                {/* Table Header */}
                <div className="flex items-center gap-4 pb-3 border-b border-[#e4e4e4]">
                  <div className="w-5">
                    <Checkbox />
                  </div>
                  <div className="flex-1 text-sm text-[#AFAFAF] font-normal">NAME</div>
                  <div className="w-48 text-sm text-[#AFAFAF] font-normal">EMAIL</div>
                  <div className="w-32 text-sm text-[#AFAFAF] font-normal">PHONE</div>
                  <div className="w-32 text-sm text-[#AFAFAF] font-normal">CATEGORY</div>
                  <div className="w-32 text-sm text-[#AFAFAF] font-normal">LOCATION</div>
                  <div className="w-24 text-sm text-[#AFAFAF] font-normal">GENDER</div>
                  <div className="w-32 text-sm text-[#AFAFAF] font-normal">ACTION</div>
                </div>

                {/* Table Rows */}
                {peopleData.map((person) => (
                  <div key={person.id} className="flex items-center gap-4 py-2">
                    <div className="w-5">
                      <Checkbox />
                    </div>
                    <div className="flex-1 flex items-center gap-3">
                      <Avatar 
                        className="h-8 w-8"
                        status={person.category === 'Therapist' ? 'online' : person.category === 'Client' ? 'away' : 'offline'}
                      >
                        <AvatarFallback className="bg-[#F97316] text-white text-sm">
                          {person.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-black font-medium">{person.name}</span>
                    </div>
                    <div className="w-48 text-sm text-[#727272] flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {person.email}
                    </div>
                    <div className="w-32 text-sm text-[#727272] flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {person.phone}
                    </div>
                    <div className="w-32 flex items-center gap-2">
                      {person.category === 'Therapist' && <StatusDot variant="purple" />}
                      {person.category === 'Client' && <StatusDot variant="blue" />}
                      {person.category === 'Admin' && <StatusDot variant="orange" />}
                      <Badge 
                        variant={
                          person.category === 'Therapist' ? 'purple-square' :
                          person.category === 'Client' ? 'blue-square' :
                          'orange-square'
                        }
                        size="sm"
                      >
                        {person.category}
                      </Badge>
                    </div>
                    <div className="w-32 text-sm text-[#727272] flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {person.location}
                    </div>
                    <div className="w-24 text-sm text-[#727272] flex items-center gap-2">
                      <UserIcon className="h-4 w-4" />
                      {person.gender}
                    </div>
                    <div className="w-32 flex items-center gap-2">
                      <Button variant="outline" size="sm" className="rounded-full border-[#e4e4e4] text-xs">
                        Call
                      </Button>
                      <Button variant="outline" size="sm" className="rounded-full border-[#e4e4e4] text-xs">
                        Message
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Therapists & Session Categories */}
          <div className="grid grid-cols-[1fr_264px] gap-6">
            {/* Therapists Table */}
            <Card className="border border-[#e4e4e4] rounded-lg bg-white">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-black">Therapists</h3>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#AFAFAF]" />
                      <Input 
                        placeholder="Search" 
                        className="pl-10 w-48 border-[#e4e4e4] rounded"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs text-[#AFAFAF]">
                        <span className="px-1 border border-[#e4e4e4] rounded text-[10px]">⌘</span>
                        <span className="px-1 border border-[#e4e4e4] rounded text-[10px]">F</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="rounded border-[#e4e4e4]">
                      Sort By
                    </Button>
                    <Button variant="outline" size="sm" className="rounded border-[#e4e4e4]">
                      Filter
                    </Button>
                  </div>
                </div>

                {/* Table */}
                <div className="space-y-3">
                  {/* Table Header */}
                  <div className="flex items-center gap-4 pb-3 border-b border-[#e4e4e4]">
                    <div className="w-5">
                      <Checkbox />
                    </div>
                    <div className="flex-1 text-sm text-[#AFAFAF] font-normal">THERAPIST NAME</div>
                    <div className="w-48 text-sm text-[#AFAFAF] font-normal">SPECIALTY</div>
                    <div className="w-48 text-sm text-[#AFAFAF] font-normal">LOCATION</div>
                    <div className="w-24 text-sm text-[#AFAFAF] font-normal">STATUS</div>
                  </div>

                  {/* Table Rows */}
                  {therapistsData.map((therapist) => (
                    <div key={therapist.id} className="flex items-center gap-4 py-2">
                      <div className="w-5">
                        <Checkbox />
                      </div>
                      <div className="flex-1 flex items-center gap-3">
                        <Avatar 
                          className="h-8 w-8"
                          status={therapist.status === 'Active' ? 'online' : 'busy'}
                        >
                          <AvatarFallback className="bg-[#F97316] text-white text-sm">
                            {therapist.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-black font-medium">{therapist.name}</span>
                      </div>
                      <div className="w-48 text-sm text-[#727272]">{therapist.specialty}</div>
                      <div className="w-48 text-sm text-[#727272] flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {therapist.location}
                      </div>
                      <div className="w-24">
                        <Badge 
                          variant={therapist.status === 'Lead' ? 'orange' : 'neutral'}
                          dot
                          size="sm"
                        >
                          {therapist.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Session Categories Pie Chart */}
            <Card className="border border-[#e4e4e4] rounded-lg bg-white">
              <CardContent className="p-5 space-y-4">
                <h3 className="text-black">Session Categories</h3>
                
                {/* Pie Chart */}
                <div className="relative h-[216px] w-[216px] mx-auto">
                  <svg viewBox="0 0 216 216" className="transform -rotate-90">
                    {/* Background circle */}
                    <circle cx="108" cy="108" r="86.176" fill="none" stroke="#D8D8D8" strokeWidth="40" opacity="0.1" />
                    
                    {/* Pie segments */}
                    <circle cx="108" cy="108" r="86.176" fill="none" stroke="black" strokeWidth="40" 
                      strokeDasharray={`${35 * 5.41} ${100 * 5.41}`} strokeDashoffset="0" />
                    <circle cx="108" cy="108" r="86.176" fill="none" stroke="#4B4B4B" strokeWidth="40" 
                      strokeDasharray={`${25 * 5.41} ${100 * 5.41}`} strokeDashoffset={`${-35 * 5.41}`} />
                    <circle cx="108" cy="108" r="86.176" fill="none" stroke="#727272" strokeWidth="40" 
                      strokeDasharray={`${20 * 5.41} ${100 * 5.41}`} strokeDashoffset={`${-(35 + 25) * 5.41}`} />
                    <circle cx="108" cy="108" r="86.176" fill="none" stroke="#AFAFAF" strokeWidth="40" 
                      strokeDasharray={`${12 * 5.41} ${100 * 5.41}`} strokeDashoffset={`${-(35 + 25 + 20) * 5.41}`} />
                    <circle cx="108" cy="108" r="86.176" fill="none" stroke="#D8D8D8" strokeWidth="40" 
                      strokeDasharray={`${8 * 5.41} ${100 * 5.41}`} strokeDashoffset={`${-(35 + 25 + 20 + 12) * 5.41}`} />
                    
                    {/* Center white circle */}
                    <circle cx="108" cy="108" r="61.554" fill="white" />
                  </svg>
                  
                  {/* Center text */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-black font-medium">341</p>
                      <p className="text-black font-medium">Sessions</p>
                    </div>
                  </div>
                </div>

                {/* Legend */}
                <div className="space-y-1">
                  {categoryData.map((category, index) => (
                    <div key={index} className="flex items-center gap-4 px-3 py-1 rounded hover:bg-gray-50">
                      <div 
                        className="w-2 h-2 rounded-full" 
                        style={{ backgroundColor: category.color }}
                      ></div>
                      <span className="text-black">{category.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardView;