import { config } from '../../config';

export interface SubscriptionInfo {
    status: 'trial' | 'active' | 'expired' | 'cancelled';
    tier: 'free' | 'basic' | 'professional' | 'enterprise' | 'trial';
    trialDaysRemaining: number | null;
    trialEndDate: string | null;
    subscriptionEndDate: string | null;
    isTrialActive: boolean;
    canAccessFeatures: boolean;
    // Dual-track additions
    isOrgOwner?: boolean;
    organizationName?: string;
    organizationId?: string;
}

export const SubscriptionService = {
    /**
     * Get subscription information for a user
     */
    async getUserSubscription(userId: string): Promise<SubscriptionInfo> {
        const response = await fetch(
            `${config.api.baseUrl}/users/${userId}/subscription`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            }
        );

        if (!response.ok) {
            throw new Error('Failed to fetch subscription info');
        }

        return response.json();
    },

    /**
     * Calculate days remaining in trial
     */
    calculateTrialDaysRemaining(trialEndDate: string | null): number {
        if (!trialEndDate) return 0;

        const endDate = new Date(trialEndDate);
        const now = new Date();
        const diffTime = endDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return Math.max(0, diffDays);
    },

    /**
     * Check if user can access premium features
     */
    canAccessFeature(subscription: SubscriptionInfo, feature: string): boolean {
        // If trial is active or has active subscription
        if (subscription.isTrialActive || subscription.status === 'active') {
            return true;
        }

        // Check tier-based access
        const freeFeatures = ['basic_appointments', 'basic_notes', 'basic_clients'];
        if (subscription.tier === 'free') {
            return freeFeatures.includes(feature);
        }

        return false;
    },

    /**
     * Start a trial for a user
     */
    async startTrial(userId: string, durationDays: number = 30): Promise<SubscriptionInfo> {
        const response = await fetch(
            `${config.api.baseUrl}/users/${userId}/subscription/start-trial`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({ durationDays }),
            }
        );

        if (!response.ok) {
            throw new Error('Failed to start trial');
        }

        return response.json();
    },

    /**
     * Upgrade subscription
     */
    async upgradeSubscription(
        userId: string,
        tier: 'basic' | 'professional' | 'enterprise',
        paymentMethodId: string
    ): Promise<SubscriptionInfo> {
        const response = await fetch(
            `${config.api.baseUrl}/users/${userId}/subscription/upgrade`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({ tier, paymentMethodId }),
            }
        );

        if (!response.ok) {
            throw new Error('Failed to upgrade subscription');
        }

        return response.json();
    },
};
