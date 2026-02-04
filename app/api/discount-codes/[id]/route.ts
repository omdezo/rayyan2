import { NextRequest } from 'next/server';
import { successResponse, errorResponse, requireAdmin, withDB, handleError } from '@/lib/api-utils';
import DiscountCode from '@/lib/models/DiscountCode';

// PUT /api/discount-codes/[id] - Update discount code (admin only)
export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
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
        if (code && !code.trim()) {
            return errorResponse('Discount code cannot be empty', 400);
        }

        if (discountPercent !== undefined && (discountPercent < 1 || discountPercent > 100)) {
            return errorResponse('Discount percent must be between 1 and 100', 400);
        }

        return await withDB(async () => {
            // If updating code, check if new code already exists
            if (code) {
                const existingCode = await DiscountCode.findOne({
                    code: code.toUpperCase().trim(),
                    _id: { $ne: id }
                });

                if (existingCode) {
                    return errorResponse('Discount code already exists', 400);
                }
            }

            const updateData: any = {};
            if (code) updateData.code = code.toUpperCase().trim();
            if (discountPercent !== undefined) updateData.discountPercent = discountPercent;
            if (isActive !== undefined) updateData.isActive = isActive;
            if (usageLimit !== undefined) updateData.usageLimit = usageLimit || null;
            if (validFrom !== undefined) updateData.validFrom = validFrom || null;
            if (validUntil !== undefined) updateData.validUntil = validUntil || null;
            if (minPurchaseAmount !== undefined) updateData.minPurchaseAmount = minPurchaseAmount || 0;
            if (description !== undefined) updateData.description = description;

            const discountCode = await DiscountCode.findByIdAndUpdate(
                id,
                updateData,
                { new: true, runValidators: false }
            );

            if (!discountCode) {
                return errorResponse('Discount code not found', 404);
            }

            return successResponse(discountCode, 'Discount code updated successfully');
        });
    } catch (error) {
        return handleError(error);
    }
}

// DELETE /api/discount-codes/[id] - Delete discount code (admin only)
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const { error: authError } = await requireAdmin(req);
        if (authError) return authError;

        return await withDB(async () => {
            const discountCode = await DiscountCode.findByIdAndDelete(id);

            if (!discountCode) {
                return errorResponse('Discount code not found', 404);
            }

            return successResponse(null, 'Discount code deleted successfully');
        });
    } catch (error) {
        return handleError(error);
    }
}
