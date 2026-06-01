# Bedrock Health — Tier-0 Competitive Strategy & Gap Analysis

> Ambition: become a **tier-0 mental-health company** — the class of Lyra Health, Spring Health,
> BetterHelp, Talkspace, Headspace Health — not just win the Indian D2C therapy market.
>
> **What we have** is verified from the codebase: `community-app` (Manam, patient Flutter app),
> `therapistApp` (Iragu+, clinician Flutter app), `Ataraxia` (web CRM/admin), and backends
> `backend-initial` + `billing_payment` + `video-service`.
> **Competitor profiles** are from market knowledge (≤2026) — **directionally accurate; verify exact
> figures before investor/board use.** These companies iterate fast and much enterprise data is private.

Created 2026-05-31. Owner: product/strategy.

---

## 0. What "tier-0" actually means (the bar)

Tier-0 mental-health companies do **not** win on "book a therapist." They win on **eight systems**.
This is the rubric we score everyone against — including ourselves.

| # | Tier-0 system | Why it's the bar | Who exemplifies it |
|---|---------------|------------------|--------------------|
| 1 | **Measurement-Based Care (MBC) + published outcomes** | Validated assessments (PHQ-9/GAD-7/C-SSRS) at *every* session → symptom trajectories → **peer-reviewed recovery rates**. This is what wins enterprise/payer contracts. | Lyra (~50%+ recovery, published), Spring Health (precision MH + outcomes), Talkspace |
| 2 | **Stepped / blended care continuum** | Self-guided digital → coaching → therapy → **psychiatry/medication** → crisis. One front door, right level of care, escalation. | Spring, Lyra, Headspace Health |
| 3 | **Intelligent triage & matching** | Clinical+AI triage to the right care level and the right provider; time-to-first-session in **days, not weeks**. | Spring ("Precision Mental Healthcare"), Lyra |
| 4 | **Provider supply & quality bar** | Rigorous credentialing/vetting (Lyra reportedly accepts a low single-digit % of applicants), network adequacy, evidence-based modality coverage (CBT/DBT/EMDR), clinical supervision/QA. | Lyra, Spring |
| 5 | **Payer / employer B2B2C engine** | EAP + health-plan integration, eligibility, claims/utilization, **ROI dashboards**. This is the revenue core at tier-0. | Lyra, Spring, Modern Health |
| 6 | **AI across the stack** | Member companion (24/7), risk detection, **clinician copilot (auto-notes, summaries)**, content personalization. | Wysa/Woebot (companion), Talkspace (AI notes), emerging in all |
| 7 | **Crisis & clinical governance** | C-SSRS risk screening, 24/7 crisis escalation, safety protocols, clinical oversight, audit. | All credible tier-0 |
| 8 | **Trust & compliance at scale** | HIPAA + SOC 2 + HITRUST (US), DPDP (India), data residency, clinical-grade security. | All tier-0 |

**Reframe:** the 16 names you listed are mostly **tier-2/3** (D2C therapy marketplaces) or **adjacent**
(health super-apps). To be tier-0 we must beat the *Indian* field on execution **and** adopt the
*global* tier-0 playbook (outcomes + stepped care + B2B2C + AI). Both, not either.

---

## 1. The competitive landscape, segmented honestly

| Tier | Companies | What they actually are | Threat to us |
|------|-----------|------------------------|--------------|
| **Tier-0 (global benchmark)** | Lyra Health, Spring Health, BetterHelp, Talkspace, Headspace Health, Modern Health | Outcomes-led, stepped-care, B2B2C-funded platforms (or BetterHelp's massive D2C engine) | The bar to clear. Not in India at scale yet → **our window**. |
| **Tier-1 India (serious)** | YourDOST, Wysa, MantraCare, Amaha (ex-InnerHour) | Real scale, B2B/EAP motion, Wysa is globally credible AI | Direct + they're closest to tier-0 in India |
| **Tier-2 India (D2C therapy)** | TalktoAngel, Manastha, BetterLYF, MindPeers, HopeQure, Psyra, Therapize | D2C counsellor marketplaces; thinner clinical/financial infra | Direct, beatable on depth |
| **Adjacent (teleconsult/e-pharmacy super-apps)** | Practo, MediBuddy, Tata 1mg, MFine (→ now part of others), Lybrate, Netmeds | Broad health; MH is one vertical. Own distribution + trust | Set booking/teleconsult UX expectations; could enter MH |

---

## 2. Deep competitor profiles (the ones that matter)

### Lyra Health — *the outcomes/enterprise gold standard*
- **Model:** B2B2C. Employers pay; members get sessions. Stepped care: self-guided → coaching → therapy → psychiatry.
- **Moat:** Rigorous provider vetting; **published clinical outcomes** (measurement-based care at scale); blended care (digital + human); fast access.
- **Beat them by:** They're US-first and enterprise-heavy. India + emerging-markets + a cheaper, equally-rigorous outcomes engine is open. Match their MBC rigor at 1/10th cost.

### Spring Health — *precision + speed*
- **Model:** B2B2C, "Precision Mental Healthcare" — data-driven matching to the right care, fast.
- **Moat:** Triage algorithm, outcomes data, employer ROI story, full continuum incl. meds.
- **Beat them by:** Their precision/triage is an AI+data play — we can leapfrog with a modern AI triage built on our clinical data + Bedrock/Claude, localized for India.

### BetterHelp — *D2C distribution machine*
- **Model:** D2C subscription, enormous marketing spend, largest therapist network, text/chat/phone/video.
- **Moat:** Scale, brand, supply, frictionless onboarding. **Weakness:** criticized on clinical rigor/outcomes & therapist churn.
- **Beat them by:** Out-clinical them (real MBC, notes, outcomes) while matching their onboarding smoothness. Quality-led D2C.

### Talkspace — *async messaging therapy + payer coverage*
- **Model:** D2C + insurance + employer. Asynchronous messaging therapy, psychiatry, **AI-assisted notes**.
- **Beat them by:** Their async model + insurance is US-specific; replicate the convenience, add stronger provider tools (we already have deeper notes).

### Wysa — *AI-native, clinically credible (India-origin, global)*
- **Model:** AI chatbot companion + human coaching/therapy; strong B2B (employers, payers, even NHS work).
- **Moat:** Clinically validated AI conversational agent; the strongest AI MH brand with India roots.
- **Beat them by:** **This is our most important AI benchmark.** We must have a credible AI companion *and* the full human-care + clinical + financial stack they lack.

### YourDOST — *India B2B/EAP incumbent*
- **Model:** Counselling marketplace + large EAP/campus footprint.
- **Moat:** Brand, B2B relationships, scale in India.
- **Beat them by:** Deeper clinical product, outcomes, modern AI, superior provider tooling.

### Amaha (InnerHour), MantraCare, MindPeers — *India B2B + programs*
- Programs/self-help + therapy + psychiatry (Amaha has psychiatry/meds — a real continuum), B2B EAP.
- **Beat them by:** Outcomes engine + financial/compliance infra + AI.

### Practo / MediBuddy / Tata 1mg / Lybrate / Netmeds — *super-apps*
- Distribution + trust + teleconsult + e-pharmacy. MH is shallow.
- **Threat:** If one decides MH is strategic, distribution beats us. **Defense:** be the specialist they'd rather partner with/acquire than build.

### SimplePractice — *the provider-platform / EHR gold standard (mine their playbook)*
- **What it is:** the leading behavioral-health **practice-management + EHR** for solo/group practices
  (US). Provider-side, not consumer. This is the closest benchmark to **Iragu+ / Ataraxia**, and their
  public help center documents the *complete* feature surface a best-in-class provider platform needs.
- **Their full feature surface (the checklist to mine):**
  | Area | SimplePractice capability | Bedrock today |
  |------|---------------------------|---------------|
  | Scheduling | Calendar, online booking widget, recurring appts, waitlist | ✅ availability/slots (no booking widget/waitlist) |
  | **Appointment reminders** | SMS / email / voice, customizable | ❌ (no reminder engine) → **no-show reducer, MVP1** |
  | Telehealth | HIPAA video, group sessions | ✅ (Zoom + LiveKit) |
  | **Documentation** | Note **templates library** (SOAP/DAP/etc.), customizable templates, **treatment plans** w/ goals, intake forms | 🟡 notes ✓; **templates/treatment-plans ❌** |
  | **Assessment library** | Standardized measures, **auto-scoring**, repeat + track (MBC) | 🟡 questionnaires in Manam; **no scoring/library/tracking** |
  | **Client portal** | Secure messaging, document sharing, **e-signature** on forms, self-scheduling, autopay | 🟡 chat ✓; **e-sign / doc-sign / self-schedule ❌** |
  | Billing | Card processing, autopay, superbills, **insurance claims (CMS-1500), ERA/EOB, clearinghouse** | ✅ payments/payouts/RBI-invoicing; **insurance claims N/A (US); India cashless 🟡 future** |
  | E-prescribing | Via integrations | ❌ (needs psychiatry tier) |
  | **Provider growth** | Professional **website builder** + **Monarch directory** (client-discovery marketplace) | ❌ → **provider acquisition channel, MVP2** |
  | Group practice | Roles, team scheduling, **supervision/co-sign** | 🟡 RBAC ✓; supervision ❌ |
  | **AI** | AI note-taking (session → draft note) | ❌ → **highest-ROI AI, MVP1** |
  | Reporting | Practice analytics, income, outstanding | ✅ analytics dashboards |
- **What to "get more out of them":** treat their docs as our **provider-platform completeness spec**.
  The high-value items we're missing: **note-template library, treatment plans w/ goal tracking,
  assessment library + auto-scoring, e-signature on intake/consent, appointment reminders, client
  self-scheduling portal, AI note-taking, provider directory/marketplace, supervision/co-sign.**
- **Beat them by:** SimplePractice is US-EHR-bound (insurance-claims-centric) and **provider-only — no
  consumer demand engine, no outcomes/AI/B2B2C**. We can match their provider depth *and* own the
  consumer + outcomes + AI + EAP layers they don't touch — a combination none of the 16 has.

---

## 3. Multi-dimensional scorecard (0–5; honest)

Bedrock = our platform today (Manam + Iragu+ + Ataraxia + backends).

| Dimension (tier-0 system) | Bedrock | Lyra | Spring | BetterHelp | Talkspace | Wysa | YourDOST | Amaha |
|---|---|---|---|---|---|---|---|---|
| 1. MBC + outcomes | **2** (assessments exist, no outcomes engine) | 5 | 5 | 2 | 4 | 4 | 3 | 3 |
| 2. Stepped/blended care | **2** (therapy+video; no coaching/psychiatry/crisis tiers) | 5 | 5 | 3 | 4 | 4 | 3 | 4 |
| 3. Triage & matching | **1** (basic search) | 5 | 5 | 3 | 3 | 4 | 3 | 3 |
| 4. Provider supply & quality bar | **2** (verification workflow ✓; no vetting bar/supply) | 5 | 5 | 4 | 4 | 3 | 4 | 3 |
| 5. Payer/employer B2B2C | **1** (none yet) | 5 | 5 | 2 | 4 | 4 | 4 | 4 |
| 6. AI across stack | **1** (none wired) | 3 | 4 | 2 | 4 | 5 | 2 | 3 |
| 7. Crisis & clinical governance | **2** (emergency-contact UI; no C-SSRS/escalation) | 5 | 5 | 3 | 4 | 4 | 3 | 3 |
| 8. Trust & compliance | **4** (DPDP, PII enc, MFA, audit) | 5 | 5 | 4 | 4 | 4 | 3 | 3 |
| **Provider tooling (our edge)** | **5** (notes/intake/homework/availability) | 4 | 4 | 2 | 3 | 2 | 3 | 3 |
| **Financial infra (our edge)** | **5** (payouts+TDS, RBI invoicing, ledger) | 3 | 3 | 3 | 3 | 2 | 2 | 2 |
| **Mobile + realtime** | **4** (2 native apps, Zoom, AppSync, FCM) | 5 | 5 | 5 | 5 | 5 | 4 | 4 |
| **Multilingual / India fit** | **3** (l10n + vernacular questionnaires) | 2 | 2 | 2 | 2 | 4 | 4 | 4 |

**Read of the board:** we are **5/5 where tier-0 is only 3–4** (provider tooling, financial/compliance
infra) and **1–2 where tier-0 is 5** (outcomes, stepped care, triage, B2B2C, AI). We have built the
*hard back-of-house* most startups never build — and skipped the *front-of-house systems* that actually
win contracts and members.

---

## 4. The gaps that separate us from tier-0 (prioritized)

### 🔴 Tier-0-defining (must-have to be in the conversation)
1. **Outcomes engine (MBC).** Administer PHQ-9/GAD-7/WHO-5/C-SSRS at intake + every session; compute
   symptom trajectories, response/remission rates, clinician + program dashboards. *We already capture
   assessments in Manam and notes in Iragu+ — the data plumbing is half-built; the **outcomes product** is missing.*
2. **Stepped-care continuum.** Add tiers around therapy: (a) **self-guided** programs, (b) **coaching**
   (lower-cost, higher-supply), (c) **psychiatry/medication management**, (d) **crisis path**. Amaha/Spring/Lyra all span this.
3. **Intelligent triage & matching.** A clinical+AI front door that routes severity → care level and
   matches member↔provider (modality, language, specialization, availability). Time-to-first-session as a tracked SLA.
4. **B2B2C / EAP engine.** Employer portal: eligibility, session allotments, **utilization + ROI dashboards**,
   anonymized reporting. Our ledger/compliance stack is a genuine head start here.

### 🟠 Differentiators (where we can leapfrog)
5. **AI layer (3 surfaces):** (a) **member companion** (24/7 support, journaling, between-session, risk
   triage) — our Wysa answer; (b) **clinician copilot** — auto-draft SOAP notes from session, summaries,
   homework suggestions (massive retention lever; Talkspace has this); (c) **smart matching/triage** model.
   Built on Bedrock/Claude + our proprietary clinical data.
6. **Crisis & governance:** C-SSRS screening, automated risk escalation, 24/7 crisis protocol, clinical
   supervision/QA workflows. Required for enterprise + ethically non-negotiable.
7. **Provider quality bar & supply ops:** explicit vetting criteria, credential verification depth,
   network-adequacy + utilization analytics (turn our verification workflow into a quality *system*).

### 🟡 Scale & expansion
8. **Programs/content library** (guided CBT/DBT/mindfulness courses) for engagement between sessions.
9. **Outcome-based contracting** readiness (sell on results to payers/employers).
10. **Global compliance** (SOC 2 / HITRUST) if expanding beyond India.
11. **Distribution**: app-store optimization, ratings/reviews flywheel, brand.

### Already strong — protect & market it
- Provider tooling, financial/payout/RBI-invoicing/ledger, DPDP+PII+MFA security, native mobile + realtime.
  These are **enterprise trust signals** — make them a *sales narrative*, not just plumbing.

---

## 5. Roadmap to tier-0 (sequenced)

**Horizon 1 — Be undeniable in India (close table-stakes, 1–2 quarters)**
- Wire **assessments → outcomes engine** (MBC v1: intake + per-session + trajectory dashboards).
- **Triage + matching v1** (clinical rules + AI assist) and a **world-class consumer funnel** (the Ataraxia/Manam redesign you're starting): discover → match → book → pay → join.
- **Clinician copilot v1**: AI-drafted session notes (highest-ROI AI feature; retains providers).
- Crisis: C-SSRS + escalation path.

**Horizon 2 — Differentiate (next)**
- **Stepped care**: launch coaching tier + self-guided programs; add psychiatry/medication management.
- **AI member companion** (Wysa-class) tied into triage + journaling already in Manam.
- **Outcomes dashboards** productized for clinics.

**Horizon 3 — Expand TAM (then)**
- **B2B2C / EAP portal** (employer eligibility, utilization, ROI) — monetization core of every tier-0 firm.
- **Outcome-based payer contracts**; white-label for hospital/clinic chains (architecture already multi-tenant-ready).
- **SOC 2 / HITRUST** for global/enterprise; expand vernacular coverage.

---

## 6. Positioning (one line)

> **Tier-0 rivals are outcomes-and-employer platforms that bolt on provider tools. The Indian field is
> booking apps with thin clinical depth. Bedrock already owns the hardest layers — clinical tooling,
> payouts/compliance, and a real 3-app ecosystem. To become tier-0 we must add the front-of-house
> systems that win: measurement-based outcomes, stepped care, intelligent triage, AI, and a B2B2C engine —
> and market the back-of-house excellence we already have.**

---

## 7. By user type (see `user-personas-and-roles.md`)

The tier-0 systems serve our **three user types** differently — winning means being best for all three:

| Tier-0 system | Client (Manam) | Therapist (Iragu+) | Bedrock Team (Ataraxia) |
|---|---|---|---|
| Outcomes / MBC | sees own progress | acts on caseload outcomes | **aggregate/program outcomes = the B2B/payer sales weapon** |
| Stepped care | routed to right level | matched to appropriate acuity | designs continuum + supply |
| Triage & matching | fast, right-fit match | gets well-matched clients | tunes matching/quality rules |
| Provider quality bar | trusts the network | meets the bar | **runs vetting/credentialing** |
| B2B2C / EAP | accesses as employee benefit | more referrals | sells + reports utilization/ROI |
| AI | 24/7 companion | note copilot saves hours | risk routing + content guardrails |
| Crisis & governance | protected/escalated | alerted + supported | owns escalation protocol |
| Trust & compliance | privacy + consent control | confidentiality tools | governs DPDP/audit |

> **Rivals are mostly single-persona** (SimplePractice = therapist-only; most D2C apps = client-only).
> **Our edge is serving all three on one platform** — a feature is only competitive when it's right for
> every persona that touches it.

---

### Caveats (read before external use)
- Bedrock scores are grounded in the current codebase; some 🟡 items are present-but-not-fully-wired
  (the in-flight cleanup/connect effort is making them real).
- Competitor scores/claims reflect general market knowledge to ~2026 and **must be verified** (outcomes
  figures, vetting %, feature specifics, pricing) before any board/investor/marketing use. Much tier-0
  enterprise data is not public.
- This is a strategy artifact, not a clinical or legal document.
