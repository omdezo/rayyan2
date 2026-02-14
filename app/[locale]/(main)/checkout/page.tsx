"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/routing";
import { Loader2, CreditCard, Package, Tag, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { R2Image } from "@/components/ui/r2-image";
import { useTranslations } from "next-intl";
import { PriceDisplay } from "@/components/ui/price-display";
import { useCurrency } from "@/lib/contexts/currency-context";
import { formatPrice } from "@/lib/currency";

interface LanguageVariant {
    lang: 'ar' | 'en';
    price: number;
    fileUrl: string;
    fileName?: string;
}

interface Product {
    _id: string;
    title: string;
    description: string;
    price: number;
    category: string;
    subcategory?: string;
    image: string;
    status: string;
    languages: LanguageVariant[];
}

interface CartItem {
    id: string;
    productId: string;
    title: string;
    price: number;
    image: string;
    quantity: number;
    language?: 'ar' | 'en';
    fileUrl?: string;
    fileName?: string;
}

interface OrderItem {
    productId: string;
    title: string;
    price: number;
    language?: 'ar' | 'en';
    fileUrl?: string;
    fileName?: string;
}

function CheckoutContent() {
    const t = useTranslations('Checkout');
    const router = useRouter();
    const searchParams = useSearchParams();
    const { data: session, status } = useSession();
    const { currency } = useCurrency();
    const productId = searchParams.get("productId");
    const fromCart = searchParams.get("fromCart") === "true";
    const languagesParam = searchParams.get("languages"); // e.g., "ar,en" or "ar" or "en"

    const [product, setProduct] = useState<Product | null>(null);
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
    });
    const [agreedToPolicy, setAgreedToPolicy] = useState(false);
    const [discountCode, setDiscountCode] = useState("");
    const [appliedDiscount, setAppliedDiscount] = useState<{
        code: string;
        discountPercent: number;
        discountAmount: number;
    } | null>(null);
    const [isValidatingDiscount, setIsValidatingDiscount] = useState(false);

    // Require authentication
    useEffect(() => {
        if (status === 'unauthenticated') {
            toast.error('يجب تسجيل الدخول أولاً للمتابعة');
            // Include locale in callback URL
            const currentPath = fromCart
                ? '/ar/cart'
                : `/ar/checkout?productId=${productId}${languagesParam ? `&languages=${languagesParam}` : ''}`;
            router.push(`/auth?callbackUrl=${encodeURIComponent(currentPath)}` as any);
        }
    }, [status, router, productId, fromCart, languagesParam]);

    // Load data based on checkout type
    useEffect(() => {
        if (status === 'authenticated') {
            if (fromCart) {
                loadCartItems();
            } else if (productId) {
                fetchProduct();
            } else {
                setLoading(false);
            }
        }
    }, [productId, fromCart, status]);

    // Update form data when session loads
    useEffect(() => {
        if (session?.user) {
            setFormData({
                name: session.user.name || "",
                email: session.user.email || "",
                phone: "",
            });
        }
    }, [session]);

    const fetchProduct = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/products/${productId}`);
            const data = await response.json();

            if (data.success) {
                setProduct(data.data);
            } else {
                toast.error('المنتج غير موجود');
            }
        } catch (error) {
            console.error('Error fetching product:', error);
            toast.error('حدث خطأ أثناء تحميل المنتج');
        } finally {
            setLoading(false);
        }
    };

    const loadCartItems = () => {
        try {
            const cartData = localStorage.getItem('cart');
            const parsedCart = cartData ? JSON.parse(cartData) : [];
            setCartItems(parsedCart);
            setLoading(false);
        } catch (error) {
            console.error('Error loading cart:', error);
            setCartItems([]);
            setLoading(false);
        }
    };

    const handleApplyDiscount = async () => {
        if (!discountCode.trim()) {
            toast.error('الرجاء إدخال رمز الخصم');
            return;
        }

        const subtotal = fromCart
            ? cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
            : (() => {
                if (!product || !languagesParam) return 0;
                const selectedLangs = languagesParam.split(',') as ('ar' | 'en')[];
                return selectedLangs.reduce((sum, lang) => {
                    const langVariant = product.languages.find(l => l.lang === lang);
                    return sum + (langVariant?.price || 0);
                }, 0);
            })();

        setIsValidatingDiscount(true);
        try {
            const response = await fetch('/api/discount-codes/validate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    code: discountCode.trim().toUpperCase(),
                    purchaseAmount: subtotal,
                }),
            });

            const data = await response.json();

            if (data.success) {
                setAppliedDiscount({
                    code: data.data.code,
                    discountPercent: data.data.discountPercent,
                    discountAmount: data.data.discountAmount,
                });
                toast.success(`تم تطبيق خصم ${data.data.discountPercent}%`);
            } else {
                toast.error(data.message || 'رمز الخصم غير صالح');
            }
        } catch (error) {
            console.error('Error validating discount code:', error);
            toast.error('حدث خطأ أثناء التحقق من رمز الخصم');
        } finally {
            setIsValidatingDiscount(false);
        }
    };

    const handleRemoveDiscount = () => {
        setAppliedDiscount(null);
        setDiscountCode("");
        toast.success('تم إزالة رمز الخصم');
    };

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();

        // ⚠️ CRITICAL: Prevent double-click/double-submission
        if (isProcessing) {
            console.log('⚠️  Payment already processing, ignoring duplicate click');
            return;
        }

        // Validation
        if (!formData.name || !formData.email || !formData.phone) {
            toast.error('الرجاء ملء جميع الحقول');
            return;
        }

        if (!agreedToPolicy) {
            toast.error('الرجاء الموافقة على شروط الاستخدام');
            return;
        }

        if (fromCart && cartItems.length === 0) {
            toast.error('السلة فارغة');
            return;
        }

        if (!fromCart && !product) {
            toast.error('المنتج غير موجود');
            return;
        }

        // Set processing IMMEDIATELY to prevent double-clicks
        setIsProcessing(true);

        try {
            // Prepare order data
            let orderItems: OrderItem[];
            let total: number;

            if (fromCart) {
                // Multiple products from cart (each cart item already has language and fileUrl)
                orderItems = cartItems.map(item => ({
                    productId: item.productId,
                    title: item.title,
                    price: item.price,
                    language: item.language,
                    fileUrl: item.fileUrl || '',
                    fileName: item.fileName || item.title,
                }));
                total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            } else {
                // Single product
                if (languagesParam) {
                    // New product with selected languages
                    const selectedLangs = languagesParam.split(',') as ('ar' | 'en')[];
                    orderItems = [];
                    total = 0;

                    selectedLangs.forEach(lang => {
                        const langVariant = product!.languages?.find(l => l.lang === lang);
                        if (langVariant) {
                            orderItems.push({
                                productId: product!._id,
                                title: product!.title,
                                price: langVariant.price,
                                language: lang,
                                fileUrl: langVariant.fileUrl,
                                fileName: langVariant.fileName || product!.title,
                            });
                            total += langVariant.price;
                        }
                    });
                } else {
                    // Old product without language variants
                    orderItems = [{
                        productId: product!._id,
                        title: product!.title,
                        price: product!.price,
                    }];
                    total = product!.price;
                }
            }

            // Check minimum amount (0.100 OMR)
            if (total < 0.1) {
                toast.error('الحد الأدنى للدفع هو 0.100 ر.ع');
                setIsProcessing(false);
                return;
            }

            // Create Thawani checkout session
            const response = await fetch('/api/thawani/create-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    customerInfo: {
                        name: formData.name,
                        email: formData.email,
                        phone: formData.phone,
                    },
                    items: orderItems,
                    subtotal: total,
                    discountCode: appliedDiscount?.code,
                    discountPercent: appliedDiscount?.discountPercent,
                    discountAmount: appliedDiscount?.discountAmount,
                    total: appliedDiscount ? total - appliedDiscount.discountAmount : total,
                    fromCart,
                    productId,
                    languages: languagesParam,
                }),
            });

            const data = await response.json();

            if (data.success) {
                // Show success message
                toast.success('تم إنشاء جلسة الدفع بنجاح');

                // Redirect to Thawani payment page
                window.location.href = data.data.paymentUrl;

                // Fallback: Reset processing state if redirect doesn't happen within 3 seconds
                setTimeout(() => {
                    setIsProcessing(false);
                    toast.error('فشل التحويل التلقائي. الرجاء المحاولة مرة أخرى');
                }, 3000);
            } else {
                toast.error(data.error || 'فشل في إنشاء جلسة الدفع');
                setIsProcessing(false);
            }
        } catch (error) {
            console.error('Payment error:', error);
            toast.error('حدث خطأ أثناء معالجة الدفع');
            setIsProcessing(false);
        }
    };

    // Calculate subtotal and total
    const subtotal = fromCart
        ? cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        : (() => {
            if (!product || !languagesParam) return 0;
            const selectedLangs = languagesParam.split(',') as ('ar' | 'en')[];
            return selectedLangs.reduce((sum, lang) => {
                const langVariant = product.languages.find(l => l.lang === lang);
                return sum + (langVariant?.price || 0);
            }, 0);
        })();

    const totalAmount = appliedDiscount
        ? subtotal - appliedDiscount.discountAmount
        : subtotal;

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!fromCart && !product) {
        return (
            <div className="container py-20 text-center">
                <Package className="w-20 h-20 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">المنتج غير موجود</h2>
                <p className="text-muted-foreground mb-6">الرجاء اختيار منتج من المتجر</p>
                <Button onClick={() => router.push("/products" as any)}>
                    العودة للمتجر
                </Button>
            </div>
        );
    }

    if (fromCart && cartItems.length === 0) {
        return (
            <div className="container py-20 text-center">
                <Package className="w-20 h-20 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">السلة فارغة</h2>
                <p className="text-muted-foreground mb-6">الرجاء إضافة منتجات إلى السلة</p>
                <Button onClick={() => router.push("/products" as any)}>
                    العودة للمتجر
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background py-12 px-4">
            <div className="container max-w-6xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Right Column - Checkout Form */}
                    <div className="lg:col-span-7 space-y-8 order-2 lg:order-1">
                        <Card className="border-border/50 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-2xl font-bold">إتمام الشراء</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handlePayment} className="space-y-8">

                                    {/* Contact Info */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold">بيانات التواصل</h3>

                                        <div className="space-y-2">
                                            <label htmlFor="email" className="text-sm font-medium text-muted-foreground">البريد الإلكتروني</label>
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="example@mail.com"
                                                className="h-12 bg-secondary/20"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                required
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label htmlFor="name" className="text-sm font-medium text-muted-foreground">الاسم الكامل</label>
                                                <Input
                                                    id="name"
                                                    placeholder="الاسم"
                                                    className="h-12 bg-secondary/20"
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label htmlFor="phone" className="text-sm font-medium text-muted-foreground">رقم الهاتف (واتساب)</label>
                                                <Input
                                                    id="phone"
                                                    placeholder="+968"
                                                    className="h-12 bg-secondary/20 text-left"
                                                    dir="ltr"
                                                    value={formData.phone}
                                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Payment Method */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold">طريقة الدفع</h3>
                                        <div className="flex items-center gap-3 p-4 border-2 border-primary bg-primary/5 rounded-xl">
                                            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                                                <CreditCard className="w-6 h-6 text-primary" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-semibold">الدفع بالبطاقة البنكية</p>
                                                <p className="text-sm text-muted-foreground">دفع آمن عبر بوابة Thawani Pay</p>
                                            </div>
                                        </div>
                                        <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg">
                                            <p className="text-xs text-muted-foreground">
                                                🔒 جميع المعاملات مشفرة وآمنة. نحن لا نقوم بتخزين معلومات بطاقتك الائتمانية.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Terms of Use Agreement */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold">شروط الاستخدام</h3>
                                        <div className="bg-secondary/30 border border-border/60 rounded-xl p-5">
                                            <p className="text-sm text-muted-foreground leading-relaxed text-right">
                                                هذا المنتج الرقمي مخصص للاستخدام الشخصي الفردي فقط من قبل المشتري. يحق لك استخدامه، حفظه، تصويره أو نسخه لنفسك بكل راحة. كل ما نرجوه هو عدم مشاركته مع الآخرين أو إعادة بيعه أو استخدامه لأي غرض تجاري. الهدف من ذلك هو الحفاظ على حقوق العمل واحترام الجهد المبذول فيه ❤️‍🩹
                                            </p>
                                        </div>

                                        {/* Checkbox Agreement */}
                                        <label className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                            agreedToPolicy
                                                ? 'border-primary bg-primary/5'
                                                : 'border-border/60 hover:border-primary/50'
                                        }`}>
                                            <input
                                                type="checkbox"
                                                checked={agreedToPolicy}
                                                onChange={(e) => setAgreedToPolicy(e.target.checked)}
                                                className="w-5 h-5 mt-0.5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                                                required
                                            />
                                            <div className="flex-1 text-sm">
                                                <span className="font-medium">
                                                    أوافق على شروط الاستخدام
                                                </span>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    بالموافقة، أنت تقر بأنك قرأت وفهمت شروط الاستخدام الخاصة بالمنتجات الرقمية
                                                </p>
                                            </div>
                                        </label>

                                        {/* Important Notice */}
                                        <div className="bg-gray-900 border-2 border-amber-500 rounded-xl p-5 space-y-3">
                                            <div className="flex items-start gap-3">
                                                <div className="flex-shrink-0 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                                    ⚠
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-bold text-amber-400 mb-2 text-base">
                                                        تنويه مهم:
                                                    </h4>
                                                    <div className="text-sm text-gray-200 leading-relaxed space-y-2">
                                                        <p>
                                                            هذا الملف مُقدَّم بصيغة عرض PowerPoint، ويُرجى استخدامه عبر جهاز الكمبيوتر أو اللابتوب لضمان أفضل تجربة عرض، حيث إن الهواتف المحمولة لا تدعم تشغيل هذه الصيغة بشكل صحيح.
                                                        </p>
                                                        <p className="font-semibold text-amber-300">
                                                            وللاستخدام عبر الهاتف المحمول، يُرجى طلب خدمة نسخة Canva، وستتاح هذه الخدمة بعد إتمام عملية الدفع.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full h-14 text-lg font-bold bg-[#8B7355] hover:bg-[#8B7355]/90 text-white shadow-lg shadow-[#8B7355]/20 rounded-xl mt-8"
                                        disabled={isProcessing}
                                    >
                                        {isProcessing ? (
                                            <>
                                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                جاري المعالجة...
                                            </>
                                        ) : (
                                            `المتابعة للدفع - ${formatPrice(totalAmount, currency, 'ar')}`
                                        )}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Left Column - Order Summary */}
                    <div className="lg:col-span-5 order-1 lg:order-2">
                        <Card className="border-border/50 shadow-sm sticky top-24">
                            <CardHeader>
                                <CardTitle className="text-xl font-bold">ملخص الطلب</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Products List */}
                                <div className="space-y-4">
                                    {fromCart ? (
                                        // Multiple products from cart
                                        cartItems.map((item) => (
                                            <div key={item.id} className="flex gap-4">
                                                <R2Image
                                                    r2Key={item.image}
                                                    alt={item.title}
                                                    className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                                                    fallback={
                                                        <div className="w-16 h-16 bg-secondary/30 rounded-lg flex-shrink-0 flex items-center justify-center">
                                                            <Package className="w-6 h-6 text-muted-foreground" />
                                                        </div>
                                                    }
                                                />
                                                <div className="space-y-1 flex-1">
                                                    <h4 className="font-medium line-clamp-2 text-sm">{item.title}</h4>
                                                    {item.language && (
                                                        <span className="inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium transition-colors border-transparent bg-secondary text-secondary-foreground">
                                                            {item.language === 'ar' ? 'AR - النسخة العربية' : 'EN - English'}
                                                        </span>
                                                    )}
                                                    <PriceDisplay
                                                        priceInOMR={item.price}
                                                        className="text-sm font-bold text-primary"
                                                    />
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        // Single product
                                        product && (
                                            languagesParam ? (
                                                // With selected languages
                                                <>
                                                    {languagesParam.split(',').map((lang) => {
                                                        const langVariant = product.languages?.find(l => l.lang === lang);
                                                        if (!langVariant) return null;

                                                        return (
                                                            <div key={lang} className="flex gap-4">
                                                                <R2Image
                                                                    r2Key={product.image}
                                                                    alt={product.title}
                                                                    className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                                                                    fallback={
                                                                        <div className="w-16 h-16 bg-secondary/30 rounded-lg flex-shrink-0 flex items-center justify-center">
                                                                            <Package className="w-6 h-6 text-muted-foreground" />
                                                                        </div>
                                                                    }
                                                                />
                                                                <div className="space-y-1 flex-1">
                                                                    <h4 className="font-medium line-clamp-2 text-sm">{product.title}</h4>
                                                                    <span className="inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium transition-colors border-transparent bg-secondary text-secondary-foreground">
                                                                        {lang === 'ar' ? 'AR - النسخة العربية' : 'EN - English'}
                                                                    </span>
                                                                    <PriceDisplay
                                                                        priceInOMR={langVariant.price}
                                                                        className="text-sm font-bold text-primary"
                                                                    />
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </>
                                            ) : (
                                                // Old product without language variants
                                                <div className="flex gap-4">
                                                    <R2Image
                                                        r2Key={product.image}
                                                        alt={product.title}
                                                        className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                                                        fallback={
                                                            <div className="w-16 h-16 bg-secondary/30 rounded-lg flex-shrink-0 flex items-center justify-center">
                                                                <Package className="w-6 h-6 text-muted-foreground" />
                                                            </div>
                                                        }
                                                    />
                                                    <div className="space-y-1 flex-1">
                                                        <h4 className="font-medium line-clamp-2 text-sm">{product.title}</h4>
                                                        <PriceDisplay
                                                            priceInOMR={product.price}
                                                            className="text-sm font-bold text-primary"
                                                        />
                                                    </div>
                                                </div>
                                            )
                                        )
                                    )}
                                </div>

                                <div className="border-t border-border/50 my-4" />

                                {/* Discount Code Section */}
                                <div className="space-y-3">
                                    {!appliedDiscount ? (
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium flex items-center gap-2">
                                                <Tag className="w-4 h-4" />
                                                رمز الخصم
                                            </label>
                                            <div className="flex gap-2">
                                                <Input
                                                    value={discountCode}
                                                    onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                                                    placeholder="أدخل رمز الخصم"
                                                    className="font-mono"
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            handleApplyDiscount();
                                                        }
                                                    }}
                                                />
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={handleApplyDiscount}
                                                    disabled={isValidatingDiscount || !discountCode.trim()}
                                                    className="shrink-0"
                                                >
                                                    {isValidatingDiscount ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        'تطبيق'
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Tag className="w-4 h-4 text-green-600" />
                                                    <div>
                                                        <p className="font-mono font-bold text-sm text-green-600">{appliedDiscount.code}</p>
                                                        <p className="text-xs text-muted-foreground">خصم {appliedDiscount.discountPercent}%</p>
                                                    </div>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={handleRemoveDiscount}
                                                    className="h-8 w-8 p-0 text-muted-foreground hover:text-red-600"
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="border-t border-border/50 my-4" />

                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between text-muted-foreground">
                                        <span>عدد المنتجات</span>
                                        <span>{fromCart ? cartItems.length : (languagesParam ? languagesParam.split(',').length : 1)}</span>
                                    </div>
                                    <div className="flex justify-between text-muted-foreground">
                                        <span>المجموع الفرعي</span>
                                        <PriceDisplay priceInOMR={subtotal} />
                                    </div>
                                    {appliedDiscount && (
                                        <div className="flex justify-between text-green-600 font-medium">
                                            <span>الخصم ({appliedDiscount.discountPercent}%)</span>
                                            <span>- <PriceDisplay priceInOMR={appliedDiscount.discountAmount} /></span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-muted-foreground">
                                        <span>الضريبة</span>
                                        <PriceDisplay priceInOMR={0} />
                                    </div>
                                </div>

                                <div className="border-t border-border/50 my-4" />

                                <div className="flex justify-between items-center font-bold text-xl">
                                    <span>الإجمالي</span>
                                    <PriceDisplay
                                        priceInOMR={totalAmount}
                                        className="text-[#8B7355]"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={<div className="container py-20 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div>}>
            <CheckoutContent />
        </Suspense>
    );
}
