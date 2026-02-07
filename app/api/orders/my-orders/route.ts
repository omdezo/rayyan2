import { NextRequest } from 'next/server';
import { successResponse, errorResponse, withDB, handleError } from '@/lib/api-utils';
import Order from '@/lib/models/Order';
import { auth } from '@/lib/auth';

// GET /api/orders/my-orders - Get current user's orders with pagination
export async function GET(req: NextRequest) {
    try {
        // Get the session
        const session = await auth();

        if (!session?.user) {
            return errorResponse('Unauthorized', 401);
        }

        const userId = (session.user as any).id;

        // ⚠️ CRITICAL: Validate userId exists (especially for Google OAuth users)
        if (!userId || userId === 'undefined' || userId === 'null') {
            console.error('❌ [my-orders] Invalid userId from session:', {
                userId,
                email: session.user.email,
                user: session.user
            });
            return errorResponse('Invalid user session. Please try logging out and logging back in.', 400);
        }

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');

        console.log(`🔍 [my-orders] Fetching orders for userId: ${userId}, email: ${session.user.email}`);

        return await withDB(async () => {
            // ⚠️ CRITICAL: Explicitly filter by userId to ensure users ONLY see their own orders
            const filter = { userId: userId };

            // Fetch orders with pagination
            const orders = await Order.find(filter)
                .sort({ date: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean();

            const total = await Order.countDocuments(filter);

            console.log(`✅ [my-orders] Found ${orders.length} orders (total: ${total}) for userId: ${userId}`);

            // ⚠️ SECURITY: Ensure all returned orders belong to the current user
            const invalidOrders = orders.filter((order: any) => order.userId !== userId);
            if (invalidOrders.length > 0) {
                console.error('❌ [my-orders] SECURITY BREACH: Found orders not belonging to user!', {
                    userId,
                    invalidOrderCount: invalidOrders.length
                });
                // Return only valid orders
                const validOrders = orders.filter((order: any) => order.userId === userId);
                return successResponse({
                    orders: validOrders,
                    pagination: {
                        total: validOrders.length,
                        page,
                        limit,
                        pages: Math.ceil(validOrders.length / limit),
                    },
                });
            }

            return successResponse({
                orders,
                pagination: {
                    total,
                    page,
                    limit,
                    pages: Math.ceil(total / limit),
                },
            });
        });
    } catch (error) {
        console.error('❌ [my-orders] Error:', error);
        return handleError(error);
    }
}
