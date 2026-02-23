/**
 * Video Configuration API
 * Manages video call configuration, events, and commands
 */

import { get, post } from './client';

export interface VideoConfiguration {
  sessionId: string;
  jitsiDomain: string;
  roomName: string;
  displayName: string;
  email?: string;
  avatarUrl?: string;
  subject?: string;
  startWithAudioMuted: boolean;
  startWithVideoMuted: boolean;
  enableRecording: boolean;
  enableScreenSharing: boolean;
  enableChat: boolean;
  enableWaitingRoom: boolean;
  customConfig?: Record<string, any>;
}

export interface VideoEvent {
  type: string;
  timestamp: string;
  userId: string;
  data?: any;
}

export interface VideoCommand {
  command: string;
  target?: string; // userId for targeted commands
  params?: any;
}

export interface RecordingStatus {
  isRecording: boolean;
  recordingId?: string;
  startedAt?: string;
  startedBy?: string;
}

export interface VideoHealthStatus {
  healthy: boolean;
  jitsiServerReachable: boolean;
  databaseConnected: boolean;
  lastChecked: string;
}

export interface VideoAdminConfig {
  sessionId: string;
  jitsiDomain: string;
  jwtEnabled: boolean;
  jwtAppId?: string;
  recordingEnabled: boolean;
  maxParticipants: number;
  defaultSettings: Record<string, any>;
}

export interface ValidateJWTResponse {
  valid: boolean;
  decoded?: any;
  error?: string;
}

/**
 * Get video configuration for a session
 */
export async function getVideoConfig(
  sessionId: string
): Promise<VideoConfiguration> {
  return get<VideoConfiguration>(`/video/config/${sessionId}`);
}

/**
 * Send video event
 */
export async function sendVideoEvent(
  sessionId: string,
  event: Omit<VideoEvent, 'timestamp'>
): Promise<void> {
  return post(`/video/events/${sessionId}`, event);
}

/**
 * Execute video command (moderator only)
 */
export async function executeVideoCommand(
  sessionId: string,
  command: VideoCommand
): Promise<void> {
  return post(`/video/commands/${sessionId}`, command);
}

/**
 * Get recording status
 */
export async function getRecordingStatus(
  sessionId: string
): Promise<RecordingStatus> {
  return get<RecordingStatus>(`/video/recording/${sessionId}`);
}

/**
 * Start recording (moderator only)
 */
export async function startRecording(sessionId: string): Promise<RecordingStatus> {
  return post<RecordingStatus>(`/video/recording/${sessionId}/start`, {});
}

/**
 * Stop recording (moderator only)
 */
export async function stopRecording(sessionId: string): Promise<RecordingStatus> {
  return post<RecordingStatus>(`/video/recording/${sessionId}/stop`, {});
}

/**
 * Check video service health
 */
export async function checkVideoHealth(): Promise<VideoHealthStatus> {
  return get<VideoHealthStatus>('/video/health');
}

/**
 * List video configurations (admin only)
 */
export async function listVideoConfigs(): Promise<VideoAdminConfig[]> {
  return get<VideoAdminConfig[]>('/video/admin/config');
}

/**
 * Update video configuration (admin only)
 */
export async function updateVideoConfig(
  config: Partial<VideoAdminConfig>
): Promise<VideoAdminConfig> {
  return post<VideoAdminConfig>('/video/admin/config', config);
}

/**
 * Validate JWT token
 */
export async function validateJWT(token: string): Promise<ValidateJWTResponse> {
  return post<ValidateJWTResponse>('/video/validate-jwt', { token });
}
