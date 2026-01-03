# 🧪 Testing Scenarios Guide

Complete testing scenarios using the 20 registered users (10 therapists + 10 clients).

---

## ✅ All Users Registered Successfully!

```
Therapists: 10/10 ✅
Clients:    10/10 ✅
Total:      20/20 ✅
```

---

## 📋 Quick Reference

### Therapists (Moderators)
| ID | Email | Name | Specialization |
|----|-------|------|----------------|
| USR-THERAPIST-001 | therapist001@example.com | Dr. Emily Johnson | Family Therapy |
| USR-THERAPIST-002 | therapist002@example.com | Dr. Michael Brown | Trauma Therapy |
| USR-THERAPIST-003 | therapist003@example.com | Dr. Sophia Davis | Child Psychology |
| USR-THERAPIST-004 | therapist004@example.com | Dr. David Wilson | Addiction Counseling |
| USR-THERAPIST-005 | therapist005@example.com | Dr. Olivia Martinez | Couples Therapy |
| USR-THERAPIST-006 | therapist006@example.com | Dr. William Garcia | Anxiety Disorders |
| USR-THERAPIST-007 | therapist007@example.com | Dr. Emma Rodriguez | Depression Treatment |
| USR-THERAPIST-008 | therapist008@example.com | Dr. Alexander Lee | PTSD Specialist |
| USR-THERAPIST-009 | therapist009@example.com | Dr. Isabella White | Behavioral Therapy |
| USR-THERAPIST-010 | therapist010@example.com | Dr. Daniel Harris | Group Therapy |

### Clients (Participants)
| ID | Email | Name |
|----|-------|------|
| USR-CLIENT-001 | client001@example.com | Alice Thompson |
| USR-CLIENT-002 | client002@example.com | Robert Anderson |
| USR-CLIENT-003 | client003@example.com | Patricia Taylor |
| USR-CLIENT-004 | client004@example.com | Christopher Moore |
| USR-CLIENT-005 | client005@example.com | Jennifer Jackson |
| USR-CLIENT-006 | client006@example.com | Matthew Martin |
| USR-CLIENT-007 | client007@example.com | Linda Thompson |
| USR-CLIENT-008 | client008@example.com | James Garcia |
| USR-CLIENT-009 | client009@example.com | Barbara Martinez |
| USR-CLIENT-010 | client010@example.com | Richard Robinson |

**Password for all:** `Test123!`

---

## 🎯 Testing Scenarios

### Scenario 1: Basic Video Session (1 Therapist + 1 Client)

**Test:** Create a basic video session

**Steps:**
1. Login as `USR-THERAPIST-001` (therapist001@example.com)
2. Create session with `USR-CLIENT-001` (automatically added)
3. Get JWT token
4. Join video call

**Expected Result:**
- ✅ Session created successfully
- ✅ JWT token received
- ✅ Video call loads
- ✅ Therapist has moderator access

**Command Line Test:**
```bash
# Login as therapist
curl -X POST https://us-central1-ataraxia-c150f.cloudfunctions.net/bedrockBackendApi/api/auth/register-or-login \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USR-THERAPIST-001",
    "email": "therapist001@example.com",
    "role": "therapist"
  }'

# Create appointment
curl -X POST https://us-central1-ataraxia-c150f.cloudfunctions.net/bedrockBackendApi/api/appointments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {ACCESS_TOKEN}" \
  -d '{
    "therapistId": "USR-THERAPIST-001",
    "clientId": "USR-CLIENT-001",
    "startTime": "2025-11-16T15:00:00.000Z",
    "endTime": "2025-11-16T16:00:00.000Z",
    "recordingEnabled": false,
    "chatEnabled": true,
    "screenShareEnabled": true
  }'
```

---

### Scenario 2: Multiple Sessions (Same Therapist, Different Clients)

**Test:** One therapist with back-to-back sessions

**Setup:**
- Therapist: USR-THERAPIST-001
- Clients: USR-CLIENT-001, USR-CLIENT-002, USR-CLIENT-003

**Sessions:**
| Time | Therapist | Client | Duration |
|------|-----------|--------|----------|
| 9:00 AM | USR-THERAPIST-001 | USR-CLIENT-001 | 1 hour |
| 10:00 AM | USR-THERAPIST-001 | USR-CLIENT-002 | 1 hour |
| 11:00 AM | USR-THERAPIST-001 | USR-CLIENT-003 | 1 hour |

**Expected Result:**
- ✅ All 3 sessions created
- ✅ Each session has unique sessionId
- ✅ Each session has unique room name
- ✅ Calendar shows all 3 appointments

---

### Scenario 3: Concurrent Sessions (Multiple Therapists)

**Test:** Multiple therapists with sessions at the same time

**Setup:**
| Time | Therapist | Client |
|------|-----------|--------|
| 3:00 PM | USR-THERAPIST-001 | USR-CLIENT-001 |
| 3:00 PM | USR-THERAPIST-002 | USR-CLIENT-002 |
| 3:00 PM | USR-THERAPIST-003 | USR-CLIENT-003 |

**Expected Result:**
- ✅ All sessions run simultaneously
- ✅ Each session is isolated (separate rooms)
- ✅ No conflicts between sessions

---

### Scenario 4: Full Day Schedule

**Test:** Therapist with full day of appointments

**Setup:**
- Therapist: USR-THERAPIST-001
- 6 clients throughout the day

**Schedule:**
| Time | Client | Session Type |
|------|--------|--------------|
| 9:00 AM - 10:00 AM | USR-CLIENT-001 | Initial Consultation |
| 10:00 AM - 11:00 AM | USR-CLIENT-002 | Follow-up |
| 11:00 AM - 12:00 PM | USR-CLIENT-003 | Therapy Session |
| 12:00 PM - 1:00 PM | LUNCH BREAK | - |
| 1:00 PM - 2:00 PM | USR-CLIENT-004 | Initial Consultation |
| 2:00 PM - 3:00 PM | USR-CLIENT-005 | Therapy Session |
| 3:00 PM - 4:00 PM | USR-CLIENT-006 | Follow-up |

**Expected Result:**
- ✅ All appointments created
- ✅ Calendar displays correctly
- ✅ No overlapping sessions
- ✅ Lunch break visible

---

### Scenario 5: Different Therapists, Same Client

**Test:** Client seeing multiple therapists (team approach)

**Setup:**
- Client: USR-CLIENT-001
- Therapists: USR-THERAPIST-001, USR-THERAPIST-002, USR-THERAPIST-003

**Sessions:**
| Date | Time | Therapist | Specialization |
|------|------|-----------|----------------|
| Nov 16 | 9:00 AM | USR-THERAPIST-001 | Family Therapy |
| Nov 17 | 10:00 AM | USR-THERAPIST-002 | Trauma Therapy |
| Nov 18 | 11:00 AM | USR-THERAPIST-003 | Child Psychology |

**Expected Result:**
- ✅ Client can join all sessions
- ✅ Each therapist is moderator of their session
- ✅ Client sees all appointments in their calendar

---

### Scenario 6: Load Testing (All Users)

**Test:** Maximum concurrent sessions

**Setup:**
- 10 therapists
- 10 clients
- All sessions at same time

**Matrix:**
```
USR-THERAPIST-001 + USR-CLIENT-001 = Session 1
USR-THERAPIST-002 + USR-CLIENT-002 = Session 2
USR-THERAPIST-003 + USR-CLIENT-003 = Session 3
USR-THERAPIST-004 + USR-CLIENT-004 = Session 4
USR-THERAPIST-005 + USR-CLIENT-005 = Session 5
USR-THERAPIST-006 + USR-CLIENT-006 = Session 6
USR-THERAPIST-007 + USR-CLIENT-007 = Session 7
USR-THERAPIST-008 + USR-CLIENT-008 = Session 8
USR-THERAPIST-009 + USR-CLIENT-009 = Session 9
USR-THERAPIST-010 + USR-CLIENT-010 = Session 10
```

**Expected Result:**
- ✅ All 10 sessions created
- ✅ All sessions isolated
- ✅ System handles load
- ✅ Video quality maintained

---

### Scenario 7: Session Features Testing

**Test:** All video session features

**Setup:**
- Therapist: USR-THERAPIST-001
- Client: USR-CLIENT-001

**Features to Test:**
- ✅ Video on/off
- ✅ Audio mute/unmute
- ✅ Screen sharing (therapist only)
- ✅ Chat messaging
- ✅ Recording (if enabled)
- ✅ Moderator controls
- ✅ Participant removal
- ✅ Session end

---

### Scenario 8: Error Handling

**Test:** Various error conditions

**Test Cases:**

**8.1: Invalid User ID**
```javascript
therapistId: "INVALID-ID"
// Expected: Error - User not found
```

**8.2: Same User for Therapist and Client**
```javascript
therapistId: "USR-THERAPIST-001"
clientId: "USR-THERAPIST-001" // Same user!
// Expected: Error - therapistId and clientId must be different
```

**8.3: Invalid Date Format**
```javascript
startTime: "2025-11-16 15:00:00" // Wrong format
// Expected: Error - Invalid date format
```

**8.4: Past Date**
```javascript
startTime: "2020-01-01T10:00:00.000Z" // In the past
// Expected: Warning or acceptance (backend allows past dates)
```

**8.5: Missing Access Token**
```javascript
// No Authorization header
// Expected: Error - Unauthorized (401)
```

---

### Scenario 9: Calendar Integration

**Test:** Appointments appear in calendar

**Setup:**
1. Create 5 appointments for USR-THERAPIST-001
2. Login as USR-THERAPIST-001
3. Navigate to calendar

**Expected Result:**
- ✅ All appointments visible in calendar
- ✅ Day view shows appointments
- ✅ Week view shows appointments
- ✅ Month view shows appointments
- ✅ Drag-and-drop works
- ✅ Click appointment opens detail panel

---

### Scenario 10: Appointment Management

**Test:** CRUD operations on appointments

**Operations:**

**Create:**
```bash
POST /appointments
{
  "therapistId": "USR-THERAPIST-001",
  "clientId": "USR-CLIENT-001",
  "startTime": "2025-11-16T15:00:00.000Z",
  "endTime": "2025-11-16T16:00:00.000Z"
}
```

**Read:**
```bash
GET /appointments/{appointmentId}
```

**Update:**
```bash
PUT /appointments/{appointmentId}
{
  "startTime": "2025-11-16T16:00:00.000Z",
  "endTime": "2025-11-16T17:00:00.000Z"
}
```

**Delete:**
```bash
DELETE /appointments/{appointmentId}
```

**Expected Result:**
- ✅ All operations succeed
- ✅ Calendar updates in real-time
- ✅ Notifications sent (if implemented)

---

## 🚀 Quick Test Commands

### Test Single Session
```bash
./test-video-session.sh
```

### Test All Users
```bash
./test-all-users.sh
```

### Test Appointment Flow
```bash
./test-appointment-flow.sh
```

---

## 📊 Testing Checklist

### Basic Functionality
- [ ] Login works for all therapists
- [ ] Login works for all clients
- [ ] Session creation succeeds
- [ ] JWT token generation works
- [ ] Video call loads

### Session Features
- [ ] Video works
- [ ] Audio works
- [ ] Chat works
- [ ] Screen sharing works
- [ ] Moderator controls work
- [ ] Recording works (if enabled)

### Calendar Features
- [ ] Appointments visible in day view
- [ ] Appointments visible in week view
- [ ] Appointments visible in month view
- [ ] Drag-and-drop rescheduling works
- [ ] Appointment details panel works

### Multiple Users
- [ ] Concurrent sessions work
- [ ] Multiple clients per therapist works
- [ ] Multiple therapists per client works
- [ ] Load testing (10 concurrent sessions) works

### Error Handling
- [ ] Invalid user ID handled
- [ ] Same therapist/client prevented
- [ ] Invalid date format handled
- [ ] Missing token handled
- [ ] Network errors handled

---

## 🎯 Success Criteria

✅ **All scenarios pass**  
✅ **No errors in console**  
✅ **Video/audio quality good**  
✅ **UI responsive**  
✅ **Calendar updates correctly**  
✅ **Appointments persist**  
✅ **Multiple concurrent sessions work**  
✅ **Error messages clear and helpful**

---

## 📝 Test Results Template

```markdown
# Test Session Results

**Date:** [Date]
**Tester:** [Your Name]

## Scenario 1: Basic Video Session
- Status: ✅ Pass / ❌ Fail
- Notes: 

## Scenario 2: Multiple Sessions
- Status: ✅ Pass / ❌ Fail
- Notes:

## Scenario 3: Concurrent Sessions
- Status: ✅ Pass / ❌ Fail
- Notes:

[Continue for all scenarios...]

## Issues Found
1. [Issue description]
2. [Issue description]

## Overall Assessment
[Summary of testing session]
```

---

## 🔧 Troubleshooting

If tests fail, check:

1. **All users registered:** `./register-test-users.sh`
2. **Backend is running:** `curl {API_BASE_URL}/health`
3. **Access token valid:** Check console for token
4. **Browser console:** Look for detailed errors
5. **API Debug Panel:** Orange button bottom-right
6. **Error Debug Panel:** Red button bottom-right

---

**Ready to Test!** 🎉  
All 20 users are registered and ready for comprehensive testing.

Start with Scenario 1 (Basic Video Session) and work your way through!
