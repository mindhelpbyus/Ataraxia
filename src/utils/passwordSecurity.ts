/**
 * Check if password has been compromised using Have I Been Pwned API
 * Uses k-anonymity model - only sends first 5 chars of SHA-1 hash
 */
export async function checkPasswordBreach(password: string): Promise<{
    isBreached: boolean;
    breachCount?: number;
    error?: string;
}> {
    try {
        // Create SHA-1 hash of password using Web Crypto API
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-1', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
        
        const prefix = hash.substring(0, 5);
        const suffix = hash.substring(5);

        // Query Have I Been Pwned API with k-anonymity
        const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
            method: 'GET',
            headers: {
                'User-Agent': 'Ataraxia-Password-Check',
            },
        });

        if (!response.ok) {
            return {
                isBreached: false,
                error: 'Unable to check password breach status'
            };
        }

        const data = await response.text();
        const lines = data.split('\n');

        // Check if our password hash suffix appears in the results
        for (const line of lines) {
            const [hashSuffix, count] = line.trim().split(':');
            if (hashSuffix === suffix) {
                return {
                    isBreached: true,
                    breachCount: parseInt(count, 10)
                };
            }
        }

        return {
            isBreached: false
        };

    } catch (error) {
        console.error('Password breach check failed:', error);
        return {
            isBreached: false,
            error: 'Unable to check password breach status'
        };
    }
}

/**
 * Enhanced password validation with NIST SP 800-63B compliance
 */
export async function validatePasswordSecurity(password: string): Promise<{
    valid: boolean;
    errors: string[];
    warnings: string[];
}> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Length requirements (NIST SP 800-63B)
    if (password.length < 12) {
        errors.push('Password must be at least 12 characters long');
    }

    if (password.length > 128) {
        errors.push('Password must be no more than 128 characters long');
    }

    // Check for spaces (allowed by NIST)
    if (password.includes(' ')) {
        warnings.push('Password contains spaces (allowed but ensure it\'s intentional)');
    }

    // Check for repetitive patterns
    if (/(.)\1{4,}/.test(password)) {
        errors.push('Password contains too many repeated characters');
    }

    // Check for sequential patterns
    const sequential = [
        'abcdefghijklmnopqrstuvwxyz',
        '0123456789',
        'qwertyuiopasdfghjklzxcvbnm'
    ];

    for (const seq of sequential) {
        for (let i = 0; i <= seq.length - 6; i++) {
            if (password.toLowerCase().includes(seq.substring(i, i + 6))) {
                errors.push('Password contains sequential characters');
                break;
            }
        }
    }

    // Check against common passwords
    const commonPasswords = [
        'password', '123456', 'password123', 'admin', 'qwerty',
        'letmein', 'welcome', 'monkey', '1234567890', 'password1'
    ];

    for (const common of commonPasswords) {
        if (password.toLowerCase().includes(common)) {
            errors.push('Password contains common words or patterns');
            break;
        }
    }

    // Check for breach (async)
    try {
        const breachCheck = await checkPasswordBreach(password);
        if (breachCheck.isBreached) {
            errors.push(`Password has been found in ${breachCheck.breachCount} data breaches. Please choose a different password.`);
        } else if (breachCheck.error) {
            warnings.push('Unable to verify if password has been breached. Consider choosing a different password.');
        }
    } catch (error) {
        warnings.push('Password breach check unavailable. Consider choosing a unique password.');
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings
    };
}

/**
 * Generate a secure password suggestion
 */
export function generateSecurePassword(length: number = 16): string {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    let password = '';
    
    // Use crypto.getRandomValues for secure randomness
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    
    for (let i = 0; i < length; i++) {
        password += charset[array[i] % charset.length];
    }
    
    return password;
}

/**
 * Calculate password entropy (bits)
 */
export function calculatePasswordEntropy(password: string): number {
    let charsetSize = 0;
    
    if (/[a-z]/.test(password)) charsetSize += 26;
    if (/[A-Z]/.test(password)) charsetSize += 26;
    if (/[0-9]/.test(password)) charsetSize += 10;
    if (/[^a-zA-Z0-9]/.test(password)) charsetSize += 32; // Approximate special chars
    
    return Math.log2(Math.pow(charsetSize, password.length));
}