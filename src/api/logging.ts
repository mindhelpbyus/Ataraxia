/**
 * Logging API
 * Send frontend logs to backend
 */

import { post } from './client';

export interface FrontendLog {
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  context?: string;
  userId?: string;
  sessionId?: string;
  timestamp: string;
  userAgent?: string;
  url?: string;
  metadata?: Record<string, any>;
}

export interface BatchLogRequest {
  logs: FrontendLog[];
}

/**
 * Send a single log to backend
 */
export async function sendLog(log: Omit<FrontendLog, 'timestamp'>): Promise<void> {
  const logWithTimestamp: FrontendLog = {
    ...log,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
  };

  try {
    await post('/logs', logWithTimestamp, false);
  } catch (error) {
    // Silently fail - don't want logging errors to break the app
    console.debug('Failed to send log to backend:', error);
  }
}

/**
 * Send multiple logs in batch
 */
export async function sendBatchLogs(
  logs: Omit<FrontendLog, 'timestamp'>[]
): Promise<void> {
  const logsWithTimestamp: FrontendLog[] = logs.map((log) => ({
    ...log,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
  }));

  try {
    await post('/logs', { logs: logsWithTimestamp }, false);
  } catch (error) {
    // Silently fail
    console.debug('Failed to send batch logs to backend:', error);
  }
}

/**
 * Helper to log debug message
 */
export function logDebug(
  message: string,
  context?: string,
  metadata?: Record<string, any>
): void {
  sendLog({
    level: 'debug',
    message,
    context,
    metadata,
  });
}

/**
 * Helper to log info message
 */
export function logInfo(
  message: string,
  context?: string,
  metadata?: Record<string, any>
): void {
  sendLog({
    level: 'info',
    message,
    context,
    metadata,
  });
}

/**
 * Helper to log warning
 */
export function logWarn(
  message: string,
  context?: string,
  metadata?: Record<string, any>
): void {
  sendLog({
    level: 'warn',
    message,
    context,
    metadata,
  });
}

/**
 * Helper to log error
 */
export function logError(
  message: string,
  context?: string,
  metadata?: Record<string, any>
): void {
  sendLog({
    level: 'error',
    message,
    context,
    metadata,
  });
}

/**
 * Helper to log session event
 */
export function logSessionEvent(
  sessionId: string,
  event: string,
  metadata?: Record<string, any>
): void {
  sendLog({
    level: 'info',
    message: `Session event: ${event}`,
    context: 'session',
    sessionId,
    metadata,
  });
}
