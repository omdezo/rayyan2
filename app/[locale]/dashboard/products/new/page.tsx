"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { ArrowRight, Loader2, Upload, X, Check, Save, Languages, FileText, Image as ImageIcon, Tag, Eye, EyeOff } from "lucide-react";
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
    const [currentStep, setCurrentStep] = useState(1);

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
            ar: { enabled: false, price: "", fileUrl: "", fileName: "", uploading: false },
            en: { enabled: false, price: "", fileUrl: "", fileName: "", uploading: false }
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
                const formatted = data.data.map((s: any) => ({ value: s.key, label: s.nameAr }));
                setCategories(formatted);
                if (formatted.length > 0 && !formData.category) {
                    setFormData(prev => ({ ...prev, category: formatted[0].value }));
                }
            }
        } catch (error) {
            toast.error('حدث خطأ أثناء تحميل التصنيفات');
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !file.type.startsWith('image/')) {
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
                toast.success('تم رفع الصورة');
            } else {
                toast.error('فشل رفع الصورة');
            }
        } catch (error) {
            toast.error('حدث خطأ');
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
                languages: { ...prev.languages, [lang]: { ...prev.languages[lang], uploading: true } }
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
                        [lang]: { ...prev.languages[lang], fileUrl: data.data.key, fileName: file.name, uploading: false }
                    }
                }));
                toast.success('تم رفع الملف');
            } else {
                toast.error('فشل رفع الملف');
                setFormData(prev => ({
                    ...prev,
                    languages: { ...prev.languages, [lang]: { ...prev.languages[lang], uploading: false } }
                }));
            }
        } catch (error) {
            toast.error('حدث خطأ');
            setFormData(prev => ({
                ...prev,
                languages: { ...prev.languages, [lang]: { ...prev.languages[lang], uploading: false } }
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.titleAr.trim() || !formData.titleEn.trim()) {
            toast.error('الرجاء إدخال العنوان بكلا اللغتين');
            return;
        }
        if (!formData.descriptionAr.trim() || !formData.descriptionEn.trim()) {
            toast.error('الرجاء إدخال الوصف بكلا اللغتين');
            return;
        }
        if (!formData.image) {
            toast.error('الرجاء رفع صورة المنتج');
            return;
        }

        const languages = [];
        if (formData.languages.ar.enabled) {
            if (!formData.languages.ar.price || !formData.languages.ar.fileUrl) {
                toast.error('الرجاء إكمال بيانات النسخة العربية');
                return;
            }
            languages.push({ lang: 'ar', price: parseFloat(formData.languages.ar.price), fileUrl: formData.languages.ar.fileUrl });
        }
        if (formData.languages.en.enabled) {
            if (!formData.languages.en.price || !formData.languages.en.fileUrl) {
                toast.error('الرجاء إكمال بيانات النسخة الإنجليزية');
                return;
            }
            languages.push({ lang: 'en', price: parseFloat(formData.languages.en.price), fileUrl: formData.languages.en.fileUrl });
        }
        if (languages.length === 0) {
            toast.error('الرجاء تفعيل لغة واحدة على الأقل');
            return;
        }

        try {
            setSubmitting(true);
            const response = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
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
                }),
            });

            const data = await response.json();
            if (data.success) {
                toast.success('تم إنشاء المنتج بنجاح');
                router.push('/ar/dashboard/products');
            } else {
                toast.error(data.message || 'حدث خطأ');
            }
        } catch (error) {
            toast.error('حدث خطأ أثناء الحفظ');
        } finally {
            setSubmitting(false);
        }
    };

    const steps = [
        { id: 1, name: 'المعلومات الأساسية', icon: FileText },
        { id: 2, name: 'الصورة والتصنيف', icon: ImageIcon },
        { id: 3, name: 'الأسعار والملفات', icon: Tag },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
            <div className="max-w-5xl mx-auto p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.push('/ar/dashboard/products')}
                            className="p-2 hover:bg-secondary rounded-lg transition-colors"
                        >
                            <ArrowRight className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold">منتج جديد</h1>
                            <p className="text-sm text-muted-foreground">أضف منتج رقمي جديد للمتجر</p>
                        </div>
                    </div>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-center gap-2">
                    {steps.map((step, idx) => {
                        const Icon = step.icon;
                        const isActive = currentStep === step.id;
                        const isCompleted = currentStep > step.id;
                        return (
                            <div key={step.id} className="flex items-center">
                                <button
                                    onClick={() => setCurrentStep(step.id)}
                                    className={cn(
                                        "flex items-center gap-2 px-4 py-2 rounded-full transition-all",
                                        isActive && "bg-primary text-primary-foreground shadow-lg",
                                        isCompleted && "bg-green-500/10 text-green-600",
                                        !isActive && !isCompleted && "bg-secondary text-muted-foreground hover:bg-secondary/80"
                                    )}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span className="text-sm font-medium hidden sm:inline">{step.name}</span>
                                </button>
                                {idx < steps.length - 1 && (
                                    <div className={cn("w-8 h-0.5 mx-1", isCompleted ? "bg-green-500" : "bg-border")} />
                                )}
                            </div>
                        );
                    })}
                </div>

                <form onSubmit={handleSubmit}>
                    <Card className="p-8 border-0 shadow-xl">
                        {/* Step 1: Basic Info */}
                        {currentStep === 1 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div>
                                    <h2 className="text-xl font-semibold mb-1">المعلومات الأساسية</h2>
                                    <p className="text-sm text-muted-foreground">أدخل عنوان ووصف المنتج باللغتين</p>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label>العنوان بالعربية *</Label>
                                        <Input
                                            value={formData.titleAr}
                                            onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })}
                                            placeholder="مثال: قصة الأرنب الذكي"
                                            className="h-11"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>English Title *</Label>
                                        <Input
                                            value={formData.titleEn}
                                            onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                                            placeholder="Example: The Smart Rabbit Story"
                                            className="h-11"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>الوصف بالعربية *</Label>
                                    <Textarea
                                        value={formData.descriptionAr}
                                        onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                                        placeholder="اكتب وصف تفصيلي للمنتج..."
                                        rows={4}
                                        className="resize-none"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>English Description *</Label>
                                    <Textarea
                                        value={formData.descriptionEn}
                                        onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                                        placeholder="Write a detailed description..."
                                        rows={4}
                                        className="resize-none"
                                    />
                                </div>

                                <div className="flex justify-end">
                                    <Button type="button" onClick={() => setCurrentStep(2)} size="lg">
                                        التالي
                                        <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Image & Category */}
                        {currentStep === 2 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div>
                                    <h2 className="text-xl font-semibold mb-1">الصورة والتصنيف</h2>
                                    <p className="text-sm text-muted-foreground">اختر صورة المنتج وتصنيفه</p>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    {/* Image Upload */}
                                    <div className="space-y-3">
                                        <Label>صورة المنتج *</Label>
                                        <div className="relative aspect-square rounded-xl border-2 border-dashed border-border overflow-hidden bg-secondary/30 hover:border-primary/50 transition-colors group">
                                            {formData.image ? (
                                                <>
                                                    <R2Image r2Key={formData.image} alt="Product" className="w-full h-full object-cover" />
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, image: "" })}
                                                        className="absolute top-2 left-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </>
                                            ) : (
                                                <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer">
                                                    <Upload className="w-12 h-12 text-muted-foreground mb-2" />
                                                    <p className="text-sm text-muted-foreground">انقر لرفع الصورة</p>
                                                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                                                </label>
                                            )}
                                            {imageUploading && (
                                                <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                                                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Category */}
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>التصنيف *</Label>
                                            <select
                                                value={formData.category}
                                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                                className="w-full h-11 px-3 rounded-lg border border-border bg-background"
                                            >
                                                {categories.map((cat) => (
                                                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>التصنيف الفرعي</Label>
                                            <Input
                                                value={formData.subcategory}
                                                onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                                                placeholder="اختياري"
                                                className="h-11"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>الحالة</Label>
                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, status: 'active' })}
                                                    className={cn(
                                                        "flex-1 py-2.5 rounded-lg border-2 font-medium transition-all",
                                                        formData.status === 'active'
                                                            ? "border-green-500 bg-green-500/10 text-green-600"
                                                            : "border-border hover:border-green-500/30"
                                                    )}
                                                >
                                                    <Eye className="w-4 h-4 inline ml-1" />
                                                    نشط
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, status: 'inactive' })}
                                                    className={cn(
                                                        "flex-1 py-2.5 rounded-lg border-2 font-medium transition-all",
                                                        formData.status === 'inactive'
                                                            ? "border-gray-500 bg-gray-500/10 text-gray-600"
                                                            : "border-border hover:border-gray-500/30"
                                                    )}
                                                >
                                                    <EyeOff className="w-4 h-4 inline ml-1" />
                                                    معطل
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-between">
                                    <Button type="button" variant="outline" onClick={() => setCurrentStep(1)}>
                                        السابق
                                    </Button>
                                    <Button type="button" onClick={() => setCurrentStep(3)} size="lg">
                                        التالي
                                        <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Prices & Files */}
                        {currentStep === 3 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div>
                                    <h2 className="text-xl font-semibold mb-1">الأسعار والملفات</h2>
                                    <p className="text-sm text-muted-foreground">حدد الأسعار وارفع الملفات لكل لغة</p>
                                </div>

                                {/* Arabic Version */}
                                <div className={cn(
                                    "p-5 rounded-xl border-2 transition-all",
                                    formData.languages.ar.enabled ? "border-primary bg-primary/5" : "border-border bg-secondary/30"
                                )}>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                                                <span className="font-bold text-primary">AR</span>
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
                                                    languages: { ...formData.languages, ar: { ...formData.languages.ar, enabled: e.target.checked } }
                                                })}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                        </label>
                                    </div>

                                    {formData.languages.ar.enabled && (
                                        <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
                                            <div className="space-y-2">
                                                <Label>السعر (ر.ع)</Label>
                                                <Input
                                                    type="number"
                                                    step="0.001"
                                                    value={formData.languages.ar.price}
                                                    onChange={(e) => setFormData({
                                                        ...formData,
                                                        languages: { ...formData.languages, ar: { ...formData.languages.ar, price: e.target.value } }
                                                    })}
                                                    placeholder="0.000"
                                                    className="h-11"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>الملف</Label>
                                                <div className="relative">
                                                    <Input
                                                        type="file"
                                                        onChange={(e) => handleFileUpload(e, 'ar')}
                                                        className="h-11"
                                                    />
                                                    {formData.languages.ar.uploading && <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin" />}
                                                    {formData.languages.ar.fileUrl && <Check className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-600" />}
                                                </div>
                                                {formData.languages.ar.fileName && (
                                                    <p className="text-xs text-muted-foreground truncate">{formData.languages.ar.fileName}</p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* English Version */}
                                <div className={cn(
                                    "p-5 rounded-xl border-2 transition-all",
                                    formData.languages.en.enabled ? "border-primary bg-primary/5" : "border-border bg-secondary/30"
                                )}>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                                                <span className="font-bold text-blue-600">EN</span>
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
                                                    languages: { ...formData.languages, en: { ...formData.languages.en, enabled: e.target.checked } }
                                                })}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-blue-500/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                                        </label>
                                    </div>

                                    {formData.languages.en.enabled && (
                                        <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
                                            <div className="space-y-2">
                                                <Label>Price (OMR)</Label>
                                                <Input
                                                    type="number"
                                                    step="0.001"
                                                    value={formData.languages.en.price}
                                                    onChange={(e) => setFormData({
                                                        ...formData,
                                                        languages: { ...formData.languages, en: { ...formData.languages.en, price: e.target.value } }
                                                    })}
                                                    placeholder="0.000"
                                                    className="h-11"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>File</Label>
                                                <div className="relative">
                                                    <Input
                                                        type="file"
                                                        onChange={(e) => handleFileUpload(e, 'en')}
                                                        className="h-11"
                                                    />
                                                    {formData.languages.en.uploading && <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin" />}
                                                    {formData.languages.en.fileUrl && <Check className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-600" />}
                                                </div>
                                                {formData.languages.en.fileName && (
                                                    <p className="text-xs text-muted-foreground truncate">{formData.languages.en.fileName}</p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Media Gallery */}
                                <div className="p-5 rounded-xl border bg-secondary/30">
                                    <h3 className="font-semibold mb-3">معرض الوسائط (اختياري)</h3>
                                    <MediaGalleryManager
                                        media={formData.media}
                                        onChange={(media) => setFormData({ ...formData, media })}
                                    />
                                </div>

                                <div className="flex justify-between pt-4">
                                    <Button type="button" variant="outline" onClick={() => setCurrentStep(2)}>
                                        السابق
                                    </Button>
                                    <Button type="submit" disabled={submitting} size="lg" className="gap-2">
                                        {submitting ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                جاري الحفظ...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4" />
                                                حفظ المنتج
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </Card>
                </form>
            </div>
        </div>
    );
}
