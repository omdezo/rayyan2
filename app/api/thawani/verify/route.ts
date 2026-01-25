import { NextRequest } from 'next/server';
import { successResponse, errorResponse, withDB, handleError } from '@/lib/api-utils';
import { getCheckoutSession } from '@/lib/thawani';
import Order from '@/lib/models/Order';

// GET /api/thawani/verify - Verify payment and get order details
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const sessionId = searchParams.get('session_id');

        if (!sessionId) {
            return errorResponse('Session ID is required', 400);
        }

        return await withDB(async () => {
            // Get Thawani session details
            const thawaniSession = await getCheckoutSession(sessionId);

            if (!thawaniSession.success) {
                return errorResponse('Invalid session', 400);
            }

            // Get order by client reference ID (order ID)
            const orderId = thawaniSession.data.client_reference_id;
            const order = await Order.findById(orderId).lean();

            if (!order) {
                return errorResponse('Order not found', 404);
            }

            // Check if payment was completed
            const isPaymentCompleted = thawaniSession.data.payment_status === 'paid';

            // If payment is completed but order status is not updated yet, update it
            if (isPaymentCompleted && order.status !== 'completed') {
                await Order.findByIdAndUpdate(orderId, {
                    status: 'completed',
                    paymentStatus: 'paid',
                    paidAt: new Date(),
                });

                // Re-fetch the updated order
                const updatedOrder = await Order.findById(orderId).lean();

                return successResponse({
                    order: updatedOrder,
                    thawaniSession: thawaniSession.data,
                });
            }

            return successResponse({
                order,
                thawaniSession: thawaniSession.data,
            });
        });
    } catch (error) {
        console.error('Payment verification error:', error);
        return handleError(error);
    }
}
