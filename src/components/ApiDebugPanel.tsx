/**
 * API Debug Panel
 * Real-time request/response monitoring for debugging
 */

import { useState, useEffect } from 'react';
import { X, ChevronDown, ChevronRight, Trash2, Copy, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { addDebugListener } from '../api/client';
import { UserRole } from '../types/appointment';

export interface ApiLogEntry {
  id: string;
  timestamp: number;
  method: string;
  url: string;
  requestHeaders: Record<string, string>;
  requestBody?: any;
  responseStatus?: number;
  responseHeaders?: Record<string, string>;
  responseBody?: any;
  error?: string;
  duration?: number;
}

function formatJson(obj: any): string {
  try {
    return JSON.stringify(obj, null, 2);
  } catch {
    return String(obj);
  }
}

function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', { 
    hour12: false, 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit',
    fractionalSecondDigits: 3
  });
}

function getStatusColor(status?: number): string {
  if (!status) return 'bg-gray-500';
  if (status >= 200 && status < 300) return 'bg-green-500';
  if (status >= 400 && status < 500) return 'bg-yellow-500';
  if (status >= 500) return 'bg-red-500';
  return 'bg-blue-500';
}

function getMethodColor(method: string): string {
  switch (method.toUpperCase()) {
    case 'GET': return 'bg-blue-500';
    case 'POST': return 'bg-green-500';
    case 'PUT': return 'bg-orange-500';
    case 'PATCH': return 'bg-purple-500';
    case 'DELETE': return 'bg-red-500';
    default: return 'bg-gray-500';
  }
}

interface LogEntryCardProps {
  entry: ApiLogEntry;
}

function LogEntryCard({ entry }: LogEntryCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = async (text: string, section: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(section);
      setTimeout(() => setCopiedSection(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const hasError = !!entry.error || (entry.responseStatus && entry.responseStatus >= 400);

  return (
    <div className={`border rounded-lg mb-2 ${hasError ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}>
      {/* Header */}
      <div 
        className="p-3 cursor-pointer hover:bg-gray-50 flex items-center gap-3"
        onClick={() => setExpanded(!expanded)}
      >
        <button className="text-gray-500">
          {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
        
        <Badge className={`${getMethodColor(entry.method)} text-white px-2 py-0.5 text-xs`}>
          {entry.method}
        </Badge>
        
        {entry.responseStatus && (
          <Badge className={`${getStatusColor(entry.responseStatus)} text-white px-2 py-0.5 text-xs`}>
            {entry.responseStatus}
          </Badge>
        )}
        
        <span className="text-xs text-gray-500 font-mono">
          {formatTimestamp(entry.timestamp)}
        </span>
        
        {entry.duration && (
          <span className="text-xs text-gray-500">
            {entry.duration}ms
          </span>
        )}
        
        <span className="flex-1 text-sm font-mono text-gray-700 truncate">
          {entry.url}
        </span>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="border-t px-3 py-3 space-y-3 bg-white">
          {/* Request Headers */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-xs uppercase text-gray-500">Request Headers</h4>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 px-2 text-xs"
                onClick={() => copyToClipboard(formatJson(entry.requestHeaders), 'req-headers')}
              >
                {copiedSection === 'req-headers' ? (
                  <Check className="w-3 h-3 text-green-500" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </Button>
            </div>
            <pre className="text-xs bg-gray-50 p-2 rounded border overflow-x-auto">
              {formatJson(entry.requestHeaders)}
            </pre>
          </div>

          {/* Request Body */}
          {entry.requestBody && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-xs uppercase text-gray-500">Request Body</h4>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 px-2 text-xs"
                  onClick={() => copyToClipboard(formatJson(entry.requestBody), 'req-body')}
                >
                  {copiedSection === 'req-body' ? (
                    <Check className="w-3 h-3 text-green-500" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </Button>
              </div>
              <pre className="text-xs bg-gray-50 p-2 rounded border overflow-x-auto">
                {formatJson(entry.requestBody)}
              </pre>
            </div>
          )}

          {/* Response Headers */}
          {entry.responseHeaders && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-xs uppercase text-gray-500">Response Headers</h4>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 px-2 text-xs"
                  onClick={() => copyToClipboard(formatJson(entry.responseHeaders), 'res-headers')}
                >
                  {copiedSection === 'res-headers' ? (
                    <Check className="w-3 h-3 text-green-500" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </Button>
              </div>
              <pre className="text-xs bg-gray-50 p-2 rounded border overflow-x-auto">
                {formatJson(entry.responseHeaders)}
              </pre>
            </div>
          )}

          {/* Response Body */}
          {entry.responseBody && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-xs uppercase text-gray-500">Response Body</h4>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 px-2 text-xs"
                  onClick={() => copyToClipboard(formatJson(entry.responseBody), 'res-body')}
                >
                  {copiedSection === 'res-body' ? (
                    <Check className="w-3 h-3 text-green-500" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </Button>
              </div>
              <pre className="text-xs bg-gray-50 p-2 rounded border overflow-x-auto">
                {formatJson(entry.responseBody)}
              </pre>
            </div>
          )}

          {/* Error */}
          {entry.error && (
            <div>
              <h4 className="text-xs uppercase text-red-600 mb-1">Error</h4>
              <pre className="text-xs bg-red-50 p-2 rounded border border-red-200 text-red-700 overflow-x-auto">
                {entry.error}
              </pre>
            </div>
          )}

          {/* Full URL */}
          <div>
            <h4 className="text-xs uppercase text-gray-500 mb-1">Full URL</h4>
            <pre className="text-xs bg-gray-50 p-2 rounded border overflow-x-auto">
              {entry.url}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

interface ApiDebugPanelProps {
  userRole?: UserRole;
}

export function ApiDebugPanel({ userRole }: ApiDebugPanelProps) {
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
  const [logs, setLogs] = useState<ApiLogEntry[]>([]);
  const [filter, setFilter] = useState<'all' | 'success' | 'error'>('all');

  useEffect(() => {
    const unsubscribe = addDebugListener((entry) => {
      setLogs(prev => [entry, ...prev].slice(0, 100)); // Keep last 100 entries
    });

    return unsubscribe;
  }, []);

  const filteredLogs = logs.filter(log => {
    if (filter === 'all') return true;
    if (filter === 'success') {
      return log.responseStatus && log.responseStatus >= 200 && log.responseStatus < 400;
    }
    if (filter === 'error') {
      return log.error || (log.responseStatus && log.responseStatus >= 400);
    }
    return true;
  });

  const clearLogs = () => {
    setLogs([]);
  };

  const successCount = logs.filter(log => 
    log.responseStatus && log.responseStatus >= 200 && log.responseStatus < 400
  ).length;

  const errorCount = logs.filter(log => 
    log.error || (log.responseStatus && log.responseStatus >= 400)
  ).length;

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 z-50 transition-all"
      >
        <span className="text-sm">API Debug</span>
        {logs.length > 0 && (
          <Badge className="bg-white text-orange-500 px-2 py-0.5 text-xs">
            {logs.length}
          </Badge>
        )}
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-[900px] max-w-[90vw] h-[750px] max-h-[85vh] bg-white border-2 border-gray-300 rounded-lg shadow-2xl z-50 flex flex-col">
      {/* Header */}
      <div className="bg-orange-500 text-white p-3 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold">API Debug Panel (Dev Mode)</h3>
          <Badge className="bg-white text-orange-500 px-2 py-0.5 text-xs">
            {logs.length} requests
          </Badge>
        </div>
        <button 
          onClick={() => setIsOpen(false)}
          className="hover:bg-orange-600 p-1 rounded"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Controls */}
      <div className="p-3 border-b bg-gray-50 flex items-center justify-between gap-3">
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
            className={filter === 'all' ? 'bg-orange-500 hover:bg-orange-600' : ''}
          >
            All ({logs.length})
          </Button>
          <Button
            size="sm"
            variant={filter === 'success' ? 'default' : 'outline'}
            onClick={() => setFilter('success')}
            className={filter === 'success' ? 'bg-green-500 hover:bg-green-600' : ''}
          >
            Success ({successCount})
          </Button>
          <Button
            size="sm"
            variant={filter === 'error' ? 'default' : 'outline'}
            onClick={() => setFilter('error')}
            className={filter === 'error' ? 'bg-red-500 hover:bg-red-600' : ''}
          >
            Errors ({errorCount})
          </Button>
        </div>
        
        <Button
          size="sm"
          variant="outline"
          onClick={clearLogs}
        >
          <Trash2 className="w-4 h-4 mr-1" />
          Clear
        </Button>
      </div>

      {/* Logs */}
      <ScrollArea className="flex-1 p-3">
        {filteredLogs.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            <p className="text-sm">No API requests captured yet</p>
            <p className="text-xs mt-1">Make an API call to see it appear here</p>
          </div>
        ) : (
          <div>
            {filteredLogs.map(entry => (
              <LogEntryCard key={entry.id} entry={entry} />
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      <div className="p-2 border-t bg-gray-50 text-xs text-gray-500 text-center">
        Dev Mode: Last 100 requests • Auto-updates in real-time • All API calls tracked
      </div>
    </div>
  );
}