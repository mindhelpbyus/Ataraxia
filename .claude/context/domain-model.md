# Ataraxia — Domain Model (frontend)

> **Start here for any feature/API work.** Maps routes → pages, API clients → backend ownership, and the
> auth flow. Keep current via the `ai-maintenance` skill after structural changes. Repo-specific — never
> shared with `backend-initial` / `billing_payment`.

Last updated: 2026-05-30 (initial — created during the cleanup/standardization effort).

---

## 1. Routes → Pages (`src/App.tsx`)

| Route | Access | Component |
|-------|--------|-----------|
| `/login` | public | `LoginPage` |
| `/register` | public | registration page |
| `/client-registration` | public | client registration |
| `/verification-pending` | public | `VerificationPendingPage` |
| `/documents/:documentId` | public | `DocumentViewer` |
| `/dashboard/*` | protected | role-based dashboard (Admin / Professional / Client / SuperAdmin views) |
| `/security` | protected | `SecurityDashboard` |
| `/mfa-setup` | protected | MFA setup |
| `/sessions` | protected | sessions/booking |
| `/org` | protected | organization management |
| `/` , `*` | — | redirect → `/dashboard` (auth) or `/login` |

Dashboard views: `AdminDashboardView`, `ProfessionalDashboard`, `ClientDashboardView`,
`SuperAdminDashboardView` (selected by role).

---

## 2. API clients → backend ownership (`src/api/`)

> ⚠️ **VERIFIED route map (2026-05-30).** `backend-initial` routes have **NO `/api/` prefix**
> (`/clients`, `/appointments`, `/therapists`, `/clinical-notes`, `/admin/dashboard/counts`, `/payouts`…).
> `billing_payment` routes **DO** use `/api/` (`/api/payments`, `/api/wallet/*`, `/api/invoices/*`,
> `/api/refunds`, `/api/disputes`, `/api/sessions/*`, `/api/pricing/quote`, `/api/clients/:id/wallet`).
> The legacy `/api/v1/*` paths in old FE code are **fiction — none exist**.
>
> **backend-initial** (shared gateway, no `/api/` prefix): `/appointments`, `/clients`, `/therapists`,
> `/therapists/availability`, `/clinical-notes`, `/intake-forms`, `/homework`, `/journal/entries`,
> `/moods`, `/quick-notes`, `/chat/*`, `/notifications/*`, `/files`, `/session-recordings/*`,
> `/admin/dashboard/counts`, `/admin/{clients,therapists,appointments}`, `/therapists/{id}/approve|reject`,
> `/payouts`.
> **billing_payment** (shared gateway, `/api/` prefix): `/api/sessions/*`, `/api/payments/*`,
> `/api/wallet/*`, `/api/invoices/*`, `/api/refunds`, `/api/disputes/*`, `/api/payouts`,
> `/api/payout-batches`, `/api/pricing/*`, `/api/clients/:id/wallet`.
> **video-service** (SEPARATE backend, `VITE_VIDEO_API_BASE_URL`, via `videoGet`/`videoPost`):
> `/rooms`, `/rooms/:id/end`, `/appointments/:id/join` (→ LiveKit token), `/rooms/:id/transcript/*`.
> Note: video-service currently uses a shared-secret JWT, not Cognito JWKS — reconcile server-side.

> **Three-backend model (2026-05-30):** Ataraxia calls ONLY backend-initial + billing_payment (one shared
> gateway, `VITE_API_BASE_URL`) and video-service (`VITE_VIDEO_API_BASE_URL`). All fictional `/api/v1/*`
> paths and stale `localhost:300x`/`*_SERVICE_URL` references have been removed. `api/calls.ts` and
> `useVideoToken` now hit video-service; verification hits backend-initial `/admin/therapists` +
> `/therapists/{id}/approve|reject`. `HomeView` uses `/admin/dashboard/counts` + `/appointments` + `/clients`.
> Deleted dead duplicate clients: `secureSessions.ts`, `secureVideo.ts`, `video.ts`.
> Routes with NO backend home yet (TODO): `/organizations`, call-logs/invitations/SSE, recording-consent.

All clients go through `src/api/client.ts` (Bearer token, one base URL). Path prefix selects the backend.

| Module | Path(s) | Backend |
|--------|---------|---------|
| `auth.ts` | — (Cognito SRP, client-side) | **AWS Cognito** directly |
| `appointments.ts` | `/appointments/*` | backend-initial |
| `sessions.ts` | session/booking | backend-initial |
| `roles.ts` | roles/permissions | backend-initial |
| `verification.ts` | identity verification | backend-initial |
| `messaging.ts` | chat | backend-initial (WebSocket / community-stack) |
| `video.ts` | LiveKit token | backend-initial (or video-service) |
| `recordings.ts`, `waitingRoom.ts`, `calls.ts`, `jitsi.ts` | video/session support | backend-initial / video-service |
| `health.ts` | health check | backend-initial |
| `subscription.ts` | `/api/payments/*`, `/api/wallet/*`, `/api/invoices`, `/api/pricing/quote` | **billing_payment** |
| `data.ts`, `logging.ts` | misc/telemetry | backend-initial |

> **Cleanup note:** `secureSessions.ts`/`secureVideo.ts`/`appointmentsBackend.ts` are duplicate variants
> being collapsed into `sessions.ts`/`video.ts`/`appointments.ts`. Once merged, remove this note.

> **Demo-path removal (Phase 2 — DATA LAYER DONE 2026-05-30):** the legacy `USE_LOCAL_DB`/`localDb`/
> `apiSwitch` demo source has been removed from ALL view components and data API clients, and every call
> rewired to the **verified real routes** (backend-initial no-prefix / billing_payment `/api/`). The fake
> `/api/v1/*` paths are gone from views and appointments/messaging clients. Wired examples:
> - `DashboardView`/`SuperAdminDashboardView` → `GET /admin/dashboard/counts`, `/appointments`, `/clients`, `/therapists`
> - `BillingView`/`InvoicesView` → `GET /api/invoices` (billing_payment)
> - `ProfessionalClientsView` → `/clients` or `/therapist/{id}/clients`; `EnhancedTherapistsTable` → `/therapists`
> - `ClientDashboardView` → `/appointments/client/{clientId}`; `TasksView` → `/homework`; `QuickNotesView` → `/quick-notes`
> - `messaging.ts` → `/chat/*`; `appointmentsBackend.ts` → `/appointments*`
> - `OrganizationManagementView` → `/organizations` is a **TODO(backend)** (no route exists yet); demo "reset DB" button removed.
>
> **Still pending (Phase 3b):** `api/auth.ts`, `api/client.ts`, `LoginPage.tsx` still use the fictional
> `/auth/*` backend + `localAuth`/`devMockUser` mock login. These need the Cognito SRP rewrite. The
> files `src/lib/db/*`, `src/lib/apiSwitch.ts`, `src/lib/devMockUser.ts` are deleted only after that.

---

## 3. Auth flow (AWS Cognito, Bearer token)

```
LoginPage
  → api/auth.login(email, password)            // Cognito SRP via amazon-cognito-identity-js
  → Cognito returns { idToken, accessToken, refreshToken }
  → authStore sets { user, isAuthenticated }   // src/store/authStore.ts (Zustand)
  → every api/client.ts request adds Authorization: Bearer <token>
  → API Gateway HttpJwtAuthorizer validates against the shared Cognito user pool
  → on 401: client.ts attempts silent refresh, else redirect → /login
```

- **State:** `src/store/authStore.ts` (`user`, `isAuthenticated`, `login`, `logout`, `checkAuth`,
  `_setUser`). Persists only `{ id, role }` to sessionStorage (minimum-necessary PII); `queryClient.clear()`
  on logout wipes cached PHI.
- **Web app client:** use `adminWebClientId` from backend-initial auth-stack (trusted JWT audience).
- **Tokens:** access/id 1h, refresh 30d; refresh handled client-side.

> **✅ Cognito migration complete (2026-05-30).** Implemented:
> - `src/lib/cognito.ts` — direct AWS SDK (`amazon-cognito-identity-js`): SRP sign-in, TOTP MFA challenge,
>   MFA enroll/verify/disable, password change, global sign-out, silent session/token access.
> - `api/auth.ts` — login (+`MfaRequiredError`/`completeMfaLogin`), register, verifyEmail, forgot/reset,
>   setupMFA/verifyMFA/getMFAStatus — all Cognito. No `/auth/*` backend calls remain.
> - `api/client.ts` — sends `Authorization: Bearer <cognito accessToken>`; cookie/CSRF model removed.
> - `LoginPage.tsx` — rewritten: email/password → MFA → forgot/reset (Cognito), branded split-screen.
> - `MFASetup` (TOTP-only), `SecurityDashboard` (MFA-status scoring), `SessionManager` (global sign-out;
>   Cognito has no server session list) reworked.
> - Real ap-south-1 values: pool `ap-south-1_KaAJ3JWpR`, public client `25rr1ttl8rm3cv65nv2sqfh1bs`,
>   gateway `https://pi4qs5lpn5.execute-api.ap-south-1.amazonaws.com` (in `.env.dev`).
> - Deleted: `src/lib/db/*`, `src/lib/apiSwitch.ts`, `src/lib/devMockUser.ts`, dead `imports/Dashboard-6430-5255.tsx`.

---

## 4. State stores & key hooks

| Store / hook | Purpose |
|--------------|---------|
| `store/authStore.ts` | Auth/session state (Cognito) |
| `lib/queryClient.ts` | TanStack Query client (server cache, cleared on logout) |
| `hooks/useApi.ts` | Generic API call hook |
| `hooks/useSession.ts` | Session/booking |
| `hooks/useRoles.ts` | Role/permission checks |
| `hooks/useVideoToken.ts` | LiveKit token retrieval |

> `hooks/useProviderAgnosticAuth.ts` is a legacy compatibility wrapper — being removed in favor of
> `authStore` + `api/auth`.

---

## 5. Cross-repo dependencies

- **backend-initial** — owns the API Gateway, Cognito user pool, and the core REST surface. Auth
  contract: Cognito JWT in `Authorization: Bearer`. No `/auth/login` (login is Cognito-direct).
- **billing_payment** — payments/wallet/payouts/invoices behind the **same** gateway under `/api/*`.
- The FE depends on these being deployed; it provisions nothing.
