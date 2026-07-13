# Ataraxia — Domain Model (frontend)

> **Start here for any feature/API work.** Maps routes → pages, API clients → backend ownership, and the
> auth flow. Keep current via the `ai-maintenance` skill after structural changes. Repo-specific — never
> shared with `backend-initial` / `billing_payment`.

Last updated: 2026-07-12 (MVP0 mock-data eradication + billing transport unblock + design-system pass +
screen-depth pass + apiFetch/Zod adoption — fixed a live double-unwrap bug, see below).

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

> ⚠️ **VERIFIED route map (2026-07-12 — corrected from the 2026-05-30 version, which had the billing
> prefix wrong).** `backend-initial` routes have **NO `/api/` prefix** (`/clients`, `/appointments`,
> `/therapists`, `/clinical-notes`, `/admin/dashboard/counts`, `/roles`, `/users/me/role`…).
> `billing_payment` routes use **`/billing/*`** (NOT `/api/*` — that was a documentation error; the
> Lambda internally rewrites `/billing/…` → `/api/…`, which is why old docs/code confused the two).
> The legacy `/api/v1/*` and `/api/invoices`-style paths in old FE code were **fiction — none exist**.
>
> **backend-initial** (shared gateway, no `/api/` prefix): `/appointments`, `/clients`, `/therapists`,
> `/therapists/availability`, `/therapists/me/earnings-summary`, `/clinical-notes`, `/intake-forms`,
> `/homework`, `/journal/entries`, `/moods`, `/quick-notes`, `/chat/*`, `/notifications/*`, `/files`,
> `/session-recordings/*`, `/admin/dashboard/counts`, `/admin/{clients,therapists,appointments,activity}`,
> `/therapists/{id}/approve|reject`, `/roles`, `/users/me/role`.
> **billing_payment** (shared gateway, `/billing/*` prefix): `/billing/wallet/balance`,
> `/billing/clients/{id}/wallet[/transactions]`, `/billing/payments`, `/billing/sessions[/{id}]`,
> `/billing/invoices` (list — added 2026-07-12) `[/{id}[/download]]`, `/billing/refunds`,
> `/billing/disputes[/rate-check]`, `/billing/ledger`, `/billing/payouts[/batches[/{id}/process]]`,
> `/billing/admin/billing-config`. **Auth contract differs from backend-initial: billing requires the
> Cognito ID token (not access token — its Lambda reads `custom:role`/`custom:clientId` claims) and an
> `Idempotency-Key` header on every POST/PUT/DELETE.** `/billing/admin/*` + payout-batch routes require
> the Cognito `Admin`/`SuperAdmin` group (403 otherwise, added 2026-07-12 — previously any authenticated
> user could hit admin billing routes).
> **video-service** (SEPARATE backend, `VITE_VIDEO_API_BASE_URL`, via `videoGet`/`videoPost`):
> `/rooms`, `/rooms/:id/end`, `/appointments/:id/join` (→ LiveKit token), `/rooms/:id/transcript/*`.
> Note: video-service currently uses a shared-secret JWT, not Cognito JWKS — reconcile server-side.

> **Three-backend model:** Ataraxia calls ONLY backend-initial + billing_payment (one shared gateway,
> `VITE_API_BASE_URL`) and video-service (`VITE_VIDEO_API_BASE_URL`). No fictional `/api/v1/*` paths
> remain. Routes with NO backend home yet (TODO): `/organizations`.

All clients go through `src/api/client.ts` (Bearer token, one base URL, defaults to Cognito **access**
token — overridable per-request via a caller-supplied `Authorization` header, which `api/billing.ts` uses
to send the **ID** token instead). Path prefix selects the backend.

| Module | Path(s) | Backend |
|--------|---------|---------|
| `auth.ts` | — (Cognito SRP, client-side) | **AWS Cognito** directly |
| `appointments.ts` (re-exports `appointmentsBackend.ts` + legacy `appointmentsApi` shim) | `/appointments/*` | backend-initial |
| `sessions.ts` | session/booking | backend-initial |
| `admin.ts` (added 2026-07-12) | `/admin/dashboard/counts`, `/admin/therapists`, `/admin/clients`, `/admin/appointments`, `/admin/activity`, approve/reject | backend-initial |
| `roles.ts` | `/roles`, `/users/me/role` — thin client; role catalog + resolution both live server-side | backend-initial |
| `verification.ts` | `/admin/therapists?status=pending` + approve/reject; own-status via `/therapists/me` | backend-initial |
| `billing.ts` (added 2026-07-12, replaces `subscription.ts` as the billing surface) | `/billing/*` — wallet, payments, sessions, invoices, refunds, disputes, ledger, payouts, config | **billing_payment** |
| `clientDocuments.ts` (added 2026-07-12) | `/client-documents`, `/client-documents/upload-url` — presigned-PUT upload + register flow, PHI-dedicated bucket, therapist-only (403 otherwise) | backend-initial |
| `messaging.ts` | chat | backend-initial (WebSocket / community-stack) |
| `video.ts` | LiveKit token | backend-initial (or video-service) |
| `recordings.ts`, `waitingRoom.ts`, `calls.ts`, `jitsi.ts` | video/session support | backend-initial / video-service |
| `health.ts` | health check | backend-initial |
| `subscription.ts` | ⚠️ calls `/api/subscriptions/{userId}` — **no such route exists on any backend** (fictional, same class of bug MVP0 fixed elsewhere). Only consumer is a `DashboardLayout.tsx` lazy `import()` at line 196, which always throws and falls into a hardcoded fallback (`trial`/`enterprise` object). Superseded by `billing.ts`; platform has no subscription tiers (see `BillingView` plans tab — per-session marketplace pricing). Fix = delete the dynamic import + fallback logic in `DashboardLayout.tsx`, then delete this file. | dead / fictional |
| `data.ts`, `logging.ts` | misc/telemetry | backend-initial |

> **MVP0 mock-data eradication (2026-07-12):** `AdminDashboardView`, `SuperAdminDashboardView`,
> `reports/{Therapist,Admin,SuperAdmin}Reports`, `BillingView`, `InvoicesView` were rewired from
> hardcoded/mock data to the routes above. `verification.ts` and `roles.ts` were rewritten from fictional
> endpoints (`/api/verification/pending`, `/api/roles`) to the real ones. `ProfessionalClientsView`'s
> loader was silently broken (read snake_case fields from an enveloped `{success,data}` response that
> never matched) — fixed. Dead views deleted: `SessionNotesView`, `ClientJournalView`,
> `ProfessionalDashboard`, plus Firebase remnants and ~20 unused showcase/diagnostic components.

> **Still pending:** `/organizations` has no backend route — `OrganizationManagementView` renders empty.
> `subscription.ts` should be deleted once confirmed no remaining importers (superseded by `billing.ts`).

> **Screen-depth pass (2026-07-12, mvp-plan.md §1.7):** `TherapistHomeView` — replaced fake
> `sessions × $150` revenue with real `earnings-summary` net income + `/billing/sessions` outstanding
> balance (paise, ₹). `ClientDetailView`/`ProfessionalClientsView` Documents tab — real document list/
> upload via `clientDocuments.ts` + honest intake-form status (no fictional "send intake" backend call
> exists; a therapist fills intake themselves via `POST /intake-forms`). `ReportsView` — CSV export wired
> for all 3 role reports (`reportUtils.ts` `downloadCsv`); the old PDF/Excel buttons were no-ops, removed
> rather than left fake. `TherapyVideoRoom.tsx` — real waiting-room gate via LiveKit
> `useRemoteParticipants()` (shown until the other side actually joins); session timer already existed.
> Also removed all remaining US-currency (`$`) / insurance-claims mock content flagged by the earlier
> audit (`ProfessionalClientsView`, `ClientDetailView` billing tabs, onboarding consent/payment steps,
> `DashboardLayout`'s fabricated global-search results) — India has no insurance-claims system (out of
> scope, see `docs/simplepractice-screens.md` #10) and the platform bills in ₹/paise via billing_payment.
> **Still fake, flagged not fixed:** `clientData.billing`/`detailData.billing` (insurance provider/copay/
> claims) is still a mock-shaped prop with no real backend source — needs a real per-client billing
> summary (wallet + billing sessions) before those two Billing tabs are honest.

> **🔴 apiFetch + Zod adoption (2026-07-12) — fixed a live double-unwrap bug.** Pattern adopted from
> `Iragu-website/lib/api/shared/fetch.ts`: `client.ts` gained `apiFetch<T>(endpoint, { schema, ... })` —
> every response is validated against a Zod schema at the API boundary, throwing `ApiSchemaError`
> (readable field diff) on a shape mismatch instead of shipping wrong data downstream. Also added
> `UnauthorizedError` (401) and `ApiFetchError` (structured backend error) as distinct types, and an
> `apiRequest`/`apiFetch` option `rawEnvelope` to see the un-auto-unwrapped body when a module needs to
> inspect the envelope itself (backend-initial's admin Lambda wraps as `{ ok, data }` / `{ ok, error }` —
> a **different** shape from the generic `{ data }` / `{ success, data }` envelopes `apiRequest`
> auto-unwraps by default).
>
> **The bug this caught:** `admin.ts`, `roles.ts`, and `clientDocuments.ts` each hand-rolled their own
> `Envelope<T>` type and did `res.data` on the result of `get<Envelope<T>>(...)` — but `apiRequest`
> already auto-unwraps any body with a top-level `data` key, so by the time these modules received the
> response it was **already** the bare payload, not the envelope. `res.data` on an already-unwrapped
> object was `undefined`. In `admin.ts` this crashed inside `unwrap()` reading `env.error.message` on
> `undefined` — proven with a standalone repro script against the real wire shape from
> `backend-initial/src/lambdas/admin/src/handler.ts`'s `ok()` helper. Every screen backed by `admin.ts`
> (`AdminDashboardView`, `SuperAdminDashboardView`, `reports/*`, `verification.ts` via re-export) has a
> try/catch around the call that swallows the throw into its "could not load" fallback UI — so **these
> screens have been silently rendering their error/empty state, not real numbers, since MVP0.2** (the
> session that wired them). `roles.ts` (`getAllRoles`/`getUserRole`) and `clientDocuments.ts`
> (`listClientDocuments`/`uploadClientDocument`) had the identical bug shape against their own routes.
> **`billing.ts` did NOT have this bug** — billing_payment's controllers send payloads unenveloped
> (`sendJson(response, 200, payload)`, confirmed against `payments.controller.js`/`wallet.controller.js`),
> so `apiRequest`'s auto-unwrap correctly no-ops there; it was converted to `apiFetch` for schema
> validation only, no logic change.
>
> Fix: `admin.ts` now validates the full `{ ok, data }` envelope via `rawEnvelope: true` + a
> `z.discriminatedUnion('ok', …)` schema, unwrapping only after validation succeeds. `roles.ts` and
> `clientDocuments.ts` write their Zod schema for the *inner* payload (default `rawEnvelope: false`),
> matching what `apiRequest`'s existing auto-unwrap already hands them.
>
> **Not yet converted to `apiFetch`:** `sessions.ts`, `verification.ts`'s own `/therapists/me` call, and
> most of the smaller `src/api/*` modules still use the untyped `get`/`post`/`put`/`del` helpers — those
> don't have the specific double-unwrap bug (no second `.data` access) but also don't get schema
> validation. Convert opportunistically when touching those files; `apiFetch` is now the preferred
> pattern for **new** call sites per this repo's `CLAUDE.md`.
>
> **Verification status:** proven via a standalone Node script that reproduces the exact wire shape and
> confirms the old code throws / the new code returns real data (both typecheck 0 and 69/69 tests stay
> green — neither test suite exercised this path, which is itself a gap: no test caught a bug this
> severe). **Not yet confirmed against a live authenticated session** — needs a real admin login to see
> the dashboard render actual numbers end-to-end.

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
