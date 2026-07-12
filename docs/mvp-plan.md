# Bedrock Health — MVP Master Plan (Spec)

> **The execution spec** that turns the strategy trilogy — [competitive-analysis.md](./competitive-analysis.md),
> [simplepractice-comparison.md](./simplepractice-comparison.md), [best-features-to-adopt.md](./best-features-to-adopt.md),
> [tier0-roadmap.md](./tier0-roadmap.md) — into sequenced, codebase-verified engineering work.
> Goal: **India's #1 practice platform** (SimplePractice-class provider depth) on top of the marketplace,
> money-movement, and India-compliance layers no rival has.
>
> Also derives from: [simplepractice-screens.md](./simplepractice-screens.md) (screen-level acceptance
> criteria — Ataraxia already covers ~80% of SimplePractice's screens), [user-personas-and-roles.md](./user-personas-and-roles.md)
> (4 personas incl. Organization), [compliance.md](./compliance.md) (DPDP/RBI/MHA phased roadmap),
> [security-hardening.md](./security-hardening.md), [design-system-decision.md](./design-system-decision.md),
> [hosting-and-performance.md](./hosting-and-performance.md), and
> `backend-initial/docs/specs/session-soap-summarization/` (the AI-notes spec — already fully designed).
>
> Every "Foundation" claim below was verified against the actual code on 2026-07-11
> (`Ataraxia`, `backend-initial`, `billing_payment`). Effort: **S** = days–2wk · **M** = 3–6wk · **L** = 1–2 quarters.

Created 2026-07-11. Status: PROPOSED. Owner: product + engineering.

**Hard guardrails (India regulation — do NOT build):** ❌ insurance-claims filing · ❌ e-prescribing.
Therapists/counsellors in India may do neither; a psychiatry tier would be a separate, medically-regulated
persona later. (Source: simplepractice-screens §10, tier0-roadmap §G.)

---

## 0. Strategy in one paragraph

We are 5/5 on the layers rivals never build (provider tooling, payouts/TDS/RBI ledger, DPDP security,
3-app ecosystem) and 1–2/5 on the layers that win the category (outcomes, AI, reminders-grade operational
polish). SimplePractice is provider-only with zero demand engine; Indian D2C rivals are booking apps with
thin clinical depth. **The play: make what we have *real* (MVP0), close the SimplePractice table-stakes
gap (MVP1), then differentiate with AI + outcomes + stepped care (MVP2) and monetize B2B2C (Launch).**
No competitor spans all three personas (client / therapist / platform team) — every feature below serves
at least two.

---

## 0.5 The product philosophy — one hero, three loops, zero clutter

> **How we adopt every competitor's best feature (best-features-to-adopt §E) without becoming a
> complicated mess:** best-of-all ≠ the union of all their UIs. It's the union of their *outcomes*,
> compressed into the smallest number of user actions. SimplePractice wins on completeness but is
> famously menu-heavy; Indian D2C rivals are simple but shallow. **We win by being complete AND minimal.**

### The hero: AI session notes in Indian languages 🇮🇳
**The main selling point.** "Run your session in Tamil, Telugu, Kannada, Hindi, Malayalam — or
Thanglish/Hinglish — and a draft SOAP note plus a client summary in their language is waiting for you in
20 minutes. Review, sign, done." No product in India or globally offers this (SimplePractice's AI notes
are English-only). Every other MVP1 feature exists to feed or amplify the hero:
reminders **fill** the session calendar → e-sign consent **gates** the recording → assessments **feed**
the Objective section → templates **shape** the output → treatment plans **absorb** the Plan section →
billing **pays out** the session. That is one pipeline, not seven features.

### Three loops (features may only attach to loop steps — never add nav destinations in MVP1)
1. **Therapist loop** (the retention loop): *Calendar → Session → Note → Get paid.*
2. **Client loop** (the growth loop): *Find → Book → Attend → See progress.*
3. **Platform loop** (the trust loop): *Verify → Monitor → Pay out.*

### The adoption filter — every "steal" must pass all four, or it gets redesigned/deferred
1. **Attaches to an existing loop step.** No new top-level menu items in MVP1.
2. **Zero-config by default.** Works instantly with smart defaults; settings exist but are optional.
3. **Serves ≥ 2 personas from the same data** (persona rule, user-personas-and-roles.md).
4. **Removes work, never adds it.** Measured in taps/time-to-outcome — if a feature adds a required
   step to the daily loop, it's wrong.

### Proof table — where each steal lives, and the user's ONLY action
| Steal (source) | Lives at loop step | User's only action |
|---|---|---|
| Appointment reminders (SimplePractice) | after *Book* — fully automatic | none (opt-out in settings) |
| Assessments + auto-scoring (Lyra/HopeQure) | inside the reminder link + intake | client answers 9 questions; therapist just *sees* score+trend in note editor |
| Note templates (SimplePractice) | inside the note editor | pick once — remembered per therapist |
| **AI Indic notes (HERO)** | on *Session end* — auto-drafts | **review + sign** |
| Treatment plans (SimplePractice) | a tab in client chart; Plan section of every note | update goal % while signing |
| Intake + e-sign (SimplePractice) | first *Book* | client signs once, on phone |
| Anonymous mode (YourDOST) | at signup | one toggle |
| Frictionless matching (BetterHelp) | at *Find* | answer 5 preference questions |
| C-SSRS crisis alert (tier-0 bar) | scored automatically with assessments | none — therapist is alerted only when it matters |
| Income snapshot (SimplePractice) | already-open dashboard | none — it's just visible |

**The one-line pitch this buys us:** *"The therapist on Bedrock does less admin than on any other
platform on earth — in their own language."* That sentence is the India-#1 wedge: completeness rivals
can't match, simplicity incumbents can't retrofit.

---

## 1. MVP0 — Production Truth (≈ 2–3 weeks) 🔴 gate for everything else

**Principle:** no new feature lands while dashboards show fake numbers and deploys fail. MVP0 has zero
product risk and unblocks every later phase.

### 0.1 CI/deploy unblock — ✅ DONE 2026-07-11
- [x] `tsc --noEmit` driven to **zero** (was 397 dead-code errors; Amplify's typecheck build gate now passes).
- [x] Vitest green — 69/69. The 3 apiClient failures asserted the removed cookie/CSRF model → rewritten
  to test the real Cognito Bearer contract; the 4 security-test failures imported test helpers from the
  runtime barrel that stopped re-exporting them → imports fixed to `testHelpers`.
- [x] Dead code deleted (28 files): `ProfessionalDashboard`, Firebase remnants (`FirebaseEmailAuthTest`,
  `firestore.rules`/`storage.rules`/indexes), 16 showcase/demo/diagnostic components, unused
  `TwoFactorSetup`/`SystemStatusChecker`/`UnauthorizedDomainAlert`/`LoggingDashboard`, GDPR duo (+tests),
  `test-jitsi-server.js`/`test-jwt-verification.js`/`test-server-package.json`, duplicate
  `RouteErrorBoundary.tsx ` (trailing-space file).
- [x] Production build green.
- ⚠️ Corrections found during execution: `appointmentsBackend.ts` is a deliberate consolidation under
  `appointments.ts` (kept); `VideoCallRoom.tsx`/`api/jitsi.ts` are live-wired into
  `AppointmentPanel`/`EnhancedAppointmentForm` → their removal moves to the video-path task, not cleanup.
- **Exit met:** typecheck 0 · tests 69/69 · build ✓ (deploy gate unblocked).

### 0.2 Mock-data eradication (backend-initial is the API for everything) — ✅ DONE 2026-07-11
- [x] `src/api/admin.ts` typed client (envelope-unwrapping, types mirror backend `admin-types.ts`).
- [x] `AdminDashboardView` — counts/leaderboard/weekly chart/pipeline from `/admin/*`; fabricated
  radar replaced by the real audit-trail feed; money now ₹ (paise-aware).
- [x] `SuperAdminDashboardView` — rebuilt lean: counts + 30-day volume + activity; every fake panel
  (MRR/ARR, fake orgs, geo, system health, 4 fake tabs) removed; billing tiles gated on 0.3.
- [x] Reports (all 3 roles) — real aggregates; TherapistReports now shows the real
  `earnings-summary` payout cycle (gross/TDS/net, FY-to-date); **US-only CPT panels deleted** (guardrail).
- [x] `verification.ts` → real `/admin/therapists?status=pending` + approve/reject (audit-trailed).
- [x] **Roles moved to the backend** (user directive): new `GET /roles` + `GET /users/me/role` on
  backend-initial clients Lambda + CDK routes; `roles.ts` is a thin client — no role tables in the UI.
- [x] `ProfessionalClientsView` — loader was silently broken (mapped over the `{success,data}` envelope,
  read snake_case fields) → fixed; per-client next-appointment/total-sessions computed from real
  appointments; `safetyRisk` honestly renders "Not Screened" until MVP1.2.
- [x] `TherapistHomeView` — profile completion derived from real `GET /therapists/me` (localStorage stub gone).
- [x] Dead views deleted: `SessionNotesView`, `ClientJournalView` (zero consumers; notes UI = QuickNotesView).
- ⚠️ Requires backend-initial deploy (new roles routes) before role resolution works against dev.
- **Exit met:** zero mock-data blocks in `src/`; typecheck 0 · build ✓ · tests 69/69.
| View | Replace mock with | Verified endpoint |
|---|---|---|
| `AdminDashboardView` | counts, therapist table, sessions chart, journey funnel | `GET /admin/dashboard/counts` · `/admin/therapists` · `/admin/appointments` · `/admin/activity` |
| `SuperAdminDashboardView` | platform counts + activity + financial tiles | same + `GET /billing/ledger`, `/billing/payments` |
| `reports/{Therapist,Admin,SuperAdmin}Reports` | real aggregates | `/appointments/therapist/{id}` · `GET /therapists/{id}/earnings-summary` (rich: period/YTD gross-net-TDS paise) · `/admin/appointments` · `/billing/payouts` |
| `ClientDetailView`, `SessionNotesView` | wire (currently import zero API) | `/clients/{id}` · `/appointments/client/{id}` · `/clinical-notes/*` (sign/addendum) |
| `TherapistHomeView`, `ProfessionalClientsView` | fill TODO-stub fields | data already fetched via `/appointments/*` |
| `verification.ts` | kill fictional `/api/verification/pending` | `GET /admin/therapists?status=pending` + `POST /admin/therapists/{id}/approve\|reject` |
| `roles.ts` | kill fictional `/api/roles` | derive from Cognito JWT `cognito:groups` / `custom:role` |
- Fabricated metrics with no backend source (MRR/ARR/churn/DAU/forecast-%) are **dropped**, not faked.
- New typed module `src/api/admin.ts`; fix the wrong route table in Ataraxia `CLAUDE.md`.
- **Exit:** zero `Mock Data` blocks in `src/`; every number on screen traceable to a route.

### 0.3 Billing transport unblock (prereq for all billing UI) — ✅ CODE DONE 2026-07-11 (deploys pending)
- [x] backend-initial publishes `/shared/cognito/admin-web-client-id` (shared-exports-stack).
- [x] billing authorizer trusts the Ataraxia web client (optional SSM read — deploy-order safe).
- [x] **Role gating**: `/billing/admin/*` + payout batches now require the Cognito `Admin`/`SuperAdmin`
  group (403 `ADMIN_GROUP_REQUIRED`) — authentication is no longer authorization.
- [x] **New route** `GET /billing/invoices` (filters: recipientId/recipientType/type/sessionId/limit;
  never returns htmlDocument) — controller + pgStore + CDK + `billing_routes.md` row. 107/107 targeted
  billing tests green.
- [x] Ataraxia `src/api/billing.ts` — ID token, `Idempotency-Key` on every mutation, `/billing/*` paths;
  `client.ts` now respects a caller-supplied Authorization header.
- [x] `InvoicesView` rewired to real RBI doc numbers + presigned PDF downloads; `BillingView` rewired to
  real wallet/payments/billing-sessions — **all fabricated content deleted** (random Razorpay IDs, fake
  GSTIN, fake "Dr. Sarah Jenkins", $79/$149/$399 SaaS plan tiers → honest marketplace-pricing statement).
- ⚠️ **Deploy order to activate**: (1) backend-initial `deploy:dev` (SSM param), (2) billing
  `deploy:dev` (authorizer + route + gating), (3) then 0.4 smoke. Until then /billing/* still 401s.
- Original scope for reference:
1. **Authorizer fix (cross-repo, must land first):** billing's `HttpUserPoolAuthorizer`
   (`billing_payment/infrastructure/lib/billing-api-stack.ts`) trusts only the mobile app client —
   **not** Ataraxia's `adminWebClientId` (`3v6g7vb88tm8e89d3md65e5ic9`). Publish
   `/shared/cognito/admin-web-client-id` from backend-initial SSM → add to billing `trustedClients` →
   redeploy billing CDK. Until then every Ataraxia `/billing/*` call 401s at the gateway.
2. New `src/api/billing.ts` in Ataraxia: **`/billing/*` paths** (never `/api/*` — the internal rewrite
   confused all existing code), **ID token** (billing reads `custom:role`, an ID-token-only claim),
   **`Idempotency-Key: crypto.randomUUID()`** on every POST/PUT/DELETE (else `400 IDEMPOTENCY_KEY_REQUIRED`).
3. Repoint `BillingView` (`/billing/wallet/balance`, `/billing/payments`, `/billing/sessions`) and
   `InvoicesView` (`/billing/invoices/{id}` + `/html` + `/download`).
4. **New billing route (S):** `GET /billing/invoices` list (filter by recipientId/type/date) — invoices
   are currently fetchable by ID only. finance controller + one CDK `addRoute` + `billing_routes.md` row.
5. **Security (pre-prod blocker):** billing controllers have **no role gating** — any authenticated
   client can hit `/billing/admin/*`. Add group check (`cognito:groups ∋ Admin`) for admin routes in
   `createBillingHandler.js`.
- **Exit:** wallet/payments/invoice PDF render real data in Ataraxia against ap-south-1.

### 0.4 E2E smoke (recorded)
Therapist journey (login → calendar → session → note → earnings) and admin journey (verify therapist →
appointments → payout batch → invoice download) against live dev. Record results in
`docs/smoke-YYYY-MM-DD.md`. **Exit:** both journeys pass.

---

## 2. MVP1 — India's Best Provider Platform (≈ 6–10 weeks after MVP0)

The six highest value-to-cost steals (best-features-to-adopt §E ranks 1–6), each verified to have
foundations in code. Ordered by dependency, not rank — 1.1/1.2 are prerequisites for 1.6.
**Read every item through §0.5:** each is a step in the hero pipeline
(book → remind → consent → assess → record → AI-draft → template → sign → plan → pay), not a standalone
module. If an implementation choice adds a required tap to the therapist's daily loop, choose again.

### 1.1 Appointment reminders 🔔 (S–M) — *the no-show killer*
- **Steal from:** SimplePractice. **Personas:** client (convenience) + therapist (revenue) + platform (ops metric).
- **Foundation (verified):** `notifications` Lambda already sends **SES email + WhatsApp + FCM/APNs push**
  with a template system (`/notifications/send`, `/notifications/templates`, `NotificationLog`);
  `device-token-storage` registers tokens. **Missing only the scheduler.**
- **Build:** backend-initial — EventBridge rule (every 5 min) → new `reminder-scheduler` Lambda: query
  `Appointment` (status `confirmed`, T-24h and T-1h windows, dedupe via `NotificationLog`), send via the
  existing notification pipeline. Reminder prefs (channels, lead times) on TherapistProfile; Ataraxia
  settings UI + reminder status on appointment cards.
- **Accept:** confirmed appointment ⇒ client gets T-24h + T-1h reminders on ≥2 channels; no duplicates
  (idempotent per appointment+window); opt-out respected; no-show rate visible on admin dashboard.

### 1.2 Assessment engine + auto-scoring (MBC v1) 📈 (M) — *tier-0-defining*
- **Steal from:** Lyra/HopeQure/MindPeers; SimplePractice assessment library. **Personas:** all three.
- **Foundation (verified):** Manam captures questionnaires (vernacular); `ClientProfile.safetyRiskLevel`
  exists; Ataraxia has `SafetyRiskScreening.tsx` UI; `moods`/`journal` Lambdas show the pattern to copy.
- **Build:** backend-initial — new Prisma entities `Assessment` (instrument, version) /
  `AssessmentResponse` (answers, **server-side score**, severity band, clientId, appointmentId) + new
  `assessments` Lambda: `GET /assessments/instruments`, `POST /assessments/responses` (scores PHQ-9,
  GAD-7, WHO-5 server-side), `GET /assessments/client/{id}/history` (trajectory). Seed the 3 instruments
  (published scoring rules, no licensing cost). **C-SSRS screener** included: score ≥ threshold ⇒ set
  `safetyRiskLevel` + notify therapist via 1.1 pipeline (crisis path v1, tier0-roadmap §E).
- **Ataraxia:** trajectory chart on `ClientDetailView` (severity bands, response/remission flags);
  caseload outcomes rollup on therapist reports; aggregate outcomes tile on admin dashboard (the future
  B2B sales weapon).
- **Accept:** intake + per-session administration; score computed server-side (never trust client);
  trajectory renders for a client with ≥2 responses; C-SSRS high-risk fires therapist alert < 1 min.

### 1.3 Note templates library 📝 (S–M)
- **Steal from:** SimplePractice. **Personas:** therapist + platform QA.
- **Foundation (verified):** `clinical-notes` Lambda is deep — sign/immutability/addendum/diagnosis/
  by-type routes already exist (`/clinical-notes/type` implies a `noteType` field).
- **Build:** backend-initial — `NoteTemplate` entity (name, structure JSON: SOAP/DAP/BIRP sections,
  system + per-therapist custom) + CRUD routes on the clinical-notes Lambda. Seed SOAP, DAP, BIRP,
  intake, progress. Ataraxia/Iragu+ — template picker in note editor; sections render as structured form;
  saved note keeps `templateId` + structured body.
- **Accept:** therapist creates a SOAP note from template in < 30s; custom template CRUD works; signed
  notes stay immutable (existing rule intact).

### 1.4 Treatment plans 🎯 (M)
- **Steal from:** SimplePractice. **Personas:** therapist + client (visible progress) + platform (outcomes).
- **Foundation:** none (net-new entity) — but follows the exact homework/clinical-notes Lambda pattern.
- **Build:** backend-initial — `TreatmentPlan` (clientId, therapistId, diagnosis, status) +
  `TreatmentGoal` (goal, objectives JSON, targetDate, progress 0–100, linked assessment instrument) +
  new `treatment-plans` Lambda (CRUD + `/clients/{id}/treatment-plan`). Ataraxia — plan builder on
  `ClientDetailView` (goals/objectives/interventions), progress updates from session-note flow, plan
  progress + latest assessment side-by-side (plans × MBC is the differentiator SimplePractice lacks).
- **Accept:** plan with ≥1 goal/objectives creatable and progress-updatable from a session; client's
  plan progress visible next to symptom trajectory.

### 1.5 Intake + consent e-signature ✍️ (S–M)
- **Steal from:** SimplePractice; DPDP requirement anyway. **Personas:** client + platform compliance.
- **Foundation (verified):** `intake-forms` Lambda exists; **consent routes already live**
  (`/consent`, `/consent/challenge`, `/consent/me`, `/legal/documents/{type}`); Ataraxia already has
  `SignatureCapture.tsx` and `PatientIntakeForm.tsx`; `file-upload` handles S3.
- **Build:** backend-initial — extend IntakeForm/consent with signature evidence (signature image via
  `/files/upload-url`, signedAt, IP/user-agent hash, document version). Ataraxia — wire SignatureCapture
  into intake + consent flows; admin view of signed documents; version legal docs via existing
  `/admin/legal-documents`.
- **Accept:** client signs intake + consent digitally; signed PDF/record retrievable with timestamp +
  document version; unsigned client flagged on therapist caseload.

### 1.6 AI note-taking copilot v1 🤖 (M) — *the flagship, already fully spec'd*
- **Steal from:** SimplePractice/Talkspace. **Personas:** therapist (hours saved) + client (session
  summary in their language) + platform (QA).
- **Foundation (verified):** a complete KFC spec already exists —
  **`backend-initial/docs/specs/session-soap-summarization/`** (requirements + design + 46-task plan,
  **0 tasks implemented**). Design is decided: dual-track session audio → **AI4Bharat IndicConformer**
  ASR on SageMaker async scale-to-zero (Tamil/Telugu/Kannada/Hindi/Malayalam + code-mix) → **Claude
  Haiku on Bedrock** (ap-south-1, PHI in-region) → draft SOAP (`aiDraftStatus=AI_DRAFT`, never
  auto-signed) + **client-facing summary in the session language**. SLA ≤ 20 min P95; idle cost
  ≤ ₹100/day. Supporting pieces already in code: `session-recording-uploader` Lambda +
  `/session-recordings/*` routes, `aiConsentGiven` gate on Appointment, immutable-sign note flow.
- **Build:** execute that spec's task list (Prisma models `SessionRecording`/`SessionTranscript`/
  `SessionAiPipelineRun`, pipeline Lambdas, Iragu+ capture). Ataraxia adds the review surface:
  "AI draft ready" → diff-style review vs template sections → therapist edits → sign (1.3 templates
  shape the output; 1.5 captures consent).
- **Accept:** per the spec's acceptance criteria; additionally in Ataraxia — draft never signable
  without an edit/review event; disabled when `aiConsentGiven=false`; zero PHI in logs.
- **Vernacular ASR is the moat**: SimplePractice's AI notes are English-only; ours work for
  Thanglish/Hinglish therapy sessions — no competitor has this.

### 1.7 Screen-depth pass (S–M, parallel) — *the "finishing job"*
`simplepractice-screens.md` finds Ataraxia already has ~80% of SimplePractice's screens; the gap is
substance on existing screens. Use its table as **screen-level acceptance criteria**:
- Home dashboard: **income + outstanding-balance snapshot cards** (data: earnings-summary + `/billing/payments`).
- Client profile: **tabbed layout** (overview / billing / notes-docs) + send-intake + doc attach.
- Reports: **structured report set + CSV/Excel export** (the `ReportsView` TODOs).
- Telehealth: waiting room + session timer (waitlist/recurring/group calendar → MVP2 2.1/2.7).
- Design bar: Iragu **"Ink on Parchment" tokens are canonical** (design-system-decision.md — both apps
  already share the vocabulary); calm whitespace, one primary action per screen, status-only color.
- Performance budget (hosting-and-performance.md): initial JS < 300 KB gzip, no chunk > 500 KB — the
  current 598 KB video chunk violates this; code-split in MVP0.1.

### 1.8 Compliance & security workstream (parallel, from compliance.md MVP1 + security-hardening.md)
- **DPDP essentials:** consent manager (rides on 1.5 e-sign), privacy notice (+ vernacular), grievance
  officer published (billing already has `/billing/legal/grievance` + admin grievance queue), breach
  process, retention schedule.
- **Telemedicine Guidelines 2020 basics:** practitioner registration/identity displayed in session flow,
  teleconsult consent, record-keeping. **MHA 2017:** confidentiality + informed consent encoded.
- **PCI SAQ-A** filed (Razorpay tokenization keeps us SAQ-A); RBI localization documented.
- **Security carry-overs:** billing admin **role gating** (0.3.5), evaluate in-memory access token
  (sessionStorage is XSS-visible — the #1 residual risk), DOMPurify enforced on any rendered HTML,
  first pentest. (CSP hardening, secret scanning, CodeQL CI already done per security-hardening.md §2.)

### MVP1 cross-cutting
- **Anonymous-access mode** (steal rank 6, S): display-name-only mode for client profiles — Manam-side
  mostly; Ataraxia renders pseudonym + real identity visible only to assigned therapist/admin per role.
- **KPIs to instrument now:** no-show rate, time-to-first-session, notes-completed-within-24h %,
  assessment completion %, AI-draft acceptance rate, deploy success rate.
- **Persona rule** (user-personas-and-roles.md): a feature is done only when it's right for **every
  persona that touches it** — e.g. assessments = client progress view + therapist clinical action +
  admin aggregate, all from the same data.

**MVP1 exit = demo script:** a client books (Manam) → gets reminders → signs intake → takes PHQ-9 →
therapist runs session → AI drafts SOAP from template → therapist signs → treatment-plan progress +
symptom trajectory update → admin sees outcomes aggregate + payout flows. **No Indian competitor can run
this script end-to-end.**

---

## 3. MVP2 — Differentiate (next quarter)

Ordered by value; each gets its own spec via `spec-orchestrator` when scheduled. Every item must pass
the §0.5 adoption filter — MVP2 is where products usually bloat; the filter is the defense.

| # | Feature | Steal from | Size | Foundation head-start |
|---|---|---|---|---|
| 2.1 | Client self-booking widget + waitlist + policy enforcement | SimplePractice/BetterHelp | M | booking + availability APIs live |
| 2.2 | Supervision / co-sign workflow | SimplePractice | M | RBAC/Cognito groups + note sign flow |
| 2.3 | Document sharing portal (client-facing) | SimplePractice | S–M | `client-documents` + `/files` routes live |
| 2.4 | Triage & matching v1 (rules → AI) | Spring/MFine | M–L | therapist-search advanced filters + 1.2 severity data |
| 2.5 | Provider directory / SEO profiles | Practo/Monarch | M | therapist-search + profiles |
| 2.6 | Two-way calendar sync (Google/iCal) | SimplePractice | S–M | — |
| 2.7 | Group sessions + group notes | SimplePractice/Modern Health | M | LiveKit rooms |
| 2.8 | Subscription + clinically-bounded async messaging tier | BetterLYF/Talkspace | M | chat rails + billing wallet |
| 2.9 | AI member companion v1 | Wysa | L | journal/moods data + 1.6 AI plumbing |
| 2.10 | Outcomes dashboards productized (clinic-level) | Lyra | M | 1.2 data accumulating since MVP1 |
| 2.11 | **Organization track — clinic/group practice (persona 4a)** | SimplePractice group + our marketplace | L | `org_admin` role + `OrganizationManagementView` exist; needs the org backend (currently `TODO(backend)`) |

- 2.11 is the full "clinic runs its business on Bedrock" set (user-personas-and-roles.md §5): org-scoped
  RBAC (Owner/Admin/Supervisor/Front-Desk/Biller), org calendar + book-on-behalf, shared roster,
  revenue-split clinic↔therapist payouts (our ledger is the head start), clinic analytics. This is what
  finally justifies building the missing organizations backend — don't build it piecemeal before this.
- Deferred backlog: **chat E2EE** (`docs/specs/chat-e2ee/DESIGN.md` — cross-app change, web-only would
  break web↔mobile chat; revisit when all three clients can ship together).

---

## 4. Launch-Ready — Monetize & Scale

- **B2B2C / EAP portal — persona 4b** (employer eligibility, session allotments, utilization + ROI
  dashboards) — the tier-0 revenue core; our ledger/RBI stack is the head start. (XL)
  **Hard privacy rule:** EAP buyers see aggregate/anonymized data ONLY — never member-level PHI/identity.
- **Outcome-based contracting** readiness on 1.2 data; vernacular expansion; price tiers.
- **Compliance:** PA-classification legal opinion (RBI), remaining `company.*` statutory placeholders in
  BillingConfig, CA sign-off on GST exemption list — already tracked in billing domain-model "open items".
- **SOC 2 / HITRUST** only when going global/enterprise.

---

## 5. Sequencing & dependencies

```
MVP0.1 CI green ─┬─▶ MVP0.2 mock eradication ─┬─▶ MVP1.2 assessments ─▶ MVP1.4 plans ─▶ MVP2.4 triage
                 └─▶ MVP0.3 billing transport ─┤   MVP1.1 reminders ───▶ (C-SSRS alerts, 2.1 waitlist)
                     (authorizer first!)       │   MVP1.3 templates ──▶ MVP1.6 AI notes
MVP0.4 smoke ◀── all of MVP0                   └─▶ MVP1.5 e-sign ─────▶ MVP1.6 (consent)
```
- Two parallel tracks after MVP0: **clinical** (1.2→1.4, 1.3→1.6) and **ops** (1.1, 1.5).
- Cross-repo edits needing explicit approval: billing authorizer (0.3.1), billing role gating (0.3.5),
  invoice list route (0.3.4), all new backend-initial Lambdas/entities (Prisma migrations).
- Per repo convention: run each MVP1 feature through the KFC `spec-orchestrator` workflow
  (`.claude/specs/<feature>/`) at build time; this document is the program-level source they derive from.
  **1.6 already has its spec** (`session-soap-summarization`) — implement, don't re-spec.
- **Surface split (avoid double-build):** `Iragu-website` (Next.js SSR, same workspace) already wraps
  billing admin routes (`lib/api/admin/payouts.ts`) and is the SSR/public/SEO surface;
  **Ataraxia is the authenticated multi-role CRM SPA** (design-system-decision.md). New admin billing UI
  in this plan lands in Ataraxia; confirm per-screen it isn't already live in Iragu-website first.

## 6. Risks

| Risk | Mitigation |
|---|---|
| Billing authorizer change breaks mobile apps | additive `trustedClients` entry only; smoke mobile login post-deploy |
| AI notes hallucination / PHI leakage | draft-only + mandatory human sign; Bedrock in ap-south-1; no-PHI logging lint |
| C-SSRS liability without response protocol | ship alert + crisis-resources surface with clinical-governance sign-off before enabling |
| Prisma migrations on shared DB | backend-initial owns schema; billing pgStore updated same PR (existing rule) |
| Scope creep vs MVP0 discipline | MVP0 exit criteria are binary; no MVP1 work starts before deploy+smoke green |
