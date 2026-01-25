import React, { useState, useEffect } from 'react';
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
  PanelLeft,
  PanelLeftClose,
  UserCog,
  Building2,
  Mail,
  ShieldCheck,
  Palette,
  Sparkles,
  Gift,
  Zap,
  Moon,
  Sun
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
import { CustomizeDashboard, DashboardWidgets } from './CustomizeDashboard';
import { Dialog, DialogContent } from './ui/dialog';
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
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [widgets, setWidgets] = useState<DashboardWidgets>({
    stats: true,
    agenda: true,
    categories: true,
    completionRate: true,
    people: true,
    companies: true
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [triggerNewAppointment, setTriggerNewAppointment] = useState(0); // Counter to trigger appointment form
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'Overview': true,
    'Core Management': true,
    'Communication': true,
    'Billing': true,
    'Data & Intelligence': true,
  });

  // Subscription state
  const [subscriptionInfo, setSubscriptionInfo] = useState<{
    status: string;
    trialDaysRemaining: number | null;
    isTrialActive: boolean;
    tier?: string;
    organizationName?: string;
    isOrgOwner?: boolean;
    organizationId?: string;
    canAccessFeatures?: boolean;
  } | null>(null);

  // Fetch subscription info on mount - only for therapists
  useEffect(() => {
    const fetchSubscription = async () => {
      // Only fetch subscription for therapists
      // Super admins are product owners and don't need subscriptions
      // Clients will have separate product page
      if (userRole !== 'therapist') {
        // Set unlimited access for super admins and org admins
        if (userRole === 'super_admin' || userRole === 'org_admin') {
          setSubscriptionInfo({
            status: 'active',
            tier: 'enterprise',
            trialDaysRemaining: null,
            isTrialActive: false,
            canAccessFeatures: true,
            isOrgOwner: true,
            organizationName: 'Ataraxia Platform'
          });
        }
        // For clients, don't set subscription info (they'll have separate product page)
        return;
      }

      try {
        const { SubscriptionService } = await import('../api/services/subscription');
        const info = await SubscriptionService.getUserSubscription(currentUserId);
        setSubscriptionInfo(info);
      } catch (error: any) {
        if (error.message === 'CLIENT_NO_SUBSCRIPTION') {
          // Clients don't need subscription info
          console.info('Client role detected, skipping subscription');
          return;
        }
        console.error('Failed to fetch subscription:', error);
        // Only set fallback for therapists
        if (userRole === 'therapist') {
          setSubscriptionInfo({
            status: 'trial',
            tier: 'trial',
            trialDaysRemaining: 30,
            isTrialActive: true,
            canAccessFeatures: true,
            organizationName: 'My Practice',
            isOrgOwner: true
          });
        }
      }
    };

    if (currentUserId) {
      fetchSubscription();
    }
  }, [currentUserId, userRole]);

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

  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
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
        { id: 'video-rooms' as TabType, label: 'Video Rooms', icon: Calendar, badge: 'BETA' },
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
    // Super admins are product owners - no billing section needed
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
        ...(userRole === 'admin' || userRole === 'org_admin' ? [{ id: 'therapists' as TabType, label: 'Therapists', icon: UserCog }] : []),
        { id: 'messages' as TabType, label: 'Messages', icon: MessageSquare, badge: unreadCount > 0 ? unreadCount : undefined },
        { id: 'tasks' as TabType, label: 'Tasks', icon: CheckSquare },
        { id: 'notes' as TabType, label: 'Notes', icon: FileText },
        { id: 'analytics' as TabType, label: 'Analytics', icon: BarChart3 },
      ]
    },
    // Add billing section for therapists and org admins (not super admins or clients)
    ...(userRole === 'therapist' || userRole === 'org_admin' || userRole === 'admin' ? [{
      section: 'Billing',
      items: [
        { id: 'billing' as TabType, label: 'Billing & Subscriptions', icon: FileText },
        { id: 'invoices' as TabType, label: 'Invoices', icon: Invoice },
        { id: 'payments' as TabType, label: 'Payments', icon: Wallet },
        { id: 'plans' as TabType, label: 'Plans & Pricing', icon: FileText },
      ]
    }] : []),
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
          <aside className={`${sidebarCollapsed ? 'w-20' : 'w-72'} bg-sidebar flex flex-col shrink-0 transition-all duration-300 z-20`}>
            {/* Sidebar Header with Logo + Utility Icons */}
            <div className={`h-16 flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between px-4 gap-2'} relative group transition-all duration-300`}>
              {/* Logo */}
              <div className={`${sidebarCollapsed ? 'group-hover:opacity-0 transition-opacity duration-200' : ''}`}>
                <BedrockLogo variant="icon" className="w-9 h-9 shrink-0" />
              </div>

              {!sidebarCollapsed && (
                <div className="flex items-center gap-2">
                  {/* Search Icon */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsSearchOpen(true)}
                        className="h-8 w-8 rounded-full hover:bg-muted text-muted-foreground"
                      >
                        <Search className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Search</TooltipContent>
                  </Tooltip>

                  {/* Notifications Icon */}
                  <Popover open={notificationPopoverOpen} onOpenChange={setNotificationPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-muted text-muted-foreground relative">
                            <Bell className="h-4 w-4" />
                            {unreadCount > 0 && (
                              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 min-w-[16px] flex items-center justify-center px-1 shadow-sm border border-background">
                                {unreadCount > 9 ? '9+' : unreadCount}
                              </span>
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">Notifications</TooltipContent>
                      </Tooltip>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="w-96 p-0 rounded-xl shadow-xl border-border">
                      <div className="flex items-center justify-between p-4 border-b border-border">
                        <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
                        {unreadCount > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={onMarkAllNotificationsAsRead}
                            className="text-xs text-muted-foreground hover:text-foreground"
                          >
                            Mark all as read
                          </Button>
                        )}
                      </div>
                      <ScrollArea className="h-96">
                        <div className="p-2 space-y-1">
                          {notifications.length === 0 ? (
                            <div className="p-8 text-center text-sm text-muted-foreground">
                              No notifications
                            </div>
                          ) : (
                            notifications.map((notification) => (
                              <button
                                key={notification.id}
                                onClick={() => onMarkNotificationAsRead(notification.id)}
                                className={`w-full text-left p-3 rounded-lg hover:bg-muted transition-colors ${!notification.read ? 'bg-muted/50' : ''
                                  }`}
                              >
                                <div className="flex items-start gap-3">
                                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!notification.read ? 'bg-blue-500' : 'bg-transparent'
                                    }`} />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-foreground">{notification.title}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">{notification.message}</p>
                                    <p className="text-[10px] text-muted-foreground mt-1">{notification.timestamp}</p>
                                  </div>
                                </div>
                              </button>
                            ))
                          )}
                        </div>
                      </ScrollArea>
                    </PopoverContent>
                  </Popover>

                  {/* Settings Icon */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleTabChange('settings')}
                        className="h-8 w-8 rounded-full hover:bg-muted text-muted-foreground"
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Settings</TooltipContent>
                  </Tooltip>
                </div>
              )}

              {/* Sidebar Toggle - Collapsed State (Expand) - Overlay on Hover */}
              {sidebarCollapsed && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSidebarCollapsed(false)}
                        className="h-9 w-9 rounded-full text-foreground bg-popover shadow-md border border-border hover:bg-accent"
                      >
                        <PanelLeft className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>Expand Sidebar</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              )}

              {/* Sidebar Toggle - Expanded State (Collapse) */}
              {!sidebarCollapsed && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSidebarCollapsed(true)}
                      className="h-9 w-9 rounded-full hover:bg-muted text-muted-foreground"
                    >
                      <PanelLeftClose className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>Collapse Sidebar</p>
                  </TooltipContent>
                </Tooltip>
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
                              className="w-full flex items-center justify-between text-[10px] uppercase font-bold text-foreground px-3 mb-3 tracking-widest hover:text-orange-600 transition-colors"
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
                                  <Tooltip key={item.id}>
                                    <TooltipTrigger asChild>
                                      <button
                                        onClick={() => handleTabChange(item.id)}
                                        className={`
                                            w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-start gap-3'} 
                                            px-3 h-10 rounded-lg transition-all duration-200 group relative select-none
                                            ${isActive
                                            ? 'bg-sidebar-accent text-sidebar-primary'
                                            : 'text-foreground hover:bg-sidebar-accent/80'
                                          }
                                          `}
                                      >
                                        <Icon
                                          className={`h-5 w-5 shrink-0 ${isActive ? 'text-orange-600 dark:text-orange-400' : 'text-foreground'} transition-colors`}
                                          strokeWidth={isActive ? 2.5 : 2}
                                        />

                                        {!sidebarCollapsed && (
                                          <span className={`flex-1 text-left text-xs ${isActive ? 'font-semibold tracking-tight' : 'font-medium'}`}>
                                            {item.label}
                                          </span>
                                        )}

                                        {/* Badges */}
                                        {item.badge && !sidebarCollapsed && (
                                          <Badge className={`h-5 px-1.5 min-w-[20px] justify-center text-[10px] font-bold ${typeof item.badge === 'string' && item.badge === 'BETA'
                                            ? 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
                                            : isActive ? 'bg-white text-black' : 'bg-rose-500 text-white'
                                            }`}>
                                            {item.badge}
                                          </Badge>
                                        )}
                                        {item.badge && sidebarCollapsed && (
                                          <div className={`absolute top-2 right-2 h-2.5 w-2.5 rounded-full border-2 border-white ${typeof item.badge === 'string' && item.badge === 'BETA'
                                            ? 'bg-slate-500'
                                            : 'bg-rose-500'
                                            }`} />
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

                {/* Sidebar Footer - Premium Design */}
                {!sidebarCollapsed && (
                  <div className="p-4 space-y-3">
                    {/* Trial Info */}
                    {userRole !== 'superadmin' && userRole !== 'super_admin' && (subscriptionInfo?.status === 'trial' || subscriptionInfo?.isOrgOwner) && (
                      <div className="bg-card rounded-lg px-3 py-2 shadow-sm border border-border/50">
                        <div className={`flex ${((subscriptionInfo?.trialDaysRemaining ?? 0) > 365 && subscriptionInfo?.status === 'trial') ? 'justify-center' : 'justify-between'} items-center ${(subscriptionInfo?.status === 'trial' && (subscriptionInfo?.trialDaysRemaining ?? 0) <= 365) ? 'mb-2' : ''}`}>
                          <span className="text-xs font-semibold text-foreground">
                            {subscriptionInfo?.status === 'trial' ? 'Free Trial Plan' : `${subscriptionInfo?.tier || 'Basic'} Plan`}
                          </span>
                          {((subscriptionInfo?.trialDaysRemaining ?? 0) <= 365 || subscriptionInfo?.status !== 'trial') && (
                            <span className="text-xs text-muted-foreground">
                              {subscriptionInfo?.status === 'trial'
                                ? `${subscriptionInfo?.trialDaysRemaining ?? 30} days left`
                                : subscriptionInfo?.organizationName || 'My Practice'}
                            </span>
                          )}
                        </div>
                        {subscriptionInfo?.status === 'trial' && (subscriptionInfo?.trialDaysRemaining ?? 0) <= 365 && (
                          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-orange-500 to-orange-600 h-full"
                              style={{
                                width: `${Math.max(0, Math.min(100, ((subscriptionInfo?.trialDaysRemaining ?? 30) / 30) * 100))}%`
                              }}
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {/* AI Assistant */}
                    <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-colors group">
                      <Sparkles className="h-5 w-5 text-orange-600" />
                      <span className="text-xs font-semibold text-orange-600">AI Assistant</span>
                    </button>

                    {/* Help & Support */}
                    <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-colors group">
                      <HelpCircle className="h-5 w-5 text-foreground" />
                      <span className="text-xs font-medium text-foreground">Help & Support</span>
                    </button>

                    {/* Promotional Banner */}
                    <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-colors group">
                      <Gift className="h-5 w-5 text-foreground" />
                      <span className="text-xs font-medium text-foreground">Refer & Earn $30</span>
                    </button>

                    {/* User Profile Dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-colors">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback style={{ backgroundColor: '#ea580c' }} className="text-white text-xs font-bold">
                              {getInitials(userEmail)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs font-medium text-foreground flex-1 text-left">{userName || getUserName(userEmail)}</span>
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-xl border-border p-2">
                        <DropdownMenuItem className="rounded-lg text-xs">
                          <Moon className="w-4 h-4 mr-2" /> Dark mode
                        </DropdownMenuItem>
                        <DropdownMenuItem className="rounded-lg text-xs">
                          <Zap className="w-4 h-4 mr-2" /> What's new
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleTabChange('settings')} className="rounded-lg text-xs">
                          <Settings className="w-4 h-4 mr-2" /> Settings
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="my-1" />
                        <DropdownMenuItem onClick={onLogout} className="text-rose-600 focus:text-rose-600 rounded-lg text-xs">
                          <LogOut className="w-4 h-4 mr-2" /> Sign out
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}

                {/* Collapsed Sidebar Footer - Icon Only */}
                {sidebarCollapsed && (
                  <div className="p-2 space-y-2 flex flex-col items-center">
                    {/* AI Assistant Icon */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-lg hover:bg-muted">
                          <Sparkles className="h-5 w-5 text-orange-600" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p>AI Assistant</p>
                      </TooltipContent>
                    </Tooltip>

                    {/* Help & Support Icon */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-lg hover:bg-muted">
                          <HelpCircle className="h-5 w-5 text-foreground" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p>Help & Support</p>
                      </TooltipContent>
                    </Tooltip>

                    {/* Promotional Banner Icon */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-lg hover:bg-muted">
                          <Gift className="h-5 w-5 text-foreground" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p>Refer & Earn $30</p>
                      </TooltipContent>
                    </Tooltip>

                    {/* User Profile Icon */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-lg hover:bg-muted">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback style={{ backgroundColor: '#ea580c' }} className="text-white text-xs font-bold">
                              {getInitials(userEmail)}
                            </AvatarFallback>
                          </Avatar>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-xl border-border p-2">
                        <DropdownMenuItem className="rounded-lg text-xs">
                          <Moon className="w-4 h-4 mr-2" /> Dark mode
                        </DropdownMenuItem>
                        <DropdownMenuItem className="rounded-lg text-xs">
                          <Zap className="w-4 h-4 mr-2" /> What's new
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleTabChange('settings')} className="rounded-lg text-xs">
                          <Settings className="w-4 h-4 mr-2" /> Settings
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="my-1" />
                        <DropdownMenuItem onClick={onLogout} className="text-rose-600 focus:text-rose-600 rounded-lg text-xs">
                          <LogOut className="w-4 h-4 mr-2" /> Sign out
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
              </>
            )}
          </aside>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0 relative">
            {/* Top Header */}
            <header className="h-16 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-6 sticky top-0 z-10 transition-all duration-300">
              {/* Left Side: Page Title */}
              <div className="flex items-center">
                <h1 className="text-3xl font-bold text-foreground tracking-tight">
                  {activeTab === 'dashboard' ? '' : activeTab.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </h1>
              </div>

              {/* Right Side: Customize Button */}
              <div className="flex items-center gap-2">

                {activeTab === 'dashboard' && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-lg hover:bg-muted text-foreground border-border ml-2"
                        onClick={() => setIsCustomizeOpen(true)}
                      >
                        <Palette className="h-4 w-4 mr-2" />
                        Customize
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Customize Dashboard</p>
                    </TooltipContent>
                  </Tooltip>
                )}
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
                      <SuperAdminDashboardView userId={currentUserId} userEmail={userEmail} userName={userName} onNavigate={setActiveTab} />
                    ) : (userRole === 'admin' || userRole === 'org_admin') ? (
                      <AdminDashboardView userId={currentUserId} userEmail={userEmail} onNavigate={setActiveTab} />
                    ) : userRole === 'client' ? (
                      <ClientDashboardView userId={currentUserId} userEmail={userEmail} userName={userName || ''} onNavigate={(tab) => setActiveTab(tab as TabType)} />
                    ) : (
                      <HomeView userRole={userRole} userEmail={userEmail} onNavigate={setActiveTab} visibleWidgets={widgets} />
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
      <CustomizeDashboard
        open={isCustomizeOpen}
        onOpenChange={setIsCustomizeOpen}
        widgets={widgets}
        onToggle={(key) => setWidgets(prev => ({ ...prev, [key]: !prev[key] }))}
      />
      <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <DialogContent className="p-0 border-none bg-transparent shadow-none max-w-2xl sm:max-w-3xl">
          <GlobalSearchBar
            value={searchQuery}
            onValueChange={setSearchQuery}
            onResultClick={(result) => {
              handleGlobalSearchResult(result);
              setIsSearchOpen(false);
            }}
            className="w-full shadow-2xl"
          />
        </DialogContent>
      </Dialog>
    </DndProvider>
  );
}