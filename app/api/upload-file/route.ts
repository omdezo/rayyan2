import { NextRequest } from 'next/server';
import { successResponse, errorResponse, requireAdmin, handleError } from '@/lib/api-utils';
import { uploadToR2 } from '@/lib/r2';

// Increase max duration to 5 minutes for large file uploads
export const maxDuration = 300; // 5 minutes

// POST /api/upload-file - Upload PDF/PPT files to R2 (admin only)
// ⚠️ WARNING: This route loads entire file into memory. For files > 50MB,
// use /api/upload-file/presigned for direct client-to-R2 uploads instead!
export async function POST(req: NextRequest) {
    console.log('📁 Upload file API called');
    try {
        const { error: authError } = await requireAdmin(req);
        if (authError) {
            console.log('❌ Auth failed:', authError);
            return authError;
        }

        console.log('✅ Auth passed, parsing form data...');
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            console.log('❌ No file in request');
            return errorResponse('No file provided', 400);
        }

        console.log('📄 File received:', file.name, file.type, `${(file.size / 1024 / 1024).toFixed(2)}MB`);

        // Validate file type (PDF, PPT, PPTX)
        const allowedTypes = [
            'application/pdf',
            'application/vnd.ms-powerpoint', // .ppt
            'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
        ];

        if (!allowedTypes.includes(file.type)) {
            return errorResponse('Invalid file type. Only PDF, PPT, and PPTX files are allowed', 400);
        }

        // Validate file size (1GB max for documents)
        const maxSize = 1 * 1024 * 1024 * 1024; // 1GB in bytes
        if (file.size > maxSize) {
            return errorResponse('File size exceeds 1GB limit', 400);
        }

        // Upload to R2
        console.log('☁️ Uploading to R2...');
        const result = await uploadToR2(file, 'files');
        console.log('✅ Upload successful, key:', result.key);

        return successResponse({
            url: result.key, // Frontend expects 'url' field, we pass the key
            key: result.key,
            size: result.size,
            type: result.type,
        }, 'File uploaded successfully');
    } catch (error) {
        console.error('❌ Upload error:', error);
        return handleError(error);
    }
}
