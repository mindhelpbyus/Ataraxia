import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import { UserRole } from '../types/appointment';
import { AvatarGalleryDialog } from './AvatarGalleryDialog';

// Placeholder function for profile photo update (to be implemented with new auth system)
const updateProfilePhoto = async (userId: string, photoUrl: string) => {
  console.log('Profile photo update not yet implemented with new auth system');
  throw new Error('Profile photo update not yet implemented');
};
import {
  Camera,
  Mail,
  Shield,
  Smartphone,
  Globe,
  Bell,
  Moon,
  Sun,
  Laptop,
  LogOut,
  Check,
  AlertTriangle,
  CreditCard,
  Slack,
  Calendar,
  Figma,
  Github,
  Settings,
  Lock,
  Key,
  History,
  ShieldCheck,
  User
} from 'lucide-react';

interface SettingsViewProps {
  userEmail: string;
  userRole: UserRole;
  activeSettingsTab: string;
  setActiveSettingsTab: (tab: string) => void;
  showSettingsNav: boolean;
  handleBackFromSettings: () => void;
}

// Vertical Stacked Layout (Standard SaaS/Dashboard Style)
const SettingsSection = ({ title, description, children, danger = false }: { title: string, description: string, children: React.ReactNode, danger?: boolean }) => (
  <div className="mb-10 animate-in slide-in-from-bottom-2 duration-500">
    <div className="mb-4 px-1">
      <h3 className={`text-lg font-semibold tracking-tight ${danger ? 'text-rose-700' : 'text-foreground'}`}>{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">{description}</p>
    </div>
    <Card className={`overflow-hidden border-border/60 shadow-sm ${danger ? 'border-rose-200 bg-rose-50/10' : 'bg-card'}`}>
      {children}
    </Card>
  </div>
);

export function SettingsView({ userEmail, userRole, activeSettingsTab }: SettingsViewProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showAvatarGallery, setShowAvatarGallery] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // -- Account Form State --
  const [profileData, setProfileData] = useState({
    firstName: userEmail.split('@')[0].split('.')[0] || 'User',
    lastName: userEmail.split('@')[0].split('.')[1] || '',
    email: userEmail,
    photoURL: ''
  });

  const handleAvatarSelect = (avatarUrl: string) => {
    setProfileData(prev => ({ ...prev, photoURL: avatarUrl }));
    toast.success('Avatar selected! Click "Save Changes" to update your profile.');
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      setIsLoading(true);
      try {
        // Mock upload: Create a local URL for instant preview
        const downloadURL = URL.createObjectURL(file);

        // Update the profile in Firestore with this (mock) URL
        // In production, we'd upload to Storage first, then save that URL
        await updateProfilePhoto('', downloadURL); // Pass actual userId when available

        setProfileData(prev => ({ ...prev, photoURL: downloadURL }));
        toast.success('Profile photo updated');
      } catch (error) {
        console.error('Error updating photo:', error);
        toast.error('Failed to update profile photo');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // -- Render Functions --

  const renderProfileSettings = () => (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="mb-10 pt-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">Account Settings</h1>
        <p className="text-muted-foreground text-lg">Manage your personal information, security, and login sessions.</p>
      </div>

      <SettingsSection
        title="Public Profile"
        description="This information will be displayed to your colleagues and clients."
      >
        <CardContent className="p-8 space-y-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 border-b border-border/50 pb-8">
            <div className="relative group shrink-0">
              <Avatar className="w-28 h-28 border-4 border-background shadow-lg">
                <AvatarImage src={profileData.photoURL} />
                <AvatarFallback className="text-3xl bg-muted text-muted-foreground font-semibold">
                  {profileData.firstName[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-[1px]"
              >
                <Camera className="w-8 h-8 text-white/90" />
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileSelect} />
            </div>

            <div className="text-center sm:text-left pt-2 space-y-4 flex-1">
              <div>
                <h4 className="font-medium text-foreground text-lg">Profile Photo</h4>
                <p className="text-sm text-muted-foreground mt-1 mx-auto sm:mx-0 max-w-[250px]">
                  Recommended 400x400px. JPG or PNG. Max 5MB.
                </p>
              </div>
              <div className="flex gap-3 justify-center sm:justify-start">
                <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="h-9 px-4 font-medium">Upload New</Button>
                <Button variant="outline" size="sm" onClick={() => setShowAvatarGallery(true)} className="h-9 px-4 font-medium"><User className="w-4 h-4 mr-2" />Choose Avatar</Button>
                <Button variant="ghost" size="sm" className="h-9 px-4 text-muted-foreground hover:text-destructive hover:bg-destructive/10">Remove</Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium">First Name</Label>
              <Input value={profileData.firstName} onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })} className="h-10" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Last Name</Label>
              <Input value={profileData.lastName} onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })} className="h-10" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label className="text-sm font-medium">Bio / Headline</Label>
              <Input placeholder="e.g. Senior Clinical Psychologist" className="h-10" />
              <p className="text-[13px] text-muted-foreground">Brief description for your client-facing profile.</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-muted/30 border-t border-border/60 p-4 px-8 flex justify-end">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-6 h-10 shadow-sm transition-all">Save Changes</Button>
        </CardFooter>
      </SettingsSection>

      <SettingsSection
        title="Contact Info"
        description="How we can reach you for important updates and account security."
      >
        <CardContent className="p-8 space-y-6">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Email Address</Label>
            <div className="flex gap-3">
              <Input value={profileData.email} disabled className="bg-muted/50 text-muted-foreground h-10 border-border/50 font-medium" />
              <Badge variant="outline" className="h-10 px-3 bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-medium whitespace-nowrap">Verified</Badge>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Phone Number</Label>
            <Input placeholder="+1 (555) 000-0000" className="h-10" />
          </div>
        </CardContent>
      </SettingsSection>

      <SettingsSection
        title="Security"
        description="Manage your password and dual-factor authentication methods."
      >
        <CardContent className="p-0">
          <div className="flex items-center justify-between p-8 border-b border-border/50 hover:bg-muted/20 transition-colors cursor-pointer group">
            <div className="space-y-1">
              <h4 className="font-medium text-foreground text-base group-hover:text-primary transition-colors">Password</h4>
              <p className="text-sm text-muted-foreground">Last changed 3 months ago</p>
            </div>
            <Button variant="outline" className="h-9 font-medium border-border/60"><Key className="w-4 h-4 mr-2 text-muted-foreground" /> Change Password</Button>
          </div>
          <div className="flex items-center justify-between p-8 hover:bg-muted/20 transition-colors cursor-pointer group">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-foreground text-base group-hover:text-primary transition-colors">Two-Factor Authentication</h4>
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 h-auto">Enabled</Badge>
              </div>
              <p className="text-sm text-muted-foreground max-w-md">Secure your account with 2FA using an authenticator app or SMS.</p>
            </div>
            <Button variant="outline" className="h-9 font-medium border-border/60"><ShieldCheck className="w-4 h-4 mr-2 text-muted-foreground" /> Configure</Button>
          </div>
        </CardContent>
      </SettingsSection>

      <SettingsSection
        title="Active Sessions"
        description="Manage devices where you're currently logged in."
      >
        <CardContent className="p-0">
          <div className="flex items-center gap-4 p-6 border-b border-border/50 bg-muted/30">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 shadow-sm border border-emerald-200">
              <Laptop className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-foreground text-sm truncate">MacBook Pro 16"</h4>
                <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-0 h-5 text-[10px] shrink-0">This Device</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">San Francisco, CA • Chrome • Active now</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-6 hover:bg-muted/20 transition-colors">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground shrink-0 border border-border">
              <Smartphone className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-foreground text-sm truncate">iPhone 14 Pro</h4>
              <p className="text-xs text-muted-foreground mt-0.5">Los Angeles, CA • Mobile App • 2 hours ago</p>
            </div>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive h-8 px-3">Revoke</Button>
          </div>
        </CardContent>
      </SettingsSection>

      <SettingsSection
        title="Danger Zone"
        description="Permanent actions that affect your account data."
        danger={true}
      >
        <CardContent className="p-8 flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-rose-700 mb-1">Delete Account</h4>
            <p className="text-sm text-rose-600/80">Permanently remove your account and all associated data.</p>
          </div>
          <Button variant="destructive" className="bg-rose-600 hover:bg-rose-700 border-none shadow-sm shadow-rose-200/50">Delete Account</Button>
        </CardContent>
      </SettingsSection>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="mb-10 pt-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">Notifications</h1>
        <p className="text-muted-foreground text-lg">Control when and how you receive updates.</p>
      </div>

      <SettingsSection title="System Alerts" description="Critical updates regarding security and system health. system alerts can not be fully disabled.">
        <CardContent className="p-0 divide-y divide-border/50">
          {[
            { title: 'Security Alerts', desc: 'Unusual login attempts and password changes', default: true, locked: true },
            { title: 'System Maintenance', desc: 'Planned downtime and platform updates', default: true },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between p-6 hover:bg-muted/20 transition-colors">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <div className="font-medium text-foreground text-base">{item.title}</div>
                  {item.locked && <Lock className="w-3 h-3 text-muted-foreground" />}
                </div>
                <p className="text-sm text-muted-foreground max-w-sm">{item.desc}</p>
              </div>
              <Switch defaultChecked={item.default} disabled={item.locked} />
            </div>
          ))}
        </CardContent>
      </SettingsSection>

      <SettingsSection title="Email Notifications" description="Sent to your registered email address.">
        <CardContent className="p-0 divide-y divide-border/50">
          {[
            { title: 'Appointment Reminders', desc: 'Daily summary of upcoming sessions', default: true },
            { title: 'Client Messages', desc: 'When clients send you a message', default: true },
            { title: 'Billing Reports', desc: 'Monthly invoices and revenue summaries', default: false },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between p-6 hover:bg-muted/20 transition-colors">
              <div className="space-y-0.5">
                <div className="font-medium text-foreground text-base">{item.title}</div>
                <p className="text-sm text-muted-foreground max-w-sm">{item.desc}</p>
              </div>
              <Switch defaultChecked={item.default} />
            </div>
          ))}
        </CardContent>
      </SettingsSection>

      <SettingsSection title="Push Notifications" description="Real-time alerts on your mobile device.">
        <CardContent className="p-0 divide-y divide-border/50">
          {[
            { title: 'Session Starts', desc: '10 minutes before an appointment', default: true },
            { title: 'Urgent Alerts', desc: 'Critical status updates from high-risk clients', default: true },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between p-6 hover:bg-muted/20 transition-colors">
              <div className="space-y-0.5">
                <div className="font-medium text-foreground text-base">{item.title}</div>
                <p className="text-sm text-muted-foreground max-w-sm">{item.desc}</p>
              </div>
              <Switch defaultChecked={item.default} />
            </div>
          ))}
        </CardContent>
      </SettingsSection>
    </div>
  );

  const renderAppsSettings = () => (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500">
      <div className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent mb-2">Connected Apps</h1>
        <p className="text-muted-foreground text-lg">Supercharge your workflow with integrations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { name: 'Google Calendar', desc: 'Sync appointments and availability.', icon: Calendar, connected: true, color: 'text-error-foreground', bg: 'bg-error/10' },
          { name: 'Slack', desc: 'Receive notifications in your team channel.', icon: Slack, connected: false, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/20' },
          { name: 'Stripe', desc: 'Process client payments securely.', icon: CreditCard, connected: true, color: 'text-primary', bg: 'bg-primary/10' },
          { name: 'Zoom', desc: 'Launch video sessions directly.', icon: Camera, connected: true, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/20' },
        ].map((app, i) => (
          <Card key={i} className="flex flex-col justify-between hover:shadow-lg transition-all duration-300 border-border bg-card">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className={`w-14 h-14 rounded-2xl ${app.bg} flex items-center justify-center`}>
                  <app.icon className={`w-8 h-8 ${app.color}`} />
                </div>
                {app.connected ? (
                  <Badge variant="secondary" className="bg-emerald-50 text-emerald-600 border-emerald-100"><Check className="w-3 h-3 mr-1" /> Connected</Badge>
                ) : (
                  <Badge variant="outline" className="text-muted-foreground">Not Connected</Badge>
                )}
              </div>
              <h3 className="font-bold text-lg text-foreground mb-1">{app.name}</h3>
              <p className="text-sm text-muted-foreground">{app.desc}</p>
            </CardContent>
            <CardFooter className="p-6 pt-0">
              {app.connected ? (
                <Button variant="outline" className="w-full border-border">Configure</Button>
              ) : (
                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm">Connect</Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );

  // -- Main Switch --
  const renderContent = () => {
    switch (activeSettingsTab) {
      case 'account': return renderProfileSettings();
      case 'notifications': return renderNotificationSettings();
      case 'apps': return renderAppsSettings();
      default: return (
        // Fallback for sections not yet fully detailed
        <div className="max-w-4xl mx-auto flex flex-col items-center justify-center py-20 animate-in fade-in">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
            <Settings className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Coming Soon</h2>
          <p className="text-muted-foreground mt-2 text-center max-w-md">
            The <span className="font-semibold text-foreground capitalize">{activeSettingsTab.replace('-', ' ')}</span> settings panel is currently under development as part of the Phase 2 rollout.
          </p>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-background p-8 max-w-[1600px] mx-auto font-sans">
      {renderContent()}

      <AvatarGalleryDialog
        open={showAvatarGallery}
        onOpenChange={setShowAvatarGallery}
        onSelectAvatar={handleAvatarSelect}
        selectedAvatar={profileData.photoURL}
      />
    </div>
  );
}