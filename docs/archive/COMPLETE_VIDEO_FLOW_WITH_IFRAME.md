# 🎬 Complete Video Flow with Iframe Implementation

## 🎯 End-to-End Flow: Login → Iframe Video Call

```
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 1: USER LOGIN                                                  │
└─────────────────────────────────────────────────────────────────────┘

User clicks "Login" in CreateSessionTest
          ↓
POST /auth/register-or-login
{
  "userId": "USR-THERAPIST-001",
  "email": "therapist001@example.com",
  "role": "therapist"
}
          ↓
Backend Response:
{
  "success": true,
  "data": {
    "user": { ... },
    "tokens": {
      "accessToken": "eyJhbGci...",  ← BEARER TOKEN
      "refreshToken": "...",
      "expiresIn": "24h"
    }
  }
}
          ↓
✅ Bearer token stored in localStorage
✅ Ready for Step 2


┌─────────────────────────────────────────────────────────────────────┐
│ STEP 2: CREATE APPOINTMENT (Get Session ID)                        │
└─────────────────────────────────────────────────────────────────────┘

User clicks "Create Video Session"
          ↓
POST /appointments
Headers: { Authorization: "Bearer eyJhbGci..." }  ← Using Bearer token
Body: {
  "therapistId": "USR-THERAPIST-001",
  "clientId": "USR-CLIENT-001",
  "startTime": "2025-11-16T15:00:00.000Z",
  "endTime": "2025-11-16T16:00:00.000Z"
}
          ↓
Backend Response:
{
  "success": true,
  "data": {
    "appointment": {
      "id": "425XV7np91dt9IVOyV2u",           ← Appointment ID (for CRUD)
      "appointmentCode": "APT-2025-000232",
      "sessionId": "nQstynfUWQdR8l48EB3y",    ← SESSION ID ✅ (for video!)
      "therapistId": "USR-THERAPIST-001",
      "clientId": "USR-CLIENT-001",
      "meetingLink": "https://meet.bedrockhealthsolutions.com/bedrock-c6fc1925-...",
      "roomName": "bedrock-c6fc1925-f3a0-4d35-aea4-840cb15b00aa",
      "status": "scheduled",
      ...
    }
  }
}
          ↓
📝 Extract BOTH IDs:
   appointmentId = "425XV7np91dt9IVOyV2u"  (for appointment updates)
   sessionId = "nQstynfUWQdR8l48EB3y"      (for video/JWT) ✅
          ↓
✅ Session created with sessionId
✅ Ready for Step 3


┌─────────────────────────────────────────────────────────────────────┐
│ STEP 3: GET JWT TOKEN (Using Session ID)                           │
└─────────────────────────────────────────────────────────────────────┘

User clicks "Get JWT Token"
          ↓
GET /sessions/nQstynfUWQdR8l48EB3y/jwt  ← Using sessionId, NOT appointment.id!
Headers: { Authorization: "Bearer eyJhbGci..." }
          ↓
Backend Response:
{
  "success": true,
  "data": {
    "jitsiToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "serverUrl": "meet.bedrockhealthsolutions.com",
    "roomName": "bedrock-c6fc1925-f3a0-4d35-aea4-840cb15b00aa",
    "expiresAt": "2025-11-16T16:00:00.000Z"
  }
}
          ↓
✅ Jitsi JWT token received
✅ Ready to join video call


┌─────────────────────────────────────────────────────────────────────┐
│ STEP 4: LOAD JITSI EXTERNAL API SCRIPT                             │
└─────────────────────────────────────────────────────────────────────┘

JitsiVideoRoom component mounts
          ↓
Check: Is external_api.js already loaded?
          ↓
    NO → Load script dynamically
          ↓
<script src="https://meet.bedrockhealthsolutions.com/external_api.js" async />
          ↓
Script downloads and executes
          ↓
window.JitsiMeetExternalAPI = class { ... }  ← API available globally
          ↓
✅ External API script loaded
✅ Ready to create iframe


┌─────────────────────────────────────────────────────────────────────┐
│ STEP 5: CREATE JITSI IFRAME                                        │
└─────────────────────────────────────────────────────────────────────┘

const api = new window.JitsiMeetExternalAPI(
  'meet.bedrockhealthsolutions.com',  ← Our Jitsi server
  {
    roomName: 'bedrock-c6fc1925-f3a0-4d35-aea4-840cb15b00aa',
    jwt: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    parentNode: containerRef.current,  ← Where to insert iframe
    width: '100%',
    height: '100%',
    configOverwrite: {
      prejoinPageEnabled: false,  ← Skip pre-join screen
      skipPrejoin: true
    },
    userInfo: {
      displayName: 'Dr. Emily Johnson',
      email: 'therapist001@example.com'
    }
  }
);
          ↓
JitsiMeetExternalAPI creates iframe:
          ↓
<iframe
  src="https://meet.bedrockhealthsolutions.com/bedrock-c6fc1925-...?jwt=eyJhbGci..."
  width="100%"
  height="500px"
  allow="camera; microphone; fullscreen; display-capture"
/>
          ↓
Iframe is inserted into containerRef.current div
          ↓
✅ Iframe created and inserted into DOM


┌─────────────────────────────────────────────────────────────────────┐
│ STEP 6: IFRAME LOADS JITSI MEET                                    │
└─────────────────────────────────────────────────────────────────────┘

Iframe navigates to:
https://meet.bedrockhealthsolutions.com/bedrock-c6fc1925-...?jwt=eyJhbGci...
          ↓
Jitsi server receives:
  - Room name: bedrock-c6fc1925-f3a0-4d35-aea4-840cb15b00aa
  - JWT token: eyJhbGci...
          ↓
Jitsi server validates JWT:
  - Checks signature (HMAC with secret key)
  - Checks expiration (exp claim)
  - Checks moderator flag (moderator: true/false)
  - Checks room name matches JWT context.room
          ↓
✅ JWT valid
          ↓
Jitsi loads meeting UI inside iframe:
  - Camera/microphone permissions requested
  - Video preview
  - Join meeting automatically (no pre-join screen)
          ↓
User sees their video in iframe
          ↓
✅ User joined video conference!


┌─────────────────────────────────────────────────────────────────────┐
│ STEP 7: EVENT LISTENERS & CONTROLS                                 │
└─────────────────────────────────────────────────────────────────────┘

React Component ←→ Iframe Communication
          ↓
Events from iframe to React:
          ↓
api.addEventListener('videoConferenceJoined', (event) => {
  console.log('✅ Joined video conference');
  setIsReady(true);
  setIsLoading(false);
});
          ↓
api.addEventListener('participantJoined', (event) => {
  console.log('👤 Participant joined:', event);
  setParticipantCount(prev => prev + 1);
});
          ↓
api.addEventListener('participantLeft', (event) => {
  console.log('👋 Participant left:', event);
  setParticipantCount(prev => prev - 1);
});
          ↓
Commands from React to iframe:
          ↓
User clicks mute button
  → api.executeCommand('toggleAudio')
  → Iframe receives command
  → Microphone muted/unmuted
          ↓
User clicks video button
  → api.executeCommand('toggleVideo')
  → Iframe receives command
  → Video on/off
          ↓
User clicks leave button
  → api.executeCommand('hangup')
  → Iframe receives command
  → User leaves meeting
  → 'readyToClose' event fired
  → onClose() callback triggered
          ↓
✅ Full two-way communication between React and iframe


┌─────────────────────────────────────────────────────────────────────┐
│ STEP 8: ANOTHER PARTICIPANT JOINS                                  │
└─────────────────────────────────────────────────────────────────────┘

Client user repeats Steps 1-6:
  1. Login (get Bearer token)
  2. Already has appointment (same sessionId)
  3. Get JWT token (using same sessionId)
  4. Load external API
  5. Create iframe with same room name
  6. Join same video conference
          ↓
Both users are now in same video call:
          ↓
Therapist (Moderator):
  - Can mute all
  - Can remove participants
  - Can end meeting for all
  - Can start/stop recording
          ↓
Client (Participant):
  - Can mute self
  - Can turn off video
  - Can share screen (if enabled)
  - Can chat
          ↓
✅ Video call with multiple participants working!


┌─────────────────────────────────────────────────────────────────────┐
│ STEP 9: CLEANUP                                                     │
└─────────────────────────────────────────────────────────────────────┘

User leaves meeting or closes component
          ↓
React cleanup (useEffect return):
          ↓
if (apiRef.current) {
  apiRef.current.dispose();  ← Cleanup API
  apiRef.current = null;
}
          ↓
Iframe removed from DOM
          ↓
Event listeners removed
          ↓
Memory freed
          ↓
✅ Clean exit
```

---

## 🎯 Key Points

### 1. Bearer Token Authentication
```
Login → Bearer Token → All API requests include:
  Header: Authorization: Bearer eyJhbGci...
```

### 2. Two Different IDs
```
Backend returns:
  appointment.id = "425XV7np91dt9IVOyV2u"      (Appointment ID)
  appointment.sessionId = "nQstynfUWQdR8l48EB3y" (Session ID)

For video/JWT: Use sessionId ✅
For appointment CRUD: Use appointment.id ✅
```

### 3. Two Different JWTs
```
Bearer Token (Backend API):
  - From: /auth/register-or-login
  - Used for: All API requests
  - Header: Authorization: Bearer {token}

Jitsi JWT (Video):
  - From: /sessions/{sessionId}/jwt
  - Used for: Jitsi video authentication
  - URL param: ?jwt={token}
```

### 4. Iframe vs Direct Embed
```
❌ Direct iframe:
  <iframe src="https://meet.bedrockhealthsolutions.com/room" />
  - No control
  - No events
  - Can't send commands

✅ JitsiMeetExternalAPI (our approach):
  new JitsiMeetExternalAPI(domain, options)
  - Full control via JavaScript
  - Listen to events
  - Send commands
  - Better UX
```

---

## 🔍 Debug Checklist

At each step, verify:

### Step 1: Login
```javascript
✅ Check: localStorage.getItem('accessToken')
✅ Console: "✅ ✅ ✅ BEARER TOKEN RECEIVED! ✅ ✅ ✅"
```

### Step 2: Create Appointment
```javascript
✅ Check: sessionData.id (should be sessionId)
✅ Check: sessionData.appointmentId (should be appointment.id)
✅ Console: "🎥 Session ID: nQstynfUWQdR8l48EB3y (for video/JWT) ← USING THIS!"
```

### Step 3: Get JWT
```javascript
✅ Check: URL uses sessionId, not appointment.id
✅ Check: GET /sessions/nQstynfUWQdR8l48EB3y/jwt (not 425XV7np91dt9IVOyV2u)
✅ Console: "✅ ✅ ✅ JITSI JWT TOKEN RECEIVED! ✅ ✅ ✅"
```

### Step 4: Load Script
```javascript
✅ Check: window.JitsiMeetExternalAPI exists
✅ Console: "✅ Jitsi External API script loaded"
```

### Step 5: Create Iframe
```javascript
✅ Check: document.querySelector('iframe[src*="meet.bedrockhealthsolutions.com"]')
✅ Console: "✅ Jitsi API instance created"
```

### Step 6: Join Conference
```javascript
✅ Check: Camera/mic permissions granted
✅ Console: "✅ Joined video conference"
```

### Step 7: Events Working
```javascript
✅ Check: Participant count updates
✅ Check: Mute/unmute works
✅ Console: "👤 Participant joined" / "👋 Participant left"
```

---

## 🎨 Visual Representation

```
┌───────────────────────────────────────────────────┐
│ React App (Our Code)                             │
│                                                   │
│  ┌─────────────────────────────────────────────┐ │
│  │ JitsiVideoRoom Component                    │ │
│  │                                              │ │
│  │  [Orange Header: Room Name, Controls]       │ │
│  │  ┌────────────────────────────────────────┐ │ │
│  │  │                                         │ │ │
│  │  │  <IFRAME>                               │ │ │
│  │  │                                         │ │ │
│  │  │  ┌────────────────────────────────┐    │ │ │
│  │  │  │ Jitsi Meet (External)          │    │ │ │
│  │  │  │                                │    │ │ │
│  │  │  │ - Video grid                   │    │ │ │
│  │  │  │ - Toolbar                      │    │ │ │
│  │  │  │ - Chat                         │    │ │ │
│  │  │  │ - Participants                 │    │ │ │
│  │  │  │                                │    │ │ │
│  │  │  │ Authenticated via JWT          │    │ │ │
│  │  │  │ Room: bedrock-sess_xyz789      │    │ │ │
│  │  │  └────────────────────────────────┘    │ │ │
│  │  │                                         │ │ │
│  │  └────────────────────────────────────────┘ │ │
│  │  [Gray Footer: Connection Status]          │ │
│  │                                              │ │
│  └─────────────────────────────────────────────┘ │
│                                                   │
│  [Our custom controls talk to iframe via API]    │
└───────────────────────────────────────────────────┘

React ←─ Events ──→ JitsiMeetExternalAPI ←─ Events ──→ Iframe
React ──Commands──→ JitsiMeetExternalAPI ──Commands──→ Iframe
```

---

## 🎯 Summary

**Complete flow:**
1. ✅ Login → Bearer token
2. ✅ Create appointment → Get sessionId (not appointment.id!)
3. ✅ Get JWT → Use sessionId
4. ✅ Load external_api.js
5. ✅ Create iframe with JitsiMeetExternalAPI
6. ✅ Iframe loads Jitsi Meet with JWT auth
7. ✅ User auto-joins (no pre-join screen)
8. ✅ Events and commands work via API
9. ✅ Multiple participants can join

**Key fixes applied:**
- ✅ Using sessionId (not appointment.id) for JWT
- ✅ Bearer token for all API requests
- ✅ Iframe approach with JitsiMeetExternalAPI
- ✅ Pre-join screen disabled
- ✅ Custom UI around iframe
- ✅ Full event/command support

🎉 **Everything working perfectly!**
