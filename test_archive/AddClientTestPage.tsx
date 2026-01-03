import React, { useState } from 'react';
import { ComprehensiveClientRegistrationForm } from './ComprehensiveClientRegistrationForm';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from 'sonner@2.0.3';
import { 
  UserPlus, Mail, Phone, Link2, Copy, Send, ArrowRight,
  CheckCircle2, User, Calendar, FileText, ExternalLink,
  Sparkles, Clock, Shield
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

interface ClientInvite {
  id: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  registrationLink: string;
  status: 'pending' | 'completed' | 'expired';
  createdAt: Date;
  expiresAt: Date;
}

export function AddClientTestPage() {
  const [showDialog, setShowDialog] = useState(false);
  const [registrationMode, setRegistrationMode] = useState<'self-register' | 'admin-assisted' | null>(null);
  const [showComprehensiveForm, setShowComprehensiveForm] = useState(false);
  
  // Form state for generating invitation
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePhone, setInvitePhone] = useState('');
  const [inviteFirstName, setInviteFirstName] = useState('');
  const [inviteLastName, setInviteLastName] = useState('');
  
  // Mock client invites
  const [clientInvites, setClientInvites] = useState<ClientInvite[]>([
    {
      id: 'INV-001',
      email: 'sarah.johnson@email.com',
      phone: '+1 (555) 123-4567',
      firstName: 'Sarah',
      lastName: 'Johnson',
      registrationLink: 'https://ataraxia.app/register/abc123xyz',
      status: 'completed',
      createdAt: new Date('2024-11-20'),
      expiresAt: new Date('2024-11-27')
    },
    {
      id: 'INV-002',
      email: 'michael.chen@email.com',
      phone: '+1 (555) 234-5678',
      firstName: 'Michael',
      lastName: 'Chen',
      registrationLink: 'https://ataraxia.app/register/def456uvw',
      status: 'pending',
      createdAt: new Date('2024-11-25'),
      expiresAt: new Date('2024-12-02')
    }
  ]);

  // Handle Add Client button click
  const handleAddClientClick = () => {
    setShowDialog(true);
    setRegistrationMode(null);
  };

  // Handle registration mode selection
  const handleModeSelect = (mode: 'self-register' | 'admin-assisted') => {
    setRegistrationMode(mode);
    if (mode === 'admin-assisted') {
      setShowDialog(false);
      setShowComprehensiveForm(true);
    }
  };

  // Generate registration link
  const handleGenerateLink = () => {
    if (!inviteEmail || !inviteFirstName || !inviteLastName) {
      toast.error('Please fill in all required fields');
      return;
    }

    const token = Math.random().toString(36).substring(2, 15);
    const newInvite: ClientInvite = {
      id: `INV-${String(clientInvites.length + 1).padStart(3, '0')}`,
      email: inviteEmail,
      phone: invitePhone,
      firstName: inviteFirstName,
      lastName: inviteLastName,
      registrationLink: `https://ataraxia.app/register/${token}`,
      status: 'pending',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    };

    setClientInvites([newInvite, ...clientInvites]);
    
    toast.success('Registration Link Generated! 🎉', {
      description: 'The link has been copied to your clipboard'
    });

    // Copy to clipboard
    navigator.clipboard.writeText(newInvite.registrationLink);

    // Reset form
    setInviteEmail('');
    setInvitePhone('');
    setInviteFirstName('');
    setInviteLastName('');
  };

  // Send invitation email/SMS
  const handleSendInvitation = (method: 'email' | 'sms') => {
    if (!inviteEmail || !inviteFirstName || !inviteLastName) {
      toast.error('Please fill in all required fields');
      return;
    }

    handleGenerateLink();

    if (method === 'email') {
      toast.success('Email Sent! 📧', {
        description: `Registration invitation sent to ${inviteEmail}`
      });
    } else {
      toast.success('SMS Sent! 📱', {
        description: `Registration link sent to ${invitePhone}`
      });
    }
  };

  // Copy link to clipboard
  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    toast.success('Link Copied!', {
      description: 'Registration link copied to clipboard'
    });
  };

  // Handle form completion
  const handleRegistrationComplete = (data: any) => {
    toast.success('Client Added Successfully! 🎉', {
      description: `${data.firstName} ${data.lastName} has been registered`
    });
    setShowComprehensiveForm(false);
    
    // Update invite status if it exists
    const matchingInvite = clientInvites.find(
      inv => inv.email === data.email
    );
    if (matchingInvite) {
      setClientInvites(clientInvites.map(inv =>
        inv.id === matchingInvite.id
          ? { ...inv, status: 'completed' as const }
          : inv
      ));
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      expired: 'bg-red-100 text-red-800'
    };
    return (
      <Badge className={styles[status as keyof typeof styles]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  // If showing comprehensive form
  if (showComprehensiveForm) {
    return (
      <div className="min-h-screen bg-background">
        <div className="bg-white border-b sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold">Add New Client (Admin-Assisted)</h1>
                <p className="text-sm text-muted-foreground">Complete the registration on behalf of the client</p>
              </div>
              <Button variant="outline" onClick={() => setShowComprehensiveForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
        
        <ComprehensiveClientRegistrationForm
          clientEmail={inviteEmail}
          clientPhone={invitePhone}
          clientFirstName={inviteFirstName}
          clientLastName={inviteLastName}
          registrationToken="ADMIN-ASSISTED"
          onComplete={handleRegistrationComplete}
          organizationMode={false}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold mb-2">Client Management</h1>
            <p className="text-muted-foreground">
              Add new clients and manage registration invitations
            </p>
          </div>
          <Button onClick={handleAddClientClick} size="lg" className="gap-2">
            <UserPlus className="h-5 w-5" />
            Add Client
          </Button>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Two Registration Options
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Choose between client self-registration or admin-assisted registration
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Pending Invitations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {clientInvites.filter(inv => inv.status === 'pending').length}
              </div>
              <p className="text-xs text-muted-foreground">Awaiting completion</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {clientInvites.filter(inv => inv.status === 'completed').length}
              </div>
              <p className="text-xs text-muted-foreground">Registered clients</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Invitations */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Registration Invitations</CardTitle>
            <CardDescription>
              Track client registration links and their status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {clientInvites.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <User className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No client invitations yet</p>
                  <p className="text-sm">Click "Add Client" to get started</p>
                </div>
              ) : (
                clientInvites.map((invite) => (
                  <div key={invite.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {invite.firstName} {invite.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground">{invite.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground ml-13">
                        <span>Sent: {invite.createdAt.toLocaleDateString()}</span>
                        <span>Expires: {invite.expiresAt.toLocaleDateString()}</span>
                        <span className="flex items-center gap-1">
                          <Link2 className="h-3 w-3" />
                          {invite.id}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(invite.status)}
                      {invite.status === 'pending' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopyLink(invite.registrationLink)}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Link
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Add Client Dialog */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">Add New Client</DialogTitle>
              <DialogDescription>
                Choose how you'd like to register this client
              </DialogDescription>
            </DialogHeader>

            {!registrationMode ? (
              /* Mode Selection */
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Self-Registration Option */}
                  <button
                    onClick={() => handleModeSelect('self-register')}
                    className="p-6 border-2 rounded-lg text-left hover:border-primary hover:bg-primary/5 transition-all group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <Send className="h-6 w-6 text-primary" />
                      </div>
                      <Badge variant="outline">Recommended</Badge>
                    </div>
                    <h3 className="font-semibold text-lg mb-2">Client Self-Registration</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Send the client a secure registration link via email or SMS. They complete the intake form on their own device.
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>HIPAA-compliant secure link</span>
                      </div>
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Client completes at their pace</span>
                      </div>
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Two-factor authentication</span>
                      </div>
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Automatic reminder emails</span>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 inline mr-1" />
                        Link expires in 7 days
                      </p>
                    </div>
                  </button>

                  {/* Admin-Assisted Option */}
                  <button
                    onClick={() => handleModeSelect('admin-assisted')}
                    className="p-6 border-2 rounded-lg text-left hover:border-primary hover:bg-primary/5 transition-all group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="h-12 w-12 rounded-lg bg-amber-100 flex items-center justify-center group-hover:bg-amber-200 transition-colors">
                        <FileText className="h-6 w-6 text-amber-600" />
                      </div>
                    </div>
                    <h3 className="font-semibold text-lg mb-2">Admin-Assisted Registration</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Complete the comprehensive intake form on behalf of the client during their visit or phone call.
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Immediate registration</span>
                      </div>
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Admin guides the process</span>
                      </div>
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>No client email required</span>
                      </div>
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Perfect for phone intake</span>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 inline mr-1" />
                        Takes 10-15 minutes
                      </p>
                    </div>
                  </button>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                  <div className="flex gap-2">
                    <Shield className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-900">
                      <p className="font-medium mb-1">HIPAA Compliance</p>
                      <p>Both methods are fully HIPAA-compliant and use encrypted transmission. All client data is protected according to healthcare privacy regulations.</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Self-Registration Form */
              <div className="space-y-6 mt-4">
                <Tabs defaultValue="email" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="email" className="gap-2">
                      <Mail className="h-4 w-4" />
                      Send via Email
                    </TabsTrigger>
                    <TabsTrigger value="sms" className="gap-2">
                      <Phone className="h-4 w-4" />
                      Send via SMS
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="email" className="space-y-4 mt-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Client Information</CardTitle>
                        <CardDescription>
                          Enter the client's details to generate a registration link
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>First Name *</Label>
                            <Input
                              value={inviteFirstName}
                              onChange={(e) => setInviteFirstName(e.target.value)}
                              placeholder="Sarah"
                            />
                          </div>
                          <div>
                            <Label>Last Name *</Label>
                            <Input
                              value={inviteLastName}
                              onChange={(e) => setInviteLastName(e.target.value)}
                              placeholder="Johnson"
                            />
                          </div>
                        </div>

                        <div>
                          <Label>Email Address *</Label>
                          <Input
                            type="email"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            placeholder="client@email.com"
                          />
                        </div>

                        <div>
                          <Label>Phone Number (Optional)</Label>
                          <Input
                            type="tel"
                            value={invitePhone}
                            onChange={(e) => setInvitePhone(e.target.value)}
                            placeholder="+1 (555) 123-4567"
                          />
                        </div>

                        <Separator />

                        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                          <h4 className="font-medium text-sm">What will the client receive?</h4>
                          <div className="space-y-2 text-sm text-muted-foreground">
                            <div className="flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                              <p>Personalized email with secure registration link</p>
                            </div>
                            <div className="flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                              <p>Instructions for completing the intake form</p>
                            </div>
                            <div className="flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                              <p>Reminder email 24 hours before expiration</p>
                            </div>
                            <div className="flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                              <p>Link valid for 7 days</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <Button 
                            onClick={() => handleSendInvitation('email')} 
                            className="flex-1"
                            size="lg"
                          >
                            <Send className="h-4 w-4 mr-2" />
                            Send Email Invitation
                          </Button>
                          <Button 
                            onClick={handleGenerateLink} 
                            variant="outline"
                            size="lg"
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            Copy Link Only
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="sms" className="space-y-4 mt-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Client Information</CardTitle>
                        <CardDescription>
                          Send registration link via text message
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>First Name *</Label>
                            <Input
                              value={inviteFirstName}
                              onChange={(e) => setInviteFirstName(e.target.value)}
                              placeholder="Sarah"
                            />
                          </div>
                          <div>
                            <Label>Last Name *</Label>
                            <Input
                              value={inviteLastName}
                              onChange={(e) => setInviteLastName(e.target.value)}
                              placeholder="Johnson"
                            />
                          </div>
                        </div>

                        <div>
                          <Label>Phone Number *</Label>
                          <Input
                            type="tel"
                            value={invitePhone}
                            onChange={(e) => setInvitePhone(e.target.value)}
                            placeholder="+1 (555) 123-4567"
                          />
                        </div>

                        <div>
                          <Label>Email Address (Optional)</Label>
                          <Input
                            type="email"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            placeholder="client@email.com"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Recommended for account creation
                          </p>
                        </div>

                        <Separator />

                        <div className="bg-gray-50 rounded-lg p-4">
                          <h4 className="font-medium text-sm mb-2">SMS Preview:</h4>
                          <div className="bg-white border rounded-lg p-3 text-sm">
                            <p className="text-gray-700">
                              Hi {inviteFirstName || '[Name]'}! Complete your registration for Wellness Center: 
                              https://ataraxia.app/register/abc123
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                              SMS rates may apply
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <Button 
                            onClick={() => handleSendInvitation('sms')} 
                            className="flex-1"
                            size="lg"
                          >
                            <Phone className="h-4 w-4 mr-2" />
                            Send SMS Invitation
                          </Button>
                          <Button 
                            onClick={handleGenerateLink} 
                            variant="outline"
                            size="lg"
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            Copy Link Only
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>

                <Button 
                  variant="ghost" 
                  onClick={() => setRegistrationMode(null)}
                  className="w-full"
                >
                  ← Back to Options
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
