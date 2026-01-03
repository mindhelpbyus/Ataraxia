/**
 * Jitsi Configuration - Refactored to use API layer
 * This file now exports dynamic configuration that should be fetched from the backend.
 */

import { dataService } from '../api';
import { logger } from '../services/secureLogger';


// Default config as fallback
const DEFAULT_CONFIG = {
  domain: 'meet.jit.si', // Fallback to public Jitsi
  useJWT: false,
  jwtAppId: '',
  backendUrl: '',
  endpoints: {
    generateToken: '/api/jitsi/generate-token',
    createRoom: '/api/jitsi/create-room',
    validateToken: '/api/jitsi/validate-token',
  },
};

export let JITSI_CONFIG = { ...DEFAULT_CONFIG };

/**
 * Initialize Jitsi configuration from backend
 */
export async function initJitsiConfig() {
  try {
    const config = await dataService.get('system_config', 'jitsi');
    if (config) {
      Object.assign(JITSI_CONFIG, config);
    }
  } catch (error) {
    logger.warn('Failed to fetch Jitsi config, using defaults');
  }
}

/**
 * Update Jitsi configuration at runtime
 */
export function updateJitsiConfig(config: Partial<typeof JITSI_CONFIG>) {
  Object.assign(JITSI_CONFIG, config);
}

/**
 * Get full API endpoint URL
 */
export function getJitsiApiUrl(endpoint: keyof typeof JITSI_CONFIG.endpoints): string {
  return `${JITSI_CONFIG.backendUrl}${JITSI_CONFIG.endpoints[endpoint]}`;
}
