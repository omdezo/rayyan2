import crypto from 'crypto';

/**
 * Generate a cryptographically secure random token
 * @returns 64-character hex string
 */
export function generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
}

/**
 * Generate token expiration time (10 minutes from now)
 */
export function getTokenExpiration(): Date {
    return new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
}

/**
 * Check if token is expired
 */
export function isTokenExpired(expiresAt: Date | null): boolean {
    if (!expiresAt) return true;
    return new Date() > expiresAt;
}

/**
 * Check rate limit for email sending (1 email per minute)
 * @param lastSentAt The last time an email was sent
 * @returns Object with allowed status and optional wait time in seconds
 */
export function canSendEmail(lastSentAt: Date | null | undefined): { allowed: boolean; waitTime?: number } {
    if (!lastSentAt) return { allowed: true };

    const oneMinute = 60 * 1000;
    const timeSinceLastEmail = Date.now() - lastSentAt.getTime();

    if (timeSinceLastEmail < oneMinute) {
        return {
            allowed: false,
            waitTime: Math.ceil((oneMinute - timeSinceLastEmail) / 1000),
        };
    }

    return { allowed: true };
}
