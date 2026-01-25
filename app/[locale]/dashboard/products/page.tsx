"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Edit, Trash2, Loader2, Upload, X, FileText, Check, Package, Video, Image as ImageIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { R2Image } from "@/components/ui/r2-image";
import { MediaGalleryManager } from "@/components/dashboard/media-gallery-manager";
import type { IProductMedia } from "@/lib/types/models";

interface LanguageVariant {
    lang: 'ar' | 'en';
    price: number;
    fileUrl: string;
}

interface Product {
    _id: string;
    title: string;
    description: string;
    price: number;
    category: string;
    subcategory?: string;
    image: string;
    media?: IProductMedia[];
    languages: LanguageVariant[];
    status: string;
}

interface LanguageFormData {
    enabled: boolean;
    price: string;
    fileUrl: string;
    fileName: string;
    uploading: boolean;
}

interface ProductFormData {
    title: string;
    description: string;
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

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [imageUploading, setImageUploading] = useState(false);

    const [formData, setFormData] = useState<ProductFormData>({
        title: "",
        description: "",
        category: "ai-games",
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

    const categories = [
        { value: "ai-games", label: "ألعاب الذكاء الاصطناعي" },
        { value: "guidance", label: "الإرشاد المهني" },
        { value: "general", label: "عام" },
        { value: "stories", label: "قصص" },
    ];

    const countries = [
        { value: "", label: "اختر الدولة (اختياري)" },
        { value: "omani", label: "عماني" },
        { value: "saudi", label: "سعودي" },
        { value: "emirati", label: "إماراتي" },
        { value: "qatari", label: "قطري" },
        { value: "bahraini", label: "بحريني" },
        { value: "kuwaiti", label: "كويتي" },
    ];

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/products');
            const data = await response.json();

            if (data.success) {
                setProducts(data.data.products);
            } else {
                toast.error('فشل في تحميل المنتجات');
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            toast.error('حدث خطأ أثناء تحميل المنتجات');
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('الرجاء اختيار صورة');
            return;
        }

        try {
            setImageUploading(true);
            const formDataToSend = new FormData();
            formDataToSend.append('file', file);

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formDataToSend,
            });

            const data = await response.json();

            if (data.success) {
                setFormData(prev => ({ ...prev, image: data.data.url }));
                toast.success('تم رفع الصورة بنجاح');
            } else {
                toast.error(data.error || 'فشل في رفع الصورة');
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            toast.error('حدث خطأ أثناء رفع الصورة');
        } finally {
            setImageUploading(false);
        }
    };

    const handleFileUpload = async (lang: 'ar' | 'en', e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        const validTypes = [
            'application/pdf',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation'
        ];

        if (!validTypes.includes(file.type)) {
            toast.error('الرجاء اختيار ملف PDF أو PPT/PPTX');
            return;
        }

        try {
            // Set uploading state
            console.log(`Starting upload for ${lang} language, size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
            setFormData(prev => ({
                ...prev,
                languages: {
                    ...prev.languages,
                    [lang]: { ...prev.languages[lang], uploading: true }
                }
            }));

            // Use presigned URL for files > 50MB to avoid timeout/memory issues
            const LARGE_FILE_THRESHOLD = 50 * 1024 * 1024; // 50MB
            const isLargeFile = file.size > LARGE_FILE_THRESHOLD;

            if (isLargeFile) {
                console.log(`Using presigned URL upload for large file (${(file.size / 1024 / 1024).toFixed(2)}MB)`);

                // Step 1: Get presigned URL
                const presignedResponse = await fetch('/api/upload-file/presigned', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        fileName: file.name,
                        fileType: file.type,
                        fileSize: file.size,
                    }),
                });

                const presignedData = await presignedResponse.json();

                if (!presignedData.success) {
                    throw new Error(presignedData.error || 'Failed to generate upload URL');
                }

                const { uploadUrl, key } = presignedData.data;

                // Step 2: Upload directly to R2 using presigned PUT URL (simpler, more CORS-friendly)
                console.log('Uploading directly to R2...');
                const uploadResponse = await fetch(uploadUrl, {
                    method: 'PUT',
                    body: file,
                    headers: {
                        'Content-Type': file.type,
                    },
                });

                if (!uploadResponse.ok) {
                    const errorText = await uploadResponse.text().catch(() => 'Unknown error');
                    throw new Error(`R2 upload failed: ${uploadResponse.status} - ${errorText}`);
                }

                console.log(`✅ File uploaded successfully to R2, key: ${key}`);

                // Update form with the key
                setFormData(prev => ({
                    ...prev,
                    languages: {
                        ...prev.languages,
                        [lang]: {
                            ...prev.languages[lang],
                            fileUrl: key,
                            fileName: file.name,
                            uploading: false
                        }
                    }
                }));
                toast.success(`تم رفع ملف ${lang === 'ar' ? 'العربي' : 'الإنجليزي'} بنجاح (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
            } else {
                // Use direct upload for small files
                console.log(`Using direct upload for small file (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
                const formDataToSend = new FormData();
                formDataToSend.append('file', file);

                const response = await fetch('/api/upload-file', {
                    method: 'POST',
                    body: formDataToSend,
                });

                const data = await response.json();

                if (data.success) {
                    console.log(`File uploaded successfully for ${lang}:`, data.data.url);
                    setFormData(prev => ({
                        ...prev,
                        languages: {
                            ...prev.languages,
                            [lang]: {
                                ...prev.languages[lang],
                                fileUrl: data.data.url,
                                fileName: file.name,
                                uploading: false
                            }
                        }
                    }));
                    toast.success(`تم رفع ملف ${lang === 'ar' ? 'العربي' : 'الإنجليزي'} بنجاح`);
                } else {
                    throw new Error(data.error || 'Upload failed');
                }
            }
        } catch (error) {
            console.error(`Error uploading file for ${lang}:`, error);
            toast.error(error instanceof Error ? error.message : 'حدث خطأ أثناء رفع الملف');
            setFormData(prev => ({
                ...prev,
                languages: {
                    ...prev.languages,
                    [lang]: { ...prev.languages[lang], uploading: false }
                }
            }));
        }
    };

    const handleOpenDialog = (product?: Product) => {
        if (product) {
            // Editing existing product
            setEditingProduct(product);
            const languages = product.languages || [];
            setFormData({
                title: product.title,
                description: product.description,
                category: product.category,
                subcategory: product.subcategory || "",
                image: product.image,
                status: product.status,
                media: product.media || [],
                languages: {
                    ar: {
                        enabled: languages.some(l => l.lang === 'ar'),
                        price: languages.find(l => l.lang === 'ar')?.price.toString() || "",
                        fileUrl: languages.find(l => l.lang === 'ar')?.fileUrl || "",
                        fileName: languages.find(l => l.lang === 'ar')?.fileUrl ?
                            languages.find(l => l.lang === 'ar')?.fileUrl.split('/').pop() || "" : "",
                        uploading: false
                    },
                    en: {
                        enabled: languages.some(l => l.lang === 'en'),
                        price: languages.find(l => l.lang === 'en')?.price.toString() || "",
                        fileUrl: languages.find(l => l.lang === 'en')?.fileUrl || "",
                        fileName: languages.find(l => l.lang === 'en')?.fileUrl ?
                            languages.find(l => l.lang === 'en')?.fileUrl.split('/').pop() || "" : "",
                        uploading: false
                    }
                }
            });
        } else {
            // Creating new product - default Arabic enabled
            setEditingProduct(null);
            setFormData({
                title: "",
                description: "",
                category: "ai-games",
                subcategory: "",
                image: "",
                status: "active",
                media: [],
                languages: {
                    ar: { enabled: true, price: "", fileUrl: "", fileName: "", uploading: false },
                    en: { enabled: false, price: "", fileUrl: "", fileName: "", uploading: false }
                }
            });
        }
        setIsDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.title.trim()) {
            toast.error('الرجاء إدخال عنوان المنتج');
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
                title: formData.title,
                description: formData.description,
                category: formData.category,
                subcategory: formData.subcategory || undefined,
                image: formData.image,
                media: formData.media,
                languages,
                status: formData.status,
            };

            const url = editingProduct
                ? `/api/products/${editingProduct._id}`
                : '/api/products';

            const method = editingProduct ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(productData),
            });

            const data = await response.json();

            if (data.success) {
                toast.success(editingProduct ? 'تم تحديث المنتج بنجاح' : 'تم إضافة المنتج بنجاح');
                setIsDialogOpen(false);
                fetchProducts();
            } else {
                toast.error(data.error || 'حدث خطأ');
            }
        } catch (error) {
            console.error('Error submitting product:', error);
            toast.error('حدث خطأ أثناء حفظ المنتج');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!deletingProduct) return;

        try {
            const response = await fetch(`/api/products/${deletingProduct._id}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (data.success) {
                toast.success('تم حذف المنتج بنجاح');
                setIsDeleteDialogOpen(false);
                setDeletingProduct(null);
                fetchProducts();
            } else {
                toast.error(data.error || 'فشل في حذف المنتج');
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            toast.error('حدث خطأ أثناء حذف المنتج');
        }
    };

    const filteredProducts = products.filter(product =>
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">المنتجات</h1>
                    <p className="text-muted-foreground mt-2">إدارة جميع المنتجات والملفات الرقمية</p>
                </div>
                <Button onClick={() => handleOpenDialog()} className="gap-2">
                    <Plus className="w-4 h-4" />
                    إضافة منتج جديد
                </Button>
            </div>

            <Card className="border-border/50 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <CardTitle className="text-xl font-bold">قائمة المنتجات ({filteredProducts.length})</CardTitle>
                    <div className="relative w-full md:w-64">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="بحث..."
                            className="pr-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <div className="rounded-xl border border-border overflow-hidden">
                            <table className="w-full text-sm text-right">
                                <thead className="bg-secondary/50 text-muted-foreground font-medium">
                                    <tr>
                                        <th className="p-4">صورة</th>
                                        <th className="p-4">العنوان</th>
                                        <th className="p-4">التصنيف</th>
                                        <th className="p-4">اللغات المتاحة</th>
                                        <th className="p-4">الحالة</th>
                                        <th className="p-4 text-left">إجراءات</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {filteredProducts.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="p-8 text-center text-muted-foreground">
                                                لا توجد منتجات
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredProducts.map((product) => (
                                            <tr key={product._id} className="hover:bg-secondary/20 transition-colors">
                                                <td className="p-4">
                                                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-secondary/30">
                                                        <R2Image
                                                            r2Key={product.image}
                                                            alt={product.title}
                                                            className="w-full h-full object-cover"
                                                            fallback={
                                                                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                                                    <FileText className="w-6 h-6" />
                                                                </div>
                                                            }
                                                        />
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div>
                                                        <p className="font-medium">{product.title}</p>
                                                        <p className="text-xs text-muted-foreground line-clamp-1">{product.description}</p>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <span className="text-sm">
                                                        {categories.find(c => c.value === product.category)?.label}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex flex-col gap-1">
                                                        {product.languages && product.languages.length > 0 ? (
                                                            product.languages.map((lang) => (
                                                                <div key={lang.lang} className="flex items-center gap-2 text-xs">
                                                                    <span className="font-medium">
                                                                        {lang.lang === 'ar' ? 'AR - عربي' : 'EN - English'}
                                                                    </span>
                                                                    <span className="text-muted-foreground">
                                                                        {lang.price.toFixed(3)} ر.ع
                                                                    </span>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <span className="text-sm text-muted-foreground">
                                                                {product.price.toFixed(3)} ر.ع
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        product.status === 'active'
                                                            ? 'bg-emerald-500/10 text-emerald-500'
                                                            : 'bg-gray-500/10 text-gray-500'
                                                    }`}>
                                                        {product.status === 'active' ? 'نشط' : 'غير نشط'}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                                                            onClick={() => handleOpenDialog(product)}
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                            onClick={() => {
                                                                setDeletingProduct(product);
                                                                setIsDeleteDialogOpen(true);
                                                            }}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Product Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto">
                    <DialogHeader className="border-b pb-4 mb-6">
                        <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                            <Package className="w-6 h-6 text-primary" />
                            {editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}
                        </DialogTitle>
                        <p className="text-sm text-muted-foreground mt-2">
                            قم بإضافة جميع تفاصيل المنتج بما في ذلك الصور والفيديوهات
                        </p>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Section 1: Basic Information */}
                        <div className="bg-secondary/20 rounded-lg p-6 space-y-6">
                            <div className="flex items-center gap-2 text-lg font-semibold">
                                <FileText className="w-5 h-5 text-primary" />
                                <h3>المعلومات الأساسية</h3>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="title" className="text-base">عنوان المنتج *</Label>
                                    <Input
                                        id="title"
                                        value={formData.title}
                                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                        placeholder="مثال: لعبة الذكاء الاصطناعي"
                                        className="h-11"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="category" className="text-base">التصنيف *</Label>
                                    <select
                                        id="category"
                                        value={formData.category}
                                        onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                                        className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        required
                                    >
                                        {categories.map(cat => (
                                            <option key={cat.value} value={cat.value}>{cat.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description" className="text-base">الوصف *</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="وصف تفصيلي للمنتج..."
                                    rows={4}
                                    className="resize-none"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="subcategory" className="text-base">التصنيف الفرعي</Label>
                                    <select
                                        id="subcategory"
                                        value={formData.subcategory}
                                        onChange={(e) => setFormData(prev => ({ ...prev, subcategory: e.target.value }))}
                                        className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    >
                                        {countries.map(country => (
                                            <option key={country.value} value={country.value}>{country.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="status" className="text-base">الحالة</Label>
                                    <select
                                        id="status"
                                        value={formData.status}
                                        onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                                        className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    >
                                        <option value="active">نشط</option>
                                        <option value="inactive">غير نشط</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Product Images */}
                        <div className="bg-secondary/20 rounded-lg p-6 space-y-6">
                            <div className="flex items-center gap-2 text-lg font-semibold">
                                <ImageIcon className="w-5 h-5 text-primary" />
                                <h3>صورة الغلاف</h3>
                            </div>

                            <div className="space-y-4">
                                <Label className="text-base">صورة المنتج الرئيسية *</Label>
                                <p className="text-sm text-muted-foreground">
                                    هذه الصورة ستظهر كغلاف للمنتج في القائمة الرئيسية
                                </p>
                                <div className="flex flex-col md:flex-row items-start md:items-center gap-6 bg-background rounded-lg p-4 border-2 border-dashed">
                                    {formData.image ? (
                                        <div className="w-32 h-32 rounded-lg overflow-hidden border-2 border-primary">
                                            <R2Image
                                                r2Key={formData.image}
                                                alt="Preview"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-32 h-32 rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center bg-muted/30">
                                            <ImageIcon className="w-12 h-12 text-muted-foreground/50" />
                                        </div>
                                    )}
                                    <div className="flex-1 space-y-3">
                                        <label className="cursor-pointer">
                                            <div className="flex items-center justify-center gap-2 h-12 px-6 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium">
                                                {imageUploading ? (
                                                    <>
                                                        <Loader2 className="w-5 h-5 animate-spin" />
                                                        جاري الرفع...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Upload className="w-5 h-5" />
                                                        {formData.image ? 'تغيير الصورة' : 'رفع صورة الغلاف'}
                                                    </>
                                                )}
                                            </div>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                className="hidden"
                                                disabled={imageUploading}
                                            />
                                        </label>
                                        <p className="text-sm text-muted-foreground">
                                            JPG, PNG, WebP • حد أقصى 5MB • مقاس مقترح: 800x600px
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Media Gallery */}
                        <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg p-6 space-y-6 border-2 border-primary/20">
                            <div className="flex items-center gap-2 text-lg font-semibold">
                                <Video className="w-5 h-5 text-primary" />
                                <h3>معرض الوسائط (صور وفيديوهات)</h3>
                            </div>
                            <p className="text-sm text-muted-foreground -mt-2">
                                قم بإضافة صور وفيديوهات إضافية للمنتج. سيتمكن العملاء من تصفحها في صفحة المنتج
                            </p>
                            <MediaGalleryManager
                                media={formData.media}
                                onChange={(newMedia) => setFormData(prev => ({ ...prev, media: newMedia }))}
                            />
                        </div>

                        {/* Section 4: Language Variants & Files */}
                        <div className="bg-secondary/20 rounded-lg p-6 space-y-6">
                            <div className="flex items-center gap-2 text-lg font-semibold">
                                <FileText className="w-5 h-5 text-primary" />
                                <h3>النسخ اللغوية والملفات القابلة للتحميل</h3>
                            </div>
                            <p className="text-sm text-muted-foreground -mt-2">
                                قم بتحديد اللغات المتاحة للمنتج مع الأسعار والملفات المرفقة
                            </p>

                            {/* Arabic Version */}
                            <div className="p-5 rounded-lg border-2 border-border bg-background shadow-sm">
                                <div className="flex items-center gap-2 mb-4">
                                    <input
                                        type="checkbox"
                                        id="arabic-enabled"
                                        checked={formData.languages.ar.enabled}
                                        onChange={(e) =>
                                            setFormData(prev => ({
                                                ...prev,
                                                languages: {
                                                    ...prev.languages,
                                                    ar: { ...prev.languages.ar, enabled: e.target.checked }
                                                }
                                            }))
                                        }
                                        className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                                    />
                                    <Label htmlFor="arabic-enabled" className="text-base font-semibold cursor-pointer">
                                        AR - النسخة العربية
                                    </Label>
                                </div>

                                {formData.languages.ar.enabled && (
                                    <div className="space-y-3 mr-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="ar-price">السعر (ر.ع) *</Label>
                                            <Input
                                                id="ar-price"
                                                type="number"
                                                step="0.001"
                                                min="0"
                                                value={formData.languages.ar.price}
                                                onChange={(e) => setFormData(prev => ({
                                                    ...prev,
                                                    languages: {
                                                        ...prev.languages,
                                                        ar: { ...prev.languages.ar, price: e.target.value }
                                                    }
                                                }))}
                                                placeholder="2.500"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>الملف (PDF/PPT) *</Label>
                                            {formData.languages.ar.fileName && (
                                                <div className="flex items-center gap-2 p-2 bg-emerald-500/10 text-emerald-600 rounded-md text-sm">
                                                    <Check className="w-4 h-4" />
                                                    <span className="flex-1 truncate">{formData.languages.ar.fileName}</span>
                                                </div>
                                            )}
                                            <label className="cursor-pointer block">
                                                <div className="flex items-center justify-center gap-2 h-10 px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors">
                                                    {formData.languages.ar.uploading ? (
                                                        <>
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                            جاري الرفع...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Upload className="w-4 h-4" />
                                                            {formData.languages.ar.fileName ? 'تغيير الملف' : 'رفع الملف'}
                                                        </>
                                                    )}
                                                </div>
                                                <input
                                                    type="file"
                                                    accept=".pdf,.ppt,.pptx"
                                                    onChange={(e) => handleFileUpload('ar', e)}
                                                    className="hidden"
                                                    disabled={formData.languages.ar.uploading}
                                                />
                                            </label>
                                            <p className="text-xs text-muted-foreground">
                                                PDF, PPT, PPTX (حد أقصى 1GB)
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* English Version */}
                            <div className="p-4 rounded-lg border-2 border-border bg-secondary/5">
                                <div className="flex items-center gap-2 mb-4">
                                    <input
                                        type="checkbox"
                                        id="english-enabled"
                                        checked={formData.languages.en.enabled}
                                        onChange={(e) =>
                                            setFormData(prev => ({
                                                ...prev,
                                                languages: {
                                                    ...prev.languages,
                                                    en: { ...prev.languages.en, enabled: e.target.checked }
                                                }
                                            }))
                                        }
                                        className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                                    />
                                    <Label htmlFor="english-enabled" className="text-base font-semibold cursor-pointer">
                                        EN - English Version
                                    </Label>
                                </div>

                                {formData.languages.en.enabled && (
                                    <div className="space-y-3 mr-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="en-price">Price (OMR) *</Label>
                                            <Input
                                                id="en-price"
                                                type="number"
                                                step="0.001"
                                                min="0"
                                                value={formData.languages.en.price}
                                                onChange={(e) => setFormData(prev => ({
                                                    ...prev,
                                                    languages: {
                                                        ...prev.languages,
                                                        en: { ...prev.languages.en, price: e.target.value }
                                                    }
                                                }))}
                                                placeholder="3.000"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>File (PDF/PPT) *</Label>
                                            {formData.languages.en.fileName && (
                                                <div className="flex items-center gap-2 p-2 bg-emerald-500/10 text-emerald-600 rounded-md text-sm">
                                                    <Check className="w-4 h-4" />
                                                    <span className="flex-1 truncate">{formData.languages.en.fileName}</span>
                                                </div>
                                            )}
                                            <label className="cursor-pointer block">
                                                <div className="flex items-center justify-center gap-2 h-10 px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors">
                                                    {formData.languages.en.uploading ? (
                                                        <>
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                            Uploading...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Upload className="w-4 h-4" />
                                                            {formData.languages.en.fileName ? 'Change File' : 'Upload File'}
                                                        </>
                                                    )}
                                                </div>
                                                <input
                                                    type="file"
                                                    accept=".pdf,.ppt,.pptx"
                                                    onChange={(e) => handleFileUpload('en', e)}
                                                    className="hidden"
                                                    disabled={formData.languages.en.uploading}
                                                />
                                            </label>
                                            <p className="text-xs text-muted-foreground">
                                                PDF, PPT, PPTX (max 1GB)
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <DialogFooter className="sticky bottom-0 bg-background border-t pt-6 mt-8 flex gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsDialogOpen(false)}
                                className="h-12 px-8 text-base"
                                disabled={submitting}
                            >
                                <X className="w-5 h-5 mr-2" />
                                إلغاء
                            </Button>
                            <Button
                                type="submit"
                                disabled={submitting}
                                className="h-12 px-8 text-base flex-1"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin ml-2" />
                                        جاري الحفظ...
                                    </>
                                ) : (
                                    editingProduct ? 'تحديث المنتج' : 'إضافة المنتج'
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>تأكيد الحذف</DialogTitle>
                    </DialogHeader>
                    <p>هل أنت متأكد من حذف المنتج "{deletingProduct?.title}"؟</p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                            إلغاء
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            حذف
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
