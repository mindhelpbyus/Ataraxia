# Therapist Onboarding & Verification System

## 🎯 **Product Requirements**

### **User Types:**

1. **Solo Therapist** (Individual practitioner)
   - ❌ No pre-verification
   - ✅ Must complete background check
   - ⏳ Pending approval workflow
   - 🔒 Limited access until verified

2. **Organization Therapist** (Part of clinic/practice)
   - ✅ Pre-verified by organization
   - ✅ Immediate access after signup
   - 🔗 Uses organization invite code
   - ✅ Background check done by org

---

## 📊 **User States & Workflow**

### **Solo Therapist Journey:**

```
1. Sign Up (Phone/Google/Email)
   ↓
2. Account Created → Status: "pending_verification"
   ↓
3. Complete Onboarding Form
   - License verification
   - Professional credentials
   - Background check consent
   ↓
4. Background Check Initiated → Status: "verification_in_progress"
   ↓
5. Manual/Automated Review
   ↓
6. Approved → Status: "active"
   OR
   Rejected → Status: "rejected"
   ↓
7. Full Dashboard Access
```

### **Organization Therapist Journey:**

```
1. Receive Invite Link (with org_code)
   ↓
2. Sign Up with Org Code
   ↓
3. Auto-Verified (org already did background check)
   ↓
4. Status: "active" (immediate)
   ↓
5. Full Dashboard Access
```

---

## 🗄️ **Database Schema**

### **1. Users Table (Main)**
```sql
CREATE TABLE ataraxia.users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255),
    phone_number VARCHAR(20),
    firebase_uid VARCHAR(255) UNIQUE,
    
    -- Account Status
    account_status VARCHAR(50) DEFAULT 'pending_verification',
    -- Values: 'pending_verification', 'verification_in_progress', 
    --         'active', 'suspended', 'rejected'
    
    -- Verification
    is_verified BOOLEAN DEFAULT false,
    verified_at TIMESTAMPTZ,
    verified_by BIGINT REFERENCES ataraxia.users(id),
    
    -- Organization Link
    organization_id BIGINT REFERENCES ataraxia.organizations(id),
    org_invite_code VARCHAR(100),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### **2. Therapist Verification Table**
```sql
CREATE TABLE ataraxia.therapist_verifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES ataraxia.users(id),
    
    -- Professional Info
    license_number VARCHAR(100),
    license_state VARCHAR(50),
    license_expiry DATE,
    license_document_url TEXT,
    
    -- Credentials
    degree VARCHAR(100), -- PhD, PsyD, LCSW, etc.
    specializations TEXT[], -- Array of specializations
    years_of_experience INTEGER,
    
    -- Background Check
    background_check_status VARCHAR(50) DEFAULT 'not_started',
    -- Values: 'not_started', 'pending', 'in_progress', 'completed', 'failed'
    background_check_provider VARCHAR(100), -- Checkr, Sterling, etc.
    background_check_id VARCHAR(255), -- External provider ID
    background_check_completed_at TIMESTAMPTZ,
    background_check_result JSONB, -- Store full result
    
    -- Insurance/Liability
    malpractice_insurance_provider VARCHAR(255),
    malpractice_policy_number VARCHAR(100),
    malpractice_expiry DATE,
    
    -- NPI (National Provider Identifier)
    npi_number VARCHAR(20),
    
    -- Verification Status
    verification_status VARCHAR(50) DEFAULT 'pending',
    -- Values: 'pending', 'documents_submitted', 'under_review', 
    --         'approved', 'rejected', 'additional_info_required'
    
    verification_notes TEXT,
    rejection_reason TEXT,
    
    -- Timestamps
    submitted_at TIMESTAMPTZ,
    reviewed_at TIMESTAMPTZ,
    reviewed_by BIGINT REFERENCES ataraxia.users(id),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### **3. Organization Invites Table**
```sql
CREATE TABLE ataraxia.organization_invites (
    id BIGSERIAL PRIMARY KEY,
    organization_id BIGINT NOT NULL REFERENCES ataraxia.organizations(id),
    
    invite_code VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255), -- Optional: specific email
    role VARCHAR(50) DEFAULT 'therapist',
    
    -- Status
    status VARCHAR(50) DEFAULT 'active',
    -- Values: 'active', 'used', 'expired', 'revoked'
    
    max_uses INTEGER DEFAULT 1,
    current_uses INTEGER DEFAULT 0,
    
    expires_at TIMESTAMPTZ,
    created_by BIGINT REFERENCES ataraxia.users(id),
    used_by BIGINT REFERENCES ataraxia.users(id),
    used_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### **4. Verification Audit Log**
```sql
CREATE TABLE ataraxia.verification_audit_log (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES ataraxia.users(id),
    
    action VARCHAR(100) NOT NULL,
    -- Values: 'verification_started', 'documents_uploaded', 
    --         'background_check_initiated', 'approved', 'rejected', etc.
    
    old_status VARCHAR(50),
    new_status VARCHAR(50),
    
    performed_by BIGINT REFERENCES ataraxia.users(id),
    notes TEXT,
    metadata JSONB,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🔐 **Authentication Flow**

### **Scenario 1: Solo Therapist Signup**

```typescript
// 1. User signs up with Phone/Google/Email
POST /api/auth/signup
{
  "email": "therapist@example.com",
  "phone": "+1234567890",
  "firebase_uid": "abc123",
  "role": "therapist",
  "signup_type": "solo" // or "organization"
}

// Backend Response:
{
  "success": true,
  "user": {
    "id": 1001,
    "email": "therapist@example.com",
    "account_status": "pending_verification",
    "is_verified": false,
    "requires_onboarding": true
  },
  "token": "jwt_token_here",
  "next_step": "onboarding" // Redirect to onboarding
}
```

### **Scenario 2: Organization Therapist Signup**

```typescript
// 1. User clicks invite link with org code
// URL: https://ataraxia.app/signup?org_code=ABC123XYZ

// 2. User signs up
POST /api/auth/signup
{
  "email": "therapist@clinic.com",
  "firebase_uid": "xyz789",
  "role": "therapist",
  "org_invite_code": "ABC123XYZ"
}

// Backend validates org code and auto-verifies:
{
  "success": true,
  "user": {
    "id": 1002,
    "email": "therapist@clinic.com",
    "account_status": "active", // ✅ Immediate activation
    "is_verified": true,
    "organization_id": 500,
    "requires_onboarding": false
  },
  "token": "jwt_token_here",
  "next_step": "dashboard" // Direct to dashboard
}
```

---

## 🚦 **Access Control by Status**

### **Status-Based Permissions:**

| Status | Can Login? | Dashboard Access | What They See |
|--------|-----------|------------------|---------------|
| `pending_verification` | ✅ Yes | ❌ No | Onboarding wizard |
| `verification_in_progress` | ✅ Yes | 🔒 Limited | "Verification pending" page |
| `active` | ✅ Yes | ✅ Full | Full dashboard |
| `suspended` | ❌ No | ❌ No | "Account suspended" message |
| `rejected` | ✅ Yes | ❌ No | "Application rejected" page |

### **Frontend Route Guard:**

```typescript
// src/guards/VerificationGuard.tsx
import { useUserRole } from '../hooks/useRoles';

function VerificationGuard({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) return <LoadingSpinner />;
  
  // Check account status
  switch (user.account_status) {
    case 'pending_verification':
      return <Redirect to="/onboarding" />;
      
    case 'verification_in_progress':
      return <VerificationPendingPage />;
      
    case 'active':
      return children; // Full access
      
    case 'suspended':
      return <AccountSuspendedPage />;
      
    case 'rejected':
      return <ApplicationRejectedPage />;
      
    default:
      return <ErrorPage />;
  }
}
```

---

## 📝 **Onboarding Workflow**

### **Step 1: Professional Information**
```typescript
POST /api/therapist/onboarding/professional-info
{
  "license_number": "PSY12345",
  "license_state": "CA",
  "license_expiry": "2027-12-31",
  "degree": "PhD",
  "specializations": ["Anxiety", "Depression", "PTSD"],
  "years_of_experience": 8
}
```

### **Step 2: Upload Documents**
```typescript
POST /api/therapist/onboarding/upload-documents
{
  "license_document": "base64_or_url",
  "malpractice_insurance": "base64_or_url",
  "npi_verification": "base64_or_url"
}
```

### **Step 3: Background Check Consent**
```typescript
POST /api/therapist/onboarding/background-check-consent
{
  "consent": true,
  "ssn_last_4": "1234", // For background check
  "date_of_birth": "1985-05-15"
}

// Backend initiates background check with Checkr/Sterling
// Updates status to "verification_in_progress"
```

### **Step 4: Wait for Approval**
User sees:
```
┌─────────────────────────────────────┐
│  🔍 Verification In Progress        │
│                                     │
│  We're reviewing your application   │
│                                     │
│  ✅ Documents received              │
│  ⏳ Background check in progress    │
│  ⏳ License verification pending    │
│                                     │
│  Estimated time: 2-5 business days  │
└─────────────────────────────────────┘
```

---

## 🤖 **Automated Approval Workflow**

### **Background Check Webhook:**

```typescript
// Checkr/Sterling sends webhook when check completes
POST /api/webhooks/background-check
{
  "provider": "checkr",
  "check_id": "abc123",
  "user_id": 1001,
  "status": "clear", // or "consider", "suspended"
  "result": { /* full report */ }
}

// Backend auto-approves if:
async function handleBackgroundCheckComplete(data) {
  const verification = await getVerification(data.user_id);
  
  // Auto-approve conditions:
  const autoApprove = 
    data.status === 'clear' &&
    verification.license_verified &&
    verification.malpractice_insurance_valid;
  
  if (autoApprove) {
    await approveTherapist(data.user_id);
    await sendEmail(user.email, 'Welcome! Your account is active');
  } else {
    // Flag for manual review
    await flagForManualReview(data.user_id);
  }
}
```

---

## 🔄 **Migration Workflow**

### **Automatic Activation Trigger:**

```sql
-- Trigger function to activate user when approved
CREATE OR REPLACE FUNCTION activate_therapist_on_approval()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.verification_status = 'approved' AND OLD.verification_status != 'approved' THEN
    -- Update user status to active
    UPDATE ataraxia.users
    SET 
      account_status = 'active',
      is_verified = true,
      verified_at = NOW(),
      verified_by = NEW.reviewed_by
    WHERE id = NEW.user_id;
    
    -- Send notification
    INSERT INTO ataraxia.notifications (user_id, type, message)
    VALUES (NEW.user_id, 'account_activated', 'Your account has been activated!');
    
    -- Log the action
    INSERT INTO ataraxia.verification_audit_log (user_id, action, new_status, performed_by)
    VALUES (NEW.user_id, 'approved', 'active', NEW.reviewed_by);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER therapist_approval_trigger
AFTER UPDATE ON ataraxia.therapist_verifications
FOR EACH ROW
EXECUTE FUNCTION activate_therapist_on_approval();
```

---

## 🎨 **UI/UX Flow**

### **Login Experience:**

```typescript
// After successful Firebase auth
const response = await authService.loginWithFirebase(idToken);

if (response.user.account_status === 'pending_verification') {
  // Redirect to onboarding
  navigate('/onboarding');
} else if (response.user.account_status === 'verification_in_progress') {
  // Show pending page
  navigate('/verification-pending');
} else if (response.user.account_status === 'active') {
  // Full dashboard access
  navigate('/dashboard');
} else {
  // Handle other statuses
  navigate(`/account-status/${response.user.account_status}`);
}
```

---

## 📊 **Admin Dashboard Features**

### **Verification Queue:**

```
┌─────────────────────────────────────────────────────┐
│  Pending Verifications (12)                         │
├─────────────────────────────────────────────────────┤
│  Name          | License | BG Check | Status       │
├─────────────────────────────────────────────────────┤
│  Dr. Jane Doe  | ✅      | ⏳       | Under Review │
│  John Smith    | ✅      | ✅       | Ready        │
│  ...           |         |          |              │
└─────────────────────────────────────────────────────┘

Actions:
- [Approve] [Reject] [Request More Info]
```

---

## 🔒 **Security Considerations**

1. **Data Encryption:**
   - SSN, DOB encrypted at rest
   - Background check results in secure JSONB

2. **Access Control:**
   - Only super_admin can approve/reject
   - Audit log for all verification actions

3. **Compliance:**
   - HIPAA-compliant document storage
   - Background check provider must be FCRA-compliant

4. **Rate Limiting:**
   - Prevent spam signups
   - Limit verification attempts

---

## 📋 **Summary**

### **Solo Therapist:**
1. Sign up → `pending_verification`
2. Complete onboarding
3. Background check → `verification_in_progress`
4. Auto/manual approval → `active`
5. Full access

### **Org Therapist:**
1. Sign up with org code
2. Auto-verified → `active`
3. Immediate full access

### **Key Tables:**
- `users` - Main user data + status
- `therapist_verifications` - Verification details
- `organization_invites` - Org invite codes
- `verification_audit_log` - Audit trail

**This ensures compliance, security, and a smooth onboarding experience! 🚀**
