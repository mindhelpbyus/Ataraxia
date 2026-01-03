/**
 * Session Hook
 * React hook for managing video session state
 */

import { useState, useEffect, useCallback } from 'react';
import {
  Session,
  createSession,
  getSession,
  joinSession,
  endSession,
  getSessionJWT,
  CreateSessionRequest,
  JoinSessionRequest
} from '../api/sessions';
import { ApiException } from '../api/client';
import { usePolling } from './useApi';

export function useSession(sessionId?: string, pollInterval: number = 5000) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiException | null>(null);
  const [jwt, setJwt] = useState<string | null>(null);

  // Poll for session updates if sessionId is provided
  const { data: polledSession } = usePolling(
    async () => {
      if (!sessionId) throw new Error('No session ID');
      return getSession(sessionId);
    },
    pollInterval,
    {
      enabled: !!sessionId,
      onSuccess: (data) => setSession(data)
    }
  );

  // Load session on mount
  useEffect(() => {
    if (!sessionId) return;

    async function loadSession() {
      try {
        setLoading(true);
        const data = await getSession(sessionId);
        setSession(data);
      } catch (err) {
        const apiError = err instanceof ApiException ? err : new ApiException({
          message: 'Failed to load session',
          code: 'SESSION_LOAD_ERROR'
        });
        setError(apiError);
      } finally {
        setLoading(false);
      }
    }

    loadSession();
  }, [sessionId]);

  const create = useCallback(async (request: CreateSessionRequest) => {
    try {
      setLoading(true);
      setError(null);
      const newSession = await createSession(request);
      setSession(newSession);
      return newSession;
    } catch (err) {
      const apiError = err instanceof ApiException ? err : new ApiException({
        message: 'Failed to create session',
        code: 'SESSION_CREATE_ERROR'
      });
      setError(apiError);
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, []);

  const join = useCallback(async (request: JoinSessionRequest) => {
    try {
      setLoading(true);
      setError(null);
      const joinResponse = await joinSession(request);
      setSession(joinResponse.session);
      setJwt(joinResponse.jwt);
      return joinResponse;
    } catch (err) {
      const apiError = err instanceof ApiException ? err : new ApiException({
        message: 'Failed to join session',
        code: 'SESSION_JOIN_ERROR'
      });
      setError(apiError);
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, []);

  const end = useCallback(async () => {
    if (!sessionId) return;

    try {
      setLoading(true);
      setError(null);
      await endSession(sessionId);
      
      // Update local session state
      if (session) {
        setSession({
          ...session,
          status: 'ended',
          endTime: new Date().toISOString()
        });
      }
    } catch (err) {
      const apiError = err instanceof ApiException ? err : new ApiException({
        message: 'Failed to end session',
        code: 'SESSION_END_ERROR'
      });
      setError(apiError);
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, [sessionId, session]);

  const getJWT = useCallback(async () => {
    if (!sessionId) throw new Error('No session ID');

    try {
      const response = await getSessionJWT(sessionId);
      setJwt(response.jwt);
      return response.jwt;
    } catch (err) {
      const apiError = err instanceof ApiException ? err : new ApiException({
        message: 'Failed to get JWT',
        code: 'JWT_ERROR'
      });
      setError(apiError);
      throw apiError;
    }
  }, [sessionId]);

  return {
    session,
    loading,
    error,
    jwt,
    create,
    join,
    end,
    getJWT
  };
}
