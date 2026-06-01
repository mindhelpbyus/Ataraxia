# Bedrock Health — Compliance, Security & Standards

> Single reference for every compliance/security standard relevant to the platform (Manam, Iragu+,
> Ataraxia + backends backend-initial / billing_payment / video-service). Covers data privacy (DPDP India,
> IT Act/SPDI), payments (PCI-DSS, RBI), PII protection, healthcare/clinical (Mental Healthcare Act,
> Telemedicine Guidelines, EHR/ABDM, HIPAA), and certifications (ISO 27001/27701/27017/27018, SOC 2, HITRUST).
>
> Status legend: ✅ have · 🟡 partial · ❌ gap. Phase = MVP1 / MVP2 / Launch (see `tier0-roadmap.md`).
>
> ⚠️ **NOT legal advice.** This is an engineering/product compliance map. Engage qualified privacy counsel,
> a clinical-compliance advisor, and accredited auditors (ISO/SOC 2/HITRUST) before certification or launch.

Created 2026-05-31. Owner: security/compliance.

---

## 0. Why this is strategic (not just a checklist)

For a **tier-0** mental-health platform handling the most sensitive data class (mental-health PHI) **and**
money (payments + therapist payouts), compliance is a **sales asset and a moat**:
- Enterprise/EAP buyers (the tier-0 revenue core) **require** SOC 2 / ISO / data-handling attestations.
- Mental-health data is "sensitive personal data" under DPDP & IT Act → highest obligations.
- Payments + payouts → PCI-DSS + RBI localization.
- We already built strong primitives — **certifying and documenting them turns engineering into trust.**

---

## 1. What we already have (verified in code)

| Control | Where | Standard it supports |
|---|---|---|
| **AES-256-GCM field-level PII encryption** | `billing_payment/src/lib/piiEncryption.js`, `keyManager.js` | DPDP, IT Act SPDI, PCI, ISO 27001 |
| **Quarterly encryption key rotation** (multi-version key store) | `keyManager.js` + key-rotation Lambda | PCI-DSS, ISO 27001 |
| **KMS + S3 server-side encryption** (encrypted invoice PDFs) | billing infra | PCI, ISO 27017/27018 |
| **AWS Secrets Manager** for credentials | `secretsManager.js` | ISO 27001, SOC 2 |
| **AWS Cognito auth + JWT + TOTP MFA** | backend-initial auth-stack; Ataraxia `lib/cognito.ts` | SOC 2, ISO 27001, HIPAA access control |
| **RBAC** (roles/groups: Admin/Therapist/Client) | Cognito groups + app RBAC | HIPAA minimum-necessary, ISO 27001 |
| **DPDP data-erasure** (right to erasure) | `billing_payment/src/lib/dpdpErasure.js` | **DPDP Act 2023** |
| **Append-only access/audit logs** (e.g. `InvoiceAccessLog`, `DocNumberAudit`) | billing schema | DPDP, HIPAA audit, SOC 2 |
| **RBI sequential document numbering** (gapless per-FY) | `DocNumberSequence` / `DocNumberAudit` | RBI / tax compliance |
| **Webhook signature verification** (Razorpay HMAC) | `lambda-webhooks.js` | PCI, integrity |
| **Rate limiting + idempotency** | `rateLimiter.js`, `idempotency.js` | SOC 2 availability/integrity |
| **Data residency in India** (`ap-south-1`) | all infra | **RBI localization, DPDP** |
| **No card data stored** (Razorpay tokenization) | payment integration | **PCI-DSS scope reduction (SAQ-A)** |
| **TLS in transit; CSP on web** | gateways + `index.html` CSP | ISO 27001, OWASP |

**Honest read:** we have a **strong technical base** (encryption, key mgmt, auth/MFA, audit, erasure,
localization). The gaps are mostly **formal certification, documented policies/processes, clinical-reg
specifics, and breach/BCP governance** — not missing crypto.

---

## 2. Standards matrix (status + priority)

| Standard | Scope / applies to | Status | Key gap | Phase |
|---|---|---|---|---|
| **DPDP Act 2023 (India)** | All personal data of Indian users | 🟡 | Consent manager, notice, grievance officer, breach-notification process, DPIA | MVP1→Launch |
| **IT Act 2000 + SPDI Rules 2011** | Sensitive personal data (health) | 🟡 | Privacy policy + reasonable-security-practices attestation | MVP1 |
| **PCI-DSS** | Card payments | 🟡 (SAQ-A eligible via Razorpay) | Formal SAQ-A, no-card-storage attestation, scope doc | MVP1 |
| **RBI payment data localization** | Payment data | ✅ (ap-south-1) | Document + confirm processor compliance | MVP1 |
| **Mental Healthcare Act 2017 (India)** | Mental-health care delivery | ❌ | Confidentiality, consent, advance directives, rights handling | MVP1→MVP2 |
| **Telemedicine Practice Guidelines 2020 (India)** | Teleconsultation | 🟡 | Practitioner ID/registration display, consent, record-keeping, Rx rules | MVP1 |
| **EHR Standards India 2016 / ABDM** | Health records interoperability | ❌ | FHIR/SNOMED alignment; optional ABDM (ABHA) integration | Launch |
| **HIPAA (US)** | PHI (if US/global) | 🟡 | BAA, full Privacy/Security Rule controls — only if US expansion | Launch (if US) |
| **ISO/IEC 27001** | Information Security Mgmt System | ❌ (controls exist, no cert) | ISMS, policies, risk register, internal audit, certification | Launch |
| **ISO/IEC 27701** | Privacy Info Mgmt (PIMS) extension | ❌ | Privacy controls layered on 27001 | Launch |
| **ISO/IEC 27017 / 27018** | Cloud security / cloud PII | 🟡 (AWS provides base) | Document shared-responsibility + our controls | Launch |
| **SOC 2 Type II** | Trust Services (security/availability/confidentiality) | ❌ | Controls evidence over observation window + auditor | Launch (enterprise gate) |
| **HITRUST CSF** | Healthcare security (enterprise/US) | ❌ | Optional; map after SOC 2 | Post-Launch (if needed) |
| **WCAG 2.2 AA** | Accessibility | 🟡 | Audit + remediation across apps | MVP2 |
| **OWASP ASVS / pentest** | App security | 🟡 | Formal pentest + remediation cadence | MVP1 |

---

## 3. By domain

### 3.1 Data Privacy — DPDP Act 2023 (India) — primary regime
Mental-health data is sensitive; DPDP obligations are high. Required:
- [ ] **Consent management** — explicit, purpose-bound, withdrawable consent (consent artifact + audit). Pair with the in-app consent/e-sign work (roadmap MVP1-F).
- [ ] **Privacy notice** — clear, itemized purpose of processing, in plain language + vernacular.
- [ ] **Data principal rights** — access, correction, **erasure** (✅ `dpdpErasure.js`), grievance redressal, nomination.
- [ ] **Grievance Officer** + published contact + SLA.
- [ ] **Breach notification** process (to Data Protection Board + affected principals).
- [ ] **Data minimization + retention schedule** (don't keep PHI longer than needed).
- [ ] **DPIA** (Data Protection Impact Assessment) for high-risk processing.
- [ ] **Children's data** — verifiable parental consent for under-18 (relevant for youth mental health).

### 3.2 Payments — PCI-DSS + RBI
- [x] **No card data stored** — Razorpay tokenization keeps us in **SAQ-A** (lowest scope). ✅
- [ ] Complete + file **SAQ-A**; document the cardholder-data-environment scope (effectively none).
- [x] **RBI data localization** — payment data in `ap-south-1`. ✅ → document it.
- [x] **RBI sequential invoicing** — gapless doc numbering + audit. ✅
- [ ] Confirm **payout/KYC** (RazorpayX) flows meet RBI/KYC norms; TDS already handled. 🟡
- [ ] PCI controls we already meet to document: encryption, key rotation, access control, logging, webhook signature integrity.

### 3.3 Healthcare / Clinical regulation (India)
- **Mental Healthcare Act 2017:** confidentiality of records, informed consent, capacity, advance directives, non-discrimination, rights of persons with mental illness. → encode consent + confidentiality + access controls; clinician obligations in workflow.
- **Telemedicine Practice Guidelines 2020:** display practitioner registration/identity, patient consent to teleconsult, maintain records, e-prescription rules (controlled-substance limits), identification of patient. → relevant to video sessions + (future) psychiatry tier.
- **EHR Standards 2016 / ABDM:** if interoperability/ABHA linkage is pursued — adopt FHIR R4 + SNOMED CT/LOINC; optional but a differentiator for enterprise/government.
- **HIPAA:** only if serving US members — then BAAs with all processors + full Security/Privacy Rule. Defer unless US expansion.

### 3.4 Security architecture (cross-standard)
- [x] Encryption at rest (AES-256-GCM PII, KMS/S3) + in transit (TLS). ✅
- [x] Key management + quarterly rotation; never delete old key versions. ✅
- [x] Auth: Cognito + JWT + **TOTP MFA**; default-deny API gateway. ✅
- [x] RBAC + minimum-necessary access. ✅
- [ ] **Centralized audit logging + tamper-evidence** across all services (extend existing append-only logs).
- [ ] **Secrets hygiene** — confirm no secrets in code/logs; rotate; least-privilege IAM review.
- [ ] **PHI-safe logging** — never log PHI/response bodies (web client already enforces; verify backends).
- [ ] **Pentest + OWASP ASVS** review; remediation cadence.
- [ ] **Vulnerability mgmt** — dependency scanning (the apps have large dep trees), patch SLA.

### 3.5 Operational / governance (needed for SOC 2 / ISO)
- [ ] Written **security policies** (access, encryption, incident response, change mgmt, vendor risk).
- [ ] **Incident response plan** + breach runbook + tabletop drills.
- [ ] **BCP / Disaster Recovery** — backups, RTO/RPO, multi-AZ, restore tests.
- [ ] **Vendor/sub-processor register** (AWS, Razorpay, Zoom, LiveKit, FCM/APNs) + DPAs.
- [ ] **Access reviews** (periodic), offboarding, audit-log review cadence.
- [ ] **Risk register** + management review (ISO 27001 core).
- [ ] **Data-flow + data-inventory map** (what PII/PHI, where, why, retention).

---

## 4. Phased compliance roadmap

**MVP1 — legal-to-operate in India + sales hygiene**
- DPDP essentials: consent management, privacy notice (+vernacular), grievance officer, breach process, retention schedule.
- PCI **SAQ-A** filed; RBI localization + invoicing documented.
- Telemedicine Guidelines basics: practitioner identity/consent/records in the session flow.
- Mental Healthcare Act: confidentiality + informed consent encoded.
- Security: PHI-safe-logging verification, secrets/IAM review, dependency scanning, first pentest.
- Publish data-inventory + data-flow map.

**MVP2 — harden + privacy-by-design**
- DPIA; children's-data consent; data-minimization passes.
- WCAG 2.2 AA audit + remediation.
- Incident response + BCP/DR with restore tests; vendor register + DPAs.
- Begin **ISO 27001** ISMS + policy set (foundation for certs).

**Launch-Ready — enterprise certifications (the EAP/payer gate)**
- **SOC 2 Type II** (the enterprise dealbreaker) — controls + observation window + audit.
- **ISO 27001** (+27701/27017/27018) certification.
- HITRUST and/or HIPAA **only if US/enterprise demand**; ABDM/EHR interoperability if pursuing govt/health-system integration.
- Outcome-based-contract data governance.

---

## 5. Standards → who requires it (so we sequence by deal value)

| If we sell to… | They'll ask for… |
|---|---|
| Indian consumers (D2C) | DPDP compliance, privacy notice, secure payments |
| Indian employers (EAP) | DPDP + SOC 2 (often) + data-handling attestation + BCP |
| Hospitals / clinics (white-label) | ISO 27001, clinical-reg adherence, possibly ABDM/EHR |
| US / global enterprise | SOC 2 Type II + HIPAA (BAA) + HITRUST |
| Payers / outcome-based | All above + audited outcomes data governance |

---

---

## 6. By user type — data, consent & access (see `user-personas-and-roles.md`)

Compliance obligations differ per persona; RBAC + minimum-necessary enforce them.

| Concern | Client (Manam) | Therapist (Iragu+) | Bedrock Team (Ataraxia) |
|---|---|---|---|
| **Consent (DPDP)** | gives explicit, withdrawable consent to processing + teleconsult | gives clinician terms; records client consent | **manages consent artifacts, grievance officer, breach process** |
| **Data they access** | own data only | own + assigned clients only (minimum-necessary) | role-gated, **PHI access audited with reason** |
| **Erasure / rights** | request access/correction/erasure | own data | **honors + logs** (DPDP rights handling) |
| **Card/payment data** | own (tokenized; never stored by us) | ❌ no card access | ❌ PCI scope-minimized; ops see payouts not cards |
| **Clinical confidentiality (MHA 2017)** | protected; controls sharing | upholds; notes clinician-private | governs; no casual PHI access |
| **MFA / account security** | enabled | enabled | enforced + reviewed |
| **Crisis data (C-SSRS)** | protected; triggers help | alerted, acts | escalation oversight + audit |
| **Audit logging** | sees own activity (optional) | sees own | full audit-log review cadence |

> **Separation of duties:** money operations (payouts/reconciliation) and PHI access are role-separated;
> the Bedrock team's elevated access is the most audited. Org Admins (future B2B persona) get only
> **aggregated/anonymized** utilization — never member-level PHI.

### Caveats
- This maps standards to our architecture; it is **not legal or clinical-regulatory advice**.
- Certification (ISO/SOC 2/HITRUST) requires accredited external auditors and an evidence/observation period.
- India healthcare + privacy law is evolving (DPDP rules still maturing) — confirm current requirements with counsel before any compliance claim, marketing statement, or contract.
- "✅ have" reflects technical controls in code; formal compliance also needs documented policy + process + evidence.
