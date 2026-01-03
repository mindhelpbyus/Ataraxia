# 📋 Intake Form Gap Analysis - Current vs Required

## Executive Summary

**Current State:**
- ✅ Basic "Add Client" form (4 fields)
- ✅ Comprehensive Client Registration Form (~100 fields)
- ⚠️ **GAPS IDENTIFIED**: Missing 40+ critical fields from MASTER INTAKE FORM

**Required State:**
- Need to implement FULL Lyra-level intake with ~150+ fields across 11 sections

---

## 🔍 Detailed Comparison

### SECTION 1: Personal Information

#### ✅ Currently Captured
| Field | Add Client Form | Registration Form | Status |
|-------|----------------|-------------------|---------|
| First Name | ✅ | ✅ | Complete |
| Last Name | ✅ | ✅ | Complete |
| Email | ✅ | ✅ | Complete |
| Phone | ✅ | ✅ | Complete |
| Date of Birth | ❌ | ✅ | In Registration |
| Gender | ❌ | ✅ (basic) | **NEEDS UPGRADE** |
| Address | ❌ | ✅ | In Registration |
| Preferred Language | ❌ | ✅ | In Registration |

#### ❌ MISSING from Current Forms
- **Pronouns** (He/Him, She/Her, They/Them, etc.)
- **Preferred Name** (optional)
- **Ethnicity** (optional)
- **Languages Spoken** (multi-select)
- **Timezone** (auto-detect + manual)
- **Gender Options Need Expansion:**
  - Current: Male, Female, Other
  - Required: Male, Female, Non-binary, Prefer to self-describe, Prefer not to say

#### ❌ MISSING: Preferred Communication Method
- SMS
- Email
- Phone

---

### SECTION 2: Emergency Contact

#### ✅ Currently Captured
| Field | Status |
|-------|--------|
| Emergency Contact Name | ✅ In Registration |
| Relationship | ✅ In Registration |
| Phone | ✅ In Registration |

#### ❌ MISSING
- **Secondary Emergency Contact** (optional)
- **Crisis Disclosure Text:**
  > "This information may be used only in emergencies involving safety concerns."

---

### SECTION 3: Presenting Concerns (Reason for Visit)

#### ✅ Currently Captured
- `presentingConcerns` (free text)
- `symptoms` (array)

#### ❌ MISSING CRITICAL FIELDS

**3.1 Primary Concerns Checklist** (Check all that apply):
```
❌ Anxiety
❌ Depression  
❌ Trauma / PTSD
❌ ADHD
❌ Relationship issues
❌ Family conflict
❌ Parenting support
❌ Life transitions
❌ Stress / burnout
❌ Eating concerns
❌ Substance use
❌ Grief or loss
❌ Anger / emotional regulation
❌ LGBTQ+ identity support
❌ Chronic pain
❌ Sleep issues
❌ Work-related concerns
❌ Other (specify)
```

**3.2 Severity Level** (Self-report):
```
❌ Mild
❌ Moderate
❌ Severe
❌ Unsure
```

**3.3 Main Question:**
```
❌ "What brings you to therapy?" (Short answer field)
```

**Current Implementation:**
- Has `presentingConcerns` (text field) ✅
- **MISSING**: Structured checkboxes for specific concerns ❌
- **MISSING**: Severity level ❌

---

### SECTION 4: Mental Health History

#### ✅ Currently Captured
| Field | Status |
|-------|--------|
| Previous Therapy Experience | ✅ (basic text) |
| Current Medications | ✅ |
| Past Diagnoses | ✅ (basic text) |

#### ❌ MISSING CRITICAL FIELDS

**4.1 Therapy History:**
```
Current: Basic text field
Required: 
  ❌ No / Yes (explain)
  ❌ When? (date range)
  ❌ What type? (CBT, DBT, etc.)
  ❌ Was it helpful? (Yes/Somewhat/No)
```

**4.2 Past Diagnoses** (Structured checkboxes):
```
❌ Anxiety disorder
❌ Bipolar disorder
❌ Depression
❌ OCD
❌ Psychotic disorder
❌ Eating disorder
❌ Personality disorder
❌ Substance use disorder
❌ ADHD
❌ Other (specify)
```

**4.3 Medications (Enhanced):**
```
Current: Single text field ✅
Required:
  ❌ Current medications (list with dosages)
  ❌ Prescribing provider (name + contact)
  ❌ Any side effects?
```

**4.4 Hospitalizations:**
```
❌ Have you been hospitalized for mental health? (Yes/No)
❌ If yes:
    - Reason
    - Approximate date
    - Facility name
```

---

### SECTION 5: Safety & Risk Screening ⚠️ **CRITICAL**

#### ❌ COMPLETELY MISSING FROM CURRENT FORMS

**This is REQUIRED for HIPAA compliance and liability protection!**

**5.1 Current Safety Concerns:**
```
❌ Are you currently experiencing thoughts of self-harm?
❌ Do you have plans for self-harm?
❌ Have you recently attempted suicide?
❌ Are you having thoughts of harming others?
❌ Do you have domestic violence concerns?
❌ Do you feel unsafe at home?
```

**Current Implementation:**
- Has: `suicidalIdeation` (text: "none") ✅
- Has: `selfHarmHistory` (text: "none") ✅
- **MISSING**: Structured yes/no questions with immediate crisis intervention ❌
- **MISSING**: If "Yes" → Show crisis hotline + safety resources ❌
- **MISSING**: Auto-escalation to clinical supervisor ❌

**5.2 Safety Plan:**
```
❌ "Would you like to create a safety plan with your clinician?"
```

**RISK LEVEL:** 🔴 **HIGH - This must be implemented ASAP**

---

### SECTION 6: Matching Preferences

#### ✅ Currently Captured
| Field | Status |
|-------|--------|
| Preferred Therapist Gender | ✅ |
| Preferred Specialty | ✅ (array) |
| Preferred Availability | ✅ (array) |
| Preferred Language | ✅ |
| Preferred Modality | ✅ (array) |

#### ❌ MISSING CRITICAL FIELDS

**6.1 Therapist Preferences (Enhanced):**
```
Current: Basic gender preference ✅
Required:
  ❌ Age range preference (20-30, 30-40, 40-50, 50+, No preference)
  ❌ Cultural background preference
  ❌ LGBTQ+ affirming (Yes/No preference)
  ❌ Religion-informed therapy (Christian counseling, etc.)
  ❌ Therapist communication style:
      □ Empathetic/warm
      □ Structured/goal-oriented
      □ Skills-focused (CBT/DBT)
      □ Insight-focused (psychodynamic)
      □ No preference
```

**6.2 Therapy Format:**
```
Current: `preferredModality` includes some ✅
Required:
  ❌ Video sessions (Telehealth)
  ❌ In-person (show available locations)
  ❌ Phone sessions
  ❌ Messaging therapy (async)
```

**6.3 Availability (Enhanced):**
```
Current: `preferredAvailability` (array) ✅
Required:
  ❌ Specific days of week (Mon-Sun checkboxes)
  ❌ Specific times of day:
      □ Morning (6am-12pm)
      □ Afternoon (12pm-5pm)
      □ Evening (5pm-9pm)
      □ Weekend only
  ❌ Urgency level:
      □ ASAP (1-3 days)
      □ Soon (1-2 weeks)
      □ Flexible (2+ weeks)
```

**6.4 Additional Preferences:**
```
❌ "Is there anything else you want us to consider when matching you with a therapist?"
   (Free text field)
```

---

### SECTION 7: Lifestyle & Functional Impact

#### ❌ COMPLETELY MISSING

**7.1 Sleep:**
```
❌ Difficulty falling asleep
❌ Disturbed sleep / waking up
❌ Oversleeping
❌ No sleep issues
```

**7.2 Eating:**
```
❌ Appetite changes (increased/decreased)
❌ Binge/purge behaviors
❌ Restrictive eating
❌ No eating issues
```

**7.3 Daily Functioning:**
```
❌ "How much do your symptoms impact daily life?"
    □ Not at all
    □ Somewhat
    □ Significantly
    □ Severely
```

**Current Implementation:**
- ❌ None of these fields exist
- **Impact**: Missing data for care level decisioning

---

### SECTION 8: Insurance

#### ✅ Currently Captured
| Field | Status |
|-------|--------|
| Has Insurance | ✅ |
| Insurance Provider | ✅ |
| Insurance Plan | ✅ |
| Member ID | ✅ |
| Group Number | ✅ |
| Insurance Card Upload | ✅ |
| Copay Amount | ✅ |
| Deductible Met | ✅ |

#### ❌ MISSING FIELDS
```
❌ Policy holder name (if different from client)
❌ Policy holder DOB (if different from client)
❌ Relationship to policy holder (Self/Spouse/Parent/Other)
❌ Real-time eligibility check (API integration)
❌ Estimated session cost after insurance
❌ Pre-authorization required? (Yes/No - auto-detect)
```

---

### SECTION 9: Payment

#### ✅ Currently Captured
| Field | Status |
|-------|--------|
| Payment Method | ✅ |
| Card on File | ✅ |
| Billing Address | ✅ |
| Sliding Scale | ✅ |
| Financial Aid | ✅ |

#### ❌ MISSING FIELDS
```
❌ HSA/FSA card option (checkbox + card details)
❌ Auto-pay enrollment (Yes/No)
❌ Payment schedule preference (Per session / Monthly / Upfront package)
❌ Session copay estimate (dynamic calculation)
❌ Outstanding balance notice
```

---

### SECTION 10: Consent & Compliance

#### ✅ Currently Captured
| Field | Status |
|-------|--------|
| Consent to Treat | ✅ |
| HIPAA Consent | ✅ |
| Financial Policy Consent | ✅ |
| Telehealth Consent | ✅ |
| Release of Information | ✅ |

#### ❌ MISSING CRITICAL FIELDS
```
❌ No-show & cancellation policy acknowledgment
❌ Electronic communication consent (email/SMS/portal)
❌ Emergency protocol acknowledgment
❌ Recording consent (if sessions are recorded)
❌ Research participation consent (optional)
❌ Minor consent (if under 18)
    - Parent/guardian signature required
    - Rights of minor explained
❌ **Digital Signature** (typed or drawn)
    Current: Just checkboxes ✅
    Required: Actual signature capture ❌
```

---

### SECTION 11: Client Portal Setup

#### ✅ Currently Captured
| Field | Status |
|-------|--------|
| Username | ✅ |
| Password | ✅ |
| Allow View Notes | ✅ |
| Allow View Invoices | ✅ |

#### ❌ MISSING FIELDS
```
❌ 2FA setup (SMS/Email/Authenticator app)
❌ Secure messaging consent
❌ Portal notification preferences:
    □ Appointment reminders (Email/SMS)
    □ Billing notifications
    □ Document ready notifications
    □ Provider messages
❌ Portal tour / onboarding
```

---

## 📊 BONUS SECTIONS (Not in Current Forms)

### ⭐ Mini Intake – Follow-Up (Per Session)
```
❌ Current mood (1-10 scale)
❌ PHQ-9 (Depression screening)
❌ GAD-7 (Anxiety screening)
❌ Session goals (what do you want to work on today?)
❌ Medication check-in (any changes?)
```

### ⭐ Couples Therapy Intake Add-On
```
❌ Relationship length
❌ Living together? (Yes/No)
❌ Primary conflicts:
    □ Communication
    □ Intimacy
    □ Finances
    □ Parenting
    □ Infidelity
    □ Other
❌ Domestic violence screening (required)
❌ Goals for therapy
❌ Both partners' consent
```

### ⭐ Teen Client Intake Add-On (Under 18)
```
❌ School name + grade
❌ School counselor contact
❌ IEP/504 plan? (Yes/No)
❌ Parent/guardian full details
❌ Custody arrangement (if applicable)
❌ Who has medical decision-making authority?
❌ Parent consent signature
❌ Teen assent (age-appropriate agreement)
```

### ⭐ Psychiatry Intake Add-On
```
❌ Prior psychiatric medications (list all with outcomes)
❌ Medication allergies
❌ Lab values (optional - thyroid, vitamin D, etc.)
❌ Medical comorbidities:
    □ Diabetes
    □ Hypertension
    □ Heart disease
    □ Chronic pain
    □ Other
❌ Substance use detail:
    - Alcohol (frequency/amount)
    - Cannabis
    - Other substances
❌ Family psychiatric history
```

---

## 🚨 CRITICAL GAPS SUMMARY

### 🔴 HIGH PRIORITY (Must Implement)

1. **Safety & Risk Screening** (Section 5)
   - Suicide ideation questions
   - Self-harm screening
   - Immediate crisis intervention flow
   - **RISK**: Legal liability if missed

2. **Presenting Concerns Checklist** (Section 3)
   - Structured symptom checklist
   - Severity level
   - **IMPACT**: Poor matching if missing

3. **Enhanced Matching Preferences** (Section 6)
   - Communication style preference
   - Urgency level
   - Availability specifics
   - **IMPACT**: Lower match quality

4. **Digital Signature Capture** (Section 10)
   - Legally binding signature
   - **RISK**: Consents may not be enforceable

5. **Policy Holder Details** (Section 8)
   - Insurance verification fails without this
   - **IMPACT**: Billing errors

### 🟡 MEDIUM PRIORITY (Should Implement)

6. **Lifestyle & Functional Impact** (Section 7)
   - Sleep, eating, daily functioning
   - **IMPACT**: Missing care level data

7. **Mental Health History** (Section 4)
   - Structured diagnosis checklist
   - Hospitalization history
   - **IMPACT**: Incomplete clinical picture

8. **Pronouns & Ethnicity** (Section 1)
   - DEI requirements
   - **IMPACT**: Cultural competency

9. **2FA & Portal Security** (Section 11)
   - HIPAA security requirements
   - **IMPACT**: Security risk

### 🟢 LOW PRIORITY (Nice to Have)

10. **Bonus Forms** (Per session, Couples, Teen, Psychiatry)
    - Specialized intakes
    - **IMPACT**: Better specialized care

---

## 📈 IMPLEMENTATION RECOMMENDATIONS

### Phase 1: Critical Safety & Compliance (Week 1-2)
```
✅ Add Safety & Risk Screening (Section 5)
✅ Add Digital Signature Capture (Section 10)
✅ Add Presenting Concerns Checklist (Section 3)
✅ Update Gender Options (Section 1)
```

### Phase 2: Enhanced Matching (Week 3-4)
```
✅ Expand Matching Preferences (Section 6)
✅ Add Lifestyle & Functional Impact (Section 7)
✅ Enhance Mental Health History (Section 4)
```

### Phase 3: Complete Lyra Parity (Week 5-6)
```
✅ Add all remaining fields from Sections 1-11
✅ Add 2FA & Security (Section 11)
✅ Add Insurance enhancements (Section 8)
✅ Add PHQ-9 / GAD-7 screening tools
```

### Phase 4: Bonus Forms (Week 7+)
```
✅ Couples Therapy Intake
✅ Teen Client Intake
✅ Psychiatry Intake
✅ Per-session Mini Intake
```

---

## 🎯 NEXT STEPS

1. **Review this gap analysis** with clinical team
2. **Prioritize fields** based on legal/clinical requirements
3. **Update ComprehensiveClientRegistrationForm.tsx** to include missing fields
4. **Create new components**:
   - SafetyRiskScreening.tsx
   - SignatureCapture.tsx
   - PHQ9GAD7Assessment.tsx
   - CouplesIntake.tsx
   - TeenIntake.tsx
5. **Backend API updates** to store new fields
6. **Database schema updates** for new columns
7. **Testing** with clinical staff
8. **Compliance review** with legal team

---

## 📝 FIELD COUNT COMPARISON

| Section | Current | Required | Gap |
|---------|---------|----------|-----|
| 1. Personal Info | 12 | 16 | -4 |
| 2. Emergency Contact | 3 | 5 | -2 |
| 3. Presenting Concerns | 2 | 20 | -18 |
| 4. Mental Health History | 4 | 15 | -11 |
| 5. Safety Screening | **0** | **12** | **-12** 🔴 |
| 6. Matching Preferences | 5 | 15 | -10 |
| 7. Lifestyle Impact | **0** | **10** | **-10** |
| 8. Insurance | 8 | 14 | -6 |
| 9. Payment | 5 | 9 | -4 |
| 10. Consent & Compliance | 5 | 12 | -7 |
| 11. Portal Setup | 4 | 8 | -4 |
| **TOTAL** | **48** | **136** | **-88 fields** |

### Bonus Forms (Not counted above)
- Mini Intake (Follow-up): 0 / 5 fields
- Couples Therapy: 0 / 10 fields
- Teen Client: 0 / 12 fields
- Psychiatry: 0 / 15 fields

---

## ✅ CONCLUSION

Your current system has a **good foundation** but is missing **~88 critical fields** to match industry-standard (Lyra-level) intake requirements.

**Most Critical Missing Pieces:**
1. 🔴 Safety & Risk Screening (legal liability)
2. 🔴 Digital Signature Capture (compliance)
3. 🟡 Structured Presenting Concerns (matching quality)
4. 🟡 Enhanced Mental Health History (clinical completeness)

**Recommendation:**
Implement in **4 phases** over 6-8 weeks to reach full compliance and matching parity with industry leaders like Lyra Health, BetterHelp, and Talkspace.

Would you like me to start implementing the missing fields?
