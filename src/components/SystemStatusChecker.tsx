import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { CheckCircle2, XCircle, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { isFirebaseConfigured, auth, db } from '../config/firebase';
import { signInWithGoogle } from '../services/firebaseAuth';
import { collection, getDocs, query, limit } from 'firebase/firestore';

type CheckStatus = 'pending' | 'checking' | 'success' | 'warning' | 'error';

interface SystemCheck {
  name: string;
  description: string;
  status: CheckStatus;
  message: string;
  action?: string;
}

export function SystemStatusChecker() {
  const [checks, setChecks] = useState<SystemCheck[]>([
    {
      name: 'Firebase Configuration',
      description: 'Verify Firebase is properly configured',
      status: 'pending',
      message: '',
    },
    {
      name: 'Authentication Ready',
      description: 'Check if Firebase Auth is initialized',
      status: 'pending',
      message: '',
    },
    {
      name: 'Firestore Connection',
      description: 'Test Firestore database connection',
      status: 'pending',
      message: '',
    },
    {
      name: 'Authorized Domains',
      description: 'Verify current domain is authorized',
      status: 'pending',
      message: '',
    },
    {
      name: 'Google Sign-In Test',
      description: 'Test Google Sign-In popup (optional)',
      status: 'pending',
      message: '',
      action: 'Test Google Sign-In',
    },
  ]);

  const [isRunning, setIsRunning] = useState(false);
  const [overallStatus, setOverallStatus] = useState<'pending' | 'success' | 'warning' | 'error'>('pending');

  const updateCheck = (index: number, status: CheckStatus, message: string) => {
    setChecks(prev => prev.map((check, i) => 
      i === index ? { ...check, status, message } : check
    ));
  };

  const runSystemChecks = async () => {
    setIsRunning(true);
    setOverallStatus('pending');

    // Check 1: Firebase Configuration
    updateCheck(0, 'checking', 'Checking Firebase config...');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (isFirebaseConfigured) {
      updateCheck(0, 'success', 'Firebase is properly configured with all required credentials');
    } else {
      updateCheck(0, 'error', 'Firebase is not configured. Check /config/firebase.ts');
      setIsRunning(false);
      setOverallStatus('error');
      return;
    }

    // Check 2: Authentication Ready
    updateCheck(1, 'checking', 'Checking Firebase Auth...');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    try {
      if (auth) {
        const currentUser = auth.currentUser;
        if (currentUser) {
          updateCheck(1, 'success', `Authenticated as: ${currentUser.email || currentUser.phoneNumber || currentUser.uid}`);
        } else {
          updateCheck(1, 'warning', 'Firebase Auth initialized but no user signed in');
        }
      } else {
        updateCheck(1, 'error', 'Firebase Auth not initialized');
      }
    } catch (error: any) {
      updateCheck(1, 'error', `Auth check failed: ${error.message}`);
    }

    // Check 3: Firestore Connection
    updateCheck(2, 'checking', 'Testing Firestore connection...');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    try {
      if (!db) {
        updateCheck(2, 'error', 'Firestore not initialized');
      } else {
        // Try to read from users collection (just to test connection)
        const usersRef = collection(db, 'users');
        const q = query(usersRef, limit(1));
        await getDocs(q);
        updateCheck(2, 'success', 'Firestore connection successful');
      }
    } catch (error: any) {
      if (error.code === 'permission-denied') {
        updateCheck(2, 'warning', 'Firestore connected but permission denied (expected if not signed in)');
      } else {
        updateCheck(2, 'error', `Firestore error: ${error.message || error.code || 'Unknown error'}`);
      }
    }

    // Check 4: Authorized Domains
    updateCheck(3, 'checking', 'Checking domain authorization...');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const currentDomain = window.location.hostname;
    const authorizedDomains = ['fig.ma', 'figma.com', 'www.figma.com', 'preview.figma.com', 'localhost'];
    
    const isAuthorized = authorizedDomains.some(domain => 
      currentDomain === domain || currentDomain.endsWith('.' + domain)
    );
    
    if (isAuthorized || currentDomain === 'localhost') {
      updateCheck(3, 'success', `Current domain "${currentDomain}" is in the authorized list`);
    } else {
      updateCheck(3, 'warning', `Current domain "${currentDomain}" may need to be added to Firebase Console → Authentication → Authorized domains`);
    }

    // Check 5: Leave as pending for manual test
    updateCheck(4, 'pending', 'Click "Test Google Sign-In" to verify social authentication');

    setIsRunning(false);
    
    // Determine overall status
    const hasErrors = checks.some(c => c.status === 'error');
    const hasWarnings = checks.some(c => c.status === 'warning');
    
    if (hasErrors) {
      setOverallStatus('error');
    } else if (hasWarnings) {
      setOverallStatus('warning');
    } else {
      setOverallStatus('success');
    }
  };

  const testGoogleSignIn = async () => {
    updateCheck(4, 'checking', 'Opening Google Sign-In popup...');
    
    try {
      const result = await signInWithGoogle();
      updateCheck(4, 'success', `✅ Google Sign-In successful! Signed in as: ${result.userProfile.displayName}`);
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') {
        updateCheck(4, 'warning', 'Popup closed by user. Try again to complete the test.');
      } else if (error.code === 'auth/unauthorized-domain') {
        updateCheck(4, 'error', `❌ Unauthorized domain error. Add "${window.location.hostname}" to Firebase Console.`);
      } else {
        updateCheck(4, 'error', `❌ Google Sign-In failed: ${error.message}`);
      }
    }
  };

  const getStatusIcon = (status: CheckStatus) => {
    switch (status) {
      case 'checking':
        return <Loader2 className="size-5 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle2 className="size-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="size-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="size-5 text-red-500" />;
      default:
        return <div className="size-5 rounded-full border-2 border-gray-300" />;
    }
  };

  const getStatusColor = (status: CheckStatus) => {
    switch (status) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'checking':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-white';
    }
  };

  useEffect(() => {
    // Auto-run checks on mount only if Firebase is configured
    if (isFirebaseConfigured) {
      runSystemChecks();
    } else {
      // Show Firebase not configured status
      updateCheck(0, 'error', 'Firebase is not configured. Check /config/firebase.ts');
      setOverallStatus('error');
    }
  }, []);

  return (
    <Card className="w-full max-w-3xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>System Status Checker</CardTitle>
            <CardDescription>
              Verify Firebase, Authentication, and Firestore configuration
            </CardDescription>
          </div>
          <Button
            onClick={runSystemChecks}
            disabled={isRunning}
            variant="outline"
            size="sm"
          >
            {isRunning ? (
              <>
                <Loader2 className="size-4 mr-2 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <RefreshCw className="size-4 mr-2" />
                Re-run Checks
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Status */}
        {overallStatus !== 'pending' && (
          <Alert
            variant={overallStatus === 'error' ? 'destructive' : 'default'}
            className={
              overallStatus === 'success'
                ? 'border-green-200 bg-green-50'
                : overallStatus === 'warning'
                ? 'border-yellow-200 bg-yellow-50'
                : ''
            }
          >
            {overallStatus === 'success' && <CheckCircle2 className="size-5 text-green-600" />}
            {overallStatus === 'warning' && <AlertCircle className="size-5 text-yellow-600" />}
            {overallStatus === 'error' && <XCircle className="size-5 text-red-600" />}
            <AlertDescription>
              {overallStatus === 'success' && (
                <div>
                  <strong className="text-green-900">All Systems Operational!</strong>
                  <p className="text-green-800 mt-1">
                    Your Firebase configuration is working correctly. You can now test Google/Apple Sign-In.
                  </p>
                </div>
              )}
              {overallStatus === 'warning' && (
                <div>
                  <strong className="text-yellow-900">System Operational with Warnings</strong>
                  <p className="text-yellow-800 mt-1">
                    Some checks have warnings. Review the details below.
                  </p>
                </div>
              )}
              {overallStatus === 'error' && (
                <div>
                  <strong>System Configuration Issues Detected</strong>
                  <p className="mt-1">
                    Please resolve the errors below before proceeding.
                  </p>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Individual Checks */}
        <div className="space-y-3">
          {checks.map((check, index) => (
            <div
              key={index}
              className={`p-4 border rounded-lg transition-all ${getStatusColor(check.status)}`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {getStatusIcon(check.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-medium">{check.name}</h4>
                    {check.action && check.status === 'pending' && (
                      <Button
                        onClick={testGoogleSignIn}
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                      >
                        {check.action}
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{check.description}</p>
                  {check.message && (
                    <p className="text-xs mt-2 font-medium">{check.message}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Current Environment Info */}
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h4 className="text-sm font-medium mb-2">Environment Information</h4>
          <div className="space-y-1 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Current Domain:</span>
              <span className="font-mono">{window.location.hostname}</span>
            </div>
            <div className="flex justify-between">
              <span>Protocol:</span>
              <span className="font-mono">{window.location.protocol}</span>
            </div>
            <div className="flex justify-between">
              <span>Firebase Configured:</span>
              <span className={isFirebaseConfigured ? 'text-green-600' : 'text-red-600'}>
                {isFirebaseConfigured ? '✓ Yes' : '✗ No'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Auth User:</span>
              <span className="font-mono">
                {auth?.currentUser ? auth.currentUser.uid.substring(0, 8) + '...' : 'Not signed in'}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2">
          <Button
            onClick={() => window.location.href = '/'}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            Go to Login
          </Button>
          <Button
            onClick={() => console.log('Firebase Config:', { isFirebaseConfigured, currentDomain: window.location.hostname })}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            Log Config to Console
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
