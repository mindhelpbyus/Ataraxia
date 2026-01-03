import { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';

export function ConnectionDiagnostic() {
  const [results, setResults] = useState<any>({});
  const [testing, setTesting] = useState(false);

  const runDiagnostics = async () => {
    setTesting(true);
    const diagnostics: any = {};

    const BACKEND_URL = 'https://us-central1-ataraxia-c150f.cloudfunctions.net/bedrockBackendApi/api';
    const HEALTH_URL = 'https://us-central1-ataraxia-c150f.cloudfunctions.net/bedrockBackendApi';

    // Test 1: Check current environment
    diagnostics.environment = window.location.hostname === 'localhost' ? 'development' : 'production';
    diagnostics.currentUrl = window.location.href;
    diagnostics.apiBaseUrl = BACKEND_URL;

    // Test 2: Try to reach health endpoint
    try {
      const response = await fetch(`${HEALTH_URL}/health`, {
        mode: 'cors',
        credentials: 'omit',
      });
      diagnostics.healthCheck = {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText
      };
      
      if (response.ok) {
        const data = await response.text();
        diagnostics.healthResponse = data.substring(0, 200);
      } else {
        const errorText = await response.text();
        diagnostics.healthError = errorText.substring(0, 200);
      }
    } catch (error: any) {
      diagnostics.healthCheck = {
        failed: true,
        error: error.message,
        type: error.name
      };
    }

    // Test 3: Try login endpoint (will return 400/401, but proves it's reachable)
    try {
      const response = await fetch(`${BACKEND_URL}/auth/register-or-login`, {
        method: 'POST',
        mode: 'cors',
        credentials: 'omit',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'TEST-USER-001',
          email: 'test@example.com',
          role: 'therapist'
        })
      });
      
      diagnostics.loginEndpoint = {
        status: response.status,
        statusText: response.statusText,
        reachable: true
      };

      const text = await response.text();
      diagnostics.loginResponse = text.substring(0, 200);
    } catch (error: any) {
      diagnostics.loginEndpoint = {
        failed: true,
        error: error.message,
        type: error.name
      };
    }

    setResults(diagnostics);
    setTesting(false);
  };

  return (
    <Card className="p-6 max-w-3xl">
      <h2 className="text-xl mb-4">🔍 Connection Diagnostic Tool</h2>
      
      <Button 
        onClick={runDiagnostics} 
        disabled={testing}
        className="mb-4"
      >
        {testing ? 'Running Tests...' : 'Run Diagnostics'}
      </Button>

      {Object.keys(results).length > 0 && (
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Diagnostic Results:</h3>
            <pre className="text-sm overflow-auto max-h-96 whitespace-pre-wrap">
              {JSON.stringify(results, null, 2)}
            </pre>
          </div>

          {results.healthCheck?.failed && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4">
              <h4 className="font-semibold text-red-800">❌ Backend Connection Failed</h4>
              <p className="text-red-700 mt-2">
                Cannot reach the backend API. Common causes:
              </p>
              <ul className="list-disc ml-6 mt-2 text-red-700">
                <li><strong>Backend not deployed:</strong> Run <code>firebase deploy --only functions:bedrockBackendApi</code></li>
                <li><strong>CORS not enabled:</strong> Backend must allow requests from <code>http://localhost:5173</code></li>
                <li><strong>Network/Firewall:</strong> Check your internet connection or VPN</li>
              </ul>
              <div className="mt-4 bg-white p-3 rounded">
                <p className="font-semibold">Error Details:</p>
                <code className="block mt-2 bg-gray-100 p-2 rounded text-xs">
                  {results.healthCheck.error}
                </code>
              </div>
            </div>
          )}

          {results.healthCheck?.ok && (
            <div className="bg-green-50 border-l-4 border-green-500 p-4">
              <h4 className="font-semibold text-green-800">✅ Backend Connection Working!</h4>
              <p className="text-green-700 mt-2">
                Successfully connected to the backend API at:
                <br />
                <code className="text-sm">https://us-central1-ataraxia-c150f.cloudfunctions.net/bedrockBackendApi/api</code>
              </p>
              {results.loginEndpoint?.reachable && (
                <p className="text-green-700 mt-2">
                  ✅ Login endpoint is reachable (Status: {results.loginEndpoint.status})
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
