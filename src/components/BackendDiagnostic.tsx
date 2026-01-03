/**
 * Backend Diagnostic Tool
 * Tests backend connectivity and provides deployment status
 */

import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, RefreshCw, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';

interface DiagnosticResult {
  status: 'success' | 'error' | 'warning' | 'pending';
  message: string;
  details?: string;
}

interface BackendStatus {
  health: DiagnosticResult;
  cors: DiagnosticResult;
  deployment: DiagnosticResult;
}

const BACKEND_URL = 'https://us-central1-ataraxia-c150f.cloudfunctions.net/bedrockBackendApi/api';

export function BackendDiagnostic() {
  const [status, setStatus] = useState<BackendStatus>({
    health: { status: 'pending', message: 'Checking...' },
    cors: { status: 'pending', message: 'Checking...' },
    deployment: { status: 'pending', message: 'Checking...' }
  });
  const [isChecking, setIsChecking] = useState(false);

  const runDiagnostics = async () => {
    setIsChecking(true);
    
    // Test 1: Health endpoint
    try {
      const response = await fetch(`${BACKEND_URL}/health`, {
        method: 'GET',
        mode: 'cors'
      });

      if (response.ok) {
        const data = await response.json();
        setStatus(prev => ({
          ...prev,
          health: {
            status: 'success',
            message: 'Backend is responding',
            details: `Version: ${data.version || 'unknown'}`
          },
          cors: {
            status: 'success',
            message: 'CORS is configured correctly',
            details: 'Localhost is allowed'
          },
          deployment: {
            status: 'success',
            message: 'Backend is deployed',
            details: data.environment || 'production'
          }
        }));
      } else {
        setStatus(prev => ({
          ...prev,
          health: {
            status: 'error',
            message: 'Backend responded with error',
            details: `Status: ${response.status}`
          }
        }));
      }
    } catch (error: any) {
      console.error('Backend diagnostic error:', error);
      
      // Analyze the error
      if (error.message.includes('CORS') || error.name === 'TypeError') {
        setStatus({
          health: {
            status: 'error',
            message: 'Cannot reach backend',
            details: 'CORS or network error'
          },
          cors: {
            status: 'error',
            message: 'CORS is blocking requests',
            details: 'localhost is not allowed'
          },
          deployment: {
            status: 'warning',
            message: 'Backend needs configuration',
            details: 'ENABLE_TEST_LOGIN=true required'
          }
        });
      } else {
        setStatus({
          health: {
            status: 'error',
            message: 'Backend error',
            details: error.message
          },
          cors: { status: 'pending', message: 'Unknown' },
          deployment: { status: 'pending', message: 'Unknown' }
        });
      }
    }
    
    setIsChecking(false);
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-amber-600" />;
      default:
        return <RefreshCw className="w-5 h-5 text-gray-400 animate-spin" />;
    }
  };

  const getStatusColor = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-amber-50 border-amber-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const allPassing = Object.values(status).every(s => s.status === 'success');
  const hasErrors = Object.values(status).some(s => s.status === 'error');

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Backend Diagnostic</CardTitle>
              <CardDescription>
                Testing connection to {BACKEND_URL}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={runDiagnostics}
              disabled={isChecking}
            >
              {isChecking ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Recheck
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Health Check */}
          <div className={`p-4 rounded-lg border ${getStatusColor(status.health.status)}`}>
            <div className="flex items-start gap-3">
              {getStatusIcon(status.health.status)}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">Health Check</span>
                  <Badge variant={status.health.status === 'success' ? 'default' : 'destructive'}>
                    {status.health.status}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{status.health.message}</p>
                {status.health.details && (
                  <p className="text-xs text-gray-500 mt-1">{status.health.details}</p>
                )}
              </div>
            </div>
          </div>

          {/* CORS Check */}
          <div className={`p-4 rounded-lg border ${getStatusColor(status.cors.status)}`}>
            <div className="flex items-start gap-3">
              {getStatusIcon(status.cors.status)}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">CORS Configuration</span>
                  <Badge variant={status.cors.status === 'success' ? 'default' : 'destructive'}>
                    {status.cors.status}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{status.cors.message}</p>
                {status.cors.details && (
                  <p className="text-xs text-gray-500 mt-1">{status.cors.details}</p>
                )}
              </div>
            </div>
          </div>

          {/* Deployment Check */}
          <div className={`p-4 rounded-lg border ${getStatusColor(status.deployment.status)}`}>
            <div className="flex items-start gap-3">
              {getStatusIcon(status.deployment.status)}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">Deployment Status</span>
                  <Badge variant={status.deployment.status === 'success' ? 'default' : 'destructive'}>
                    {status.deployment.status}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{status.deployment.message}</p>
                {status.deployment.details && (
                  <p className="text-xs text-gray-500 mt-1">{status.deployment.details}</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Summary */}
      {allPassing && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            ✅ All systems operational! Your backend is ready for video calling.
          </AlertDescription>
        </Alert>
      )}

      {hasErrors && (
        <Alert className="bg-red-50 border-red-200">
          <XCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <div className="space-y-2">
              <p className="font-medium">❌ Backend configuration needed</p>
              <p className="text-sm">
                Your backend either hasn't been deployed or CORS is not configured for localhost.
              </p>
              <div className="mt-3 space-y-2">
                <p className="text-sm font-medium">Quick Fix:</p>
                <ol className="text-sm space-y-1 ml-4 list-decimal">
                  <li>Copy backend files to your Firebase functions directory</li>
                  <li>Set <code className="bg-red-100 px-1 rounded">ENABLE_TEST_LOGIN=true</code> in .env.production</li>
                  <li>Run: <code className="bg-red-100 px-1 rounded">firebase deploy --only functions:bedrockBackend</code></li>
                </ol>
              </div>
              <div className="mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open('/START_HERE.md', '_blank')}
                  className="text-red-700 border-red-300 hover:bg-red-100"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Deployment Guide
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Backend URL Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Backend Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Backend URL:</span>
              <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                {BACKEND_URL}
              </code>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Frontend Origin:</span>
              <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                {window.location.origin}
              </code>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Required Endpoints:</span>
              <span className="text-xs text-gray-500">
                /health, /api/sessions, /api/sessions/:id/join
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
