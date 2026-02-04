import { NextRequest } from 'next/server';
import { successResponse, errorResponse, withDB, handleError, getSession } from '@/lib/api-utils';
import { createCheckoutSession, getPaymentUrl, omrToBaisa, validateMinimumAmount, ThawaniProduct } from '@/lib/thawani';
import Order from '@/lib/models/Order';

// POST /api/thawani/create-session - Create Thawani checkout session
export async function POST(req: NextRequest) {
    try {
        // Validate environment variables
        if (!process.env.THAWANI_SECRET_KEY) {
            console.error('THAWANI_SECRET_KEY is not configured');
            return errorResponse('Payment gateway is not configured', 500);
        }
        if (!process.env.NEXT_PUBLIC_THAWANI_PUBLISHABLE_KEY) {
            console.error('NEXT_PUBLIC_THAWANI_PUBLISHABLE_KEY is not configured');
            return errorResponse('Payment gateway is not configured', 500);
        }
        if (!process.env.NEXT_PUBLIC_APP_URL) {
            console.error('NEXT_PUBLIC_APP_URL is not configured');
            return errorResponse('Application URL is not configured', 500);
        }

        const session = await getSession(req);
        const body = await req.json();
        const { customerInfo, items, subtotal, discountCode, discountPercent, discountAmount, total, fromCart, productId, languages } = body;

        // Validation
        if (!customerInfo || !items || !total) {
            return errorResponse('Missing required fields: customerInfo, items, total', 400);
        }

        if (!customerInfo.name || !customerInfo.email || !customerInfo.phone) {
            return errorResponse('Missing required customer info: name, email, phone', 400);
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(customerInfo.email)) {
            return errorResponse('Invalid email address format', 400);
        }

        // Validate phone format (basic check)
        if (customerInfo.phone.trim().length < 8) {
            return errorResponse('Invalid phone number', 400);
        }

        // Validate name length
        if (customerInfo.name.trim().length < 2) {
            return errorResponse('Customer name must be at least 2 characters', 400);
        }

        if (!Array.isArray(items) || items.length === 0) {
            return errorResponse('Items must be a non-empty array', 400);
        }

        // Thawani validation: Maximum 100 products
        if (items.length > 100) {
            return errorResponse('Maximum 100 products allowed per checkout', 400);
        }

        return await withDB(async () => {
            // Pre-validate products before creating order
            try {
                items.forEach((item: any) => {
                    const unitAmount = omrToBaisa(item.price);
                    const quantity = item.quantity || 1;

                    // Validate unit_amount (1 to 5,000,000,000 baisa)
                    if (unitAmount < 1) {
                        throw new Error(`Product "${item.title}" price is too low (minimum 0.001 OMR)`);
                    }
                    if (unitAmount > 5000000000) {
                        throw new Error(`Product "${item.title}" price exceeds maximum (5,000,000 OMR)`);
                    }

                    // Validate quantity (1 to 100)
                    if (quantity < 1 || quantity > 100) {
                        throw new Error(`Product "${item.title}" quantity must be between 1 and 100`);
                    }

                    // Validate product name
                    if (!item.title || item.title.trim().length === 0) {
                        throw new Error('Product name is required');
                    }
                });
            } catch (validationError: any) {
                return errorResponse(validationError.message, 400);
            }

            // Create order in pending status
            const orderData: any = {
                customerInfo,
                items,
                subtotal: subtotal || total,
                discountCode: discountCode || undefined,
                discountPercent: discountPercent || undefined,
                discountAmount: discountAmount || 0,
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
            const thawaniProducts: ThawaniProduct[] = items.map((item: any) => {
                const unitAmount = omrToBaisa(item.price);
                const quantity = item.quantity || 1;

                return {
                    name: item.title.substring(0, 40), // Thawani max 40 chars
                    unit_amount: unitAmount,
                    quantity: quantity,
                };
            });

            // Calculate total in baisa
            const totalInBaisa = omrToBaisa(total);

            // Validate minimum amount (100 baisa = 0.100 OMR)
            if (!validateMinimumAmount(totalInBaisa)) {
                await Order.findByIdAndUpdate(order._id, { status: 'failed' });
                return errorResponse('Total amount must be at least 0.100 OMR', 400);
            }

            // Validate maximum amount (5,000,000 OMR = 5,000,000,000 baisa)
            if (totalInBaisa > 5000000000) {
                await Order.findByIdAndUpdate(order._id, { status: 'failed' });
                return errorResponse('Total amount exceeds maximum (5,000,000 OMR)', 400);
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
