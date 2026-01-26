"use client";

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X, Play } from 'lucide-react';
import { R2Image } from '@/components/ui/r2-image';
import { Button } from '@/components/ui/button';
import type { IProductMedia } from '@/lib/types/models';

interface ProductMediaGalleryProps {
    media: IProductMedia[];
    coverImage: string; // Fallback to product primary image if no media
}

export function ProductMediaGallery({ media, coverImage }: ProductMediaGalleryProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [videoUrls, setVideoUrls] = useState<Record<string, string>>({});

    // Sort media by order
    const sortedMedia = [...media].sort((a, b) => a.order - b.order);

    // If no media, create a single image item from cover
    const displayMedia: IProductMedia[] = sortedMedia.length > 0
        ? sortedMedia
        : [{
            id: 'cover',
            type: 'image',
            url: coverImage,
            order: 0,
            caption: '',
        }];

    const currentMedia = displayMedia[currentIndex];

    // Fetch presigned URLs for videos
    useEffect(() => {
        const fetchVideoUrls = async () => {
            const urls: Record<string, string> = {};

            for (const item of displayMedia) {
                if (item.type === 'video') {
                    try {
                        const response = await fetch(`/api/r2-url?key=${encodeURIComponent(item.url)}`);
                        const data = await response.json();
                        if (data.success) {
                            urls[item.id] = data.data.url;
                        }
                    } catch (error) {
                        console.error('Failed to fetch video URL:', error);
                    }
                }
            }

            if (Object.keys(urls).length > 0) {
                setVideoUrls(urls);
            }
        };

        fetchVideoUrls();
    }, [media.length, coverImage]);

    const handlePrevious = () => {
        setCurrentIndex((prev) => (prev === 0 ? displayMedia.length - 1 : prev - 1));
    };

    const handleNext = () => {
        setCurrentIndex((prev) => (prev === displayMedia.length - 1 ? 0 : prev + 1));
    };

    const handleThumbnailClick = (index: number) => {
        setCurrentIndex(index);
    };

    return (
        <div className="space-y-4">
            {/* Main Viewer */}
            <div className="relative aspect-video bg-gradient-to-br from-secondary/30 to-secondary/10 rounded-2xl overflow-hidden shadow-lg">
                {currentMedia.type === 'image' ? (
                    <R2Image
                        r2Key={currentMedia.url}
                        alt={currentMedia.caption || 'Product image'}
                        className="w-full h-full object-contain"
                        fallback={
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                <span className="text-2xl">🖼️</span>
                            </div>
                        }
                    />
                ) : (
                    <div className="w-full h-full bg-black flex items-center justify-center">
                        {videoUrls[currentMedia.id] ? (
                            <video
                                src={videoUrls[currentMedia.id]}
                                controls
                                className="w-full h-full"
                                poster={currentMedia.thumbnail}
                            >
                                Your browser does not support the video tag.
                            </video>
                        ) : (
                            <div className="text-white flex flex-col items-center gap-2">
                                <Play className="w-12 h-12" />
                                <span>Loading video...</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Navigation Arrows (only if multiple media) */}
                {displayMedia.length > 1 && (
                    <>
                        <button
                            onClick={handlePrevious}
                            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                            aria-label="Previous"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>
                        <button
                            onClick={handleNext}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                            aria-label="Next"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                    </>
                )}

                {/* Media Type Badge */}
                {currentMedia.type === 'video' && (
                    <div className="absolute top-4 right-4 px-3 py-1.5 bg-black/70 text-white text-sm rounded-full flex items-center gap-2">
                        <Play className="w-4 h-4" />
                        فيديو
                    </div>
                )}

                {/* Caption */}
                {currentMedia.caption && (
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent text-white text-sm">
                        {currentMedia.caption}
                    </div>
                )}

                {/* Fullscreen Button */}
                {currentMedia.type === 'image' && (
                    <button
                        onClick={() => setIsFullscreen(true)}
                        className="absolute top-4 left-4 px-3 py-1.5 bg-black/70 text-white text-sm rounded-full hover:bg-black/90 transition-colors"
                    >
                        عرض كامل
                    </button>
                )}
            </div>

            {/* Thumbnail Strip (only if multiple media) */}
            {displayMedia.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {displayMedia.map((item, index) => (
                        <button
                            key={item.id}
                            onClick={() => handleThumbnailClick(index)}
                            className={`relative flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden transition-all shadow-md ${
                                index === currentIndex
                                    ? 'ring-3 ring-primary scale-105 shadow-lg'
                                    : 'hover:ring-2 hover:ring-primary/40 hover:scale-105 opacity-70 hover:opacity-100'
                            }`}
                        >
                            {item.type === 'image' ? (
                                <R2Image
                                    r2Key={item.url}
                                    alt={`Thumbnail ${index + 1}`}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-secondary/50 flex items-center justify-center">
                                    <Play className="w-6 h-6 text-muted-foreground" />
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            )}

            {/* Fullscreen Modal (Images Only) */}
            {isFullscreen && currentMedia.type === 'image' && (
                <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
                    <button
                        onClick={() => setIsFullscreen(false)}
                        className="absolute top-4 right-4 p-2 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    <R2Image
                        r2Key={currentMedia.url}
                        alt={currentMedia.caption || 'Product image'}
                        className="max-w-full max-h-full object-contain"
                    />

                    {/* Navigation in fullscreen */}
                    {displayMedia.length > 1 && (
                        <>
                            <button
                                onClick={handlePrevious}
                                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors"
                            >
                                <ChevronRight className="w-8 h-8" />
                            </button>
                            <button
                                onClick={handleNext}
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors"
                            >
                                <ChevronLeft className="w-8 h-8" />
                            </button>
                        </>
                    )}

                    {/* Caption in fullscreen */}
                    {currentMedia.caption && (
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 bg-black/70 text-white rounded-lg max-w-2xl text-center">
                            {currentMedia.caption}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
