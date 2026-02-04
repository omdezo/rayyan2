import { NextRequest } from 'next/server';
import { successResponse, errorResponse, requireAdmin, withDB, handleError } from '@/lib/api-utils';
import DiscountCode from '@/lib/models/DiscountCode';

// GET /api/discount-codes - Fetch all discount codes (admin only)
export async function GET(req: NextRequest) {
    try {
        const { error: authError } = await requireAdmin(req);
        if (authError) return authError;

        return await withDB(async () => {
            const codes = await DiscountCode.find({})
                .sort({ createdAt: -1 })
                .lean();

            return successResponse(codes);
        });
    } catch (error) {
        return handleError(error);
    }
}

// POST /api/discount-codes - Create new discount code (admin only)
export async function POST(req: NextRequest) {
    try {
        const { error: authError } = await requireAdmin(req);
        if (authError) return authError;

        const body = await req.json();
        const {
            code,
            discountPercent,
            isActive,
            usageLimit,
            validFrom,
            validUntil,
            minPurchaseAmount,
            description
        } = body;

        // Validation
        if (!code || !code.trim()) {
            return errorResponse('Discount code is required', 400);
        }

        if (!discountPercent || discountPercent < 1 || discountPercent > 100) {
            return errorResponse('Discount percent must be between 1 and 100', 400);
        }

        return await withDB(async () => {
            // Check if code already exists
            const existingCode = await DiscountCode.findOne({
                code: code.toUpperCase().trim()
            });

            if (existingCode) {
                return errorResponse('Discount code already exists', 400);
            }

            const discountCode = await DiscountCode.create({
                code: code.toUpperCase().trim(),
                discountPercent,
                isActive: isActive !== undefined ? isActive : true,
                usageLimit: usageLimit || null,
                validFrom: validFrom || null,
                validUntil: validUntil || null,
                minPurchaseAmount: minPurchaseAmount || 0,
                description: description || '',
            });

            return successResponse(discountCode, 'Discount code created successfully', 201);
        });
    } catch (error) {
        return handleError(error);
    }
}
