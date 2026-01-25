"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Download, Loader2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

interface OrderItem {
    productId: string;
    title: string;
    price: number;
    language?: 'ar' | 'en';
    fileUrl?: string;
}

interface Order {
    _id: string;
    items: OrderItem[];
    total: number;
    status: string;
    date: string;
}

function SuccessContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const orderId = searchParams.get("orderId");

    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (orderId) {
            fetchOrder();
        } else {
            setLoading(false);
        }
    }, [orderId]);

    const fetchOrder = async () => {
        try {
            const response = await fetch(`/api/orders/${orderId}`);
            const data = await response.json();

            if (data.success) {
                setOrder(data.data);
            } else {
                toast.error('فشل في تحميل بيانات الطلب');
            }
        } catch (error) {
            console.error('Error fetching order:', error);
            toast.error('حدث خطأ أثناء تحميل الطلب');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (fileKey: string, title: string, language?: string) => {
        if (!fileKey) {
            toast.error('رابط التحميل غير متوفر');
            return;
        }

        const loadingToast = toast.loading('جاري تجهيز التحميل...');

        try {
            // Request signed URL from API
            const response = await fetch('/api/download', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ fileKey }),
            });

            const data = await response.json();

            // Dismiss loading toast
            toast.dismiss(loadingToast);

            if (data.success) {
                const link = document.createElement('a');
                link.href = data.data.url;
                link.target = '_blank';
                link.download = title;
                link.click();

                toast.success(`جاري تحميل: ${title}${language ? ` (${language === 'ar' ? 'النسخة العربية' : 'English Version'})` : ''}`);
            } else {
                toast.error(data.error || 'فشل في تحميل الملف');
            }
        } catch (error) {
            // Dismiss loading toast on error
            toast.dismiss(loadingToast);
            console.error('Download error:', error);
            toast.error('فشل في تحميل الملف');
        }
    };

    if (loading) {
        return (
            <div className="container py-20 px-4 text-center flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!orderId || !order) {
        return (
            <div className="container py-20 px-4 text-center flex flex-col items-center justify-center min-h-[60vh]">
                <h1 className="text-2xl font-bold mb-4">الطلب غير موجود</h1>
                <Button onClick={() => router.push("/products")}>
                    العودة للمنتجات
                </Button>
            </div>
        );
    }

    return (
        <div className="container py-12 px-4 max-w-3xl mx-auto">
            {/* Success Header */}
            <div className="text-center mb-8">
                <div className="h-20 w-20 rounded-full bg-green-500/20 flex items-center justify-center mb-4 text-green-500 mx-auto">
                    <CheckCircle className="h-10 w-10" />
                </div>
                <h1 className="text-3xl font-bold mb-2">تم الدفع بنجاح!</h1>
                <p className="text-muted-foreground text-lg">
                    شكراً لشرائك. يمكنك تحميل ملفاتك الآن
                </p>
            </div>

            {/* Download Section */}
            <Card className="border-border/50 mb-6">
                <CardContent className="p-6">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Download className="w-5 h-5" />
                        تحميل المنتجات
                    </h2>
                    <div className="space-y-3">
                        {order.items.map((item, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between p-4 rounded-lg bg-secondary/20"
                            >
                                <div>
                                    <p className="font-medium">{item.title}</p>
                                    {item.language && (
                                        <span className="inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium mt-1 transition-colors border-transparent bg-secondary text-secondary-foreground">
                                            {item.language === 'ar' ? 'AR - النسخة العربية' : 'EN - English Version'}
                                        </span>
                                    )}
                                </div>
                                {item.fileUrl && (
                                    <Button
                                        size="sm"
                                        onClick={() => handleDownload(item.fileUrl!, item.title, item.language)}
                                        className="gap-2"
                                    >
                                        <Download className="w-4 h-4" />
                                        تحميل
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Terms Message */}
            <Card className="border-amber-500/30 bg-amber-500/5 mb-6">
                <CardContent className="p-6">
                    <div className="flex gap-4">
                        <div className="flex-shrink-0">
                            <ShieldAlert className="w-6 h-6 text-amber-600" />
                        </div>
                        <div className="space-y-2 text-sm leading-relaxed">
                            <p className="font-semibold text-amber-900 dark:text-amber-100">
                                شروط الاستخدام:
                            </p>
                            <p className="text-amber-800 dark:text-amber-200">
                                هذا المنتج الرقمي مخصص للاستخدام الشخصي الفردي فقط من قبل المشتري.
                                يحق لك استخدامه، حفظه، تصويره أو نسخه لنفسك بكل راحة.
                                كل ما نرجوه هو عدم مشاركته مع الآخرين أو إعادة بيعه أو استخدامه لأي غرض تجاري.
                                الهدف من ذلك هو الحفاظ على حقوق العمل واحترام الجهد المبذول فيه ❤️‍🩹
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                    variant="outline"
                    size="lg"
                    onClick={() => router.push("/my-orders")}
                    className="h-12"
                >
                    عرض طلباتي
                </Button>
                <Button
                    variant="outline"
                    size="lg"
                    onClick={() => router.push("/products")}
                    className="h-12"
                >
                    تصفح المزيد من المنتجات
                </Button>
                <Button
                    variant="default"
                    size="lg"
                    onClick={() => window.open("https://wa.me/96895534007", "_blank")}
                    className="h-12"
                >
                    طلب نسخة من كانفا
                </Button>
            </div>
        </div>
    );
}

export default function SuccessPage() {
    return (
        <Suspense fallback={
            <div className="container py-20 px-4 text-center flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        }>
            <SuccessContent />
        </Suspense>
    );
}
