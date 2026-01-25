# Verification Pending Page Issue - Analysis & Fix

## Issue
Therapist user `aishwarya.viswanathan@ataraxia.com` was seeing the onboarding page instead of the verification-pending page after login.

## Root Cause Analysis

### Database Status
```
Account Status: onboarding_pending
Verification Stage: registration_submitted
Onboarding Status: pending
Is Active: false
Is Verified: false
```

### The Problem
In `LoginPage.tsx`, the `account_status` to `onboardingStatus` mapping was incorrect:

**Before (Lines 133-145):**
```typescript
if (accountStatus === 'pending_verification' ||
    accountStatus === 'documents_review' ||
    accountStatus === 'background_check') {
  onboardingStatus = 'pending';  // → Shows verification-pending page
} else if (accountStatus === 'onboarding_pending' || 
           accountStatus === 'incomplete_registration') {
  onboardingStatus = 'incomplete';  // → Shows onboarding/register page ❌
}
```

This caused `onboarding_pending` status to be mapped to `'incomplete'`, which in `App.tsx` (line 114-115) routes to the `register` view (onboarding page).

### Expected Behavior
According to `App.tsx` routing logic (lines 108-122):
- `onboardingStatus = 'pending'` → `verification-pending` page ✅
- `onboardingStatus = 'incomplete'` → `register` page (onboarding) ❌
- `onboardingStatus = 'active'` → `dashboard` page

## The Fix

Updated the mapping in `LoginPage.tsx` to correctly categorize verification-related statuses:

**After:**
```typescript
if (accountStatus === 'pending_verification' ||
    accountStatus === 'documents_review' ||
    accountStatus === 'background_check' ||
    accountStatus === 'onboarding_pending' ||        // ✅ Moved here
    accountStatus === 'registration_submitted' ||
    accountStatus === 'final_review' ||
    accountStatus === 'account_created') {
  onboardingStatus = 'pending';  // → Shows verification-pending page ✅
} else if (accountStatus === 'incomplete_registration' || 
           accountStatus === 'draft') {
  onboardingStatus = 'incomplete';  // → Shows onboarding page
}
```

## Status Categorization

### Verification/Pending Statuses (Show verification-pending page):
- `pending_verification`
- `documents_review`
- `background_check`
- `onboarding_pending` ✅ **Fixed**
- `registration_submitted` ✅ **Added**
- `final_review`
- `account_created`

### Incomplete/Draft Statuses (Show onboarding page):
- `incomplete_registration`
- `draft`

### Active Statuses (Show dashboard):
- `active`
- `approved`

## Files Modified
1. `/Users/cvp/anti-gravity/Ataraxia/src/components/LoginPage.tsx` (Lines 133-149)
2. `/Users/cvp/anti-gravity/Ataraxia/src/components/LoginPage.tsx` (Lines 565-580) - Google login flow

## Testing
After this fix, when `aishwarya.viswanathan@ataraxia.com` logs in:
1. Backend returns `account_status: 'onboarding_pending'`
2. Frontend maps it to `onboardingStatus: 'pending'`
3. `App.tsx` routes to `verification-pending` page ✅

## Prevention
This fix ensures all verification-related statuses consistently route to the verification-pending page, while only truly incomplete registrations route to the onboarding page.
