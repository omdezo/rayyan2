import { NextRequest } from 'next/server';
import { successResponse, errorResponse, requireAdmin } from '@/lib/api-utils';
import { getPresignedUploadUrl } from '@/lib/r2';

// POST /api/upload-video/presigned - Generate presigned URL for video upload (admin only)
export async function POST(req: NextRequest) {
    console.log('🎬 Presigned video URL API called');
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

        console.log('🎬 Generating presigned URL for:', fileName, fileType, `${(fileSize / 1024 / 1024).toFixed(2)}MB`);

        // Validate file type (common video formats)
        const allowedTypes = [
            'video/mp4',
            'video/webm',
            'video/ogg',
            'video/quicktime', // .mov
            'video/x-msvideo', // .avi
            'video/x-matroska', // .mkv
        ];

        if (!allowedTypes.includes(fileType)) {
            return errorResponse('Invalid file type. Only MP4, WebM, OGG, MOV, AVI, and MKV videos are allowed', 400);
        }

        // Validate file size (2GB max for videos)
        const maxSize = 2 * 1024 * 1024 * 1024; // 2GB in bytes
        if (fileSize > maxSize) {
            return errorResponse('File size exceeds 2GB limit', 400);
        }

        // Generate presigned URL
        const result = await getPresignedUploadUrl(fileName, fileType, 'videos');
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
