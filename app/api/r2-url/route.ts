import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api-utils';
import { getSignedDownloadUrl } from '@/lib/r2';

// GET /api/r2-url?key=images/xxx.png - Get presigned download URL for R2 object
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const key = searchParams.get('key');

        if (!key) {
            return errorResponse('Missing key parameter', 400);
        }

        // Generate presigned URL (expires in 1 hour)
        const signedUrl = await getSignedDownloadUrl(key, 3600);

        return successResponse({
            url: signedUrl,
            key,
            expiresIn: 3600,
        }, 'Signed URL generated successfully');
    } catch (error) {
        console.error('Error generating signed URL:', error);
        return errorResponse('Failed to generate signed URL', 500);
    }
}
