# Current "Register for Free" Flow & What We Need to Build

## 🔍 **Current State**

### **What Exists:**
1. **LoginPage.tsx** - Has "Register for Free" button
2. **ComprehensiveClientRegistrationForm.tsx** - Existing registration form (for clients)
3. **Database** - `temp_therapist_registrations` table ready

### **What's Missing:**
1. ❌ Therapist registration form (separate from client form)
2. ❌ API endpoint to save registration data
3. ❌ Verification pending page to show status
4. ❌ Status checking logic in login flow

---

## 📊 **Complete Flow - What Should Happen**

### **STEP 1: User Clicks "Register for Free"**

**Current:** Button exists but `onRegisterTherapist` handler not implemented

**Should Do:**
```typescript
// In App.tsx or main router
const handleRegisterTherapist = () => {
  navigate('/register-therapist');
};
```

---

### **STEP 2: User Fills Registration Form**

**Page:** `/register-therapist`

**Form Fields (from ComprehensiveClientRegistrationForm):**
```typescript
// Personal Information
- First Name
- Last Name
- Email
- Phone Number
- Date of Birth

// Professional Information
- License Number
- License State
- License Type (LCSW, PhD, PsyD, etc.)
- License Expiry Date
- Degree
- Specializations (multi-select)
- Years of Experience
- NPI Number

// Practice Information
- Practice Name
- Practice Type (solo, group, hospital)

// Insurance
- Malpractice Insurance Provider
- Policy Number
- Expiry Date

// Documents Upload
- License Document
- Degree Certificate
- Malpractice Insurance Certificate
- Photo ID

// Background Check Consent
- Checkbox: "I consent to background check"
```

**On Submit:**
```typescript
POST /api/verification/register
{
  firebase_uid: user.uid,
  email: "therapist@example.com",
  first_name: "John",
  last_name: "Doe",
  // ... all fields
}

Response:
{
  success: true,
  registration: {
    id: 123,
    status: "pending_review",
    message: "Your application is under review..."
  }
}
```

**Data Stored In:** `ataraxia.temp_therapist_registrations` table

---

### **STEP 3: User Tries to Login**

**Flow:**
```typescript
// User logs in with Phone/Google/Email
const firebaseUser = await signInWithPopup(auth, googleProvider);
const firebase_uid = firebaseUser.uid;

// Backend checks if user exists
const existingUser = await getUserByFirebaseUid(firebase_uid);

if (existingUser && existingUser.account_status === 'active') {
  // User is approved, login normally
  navigate('/dashboard');
} else {
  // Check temp registration status
  const status = await checkRegistrationStatus(firebase_uid);
  
  if (status.registration) {
    // Show verification pending page
    navigate('/verification-pending');
  } else {
    // No registration found, show register form
    navigate('/register-therapist');
  }
}
```

---

### **STEP 4: Verification Pending Page**

**Page:** `/verification-pending`

**What User Sees:**

```
┌─────────────────────────────────────────────────┐
│  🔍 Verification In Progress                    │
│                                                 │
│  Hi Dr. Johnson,                                │
│                                                 │
│  Thank you for applying to join Ataraxia!       │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │ ✅ Application Submitted                │   │
│  │    Jan 1, 2026                          │   │
│  ├─────────────────────────────────────────┤   │
│  │ ⏳ Documents Review                     │   │
│  │    In Progress...                       │   │
│  ├─────────────────────────────────────────┤   │
│  │ ⏳ Background Check                     │   │
│  │    Pending                              │   │
│  ├─────────────────────────────────────────┤   │
│  │ ⏳ Final Review                         │   │
│  │    Pending                              │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  Estimated Time: 2-5 business days              │
│                                                 │
│  We'll email you once your application has      │
│  been reviewed.                                 │
│                                                 │
│  Questions? Contact support@ataraxia.app        │
└─────────────────────────────────────────────────┘
```

**Data Source:**
```typescript
GET /api/verification/status/{firebase_uid}

Response:
{
  registration: {
    id: 123,
    status: "pending_review",
    workflow_stage: "documents_review",
    background_check_status: "not_started",
    can_login: false,
    message: "Your application is under review..."
  }
}
```

---

### **STEP 5: Admin Reviews Application**

**Admin Dashboard:** `/admin/verification-queue`

**What Admin Sees:**

```
┌─────────────────────────────────────────────────────────┐
│  Pending Verifications (12)                             │
├─────────────────────────────────────────────────────────┤
│  Name          | License    | BG Check | Actions        │
├─────────────────────────────────────────────────────────┤
│  Dr. Jane Doe  | PSY-CA-123 | ⏳       | [View] [Approve]│
│  John Smith    | LCSW-NY-45 | ✅       | [View] [Approve]│
│  ...           |            |          |                │
└─────────────────────────────────────────────────────────┘
```

**Admin Actions:**
1. **View Details** - See full application
2. **Initiate Background Check** - Start Checkr/Sterling check
3. **Approve** - Migrate to main users table
4. **Reject** - Deny application
5. **Request More Info** - Ask for additional documents

---

### **STEP 6: Background Check Process**

**Automated Workflow:**

```typescript
// Admin clicks "Initiate Background Check"
POST /api/verification/{id}/background-check

// Backend calls Checkr/Sterling API
const checkrResponse = await checkr.createBackgroundCheck({
  candidate: {
    first_name: "John",
    last_name: "Doe",
    email: "john@example.com",
    ssn: "***-**-1234"
  }
});

// Update database
UPDATE temp_therapist_registrations
SET 
  background_check_status = 'in_progress',
  background_check_id = checkrResponse.id,
  workflow_stage = 'background_check'
WHERE id = 123;

// Checkr sends webhook when complete
POST /api/webhooks/background-check
{
  id: "check_123",
  status: "clear",
  result: { /* full report */ }
}

// Auto-update database
UPDATE temp_therapist_registrations
SET 
  background_check_status = 'completed',
  background_check_result = {...},
  workflow_stage = 'final_review'
WHERE background_check_id = 'check_123';
```

---

### **STEP 7: Approval & Migration**

**Admin clicks "Approve":**

```typescript
POST /api/verification/{id}/approve

// Backend calls stored procedure
SELECT approve_and_migrate_therapist(123, admin_user_id);

// This function:
1. Creates user in main users table
2. Assigns therapist role
3. Sets account_status = 'active'
4. Updates temp table to 'approved'
5. Sends approval email

// User receives email:
Subject: Welcome to Ataraxia! 🎉

Hi Dr. Johnson,

Congratulations! Your application has been approved.

You can now log in and access your therapist dashboard.

Login here: https://ataraxia.app/login

Welcome to the team!
```

---

### **STEP 8: User Logs In (After Approval)**

```typescript
// User logs in
const firebaseUser = await signInWithPopup(auth, googleProvider);

// Backend checks status
const user = await getUserByFirebaseUid(firebaseUser.uid);

if (user && user.account_status === 'active') {
  // ✅ User is approved!
  onLogin(user);
  navigate('/dashboard');
}
```

---

## 🗄️ **Data Storage**

### **Before Approval:**
```sql
-- Data in temp_therapist_registrations table
SELECT * FROM ataraxia.temp_therapist_registrations 
WHERE firebase_uid = 'abc123';

-- Result:
id: 123
firebase_uid: abc123
email: therapist@example.com
first_name: John
last_name: Doe
license_number: PSY-CA-12345
registration_status: pending_review
workflow_stage: documents_review
background_check_status: not_started
created_at: 2026-01-01 10:00:00
```

### **After Approval:**
```sql
-- Data migrated to users table
SELECT * FROM ataraxia.users 
WHERE firebase_uid = 'abc123';

-- Result:
id: 1000005
firebase_uid: abc123
email: therapist@example.com
first_name: John
last_name: Doe
role: therapist
account_status: active
is_verified: true
is_active: true

-- Temp table updated
SELECT * FROM ataraxia.temp_therapist_registrations 
WHERE id = 123;

-- Result:
registration_status: approved
workflow_stage: approved
approved_at: 2026-01-01 15:00:00
approved_by: 1 (admin user id)
```

---

## 📱 **User Experience Timeline**

```
Day 1, 10:00 AM - User registers
   ↓
   User sees: "Application submitted! We'll review within 2-5 days"
   Email sent: "Application received"

Day 1, 2:00 PM - Admin reviews documents
   ↓
   Status: documents_review → documents_verified

Day 2, 10:00 AM - Background check initiated
   ↓
   User sees: "Background check in progress"
   Email sent: "Background check started"

Day 4, 3:00 PM - Background check complete
   ↓
   Status: background_check_completed

Day 4, 4:00 PM - Admin approves
   ↓
   User migrated to main table
   Email sent: "Welcome! You're approved!"

Day 4, 4:05 PM - User logs in
   ↓
   User sees: Full therapist dashboard ✅
```

---

## 🎯 **What We Need to Build**

### **Frontend:**
1. ✅ **TherapistRegistrationForm.tsx** - Registration form
2. ✅ **VerificationPendingPage.tsx** - Status page
3. ✅ **AdminVerificationQueue.tsx** - Admin dashboard
4. ✅ **Login flow integration** - Check status on login

### **Backend:**
1. ✅ **POST /api/verification/register** - Save registration
2. ✅ **GET /api/verification/status/:firebase_uid** - Check status
3. ✅ **POST /api/verification/:id/approve** - Approve therapist
4. ✅ **POST /api/verification/:id/reject** - Reject application
5. ✅ **POST /api/verification/:id/background-check** - Initiate BG check
6. ✅ **GET /api/verification/pending** - Admin queue

### **Database:**
1. ✅ **temp_therapist_registrations** - Already created
2. ✅ **verification_workflow_log** - Already created
3. ✅ **Functions** - Already created

---

## 📋 **Summary**

**Current State:**
- ✅ Database ready
- ✅ Backend functions ready
- ❌ Frontend forms not built
- ❌ API endpoints not built
- ❌ Login flow not integrated

**Next Steps:**
1. Build TherapistRegistrationForm component
2. Build VerificationPendingPage component
3. Create verification service endpoints
4. Integrate with login flow
5. Build admin verification queue

**Data Flow:**
```
Register → temp_therapist_registrations → Admin Review → 
Background Check → Approval → users table → Login ✅
```

---

**Ready to build the frontend components! 🚀**
