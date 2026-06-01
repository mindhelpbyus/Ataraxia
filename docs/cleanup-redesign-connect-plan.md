# Ataraxia — Cleanup, Standardize, Redesign & Connect Plan

> Goal: bring the Ataraxia web CRM up to the same standard as `backend-initial` and
> `billing_payment`, remove duplicate/competing code, migrate auth to **Cognito**,
> and connect cleanly to the two backends over the **shared API Gateway**.

Status: DRAFT v2 — awaiting approval. Created 2026-05-30.

> **Directive (locked):** Retain the Ataraxia React frontend. Remove all three of:
> (a) the in-repo backend, (b) the local-DB/demo path, (c) Firebase remnants.
> Backends = **`backend-initial`** + **`billing_payment`** (one shared gateway) + **`video-service`**
> (separate). Auth = **AWS Cognito JWT** (`Authorization: Bearer`), region **ap-south-1**.

## Backlog (deferred, not blocking)
- **Organization backend service** — to be built later. Until then `/organizations` is a documented
  `TODO(backend)`; `OrganizationManagementView`/`HomeView` render empty, no fake calls.
- **video-service deep integration** — Ataraxia already calls the video-service API (`videoGet`/`videoPost`
  → `/appointments/:id/join`, `/rooms/*`). Deferred: full **Zoom SDK + LiveKit SDK** client integration,
  and reconciling video-service auth (shared-secret JWT) with the Cognito Bearer token. video-service is
  still under active development — its API/auth may change.

---

## 0. Findings (current state)

| Area | Finding |
|------|---------|
| `.claude/` standard | **Absent.** Only repo of the three with no `CLAUDE.md`, no KFC skills, no `domain-model.md`. |
| Backend-in-frontend | `src/backend/` (Express server), top-level `database/` (`schema.sql` + migrations), `src/lib/db/` (localDb) — competing backend logic that does not belong in the FE repo. |
| Auth model — FE | Core `api/client.ts` + `api/auth.ts` assume **HTTP-only cookies + a backend `/auth/login`**, no client SDK. Firebase remaining is vestigial (dead `loginWithFirebase`/`/auth/login/firebase` wrapper, `FirebaseEmailAuthTest.tsx`, `.env.example` keys). No `firebase` dep installed. |
| Auth model — BE (**critical**) | `backend-initial` has **no `/auth/login` Lambda**. The API Gateway uses an `HttpJwtAuthorizer` (default-deny) that validates `Authorization: Bearer <Cognito JWT>` against the user pool; Lambdas read `event.headers.authorization.replace('Bearer ', '')`. Login happens **client-side against Cognito** (app client uses `userSrp:true` + `authorizationCodeGrant`; `userPassword` disabled). A dedicated web client exists: `adminWebClientId = 3v6g7vb88tm8e89d3md65e5ic9`, already a trusted JWT audience. ⇒ **The FE must hold a Cognito session and send a Bearer token — the current cookie model does not match.** |
| Duplicate API clients | `sessions.ts`(413)+`secureSessions.ts`(471); `video.ts`(148)+`secureVideo.ts`(277); `appointments.ts`(107)+`appointmentsBackend.ts`(146). ~1,560 lines of overlapping pairs. |
| Demo mode | `USE_LOCAL_DB` / `apiSwitch` / `localDb` woven through ~18 files — a parallel fake-data path. |
| Type health | 564 tsc errors (439 unused-var TS6133, 37 undefined-name TS2304, …) → dead/copy-pasted code. |
| Root clutter | `replace_orange.js`, `fix-args.js`, `validate-env.js`, `cleanup-*.sh`, `test-*.html`, `backend-package.json`, `backend-server-example.js`, `test-server-package.json`. |
| API URL source | Backend publishes `/shared/api-gateway/id` to SSM but **no invoke URL**. FE relies on a guessed `VITE_API_BASE_URL` fallback (`localhost:3002` in code, `3010` in example). No canonical source of truth. |

### Decisions locked in
- **Single backend = `backend-initial`**; **single auth = AWS Cognito JWT** as `Authorization: Bearer`.
- **Remove all three**: in-repo backend, local-DB/demo path, Firebase remnants. No mock layer retained.
- **Auth rework required (not just cleanup):** replace the FE's cookie/`/auth/login` model with a
  browser-side **Cognito SDK** session (`amazon-cognito-identity-js` or AWS Amplify Auth) using the
  **`adminWebClientId`**. Tokens are attached as `Authorization: Bearer <accessToken/idToken>` on every
  request via `api/client.ts`; refresh handled client-side (1h access token, 30d refresh).
- **Plan first, execute in phases** (this document).

---

## 1. Phase 1 — Establish the `.claude` standard

Mirror the two backends exactly.

1. Create `Ataraxia/.claude/` with:
   - `skills/kfc/` — copy the **backbone** skills verbatim from `backend-initial/.claude/skills/kfc/`:
     `spec-orchestrator, spec-requirements, spec-design, spec-tasks, spec-impl, spec-test, spec-judge, spec-system-prompt-loader, spec-compact, ai-maintenance`.
     (Skip backend-only skills: `lambda-generator`, `prisma-migration`, `api-contract-validator`.)
   - `agents/kfc/` — copy the matching agent definitions.
   - `system-prompts/spec-workflow-starter.md` — copy.
   - `settings.json` — copy backend pattern, adapt allowlist for a Vite/TS FE
     (`npm run build`, `npm test`, `npm run dev`, `find/grep/ls/cat`, `git` read-only).
   - `context/domain-model.md` — **new, FE-specific**: page/route map, API-client→backend-endpoint
     ownership, auth flow, state stores.
2. Create `Ataraxia/CLAUDE.md` — authoritative FE context: tech stack (React 18 + Vite + TS +
   Tailwind v4 + Zustand + TanStack Query + Radix), repo layout, the API-layer contract, auth model,
   "connects to backend-initial + billing_payment via shared API Gateway", known gotchas.
   Cross-reference the backends' `CLAUDE.md`.

**Output:** standard in place. No behavior change. Independent, low-risk — can land first.

---

## 2. Phase 2 — Clean (delete competing backend + clutter)

Each deletion verified against usage before removal.

1. **Remove backend-in-frontend** (real backends are `backend-initial` + `billing_payment`):
   - `src/backend/` (Express `index.js`, `cors-config.js`, `DEPLOYMENT_GUIDE.md`, `package.json`)
   - top-level `database/` (`schema.sql`, `migrations/`)
   - `src/backend-package.json`, `src/backend-server-example.js`, `test-server-package.json`
2. **Remove demo/local-DB path**: delete `src/lib/db/localDb`, `src/lib/apiSwitch`, strip
   `USE_LOCAL_DB` branches from the ~18 consumers so the FE always talks to the real backend.
   (Confirm with you: keep a mock layer for Storybook/tests, or remove entirely? Default: remove.)
3. **Remove root clutter**: `replace_orange.js`, `fix-args.js`, `cleanup-*.sh`, `test-*.html`,
   `test-*.sh`, `test-jwt-verification.js`, `test-jitsi-server.js`. Keep `validate-env.js` only if
   referenced by an npm script (else remove).
4. **Move stray docs** under `src/` (`src/docs`, `src/readme`, `src/guidelines`) into top-level `docs/`.

**Output:** repo contains only frontend code + the new `.claude/` + `docs/`.

---

## 3. Phase 3 — De-duplicate the API layer & fix types

1. **Collapse duplicate clients** to one module each, choosing the `secure*` cookie-based variant as the
   keeper and folding any unique functions from the other in:
   - `sessions.ts` + `secureSessions.ts` → `sessions.ts`
   - `video.ts` + `secureVideo.ts` → `video.ts`
   - `appointments.ts` + `appointmentsBackend.ts` → `appointments.ts`
   Update all importers.
2. **Remove Firebase remnants**: delete `FirebaseEmailAuthTest.tsx`, the `loginWithFirebase` wrapper +
   `/auth/login/firebase` and its `api/types.ts` signature, Firebase comments/branches in
   `verification.ts`, `useProviderAgnosticAuth.ts`, `ErrorBoundary.tsx`, `SystemStatusChecker.tsx`,
   `consoleFilter.ts`. Drop Firebase keys from `.env.example`.
3. **Replace the auth transport with Cognito (Bearer)** — this is the substantive auth rework:
   - Add `amazon-cognito-identity-js` (or `aws-amplify` Auth). Configure with the shared user pool ID and
     **`adminWebClientId`** + region (from `/shared/cognito/*` SSM, surfaced as `VITE_COGNITO_*`).
   - Rewrite `api/auth.ts`: `login` → Cognito SRP sign-in; `getCurrentUser` → decode/validate session
     (`/auth/me` is replaced by Cognito session + a backend profile read); `logout` → Cognito sign-out.
   - Rewrite `api/client.ts`: drop the cookie/CSRF model; attach `Authorization: Bearer <token>` from the
     Cognito session on every request; on 401 attempt silent refresh, else redirect to login.
   - Decide login UX (see Open confirmation #3): **embedded SRP form** (custom UI, recommended for a CRM)
     vs **Hosted UI redirect** (authorization-code grant, callback URL must be registered on the client).
4. **Drive tsc to zero**: clear 439 unused-vars (most are dead-code symptoms), fix 37 undefined-names,
   resolve the rest. Add `"typecheck": "tsc --noEmit"` script; treat as CI gate. Delete `tsc-errors.txt`.

**Output:** one canonical client per domain, Cognito Bearer-token auth, `tsc --noEmit` clean.

---

## 4. Phase 4 — Connect to `backend-initial` (shared infrastructure)

1. **Publish the API Gateway invoke URL from `backend-initial`** (the missing shared param):
   add `/shared/api-gateway/url` to `backend-initial/infrastructure/lib/shared-exports-stack.ts`, beside
   the existing `/shared/api-gateway/id`. Single source of truth the FE consumes — same `/shared/*`
   pattern `billing_payment` uses. *(Cross-repo edit — confirm before touching backend CDK.)*
2. **Surface Cognito config to the FE**: the FE needs user-pool-id, region, and **`adminWebClientId`**
   (all already in `/shared/cognito/*` / `auth-stack.ts`) as `VITE_COGNITO_USER_POOL_ID`,
   `VITE_COGNITO_REGION`, `VITE_COGNITO_CLIENT_ID` in `.env.dev`/`.env.local`. **Confirm the web client's
   callback/logout URLs include the Ataraxia origin** if Hosted UI is chosen (#3).
3. **Single typed API config in FE**: `src/config.ts` reads `VITE_API_BASE_URL` (= `/shared/api-gateway/url`
   per env). Remove the `localhost:3002` vs `3010` drift. One `baseUrl`; path prefixes route to the right
   Lambda within the one shared gateway.
4. **Endpoint ownership map** (record in `domain-model.md`) — every call carries the Cognito Bearer token:
   - **backend-initial** (primary): `/appointments/*`, `/clients/*`, `/therapists/*`,
     `/therapist-availability/*`, `/clinical-notes/*`, `/intake-forms/*`, `/notifications/*`,
     `/file-upload`, chat (WebSocket). *(Auth is Cognito-direct, not a backend route.)*
   - **billing_payment** (same gateway): `/api/payments/*`, `/api/wallet/*`, `/api/payouts/*`,
     `/api/refunds`, `/api/disputes*`, `/api/invoices`, `/api/pricing/quote`.
   *(Billing connection is in scope because the gateway/auth are shared, but the directive prioritizes
   backend-initial — billing wiring can follow once core data + auth are green.)*
5. **Smoke test**: Cognito login (admin web client) → token in `Authorization` header → list appointments /
   clients against the real gateway; then a billing read. Record results.

**Output:** FE authenticates via Cognito and talks to the real shared gateway with Bearer tokens; one URL
source of truth; documented endpoint ownership.

---

## 5. Phase 5 — Redesign (UI/UX)

Only after the data layer is honest.

1. Audit `src/components/ui` (64 files) for unused/duplicate Radix wrappers; standardize on one design-token
   set (Tailwind v4 theme), remove `replace_orange`-style ad-hoc color hacks.
2. Establish layout/page-shell consistency across the 211 component files (atoms/molecules/organisms is
   already there — enforce it).
3. Redesign pass per major surface (auth, dashboard, appointments, clients, billing/wallet, video) using
   the now-connected real data.

**Output:** consistent, token-driven UI on a clean data layer. *(Scope/visual direction to be detailed in
its own spec via the new `spec-design` skill once Phases 1–4 land.)*

---

## Sequencing & risk

| Phase | Risk | Depends on | Reversible? |
|-------|------|-----------|-------------|
| 1 `.claude` standard | none | — | yes |
| 2 Clean | low (deletes) | usage verification | yes (git) |
| 3 Dedup + types | medium | Phase 2 | yes |
| 4 Connect | medium-high (cross-repo CDK + auth contract) | Phases 2–3 + your OK on backend edit | yes |
| 5 Redesign | scoped separately | Phases 1–4 | yes |

## Resolved decisions (2026-05-30)
1. **Auth library:** `amazon-cognito-identity-js` (lean, SRP sign-in, manual refresh).
2. **Login UX:** embedded Ataraxia login form — SRP directly against Cognito, no Hosted UI / redirect.
3. **Google sign-in:** not needed — email/password via Cognito only.
4. **backend-initial CDK edit deferred:** do NOT publish `/shared/api-gateway/url` yet. For now the FE gets
   the gateway URL + Cognito config from its own `VITE_*` env vars (`.env.dev`/`.env.local`); we switch to
   the SSM-published value later. Focus = clean Ataraxia + make it talk to backend-initial AND billing_payment.

## Still open
- Confirm the actual API Gateway invoke URL + Cognito user-pool-id/region for each env to populate `VITE_*`
  (I'll read what I can from backend-initial config; may need values from you for dev).
