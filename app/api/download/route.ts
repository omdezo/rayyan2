import { NextRequest, NextResponse } from 'next/server';
import { successResponse, errorResponse, handleError, getSession } from '@/lib/api-utils';
import { getSignedDownloadUrl } from '@/lib/r2';

// GET /api/download - Direct download with signed URL
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const fileUrl = searchParams.get('fileUrl');
        const productId = searchParams.get('productId');

        console.log('🔗 Download request:', { fileUrl, productId });

        // Get session
        const session = await getSession(req);
        if (!session || !session.user) {
            return errorResponse('Unauthorized. Please login to download.', 401);
        }

        if (!fileUrl) {
            return errorResponse('File URL is required', 400);
        }

        console.log('📥 Generating signed URL for:', fileUrl);

        // Generate signed URL (expires in 1 hour)
        const signedUrl = await getSignedDownloadUrl(fileUrl, 3600);

        console.log('✅ Signed URL generated, redirecting...');

        // Redirect to the signed URL for direct download
        return NextResponse.redirect(signedUrl);
    } catch (error) {
        console.error('❌ Download error:', error);
        return errorResponse('Failed to generate download URL', 500);
    }
}

// POST /api/download - Generate temporary download URL (for API use)
export async function POST(req: NextRequest) {
    try {
        console.log('🔗 Download URL request (POST)');

        // Get session
        const session = await getSession(req);
        if (!session) {
            return errorResponse('Unauthorized', 401);
        }

        const body = await req.json();
        const { fileKey, fileName } = body;

        if (!fileKey) {
            return errorResponse('File key is required', 400);
        }

        console.log('📥 Generating signed URL for:', fileKey, 'with filename:', fileName);

        // Generate signed URL with custom filename for Content-Disposition header (expires in 1 hour)
        const signedUrl = await getSignedDownloadUrl(fileKey, 3600, fileName);

        console.log('✅ Signed URL generated successfully');

        return successResponse({
            url: signedUrl,
            expiresIn: 3600,
            fileName: fileName,
        }, 'Download URL generated successfully');
    } catch (error) {
        console.error('❌ Download URL error:', error);
        return handleError(error);
    }
}
