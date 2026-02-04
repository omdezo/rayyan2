import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature, WebhookPayload } from '@/lib/thawani';
import { withDB } from '@/lib/api-utils';
import Order from '@/lib/models/Order';
import DiscountCode from '@/lib/models/DiscountCode';

// POST /api/thawani/webhook - Handle Thawani webhook events
export async function POST(req: NextRequest) {
    try {
        // Validate webhook secret is configured
        if (!process.env.THAWANI_WEBHOOK_SECRET) {
            console.error('THAWANI_WEBHOOK_SECRET is not configured');
            return NextResponse.json(
                { success: false, error: 'Webhook not configured' },
                { status: 500 }
            );
        }

        // Get webhook headers
        const timestamp = req.headers.get('thawani-timestamp');
        const signature = req.headers.get('thawani-signature');

        if (!timestamp || !signature) {
            console.error('Missing webhook headers');
            return NextResponse.json(
                { success: false, error: 'Missing webhook headers' },
                { status: 400 }
            );
        }

        // Get raw body
        const rawBody = await req.text();

        // Verify webhook signature
        const webhookSecret = process.env.THAWANI_WEBHOOK_SECRET;
        const isValid = verifyWebhookSignature(rawBody, timestamp, signature, webhookSecret);

        if (!isValid) {
            console.error('Invalid webhook signature');
            return NextResponse.json(
                { success: false, error: 'Invalid signature' },
                { status: 401 }
            );
        }

        // Parse webhook payload
        let payload: WebhookPayload;
        try {
            payload = JSON.parse(rawBody);
        } catch (parseError) {
            console.error('Failed to parse webhook payload:', parseError);
            return NextResponse.json(
                { success: false, error: 'Invalid JSON payload' },
                { status: 400 }
            );
        }

        // Validate payload structure
        if (!payload.event_type || !payload.data) {
            console.error('Invalid webhook payload structure:', payload);
            return NextResponse.json(
                { success: false, error: 'Invalid payload structure' },
                { status: 400 }
            );
        }

        console.log('Thawani webhook event:', payload.event_type, 'Data:', payload.data);

        // Handle different event types
        await withDB(async () => {
            switch (payload.event_type) {
                case 'checkout.created':
                    // Session created - order already exists
                    console.log('Checkout session created:', payload.data.session_id);
                    break;

                case 'checkout.completed':
                    // Payment successful - update order status
                    await handlePaymentSuccess(payload);
                    break;

                case 'payment.pending':
                    // Payment is being processed
                    console.log('Payment pending:', payload.data.payment_id);
                    break;

                case 'payment.succeeded':
                    // Payment succeeded
                    await handlePaymentSuccess(payload);
                    break;

                case 'payment.failed':
                    // Payment failed - update order status
                    await handlePaymentFailure(payload);
                    break;

                default:
                    console.log('Unhandled webhook event:', payload.event_type);
            }
        });

        // Always return 200 to acknowledge receipt
        return NextResponse.json({ success: true, received: true });
    } catch (error) {
        console.error('Webhook processing error:', error);
        // Still return 200 to prevent retries
        return NextResponse.json({ success: true, received: true });
    }
}

/**
 * Handle successful payment
 */
async function handlePaymentSuccess(payload: WebhookPayload) {
    try {
        let orderId: string | undefined;

        // Get order ID from different payload structures
        if (payload.event_type === 'checkout.completed') {
            orderId = payload.data.client_reference_id;
        } else if (payload.event_type === 'payment.succeeded') {
            // For payment.succeeded, we need to find the order by invoice
            if (!payload.data.checkout_invoice) {
                console.error('Missing checkout_invoice in payment.succeeded webhook');
                return;
            }
            const order = await Order.findOne({ thawaniInvoice: payload.data.checkout_invoice });
            orderId = order?._id.toString();
        }

        if (!orderId) {
            console.error('Could not find order ID in webhook payload:', {
                event_type: payload.event_type,
                client_reference_id: payload.data.client_reference_id,
                checkout_invoice: payload.data.checkout_invoice
            });
            return;
        }

        // Validate payment_id exists
        if (!payload.data.payment_id) {
            console.error('Missing payment_id in webhook payload');
        }

        // Update order status to completed
        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            {
                status: 'completed',
                paymentStatus: 'paid',
                paymentId: payload.data.payment_id || 'unknown',
                paidAt: new Date(),
            },
            { new: true }
        );

        if (updatedOrder) {
            console.log('Order marked as completed:', orderId, 'Payment ID:', payload.data.payment_id);

            // Increment discount code usage count if discount was applied
            if (updatedOrder.discountCode) {
                try {
                    await DiscountCode.findOneAndUpdate(
                        { code: updatedOrder.discountCode },
                        { $inc: { usedCount: 1 } }
                    );
                    console.log('Incremented discount code usage:', updatedOrder.discountCode);
                } catch (discountError) {
                    console.error('Error incrementing discount code usage:', discountError);
                }
            }
        } else {
            console.error('Order not found:', orderId);
        }
    } catch (error) {
        console.error('Error handling payment success:', error);
    }
}

/**
 * Handle failed payment
 */
async function handlePaymentFailure(payload: WebhookPayload) {
    try {
        // Validate required fields
        if (!payload.data.checkout_invoice) {
            console.error('Missing checkout_invoice in payment.failed webhook');
            return;
        }

        // Find order by invoice
        const order = await Order.findOne({ thawaniInvoice: payload.data.checkout_invoice });

        if (!order) {
            console.error('Order not found for failed payment:', {
                checkout_invoice: payload.data.checkout_invoice,
                payment_id: payload.data.payment_id
            });
            return;
        }

        // Update order status to failed
        await Order.findByIdAndUpdate(order._id, {
            status: 'failed',
            paymentStatus: 'failed',
            paymentId: payload.data.payment_id || 'unknown',
            failureReason: payload.data.reason || 'Payment failed',
        });

        console.log('Order marked as failed:', order._id, 'Reason:', payload.data.reason || 'Unknown');
    } catch (error) {
        console.error('Error handling payment failure:', error);
    }
}
