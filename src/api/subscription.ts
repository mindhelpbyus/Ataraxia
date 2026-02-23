/**
 * api/subscription.ts — Subscription API thin client
 * All subscription queries are delegated to the backend.
 */

import { get } from './client';

export interface SubscriptionInfo {
    plan?: string;
    tier?: string;
    status: 'active' | 'inactive' | 'trialing' | 'cancelled' | 'trial' | string;
    expiresAt?: string;
    features?: string[];
    trialDaysRemaining?: number | null;
    isTrialActive?: boolean;
    organizationName?: string;
    isOrgOwner?: boolean;
    organizationId?: string;
    canAccessFeatures?: boolean;
}

export const SubscriptionService = {
    async getUserSubscription(userId: string): Promise<SubscriptionInfo> {
        return get<SubscriptionInfo>(`/api/subscriptions/${userId}`);
    },
};
