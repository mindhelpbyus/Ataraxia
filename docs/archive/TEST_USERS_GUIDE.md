# 🧪 Test Users Guide

Complete guide for using the 10 therapists and 10 clients for testing video sessions and appointments.

---

## 📋 Quick Overview

We have **10 therapists** and **10 clients** ready for testing:

| Type | Count | ID Range | Email Pattern | Password |
|------|-------|----------|---------------|----------|
| **Therapists** | 10 | USR-THERAPIST-001 to 010 | therapist001@example.com to therapist010@example.com | Test123! |
| **Clients** | 10 | USR-CLIENT-001 to 010 | client001@example.com to client010@example.com | Test123! |

---

## 🩺 Therapists (Moderators)

### Complete List

| # | User ID | Email | Name | Specialization |
|---|---------|-------|------|----------------|
| 1 | USR-THERAPIST-001 | therapist001@example.com | Dr. Emily Johnson | Family Therapy |
| 2 | USR-THERAPIST-002 | therapist002@example.com | Dr. Michael Brown | Trauma Therapy |
| 3 | USR-THERAPIST-003 | therapist003@example.com | Dr. Sophia Davis | Child Psychology |
| 4 | USR-THERAPIST-004 | therapist004@example.com | Dr. David Wilson | Addiction Counseling |
| 5 | USR-THERAPIST-005 | therapist005@example.com | Dr. Olivia Martinez | Couples Therapy |
| 6 | USR-THERAPIST-006 | therapist006@example.com | Dr. William Garcia | Anxiety Disorders |
| 7 | USR-THERAPIST-007 | therapist007@example.com | Dr. Emma Rodriguez | Depression Treatment |
| 8 | USR-THERAPIST-008 | therapist008@example.com | Dr. Alexander Lee | PTSD Specialist |
| 9 | USR-THERAPIST-009 | therapist009@example.com | Dr. Isabella White | Behavioral Therapy |
| 10 | USR-THERAPIST-010 | therapist010@example.com | Dr. Daniel Harris | Group Therapy |

**Password for all:** `Test123!`

---

## 👥 Clients (Participants)

### Complete List

| # | User ID | Email | Name |
|---|---------|-------|------|
| 1 | USR-CLIENT-001 | client001@example.com | Alice Thompson |
| 2 | USR-CLIENT-002 | client002@example.com | Robert Anderson |
| 3 | USR-CLIENT-003 | client003@example.com | Patricia Taylor |
| 4 | USR-CLIENT-004 | client004@example.com | Christopher Moore |
| 5 | USR-CLIENT-005 | client005@example.com | Jennifer Jackson |
| 6 | USR-CLIENT-006 | client006@example.com | Matthew Martin |
| 7 | USR-CLIENT-007 | client007@example.com | Linda Thompson |
| 8 | USR-CLIENT-008 | client008@example.com | James Garcia |
| 9 | USR-CLIENT-009 | client009@example.com | Barbara Martinez |
| 10 | USR-CLIENT-010 | client010@example.com | Richard Robinson |

**Password for all:** `Test123!`

---

## 🚀 Quick Start

### 1. Register All Users with Backend

Run the registration script to create all users in your Firebase backend:

```bash
chmod +x register-test-users.sh
./register-test-users.sh
```

This will:
- ✅ Register 10 therapists
- ✅ Register 10 clients
- ✅ Display success/failure for each user
- ✅ Show summary at the end

### 2. Test Video Session Creation

Create a test video session between any therapist and client:

```bash
# Example: Therapist 001 with Client 001
curl -X POST https://us-central1-ataraxia-c150f.cloudfunctions.net/bedrockBackendApi/api/auth/register-or-login \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USR-THERAPIST-001",
    "email": "therapist001@example.com",
    "role": "therapist"
  }'

# Save the accessToken from response, then create appointment
curl -X POST https://us-central1-ataraxia-c150f.cloudfunctions.net/bedrockBackendApi/api/appointments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
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

## 📝 Testing Scenarios

### Scenario 1: Single Therapist, Multiple Clients

```bash
# Therapist 001 has sessions with 3 different clients
therapistId: USR-THERAPIST-001
clientId: USR-CLIENT-001  (Session 1)
clientId: USR-CLIENT-002  (Session 2)
clientId: USR-CLIENT-003  (Session 3)
```

### Scenario 2: Multiple Therapists, Single Client

```bash
# Client 001 sees 3 different therapists
therapistId: USR-THERAPIST-001, clientId: USR-CLIENT-001
therapistId: USR-THERAPIST-002, clientId: USR-CLIENT-001
therapistId: USR-THERAPIST-003, clientId: USR-CLIENT-001
```

### Scenario 3: Concurrent Sessions

```bash
# Multiple sessions at the same time
USR-THERAPIST-001 + USR-CLIENT-001  (3:00 PM - 4:00 PM)
USR-THERAPIST-002 + USR-CLIENT-002  (3:00 PM - 4:00 PM)
USR-THERAPIST-003 + USR-CLIENT-003  (3:00 PM - 4:00 PM)
```

### Scenario 4: Full Day Schedule

```bash
# One therapist, full day of appointments
USR-THERAPIST-001 + USR-CLIENT-001  (9:00 AM - 10:00 AM)
USR-THERAPIST-001 + USR-CLIENT-002  (10:00 AM - 11:00 AM)
USR-THERAPIST-001 + USR-CLIENT-003  (11:00 AM - 12:00 PM)
# Lunch break
USR-THERAPIST-001 + USR-CLIENT-004  (1:00 PM - 2:00 PM)
USR-THERAPIST-001 + USR-CLIENT-005  (2:00 PM - 3:00 PM)
USR-THERAPIST-001 + USR-CLIENT-006  (3:00 PM - 4:00 PM)
```

---

## 🎬 Video Session Testing Matrix

Create these combinations for comprehensive testing:

| Session | Therapist | Client | Time Slot |
|---------|-----------|--------|-----------|
| 1 | USR-THERAPIST-001 | USR-CLIENT-001 | 9:00 AM |
| 2 | USR-THERAPIST-002 | USR-CLIENT-002 | 10:00 AM |
| 3 | USR-THERAPIST-003 | USR-CLIENT-003 | 11:00 AM |
| 4 | USR-THERAPIST-004 | USR-CLIENT-004 | 1:00 PM |
| 5 | USR-THERAPIST-005 | USR-CLIENT-005 | 2:00 PM |
| 6 | USR-THERAPIST-006 | USR-CLIENT-006 | 3:00 PM |
| 7 | USR-THERAPIST-007 | USR-CLIENT-007 | 4:00 PM |
| 8 | USR-THERAPIST-008 | USR-CLIENT-008 | 9:00 AM (Next Day) |
| 9 | USR-THERAPIST-009 | USR-CLIENT-009 | 10:00 AM (Next Day) |
| 10 | USR-THERAPIST-010 | USR-CLIENT-010 | 11:00 AM (Next Day) |

---

## 📋 API Examples

### Login as Therapist

```bash
curl -X POST https://us-central1-ataraxia-c150f.cloudfunctions.net/bedrockBackendApi/api/auth/register-or-login \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USR-THERAPIST-001",
    "email": "therapist001@example.com",
    "role": "therapist",
    "firstName": "Emily",
    "lastName": "Johnson"
  }'
```

### Login as Client

```bash
curl -X POST https://us-central1-ataraxia-c150f.cloudfunctions.net/bedrockBackendApi/api/auth/register-or-login \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USR-CLIENT-001",
    "email": "client001@example.com",
    "role": "client",
    "firstName": "Alice",
    "lastName": "Thompson"
  }'
```

### Create Appointment/Session

```bash
curl -X POST https://us-central1-ataraxia-c150f.cloudfunctions.net/bedrockBackendApi/api/appointments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "therapistId": "USR-THERAPIST-001",
    "clientId": "USR-CLIENT-001",
    "startTime": "2025-11-16T15:00:00.000Z",
    "endTime": "2025-11-16T16:00:00.000Z",
    "recordingEnabled": false,
    "chatEnabled": true,
    "screenShareEnabled": true,
    "notes": "Initial consultation"
  }'
```

### Get JWT Token for Video Call

```bash
curl -X GET https://us-central1-ataraxia-c150f.cloudfunctions.net/bedrockBackendApi/api/sessions/{sessionId}/jwt \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 🔄 Batch Testing Script

Create multiple sessions at once:

```bash
#!/bin/bash

API_BASE="https://us-central1-ataraxia-c150f.cloudfunctions.net/bedrockBackendApi/api"

# Login as first therapist
TOKEN=$(curl -s -X POST "$API_BASE/auth/register-or-login" \
  -H "Content-Type: application/json" \
  -d '{"userId":"USR-THERAPIST-001","email":"therapist001@example.com","role":"therapist"}' \
  | jq -r '.data.tokens.accessToken')

# Create 5 appointments with different clients
for i in {1..5}; do
  CLIENT_NUM=$(printf "%03d" $i)
  START_HOUR=$((8 + i))
  
  curl -X POST "$API_BASE/appointments" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{
      \"therapistId\": \"USR-THERAPIST-001\",
      \"clientId\": \"USR-CLIENT-$CLIENT_NUM\",
      \"startTime\": \"2025-11-16T${START_HOUR}:00:00.000Z\",
      \"endTime\": \"2025-11-16T$((START_HOUR + 1)):00:00.000Z\",
      \"recordingEnabled\": false,
      \"chatEnabled\": true,
      \"screenShareEnabled\": true
    }"
  
  echo ""
done
```

---

## ⚠️ Important Notes

### User ID Format
- **Therapists:** `USR-THERAPIST-{001-010}`
- **Clients:** `USR-CLIENT-{001-010}`
- Always use 3-digit padding (001, 002, ..., 010)

### Backend API Notes
- ⚠️ **Client ID = Client ID** in the backend API
- When creating appointments, use `clientId` field (not `clientId`)
- `therapistId` and `clientId` **MUST be different** users

### Password
- All test users use the same password: `Test123!`
- This is for testing only - use secure passwords in production

### Email Format
- Therapists: `therapist{001-010}@example.com`
- Clients: `client{001-010}@example.com`

---

## 🧪 Testing Checklist

Before deploying to production:

- [ ] All 10 therapists registered successfully
- [ ] All 10 clients registered successfully
- [ ] Can login as each therapist
- [ ] Can login as each client
- [ ] Can create appointment between therapist and client
- [ ] Can get JWT token for video session
- [ ] Can join video call with JWT token
- [ ] Multiple concurrent sessions work
- [ ] Calendar displays all appointments correctly
- [ ] Drag-and-drop rescheduling works
- [ ] Appointment details panel shows correct info

---

## 📊 Quick Reference Table

### Pairing Suggestions

| Therapist | Specialization | Best Paired With | Client Name |
|-----------|----------------|------------------|-------------|
| USR-THERAPIST-001 | Family Therapy | USR-CLIENT-001 | Alice Thompson |
| USR-THERAPIST-002 | Trauma Therapy | USR-CLIENT-002 | Robert Anderson |
| USR-THERAPIST-003 | Child Psychology | USR-CLIENT-003 | Patricia Taylor |
| USR-THERAPIST-004 | Addiction Counseling | USR-CLIENT-004 | Christopher Moore |
| USR-THERAPIST-005 | Couples Therapy | USR-CLIENT-005 | Jennifer Jackson |
| USR-THERAPIST-006 | Anxiety Disorders | USR-CLIENT-006 | Matthew Martin |
| USR-THERAPIST-007 | Depression Treatment | USR-CLIENT-007 | Linda Thompson |
| USR-THERAPIST-008 | PTSD Specialist | USR-CLIENT-008 | James Garcia |
| USR-THERAPIST-009 | Behavioral Therapy | USR-CLIENT-009 | Barbara Martinez |
| USR-THERAPIST-010 | Group Therapy | USR-CLIENT-010 | Richard Robinson |

---

## 🎯 Common Use Cases

### Use Case 1: Admin Dashboard Testing
Login as wellness admin and view all 10 therapists' calendars side-by-side.

### Use Case 2: Therapist Calendar Testing
Login as USR-THERAPIST-001 and create appointments with clients 1-5.

### Use Case 3: Client View Testing
Login as USR-CLIENT-001 and view appointments with therapist.

### Use Case 4: Video Call Testing
Create session between USR-THERAPIST-001 and USR-CLIENT-001, get JWT, join video call.

### Use Case 5: Concurrent Sessions Testing
Create 10 simultaneous sessions (one for each therapist-client pair).

---

## 🔍 Troubleshooting

### User Not Found
**Problem:** User ID not recognized  
**Solution:** Run `./register-test-users.sh` to register all users

### Authentication Failed
**Problem:** Login fails with correct credentials  
**Solution:** Check that userId matches exactly (case-sensitive)

### Cannot Create Appointment
**Problem:** Error when creating appointment  
**Solution:** Ensure therapistId ≠ clientId and both users exist in backend

### JWT Token Error
**Problem:** Cannot get JWT token  
**Solution:** Verify sessionId exists and user is authenticated

---

## 📞 Support

For issues or questions:
1. Check `/UPDATED_USER_IDS.md` for ID changes
2. Review `/VIDEO_SESSION_API_GUIDE.md` for API documentation
3. Run `./test-video-session.sh` for end-to-end testing
4. Check backend logs for detailed error messages

---

**Last Updated:** November 14, 2025  
**Total Test Users:** 20 (10 therapists + 10 clients)  
**Status:** ✅ Ready for Testing
