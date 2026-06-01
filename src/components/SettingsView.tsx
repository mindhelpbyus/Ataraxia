import React from 'react';
import { UserRole } from '../types/appointment';
import {
  Building2,
  FolderLock,
  Receipt,
  BarChart3,
  Download,
  Bot,
  Users,
  Wallet,
  CreditCard,
  RefreshCw,
  Briefcase,
  Package,
  ShieldCheck,
  Target,
  ClipboardList,
  Filter,
  Code2,
  BookOpen,
  Mail,
  MessageSquare,
  Settings,
} from 'lucide-react';
import { AccountSettings } from './settings/AccountSettings';
import { CredentialsSettings } from './settings/CredentialsSettings';
import { AvailabilitySettings } from './settings/AvailabilitySettings';
import { LicenseSettings } from './settings/LicenseSettings';
import { InsuranceSettings } from './settings/InsuranceSettings';
import { NotificationSettings } from './settings/NotificationSettings';
import { AppsSettings } from './settings/AppsSettings';
import { DocumentSettings } from './settings/DocumentSettings';

interface SettingsViewProps {
  userId: string;
  userEmail: string;
  userRole: UserRole;
  activeSettingsTab: string;
  setActiveSettingsTab: (tab: string) => void;
  showSettingsNav: boolean;
  handleBackFromSettings: () => void;
}

/** Clean "Coming soon" leaf, matching DashboardLayout's SectionPlaceholder. */
function SettingsPlaceholder({
  icon: Icon,
  title,
  desc,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
}) {
  return (
    <div className="max-w-3xl mx-auto flex flex-col items-center justify-center text-center py-24 px-6">
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

export function SettingsView({ userId, userEmail, userRole, activeSettingsTab }: SettingsViewProps) {
  const renderContent = () => {
    switch (activeSettingsTab) {
      // ── Operations (real pages) ─────────────────────────────────────────
      case 'account': return <AccountSettings userId={userId} userEmail={userEmail} userRole={userRole} />;
      case 'clinical-info':
      case 'credentials': return <CredentialsSettings userId={userId} />;
      case 'license': return <LicenseSettings userId={userId} />;
      case 'notifications': return <NotificationSettings userId={userId} />;
      case 'apps': return <AppsSettings />;

      // ── Operations (stubs) ──────────────────────────────────────────────
      case 'practice-details':
        return <SettingsPlaceholder icon={Building2} title="Practice details" desc="Practice name, time zone, logo, office locations, telehealth, and billing addresses." />;
      case 'business-files':
        return <SettingsPlaceholder icon={FolderLock} title="Business files" desc="A secure, DPDP-aligned place to store and share your practice's files." />;
      case 'plan-info':
        return <SettingsPlaceholder icon={Receipt} title="Plan info" desc="Your current plan, add-ons, and subscription receipts." />;
      case 'analytics-settings':
        return <SettingsPlaceholder icon={BarChart3} title="Analytics" desc="Manage what's tracked and how analytics reports are generated." />;
      case 'data-export':
        return <SettingsPlaceholder icon={Download} title="Data export" desc="Export your practice data (clients, notes, billing) on demand." />;
      case 'demo-client':
        return <SettingsPlaceholder icon={Bot} title="Demo client" desc="Turn the demo client on or off to explore the platform safely." />;
      case 'team':
        return <SettingsPlaceholder icon={Users} title="Team" desc="Invite members, assign roles (Basic / Billing / Full client list / Entire practice), and set up supervision." />;

      // ── Billing ─────────────────────────────────────────────────────────
      case 'insurance': // legacy id — now "Payment & Compliance"
        return <InsuranceSettings userId={userId} />;
      case 'client-billing':
        return <SettingsPlaceholder icon={Wallet} title="Client billing" desc="Billing-document defaults, statements, and superbills for your clients." />;
      case 'online-payments':
        return <SettingsPlaceholder icon={CreditCard} title="Online payments" desc="Set up Razorpay so clients can pay securely from the client portal. Always PCI-aligned." />;
      case 'autopay':
        return <SettingsPlaceholder icon={RefreshCw} title="AutoPay" desc="Automatically apply credits and payments to invoices on a schedule you control." />;
      case 'services':
        return <SettingsPlaceholder icon={Briefcase} title="Services" desc="Manage your session types and set rates (individual, couples, group, intake). India session coding — not US CPT." />;
      case 'products':
        return <SettingsPlaceholder icon={Package} title="Products" desc="Manage products and set their rates." />;

      // ── Client care ─────────────────────────────────────────────────────
      case 'availability': return <AvailabilitySettings userId={userId} />;
      case 'documents': return <DocumentSettings />;

      case 'client-portal':
        return <SettingsPlaceholder icon={ShieldCheck} title="Client portal permissions" desc="Online appointment requests, client permissions, portal greeting, and your default domain." />;
      case 'caseload':
        return <SettingsPlaceholder icon={Target} title="Caseload management" desc="Set and track caseload goals across your practice." />;
      case 'contact-form':
        return <SettingsPlaceholder icon={ClipboardList} title="Contact form" desc="Send website inquiries directly into your Ataraxia inbox." />;
      case 'prescreener':
        return <SettingsPlaceholder icon={Filter} title="Prescreener" desc="Collect information to determine if a prospective client is a good fit before booking." />;
      case 'widgets':
        return <SettingsPlaceholder icon={Code2} title="Widgets" desc="Embed appointment-request and contact forms on your own website." />;
      case 'template-library':
        return <SettingsPlaceholder icon={BookOpen} title="Template library" desc="Organize the intake docs, progress notes, treatment plans, and scored measures your practice uses." />;
      case 'client-notifications':
        return <SettingsPlaceholder icon={Mail} title="Client notifications" desc="Appointment reminders and automated client messages over SMS, email, and push." />;
      case 'messaging':
        return <SettingsPlaceholder icon={MessageSquare} title="Messaging" desc="Secure client and team messaging settings." />;

      default:
        return (
          <SettingsPlaceholder
            icon={Settings}
            title="Coming soon"
            desc={`This settings section isn't available yet (${activeSettingsTab}).`}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-transparent p-0 max-w-[1600px] mx-auto font-sans">
      {renderContent()}
    </div>
  );
}
