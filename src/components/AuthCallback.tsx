/**
 * AuthCallback.tsx — Cognito Hosted UI return handler (federated Google sign-in).
 *
 * Cognito redirects here with `?code=...` after Google auth. We exchange the code
 * for tokens, hydrate the auth store, and route into the app.
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { exchangeCodeForTokens } from '../lib/cognito';
import { roleFromGroups } from '../api/auth';
import { useAuthStore } from '../store/authStore';

export function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const oauthError = params.get('error_description') || params.get('error');

    if (oauthError) {
      setError(oauthError);
      return;
    }
    if (!code) {
      setError('Missing authorization code');
      return;
    }

    (async () => {
      try {
        const tokens = await exchangeCodeForTokens(code);
        const c = tokens.claims;
        useAuthStore.getState()._setUser({
          id: c.sub,
          email: c.email ?? null,
          phone: c.phone_number ?? null,
          name: `${c.given_name ?? ''} ${c.family_name ?? ''}`.trim() || c.email || 'User',
          role: roleFromGroups(c['cognito:groups']),
        });
        navigate('/dashboard', { replace: true });
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Sign-in failed');
      }
    })();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center text-muted-foreground">
      {error ? (
        <div className="text-center space-y-3">
          <p className="text-destructive">{error}</p>
          <button onClick={() => navigate('/login', { replace: true })} className="underline">
            Back to sign in
          </button>
        </div>
      ) : (
        <p>Signing you in…</p>
      )}
    </div>
  );
}
