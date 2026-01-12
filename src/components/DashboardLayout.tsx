import React, { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Broadcast, Invoice, Ticket, Wallet } from '@phosphor-icons/react';
import { CalendarContainer } from './CalendarContainer';
import { HomeView } from './HomeView';
import { TherapistHomeView } from './TherapistHomeView';
import { AdminDashboardView } from './AdminDashboardView';
import { SuperAdminDashboardView } from './SuperAdminDashboardView';
import { OrganizationManagementView } from './OrganizationManagementView';
import { ProfessionalClientsView } from './ProfessionalClientsView';
import { EnhancedClientsTable } from './EnhancedClientsTable';
import { EnhancedTherapistsTable } from './EnhancedTherapistsTable';
import { QuickNotesView } from './QuickNotesView';
import { TasksView } from './TasksView';
import { MessagesView } from './MessagesView';
import { SettingsView } from './SettingsView';
import { SettingsSidebar } from './SettingsSidebar';
import { ReportsView } from './ReportsView';
import { ClientDashboardView } from './ClientDashboardView';
import TherapistVerificationView from './TherapistVerificationView';
import { BedrockLogo } from '../imports/BedrockLogo';
import { UserRole, Notification } from '../types/appointment';
import { Toaster } from './ui/sonner';

import {
  LayoutDashboard,
  Calendar,
  Users,
  MessageSquare,
  CheckSquare,
  FileText,
  BarChart3,
  Settings,
  Bell,
  Search,
  ChevronDown,
  LogOut,
  User,
  HelpCircle,
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  UserCog,
  Building2,
  Mail,
  ShieldCheck
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { ScrollArea } from './ui/scroll-area';
import { Input } from './ui/input';
import { SearchBar } from './ui/search-bar';
import { GlobalSearchBar } from './GlobalSearchBar';
import { Separator } from './ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { motion, AnimatePresence } from 'framer-motion';

interface DashboardLayoutProps {
  userRole: UserRole;
  currentUserId: string;
  userEmail: string;
  userName?: string; // User's display name (from Firebase or extracted from email)
  onLogout: () => void;
  notifications: Notification[];
  onMarkNotificationAsRead: (notificationId: string) => void;
  onMarkAllNotificationsAsRead: () => void;
}

type TabType = 'dashboard' | 'calendar' | 'clients' | 'therapists' | 'therapist-verification' | 'notes' | 'messages' | 'tasks' | 'analytics' | 'settings' | 'organizations' | 'video-rooms' | 'broadcast' | 'support-tickets' | 'billing' | 'invoices' | 'payments' | 'plans' | 'feature-flags' | 'integrations' | 'system-settings' | 'user-management' | 'email-templates' | 'compliance' | 'logs' | 'data-explorer' | 'api-monitoring';

export function DashboardLayout({ userRole, currentUserId, userEmail, userName, onLogout, notifications, onMarkNotificationAsRead, onMarkAllNotificationsAsRead }: DashboardLayoutProps) {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [activeSettingsTab, setActiveSettingsTab] = useState<string>('apps'); // Settings sub-navigation
  const [showSettingsNav, setShowSettingsNav] = useState(false); // Track if settings navigation is visible
  const [notificationPopoverOpen, setNotificationPopoverOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [triggerNewAppointment, setTriggerNewAppointment] = useState(0); // Counter to trigger appointment form
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'Overview': true,
    'Core Management': true,
    'Communication': true,
    'Billing': true,
    'Data & Intelligence': true,
  });

  // Clear search when switching tabs
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);

    // Show settings navigation if switching to settings
    if (tab === 'settings') {
      setShowSettingsNav(true);
    } else {
      setShowSettingsNav(false);
    }

    if (tab !== 'calendar') {
      setSearchQuery('');
    }
  };

  // Handle back from settings navigation
  const handleBackFromSettings = () => {
    setShowSettingsNav(false);
    setActiveTab('dashboard');
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationClick = (notification: Notification) => {
    onMarkNotificationAsRead(notification.id);
    if (notification.type === 'message') {
      handleTabChange('messages');
      setNotificationPopoverOpen(false);
    }
  };

  // Handle global search result click for Admin and Super Admin
  const handleGlobalSearchResult = (result: any) => {
    switch (result.category) {
      case 'organizations':
        if (userRole === 'superadmin' || userRole === 'super_admin') {
          handleTabChange('organizations');
        }
        break;
      case 'therapists':
        handleTabChange('therapists');
        break;
      case 'clients':
        handleTabChange('clients');
        break;
      case 'users':
        if (userRole === 'superadmin' || userRole === 'super_admin') {
          handleTabChange('user-management');
        }
        break;
      default:
        // Default handling
        if (result.category === 'messages') handleTabChange('messages');
        if (result.category === 'tasks') handleTabChange('tasks');
        if (result.category === 'appointments') handleTabChange('calendar');
        if (result.category === 'notes') handleTabChange('notes');
        break;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getInitials = (email: string) => {
    const name = email.split('@')[0];
    return name.split('.').map(part => part[0]).join('').toUpperCase().slice(0, 2);
  };

  const getUserName = (email: string) => {
    const name = email.split('@')[0];
    return name.split('.').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
  };

  // Navigation structure - conditional based on user role
  const getSuperAdminNavigation = () => [
    {
      section: 'Overview',
      items: [
        { id: 'dashboard' as TabType, label: 'Dashboard', icon: LayoutDashboard },
      ]
    },
    {
      section: 'Core Management',
      items: [
        { id: 'organizations' as TabType, label: 'Organizations', icon: Building2 },
        { id: 'therapists' as TabType, label: 'Providers / Therapists', icon: UserCog },
        { id: 'therapist-verification' as TabType, label: 'Therapist Verification', icon: ShieldCheck },
        { id: 'clients' as TabType, label: 'Clients', icon: Users },
        { id: 'video-rooms' as TabType, label: 'Video Rooms', icon: Calendar },
      ]
    },
    {
      section: 'Communication',
      items: [
        { id: 'messages' as TabType, label: 'Messages', icon: MessageSquare, badge: unreadCount > 0 ? unreadCount : undefined },
        { id: 'broadcast' as TabType, label: 'Broadcast Notices', icon: Broadcast },
        { id: 'support-tickets' as TabType, label: 'Support Tickets', icon: Ticket },
      ]
    },
    {
      section: 'Billing',
      items: [
        { id: 'billing' as TabType, label: 'Billing & Subscriptions', icon: FileText },
        { id: 'invoices' as TabType, label: 'Invoices', icon: Invoice },
        { id: 'payments' as TabType, label: 'Payments', icon: Wallet },
        { id: 'plans' as TabType, label: 'Plans & Pricing', icon: FileText },
      ]
    },
    {
      section: 'Data & Intelligence',
      items: [
        { id: 'analytics' as TabType, label: 'Analytics & Metrics', icon: BarChart3 },
        { id: 'logs' as TabType, label: 'Logs & Audit Trails', icon: FileText },
        { id: 'data-explorer' as TabType, label: 'Data Explorer', icon: Search },
        { id: 'api-monitoring' as TabType, label: 'API Usage & Monitoring', icon: BarChart3 },
      ]
    },
  ];

  const getStandardNavigation = () => [
    {
      section: '',
      items: [
        { id: 'dashboard' as TabType, label: 'Home', icon: LayoutDashboard },
        { id: 'calendar' as TabType, label: 'Appointments', icon: Calendar },
        { id: 'clients' as TabType, label: 'Clients', icon: Users },
        ...(userRole === 'admin' ? [{ id: 'therapists' as TabType, label: 'Therapists', icon: UserCog }] : []),
        { id: 'messages' as TabType, label: 'Messages', icon: MessageSquare, badge: unreadCount > 0 ? unreadCount : undefined },
        { id: 'tasks' as TabType, label: 'Tasks', icon: CheckSquare },
        { id: 'notes' as TabType, label: 'Notes', icon: FileText },
        { id: 'analytics' as TabType, label: 'Analytics', icon: BarChart3 },
      ]
    },
  ];

  const getClientNavigation = () => [
    {
      section: '',
      items: [
        { id: 'dashboard' as TabType, label: 'Home', icon: LayoutDashboard },
        { id: 'calendar' as TabType, label: 'My Appointments', icon: Calendar },
        { id: 'messages' as TabType, label: 'Messages', icon: MessageSquare, badge: unreadCount > 0 ? unreadCount : undefined },
        { id: 'notes' as TabType, label: 'Journal & Notes', icon: FileText },
        { id: 'tasks' as TabType, label: 'My Tasks', icon: CheckSquare },
      ]
    },
  ];

  const navigationSections = (userRole === 'superadmin' || userRole === 'super_admin')
    ? getSuperAdminNavigation()
    : userRole === 'client'
      ? getClientNavigation()
      : getStandardNavigation();

  const toggleSection = (sectionName: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }));
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'message': return <MessageSquare className="h-4 w-4" />;
      case 'appointment': return <Calendar className="h-4 w-4" />;
      case 'reminder': return <Bell className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'message': return 'bg-blue-500';
      case 'appointment': return 'bg-emerald-500';
      case 'reminder': return 'bg-amber-500';
      case 'cancellation': return 'bg-rose-500';
      default: return 'bg-slate-500';
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <TooltipProvider delayDuration={300}>
        <div className="flex h-screen bg-background overflow-hidden font-sans">
          {/* Left Sidebar - Premium Glass/Hybrid Design */}
          <aside className={`${sidebarCollapsed ? 'w-20' : 'w-64'} bg-sidebar border-r border-sidebar-border flex flex-col shrink-0 transition-all duration-300 z-20`}>
            {/* Logo Header */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
              {!sidebarCollapsed && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl shadow-lg shadow-indigo-200">
                    <BedrockLogo variant="icon" className="text-white w-8 h-8" />
                  </div>
                  <span className="text-foreground font-bold text-lg tracking-tight ml-2">Ataraxia</span>
                </motion.div>
              )}
              {sidebarCollapsed && (
                <div className="mx-auto">
                  <div className="p-2 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl shadow-lg shadow-indigo-200">
                    <BedrockLogo variant="icon" className="w-8 h-8 text-white" />
                  </div>
                </div>
              )}
            </div>

            {/* Navigation */}
            {showSettingsNav ? (
              <SettingsSidebar
                activeSettingsTab={activeSettingsTab}
                onSettingsTabChange={setActiveSettingsTab}
                onBack={handleBackFromSettings}
                collapsed={sidebarCollapsed}
                userRole={userRole}
              />
            ) : (
              <>
                <div className="flex-1 overflow-hidden px-4 py-6">
                  <div className="h-full overflow-y-auto scrollbar-hide">
                    <nav className="space-y-6">
                      {navigationSections.map((section, sectionIndex) => (
                        <div key={section.section || sectionIndex}>
                          {!sidebarCollapsed && section.section && (
                            <button
                              onClick={() => toggleSection(section.section)}
                              className="w-full flex items-center justify-between text-[11px] uppercase font-bold text-muted-foreground px-3 mb-3 tracking-widest hover:text-indigo-600 transition-colors"
                            >
                              <span>{section.section}</span>
                              <ChevronRight className={`h-3 w-3 transition-transform duration-300 ${expandedSections[section.section] ? 'rotate-90' : ''}`} />
                            </button>
                          )}
                          {(expandedSections[section.section] || !section.section) && (
                            <div className="space-y-1">
                              {section.items.map((item) => {
                                const Icon = item.icon;
                                const isActive = activeTab === item.id;

                                return (
                                  <Tooltip key={item.id} disabled={!sidebarCollapsed}>
                                    <TooltipTrigger asChild>
                                      <button
                                        onClick={() => handleTabChange(item.id)}
                                        className={`
                                            w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-start gap-3'} 
                                            px-3 h-10 rounded-lg transition-all duration-200 group relative select-none
                                            ${isActive
                                            ? 'bg-sidebar-accent text-sidebar-primary'
                                            : 'text-muted-foreground hover:bg-sidebar-accent/80 hover:text-foreground'
                                          }
                                          `}
                                      >
                                        <Icon
                                          className={`h-5 w-5 shrink-0 ${isActive ? 'text-orange-600 dark:text-orange-400' : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300'} transition-colors`}
                                          strokeWidth={isActive ? 2.5 : 2}
                                        />

                                        {!sidebarCollapsed && (
                                          <span className={`flex-1 text-left text-sm ${isActive ? 'font-semibold tracking-tight' : 'font-medium'}`}>
                                            {item.label}
                                          </span>
                                        )}

                                        {/* Badges */}
                                        {item.badge && !sidebarCollapsed && (
                                          <Badge className={`h-5 px-1.5 min-w-[20px] justify-center ${isActive ? 'bg-white text-black' : 'bg-rose-500 text-white'}`}>
                                            {item.badge}
                                          </Badge>
                                        )}
                                        {item.badge && sidebarCollapsed && (
                                          <div className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-rose-500 border-2 border-white" />
                                        )}
                                      </button>
                                    </TooltipTrigger>
                                    {sidebarCollapsed && <TooltipContent side="right">{item.label}</TooltipContent>}
                                  </Tooltip>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      ))}
                    </nav>
                  </div>
                </div>

                {/* Sidebar Footer */}
                <div className="p-4 border-t border-border space-y-2 bg-muted/50">
                  <Button
                    variant="ghost"
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    className={`w-full ${sidebarCollapsed ? 'justify-center' : 'justify-start'} text-muted-foreground hover:text-foreground hover:bg-white rounded-xl h-10`}
                  >
                    {sidebarCollapsed ? <ChevronRight className="h-5 w-5" /> : <><ChevronLeft className="h-5 w-5 mr-3" /> Collapse</>}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => handleTabChange('settings')}
                    className={`w-full ${sidebarCollapsed ? 'justify-center' : 'justify-start'} text-muted-foreground hover:text-foreground hover:bg-white rounded-xl h-10`}
                  >
                    <Settings className={`h-5 w-5 ${!sidebarCollapsed && 'mr-3'}`} />
                    {!sidebarCollapsed && 'Settings'}
                  </Button>
                </div>
              </>
            )}
          </aside>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0 relative">
            {/* Top Header - Glassmorphism */}
            {/* Top Header */}
            <header className="h-16 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border flex items-center justify-between px-6 sticky top-0 z-10 transition-all duration-300">
              <div className="flex items-center gap-6 flex-1">
                <h1 className="text-xl font-bold text-foreground tracking-tight capitalize">
                  {activeTab === 'dashboard' ? 'Overview' : activeTab.replace('-', ' ')}
                </h1>

                {/* Global Search - Integrated nicely */}
                {(userRole === 'superadmin' || userRole === 'admin') && (
                  <div className="max-w-md w-full ml-4">
                    <GlobalSearchBar
                      placeholder="Type / to search..."
                      value={searchQuery}
                      onValueChange={setSearchQuery}
                      onResultClick={handleGlobalSearchResult}
                      className="bg-muted/50 border-0 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-6">

                {/* Notifications & Theme */}
                <div className="flex items-center gap-2 pr-4 border-r border-border">
                  <Popover open={notificationPopoverOpen} onOpenChange={setNotificationPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="icon" className="relative rounded-full hover:bg-muted text-muted-foreground">
                        <Bell className="h-5 w-5" />
                        {unreadCount > 0 && (
                          <div
                            style={{
                              position: 'absolute',
                              top: '-4px',
                              right: '-4px',
                              height: '20px',
                              minWidth: '20px',
                              padding: '0 6px',
                              backgroundColor: 'rgb(234, 88, 12)',
                              color: 'rgb(255, 255, 255)',
                              fontSize: '11px',
                              fontWeight: '700',
                              borderRadius: '9999px',
                              border: '2px solid rgb(255, 255, 255)',
                              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              lineHeight: '1'
                            }}
                          >
                            {unreadCount}
                          </div>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="w-[400px] p-0 rounded-xl shadow-lg border-border bg-popover">
                      <div className="heading p-4 border-b border-border flex justify-between items-center bg-muted/50 rounded-t-xl">
                        <h4 className="font-semibold text-foreground">Notifications</h4>
                        {unreadCount > 0 && <Button variant="link" size="sm" onClick={onMarkAllNotificationsAsRead}>Mark all read</Button>}
                      </div>
                      <ScrollArea className="h-[400px]">
                        {notifications.map(n => (
                          <div key={n.id} onClick={() => handleNotificationClick(n)} className={`p-4 border-b border-border hover:bg-muted/50 cursor-pointer transition-colors ${!n.read ? 'bg-primary/5' : ''}`}>
                            <div className="flex gap-3">
                              <div className={`mt-1 h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${getNotificationColor(n.type)} text-white shadow-sm`}>
                                {getNotificationIcon(n.type)}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-foreground">{n.title}</p>
                                <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>
                                <p className="text-xs text-muted-foreground mt-2">{formatTimestamp(n.timestamp)}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                        {notifications.length === 0 && <div className="p-8 text-center text-muted-foreground">No new notifications</div>}
                      </ScrollArea>
                    </PopoverContent>
                  </Popover>

                </div>

                {/* User Profile */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-3 pl-2 outline-none group">
                      <div className="text-right hidden md:block">
                        <p className="text-sm font-bold text-foreground">{userName || getUserName(userEmail)}</p>
                        <p className="text-xs text-muted-foreground capitalize">{userRole}</p>
                      </div>
                      <Avatar className="h-10 w-10 ring-2 ring-white shadow-lg group-hover:ring-indigo-100 transition-all">
                        <AvatarFallback
                          className="bg-gradient-to-br from-indigo-500 to-purple-500"
                          style={{
                            color: 'rgb(255, 255, 255)',
                            fontWeight: '700',
                            fontSize: '14px'
                          }}
                        >
                          {getInitials(userEmail)}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-xl border-border p-2">
                    <DropdownMenuLabel className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Account</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => setActiveTab('settings')} className="rounded-lg">
                      <Settings className="w-4 h-4 mr-2" /> Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="my-1 border-slate-50" />
                    <DropdownMenuItem onClick={onLogout} className="text-rose-600 focus:text-rose-600 rounded-lg">
                      <LogOut className="w-4 h-4 mr-2" /> Log Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

              </div>
            </header>

            {/* Content Render Area */}
            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background relative">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="h-full"
              >
                {/* Dashboard / Home */}
                {activeTab === 'dashboard' && (
                  <>
                    {userRole === 'therapist' ? (
                      <TherapistHomeView userId={currentUserId} userEmail={userEmail} onNavigate={setActiveTab} />
                    ) : (userRole === 'superadmin' || userRole === 'super_admin') ? (
                      <SuperAdminDashboardView userId={currentUserId} userEmail={userEmail} onNavigate={setActiveTab} />
                    ) : (userRole === 'admin' || userRole === 'org_admin') ? (
                      <AdminDashboardView userId={currentUserId} userEmail={userEmail} onNavigate={setActiveTab} />
                    ) : userRole === 'client' ? (
                      <ClientDashboardView userId={currentUserId} userEmail={userEmail} userName={userName || ''} onNavigate={(tab) => setActiveTab(tab as TabType)} />
                    ) : (
                      <HomeView userRole={userRole} userEmail={userEmail} onNavigate={setActiveTab} />
                    )}
                  </>
                )}
                {/* Core Apps */}
                {activeTab === 'calendar' && <CalendarContainer userRole={userRole} currentUserId={currentUserId} searchQuery={searchQuery} triggerNewAppointment={triggerNewAppointment} />}
                {activeTab === 'clients' && <ProfessionalClientsView userRole={userRole} />}
                {activeTab === 'therapists' && <EnhancedTherapistsTable userRole={userRole} />}
                {activeTab === 'therapist-verification' && <TherapistVerificationView />}
                {activeTab === 'organizations' && <OrganizationManagementView userId={currentUserId} userEmail={userEmail} onNavigate={() => setActiveTab('dashboard')} />}

                {/* Tools */}
                {activeTab === 'messages' && <MessagesView currentUserId={currentUserId} currentUserName={userName || getUserName(userEmail)} currentUserEmail={userEmail} />}
                {activeTab === 'tasks' && <TasksView userRole={userRole} />}
                {activeTab === 'notes' && <QuickNotesView />}
                {activeTab === 'analytics' && <ReportsView userRole={userRole} currentUserId={currentUserId} userEmail={userEmail} />}
                {activeTab === 'settings' && (
                  <SettingsView
                    userEmail={userEmail}
                    userRole={userRole}
                    activeSettingsTab={activeSettingsTab}
                    setActiveSettingsTab={setActiveSettingsTab}
                    showSettingsNav={showSettingsNav}
                    handleBackFromSettings={handleBackFromSettings}
                  />
                )}
              </motion.div>
            </main>
          </div>
          <Toaster position="bottom-right" theme="system" className="font-sans" />
        </div>
      </TooltipProvider>
    </DndProvider>
  );
}