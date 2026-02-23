/**
 * Recording API
 * Manages session recordings, consent, and access
 */

import { get, post, del } from './client';

export interface RecordingConsent {
  userId: string;
  sessionId: string;
  consentGiven: boolean;
  timestamp: string;
  ipAddress?: string;
}

export interface RevokeConsentRequest {
  sessionId: string;
  reason?: string;
}

export interface SessionConsentStatus {
  sessionId: string;
  totalParticipants: number;
  consentGiven: number;
  consentDenied: number;
  consentPending: number;
  allConsented: boolean;
  participants: Array<{
    userId: string;
    name: string;
    consentGiven?: boolean;
    consentedAt?: string;
  }>;
}

export interface ConsentValidation {
  canRecord: boolean;
  missingConsent: string[];
  allConsented: boolean;
}

export interface DownloadLinkResponse {
  downloadUrl: string;
  expiresAt: string;
}

export interface RecordingAccessLog {
  id: string;
  recordingId: string;
  userId: string;
  userName: string;
  action: 'view' | 'download' | 'share';
  timestamp: string;
  ipAddress?: string;
}

export interface RecordingMetadata {
  id: string;
  sessionId: string;
  fileName: string;
  fileSize: number;
  duration: number; // seconds
  format: string;
  startedAt: string;
  endedAt: string;
  startedBy: string;
  status: 'recording' | 'processing' | 'completed' | 'failed';
  downloadUrl?: string;
  thumbnailUrl?: string;
}

export interface Recording {
  id: string;
  sessionId: string;
  metadata: RecordingMetadata;
  accessLogs: RecordingAccessLog[];
  createdAt: string;
}

export interface StartRecordingRequest {
  sessionId: string;
  fileName?: string;
}

export interface StopRecordingRequest {
  sessionId: string;
}

export interface JibriWebhookPayload {
  recordingId: string;
  status: 'started' | 'stopped' | 'completed' | 'failed';
  fileUrl?: string;
  error?: string;
}

/**
 * Collect recording consent
 */
export async function collectRecordingConsent(
  sessionId: string,
  consentGiven: boolean
): Promise<RecordingConsent> {
  return post<RecordingConsent>('/recordings/consent', {
    sessionId,
    consentGiven,
  });
}

/**
 * Revoke recording consent
 */
export async function revokeRecordingConsent(
  request: RevokeConsentRequest
): Promise<void> {
  return post('/recordings/consent/revoke', request);
}

/**
 * Get session consent status
 */
export async function getSessionConsentStatus(
  sessionId: string
): Promise<SessionConsentStatus> {
  return get<SessionConsentStatus>(`/recordings/sessions/${sessionId}/consent`);
}

/**
 * Validate session consent (moderator only)
 */
export async function validateSessionConsent(
  sessionId: string
): Promise<ConsentValidation> {
  return get<ConsentValidation>(
    `/recordings/sessions/${sessionId}/consent/validation`
  );
}

/**
 * Generate download link for recording
 */
export async function generateDownloadLink(
  recordingId: string
): Promise<DownloadLinkResponse> {
  return post<DownloadLinkResponse>(`/recordings/${recordingId}/download-link`, {});
}

/**
 * Get recording access logs
 */
export async function getRecordingAccessLogs(
  recordingId: string
): Promise<RecordingAccessLog[]> {
  return get<RecordingAccessLog[]>(`/recordings/${recordingId}/access-logs`);
}

/**
 * Get user's recording access history
 */
export async function getUserAccessHistory(): Promise<RecordingAccessLog[]> {
  return get<RecordingAccessLog[]>('/recordings/user/access-history');
}

/**
 * Start recording (moderator only)
 */
export async function startRecording(
  request: StartRecordingRequest
): Promise<RecordingMetadata> {
  return post<RecordingMetadata>('/recordings/start', request);
}

/**
 * Stop recording (moderator only)
 */
export async function stopRecording(
  request: StopRecordingRequest
): Promise<RecordingMetadata> {
  return post<RecordingMetadata>('/recordings/stop', request);
}

/**
 * Get recording metadata
 */
export async function getRecordingMetadata(
  recordingId: string
): Promise<RecordingMetadata> {
  return get<RecordingMetadata>(`/recordings/${recordingId}/metadata`);
}

/**
 * Delete recording (therapist/admin only)
 */
export async function deleteRecording(recordingId: string): Promise<void> {
  return del(`/recordings/${recordingId}`);
}

/**
 * Get session recordings
 */
export async function getSessionRecordings(
  sessionId: string
): Promise<Recording[]> {
  return get<Recording[]>(`/recordings/sessions/${sessionId}`);
}

/**
 * Jibri webhook callback (system only)
 * This is called by the Jibri recording service
 */
export async function handleJibriWebhook(
  payload: JibriWebhookPayload
): Promise<void> {
  return post('/recordings/webhook', payload);
}
