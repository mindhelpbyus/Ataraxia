# Bedrock Health — User Personas, Roles & What Each Needs

> The platform serves **four user types** (Client, Therapist, Bedrock Team, Organization).
> Every feature in the other docs
> (`competitive-analysis.md`, `simplepractice-comparison.md`, `best-features-to-adopt.md`,
> `tier0-roadmap.md`, `compliance.md`) should be read through this lens: *who is it for, and what do they
> need from it.* Each of those docs has a "By user type" section that points back here.

Created 2026-05-31.

---

## 1. The three user types

| # | Persona | App / surface | Cognito role | One-line job-to-be-done |
|---|---------|---------------|--------------|--------------------------|
| 1 | **Client (Patient)** | **Manam** (mobile) + web | `client` (Clients group) | "Find the right help, get better, feel supported between sessions." |
| 2 | **Therapist (Clinician)** | **Iragu+** (mobile) + Ataraxia (web for heavy work) | `therapist` (Therapists group) | "Deliver great care efficiently, grow my practice, get paid correctly." |
| 3 | **Provider / Bedrock Team (Admin/Ops)** | **Ataraxia** (web) | `admin` / `superadmin` (Admin group) | "Run a safe, compliant, high-quality, profitable platform." |
| 4 | **Organization (Org Admin)** | **Ataraxia** (org-scoped web portal) | `org_admin` (+ org sub-roles) | "Run my mental-health business / sponsor my people on Bedrock." |

**Persona 4 has two modes** (both `org_admin`, org-scoped data):
- **4a — Clinic / Group Practice (supply-side):** a small/mid therapy clinic onboards to **run its whole
  business** on our platform — manage its therapists, clients, scheduling, billing, payouts, supervision,
  branding, analytics. *They are our customer AND a supply node.* (See §5 for the full feature set.)
- **4b — Employer / EAP Buyer (demand-side):** an employer **sponsors** employees' care — eligibility,
  session allotments, utilization/ROI reporting, billing. (See §6.)

> Bedrock-team (persona 3) is the platform operator; Organization (persona 4) is a **tenant** operating
> *within* the platform on org-scoped data. Therapists and Clients can belong to an Organization or be
> independent on the marketplace.

---

## 2. What each persona needs (by capability area)

### A. Discovery & access
| Need | Client | Therapist | Bedrock Team |
|---|---|---|---|
| Search/browse providers, filters, matching | ✅ core | — | configure ranking/quality rules |
| Anonymous / low-stigma entry | ✅ | — | policy + safeguards |
| Provider profile / SEO presence | views it | ✅ owns it | moderates it |
| Lead inbox (incoming clients) | — | ✅ | monitors supply/demand |

### B. Booking & sessions
| Need | Client | Therapist | Bedrock Team |
|---|---|---|---|
| Self-book / reschedule / cancel | ✅ | sets availability/policy | oversees rules |
| Appointment reminders (no-show cut) | ✅ receives | ✅ benefits | monitors no-show metrics |
| Telehealth (video/audio/chat) | ✅ joins | ✅ runs | quality/recording governance |
| Waitlist / waiting room | ✅ | ✅ | — |

### C. Clinical care & documentation
| Need | Client | Therapist | Bedrock Team |
|---|---|---|---|
| Session notes (templates, AI-drafted) | — (private to clinician) | ✅ core | audit/QA only (no casual access) |
| Treatment plans + goals | sees own goals/progress | ✅ authors | outcome oversight (aggregate) |
| Assessments (PHQ-9/GAD-7) + scoring | ✅ takes + sees progress | ✅ reviews/acts | aggregate outcomes + program reporting |
| Homework / between-session tasks | ✅ does | ✅ assigns | — |
| Supervision / co-sign | — | junior signs, supervisor co-signs | configures supervision rules |
| Crisis / C-SSRS + escalation | ✅ protected | ✅ alerted/acts | escalation oversight + protocol |

### D. Engagement & self-help
| Need | Client | Therapist | Bedrock Team |
|---|---|---|---|
| Mood, journal, wellness, breathing | ✅ core | sees shared insights | content/program mgmt |
| AI companion (24/7) | ✅ | hand-off target | guardrails + risk routing |
| Programs / content library | ✅ consumes | may assign | curates/publishes |

### E. Money
| Need | Client | Therapist | Bedrock Team |
|---|---|---|---|
| Pay for sessions / wallet / subscription | ✅ | — | pricing config |
| Invoices / receipts (RBI-compliant) | ✅ receives | ✅ receives | issues + reconciles |
| **Payouts + TDS** | — | ✅ receives + statements | ✅ runs payouts, TDS, ledger, reconciliation |
| Refunds / disputes | ✅ requests | visibility | ✅ adjudicates |

### F. Trust, privacy & control
| Need | Client | Therapist | Bedrock Team |
|---|---|---|---|
| Consent (DPDP) + e-sign | ✅ gives | ✅ gives (clinician terms) | ✅ manages + audits |
| Data access / erasure rights | ✅ own data | ✅ own data | ✅ honors + logs (grievance officer) |
| MFA / account security | ✅ | ✅ | ✅ + enforces policy |
| Confidentiality (MHA 2017) | ✅ protected | ✅ upholds | ✅ governs (minimum-necessary) |

### G. Operate & grow (Bedrock-team-specific)
| Need | Bedrock Team |
|---|---|
| Therapist onboarding + **verification/credentialing** | ✅ |
| Quality bar, outcomes oversight, supervision/QA | ✅ |
| Financial ops (payout batches, reconciliation, fee rates) | ✅ |
| Compliance/audit, breach response, access reviews | ✅ |
| B2B/EAP mgmt, utilization/ROI dashboards (future) | ✅ |
| Platform analytics, user management, RBAC, config | ✅ |

---

## 5. Organization — Clinic / Group Practice: full "run-your-business" feature set (persona 4a)

A small/mid therapy clinic should be able to **run its entire business on Bedrock**. This is
SimplePractice-style group-practice management **plus** our marketplace, payouts, and consumer reach.
Org-scoped: every record belongs to the org; org admin sees only their org.

### 5.1 Org onboarding & identity
- [ ] Org sign-up + **org KYC/verification** (clinic registration, GST, PAN, bank for payouts)
- [ ] Org profile / **branded clinic page** (logo, bio, locations, specialties) → discoverable in Manam
- [ ] Optional **white-label** (own domain/branding) — Launch tier
- [ ] Multi-location support (branches, rooms)

### 5.2 Staff & roles (org-scoped RBAC)
- [ ] Invite & onboard therapists **under the org** (org-linked Cognito users)
- [ ] Org sub-roles: **Org Owner**, **Org Admin/Manager**, **Clinical Supervisor**, **Front Desk/Reception**, **Biller/Finance**, **Therapist (member)**
- [ ] Per-role permissions; add/suspend/offboard staff; credential tracking per therapist

### 5.3 Scheduling & front-desk ops
- [ ] **Org-wide calendar** — all therapists/rooms in one view
- [ ] Front-desk **book/reschedule/cancel on behalf of clients**; manage walk-ins
- [ ] Client **assignment & transfer** between the clinic's therapists
- [ ] Room/resource management; org-level availability + holidays
- [ ] Reminders + waitlist at org level (no-show reduction)

### 5.4 Client management (org-scoped)
- [ ] **Shared client roster** for the org (consent-gated), assigned-therapist view
- [ ] Org-level intake forms + e-sign; client documents
- [ ] Transfer of care + continuity within the org
- [ ] Client communication (org-branded messaging/notifications)

### 5.5 Clinical operations & quality
- [ ] **Org note-template & treatment-plan libraries** (shared standards across therapists)
- [ ] **Supervision / co-sign** (supervisor reviews/co-signs juniors' & interns' notes)
- [ ] Caseload review + clinical QA dashboards
- [ ] Org-wide assessment library + outcomes (MBC) rollup
- [ ] Crisis protocol routing within the org

### 5.6 Money — run the clinic's finances
- [ ] **Org billing**: collect from clients (Razorpay), org-level invoices (RBI-compliant), statements
- [ ] **Revenue split** clinic ↔ therapist (configurable %/rules) → automated
- [ ] **Org payouts**: clinic receives, distributes to its therapists; or per-therapist payout w/ org fee
- [ ] **TDS / GST** handling at org level; financial statements + reconciliation
- [ ] Refunds/disputes/wallet at org scope
- [ ] Subscription or take-rate plan for the org (our monetization of the clinic)

### 5.7 Growth & demand
- [ ] **Marketplace leads** routed to the clinic → assign to therapists (lead inbox at org level)
- [ ] Clinic profile SEO/discovery in Manam; reviews/ratings for the clinic + its therapists
- [ ] Promotions/packages the clinic can offer

### 5.8 Analytics & reporting (clinic owner's cockpit)
- [ ] Revenue, utilization, no-show rate, new vs returning clients
- [ ] **Per-therapist performance** (sessions, revenue, outcomes, ratings)
- [ ] Outcomes/MBC rollup; caseload/capacity; payout summaries
- [ ] Exportable reports

### 5.9 Compliance (org as data fiduciary)
- [ ] Org-level consent management + DPDP obligations; org audit logs
- [ ] Org data-access controls (minimum-necessary across staff)
- [ ] Org DPA / terms; data-erasure handling within org

---

## 6. Organization — Employer / EAP Buyer: feature set (persona 4b)

Demand-side org that **sponsors** members' care (the tier-0 B2B2C revenue core).
- [ ] **Eligibility management** — upload/SSO/eligibility-file of covered members
- [ ] **Benefit design** — sponsored session allotments, covered care levels, network
- [ ] **Member onboarding** — invite codes / SSO / **anonymous access** (privacy from employer)
- [ ] **Utilization + ROI dashboards** — **anonymized & aggregate only** (never member-level PHI)
- [ ] **Billing** — employer-pays flows, usage-based invoicing (leverages our ledger/invoicing)
- [ ] HR/benefits **reporting**; engagement metrics; outcome summaries (aggregate)
- [ ] Account management + contract/SLA tracking

> **Hard privacy rule:** EAP buyers get **aggregate, anonymized** data only. No employer ever sees an
> individual member's sessions, notes, or identity. This is both DPDP and trust-critical.

---

## 7. Access model (who sees what — minimum-necessary)

| Data | Client | Therapist | Bedrock Team | Organization (org-scoped) |
|---|---|---|---|---|
| Own profile/PII | RW (own) | RW (own) | R + admin actions (audited) | RW org profile |
| Clinical notes | ❌ (clinician-private) | RW (own clients) | ❌ casual; audit-only w/ reason | supervisor co-sign within org only |
| Assessment results | own | assigned clients | aggregate/anonymized | org rollup (own clinic); **EAP: aggregate-only** |
| Payment data (cards) | own (tokenized) | ❌ | ❌ (PCI scope-minimized) | ❌ |
| Payouts/ledger | ❌ | own statements | full (ops) | own org's finances |
| Other clients' data | ❌ | ❌ (only assigned) | role-gated, audited | own org's clients only (consent-gated) |
| Platform config / fee rates | ❌ | ❌ | ✅ | own org settings only |
| Member identity (EAP) | — | — | ✅ (ops) | **❌ never — aggregate/anonymized only** |

Principles: **least privilege + minimum-necessary** (HIPAA/MHA), all admin access to PHI **audited with
reason**, RBAC via Cognito groups + app authz, **org-scoped row-level isolation** (an org sees only its
own data), separation of duties for money ops, and **EAP buyers get aggregate-only** (no member PHI).

---

## 4. How this shapes priorities
- A feature is only "done" when it's right for **each** persona that touches it (e.g., reminders =
  client receives + therapist benefits + Bedrock monitors).
- The **same data** serves three views: assessments → client *progress*, therapist *clinical action*,
  Bedrock *aggregate outcomes* (the B2B/payer story).
- Bedrock-team tooling (verification, payouts, compliance, analytics) is our **operational moat** — keep
  investing even though end-users never see it.
