import { NextRequest } from 'next/server';
import { successResponse, errorResponse, requireAdmin, withDB, handleError, getSession } from '@/lib/api-utils';
import Order from '@/lib/models/Order';

// GET /api/orders/[id] - Fetch single order (admin or order owner)
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> } 
) {
    const { id } = await params; // ✅ Await the params here

    try {
        const session = await getSession(req);

        if (!session || !session.user) {
            return errorResponse('Unauthorized. Please login.', 401);
        }

        return await withDB(async () => {
            // ✅ Use 'id' (the string), NOT 'params.id'
            const order = await Order.findById(id).lean();

            if (!order) {
                return errorResponse('Order not found', 404);
            }

            // Check if user is admin or order owner
            const userRole = (session.user as any)?.role;
            const userId = (session.user as any)?.id;

            if (userRole !== 'admin' && order.userId !== userId) {
                return errorResponse('Forbidden. You do not have access to this order.', 403);
            }

            return successResponse(order);
        });
    } catch (error) {
        return handleError(error);
    }
}

// PUT /api/orders/[id] - Update order status (admin only)
export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params; // ✅ Await the params here

    try {
        const { error: authError } = await requireAdmin(req);
        if (authError) return authError;

        const body = await req.json();
        const { status } = body;

        if (!status) {
            return errorResponse('Status is required', 400);
        }

        if (!['pending', 'completed', 'failed'].includes(status)) {
            return errorResponse('Invalid status. Must be: pending, completed, or failed', 400);
        }

        return await withDB(async () => {
            // ✅ Use 'id' (the string), NOT 'params.id'
            const order = await Order.findByIdAndUpdate(
                id,
                { status },
                { new: true, runValidators: true }
            );

            if (!order) {
                return errorResponse('Order not found', 404);
            }

            return successResponse(order, 'Order status updated successfully');
        });
    } catch (error) {
        return handleError(error);
    }
}