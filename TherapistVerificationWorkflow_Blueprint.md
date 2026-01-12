# Therapist Verification Workflow Structure

## 1. Data Model (`therapist` object)
The modal receives a `therapistId` and fetches the therapist details.
**Key Fields used in Logic:**
```typescript
interface Therapist {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  profile_image_url: string;
  
  // Workflow Status Fields
  account_status: 'onboarding_pending' | 'active' | 'rejected' | 'suspended';
  verification_stage: 'account_created' | 'documents_submitted' | 'background_check' | 'final_review' | 'completed';
  
  // Step 2: License Details
  license_number: string;
  license_state: string;     // e.g., "NY", "CA"
  license_verified: boolean; // true = Step 2 Complete
  
  // Step 3: Background Check
  background_check_status: 'pending' | 'in_progress' | 'completed' | 'failed'; 
  // Note: 'completed' = Step 3 Passed
  
  // Internal Notes
  verification_notes: string;
}
```

## 2. Workflow logic (4 Linear Steps)

### Step 1: Registration Profile
*   **Condition**: Always "Completed" if the user appears in this list.
*   **Status**: Active Account Created.
*   **UI State**: Green Check / "Completed".

### Step 2: License Verification
*   **Data Needed**: `license_state`, `license_number`.
*   **Condition**:
    *   *Pending*: `license_verified === false`
    *   *Completed*: `license_verified === true`
*   **Actions**:
    *   **Approve**: Calls API with `{ stage: 'documents', status: 'approved' }` -> Sets `license_verified = true`.
    *   **Reject**: Calls API with `{ stage: 'documents', status: 'rejected' }`.

### Step 3: Background Check
*   **Prerequisite**: Step 2 must be potentially complete (usually sequential).
*   **Condition**:
    *   *Passed*: `background_check_status === 'completed'`
    *   *Pending/In Progress*: Anything else.
*   **Actions**:
    *   **Pass**: Calls API with `{ stage: 'background_check', status: 'approved' }` -> Sets `background_check_status = 'completed'`.
    *   **Fail**: Calls API with `{ stage: 'background_check', status: 'rejected' }` -> Sets `background_check_status = 'failed'`.

### Step 4: Final Activation
*   **Prerequisite**: Step 2 & 3 must be complete.
*   **Condition**:
    *   *Active/Live*: `account_status === 'active'`
*   **Actions**:
    *   **Activate**: Calls API with `{ stage: 'final', status: 'approved' }` -> Sets `account_status = 'active'`.

## 3. Backend Integration
**Endpoint:** `POST /api/therapists/:therapistId/verification`

**Payload:**
```json
{
  "stage": "documents" | "background_check" | "final",
  "status": "approved" | "rejected",
  "notes": "Optional internal notes string..."
}
```

## 4. Component Skeleton (Logic Only)

```tsx
export function TherapistVerificationDetailModal({ therapistId, isOpen, onClose }) {
    // 1. Fetch Data
    const [therapist, setTherapist] = useState(null);
    useEffect(() => { loadTherapist() }, [therapistId]);

    // 2. Logic Helpers
    const isDocVerified = therapist?.license_verified;
    const isBgCheckPassed = therapist?.background_check_status === 'completed';
    const isActive = therapist?.account_status === 'active';

    // 3. Update Handler
    const handleStageUpdate = async (stage, status) => {
        await api.post(`/therapists/${therapistId}/verification`, { stage, status });
        loadTherapist(); // Refresh UI
    };
    
    // ... Render your custom UI here ...
}
```
