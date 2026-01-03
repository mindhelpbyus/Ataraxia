# 🔧 Backend Integration Guide - Phase 1 Components

## Overview

This guide provides complete backend integration instructions for the three Phase 1 components:
1. Presenting Concerns
2. Safety & Risk Screening
3. Digital Signature

---

## 📊 Database Schema Updates

### Firebase Firestore Collections

#### 1. Update `clients` Collection

Add the following fields to your existing `clients` document structure:

```typescript
interface ClientDocument {
  // ... existing fields ...
  
  // PHASE 1: NEW FIELDS
  presentingConcernsData: {
    mainReason: string;
    primaryConcerns: string[]; // Array of concern IDs
    severityLevel: 'mild' | 'moderate' | 'severe' | 'unsure';
    otherConcernDetails?: string; // Only if "other" is selected
    createdAt: Timestamp;
    updatedAt: Timestamp;
  };
  
  safetyScreeningData: {
    selfHarmThoughts: 'yes' | 'no';
    selfHarmPlans: 'yes' | 'no';
    recentSuicideAttempt: 'yes' | 'no';
    harmToOthersThoughts: 'yes' | 'no';
    domesticViolenceConcerns: 'yes' | 'no';
    feelUnsafeAtHome: 'yes' | 'no';
    additionalSafetyConcerns?: string;
    wantsSafetyPlan: boolean;
    hasSafetyConcern: boolean; // Computed: true if any "yes"
    reviewedBy?: string; // Clinical supervisor ID
    reviewedAt?: Timestamp;
    createdAt: Timestamp;
  };
  
  signature: {
    type: 'drawn' | 'typed';
    dataUrl?: string; // For drawn signatures (stored in Storage)
    fullName: string;
    timestamp: Timestamp;
    ipAddress?: string; // For audit trail
    userAgent?: string; // For audit trail
  };
  
  // COMPUTED FIELDS (for matching algorithm)
  riskLevel: 'none' | 'low' | 'moderate' | 'high' | 'critical';
  matchingScore?: number; // Calculated based on concerns + severity
  priorityLevel: number; // 1-5, based on urgency + risk
}
```

#### 2. Create New `safety_alerts` Collection

For tracking safety concerns and clinical reviews:

```typescript
interface SafetyAlert {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  
  // Safety concerns
  concerns: string[]; // Array of "yes" answers
  additionalNotes?: string;
  wantsSafetyPlan: boolean;
  
  // Alert metadata
  alertLevel: 'high' | 'critical';
  status: 'pending' | 'in_review' | 'contacted' | 'resolved';
  
  // Clinical review
  assignedTo?: string; // Clinical supervisor ID
  reviewedBy?: string; // Therapist ID
  reviewedAt?: Timestamp;
  reviewNotes?: string;
  actionTaken?: string;
  
  // Contact attempts
  contactAttempts: Array<{
    attemptedAt: Timestamp;
    attemptedBy: string;
    method: 'phone' | 'email' | 'sms';
    outcome: 'successful' | 'no_answer' | 'left_message';
    notes?: string;
  }>;
  
  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
  resolvedAt?: Timestamp;
}
```

#### 3. Create `signatures` Subcollection (Audit Trail)

Store all signature events for compliance:

```typescript
interface SignatureAudit {
  id: string;
  clientId: string;
  
  // Signature data
  type: 'drawn' | 'typed';
  storageUrl?: string; // Cloud Storage URL for drawn signatures
  fullName: string;
  
  // Document details
  documentType: 'intake_form' | 'consent' | 'treatment_plan' | 'release';
  documentVersion: string; // Version of the form signed
  
  // Audit trail
  signedAt: Timestamp;
  ipAddress: string;
  userAgent: string;
  location?: {
    city?: string;
    region?: string;
    country?: string;
  };
  
  // Verification
  verified: boolean;
  verifiedBy?: string;
  verifiedAt?: Timestamp;
}
```

---

## 🔌 API Endpoints

### 1. **POST** `/api/clients/register`

Update your existing registration endpoint to handle new fields.

#### Request Body:

```typescript
{
  // ... existing fields ...
  
  presentingConcernsData: {
    mainReason: string;
    primaryConcerns: string[];
    severityLevel: string;
    otherConcernDetails?: string;
  },
  
  safetyScreeningData: {
    selfHarmThoughts: string;
    selfHarmPlans: string;
    recentSuicideAttempt: string;
    harmToOthersThoughts: string;
    domesticViolenceConcerns: string;
    feelUnsafeAtHome: string;
    additionalSafetyConcerns?: string;
    wantsSafetyPlan: boolean;
  },
  
  signature: {
    type: 'drawn' | 'typed';
    data: string; // Base64 or text
    timestamp: string;
    fullName: string;
  }
}
```

#### Backend Logic:

```typescript
// Firebase Cloud Function
export const registerClient = functions.https.onCall(async (data, context) => {
  try {
    const {
      basicInfo,
      presentingConcernsData,
      safetyScreeningData,
      signature,
      ...otherData
    } = data;
    
    // 1. Validate data
    if (!validateRegistrationData(data)) {
      throw new functions.https.HttpsError('invalid-argument', 'Invalid data');
    }
    
    // 2. Check for safety concerns
    const hasSafetyConcern = checkSafetyConcerns(safetyScreeningData);
    
    // 3. Upload signature if drawn
    let signatureUrl: string | undefined;
    if (signature.type === 'drawn') {
      signatureUrl = await uploadSignature(signature.data, basicInfo.email);
    }
    
    // 4. Calculate risk level
    const riskLevel = calculateRiskLevel(safetyScreeningData, presentingConcernsData);
    
    // 5. Calculate priority level
    const priorityLevel = calculatePriorityLevel(
      presentingConcernsData.severityLevel,
      riskLevel
    );
    
    // 6. Create client document
    const clientId = generateClientId();
    const clientData = {
      id: clientId,
      ...basicInfo,
      presentingConcernsData: {
        ...presentingConcernsData,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      safetyScreeningData: {
        ...safetyScreeningData,
        hasSafetyConcern,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      signature: {
        type: signature.type,
        dataUrl: signatureUrl || null,
        fullName: signature.fullName,
        timestamp: admin.firestore.Timestamp.fromDate(new Date(signature.timestamp)),
        ipAddress: context.rawRequest?.ip,
        userAgent: context.rawRequest?.headers['user-agent'],
      },
      riskLevel,
      priorityLevel,
      status: 'pending_assignment',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    
    await admin.firestore().collection('clients').doc(clientId).set(clientData);
    
    // 7. Create signature audit record
    await createSignatureAudit({
      clientId,
      signature,
      signatureUrl,
      context,
    });
    
    // 8. If safety concern, create alert
    if (hasSafetyConcern) {
      await createSafetyAlert({
        clientId,
        clientData,
        safetyScreeningData,
      });
    }
    
    // 9. Trigger matching algorithm
    await triggerMatchingAlgorithm(clientId, clientData);
    
    // 10. Send confirmation email
    await sendRegistrationConfirmationEmail(clientData);
    
    return {
      success: true,
      clientId,
      message: 'Registration completed successfully',
    };
    
  } catch (error) {
    console.error('Registration error:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});
```

---

### 2. **POST** `/api/alerts/safety-concern`

Create a dedicated endpoint for safety alerts (can be called from registration or separately).

```typescript
export const createSafetyAlert = functions.https.onCall(async (data, context) => {
  const { clientId, clientData, safetyScreeningData } = data;
  
  // Extract "yes" concerns
  const concerns = [];
  if (safetyScreeningData.selfHarmThoughts === 'yes') concerns.push('self-harm-thoughts');
  if (safetyScreeningData.selfHarmPlans === 'yes') concerns.push('self-harm-plans');
  if (safetyScreeningData.recentSuicideAttempt === 'yes') concerns.push('suicide-attempt');
  if (safetyScreeningData.harmToOthersThoughts === 'yes') concerns.push('harm-to-others');
  if (safetyScreeningData.domesticViolenceConcerns === 'yes') concerns.push('domestic-violence');
  if (safetyScreeningData.feelUnsafeAtHome === 'yes') concerns.push('unsafe-home');
  
  // Determine alert level
  const isCritical = 
    safetyScreeningData.selfHarmPlans === 'yes' ||
    safetyScreeningData.recentSuicideAttempt === 'yes';
  
  const alertLevel = isCritical ? 'critical' : 'high';
  
  // Get on-call supervisor
  const assignedSupervisor = await getOnCallSupervisor();
  
  // Create alert document
  const alertData = {
    clientId,
    clientName: `${clientData.firstName} ${clientData.lastName}`,
    clientEmail: clientData.email,
    clientPhone: clientData.phone,
    concerns,
    additionalNotes: safetyScreeningData.additionalSafetyConcerns,
    wantsSafetyPlan: safetyScreeningData.wantsSafetyPlan,
    alertLevel,
    status: 'pending',
    assignedTo: assignedSupervisor.id,
    contactAttempts: [],
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };
  
  const alertRef = await admin.firestore().collection('safety_alerts').add(alertData);
  
  // Send notifications
  await Promise.all([
    sendSupervisorEmail(assignedSupervisor, alertData),
    sendSupervisorSMS(assignedSupervisor, alertData, isCritical),
    sendSlackAlert(alertData), // If using Slack
  ]);
  
  // Update client document
  await admin.firestore().collection('clients').doc(clientId).update({
    'safetyScreeningData.alertId': alertRef.id,
    'safetyScreeningData.alertCreatedAt': admin.firestore.FieldValue.serverTimestamp(),
  });
  
  return {
    success: true,
    alertId: alertRef.id,
    alertLevel,
  };
});
```

---

### 3. **POST** `/api/signatures/upload`

Dedicated endpoint for signature uploads (called during registration).

```typescript
export const uploadSignature = async (
  base64Data: string,
  clientEmail: string
): Promise<string> => {
  const bucket = admin.storage().bucket();
  
  // Remove data URL prefix if present
  const base64String = base64Data.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(base64String, 'base64');
  
  // Generate filename
  const timestamp = Date.now();
  const filename = `signatures/${clientEmail.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}.png`;
  
  // Upload to Cloud Storage
  const file = bucket.file(filename);
  await file.save(buffer, {
    metadata: {
      contentType: 'image/png',
      cacheControl: 'public, max-age=31536000',
    },
  });
  
  // Make file publicly readable
  await file.makePublic();
  
  // Get public URL
  const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;
  
  return publicUrl;
};
```

---

## 🔔 Notification System

### Email Notifications

#### 1. Safety Alert to Clinical Supervisor

```typescript
async function sendSupervisorEmail(supervisor: any, alertData: any) {
  const emailTemplate = `
    <html>
      <body style="font-family: Arial, sans-serif; padding: 20px;">
        <div style="background: #FEE2E2; border-left: 4px solid #EF4444; padding: 16px; margin-bottom: 20px;">
          <h2 style="color: #991B1B; margin: 0 0 8px 0;">
            🚨 Safety Alert: ${alertData.alertLevel === 'critical' ? 'CRITICAL' : 'High Priority'}
          </h2>
          <p style="color: #7F1D1D; margin: 0;">
            A new client has indicated safety concerns during intake.
          </p>
        </div>
        
        <h3>Client Information</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #E5E7EB;"><strong>Name:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #E5E7EB;">${alertData.clientName}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #E5E7EB;"><strong>Email:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #E5E7EB;">${alertData.clientEmail}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #E5E7EB;"><strong>Phone:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #E5E7EB;">${alertData.clientPhone}</td>
          </tr>
        </table>
        
        <h3 style="margin-top: 20px;">Safety Concerns Indicated</h3>
        <ul style="color: #DC2626;">
          ${alertData.concerns.map(c => `<li>${formatConcernName(c)}</li>`).join('')}
        </ul>
        
        ${alertData.additionalNotes ? `
          <h3>Additional Notes from Client</h3>
          <p style="background: #F3F4F6; padding: 12px; border-radius: 4px;">
            ${alertData.additionalNotes}
          </p>
        ` : ''}
        
        ${alertData.wantsSafetyPlan ? `
          <p style="background: #DBEAFE; padding: 12px; border-radius: 4px; color: #1E40AF;">
            ℹ️ Client has requested to create a safety plan.
          </p>
        ` : ''}
        
        <div style="margin-top: 30px; padding: 20px; background: #F9FAFB; border-radius: 8px;">
          <h3 style="margin-top: 0;">Required Actions</h3>
          <ol>
            <li>Contact client within <strong>24 hours</strong></li>
            <li>Conduct safety assessment</li>
            <li>Assign appropriate therapist</li>
            <li>Document all interactions</li>
          </ol>
          
          <a href="https://ataraxia.app/dashboard/alerts/${alertData.id}" 
             style="display: inline-block; margin-top: 16px; padding: 12px 24px; background: #F97316; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
            Review Full Alert →
          </a>
        </div>
        
        <p style="margin-top: 20px; color: #6B7280; font-size: 12px;">
          Alert created: ${new Date().toLocaleString()}<br>
          Alert ID: ${alertData.id}
        </p>
      </body>
    </html>
  `;
  
  await sendEmail({
    to: supervisor.email,
    subject: `🚨 ${alertData.alertLevel === 'critical' ? 'CRITICAL' : 'High Priority'} Safety Alert - ${alertData.clientName}`,
    html: emailTemplate,
    priority: 'high',
  });
}
```

#### 2. SMS Notification (Critical Only)

```typescript
async function sendSupervisorSMS(supervisor: any, alertData: any, isCritical: boolean) {
  if (!isCritical) return; // Only send SMS for critical alerts
  
  const message = `
CRITICAL SAFETY ALERT: ${alertData.clientName} has indicated immediate safety concerns during intake. 
Contact: ${alertData.clientPhone}
Review immediately: https://ataraxia.app/alerts/${alertData.id}
  `.trim();
  
  await sendSMS({
    to: supervisor.phone,
    message,
  });
}
```

---

## 🤖 Matching Algorithm Updates

Update your matching algorithm to use the new structured data:

```typescript
async function triggerMatchingAlgorithm(clientId: string, clientData: any) {
  const {
    presentingConcernsData,
    safetyScreeningData,
    riskLevel,
    priorityLevel,
    preferredTherapistGender,
    preferredSpecialty,
    preferredAvailability,
    preferredModality,
    hasInsurance,
    insuranceProvider,
  } = clientData;
  
  // 1. Get all available therapists
  const therapists = await getAllTherapists();
  
  // 2. Calculate match scores
  const matches = therapists.map(therapist => {
    let score = 0;
    let reasons = [];
    
    // Specialty matching (weighted heavily - 40 points max)
    const concernSpecialties = mapConcernsToSpecialties(presentingConcernsData.primaryConcerns);
    const specialtyMatch = concernSpecialties.some(s => therapist.specialties.includes(s));
    if (specialtyMatch) {
      score += 40;
      reasons.push('Specializes in your concerns');
    }
    
    // Risk level matching (30 points max)
    if (riskLevel === 'high' || riskLevel === 'critical') {
      if (therapist.certifications.includes('crisis_intervention')) {
        score += 30;
        reasons.push('Crisis intervention trained');
      }
    }
    
    // Availability matching (15 points max)
    const availabilityMatch = checkAvailabilityMatch(
      therapist.availability,
      preferredAvailability
    );
    score += availabilityMatch * 15;
    if (availabilityMatch > 0.5) {
      reasons.push('Good availability match');
    }
    
    // Gender preference (10 points max)
    if (!preferredTherapistGender || therapist.gender === preferredTherapistGender) {
      score += 10;
    }
    
    // Insurance matching (5 points max)
    if (hasInsurance && therapist.acceptedInsurance.includes(insuranceProvider)) {
      score += 5;
      reasons.push('Accepts your insurance');
    }
    
    return {
      therapistId: therapist.id,
      therapistName: therapist.name,
      score,
      reasons,
      therapist,
    };
  });
  
  // 3. Sort by score
  matches.sort((a, b) => b.score - a.score);
  
  // 4. Get top 3 matches
  const topMatches = matches.slice(0, 3);
  
  // 5. Auto-assign if high priority
  let assignedTherapist = null;
  if (priorityLevel >= 4) {
    assignedTherapist = topMatches[0].therapistId;
    await assignTherapist(clientId, assignedTherapist);
  }
  
  // 6. Save matching results
  await admin.firestore().collection('clients').doc(clientId).update({
    matchingResults: topMatches.map(m => ({
      therapistId: m.therapistId,
      therapistName: m.therapistName,
      score: m.score,
      reasons: m.reasons,
    })),
    matchingCompletedAt: admin.firestore.FieldValue.serverTimestamp(),
    assignedTherapist,
  });
  
  // 7. Notify therapist if auto-assigned
  if (assignedTherapist) {
    await notifyTherapistOfAssignment(assignedTherapist, clientId, topMatches[0]);
  }
  
  return topMatches;
}

// Helper: Map concerns to therapist specialties
function mapConcernsToSpecialties(concerns: string[]): string[] {
  const mapping: Record<string, string[]> = {
    'anxiety': ['anxiety', 'CBT', 'mindfulness'],
    'depression': ['depression', 'CBT', 'psychodynamic'],
    'trauma': ['trauma', 'PTSD', 'EMDR'],
    'adhd': ['ADHD', 'executive_function'],
    'relationship': ['couples', 'relationship_therapy'],
    'family': ['family_therapy', 'systems_therapy'],
    'parenting': ['parenting', 'family_therapy'],
    'transitions': ['life_transitions', 'adjustment'],
    'stress': ['stress_management', 'CBT', 'mindfulness'],
    'eating': ['eating_disorders', 'nutrition'],
    'substance': ['substance_abuse', 'addiction'],
    'grief': ['grief', 'bereavement'],
    'anger': ['anger_management', 'DBT'],
    'lgbtq': ['LGBTQ_affirming', 'identity'],
    'pain': ['chronic_pain', 'health_psychology'],
    'sleep': ['sleep_disorders', 'CBT-I'],
    'work': ['career', 'burnout', 'stress_management'],
  };
  
  const specialties = new Set<string>();
  concerns.forEach(concern => {
    (mapping[concern] || []).forEach(s => specialties.add(s));
  });
  
  return Array.from(specialties);
}
```

---

## 📊 Analytics & Reporting

### Track key metrics:

```typescript
// Daily safety alert summary
export const generateDailySafetyReport = functions.pubsub
  .schedule('0 9 * * *') // Every day at 9 AM
  .onRun(async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const alerts = await admin.firestore()
      .collection('safety_alerts')
      .where('createdAt', '>=', yesterday)
      .get();
    
    const summary = {
      total: alerts.size,
      critical: alerts.docs.filter(d => d.data().alertLevel === 'critical').length,
      high: alerts.docs.filter(d => d.data().alertLevel === 'high').length,
      resolved: alerts.docs.filter(d => d.data().status === 'resolved').length,
      pending: alerts.docs.filter(d => d.data().status === 'pending').length,
    };
    
    // Send to admins
    await sendDailySafetyReport(summary);
  });

// Track presenting concerns trends
export const trackConcernsTrends = functions.firestore
  .document('clients/{clientId}')
  .onCreate(async (snap) => {
    const data = snap.data();
    const concerns = data.presentingConcernsData?.primaryConcerns || [];
    
    // Update analytics collection
    for (const concern of concerns) {
      await admin.firestore()
        .collection('analytics')
        .doc('concerns_trends')
        .set({
          [concern]: admin.firestore.FieldValue.increment(1),
        }, { merge: true });
    }
  });
```

---

## ✅ Testing Checklist

### Backend Tests

- [ ] Client registration with all Phase 1 data succeeds
- [ ] Signature image uploads to Cloud Storage correctly
- [ ] Safety alert triggers when "yes" selected
- [ ] Clinical supervisor receives email notification
- [ ] Critical alerts send SMS notification
- [ ] Matching algorithm uses presenting concerns
- [ ] Risk level calculated correctly
- [ ] Priority level assigned properly
- [ ] Signature audit trail created
- [ ] Data validation prevents invalid submissions

### Security Tests

- [ ] Only authenticated users can submit intake
- [ ] Signature images have proper access controls
- [ ] Safety alerts only visible to authorized staff
- [ ] PII properly encrypted at rest
- [ ] API rate limiting in place
- [ ] Input sanitization prevents injection attacks

---

## 🚀 Deployment

1. **Update Firebase rules:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Clients can only read/write their own data
    match /clients/{clientId} {
      allow create: if request.auth != null;
      allow read, update: if request.auth.uid == resource.data.userId 
                          || hasRole('therapist') 
                          || hasRole('admin');
    }
    
    // Safety alerts only for clinical staff
    match /safety_alerts/{alertId} {
      allow read, write: if hasRole('clinical_supervisor') 
                         || hasRole('therapist') 
                         || hasRole('admin');
    }
  }
}
```

2. **Deploy functions:**
```bash
firebase deploy --only functions
```

3. **Update security rules:**
```bash
firebase deploy --only firestore:rules
firebase deploy --only storage:rules
```

---

## 📞 Support

Need help integrating? Check:
- `/PHASE1_INTEGRATION_COMPLETE.md`
- `/PHASE1_VISUAL_FLOW.md`
- Firebase documentation: https://firebase.google.com/docs

**Ready to test!** 🚀
