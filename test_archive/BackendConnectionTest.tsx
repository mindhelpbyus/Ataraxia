import { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { CheckCircle2, XCircle, Loader2, AlertCircle } from 'lucide-react';

const BACKEND_URL = 'https://us-central1-ataraxia-c150f.cloudfunctions.net/bedrockBackendApi/api';

export function BackendConnectionTest() {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<any>(null);

  const testConnection = async () => {
    setTesting(true);
    const testResults: any = {
      timestamp: new Date().toISOString(),
      tests: []
    };

    // Test 1: Health endpoint (no CORS, just check if reachable)
    try {
      console.log('🔍 Testing health endpoint...');
      const healthResponse = await fetch(`${BACKEND_URL}/health`, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Accept': 'application/json',
        }
      });
      
      testResults.tests.push({
        name: 'Health Check',
        success: healthResponse.ok,
        status: healthResponse.status,
        url: `${BACKEND_URL}/health`
      });
    } catch (error: any) {
      testResults.tests.push({
        name: 'Health Check',
        success: false,
        error: error.message,
        errorType: error.name,
        url: `${BACKEND_URL}/health`
      });
    }

    // Test 2: Login endpoint
    try {
      console.log('🔍 Testing login endpoint...');
      const loginResponse = await fetch(`${BACKEND_URL}/auth/login`, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email: 'therapist3@bedrock.test',
          password: 'Therapist123!'
        })
      });

      const data = await loginResponse.json();
      
      testResults.tests.push({
        name: 'Login Request',
        success: loginResponse.ok,
        status: loginResponse.status,
        url: `${BACKEND_URL}/auth/login`,
        response: data
      });
    } catch (error: any) {
      testResults.tests.push({
        name: 'Login Request',
        success: false,
        error: error.message,
        errorType: error.name,
        url: `${BACKEND_URL}/auth/login`,
        details: error.toString()
      });
    }

    // Test 3: Check CORS headers
    try {
      console.log('🔍 Testing CORS preflight...');
      const corsResponse = await fetch(`${BACKEND_URL}/auth/login`, {
        method: 'OPTIONS',
        headers: {
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'content-type',
          'Origin': window.location.origin
        }
      });

      testResults.tests.push({
        name: 'CORS Preflight',
        success: corsResponse.ok,
        status: corsResponse.status,
        headers: {
          'access-control-allow-origin': corsResponse.headers.get('access-control-allow-origin'),
          'access-control-allow-methods': corsResponse.headers.get('access-control-allow-methods'),
          'access-control-allow-headers': corsResponse.headers.get('access-control-allow-headers'),
        }
      });
    } catch (error: any) {
      testResults.tests.push({
        name: 'CORS Preflight',
        success: false,
        error: error.message,
        errorType: error.name
      });
    }

    setResults(testResults);
    setTesting(false);
  };

  return (
    <Card className="p-6 space-y-4">
      <div>
        <h3 className="text-lg mb-2">Backend Connection Diagnostics</h3>
        <p className="text-sm text-gray-600 mb-4">
          Testing connection to: <code className="text-xs bg-gray-100 px-2 py-1 rounded">{BACKEND_URL}</code>
        </p>
        
        <Button 
          onClick={testConnection} 
          disabled={testing}
          className="w-full"
        >
          {testing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Testing Connection...
            </>
          ) : (
            'Run Diagnostic Test'
          )}
        </Button>
      </div>

      {results && (
        <div className="space-y-3 mt-4">
          <div className="text-sm">
            <strong>Test Results:</strong> {new Date(results.timestamp).toLocaleTimeString()}
          </div>

          {results.tests.map((test: any, idx: number) => (
            <Alert key={idx} variant={test.success ? "default" : "destructive"}>
              <div className="flex items-start gap-3">
                {test.success ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                )}
                
                <div className="flex-1 min-w-0">
                  <div className="font-semibold">{test.name}</div>
                  
                  {test.url && (
                    <div className="text-xs mt-1 break-all">
                      URL: {test.url}
                    </div>
                  )}
                  
                  {test.status && (
                    <div className="text-sm mt-1">
                      Status: {test.status}
                    </div>
                  )}
                  
                  {test.error && (
                    <div className="mt-2 space-y-1">
                      <div className="text-sm text-red-700">
                        <strong>Error:</strong> {test.error}
                      </div>
                      {test.errorType && (
                        <div className="text-xs text-red-600">
                          Type: {test.errorType}
                        </div>
                      )}
                      {test.details && (
                        <div className="text-xs text-red-600 mt-1">
                          {test.details}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {test.response && (
                    <details className="mt-2">
                      <summary className="text-xs cursor-pointer text-blue-600 hover:text-blue-700">
                        View Response
                      </summary>
                      <pre className="text-xs mt-2 bg-gray-100 p-2 rounded overflow-auto max-h-40">
                        {JSON.stringify(test.response, null, 2)}
                      </pre>
                    </details>
                  )}
                  
                  {test.headers && (
                    <details className="mt-2">
                      <summary className="text-xs cursor-pointer text-blue-600 hover:text-blue-700">
                        View CORS Headers
                      </summary>
                      <pre className="text-xs mt-2 bg-gray-100 p-2 rounded overflow-auto">
                        {JSON.stringify(test.headers, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            </Alert>
          ))}

          {/* Diagnosis */}
          <Alert>
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>
              <strong className="block mb-2">Diagnosis:</strong>
              {results.tests.every((t: any) => t.success) ? (
                <div className="text-green-700">
                  ✅ All tests passed! Backend is accessible and CORS is configured correctly.
                </div>
              ) : results.tests.some((t: any) => t.errorType === 'TypeError' && t.error?.includes('Failed to fetch')) ? (
                <div className="text-amber-700">
                  <p className="mb-2">⚠️ CORS Error Detected</p>
                  <p className="text-sm">
                    The backend is blocking requests from <code>localhost</code>. 
                    This is a CORS (Cross-Origin Resource Sharing) configuration issue on the backend server.
                  </p>
                  <p className="text-sm mt-2 font-semibold">
                    Solution: The backend needs to allow <code>{window.location.origin}</code> in its CORS configuration.
                  </p>
                </div>
              ) : (
                <div className="text-red-700">
                  ❌ Backend connection failed. Check the errors above for details.
                </div>
              )}
            </AlertDescription>
          </Alert>
        </div>
      )}
    </Card>
  );
}
