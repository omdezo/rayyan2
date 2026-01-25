"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Check, ShoppingCart, Loader2, Package } from "lucide-react";
import { toast } from "sonner";
import { ProductMediaGallery } from "@/components/features/product-media-gallery";
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
            // New product with language variants
            const selected = getSelectedLanguagesData();

            if (selected.length === 0) {
                toast.error('الرجاء اختيار لغة واحدة على الأقل');
                return;
            }

            // Pass selected languages as URL parameters
            const languagesParam = selected.map(l => l.lang).join(',');
            router.push(`/checkout?productId=${productId}&languages=${languagesParam}` as any);
        } else {
            // Old product without language variants - direct checkout
            router.push(`/checkout?productId=${productId}` as any);
        }
    };

    const handleAddToCart = () => {
        const languages = getAvailableLanguages();
        const hasLanguages = languages.ar || languages.en;

        const cart = JSON.parse(localStorage.getItem('cart') || '[]');

        if (hasLanguages) {
            // New product with language variants
            const selected = getSelectedLanguagesData();

            if (selected.length === 0) {
                toast.error('الرجاء اختيار لغة واحدة على الأقل');
                return;
            }

            // Add each selected language as a separate cart item
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
            // Old product without language variants
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

        // Dispatch event to update cart count in header
        window.dispatchEvent(new Event('cartUpdated'));

        toast.success('تم إضافة المنتج إلى السلة');

        // Redirect to cart after a short delay
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

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (notFound || !product) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center px-4">
                <Package className="w-20 h-20 text-muted-foreground mb-4" />
                <h1 className="text-2xl font-bold mb-2">المنتج غير موجود</h1>
                <p className="text-muted-foreground mb-6">عذراً، لم نتمكن من العثور على هذا المنتج</p>
                <Button onClick={() => router.push('/products' as any)}>
                    <ArrowRight className="w-4 h-4 ml-2" />
                    العودة للمنتجات
                </Button>
            </div>
        );
    }

    return (
        <div className="container py-10 px-4">
            <button
                onClick={() => router.back()}
                className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6 transition-colors"
            >
                <ArrowRight className="ml-2 h-4 w-4" />
                العودة للمنتجات
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
                {/* Product Media Gallery */}
                <ProductMediaGallery
                    media={product.media || []}
                    coverImage={product.image}
                />

                {/* Product Info */}
                <div className="flex flex-col space-y-6">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">{product.title}</h1>
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80">
                                {getCategoryLabel(product.category)}
                            </span>
                            {product.subcategory && (
                                <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                                    {product.subcategory}
                                </span>
                            )}
                        </div>
                    </div>

                    <p className="text-muted-foreground text-lg leading-relaxed">
                        {product.description}
                    </p>

                    {/* Language Selection or Price Display */}
                    {(() => {
                        const languages = getAvailableLanguages();
                        const hasLanguages = languages.ar || languages.en;

                        if (hasLanguages) {
                            return (
                                <div className="space-y-4 pt-6 border-t border-border/40">
                                    <h3 className="font-semibold text-lg">اختر اللغة:</h3>
                                    <div className="space-y-3">
                                        {languages.ar && (
                                            <label className="flex items-center justify-between p-4 rounded-lg border border-border/60 cursor-pointer hover:bg-accent/50 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedLanguages.ar}
                                                        onChange={(e) => setSelectedLanguages(prev => ({ ...prev, ar: e.target.checked }))}
                                                        className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                                                    />
                                                    <div>
                                                        <div className="font-medium flex items-center gap-2">
                                                            <span className="text-sm font-bold">AR</span>
                                                            <span>النسخة العربية</span>
                                                        </div>
                                                        <div className="text-sm text-muted-foreground">
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
                                            <label className="flex items-center justify-between p-4 rounded-lg border border-border/60 cursor-pointer hover:bg-accent/50 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedLanguages.en}
                                                        onChange={(e) => setSelectedLanguages(prev => ({ ...prev, en: e.target.checked }))}
                                                        className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                                                    />
                                                    <div>
                                                        <div className="font-medium flex items-center gap-2">
                                                            <span className="text-sm font-bold">EN</span>
                                                            <span>English Version</span>
                                                        </div>
                                                        <div className="text-sm text-muted-foreground">
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
                                        <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border-2 border-primary/20">
                                            <span className="font-semibold text-lg">المجموع:</span>
                                            <span className="text-2xl font-bold text-primary">
                                                {calculateTotal().toFixed(3)} ر.ع
                                            </span>
                                        </div>
                                    )}
                                </div>
                            );
                        } else {
                            // Fallback for old products without language variants
                            return (
                                <div className="text-3xl font-bold text-primary pt-6 border-t border-border/40">
                                    {product.price.toFixed(3)} ر.ع
                                </div>
                            );
                        }
                    })()}

                    <div className="space-y-4 pt-6 border-t border-border/40">
                        <h3 className="font-semibold">مميزات المنتج:</h3>
                        <ul className="space-y-2">
                            <li className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Check className="h-4 w-4 text-primary" />
                                تحميل فوري بعد الدفع
                            </li>
                            <li className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Check className="h-4 w-4 text-primary" />
                                ملف عالي الجودة (PDF/PPT)
                            </li>
                            <li className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Check className="h-4 w-4 text-primary" />
                                دعم فني متواصل
                            </li>
                            <li className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Check className="h-4 w-4 text-primary" />
                                إمكانية اختيار اللغة المناسبة
                            </li>
                        </ul>
                    </div>

                    <div className="flex flex-col gap-3 pt-6">
                        {(() => {
                            const languages = getAvailableLanguages();
                            const hasLanguages = languages.ar || languages.en;
                            const total = calculateTotal();
                            const isDisabled = hasLanguages && total === 0;

                            return (
                                <>
                                    <Button
                                        size="lg"
                                        className="w-full text-lg h-12"
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
                                        className="w-full text-lg h-12"
                                        onClick={handleAddToCart}
                                        disabled={isDisabled}
                                    >
                                        <ShoppingCart className="w-4 h-4 ml-2" />
                                        إضافة للسلة
                                    </Button>
                                </>
                            );
                        })()}

                        <p className="text-xs text-center text-muted-foreground">
                            دفع آمن 100% عبر البطاقة البنكية أو أبل باي
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
