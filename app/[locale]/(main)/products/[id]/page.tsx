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
    const [showFloatingCTA, setShowFloatingCTA] = useState(false);
    const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

    const productId = params.id as string;

    useEffect(() => {
        fetchProduct();
    }, [productId]);

    // Handle scroll for floating CTA
    useEffect(() => {
        const handleScroll = () => {
            // Show floating CTA when user scrolls past 500px on mobile
            if (window.innerWidth < 1024) {
                setShowFloatingCTA(window.scrollY > 500);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

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
                toast.error('الرجاء اختيار لغة واحدة على الأقل', {
                    description: 'اختر النسخة العربية أو الإنجليزية للمتابعة',
                    duration: 3000,
                });
                return;
            }

            toast.loading('جاري التحويل لصفحة الدفع...', { duration: 1000 });
            const languagesParam = selected.map(l => l.lang).join(',');
            setTimeout(() => {
                router.push(`/checkout?productId=${productId}&languages=${languagesParam}` as any);
            }, 500);
        } else {
            toast.loading('جاري التحويل لصفحة الدفع...', { duration: 1000 });
            setTimeout(() => {
                router.push(`/checkout?productId=${productId}` as any);
            }, 500);
        }
    };

    const handleAddToCart = () => {
        const languages = getAvailableLanguages();
        const hasLanguages = languages.ar || languages.en;

        const cart = JSON.parse(localStorage.getItem('cart') || '[]');

        if (hasLanguages) {
            const selected = getSelectedLanguagesData();

            if (selected.length === 0) {
                toast.error('الرجاء اختيار لغة واحدة على الأقل', {
                    description: 'اختر النسخة العربية أو الإنجليزية للمتابعة',
                    duration: 3000,
                });
                return;
            }

            let addedItems = 0;
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
                    addedItems++;
                }
            });

            if (addedItems === 0) {
                toast.info('المنتج موجود بالفعل في السلة', {
                    description: 'يمكنك إتمام عملية الشراء من السلة',
                });
                return;
            }
        } else {
            const existingItem = cart.find((item: any) => item.productId === productId);

            if (existingItem) {
                toast.info('المنتج موجود بالفعل في السلة', {
                    description: 'يمكنك إتمام عملية الشراء من السلة',
                });
                return;
            }

            cart.push({
                id: productId,
                productId: productId,
                title: product?.title,
                price: product?.price,
                image: product?.image,
                quantity: 1,
            });
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        window.dispatchEvent(new Event('cartUpdated'));
        toast.success('تم إضافة المنتج إلى السلة', {
            description: 'جاري التوجيه إلى السلة...',
            duration: 2000,
        });

        setTimeout(() => {
            router.push('/cart' as any);
        }, 1500);
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
        <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/10">
            {/* Breadcrumbs */}
            <div className="container py-8 px-4">
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

            <div className="container py-6 px-4 md:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 xl:gap-20">
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
                        <div className="lg:sticky lg:top-24 space-y-8">
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
                                            <div className="space-y-4">
                                                <h3 className="font-bold text-xl flex items-center gap-2">
                                                    <FileText className="w-5 h-5 text-primary" />
                                                    اختر اللغة المناسبة
                                                </h3>
                                                <div className="space-y-3">
                                                    {languages.ar && (
                                                        <motion.label
                                                            whileTap={{ scale: 0.98 }}
                                                            className={cn(
                                                                "flex items-center justify-between p-5 rounded-2xl cursor-pointer transition-all duration-300 shadow-sm",
                                                                selectedLanguages.ar
                                                                    ? "bg-gradient-to-br from-primary/10 via-primary/5 to-transparent shadow-md ring-2 ring-primary/30"
                                                                    : "bg-card hover:bg-accent/30 hover:shadow-md"
                                                            )}
                                                        >
                                                            <div className="flex items-center gap-4">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={selectedLanguages.ar}
                                                                    onChange={(e) => setSelectedLanguages(prev => ({ ...prev, ar: e.target.checked }))}
                                                                    className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                                                                />
                                                                <div>
                                                                    <div className="font-bold text-base flex items-center gap-2">
                                                                        <span className="text-xs bg-primary/20 text-primary px-2.5 py-0.5 rounded-full font-semibold">AR</span>
                                                                        <span>النسخة العربية</span>
                                                                    </div>
                                                                    <div className="text-xs text-muted-foreground mt-1">
                                                                        ملف PDF/PPT باللغة العربية
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="text-2xl font-bold text-primary">
                                                                {languages.ar.price.toFixed(3)} ر.ع
                                                            </div>
                                                        </motion.label>
                                                    )}

                                                    {languages.en && (
                                                        <motion.label
                                                            whileTap={{ scale: 0.98 }}
                                                            className={cn(
                                                                "flex items-center justify-between p-5 rounded-2xl cursor-pointer transition-all duration-300 shadow-sm",
                                                                selectedLanguages.en
                                                                    ? "bg-gradient-to-br from-primary/10 via-primary/5 to-transparent shadow-md ring-2 ring-primary/30"
                                                                    : "bg-card hover:bg-accent/30 hover:shadow-md"
                                                            )}
                                                        >
                                                            <div className="flex items-center gap-4">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={selectedLanguages.en}
                                                                    onChange={(e) => setSelectedLanguages(prev => ({ ...prev, en: e.target.checked }))}
                                                                    className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                                                                />
                                                                <div>
                                                                    <div className="font-bold text-base flex items-center gap-2">
                                                                        <span className="text-xs bg-primary/20 text-primary px-2.5 py-0.5 rounded-full font-semibold">EN</span>
                                                                        <span>English Version</span>
                                                                    </div>
                                                                    <div className="text-xs text-muted-foreground mt-1">
                                                                        PDF/PPT file in English
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="text-2xl font-bold text-primary">
                                                                {languages.en.price.toFixed(3)} OMR
                                                            </div>
                                                        </motion.label>
                                                    )}
                                                </div>

                                                {/* Total Price */}
                                                {calculateTotal() > 0 && (
                                                    <div className="flex items-center justify-between p-6 bg-gradient-to-br from-primary/15 via-primary/10 to-primary/5 rounded-2xl shadow-md">
                                                        <span className="font-bold text-xl">المجموع:</span>
                                                        <span className="text-4xl font-bold text-primary">
                                                            {calculateTotal().toFixed(3)} ر.ع
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    } else {
                                        return (
                                            <div className="flex items-center justify-between p-8 bg-gradient-to-br from-primary/15 via-primary/10 to-primary/5 rounded-2xl shadow-md">
                                                <span className="font-bold text-2xl">السعر:</span>
                                                <span className="text-5xl font-bold text-primary">
                                                    {product.price.toFixed(3)} ر.ع
                                                </span>
                                            </div>
                                        );
                                    }
                                })()}

                                {/* Features */}
                                <div className="bg-gradient-to-br from-secondary/40 via-secondary/20 to-transparent rounded-2xl p-6 shadow-sm">
                                    <h3 className="font-bold text-xl mb-5 flex items-center gap-2">
                                        <Award className="w-5 h-5 text-primary" />
                                        مميزات المنتج
                                    </h3>
                                    <ul className="space-y-4">
                                        {[
                                            { icon: Zap, text: "تحميل فوري بعد الدفع" },
                                            { icon: FileText, text: "ملف عالي الجودة (PDF/PPT)" },
                                            { icon: Users, text: "دعم فني متواصل" },
                                            { icon: Shield, text: "دفع آمن 100%" }
                                        ].map((feature, index) => (
                                            <li key={index} className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 shadow-sm">
                                                    <feature.icon className="w-5 h-5 text-primary" />
                                                </div>
                                                <span className="text-foreground font-medium">{feature.text}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Action Buttons */}
                                <div className="space-y-4 pt-2">
                                    {(() => {
                                        const languages = getAvailableLanguages();
                                        const hasLanguages = languages.ar || languages.en;
                                        const total = calculateTotal();
                                        const isDisabled = !!(hasLanguages && total === 0);

                                        return (
                                            <>
                                                <Button
                                                    size="lg"
                                                    className="w-full text-lg h-16 rounded-2xl shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300 font-bold"
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
                                                    className="w-full text-lg h-16 rounded-2xl hover:bg-accent/50 transition-all duration-300 font-semibold shadow-sm hover:shadow-md"
                                                    onClick={handleAddToCart}
                                                    disabled={isDisabled}
                                                >
                                                    <ShoppingCart className="w-5 h-5 ml-2" />
                                                    إضافة للسلة
                                                </Button>
                                            </>
                                        );
                                    })()}

                                    <div className="text-center py-3 px-4 bg-secondary/30 rounded-xl">
                                        <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                                            <Shield className="w-4 h-4 text-green-500" />
                                            <span>دفع آمن 100% عبر البطاقة البنكية أو أبل باي</span>
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>

                {/* Additional Information Section */}
                <div className="container px-4 md:px-6 lg:px-8 py-12">
                    <div className="max-w-4xl mx-auto space-y-12">
                        {/* What You'll Get */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="bg-gradient-to-br from-blue-50/50 to-indigo-50/30 dark:from-blue-950/20 dark:to-indigo-950/10 rounded-2xl p-8 shadow-sm"
                        >
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center">
                                    <Package className="w-5 h-5 text-primary" />
                                </div>
                                ماذا ستحصل عليه؟
                            </h2>
                            <div className="grid md:grid-cols-2 gap-4">
                                {[
                                    { icon: FileText, title: "ملف احترافي", desc: "عرض تقديمي بتصميم احترافي عالي الجودة" },
                                    { icon: Download, title: "تحميل فوري", desc: "احصل على الملف مباشرة بعد إتمام الدفع" },
                                    { icon: Clock, title: "وصول دائم", desc: "استخدم الملف في أي وقت بدون قيود" },
                                    { icon: Users, title: "دعم مستمر", desc: "فريق الدعم جاهز للمساعدة في أي وقت" }
                                ].map((item, index) => (
                                    <div key={index} className="flex items-start gap-4 p-4 bg-white/60 dark:bg-gray-900/40 rounded-xl">
                                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                            <item.icon className="w-6 h-6 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold mb-1">{item.title}</h3>
                                            <p className="text-sm text-muted-foreground">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* FAQ Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-2xl font-bold mb-6">الأسئلة الشائعة</h2>
                            <div className="space-y-3">
                                {[
                                    {
                                        q: "كيف أحصل على الملف بعد الشراء؟",
                                        a: "بعد إتمام عملية الدفع بنجاح، سيتم إرسال رابط التحميل إلى بريدك الإلكتروني مباشرة. كما يمكنك تحميل الملف من صفحة حسابك."
                                    },
                                    {
                                        q: "هل يمكنني استرجاع أو استبدال المنتج؟",
                                        a: "نعم، وفقاً لقانون حماية المستهلك، يمكنك طلب الاسترجاع أو الاستبدال خلال 15 يوماً من تاريخ الشراء في حال وجود عيب في المنتج أو عدم مطابقته للمواصفات."
                                    },
                                    {
                                        q: "ما هي طرق الدفع المتاحة؟",
                                        a: "نوفر الدفع الآمن عبر البطاقات البنكية (Visa, Mastercard) وأبل باي من خلال بوابة Thawani الآمنة."
                                    },
                                    {
                                        q: "هل يمكنني استخدام الملف لأغراض تجارية؟",
                                        a: "يرجى التواصل مع فريق الدعم لمعرفة شروط الاستخدام التجاري. في العادة، الملفات مخصصة للاستخدام الشخصي أو التعليمي."
                                    }
                                ].map((faq, index) => (
                                    <div key={index} className="bg-card rounded-xl overflow-hidden shadow-sm">
                                        <button
                                            onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                                            className="w-full px-6 py-4 flex items-center justify-between text-right hover:bg-accent/50 transition-colors"
                                        >
                                            <span className="font-semibold">{faq.q}</span>
                                            <ChevronRightIcon className={cn(
                                                "w-5 h-5 transition-transform flex-shrink-0",
                                                expandedFaq === index ? "rotate-90" : ""
                                            )} />
                                        </button>
                                        {expandedFaq === index && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="px-6 pb-4 text-muted-foreground"
                                            >
                                                {faq.a}
                                            </motion.div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Trust Badges */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="grid grid-cols-2 md:grid-cols-4 gap-4"
                        >
                            {[
                                { icon: Shield, text: "دفع آمن 100%" },
                                { icon: Download, text: "تحميل فوري" },
                                { icon: Users, text: "دعم فني" },
                                { icon: Award, text: "جودة عالية" }
                            ].map((badge, index) => (
                                <div key={index} className="flex flex-col items-center gap-3 p-6 bg-card rounded-xl shadow-sm">
                                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                        <badge.icon className="w-6 h-6 text-primary" />
                                    </div>
                                    <span className="text-sm font-semibold text-center">{badge.text}</span>
                                </div>
                            ))}
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Floating CTA Button (Mobile Only) */}
            {showFloatingCTA && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-lg border-t shadow-2xl z-50"
                >
                    <div className="container flex items-center gap-3">
                        <div className="flex-1">
                            <div className="text-sm text-muted-foreground">المجموع</div>
                            <div className="text-2xl font-bold text-primary">
                                {(() => {
                                    const languages = getAvailableLanguages();
                                    const hasLanguages = languages.ar || languages.en;
                                    const total = calculateTotal();

                                    if (hasLanguages && total > 0) {
                                        return `${total.toFixed(3)} ر.ع`;
                                    } else if (!hasLanguages && product) {
                                        return `${product.price.toFixed(3)} ر.ع`;
                                    }
                                    return "---";
                                })()}
                            </div>
                        </div>
                        <Button
                            size="lg"
                            onClick={handleBuyNow}
                            className="h-14 px-8 text-lg font-bold shadow-lg rounded-xl"
                        >
                            شراء الآن
                        </Button>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
