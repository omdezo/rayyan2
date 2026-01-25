import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Configure R2 Client
const r2Client = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
});

export interface R2UploadResult {
    key: string;
    size: number;
    type: string;
}

export const uploadToR2 = async (
    file: File,
    folder: string = 'products'
): Promise<R2UploadResult> => {
    try {
        // Convert file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Generate unique key
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        const fileExtension = file.name.split('.').pop();
        const key = `${folder}/${timestamp}-${randomString}.${fileExtension}`;

        // Upload to R2 (PRIVATE)
        const command = new PutObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME!,
            Key: key,
            Body: buffer,
            ContentType: file.type,
        });

        await r2Client.send(command);

        // Return only the key (no public URL)
        return {
            key: key,
            size: file.size,
            type: file.type,
        };
    } catch (error) {
        console.error('R2 upload error:', error);
        throw new Error('Failed to upload file to R2');
    }
};

// Generate a pre-signed URL for secure download (expires in 1 hour)
export const getSignedDownloadUrl = async (key: string, expiresIn: number = 3600): Promise<string> => {
    try {
        const command = new GetObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME!,
            Key: key,
        });

        const signedUrl = await getSignedUrl(r2Client, command, { expiresIn });
        return signedUrl;
    } catch (error) {
        console.error('Error generating signed URL:', error);
        throw new Error('Failed to generate download URL');
    }
};

export const deleteFromR2 = async (key: string): Promise<void> => {
    try {
        const command = new DeleteObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME!,
            Key: key,
        });

        await r2Client.send(command);
    } catch (error) {
        console.error('R2 delete error:', error);
        throw new Error('Failed to delete file from R2');
    }
};

// Generate presigned PUT URL for direct client-to-R2 uploads (best for large files)
// Using PUT is simpler and more reliable than POST with CORS
export const getPresignedUploadUrl = async (
    fileName: string,
    fileType: string,
    folder: string = 'files'
): Promise<{ url: string; key: string }> => {
    try {
        // Generate unique key
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        const fileExtension = fileName.split('.').pop();
        const key = `${folder}/${timestamp}-${randomString}.${fileExtension}`;

        // Create a PUT command
        const command = new PutObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME!,
            Key: key,
            ContentType: fileType,
        });

        // Generate presigned URL (expires in 1 hour)
        const url = await getSignedUrl(r2Client, command, {
            expiresIn: 3600,
        });

        return { url, key };
    } catch (error) {
        console.error('Error generating presigned upload URL:', error);
        throw new Error('Failed to generate upload URL');
    }
};

export default r2Client;
