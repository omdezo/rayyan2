import { NextRequest } from 'next/server';
import { successResponse, errorResponse, requireAdmin, withDB, handleError } from '@/lib/api-utils';
import Settings from '@/lib/models/Settings';

// GET /api/settings - Fetch settings (public)
export async function GET(req: NextRequest) {
    try {
        return await withDB(async () => {
            let settings = await Settings.findOne().lean();

            // If no settings exist, create default
            if (!settings) {
                settings = await Settings.create({
                    siteName: 'ريان للتصميم',
                    siteDescription: 'متجر للمنتجات الرقمية والتصاميم الإبداعية',
                    contactEmail: '',
                    contactPhone: '',
                    address: '',
                    socialLinks: {},
                });
            }

            return successResponse(settings);
        });
    } catch (error) {
        return handleError(error);
    }
}

// PUT /api/settings - Update settings (admin only)
export async function PUT(req: NextRequest) {
    try {
        const { error: authError } = await requireAdmin(req);
        if (authError) return authError;

        const body = await req.json();
        const { siteName, siteDescription, contactEmail, contactPhone, address, socialLinks } = body;

        return await withDB(async () => {
            // Find existing settings or create new
            let settings = await Settings.findOne();

            if (!settings) {
                // Create new settings
                settings = await Settings.create({
                    siteName,
                    siteDescription,
                    contactEmail,
                    contactPhone,
                    address,
                    socialLinks: socialLinks || {},
                });
            } else {
                // Update existing settings
                const updateData: any = {};
                if (siteName !== undefined) updateData.siteName = siteName;
                if (siteDescription !== undefined) updateData.siteDescription = siteDescription;
                if (contactEmail !== undefined) updateData.contactEmail = contactEmail;
                if (contactPhone !== undefined) updateData.contactPhone = contactPhone;
                if (address !== undefined) updateData.address = address;
                if (socialLinks !== undefined) updateData.socialLinks = socialLinks;

                settings = await Settings.findByIdAndUpdate(
                    settings._id,
                    updateData,
                    { new: true, runValidators: true }
                );
            }

            return successResponse(settings, 'Settings updated successfully');
        });
    } catch (error) {
        return handleError(error);
    }
}
