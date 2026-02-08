import { NextRequest } from 'next/server';
import { successResponse, errorResponse, requireAdmin, withDB, handleError } from '@/lib/api-utils';
import Product from '@/lib/models/Product';

// GET /api/products/[id] - Fetch single product
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> } 
) {
    const { id } = await params; // ✅ Await params
    try {
        return await withDB(async () => {
            // ✅ Use 'id' (the string), NOT 'params.id' (the promise)
            const product = await Product.findById(id).lean();

            if (!product) {
                return errorResponse('Product not found', 404);
            }

            return successResponse(product);
        });
    } catch (error) {
        return handleError(error);
    }
}

// PUT /api/products/[id] - Update product (admin only)
export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const { error: authError } = await requireAdmin(req);
        if (authError) return authError;

        const body = await req.json();
        const { titleAr, titleEn, descriptionAr, descriptionEn, category, subcategory, image, media, languages, status, isNewArrival } = body;

        // Validation for bilingual fields
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

            const product = await Product.findByIdAndUpdate(
                id,
                {
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
                    status,
                    isNewArrival: isNewArrival !== undefined ? isNewArrival : false,
                    updatedAt: new Date(),
                },
                { new: true, runValidators: false }
            );

            if (!product) {
                return errorResponse('Product not found', 404);
            }

            return successResponse(product, 'Product updated successfully');
        });
    } catch (error) {
        return handleError(error);
    }
}

// DELETE /api/products/[id] - Delete product (admin only)
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> } // ✅ Updated Type
) {
    const { id } = await params; // ✅ Await params
    try {
        const { error: authError } = await requireAdmin(req);
        if (authError) return authError;

        return await withDB(async () => {
            // ✅ Use 'id'
            const product = await Product.findByIdAndDelete(id);

            if (!product) {
                return errorResponse('Product not found', 404);
            }

            return successResponse(null, 'Product deleted successfully');
        });
    } catch (error) {
        return handleError(error);
    }
}