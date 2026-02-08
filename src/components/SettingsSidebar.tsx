import React, { useState } from 'react';
import {
  Wrench,
  UserCircle,
  Bell,
  Globe,
  Users,
  CreditCard,
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  Bug,
  Settings,
  UserCog,
  Mail,
  Shield,
  FileText,
  Calendar,
  Award,
  ScrollText
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

interface SettingsSection {
  id: string;
  title: string;
  items: SettingsItem[];
}

interface SettingsItem {
  id: string;
  label: string;
  icon: React.ElementType;
}

const settingsSections: SettingsSection[] = [
  {
    id: 'general',
    title: 'GENERAL SETTINGS',
    items: [
      { id: 'apps', label: 'Apps', icon: Wrench },
      { id: 'account', label: 'Account', icon: UserCircle },
      { id: 'notifications', label: 'Notification', icon: Bell }
    ]
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
    ]
  },
  {
    id: 'workspace',
    title: 'WORKSPACE SETTINGS',
    items: [
      { id: 'workspace-general', label: 'General', icon: Wrench },
      { id: 'members', label: 'Members', icon: Users },
      { id: 'billing', label: 'Billing', icon: CreditCard }
    ]
  }
];

export function SettingsSidebar({
  activeSettingsTab,
  onSettingsTabChange,
  onBack,
  collapsed = false,
  userRole
}: SettingsSidebarProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>(['general', 'platform', 'workspace']);

  // Generate settings sections based on user role
  const getSettingsSections = (): SettingsSection[] => {
    // Start with a shallow copy of the high-level sections array
    let sections = [...settingsSections];

    const isSuperAdmin = userRole === 'superadmin' || userRole === 'super_admin';
    const isTherapist = userRole === 'therapist';

    // Filter Platform Control section - only show for superadmin
    if (!isSuperAdmin) {
      sections = sections.filter((s) => s.id !== 'platform');
    }

    // Filter Workspace Settings - only show for superadmin
    if (!isSuperAdmin) {
      sections = sections.filter((s) => s.id !== 'workspace');
    }

    // CUSTOM THERAPIST SETTINGS
    if (isTherapist) {
      const generalIndex = sections.findIndex(s => s.id === 'general');
      if (generalIndex !== -1) {
        // Clone the section object to avoid mutating the original static data
        const generalSection = { ...sections[generalIndex] };

        // Define the therapist-specific items
        const therapistItems = [
          { id: 'account', label: 'Account', icon: UserCircle },
          { id: 'credentials', label: 'Credentials', icon: Award },
          { id: 'license', label: 'License', icon: ScrollText },
          { id: 'availability', label: 'Availability', icon: Calendar },
          { id: 'insurance', label: 'Payment & Compliance', icon: Shield },
          { id: 'documents', label: 'Document & Consents', icon: FileText },
          { id: 'notifications', label: 'Notification', icon: Bell }
        ];

        // Replace items specifically for therapists
        generalSection.items = therapistItems;

        // Update the array
        sections[generalIndex] = generalSection;
      }
    } else if (!isSuperAdmin) {
      // Filter "Apps" from General Settings if not superadmin (and not therapist, already handled)
      const generalIndex = sections.findIndex(s => s.id === 'general');
      if (generalIndex !== -1) {
        // Clone the section object to avoid mutating the original static data
        const generalSection = { ...sections[generalIndex] };
        // Filter items
        generalSection.items = generalSection.items.filter(item => item.id !== 'apps');
        // Update the array
        sections[generalIndex] = generalSection;
      }
    }

    // Add API Debug to workspace settings only for superadmin
    if (isSuperAdmin) {
      const workspaceIndex = sections.findIndex(s => s.id === 'workspace');
      if (workspaceIndex !== -1) {
        // Clone the section
        const workspaceSection = { ...sections[workspaceIndex] };
        // Add item if not already present
        if (!workspaceSection.items.find(i => i.id === 'api-debug')) {
          workspaceSection.items = [
            ...workspaceSection.items,
            { id: 'api-debug', label: 'API Debug', icon: Bug }
          ];
        }
        sections[workspaceIndex] = workspaceSection;
      }
    }

    return sections;
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const sections = getSettingsSections();

  return (
    <div className="flex flex-col h-full">
      {/* Back Button */}
      <div className="px-3 py-4 border-b border-[color:var(--border-primary)]">
        <Button
          variant="ghost"
          onClick={onBack}
          className={`
            w-full flex items-center ${collapsed ? 'justify-center' : 'gap-3'} 
            px-2 h-9 rounded
            text-[color:var(--content-dark-secondary)] 
            hover:bg-[color:var(--action-secondary-hover)]
            transition-all duration-150
          `}
        >
          <ChevronLeft className="h-5 w-5" />
          {!collapsed && <span className="flex-1 text-left text-sm font-medium">Back to Menu</span>}
        </Button>
      </div>

      {/* Settings Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {sections.map((section) => {
          const isExpanded = expandedSections.includes(section.id);

          return (
            <div key={section.id} className="space-y-1">
              {/* Section Header */}
              {!collapsed && (
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between px-2 py-1 text-[color:var(--content-dark-secondary)] text-xs font-medium hover:text-[color:var(--content-dark-primary)] transition-colors"
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
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeSettingsTab === item.id;

                    return (
                      <button
                        key={item.id}
                        onClick={() => onSettingsTabChange(item.id)}
                        className={`
                          w-full flex items-center ${collapsed ? 'justify-center' : 'justify-start gap-3'} 
                          px-2 h-9 rounded-lg transition-all duration-200 group relative select-none
                          ${isActive
                            ? 'bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400'
                            : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                          }
                        `}
                      >
                        <Icon
                          className={`
                            h-5 w-5 shrink-0
                            ${isActive
                              ? 'text-orange-600 dark:text-orange-400'
                              : 'text-muted-foreground group-hover:text-foreground'
                            }
                          `}
                          strokeWidth={isActive ? 2.5 : 2}
                        />
                        {!collapsed && (
                          <span className={`flex-1 text-left text-sm ${isActive ? 'font-semibold tracking-tight' : 'font-medium'}`}>
                            {item.label}
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

              {/* Separator */}
              {section.id !== 'workspace' && !collapsed && (
                <div className="pt-4">
                  <div className="h-0 border-t border-[color:var(--border-primary)]" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}