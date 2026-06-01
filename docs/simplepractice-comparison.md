# Bedrock Health vs. SimplePractice — Deep Feature Comparison

> Dedicated, feature-by-feature comparison. SimplePractice is the gold-standard **behavioral-health
> practice-management + EHR** (US, provider-side). It's the closest benchmark to **Iragu+ (clinician app)
> + Ataraxia (web admin/CRM)**, and its public help center is effectively a *completeness spec* for a
> provider platform — so this doc maps what they have, what we have, who's better on each, and exactly
> what to take from them.
>
> "Us" = Manam (patient app) + Iragu+ (clinician app) + Ataraxia (web) + backends. Status: ✅ have ·
> 🟡 partial · ❌ gap. ⚠️ SimplePractice features are from public knowledge (≤2026) — verify before external use.

Created 2026-05-31.

---

## 0. The headline (read this first)

SimplePractice and Bedrock are **not the same kind of product**:

| | SimplePractice | Bedrock |
|---|---|---|
| Type | **Provider-only EHR/practice tool** (solo & group practices) | **Two-sided marketplace + clinical platform** (patients ↔ therapists) |
| Demand | ❌ none (providers bring their own clients; Monarch is just a directory) | ✅ consumer app (discovery, booking, engagement) |
| Money | Client billing + **US insurance claims** | **Marketplace payouts (RazorpayX) + TDS + RBI invoicing + ledger** |
| Geography | US (insurance-centric) | India-first (Razorpay, RBI, DPDP, vernacular) |
| Pricing | Per-clinician SaaS subscription | Marketplace/transaction + platform |

➡️ **We win the marketplace, money-movement, consumer-engagement, and India layers. They win clinical
documentation depth, client-portal completeness, and operational polish.** The play: take their
provider-documentation excellence onto our marketplace + payments + consumer base.

---

## 1. Feature-by-feature

### Scheduling & calendar
| Feature | SimplePractice | Bedrock | Better | Notes |
|---|---|---|---|---|
| Calendar (day/week/month) | ✅ | ✅ (Ataraxia + Iragu+) | = | |
| Availability / slot mgmt | ✅ | ✅ (availability/slots/leave) | = | |
| **Online self-booking widget** (embed on provider's own site) | ✅ | 🟡 (booking in Manam, not embeddable widget) | SP | We book in-app; they let providers embed booking anywhere |
| **Appointment reminders** (SMS/email/voice) | ✅ | ❌ | **SP** | No-show reducer — we lack a reminder engine |
| Recurring appointments | ✅ | 🟡 | SP | |
| **Waitlist** | ✅ | ❌ | SP | |
| Two-way calendar sync (Google/iCal) | ✅ | ❌ | SP | |
| Cancellation/no-show policy enforcement | ✅ | 🟡 | SP | |

### Documentation / EHR (their core strength)
| Feature | SimplePractice | Bedrock | Better | Notes |
|---|---|---|---|---|
| Session/progress notes | ✅ | ✅ (clinical-notes: sign, addendum, diagnosis) | = | We're solid here |
| **Note template library** (SOAP/DAP/BIRP) + custom builder | ✅ | ❌ | **SP** | We have notes, not templates |
| **Treatment plans** (goals/objectives/interventions) | ✅ | ❌ | **SP** | Structured, trackable plans — gap |
| Diagnosis (ICD-10) | ✅ | 🟡 (diagnosis route) | ≈ | |
| **Assessment library + auto-scoring + tracking (MBC)** | ✅ | 🟡 (questionnaires in Manam, no scoring/library/trend) | **SP** | Also a tier-0 system |
| Intake forms | ✅ | ✅ (intake-forms) | = | |
| **E-signature** on intake/consent | ✅ | ❌ | **SP** | Gap |
| Group therapy notes | ✅ | ❌ | SP | |
| Wiley treatment planners / content | ✅ | ❌ | SP | Licensed content lib |

### Client portal & communication
| Feature | SimplePractice | Bedrock | Better | Notes |
|---|---|---|---|---|
| Secure client messaging | ✅ | ✅ (AppSync/WebSocket chat) | = | |
| **Document storage & sharing** to client | ✅ | 🟡 (files/upload, not portal-grade sharing) | SP | |
| Client self-scheduling | ✅ | 🟡 | SP | |
| **Patient mobile app w/ engagement** (mood, journal, wellness, breathing) | 🟡 (basic client app) | ✅✅ (Manam) | **US** | We're far ahead on consumer engagement |
| Reviews / ratings | 🟡 (Monarch) | ✅ (Manam reviews) | US | |

### Telehealth
| Feature | SimplePractice | Bedrock | Better | Notes |
|---|---|---|---|---|
| HIPAA/secure video | ✅ | ✅ (Zoom SDK + LiveKit) | = | |
| Waiting room | ✅ | 🟡 | SP | |
| Group telehealth | ✅ | 🟡 | SP | |
| Session recording + consent | 🟡 | 🟡 (routes exist, consent UI TODO) | = | |

### Billing & money
| Feature | SimplePractice | Bedrock | Better | Notes |
|---|---|---|---|---|
| Card processing / AutoPay / card-on-file | ✅ | ✅ (Razorpay) | = | |
| Invoices / statements | ✅ | ✅ | = | |
| **US insurance claims** (CMS-1500, ERA, clearinghouse, superbills) | ✅ | ❌ (US-specific, N/A India) | SP (not relevant) | India cashless = future |
| **Therapist payouts** (marketplace) + **TDS** | ❌ | ✅✅ (RazorpayX + TDS) | **US** | They don't pay providers; we run a marketplace |
| **RBI sequential invoicing + double-entry ledger + reconciliation** | ❌ | ✅✅ | **US** | Enterprise-grade money infra |
| Refunds / disputes / wallet | 🟡 | ✅ | US | |

### Practice growth / marketing
| Feature | SimplePractice | Bedrock | Better | Notes |
|---|---|---|---|---|
| **Professional website builder** | ✅ | ❌ | SP | Provider acquisition tool |
| **Directory / discovery marketplace** | ✅ (Monarch) | 🟡 (Manam discovery, no provider-facing directory product) | ≈ | We have demand; need provider profiles/SEO |
| **Consumer demand generation** | ❌ | ✅✅ (whole patient app) | **US** | Their biggest weakness |
| **Lead inbox** (marketplace leads → providers) | ❌ | ✅ (Iragu+ lead_inbox) | US | |

### Group practice & supervision
| Feature | SimplePractice | Bedrock | Better | Notes |
|---|---|---|---|---|
| Roles & permissions | ✅ | ✅ (RBAC/Cognito groups) | = | |
| **Supervision / co-sign** (interns/supervisees) | ✅ | ❌ | SP | Needed for clinics/training orgs |
| Multi-clinician / org admin | ✅ | ✅ (admin/org views) | = | |

### AI & automation
| Feature | SimplePractice | Bedrock | Better | Notes |
|---|---|---|---|---|
| **AI note-taking** (session → draft note) | ✅ | ❌ (roadmap MVP1) | SP | Highest-ROI steal |
| AI triage / matching / companion | ❌ | ❌ (roadmap) | = | Neither; our chance to leap both |

### Compliance / trust
| Feature | SimplePractice | Bedrock | Better | Notes |
|---|---|---|---|---|
| HIPAA + BAA (US) | ✅ | 🟡 (only if US) | SP (US) | |
| **DPDP / India + PII encryption + MFA + RBI** | ❌ (not India) | ✅ | **US** | We own India compliance |

---

## 2. Best & worst

### Where WE are BEST (protect + market these)
1. **Two-sided marketplace** — consumer demand + provider supply. SimplePractice has *no* demand engine.
2. **Marketplace money infra** — therapist payouts (RazorpayX), TDS, RBI sequential invoicing, double-entry ledger, reconciliation. They bill clients; they don't *pay providers*.
3. **Consumer engagement** — Manam's mood, journal, wellness metrics, breathing, in-app assessments, reviews. Their client app is thin.
4. **India fit** — Razorpay, RBI localization, DPDP, vernacular questionnaires.
5. **Native patient + clinician apps + AI-ready backends** (Bedrock/Claude) — platform breadth.

### Where WE are WORST vs them (the gaps to close)
1. **Documentation depth** — no note-template library, no treatment plans. (We have notes; not the *system*.)
2. **Measurement-based care** — assessments captured but **not scored/tracked** over time.
3. **Client portal completeness** — no e-signature, weaker document sharing, no embeddable self-booking widget.
4. **Appointment reminders** — none → avoidable no-shows.
5. **Supervision / co-sign** — blocks clinics & training institutions.
6. **AI note-taking** — they ship it; we don't (yet).
7. **Operational polish** — years of EHR refinement; reminders, waitlist, calendar sync, group sessions.

### Where THEY are WORST (our opening)
1. **Provider-only** — no consumer acquisition; providers must bring clients.
2. **US-insurance-bound** — irrelevant/awkward outside the US.
3. **No outcomes/AI/B2B2C platform** — not a tier-0 care platform, a practice tool.
4. **No marketplace / payouts** — can't run a network of therapists.
5. **Per-seat SaaS pricing** — expensive for solo Indian therapists; a marketplace model fits India better.

---

## 3. Features to GET from SimplePractice (prioritized: value vs cost)

Cost: **S** days–2wk · **M** 3–6wk · **L** 1–2 quarters.

| # | Feature to take | Why (benefit) | Cost | We have foundation? | Phase |
|---|-----------------|---------------|------|---------------------|-------|
| 1 | **AI note-taking** (session → draft SOAP/DAP) | Saves clinicians hours → provider retention; flagship | M | ✅ notes + Bedrock/Claude | MVP1 |
| 2 | **Note template library** + custom builder | Faster, consistent documentation | M | ✅ clinical-notes | MVP1 |
| 3 | **Treatment plans** (goals/objectives + progress) | Clinical structure + outcome tracking | M | 🟡 notes | MVP1 |
| 4 | **Assessment library + auto-scoring + trend** (MBC) | Powers outcomes (tier-0 T1) + standalone product | M | 🟡 Manam questionnaires | MVP1 |
| 5 | **Appointment reminders** (SMS/email/push) | Cuts no-shows → direct revenue | S–M | 🟡 notifications/FCM | MVP1 |
| 6 | **Intake/consent + e-signature** | Compliance (DPDP consent) + smoother onboarding | M | ✅ intake-forms | MVP1 |
| 7 | **Client self-booking widget + waitlist** | Conversion + fill empty slots | M | ✅ booking | MVP1→MVP2 |
| 8 | **Document sharing in client portal** | Share reports/worksheets securely | S–M | 🟡 files | MVP2 |
| 9 | **Supervision / co-sign** workflow | Unlocks clinics + training institutes | M | ✅ RBAC | MVP2 |
| 10 | **Group therapy sessions + notes** | New modality + supply efficiency | M | 🟡 video | MVP2 |
| 11 | **Two-way calendar sync** (Google/iCal) | Provider convenience/retention | S–M | — | MVP2 |
| 12 | **Provider website/profile + SEO** (Monarch-style) | Free acquisition channel | M | 🟡 discovery | MVP2 |
| 13 | **E-prescribing** | Enables psychiatry tier (stepped care) | M (integration) | ❌ | MVP2/Launch |
| 14 | **Insurance/cashless claims** (India) | When India ecosystem matures | L | ✅ billing infra | Launch |

**Top 6 (do first, MVP1):** AI notes · note templates · treatment plans · assessment library+scoring ·
reminders · intake e-signature. These close the documentation/portal gap *and* feed the tier-0 outcomes
+ AI systems — double value.

---

## 4. One-line verdict

> **SimplePractice is the best provider tool with no marketplace. We're the best marketplace with a
> good-but-incomplete provider tool.** Take their documentation excellence (templates, treatment plans,
> assessment scoring, e-sign, reminders, AI notes) onto our marketplace + payouts + consumer engagement +
> India compliance, and we're a product neither they nor the 16 Indian/global rivals can match.

---

## 5. By user type (see `user-personas-and-roles.md`)

The deepest contrast with SimplePractice **is** the persona coverage:

| | Client (Manam) | Therapist (Iragu+) | Bedrock Team (Ataraxia) |
|---|---|---|---|
| **SimplePractice serves** | thin client portal only | ✅ full (it's a therapist tool) | ✅ practice owner/admin |
| **Bedrock serves** | ✅✅ full consumer app | ✅ (closing doc-depth gap) | ✅✅ platform ops + marketplace |

What the SimplePractice "features to get" deliver **per persona**:
- **AI notes, note templates, treatment plans, supervision/co-sign** → primarily **Therapist** (time saved, structure) + **Bedrock** (quality/QA oversight).
- **Assessment library + scoring** → **Client** (takes + sees progress) + **Therapist** (acts) + **Bedrock** (aggregate outcomes).
- **Reminders, intake e-sign, self-booking, document sharing** → **Client** convenience + **Therapist** fewer no-shows + **Bedrock** compliance (consent) + ops metrics.
- **Provider website/SEO, directory** → **Therapist** growth + **Bedrock** supply/acquisition.

> SimplePractice is **single-persona (therapist)**. We must take its therapist-side excellence *without
> losing* our client + Bedrock-team coverage — that 3-persona span is the whole advantage.

### Caveats
- SimplePractice features are public-knowledge (≤2026); verify specifics/pricing before external use.
- "Us" status reflects the current codebase; some 🟡 items are present-but-not-fully-wired.
