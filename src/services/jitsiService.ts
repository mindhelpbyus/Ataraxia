/**
 * Jitsi Service - Refactored to use API layer
 */

import { JITSI_CONFIG, initJitsiConfig } from '../config/jitsi';
import { getSessionJWT } from '../api/sessions';
import { logger } from './secureLogger';

export interface JitsiOptions {
  roomName: string;
  width?: string | number;
  height?: string | number;
  parentNode?: HTMLElement;
  configOverwrite?: Record<string, any>;
  interfaceConfigOverwrite?: Record<string, any>;
  userInfo?: {
    displayName?: string;
    email?: string;
    avatarURL?: string;
  };
  jwt?: string;
}

/**
 * Generate JWT token for Jitsi authentication
 */
export async function generateJitsiJWT(
  roomName: string,
  userName: string,
  userEmail?: string,
  userId?: string,
  isModerator: boolean = false,
  appointmentId?: string
): Promise<string> {
  // Ensure config is loaded
  if (JITSI_CONFIG.domain === 'meet.jit.si') {
    await initJitsiConfig();
  }

  if (!JITSI_CONFIG.useJWT) {
    return '';
  }

  try {
    // TODO: Call backend to generate real JWT token
    // For now, return empty string to use Jitsi without JWT
    logger.warn('JWT token generation not implemented yet, using Jitsi without authentication');
    return '';
  } catch (error) {
    logger.error('Error generating Jitsi token', error);
    return '';
  }
}

/**
 * Get custom Jitsi configuration
 */
export function getJitsiConfig(
  roomName: string,
  userName: string,
  userEmail?: string,
  jwtToken?: string
): JitsiOptions {
  return {
    roomName,
    width: '100%',
    height: '100%',
    jwt: jwtToken,
    configOverwrite: {
      defaultLogoUrl: '/ataraxia-logo.png',
      startWithAudioMuted: false,
      startWithVideoMuted: false,
      enableChat: true,
      enableRecording: true,
    },
    interfaceConfigOverwrite: {
      APP_NAME: 'Ataraxia',
      NATIVE_APP_NAME: 'Ataraxia',
      PROVIDER_NAME: 'Ataraxia Wellness',
      SHOW_JITSI_WATERMARK: false,
      SHOW_WATERMARK_FOR_GUESTS: false,
      DEFAULT_BACKGROUND: '#0176d3',
      DEFAULT_LOGO_URL: '/ataraxia-logo.png',
    },
    userInfo: {
      displayName: userName,
      email: userEmail,
    }
  };
}

export function generateRoomName(appointmentId: string): string {
  return `ataraxia-${appointmentId}-${Date.now()}`;
}

export function generateDirectChatRoom(userId1: string, userId2: string): string {
  const ids = [userId1, userId2].sort();
  return `ataraxia-dm-${ids[0]}-${ids[1]}`;
}

export function parseRoomName(roomName: string): { type: 'appointment' | 'direct', id: string } | null {
  if (roomName.startsWith('ataraxia-dm-')) {
    return { type: 'direct', id: roomName };
  }
  const match = roomName.match(/^ataraxia-([^-]+)-/);
  if (match) {
    return { type: 'appointment', id: match[1] };
  }
  return null;
}

export function getJitsiDomain(): string {
  return JITSI_CONFIG.domain;
}

export function isJitsiAvailable(): boolean {
  return typeof window !== 'undefined';
}
