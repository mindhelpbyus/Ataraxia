/**
 * Secure Razorpay Payment Integration
 * PCI-DSS Compliant - Never stores card data
 * 
 * Features:
 * - Server-side order creation
 * - Client-side payment collection (Razorpay handles card data)
 * - Webhook verification for payment confirmation
 * - Audit logging for all payment events
 */

import { logger, AuditEventType } from './secureLogger';

// ⚠️ NEVER expose secret key in frontend
// Store in environment variables
const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;

interface PaymentOrder {
    orderId: string;
    amount: number;
    currency: string;
    receipt: string;
}

interface PaymentResult {
    success: boolean;
    paymentId?: string;
    orderId?: string;
    signature?: string;
    error?: string;
}

/**
 * Initialize Razorpay payment
 * This loads Razorpay's secure checkout
 */
export async function initiatePayment(
    userId: string,
    amount: number,
    purpose: string,
    onSuccess: (paymentId: string) => void,
    onFailure: (error: string) => void
): Promise<void> {
    try {
        // 1. Create order on YOUR backend (never expose secret key)
        const order = await createPaymentOrder(userId, amount, purpose);

        // 2. Razorpay handles card collection (PCI compliant)
        const options = {
            key: RAZORPAY_KEY_ID,
            amount: order.amount,
            currency: order.currency,
            name: 'Ataraxia - Mental Health Platform',
            description: purpose,
            order_id: order.orderId,

            // User prefill (PII - but Razorpay is compliant)
            prefill: {
                email: '', // Get from user profile
                contact: '', // Get from user profile
            },

            // Theme
            theme: {
                color: '#F97316', // Orange brand color
            },

            // Success handler
            handler: async function (response: any) {
                // Verify payment on backend
                const verified = await verifyPayment(
                    response.razorpay_order_id,
                    response.razorpay_payment_id,
                    response.razorpay_signature
                );

                if (verified) {
                    // Audit log successful payment
                    logger.audit({
                        eventType: AuditEventType.PHI_ACCESS, // Or create PAYMENT event type
                        userId,
                        resourceId: response.razorpay_payment_id,
                        resourceType: 'payment',
                        action: `Payment completed: ${purpose}`,
                        success: true,
                        metadata: {
                            amount: order.amount / 100, // Convert paise to rupees
                            currency: order.currency,
                            orderId: order.orderId,
                        },
                    });

                    onSuccess(response.razorpay_payment_id);
                } else {
                    logger.error('Payment verification failed', undefined, {
                        userId,
                        orderId: order.orderId,
                    });
                    onFailure('Payment verification failed');
                }
            },

            // Modal close handler
            modal: {
                ondismiss: function () {
                    logger.info('Payment cancelled by user', { userId, orderId: order.orderId });
                    onFailure('Payment cancelled');
                },
            },
        };

        // Load Razorpay checkout
        const razorpay = new (window as any).Razorpay(options);
        razorpay.open();

    } catch (error) {
        logger.error('Failed to initiate payment', error, { userId, amount, purpose });
        onFailure('Failed to initiate payment');
    }
}

/**
 * Create payment order on backend
 * ⚠️ MUST be implemented on your backend server
 */
async function createPaymentOrder(
    userId: string,
    amount: number,
    purpose: string
): Promise<PaymentOrder> {
    // Call your backend API
    const response = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAuthToken()}`, // Your auth token
        },
        body: JSON.stringify({
            userId,
            amount: amount * 100, // Convert to paise
            currency: 'INR',
            purpose,
        }),
    });

    if (!response.ok) {
        throw new Error('Failed to create payment order');
    }

    return response.json();
}

/**
 * Verify payment signature on backend
 * ⚠️ CRITICAL: Must verify on backend with secret key
 */
async function verifyPayment(
    orderId: string,
    paymentId: string,
    signature: string
): Promise<boolean> {
    try {
        const response = await fetch('/api/payments/verify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`,
            },
            body: JSON.stringify({
                orderId,
                paymentId,
                signature,
            }),
        });

        const result = await response.json();
        return result.verified === true;
    } catch (error) {
        logger.error('Payment verification request failed', error);
        return false;
    }
}

/**
 * Get stored payment methods (only tokens, never card data)
 */
export async function getPaymentMethods(userId: string): Promise<any[]> {
    // Audit log: User accessed payment methods
    logger.audit({
        eventType: AuditEventType.PHI_ACCESS,
        userId,
        resourceType: 'payment_methods',
        action: 'Viewed saved payment methods',
        success: true,
    });

    // Fetch from your database
    // Should only contain: last4, brand, expiry month/year, token
    const response = await fetch(`/api/payments/methods?userId=${userId}`, {
        headers: {
            'Authorization': `Bearer ${getAuthToken()}`,
        },
    });

    return response.json();
}

/**
 * Store payment method (only safe data)
 * ⚠️ NEVER store: full card number, CVV, PIN
 */
export async function savePaymentMethod(data: {
    userId: string;
    razorpayCustomerId: string;
    last4: string;
    brand: string;
    expiryMonth: string;
    expiryYear: string;
}): Promise<void> {
    // Audit log
    logger.audit({
        eventType: AuditEventType.PHI_MODIFY,
        userId: data.userId,
        resourceType: 'payment_method',
        action: 'Added payment method',
        success: true,
        metadata: {
            brand: data.brand,
            last4: data.last4,
        },
    });

    // Save to database (only safe data)
    await fetch('/api/payments/save-method', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify(data),
    });
}

// Helper to get auth token
function getAuthToken(): string {
    // Implement your auth token retrieval
    return localStorage.getItem('authToken') || '';
}

/**
 * Load Razorpay script
 * Call this once when app loads
 */
export function loadRazorpayScript(): Promise<boolean> {
    return new Promise((resolve) => {
        if ((window as any).Razorpay) {
            resolve(true);
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => {
            logger.info('Razorpay script loaded');
            resolve(true);
        };
        script.onerror = () => {
            logger.error('Failed to load Razorpay script');
            resolve(false);
        };
        document.body.appendChild(script);
    });
}
