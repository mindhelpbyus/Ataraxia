# 🧪 Quick Test Guide - Therapist Registration

## 🚀 How to Test Your New 132-Field System

---

## Step 1: Start the App

```bash
npm run dev
```

---

## Step 2: Navigate to Registration

1. ✅ You should see the **Login Page**
2. ✅ Look for **"Register for free"** button/link
3. ✅ Click it

---

## Step 3: Complete Each Step

### **Step 1: Signup** ✅
- Enter name, email, phone
- Try: `test@therapist.com` / password
- OAuth buttons should be visible (Google, Apple)

### **Step 2: Phone Verification** ✅
- OTP sent to phone (if Firebase configured)
- Or skip if using OAuth

### **Step 3: Personal Details** ✅
- Upload profile photo (optional)
- Select gender, DOB, location
- Add languages (try "English", "Spanish")
- Timezone auto-detected

### **Step 4: Credentials & Specializations** ⭐ **NEW FEATURES**
- Select degree (e.g., "PsyD")
- Enter institution and year
- **NEW:** Clinical Specialties - select multiple (e.g., Anxiety, Depression, Trauma)
- **NEW:** Life Context - select age groups (e.g., Adults, Teens)
- **NEW:** Modalities - select approaches (e.g., CBT, DBT, EMDR)
- **NEW:** Personal Style - select attributes (e.g., Warm/Compassionate, Direct/Honest)

**✅ Should see selection counters: "5 selected", "3 selected", etc.**

### **Step 5: License & Credentials** ⭐ **NEW FEATURES**
- **NEW:** License type dropdown (LCSW, LMFT, LPC, PsyD, etc.)
- Enter license number
- **NEW:** Add issuing states (multi-select)
- **NEW:** Add additional practice states
- Set expiry date (must be future)
- **NEW:** Upload license document
- **NEW:** Enter malpractice insurance provider
- **NEW:** NPI number field
- **NEW:** DEA number (optional)
- Check "Information is accurate"

**✅ Should see state badges when added**

### **Step 6: Availability & Capacity** ⭐ **NEW FEATURES**
- **NEW:** Select session formats (Video ✓, In-Person ✓, Phone ✓, Messaging ✓)
- **NEW:** Select session lengths (30, 45, 60, 90 min)
- **NEW:** Set new clients capacity (e.g., 5 per month)
- **NEW:** Set max caseload (e.g., 30 total)
- **NEW:** Client intake speed (Slow/Moderate/Fast)
- **NEW:** Emergency same-day capacity checkbox
- Select timezone
- **NEW:** Scheduling density preference (Spread-out/Clustered)
- Add weekly schedule by day
- Click days to add time blocks

**✅ Should see "Total weekly hours: X.X hours"**

### **Step 7: Review** ✅
- Review all entered data
- Edit any section if needed
- Continue to next step

### **Step 8: Demographics & Preferences** ⭐ **COMPLETELY NEW**
- Select client demographics you're comfortable with:
  - Kids ✓
  - Teens ✓
  - Adults ✓
  - Seniors ✓
  - Couples ✓
  - Families ✓
  - LGBTQ+ ✓
  - High-Risk Clients ✓
  - ADHD Clients ✓
  - Neurodivergent Groups ✓
  - Court-Ordered Clients ✓
  - BIPOC Communities ✓
  - Immigrants ✓
  - Veterans ✓

**✅ Should see "You've selected X demographic groups"**

### **Step 9: Insurance & Compliance** ⭐ **COMPLETELY NEW**

**Insurance Section:**
- Add insurance panels from dropdown (Aetna, BCBS, Cigna, etc.)
- Check Medicaid acceptance ✓
- Check Medicare acceptance ✓
- Check Self-pay accepted ✓
- Check Sliding scale ✓
- Add employer EAPs (optional)

**Compliance Section:**
- ✅ Check "HIPAA training completed" (REQUIRED)
- Upload HIPAA certificate (optional)
- Check Ethics certification ✓
- Upload ethics certificate (optional)
- ✅ Check "Signed BAA" (REQUIRED)
- Select background check status
- Upload W-9 (optional)

**✅ At minimum must check: HIPAA training + BAA**

### **Step 10: Professional Profile** ⭐ **COMPLETELY NEW**
- Upload professional headshot (optional but recommended)
- **Short Bio (80 chars max):**
  - Example: "Compassionate therapist specializing in anxiety, trauma, and life transitions"
- **Extended Bio (500-700 chars):**
  - Write about your background, education, experience
  - Example: "I earned my PsyD from Stanford and have 10 years of experience working with adults facing anxiety, depression, and trauma. My approach combines evidence-based CBT with mindfulness techniques, creating a warm and collaborative therapeutic environment..."
- **What Clients Can Expect:**
  - Describe your session style
  - Example: "In our sessions, you can expect a safe, non-judgmental space where we work together to understand your challenges and develop practical coping strategies..."
- **My Approach to Therapy:**
  - Explain your therapeutic philosophy
  - Example: "I use an integrative approach combining CBT, DBT, and mindfulness techniques. I believe in meeting clients where they are and tailoring treatment to each individual's needs..."

**✅ Should see character counters and green checkmarks when requirements met**

---

## Step 4: Final Submission

1. Click **"Review & Submit"** on Step 10
2. Data should be saved to Firestore
3. Console should show: `"Onboarding completed successfully!"`
4. Should redirect or show success message

---

## ✅ What to Look For

### **Visual Indicators:**
- ✅ Orange (#F97316) primary color throughout
- ✅ Selection counters showing progress
- ✅ Green checkmarks for completed sections
- ✅ Red error messages for validation issues
- ✅ Progress bar at top showing Step X of 10
- ✅ Pills/badges for multi-select items

### **Functionality:**
- ✅ Back button works on every step
- ✅ Data persists if you refresh (localStorage)
- ✅ Validation prevents proceeding with errors
- ✅ File uploads show filename when uploaded
- ✅ Multi-selects show badges/chips for selected items
- ✅ Character counters update in real-time

---

## 🐛 Common Issues & Solutions

### **Issue: "Register for free" button not visible**
**Solution:** Check LoginPage-fixed.tsx line 726 - should be there

### **Issue: Steps 8, 9, or 10 not showing**
**Solution:** Check TherapistOnboarding.tsx - TOTAL_STEPS should be 10

### **Issue: Validation errors preventing progress**
**Solution:** Check console for specific errors, ensure all required fields filled

### **Issue: File uploads not working**
**Solution:** Check file type (PDF, JPG, PNG) and size (< 5MB)

### **Issue: Data not saving to Firestore**
**Solution:** Check Firebase configuration in `/config/firebase.ts`

---

## 📊 Field Count Verification

After completing all steps, you should have filled:

| Section | Fields | Status |
|---------|--------|--------|
| A - Identity & Contact | 13 | ✅ |
| B - License & Credentials | 9 | ✅ |
| C - Specializations | 31 | ✅ |
| D - Modalities | 18 | ✅ |
| E - Personal Style | 8 | ✅ |
| F - Demographics | 14 | ✅ |
| G - Session Format | 9 | ✅ |
| H - Availability | 6 | ✅ |
| I - Insurance | 6 | ✅ |
| J - Workflow | 9 | ✅ |
| K - Compliance | 8 | ✅ |
| L - Profile | 5 | ✅ |
| **TOTAL** | **132** | ✅ |

---

## 🎯 Quick Smoke Test (5 minutes)

1. ✅ Click "Register for free"
2. ✅ Enter basic info in Step 1-3 (use fake data)
3. ✅ In Step 4: Select at least 1 clinical specialty, 1 life context, 1 modality, 1 style
4. ✅ In Step 5: Select license type, enter number, add 1 state
5. ✅ In Step 6: Check video format, select 60 min, set capacity to 5/30
6. ✅ In Step 7: Review
7. ✅ In Step 8: Select "Adults"
8. ✅ In Step 9: Check "Self-pay", check HIPAA + BAA
9. ✅ In Step 10: Enter short bio + extended bio
10. ✅ Submit

**If all steps complete without errors: SUCCESS! ✅**

---

## 🎉 Success Criteria

✅ All 10 steps accessible
✅ All 132 fields can be filled
✅ Validation works correctly
✅ Navigation (back/forward) works
✅ Data saves to Firestore
✅ UI matches Ataraxia brand (orange colors, pills)
✅ No console errors
✅ Mobile responsive (bonus)

---

## 📞 Need Help?

Check these files for issues:
- `/App.tsx` - Main routing
- `/components/LoginPage-fixed.tsx` - "Register" button
- `/components/onboarding/TherapistOnboarding.tsx` - Step orchestration
- `/types/onboarding.ts` - Field definitions
- Browser console for errors

---

**Happy Testing! 🚀**
