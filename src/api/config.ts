/**
 * System Configuration API
 * Manages system-wide configuration settings
 */

import { get, post } from './client';

export interface PublicConfig {
  jitsiDomain: string;
  jwtEnabled: boolean;
  features: {
    recordingEnabled: boolean;
    waitingRoomEnabled: boolean;
    chatEnabled: boolean;
    screenSharingEnabled: boolean;
  };
  limits: {
    maxParticipants: number;
    maxSessionDuration: number; // minutes
    maxRecordingSize: number; // MB
  };
  branding: {
    appName: string;
    supportEmail: string;
    logoUrl?: string;
  };
}

export interface ConfigHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: {
    database: boolean;
    jitsiServer: boolean;
    storage: boolean;
  };
  lastChecked: string;
  version: string;
}

/**
 * Get public configuration (no auth required)
 */
export async function getPublicConfig(): Promise<PublicConfig> {
  return get<PublicConfig>('/config/public');
}

/**
 * Get configuration health status
 */
export async function getConfigHealth(): Promise<ConfigHealth> {
  return get<ConfigHealth>('/config/health');
}

/**
 * Refresh configuration cache (admin only)
 */
export async function refreshConfigCache(): Promise<{ success: boolean }> {
  return post('/config/refresh', {});
}
