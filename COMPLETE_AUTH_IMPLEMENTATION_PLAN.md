# Complete Auth & Onboarding System - Implementation Plan

## 🎯 **Overview**

We have **multiple registration paths** that need to work together:

1. **Solo Therapist** - "Register for Free" (individual, needs verification)
2. **Organization Therapist** - Invited by organization (pre-verified)
3. **Organization Admin** - Bulk onboarding by super admin
4. **Google/Apple Signup** - Auto-populate info, then verify

---

## 📊 **Registration Paths**

### **Path 1: Solo Therapist (Individual)**

```
User clicks "Register for Free"
   ↓
Choose signup method:
   • Email/Password
   • Google (auto-populate email, name)
   • Apple (auto-populate email, name)
   ↓
If Google/Apple:
   - Email: auto-filled ✅
   - Name: auto-filled ✅
   - Profile pic: auto-filled ✅
   ↓
Complete registration form:
   - License info
   - Professional credentials
   - Documents upload
   - Background check consent
   ↓
Submit → temp_therapist_registrations
   ↓
Status: "pending_review"
   ↓
User tries to login → Shows "Verification Pending" page
   ↓
Admin reviews & approves
   ↓
User migrated to main table
   ↓
User can login ✅
```

---

### **Path 2: Organization Therapist (Pre-Verified)**

```
Super Admin creates organization
   ↓
Generates invite link with org_code
   ↓
Example: https://ataraxia.app/register?org=ABC123XYZ
   ↓
Therapist clicks link
   ↓
Choose signup method:
   • Email/Password
   • Google (auto-populate)
   • Apple (auto-populate)
   ↓
Complete minimal form:
   - Basic info (auto-filled if Google/Apple)
   - License number (for records)
   - Accept terms
   ↓
Submit with org_code
   ↓
Backend validates org_code
   ↓
If valid:
   - Creates user in main users table (NOT temp)
   - Sets organization_id
   - Sets account_status = 'active' (immediate)
   - Assigns therapist role
   ↓
User can login immediately ✅ (no verification needed)
```

---

### **Path 3: Bulk Organization Onboarding**

```
Super Admin → Admin Dashboard
   ↓
"Create Organization" button
   ↓
Form:
   - Organization Name
   - Organization Type (clinic, hospital, group practice)
   - Admin Email
   - Number of therapists
   ↓
Submit → Creates:
   1. Organization record
   2. Org admin user
   3. Invite codes (bulk)
   ↓
Super Admin gets:
   - Org admin login link
   - Therapist invite links (bulk)
   ↓
Super Admin sends:
   - Email to org admin
   - Bulk invite links to therapists
   ↓
Each therapist registers with org_code
   ↓
All therapists auto-verified ✅
```

---

## 🔧 **Implementation Details**

### **1. Google/Apple Signup Auto-Population**

```typescript
// LoginPage.tsx - Google Signup
const handleGoogleSignup = async () => {
  try {
    const { signInWithPopup } = await import('firebase/auth');
    const { auth, googleProvider } = await import('../lib/firebase');
    
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Extract info from Google
    const userData = {
      firebase_uid: user.uid,
      email: user.email,
      first_name: user.displayName?.split(' ')[0] || '',
      last_name: user.displayName?.split(' ').slice(1).join(' ') || '',
      profile_image_url: user.photoURL || '',
      email_verified: user.emailVerified
    };
    
    // Check if user already exists
    const existingUser = await checkUserExists(user.uid);
    
    if (existingUser) {
      // User exists, check status
      if (existingUser.account_status === 'active') {
        // Login
        onLogin(existingUser);
      } else {
        // Show verification pending
        navigate('/verification-pending');
      }
    } else {
      // New user, go to registration with pre-filled data
      navigate('/register-therapist', { 
        state: { 
          prefilledData: userData,
          signupMethod: 'google'
        } 
      });
    }
  } catch (error) {
    console.error('Google signup error:', error);
  }
};
```

---

### **2. Registration Form with Auto-Population**

```typescript
// TherapistRegistrationForm.tsx
import { useLocation } from 'react-router-dom';

function TherapistRegistrationForm() {
  const location = useLocation();
  const prefilledData = location.state?.prefilledData || {};
  const orgCode = new URLSearchParams(location.search).get('org');
  
  const [formData, setFormData] = useState({
    // Auto-filled from Google/Apple
    firebase_uid: prefilledData.firebase_uid || '',
    email: prefilledData.email || '',
    first_name: prefilledData.first_name || '',
    last_name: prefilledData.last_name || '',
    profile_image_url: prefilledData.profile_image_url || '',
    
    // User needs to fill
    phone_number: '',
    license_number: '',
    license_state: '',
    license_expiry: '',
    // ... more fields
    
    // Organization code (if invited)
    org_invite_code: orgCode || ''
  });
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.org_invite_code) {
      // Organization therapist - immediate activation
      await registerWithOrganization(formData);
      // User can login immediately
      navigate('/login', { 
        state: { message: 'Registration successful! You can now login.' }
      });
    } else {
      // Solo therapist - needs verification
      await registerForVerification(formData);
      // Show verification pending
      navigate('/verification-pending');
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Step 1: Basic Info (auto-filled if Google/Apple) */}
      <input 
        value={formData.email} 
        disabled={!!prefilledData.email} // Disabled if from Google
      />
      
      {/* Step 2: Professional Info */}
      <input 
        value={formData.license_number}
        onChange={...}
      />
      
      {/* Step 3: Documents (only if solo therapist) */}
      {!formData.org_invite_code && (
        <DocumentUpload />
      )}
      
      <button type="submit">
        {formData.org_invite_code ? 'Complete Registration' : 'Submit for Verification'}
      </button>
    </form>
  );
}
```

---

### **3. Backend API Endpoints**

```typescript
// POST /api/verification/register (Solo Therapist)
router.post('/register', async (req, res) => {
  const { firebase_uid, email, org_invite_code, ...data } = req.body;
  
  if (org_invite_code) {
    // Organization therapist - immediate activation
    const org = await validateOrgInviteCode(org_invite_code);
    
    if (!org) {
      return res.status(400).json({ error: 'Invalid invite code' });
    }
    
    // Create user directly in main table
    const user = await createUser({
      ...data,
      firebase_uid,
      email,
      organization_id: org.organization_id,
      account_status: 'active',
      is_verified: true,
      role: 'therapist'
    });
    
    // Mark invite code as used
    await markInviteCodeUsed(org_invite_code, user.id);
    
    return res.json({
      success: true,
      user,
      message: 'Registration complete! You can now login.'
    });
  } else {
    // Solo therapist - save to temp table
    const registration = await createTempRegistration({
      ...data,
      firebase_uid,
      email,
      registration_status: 'pending_review'
    });
    
    return res.json({
      success: true,
      registration,
      message: 'Application submitted for review'
    });
  }
});

// GET /api/verification/status/:firebase_uid
router.get('/status/:firebase_uid', async (req, res) => {
  const { firebase_uid } = req.params;
  
  // Check main users table first
  const user = await getUserByFirebaseUid(firebase_uid);
  
  if (user) {
    return res.json({
      status: 'active',
      can_login: user.account_status === 'active',
      user
    });
  }
  
  // Check temp registrations
  const registration = await getTempRegistration(firebase_uid);
  
  if (registration) {
    return res.json({
      status: registration.registration_status,
      workflow_stage: registration.workflow_stage,
      can_login: false,
      message: getStatusMessage(registration.registration_status)
    });
  }
  
  return res.status(404).json({
    status: 'not_found',
    message: 'No registration found'
  });
});
```

---

### **4. Organization Invite System**

```typescript
// Super Admin Dashboard - Create Organization
POST /api/admin/organizations/create
{
  name: "Mindful Therapy Clinic",
  type: "group_practice",
  admin_email: "admin@mindfultherapy.com",
  therapist_count: 10
}

Response:
{
  organization: {
    id: 500,
    name: "Mindful Therapy Clinic"
  },
  admin_user: {
    id: 2000,
    email: "admin@mindfultherapy.com",
    temp_password: "TempPass123!"
  },
  invite_codes: [
    {
      code: "ABC123XYZ",
      link: "https://ataraxia.app/register?org=ABC123XYZ",
      max_uses: 1
    },
    // ... 9 more codes
  ]
}

// Super admin sends emails:
To: admin@mindfultherapy.com
Subject: Welcome to Ataraxia

Your organization has been set up!

Login: https://ataraxia.app/login
Email: admin@mindfultherapy.com
Temp Password: TempPass123!

Invite your therapists using these links:
1. https://ataraxia.app/register?org=ABC123XYZ
2. https://ataraxia.app/register?org=DEF456ABC
...
```

---

### **5. Verification Pending Page**

```typescript
// VerificationPendingPage.tsx
import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';

function VerificationPendingPage() {
  const { user } = useAuth();
  const [status, setStatus] = useState(null);
  
  useEffect(() => {
    const checkStatus = async () => {
      const response = await fetch(
        `/api/verification/status/${user.firebase_uid}`
      );
      const data = await response.json();
      setStatus(data);
    };
    
    checkStatus();
    // Poll every 30 seconds
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, [user.firebase_uid]);
  
  if (!status) return <LoadingSpinner />;
  
  return (
    <div className="verification-pending">
      <h1>🔍 Verification In Progress</h1>
      
      <div className="timeline">
        <Step 
          title="Application Submitted" 
          completed={true}
          date={status.created_at}
        />
        <Step 
          title="Documents Review" 
          completed={status.workflow_stage !== 'registration_submitted'}
          active={status.workflow_stage === 'documents_review'}
        />
        <Step 
          title="Background Check" 
          completed={status.background_check_status === 'completed'}
          active={status.workflow_stage === 'background_check'}
        />
        <Step 
          title="Final Review" 
          active={status.workflow_stage === 'final_review'}
        />
      </div>
      
      <p className="message">{status.message}</p>
      
      <div className="estimated-time">
        Estimated time: 2-5 business days
      </div>
      
      <button onClick={() => window.location.reload()}>
        Refresh Status
      </button>
    </div>
  );
}
```

---

## 📋 **Database Schema Updates**

```sql
-- Add organization mapping to temp registrations
ALTER TABLE ataraxia.temp_therapist_registrations
ADD COLUMN organization_id BIGINT REFERENCES ataraxia.organizations(id),
ADD COLUMN org_invite_code VARCHAR(100);

-- Track which invite code was used
ALTER TABLE ataraxia.organization_invites
ADD COLUMN used_by_registration_id BIGINT REFERENCES ataraxia.temp_therapist_registrations(id);
```

---

## 🎯 **Implementation Priority**

### **Phase 1: Core Registration (Week 1)**
1. ✅ Update TherapistRegistrationForm to handle Google/Apple auto-fill
2. ✅ Create VerificationPendingPage component
3. ✅ Build API endpoints for registration
4. ✅ Integrate with login flow

### **Phase 2: Organization Onboarding (Week 2)**
1. ✅ Build organization creation UI (super admin)
2. ✅ Generate invite codes system
3. ✅ Email templates for invites
4. ✅ Org-code validation in registration

### **Phase 3: Admin Dashboard (Week 3)**
1. ✅ Verification queue UI
2. ✅ Approve/reject functionality
3. ✅ Background check integration
4. ✅ Bulk actions

---

## 📊 **User Flow Matrix**

| Signup Method | Auto-Fill | Org Code | Verification | Immediate Access |
|---------------|-----------|----------|--------------|------------------|
| Email/Password (Solo) | ❌ | ❌ | ✅ Required | ❌ |
| Google (Solo) | ✅ Email, Name | ❌ | ✅ Required | ❌ |
| Apple (Solo) | ✅ Email, Name | ❌ | ✅ Required | ❌ |
| Email/Password (Org) | ❌ | ✅ | ❌ Skip | ✅ |
| Google (Org) | ✅ Email, Name | ✅ | ❌ Skip | ✅ |
| Apple (Org) | ✅ Email, Name | ✅ | ❌ Skip | ✅ |

---

**This is a comprehensive auth system! Ready to start building? 🚀**
