import crypto from 'crypto';

// Thawani API Configuration
const THAWANI_API_BASE_URL = process.env.NEXT_PUBLIC_THAWANI_ENV === 'production'
    ? 'https://checkout.thawani.om/api/v1'
    : 'https://uatcheckout.thawani.om/api/v1';

const THAWANI_CHECKOUT_BASE_URL = process.env.NEXT_PUBLIC_THAWANI_ENV === 'production'
    ? 'https://checkout.thawani.om'
    : 'https://uatcheckout.thawani.om';

const THAWANI_SECRET_KEY = process.env.THAWANI_SECRET_KEY!;
const THAWANI_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_THAWANI_PUBLISHABLE_KEY!;

// Product interface for Thawani checkout
export interface ThawaniProduct {
    name: string;
    unit_amount: number; // Amount in baisa (1 OMR = 1000 baisa)
    quantity: number;
}

// Checkout session creation payload
export interface CreateCheckoutSessionPayload {
    client_reference_id: string;
    mode: 'payment';
    products: ThawaniProduct[];
    success_url: string;
    cancel_url: string;
    metadata: Record<string, string>;
}

// Checkout session response
export interface CheckoutSessionResponse {
    success: boolean;
    code: number;
    description: string;
    data: {
        session_id: string;
        client_reference_id: string;
        customer: string | null;
        card: string | null;
        invoice: string;
        products: ThawaniProduct[];
        total_amount: number;
        currency: string;
        payment_status: 'unpaid' | 'paid' | 'cancelled';
        save_card_on_success: boolean;
        metadata: Record<string, string>;
        created_at: string;
        expire_at: string;
    };
}

// Webhook event types
export type WebhookEventType =
    | 'checkout.created'
    | 'checkout.completed'
    | 'payment.pending'
    | 'payment.succeeded'
    | 'payment.failed';

export interface WebhookPayload {
    data: any;
    event_type: WebhookEventType;
}

/**
 * Create a Thawani checkout session
 */
export async function createCheckoutSession(
    payload: CreateCheckoutSessionPayload
): Promise<CheckoutSessionResponse> {
    try {
        const response = await fetch(`${THAWANI_API_BASE_URL}/checkout/session`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'thawani-api-key': THAWANI_SECRET_KEY,
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.description || 'Failed to create checkout session');
        }

        return data;
    } catch (error) {
        console.error('Thawani checkout session creation error:', error);
        throw error;
    }
}

/**
 * Get the payment URL for a session
 *
 * SECURITY NOTE: The 'key' parameter in the URL is the PUBLISHABLE key, which is
 * safe to expose publicly (similar to Stripe's publishable key). It's used client-side
 * for the checkout UI. The SECRET key is NEVER exposed and only used server-side for
 * API authentication. This is the correct and secure implementation.
 */
export function getPaymentUrl(sessionId: string): string {
    return `${THAWANI_CHECKOUT_BASE_URL}/pay/${sessionId}?key=${THAWANI_PUBLISHABLE_KEY}`;
}

/**
 * Retrieve a checkout session by session ID
 */
export async function getCheckoutSession(sessionId: string): Promise<CheckoutSessionResponse> {
    try {
        const response = await fetch(
            `${THAWANI_API_BASE_URL}/checkout/session/${sessionId}`,
            {
                headers: {
                    'thawani-api-key': THAWANI_SECRET_KEY,
                },
            }
        );

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.description || 'Failed to retrieve checkout session');
        }

        return data;
    } catch (error) {
        console.error('Thawani session retrieval error:', error);
        throw error;
    }
}

/**
 * Retrieve a checkout session by client reference ID
 */
export async function getCheckoutSessionByReference(
    clientReferenceId: string
): Promise<CheckoutSessionResponse> {
    try {
        const response = await fetch(
            `${THAWANI_API_BASE_URL}/checkout/reference/${clientReferenceId}`,
            {
                headers: {
                    'thawani-api-key': THAWANI_SECRET_KEY,
                },
            }
        );

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.description || 'Failed to retrieve checkout session');
        }

        return data;
    } catch (error) {
        console.error('Thawani session retrieval by reference error:', error);
        throw error;
    }
}

/**
 * Verify webhook signature using HMAC-SHA256
 */
export function verifyWebhookSignature(
    body: string,
    timestamp: string,
    signature: string,
    webhookSecret: string
): boolean {
    try {
        const payload = `${body}-${timestamp}`;
        const computedSignature = crypto
            .createHmac('sha256', webhookSecret)
            .update(payload)
            .digest('hex');

        return computedSignature === signature;
    } catch (error) {
        console.error('Webhook signature verification error:', error);
        return false;
    }
}

/**
 * Convert OMR to Baisa (1 OMR = 1000 baisa)
 */
export function omrToBaisa(omr: number): number {
    return Math.round(omr * 1000);
}

/**
 * Convert Baisa to OMR (1000 baisa = 1 OMR)
 */
export function baisaToOmr(baisa: number): number {
    return baisa / 1000;
}

/**
 * Validate minimum amount (minimum 100 baisa = 0.100 OMR)
 */
export function validateMinimumAmount(amountInBaisa: number): boolean {
    return amountInBaisa >= 100;
}
