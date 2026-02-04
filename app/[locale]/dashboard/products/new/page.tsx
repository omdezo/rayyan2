"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2, Upload, X, FileText, Check, Image as ImageIcon, Video, Globe, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { R2Image } from "@/components/ui/r2-image";
import { MediaGalleryManager } from "@/components/dashboard/media-gallery-manager";
import type { IProductMedia } from "@/lib/types/models";
import { cn } from "@/lib/utils";

interface LanguageFormData {
    enabled: boolean;
    price: string;
    fileUrl: string;
    fileName: string;
    uploading: boolean;
}

interface FormData {
    titleAr: string;
    titleEn: string;
    descriptionAr: string;
    descriptionEn: string;
    category: string;
    subcategory: string;
    image: string;
    status: string;
    media: IProductMedia[];
    languages: {
        ar: LanguageFormData;
        en: LanguageFormData;
    };
}

export default function NewProductPage() {
    const router = useRouter();
    const [categories, setCategories] = useState<Array<{value: string, label: string}>>([]);
    const [submitting, setSubmitting] = useState(false);
    const [imageUploading, setImageUploading] = useState(false);

    const [formData, setFormData] = useState<FormData>({
        titleAr: "",
        titleEn: "",
        descriptionAr: "",
        descriptionEn: "",
        category: "",
        subcategory: "",
        image: "",
        status: "active",
        media: [],
        languages: {
            ar: {
                enabled: false,
                price: "",
                fileUrl: "",
                fileName: "",
                uploading: false
            },
            en: {
                enabled: false,
                price: "",
                fileUrl: "",
                fileName: "",
                uploading: false
            }
        }
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await fetch('/api/sections?activeOnly=true');
            const data = await response.json();

            if (data.success) {
                const formattedCategories = data.data.map((section: any) => ({
                    value: section.key,
                    label: section.nameAr
                }));
                setCategories(formattedCategories);

                if (formattedCategories.length > 0 && !formData.category) {
                    setFormData(prev => ({ ...prev, category: formattedCategories[0].value }));
                }
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            toast.error('حدث خطأ أثناء تحميل التصنيفات');
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('الرجاء اختيار صورة');
            return;
        }

        try {
            setImageUploading(true);
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/upload-file/presigned', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (data.success) {
                setFormData(prev => ({ ...prev, image: data.data.key }));
                toast.success('تم رفع الصورة بنجاح');
            } else {
                toast.error(data.message || 'فشل رفع الصورة');
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            toast.error('حدث خطأ أثناء رفع الصورة');
        } finally {
            setImageUploading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, lang: 'ar' | 'en') => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setFormData(prev => ({
                ...prev,
                languages: {
                    ...prev.languages,
                    [lang]: { ...prev.languages[lang], uploading: true }
                }
            }));

            const uploadFormData = new FormData();
            uploadFormData.append('file', file);

            const response = await fetch('/api/upload-file/presigned', {
                method: 'POST',
                body: uploadFormData,
            });

            const data = await response.json();

            if (data.success) {
                setFormData(prev => ({
                    ...prev,
                    languages: {
                        ...prev.languages,
                        [lang]: {
                            ...prev.languages[lang],
                            fileUrl: data.data.key,
                            fileName: file.name,
                            uploading: false
                        }
                    }
                }));
                toast.success('تم رفع الملف بنجاح');
            } else {
                toast.error(data.message || 'فشل رفع الملف');
                setFormData(prev => ({
                    ...prev,
                    languages: {
                        ...prev.languages,
                        [lang]: { ...prev.languages[lang], uploading: false }
                    }
                }));
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            toast.error('حدث خطأ أثناء رفع الملف');
            setFormData(prev => ({
                ...prev,
                languages: {
                    ...prev.languages,
                    [lang]: { ...prev.languages[lang], uploading: false }
                }
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.titleAr.trim()) {
            toast.error('الرجاء إدخال عنوان المنتج بالعربية');
            return;
        }

        if (!formData.titleEn.trim()) {
            toast.error('الرجاء إدخال عنوان المنتج بالإنجليزية');
            return;
        }

        if (!formData.descriptionAr.trim()) {
            toast.error('الرجاء إدخال وصف المنتج بالعربية');
            return;
        }

        if (!formData.descriptionEn.trim()) {
            toast.error('الرجاء إدخال وصف المنتج بالإنجليزية');
            return;
        }

        if (!formData.image) {
            toast.error('الرجاء رفع صورة المنتج');
            return;
        }

        // Build languages array
        const languages = [];
        if (formData.languages.ar.enabled) {
            if (!formData.languages.ar.price || parseFloat(formData.languages.ar.price) <= 0) {
                toast.error('الرجاء إدخال سعر النسخة العربية');
                return;
            }
            if (!formData.languages.ar.fileUrl) {
                toast.error('الرجاء رفع ملف النسخة العربية');
                return;
            }
            languages.push({
                lang: 'ar',
                price: parseFloat(formData.languages.ar.price),
                fileUrl: formData.languages.ar.fileUrl
            });
        }

        if (formData.languages.en.enabled) {
            if (!formData.languages.en.price || parseFloat(formData.languages.en.price) <= 0) {
                toast.error('الرجاء إدخال سعر النسخة الإنجليزية');
                return;
            }
            if (!formData.languages.en.fileUrl) {
                toast.error('الرجاء رفع ملف النسخة الإنجليزية');
                return;
            }
            languages.push({
                lang: 'en',
                price: parseFloat(formData.languages.en.price),
                fileUrl: formData.languages.en.fileUrl
            });
        }

        if (languages.length === 0) {
            toast.error('الرجاء تفعيل لغة واحدة على الأقل');
            return;
        }

        try {
            setSubmitting(true);

            const productData = {
                titleAr: formData.titleAr,
                titleEn: formData.titleEn,
                descriptionAr: formData.descriptionAr,
                descriptionEn: formData.descriptionEn,
                title: formData.titleAr,
                description: formData.descriptionAr,
                category: formData.category,
                subcategory: formData.subcategory || undefined,
                image: formData.image,
                media: formData.media,
                languages,
                status: formData.status,
            };

            const response = await fetch('/api/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(productData),
            });

            const data = await response.json();

            if (data.success) {
                toast.success('تم إنشاء المنتج بنجاح');
                router.push('/ar/dashboard/products');
            } else {
                toast.error(data.message || 'حدث خطأ');
            }
        } catch (error) {
            console.error('Error creating product:', error);
            toast.error('حدث خطأ أثناء إنشاء المنتج');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.push('/ar/dashboard/products')}
                    className="shrink-0"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold">إضافة منتج جديد</h1>
                    <p className="text-muted-foreground mt-1">أدخل تفاصيل المنتج الجديد</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content - 2 columns */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Basic Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="w-5 h-5" />
                                    المعلومات الأساسية
                                </CardTitle>
                                <CardDescription>أدخل العنوان والوصف للمنتج</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Arabic Title */}
                                <div className="space-y-2">
                                    <Label htmlFor="titleAr">العنوان بالعربية *</Label>
                                    <Input
                                        id="titleAr"
                                        value={formData.titleAr}
                                        onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })}
                                        placeholder="أدخل عنوان المنتج بالعربية"
                                        required
                                        className="text-lg"
                                    />
                                </div>

                                {/* English Title */}
                                <div className="space-y-2">
                                    <Label htmlFor="titleEn">العنوان بالإنجليزية *</Label>
                                    <Input
                                        id="titleEn"
                                        value={formData.titleEn}
                                        onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                                        placeholder="Enter product title in English"
                                        required
                                        className="text-lg"
                                    />
                                </div>

                                {/* Arabic Description */}
                                <div className="space-y-2">
                                    <Label htmlFor="descriptionAr">الوصف بالعربية *</Label>
                                    <Textarea
                                        id="descriptionAr"
                                        value={formData.descriptionAr}
                                        onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                                        placeholder="أدخل وصف المنتج بالعربية"
                                        required
                                        rows={4}
                                    />
                                </div>

                                {/* English Description */}
                                <div className="space-y-2">
                                    <Label htmlFor="descriptionEn">الوصف بالإنجليزية *</Label>
                                    <Textarea
                                        id="descriptionEn"
                                        value={formData.descriptionEn}
                                        onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                                        placeholder="Enter product description in English"
                                        required
                                        rows={4}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Language Versions & Pricing */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Globe className="w-5 h-5" />
                                    النسخ اللغوية والأسعار
                                </CardTitle>
                                <CardDescription>حدد اللغات المتاحة وأسعارها</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Arabic Version */}
                                <div className="space-y-4 p-4 border border-border rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "w-10 h-10 rounded-full flex items-center justify-center font-bold",
                                                formData.languages.ar.enabled ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                                            )}>
                                                AR
                                            </div>
                                            <div>
                                                <h3 className="font-semibold">النسخة العربية</h3>
                                                <p className="text-xs text-muted-foreground">Arabic Version</p>
                                            </div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.languages.ar.enabled}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    languages: {
                                                        ...formData.languages,
                                                        ar: { ...formData.languages.ar, enabled: e.target.checked }
                                                    }
                                                })}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                        </label>
                                    </div>

                                    {formData.languages.ar.enabled && (
                                        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                                            <div className="space-y-2">
                                                <Label htmlFor="priceAr">السعر (ر.ع) *</Label>
                                                <div className="relative">
                                                    <DollarSign className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                    <Input
                                                        id="priceAr"
                                                        type="number"
                                                        step="0.001"
                                                        min="0"
                                                        value={formData.languages.ar.price}
                                                        onChange={(e) => setFormData({
                                                            ...formData,
                                                            languages: {
                                                                ...formData.languages,
                                                                ar: { ...formData.languages.ar, price: e.target.value }
                                                            }
                                                        })}
                                                        placeholder="0.000"
                                                        required={formData.languages.ar.enabled}
                                                        className="pr-10"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="fileAr">الملف *</Label>
                                                <div className="relative">
                                                    <Input
                                                        id="fileAr"
                                                        type="file"
                                                        onChange={(e) => handleFileUpload(e, 'ar')}
                                                        required={formData.languages.ar.enabled && !formData.languages.ar.fileUrl}
                                                        className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                                                    />
                                                    {formData.languages.ar.uploading && (
                                                        <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin" />
                                                    )}
                                                    {formData.languages.ar.fileUrl && (
                                                        <Check className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-600" />
                                                    )}
                                                </div>
                                                {formData.languages.ar.fileName && (
                                                    <p className="text-xs text-muted-foreground truncate">{formData.languages.ar.fileName}</p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* English Version */}
                                <div className="space-y-4 p-4 border border-border rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "w-10 h-10 rounded-full flex items-center justify-center font-bold",
                                                formData.languages.en.enabled ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                                            )}>
                                                EN
                                            </div>
                                            <div>
                                                <h3 className="font-semibold">النسخة الإنجليزية</h3>
                                                <p className="text-xs text-muted-foreground">English Version</p>
                                            </div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.languages.en.enabled}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    languages: {
                                                        ...formData.languages,
                                                        en: { ...formData.languages.en, enabled: e.target.checked }
                                                    }
                                                })}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                        </label>
                                    </div>

                                    {formData.languages.en.enabled && (
                                        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                                            <div className="space-y-2">
                                                <Label htmlFor="priceEn">السعر (ر.ع) *</Label>
                                                <div className="relative">
                                                    <DollarSign className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                    <Input
                                                        id="priceEn"
                                                        type="number"
                                                        step="0.001"
                                                        min="0"
                                                        value={formData.languages.en.price}
                                                        onChange={(e) => setFormData({
                                                            ...formData,
                                                            languages: {
                                                                ...formData.languages,
                                                                en: { ...formData.languages.en, price: e.target.value }
                                                            }
                                                        })}
                                                        placeholder="0.000"
                                                        required={formData.languages.en.enabled}
                                                        className="pr-10"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="fileEn">الملف *</Label>
                                                <div className="relative">
                                                    <Input
                                                        id="fileEn"
                                                        type="file"
                                                        onChange={(e) => handleFileUpload(e, 'en')}
                                                        required={formData.languages.en.enabled && !formData.languages.en.fileUrl}
                                                        className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                                                    />
                                                    {formData.languages.en.uploading && (
                                                        <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin" />
                                                    )}
                                                    {formData.languages.en.fileUrl && (
                                                        <Check className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-600" />
                                                    )}
                                                </div>
                                                {formData.languages.en.fileName && (
                                                    <p className="text-xs text-muted-foreground truncate">{formData.languages.en.fileName}</p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Media Gallery */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <ImageIcon className="w-5 h-5" />
                                    معرض الوسائط
                                </CardTitle>
                                <CardDescription>أضف صور وفيديوهات إضافية للمنتج</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <MediaGalleryManager
                                    media={formData.media}
                                    onChange={(media) => setFormData({ ...formData, media })}
                                />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar - 1 column */}
                    <div className="space-y-6">
                        {/* Product Image */}
                        <Card>
                            <CardHeader>
                                <CardTitle>صورة المنتج *</CardTitle>
                                <CardDescription>الصورة الرئيسية للمنتج</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="aspect-square rounded-lg border-2 border-dashed border-border overflow-hidden bg-secondary/20">
                                    {formData.image ? (
                                        <R2Image
                                            r2Key={formData.image}
                                            alt="Product"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                                            <ImageIcon className="w-12 h-12 mb-2" />
                                            <p className="text-sm">لا توجد صورة</p>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        disabled={imageUploading}
                                        className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                                    />
                                    {imageUploading && (
                                        <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            جاري الرفع...
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Category */}
                        <Card>
                            <CardHeader>
                                <CardTitle>التصنيف</CardTitle>
                                <CardDescription>حدد تصنيف المنتج</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="category">التصنيف الرئيسي *</Label>
                                    <select
                                        id="category"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                        required
                                    >
                                        {categories.map((cat) => (
                                            <option key={cat.value} value={cat.value}>
                                                {cat.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="subcategory">التصنيف الفرعي</Label>
                                    <Input
                                        id="subcategory"
                                        value={formData.subcategory}
                                        onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                                        placeholder="اختياري"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Status */}
                        <Card>
                            <CardHeader>
                                <CardTitle>حالة المنتج</CardTitle>
                                <CardDescription>حدد حالة نشر المنتج</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, status: 'active' })}
                                        className={cn(
                                            "p-4 rounded-lg border-2 text-center transition-all",
                                            formData.status === 'active'
                                                ? "border-green-500 bg-green-500/10 text-green-700 font-semibold"
                                                : "border-border hover:border-green-500/50"
                                        )}
                                    >
                                        <div className="text-2xl mb-1">✓</div>
                                        <div className="text-sm">نشط</div>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, status: 'inactive' })}
                                        className={cn(
                                            "p-4 rounded-lg border-2 text-center transition-all",
                                            formData.status === 'inactive'
                                                ? "border-gray-500 bg-gray-500/10 text-gray-700 font-semibold"
                                                : "border-border hover:border-gray-500/50"
                                        )}
                                    >
                                        <div className="text-2xl mb-1">○</div>
                                        <div className="text-sm">غير نشط</div>
                                    </button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Actions */}
                        <div className="sticky top-6 space-y-3">
                            <Button
                                type="submit"
                                disabled={submitting}
                                className="w-full h-12 text-lg"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                                        جاري الحفظ...
                                    </>
                                ) : (
                                    <>
                                        <Check className="w-5 h-5 ml-2" />
                                        حفظ المنتج
                                    </>
                                )}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.push('/ar/dashboard/products')}
                                className="w-full"
                            >
                                إلغاء
                            </Button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
