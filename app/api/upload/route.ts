import { NextRequest } from 'next/server';
import { successResponse, errorResponse, requireAdmin, handleError } from '@/lib/api-utils';
import { uploadToR2 } from '@/lib/r2';

// POST /api/upload - Upload image to R2 (admin only)
export async function POST(req: NextRequest) {
    try {
        console.log('🖼️ Image upload API called');
        const { error: authError } = await requireAdmin(req);
        if (authError) {
            console.log('❌ Auth failed');
            return authError;
        }

        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            console.log('❌ No file provided');
            return errorResponse('No file provided', 400);
        }

        console.log('📷 Image received:', file.name, file.type, `${(file.size / 1024).toFixed(2)}KB`);

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            return errorResponse('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed', 400);
        }

        // Validate file size (5MB max)
        const maxSize = 5 * 1024 * 1024; // 5MB in bytes
        if (file.size > maxSize) {
            return errorResponse('File size exceeds 5MB limit', 400);
        }

        // Upload to R2
        console.log('☁️ Uploading to R2...');
        const result = await uploadToR2(file, 'images');

        console.log('✅ Upload successful, key:', result.key);
        return successResponse({
            url: result.key, // Frontend expects 'url' field, we pass the key
            key: result.key,
            size: result.size,
        }, 'Image uploaded successfully');
    } catch (error) {
        console.error('❌ Upload error:', error);
        return handleError(error);
    }
}
