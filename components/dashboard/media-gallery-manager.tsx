"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, X, Loader2, Image as ImageIcon, Video, GripVertical } from "lucide-react";
import { R2Image } from "@/components/ui/r2-image";
import { toast } from "sonner";
import type { IProductMedia } from "@/lib/types/models";

interface MediaGalleryManagerProps {
    media: IProductMedia[];
    onChange: (media: IProductMedia[]) => void;
}

export function MediaGalleryManager({ media, onChange }: MediaGalleryManagerProps) {
    const [uploading, setUploading] = useState(false);
    const [editingCaption, setEditingCaption] = useState<string | null>(null);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);

        try {
            const newMedia: IProductMedia[] = [];

            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const isVideo = file.type.startsWith('video/');
                const isImage = file.type.startsWith('image/');

                if (!isVideo && !isImage) {
                    toast.error(`${file.name}: Invalid file type. Only images and videos are allowed.`);
                    continue;
                }

                // Use presigned URL upload for large files
                const LARGE_FILE_THRESHOLD = 50 * 1024 * 1024; // 50MB
                const isLargeFile = file.size > LARGE_FILE_THRESHOLD;

                let key: string;

                if (isLargeFile || isVideo) {
                    // Use presigned URL for large files and videos
                    const presignedResponse = await fetch(
                        isVideo ? '/api/upload-video/presigned' : '/api/upload-file/presigned',
                        {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                fileName: file.name,
                                fileType: file.type,
                                fileSize: file.size,
                            }),
                        }
                    );

                    const presignedData = await presignedResponse.json();

                    if (!presignedData.success) {
                        throw new Error(presignedData.error || 'Failed to generate upload URL');
                    }

                    const { uploadUrl, key: uploadKey } = presignedData.data;

                    // Upload directly to R2
                    const uploadResponse = await fetch(uploadUrl, {
                        method: 'PUT',
                        body: file,
                        headers: {
                            'Content-Type': file.type,
                        },
                    });

                    if (!uploadResponse.ok) {
                        throw new Error(`Upload failed: ${uploadResponse.status}`);
                    }

                    key = uploadKey;
                } else {
                    // Use direct upload for small images
                    const formData = new FormData();
                    formData.append('file', file);

                    const response = await fetch('/api/upload', {
                        method: 'POST',
                        body: formData,
                    });

                    const data = await response.json();

                    if (!data.success) {
                        throw new Error(data.error || 'Upload failed');
                    }

                    key = data.data.url;
                }

                // Generate unique ID
                const id = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;

                // Add to media array
                newMedia.push({
                    id,
                    type: isVideo ? 'video' : 'image',
                    url: key,
                    order: media.length + newMedia.length,
                    caption: '',
                });
            }

            onChange([...media, ...newMedia]);
            toast.success(`${newMedia.length} file(s) uploaded successfully`);

            // Clear input
            e.target.value = '';
        } catch (error) {
            console.error('Upload error:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to upload files');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = (id: string) => {
        const updatedMedia = media.filter(item => item.id !== id);
        // Re-order remaining items
        updatedMedia.forEach((item, index) => {
            item.order = index;
        });
        onChange(updatedMedia);
        toast.success('Media deleted');
    };

    const handleMoveUp = (index: number) => {
        if (index === 0) return;
        const newMedia = [...media];
        [newMedia[index - 1], newMedia[index]] = [newMedia[index], newMedia[index - 1]];
        // Update order
        newMedia.forEach((item, i) => {
            item.order = i;
        });
        onChange(newMedia);
    };

    const handleMoveDown = (index: number) => {
        if (index === media.length - 1) return;
        const newMedia = [...media];
        [newMedia[index], newMedia[index + 1]] = [newMedia[index + 1], newMedia[index]];
        // Update order
        newMedia.forEach((item, i) => {
            item.order = i;
        });
        onChange(newMedia);
    };

    const handleCaptionChange = (id: string, caption: string) => {
        const updatedMedia = media.map(item =>
            item.id === id ? { ...item, caption } : item
        );
        onChange(updatedMedia);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">معرض الوسائط (صور وفيديوهات)</Label>
                <label className="cursor-pointer">
                    <div className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                        {uploading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                جاري الرفع...
                            </>
                        ) : (
                            <>
                                <Upload className="w-4 h-4" />
                                إضافة ملفات
                            </>
                        )}
                    </div>
                    <input
                        type="file"
                        accept="image/*,video/*"
                        multiple
                        onChange={handleFileUpload}
                        className="hidden"
                        disabled={uploading}
                    />
                </label>
            </div>

            <p className="text-sm text-muted-foreground">
                يمكنك رفع صور وفيديوهات. الفيديوهات الكبيرة (أكثر من 50MB) سيتم رفعها مباشرة إلى التخزين السحابي.
            </p>

            {/* Media Grid */}
            {media.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {media
                        .sort((a, b) => a.order - b.order)
                        .map((item, index) => (
                            <div key={item.id} className="border rounded-lg overflow-hidden bg-card">
                                {/* Media Preview */}
                                <div className="relative aspect-video bg-secondary/30">
                                    {item.type === 'image' ? (
                                        <R2Image
                                            r2Key={item.url}
                                            alt={item.caption || 'Product media'}
                                            className="w-full h-full object-cover"
                                            fallback={
                                                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                                    <ImageIcon className="w-12 h-12" />
                                                </div>
                                            }
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-secondary/50">
                                            <Video className="w-12 h-12 text-muted-foreground" />
                                            <span className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 text-white text-xs rounded">
                                                فيديو
                                            </span>
                                        </div>
                                    )}

                                    {/* Delete Button */}
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="absolute top-2 right-2 p-1.5 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>

                                    {/* Order Badge */}
                                    <div className="absolute top-2 left-2 px-2 py-1 bg-black/70 text-white text-xs rounded">
                                        #{index + 1}
                                    </div>
                                </div>

                                {/* Media Controls */}
                                <div className="p-3 space-y-2">
                                    {/* Reorder Buttons */}
                                    <div className="flex items-center gap-2">
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleMoveUp(index)}
                                            disabled={index === 0}
                                            className="flex-1"
                                        >
                                            ↑ تحريك لأعلى
                                        </Button>
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleMoveDown(index)}
                                            disabled={index === media.length - 1}
                                            className="flex-1"
                                        >
                                            تحريك لأسفل ↓
                                        </Button>
                                    </div>

                                    {/* Caption Input */}
                                    <div className="space-y-1">
                                        <Label className="text-xs">وصف (اختياري)</Label>
                                        <Input
                                            placeholder="أضف وصف للصورة/الفيديو"
                                            value={item.caption || ''}
                                            onChange={(e) => handleCaptionChange(item.id, e.target.value)}
                                            className="text-sm"
                                        />
                                    </div>

                                    {/* Media Type Badge */}
                                    <div className="text-xs text-muted-foreground">
                                        {item.type === 'image' ? '📷 صورة' : '🎬 فيديو'}
                                    </div>
                                </div>
                            </div>
                        ))}
                </div>
            ) : (
                <div className="border-2 border-dashed rounded-lg p-12 text-center">
                    <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">لا توجد وسائط بعد</p>
                    <p className="text-sm text-muted-foreground mt-1">
                        اضغط على "إضافة ملفات" لرفع صور أو فيديوهات
                    </p>
                </div>
            )}
        </div>
    );
}
