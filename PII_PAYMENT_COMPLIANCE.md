# PII & Payment Compliance Guide

## Overview
This guide covers PII (Personally Identifiable Information) and payment compliance for the Ataraxia platform.

---

## 🔐 PII Compliance Status

### ✅ **Implemented Protections:**

1. **Secure Logging** (`src/services/secureLogger.ts`)
   - Automatically redacts: emails, phone numbers, SSN
   - Sanitizes all log output
   - No PII in production logs

2. **Session Security** (`src/services/sessionTimeout.ts`)
   - 15-minute auto-logout
   - Prevents unauthorized PII access
   - Audit trail for all sessions

3. **Input Sanitization** (`src/utils/sanitization.ts`)
   - XSS prevention
   - SQL injection protection
   - Data validation

### ⚠️ **Critical Gaps:**

#### 1. **Encryption at Rest** (CRITICAL)
**Status**: ❌ NOT IMPLEMENTED
**Risk**: Database breach exposes all PII
**Timeline**: Implement THIS WEEK

**PII Data Requiring Encryption:**
- Full names
- Email addresses
- Phone numbers
- Physical addresses
- Date of birth
- Social Security Numbers (if collected)
- Emergency contact information
- Insurance information

**Implementation Steps:**

```typescript
// Install encryption library
npm install @google-cloud/kms

// Create encryption service
// src/services/encryption.ts
import { KeyManagementServiceClient } from '@google-cloud/kms';

const client = new KeyManagementServiceClient();
const keyName = 'projects/YOUR_PROJECT/locations/global/keyRings/YOUR_KEYRING/cryptoKeys/pii-encryption';

export async function encryptPII(plaintext: string): Promise<string> {
  const [result] = await client.encrypt({
    name: keyName,
    plaintext: Buffer.from(plaintext),
  });
  return result.ciphertext.toString('base64');
}

export async function decryptPII(ciphertext: string): Promise<string> {
  const [result] = await client.decrypt({
    name: keyName,
    ciphertext: Buffer.from(ciphertext, 'base64'),
  });
  return result.plaintext.toString();
}

// Usage in Firestore
async function savePatient(data: PatientData) {
  const encrypted = {
    ...data,
    firstName: await encryptPII(data.firstName),
    lastName: await encryptPII(data.lastName),
    email: await encryptPII(data.email),
    phone: await encryptPII(data.phone),
    address: await encryptPII(JSON.stringify(data.address)),
    dob: await encryptPII(data.dob),
  };
  
  await db.collection('patients').doc(patientId).set(encrypted);
}
```

**Enable Firestore Encryption:**
1. Go to Firebase Console
2. Firestore Database → Settings
3. Enable Customer-Managed Encryption Keys (CMEK)
4. Configure Google Cloud KMS

#### 2. **Consent Management** (HIGH PRIORITY)
**Status**: ❌ NOT IMPLEMENTED
**Regulations**: GDPR, CCPA, HIPAA
**Timeline**: 2-3 weeks

**Required Consents:**
- [ ] Data collection consent
- [ ] Data processing consent
- [ ] Third-party sharing consent
- [ ] Marketing communications consent
- [ ] Terms of service acceptance
- [ ] Privacy policy acceptance

**Implementation:**

```typescript
// src/types/consent.ts
export interface ConsentRecord {
  userId: string;
  consentType: 'data_collection' | 'data_processing' | 'marketing' | 'third_party';
  granted: boolean;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  version: string; // Privacy policy version
}

// src/services/consentService.ts
export async function recordConsent(
  userId: string,
  consentType: string,
  granted: boolean
): Promise<void> {
  const record: ConsentRecord = {
    userId,
    consentType,
    granted,
    timestamp: new Date(),
    ipAddress: await getClientIP(),
    userAgent: navigator.userAgent,
    version: CURRENT_PRIVACY_POLICY_VERSION,
  };
  
  // Store in append-only collection
  await db.collection('consent_records').add(record);
  
  // Audit log
  logger.audit({
    eventType: AuditEventType.PERMISSION_CHANGE,
    userId,
    action: `Consent ${granted ? 'granted' : 'revoked'}: ${consentType}`,
    success: true,
  });
}

// Check if user has given consent
export async function hasConsent(
  userId: string,
  consentType: string
): Promise<boolean> {
  const snapshot = await db.collection('consent_records')
    .where('userId', '==', userId)
    .where('consentType', '==', consentType)
    .orderBy('timestamp', 'desc')
    .limit(1)
    .get();
  
  if (snapshot.empty) return false;
  return snapshot.docs[0].data().granted;
}
```

#### 3. **Data Export API** (MEDIUM PRIORITY)
**Status**: ❌ NOT IMPLEMENTED
**Regulations**: GDPR Article 20 (Right to Data Portability)
**Timeline**: 3-4 weeks

**Implementation:**

```typescript
// src/services/dataExportService.ts
export async function exportUserData(userId: string): Promise<Blob> {
  // Audit log
  logger.audit({
    eventType: AuditEventType.PHI_EXPORT,
    userId,
    action: 'User requested data export',
    success: true,
  });
  
  // Collect all user data
  const userData = {
    profile: await getUserProfile(userId),
    appointments: await getUserAppointments(userId),
    sessionNotes: await getUserSessionNotes(userId),
    payments: await getUserPayments(userId),
    consents: await getUserConsents(userId),
  };
  
  // Decrypt PII for export
  const decrypted = await decryptUserData(userData);
  
  // Create JSON file
  const json = JSON.stringify(decrypted, null, 2);
  return new Blob([json], { type: 'application/json' });
}

// Trigger download
export function downloadUserData(userId: string): void {
  exportUserData(userId).then(blob => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ataraxia-data-${userId}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });
}
```

#### 4. **Data Deletion** (HIGH PRIORITY)
**Status**: ❌ NOT IMPLEMENTED
**Regulations**: GDPR Article 17 (Right to Erasure)
**Timeline**: 2-3 weeks

**Implementation:**

```typescript
// src/services/dataDeletionService.ts
export async function deleteUserData(
  userId: string,
  reason: string
): Promise<void> {
  // Audit log BEFORE deletion
  logger.audit({
    eventType: AuditEventType.PHI_DELETE,
    userId,
    action: `User data deletion requested: ${reason}`,
    success: true,
  });
  
  // Delete from all collections
  const batch = db.batch();
  
  // Profile
  batch.delete(db.collection('users').doc(userId));
  batch.delete(db.collection('therapist_profiles').doc(userId));
  
  // Appointments (keep for legal/audit, but anonymize)
  const appointments = await db.collection('appointments')
    .where('therapistId', '==', userId)
    .get();
  
  appointments.forEach(doc => {
    batch.update(doc.ref, {
      therapistName: '[DELETED]',
      therapistEmail: '[DELETED]',
      therapistPhone: '[DELETED]',
    });
  });
  
  // Session notes (HIPAA: keep for 7 years, but anonymize)
  const notes = await db.collection('session_notes')
    .where('therapistId', '==', userId)
    .get();
  
  notes.forEach(doc => {
    batch.update(doc.ref, {
      therapistName: '[DELETED]',
      therapistId: '[ANONYMIZED]',
    });
  });
  
  await batch.commit();
  
  // Final audit log
  logger.audit({
    eventType: AuditEventType.PHI_DELETE,
    userId: '[DELETED]',
    action: 'User data deletion completed',
    success: true,
    metadata: { originalUserId: userId, reason },
  });
}
```

---

## 💳 Payment Compliance (Razorpay)

### ✅ **PCI Compliance via Razorpay:**

Razorpay is **PCI-DSS Level 1** certified, which means:
- ✅ They handle all card data
- ✅ They encrypt card data at rest
- ✅ They tokenize card data
- ✅ They handle 3D Secure authentication
- ✅ They comply with RBI regulations (India)

### ✅ **Your Responsibilities:**

1. **✅ Never Store Card Data**
   - ❌ NO: Card numbers
   - ❌ NO: CVV codes
   - ❌ NO: PINs
   - ✅ YES: Razorpay payment IDs
   - ✅ YES: Last 4 digits (for display)
   - ✅ YES: Card brand (Visa, Mastercard)
   - ✅ YES: Transaction amounts
   - ✅ YES: Transaction status

2. **✅ Secure API Keys**
   ```bash
   # .env (NEVER commit to git)
   VITE_RAZORPAY_KEY_ID=rzp_live_xxxxx
   RAZORPAY_KEY_SECRET=xxxxx  # Backend only!
   ```

3. **✅ Verify Webhooks**
   ```typescript
   // Backend: Verify Razorpay webhook signature
   import crypto from 'crypto';
   
   function verifyWebhook(body: string, signature: string): boolean {
     const expectedSignature = crypto
       .createHmac('sha256', RAZORPAY_WEBHOOK_SECRET)
       .update(body)
       .digest('hex');
     
     return expectedSignature === signature;
   }
   ```

4. **✅ Use HTTPS Only**
   - All payment pages must use HTTPS
   - Verify SSL certificate is valid
   - Use HSTS headers

5. **✅ Audit All Payments**
   ```typescript
   // Log every payment event
   logger.audit({
     eventType: AuditEventType.PHI_ACCESS, // Or create PAYMENT event
     userId,
     resourceId: paymentId,
     resourceType: 'payment',
     action: 'Payment processed',
     success: true,
     metadata: {
       amount,
       currency,
       method: 'razorpay',
     },
   });
   ```

### ⚠️ **Razorpay Integration Checklist:**

- [ ] API keys stored in environment variables (not in code)
- [ ] Secret key NEVER exposed to frontend
- [ ] All payments verified on backend
- [ ] Webhook signature verification implemented
- [ ] Payment failures logged and monitored
- [ ] Refund process documented
- [ ] Dispute handling process in place
- [ ] Regular reconciliation with Razorpay dashboard
- [ ] PCI compliance questionnaire completed (SAQ-A)

### 📊 **Data You CAN Store:**

```typescript
interface PaymentRecord {
  // ✅ Safe to store
  id: string;
  userId: string;
  razorpayPaymentId: string;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  status: 'created' | 'authorized' | 'captured' | 'refunded' | 'failed';
  method: 'card' | 'upi' | 'netbanking' | 'wallet';
  
  // ✅ Safe card metadata (for display only)
  cardLast4?: string;
  cardBrand?: string;
  cardNetwork?: string;
  
  // ✅ Timestamps
  createdAt: Date;
  updatedAt: Date;
  
  // ✅ Audit trail
  ipAddress: string;
  userAgent: string;
  
  // ❌ NEVER store these
  // cardNumber: NO
  // cvv: NO
  // pin: NO
  // cardExpiry: NO (unless from Razorpay token)
}
```

---

## 🌍 International Compliance

### **India (Current Market):**
- ✅ Razorpay compliant with RBI regulations
- ✅ Data localization (Razorpay stores data in India)
- ⚠️ Need: Privacy policy compliant with IT Act 2000
- ⚠️ Need: Terms of service

### **USA (Expansion Market):**
- ⚠️ Need: HIPAA compliance (in progress)
- ⚠️ Need: State-specific privacy laws (CCPA, etc.)
- ⚠️ Need: Payment processor for USA (Stripe recommended)
- ⚠️ Need: Business Associate Agreements

### **Europe (Future):**
- ⚠️ Need: GDPR compliance
- ⚠️ Need: Data Processing Agreements
- ⚠️ Need: EU representative
- ⚠️ Need: Cookie consent

---

## 📋 Compliance Checklist

### **PII Protection:**
- [x] Secure logging with PII redaction
- [x] Session timeout (15 min)
- [x] Input sanitization
- [ ] **Encryption at rest** ← CRITICAL
- [ ] **Consent management** ← HIGH
- [ ] **Data export API** ← MEDIUM
- [ ] **Data deletion** ← HIGH

### **Payment Security:**
- [x] Using PCI-compliant processor (Razorpay)
- [x] Secure payment service implemented
- [ ] **Backend verification** ← Implement
- [ ] **Webhook verification** ← Implement
- [ ] **API keys secured** ← Verify
- [ ] **HTTPS enforced** ← Verify
- [ ] **Audit logging** ← Implement

### **HIPAA (Healthcare):**
- [x] Audit controls
- [x] Session timeout
- [ ] **Encryption at rest** ← CRITICAL
- [ ] **MFA** ← HIGH
- [ ] **BAA from Firebase** ← HIGH
- [ ] **Field-level encryption** ← HIGH

---

## 🚨 Immediate Action Items

**This Week:**
1. Enable Firestore encryption at rest
2. Implement Razorpay backend verification
3. Secure all API keys in environment variables
4. Add HTTPS enforcement

**This Month:**
1. Implement consent management
2. Implement data export API
3. Implement data deletion
4. Get BAA from Firebase
5. Complete PCI SAQ-A questionnaire

**This Quarter:**
1. Implement MFA
2. Field-level encryption for PHI
3. Third-party security audit
4. Penetration testing
5. Privacy policy & terms of service

---

**Last Updated**: 2025-11-30
**Next Review**: 2026-01-30
