# CLAUDE.md — Ataraxia (web CRM frontend)

> **Read this first.** This file is the authoritative starting context for every AI skill session in this
> repository. Do not rely on scattered `*_FIX.md`, `src/docs/`, or HTML files for current architecture —
> those are historical. Ataraxia is the **React web CRM** for the Telehealth platform; its backends are
> [`backend-initial`](../backend-initial/CLAUDE.md) (core API + auth) and
> [`billing_payment`](../billing_payment/CLAUDE.md) (payments/wallet/invoices).

---

## What this repo is

Ataraxia is a **frontend-only** single-page app. It owns **no** server, **no** database, **no** auth
provider of its own. All data and identity come from the two backends over **one shared AWS HTTP API
Gateway**. Login is performed **client-side against AWS Cognito**; the resulting JWT is sent on every
request as `Authorization: Bearer <token>`.

If you find server code, a database schema, or a local-DB/mock path in this repo, it is legacy and slated
for removal — see `docs/cleanup-redesign-connect-plan.md`.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript 5 |
| Build/dev | Vite 6 |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite`) + Radix UI primitives |
| State | Zustand (`src/store/`) + TanStack Query (`src/lib/queryClient.ts`) |
| Routing | react-router-dom v7 |
| Auth | **AWS Cognito** via `amazon-cognito-identity-js` (SRP, embedded login form). JWT in `Authorization: Bearer`. |
| Forms | react-hook-form |
| Video | LiveKit (`@livekit/components-react`) |
| Tests | Vitest + Testing Library |
| Backends | `backend-initial` (core) + `billing_payment` (billing) — same shared API Gateway |

---

## Repository Layout

```
Ataraxia/
├── src/
│   ├── main.tsx                ← App entry
│   ├── App.tsx                 ← Route tree (public + protected routes)
│   ├── config.ts               ← API base URL + Cognito config (reads VITE_* env)
│   ├── api/                    ← Typed API client layer (one module per domain)
│   │   ├── client.ts           ← Core HTTP client — attaches Bearer token, handles 401
│   │   ├── auth.ts             ← Cognito SRP login / session / logout
│   │   ├── appointments.ts     ← backend-initial /appointments
│   │   ├── sessions.ts         ← session/booking API
│   │   ├── video.ts            ← LiveKit video token API
│   │   ├── messaging.ts        ← chat
│   │   ├── roles.ts            ← roles/permissions
│   │   ├── verification.ts     ← identity verification
│   │   ├── subscription.ts     ← billing_payment surface (payments/wallet/invoices)
│   │   └── …                   ← calls, recordings, waitingRoom, jitsi, logging, health, data
│   ├── components/             ← UI (atoms / molecules / organisms / pages / ui)
│   ├── store/                  ← Zustand stores (authStore.ts)
│   ├── hooks/                  ← React hooks (useApi, useSession, useRoles, useVideoToken…)
│   ├── lib/                    ← queryClient, utils (auth/session glue)
│   ├── utils/                  ← logging, sanitization, security helpers
│   ├── config/                 ← googleMaps, roleConfig
│   └── types/                  ← shared TS types
├── docs/                       ← Architecture docs + the cleanup/connect plan
├── tests/                      ← Vitest suites
└── .claude/                    ← AI skill workflow (this standard)
```

---

## API Layer Contract

- **One typed module per domain** under `src/api/`. UI/hooks call these — never `fetch` directly.
- `src/api/client.ts` is the only place that builds requests: it reads the base URL from `config.ts`,
  attaches the Cognito **`Authorization: Bearer <token>`** header, sets `X-Request-ID`, and on `401`
  attempts a silent Cognito refresh, else redirects to `/login`.
- **Error response shape (from both backends):** `{ "error": "message", "code": "MACHINE_CODE" }`.

### Endpoint ownership (which backend serves which path — same gateway)

| Path prefix | Backend |
|-------------|---------|
| `/appointments/*`, `/clients/*`, `/therapists/*`, `/therapist-availability/*` | backend-initial |
| `/clinical-notes/*`, `/intake-forms/*`, `/notifications/*`, `/file-upload` | backend-initial |
| `/admin/*`, `/roles`, `/users/me/role` | backend-initial |
| chat (WebSocket) | backend-initial (community-stack) |
| `/billing/*` (payments, wallet, payouts, refunds, disputes, invoices, ledger, pricing) | billing_payment — **not** `/api/*`; requires the Cognito **ID token** + `Idempotency-Key` header on mutations |

The full, current map lives in `.claude/context/domain-model.md` — **start there** for any API work.

---

## Auth Model (AWS Cognito — single source of truth)

- **No `/auth/login` endpoint exists on the backend.** The browser signs in directly to Cognito (SRP)
  using `amazon-cognito-identity-js` and the **web app client** (`adminWebClientId` in
  `backend-initial` auth-stack — already a trusted JWT audience).
- The API Gateway uses a Cognito `HttpJwtAuthorizer` (**default-deny**); every request must carry
  `Authorization: Bearer <Cognito access/id token>`.
- Access/id tokens expire in **1h**; refresh token **30d**. Refresh is handled client-side.
- Cognito config is supplied via env: `VITE_COGNITO_USER_POOL_ID`, `VITE_COGNITO_CLIENT_ID`,
  `VITE_COGNITO_REGION`. (Sourced from `backend-initial` `/shared/cognito/*`; published to the FE as env
  for now — see the plan for the future SSM-published gateway URL.)

---

## Environment

| Var | Purpose |
|-----|---------|
| `VITE_API_BASE_URL` | Shared API Gateway invoke URL (no stage prefix) |
| `VITE_COGNITO_USER_POOL_ID` / `VITE_COGNITO_CLIENT_ID` / `VITE_COGNITO_REGION` | Cognito web client |
| `VITE_LIVEKIT_URL` | LiveKit server (video) |

Files: `.env.example` (template), `.env.dev`, `.env.local`. Never commit real secrets.

---

## Common Commands

```bash
npm run dev          # Vite dev server
npm run build        # Production build
npm test             # Vitest run
npm run typecheck    # tsc --noEmit  (must be clean — CI gate)
```

---

## Key Patterns & Conventions

- **Call the typed `src/api/*` modules**, not `fetch`. Add a new domain module rather than inlining calls.
- **Bearer token, not cookies.** The legacy cookie/CSRF model is being removed; auth state comes from the
  Cognito session held client-side.
- **No server/DB code in this repo.** Anything resembling a backend belongs in `backend-initial` /
  `billing_payment`.
- **Tailwind v4 tokens** for styling — no ad-hoc color hacks (the old `replace_orange.js` approach is gone).
- **Structured logging** via `src/utils/secureLogger.ts`; never `console.log` PHI/response bodies.

---

## Design System — "Ink on Parchment" (enforced, not optional)

Tokens are defined once in `src/styles/globals.css` and exposed as Tailwind utilities via `@theme
inline` (`bg-action`, `text-ink`, `border-rule`, etc. — zero setup cost to use them). Verified via
design audit 2026-07: roughly half the screens bypassed these tokens for default Tailwind
slate/indigo/zinc, which is why the product read as inconsistent. Five files were swept clean
(`ui/card.tsx`, `ui/dialog.tsx`, `ui/table.tsx`, `ProfessionalClientsView.tsx`, `AdminDashboardView.tsx`,
`BillingView.tsx`, `ClientDashboardView.tsx`, `TherapistHomeView.tsx`); **~750 hits remain in the rest
of the codebase** — tracked as a shrinking baseline in `scripts/.design-token-baseline`, not silently
ignored. Four rules, enforced by `npm run check:design-tokens` (`scripts/check-design-tokens.sh`,
CI-gated — fails only on *new* drift above the baseline; run `--update-baseline` after cleaning a file):

1. **No raw Tailwind color utilities.** `slate-*`, `zinc-*`, `gray-*`, `indigo-*`, `blue-*`, `red-*`,
   `green-*`, `emerald-*`, `purple-*`, `violet-*`, `rose-*`, `amber-*`, `orange-*` — banned in
   `src/components/**`, `src/**/*.tsx`, outside of Recharts/chart-library config props (which require
   literal color strings — use `var(--chart-1..5)` / `var(--action)` / etc. there instead of hex).
   Every color reaches the DOM through a token utility. Deliberate multi-color semantic content (a mood
   scale, a time-of-day gradient) is the one legitimate exception — flag it in review, don't silently
   allow it to become a pattern.
2. **One shadow vocabulary.** Only the named `--shadow-*` tokens (`shadow-card`, `shadow-card-hi`,
   `shadow-sheet`, `shadow-fab`, `shadow-action`, `shadow-sage`). No inline dual-stack
   `shadow-[…,…]` values invented per component, no generic `rgba(0,0,0,…)` — the brand's shadows are
   ink-tinted (`rgba(28, 24, 18, …)`).
3. **The `Card` primitive is not a suggestion.** Consumers may set spacing/size props; they may not
   override its radius, border, or shadow via `className`. A screen that needs a different treatment
   gets a new variant on the primitive, not a one-off override — this is why 6+ different "card" looks
   accumulated across the dashboards.
4. **Semantic color ≠ brand color.** Success/warning/danger/info states use their own tokens
   (`--success`, `--warning`, `--danger`, `--info` — mapped to `action`/`ochre`/`danger`/`lavender`
   respectively). `--action` means "primary action," never "this number is good."

No raw emoji as UI markers (✨ 🎉 etc.) — use the matching Lucide icon; the codebase is icon-driven
everywhere else, and emoji is the fastest tell that a screen wasn't designed, it was assembled.

---

## Known Gotchas

1. **Gateway has no stage prefix** — URL is `https://{id}.execute-api.{region}.amazonaws.com/<route>`,
   not `/dev/<route>`. `VITE_API_BASE_URL` must match.
2. **Default-deny gateway** — a missing/expired Bearer token yields `401`; `client.ts` must refresh or
   redirect, never swallow it.
3. **Two backends, one gateway** — route by path prefix (table above); there is a single `baseUrl`.
4. **Token audience** — the FE must use the **web** app client; tokens minted by the mobile client may not
   be accepted for all routes.

---

## AI Skill Workflow

**Entry point: always invoke `spec-orchestrator` first.** It classifies the task (Tier 1–4) and runs only
the skills needed. Backbone KFC skills are identical across `backend-initial`, `billing_payment`, and this
repo — edits to backbone skills must be propagated to all three.

Available skills: `spec-requirements`, `spec-design`, `spec-tasks`, `spec-impl`, `spec-test`, `spec-judge`,
`spec-compact`, `ai-maintenance`. Feature specs live in `.claude/specs/<feature-name>/`.

- **Repo-specific files (never share):** `.claude/context/domain-model.md`, `CLAUDE.md`.
- Run `ai-maintenance` after any structural change to keep `domain-model.md` current.

## Important Files for Context

- `.claude/context/domain-model.md` — **Start here**: page/route map, API-client→backend ownership, auth flow, stores
- `src/api/client.ts` — the HTTP/auth boundary
- `src/api/auth.ts` + `src/store/authStore.ts` — Cognito session + auth state
- `src/App.tsx` — route tree
- `docs/cleanup-redesign-connect-plan.md` — the active cleanup/connect plan
