/**
 * HIPAA-Compliant Session Timeout Service
 * 
 * Requirements:
 * - Auto-logout after 15 minutes of inactivity
 * - Warning before logout
 * - Secure session cleanup
 */

import { logger, AuditEventType } from './secureLogger';

const INACTIVITY_TIMEOUT = 2 * 60 * 60 * 1000; // 2 hours
const WARNING_TIME = 5 * 60 * 1000; // 5 minutes before timeout
const CHECK_INTERVAL = 30 * 1000; // Check every 30 seconds

export class SessionTimeoutService {
    private lastActivityTime: number;
    private timeoutId: NodeJS.Timeout | null = null;
    private warningId: NodeJS.Timeout | null = null;
    private checkIntervalId: NodeJS.Timeout | null = null;
    private onWarning?: () => void;
    private onTimeout?: () => void;
    private userId?: string;
    private isActive: boolean = false;

    constructor() {
        this.lastActivityTime = Date.now();
    }

    /**
     * Start monitoring session timeout
     */
    start(userId: string, onWarning: () => void, onTimeout: () => void): void {
        this.userId = userId;
        this.onWarning = onWarning;
        this.onTimeout = onTimeout;
        this.isActive = true;
        this.lastActivityTime = Date.now();

        // Set up activity listeners
        this.setupActivityListeners();

        // Start checking for timeout
        this.startTimeoutCheck();

        logger.info('Session timeout monitoring started', { userId });
    }

    /**
     * Stop monitoring (on logout)
     */
    stop(): void {
        this.isActive = false;
        this.cleanup();

        if (this.userId) {
            logger.audit({
                eventType: AuditEventType.LOGOUT,
                userId: this.userId,
                action: 'Session ended',
                success: true,
            });
        }
    }

    /**
     * Reset activity timer (called on user interaction)
     */
    private resetActivity(): void {
        if (!this.isActive) return;

        this.lastActivityTime = Date.now();

        // Clear existing timers
        if (this.warningId) {
            clearTimeout(this.warningId);
            this.warningId = null;
        }
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }
    }

    /**
     * Set up event listeners for user activity
     */
    private setupActivityListeners(): void {
        const events = [
            'mousedown',
            'mousemove',
            'keypress',
            'scroll',
            'touchstart',
            'click',
        ];

        // Throttle activity updates to avoid excessive calls
        let throttleTimer: NodeJS.Timeout | null = null;
        const throttledReset = () => {
            if (!throttleTimer) {
                throttleTimer = setTimeout(() => {
                    this.resetActivity();
                    throttleTimer = null;
                }, 1000); // Throttle to once per second
            }
        };

        events.forEach(event => {
            document.addEventListener(event, throttledReset, true);
        });

        // Store cleanup function
        this.cleanup = () => {
            events.forEach(event => {
                document.removeEventListener(event, throttledReset, true);
            });
            if (this.checkIntervalId) {
                clearInterval(this.checkIntervalId);
                this.checkIntervalId = null;
            }
            if (this.warningId) {
                clearTimeout(this.warningId);
                this.warningId = null;
            }
            if (this.timeoutId) {
                clearTimeout(this.timeoutId);
                this.timeoutId = null;
            }
        };
    }

    /**
     * Start periodic timeout check
     */
    private startTimeoutCheck(): void {
        this.checkIntervalId = setInterval(() => {
            if (!this.isActive) return;

            const now = Date.now();
            const inactiveTime = now - this.lastActivityTime;

            // Check if we should show warning
            if (inactiveTime >= INACTIVITY_TIMEOUT - WARNING_TIME && !this.warningId) {
                this.showWarning();
            }

            // Check if we should timeout
            if (inactiveTime >= INACTIVITY_TIMEOUT) {
                this.handleTimeout();
            }
        }, CHECK_INTERVAL);
    }

    /**
     * Show inactivity warning
     */
    private showWarning(): void {
        logger.warn('Session inactivity warning', {
            userId: this.userId,
            inactiveMinutes: Math.floor((Date.now() - this.lastActivityTime) / 60000),
        });

        if (this.onWarning) {
            this.onWarning();
        }

        // Create a new timeout for the actual logout, derived from remaining time
        if (this.timeoutId) clearTimeout(this.timeoutId);

        this.timeoutId = setTimeout(() => {
            this.handleTimeout();
        }, WARNING_TIME);
    }

    /**
     * Handle session timeout
     */
    private handleTimeout(): void {
        logger.warn('Session timed out due to inactivity', {
            userId: this.userId,
            inactiveMinutes: Math.floor((Date.now() - this.lastActivityTime) / 60000),
        });

        if (this.userId) {
            logger.audit({
                eventType: AuditEventType.LOGOUT,
                userId: this.userId,
                action: 'Auto-logout due to inactivity',
                success: true,
                metadata: {
                    reason: 'inactivity_timeout',
                    inactiveMinutes: Math.floor((Date.now() - this.lastActivityTime) / 60000),
                },
            });
        }

        this.stop();

        if (this.onTimeout) {
            this.onTimeout();
        }
    }

    /**
     * Get remaining time before timeout (in milliseconds)
     */
    getRemainingTime(): number {
        const inactiveTime = Date.now() - this.lastActivityTime;
        return Math.max(0, INACTIVITY_TIMEOUT - inactiveTime);
    }

    /**
     * Get remaining time in human-readable format
     */
    getRemainingTimeFormatted(): string {
        const remaining = this.getRemainingTime();
        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    /**
     * Extend session (user clicked "Stay logged in")
     */
    extendSession(): void {
        this.resetActivity();
        logger.info('Session extended by user', { userId: this.userId });
    }

    private cleanup(): void {
        // Will be replaced by setupActivityListeners
    }
}

// Export singleton instance
export const sessionTimeout = new SessionTimeoutService();
