/**
 * Session Manager Component
 * 
 * Provides UI for managing user sessions across devices
 * - View active sessions
 * - Session analytics
 * - Force logout from other devices
 * - Device trust management
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import {
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  Clock,
  MapPin,
  Shield,
  LogOut,
  AlertTriangle,
  Activity,
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';
import { getActiveSessions, invalidateAllSessions } from '../api/auth';

interface SessionInfo {
  id: string;
  deviceInfo: {
    userAgent: string;
    ipAddress: string;
    platform?: string;
    browser?: string;
    os?: string;
    deviceType?: string;
  };
  createdAt: string;
  lastAccessedAt: string;
  isActive: boolean;
  isCurrent?: boolean;
  location?: {
    city?: string;
    country?: string;
  };
}

interface SessionAnalytics {
  totalSessions: number;
  activeSessions: number;
  averageSessionDuration: number;
  deviceBreakdown: Record<string, number>;
  locationBreakdown: Record<string, number>;
}

export const SessionManager: React.FC = () => {
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [analytics, setAnalytics] = useState<SessionAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [logoutLoading, setLogoutLoading] = useState(false);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getActiveSessions();
      setSessions(response.sessions || []);
      setAnalytics(response.analytics || null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutAllOtherDevices = async () => {
    try {
      setLogoutLoading(true);

      const result = await invalidateAllSessions(true);

      toast.success(`Logged out from ${result.invalidatedCount} other devices`);
      await loadSessions(); // Refresh the list
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLogoutLoading(false);
    }
  };

  const getDeviceIcon = (deviceType?: string, userAgent?: string) => {
    if (deviceType === 'mobile' || userAgent?.toLowerCase().includes('mobile')) {
      return <Smartphone className="w-5 h-5" />;
    }
    if (deviceType === 'tablet' || userAgent?.toLowerCase().includes('tablet')) {
      return <Tablet className="w-5 h-5" />;
    }
    return <Monitor className="w-5 h-5" />;
  };

  const formatLastAccessed = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  const getBrowserName = (userAgent: string) => {
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown Browser';
  };

  const getOSName = (userAgent: string) => {
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac')) return 'macOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iOS')) return 'iOS';
    return 'Unknown OS';
  };

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-32 bg-muted rounded"></div>
          <div className="h-24 bg-muted rounded"></div>
          <div className="h-24 bg-muted rounded"></div>
        </div>
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
            <h2 className="text-2xl font-bold">Session Management</h2>
            <p className="text-muted-foreground">Manage your active sessions across all devices</p>
          </div>
          <Button
            onClick={handleLogoutAllOtherDevices}
            disabled={logoutLoading || sessions.filter(s => !s.isCurrent).length === 0}
            variant="destructive"
            className="flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            {logoutLoading ? 'Logging out...' : 'Logout All Other Devices'}
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Analytics */}
        {analytics && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Session Analytics
              </CardTitle>
              <CardDescription>Usage statistics for the last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{analytics.totalSessions}</div>
                  <div className="text-sm text-muted-foreground">Total Sessions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{analytics.activeSessions}</div>
                  <div className="text-sm text-muted-foreground">Active Sessions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {Math.round(analytics.averageSessionDuration)}m
                  </div>
                  <div className="text-sm text-muted-foreground">Avg Duration</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {Object.keys(analytics.deviceBreakdown).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Device Types</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Active Sessions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Active Sessions ({sessions.length})
            </CardTitle>
            <CardDescription>
              Sessions where you're currently logged in
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sessions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Monitor className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No active sessions found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sessions.map((session) => (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-4 rounded-lg border ${session.isCurrent
                        ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950'
                        : 'border-border bg-card'
                      }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          {getDeviceIcon(session.deviceInfo.deviceType, session.deviceInfo.userAgent)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">
                              {getBrowserName(session.deviceInfo.userAgent)} on {getOSName(session.deviceInfo.userAgent)}
                            </h4>
                            {session.isCurrent && (
                              <Badge variant="secondary" className="text-xs">
                                <Shield className="w-3 h-3 mr-1" />
                                Current Session
                              </Badge>
                            )}
                          </div>

                          <div className="space-y-1 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Globe className="w-4 h-4" />
                              <span>{session.deviceInfo.ipAddress}</span>
                              {session.location && (
                                <>
                                  <MapPin className="w-4 h-4 ml-2" />
                                  <span>{session.location.city}, {session.location.country}</span>
                                </>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              <span>Last active: {formatLastAccessed(session.lastAccessedAt)}</span>
                            </div>

                            <div className="text-xs opacity-75">
                              Created: {new Date(session.createdAt).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge variant={session.isActive ? 'default' : 'secondary'}>
                          {session.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Security Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Security Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <p>
                  <strong>Review regularly:</strong> Check your active sessions periodically to ensure all devices are yours.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <p>
                  <strong>Logout when done:</strong> Always log out from shared or public computers.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                <p>
                  <strong>Suspicious activity:</strong> If you see unfamiliar sessions, log out all devices immediately and change your password.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default SessionManager;