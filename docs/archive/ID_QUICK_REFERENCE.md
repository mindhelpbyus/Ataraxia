# 🔑 Quick Reference: Which ID to Use?

## 🎯 At a Glance

| What are you doing? | Use this ID | Field name |
|---------------------|-------------|------------|
| 🎥 Get JWT token | **Session ID** | `sessionId` |
| 🎥 Join video call | **Session ID** | `sessionId` |
| 📋 Update appointment | **Appointment ID** | `id` |
| 📋 Delete appointment | **Appointment ID** | `id` |
| 📋 Get appointment | **Appointment ID** | `id` |

---

## 📦 Backend Response Structure

```json
{
  "appointment": {
    "id": "425XV7np91dt9IVOyV2u",           // 📋 Appointment ID
    "sessionId": "nQstynfUWQdR8l48EB3y",    // 🎥 Session ID
    "roomName": "bedrock-c6fc1925-..."
  }
}
```

---

## ✅ Correct Usage

### Video Operations (Use sessionId)
```typescript
// Get JWT token
const jwt = await get(`/sessions/${sessionId}/jwt`);

// Join session
const join = await post(`/sessions/${sessionId}/join`);
```

### Appointment Operations (Use id)
```typescript
// Update appointment
const updated = await put(`/appointments/${id}`, {...});

// Delete appointment
const deleted = await del(`/appointments/${id}`);
```

---

## ❌ Common Mistakes

### WRONG ❌
```typescript
// Using appointment.id for JWT (will fail!)
const jwt = await get(`/sessions/${appointment.id}/jwt`);
```

### CORRECT ✅
```typescript
// Using appointment.sessionId for JWT
const jwt = await get(`/sessions/${appointment.sessionId}/jwt`);
```

---

## 💾 Code Example

```typescript
// Step 1: Create appointment
const response = await post('/appointments', {
  therapistId: 'USR-THERAPIST-001',
  clientId: 'USR-CLIENT-001',
  startTime: '2025-11-16T15:00:00.000Z',
  endTime: '2025-11-16T16:00:00.000Z'
});

// Step 2: Extract BOTH IDs
const appointmentId = response.appointment.id;        // For CRUD
const sessionId = response.appointment.sessionId;     // For video

// Step 3: Use correct ID for each operation
// ✅ For video/JWT:
const jwt = await get(`/sessions/${sessionId}/jwt`);

// ✅ For appointment updates:
const updated = await put(`/appointments/${appointmentId}`, {...});
```

---

## 🚨 Remember

- **Session ID** = Video operations
- **Appointment ID** = Appointment CRUD operations
- They are **different** values!
- Backend returns **both** in the response
- Use the **correct one** for each operation

---

**See also:**
- `/APPOINTMENT_VS_SESSION_ID.md` - Full explanation
- `/SESSION_ID_BUG_FIX_SUMMARY.md` - Bug fix details
