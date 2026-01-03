import React, { useState } from 'react';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { AlertCircle, Copy, Check, ExternalLink } from 'lucide-react';

interface UnauthorizedDomainAlertProps {
  currentDomain: string;
}

export function UnauthorizedDomainAlert({ currentDomain }: UnauthorizedDomainAlertProps) {
  const [copied, setCopied] = useState(false);

  const copyDomain = () => {
    navigator.clipboard.writeText(currentDomain);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Alert variant="destructive" className="border-red-300 bg-red-50 text-red-900">
      <AlertCircle className="h-5 w-5 text-red-600" />
      <AlertDescription className="ml-2">
        <div className="space-y-4">
          <div>
            <p className="font-semibold text-red-900 mb-2">
              🔒 Unauthorized Domain Error
            </p>
            <p className="text-sm text-red-800 mb-3">
              The current domain is not authorized in Firebase. Follow these steps to fix it:
            </p>
          </div>

          <div className="bg-white/60 rounded-lg p-4 border border-red-200 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1">
                <p className="text-xs font-medium text-red-900 mb-1">Current Domain:</p>
                <code className="text-sm font-mono bg-red-100 px-2 py-1 rounded text-red-900 block">
                  {currentDomain}
                </code>
              </div>
              <Button
                onClick={copyDomain}
                size="sm"
                variant="outline"
                className="h-8 gap-2 shrink-0 border-red-300 hover:bg-red-100"
              >
                {copied ? (
                  <>
                    <Check className="h-3 w-3" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    Copy
                  </>
                )}
              </Button>
            </div>

            <div className="space-y-2 text-sm text-red-800">
              <p className="font-medium">Quick Fix Steps:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Open <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer" className="underline font-medium hover:text-red-900">Firebase Console</a></li>
                <li>Select your project</li>
                <li>Go to <strong>Authentication</strong> → <strong>Settings</strong> tab</li>
                <li>Scroll to <strong>Authorized domains</strong></li>
                <li>Click <strong>Add domain</strong></li>
                <li>Paste: <code className="bg-red-100 px-1 py-0.5 rounded font-mono text-xs">{currentDomain}</code></li>
                <li>Click <strong>Add</strong></li>
                <li>Wait 1-2 minutes, then try signing in again</li>
              </ol>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => window.open('https://console.firebase.google.com', '_blank')}
              size="sm"
              variant="outline"
              className="gap-2 border-red-300 hover:bg-red-100 text-red-900"
            >
              <ExternalLink className="h-3 w-3" />
              Open Firebase Console
            </Button>
            <Button
              onClick={() => window.location.reload()}
              size="sm"
              variant="outline"
              className="border-red-300 hover:bg-red-100 text-red-900"
            >
              Refresh Page
            </Button>
          </div>

          <div className="text-xs text-red-700 pt-2 border-t border-red-200">
            <strong>Already added?</strong> Changes take 1-2 minutes to propagate. Clear your browser cache and try again.
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
}
