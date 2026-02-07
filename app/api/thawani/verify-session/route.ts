import { NextRequest } from 'next/server';
import { successResponse, errorResponse, withDB, handleError } from '@/lib/api-utils';
import { getCheckoutSession } from '@/lib/thawani';
import Order from '@/lib/models/Order';

// GET /api/thawani/verify-session - Verify payment status with Thawani and update order
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const orderId = searchParams.get('order_id');

        if (!orderId) {
            return errorResponse('Order ID is required', 400);
        }

        return await withDB(async () => {
            // Get order from database
            const order = await Order.findById(orderId);

            if (!order) {
                return errorResponse('Order not found', 404);
            }

            // If already paid, return order
            if (order.paymentStatus === 'paid') {
                return successResponse({ order, alreadyPaid: true });
            }

            // If no Thawani session ID, can't verify
            if (!order.thawaniSessionId) {
                return errorResponse('No Thawani session ID found', 400);
            }

            // Get session from Thawani
            try {
                const thawaniSession = await getCheckoutSession(order.thawaniSessionId);

                console.log('Thawani session verification:', {
                    orderId: order._id.toString(),
                    sessionId: order.thawaniSessionId,
                    paymentStatus: thawaniSession.data.payment_status,
                });

                // Update order based on Thawani status
                if (thawaniSession.data.payment_status === 'paid') {
                    // Payment is confirmed - update order
                    const updatedOrder = await Order.findByIdAndUpdate(
                        orderId,
                        {
                            status: 'completed',
                            paymentStatus: 'paid',
                            paidAt: new Date(),
                        },
                        { new: true }
                    );

                    // 🧹 Cleanup: Auto-cancel other pending orders for the same user
                    // This prevents clutter from abandoned checkouts
                    if (updatedOrder && updatedOrder.userId) {
                        await Order.updateMany(
                            {
                                _id: { $ne: updatedOrder._id }, // Not this order
                                userId: updatedOrder.userId, // Same user
                                status: 'pending', // Still pending
                                paymentStatus: { $ne: 'paid' }, // Not paid
                            },
                            {
                                status: 'failed',
                                paymentStatus: 'failed',
                                failureReason: 'Superseded by completed order',
                            }
                        );
                        console.log('✅ Auto-cancelled old pending orders for user:', updatedOrder.userId);
                    }

                    return successResponse({
                        order: updatedOrder,
                        verified: true,
                        thawaniStatus: thawaniSession.data.payment_status,
                    });
                } else if (thawaniSession.data.payment_status === 'cancelled') {
                    // Payment was cancelled
                    await Order.findByIdAndUpdate(orderId, {
                        status: 'failed',
                        paymentStatus: 'failed',
                        failureReason: 'Payment cancelled',
                    });

                    return errorResponse('Payment was cancelled', 400);
                } else {
                    // Still unpaid
                    return successResponse({
                        order,
                        verified: false,
                        thawaniStatus: thawaniSession.data.payment_status,
                    });
                }
            } catch (error: any) {
                console.error('Thawani verification error:', error);
                return errorResponse('Failed to verify payment with Thawani', 500);
            }
        });
    } catch (error) {
        console.error('Verification error:', error);
        return handleError(error);
    }
}
