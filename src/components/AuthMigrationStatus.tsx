/**
 * Authentication Migration Status Component
 * 
 * Shows the current authentication system status and migration progress
 * Useful for debugging and monitoring the Firebase to Cognito migration
 */

import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';

interface AuthMigrationStatusProps {
  showDetails?: boolean;
  className?: string;
}

export function AuthMigrationStatus({ showDetails = false, className = '' }: AuthMigrationStatusProps) {
  const { authSystem, authSystemStatus, isAuthenticated, user } = useAuth();

  // Don't show in production unless explicitly enabled
  if (import.meta.env.PROD && !import.meta.env.VITE_SHOW_AUTH_DEBUG) {
    return null;
  }

  const getSystemBadge = (system: 'cognito' | 'firebase', isActive: boolean) => {
    const variant = isActive ? 'default' : 'secondary';
    const icon = isActive ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />;
    
    return (
      <Badge variant={variant} className="flex items-center gap-1">
        {icon}
        {system.toUpperCase()}
      </Badge>
    );
  };

  return (
    <Card className={`border-l-4 border-l-blue-500 ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Info className="w-4 h-4" />
          Authentication Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Current Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Current System:</span>
          {getSystemBadge(authSystem, true)}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">User Status:</span>
          <Badge variant={isAuthenticated ? 'default' : 'secondary'}>
            {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
          </Badge>
        </div>

        {/* System Configuration */}
        {showDetails && (
          <div className="space-y-2 pt-2 border-t">
            <div className="text-xs font-medium text-muted-foreground">System Configuration:</div>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center justify-between">
                <span>Cognito:</span>
                <Badge variant={authSystemStatus.cognitoConfigured ? 'default' : 'destructive'} className="text-xs">
                  {authSystemStatus.cognitoConfigured ? 'Ready' : 'Not Configured'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span>Firebase:</span>
                <Badge variant={authSystemStatus.firebaseConfigured ? 'default' : 'destructive'} className="text-xs">
                  {authSystemStatus.firebaseConfigured ? 'Ready' : 'Not Configured'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span>Fallback:</span>
                <Badge variant={authSystemStatus.fallbackEnabled ? 'default' : 'secondary'} className="text-xs">
                  {authSystemStatus.fallbackEnabled ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span>Primary:</span>
                <Badge variant="outline" className="text-xs">
                  {authSystemStatus.primary.toUpperCase()}
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* User Information */}
        {isAuthenticated && user && showDetails && (
          <div className="space-y-2 pt-2 border-t">
            <div className="text-xs font-medium text-muted-foreground">User Information:</div>
            <div className="text-xs space-y-1">
              <div><strong>ID:</strong> {user.id}</div>
              <div><strong>Email:</strong> {user.email}</div>
              <div><strong>Role:</strong> {user.role}</div>
            </div>
          </div>
        )}

        {/* Migration Notes */}
        {import.meta.env.VITE_ENABLE_MIGRATION_MODE && (
          <div className="text-xs text-muted-foreground bg-blue-50 p-2 rounded">
            <strong>Migration Mode Active:</strong> System is configured for Firebase to Cognito migration.
            Users may experience authentication system changes during this period.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default AuthMigrationStatus;