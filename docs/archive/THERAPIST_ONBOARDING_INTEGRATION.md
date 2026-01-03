# 🔧 Therapist Onboarding - Integration Guide

## ✅ EXISTING SYSTEM FOUND

You already have a **complete therapist onboarding system** at:
- `/components/onboarding/TherapistOnboarding.tsx` (7 steps)
- `/components/TherapistOnboardingDemo.tsx` (wrapper)
- `/types/onboarding.ts` (TypeScript interfaces)

**✅ DO NOT DUPLICATE** - We'll extend the existing system!

---

## 📊 Current vs Required Fields

### ✅ Already Implemented (32 fields)

| Field | Current Location | Status |
|-------|-----------------|--------|
| **Step 1: Signup (5 fields)** |
| Full Name | OnboardingStep1Signup | ✅ |
| Email | OnboardingStep1Signup | ✅ |
| Phone Number | OnboardingStep1Signup | ✅ |
| Country Code | OnboardingStep1Signup | ✅ |
| Password | OnboardingStep1Signup | ✅ |
| **Step 2: Verification (2 fields)** |
| Verification Code | OnboardingStep2Verification | ✅ |
| Is Verified | OnboardingStep2Verification | ✅ |
| **Step 3: Personal Details (9 fields)** |
| Profile Photo | OnboardingStep3PersonalDetails | ✅ |
| Gender | OnboardingStep3PersonalDetails | ✅ |
| Date of Birth | OnboardingStep3PersonalDetails | ✅ |
| Country | OnboardingStep3PersonalDetails | ✅ |
| State | OnboardingStep3PersonalDetails | ✅ |
| City | OnboardingStep3PersonalDetails | ✅ |
| Languages | OnboardingStep3PersonalDetails | ✅ |
| Timezone | OnboardingStep3PersonalDetails | ✅ |
| Terms Accepted | OnboardingStep3PersonalDetails | ✅ |
| **Step 4: Credentials (6 fields)** |
| Highest Degree | OnboardingStep4Credentials | ✅ |
| Institution Name | OnboardingStep4Credentials | ✅ |
| Graduation Year | OnboardingStep4Credentials | ✅ |
| Years of Experience | OnboardingStep4Credentials | ✅ |
| Specializations | OnboardingStep4Credentials | ✅ |
| Bio | OnboardingStep4Credentials | ✅ |
| **Step 5: License (6 fields)** |
| License Number | OnboardingStep5License | ✅ |
| Licensing Authority | OnboardingStep5License | ✅ |
| License Expiry Date | OnboardingStep5License | ✅ |
| License Document | OnboardingStep5License | ✅ |
| Government ID | OnboardingStep5License | ✅ |
| Information Accurate | OnboardingStep5License | ✅ |
| **Step 6: Availability (5 fields)** |
| Weekly Schedule | OnboardingStep6Availability | ✅ |
| Session Durations | OnboardingStep6Availability | ✅ |
| Break Time | OnboardingStep6Availability | ✅ |
| Session Types | OnboardingStep6Availability | ✅ |
| Supported Languages | OnboardingStep6Availability | ✅ |

**Total Current: 32 fields** ✅

---

## 🆕 Missing Fields to Add (100 fields)

### Critical for AI Matching

| Field Category | Fields Missing | Where to Add |
|----------------|----------------|--------------|
| **License Details** | License type, Issuing state, Additional states, NPI, DEA | Step 5 (expand) |
| **Clinical Specialties** | 20 specialties (Anxiety, Depression, etc.) | NEW Step 4B or expand Step 4 |
| **Life Context** | 11 contexts (Immigrants, BIPOC, Veterans, etc.) | NEW Step 4C or expand Step 4 |
| **Therapeutic Modalities** | 18 modalities (CBT, DBT, EMDR, etc.) | NEW Step 4D or expand Step 4 |
| **Personal Style** | 8 styles (Warm, Direct, LGBTQ+ affirming, etc.) | NEW Step 4E or expand Step 4 |
| **Demographics** | 14 preferences (Kids, Teens, Couples, etc.) | NEW Step 6B or expand Step 6 |
| **Insurance** | 6 fields (panels, Medicaid, Medicare, etc.) | NEW Step 7B (before review) |
| **Operational** | 7 fields (max caseload, crisis capability, etc.) | NEW Step 6C or expand Step 6 |
| **Compliance** | 4 additional (HIPAA, BAA, background check, W9) | Expand Step 5 |
| **Profile** | Extended bio, client expectations, approach | Expand Step 4 bio |

---

## 🎯 Recommended Integration Strategy

### Option 1: Expand Existing Steps (Easiest)

Keep 7 steps, add more fields to each:

```
Step 1: Signup ✅ (no changes)
Step 2: Verification ✅ (no changes)
Step 3: Personal Details ✅ (no changes)
Step 4: Credentials → ADD:
  - Clinical Specialties (20 checkboxes)
  - Life Context (11 checkboxes)
  - Therapeutic Modalities (18 checkboxes)
  - Personal Style (8 checkboxes)
  - Extended bio, approach, client expectations
Step 5: License → ADD:
  - License type dropdown
  - Issuing state
  - Additional states
  - NPI number
  - DEA number (optional)
  - HIPAA training checkbox
  - Signed BAA checkbox
  - Background check checkbox
  - W9 upload
Step 6: Availability → ADD:
  - Demographics (14 checkboxes)
  - New client capacity (number)
  - Max caseload (number)
  - Emergency same-day capacity (boolean)
  - Session formats (Video, In-person, Phone, Messaging)
  - Max daily sessions
  - Preferred communication style
  - Crisis response capability
Step 7: Review → ADD:
  - Insurance section BEFORE review:
    - Insurance panels (multi-select)
    - Medicaid acceptance
    - Medicare acceptance
    - Self-pay
    - Sliding scale
    - EAP programs
```

**Time to Implement:** 2-3 days

---

### Option 2: Add More Steps (More organized)

Expand from 7 to 12 steps:

```
Step 1: Signup ✅
Step 2: Verification ✅
Step 3: Personal Details ✅
Step 4: Credentials ✅
Step 5: Clinical Specialties 🆕
Step 6: Therapeutic Modalities 🆕
Step 7: Personal Style & Demographics 🆕
Step 8: License & Compliance (expanded) 🆕
Step 9: Availability (expanded) 🆕
Step 10: Insurance & Billing 🆕
Step 11: Operational Preferences 🆕
Step 12: Review & Submit ✅
```

**Time to Implement:** 4-5 days

---

## 🔧 Implementation Steps

### Phase 1: Update TypeScript Interface

Edit `/types/onboarding.ts`:

```typescript
export interface OnboardingData {
  // EXISTING FIELDS (keep all 32)
  fullName: string;
  email: string;
  // ... all existing fields ...
  
  // 🆕 ADD THESE FIELDS:
  
  // A. Extended Identity (from Step 3)
  firstName: string;
  lastName: string;
  middleName?: string;
  preferredName?: string;
  address?: string;
  zipCode?: string;
  languagesForSessions: string[]; // Which languages can conduct sessions in
  
  // B. License Details (expand Step 5)
  licenseType: string; // LCSW, LMFT, LPC, PsyD, etc.
  issuingState: string; // AI Match Required
  additionalStates: string[]; // AI Match Required
  npiNumber: string;
  deaNumber?: string;
  hasMalpracticeInsurance: boolean;
  malpracticeInsuranceUpload?: File | string;
  hipaaTrainingCompleted: boolean;
  signedBAA: boolean;
  backgroundCheckCompleted: boolean;
  w9Uploaded: boolean;
  
  // C. Clinical Specialties (new Step or expand Step 4)
  clinicalSpecialties: string[]; // AI Match Required (20 items)
  lifeContextSpecialties: string[]; // AI Match Required (11 items)
  
  // D. Therapeutic Modalities (new Step or expand Step 4)
  therapeuticModalities: string[]; // AI Match Required (18 items)
  
  // E. Personal Style (new Step or expand Step 4)
  personalStyle: string[]; // AI Match Required (8 items)
  
  // F. Demographics (expand Step 6)
  demographicPreferences: string[]; // AI Match Required (14 items)
  
  // G. Session Details (expand Step 6)
  sessionFormats: string[]; // Video, In-person, Phone, Messaging
  newClientsCapacity: number;
  maxCaseload: number;
  clientIntakeSpeed: 'immediate' | 'fast' | 'moderate' | 'slow';
  emergencySameDayCapacity: boolean; // AI Match Required
  schedulingDensity: 'spread_out' | 'clustered';
  
  // H. Insurance (new Step before review)
  insurancePanels: string[];
  acceptsMedicaid: boolean;
  acceptsMedicare: boolean;
  acceptsSelfPay: boolean;
  offersSlidingScale: boolean;
  eapPrograms: string[];
  
  // I. Operational (expand Step 6)
  preferredCommunicationStyle: string;
  willingToCompleteNotesInPlatform: boolean;
  hasCrisisResponseCapability: boolean;
  telehealthPlatformExperience: string[];
  maxDailySessions: number;
  needsBreaksBetweenSessions: boolean;
  
  // J. Profile (expand Step 4)
  shortBio: string; // 80 chars
  extendedBio: string; // 500-700 chars
  clientExpectations: string;
  therapyApproach: string;
}
```

---

### Phase 2: Update Step 4 (Credentials)

Edit `/components/onboarding/OnboardingStep4Credentials.tsx`:

Add sections for:
1. Clinical Specialties (20 checkboxes with icons)
2. Life Context Specialties (11 checkboxes)
3. Therapeutic Modalities (18 checkboxes)
4. Personal Style (8 checkboxes)
5. Extended Profile (bio, approach, client expectations)

**Use the field definitions from:**
`/components/TherapistFieldDefinitions.tsx`

---

### Phase 3: Update Step 5 (License)

Edit `/components/onboarding/OnboardingStep5License.tsx`:

Add fields:
- License type dropdown
- Issuing state dropdown
- Additional states multi-select
- NPI number input
- DEA number input (optional)
- Malpractice insurance upload
- HIPAA training checkbox
- Signed BAA checkbox
- Background check checkbox
- W9 upload

---

### Phase 4: Update Step 6 (Availability)

Edit `/components/onboarding/OnboardingStep6Availability.tsx`:

Add sections:
1. **Session Formats:** Checkboxes for Video, In-person, Phone, Messaging
2. **Capacity:** New clients capacity, Max caseload numbers
3. **Demographics:** 14 client preference checkboxes
4. **Emergency:** Same-day capacity toggle
5. **Operational:** Max daily sessions, scheduling density, etc.

---

### Phase 5: Add New Step 7 (Insurance & Billing)

Create `/components/onboarding/OnboardingStep7Insurance.tsx`:

Fields:
- Insurance panels (multi-select checkboxes)
- Medicaid acceptance toggle
- Medicare acceptance toggle
- Self-pay acceptance toggle
- Sliding scale toggle
- EAP programs multi-select

---

### Phase 6: Update Review Step

Rename current Step 7 to Step 8 (or 12 if using 12-step approach)

Update `/components/onboarding/OnboardingStep7Review.tsx` to show all new fields

---

## 📋 Field Mapping

### Map Your Requirements to Current System

| Your Section | Current Step | Action |
|--------------|--------------|--------|
| A. Identity & Contact (13) | Step 1, 3 | ✅ Already have 9, add 4 more |
| B. License & Credentials (9) | Step 5 | ✅ Already have 5, add 4 more |
| C. Clinical Specialties (31) | Step 4 | 🆕 Add 31 checkboxes |
| D. Therapeutic Modalities (18) | Step 4 | 🆕 Add 18 checkboxes |
| E. Personal Style (8) | Step 4 | 🆕 Add 8 checkboxes |
| F. Demographics (14) | Step 6 | 🆕 Add 14 checkboxes |
| G. Session Format (8) | Step 6 | ✅ Already have 4, add 4 more |
| H. Availability (6) | Step 6 | ✅ Already have 5, add 1 more |
| I. Insurance (6) | NEW Step 7 | 🆕 Add new step |
| J. Workflow (7) | Step 6 | 🆕 Add 7 fields |
| K. Compliance (7) | Step 5 | ✅ Already have 3, add 4 more |
| L. Profile (5) | Step 4 | ✅ Already have bio, expand to 5 |

---

## 🚀 Quick Start

### 1. Use Existing Field Definitions

Copy all field arrays from:
```
/components/TherapistFieldDefinitions.tsx
```

Into your onboarding steps.

### 2. Don't Create New Files

**Modify existing files:**
- `/components/onboarding/OnboardingStep4Credentials.tsx` - Add specialties
- `/components/onboarding/OnboardingStep5License.tsx` - Add license details
- `/components/onboarding/OnboardingStep6Availability.tsx` - Add demographics
- **CREATE:** `/components/onboarding/OnboardingStep7Insurance.tsx` - New step
- **RENAME:** Current Step7Review → Step8Review (or Step12 if 12-step)

### 3. Update Main Onboarding Component

Edit `/components/onboarding/TherapistOnboarding.tsx`:

```typescript
const TOTAL_STEPS = 8; // Changed from 7

// Add insurance step
case 7:
  return (
    <OnboardingStep7Insurance
      data={onboardingData}
      onUpdate={updateData}
      onNext={goToNextStep}
      onBack={goToPreviousStep}
    />
  );
case 8: // Review (was 7)
  return (
    <OnboardingStep8Review
      data={onboardingData}
      onComplete={handleComplete}
      onBack={goToPreviousStep}
    />
  );
```

---

## ✅ Integration Checklist

### Core Files to Modify

- [ ] `/types/onboarding.ts` - Add 100 new fields to OnboardingData interface
- [ ] `/components/onboarding/TherapistOnboarding.tsx` - Change TOTAL_STEPS to 8
- [ ] `/components/onboarding/OnboardingStep4Credentials.tsx` - Add specialties/modalities/style
- [ ] `/components/onboarding/OnboardingStep5License.tsx` - Add license details & compliance
- [ ] `/components/onboarding/OnboardingStep6Availability.tsx` - Add demographics & operational
- [ ] `/components/onboarding/OnboardingStep7Insurance.tsx` - CREATE NEW
- [ ] `/components/onboarding/OnboardingStep7Review.tsx` - RENAME to Step8Review
- [ ] `/components/TherapistFieldDefinitions.tsx` - Already created ✅ (use this!)

### Testing

- [ ] All 8 steps navigate correctly
- [ ] localStorage persistence works
- [ ] All 132 fields captured
- [ ] Firestore backend updated
- [ ] Review step shows all data
- [ ] Validation works for new fields

---

## 🎯 Timeline

**Option 1 (Expand Existing - Recommended):**
- Day 1: Update TypeScript interfaces
- Day 2: Update Steps 4, 5, 6 with new fields
- Day 3: Create Step 7 Insurance, update review
- **Total: 3 days**

**Option 2 (12-Step Approach):**
- Day 1-2: Update TypeScript, split steps
- Day 3-4: Implement all new steps
- Day 5: Testing & bug fixes
- **Total: 5 days**

---

## 💡 Key Points

1. **✅ DO NOT DELETE** existing onboarding files
2. **✅ DO NOT CREATE** TherapistRegistrationForm (you already have onboarding!)
3. **✅ USE** `/components/TherapistFieldDefinitions.tsx` for all field arrays
4. **✅ EXTEND** current 7-step to 8-step (or 12-step)
5. **✅ UPDATE** `/types/onboarding.ts` with all 100 new fields
6. **✅ KEEP** existing functionality (localStorage, Firestore, etc.)

---

## 🔗 Access Points

**Existing:** LoginPage → "Register as Therapist" button → TherapistOnboardingDemo

**Already working!** Just need to add the 100 missing fields to existing steps.

---

## 📞 Next Steps

1. Review this integration guide
2. Decide: 8-step or 12-step approach
3. Update `/types/onboarding.ts` interface
4. Modify existing step components
5. Create new Insurance step
6. Test thoroughly
7. Deploy!

---

**Status:** Integration guide complete
**Your existing system:** 32/132 fields (24%)
**Missing fields:** 100 fields to add
**Estimated time:** 3-5 days

✅ **DO NOT DUPLICATE - EXTEND EXISTING SYSTEM!**
