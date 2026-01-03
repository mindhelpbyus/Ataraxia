# ✅ 132-FIELD THERAPIST ONBOARDING IMPLEMENTATION GUIDE

## 📊 Current Status
- **Total Fields Required:** 132
- **Fields Implemented:** 32 (24%)
- **Fields Remaining:** 100 (76%)

---

## 🎯 SECTION-BY-STEP MAPPING

### ✅ **STEP 1: Signup** (COMPLETE - 6 fields)
- Full Name
- Email
- Phone Number
- Country Code
- Password
- Confirm Password

### ✅ **STEP 2: Verification** (COMPLETE - 2 fields)
- Verification Code
- Is Verified

### 🔧 **STEP 3: Personal Details** (NEEDS 12 NEW FIELDS)

**Current:** 10 fields
**New additions needed:**
- First Name (separate from full name)
- Last Name
- Middle Name (optional)
- Preferred Name (optional)
- Address Line 1 *
- Address Line 2 (optional)
- ZIP/Postal Code *
- Language Session Capability (for each language) *
- Video Call Readiness Test (optional)

**Total after update:** 22 fields

### 🔧 **STEP 4: Professional Credentials** (NEEDS 50 NEW FIELDS) ⭐ **CRITICAL**

**Current:** 8 fields (degree, institution, graduation year, years of experience, specializations, bio)

**New additions needed:**

#### Section C: Clinical Specializations (20 fields)
- Clinical Specialties (multi-select):
  - Anxiety, Depression, Trauma/PTSD, OCD, ADHD, Bipolar
  - Personality Disorders, Autism Support, Couples Therapy
  - Family Therapy, Parenting, Substance Use
  - Disordered Eating, Chronic Illness, Veterans
  - LGBTQ+, Grief, Anger, Stress/Burnout, Work/Career Issues

- Life Context Specialties (multi-select):
  - Immigrant Populations, First-Generation Support
  - Veterans, BIPOC Communities
  - High-Achieving Professionals, College Students

- Age Groups Served (multi-select):
  - Children (0-6), Kids (7-12), Teens (13-17)
  - Adults (18-64), Seniors (65+)

#### Section D: Therapeutic Modalities (18 options)
- CBT, DBT, ACT, EMDR, Humanistic, Psychodynamic
- Gottman, EFT, Exposure Therapy, Somatic Therapies
- IFS, Mindfulness-Based, Motivational Interviewing
- Trauma-Informed Care, Play Therapy, Art Therapy
- Narrative Therapy, Solution-Focused

#### Section E: Personal Style (8 options)
- Warm/Compassionate
- Structured/Goal-Oriented
- Skills-Based
- Direct/Honest
- Insight-Oriented
- Culturally Sensitive
- Faith-Based
- LGBTQ+ Affirming

#### Section L: Client-Facing Profile (5 fields)
- Short Bio (80 chars max)
- Extended Bio (500-700 chars)
- Headshot (already have profilePhoto)
- What Clients Can Expect
- My Approach to Therapy

**Total after update:** 58 fields

### 🔧 **STEP 5: License & Compliance** (NEEDS 15 NEW FIELDS)

**Current:** 6 fields (license number, authority, expiry, document, government ID, information accurate)

**New additions needed:**

#### Section B: License & Credentials
- License Type * (LCSW, LMFT, LPC, PsyD, etc.)
- Issuing State * (AI Match Required)
- Additional States (multi-select, AI Match Required)
- Has Malpractice Insurance *
- Malpractice Insurance Provider
- Malpractice Insurance Policy Number
- Malpractice Insurance Expiry Date
- Malpractice Document Upload
- NPI Number
- DEA Number (if prescribing)

#### Section K: Compliance
- Background Check Completed *
- Background Check Date
- HIPAA Training Completed *
- HIPAA Training Date
- Ethics Certification Completed *
- Ethics Certification Date
- BAA Signed Date
- W9 Uploaded
- W9 Document
- DEA License Uploaded
- DEA License Document

**Total after update:** 21 fields

### 🔧 **STEP 6: Availability & Preferences** (NEEDS 18 NEW FIELDS)

**Current:** 5 fields (weekly schedule, session durations, break time, session types, supported languages)

**New additions needed:**

#### Section F: Demographic Preferences (AI Match Required)
- Preferred Client Demographics (multi-select):
  - Kids, Teens, Adults, Seniors, Couples, Families
  - LGBTQ+, High-Risk, ADHD, Neurodivergent, Court-Ordered
- Specific Communities (multi-select):
  - BIPOC, Immigrants, Veterans, First-Gen, Religious, Athletes, Healthcare Workers

#### Section G: Session Format & Capacity
- Session Formats (multi-select): Video, In-person, Phone, Messaging
- New Clients Capacity * (number)
- Max Caseload * (number)
- Client Intake Speed * (slow/moderate/fast)
- Session Lengths Offered (multi-select): 30/45/60/90 min

#### Section H: Availability Enhancements
- Emergency Same-Day Capacity * (Yes/No, AI Match Required)
- Scheduling Density Preference (spread out/clustered)

#### Section J: Workflow & Operational
- Preferred Session Length *
- Preferred Communication Style *
- Will Complete Clinical Notes in Platform *
- Has Crisis Response Capability *
- Telehealth Platform Experience (multi-select)
- Max Daily Sessions *
- Break Schedule Preference *

**Total after update:** 23 fields

### 🆕 **STEP 7: Insurance & Billing** (NEEDS 11 NEW FIELDS) - **CREATE NEW**

**Section I: Insurance & Payor Support**

- Insurance Panels Accepted (multi-select):
  - Aetna, Anthem, BCBS, Cigna, UnitedHealthcare
  - Humana, Kaiser, Optum, Lyra, Talkspace, BetterHelp
  - Magellan, Beacon, Tricare
- Accepts Medicaid * (Yes/No)
- Accepts Medicare * (Yes/No)
- Accepts Self-Pay * (Yes/No)
- Offers Sliding Scale (Yes/No)
- Sliding Scale Range (if yes): Min $ / Max $
- EAP Partnerships (multi-select, employer-specific)

**Total:** 11 fields

---

## 📋 IMPLEMENTATION CHECKLIST

### ✅ Phase 1: Type Definitions (DONE)
- [x] Updated `/types/onboarding.ts` with all 132 fields
- [x] Added all constants (CLINICAL_SPECIALTIES, THERAPEUTIC_MODALITIES, etc.)
- [x] Added LICENSE_TYPES, US_STATES, INSURANCE_PANELS

### 🔧 Phase 2: Update Step Components (IN PROGRESS)

#### Step 3: Personal Details
- [ ] Add name fields (firstName, lastName, middleName, preferredName)
- [ ] Add address fields (addressLine1, addressLine2, zipCode)
- [ ] Add language session capability checkboxes
- [ ] Add video call readiness test option
- [ ] Update validation logic

#### Step 4: Professional Credentials ⭐ **PRIORITY**
- [ ] Add Section C: Clinical Specialties (multi-select with badges)
- [ ] Add Section C: Life Context Specialties (multi-select)
- [ ] Add Section C: Age Groups Served (multi-select)
- [ ] Add Section D: Therapeutic Modalities (multi-select with checkboxes)
- [ ] Add Section E: Personal Style (multi-select)
- [ ] Add Section L: Client-Facing Profile fields
  - [ ] Short Bio (80 char max, character counter)
  - [ ] Extended Bio (500-700 chars, character counter)
  - [ ] What Clients Can Expect (textarea)
  - [ ] My Approach to Therapy (textarea)
- [ ] Update form layout with sections/tabs
- [ ] Add validation for new required fields

#### Step 5: License & Compliance
- [ ] Add license type dropdown (LCSW, LMFT, etc.)
- [ ] Add issuing state dropdown
- [ ] Add additional states multi-select
- [ ] Add malpractice insurance section (toggle + fields)
- [ ] Add NPI number field
- [ ] Add DEA number field (conditional)
- [ ] Add compliance checkboxes:
  - [ ] Background check
  - [ ] HIPAA training
  - [ ] Ethics certification
- [ ] Add compliance document uploads (W9, DEA license)
- [ ] Update validation logic

#### Step 6: Availability & Preferences
- [ ] Add demographic preferences section (multi-select)
- [ ] Add specific communities section (multi-select)
- [ ] Add session formats (multi-select: video/in-person/phone/messaging)
- [ ] Add capacity fields (new clients, max caseload)
- [ ] Add client intake speed dropdown
- [ ] Add session lengths offered (multi-select: 30/45/60/90)
- [ ] Add emergency same-day capacity toggle
- [ ] Add scheduling density preference
- [ ] Add workflow section:
  - [ ] Preferred session length
  - [ ] Preferred communication style
  - [ ] Clinical notes checkbox
  - [ ] Crisis response capability checkbox
  - [ ] Telehealth platform experience
  - [ ] Max daily sessions
  - [ ] Break schedule preference
- [ ] Update validation logic

#### Step 7: Insurance & Billing (NEW FILE)
- [ ] Create `/components/onboarding/OnboardingStep7Insurance.tsx`
- [ ] Add insurance panels multi-select
- [ ] Add Medicaid/Medicare/Self-Pay toggles
- [ ] Add sliding scale section (toggle + min/max range)
- [ ] Add EAP partnerships multi-select
- [ ] Add navigation buttons
- [ ] Add validation logic

### 🔧 Phase 3: Update Main Onboarding Component
- [ ] Update `/components/onboarding/TherapistOnboarding.tsx`
  - [ ] Keep TOTAL_STEPS = 7 (already correct)
  - [ ] Import OnboardingStep7Insurance
  - [ ] Add Step 7 to switch/case
  - [ ] Update progress indicator
  - [ ] Update step labels array

### 🔧 Phase 4: Update Demo Component
- [ ] Update `/components/TherapistOnboardingDemo.tsx` if needed
- [ ] Ensure all new fields have default/empty values

---

## 🎨 UI/UX GUIDELINES

### Multi-Select Components
Use **checkboxes with badges** for better UX:
```tsx
{CLINICAL_SPECIALTIES.map((specialty) => (
  <div key={specialty} className="flex items-center gap-2">
    <Checkbox 
      checked={data.clinicalSpecialties?.includes(specialty)}
      onCheckedChange={() => toggleSpecialty(specialty)}
    />
    <Label>{specialty}</Label>
  </div>
))}
```

### Selected Items Display
Show selected items as dismissible badges:
```tsx
{data.clinicalSpecialties?.map((specialty) => (
  <Badge key={specialty} className="bg-orange-100 text-orange-800">
    {specialty}
    <X onClick={() => removeSpecialty(specialty)} />
  </Badge>
))}
```

### Character Counters
For bio fields with limits:
```tsx
<p className="text-xs text-muted-foreground">
  {data.shortBio?.length || 0} / 80 characters
</p>
```

### Conditional Fields
Show/hide based on previous selections:
```tsx
{data.hasMalpracticeInsurance && (
  <div className="space-y-4 pl-6 border-l-2 border-orange-200">
    {/* Malpractice details fields */}
  </div>
)}
```

### Section Organization
Use collapsible sections or tabs for long forms:
```tsx
<Tabs defaultValue="specialties">
  <TabsList>
    <TabsTrigger value="specialties">Specializations</TabsTrigger>
    <TabsTrigger value="modalities">Modalities</TabsTrigger>
    <TabsTrigger value="profile">Profile</TabsTrigger>
  </TabsList>
  <TabsContent value="specialties">...</TabsContent>
</Tabs>
```

---

## 🚀 NEXT STEPS

1. **Review this guide** - Understand the field distribution
2. **Start with Step 4** - It has the most AI-critical fields
3. **Test incrementally** - After each step update, test the form
4. **Update validation** - Ensure required fields are validated
5. **Test data flow** - Verify data saves correctly between steps

---

## ⏱️ ESTIMATED TIME

- **Step 3 updates:** 2-3 hours
- **Step 4 updates:** 8-10 hours (most complex)
- **Step 5 updates:** 4-5 hours
- **Step 6 updates:** 6-7 hours
- **Step 7 creation:** 3-4 hours
- **Testing & fixes:** 4-5 hours

**Total:** ~30-35 hours (4-5 work days)

---

## 📌 AI MATCH REQUIRED FIELDS (PRIORITY)

These fields are critical for AI matching and should be prioritized:

### High Priority (Must Have for MVP)
- ✅ Timezone
- ✅ Languages spoken fluently
- ✅ Language session capability
- ❌ Issuing state(s)
- ❌ Additional practice states
- ❌ Clinical specialties (all 20)
- ❌ Age groups served
- ❌ Therapeutic modalities
- ❌ Personal style
- ❌ Demographic preferences
- ❌ Session formats
- ❌ Emergency same-day capacity

### Medium Priority (Important for Quality Matching)
- ❌ Life context specialties
- ❌ Specific communities
- ❌ New clients capacity
- ❌ Session lengths offered
- ❌ Scheduling density

---

## 🔧 CODE EXAMPLES

### Example: Adding Multi-Select with Badges (Step 4)

```tsx
// State
const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>(
  data.clinicalSpecialties || []
);

// Toggle function
const toggleSpecialty = (specialty: string) => {
  const updated = selectedSpecialties.includes(specialty)
    ? selectedSpecialties.filter(s => s !== specialty)
    : [...selectedSpecialties, specialty];
  setSelectedSpecialties(updated);
  onUpdate({ clinicalSpecialties: updated });
};

// UI
<div className="space-y-4">
  <Label>Clinical Specialties (AI Match Required) *</Label>
  
  {/* Checkboxes */}
  <div className="grid grid-cols-2 gap-3">
    {CLINICAL_SPECIALTIES.map((specialty) => (
      <div key={specialty} className="flex items-center gap-2">
        <Checkbox 
          checked={selectedSpecialties.includes(specialty)}
          onCheckedChange={() => toggleSpecialty(specialty)}
        />
        <label className="text-sm cursor-pointer">
          {specialty}
        </label>
      </div>
    ))}
  </div>

  {/* Selected badges */}
  {selectedSpecialties.length > 0 && (
    <div className="flex flex-wrap gap-2">
      {selectedSpecialties.map((specialty) => (
        <Badge 
          key={specialty}
          className="bg-orange-100 text-orange-800 hover:bg-orange-200"
        >
          {specialty}
          <X 
            className="ml-2 h-3 w-3 cursor-pointer"
            onClick={() => toggleSpecialty(specialty)}
          />
        </Badge>
      ))}
    </div>
  )}
</div>
```

---

This guide provides a complete roadmap for implementing all 100 missing fields!
