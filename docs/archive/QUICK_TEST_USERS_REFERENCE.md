# 🚀 Quick Test Users Reference

Fast reference for testing - all passwords are `Test123!`

---

## ⚡ Quick Commands

### Register All Users
```bash
chmod +x register-test-users.sh
./register-test-users.sh
```

### Test Video Session (Complete Flow)
```bash
chmod +x test-video-session.sh
./test-video-session.sh
```

---

## 👥 Test Users

### Therapists (USR-THERAPIST-001 to 010)
```
therapist001@example.com  →  USR-THERAPIST-001  →  Dr. Emily Johnson
therapist002@example.com  →  USR-THERAPIST-002  →  Dr. Michael Brown
therapist003@example.com  →  USR-THERAPIST-003  →  Dr. Sophia Davis
therapist004@example.com  →  USR-THERAPIST-004  →  Dr. David Wilson
therapist005@example.com  →  USR-THERAPIST-005  →  Dr. Olivia Martinez
therapist006@example.com  →  USR-THERAPIST-006  →  Dr. William Garcia
therapist007@example.com  →  USR-THERAPIST-007  →  Dr. Emma Rodriguez
therapist008@example.com  →  USR-THERAPIST-008  →  Dr. Alexander Lee
therapist009@example.com  →  USR-THERAPIST-009  →  Dr. Isabella White
therapist010@example.com  →  USR-THERAPIST-010  →  Dr. Daniel Harris
```

### Clients (USR-CLIENT-001 to 010)
```
client001@example.com  →  USR-CLIENT-001  →  Alice Thompson
client002@example.com  →  USR-CLIENT-002  →  Robert Anderson
client003@example.com  →  USR-CLIENT-003  →  Patricia Taylor
client004@example.com  →  USR-CLIENT-004  →  Christopher Moore
client005@example.com  →  USR-CLIENT-005  →  Jennifer Jackson
client006@example.com  →  USR-CLIENT-006  →  Matthew Martin
client007@example.com  →  USR-CLIENT-007  →  Linda Thompson
client008@example.com  →  USR-CLIENT-008  →  James Garcia
client009@example.com  →  USR-CLIENT-009  →  Barbara Martinez
client010@example.com  →  USR-CLIENT-010  →  Richard Robinson
```

---

## 📋 Copy-Paste Examples

### Login Therapist 001
```bash
curl -X POST https://us-central1-ataraxia-c150f.cloudfunctions.net/bedrockBackendApi/api/auth/register-or-login \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USR-THERAPIST-001",
    "email": "therapist001@example.com",
    "role": "therapist"
  }'
```

### Login Client 001
```bash
curl -X POST https://us-central1-ataraxia-c150f.cloudfunctions.net/bedrockBackendApi/api/auth/register-or-login \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USR-CLIENT-001",
    "email": "client001@example.com",
    "role": "client"
  }'
```

### Create Appointment (Therapist 001 + Client 001)
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
    "screenShareEnabled": true
  }'
```

---

## 🎯 Common Pairs

```
Therapist 001 + Client 001
Therapist 002 + Client 002
Therapist 003 + Client 003
Therapist 004 + Client 004
Therapist 005 + Client 005
Therapist 006 + Client 006
Therapist 007 + Client 007
Therapist 008 + Client 008
Therapist 009 + Client 009
Therapist 010 + Client 010
```

---

## 📖 Full Documentation

- **Complete Guide:** `/TEST_USERS_GUIDE.md`
- **Video Session API:** `/VIDEO_SESSION_API_GUIDE.md`
- **User ID Changes:** `/UPDATED_USER_IDS.md`

---

**Last Updated:** November 14, 2025  
**Total Users:** 20 (10 therapists + 10 clients)
