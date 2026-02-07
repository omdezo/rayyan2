import { NextRequest } from 'next/server';
import { successResponse, errorResponse, withDB, handleError } from '@/lib/api-utils';
import Order from '@/lib/models/Order';
import User from '@/lib/models/User';
import { auth } from '@/lib/auth';

// GET /api/orders/my-orders - Get current user's orders with pagination
export async function GET(req: NextRequest) {
    try {
        // Get the session
        const session = await auth();

        if (!session?.user) {
            return errorResponse('Unauthorized', 401);
        }

        let userId = (session.user as any).id;

        // 🔧 FIX: If userId is missing (old Google OAuth users), try to fetch from DB
        if (!userId || userId === 'undefined' || userId === 'null') {
            const email = session.user?.email;

            if (!email) {
                console.error('❌ [my-orders] No userId and no email in session');
                return errorResponse('Invalid user session. Please try logging out and logging back in.', 400);
            }

            // Try to fetch userId from database using email
            try {
                await require('@/lib/mongodb').default(); // Connect to DB
                const user = await User.findOne({ email: email.toLowerCase() });

                if (user && user._id) {
                    userId = user._id.toString();
                    console.log('🔧 [my-orders] Auto-repaired userId for:', email);
                } else {
                    console.error('❌ [my-orders] User not found in DB for email:', email);
                    return errorResponse('User account not found. Please try logging out and logging back in.', 400);
                }
            } catch (error) {
                console.error('❌ [my-orders] Error fetching user:', error);
                return errorResponse('Error retrieving user information.', 500);
            }
        }

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');

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
