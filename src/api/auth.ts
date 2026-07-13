/**
 * api/auth.ts — Auth API (AWS Cognito, direct SDK)
 *
 * ✅ Identity is AWS Cognito. The browser authenticates directly against the shared
 *    user pool via SRP (see lib/cognito.ts) — there is NO backend `/auth/*` route.
 * ✅ The resulting access token is sent as `Authorization: Bearer` on every API call
 *    (see api/client.ts); the API Gateway validates it.
 * ✅ No Firebase, no HTTP-only cookies, no mock/local-DB path.
 */

import {
  cognitoSignIn,
  cognitoSignOut,
  getCurrentSession,
  respondToTotpChallenge,
  startTotpSetup,
  verifyAndEnableTotp,
  disableTotp,
  getMfaEnabled,
  changePassword,
  userPool,
  newCognitoUser,
  type SignInResult,
} from '../lib/cognito';
import {
  CognitoUserAttribute,
} from 'amazon-cognito-identity-js';

// ─── Types ────────────────────────────────────────────────────────────────────

/** Canonical user shape used across the app */
export interface AuthUser {
  id: string;
  email: string | null;
  phone: string | null;
  name: string;
  first_name?: string;
  last_name?: string;
  role: 'therapist' | 'client' | 'admin' | 'superadmin' | string;
  avatar?: string;
  account_status?: string;
  is_verified?: boolean;
  mfaEnabled?: boolean;
  additional_roles?: string[];
  permissions?: string[];
  organizationId?: string;
  onboardingStatus?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role?: string;
}

// ─── Role normalization ──────────────────────────────────────────────────────────

/** Canonical roles the app understands. Authority comes from Cognito **groups**
 *  (`cognito:groups`); this only canonicalizes the group name so the rest of the
 *  app checks ONE value. Unknown values fall back to the least-privileged role. */
export type CanonicalRole = 'superadmin' | 'org_admin' | 'admin' | 'therapist' | 'client';

/**
 * Cognito User Pool group names → canonical app role.
 *
 * The four groups configured in AWS are: `Admin`, `Clients`, `SuperAdmin`,
 * `Therapists`. Matching is case-insensitive and plural-tolerant (see
 * `normalizeRole`), so e.g. `SuperAdmin`/`superadmin` and `Clients`/`client`
 * all resolve correctly. Extra aliases below keep us robust to future renames.
 */
const ROLE_ALIASES: Record<string, CanonicalRole> = {
  // AWS Cognito groups (lowercased)
  superadmin: 'superadmin',
  admin: 'admin',
  therapist: 'therapist',
  client: 'client',
  // tolerant variants
  super_admin: 'superadmin',
  platform_admin: 'superadmin',
  org_admin: 'org_admin',
  organization_admin: 'org_admin',
  provider: 'therapist',
  counsellor: 'therapist',
  counselor: 'therapist',
  patient: 'client',
};

/** Privilege order, highest first — used to resolve users in multiple groups. */
const ROLE_PRECEDENCE: CanonicalRole[] = ['superadmin', 'org_admin', 'admin', 'therapist', 'client'];

/** Map a single Cognito group name to a canonical role. Tolerant of case,
 *  whitespace, hyphen/underscore, and trailing plural (e.g. `Therapists`). */
export function normalizeRole(raw: unknown): CanonicalRole {
  if (typeof raw !== 'string') return 'client';
  const key = raw.trim().toLowerCase().replace(/[\s-]+/g, '_');
  return (
    ROLE_ALIASES[key] ??
    ROLE_ALIASES[key.replace(/s$/, '')] ?? // Clients -> client, Therapists -> therapist
    'client'
  );
}

/** Resolve the effective role from `cognito:groups` (an array, since a user may
 *  belong to several groups). Picks the highest-privilege matching group. */
export function roleFromGroups(groups: unknown): CanonicalRole {
  const list = Array.isArray(groups) ? groups : groups != null ? [groups] : [];
  const roles = list.map(normalizeRole);
  return ROLE_PRECEDENCE.find((r) => roles.includes(r)) ?? 'client';
}

// ─── Claim mapping ──────────────────────────────────────────────────────────────

/** Build an AuthUser from decoded Cognito id-token claims. */
function userFromClaims(claims: Record<string, any>): AuthUser {
  const first = claims.given_name ?? claims['custom:firstName'] ?? '';
  const last = claims.family_name ?? claims['custom:lastName'] ?? '';
  const name = `${first} ${last}`.trim() || claims.email || claims['cognito:username'] || 'User';
  return {
    id: claims.sub,
    email: claims.email ?? null,
    phone: claims.phone_number ?? null,
    name,
    first_name: first || undefined,
    last_name: last || undefined,
    role: roleFromGroups(claims['cognito:groups']),
    is_verified: claims.email_verified === true || claims.email_verified === 'true',
    organizationId: claims['custom:organizationId'] ?? undefined,
  };
}

// ─── Auth Operations (Cognito) ───────────────────────────────────────────────────

/** Thrown by `login` when the account has TOTP MFA enabled. The UI should collect a
 *  code and call `completeMfaLogin(challenge, code)`. */
export class MfaRequiredError extends Error {
  challenge: Extract<SignInResult, { status: 'TOTP_REQUIRED' }>;
  constructor(challenge: Extract<SignInResult, { status: 'TOTP_REQUIRED' }>) {
    super('MFA_REQUIRED');
    this.name = 'MfaRequiredError';
    this.challenge = challenge;
  }
}

/** Email + password login via Cognito SRP. Throws MfaRequiredError if TOTP is on. */
export async function login(email: string, password: string): Promise<AuthUser> {
  const result = await cognitoSignIn(email, password);
  if (result.status === 'TOTP_REQUIRED') {
    throw new MfaRequiredError(result);
  }
  return userFromClaims(result.tokens.claims);
}

/** Complete an MFA-gated login with the user's TOTP code. */
export async function completeMfaLogin(
  challenge: MfaRequiredError['challenge'],
  code: string
): Promise<AuthUser> {
  const tokens = await respondToTotpChallenge(challenge.user, code);
  return userFromClaims(tokens.claims);
}

/** Alias for login — used by useProviderAgnosticAuth and similar hooks */
export const signInWithEmailAndPassword = login;

// ─── MFA management (Cognito software TOTP) ───────────────────────────────────────

/** Begin TOTP enrollment — returns the secret (render as QR + manual key). */
export async function setupMFA(): Promise<{ secret: string; otpauthIssuer: string }> {
  const secret = await startTotpSetup();
  return { secret, otpauthIssuer: 'Ataraxia' };
}

/** Verify the first TOTP code and enable MFA. */
export async function verifyMFA(code: string): Promise<{ verified: boolean }> {
  await verifyAndEnableTotp(code);
  return { verified: true };
}

/** Disable TOTP MFA. */
export async function disableMFA(): Promise<void> {
  return disableTotp();
}

/** Current MFA status for the signed-in user. */
export async function getMFAStatus(): Promise<{ enabled: boolean; type: string | null }> {
  const enabled = await getMfaEnabled();
  return { enabled, type: enabled ? 'TOTP' : null };
}

/** Change password (old + new). */
export async function changeUserPassword(oldPassword: string, newPassword: string): Promise<void> {
  return changePassword(oldPassword, newPassword);
}

/** Register a new user in Cognito. Requires email confirmation per pool policy. */
export async function register(data: RegisterRequest): Promise<AuthUser> {
  const attributes: CognitoUserAttribute[] = [
    new CognitoUserAttribute({ Name: 'email', Value: data.email }),
    new CognitoUserAttribute({ Name: 'given_name', Value: data.firstName }),
    new CognitoUserAttribute({ Name: 'family_name', Value: data.lastName }),
  ];
  if (data.phoneNumber) {
    attributes.push(new CognitoUserAttribute({ Name: 'phone_number', Value: data.phoneNumber }));
  }
  // NOTE: role is NOT a Cognito attribute. Authority lives in Cognito **groups**
  // (Admin / Clients / SuperAdmin / Therapists). A browser client cannot add
  // itself to a group, so group assignment happens server-side — a Cognito
  // post-confirmation Lambda (or admin) puts the user in the right group based
  // on `data.role`. The `role` returned below is only an optimistic UI hint
  // until the next sign-in mints a token carrying `cognito:groups`.

  return new Promise((resolve, reject) => {
    userPool.signUp(data.email, data.password, attributes, [], (err, result) => {
      if (err || !result) {
        reject(err ?? new Error('Sign up failed'));
        return;
      }
      resolve({
        id: result.userSub,
        email: data.email,
        phone: data.phoneNumber ?? null,
        name: `${data.firstName} ${data.lastName}`.trim(),
        first_name: data.firstName,
        last_name: data.lastName,
        role: normalizeRole(data.role), // optimistic UI hint; real role comes from groups on next sign-in
        is_verified: false,
        account_status: 'pending_confirmation',
      });
    });
  });
}

/** Confirm a new account with the code Cognito emailed. */
export async function verifyEmail(email: string, code: string): Promise<void> {
  const user = newCognitoUser(email);
  return new Promise((resolve, reject) => {
    user.confirmRegistration(code, true, (err) => (err ? reject(err) : resolve()));
  });
}

/** Sign out of Cognito (clears local tokens). */
export async function logout(): Promise<void> {
  cognitoSignOut();
}

/** Current authenticated user from the active Cognito session, or throws if none. */
export async function getCurrentUser(): Promise<AuthUser> {
  const tokens = await getCurrentSession();
  if (!tokens) throw new Error('Not authenticated');
  return userFromClaims(tokens.claims);
}

// ─── Password reset (Cognito) ────────────────────────────────────────────────────

/** Trigger a Cognito password-reset code email. */
export async function forgotPassword(email: string): Promise<void> {
  const user = newCognitoUser(email);
  return new Promise((resolve, reject) => {
    user.forgotPassword({ onSuccess: () => resolve(), onFailure: (err) => reject(err) });
  });
}

/** Complete a password reset with the emailed code. */
export async function resetPassword(
  email: string,
  code: string,
  newPassword: string
): Promise<void> {
  const user = newCognitoUser(email);
  return new Promise((resolve, reject) => {
    user.confirmPassword(code, newPassword, {
      onSuccess: () => resolve(),
      onFailure: (err) => reject(err),
    });
  });
}

// ─── Legacy service export (used by LoginPage.tsx as RealAuthService) ─────────────

export const RealAuthService = {
  login,
  completeMfaLogin,
  logout,
  register,
  getCurrentUser,
  verifyEmail,
  forgotPassword,
  resetPassword,
  setupMFA,
  verifyMFA,
  disableMFA,
  getMFAStatus,
  changeUserPassword,
};
