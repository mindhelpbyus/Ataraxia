# 🔐 Client Self-Registration Testing Guide

## Overview

The **Client Self-Registration** feature allows clients to securely register themselves through a two-step verification process. This guide provides comprehensive instructions for testing the functionality with sample users.

---

## 🚀 Quick Start

### Access the Test Page

1. **Login as Admin or Super Admin**
2. **Navigate to the test page** (will be added to dashboard)
3. **Select a test scenario** from the available sample clients
4. **Complete the registration flow**

---

## 👥 Sample Test Clients

### Test Client #1: Sarah Johnson (Happy Path)
- **Scenario:** Complete all fields correctly, verify via email
- **Email:** `sarah.johnson@test.com`
- **Phone:** `+1 (555) 100-0001`
- **Token:** `TOKEN-SARAH-12345-SECURE`
- **Purpose:** Test the standard, successful registration flow

**Test Steps:**
1. Click "Test This Scenario" for Sarah Johnson
2. Choose Email verification
3. Enter test OTP: `123456`
4. Fill all required fields
5. Add optional information (address, DOB)
6. Create a strong password
7. Submit and verify success

---

### Test Client #2: Michael Chen (SMS Verification)
- **Scenario:** Uses SMS/phone verification instead of email
- **Email:** `michael.chen@test.com`
- **Phone:** `+1 (555) 100-0002`
- **Token:** `TOKEN-MICHAEL-67890-SECURE`
- **Purpose:** Test SMS/phone-based OTP verification

**Test Steps:**
1. Select Michael Chen scenario
2. Choose SMS/Phone verification
3. Enter test OTP: `111111`
4. Complete registration via SMS path
5. Verify SMS workflow functions correctly

---

### Test Client #3: Emily Rodriguez (Minimal Info)
- **Scenario:** Only provides required fields, no optional data
- **Email:** `emily.rodriguez@test.com`
- **Phone:** `+1 (555) 100-0003`
- **Token:** `TOKEN-EMILY-11111-SECURE`
- **Purpose:** Test minimum viable registration

**Test Steps:**
1. Select Emily Rodriguez scenario
2. Verify via email (OTP: `000000`)
3. Fill ONLY required fields:
   - First Name: Emily
   - Last Name: Rodriguez
   - Date of Birth
   - Password
4. Skip all optional fields
5. Submit and verify system accepts minimal data

---

### Test Client #4: James Williams (Complete Profile)
- **Scenario:** Fills out all optional fields including insurance
- **Email:** `james.williams@test.com`
- **Phone:** `+1 (555) 100-0004`
- **Token:** `TOKEN-JAMES-22222-SECURE`
- **Purpose:** Test comprehensive profile with all fields

**Test Steps:**
1. Select James Williams scenario
2. Complete email verification
3. Fill ALL fields including:
   - Personal Information
   - Full Address
   - Insurance Information
   - Primary Insurance details
   - Emergency Contact
4. Verify all fields save correctly

**Sample Data to Use:**
```
First Name: James
Last Name: Williams
Date of Birth: 01/15/1985
Address: 123 Main Street
City: Los Angeles
State: California
Zip: 90001

Insurance: Yes
Insurance Provider: Blue Cross Blue Shield
Member ID: BC123456789
Group Number: GRP-001
Subscriber Name: James Williams
Subscriber DOB: 01/15/1985
Relationship: Self

Emergency Contact: Jane Williams
Relationship: Spouse
Phone: +1 (555) 999-0001
```

---

### Test Client #5: Maria Garcia (Self-Pay)
- **Scenario:** No insurance, self-pay client
- **Email:** `maria.garcia@test.com`
- **Phone:** `+1 (555) 100-0005`
- **Token:** `TOKEN-MARIA-33333-SECURE`
- **Purpose:** Test clients without insurance

**Test Steps:**
1. Select Maria Garcia scenario
2. Complete verification
3. Fill personal info
4. **Toggle insurance to "No"**
5. Verify insurance fields disappear
6. Complete registration without insurance

---

## 🧪 Mock OTP Codes for Testing

Since this is a demo/testing environment, use these mock OTP codes:

| OTP Code | Purpose |
|----------|---------|
| `123456` | Standard test code |
| `111111` | Alternative test code |
| `000000` | Fallback test code |

**Note:** In production, real OTP codes are sent via email/SMS.

---

## ✅ Validation Checklist

### Step 1: OTP Verification
- [ ] OTP input accepts 6 digits
- [ ] Correct OTP allows progression
- [ ] Incorrect OTP shows error
- [ ] Can resend OTP
- [ ] Can switch between email/SMS
- [ ] Timer shows remaining time

### Step 2: Personal Information
- [ ] Name fields are pre-filled from invitation
- [ ] Date of Birth picker works
- [ ] Required field validation works
- [ ] Gender selection available (optional)

### Step 3: Contact & Address
- [ ] Email is pre-filled and read-only
- [ ] Phone is pre-filled and read-only
- [ ] Address fields optional but validated if filled
- [ ] State dropdown works
- [ ] Zip code format validated

### Step 4: Insurance
- [ ] Toggle shows/hides insurance fields
- [ ] All insurance fields present when enabled
- [ ] Relationship dropdown works
- [ ] Date picker for subscriber DOB

### Step 5: Emergency Contact
- [ ] Can add emergency contact (optional)
- [ ] Phone number format validation
- [ ] Relationship field works

### Step 6: Account Security
- [ ] Password strength indicator works
- [ ] Password requirements shown:
  - [ ] Minimum 8 characters
  - [ ] At least one uppercase letter
  - [ ] At least one lowercase letter
  - [ ] At least one number
  - [ ] At least one special character
- [ ] Confirm password validation
- [ ] Passwords must match
- [ ] Show/hide password toggle works

---

## 🔍 Test Scenarios & Cases

### Positive Test Cases (Should Succeed)

#### 1. Complete Happy Path
- Use Sarah Johnson
- Verify via email
- Fill all required fields with valid data
- Create strong password
- Submit successfully

#### 2. Minimal Registration
- Use Emily Rodriguez
- Provide only required fields
- Should complete successfully

#### 3. SMS Verification Path
- Use Michael Chen
- Choose SMS verification
- Complete with phone OTP

#### 4. With Insurance
- Use James Williams
- Enable insurance toggle
- Fill all insurance fields
- Verify insurance data saves

#### 5. Self-Pay Client
- Use Maria Garcia
- Disable insurance toggle
- Complete without insurance
- Verify registration succeeds

---

### Negative Test Cases (Should Show Errors)

#### 1. Invalid OTP
- Enter wrong OTP code (e.g., `999999`)
- **Expected:** Error message "Invalid OTP code"
- **Action:** Try again with correct code

#### 2. Weak Password
- Try passwords:
  - `12345678` (no uppercase/special)
  - `password` (too common)
  - `Pass1!` (too short)
- **Expected:** Password strength error
- **Action:** Use strong password

#### 3. Missing Required Fields
- Leave Date of Birth empty
- Leave Password empty
- **Expected:** Validation errors
- **Action:** Fill required fields

#### 4. Password Mismatch
- Enter different passwords in confirm field
- **Expected:** "Passwords do not match" error
- **Action:** Make passwords match

#### 5. Invalid Email Format (if editable)
- Try: `notanemail`
- **Expected:** Email format validation
- **Action:** Use valid email

#### 6. Invalid Phone Format
- Try: `123` or `abc`
- **Expected:** Phone format validation
- **Action:** Use valid phone format

---

## 🔐 Security Testing

### Token Validation
- [ ] Token is required to access form
- [ ] Invalid tokens are rejected
- [ ] Expired tokens show error (if implemented)
- [ ] Token can only be used once (if implemented)

### Data Protection
- [ ] Passwords are masked by default
- [ ] No sensitive data in URL after submission
- [ ] No console errors revealing sensitive info
- [ ] SSL/HTTPS in production

### OTP Security
- [ ] OTP expires after time limit
- [ ] Limited number of retry attempts
- [ ] OTP codes are single-use
- [ ] Different OTP for each verification attempt

---

## 📱 Responsive Testing

Test the registration form on multiple devices:

- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

**Check:**
- All fields are accessible
- Buttons are tappable
- Form doesn't overflow
- Date pickers work on mobile
- Dropdowns work properly

---

## 🐛 Known Issues & Limitations

### Current Test Environment Limitations:

1. **Mock OTP Codes:** Using hardcoded test codes instead of real email/SMS
2. **No Real Email/SMS:** Email and SMS services are mocked for testing
3. **Token Generation:** Tokens are pre-generated, not dynamically created
4. **No Database:** Registration data is not persisted (demo only)

### To Test in Production:

1. **Enable Firebase Email/SMS:** Configure Firebase Authentication
2. **Connect Backend API:** Integrate with 60+ backend endpoints
3. **Enable Token Generation:** Implement secure token generation API
4. **Database Integration:** Connect to Firestore for data persistence

---

## 🎯 Testing Goals

### For Each Scenario, Verify:

1. **User Experience**
   - Form is intuitive and easy to use
   - Error messages are clear and helpful
   - Success feedback is prominent
   - Navigation between steps is smooth

2. **Data Accuracy**
   - Pre-filled data is correct
   - User-entered data is validated
   - All fields save properly
   - No data loss between steps

3. **Security**
   - OTP verification works correctly
   - Passwords meet requirements
   - Sensitive data is protected
   - Tokens are validated

4. **Edge Cases**
   - Handles missing optional fields
   - Validates required fields
   - Graceful error handling
   - Network issues handled (future)

---

## 📊 Test Report Template

After testing, document results:

```markdown
## Test Report - [Date]

### Tester: [Your Name]
### Test Environment: [Development/Staging]

### Test Scenario: [Client Name - Scenario]

#### Results:
- OTP Verification: ✅ / ❌
- Form Validation: ✅ / ❌
- Data Submission: ✅ / ❌
- Success Message: ✅ / ❌

#### Issues Found:
1. [Issue description]
2. [Issue description]

#### Notes:
[Any additional observations]
```

---

## 🔄 How to Reset Tests

Between test scenarios:

1. Click the **"Reset Test"** button in the test info header
2. This returns you to the test scenario selection page
3. Select a different test client to try another scenario
4. Or re-test the same scenario with different data

---

## 🚀 Next Steps After Testing

Once testing is complete and you're satisfied:

1. **Document any bugs** found during testing
2. **Verify fixes** for any issues discovered
3. **Conduct user acceptance testing** with real users
4. **Prepare for production deployment:**
   - Enable real email/SMS services
   - Connect to backend APIs
   - Implement token generation
   - Set up database persistence
   - Configure security certificates
   - Test in staging environment

---

## 💡 Tips for Effective Testing

1. **Test one scenario at a time** - Focus on quality over speed
2. **Document everything** - Take screenshots of errors
3. **Try edge cases** - Invalid data, empty fields, etc.
4. **Test different browsers** - Chrome, Firefox, Safari, Edge
5. **Test mobile devices** - Real phones, not just browser emulation
6. **Clear cache between tests** - Avoid false positives
7. **Check console for errors** - Open browser DevTools
8. **Time the flow** - Ensure it's not too slow

---

## 📞 Support

If you encounter issues during testing:

1. **Check the browser console** for error messages
2. **Verify test OTP codes** are being used correctly
3. **Try a different test scenario** to isolate the issue
4. **Reset the test** and try again
5. **Document the issue** with screenshots and steps to reproduce

---

## ✨ Success Criteria

The Client Registration feature is ready for production when:

- ✅ All 5 test scenarios complete successfully
- ✅ All validation checklist items pass
- ✅ All positive test cases succeed
- ✅ All negative test cases show appropriate errors
- ✅ Security testing passes
- ✅ Responsive testing passes on all devices
- ✅ No critical bugs remaining
- ✅ User experience is smooth and intuitive

---

**Last Updated:** November 28, 2024  
**Version:** 1.0  
**Status:** Ready for Testing
