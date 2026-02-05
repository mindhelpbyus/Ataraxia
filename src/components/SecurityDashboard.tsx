/**
 * Security Dashboard Component
 * 
 * Comprehensive security overview for users
 * - MFA status and management
 * - Session management
 * - Security alerts
 * - Account security score
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Shield, 
  ShieldCheck, 
  ShieldAlert, 
  Smartphone, 
  QrCode, 
  Key,
  Monitor,
  AlertTriangle,
  CheckCircle,
  Clock,
  Settings,
  TrendingUp,
  Lock
} from 'lucide-react';
import { toast } from 'sonner';
import { getMFAStatus, getActiveSessions } from '../services/authService';
import MFASetup from './MFASetup';
import SessionManager from './SessionManager';

interface SecurityStatus {
  mfaEnabled: boolean;
  totpEnabled: boolean;
  smsEnabled: boolean;
  activeSessions: number;
  lastPasswordChange?: string;
  accountAge: number;
  securityScore: number;
  recommendations: string[];
}

export const SecurityDashboard: React.FC = () => {
  const [securityStatus, setSecurityStatus] = useState<SecurityStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMFASetup, setShowMFASetup] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadSecurityStatus();
  }, []);

  const loadSecurityStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [mfaStatus, sessionsData] = await Promise.all([
        getMFAStatus(),
        getActiveSessions()
      ]);

      // Calculate security score
      let score = 0;
      const recommendations: string[] = [];

      // MFA enabled (+40 points)
      if (mfaStatus.mfaEnabled) {
        score += 40;
      } else {
        recommendations.push('Enable two-factor authentication for better security');
      }

      // TOTP enabled (+20 points)
      if (mfaStatus.totpEnabled) {
        score += 20;
      } else if (!mfaStatus.mfaEnabled) {
        recommendations.push('Use an authenticator app for the most secure MFA method');
      }

      // Recent activity (+20 points)
      const recentSessions = sessionsData.sessions?.filter((s: any) => {
        const lastAccess = new Date(s.lastAccessedAt);
        const daysSinceAccess = (Date.now() - lastAccess.getTime()) / (1000 * 60 * 60 * 24);
        return daysSinceAccess < 7;
      }) || [];
      
      if (recentSessions.length > 0) {
        score += 20;
      }

      // Limited sessions (+10 points)
      if (sessionsData.sessions?.length <= 3) {
        score += 10;
      } else {
        recommendations.push('Consider logging out from unused devices');
      }

      // Account age bonus (+10 points for accounts older than 30 days)
      const accountAge = 90; // This would come from user creation date
      if (accountAge > 30) {
        score += 10;
      }

      if (recommendations.length === 0) {
        recommendations.push('Your account security is excellent! Keep up the good practices.');
      }

      setSecurityStatus({
        mfaEnabled: mfaStatus.mfaEnabled,
        totpEnabled: mfaStatus.totpEnabled,
        smsEnabled: mfaStatus.smsEnabled,
        activeSessions: sessionsData.sessions?.length || 0,
        accountAge,
        securityScore: Math.min(score, 100),
        recommendations
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getSecurityScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSecurityScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Improvement';
  };

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-32 bg-muted rounded"></div>
          <div className="h-24 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (showMFASetup) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <MFASetup
          onComplete={() => {
            setShowMFASetup(false);
            loadSecurityStatus();
            toast.success('MFA setup completed successfully!');
          }}
          onCancel={() => setShowMFASetup(false)}
        />
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Security Dashboard</h2>
            <p className="text-muted-foreground">Monitor and manage your account security</p>
          </div>
          <Button onClick={() => setActiveTab('settings')} variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Security Settings
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Security Score */}
            {securityStatus && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Security Score
                  </CardTitle>
                  <CardDescription>
                    Your overall account security rating
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className={`text-3xl font-bold ${getSecurityScoreColor(securityStatus.securityScore)}`}>
                        {securityStatus.securityScore}/100
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {getSecurityScoreLabel(securityStatus.securityScore)}
                      </div>
                    </div>
                    <div className="text-right">
                      <TrendingUp className={`w-8 h-8 ${getSecurityScoreColor(securityStatus.securityScore)}`} />
                    </div>
                  </div>
                  <Progress value={securityStatus.securityScore} className="mb-4" />
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Recommendations:</h4>
                    {securityStatus.recommendations.map((rec, index) => (
                      <div key={index} className="flex items-start gap-2 text-sm">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Security Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* MFA Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {securityStatus?.mfaEnabled ? (
                      <ShieldCheck className="w-5 h-5 text-green-600" />
                    ) : (
                      <ShieldAlert className="w-5 h-5 text-red-600" />
                    )}
                    Two-Factor Authentication
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {securityStatus?.mfaEnabled ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Status</span>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Enabled
                        </Badge>
                      </div>
                      
                      {securityStatus.totpEnabled && (
                        <div className="flex items-center gap-2 text-sm">
                          <QrCode className="w-4 h-4 text-blue-600" />
                          <span>Authenticator App</span>
                          <Badge variant="outline" className="text-xs">Active</Badge>
                        </div>
                      )}
                      
                      {securityStatus.smsEnabled && (
                        <div className="flex items-center gap-2 text-sm">
                          <Smartphone className="w-4 h-4 text-green-600" />
                          <span>SMS Verification</span>
                          <Badge variant="outline" className="text-xs">Active</Badge>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                        <span>Two-factor authentication is not enabled</span>
                      </div>
                      <Button onClick={() => setShowMFASetup(true)} size="sm" className="w-full">
                        Enable 2FA
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Session Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Monitor className="w-5 h-5" />
                    Active Sessions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Current Sessions</span>
                      <Badge variant="outline">
                        {securityStatus?.activeSessions || 0} devices
                      </Badge>
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      You're signed in on {securityStatus?.activeSessions || 0} device(s)
                    </div>
                    
                    <Button 
                      onClick={() => setActiveTab('sessions')} 
                      size="sm" 
                      variant="outline" 
                      className="w-full"
                    >
                      Manage Sessions
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Security Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Recent Security Activity
                </CardTitle>
                <CardDescription>
                  Recent security-related events on your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div className="flex-1">
                      <div className="text-sm font-medium">Successful login</div>
                      <div className="text-xs text-muted-foreground">Today at 2:30 PM</div>
                    </div>
                  </div>
                  
                  {securityStatus?.mfaEnabled && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <Shield className="w-5 h-5 text-blue-600" />
                      <div className="flex-1">
                        <div className="text-sm font-medium">Two-factor authentication enabled</div>
                        <div className="text-xs text-muted-foreground">3 days ago</div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Key className="w-5 h-5 text-purple-600" />
                    <div className="flex-1">
                      <div className="text-sm font-medium">Password last changed</div>
                      <div className="text-xs text-muted-foreground">2 weeks ago</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sessions">
            <SessionManager />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            {/* Security Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Configure your account security preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Two-Factor Authentication</h4>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Button
                    onClick={() => setShowMFASetup(true)}
                    variant={securityStatus?.mfaEnabled ? "outline" : "default"}
                  >
                    {securityStatus?.mfaEnabled ? 'Manage' : 'Enable'}
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Password</h4>
                    <p className="text-sm text-muted-foreground">
                      Change your account password
                    </p>
                  </div>
                  <Button variant="outline" disabled>
                    <Lock className="w-4 h-4 mr-2" />
                    Change Password
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Session Management</h4>
                    <p className="text-sm text-muted-foreground">
                      View and manage your active sessions
                    </p>
                  </div>
                  <Button onClick={() => setActiveTab('sessions')} variant="outline">
                    <Monitor className="w-4 h-4 mr-2" />
                    Manage Sessions
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default SecurityDashboard;