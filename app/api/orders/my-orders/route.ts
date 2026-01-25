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
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');

        return await withDB(async () => {
            // Fetch orders with pagination
            const orders = await Order.find({ userId })
                .sort({ date: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean();

            const total = await Order.countDocuments({ userId });

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
        return handleError(error);
    }
}
