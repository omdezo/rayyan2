import { NextRequest } from 'next/server';
import { successResponse, errorResponse, withDB, handleError } from '@/lib/api-utils';
import DiscountCode from '@/lib/models/DiscountCode';

// POST /api/discount-codes/validate - Validate a discount code (public)
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { code, purchaseAmount } = body;

        if (!code || !code.trim()) {
            return errorResponse('Discount code is required', 400);
        }

        if (purchaseAmount === undefined || purchaseAmount < 0) {
            return errorResponse('Valid purchase amount is required', 400);
        }

        return await withDB(async () => {
            const discountCode = await DiscountCode.findOne({
                code: code.toUpperCase().trim()
            });

            if (!discountCode) {
                return errorResponse('Invalid discount code', 404);
            }

            // Check if code is valid
            const validation = (discountCode as any).isValid(purchaseAmount);

            if (!validation.valid) {
                return errorResponse(validation.reason || 'Discount code is not valid', 400);
            }

            // Return discount details
            return successResponse({
                code: discountCode.code,
                discountPercent: discountCode.discountPercent,
                discountAmount: (purchaseAmount * discountCode.discountPercent) / 100,
                minPurchaseAmount: discountCode.minPurchaseAmount,
            }, 'Discount code is valid');
        });
    } catch (error) {
        return handleError(error);
    }
}
