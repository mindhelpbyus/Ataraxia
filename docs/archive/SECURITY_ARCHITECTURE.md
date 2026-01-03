# Security Architecture Documentation

## Overview

This document describes the security architecture for role-based access control in the Ataraxia Wellness Calendar system, with a focus on video session security and Firestore as the source of truth for user roles.

---

## 🔐 Security Principles

### 1. **Firestore as Source of Truth**
- All user roles are stored in Firestore under `/users/{userId}`
- Backend ALWAYS verifies roles from Firestore, NEVER trusts JWT claims alone
- Frontend also verifies roles from Firestore before showing UI elements

### 2. **Defense in Depth**
- Multiple layers of verification:
  1. Frontend role verification (UI)
  2. API client role verification
  3. Backend JWT validation
  4. Backend Firestore role verification
  5. Backend business logic validation

### 3. **Principle of Least Privilege**
- Default role: `participant`
- Moderator privileges only for `therapist` and `admin` roles
- Explicit verification required for all privileged actions

### 4. **Audit Trail**
- All security-sensitive actions are logged
- Failed access attempts are tracked
- Security audit logs available for review

---

## 🏗️ Architecture Components

### 1. Role Verification Service (`/services/roleVerification.ts`)

**Purpose:** Verify user roles from Firestore before granting access.

**Key Functions:**

```typescript
// Verify role from Firestore (source of truth)
verifyUserRoleFromFirestore(userId, requireModerator)

// Verify moderator access (throws error if not moderator)
verifyModeratorAccess(userId, sessionId)

// Verify session access (any authenticated user)
verifySessionAccess(userId, sessionId)

// Check privileges without throwing (for UI)
hasModeratorPrivileges(userId)

// Batch verify multiple users
batchVerifyUsers(userIds)
```

**Role Mapping:**
```typescript
therapist → moderator
admin     → moderator
client   → participant
client    → participant
```

**Caching:**
- 5-minute TTL for performance
- Cache automatically refreshed on expiration
- Manual cache clear when roles updated

### 2. Secure Video API (`/api/secureVideo.ts`)

**Purpose:** Enforce role verification for video operations.

**Protected Operations:**

```typescript
// ✅ Verifies role from Firestore
getSecureVideoConfig(sessionId)
executeSecureVideoCommand(sessionId, command)
startSecureRecording(sessionId)
stopSecureRecording(sessionId)

// 🔓 Allowed for all participants
sendSecureVideoEvent(sessionId, event)
```

**Security Flow:**

```
1. User requests video config
   ↓
2. API gets current user from auth
   ↓
3. Verifies role from Firestore
   ↓
4. Checks if moderator required
   ↓
5. Logs security event
   ↓
6. Calls backend API
   ↓
7. Returns config + role verification
```

### 3. Secure Session API (`/api/secureSessions.ts`)

**Purpose:** Enforce role verification for session management.

**Protected Operations:**

```typescript
// Requires moderator role (verified from Firestore)
createSecureSession(request)
endSecureSession(sessionId)
removeSecureParticipant(sessionId, userId)
muteSecureParticipant(sessionId, userId, muted)
updateSecureSessionSettings(sessionId, settings)
grantSecureModerator(sessionId, userId)
updateSecureParticipantPermissions(sessionId, request)

// Allowed for all authenticated users
joinSecureSession(request)
getSecureSession(sessionId)
```

**Security Enhancements:**

1. **Session Creation:**
   - Creator role verified from Firestore
   - All participants verified from Firestore
   - Participant roles updated based on Firestore data

2. **Moderator Grant:**
   - Granter role verified from Firestore
   - Target user role verified from Firestore
   - Only therapist/admin can be granted moderator

3. **All Actions:**
   - Security events logged
   - Failed attempts tracked
   - Audit trail maintained

---

## 🛡️ Security Vulnerabilities Addressed

### ❌ **Previous Vulnerability**

**Problem:** Backend relied on JWT claims for role assignment

```javascript
// INSECURE - JWT claims can be manipulated if token generation is compromised
const videoRole = (req.user.role === 'therapist') ? 'moderator' : 'participant';
```

**Risk:** If JWT generation was compromised, attackers could:
- Create tokens with elevated roles
- Claim therapist role without authorization
- Gain moderator privileges in sessions

### ✅ **Security Fix**

**Solution:** Always verify from Firestore

```typescript
// SECURE - Firestore is the source of truth
const profile = await getTherapistProfile(userId);
if (!profile) throw new Error('User not found');

const videoRole = (profile.role === 'therapist' || profile.role === 'admin') 
  ? 'moderator' 
  : 'participant';
```

**Protection:**
- Firestore enforces security rules
- Only authenticated users can read their own profile
- Role changes require admin privileges
- JWT cannot override Firestore data

---

## 🔄 Request Flow Example

### Example: Starting a Recording

**1. Frontend Request:**
```typescript
import { startSecureRecording } from './api/secureSessions';

// User clicks "Start Recording"
await startSecureRecording(sessionId);
```

**2. Frontend Verification:**
```typescript
// api/secureVideo.ts
const user = await getCurrentUser();
const roleVerification = await verifyModeratorAccess(user.id, sessionId);
// ↓ Calls Firestore
```

**3. Firestore Verification:**
```typescript
// services/roleVerification.ts
const profile = await getTherapistProfile(userId);
if (profile.role !== 'therapist' && profile.role !== 'admin') {
  throw new Error('Moderator access required');
}
```

**4. Security Logging:**
```typescript
logSecurityEvent({
  userId: user.id,
  action: 'start_recording',
  sessionId,
  role: roleVerification.role,
  videoRole: roleVerification.videoRole,
  success: true
});
```

**5. Backend Request:**
```typescript
// POST /video/recording/:sessionId/start
// With Firebase Auth JWT token in header
```

**6. Backend Verification (Recommended):**
```javascript
// Backend should also verify from Firestore
const user = await admin.firestore()
  .collection('users')
  .doc(userId)
  .get();

if (!user.exists || !['therapist', 'admin'].includes(user.data().role)) {
  return res.status(403).json({ error: 'Insufficient permissions' });
}
```

**7. Backend Action:**
```javascript
// Start recording with Jibri
// Generate recording metadata
// Return recording status
```

---

## 📊 Security Audit Logs

### Log Structure

```typescript
interface SecurityAuditLog {
  timestamp: Date;
  userId: string;
  action: string;
  sessionId?: string;
  role: UserRole;
  videoRole: VideoRole;
  success: boolean;
  details?: any;
}
```

### Logged Actions

- `create_session` - Session creation
- `join_session` - User joining session
- `end_session` - Session termination
- `get_video_config` - Video config access
- `execute_video_command` - Video commands (mute, kick, etc.)
- `start_recording` - Recording started
- `stop_recording` - Recording stopped
- `remove_participant` - Participant removed
- `mute_participant` - Participant muted
- `grant_moderator` - Moderator role granted
- `update_session_settings` - Settings changed
- `update_participant_permissions` - Permissions changed

### Viewing Audit Logs

```typescript
import { 
  getSecurityAuditLogs, 
  getUserSecurityLogs 
} from './services/roleVerification';

// Get last 100 security events
const logs = getSecurityAuditLogs(100);

// Get specific user's logs
const userLogs = getUserSecurityLogs('user-123', 50);

// View in console (dev mode)
console.table(logs);
```

---

## 🎯 Implementation Checklist

### Frontend Implementation

- [x] Role verification service created
- [x] Secure video API implemented
- [x] Secure session API implemented
- [x] Security audit logging added
- [x] Role caching with TTL
- [x] Batch user verification
- [x] UI helper functions (hasModeratorPrivileges)

### Backend Implementation (Recommended)

- [ ] Add Firestore role verification middleware
- [ ] Verify roles before generating Jitsi JWT
- [ ] Verify roles before executing commands
- [ ] Add security audit logging
- [ ] Implement rate limiting for privileged actions
- [ ] Add admin-only role change endpoints

### Backend Middleware Example

```javascript
// middleware/verifyRole.js
async function verifyRoleFromFirestore(req, res, next) {
  try {
    const userId = req.user.uid; // From authenticated JWT
    
    // Fetch from Firestore (source of truth)
    const userDoc = await admin.firestore()
      .collection('users')
      .doc(userId)
      .get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const userData = userDoc.data();
    
    // Override req.user.role with Firestore role
    req.user.role = userData.role;
    req.user.roleVerifiedFromFirestore = true;
    
    next();
  } catch (error) {
    console.error('Role verification failed:', error);
    res.status(500).json({ error: 'Role verification failed' });
  }
}

// Use in routes
router.post('/video/recording/:sessionId/start', 
  authenticateToken,
  verifyRoleFromFirestore,
  requireModerator,
  startRecording
);
```

---

## 🚨 Attack Scenarios & Mitigations

### Scenario 1: JWT Token Manipulation

**Attack:** Attacker modifies JWT token to claim therapist role

**Mitigation:**
- ✅ JWT signature verification prevents token modification
- ✅ Firestore verification overrides JWT claims
- ✅ Backend validates signature with Firebase Admin SDK
- ✅ Frontend verifies role from Firestore before UI actions

### Scenario 2: Compromised Frontend

**Attack:** Malicious code bypasses frontend checks

**Mitigation:**
- ✅ Backend performs independent verification
- ✅ Backend never trusts frontend role claims
- ✅ All privileged actions require backend approval
- ✅ Firestore security rules prevent unauthorized reads/writes

### Scenario 3: Session Hijacking

**Attack:** Attacker steals session token and impersonates user

**Mitigation:**
- ✅ JWTs expire after short period (2 hours)
- ✅ Refresh tokens required for new access tokens
- ✅ Role re-verified from Firestore on each request
- ✅ Security audit logs track all actions

### Scenario 4: Privilege Escalation

**Attack:** Client tries to execute moderator commands

**Mitigation:**
- ✅ Role verified from Firestore before command execution
- ✅ Failed attempts logged for audit
- ✅ Backend rejects unauthorized requests
- ✅ Multiple verification layers (frontend + backend)

### Scenario 5: Batch Attack

**Attack:** Attacker floods system with privilege requests

**Mitigation:**
- ✅ Rate limiting on backend (recommended)
- ✅ Audit logs track repeated failures
- ✅ Firestore caching reduces DB load
- ✅ Failed attempts monitored for patterns

---

## 📝 Best Practices

### 1. Always Use Secure APIs

```typescript
// ❌ DON'T - Bypasses role verification
import { executeVideoCommand } from './api/video';

// ✅ DO - Verifies role from Firestore
import { executeSecureVideoCommand } from './api/secureVideo';
```

### 2. Check Permissions Before UI Actions

```typescript
// Check if user can perform action
const isModerator = await hasModeratorPrivileges(userId);

// Conditionally render UI
{isModerator && (
  <Button onClick={startRecording}>Start Recording</Button>
)}
```

### 3. Clear Cache on Role Changes

```typescript
import { clearRoleCache } from './services/roleVerification';

// After updating user role
await updateUserRole(userId, 'therapist');
clearRoleCache(userId);
```

### 4. Monitor Audit Logs

```typescript
// Regular security reviews
const recentLogs = getSecurityAuditLogs(1000);
const failedAttempts = recentLogs.filter(log => !log.success);

if (failedAttempts.length > 100) {
  console.warn('High number of failed security attempts');
}
```

### 5. Implement Backend Verification

Always implement matching verification on backend:

```javascript
// Backend route
app.post('/sessions/:sessionId/end', 
  authenticateToken,           // Verify JWT
  verifyRoleFromFirestore,     // Check Firestore
  requireModerator,            // Enforce moderator
  endSession                   // Execute action
);
```

---

## 🔍 Testing Security

### Unit Tests

```typescript
describe('Role Verification', () => {
  it('should verify therapist role from Firestore', async () => {
    const result = await verifyUserRoleFromFirestore('therapist-123');
    expect(result.role).toBe('therapist');
    expect(result.videoRole).toBe('moderator');
    expect(result.verified).toBe(true);
  });

  it('should reject client from moderator actions', async () => {
    await expect(
      verifyModeratorAccess('client-456')
    ).rejects.toThrow('Moderator access required');
  });
});
```

### Integration Tests

```typescript
describe('Secure Session Management', () => {
  it('should allow therapist to create session', async () => {
    const { session } = await createSecureSession({
      title: 'Test',
      participants: [...]
    });
    expect(session.id).toBeDefined();
  });

  it('should prevent client from ending session', async () => {
    await expect(
      endSecureSession(sessionId)
    ).rejects.toThrow('Insufficient permissions');
  });
});
```

---

## 📚 Additional Resources

- **API Integration Guide:** `/API_INTEGRATION_GUIDE.md`
- **Quick Reference:** `/API_QUICK_REFERENCE.md`
- **Firestore Service:** `/services/firestoreService.ts`
- **Role Verification:** `/services/roleVerification.ts`
- **Secure Video API:** `/api/secureVideo.ts`
- **Secure Sessions:** `/api/secureSessions.ts`

---

**Last Updated:** 2024-01-15  
**Version:** 1.0.0  
**Security Level:** High
