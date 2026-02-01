import { NextRequest } from 'next/server';
import { requireAdmin, successResponse, errorResponse, withDB } from '@/lib/api-utils';
import Section from '@/lib/models/Section';

// GET /api/sections/[id] - Get a single section by ID
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    return withDB(async () => {
        try {
            const section = await Section.findById(params.id);

            if (!section) {
                return errorResponse('Section not found', 404);
            }

            return successResponse(section);
        } catch (error) {
            console.error('Error fetching section:', error);
            return errorResponse('Failed to fetch section', 500);
        }
    });
}

// PUT /api/sections/[id] - Update a section (admin only)
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    return withDB(async () => {
        const authError = await requireAdmin();
        if (authError) return authError;

        try {
            const body = await request.json();
            const { key, nameAr, nameEn, descriptionAr, descriptionEn, icon, isActive, order } = body;

            // Check if section exists
            const section = await Section.findById(params.id);
            if (!section) {
                return errorResponse('Section not found', 404);
            }

            // If key is being changed, check if new key already exists
            if (key && key.toLowerCase().trim() !== section.key) {
                const existingSection = await Section.findOne({ key: key.toLowerCase().trim() });
                if (existingSection) {
                    return errorResponse('Section with this key already exists', 400);
                }
            }

            // Update fields
            if (key) section.key = key.toLowerCase().trim();
            if (nameAr) section.nameAr = nameAr.trim();
            if (nameEn) section.nameEn = nameEn.trim();
            if (descriptionAr !== undefined) section.descriptionAr = descriptionAr?.trim();
            if (descriptionEn !== undefined) section.descriptionEn = descriptionEn?.trim();
            if (icon !== undefined) section.icon = icon?.trim();
            if (isActive !== undefined) section.isActive = isActive;
            if (order !== undefined) section.order = order;

            await section.save();

            return successResponse(section);
        } catch (error) {
            console.error('Error updating section:', error);
            return errorResponse('Failed to update section', 500);
        }
    });
}

// DELETE /api/sections/[id] - Delete a section (admin only)
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    return withDB(async () => {
        const authError = await requireAdmin();
        if (authError) return authError;

        try {
            const section = await Section.findById(params.id);

            if (!section) {
                return errorResponse('Section not found', 404);
            }

            // Optional: Check if any products are using this section
            // You can uncomment this if you want to prevent deletion of sections in use
            /*
            const Product = require('@/lib/models/Product').default;
            const productsCount = await Product.countDocuments({ category: section.key });
            if (productsCount > 0) {
                return errorResponse(
                    `Cannot delete section. ${productsCount} products are using this section.`,
                    400
                );
            }
            */

            await Section.findByIdAndDelete(params.id);

            return successResponse({ message: 'Section deleted successfully' });
        } catch (error) {
            console.error('Error deleting section:', error);
            return errorResponse('Failed to delete section', 500);
        }
    });
}
