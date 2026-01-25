"use client";

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface R2ImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
    r2Key: string | null | undefined;
    fallback?: React.ReactNode;
}

/**
 * R2Image component - Automatically converts R2 keys to presigned URLs
 *
 * Usage:
 * <R2Image r2Key="images/xxx.png" alt="Product" className="..." />
 */
export function R2Image({ r2Key, fallback, alt, className, ...props }: R2ImageProps) {
    const [signedUrl, setSignedUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!r2Key) {
            setLoading(false);
            setError(true);
            return;
        }

        // Check if it's already a full URL (Cloudinary or external)
        if (r2Key.startsWith('http://') || r2Key.startsWith('https://')) {
            setSignedUrl(r2Key);
            setLoading(false);
            return;
        }

        // Fetch presigned URL for R2 key
        const fetchSignedUrl = async () => {
            try {
                setLoading(true);
                setError(false);

                const response = await fetch(`/api/r2-url?key=${encodeURIComponent(r2Key)}`);
                const data = await response.json();

                if (data.success) {
                    setSignedUrl(data.data.url);
                } else {
                    console.error('Failed to get signed URL:', data.error);
                    setError(true);
                }
            } catch (err) {
                console.error('Error fetching signed URL:', err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchSignedUrl();
    }, [r2Key]);

    // Show loading state
    if (loading) {
        return (
            <div className={`flex items-center justify-center bg-secondary/30 ${className}`}>
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    // Show error or fallback
    if (error || !signedUrl) {
        if (fallback) {
            return <>{fallback}</>;
        }
        return (
            <div className={`flex items-center justify-center bg-secondary/30 text-muted-foreground ${className}`}>
                <span className="text-sm">Image not available</span>
            </div>
        );
    }

    // Show image
    return (
        <img
            src={signedUrl}
            alt={alt}
            className={className}
            {...props}
        />
    );
}
