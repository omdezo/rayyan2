import { NextRequest } from 'next/server';
import { successResponse, errorResponse, withDB, handleError, getSession } from '@/lib/api-utils';
import { createCheckoutSession, getPaymentUrl, omrToBaisa, validateMinimumAmount, ThawaniProduct } from '@/lib/thawani';
import Order from '@/lib/models/Order';

// POST /api/thawani/create-session - Create Thawani checkout session
export async function POST(req: NextRequest) {
    try {
        const session = await getSession(req);
        const body = await req.json();
        const { customerInfo, items, total, fromCart, productId, languages } = body;

        // Validation
        if (!customerInfo || !items || !total) {
            return errorResponse('Missing required fields: customerInfo, items, total', 400);
        }

        if (!customerInfo.name || !customerInfo.email || !customerInfo.phone) {
            return errorResponse('Missing required customer info: name, email, phone', 400);
        }

        if (!Array.isArray(items) || items.length === 0) {
            return errorResponse('Items must be a non-empty array', 400);
        }

        return await withDB(async () => {
            // Create order in pending status
            const orderData: any = {
                customerInfo,
                items,
                total,
                paymentMethod: 'card', // Thawani card payment
                status: 'pending',
                paymentStatus: 'unpaid', // Initialize payment status
            };

            // Add userId if authenticated
            if (session?.user) {
                orderData.userId = (session.user as any).id;
            }

            const order = await Order.create(orderData);

            // Prepare Thawani products
            const thawaniProducts: ThawaniProduct[] = items.map((item: any) => ({
                name: item.title.substring(0, 40), // Thawani max 40 chars
                unit_amount: omrToBaisa(item.price), // Convert OMR to baisa
                quantity: 1,
            }));

            // Calculate total in baisa
            const totalInBaisa = omrToBaisa(total);

            // Validate minimum amount (100 baisa = 0.100 OMR)
            if (!validateMinimumAmount(totalInBaisa)) {
                await Order.findByIdAndUpdate(order._id, { status: 'failed' });
                return errorResponse('Total amount must be at least 0.100 OMR', 400);
            }

            // Debug logging
            console.log('Creating Thawani session:', {
                orderId: order._id.toString(),
                totalOMR: total,
                totalBaisa: totalInBaisa,
                products: thawaniProducts,
            });

            // Create Thawani checkout session
            const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
            const checkoutSession = await createCheckoutSession({
                client_reference_id: order._id.toString(),
                mode: 'payment',
                products: thawaniProducts,
                success_url: `${baseUrl}/ar/payment/success?order_id=${order._id.toString()}`,
                cancel_url: `${baseUrl}/ar/payment/cancel?order_id=${order._id.toString()}`,
                metadata: {
                    'Customer name': customerInfo.name,
                    'Customer email': customerInfo.email,
                    'Customer phone': customerInfo.phone,
                    'order_id': order._id.toString(),
                },
            });

            // Update order with Thawani session details
            await Order.findByIdAndUpdate(order._id, {
                thawaniSessionId: checkoutSession.data.session_id,
                thawaniInvoice: checkoutSession.data.invoice,
            });

            // Generate payment URL
            const paymentUrl = getPaymentUrl(checkoutSession.data.session_id);

            return successResponse(
                {
                    orderId: order._id,
                    sessionId: checkoutSession.data.session_id,
                    invoice: checkoutSession.data.invoice,
                    paymentUrl,
                    expiresAt: checkoutSession.data.expire_at,
                },
                'Checkout session created successfully',
                201
            );
        });
    } catch (error: any) {
        console.error('Thawani session creation error:', error);
        return handleError(error);
    }
}
