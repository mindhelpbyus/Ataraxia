/**
 * api/appsyncEvents.ts — AWS AppSync Event API client (web port)
 *
 * Direct TypeScript port of the mobile apps' real-time messaging transport
 * (`community-app/lib/services/chat/appsync_service.dart`,
 *  `therapistApp` equivalent). Keeps the SAME backend, channels, auth, and
 * wire protocol so web ↔ mobile chat is interoperable.
 *
 * AppSync **Event API** (not GraphQL):
 *  - Publish:   HTTP POST {endpoint}            body { channel, events: [jsonString] }
 *  - Subscribe: WSS  {host→realtime}/event/realtime  with TWO subprotocols:
 *       1. "aws-appsync-event-ws"
 *       2. "header-<base64url(authPayload)>"
 *    where authPayload = { host: <HTTP host>, Authorization: <Cognito ID token> }
 *  - After the socket opens, send { type:"connection_init" }, await
 *    { type:"connection_ack" }; thereafter the channel in the auth host is live.
 *    Server pushes { type:"data", event:{...} }; "ka" = keep-alive.
 *
 * Auth: Cognito **ID token** (raw JWT) in the Authorization header — matches the
 * mobile apps and the gateway's default-deny authorizer. The API key is NOT used.
 *
 * Channel naming (identical to mobile): `chat/channel/{conversationId}`.
 */

import { getCurrentSession } from '../lib/cognito';
import { APPSYNC_EVENTS_ENDPOINT } from '../config';

export interface ChatEvent {
  type: string;
  conversationId: string;
  payload: Record<string, unknown>;
  timestamp: string;
}

export type ChatEventHandler = (event: ChatEvent) => void;
export type ErrorHandler = (error: unknown) => void;

const MAX_RETRIES = 3;
const INITIAL_RETRY_MS = 500;
const RETRY_BACKOFF = 2.0;
const CONNECTION_ACK_TIMEOUT_MS = 5000;

export function conversationChannel(conversationId: string): string {
  return `chat/channel/${conversationId}`;
}

interface ChannelState {
  ws: WebSocket | null;
  handlers: Set<ChatEventHandler>;
  errorHandlers: Set<ErrorHandler>;
  acked: boolean;
  closedByUser: boolean;
  attempt: number;
}

/** Singleton manager for AppSync Event API channels (mirrors the Dart service). */
class AppSyncEventClient {
  private channels = new Map<string, ChannelState>();

  /** Subscribe to a channel; returns an unsubscribe function. */
  subscribe(
    channel: string,
    onEvent: ChatEventHandler,
    onError?: ErrorHandler,
  ): () => void {
    let state = this.channels.get(channel);
    if (!state) {
      state = {
        ws: null,
        handlers: new Set(),
        errorHandlers: new Set(),
        acked: false,
        closedByUser: false,
        attempt: 0,
      };
      this.channels.set(channel, state);
      void this.connect(channel, 1);
    }
    state.handlers.add(onEvent);
    if (onError) state.errorHandlers.add(onError);

    return () => {
      const s = this.channels.get(channel);
      if (!s) return;
      s.handlers.delete(onEvent);
      if (onError) s.errorHandlers.delete(onError);
      // Tear down the socket only when nobody is listening anymore.
      if (s.handlers.size === 0) this.closeChannel(channel);
    };
  }

  /** Publish an event to a channel via HTTP POST (AppSync Event API format). */
  async publish(channel: string, event: Record<string, unknown>): Promise<boolean> {
    return this.publishWithRetry(channel, event, 1);
  }

  private async publishWithRetry(
    channel: string,
    event: Record<string, unknown>,
    attempt: number,
  ): Promise<boolean> {
    try {
      const idToken = await this.idToken();
      const res = await fetch(APPSYNC_EVENTS_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // AppSync Event API expects the raw Cognito ID token (no "Bearer ").
          Authorization: idToken,
        },
        // Each event must be a JSON *string* inside the events array.
        body: JSON.stringify({ channel, events: [JSON.stringify(event)] }),
      });

      if (res.ok) return true;

      const retryable = res.status >= 500 || res.status === 429;
      if (retryable && attempt < MAX_RETRIES) {
        await delay(this.backoff(attempt));
        return this.publishWithRetry(channel, event, attempt + 1);
      }
      console.error(`AppSync publish failed: HTTP ${res.status}`);
      return false;
    } catch (e) {
      if (attempt < MAX_RETRIES) {
        await delay(this.backoff(attempt));
        return this.publishWithRetry(channel, event, attempt + 1);
      }
      console.error('AppSync publish error', e);
      return false;
    }
  }

  private async connect(channel: string, attempt: number): Promise<void> {
    const state = this.channels.get(channel);
    if (!state || state.closedByUser) return;
    state.attempt = attempt;

    try {
      const endpoint = new URL(APPSYNC_EVENTS_ENDPOINT);
      const httpHost = endpoint.host; // {apiId}.appsync-api.{region}.amazonaws.com
      const wsHost = httpHost.replace('appsync-api', 'appsync-realtime-api');

      const idToken = await this.idToken();

      // Auth payload uses the HTTP host, NOT the realtime host (per protocol).
      const authPayload = { host: httpHost, Authorization: idToken };
      const authHeader = base64UrlEncode(JSON.stringify(authPayload));

      const wsUrl = `wss://${wsHost}/event/realtime`;
      const protocols = ['aws-appsync-event-ws', `header-${authHeader}`];

      const ws = new WebSocket(wsUrl, protocols);
      state.ws = ws;
      state.acked = false;

      const ackTimer = setTimeout(() => {
        if (!state.acked) {
          try { ws.close(); } catch { /* noop */ }
        }
      }, CONNECTION_ACK_TIMEOUT_MS);

      ws.onopen = () => {
        // Auth rides in the subprotocol; just kick off the handshake.
        ws.send(JSON.stringify({ type: 'connection_init' }));
        // Subscribe to the specific channel after init (Event API per-channel sub).
        ws.send(JSON.stringify({ type: 'subscribe', id: channel, channel }));
      };

      ws.onmessage = (evt) => {
        let data: Record<string, unknown>;
        try {
          data = JSON.parse(evt.data as string);
        } catch {
          return;
        }
        const messageType = data.type as string | undefined;
        switch (messageType) {
          case 'connection_ack':
            state.acked = true;
            clearTimeout(ackTimer);
            state.attempt = 1; // reset backoff on a healthy connection
            break;
          case 'subscribe_success':
            break;
          case 'data': {
            const eventData = (data.event ?? data) as unknown;
            const parsed = parseChatEvent(eventData);
            if (parsed) state.handlers.forEach((h) => h(parsed));
            break;
          }
          case 'ka': // keep-alive
            break;
          case 'error':
          case 'connection_error':
          case 'subscribe_error': {
            const err = data.error ?? data.errors ?? data.message ?? 'Unknown error';
            state.errorHandlers.forEach((h) => h(err));
            break;
          }
          default:
            break;
        }
      };

      ws.onerror = (e) => {
        state.errorHandlers.forEach((h) => h(e));
      };

      ws.onclose = () => {
        clearTimeout(ackTimer);
        state.ws = null;
        if (!state.closedByUser && this.channels.has(channel)) {
          this.scheduleReconnect(channel, state.attempt);
        }
      };
    } catch (e) {
      state.errorHandlers.forEach((h) => h(e));
      this.scheduleReconnect(channel, attempt);
    }
  }

  private scheduleReconnect(channel: string, attempt: number): void {
    if (attempt >= MAX_RETRIES) {
      console.error(`AppSync: max reconnect attempts reached for "${channel}"`);
      return;
    }
    setTimeout(() => {
      const s = this.channels.get(channel);
      if (s && !s.closedByUser) void this.connect(channel, attempt + 1);
    }, this.backoff(attempt));
  }

  private closeChannel(channel: string): void {
    const state = this.channels.get(channel);
    if (!state) return;
    state.closedByUser = true;
    try { state.ws?.close(); } catch { /* noop */ }
    this.channels.delete(channel);
  }

  private backoff(attempt: number): number {
    return INITIAL_RETRY_MS * RETRY_BACKOFF * (attempt - 1) || INITIAL_RETRY_MS;
  }

  private async idToken(): Promise<string> {
    const session = await getCurrentSession();
    if (!session?.idToken) {
      throw new Error('Not authenticated: no Cognito ID token for AppSync.');
    }
    return session.idToken;
  }
}

function parseChatEvent(raw: unknown): ChatEvent | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.type !== 'string') return null;
  return {
    type: r.type,
    conversationId: (r.conversationId as string) ?? '',
    payload: (r.payload as Record<string, unknown>) ?? {},
    timestamp: (r.timestamp as string) ?? new Date().toISOString(),
  };
}

/** Base64URL encode (no padding) — matches the Dart base64Url with `=` stripped. */
function base64UrlEncode(input: string): string {
  const b64 = btoa(unescape(encodeURIComponent(input)));
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export const appsyncEvents = new AppSyncEventClient();
