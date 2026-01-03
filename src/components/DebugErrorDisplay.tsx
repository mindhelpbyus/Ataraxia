/**
 * Debug Error Display Component
 * Captures and displays ALL runtime errors, console errors, and API errors
 */

import { useState, useEffect } from 'react';
import { X, AlertTriangle, Copy, Check, Bug } from 'lucide-react';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { UserRole } from '../types/appointment';

interface ErrorEntry {
  id: string;
  timestamp: number;
  type: 'error' | 'warning' | 'api' | 'react';
  message: string;
  stack?: string;
  componentStack?: string;
  details?: any;
}

interface DebugErrorDisplayProps {
  userRole?: UserRole;
}

export function DebugErrorDisplay({ userRole }: DebugErrorDisplayProps) {
  // Check if user has permission to see the debug panel BEFORE calling any hooks
  const hasDebugAccess = () => {
    // Super admins always have access
    if (userRole === 'superadmin') return true;
    
    // Check if hostname contains 'dev'
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      return hostname.includes('dev') || hostname === 'localhost';
    }
    
    return false;
  };

  // Don't render the component if user doesn't have access
  // IMPORTANT: This must be checked BEFORE any hooks are called
  if (!hasDebugAccess()) {
    return null;
  }

  const [isOpen, setIsOpen] = useState(false);
  const [errors, setErrors] = useState<ErrorEntry[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Capture console errors
    const originalError = console.error;
    const originalWarn = console.warn;

    console.error = function(...args: any[]) {
      const errorEntry: ErrorEntry = {
        id: `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        type: 'error',
        message: args.map(arg => {
          if (typeof arg === 'string') return arg;
          if (arg instanceof Error) return arg.message;
          try {
            return JSON.stringify(arg, null, 2);
          } catch {
            return String(arg);
          }
        }).join(' '),
        stack: args.find(arg => arg instanceof Error)?.stack,
        details: args
      };
      
      setErrors(prev => [errorEntry, ...prev].slice(0, 100));
      originalError.apply(console, args);
    };

    console.warn = function(...args: any[]) {
      const errorEntry: ErrorEntry = {
        id: `warn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        type: 'warning',
        message: args.map(arg => {
          if (typeof arg === 'string') return arg;
          try {
            return JSON.stringify(arg, null, 2);
          } catch {
            return String(arg);
          }
        }).join(' '),
        details: args
      };
      
      setErrors(prev => [errorEntry, ...prev].slice(0, 100));
      originalWarn.apply(console, args);
    };

    // Capture uncaught errors
    const handleError = (event: ErrorEvent) => {
      const errorEntry: ErrorEntry = {
        id: `uncaught_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        type: 'error',
        message: event.message,
        stack: event.error?.stack,
        details: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          error: event.error
        }
      };
      
      setErrors(prev => [errorEntry, ...prev].slice(0, 100));
    };

    // Capture unhandled promise rejections
    const handleRejection = (event: PromiseRejectionEvent) => {
      const errorEntry: ErrorEntry = {
        id: `rejection_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        type: 'error',
        message: event.reason instanceof Error 
          ? event.reason.message 
          : String(event.reason),
        stack: event.reason instanceof Error ? event.reason.stack : undefined,
        details: event.reason
      };
      
      setErrors(prev => [errorEntry, ...prev].slice(0, 100));
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      console.error = originalError;
      console.warn = originalWarn;
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      fractionalSecondDigits: 3
    });
  };

  const getTypeColor = (type: ErrorEntry['type']): string => {
    switch (type) {
      case 'error': return 'bg-red-500';
      case 'warning': return 'bg-yellow-500';
      case 'api': return 'bg-blue-500';
      case 'react': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const copyAllErrors = async () => {
    const errorText = errors.map(err => {
      let text = `[${formatTimestamp(err.timestamp)}] ${err.type.toUpperCase()}: ${err.message}`;
      if (err.stack) {
        text += `\n\nStack Trace:\n${err.stack}`;
      }
      if (err.componentStack) {
        text += `\n\nComponent Stack:\n${err.componentStack}`;
      }
      if (err.details) {
        try {
          text += `\n\nDetails:\n${JSON.stringify(err.details, null, 2)}`;
        } catch {
          text += `\n\nDetails: [Unable to stringify]`;
        }
      }
      return text;
    }).join('\n\n' + '='.repeat(80) + '\n\n');

    try {
      await navigator.clipboard.writeText(errorText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy errors:', err);
    }
  };

  const clearErrors = () => {
    setErrors([]);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-20 right-4 ${
          errors.length > 0 ? 'bg-red-500 animate-pulse' : 'bg-gray-500'
        } hover:bg-red-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 z-50 transition-all`}
      >
        <Bug className="w-4 h-4" />
        <span className="text-sm">Errors</span>
        {errors.length > 0 && (
          <span className="bg-white text-red-500 px-2 py-0.5 rounded-full text-xs font-bold">
            {errors.length}
          </span>
        )}
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-[900px] max-w-[90vw] h-[750px] max-h-[85vh] bg-white border-2 border-red-300 rounded-lg shadow-2xl z-50 flex flex-col">
      {/* Header */}
      <div className="bg-red-500 text-white p-3 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5" />
          <h3 className="font-semibold">Debug Error Console (Dev Mode)</h3>
          <span className="bg-white text-red-500 px-2 py-0.5 rounded text-xs font-bold">
            {errors.length} errors
          </span>
        </div>
        <button 
          onClick={() => setIsOpen(false)}
          className="hover:bg-red-600 p-1 rounded"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Controls */}
      <div className="p-3 border-b bg-gray-50 flex items-center justify-between gap-3">
        <div className="text-sm text-gray-600">
          All app errors: runtime, console, API, React, and exceptions
        </div>
        
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={copyAllErrors}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-1 text-green-500" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-1" />
                Copy All
              </>
            )}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={clearErrors}
          >
            Clear
          </Button>
        </div>
      </div>

      {/* Errors List */}
      <ScrollArea className="flex-1 p-3">
        {errors.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            <p className="text-sm">No errors captured</p>
            <p className="text-xs mt-1">This panel will show all console errors and warnings</p>
          </div>
        ) : (
          <div className="space-y-2">
            {errors.map(error => (
              <div 
                key={error.id} 
                className="border rounded-lg p-3 bg-white hover:bg-gray-50"
              >
                <div className="flex items-start gap-2 mb-2">
                  <span className={`${getTypeColor(error.type)} text-white px-2 py-0.5 rounded text-xs font-bold uppercase`}>
                    {error.type}
                  </span>
                  <span className="text-xs text-gray-500 font-mono">
                    {formatTimestamp(error.timestamp)}
                  </span>
                </div>
                
                <div className="text-sm text-red-700 font-mono mb-2 whitespace-pre-wrap break-all">
                  {error.message}
                </div>
                
                {error.stack && (
                  <details className="mt-2">
                    <summary className="text-xs text-gray-600 cursor-pointer hover:text-gray-800">
                      Stack Trace
                    </summary>
                    <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-x-auto">
                      {error.stack}
                    </pre>
                  </details>
                )}
                
                {error.componentStack && (
                  <details className="mt-2">
                    <summary className="text-xs text-gray-600 cursor-pointer hover:text-gray-800">
                      Component Stack
                    </summary>
                    <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-x-auto">
                      {error.componentStack}
                    </pre>
                  </details>
                )}
                
                {error.details && (
                  <details className="mt-2">
                    <summary className="text-xs text-gray-600 cursor-pointer hover:text-gray-800">
                      Details
                    </summary>
                    <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-x-auto">
                      {typeof error.details === 'object' 
                        ? JSON.stringify(error.details, null, 2)
                        : String(error.details)
                      }
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      <div className="p-2 border-t bg-gray-50 text-xs text-gray-500 text-center">
        Dev Mode: Capturing console.error, console.warn, uncaught errors, promise rejections, and all app exceptions
      </div>
    </div>
  );
}