import { NextRequest } from 'next/server';
import { requireAdmin, successResponse, errorResponse, withDB } from '@/lib/api-utils';
import Section from '@/lib/models/Section';

// GET /api/sections - Get all sections
export async function GET(request: NextRequest) {
    return withDB(async () => {
        try {
            const { searchParams } = new URL(request.url);
            const activeOnly = searchParams.get('activeOnly') === 'true';

            const query = activeOnly ? { isActive: true } : {};
            const sections = await Section.find(query).sort({ order: 1, createdAt: -1 });

            return successResponse(sections);
        } catch (error) {
            console.error('Error fetching sections:', error);
            return errorResponse('Failed to fetch sections', 500);
        }
    });
}

// POST /api/sections - Create a new section (admin only)
export async function POST(request: NextRequest) {
    return withDB(async () => {
        const authError = await requireAdmin();
        if (authError) return authError;

        try {
            const body = await request.json();
            const { key, nameAr, nameEn, descriptionAr, descriptionEn, icon, isActive, order } = body;

            // Validation
            if (!key || !nameAr || !nameEn) {
                return errorResponse('Key, Arabic name, and English name are required', 400);
            }

            // Check if key already exists
            const existingSection = await Section.findOne({ key: key.toLowerCase().trim() });
            if (existingSection) {
                return errorResponse('Section with this key already exists', 400);
            }

            // Get the highest order number if order is not provided
            let sectionOrder = order;
            if (sectionOrder === undefined || sectionOrder === null) {
                const lastSection = await Section.findOne().sort({ order: -1 });
                sectionOrder = lastSection ? lastSection.order + 1 : 0;
            }

            const section = await Section.create({
                key: key.toLowerCase().trim(),
                nameAr: nameAr.trim(),
                nameEn: nameEn.trim(),
                descriptionAr: descriptionAr?.trim(),
                descriptionEn: descriptionEn?.trim(),
                icon: icon?.trim(),
                isActive: isActive !== undefined ? isActive : true,
                order: sectionOrder,
            });

            return successResponse(section, 201);
        } catch (error) {
            console.error('Error creating section:', error);
            return errorResponse('Failed to create section', 500);
        }
    });
}
