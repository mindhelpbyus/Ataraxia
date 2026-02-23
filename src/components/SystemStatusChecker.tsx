/**
 * SystemStatusChecker.tsx — Backend API Health Check
 *
 * ✅ Checks Gravity Reunion backend health (not Firebase).
 * ✅ No Firebase SDK imports.
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { CheckCircle2, XCircle, Loader2, RefreshCw } from 'lucide-react';
import { get } from '../api/client';

type CheckStatus = 'pending' | 'checking' | 'success' | 'error';

interface SystemCheck {
  name: string;
  description: string;
  status: CheckStatus;
  message: string;
}

export function SystemStatusChecker() {
  const [checks, setChecks] = useState<SystemCheck[]>([
    { name: 'Backend API', description: 'Gravity Reunion API reachability', status: 'pending', message: '' },
    { name: 'Authentication', description: 'Auth endpoint availability', status: 'pending', message: '' },
  ]);
  const [isRunning, setIsRunning] = useState(false);

  const update = (index: number, status: CheckStatus, message: string) =>
    setChecks((prev) => prev.map((c, i) => (i === index ? { ...c, status, message } : c)));

  const runChecks = async () => {
    setIsRunning(true);

    // Check 1: API health
    update(0, 'checking', 'Pinging backend...');
    try {
      await get('/health');
      update(0, 'success', 'Backend API is reachable');
    } catch {
      update(0, 'error', 'Backend API is unreachable. Check VITE_API_BASE_URL.');
    }

    // Check 2: Auth
    update(1, 'checking', 'Testing auth endpoint...');
    try {
      await get('/auth/me');
      update(1, 'success', 'Authenticated session active');
    } catch (e: unknown) {
      const status = (e as { status?: number }).status;
      if (status === 401) {
        update(1, 'success', 'Auth endpoint reachable (no active session — normal on login page)');
      } else {
        update(1, 'error', 'Auth endpoint unreachable');
      }
    }

    setIsRunning(false);
  };

  useEffect(() => { runChecks(); }, []);

  return (
    <Card className="w-full max-w-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Backend API health check</CardDescription>
          </div>
          <Button onClick={runChecks} disabled={isRunning} variant="outline" size="sm">
            {isRunning ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {checks.map((check, i) => (
          <div key={i} className="flex items-start gap-3 p-3 border rounded-lg">
            {check.status === 'checking' && <Loader2 className="size-5 animate-spin text-blue-500 mt-0.5" />}
            {check.status === 'success' && <CheckCircle2 className="size-5 text-green-500 mt-0.5" />}
            {check.status === 'error' && <XCircle className="size-5 text-red-500 mt-0.5" />}
            {check.status === 'pending' && <div className="size-5 rounded-full border-2 border-gray-300 mt-0.5" />}
            <div>
              <p className="text-sm font-medium">{check.name}</p>
              <p className="text-xs text-muted-foreground">{check.description}</p>
              {check.message && <p className="text-xs mt-1">{check.message}</p>}
            </div>
          </div>
        ))}
        <div className="text-xs text-muted-foreground pt-2">
          API: {import.meta.env.VITE_API_BASE_URL || '(relative — same origin)'}
        </div>
      </CardContent>
    </Card>
  );
}
