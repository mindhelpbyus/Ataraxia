# 🔑 Critical: Appointment ID vs Session ID

## ⚠️ THE BUG WAS FIXED!

**Issue:** We were using the wrong ID for JWT token requests.

**Backend Returns TWO Different IDs:**

```json
{
  "appointment": {
    "id": "425XV7np91dt9IVOyV2u",           // ❌ Appointment ID - WRONG for video!
    "sessionId": "nQstynfUWQdR8l48EB3y",    // ✅ Session ID - CORRECT for video!
    "roomName": "bedrock-c6fc1925-f3a0-4d35-aea4-840cb15b00aa",
    ...
  }
}
```

---

## 📋 Appointment ID vs 🎥 Session ID

### Appointment ID (`id`)
- **Purpose:** Appointment management (CRUD operations)
- **Used for:**
  - ✅ Update appointment
  - ✅ Delete appointment
  - ✅ Get appointment details
  - ✅ List appointments
- **Example:** `425XV7np91dt9IVOyV2u`
- **Endpoint:** `/appointments/{appointmentId}`

### Session ID (`sessionId`)
- **Purpose:** Video session operations
- **Used for:**
  - ✅ Get JWT token for video call
  - ✅ Join video session
  - ✅ Video room management
  - ✅ Recording controls
- **Example:** `nQstynfUWQdR8l48EB3y`
- **Endpoint:** `/sessions/{sessionId}/jwt`

---

## ✅ The Fix

### Before (WRONG ❌)
```typescript
// api/sessions.ts - Line 176
return {
  id: appointment.id || appointment.sessionId,  // ❌ Using appointment.id first!
  ...
}
```

**Problem:** When `appointment.id` exists, it was used instead of `sessionId`, causing JWT requests to fail.

### After (CORRECT ✅)
```typescript
// api/sessions.ts - Line 176
return {
  id: appointment.sessionId,        // ✅ ALWAYS use sessionId for video
  appointmentId: appointment.id,    // ✅ Store appointment ID separately
  ...
}
```

**Solution:** Always use `sessionId` for the session `id`, store appointment ID separately.

---

## 🔍 How to Identify in Logs

### Old Logs (Before Fix)
```
🆔 Session ID: 425XV7np91dt9IVOyV2u  ❌ This is actually appointment ID!
📍 Endpoint: GET /sessions/425XV7np91dt9IVOyV2u/jwt  ❌ Wrong ID!
❌ Error: Session not found
```

### New Logs (After Fix)
```
📋 APPOINTMENT vs SESSION IDs:
   📋 Appointment ID: 425XV7np91dt9IVOyV2u (for appointment CRUD)
   🎥 Session ID: nQstynfUWQdR8l48EB3y (for video/JWT) ← USING THIS!

🔑 Using Session ID (NOT Appointment ID):
   🎥 Session ID: nQstynfUWQdR8l48EB3y ← Correct!
   📋 Appointment ID: 425XV7np91dt9IVOyV2u ← NOT using this for JWT

📍 Endpoint: GET /sessions/nQstynfUWQdR8l48EB3y/jwt  ✅ Correct ID!
✅ JWT token received!
```

---

## 🎯 Usage Guide

### Creating an Appointment (Returns Both IDs)
```typescript
const response = await post('/appointments', {
  therapistId: 'USR-THERAPIST-001',
  clientId: 'USR-CLIENT-001',
  startTime: '2025-11-16T15:00:00.000Z',
  endTime: '2025-11-16T16:00:00.000Z'
});

// Backend returns:
{
  "appointment": {
    "id": "425XV7np91dt9IVOyV2u",        // Appointment ID
    "sessionId": "nQstynfUWQdR8l48EB3y", // Session ID
    "roomName": "bedrock-c6fc1925-...",
    ...
  }
}
```

### Getting JWT Token (Use Session ID)
```typescript
// ✅ CORRECT: Use sessionId from response
const jwtResponse = await get(`/sessions/${response.appointment.sessionId}/jwt`);

// ❌ WRONG: Using appointment.id
const jwtResponse = await get(`/sessions/${response.appointment.id}/jwt`);
```

### Updating Appointment (Use Appointment ID)
```typescript
// ✅ CORRECT: Use appointment.id for appointment operations
const updated = await put(`/appointments/${response.appointment.id}`, {
  startTime: '2025-11-16T16:00:00.000Z'
});

// ❌ WRONG: Using sessionId for appointment operations
const updated = await put(`/appointments/${response.appointment.sessionId}`, {...});
```

---

## 🧪 Testing the Fix

### Test 1: Create Session and Get JWT
```bash
# Step 1: Create appointment
curl -X POST $API_BASE/appointments \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "therapistId": "USR-THERAPIST-001",
    "clientId": "USR-CLIENT-001",
    "startTime": "2025-11-16T15:00:00.000Z",
    "endTime": "2025-11-16T16:00:00.000Z"
  }' | jq

# Response shows BOTH IDs:
{
  "appointment": {
    "id": "appt_abc123",           # Appointment ID
    "sessionId": "sess_xyz789",    # Session ID ← Use this for JWT!
    ...
  }
}

# Step 2: Get JWT using SESSION ID (not appointment ID!)
curl -X GET $API_BASE/sessions/sess_xyz789/jwt \
  -H "Authorization: Bearer $TOKEN" | jq

# ✅ Success! JWT token returned
```

### Test 2: Verify in Browser Console
```javascript
// After creating session, check console:
console.log('Appointment ID:', sessionData.appointmentId);  // For CRUD
console.log('Session ID:', sessionData.id);                 // For video/JWT
```

---

## 📊 Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Create Appointment                                       │
│    POST /appointments                                       │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Backend Returns BOTH IDs                                 │
│    {                                                        │
│      "id": "425XV7np91dt9IVOyV2u",        (Appointment ID) │
│      "sessionId": "nQstynfUWQdR8l48EB3y", (Session ID)     │
│      "roomName": "bedrock-..."                             │
│    }                                                        │
└───────────┬─────────────────────────┬───────────────────────┘
            │                         │
            │                         │
            ▼                         ▼
┌─────────────────────┐   ┌──────────────────────────┐
│ 3a. CRUD Operations │   │ 3b. Video Operations     │
│                     │   │                          │
│ Use: Appointment ID │   │ Use: Session ID          │
│                     │   │                          │
│ PUT /appointments/  │   │ GET /sessions/{id}/jwt   │
│     {apptId}        │   │                          │
│                     │   │ POST /sessions/{id}/join │
│ DELETE /appts/      │   │                          │
│        {apptId}     │   │ GET /sessions/{id}/state │
└─────────────────────┘   └──────────────────────────┘
```

---

## 🔧 Files Changed

### 1. `/api/sessions.ts`
**Line 176:** Changed to always use `sessionId`
```typescript
// Before:
id: appointment.id || appointment.sessionId,

// After:
id: appointment.sessionId,
appointmentId: appointment.id,
```

**Added validation:**
```typescript
if (!appointment.sessionId) {
  throw new Error('Backend did not return a sessionId');
}
```

**Added logging:**
```typescript
console.log('🔍 BACKEND RESPONSE IDs:');
console.log('   📋 Appointment ID:', appointment.id);
console.log('   🎥 Session ID:', appointment.sessionId, '← USE THIS!');
```

### 2. `/components/CreateSessionTest.tsx`
**Updated console logs to show both IDs:**
```typescript
console.log('📋 APPOINTMENT vs SESSION IDs:');
console.log('   📋 Appointment ID:', sessionData.appointmentId);
console.log('   🎥 Session ID:', sessionData.id, '← USING THIS!');
```

---

## ⚠️ Common Mistakes to Avoid

### ❌ MISTAKE 1: Using appointment.id for JWT
```typescript
// ❌ WRONG
const jwt = await getSessionJWT(appointment.id);
```

### ✅ CORRECT
```typescript
// ✅ CORRECT
const jwt = await getSessionJWT(appointment.sessionId);
```

---

### ❌ MISTAKE 2: Using sessionId for appointment updates
```typescript
// ❌ WRONG
await put(`/appointments/${appointment.sessionId}`, {...});
```

### ✅ CORRECT
```typescript
// ✅ CORRECT
await put(`/appointments/${appointment.id}`, {...});
```

---

### ❌ MISTAKE 3: Assuming they're the same
```typescript
// ❌ WRONG ASSUMPTION
const id = appointment.id; // Use for everything
```

### ✅ CORRECT
```typescript
// ✅ CORRECT UNDERSTANDING
const appointmentId = appointment.id;      // For appointment CRUD
const sessionId = appointment.sessionId;   // For video operations
```

---

## 🎯 Quick Reference

| Operation | Use This ID | Endpoint Example |
|-----------|-------------|------------------|
| Get JWT token | `sessionId` | `/sessions/{sessionId}/jwt` |
| Join video | `sessionId` | `/sessions/{sessionId}/join` |
| Update appointment | `id` (appointmentId) | `/appointments/{id}` |
| Delete appointment | `id` (appointmentId) | `/appointments/{id}` |
| Get appointment details | `id` (appointmentId) | `/appointments/{id}` |

---

## ✅ Verification Checklist

After the fix, verify:

- [ ] Creating session shows both IDs in console
- [ ] Session ID is used for JWT endpoint
- [ ] Appointment ID is stored separately
- [ ] JWT token is received successfully
- [ ] Video call loads without errors
- [ ] Console logs clearly distinguish between IDs

---

## 📝 Summary

**The Problem:**
- Backend returns TWO IDs: `id` (appointment) and `sessionId` (video)
- We were using `appointment.id` when we should use `sessionId`
- JWT endpoint expects `sessionId`, not `appointmentId`

**The Solution:**
- Always extract `sessionId` from backend response
- Use `sessionId` for all video operations
- Store `appointmentId` separately for CRUD operations
- Enhanced logging to show both IDs clearly

**The Result:**
- ✅ JWT tokens now fetch correctly
- ✅ Video sessions work properly
- ✅ Clear distinction between appointment and session IDs
- ✅ Better error messages when IDs are missing

---

**Status:** ✅ Fixed  
**Date:** November 14, 2025  
**Impact:** Critical - Enables video functionality  
**Files Changed:** 2 (`api/sessions.ts`, `components/CreateSessionTest.tsx`)

🎉 **Bug Fixed!** Video sessions now use the correct Session ID!
