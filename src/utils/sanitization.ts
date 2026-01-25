/**
 * Input Sanitization Utility
 * 
 * Prevents XSS attacks and SQL injection
 * HIPAA requirement: Protect against malicious input
 */

import DOMPurify from 'dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export function sanitizeHTML(dirty: string): string {
    return DOMPurify.sanitize(dirty, {
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li'],
        ALLOWED_ATTR: [],
    });
}

/**
 * Sanitize plain text input
 */
export function sanitizeText(input: string): string {
    if (typeof input !== 'string') return '';

    return input
        .trim()
        .replace(/[<>]/g, '') // Remove angle brackets
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .replace(/on\w+\s*=/gi, ''); // Remove event handlers
}

/**
 * Sanitize email input
 */
export function sanitizeEmail(email: string): string {
    if (typeof email !== 'string') return '';

    return email
        .trim()
        .toLowerCase()
        .replace(/[^\w@.-]/g, ''); // Only allow valid email characters
}

/**
 * Sanitize phone number input
 */
export function sanitizePhone(phone: string): string {
    if (typeof phone !== 'string') return '';

    // Remove all non-numeric characters except + for country code
    return phone.replace(/[^\d+]/g, '');
}

/**
 * Sanitize URL input
 */
export function sanitizeURL(url: string): string {
    if (typeof url !== 'string') return '';

    try {
        const parsed = new URL(url);
        // Only allow http and https protocols
        if (!['http:', 'https:'].includes(parsed.protocol)) {
            return '';
        }
        return parsed.toString();
    } catch {
        return '';
    }
}

/**
 * Sanitize file name
 */
export function sanitizeFileName(fileName: string): string {
    if (typeof fileName !== 'string') return '';

    return fileName
        .trim()
        .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace invalid chars with underscore
        .replace(/\.{2,}/g, '.') // Prevent directory traversal
        .substring(0, 255); // Limit length
}

/**
 * Validate and sanitize date input
 */
export function sanitizeDate(date: string | Date): Date | null {
    try {
        const parsed = new Date(date);
        if (isNaN(parsed.getTime())) {
            return null;
        }
        return parsed;
    } catch {
        return null;
    }
}

/**
 * Sanitize numeric input
 */
export function sanitizeNumber(input: string | number): number | null {
    const num = typeof input === 'string' ? parseFloat(input) : input;
    return isNaN(num) ? null : num;
}

/**
 * Sanitize object for database storage
 * Recursively sanitizes all string values
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
    const sanitized: any = {};

    for (const key in obj) {
        const value = obj[key];

        if (typeof value === 'string') {
            sanitized[key] = sanitizeText(value);
        } else if (Array.isArray(value)) {
            sanitized[key] = value.map(item =>
                typeof item === 'string' ? sanitizeText(item) :
                    typeof item === 'object' ? sanitizeObject(item) :
                        item
            );
        } else if (value !== null && typeof value === 'object') {
            sanitized[key] = sanitizeObject(value);
        } else {
            sanitized[key] = value;
        }
    }

    return sanitized as T;
}

/**
 * Validate input length
 */
export function validateLength(
    input: string,
    min: number = 0,
    max: number = 10000
): boolean {
    return input.length >= min && input.length <= max;
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate strong password
 * HIPAA requirement: Strong authentication
 */
export function validatePassword(password: string): {
    valid: boolean;
    errors: string[];
} {
    const errors: string[] = [];

    // NIST SP 800-63B Guidelines
    if (password.length < 12) {
        errors.push('Password must be at least 12 characters long');
    }

    if (password.length > 128) {
        errors.push('Password must be no more than 128 characters long');
    }

    // Check against common weak passwords (basic list - should integrate with Have I Been Pwned)
    const weakPasswords = [
        'password123',
        'admin123',
        'qwerty123',
        '123456789',
        'password1',
        '12345678901234567890', // Long but weak
        'aaaaaaaaaaaaa', // Repetitive
        'abcdefghijklmnop', // Sequential
    ];

    if (weakPasswords.some(weak => password.toLowerCase().includes(weak.toLowerCase()))) {
        errors.push('Password is too common or predictable');
    }

    // Check for repetitive patterns
    if (/(.)\1{4,}/.test(password)) {
        errors.push('Password contains too many repeated characters');
    }

    // Check for sequential patterns
    const sequential = ['abcdefghijklmnopqrstuvwxyz', '0123456789', 'qwertyuiopasdfghjklzxcvbnm'];
    for (const seq of sequential) {
        for (let i = 0; i <= seq.length - 6; i++) {
            if (password.toLowerCase().includes(seq.substring(i, i + 6))) {
                errors.push('Password contains sequential characters');
                break;
            }
        }
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

/**
 * Rate limiting helper
 * Prevents brute force attacks
 */
class RateLimiter {
    private attempts: Map<string, { count: number; resetTime: number }> = new Map();

    /**
     * Check if action is allowed
     * @param key - Unique identifier (e.g., email, IP address)
     * @param maxAttempts - Maximum attempts allowed
     * @param windowMs - Time window in milliseconds
     */
    isAllowed(key: string, maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000): boolean {
        const now = Date.now();
        const record = this.attempts.get(key);

        if (!record || now > record.resetTime) {
            // First attempt or window expired
            this.attempts.set(key, {
                count: 1,
                resetTime: now + windowMs,
            });
            return true;
        }

        if (record.count >= maxAttempts) {
            return false;
        }

        record.count++;
        return true;
    }

    /**
     * Reset attempts for a key
     */
    reset(key: string): void {
        this.attempts.delete(key);
    }

    /**
     * Get remaining attempts
     */
    getRemainingAttempts(key: string, maxAttempts: number = 5): number {
        const record = this.attempts.get(key);
        if (!record || Date.now() > record.resetTime) {
            return maxAttempts;
        }
        return Math.max(0, maxAttempts - record.count);
    }
}

export const rateLimiter = new RateLimiter();
