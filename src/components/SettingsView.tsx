import React from 'react';
import { UserRole } from '../types/appointment';
import { Settings } from 'lucide-react';
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

export function SettingsView({ userId, userEmail, activeSettingsTab }: SettingsViewProps) {

  const renderContent = () => {
    switch (activeSettingsTab) {
      case 'account': return <AccountSettings userId={userId} userEmail={userEmail} />;
      case 'credentials': return <CredentialsSettings userId={userId} />;
      case 'availability': return <AvailabilitySettings userId={userId} />;
      case 'license': return <LicenseSettings userId={userId} />;
      case 'insurance': return <InsuranceSettings userId={userId} />;
      case 'notifications': return <NotificationSettings userId={userId} />;
      case 'apps': return <AppsSettings />;
      case 'documents': return <DocumentSettings />;

      default: return (
        // Fallback for sections not yet fully detailed
        <div className="max-w-4xl mx-auto flex flex-col items-center justify-center py-20 animate-in fade-in">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
            <Settings className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Coming Soon</h2>
          <p className="text-muted-foreground mt-2 text-center max-w-md">
            Unknown Section: {activeSettingsTab}
          </p>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-transparent p-0 max-w-[1600px] mx-auto font-sans">
      {renderContent()}
    </div>
  );
}
