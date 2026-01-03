import React, { useState } from 'react';
import { ClientSelfRegistrationForm } from './ClientSelfRegistrationForm';
import { ComprehensiveClientRegistrationForm } from './ComprehensiveClientRegistrationForm';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Label } from './ui/label';
import { Copy, Check, Mail, Phone, User, Shield, ExternalLink, RefreshCw } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface TestClient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  registrationToken: string;
  scenario: string;
  description: string;
}

export function ClientRegistrationTestPage() {
  const [selectedClient, setSelectedClient] = useState<TestClient | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [formType, setFormType] = useState<'simple' | 'comprehensive'>('comprehensive');

  // Sample test clients with different scenarios
  const testClients: TestClient[] = [
    {
      id: 'TEST-CLIENT-001',
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson@test.com',
      phone: '+1 (555) 100-0001',
      registrationToken: 'TOKEN-SARAH-12345-SECURE',
      scenario: 'Happy Path',
      description: 'Complete all fields correctly, verify via email'
    },
    {
      id: 'TEST-CLIENT-002',
      firstName: 'Michael',
      lastName: 'Chen',
      email: 'michael.chen@test.com',
      phone: '+1 (555) 100-0002',
      registrationToken: 'TOKEN-MICHAEL-67890-SECURE',
      scenario: 'SMS Verification',
      description: 'Uses SMS/phone verification instead of email'
    },
    {
      id: 'TEST-CLIENT-003',
      firstName: 'Emily',
      lastName: 'Rodriguez',
      email: 'emily.rodriguez@test.com',
      phone: '+1 (555) 100-0003',
      registrationToken: 'TOKEN-EMILY-11111-SECURE',
      scenario: 'Minimal Info',
      description: 'Only provides required fields, no optional data'
    },
    {
      id: 'TEST-CLIENT-004',
      firstName: 'James',
      lastName: 'Williams',
      email: 'james.williams@test.com',
      phone: '+1 (555) 100-0004',
      registrationToken: 'TOKEN-JAMES-22222-SECURE',
      scenario: 'Complete Profile',
      description: 'Fills out all optional fields including insurance'
    },
    {
      id: 'TEST-CLIENT-005',
      firstName: 'Maria',
      lastName: 'Garcia',
      email: 'maria.garcia@test.com',
      phone: '+1 (555) 100-0005',
      registrationToken: 'TOKEN-MARIA-33333-SECURE',
      scenario: 'Self-Pay',
      description: 'No insurance, self-pay client'
    }
  ];

  const copyToClipboard = (text: string, tokenId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(tokenId);
    toast.success('Copied to clipboard!', {
      description: 'Registration token copied'
    });
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const generateSecureLink = (client: TestClient) => {
    // In production, this would be your actual domain
    const baseUrl = window.location.origin;
    return `${baseUrl}/register?token=${client.registrationToken}&email=${encodeURIComponent(client.email)}`;
  };

  const handleTestClient = (client: TestClient) => {
    setSelectedClient(client);
    setShowForm(true);
    toast.info('Test Client Selected', {
      description: `Testing scenario: ${client.scenario}`
    });
  };

  const handleRegistrationComplete = () => {
    toast.success('Registration Completed! 🎉', {
      description: 'Client profile has been created successfully'
    });
    setShowForm(false);
    setSelectedClient(null);
  };

  const resetTest = () => {
    setShowForm(false);
    setSelectedClient(null);
    toast.info('Test Reset', {
      description: 'Ready for next test scenario'
    });
  };

  if (showForm && selectedClient) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          {/* Test Info Header */}
          <Card className="mb-6 border-primary">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Testing: {selectedClient.scenario}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {selectedClient.description}
                  </CardDescription>
                </div>
                <Button variant="outline" onClick={resetTest}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset Test
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Client Name</p>
                  <p className="font-medium">{selectedClient.firstName} {selectedClient.lastName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedClient.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{selectedClient.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Token</p>
                  <p className="font-mono text-xs">{selectedClient.registrationToken.substring(0, 20)}...</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Registration Form */}
          {formType === 'comprehensive' ? (
            <ComprehensiveClientRegistrationForm
              clientEmail={selectedClient.email}
              clientPhone={selectedClient.phone}
              clientFirstName={selectedClient.firstName}
              clientLastName={selectedClient.lastName}
              registrationToken={selectedClient.registrationToken}
              onComplete={handleRegistrationComplete}
              organizationMode={selectedClient.id === 'TEST-CLIENT-005'}
            />
          ) : (
            <ClientSelfRegistrationForm
              clientEmail={selectedClient.email}
              clientPhone={selectedClient.phone}
              clientFirstName={selectedClient.firstName}
              clientLastName={selectedClient.lastName}
              registrationToken={selectedClient.registrationToken}
              onComplete={handleRegistrationComplete}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-medium mb-2">Client Registration Testing</h1>
          <p className="text-muted-foreground">
            Test the secure client self-registration flow with sample scenarios
          </p>
        </div>

        {/* Form Type Selector */}
        <Card className="mb-8 border-primary">
          <CardHeader>
            <CardTitle>Select Registration Form Type</CardTitle>
            <CardDescription>Choose between simple or comprehensive HIPAA-compliant intake</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setFormType('simple')}
                className={`p-6 border-2 rounded-lg text-left transition-all ${
                  formType === 'simple' 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Simple Registration</h3>
                  {formType === 'simple' && <Badge variant="default">Selected</Badge>}
                </div>
                <p className="text-sm text-muted-foreground">
                  Basic client registration with essential information only. Quick 2-3 minute setup.
                </p>
              </button>
              <button
                onClick={() => setFormType('comprehensive')}
                className={`p-6 border-2 rounded-lg text-left transition-all ${
                  formType === 'comprehensive' 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Comprehensive HIPAA Intake</h3>
                  {formType === 'comprehensive' && <Badge variant="default">Selected</Badge>}
                </div>
                <p className="text-sm text-muted-foreground">
                  Full clinical intake with insurance, consents, clinical history, and matching preferences. 10-15 minutes.
                </p>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                Secure Process
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Two-step verification with OTP via email or SMS
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                Client Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Pre-filled info with optional fields for client details
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                Token-Based
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Unique registration tokens for each client invitation
              </p>
            </CardContent>
          </Card>
        </div>

        {/* How It Works */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>How the Secure Registration Works</CardTitle>
            <CardDescription>Understanding the client onboarding flow</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="font-semibold text-primary">1</span>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-1">Therapist Sends Invitation</h4>
                <p className="text-sm text-muted-foreground">
                  Therapist creates a client record and system generates a secure registration token. 
                  An email/SMS is sent to the client with a unique link.
                </p>
              </div>
            </div>

            <Separator />

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="font-semibold text-primary">2</span>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-1">Client Verifies Identity</h4>
                <p className="text-sm text-muted-foreground">
                  Client clicks the link and receives a One-Time Password (OTP) via their chosen method (email or SMS). 
                  They enter the OTP to verify their identity.
                </p>
              </div>
            </div>

            <Separator />

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="font-semibold text-primary">3</span>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-1">Client Completes Profile</h4>
                <p className="text-sm text-muted-foreground">
                  After verification, client fills out their profile including personal info, address, 
                  insurance details, and emergency contacts. They create a password for future logins.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Scenarios */}
        <div className="mb-8">
          <h2 className="text-2xl font-medium mb-4">Test Scenarios</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {testClients.map((client) => (
              <Card key={client.id} className="hover:border-primary transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <CardTitle className="text-lg">{client.firstName} {client.lastName}</CardTitle>
                    <Badge variant="outline" className="text-xs">
                      {client.scenario}
                    </Badge>
                  </div>
                  <CardDescription>{client.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{client.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{client.phone}</span>
                    </div>
                  </div>

                  <Separator />

                  {/* Registration Token */}
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1">Registration Token</Label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-xs bg-muted px-2 py-1 rounded font-mono truncate">
                        {client.registrationToken}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(client.registrationToken, client.id)}
                        className="h-7 w-7 p-0"
                      >
                        {copiedToken === client.id ? (
                          <Check className="h-3 w-3 text-green-500" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Secure Link */}
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1">Secure Link</Label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-xs bg-muted px-2 py-1 rounded font-mono truncate">
                        /register?token={client.registrationToken.substring(0, 15)}...
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(generateSecureLink(client), `link-${client.id}`)}
                        className="h-7 w-7 p-0"
                      >
                        {copiedToken === `link-${client.id}` ? (
                          <Check className="h-3 w-3 text-green-500" />
                        ) : (
                          <ExternalLink className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleTestClient(client)}
                    className="w-full"
                  >
                    Test This Scenario
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Testing Tips */}
        <Card>
          <CardHeader>
            <CardTitle>Testing Tips & Validation</CardTitle>
            <CardDescription>What to test in each scenario</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-medium">✅ Things to Verify</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <span>•</span>
                    <span>OTP is sent to correct email/phone</span>
                  </li>
                  <li className="flex gap-2">
                    <span>•</span>
                    <span>Name fields are pre-filled correctly</span>
                  </li>
                  <li className="flex gap-2">
                    <span>•</span>
                    <span>Required fields show validation errors</span>
                  </li>
                  <li className="flex gap-2">
                    <span>•</span>
                    <span>Password strength requirements work</span>
                  </li>
                  <li className="flex gap-2">
                    <span>•</span>
                    <span>Insurance toggle shows/hides fields</span>
                  </li>
                  <li className="flex gap-2">
                    <span>•</span>
                    <span>Date pickers work correctly</span>
                  </li>
                  <li className="flex gap-2">
                    <span>•</span>
                    <span>Success message appears on completion</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">🧪 Test Cases</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <span>•</span>
                    <span>Try wrong OTP code (should fail)</span>
                  </li>
                  <li className="flex gap-2">
                    <span>•</span>
                    <span>Leave required fields empty</span>
                  </li>
                  <li className="flex gap-2">
                    <span>•</span>
                    <span>Try weak password (should show error)</span>
                  </li>
                  <li className="flex gap-2">
                    <span>•</span>
                    <span>Switch between email and SMS verification</span>
                  </li>
                  <li className="flex gap-2">
                    <span>•</span>
                    <span>Fill all optional fields</span>
                  </li>
                  <li className="flex gap-2">
                    <span>•</span>
                    <span>Test with/without insurance</span>
                  </li>
                  <li className="flex gap-2">
                    <span>•</span>
                    <span>Complete full registration flow</span>
                  </li>
                </ul>
              </div>
            </div>

            <Separator />

            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                Mock OTP Code for Testing
              </h4>
              <p className="text-sm text-muted-foreground mb-2">
                Since this is a demo environment, you can use the following test OTP codes:
              </p>
              <div className="flex gap-4">
                <Badge variant="secondary" className="font-mono">123456</Badge>
                <Badge variant="secondary" className="font-mono">111111</Badge>
                <Badge variant="secondary" className="font-mono">000000</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                In production, real OTP codes would be sent via email/SMS
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
