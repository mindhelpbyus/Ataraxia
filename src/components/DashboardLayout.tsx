import React, { useState, useEffect, lazy, Suspense } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Broadcast, Invoice, Ticket, Wallet } from '@phosphor-icons/react';
import { SettingsSidebar } from './SettingsSidebar';
import { SupportRequestView } from './SupportRequestView';

// Heavy, tab-switched views are lazy-loaded so each loads only when its tab opens
// (keeps the dashboard shell small — previously this file was a 1.69 MB chunk).
const named = (p: Promise<Record<string, any>>, name: string) =>
  p.then((m) => ({ default: m[name] as React.ComponentType<any> }));
const CalendarContainer = lazy(() => named(import('./CalendarContainer'), 'CalendarContainer'));
const HomeView = lazy(() => named(import('./HomeView'), 'HomeView'));
const TherapistHomeView = lazy(() => named(import('./TherapistHomeView'), 'TherapistHomeView'));
const AdminDashboardView = lazy(() => named(import('./AdminDashboardView'), 'AdminDashboardView'));
const SuperAdminDashboardView = lazy(() => named(import('./SuperAdminDashboardView'), 'SuperAdminDashboardView'));
const OrganizationManagementView = lazy(() => named(import('./OrganizationManagementView'), 'OrganizationManagementView'));
const ProfessionalClientsView = lazy(() => named(import('./ProfessionalClientsView'), 'ProfessionalClientsView'));
const TherapyVideoRoom = lazy(() => named(import('./TherapyVideoRoom'), 'TherapyVideoRoom'));
const EnhancedTherapistsTable = lazy(() => named(import('./EnhancedTherapistsTable'), 'EnhancedTherapistsTable'));
const VideoRoomsView = lazy(() => named(import('./VideoRoomsView'), 'VideoRoomsView'));
const QuickNotesView = lazy(() => named(import('./QuickNotesView'), 'QuickNotesView'));
const TasksView = lazy(() => named(import('./TasksView'), 'TasksView'));
const MessagesView = lazy(() => named(import('./MessagesView'), 'MessagesView'));
const SettingsView = lazy(() => named(import('./SettingsView'), 'SettingsView'));
const ReportsView = lazy(() => named(import('./ReportsView'), 'ReportsView'));
const InvoicesView = lazy(() => named(import('./InvoicesView'), 'InvoicesView'));
const BillingView = lazy(() => named(import('./BillingView'), 'BillingView'));
const ClientDashboardView = lazy(() => named(import('./ClientDashboardView'), 'ClientDashboardView'));
import { VerificationBanner } from './VerificationBanner';
import { BedrockLogo } from '../imports/BedrockLogo';
import { UserRole, Notification } from '../types/appointment';
import { ErrorBoundary } from './ErrorBoundary';
import { Toaster } from './ui/sonner';

import {
  Plus,
  Settings,
  Bell,
  Search,
  ChevronDown,
  LogOut,
  User,
  HelpCircle,
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
  Sun,
  LayoutDashboard,
  Calendar,
  Users,
  MessageSquare,
  CheckSquare,
  FileText,
  BarChart3,
  Shield,
  Video,
  Activity,
  History,
  Inbox,
  UserCheck,
  CreditCard
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

import { Dialog, DialogContent } from './ui/dialog';
import { Separator } from './ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { motion, AnimatePresence } from 'framer-motion';

interface DashboardLayoutProps {
  userRole: UserRole;
  currentUserId: string;
  userEmail: string;
  userName?: string;
  accountStatus?: string;
  onLogout: () => void;
  notifications: Notification[];
  onMarkNotificationAsRead: (notificationId: string) => void;
  onMarkAllNotificationsAsRead: () => void;
  onNavigateToSecurity?: () => void;
  onNavigateToMFA?: () => void;
  onNavigateToSessions?: () => void;
}

type TabType = 'dashboard' | 'calendar' | 'clients' | 'therapists' | 'notes' | 'messages' | 'tasks' | 'analytics' | 'settings' | 'organizations' | 'video-rooms' | 'broadcast' | 'support-tickets' | 'billing' | 'invoices' | 'payments' | 'plans' | 'feature-flags' | 'integrations' | 'system-settings' | 'user-management' | 'email-templates' | 'compliance' | 'activity' | 'requests' | 'supervision' | 'notifications' | 'recently-viewed' | 'support';

/** Display titles for settings leaf tabs — keep in sync with SettingsSidebar labels. */
const SETTINGS_TITLES: Record<string, string> = {
  account: 'Profile & security',
  'clinical-info': 'Clinical info',
  credentials: 'Professional Credentials & Specializations',
  license: 'License & credentials',
  notifications: 'Notification preferences',
  'practice-details': 'Practice details',
  'business-files': 'Business files',
  'plan-info': 'Plan info',
  'analytics-settings': 'Analytics',
  'data-export': 'Data export',
  'demo-client': 'Demo client',
  team: 'Team',
  insurance: 'Payment & Compliance',
  'client-billing': 'Client billing',
  'online-payments': 'Online payments',
  autopay: 'AutoPay',
  services: 'Services',
  products: 'Products',
  'client-portal': 'Client portal permissions',
  availability: 'Calendar & availability',
  caseload: 'Caseload management',
  'contact-form': 'Contact form',
  prescreener: 'Prescreener',
  widgets: 'Widgets',
  'template-library': 'Template library',
  documents: 'Shareable documents',
  'client-notifications': 'Client notifications',
  messaging: 'Messaging',
};

export function DashboardLayout({ userRole, currentUserId, userEmail, userName, accountStatus, onLogout, notifications, onMarkNotificationAsRead, onMarkAllNotificationsAsRead, onNavigateToSecurity, onNavigateToMFA, onNavigateToSessions }: DashboardLayoutProps) {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [activeSettingsTab, setActiveSettingsTab] = useState<string>('account');
  const [showSettingsNav, setShowSettingsNav] = useState(false);
  const [notificationPopoverOpen, setNotificationPopoverOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [triggerNewAppointment, setTriggerNewAppointment] = useState(0);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'Overview': true,
    'Core Management': true,
    'Communication': true,
    'Billing': true,
    'Data & Intelligence': true,
  });
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const initialTheme = savedTheme || systemTheme;
    setTheme(initialTheme);
    if (initialTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

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

  useEffect(() => {
    const fetchSubscription = async () => {
      if (userRole !== 'therapist') {
        if (userRole === 'superadmin' || userRole === 'org_admin') {
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
        return;
      }
      try {
        const { SubscriptionService } = await import('../api/subscription');
        const info = await SubscriptionService.getUserSubscription(currentUserId);
        setSubscriptionInfo(info as any);
      } catch (error: any) {
        if (error.message === 'CLIENT_NO_SUBSCRIPTION') return;
        console.error('Failed to fetch subscription:', error);
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
    if (currentUserId) fetchSubscription();
  }, [currentUserId, userRole]);

  const handleTabChange = (tab: string, subTab?: string) => {
    setActiveTab(tab as TabType);
    if (tab === 'settings') {
      setShowSettingsNav(true);
      if (subTab) setActiveSettingsTab(subTab);
    } else {
      setShowSettingsNav(false);
    }
    if (tab !== 'calendar') setSearchQuery('');
  };

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

  const handleGlobalSearchResult = (result: any) => {
    switch (result.category) {
      case 'organizations':
        if (userRole === 'superadmin') handleTabChange('organizations');
        break;
      case 'therapists':
        handleTabChange('therapists');
        break;
      case 'clients':
        handleTabChange('clients');
        break;
      case 'users':
        if (userRole === 'superadmin') handleTabChange('user-management');
        break;
      default:
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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  type NavigationItem = {
    id: TabType;
    label: string;
    icon: any;
    badge?: string | number;
  };

  type NavigationSection = {
    section: string;
    items: NavigationItem[];
  };

  const getSuperAdminNavigation = (): NavigationSection[] => [
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
        { id: 'clients' as TabType, label: 'Clients', icon: Users },
        { id: 'video-rooms' as TabType, label: 'Video Sessions', icon: Video, badge: 'LIVE' },
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
      section: 'Data & Intelligence',
      items: [
        { id: 'analytics' as TabType, label: 'Analytics & Metrics', icon: BarChart3 },
      ]
    },
  ];

  const getStandardNavigation = (): NavigationSection[] => {
    if (userRole === 'therapist' && accountStatus === 'registered') {
      return [
        {
          section: '',
          items: [
            { id: 'dashboard' as TabType, label: 'Home', icon: LayoutDashboard },
            { id: 'settings' as TabType, label: 'Settings', icon: Settings },
          ]
        }
      ];
    }
    const isOrg = userRole === 'admin' || userRole === 'org_admin';
    return [
      // ── Practice (SimplePractice: Calendar / Clients / Requests) ──
      {
        section: 'Practice',
        items: [
          { id: 'dashboard' as TabType, label: 'Home', icon: LayoutDashboard },
          { id: 'calendar' as TabType, label: 'Calendar', icon: Calendar },
          { id: 'clients' as TabType, label: 'Clients', icon: Users },
          { id: 'requests' as TabType, label: 'Requests', icon: Inbox },
          ...(isOrg ? [
            { id: 'therapists' as TabType, label: 'Therapists', icon: UserCog },
            { id: 'organizations' as TabType, label: 'Organizations', icon: Building2 },
          ] : []),
        ],
      },
      // ── Clinical (notes, tasks, supervision[org]) ──
      {
        section: 'Clinical',
        items: [
          { id: 'notes' as TabType, label: 'Notes', icon: FileText },
          { id: 'tasks' as TabType, label: 'Tasks', icon: CheckSquare },
          ...(isOrg ? [{ id: 'supervision' as TabType, label: 'Supervision', icon: UserCheck }] : []),
        ],
      },
      // ── Communication ──
      {
        section: 'Communication',
        items: [
          { id: 'messages' as TabType, label: 'Messages', icon: MessageSquare, badge: unreadCount > 0 ? unreadCount : undefined },
          { id: 'video-rooms' as TabType, label: 'Telehealth', icon: Video },
          { id: 'notifications' as TabType, label: 'Notifications', icon: Bell, badge: unreadCount > 0 ? unreadCount : undefined },
        ],
      },
      // ── Money (SimplePractice: Billing — Insurance is OUT for India) ──
      {
        section: 'Money',
        items: [
          { id: 'billing' as TabType, label: 'Billing', icon: CreditCard },
          { id: 'invoices' as TabType, label: 'Invoices', icon: Invoice },
          { id: 'payments' as TabType, label: 'Payments', icon: Wallet },
          { id: 'plans' as TabType, label: 'Plans', icon: FileText },
        ],
      },
      // ── Insights (Analytics + Activity) ──
      {
        section: 'Insights',
        items: [
          { id: 'analytics' as TabType, label: 'Analytics', icon: BarChart3 },
          { id: 'activity' as TabType, label: 'Activity', icon: Activity },
        ],
      },
      // ── Grow ──
      {
        section: 'Grow',
        items: [
          { id: 'recently-viewed' as TabType, label: 'Recently viewed', icon: History },
        ],
      },
    ];
  };

  const getClientNavigation = (): NavigationSection[] => [
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

  const navigationSections = (userRole === 'superadmin')
    ? getSuperAdminNavigation()
    : userRole === 'client'
      ? getClientNavigation()
      : getStandardNavigation();

  const toggleSection = (sectionName: string) => {
    setExpandedSections(prev => ({ ...prev, [sectionName]: !prev[sectionName] }));
  };

  // Shared mock search function to avoid duplication
  const mockSearch = async (query: string) => {
    if (!query || query.length < 2) return [];
    const allResults = [
      { id: 'org-1', title: 'Wellness Care Center', subtitle: 'wellnesscare.ataraxia.com', category: 'organizations' as const, status: 'Active' },
      { id: 'therapist-1', title: 'Dr. Sarah Mitchell', subtitle: 'CBT Specialist', category: 'therapists' as const, status: 'Active' },
      { id: 'user-1', title: 'John Davis', subtitle: 'Client', category: 'users' as const, status: 'Active' },
      { id: 'ticket-1', title: 'Login Issues', subtitle: 'Ticket #2451', category: 'support' as const, status: 'Open' },
      { id: 'payment-1', title: 'Payment received', subtitle: 'PMT-2024-11', category: 'payments' as const, status: 'Completed' },
      { id: 'invoice-1', title: 'Invoice #INV-2024', subtitle: '$1,250.00', category: 'invoices' as const, status: 'Paid' },
      { id: 'billing-1', title: 'Subscription Renewal', subtitle: 'Pro Plan', category: 'billing' as const, status: 'Active' }
    ];
    return allResults.filter(r => r.title.toLowerCase().includes(query.toLowerCase()));
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <TooltipProvider delayDuration={300}>
        <div className="flex h-screen bg-background overflow-hidden font-sans">
          {/* Left Sidebar */}
          <aside className={`${sidebarCollapsed ? 'w-20' : 'w-72'} bg-sidebar flex flex-col shrink-0 transition-all duration-300 z-20`}>
            {/* Sidebar Header */}
            <div className={`h-16 flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between px-4 gap-2'} relative group transition-all duration-300`}>
              <div className={`${sidebarCollapsed ? 'group-hover:opacity-0 transition-opacity duration-200' : ''}`}>
                <BedrockLogo variant="icon" className="w-9 h-9 shrink-0" />
              </div>

              {!sidebarCollapsed && (
                <div className="flex items-center gap-2">
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
                          <Button variant="ghost" size="sm" onClick={onMarkAllNotificationsAsRead} className="text-xs text-muted-foreground hover:text-foreground">
                            Mark all as read
                          </Button>
                        )}
                      </div>
                      <ScrollArea className="h-96">
                        <div className="p-2 space-y-1">
                          {notifications.length === 0 ? (
                            <div className="p-8 text-center text-sm text-muted-foreground">No notifications</div>
                          ) : (
                            notifications.map((notification) => (
                              <button
                                key={notification.id}
                                onClick={() => onMarkNotificationAsRead(notification.id)}
                                className={`w-full text-left p-3 rounded-lg hover:bg-muted transition-colors ${!notification.read ? 'bg-muted/50' : ''}`}
                              >
                                <div className="flex items-start gap-3">
                                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!notification.read ? 'bg-blue-500' : 'bg-transparent'}`} />
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
                    <TooltipContent side="right"><p>Expand Sidebar</p></TooltipContent>
                  </Tooltip>
                </div>
              )}

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
                  <TooltipContent side="right"><p>Collapse Sidebar</p></TooltipContent>
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
                              className="w-full flex items-center justify-between text-[10px] uppercase font-bold text-foreground px-3 mb-3 tracking-widest hover:text-action transition-colors"
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
                                        className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-start gap-3'} px-3 h-10 rounded-lg transition-all duration-200 group relative select-none ${isActive ? 'bg-sidebar-accent text-sidebar-primary' : 'text-foreground hover:bg-sidebar-accent/80'}`}
                                      >
                                        <Icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-action' : 'text-foreground'} transition-colors`} strokeWidth={isActive ? 2.5 : 2} />
                                        {!sidebarCollapsed && (
                                          <span className={`flex-1 text-left text-xs ${isActive ? 'font-semibold tracking-tight' : 'font-medium'}`}>
                                            {item.label}
                                          </span>
                                        )}
                                        {item.badge && !sidebarCollapsed && (
                                          <Badge className={`h-5 px-1.5 min-w-[20px] justify-center text-[10px] font-bold ${typeof item.badge === 'string' && item.badge === 'BETA' ? 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200' : isActive ? 'bg-card text-black' : 'bg-rose-500 text-white'}`}>
                                            {item.badge}
                                          </Badge>
                                        )}
                                        {item.badge && sidebarCollapsed && (
                                          <div className={`absolute top-2 right-2 h-2.5 w-2.5 rounded-full border-2 border-white ${typeof item.badge === 'string' && item.badge === 'BETA' ? 'bg-slate-500' : 'bg-rose-500'}`} />
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
                {!sidebarCollapsed && (
                  <div className="p-4 space-y-3">
                    <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-colors group">
                      <Sparkles className="h-5 w-5 text-action" />
                      <span className="text-xs font-semibold text-action">AI Assistant</span>
                    </button>
                    <button
                      onClick={() => handleTabChange(userRole === 'superadmin' ? 'support-tickets' : 'support')}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-colors group"
                    >
                      <HelpCircle className="h-5 w-5 text-foreground" />
                      <span className="text-xs font-medium text-foreground">Help & Support</span>
                    </button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-colors">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback style={{ backgroundColor: '#1E7048' }} className="text-white text-xs font-bold">
                              {getInitials(userEmail)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs font-medium text-foreground flex-1 text-left">{userName || getUserName(userEmail)}</span>
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-xl border-border p-2">
                        <DropdownMenuItem onClick={toggleTheme} className="rounded-lg text-xs">
                          {theme === 'light' ? <><Moon className="w-4 h-4 mr-2" /> Dark mode</> : <><Sun className="w-4 h-4 mr-2" /> Light mode</>}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="rounded-lg text-xs">
                          <Zap className="w-4 h-4 mr-2" /> What's new
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="my-1" />
                        <DropdownMenuItem onClick={onLogout} className="text-rose-600 focus:text-rose-600 rounded-lg text-xs">
                          <LogOut className="w-4 h-4 mr-2" /> Sign out
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}

                {/* Collapsed Footer */}
                {sidebarCollapsed && (
                  <div className="p-2 space-y-2 flex flex-col items-center">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-lg hover:bg-muted">
                          <Sparkles className="h-5 w-5 text-action" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="right"><p>AI Assistant</p></TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-10 w-10 rounded-lg hover:bg-muted"
                          onClick={() => handleTabChange(userRole === 'superadmin' ? 'support-tickets' : 'support')}
                        >
                          <HelpCircle className="h-5 w-5 text-foreground" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="right"><p>Help & Support</p></TooltipContent>
                    </Tooltip>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-lg hover:bg-muted">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback style={{ backgroundColor: '#1E7048' }} className="text-white text-xs font-bold">
                              {getInitials(userEmail)}
                            </AvatarFallback>
                          </Avatar>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-xl border-border p-2">
                        <DropdownMenuItem onClick={toggleTheme} className="rounded-lg text-xs">
                          {theme === 'light' ? <><Moon className="w-4 h-4 mr-2" /> Dark mode</> : <><Sun className="w-4 h-4 mr-2" /> Light mode</>}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="rounded-lg text-xs">
                          <Zap className="w-4 h-4 mr-2" /> What's new
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

          {/* Main Content */}
          <div className="flex-1 flex flex-col min-w-0 relative">
            {activeTab !== 'messages' && (
              <header className="h-16 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center px-6 sticky top-0 z-50 transition-all duration-300 relative">
                <div className="flex items-center">
                  <h1 className="text-3xl font-bold text-foreground tracking-tight">
                    {activeTab === 'dashboard' ? '' :
                      activeTab === 'support' ? 'Submit a request' :
                      activeTab === 'settings' ? (
                        SETTINGS_TITLES[activeSettingsTab] ??
                          activeSettingsTab.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
                      ) :
                        activeTab.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </h1>
                </div>

                {/* Absolute Center: Global Search (Only visible on Dashboard) */}
                {activeTab === 'dashboard' && (
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[360px]">
                    <GlobalSearchBar
                      value={searchQuery}
                      onValueChange={setSearchQuery}
                      onSearch={mockSearch}
                      onResultClick={(result) => handleGlobalSearchResult(result)}
                      className="w-full"
                    />
                  </div>
                )}
              </header>
            )}

            <main className="flex-1 overflow-auto bg-canvas p-6 relative z-0">
              <div className="max-w-[1600px] mx-auto space-y-6">
                {userRole !== 'therapist' && (
                  <VerificationBanner
                    accountStatus={accountStatus || 'registered'}
                    userRole={userRole}
                    className="mb-6 shadow-sm bg-card"
                    profileCompletion={10}
                    onCompleteProfile={() => handleTabChange('settings')}
                  />
                )}

                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="h-full"
                >
                  <ErrorBoundary key={`eb-${activeTab}`}>
                    <Suspense fallback={
                      <div className="flex items-center justify-center py-24 text-muted-foreground">
                        Loading…
                      </div>
                    }>
                    {activeTab === 'dashboard' && (
                      <>
                        {userRole === 'therapist' ? (
                          <TherapistHomeView userId={currentUserId} userEmail={userEmail} onNavigate={handleTabChange} accountStatus={accountStatus} />
                        ) : (userRole === 'superadmin') ? (
                          <SuperAdminDashboardView userId={currentUserId} userEmail={userEmail} userName={userName} onNavigate={setActiveTab} />
                        ) : (userRole === 'admin' || userRole === 'org_admin') ? (
                          <AdminDashboardView userId={currentUserId} userEmail={userEmail} onNavigate={setActiveTab} />
                        ) : userRole === 'client' ? (
                          <ClientDashboardView userId={currentUserId} userEmail={userEmail} userName={userName || ''} onNavigate={(tab: string) => setActiveTab(tab as TabType)} />
                        ) : (
                          <HomeView userRole={userRole} userEmail={userEmail} onNavigate={setActiveTab} />
                        )}
                      </>
                    )}
                    {activeTab === 'calendar' && <CalendarContainer userRole={userRole} currentUserId={currentUserId} searchQuery={searchQuery} triggerNewAppointment={triggerNewAppointment} />}
                    {activeTab === 'clients' && <ProfessionalClientsView userRole={userRole} currentUserId={currentUserId} />}
                    {activeTab === 'therapists' && <EnhancedTherapistsTable userRole={userRole} currentUserId={currentUserId} />}
                    {activeTab === 'video-rooms' && <VideoRoomsView />}
                    {activeTab === 'organizations' && <OrganizationManagementView userId={currentUserId} userEmail={userEmail} onNavigate={() => setActiveTab('dashboard')} />}
                    {activeTab === 'messages' && <MessagesView currentUserId={currentUserId} currentUserName={userName || getUserName(userEmail)} currentUserEmail={userEmail} userRole={userRole} />}
                    {activeTab === 'support' && <SupportRequestView userEmail={userEmail} />}
                    {activeTab === 'tasks' && <TasksView userRole={userRole} />}
                    {activeTab === 'notes' && <QuickNotesView />}
                    { activeTab === 'invoices' && <InvoicesView userRole={userRole} currentUserId={currentUserId} />}
                    {['billing', 'payments', 'plans'].includes(activeTab) && <BillingView userRole={userRole} currentUserId={currentUserId} tab={activeTab as 'billing' | 'payments' | 'plans'} />}
                    {activeTab === 'analytics' && <ReportsView userRole={userRole} currentUserId={currentUserId} userEmail={userEmail} />}
                    {activeTab === 'requests' && <SectionPlaceholder icon={Inbox} title="Requests" desc="Incoming appointment requests and client enquiries land here. Review, accept, or assign them." />}
                    {activeTab === 'supervision' && <SectionPlaceholder icon={UserCheck} title="Supervision" desc="Review and co-sign notes from supervisees and interns; oversee clinical quality across your clinic." />}
                    {activeTab === 'notifications' && <SectionPlaceholder icon={Bell} title="Notifications" desc="Your alerts — appointment reminders, messages, and account activity." />}
                    {activeTab === 'activity' && <SectionPlaceholder icon={Activity} title="Activity" desc="A live feed of what's happening across your practice — sessions, notes, payments, and more." />}
                    {activeTab === 'recently-viewed' && <SectionPlaceholder icon={History} title="Recently viewed" desc="Quickly jump back to the clients and records you opened most recently." />}
                    {activeTab === 'settings' && (
                      <SettingsView
                        userId={currentUserId}
                        userEmail={userEmail}
                        userRole={userRole}
                        activeSettingsTab={activeSettingsTab}
                        setActiveSettingsTab={setActiveSettingsTab}
                        showSettingsNav={showSettingsNav}
                        handleBackFromSettings={handleBackFromSettings}
                      />
                    )}
                    </Suspense>
                  </ErrorBoundary>
                </motion.div>
              </div>
            </main>
          </div>
          <Toaster position="bottom-right" theme="system" className="font-sans" />
        </div>
      </TooltipProvider>

      {/* Global Search Dialog */}
      <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <DialogContent className="p-0 !bg-transparent !border-none !shadow-none max-w-2xl sm:max-w-3xl [&>button]:hidden">
          <GlobalSearchBar
            value={searchQuery}
            onValueChange={setSearchQuery}
            onSearch={mockSearch}
            onResultClick={(result) => {
              handleGlobalSearchResult(result);
              setIsSearchOpen(false);
            }}
            className="w-full"
          />
        </DialogContent>
      </Dialog>
    </DndProvider>
  );
}

/** Clean, on-brand placeholder for sidebar sections not yet built (SimplePractice parity). */
function SectionPlaceholder({ icon: Icon, title, desc }: { icon: React.ComponentType<{ className?: string }>; title: string; desc: string }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-24 px-6">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted mb-5">
        <Icon className="h-6 w-6 text-muted-foreground" />
      </div>
      <h2 className="text-xl font-semibold tracking-tight text-foreground">{title}</h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground leading-relaxed">{desc}</p>
      <span className="mt-5 inline-flex items-center rounded-full border border-rule px-3 py-1 text-xs font-medium text-muted-foreground">
        Coming soon
      </span>
    </div>
  );
}