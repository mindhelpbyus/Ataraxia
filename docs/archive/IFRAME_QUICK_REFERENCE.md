# 🎥 Iframe Quick Reference Card

## 🎯 One-Page Reference for Jitsi Iframe Implementation

---

## 📦 What We're Using

**Implementation:** JitsiMeetExternalAPI (Iframe approach)  
**Server:** meet.bedrockhealthsolutions.com  
**Component:** `/components/JitsiVideoRoom.tsx`  
**Script:** `https://meet.bedrockhealthsolutions.com/external_api.js`

---

## 🔑 Critical IDs (Don't Mix These Up!)

```javascript
// Backend returns BOTH IDs:
{
  "id": "appt_abc123",        // ❌ Appointment ID - for CRUD only
  "sessionId": "sess_xyz789"  // ✅ Session ID - for video/JWT
}

// For video operations:
const sessionId = response.appointment.sessionId;  // ✅ Always use this!

// For appointment CRUD:
const appointmentId = response.appointment.id;     // ✅ Use this instead
```

---

## 🔄 Complete Flow (4 Steps)

```
1. Login
   POST /auth/register-or-login
   → Bearer token

2. Create Appointment
   POST /appointments (with Bearer token)
   → sessionId + appointmentId

3. Get JWT
   GET /sessions/{sessionId}/jwt (with Bearer token)
   → Jitsi JWT

4. Join Video
   <JitsiVideoRoom roomName={...} jwt={...} />
   → Iframe created → Video call loads
```

---

## 💻 Code Example

```typescript
// 1. Login
const loginResponse = await post('/auth/register-or-login', {
  userId: 'USR-THERAPIST-001',
  email: 'therapist001@example.com',
  role: 'therapist'
});
const bearerToken = loginResponse.data.tokens.accessToken;

// 2. Create appointment
const apptResponse = await post('/appointments', {
  therapistId: 'USR-THERAPIST-001',
  clientId: 'USR-CLIENT-001',
  startTime: '2025-11-16T15:00:00.000Z',
  endTime: '2025-11-16T16:00:00.000Z'
}, {
  headers: { Authorization: `Bearer ${bearerToken}` }
});

// 3. Extract IDs (CRITICAL!)
const sessionId = apptResponse.appointment.sessionId;      // ✅ For video
const appointmentId = apptResponse.appointment.id;         // ✅ For CRUD
const roomName = apptResponse.appointment.roomName;

// 4. Get JWT
const jwtResponse = await get(`/sessions/${sessionId}/jwt`, {
  headers: { Authorization: `Bearer ${bearerToken}` }
});
const jitsiJWT = jwtResponse.data.jitsiToken;

// 5. Render video component
<JitsiVideoRoom
  roomName={roomName}
  jwt={jitsiJWT}
  userName="Dr. Emily Johnson"
  userEmail="therapist001@example.com"
  onClose={() => console.log('Left call')}
/>
```

---

## 🏗️ How Iframe Works

```
JitsiVideoRoom Component
    ↓
Load external_api.js script
    ↓
const api = new window.JitsiMeetExternalAPI(domain, options)
    ↓
API creates <iframe> automatically
    ↓
<iframe src="https://meet.bedrockhealthsolutions.com/bedrock-...?jwt=..." />
    ↓
Iframe loads Jitsi Meet UI
    ↓
User auto-joins video call
```

---

## 🎨 Component Structure

```typescript
function JitsiVideoRoom({ roomName, jwt, userName, onClose }) {
  const containerRef = useRef<HTMLDivElement>(null);  // Where iframe goes
  const apiRef = useRef<any>(null);                   // API instance
  
  useEffect(() => {
    // 1. Load script
    await loadJitsiScript();
    
    // 2. Create API instance (creates iframe)
    const api = new window.JitsiMeetExternalAPI(
      'meet.bedrockhealthsolutions.com',
      {
        roomName: roomName,
        jwt: jwt,
        parentNode: containerRef.current,  // ← Iframe inserted here
        configOverwrite: {
          prejoinPageEnabled: false  // ← Skip pre-join screen
        }
      }
    );
    
    // 3. Event listeners
    api.addEventListener('videoConferenceJoined', () => {
      console.log('Joined!');
    });
    
    // 4. Cleanup
    return () => api.dispose();
  }, [roomName, jwt]);
  
  return (
    <div>
      <div>Header with controls</div>
      <div ref={containerRef} />  {/* ← Iframe goes here */}
      <div>Footer with status</div>
    </div>
  );
}
```

---

## 🎛️ Controls & Events

### Send Commands to Iframe
```typescript
api.executeCommand('toggleAudio');      // Mute/unmute
api.executeCommand('toggleVideo');      // Video on/off
api.executeCommand('hangup');           // Leave call
```

### Receive Events from Iframe
```typescript
api.addEventListener('videoConferenceJoined', (event) => {
  // User joined
});

api.addEventListener('participantJoined', (event) => {
  // Someone joined
});

api.addEventListener('participantLeft', (event) => {
  // Someone left
});
```

---

## 🔍 Debug Checklist

```javascript
// 1. Check script loaded
console.log(window.JitsiMeetExternalAPI);  // Should be a class

// 2. Check iframe created
const iframe = document.querySelector('iframe[src*="meet.bedrockhealthsolutions.com"]');
console.log(iframe);  // Should exist

// 3. Check iframe URL
console.log(iframe.src);
// Should be: https://meet.bedrockhealthsolutions.com/bedrock-...?jwt=...

// 4. Check JWT in URL
console.log(iframe.src.includes('jwt='));  // Should be true

// 5. Check API instance
console.log(apiRef.current);  // Should be an object
```

---

## ⚠️ Common Mistakes

### ❌ MISTAKE 1: Using appointment.id for JWT
```typescript
// ❌ WRONG
const jwt = await get(`/sessions/${appointment.id}/jwt`);
```

### ✅ FIX
```typescript
// ✅ CORRECT
const jwt = await get(`/sessions/${appointment.sessionId}/jwt`);
```

---

### ❌ MISTAKE 2: Pre-join screen shows
```typescript
// ❌ Missing this config
configOverwrite: {
  // No prejoinPageEnabled setting
}
```

### ✅ FIX
```typescript
// ✅ Add this
configOverwrite: {
  prejoinPageEnabled: false,
  skipPrejoin: true
}
```

---

### ❌ MISTAKE 3: Iframe doesn't load
```typescript
// ❌ Container ref not set
const api = new JitsiMeetExternalAPI(domain, {
  parentNode: null  // ❌ No container!
});
```

### ✅ FIX
```typescript
// ✅ Use ref
const containerRef = useRef<HTMLDivElement>(null);
const api = new JitsiMeetExternalAPI(domain, {
  parentNode: containerRef.current  // ✅ Container ref
});
```

---

## 📝 Console Output (Expected)

```
🎬 Initializing Jitsi Video Room...
   Room: bedrock-sess_xyz789
   JWT: eyJhbGci... (truncated)
   User: Dr. Emily Johnson
   🔑 Moderator status from JWT: true
   ⏰ JWT expires at: 11/16/2025, 4:00 PM
   ✅ JWT is valid

🔧 Creating JitsiMeetExternalAPI instance...
   📋 Config: prejoinPageEnabled=false, skipPrejoin=true

✅ Jitsi External API script loaded
✅ Jitsi API instance created
✅ Joined video conference: { roomName: "bedrock-...", ... }
```

---

## 🎯 Quick Test

```bash
# Terminal
./test-video-session.sh

# Or browser
1. Open app
2. Click "🎥 Test Jitsi Video Calling"
3. Select "Dr. Emily Johnson"
4. Login → Create → Get JWT → Join
5. You're in a video call! 🎥
```

---

## 📊 Performance

```
Load Times:
  Script:   500-1000ms
  Iframe:   100-200ms
  Join:     2000-3000ms
  Total:    ~3-4 seconds

Memory:
  Idle:     ~50MB
  1:1 call: ~150MB
  10 users: ~300MB
```

---

## 🔑 Key Takeaways

1. **JitsiMeetExternalAPI creates iframe automatically**
   - Don't manually create `<iframe>` tag
   - API handles it for you

2. **Session ID ≠ Appointment ID**
   - sessionId → Video/JWT operations
   - appointmentId → Appointment CRUD

3. **Two different JWTs**
   - Bearer token → Backend API
   - Jitsi JWT → Video authentication

4. **Pre-join screen disabled**
   - Users join directly
   - No camera/mic setup screen

5. **Full control via API**
   - Send commands to iframe
   - Receive events from iframe

---

## 📚 See Also

- `/JITSI_IFRAME_IMPLEMENTATION.md` - Full guide
- `/COMPLETE_VIDEO_FLOW_WITH_IFRAME.md` - Complete flow
- `/SESSION_ID_BUG_FIX_SUMMARY.md` - Session ID fix
- `/QUICK_START_TESTING.md` - Testing guide

---

**Status:** ✅ Working  
**Implementation:** Iframe via JitsiMeetExternalAPI  
**Server:** meet.bedrockhealthsolutions.com  
**Auth:** JWT from backend  

🎉 **Video calling ready!**
