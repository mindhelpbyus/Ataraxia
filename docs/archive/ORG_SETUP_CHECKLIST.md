# ✅ Organization Setup - Complete Checklist

## 🎯 Quick Reference

Use this checklist when setting up a new organization in the system.

---

## 📋 12-Step Wizard Checklist

### Step 1: Basic Organization Details ✅
- [ ] Organization Name (required)
- [ ] Legal Name (required)
- [ ] DBA / Doing Business As (optional)
- [ ] Tax ID / EIN (required, format: XX-XXXXXXX)
- [ ] NPI - National Provider Identifier (optional, 10 digits)
- [ ] Organization Type (select one):
  - [ ] Solo Practice
  - [ ] Small Group (2-10 clinicians)
  - [ ] Mid-size Clinic (11-50 clinicians)
  - [ ] Large Enterprise (50+ clinicians)
  - [ ] Telehealth-Only
  - [ ] Multi-Location
- [ ] Primary Contact Name (required)
- [ ] Primary Contact Email (required)
- [ ] Primary Contact Phone (required)
- [ ] HQ Address (street, city, state, zip - required)
- [ ] Billing Address (if different from HQ)
- [ ] Primary Timezone (required)
- [ ] Service Locations (add as many as needed)

**Completion Time:** 5-10 minutes

---

### Step 2: Organization Size & Structure ✅
- [ ] Number of Clinicians (required, minimum 1)
- [ ] Number of Admin Staff (optional)
- [ ] Number of Locations (default: 1)
- [ ] Departments (optional, can add multiple)
  - Examples: Adult Services, Child & Adolescent, Psychiatry
- [ ] Divisions (optional, can add multiple)
  - Examples: North Region, South Region, Telehealth
- [ ] Organization Structure Notes (optional)
  - Hierarchy, care teams, reporting structure

**Completion Time:** 3-5 minutes

**Note:** Billing will be calculated based on number of clinicians

---

### Step 3: HIPAA Compliance ✅
**Required Agreements:**
- [ ] HIPAA Business Associate Agreement (BAA) - REQUIRED ⚠️
- [ ] Data Processing Agreement (DPA) - REQUIRED ⚠️

**Audit & Logging:**
- [ ] Select Audit Logging Level:
  - [ ] Standard Logging (recommended for most)
  - [ ] Strict Logging (healthcare organizations)
  - [ ] PHI-Restricted Logging (high security)

**Completion Time:** 2-3 minutes

**Important:** Cannot proceed without accepting both agreements!

---

### Step 4: Security Settings ✅
**Authentication:**
- [ ] Require Multi-Factor Authentication (MFA)
  - Recommended: ON ✅
- [ ] Password Minimum Length
  - [ ] 8 characters (Basic)
  - [ ] 10 characters (Recommended) ✅
  - [ ] 12 characters (Strict)
  - [ ] 14 characters (Maximum)
- [ ] Password Rotation Policy
  - [ ] Never expire
  - [ ] Every 30 days
  - [ ] Every 60 days
  - [ ] Every 90 days (Recommended) ✅
  - [ ] Every 180 days
- [ ] Session Timeout
  - [ ] 15 minutes (High security)
  - [ ] 30 minutes (Recommended) ✅
  - [ ] 60 minutes (Standard)
  - [ ] 120 minutes (Extended)

**Advanced (Enterprise):**
- [ ] IP Allowlist (optional)
  - Enter IP addresses or ranges (one per line)
  - Only these IPs can access the system

**Completion Time:** 2-3 minutes

---

### Step 5: Branding & Customization ✅
**Visual Identity:**
- [ ] Organization Logo (PNG, JPG, or SVG, max 2MB)
- [ ] Primary Brand Color (default: #F97316)
- [ ] Secondary Brand Color (default: #F59E0B)

**Communication Branding:**
- [ ] Email Sender Name (required)
  - Example: "Wellness Center"
- [ ] SMS Sender Name (required, max 11 characters)
  - Example: "WellnessCtr"

**Advanced (Optional):**
- [ ] Custom Domain (e.g., portal.yourorganization.com)
  - Enterprise feature - requires DNS configuration
- [ ] Custom Login Page Branding
  - Use your logo and colors on login page

**Completion Time:** 3-5 minutes

---

### Step 6: Billing & Subscription ✅
**Select Plan:**
- [ ] Per Provider - $99/month per clinician ⭐ Most Popular
- [ ] Per Location - $499/month per location (unlimited providers)
- [ ] Enterprise License - Custom pricing (50+ providers)

**Billing Contact:**
- [ ] Contact Name (required)
- [ ] Contact Email (required)

**Payment Method:**
- [ ] Credit Card
- [ ] ACH / Bank Transfer
- [ ] Invoice (Enterprise only)

**Estimated Monthly Cost:** $_____ (calculated automatically)

**Completion Time:** 2-3 minutes

---

### Step 7: Insurance & Payor Setup ✅
**Accepted Insurance Plans (select all that apply):**
- [ ] Aetna
- [ ] Anthem BCBS
- [ ] Blue Cross Blue Shield
- [ ] Cigna
- [ ] Humana
- [ ] Kaiser Permanente
- [ ] UnitedHealthcare
- [ ] Medicare
- [ ] Medicaid

**Clearinghouse Setup:**
- [ ] Select Clearinghouse Provider:
  - [ ] Availity
  - [ ] Change Healthcare
  - [ ] Waystar
  - [ ] Office Ally
  - [ ] Not using clearinghouse

**Electronic Data Interchange:**
- [ ] EDI Enrolled (toggle on if you submit electronic claims)

**Completion Time:** 2-3 minutes

---

### Step 8: Clinical Workflow Settings ✅
**Default Session Types (select all offered):**
- [ ] Therapy
- [ ] Psychiatry
- [ ] Intake Assessment
- [ ] Follow-up
- [ ] Group Therapy
- [ ] Family Therapy
- [ ] Couples Therapy
- [ ] Crisis Session

**Session Settings:**
- [ ] Default Session Duration:
  - [ ] 30 minutes
  - [ ] 45 minutes
  - [ ] 50 minutes (Standard) ✅
  - [ ] 60 minutes
  - [ ] 90 minutes

**Policies:**
- [ ] No-Show Policy (describe your policy and fees)
- [ ] Cancellation Policy (describe your policy and timeframe)

**Clinical Documentation Templates (select all needed):**
- [ ] SOAP Notes
- [ ] DAP Notes
- [ ] Treatment Plans
- [ ] Progress Notes
- [ ] Psychiatric Evaluation
- [ ] Discharge Summary

**Telehealth:**
- [ ] Video Provider:
  - [ ] Jitsi (Self-hosted - Secure) ⭐ Recommended
  - [ ] Zoom for Healthcare
  - [ ] Doxy.me
  - [ ] VSee
  - [ ] Twilio Video

**Completion Time:** 5-7 minutes

---

### Step 9: Staff Management ✅
**Organization Structure:**
- [ ] Enable Supervisor Hierarchy
  - Allow supervisors to oversee other clinicians
- [ ] Enable Caseload Limits
  - Set maximum active clients per clinician

**Note:** Actual staff invitation and management happens after organization setup is complete.

**Completion Time:** 1-2 minutes

---

### Step 10: Integrations ✅
**Electronic Health Record (EHR):**
- [ ] Select EHR System:
  - [ ] None (standalone)
  - [ ] Athenahealth
  - [ ] eClinicalWorks
  - [ ] Epic / MyChart
  - [ ] Cerner

**Video Provider:**
- [ ] Select Video System:
  - [ ] Jitsi (Self-hosted) ⭐
  - [ ] Zoom
  - [ ] Twilio

**Calendar Integration:**
- [ ] Select Calendar:
  - [ ] None
  - [ ] Google Calendar
  - [ ] Microsoft Outlook
  - [ ] Both

**Single Sign-On (SSO):**
- [ ] Select Identity Provider:
  - [ ] None (Standard auth)
  - [ ] Okta
  - [ ] Azure AD
  - [ ] Google Workspace

**Completion Time:** 2-3 minutes

**Note:** OAuth setup for calendar and SSO happens in backend configuration.

---

### Step 11: Analytics & Reporting ✅
**Enable Reports:**
- [ ] Revenue Dashboard
  - Track income, claims, collections
- [ ] Clinical Outcomes
  - Monitor client progress and outcomes
- [ ] Analytics Enabled
  - General platform analytics

**Additional reports available after setup:**
- Utilization reports
- Therapist productivity
- Compliance/audit reports
- Client demographics
- Claims/rejections dashboard

**Completion Time:** 1-2 minutes

---

### Step 12: Communications ✅
**Notification Channels:**
- [ ] Email Notifications
  - Enable email for all system notifications
- [ ] SMS Notifications
  - Enable text messages for notifications
- [ ] Appointment Reminders
  - Automatic reminders 24hrs before appointments

**Additional communication features available after setup:**
- Email/SMS templates
- Custom automated messages
- Secure messaging
- Emergency contact workflows

**Completion Time:** 1-2 minutes

---

## 📊 Completion Summary

**Total Time:** 30-45 minutes for complete setup

**Required Fields:** ~50
**Optional Fields:** ~70
**Total Configuration:** 120+ settings

---

## ✅ Final Checklist

Before clicking "Create Organization":

- [ ] All required fields completed (marked with *)
- [ ] HIPAA agreements accepted
- [ ] Billing contact email verified
- [ ] Subscription plan selected
- [ ] Review all entered information
- [ ] Ready to create organization

---

## 🎯 After Setup

Once organization is created, you can:

### Immediate Access
✅ Organization dashboard  
✅ Basic settings management  
✅ View organization profile  

### Next Steps (Post-Setup)
1. **Invite Staff**
   - Send invitations to clinicians
   - Add admin staff
   - Assign roles and permissions

2. **Configure Integrations**
   - Complete OAuth for calendar/SSO
   - Set up EHR connection
   - Configure clearinghouse

3. **Import Data** (if migrating)
   - Client data
   - Therapist profiles
   - Historical notes
   - Billing records

4. **Customize Templates**
   - Email templates
   - SMS templates
   - Clinical forms
   - Consent forms

5. **Test Workflows**
   - Client registration
   - Appointment booking
   - Video calls
   - Billing processes

---

## 📋 Quick Test Checklist

**Testing a Small Organization (5 minutes):**
- [ ] Name: Test Wellness Center
- [ ] Type: Small Group
- [ ] Clinicians: 5
- [ ] Accept BAA/DPA
- [ ] MFA: On
- [ ] Plan: Per Provider ($495/month)
- [ ] Email sender: Test Wellness
- [ ] Session types: Therapy, Intake
- [ ] Video: Jitsi
- [ ] Click "Create Organization"

---

## 🎨 Organization Types Guide

### Solo Practice
- **Clinicians:** 1
- **Admin Staff:** 0-1
- **Locations:** 1
- **Recommended Plan:** Per Provider ($99/month)
- **Setup Time:** 20 minutes

### Small Group (2-10 clinicians)
- **Clinicians:** 2-10
- **Admin Staff:** 1-2
- **Locations:** 1-2
- **Recommended Plan:** Per Provider ($198-990/month)
- **Setup Time:** 30 minutes

### Mid-size Clinic (11-50 clinicians)
- **Clinicians:** 11-50
- **Admin Staff:** 3-10
- **Locations:** 1-5
- **Recommended Plan:** Per Provider or Per Location
- **Setup Time:** 45 minutes

### Large Enterprise (50+ clinicians)
- **Clinicians:** 50+
- **Admin Staff:** 10+
- **Locations:** Multiple
- **Recommended Plan:** Enterprise License
- **Setup Time:** 60+ minutes

### Telehealth-Only
- **Clinicians:** Any
- **Admin Staff:** Any
- **Locations:** 0 (virtual only)
- **Recommended Plan:** Per Provider
- **Special:** No physical address needed

### Multi-Location
- **Clinicians:** 10+
- **Admin Staff:** 5+
- **Locations:** 3+
- **Recommended Plan:** Per Location
- **Special:** Manage multiple service locations

---

## 💡 Pro Tips

### Before You Start
1. **Gather Information:**
   - Tax ID/EIN
   - NPI (if applicable)
   - Insurance provider list
   - Staff count
   - Service locations

2. **Have Documents Ready:**
   - Organization logo
   - Legal business name
   - Billing contact info

3. **Know Your Needs:**
   - Which integrations you need
   - Session types you offer
   - Insurance plans you accept

### During Setup
1. **Take Your Time:** Review each step carefully
2. **Save Progress:** Some fields auto-save
3. **Use Help Text:** Read descriptions for guidance
4. **Ask Questions:** Contact support if unsure

### After Setup
1. **Verify Information:** Review all settings
2. **Test Workflows:** Try key features
3. **Invite Team:** Add staff members
4. **Configure Integrations:** Complete OAuth flows

---

## 🚨 Common Mistakes to Avoid

❌ Not accepting HIPAA agreements (will block progress)  
❌ Incorrect Tax ID format (use XX-XXXXXXX)  
❌ Email sender name too long for SMS (11 char max)  
❌ Forgetting to add service locations  
❌ Selecting wrong subscription plan  
❌ Not enabling MFA (security risk)  
❌ Skipping optional but important fields  

---

## ✅ Success Criteria

Organization setup is successful when:

✅ All 12 steps completed  
✅ HIPAA agreements accepted  
✅ Required fields filled in  
✅ Subscription plan selected  
✅ Contact information verified  
✅ Organization appears in list  
✅ Can access organization dashboard  

---

## 📞 Need Help?

**During Setup:**
- Read step descriptions
- Check field help text
- Review pro tips above

**After Setup:**
- Organization dashboard
- Settings management
- Staff invitation
- Integration configuration

**Documentation:**
- `ORGANIZATION_REQUIREMENTS_COVERAGE.md` - Complete feature mapping
- `COMPLETE_TESTING_GUIDE.md` - Testing instructions
- `DOCUMENTATION_INDEX.md` - All documentation

---

**Document:** Organization Setup Checklist  
**Created:** November 28, 2024  
**Version:** 1.0  
**Status:** ✅ Ready to Use  

**Print this checklist and check off items as you complete them!** 📋✅
