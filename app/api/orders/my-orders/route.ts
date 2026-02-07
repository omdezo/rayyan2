import { NextRequest } from 'next/server';
import { successResponse, errorResponse, withDB, handleError } from '@/lib/api-utils';
import Order from '@/lib/models/Order';
import User from '@/lib/models/User';
import { auth } from '@/lib/auth';

// Helper function to fetch orders
async function fetchOrders(userId: string, userEmail: string, req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // ⚠️ CRITICAL: Query by BOTH userId AND customerInfo.email for backwards compatibility
    // This ensures we fetch:
    // 1. Orders with userId (new orders)
    // 2. Old orders without userId but matching email
    const filter = {
        $or: [
            { userId: userId }, // New orders with userId
            { 'customerInfo.email': userEmail.toLowerCase() } // Old orders without userId
        ]
    };

    // Fetch orders with pagination
    const orders = await Order.find(filter)
        .sort({ date: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

    const total = await Order.countDocuments(filter);

    // 🔧 Auto-update old orders: Add userId to orders that don't have it
    const ordersWithoutUserId = orders.filter((order: any) => !order.userId);
    if (ordersWithoutUserId.length > 0) {
        console.log(`🔧 [my-orders] Auto-updating ${ordersWithoutUserId.length} old orders with userId for: ${userEmail}`);
        await Order.updateMany(
            {
                _id: { $in: ordersWithoutUserId.map((o: any) => o._id) },
                userId: { $exists: false }
            },
            { $set: { userId: userId } }
        );
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
}

// GET /api/orders/my-orders - Get current user's orders with pagination
export async function GET(req: NextRequest) {
    try {
        // Get the session
        const session = await auth();

        if (!session?.user) {
            return errorResponse('Unauthorized', 401);
        }

        let userId = (session.user as any).id;
        const userEmail = session.user?.email;

        // 🔧 FIX: If userId is missing (old Google OAuth users), try to fetch from DB
        if (!userId || userId === 'undefined' || userId === 'null') {
            if (!userEmail) {
                console.error('❌ [my-orders] No userId and no email in session');
                return errorResponse('Invalid user session. Please log out and log back in.', 401);
            }

            // Try to fetch userId from database using email
            return await withDB(async () => {
                const user = await User.findOne({ email: userEmail.toLowerCase() });

                if (!user || !user._id) {
                    console.error('❌ [my-orders] User not found for email:', userEmail);
                    return errorResponse('User account not found. Please log out and log back in.', 401);
                }

                userId = user._id.toString();
                console.log('🔧 [my-orders] Auto-repaired userId for:', userEmail);

                // Continue to fetch orders with repaired userId
                return await fetchOrders(userId, userEmail, req);
            });
        }

        // Fetch orders using helper function
        return await withDB(async () => {
            return await fetchOrders(userId, userEmail!, req);
        });
    } catch (error) {
        console.error('❌ [my-orders] Error:', error);
        return handleError(error);
    }
}
