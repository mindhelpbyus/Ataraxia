# Connecting Existing Forms to Verification System

## 📋 **What We Already Have**

### **1. TherapistOnboarding.tsx** ✅
- **Location:** `/src/components/onboarding/TherapistOnboarding.tsx`
- **Features:**
  - 10-step comprehensive onboarding
  - Google/Apple OAuth support
  - All professional fields (license, credentials, etc.)
  - Document uploads
  - Already has `handleOAuthSignup()` function

### **2. "Add Therapist" Button** ✅
- **Location:** `/src/components/EnhancedTherapistsTable.tsx` (line 305)
- **Current:** Just a button, no action
- **Needs:** Connect to TherapistOnboarding

### **3. "Register for Free" Button** ✅
- **Location:** `/src/components/LoginPage.tsx` (line 601)
- **Current:** Has `onRegisterTherapist` prop
- **Needs:** Connect to TherapistOnboarding

---

## 🔌 **How to Connect Everything**

### **Step 1: Update TherapistOnboarding to Use Verification API**

The form already exists, we just need to connect it to our new verification service:

```typescript
// In TherapistOnboarding.tsx

import { verificationService } from '../../api/services/verification';

// Update the handleSubmit function (around line 324)
const handleSubmit = async () => {
  try {
    setIsSubmitting(true);
    
    // Check if user has org_invite_code (from URL or form)
    const urlParams = new URLSearchParams(window.location.search);
    const orgCode = urlParams.get('org') || onboardingData.org_invite_code;
    
    // Prepare data for verification service
    const registrationData = {
      firebase_uid: auth.currentUser?.uid || '',
      email: onboardingData.email,
      phone_number: onboardingData.phoneNumber,
      first_name: onboardingData.firstName,
      last_name: onboardingData.lastName,
      date_of_birth: onboardingData.dateOfBirth,
      license_number: onboardingData.licenseNumber,
      license_state: onboardingData.licenseState,
      license_type: onboardingData.licenseType,
      license_expiry: onboardingData.licenseExpiry,
      degree: onboardingData.highestDegree,
      specializations: onboardingData.specializations,
      years_of_experience: onboardingData.yearsOfExperience,
      practice_name: onboardingData.practiceName,
      npi_number: onboardingData.npiNumber,
      malpractice_insurance_provider: onboardingData.malpracticeProvider,
      malpractice_policy_number: onboardingData.malpracticePolicyNumber,
      malpractice_expiry: onboardingData.malpracticeExpiry,
      background_check_consent: onboardingData.backgroundCheckConsent || true,
      org_invite_code: orgCode,
      profile_image_url: onboardingData.headshot,
      signup_method: onboardingData.signupMethod || 'email'
    };
    
    // Call verification service
    const result = await verificationService.registerTherapist(registrationData);
    
    if (result.success) {
      if (result.can_login) {
        // Organization therapist - can login immediately
        logger.info('Organization therapist registered', { user_id: result.user?.id });
        navigate('/login', { 
          state: { 
            message: 'Registration complete! You can now login.',
            email: onboardingData.email
          }
        });
      } else {
        // Solo therapist - needs verification
        logger.info('Solo therapist registration submitted', { 
          registration_id: result.registration?.id 
        });
        navigate('/verification-pending');
      }
    }
  } catch (error) {
    logger.error('Registration failed', { error });
    // Show error message
  } finally {
    setIsSubmitting(false);
  }
};
```

### **Step 2: Update handleOAuthSignup for Google/Apple**

The function already exists (line 342), just enhance it:

```typescript
// In TherapistOnboarding.tsx (line 342)
const handleOAuthSignup = async (
  email: string, 
  displayName: string, 
  uid: string, 
  method: 'google' | 'apple'
) => {
  // Auto-fill data from Google/Apple
  const [firstName, ...lastNameParts] = displayName.split(' ');
  const lastName = lastNameParts.join(' ');
  
  updateData({
    email,
    firstName,
    lastName,
    fullName: displayName,
    isVerified: true,
    signupMethod: method
  });
  
  // Skip to step 2 (professional info) since basic info is filled
  setCurrentStep(2);
};
```

### **Step 3: Connect "Register for Free" Button**

```typescript
// In LoginPage.tsx
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const navigate = useNavigate();
  
  const handleRegisterTherapist = () => {
    navigate('/register-therapist');
  };
  
  return (
    // ... existing code
    <Button onClick={handleRegisterTherapist}>
      Register for free
    </Button>
  );
}
```

### **Step 4: Connect "Add Therapist" Button**

```typescript
// In EnhancedTherapistsTable.tsx (line 303)
import { useNavigate } from 'react-router-dom';

function EnhancedTherapistsTable({ userRole, organizationId }: EnhancedTherapistsTableProps) {
  const navigate = useNavigate();
  
  const handleAddTherapist = () => {
    if (userRole === 'org_admin' && organizationId) {
      // Generate org invite code first
      // Then navigate with code
      navigate(`/register-therapist?org=${orgInviteCode}`);
    } else {
      // Super admin or regular add
      navigate('/register-therapist');
    }
  };
  
  return (
    // ... existing code (line 303)
    <Button 
      onClick={handleAddTherapist}
      className="bg-primary hover:bg-primary/90..."
    >
      <Plus className="h-4 w-4 mr-2" />
      Add Therapist
    </Button>
  );
}
```

### **Step 5: Add Route for Registration**

```typescript
// In App.tsx or your router file
import { TherapistOnboarding } from './components/onboarding/TherapistOnboarding';

<Route 
  path="/register-therapist" 
  element={<TherapistOnboarding />} 
/>
```

---

## 🎯 **Complete User Flows**

### **Flow 1: Solo Therapist via "Register for Free"**

```
User clicks "Register for Free" on LoginPage
   ↓
Navigate to /register-therapist
   ↓
TherapistOnboarding component loads
   ↓
User can choose:
   • Email/Password signup
   • Google signup (auto-fills name, email)
   • Apple signup (auto-fills name, email)
   ↓
Complete 10-step onboarding form
   ↓
Submit → POST /api/verification/register (no org_code)
   ↓
Saved to temp_therapist_registrations
   ↓
Navigate to /verification-pending
   ↓
User sees: "Your application is under review"
```

### **Flow 2: Organization Therapist via "Add Therapist"**

```
Admin clicks "Add Therapist" in EnhancedTherapistsTable
   ↓
Generate org invite code (if org_admin)
   ↓
Navigate to /register-therapist?org=ABC123XYZ
   ↓
TherapistOnboarding loads with org_code in URL
   ↓
User completes form (minimal fields needed)
   ↓
Submit → POST /api/verification/register (with org_code)
   ↓
Validates org_code
   ↓
Creates user in main users table (immediate)
   ↓
Navigate to /login
   ↓
User can login immediately ✅
```

### **Flow 3: Google/Apple Signup**

```
User clicks "Sign up with Google" on LoginPage
   ↓
Google auth popup
   ↓
Extract: email, name, photo
   ↓
Navigate to /register-therapist with prefilled data
   ↓
TherapistOnboarding auto-fills:
   • Email ✅
   • First Name ✅
   • Last Name ✅
   • Profile Photo ✅
   ↓
User completes remaining fields (license, etc.)
   ↓
Submit to verification service
```

---

## 📝 **What Needs to be Added**

### **1. VerificationPendingPage Component** (NEW)

```typescript
// Create: /src/components/VerificationPendingPage.tsx

import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { verificationService } from '../api/services/verification';

export function VerificationPendingPage() {
  const { user } = useAuth();
  const [status, setStatus] = useState(null);
  
  useEffect(() => {
    const checkStatus = async () => {
      const result = await verificationService.getRegistrationStatus(user.firebase_uid);
      setStatus(result);
    };
    
    checkStatus();
    const interval = setInterval(checkStatus, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [user]);
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <h1>🔍 Verification In Progress</h1>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <TimelineStep 
              title="Application Submitted" 
              completed={true}
            />
            <TimelineStep 
              title="Documents Review" 
              active={status?.workflow_stage === 'documents_review'}
            />
            <TimelineStep 
              title="Background Check" 
              active={status?.workflow_stage === 'background_check'}
            />
            <TimelineStep 
              title="Final Review" 
              active={status?.workflow_stage === 'final_review'}
            />
          </div>
          
          <p className="mt-6 text-center">{status?.message}</p>
          <p className="text-sm text-muted-foreground text-center">
            Estimated time: 2-5 business days
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
```

### **2. Update Login Flow to Check Status**

```typescript
// In LoginPage.tsx or auth handler

const handleLoginSuccess = async (firebaseUser) => {
  // Check if user exists and is active
  const status = await verificationService.getRegistrationStatus(firebaseUser.uid);
  
  if (status.can_login) {
    // User is approved, proceed to dashboard
    onLogin(status.user);
    navigate('/dashboard');
  } else {
    // User is pending verification
    navigate('/verification-pending');
  }
};
```

---

## ✅ **Summary**

**What We Have:**
- ✅ TherapistOnboarding.tsx (comprehensive 10-step form)
- ✅ Google/Apple OAuth support
- ✅ "Register for Free" button
- ✅ "Add Therapist" button
- ✅ Verification backend service
- ✅ Verification API service (frontend)

**What We Need to Do:**
1. ✅ Connect TherapistOnboarding to verification service API
2. ✅ Add navigation handlers to buttons
3. ✅ Create VerificationPendingPage component
4. ✅ Update login flow to check verification status
5. ✅ Add route for /register-therapist

**All the heavy lifting is done! We just need to wire everything together! 🚀**
