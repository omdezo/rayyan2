"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    ArrowRight, Check, ShoppingCart, Loader2, Package,
    Star, Shield, Download, Clock, Share2, Home, ChevronRight as ChevronRightIcon,
    Award, Users, FileText, Zap
} from "lucide-react";
import { toast } from "sonner";
import { ProductMediaGallery } from "@/components/features/product-media-gallery";
import type { IProductMedia } from "@/lib/types/models";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

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
    status: string;
    languages: LanguageVariant[];
}

export default function ProductDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [selectedLanguages, setSelectedLanguages] = useState<{ ar: boolean; en: boolean }>({
        ar: false,
        en: false,
    });

    const productId = params.id as string;

    useEffect(() => {
        fetchProduct();
    }, [productId]);

    // Auto-select first available language when product loads
    useEffect(() => {
        if (product && product.languages && product.languages.length > 0) {
            const languages = getAvailableLanguages();

            // Auto-select first available language
            if (languages.ar && !selectedLanguages.ar && !selectedLanguages.en) {
                setSelectedLanguages(prev => ({ ...prev, ar: true }));
            } else if (!languages.ar && languages.en && !selectedLanguages.en) {
                setSelectedLanguages(prev => ({ ...prev, en: true }));
            }
        }
    }, [product]);

    const fetchProduct = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/products/${productId}`);
            const data = await response.json();

            if (data.success) {
                setProduct(data.data);
            } else {
                setNotFound(true);
                toast.error('المنتج غير موجود');
            }
        } catch (error) {
            console.error('Error fetching product:', error);
            toast.error('حدث خطأ أثناء تحميل المنتج');
            setNotFound(true);
        } finally {
            setLoading(false);
        }
    };

    const getAvailableLanguages = () => {
        if (!product || !product.languages || product.languages.length === 0) {
            return { ar: null, en: null };
        }

        const arVariant = product.languages.find(l => l.lang === 'ar');
        const enVariant = product.languages.find(l => l.lang === 'en');

        return { ar: arVariant || null, en: enVariant || null };
    };

    const calculateTotal = () => {
        const languages = getAvailableLanguages();
        let total = 0;

        if (selectedLanguages.ar && languages.ar) {
            total += languages.ar.price;
        }
        if (selectedLanguages.en && languages.en) {
            total += languages.en.price;
        }

        return total;
    };

    const getSelectedLanguagesData = () => {
        const languages = getAvailableLanguages();
        const selected = [];

        if (selectedLanguages.ar && languages.ar) {
            selected.push({ lang: 'ar', price: languages.ar.price, fileUrl: languages.ar.fileUrl });
        }
        if (selectedLanguages.en && languages.en) {
            selected.push({ lang: 'en', price: languages.en.price, fileUrl: languages.en.fileUrl });
        }

        return selected;
    };

    const handleBuyNow = () => {
        const languages = getAvailableLanguages();
        const hasLanguages = languages.ar || languages.en;

        if (hasLanguages) {
            const selected = getSelectedLanguagesData();

            if (selected.length === 0) {
                toast.error('الرجاء اختيار لغة واحدة على الأقل');
                return;
            }

            const languagesParam = selected.map(l => l.lang).join(',');
            router.push(`/checkout?productId=${productId}&languages=${languagesParam}` as any);
        } else {
            router.push(`/checkout?productId=${productId}` as any);
        }
    };

    const handleAddToCart = () => {
        const languages = getAvailableLanguages();
        const hasLanguages = languages.ar || languages.en;

        const cart = JSON.parse(localStorage.getItem('cart') || '[]');

        if (hasLanguages) {
            const selected = getSelectedLanguagesData();

            if (selected.length === 0) {
                toast.error('الرجاء اختيار لغة واحدة على الأقل');
                return;
            }

            selected.forEach((langData) => {
                const itemKey = `${productId}_${langData.lang}`;
                const existingItem = cart.find((item: any) => item.id === itemKey);

                if (!existingItem) {
                    cart.push({
                        id: itemKey,
                        productId: productId,
                        title: product?.title,
                        price: langData.price,
                        image: product?.image,
                        language: langData.lang,
                        fileUrl: langData.fileUrl,
                        quantity: 1,
                    });
                }
            });
        } else {
            const existingItem = cart.find((item: any) => item.productId === productId);

            if (!existingItem) {
                cart.push({
                    id: productId,
                    productId: productId,
                    title: product?.title,
                    price: product?.price,
                    image: product?.image,
                    quantity: 1,
                });
            } else {
                toast.info('المنتج موجود بالفعل في السلة');
            }
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        window.dispatchEvent(new Event('cartUpdated'));
        toast.success('تم إضافة المنتج إلى السلة');

        setTimeout(() => {
            router.push('/cart' as any);
        }, 1000);
    };

    const getCategoryLabel = (category: string) => {
        const categories: { [key: string]: string } = {
            'ai-games': 'ألعاب الذكاء الاصطناعي',
            'guidance': 'الإرشاد المهني',
            'general': 'عام',
            'stories': 'قصص',
        };
        return categories[category] || category;
    };

    const handleShare = async () => {
        const url = window.location.href;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: product?.title,
                    text: product?.description,
                    url: url,
                });
            } catch (error) {
                console.log('Share cancelled');
            }
        } else {
            navigator.clipboard.writeText(url);
            toast.success('تم نسخ الرابط إلى الحافظة');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
        );
    }

    if (notFound || !product) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center px-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                >
                    <div className="w-24 h-24 bg-secondary/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Package className="w-12 h-12 text-muted-foreground" />
                    </div>
                    <h1 className="text-3xl font-bold mb-3">المنتج غير موجود</h1>
                    <p className="text-muted-foreground mb-8 max-w-md">عذراً، لم نتمكن من العثور على هذا المنتج. قد يكون قد تم حذفه أو نقله.</p>
                    <Button onClick={() => router.push('/products' as any)} size="lg">
                        <ArrowRight className="w-5 h-5 ml-2" />
                        العودة للمنتجات
                    </Button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
            {/* Breadcrumbs */}
            <div className="container py-6 px-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <button onClick={() => router.push('/' as any)} className="hover:text-primary transition-colors flex items-center gap-1">
                        <Home className="w-4 h-4" />
                        الرئيسية
                    </button>
                    <ChevronRightIcon className="w-4 h-4 rotate-180" />
                    <button onClick={() => router.push('/products' as any)} className="hover:text-primary transition-colors">
                        المنتجات
                    </button>
                    <ChevronRightIcon className="w-4 h-4 rotate-180" />
                    <span className="text-foreground font-medium truncate max-w-[200px]">{product.title}</span>
                </div>
            </div>

            <div className="container py-8 px-4">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                    {/* Left: Media Gallery */}
                    <div className="lg:col-span-7">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <ProductMediaGallery
                                media={product.media || []}
                                coverImage={product.image}
                            />
                        </motion.div>
                    </div>

                    {/* Right: Product Info - Sticky on desktop */}
                    <div className="lg:col-span-5">
                        <div className="lg:sticky lg:top-24 space-y-6">
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5 }}
                                className="space-y-6"
                            >
                                {/* Header */}
                                <div className="space-y-4">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Badge variant="secondary" className="text-xs">
                                                    {getCategoryLabel(product.category)}
                                                </Badge>
                                                {product.subcategory && (
                                                    <Badge variant="outline" className="text-xs">
                                                        {product.subcategory}
                                                    </Badge>
                                                )}
                                            </div>
                                            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight leading-tight">
                                                {product.title}
                                            </h1>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={handleShare}
                                            className="rounded-full h-10 w-10"
                                        >
                                            <Share2 className="w-5 h-5" />
                                        </Button>
                                    </div>

                                    {/* Rating placeholder */}
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-1">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                            ))}
                                        </div>
                                        <span className="text-sm text-muted-foreground">(24 تقييم)</span>
                                    </div>

                                    <p className="text-lg text-muted-foreground leading-relaxed">
                                        {product.description}
                                    </p>
                                </div>

                                <Separator />

                                {/* Language Selection */}
                                {(() => {
                                    const languages = getAvailableLanguages();
                                    const hasLanguages = languages.ar || languages.en;

                                    if (hasLanguages) {
                                        return (
                                            <Card className="border-2">
                                                <CardContent className="p-6 space-y-4">
                                                    <h3 className="font-bold text-lg flex items-center gap-2">
                                                        <FileText className="w-5 h-5 text-primary" />
                                                        اختر اللغة المناسبة
                                                    </h3>
                                                    <div className="space-y-3">
                                                        {languages.ar && (
                                                            <label className={cn(
                                                                "flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all duration-200",
                                                                selectedLanguages.ar
                                                                    ? "bg-primary/5 border-primary shadow-sm"
                                                                    : "border-border hover:border-primary/50 hover:bg-accent/50"
                                                            )}>
                                                                <div className="flex items-center gap-4">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={selectedLanguages.ar}
                                                                        onChange={(e) => setSelectedLanguages(prev => ({ ...prev, ar: e.target.checked }))}
                                                                        className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                                                                    />
                                                                    <div>
                                                                        <div className="font-bold text-base flex items-center gap-2">
                                                                            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">AR</span>
                                                                            <span>النسخة العربية</span>
                                                                        </div>
                                                                        <div className="text-xs text-muted-foreground mt-1">
                                                                            ملف PDF/PPT باللغة العربية
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="text-xl font-bold text-primary">
                                                                    {languages.ar.price.toFixed(3)} ر.ع
                                                                </div>
                                                            </label>
                                                        )}

                                                        {languages.en && (
                                                            <label className={cn(
                                                                "flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all duration-200",
                                                                selectedLanguages.en
                                                                    ? "bg-primary/5 border-primary shadow-sm"
                                                                    : "border-border hover:border-primary/50 hover:bg-accent/50"
                                                            )}>
                                                                <div className="flex items-center gap-4">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={selectedLanguages.en}
                                                                        onChange={(e) => setSelectedLanguages(prev => ({ ...prev, en: e.target.checked }))}
                                                                        className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                                                                    />
                                                                    <div>
                                                                        <div className="font-bold text-base flex items-center gap-2">
                                                                            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">EN</span>
                                                                            <span>English Version</span>
                                                                        </div>
                                                                        <div className="text-xs text-muted-foreground mt-1">
                                                                            PDF/PPT file in English
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="text-xl font-bold text-primary">
                                                                    {languages.en.price.toFixed(3)} OMR
                                                                </div>
                                                            </label>
                                                        )}
                                                    </div>

                                                    {/* Total Price */}
                                                    {calculateTotal() > 0 && (
                                                        <div className="flex items-center justify-between p-5 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl border-2 border-primary/30">
                                                            <span className="font-bold text-lg">المجموع:</span>
                                                            <span className="text-3xl font-bold text-primary">
                                                                {calculateTotal().toFixed(3)} ر.ع
                                                            </span>
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        );
                                    } else {
                                        return (
                                            <div className="flex items-center justify-between p-6 bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl border-2 border-primary/30">
                                                <span className="font-bold text-xl">السعر:</span>
                                                <span className="text-4xl font-bold text-primary">
                                                    {product.price.toFixed(3)} ر.ع
                                                </span>
                                            </div>
                                        );
                                    }
                                })()}

                                {/* Features */}
                                <Card>
                                    <CardContent className="p-6">
                                        <h3 className="font-bold mb-4 flex items-center gap-2">
                                            <Award className="w-5 h-5 text-primary" />
                                            مميزات المنتج
                                        </h3>
                                        <ul className="space-y-3">
                                            {[
                                                { icon: Zap, text: "تحميل فوري بعد الدفع" },
                                                { icon: FileText, text: "ملف عالي الجودة (PDF/PPT)" },
                                                { icon: Users, text: "دعم فني متواصل" },
                                                { icon: Shield, text: "دفع آمن 100%" }
                                            ].map((feature, index) => (
                                                <li key={index} className="flex items-center gap-3 text-sm">
                                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                        <feature.icon className="w-4 h-4 text-primary" />
                                                    </div>
                                                    <span className="text-muted-foreground">{feature.text}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>

                                {/* Action Buttons */}
                                <div className="space-y-3">
                                    {(() => {
                                        const languages = getAvailableLanguages();
                                        const hasLanguages = languages.ar || languages.en;
                                        const total = calculateTotal();
                                        const isDisabled = !!(hasLanguages && total === 0);

                                        return (
                                            <>
                                                <Button
                                                    size="lg"
                                                    className="w-full text-lg h-14 rounded-xl shadow-lg shadow-primary/20"
                                                    onClick={handleBuyNow}
                                                    disabled={isDisabled}
                                                >
                                                    {hasLanguages ? (
                                                        total > 0
                                                            ? `شراء الآن - ${total.toFixed(3)} ر.ع`
                                                            : 'اختر لغة للمتابعة'
                                                    ) : (
                                                        `شراء الآن - ${product.price.toFixed(3)} ر.ع`
                                                    )}
                                                </Button>
                                                <Button
                                                    size="lg"
                                                    variant="outline"
                                                    className="w-full text-lg h-14 rounded-xl"
                                                    onClick={handleAddToCart}
                                                    disabled={isDisabled}
                                                >
                                                    <ShoppingCart className="w-5 h-5 ml-2" />
                                                    إضافة للسلة
                                                </Button>
                                            </>
                                        );
                                    })()}

                                    <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-2">
                                        <Shield className="w-4 h-4" />
                                        دفع آمن 100% عبر البطاقة البنكية أو أبل باي
                                    </p>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
