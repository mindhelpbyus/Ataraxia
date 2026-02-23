/**
 * Health Check API
 * Check API and system health status
 */

import { apiRequest } from './client';

export interface HealthStatus {
  status: 'ok' | 'degraded' | 'down';
  timestamp: string;
  version: string;
  uptime: number; // seconds
  services: {
    database: boolean;
    storage: boolean;
    jitsi: boolean;
  };
}

export interface ApiStatus {
  online: boolean;
  version: string;
  environment: 'development' | 'staging' | 'production';
  timestamp: string;
}

/**
 * Check API health
 * Health endpoint is at base URL without /api prefix
 */
export async function checkHealth(): Promise<HealthStatus> {
  // Health endpoint is at https://...cloudfunctions.net/bedrockBackendApi/health (no /api)
  const healthUrl = 'https://us-central1-ataraxia-c150f.cloudfunctions.net/bedrockBackendApi/health';
  return apiRequest<HealthStatus>(healthUrl, {});
}

/**
 * Get API status
 */
export async function getApiStatus(): Promise<ApiStatus> {
  // Status endpoint is under /api
  return apiRequest<ApiStatus>('/status', {});
}
