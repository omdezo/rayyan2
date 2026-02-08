import { NextRequest } from 'next/server';
import { successResponse, errorResponse, requireAdmin, withDB, handleError } from '@/lib/api-utils';
import Product from '@/lib/models/Product';

// GET /api/products - Fetch all products with optional filters
export async function GET(req: NextRequest) {
    try {
        return await withDB(async () => {
            const { searchParams } = new URL(req.url);

            const category = searchParams.get('category');
            const subcategory = searchParams.get('subcategory');
            const status = searchParams.get('status');
            const search = searchParams.get('search');
            const page = parseInt(searchParams.get('page') || '1');
            const limit = parseInt(searchParams.get('limit') || '50');

            // Build filter query
            const filter: any = {};

            if (category) filter.category = category;
            if (subcategory) filter.subcategory = subcategory;
            if (status) filter.status = status;

            // Text search
            if (search) {
                filter.$or = [
                    { title: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } },
                ];
            }

            // Fetch products with pagination
            // Sort: New arrivals first, then by creation date
            const products = await Product.find(filter)
                .sort({ isNewArrival: -1, createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean();

            const total = await Product.countDocuments(filter);

            return successResponse({
                products,
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

// POST /api/products - Create new product (admin only)
export async function POST(req: NextRequest) {
    try {
        const { error: authError } = await requireAdmin(req);
        if (authError) return authError;

        const body = await req.json();
        const { titleAr, titleEn, descriptionAr, descriptionEn, category, subcategory, image, media, languages, status, isNewArrival } = body;

        // Validation for new bilingual products
        if (!titleAr || !titleEn || !descriptionAr || !descriptionEn) {
            return errorResponse('Missing required bilingual fields', 400);
        }

        if (!category || !image) {
            return errorResponse('Missing required fields: category, image', 400);
        }

        // Validate languages array
        if (!languages || !Array.isArray(languages) || languages.length === 0) {
            return errorResponse('At least one language variant is required', 400);
        }

        // Validate each language variant
        for (const lang of languages) {
            if (!lang.lang || !['ar', 'en'].includes(lang.lang)) {
                return errorResponse('Invalid language. Must be "ar" or "en"', 400);
            }

            if (typeof lang.price !== 'number' || lang.price <= 0) {
                return errorResponse(`Price for ${lang.lang} must be a positive number`, 400);
            }

            if (!lang.fileUrl || typeof lang.fileUrl !== 'string') {
                return errorResponse(`File URL for ${lang.lang} is required`, 400);
            }
        }

        // Check for duplicate languages
        const langCodes = languages.map((l: any) => l.lang);
        const uniqueLangs = new Set(langCodes);
        if (langCodes.length !== uniqueLangs.size) {
            return errorResponse('Duplicate language variants are not allowed', 400);
        }

        return await withDB(async () => {
            // Calculate base price (minimum price for backward compatibility)
            const minPrice = Math.min(...languages.map((l: any) => l.price));

            const product = await Product.create({
                titleAr,
                titleEn,
                descriptionAr,
                descriptionEn,
                title: titleAr, // For backward compatibility
                description: descriptionAr, // For backward compatibility
                price: minPrice, // For backward compatibility
                category,
                subcategory,
                image,
                media: media || [], // Media gallery (images/videos)
                languages,
                status: status || 'active',
                isNewArrival: isNewArrival || false,
            });

            return successResponse(product, 'Product created successfully', 201);
        });
    } catch (error) {
        return handleError(error);
    }
}
