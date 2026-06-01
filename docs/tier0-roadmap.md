# Bedrock Health — Tier-0 Product Roadmap (MVP1 → MVP2 → Launch-Ready)

> Companion to `competitive-analysis.md`. Turns the tier-0 gap analysis + SimplePractice provider-platform
> benchmark into a phased, checklist-style backlog.
>
> Phasing logic:
> - **MVP1 — Foundation & table-stakes:** make the platform *real, connected, safe, and sellable in India*;
>   close the gaps that block credibility (consumer funnel, outcomes v1, AI notes, safety, provider essentials).
> - **MVP2 — Differentiate:** stepped care, AI companion, outcomes product, provider growth + portal depth.
> - **Launch-Ready (Tier-0 / Enterprise):** B2B2C/EAP, compliance certs, scale, distribution, white-label.
>
> Legend: `[ ]` todo · `[~]` partially exists/in-flight · `[x]` done.
> Each item tags the tier-0 system (T1–T8) or provider-platform (P) it advances.

Created 2026-05-31. Status: planning. Owner: product.

---

## MVP1 — Foundation & Table-Stakes (be undeniable in India)

### A. Platform connect & quality (in flight — finish it)
- [~] Ataraxia web: cleanup, Cognito auth, all calls → real backends (backend-initial / billing_payment / video-service)
- [ ] Ataraxia: drive lint/unused-var to zero; CI gate on `typecheck` + `build`
- [ ] Smoke-test full therapist + client journeys against live ap-south-1 backend
- [ ] Confirm Manam + Iragu+ point at the same shared backends/contracts (one API source of truth)

### B. World-class consumer funnel (T3 + competitive gap)
- [ ] Discover: therapist search/browse with filters (specialty, language, price, availability, modality)
- [ ] Match: guided "find the right therapist" flow (preferences → ranked matches)
- [ ] Book: real-time slots → confirm → pay (Razorpay) → calendar invite → join link
- [ ] Session join: pre-session check, in-session (Zoom/LiveKit), post-session summary
- [ ] Redesign Ataraxia + Manam key screens on a shared design system (tokens/components)

### C. Measurement-Based Care v1 (T1 — tier-0-defining)
- [ ] Assessment engine: PHQ-9, GAD-7, WHO-5 with **auto-scoring** + severity bands
- [ ] Administer at **intake + every session** (Manam) ; results to clinician (Iragu+/Ataraxia)
- [ ] Symptom **trajectory** view (per client) + response/remission flags
- [ ] Backend: assessment schema, scoring service, history API (backend-initial)

### D. Clinician AI Copilot v1 (T6 — highest-ROI AI; SimplePractice/Talkspace parity)
- [ ] AI-drafted **session notes** (session context → SOAP/DAP draft for clinician edit/sign)
- [ ] Note **templates library** (SOAP, DAP, intake, progress) — provider parity (P)
- [ ] AI summaries (client history at-a-glance) + suggested homework
- [ ] Built on Bedrock/Claude; PHI-safe (no PHI in logs), human-in-the-loop sign-off

### E. Safety & crisis (T7 — non-negotiable)
- [ ] C-SSRS (suicide risk) screening in intake + triggered flows
- [ ] Risk escalation path: flag → clinician alert → crisis resources/helpline surfacing
- [ ] Emergency-contact capture (Manam has UI) wired + surfaced in crisis path

### F. Provider essentials (P — SimplePractice table-stakes)
- [ ] **Appointment reminders** (SMS/email/push) → cut no-shows
- [ ] **Treatment plans** with goals + progress tracking
- [ ] **Intake forms + e-signature** (consent, intake) in client portal
- [ ] Client self-scheduling / reschedule / cancel with policy enforcement

---

## MVP2 — Differentiate (leapfrog the field)

### G. Stepped / blended care (T2 — tier-0-defining)
- [ ] **Coaching tier** (lower-cost, higher-supply) distinct from licensed therapy
- [ ] **Self-guided programs / content library** (CBT/DBT/mindfulness courses) — engagement between sessions
- [ ] One front door routing severity → correct care level (ties to triage)

> 🚫 **Out of scope (India regulation):** **e-prescribing** and **insurance claims** are NOT part of the
> therapist/counsellor product — in India only registered medical practitioners (psychiatrists) may
> prescribe, and counsellors/therapists cannot file insurance claims. A psychiatry tier, *if ever* pursued,
> is a **separate medically-regulated persona** (psychiatrist), not this product.

### H. Intelligent triage & matching v2 (T3)
- [ ] AI triage model: severity + needs → recommended care level + matched providers
- [ ] Track **time-to-first-session** as an SLA metric
- [ ] Re-match / continuity-of-care logic

### I. AI member companion (T6 — our Wysa answer)
- [ ] 24/7 conversational support + journaling prompts (extend Manam journal/mood)
- [ ] Between-session check-ins; risk triage hand-off to crisis path (T7)
- [ ] Clinically-guardrailed; escalation to human care

### J. Outcomes product (T1 → productized)
- [ ] Clinician + program **outcomes dashboards** (recovery/response rates, caseload trends)
- [ ] Client-facing progress view ("you're improving") to drive retention

### K. Provider growth & portal depth (P — SimplePractice "Monarch"/website)
- [ ] Provider **professional profiles / directory** (consumer discovery marketplace)
- [ ] Reviews flywheel (Manam already has add-review/reviews pages — wire + moderate)
- [ ] Secure client portal: messaging + **document sharing** + e-sign at parity
- [ ] **Group practice / supervision / co-sign** workflows + QA

---

## Launch-Ready — Tier-0 / Enterprise (expand TAM, win contracts)

### L. B2B2C / EAP engine (T5 — the revenue core)
- [ ] Employer portal: eligibility, session allotments, member onboarding
- [ ] **Utilization + ROI dashboards** (anonymized, aggregate)
- [ ] Sponsored-care billing flows (leverage existing ledger/invoicing infra)
- [ ] Outcome-based contracting readiness (sell on results)

### M. Trust & compliance at scale (T8)
- [ ] **SOC 2 Type II**; evaluate **HITRUST** for enterprise/global
- [ ] DPDP audit hardening + data residency; expand audit logging
- [ ] Clinical governance: provider vetting bar, credential-verification depth, supervision/QA as a system (T4)

### N. India fit & access
- [ ] **Vernacular** across funnel + content (Hindi + 4–5 regional) — Manam has multilingual questionnaires to extend
- [ ] Digital payment options (Razorpay/wallet — already have). 🚫 **NO insurance-claims filing**
  (India therapists/counsellors are not permitted to file claims).

### O. Scale & distribution
- [ ] White-label / multi-tenant for clinics & hospital chains (architecture already supports it)
- [ ] App-store optimization, ratings/reviews flywheel, brand + marketing site
- [ ] Network-adequacy + supply ops analytics (provider quality bar, T4)

---

## Organization track — Clinic / Group Practice + EAP (persona 4)

> Full feature set in `user-personas-and-roles.md` §5 (clinic) and §6 (EAP). Phased here.
> Foundation exists: `org_admin` role + `OrganizationManagementView` in Ataraxia.

**MVP2 — Clinic / Group Practice can run its business (supply-side org)**
- [ ] Org onboarding + **KYC/verification** (clinic reg, GST/PAN/bank) + branded clinic page (discoverable in Manam)
- [ ] **Org-scoped RBAC**: Org Owner / Admin / Supervisor / Front-Desk / Biller / Therapist-member; row-level org isolation
- [ ] Invite/onboard therapists under the org; credential tracking
- [ ] **Org-wide calendar** + front-desk book-on-behalf + client assignment/transfer
- [ ] Shared (consent-gated) **org client roster**; org intake + e-sign
- [ ] Org note-template & treatment-plan libraries; **supervision/co-sign**; clinical QA dashboards
- [ ] **Org billing + revenue split (clinic↔therapist) + org payouts (TDS/GST)** + reconciliation
- [ ] Marketplace **leads routed to clinic** → assign to therapists
- [ ] **Clinic owner analytics** (revenue, utilization, no-shows, per-therapist performance, outcomes rollup)
- [ ] Multi-location support

**Launch — Employer / EAP buyer (demand-side org) + scale**
- [ ] EAP eligibility mgmt (upload/SSO/eligibility files) + benefit design (allotments)
- [ ] Member onboarding (invite/SSO/**anonymous**); **utilization + ROI dashboards (aggregate-only)**
- [ ] Employer-pays billing + HR reporting + contract/SLA tracking
- [ ] **White-label** for clinics/hospital chains (own domain/branding)
- [ ] Org-level compliance (data-fiduciary consent, audit, DPA)

> **Privacy guardrail:** EAP buyers see **aggregate/anonymized** data only — never member-level PHI/identity.

---

## Cross-cutting (every phase)
- [ ] Shared design system across Ataraxia (web) + Manam + Iragu+ (consistent brand/UX)
- [ ] One API contract source of truth; contract tests across the 3 apps + 3 backends
- [ ] PHI-safe analytics + observability; clinical audit trails
- [ ] Accessibility (WCAG) + performance budgets

---

## How this maps to the tier-0 scorecard
| Tier-0 system | Closed in |
|---------------|-----------|
| T1 Outcomes/MBC | MVP1 (v1) → MVP2 (product) |
| T2 Stepped care | MVP2 |
| T3 Triage & matching | MVP1 (funnel) → MVP2 (AI) |
| T4 Provider quality/supply | MVP2 → Launch |
| T5 B2B2C / EAP | Launch |
| T6 AI (copilot + companion) | MVP1 (copilot) → MVP2 (companion) |
| T7 Crisis & governance | MVP1 |
| T8 Trust & compliance | (have base) → Launch (certs) |
| P Provider platform (SimplePractice parity) | MVP1 essentials → MVP2 depth |

> **Sequencing principle:** MVP1 makes us *credible and safe* (consumer funnel + outcomes + AI notes +
> safety + provider essentials). MVP2 makes us *differentiated* (stepped care + AI companion + outcomes
> product + growth). Launch-Ready makes us *enterprise/tier-0* (B2B2C + certs + scale). We already own the
> provider-tooling + financial/compliance core — these phases add the front-of-house systems that win.

---

## By user type (see `user-personas-and-roles.md`)

Each epic primarily serves one or more of the three personas — **Client (Manam)**, **Therapist (Iragu+)**,
**Bedrock Team (Ataraxia)**. Build each so it's right for *every* persona it touches.

| Epic | Primary persona(s) |
|---|---|
| B. Consumer funnel | **Client** (+ Therapist gets matched clients) |
| C. MBC outcomes v1 | **Client** (progress) + **Therapist** (action) + **Bedrock** (aggregate) |
| D. AI copilot / notes / templates | **Therapist** (+ Bedrock QA) |
| E. Crisis / C-SSRS | **Client** (protected) + **Therapist** (alerted) + **Bedrock** (protocol) |
| F. Reminders / treatment plans / e-sign / self-schedule | **Client** + **Therapist** (+ Bedrock compliance) |
| G. Stepped care | **Client** (care options) + **Bedrock** (continuum/supply) |
| H. Triage & matching | **Client** + **Bedrock** (rules) |
| I. AI companion | **Client** (+ Therapist hand-off) |
| J. Outcomes product | **Therapist** + **Bedrock** (B2B story) |
| K. Provider growth / portal | **Therapist** (growth) + **Client** (portal) + **Bedrock** (supply) |
| L. B2B2C / EAP | **Organization-EAP (4b)** + **Bedrock** + **Client** (as benefit) |
| M. Compliance certs | **Bedrock** (+ trust for all) |
| N. Vernacular / access | **Client** |
| O. Scale / distribution | **Bedrock** |
| Organization track (clinic) | **Organization-Clinic (4a)** + its Therapists + Clients |

> Bedrock-team operational tooling (verification, payouts, reconciliation, compliance, analytics) spans
> every phase even though Clients/Therapists never see it — it's the operational moat.
