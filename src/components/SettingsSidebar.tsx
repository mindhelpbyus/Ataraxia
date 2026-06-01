import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  // Operations
  UserCircle,
  Stethoscope,
  Bell,
  Building2,
  FolderLock,
  Receipt,
  BarChart3,
  Download,
  Bot,
  Users,
  // Billing
  Wallet,
  CreditCard,
  RefreshCw,
  Briefcase,
  Package,
  // Client care
  ShieldCheck,
  CalendarCog,
  Target,
  ClipboardList,
  Filter,
  Code2,
  BookOpen,
  FileSignature,
  MessageSquare,
  Mail,
  // Platform (superadmin)
  Settings,
  UserCog,
  Shield,
  Bug,
} from 'lucide-react';
import { Button } from './ui/button';
import { UserRole } from '../types/appointment';

interface SettingsSidebarProps {
  activeSettingsTab: string;
  onSettingsTabChange: (tab: string) => void;
  onBack: () => void;
  collapsed?: boolean;
  userRole?: UserRole;
}

interface SettingsItem {
  id: string;
  label: string;
  icon: React.ElementType;
  /** Short sub-label shown under the item, SimplePractice-style. */
  hint?: string;
}

interface SettingsSection {
  id: string;
  title: string;
  items: SettingsItem[];
}

/**
 * Settings information architecture mirrors SimplePractice's settings sidebar:
 * three top groups — OPERATIONS / BILLING / CLIENT CARE — each a collapsible
 * group of focused leaf pages.
 *
 * India adaptations (deliberate divergence from SimplePractice's US clinic):
 *  - NO ePrescribe (Clinical info) — only registered medical practitioners may prescribe.
 *  - NO insurance-claims settings — therapists/counsellors cannot file claims in India.
 *  - Service coding uses India session types, not US CPT codes.
 *  - Payment processing reflects Razorpay (via billing_payment), not Stripe.
 */
const therapistSections: SettingsSection[] = [
  {
    id: 'operations',
    title: 'OPERATIONS',
    items: [
      { id: 'account', label: 'Profile & security', icon: UserCircle, hint: 'Personal info and security preferences' },
      { id: 'clinical-info', label: 'Clinical info', icon: Stethoscope, hint: 'NPI / registration and licenses' },
      { id: 'license', label: 'License & credentials', icon: ShieldCheck, hint: 'License type, number, expiry, state' },
      { id: 'notifications', label: 'Notification preferences', icon: Bell, hint: 'Manage the notifications you receive' },
      { id: 'practice-details', label: 'Practice details', icon: Building2, hint: 'Practice name and location info' },
      { id: 'business-files', label: 'Business files', icon: FolderLock, hint: 'A secure place to store and share files' },
      { id: 'plan-info', label: 'Plan info', icon: Receipt, hint: 'Current plan, add-ons, receipts' },
      { id: 'analytics-settings', label: 'Analytics', icon: BarChart3, hint: 'Manage settings for analytics' },
      { id: 'data-export', label: 'Data export', icon: Download, hint: 'Export practice data' },
      { id: 'demo-client', label: 'Demo client', icon: Bot, hint: 'Turn demo client on and off' },
      { id: 'team', label: 'Team', icon: Users, hint: 'Members, roles and supervision' },
    ],
  },
  {
    id: 'billing',
    title: 'BILLING',
    items: [
      { id: 'client-billing', label: 'Client billing', icon: Wallet, hint: 'Client billing settings and statements' },
      { id: 'online-payments', label: 'Online payments', icon: CreditCard, hint: 'Set up and manage online payments (Razorpay)' },
      { id: 'autopay', label: 'AutoPay', icon: RefreshCw, hint: 'Automatically apply credits and payments to invoices' },
      { id: 'services', label: 'Services', icon: Briefcase, hint: 'Manage session types and set rates' },
      { id: 'products', label: 'Products', icon: Package, hint: 'Manage products and set rates' },
    ],
  },
  {
    id: 'client-care',
    title: 'CLIENT CARE',
    items: [
      { id: 'client-portal', label: 'Client portal permissions', icon: ShieldCheck, hint: 'Online appointment requests, permissions, greeting' },
      { id: 'availability', label: 'Calendar & availability', icon: CalendarCog, hint: 'Alerts, calendar sync, availability' },
      { id: 'caseload', label: 'Caseload management', icon: Target, hint: 'Manage caseload goals' },
      { id: 'contact-form', label: 'Contact form', icon: ClipboardList, hint: 'Send website inquiries directly to your inbox' },
      { id: 'prescreener', label: 'Prescreener', icon: Filter, hint: 'Determine if a prospective client is a good fit' },
      { id: 'widgets', label: 'Widgets', icon: Code2, hint: 'Add appointment requests and contact forms to your site' },
      { id: 'template-library', label: 'Template library', icon: BookOpen, hint: 'Intake docs, progress notes, treatment plans' },
      { id: 'documents', label: 'Shareable documents', icon: FileSignature, hint: 'Default intake documents and uploaded files' },
      { id: 'client-notifications', label: 'Client notifications', icon: Mail, hint: 'Reminders and automated client messages' },
      { id: 'messaging', label: 'Messaging', icon: MessageSquare, hint: 'Secure client and team messaging settings' },
    ],
  },
];

/** Superadmin / platform-operator (Bedrock team) gets platform-control sections too. */
const platformSections: SettingsSection[] = [
  {
    id: 'general',
    title: 'GENERAL',
    items: [
      { id: 'account', label: 'Account', icon: UserCircle },
      { id: 'notifications', label: 'Notification', icon: Bell },
      { id: 'apps', label: 'Apps', icon: Settings },
    ],
  },
  {
    id: 'platform',
    title: 'PLATFORM CONTROL',
    items: [
      { id: 'feature-flags', label: 'Feature Flags', icon: Settings },
      { id: 'integrations', label: 'Integrations', icon: Settings },
      { id: 'system-settings', label: 'System Settings', icon: Settings },
      { id: 'user-management', label: 'User & Role Management', icon: UserCog },
      { id: 'email-templates', label: 'Email/SMS Templates', icon: Mail },
      { id: 'compliance', label: 'Compliance & Security', icon: Shield },
    ],
  },
  {
    id: 'workspace',
    title: 'WORKSPACE',
    items: [
      { id: 'workspace-general', label: 'General', icon: Settings },
      { id: 'members', label: 'Members', icon: Users },
      { id: 'billing', label: 'Billing', icon: CreditCard },
      { id: 'api-debug', label: 'API Debug', icon: Bug },
    ],
  },
];

export function SettingsSidebar({
  activeSettingsTab,
  onSettingsTabChange,
  onBack,
  collapsed = false,
  userRole,
}: SettingsSidebarProps) {
  const isSuperAdmin = userRole === 'superadmin';

  const sections = isSuperAdmin ? platformSections : therapistSections;

  const [expandedSections, setExpandedSections] = useState<string[]>(
    sections.map((s) => s.id)
  );

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Back Button */}
      <div className="px-3 py-4 border-b border-rule">
        <Button
          variant="ghost"
          onClick={onBack}
          className={`
            w-full flex items-center ${collapsed ? 'justify-center' : 'gap-3'}
            px-2 h-9 rounded
            text-muted-foreground
            hover:bg-muted/60
            transition-all duration-150
          `}
        >
          <ChevronLeft className="h-5 w-5" />
          {!collapsed && <span className="flex-1 text-left text-sm font-medium">Back to Menu</span>}
        </Button>
      </div>

      {/* Settings Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
        {sections.map((section, sectionIndex) => {
          const isExpanded = expandedSections.includes(section.id);

          return (
            <div key={section.id} className="space-y-1">
              {/* Section Header */}
              {!collapsed && (
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between px-2 py-1 text-[color:var(--action)] text-[11px] font-semibold tracking-wide uppercase hover:opacity-80 transition-opacity"
                >
                  <span>{section.title}</span>
                  {isExpanded ? (
                    <ChevronDown className="h-3 w-3" />
                  ) : (
                    <ChevronRight className="h-3 w-3" />
                  )}
                </button>
              )}

              {/* Section Items */}
              {(isExpanded || collapsed) && (
                <div className="space-y-0.5">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeSettingsTab === item.id;

                    return (
                      <button
                        key={item.id}
                        onClick={() => onSettingsTabChange(item.id)}
                        className={`
                          w-full flex items-center ${collapsed ? 'justify-center' : 'justify-start gap-3'}
                          px-2 py-1.5 rounded-lg transition-all duration-200 group relative select-none text-left
                          ${isActive
                            ? 'bg-primary/10 text-primary'
                            : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                          }
                        `}
                      >
                        <Icon
                          className={`
                            h-[18px] w-[18px] shrink-0
                            ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}
                          `}
                          strokeWidth={isActive ? 2.4 : 2}
                        />
                        {!collapsed && (
                          <span className="flex-1 min-w-0">
                            <span className={`block text-sm leading-tight ${isActive ? 'font-semibold tracking-tight' : 'font-medium'}`}>
                              {item.label}
                            </span>
                            {item.hint && (
                              <span className="block text-[11px] leading-snug text-muted-foreground/70 truncate">
                                {item.hint}
                              </span>
                            )}
                          </span>
                        )}

                        {/* Tooltip for collapsed state */}
                        {collapsed && (
                          <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded border border-border shadow-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                            {item.label}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Separator between groups */}
              {sectionIndex !== sections.length - 1 && !collapsed && (
                <div className="pt-3">
                  <div className="h-0 border-t border-rule" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
