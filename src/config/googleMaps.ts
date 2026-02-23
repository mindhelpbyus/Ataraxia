/**
 * Google Maps & Places API Configuration
 * Refactored to fetch configuration from the backend API.
 */

import { dataService } from '../api';
import { logger } from '../utils/secureLogger';


// Default config as fallback
const DEFAULT_CONFIG = {
  apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  libraries: ['places'] as const,
  region: '',
  language: 'en',
};

export let GOOGLE_MAPS_CONFIG = { ...DEFAULT_CONFIG };

/**
 * Initialize Google Maps configuration from backend
 */
export async function initGoogleMapsConfig() {
  try {
    const config = await dataService.get('system_config', 'google_maps');
    if (config) {
      Object.assign(GOOGLE_MAPS_CONFIG, config);
    }
  } catch (error) {
    logger.warn('Failed to fetch Google Maps config, using defaults');
  }
}

/**
 * Get the Google Maps API script URL
 */
export function getGoogleMapsScriptUrl(): string {
  const { apiKey, libraries } = GOOGLE_MAPS_CONFIG;
  return `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=${libraries.join(',')}`;
}

/**
 * Check if Google Maps API key is configured
 */
export function isGoogleMapsConfigured(): boolean {
  const key = GOOGLE_MAPS_CONFIG.apiKey;
  return key !== '' && key !== undefined && key !== 'YOUR_GOOGLE_PLACES_API_KEY';
}

/**
 * Get configuration warnings for development
 */
export function getConfigurationWarning(): string | null {
  if (!isGoogleMapsConfigured()) {
    return 'Google Maps API is not configured. Address autocomplete will not work.';
  }
  return null;
}
