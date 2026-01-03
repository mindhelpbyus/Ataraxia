# 🎯 Client Registration - Testing Quick Reference Card

## 🚀 START HERE

### Step 1: Open Test Page
```typescript
// Navigate to or import:
<ClientRegistrationTestPage />
```

### Step 2: Pick a Client & Click "Test This Scenario"
```
Sarah Johnson (Happy Path) ← START WITH THIS ONE
```

### Step 3: Enter OTP
```
123456
```

### Step 4: Fill Form
```
Date of Birth: 01/15/1990
Password: SecurePass123!
Confirm: SecurePass123!
```

### Step 5: Submit ✅

---

## 📝 Cheat Sheet

### Mock OTP Codes
```
123456  |  111111  |  000000
```

### Test Password
```
SecurePass123!
```

### Quick Address (Optional)
```
123 Main Street, Los Angeles, CA 90001
```

---

## 👥 5 Test Clients

| # | Name | Scenario | OTP |
|---|------|----------|-----|
| 1 | Sarah Johnson | Happy path - Complete all | `123456` |
| 2 | Michael Chen | SMS verification | `111111` |
| 3 | Emily Rodriguez | Minimal fields only | `000000` |
| 4 | James Williams | Everything + insurance | `123456` |
| 5 | Maria Garcia | Self-pay (no insurance) | `111111` |

---

## ✅ Quick Checklist

While testing, verify:
- [ ] OTP works
- [ ] Name pre-filled
- [ ] Required fields validated
- [ ] Password strength shown
- [ ] Insurance toggle works
- [ ] Success message appears

---

## 🐛 Quick Fixes

| Issue | Fix |
|-------|-----|
| "OTP failed" | Use: `123456`, `111111`, or `000000` |
| "Password weak" | Use: `SecurePass123!` |
| "Can't submit" | Fill: DOB, Password, Confirm Password |
| "No form" | Click "Test This Scenario" button |

---

## 📱 Test on Mobile Too!

Open on phone browser and test responsive design.

---

## 🔄 Reset Between Tests

Click **"Reset Test"** button to try another scenario.

---

## ⏱️ Time Required

- **One scenario:** 2-5 minutes
- **All 5 scenarios:** 10-15 minutes
- **With documentation:** 30 minutes

---

## 📚 Full Docs

- Quick Start: `HOW_TO_TEST_CLIENT_REGISTRATION.md`
- Complete Guide: `CLIENT_REGISTRATION_TESTING_GUIDE.md`
- Security Info: `SECURE_CLIENT_LINKS_EXAMPLES.md`
- Overview: `CLIENT_REGISTRATION_SUMMARY.md`

---

## 🎯 Success = All 5 Scenarios Complete ✅

**That's it! Keep this handy while testing.** 🚀
