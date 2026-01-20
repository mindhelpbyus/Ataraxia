# Free Trial Implementation Guide for Ataraxia

## Overview
This guide explains how to implement the free trial functionality properly with database integration.

## Current Status
- **UI**: Hardcoded "Free trial - 30 days left" in sidebar
- **Database**: Organizations table has `subscription_plan` and `subscription_status` fields
- **Missing**: Trial date tracking, days calculation, user-level subscription tracking

## Implementation Steps

### 1. Database Migration

Choose one of these approaches based on your business model:

#### Option A: Organization-Level Subscription (Recommended for B2B)
All users in an organization share the same trial/subscription.

```sql
-- Migration: Add trial tracking to organizations
ALTER TABLE ataraxia.organizations 
ADD COLUMN IF NOT EXISTS trial_start_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS trial_end_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS billing_email TEXT,
ADD COLUMN IF NOT EXISTS payment_method_id TEXT;

-- Set trial dates for existing organizations
UPDATE ataraxia.organizations 
SET 
  trial_start_date = created_at,
  trial_end_date = created_at + INTERVAL '30 days'
WHERE subscription_plan = 'trial' AND trial_start_date IS NULL;

-- Create index for faster queries
CREATE INDEX idx_orgs_trial_end ON ataraxia.organizations(trial_end_date) 
WHERE subscription_plan = 'trial';
```

#### Option B: User-Level Subscription (For Individual Therapists)
Each therapist has their own trial period.

```sql
-- Migration: Add subscription fields to users table
ALTER TABLE ataraxia.users
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'trial' 
  CHECK (subscription_status IN ('trial', 'active', 'expired', 'cancelled', 'suspended')),
ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free'
  CHECK (subscription_tier IN ('free', 'basic', 'professional', 'enterprise')),
ADD COLUMN IF NOT EXISTS trial_start_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS trial_end_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS subscription_start_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS payment_method_id TEXT,
ADD COLUMN IF NOT EXISTS billing_email TEXT;

-- Set trial dates for existing therapist users
UPDATE ataraxia.users 
SET 
  trial_start_date = created_at,
  trial_end_date = created_at + INTERVAL '30 days',
  subscription_status = 'trial'
WHERE role = 'therapist' AND trial_start_date IS NULL;

-- Create index
CREATE INDEX idx_users_trial_end ON ataraxia.users(trial_end_date) 
WHERE subscription_status = 'trial';
```

### 2. Backend API Endpoints

Create these endpoints in your backend (Node.js/Express example):

```javascript
// GET /api/users/:userId/subscription
// Returns subscription info for a user
router.get('/users/:userId/subscription', async (req, res) => {
  const { userId } = req.params;
  
  const user = await db.query(
    `SELECT 
      subscription_status,
      subscription_tier,
      trial_start_date,
      trial_end_date,
      subscription_end_date,
      CASE 
        WHEN trial_end_date IS NULL THEN NULL
        ELSE GREATEST(0, EXTRACT(DAY FROM (trial_end_date - CURRENT_TIMESTAMP))::INTEGER)
      END as trial_days_remaining
    FROM ataraxia.users 
    WHERE id = $1`,
    [userId]
  );
  
  const subscription = user.rows[0];
  
  res.json({
    status: subscription.subscription_status,
    tier: subscription.subscription_tier,
    trialDaysRemaining: subscription.trial_days_remaining,
    trialEndDate: subscription.trial_end_date,
    subscriptionEndDate: subscription.subscription_end_date,
    isTrialActive: subscription.subscription_status === 'trial' && subscription.trial_days_remaining > 0,
    canAccessFeatures: subscription.subscription_status === 'active' || 
                      (subscription.subscription_status === 'trial' && subscription.trial_days_remaining > 0)
  });
});

// POST /api/users/:userId/subscription/start-trial
// Start a trial for a new user
router.post('/users/:userId/subscription/start-trial', async (req, res) => {
  const { userId } = req.params;
  const { durationDays = 30 } = req.body;
  
  await db.query(
    `UPDATE ataraxia.users 
    SET 
      trial_start_date = CURRENT_TIMESTAMP,
      trial_end_date = CURRENT_TIMESTAMP + INTERVAL '${durationDays} days',
      subscription_status = 'trial'
    WHERE id = $1`,
    [userId]
  );
  
  // Return updated subscription info
  // ... (same as GET endpoint above)
});

// POST /api/users/:userId/subscription/upgrade
// Upgrade from trial to paid subscription
router.post('/users/:userId/subscription/upgrade', async (req, res) => {
  const { userId } = req.params;
  const { tier, paymentMethodId } = req.body;
  
  // 1. Process payment with Stripe/payment processor
  // 2. Update database
  await db.query(
    `UPDATE ataraxia.users 
    SET 
      subscription_status = 'active',
      subscription_tier = $1,
      subscription_start_date = CURRENT_TIMESTAMP,
      subscription_end_date = CURRENT_TIMESTAMP + INTERVAL '1 month',
      payment_method_id = $2
    WHERE id = $3`,
    [tier, paymentMethodId, userId]
  );
  
  // Return updated subscription info
});
```

### 3. Frontend Integration

#### Update DashboardLayout.tsx

```typescript
import { useEffect, useState } from 'react';
import { SubscriptionService } from '../api/services/subscription';

export function DashboardLayout({ userRole, currentUserId, ... }: DashboardLayoutProps) {
  // ... existing state ...
  
  // Add subscription state
  const [subscriptionInfo, setSubscriptionInfo] = useState<{
    status: string;
    trialDaysRemaining: number | null;
    isTrialActive: boolean;
  } | null>(null);

  // Fetch subscription info on mount
  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const info = await SubscriptionService.getUserSubscription(currentUserId);
        setSubscriptionInfo(info);
      } catch (error) {
        console.error('Failed to fetch subscription:', error);
      }
    };

    if (currentUserId) {
      fetchSubscription();
    }
  }, [currentUserId]);

  // ... rest of component ...

  // In the sidebar, replace hardcoded "30 days left" with:
  {subscriptionInfo?.isTrialActive && (
    <div className="px-4 py-3 text-xs text-muted-foreground">
      Free trial - {subscriptionInfo.trialDaysRemaining} days left
    </div>
  )}
}
```

### 4. Feature Access Control

Use subscription status to control feature access:

```typescript
// Example: Restrict features based on subscription
const canAccessAnalytics = subscriptionInfo?.tier !== 'free';
const canAddUnlimitedClients = subscriptionInfo?.tier === 'professional' || 
                               subscriptionInfo?.tier === 'enterprise';

// In navigation items
{
  id: 'analytics' as TabType,
  label: 'Analytics',
  icon: BarChart3,
  disabled: !canAccessAnalytics,
  badge: !canAccessAnalytics ? 'PRO' : undefined
}
```

### 5. Trial Expiration Handling

Add a check for expired trials:

```typescript
useEffect(() => {
  if (subscriptionInfo?.status === 'trial' && subscriptionInfo?.trialDaysRemaining === 0) {
    // Show upgrade modal
    setShowUpgradeModal(true);
  }
}, [subscriptionInfo]);
```

### 6. Upgrade Flow

Create an upgrade modal component:

```typescript
// components/UpgradeModal.tsx
export function UpgradeModal({ isOpen, onClose, currentUserId }: Props) {
  const handleUpgrade = async (tier: string) => {
    // 1. Collect payment info with Stripe
    // 2. Call upgrade API
    await SubscriptionService.upgradeSubscription(currentUserId, tier, paymentMethodId);
    // 3. Refresh subscription info
    // 4. Close modal
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/* Pricing tiers UI */}
    </Dialog>
  );
}
```

## Subscription Tiers (Example)

| Feature | Free | Basic ($29/mo) | Professional ($79/mo) | Enterprise (Custom) |
|---------|------|----------------|----------------------|---------------------|
| Clients | 5 | 50 | Unlimited | Unlimited |
| Appointments | 10/mo | Unlimited | Unlimited | Unlimited |
| Analytics | ❌ | Basic | Advanced | Advanced + Custom |
| Video Calls | ❌ | ✅ | ✅ | ✅ |
| Team Members | 1 | 3 | 10 | Unlimited |
| API Access | ❌ | ❌ | ✅ | ✅ |
| Custom Branding | ❌ | ❌ | ✅ | ✅ |

## Testing Checklist

- [ ] New user gets 30-day trial automatically
- [ ] Trial days countdown is accurate
- [ ] Expired trial shows upgrade prompt
- [ ] Upgrade flow works end-to-end
- [ ] Payment processing is secure
- [ ] Feature restrictions work correctly
- [ ] Subscription renewal works
- [ ] Cancellation flow works

## Next Steps

1. **Decide on subscription model**: Organization-level or user-level?
2. **Run database migration**: Execute the SQL migration script
3. **Implement backend API**: Create the subscription endpoints
4. **Integrate Stripe/Payment**: Set up payment processing
5. **Update frontend**: Use real subscription data in UI
6. **Test thoroughly**: Verify all flows work correctly
7. **Set up webhooks**: Handle payment events (renewal, failure, etc.)

## Files Created

- `/Users/cvp/anti-gravity/Ataraxia/src/api/services/subscription.ts` - Frontend subscription service

## Files to Modify

- Backend: Add subscription endpoints
- `DashboardLayout.tsx`: Use real subscription data
- `App.tsx`: Check subscription on login
- Database: Run migration scripts
