/**
 * Jitsi API Service
 * Handles backend API calls for Jitsi video calling
 */

import { JITSI_CONFIG, getJitsiApiUrl } from '../config/jitsi';

export interface JitsiTokenRequest {
  roomName: string;
  userName: string;
  userEmail?: string;
  userId?: string;
  isModerator?: boolean;
  appointmentId?: string;
  expiresIn?: number; // seconds, default 7200 (2 hours)
}

export interface JitsiTokenResponse {
  token: string;
  roomName: string;
  joinUrl: string;
  expiresAt: string;
}

export interface CreateRoomRequest {
  appointmentId: string;
  therapistId: string;
  clientId: string;
  scheduledStartTime: string;
  callType: 'video' | 'audio';
}

export interface CreateRoomResponse {
  roomName: string;
  joinUrl: string;
  therapistToken: string;
  clientToken: string;
}

/**
 * Generate JWT token for Jitsi room
 */
export async function generateJitsiToken(
  request: JitsiTokenRequest
): Promise<JitsiTokenResponse> {
  try {
    const response = await fetch(getJitsiApiUrl('generateToken'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add your authentication headers here if needed
        // 'Authorization': `Bearer ${yourAuthToken}`,
      },
      body: JSON.stringify({
        roomName: request.roomName,
        userName: request.userName,
        userEmail: request.userEmail,
        userId: request.userId,
        isModerator: request.isModerator || false,
        appointmentId: request.appointmentId,
        expiresIn: request.expiresIn || 7200, // 2 hours default
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to generate token' }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    const data: JitsiTokenResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error generating Jitsi token:', error);
    throw new Error(`Failed to generate Jitsi token: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Create a new Jitsi room for an appointment
 * This generates tokens for both therapist and client
 */
export async function createJitsiRoom(
  request: CreateRoomRequest
): Promise<CreateRoomResponse> {
  try {
    const response = await fetch(getJitsiApiUrl('createRoom'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add your authentication headers here if needed
        // 'Authorization': `Bearer ${yourAuthToken}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to create room' }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    const data: CreateRoomResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating Jitsi room:', error);
    throw new Error(`Failed to create Jitsi room: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Validate a JWT token
 */
export async function validateJitsiToken(token: string): Promise<boolean> {
  try {
    const response = await fetch(getJitsiApiUrl('validateToken'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data.valid === true;
  } catch (error) {
    console.error('Error validating Jitsi token:', error);
    return false;
  }
}

/**
 * Mock implementation for testing without backend
 * Remove this once your backend is ready
 */
export async function generateMockJitsiToken(
  request: JitsiTokenRequest
): Promise<JitsiTokenResponse> {
  // Silently generate mock token for testing
  // This is expected behavior when backend is not running
  
  // Generate a mock token (this won't actually work with Jitsi)
  const mockToken = btoa(JSON.stringify({
    roomName: request.roomName,
    userName: request.userName,
    userId: request.userId,
    isModerator: request.isModerator,
    exp: Date.now() + (request.expiresIn || 7200) * 1000,
  }));

  return {
    token: mockToken,
    roomName: request.roomName,
    joinUrl: `https://${JITSI_CONFIG.domain}/${request.roomName}`,
    expiresAt: new Date(Date.now() + (request.expiresIn || 7200) * 1000).toISOString(),
  };
}
