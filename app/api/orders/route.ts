import { NextRequest } from 'next/server';
import { successResponse, errorResponse, requireAdmin, withDB, handleError, getSession } from '@/lib/api-utils';
import Order from '@/lib/models/Order';

// GET /api/orders - Fetch all orders (admin only)
export async function GET(req: NextRequest) {
    try {
        const { error: authError } = await requireAdmin(req);
        if (authError) return authError;

        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '50');

        return await withDB(async () => {
            // Build filter query
            const filter: any = {};
            if (status) filter.status = status;

            // Fetch orders with pagination
            const orders = await Order.find(filter)
                .sort({ date: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean();

            const total = await Order.countDocuments(filter);

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

// POST /api/orders - Create new order (authenticated or guest)
export async function POST(req: NextRequest) {
    try {
        const session = await getSession(req);
        const body = await req.json();
        const { customerInfo, items, total, paymentMethod, status } = body;

        // Validation
        if (!customerInfo || !items || !total || !paymentMethod) {
            return errorResponse('Missing required fields: customerInfo, items, total, paymentMethod', 400);
        }

        if (!customerInfo.name || !customerInfo.email || !customerInfo.phone) {
            return errorResponse('Missing required customer info: name, email, phone', 400);
        }

        if (!Array.isArray(items) || items.length === 0) {
            return errorResponse('Items must be a non-empty array', 400);
        }

        return await withDB(async () => {
            const orderData: any = {
                customerInfo,
                items,
                total,
                paymentMethod,
                status: status || 'pending', // Use provided status or default to 'pending'
            };

            // Add userId if authenticated
            if (session?.user) {
                orderData.userId = (session.user as any).id;
            }

            const order = await Order.create(orderData);

            return successResponse(order, 'Order created successfully', 201);
        });
    } catch (error) {
        return handleError(error);
    }
}
