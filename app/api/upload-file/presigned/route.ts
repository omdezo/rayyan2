import { NextRequest } from 'next/server';
import { successResponse, errorResponse, requireAdmin } from '@/lib/api-utils';
import { getPresignedUploadUrl } from '@/lib/r2';

// POST /api/upload-file/presigned - Generate presigned URL for direct client upload (admin only)
export async function POST(req: NextRequest) {
    console.log('🔑 Presigned URL API called');
    try {
        const { error: authError } = await requireAdmin(req);
        if (authError) {
            console.log('❌ Auth failed:', authError);
            return authError;
        }

        const body = await req.json();
        const { fileName, fileType, fileSize } = body;

        if (!fileName || !fileType || !fileSize) {
            return errorResponse('Missing required fields: fileName, fileType, fileSize', 400);
        }

        console.log('📄 Generating presigned URL for:', fileName, fileType, `${(fileSize / 1024 / 1024).toFixed(2)}MB`);

        // Validate file type (PDF, PPT, PPTX)
        const allowedTypes = [
            'application/pdf',
            'application/vnd.ms-powerpoint', // .ppt
            'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
        ];

        if (!allowedTypes.includes(fileType)) {
            return errorResponse('Invalid file type. Only PDF, PPT, and PPTX files are allowed', 400);
        }

        // Validate file size (1GB max for documents)
        const maxSize = 1 * 1024 * 1024 * 1024; // 1GB in bytes
        if (fileSize > maxSize) {
            return errorResponse('File size exceeds 1GB limit', 400);
        }

        // Generate presigned URL (using PUT method - simpler and more CORS-friendly)
        const result = await getPresignedUploadUrl(fileName, fileType, 'files');
        console.log('✅ Presigned URL generated, key:', result.key);

        return successResponse({
            uploadUrl: result.url,
            key: result.key,
        }, 'Presigned URL generated successfully');
    } catch (error) {
        console.error('❌ Presigned URL generation error:', error);
        return errorResponse('Failed to generate presigned URL', 500);
    }
}
