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

        const responseText = await response.text();
        const lines = responseText.split('\n');

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
 * Provides specific, helpful error messages
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
        errors.push(`Password is too short. Use at least 12 characters (current: ${password.length})`);
    }

    if (password.length > 128) {
        errors.push(`Password is too long. Use no more than 128 characters (current: ${password.length})`);
    }

    // Check for spaces (allowed by NIST)
    if (password.includes(' ')) {
        warnings.push('Password contains spaces (this is allowed, just ensure it\'s intentional)');
    }

    // Check for repetitive patterns
    if (/(.)\1{4,}/.test(password)) {
        errors.push('Password contains too many repeated characters (5+ in a row). Try mixing it up more.');
    }

    // Check for sequential patterns
    const sequential = [
        { pattern: 'abcdefghijklmnopqrstuvwxyz', name: 'alphabetical' },
        { pattern: '0123456789', name: 'numerical' },
        { pattern: 'qwertyuiopasdfghjklzxcvbnm', name: 'keyboard' }
    ];

    for (const seq of sequential) {
        for (let i = 0; i <= seq.pattern.length - 6; i++) {
            if (password.toLowerCase().includes(seq.pattern.substring(i, i + 6))) {
                errors.push(`Password contains ${seq.name} sequences. Try using random characters instead.`);
                break;
            }
        }
    }

    // Check against common passwords
    const commonPasswords = [
        'password', '123456', 'password123', 'admin', 'qwerty',
        'letmein', 'welcome', 'monkey', '1234567890', 'password1',
        'login', 'guest', 'hello', 'test', 'user'
    ];

    for (const common of commonPasswords) {
        if (password.toLowerCase().includes(common)) {
            errors.push('Password contains common words. Try using unique phrases or random words instead.');
            break;
        }
    }

    // Check for breach (async)
    try {
        const breachCheck = await checkPasswordBreach(password);
        if (breachCheck.isBreached) {
            errors.push(`This password has been found in ${breachCheck.breachCount?.toLocaleString()} data breaches. Please choose a different password for your security.`);
        } else if (breachCheck.error) {
            warnings.push('Unable to verify if password has been breached. Consider choosing a different password to be safe.');
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

export function generateSecurePassword(wordCount: number = 2, maxLength: number = 18): string {
    // 1. Filter words to optimize for the 16-18 char target
    // We want words around 4-6 chars so: 5+1+4+1+5 = 16 minimum.
    const allWords = [
        'apple', 'bridge', 'cloud', 'delta', 'eagle', 'forest', 'grape', 'house',
        'island', 'jungle', 'kite', 'lemon', 'night', 'ocean', 'piano',
        'quest', 'river', 'stone', 'train', 'valley', 'water',
        'yellow', 'zebra', 'amber', 'brave', 'coral', 'drift', 'ember', 'frost',
        'glory', 'haven', 'ivory', 'jade', 'knack', 'lunar', 'misty', 'noble',
        'orbit', 'pearl', 'quartz', 'royal', 'solar', 'tide', 'unity', 'vivid',
        'waltz', 'xenon', 'yield', 'zenith', 'bloom', 'charm', 'dusk', 'echo',
        'flame', 'grove', 'halo', 'iris', 'jump', 'lark', 'moss',
        'neon', 'opal', 'pine', 'quill', 'rain', 'sage', 'teal', 'urn',
        'vine', 'wind', 'yarn', 'zinc', 'acorn', 'birch', 'cedar', 'daisy',
        'elm', 'fern', 'hazel', 'jazz', 'kelp', 'lily',
        'maple', 'north', 'oak', 'palm', 'rose', 'star', 'tulip',
        'urban', 'violet', 'willow', 'zest', 'alpha', 'beta', 'gamma',
        'delta', 'echo', 'golf', 'hotel', 'india', 'juliet', 'kilo',
        'lima', 'mike', 'oscar', 'papa', 'romeo', 'tango', 'victor', 'zulu',
        'azure', 'bamboo', 'basil', 'beach', 'breeze', 'brook', 'cactus', 'cliff',
        'dawns', 'dunes', 'earth', 'flame', 'flood', 'flora', 'galaxy',
        'geode', 'haze', 'lunar', 'magma', 'mango', 'maze', 'mint',
        'oasis', 'olive', 'onyx', 'pluto', 'prism', 'reef', 'resin',
        'ruby', 'shade', 'sky', 'slate', 'snow', 'spark', 'storm', 'sun',
        'tiger', 'topaz', 'vapor', 'venus', 'wave'
    ];

    // Symbols ONLY (removed numbers from separators to ensure special chars are visible)
    // Numbers are guaranteed via the 4-digit injection
    const symbols = '!@#$%^&*()_+-=[]{}';

    let attempts = 0;
    const maxAttempts = 50; // Increased attempts to find perfect fit
    const minLength = 16;   // Strict minimum

    while (attempts < maxAttempts) {
        attempts++;

        // 1. Select distinct words
        const selectedWords: string[] = [];
        const array = new Uint32Array(wordCount);
        crypto.getRandomValues(array);

        for (let i = 0; i < wordCount; i++) {
            const wordIndex = array[i] % allWords.length;
            const rawWord = allWords[wordIndex];
            // Capitalize
            const word = rawWord.charAt(0).toUpperCase() + rawWord.slice(1);
            selectedWords.push(word);
        }

        // 2. Generate 4-Digit Number (1000-9999) to ensure length
        const numArr = new Uint32Array(1);
        crypto.getRandomValues(numArr);
        const randomNumber = (numArr[0] % 9000) + 1000;

        // 3. Inject number
        // Position: 0 (Start), 1 (Middle), 2 (End) relative to 2 words
        const posArr = new Uint32Array(1);
        crypto.getRandomValues(posArr);
        const numberPos = posArr[0] % (selectedWords.length + 1);

        const components = [...selectedWords];
        components.splice(numberPos, 0, randomNumber.toString());

        // 4. Join with Special Char Separators
        let password = components[0];
        const symArr = new Uint32Array(components.length - 1);
        crypto.getRandomValues(symArr);

        for (let i = 1; i < components.length; i++) {
            const symIndex = symArr[i - 1] % symbols.length;
            const separator = symbols[symIndex];
            password += separator + components[i];
        }

        // 5. Strict constraint check (16-18)
        if (password.length >= minLength && password.length <= maxLength) {
            return password;
        }
    }

    // Fallback: Generate a safe random string of exactly 16 chars if word-fitting fails
    const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%^&*()_+-=[]{}';
    let password = '';
    const arr = new Uint8Array(16);
    crypto.getRandomValues(arr);
    for (let i = 0; i < 16; i++) {
        password += charset[arr[i] % charset.length];
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