"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, CheckCircle, Package, Download, Mail } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface OrderItem {
    productId: string;
    title: string;
    price: number;
    language?: 'ar' | 'en';
    fileUrl?: string;
}

interface Order {
    _id: string;
    customerInfo: {
        name: string;
        email: string;
        phone: string;
    };
    items: OrderItem[];
    total: number;
    status: string;
    paymentStatus: string;
    thawaniInvoice: string;
    date: string;
}

function SuccessContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get("order_id");

    const [loading, setLoading] = useState(true);
    const [order, setOrder] = useState<Order | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [pollCount, setPollCount] = useState(0);
    const [sendingEmail, setSendingEmail] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    useEffect(() => {
        if (orderId) {
            verifyPayment();
        } else {
            setError("معرف الطلب مفقود");
            setLoading(false);
        }
    }, [orderId]);

    // Poll for payment status updates if payment is pending
    useEffect(() => {
        if (order && order.paymentStatus !== 'paid' && pollCount < 12) {
            const timer = setTimeout(() => {
                verifyPayment(false); // Don't show loader on polling
                setPollCount(prev => prev + 1);
            }, 5000); // Poll every 5 seconds, max 12 times (1 minute)

            return () => clearTimeout(timer);
        }
    }, [order, pollCount]);

    const verifyPayment = async (showLoader = true) => {
        try {
            if (showLoader) setLoading(true);

            // First, try to verify with Thawani API
            const verifyResponse = await fetch(`/api/thawani/verify-session?order_id=${orderId}`);
            const verifyData = await verifyResponse.json();

            if (verifyData.success) {
                // Payment verified with Thawani
                setOrder(verifyData.data.order);

                // Clear cart after successful payment (only if paid)
                if (verifyData.data.order.paymentStatus === 'paid') {
                    localStorage.setItem('cart', JSON.stringify([]));
                    window.dispatchEvent(new Event('cartUpdated'));
                }
            } else {
                // Fallback to just getting order status
                const response = await fetch(`/api/orders/${orderId}`);
                const data = await response.json();

                if (data.success && data.data) {
                    setOrder(data.data);
                    if (data.data.paymentStatus === 'paid') {
                        localStorage.setItem('cart', JSON.stringify([]));
                        window.dispatchEvent(new Event('cartUpdated'));
                    }
                } else {
                    setError(data.error || 'فشل في تحميل الطلب');
                }
            }
        } catch (err) {
            console.error('Payment verification error:', err);
            setError('حدث خطأ أثناء التحقق من الدفع');
        } finally {
            if (showLoader) setLoading(false);
        }
    };

    const handleSendEmail = async () => {
        if (!order) return;

        setSendingEmail(true);
        const loadingToast = toast.loading('جاري إرسال البريد الإلكتروني...');

        try {
            const response = await fetch('/api/send-order-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ orderId: order._id }),
            });

            const data = await response.json();
            toast.dismiss(loadingToast);

            if (data.success) {
                toast.success('✅ تم إرسال المنتجات إلى بريدك الإلكتروني بنجاح!');
                setEmailSent(true);
            } else {
                toast.error(data.error || 'فشل في إرسال البريد الإلكتروني');
            }
        } catch (error) {
            toast.dismiss(loadingToast);
            console.error('Send email error:', error);
            toast.error('حدث خطأ أثناء إرسال البريد الإلكتروني');
        } finally {
            setSendingEmail(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center space-y-4">
                    <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
                    <p className="text-muted-foreground">جاري التحقق من الدفع...</p>
                </div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="container py-20">
                <Card className="max-w-2xl mx-auto border-destructive">
                    <CardContent className="pt-6 text-center space-y-4">
                        <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
                            <Package className="w-8 h-8 text-destructive" />
                        </div>
                        <h2 className="text-2xl font-bold">خطأ في التحقق من الدفع</h2>
                        <p className="text-muted-foreground">{error}</p>
                        <Link href="/ar/products">
                            <Button>العودة للمتجر</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const isPaid = order.paymentStatus === 'paid' && order.status === 'completed';

    return (
        <div className="min-h-screen bg-background py-6 sm:py-12 px-3 sm:px-4">
            <div className="container max-w-4xl mx-auto">
                <Card className={`border-2 ${isPaid ? 'border-green-500' : 'border-yellow-500'}`}>
                    <CardHeader className="text-center">
                        <div className={`w-20 h-20 ${isPaid ? 'bg-green-500/10' : 'bg-yellow-500/10'} rounded-full flex items-center justify-center mx-auto mb-4`}>
                            {isPaid ? (
                                <CheckCircle className="w-10 h-10 text-green-500" />
                            ) : (
                                <Loader2 className="w-10 h-10 text-yellow-500 animate-spin" />
                            )}
                        </div>
                        <CardTitle className="text-3xl font-bold">
                            {isPaid ? 'تم الدفع بنجاح!' : 'جاري معالجة الدفع...'}
                        </CardTitle>
                        <p className="text-muted-foreground mt-2">
                            {isPaid
                                ? 'شكراً لك! تم استلام طلبك وسيتم إرسال تفاصيل الطلب إلى بريدك الإلكتروني.'
                                : 'الدفع قيد المعالجة. قد يستغرق الأمر بضع دقائق.'
                            }
                        </p>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {/* Order Details */}
                        <div className="bg-secondary/20 p-4 sm:p-6 rounded-lg space-y-3 sm:space-y-4">
                            <h3 className="font-semibold text-base sm:text-lg">تفاصيل الطلب</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                                <div>
                                    <p className="text-muted-foreground">رقم الطلب</p>
                                    <p className="font-mono font-medium">{order._id}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">رقم الفاتورة</p>
                                    <p className="font-mono font-medium">{order.thawaniInvoice}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">الاسم</p>
                                    <p className="font-medium">{order.customerInfo.name}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">البريد الإلكتروني</p>
                                    <p className="font-medium">{order.customerInfo.email}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">رقم الهاتف</p>
                                    <p className="font-medium" dir="ltr">{order.customerInfo.phone}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">المبلغ المدفوع</p>
                                    <p className="font-bold text-green-600">{order.total.toFixed(3)} ر.ع</p>
                                </div>
                            </div>
                        </div>

                        {/* Products List */}
                        <div className="space-y-3">
                            <h3 className="font-semibold text-lg">المنتجات المشتراة</h3>
                            {order.items.map((item, index) => (
                                <div key={index} className="flex flex-col gap-3 p-4 bg-secondary/20 rounded-lg">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <p className="font-medium">{item.title}</p>
                                            {item.language && (
                                                <span className="inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium mt-1 border-transparent bg-secondary text-secondary-foreground">
                                                    {item.language === 'ar' ? 'AR - النسخة العربية' : 'EN - English'}
                                                </span>
                                            )}
                                        </div>
                                        <p className="font-bold text-primary mr-4">{item.price.toFixed(3)} ر.ع</p>
                                    </div>
                                    {isPaid && item.fileUrl && (
                                        <a
                                            href={`/api/download?fileUrl=${encodeURIComponent(item.fileUrl)}&productId=${item.productId}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full"
                                        >
                                            <Button size="lg" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold shadow-lg shadow-green-500/50">
                                                <Download className="w-5 h-5 ml-2" />
                                                تحميل الملف
                                            </Button>
                                        </a>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Digital Product Usage Notice */}
                        {isPaid && (
                            <div className="bg-white dark:bg-gray-900 border-3 border-red-500 dark:border-red-600 p-6 rounded-xl shadow-lg">
                                <div className="flex items-start gap-4">
                                    <div className="text-3xl mt-1">📚</div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-xl text-red-600 dark:text-red-500 mb-3">شروط الاستخدام الشخصي</h4>
                                        <p className="text-sm text-red-700 dark:text-red-400 leading-relaxed font-medium">
                                            هذا المنتج الرقمي مخصص للاستخدام الشخصي الفردي فقط من قبل المشتري. يحق لك استخدامه، حفظه، تصويره أو نسخه لنفسك بكل راحة. كل ما نرجوه هو عدم مشاركته مع الآخرين أو إعادة بيعه أو استخدامه لأي غرض تجاري. الهدف من ذلك هو الحفاظ على حقوق العمل واحترام الجهد المبذول فيه ❤️‍🩹
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-4 pt-4">
                            {/* Send Email Button - Prominent */}
                            {isPaid && (
                                <Button
                                    size="lg"
                                    onClick={handleSendEmail}
                                    disabled={sendingEmail}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-500/30"
                                >
                                    {sendingEmail ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin ml-2" />
                                            جاري الإرسال...
                                        </>
                                    ) : emailSent ? (
                                        <>
                                            <Mail className="w-5 h-5 ml-2" />
                                            تم الإرسال إلى بريدك ✓
                                        </>
                                    ) : (
                                        <>
                                            <Mail className="w-5 h-5 ml-2" />
                                            إرسال المنتجات على الإيميل
                                        </>
                                    )}
                                </Button>
                            )}

                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link href="/ar/my-orders" className="flex-1">
                                    <Button className="w-full bg-[#8B7355] hover:bg-[#8B7355]/90">
                                        عرض طلباتي
                                    </Button>
                                </Link>
                                <Link href="/ar/products" className="flex-1">
                                    <Button variant="outline" className="w-full">
                                        العودة للمتجر
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        {!isPaid && (
                            <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-lg">
                                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                                    <strong>ملاحظة:</strong> إذا لم يتم تحديث حالة الدفع خلال 5 دقائق، يرجى الاتصال بالدعم أو تحديث الصفحة.
                                </p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="mt-3"
                                    onClick={() => {
                                        setPollCount(0);
                                        verifyPayment(true);
                                    }}
                                >
                                    تحديث الحالة
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default function PaymentSuccessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        }>
            <SuccessContent />
        </Suspense>
    );
}
