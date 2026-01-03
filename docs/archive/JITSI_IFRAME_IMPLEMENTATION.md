# 🎥 Jitsi Iframe Implementation Guide

## 📋 Overview

We're using **JitsiMeetExternalAPI** which embeds Jitsi Meet as an **iframe** in our React application. This approach provides full control while leveraging the hosted Jitsi infrastructure.

---

## 🏗️ Architecture

### Implementation Method: External API (Iframe)

```
┌──────────────────────────────────────────────────────────────┐
│ Our React Application                                       │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ JitsiVideoRoom Component                               │ │
│  │                                                         │ │
│  │  ┌──────────────────────────────────────────────────┐  │ │
│  │  │ <div ref={containerRef}>                         │  │ │
│  │  │                                                   │  │ │
│  │  │   ┌────────────────────────────────────────┐     │  │ │
│  │  │   │ IFRAME (JitsiMeetExternalAPI)          │     │  │ │
│  │  │   │                                        │     │  │ │
│  │  │   │  src: meet.bedrockhealthsolutions.com │     │  │ │
│  │  │   │  room: bedrock-sess_xyz789            │     │  │ │
│  │  │   │  jwt: eyJhbGci...                     │     │  │ │
│  │  │   │                                        │     │  │ │
│  │  │   │  [Jitsi Meet UI loads inside iframe]  │     │  │ │
│  │  │   │                                        │     │  │ │
│  │  │   └────────────────────────────────────────┘     │  │ │
│  │  │                                                   │  │ │
│  │  └──────────────────────────────────────────────────┘  │ │
│  │                                                         │ │
│  │  [React controls above iframe]                         │ │
│  │  - Custom header                                       │ │
│  │  - Quick controls (mute, video, fullscreen)            │ │
│  │  - Custom footer                                       │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

---

## 🔑 Key Files

### 1. JitsiVideoRoom Component
**File:** `/components/JitsiVideoRoom.tsx`

**Purpose:** Main video component that embeds Jitsi via iframe

**Key Features:**
- ✅ Loads JitsiMeetExternalAPI script from our Jitsi server
- ✅ Creates iframe with JWT authentication
- ✅ Custom controls above/below iframe
- ✅ Event listeners for participant tracking
- ✅ Auto-join (no pre-join screen)

### 2. External API Script
**URL:** `https://meet.bedrockhealthsolutions.com/external_api.js`

**Purpose:** Jitsi's official iframe control library

**Loaded dynamically in:** `JitsiVideoRoom.tsx` (Line 56-77)

---

## 📦 How It Works

### Step 1: Load External API Script

```typescript
// JitsiVideoRoom.tsx - Line 56
const loadJitsiScript = () => {
  return new Promise<void>((resolve, reject) => {
    // Check if already loaded
    if (window.JitsiMeetExternalAPI) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://meet.bedrockhealthsolutions.com/external_api.js';
    script.async = true;
    script.onload = () => {
      console.log('✅ Jitsi External API script loaded');
      resolve();
    };
    script.onerror = () => {
      console.error('❌ Failed to load Jitsi External API script');
      reject(new Error('Failed to load Jitsi script'));
    };
    document.body.appendChild(script);
  });
};
```

**What this does:**
- Downloads `external_api.js` from our Jitsi server
- Makes `JitsiMeetExternalAPI` class available globally
- Only loads once (checks if already loaded)

### Step 2: Create Iframe with JitsiMeetExternalAPI

```typescript
// JitsiVideoRoom.tsx - Line 127
const domain = 'meet.bedrockhealthsolutions.com';
const options = {
  roomName: roomName,                // ✅ Uses sessionId from backend
  width: '100%',
  height: '100%',
  parentNode: containerRef.current,  // Where iframe will be inserted
  jwt: jwt,                          // ✅ JWT from backend
  configOverwrite: {
    prejoinPageEnabled: false,       // ✅ Skip pre-join screen
    skipPrejoin: true,
    requireDisplayName: false,
  },
  userInfo: {
    displayName: displayName || userName || 'Guest',
    email: userEmail
  }
};

const api = new window.JitsiMeetExternalAPI(domain, options);
```

**What this does:**
- Creates an `<iframe>` element
- Iframe URL: `https://meet.bedrockhealthsolutions.com/{roomName}?jwt={jwt}`
- Inserts iframe into `containerRef.current` (our React div)
- Configures Jitsi to skip pre-join screen
- Passes JWT for authentication

### Step 3: Control Iframe via API

```typescript
// JitsiVideoRoom.tsx - Events
api.addEventListener('videoConferenceJoined', (event) => {
  console.log('✅ Joined video conference');
  setIsReady(true);
});

api.addEventListener('participantJoined', (event) => {
  console.log('👤 Participant joined:', event);
  setParticipantCount(prev => prev + 1);
});

// Commands
api.executeCommand('toggleAudio');      // Mute/unmute
api.executeCommand('toggleVideo');      // Video on/off
api.executeCommand('hangup');           // Leave call
```

**What this does:**
- Listens to events from inside the iframe
- Sends commands to the iframe
- Syncs state between iframe and React

---

## 🔄 Complete Flow

### User Journey: Login → Create → Join → Video Call

```
1. User logs in
   → POST /auth/register-or-login
   → Receives Bearer token
   → Stored in localStorage

2. User creates appointment
   → POST /appointments (with Bearer token)
   → Backend creates appointment + session
   → Returns:
      {
        "id": "appt_abc123",        // Appointment ID
        "sessionId": "sess_xyz789",  // Session ID ✅
        "roomName": "bedrock-sess_xyz789"
      }

3. User requests to join video
   → GET /sessions/sess_xyz789/jwt (with Bearer token)
   → Backend generates Jitsi JWT
   → Returns:
      {
        "jitsiToken": "eyJhbGci...",
        "serverUrl": "meet.bedrockhealthsolutions.com",
        "roomName": "bedrock-sess_xyz789"
      }

4. JitsiVideoRoom component renders
   → Loads external_api.js script
   → Creates JitsiMeetExternalAPI instance
   → Instance creates iframe:
      <iframe
        src="https://meet.bedrockhealthsolutions.com/bedrock-sess_xyz789?jwt=eyJhbGci..."
        width="100%"
        height="500px"
      />
   → Iframe loads Jitsi Meet UI
   → User auto-joins video call (no pre-join screen)
   → ✅ User is in video call!
```

---

## 🎯 Session ID Flow (Critical!)

### ✅ CORRECT: Using sessionId

```typescript
// 1. Backend response
const response = await post('/appointments', {...});
// Returns:
{
  "id": "425XV7np91dt9IVOyV2u",           // Appointment ID
  "sessionId": "nQstynfUWQdR8l48EB3y",    // Session ID ✅
  "roomName": "bedrock-c6fc1925-..."
}

// 2. Extract sessionId
const sessionId = response.appointment.sessionId;  // ✅ Correct!

// 3. Get JWT with sessionId
const jwt = await get(`/sessions/${sessionId}/jwt`);

// 4. Pass to JitsiVideoRoom
<JitsiVideoRoom
  roomName={response.appointment.roomName}
  jwt={jwt.jitsiToken}
  userName="Dr. Smith"
  userEmail="smith@example.com"
/>

// 5. Iframe loads with correct room
// URL: https://meet.bedrockhealthsolutions.com/bedrock-c6fc1925-...?jwt=...
```

### ❌ WRONG: Using appointment.id

```typescript
// This will FAIL!
const appointmentId = response.appointment.id;  // ❌ Wrong ID!
const jwt = await get(`/sessions/${appointmentId}/jwt`);
// Error: Session not found
```

---

## 🛠️ Iframe Configuration

### prejoinPageEnabled: false

**Why:** Skips the Jitsi pre-join screen where users select camera/mic

**Effect:**
- ❌ Without this: Users see "Set up your camera and microphone" screen
- ✅ With this: Users join directly into the video call

```typescript
configOverwrite: {
  prejoinPageEnabled: false,  // ✅ Skip pre-join screen
  skipPrejoin: true,          // ✅ Double-ensure no pre-join
  requireDisplayName: false,  // ✅ Don't require name entry
}
```

### Custom Toolbar

```typescript
interfaceConfigOverwrite: {
  TOOLBAR_BUTTONS: [
    'microphone',      // Mute/unmute
    'camera',          // Video on/off
    'desktop',         // Screen share
    'fullscreen',      // Fullscreen
    'hangup',          // Leave call
    'chat',            // Chat panel
    'recording',       // Start recording
    'settings',        // Settings
    'raisehand',       // Raise hand
    'tileview',        // Tile view
    ...
  ]
}
```

---

## 📱 Component Usage

### Basic Usage

```tsx
import { JitsiVideoRoom } from './components/JitsiVideoRoom';

function VideoCallPage() {
  const [session, setSession] = useState(null);
  const [jwt, setJwt] = useState(null);

  // After creating appointment and getting JWT...

  return (
    <JitsiVideoRoom
      roomName={session.roomName}
      jwt={jwt}
      userName="Dr. Emily Johnson"
      userEmail="emily@example.com"
      displayName="Dr. Emily Johnson"
      onClose={() => {
        // Handle close
        console.log('User left the call');
      }}
      onReady={() => {
        // Handle ready
        console.log('Video call ready!');
      }}
      onParticipantJoined={(participant) => {
        // Handle participant joined
        console.log('New participant:', participant);
      }}
      onParticipantLeft={(participant) => {
        // Handle participant left
        console.log('Participant left:', participant);
      }}
    />
  );
}
```

### With CreateSessionTest

```tsx
// CreateSessionTest.tsx already uses this approach
const handleJoinCall = () => {
  // Renders JitsiVideoRoom with sessionId and JWT
  setShowVideo(true);
};

{showVideo && jwtData && session && (
  <JitsiVideoRoom
    roomName={jwtData.roomName}
    jwt={jwtData.jwt}
    userName={selectedUser.name}
    userEmail={selectedUser.email}
    displayName={selectedUser.name}
    onClose={() => setShowVideo(false)}
  />
)}
```

---

## 🎨 Custom UI Around Iframe

### Header (Above Iframe)

```tsx
// JitsiVideoRoom.tsx - Line 286
<div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white p-4">
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      <Video className="w-5 h-5" />
      <div>
        <div className="font-medium">{roomName}</div>
        <div className="text-xs">
          {participantCount} participant(s)
        </div>
      </div>
    </div>
    
    {/* Quick controls: Mute, Video, Fullscreen, Close */}
    <div className="flex items-center gap-2">
      <Button onClick={toggleAudio}>
        {isAudioMuted ? <MicOff /> : <Mic />}
      </Button>
      <Button onClick={toggleVideo}>
        {isVideoMuted ? <VideoOff /> : <Video />}
      </Button>
      <Button onClick={handleClose}>
        <X />
      </Button>
    </div>
  </div>
</div>
```

### Footer (Below Iframe)

```tsx
// JitsiVideoRoom.tsx - Line 382
<div className="bg-gray-50 px-4 py-2">
  <div className="flex items-center gap-4">
    <div className="flex items-center gap-1">
      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
      <span>Connected</span>
    </div>
    <div>Room: {roomName}</div>
  </div>
  <span>JWT Authenticated</span>
</div>
```

---

## 🔍 Debugging

### Check if Script Loaded

```javascript
console.log('JitsiMeetExternalAPI available?', !!window.JitsiMeetExternalAPI);
```

### Check Iframe Creation

```javascript
// After API created
console.log('API instance:', apiRef.current);

// Check iframe in DOM
const iframe = document.querySelector('iframe[src*="meet.bedrockhealthsolutions.com"]');
console.log('Iframe:', iframe);
console.log('Iframe src:', iframe?.src);
```

### Check JWT in Iframe URL

```javascript
// Iframe URL should include JWT
const iframe = document.querySelector('iframe[src*="meet.bedrockhealthsolutions.com"]');
console.log(iframe.src);
// Should be: https://meet.bedrockhealthsolutions.com/bedrock-...?jwt=eyJhbGci...
```

### Events Log

```javascript
// All events are logged in console
// Look for:
✅ Jitsi External API script loaded
✅ Jitsi API instance created
✅ Joined video conference
👤 Participant joined
👋 Participant left
```

---

## 🚨 Common Issues

### Issue 1: Iframe doesn't load

**Symptoms:**
- Black screen
- No Jitsi UI

**Causes:**
- External API script failed to load
- Container ref not ready
- JWT invalid or expired

**Debug:**
```javascript
// Check script
console.log(window.JitsiMeetExternalAPI);  // Should be a function

// Check container
console.log(containerRef.current);  // Should be a div

// Check JWT
const parts = jwt.split('.');
const payload = JSON.parse(atob(parts[1]));
console.log('JWT payload:', payload);
console.log('Expires:', new Date(payload.exp * 1000));
```

### Issue 2: Pre-join screen shows

**Symptoms:**
- Users see "Set up your camera" screen before joining

**Cause:**
- `prejoinPageEnabled` not set to `false`

**Fix:**
```typescript
configOverwrite: {
  prejoinPageEnabled: false,  // ✅ Add this
  skipPrejoin: true,          // ✅ And this
}
```

### Issue 3: Wrong room loaded

**Symptoms:**
- Error: "Session not found"
- Empty room
- Can't join

**Cause:**
- Using appointment.id instead of sessionId

**Fix:**
```typescript
// ✅ CORRECT
const sessionId = response.appointment.sessionId;
const jwt = await get(`/sessions/${sessionId}/jwt`);

// ❌ WRONG
const sessionId = response.appointment.id;  // This is appointment ID!
```

---

## 📊 Performance

### Iframe Loading Time

**Expected:**
- Script load: 500-1000ms
- Iframe creation: 100-200ms
- Video join: 2000-3000ms
- **Total: ~3-4 seconds**

### Optimization

```typescript
// Pre-load script on app startup
useEffect(() => {
  // Load Jitsi script early
  const script = document.createElement('script');
  script.src = 'https://meet.bedrockhealthsolutions.com/external_api.js';
  script.async = true;
  document.body.appendChild(script);
}, []);
```

---

## ✅ Verification Checklist

After implementing iframe video:

- [x] ✅ External API script loads from our server
- [x] ✅ Iframe created with correct domain
- [x] ✅ JWT passed in iframe URL
- [x] ✅ SessionId (not appointmentId) used for JWT
- [x] ✅ Room name matches backend response
- [x] ✅ Pre-join screen disabled
- [x] ✅ User auto-joins video call
- [x] ✅ Custom controls work
- [x] ✅ Events fire correctly
- [x] ✅ Multiple participants can join
- [x] ✅ Video/audio works

---

## 🎯 Key Takeaways

1. **We use JitsiMeetExternalAPI** (not direct iframe)
   - Gives us control via JavaScript API
   - Can listen to events
   - Can send commands

2. **Iframe is auto-generated**
   - Created by `new JitsiMeetExternalAPI()`
   - Inserted into our container div
   - Controlled via API

3. **Session ID is critical**
   - Always use `sessionId` for JWT
   - Never use `appointment.id` for video operations

4. **Pre-join screen is disabled**
   - Users join directly
   - No camera/mic setup screen
   - Faster user experience

5. **Custom UI wraps iframe**
   - Header with room info
   - Quick controls (mute, video, close)
   - Footer with status

---

## 📚 Related Files

- `/components/JitsiVideoRoom.tsx` - Main iframe component
- `/components/CreateSessionTest.tsx` - Example usage
- `/api/sessions.ts` - Session creation (uses sessionId)
- `/config/jitsi.ts` - Jitsi configuration
- `/SESSION_ID_BUG_FIX_SUMMARY.md` - Session ID fix details

---

## 🎉 Summary

**Implementation:** JitsiMeetExternalAPI (Iframe)  
**Server:** meet.bedrockhealthsolutions.com  
**Authentication:** JWT from backend  
**Room Naming:** Uses sessionId from backend  
**Auto-Join:** Yes (pre-join disabled)  
**Custom Controls:** Yes (above/below iframe)  

**Status:** ✅ Fully Working

The iframe approach gives us the best of both worlds:
- Full Jitsi functionality (hosted externally)
- Custom React UI and controls
- Event-driven architecture
- JWT authentication
- Easy to maintain

🎥 **Video calling is ready!**
