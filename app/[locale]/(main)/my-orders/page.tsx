"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Package, Loader2, ShoppingBag, ShieldAlert, ChevronLeft, ChevronRight, Mail } from "lucide-react";
import { toast } from "sonner";
import { PriceDisplay } from "@/components/ui/price-display";

interface Order {
    _id: string;
    items: Array<{
        productId: string;
        title: string;
        price: number;
        language?: 'ar' | 'en';
        fileUrl?: string;
        fileName?: string;
    }>;
    total: number;
    status: string;
    paymentMethod: string;
    date: string;
}

interface Pagination {
    total: number;
    page: number;
    limit: number;
    pages: number;
}

export default function MyOrdersPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [sendingEmail, setSendingEmail] = useState<string | null>(null);
    const [emailSent, setEmailSent] = useState<Set<string>>(new Set());
    const [pagination, setPagination] = useState<Pagination>({
        total: 0,
        page: 1,
        limit: 10,
        pages: 0,
    });

    useEffect(() => {
        if (status === 'unauthenticated') {
            toast.error('يجب تسجيل الدخول لعرض طلباتك');
            router.push('/auth?callbackUrl=/ar/my-orders' as any);
        } else if (status === 'authenticated') {
            fetchMyOrders(1);
        }
    }, [status, router]);

    const fetchMyOrders = async (page: number) => {
        try {
            setLoading(true);
            // Fetch only current user's orders with pagination
            const response = await fetch(`/api/orders/my-orders?page=${page}&limit=10`);
            const data = await response.json();

            if (data.success) {
                // Filter out failed orders - users should only see completed and pending orders
                const activeOrders = data.data.orders.filter(
                    (order: Order) => order.status === 'completed' || order.status === 'pending'
                );
                setOrders(activeOrders);
                // Update pagination to reflect filtered count
                setPagination({
                    ...data.data.pagination,
                    total: activeOrders.length,
                });
            } else {
                // Show more helpful error message
                const errorMsg = data.error || 'فشل في تحميل الطلبات';
                toast.error(errorMsg);

                // If unauthorized, suggest logout/login
                if (response.status === 401) {
                    setTimeout(() => {
                        toast.info('يرجى تسجيل الخروج ثم إعادة تسجيل الدخول لتحديث الجلسة');
                    }, 1000);
                }
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
            toast.error('حدث خطأ أثناء تحميل الطلبات');
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.pages) {
            fetchMyOrders(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ar-SA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const getStatusLabel = (status: string) => {
        const labels: { [key: string]: string } = {
            'completed': 'مكتمل',
            'pending': 'قيد المعالجة',
            'failed': 'فشل',
        };
        return labels[status] || status;
    };

    const handleDownload = async (fileKey: string, fileName: string, productTitle: string, language?: string) => {
        if (!fileKey) {
            toast.error('رابط التحميل غير متوفر');
            return;
        }

        const loadingToast = toast.loading('جاري تجهيز التحميل...');

        try {
            // Request signed URL from API with custom filename
            const response = await fetch('/api/download', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    fileKey,
                    fileName: fileName || productTitle
                }),
            });

            const data = await response.json();

            // Dismiss loading toast
            toast.dismiss(loadingToast);

            if (data.success) {
                // Show success message
                toast.success(`جاري تحميل: ${productTitle}${language ? ` (${language === 'ar' ? 'النسخة العربية' : 'English Version'})` : ''}`);

                // Safari-compatible download: use hidden iframe to trigger download without navigation
                // This works on all browsers including Safari/iOS without opening new tabs
                const iframe = document.createElement('iframe');
                iframe.style.display = 'none';
                iframe.src = data.data.url;

                document.body.appendChild(iframe);

                // Remove iframe after download starts (cleanup)
                setTimeout(() => {
                    document.body.removeChild(iframe);
                }, 5000);
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

    const handleSendEmail = async (orderId: string) => {
        setSendingEmail(orderId);
        const loadingToast = toast.loading('جاري إرسال البريد الإلكتروني...');

        try {
            const response = await fetch('/api/send-order-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ orderId }),
            });

            const data = await response.json();
            toast.dismiss(loadingToast);

            if (data.success) {
                toast.success('✅ تم إرسال المنتجات إلى بريدك الإلكتروني بنجاح!');
                setEmailSent(prev => new Set(prev).add(orderId));
            } else {
                toast.error(data.error || 'فشل في إرسال البريد الإلكتروني');
            }
        } catch (error) {
            toast.dismiss(loadingToast);
            console.error('Send email error:', error);
            toast.error('حدث خطأ أثناء إرسال البريد الإلكتروني');
        } finally {
            setSendingEmail(null);
        }
    };

    if (loading || status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen py-4 sm:py-12 px-4 sm:px-4">
            <div className="container max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-4 sm:mb-8">
                    <h1 className="text-xl sm:text-3xl font-bold mb-1 sm:mb-2">طلباتي السابقة</h1>
                    <p className="text-xs sm:text-base text-muted-foreground">
                        عرض جميع مشترياتك وتحميل المنتجات الرقمية
                    </p>
                </div>

                {/* Terms Message */}
                {orders.length > 0 && (
                    <Card className="border-red-500/50 bg-white dark:bg-gray-900 mb-4 sm:mb-6 shadow-lg">
                        <CardContent className="p-3 sm:p-6">
                            <div className="flex gap-2 sm:gap-4">
                                <div className="flex-shrink-0 mt-0.5">
                                    <ShieldAlert className="w-5 h-5 sm:w-7 sm:h-7 text-red-600" />
                                </div>
                                <div className="space-y-1 sm:space-y-2 text-xs sm:text-base leading-relaxed">
                                    <p className="font-bold text-sm sm:text-lg text-red-600 dark:text-red-500">
                                        شروط الاستخدام:
                                    </p>
                                    <p className="text-red-700 dark:text-red-400 font-medium">
                                        هذا المنتج الرقمي مخصص للاستخدام الشخصي الفردي فقط من قبل المشتري.
                                        يحق لك استخدامه، حفظه، تصويره أو نسخه لنفسك بكل راحة.
                                        كل ما نرجوه هو عدم مشاركته مع الآخرين أو إعادة بيعه أو استخدامه لأي غرض تجاري.
                                        الهدف من ذلك هو الحفاظ على حقوق العمل واحترام الجهد المبذول فيه ❤️‍🩹
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Orders List */}
                {orders.length === 0 ? (
                    <Card className="border-border/50">
                        <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16 px-4">
                            <ShoppingBag className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground mb-3 sm:mb-4" />
                            <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">لا توجد طلبات</h3>
                            <p className="text-muted-foreground mb-4 sm:mb-6 text-center text-sm sm:text-base">
                                لم تقم بشراء أي منتجات بعد
                            </p>
                            <Button onClick={() => router.push('/products' as any)} className="h-10 sm:h-9">
                                تصفح المنتجات
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-3 sm:space-y-4">
                        {orders.map((order) => (
                            <Card key={order._id} className="border-border/50 shadow-sm">
                                <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-6">
                                    <div className="flex flex-col gap-3">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                                            <div className="flex items-start justify-between sm:block">
                                                <div>
                                                    <CardTitle className="text-base sm:text-lg">
                                                        طلب #{order._id.slice(-8).toUpperCase()}
                                                    </CardTitle>
                                                    <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
                                                        {formatDate(order.date)}
                                                    </p>
                                                </div>
                                                <span className={`sm:hidden inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                                    order.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' :
                                                    order.status === 'pending' ? 'bg-amber-500/10 text-amber-500' :
                                                    'bg-rose-500/10 text-rose-500'
                                                }`}>
                                                    {getStatusLabel(order.status)}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between sm:text-left">
                                                <PriceDisplay
                                                    priceInOMR={order.total}
                                                    className="font-bold text-base sm:text-lg"
                                                />
                                                <span className={`hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mr-3 ${
                                                    order.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' :
                                                    order.status === 'pending' ? 'bg-amber-500/10 text-amber-500' :
                                                    'bg-rose-500/10 text-rose-500'
                                                }`}>
                                                    {getStatusLabel(order.status)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Send Email Button - Prominent at top */}
                                        {order.status === 'completed' && (
                                            <Button
                                                size="sm"
                                                onClick={() => handleSendEmail(order._id)}
                                                disabled={sendingEmail === order._id}
                                                className="w-full h-10 text-sm font-bold gap-2 bg-blue-600 hover:bg-blue-700 shadow-md"
                                            >
                                                {sendingEmail === order._id ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                        جاري الإرسال...
                                                    </>
                                                ) : emailSent.has(order._id) ? (
                                                    <>
                                                        <Mail className="w-4 h-4" />
                                                        تم الإرسال إلى بريدك ✓
                                                    </>
                                                ) : (
                                                    <>
                                                        <Mail className="w-4 h-4" />
                                                        إرسال المنتجات على الإيميل
                                                    </>
                                                )}
                                            </Button>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="p-3 sm:p-6">
                                    <div className="space-y-2 sm:space-y-3">
                                        {order.items.map((item, index) => (
                                            <div
                                                key={index}
                                                className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 rounded-lg bg-secondary/20 gap-3"
                                            >
                                                <div className="flex items-start sm:items-center gap-2 sm:gap-3 flex-1 min-w-0">
                                                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-secondary/50 flex items-center justify-center flex-shrink-0">
                                                        <Package className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium text-sm sm:text-base leading-snug">{item.title}</p>
                                                        {item.language && (
                                                            <div className="mt-1">
                                                                <span className="inline-flex items-center rounded-md border px-1.5 sm:px-2 py-0.5 text-xs font-medium transition-colors border-transparent bg-secondary text-secondary-foreground">
                                                                    {item.language === 'ar' ? 'AR - النسخة العربية' : 'EN - English Version'}
                                                                </span>
                                                            </div>
                                                        )}
                                                        <PriceDisplay
                                                            priceInOMR={item.price}
                                                            className="text-xs sm:text-sm text-muted-foreground mt-1"
                                                        />
                                                    </div>
                                                </div>
                                                {order.status === 'completed' && item.fileUrl && (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleDownload(item.fileUrl!, item.fileName || item.title, item.title, item.language)}
                                                        className="gap-2 bg-green-600 hover:bg-green-700 w-full sm:w-auto h-10 sm:h-9 text-sm font-medium"
                                                    >
                                                        <Download className="w-4 h-4" />
                                                        تحميل
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Canva Request Button */}
                                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => window.open("https://wa.me/96895534007", "_blank")}
                                            className="w-full sm:w-auto h-10 sm:h-9 text-sm"
                                        >
                                            طلب نسخة من كانفا
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}

                        {/* Pagination */}
                        {pagination.pages > 1 && (
                            <div className="flex items-center justify-center gap-1 sm:gap-2 mt-4 sm:mt-8">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(pagination.page - 1)}
                                    disabled={pagination.page === 1}
                                    className="h-10 sm:h-9 px-3 sm:px-4"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                    <span className="hidden sm:inline mr-1">السابق</span>
                                </Button>

                                <div className="flex items-center gap-1">
                                    {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => {
                                        let pageNum;
                                        if (pagination.pages <= 5) {
                                            pageNum = i + 1;
                                        } else if (pagination.page <= 3) {
                                            pageNum = i + 1;
                                        } else if (pagination.page >= pagination.pages - 2) {
                                            pageNum = pagination.pages - 4 + i;
                                        } else {
                                            pageNum = pagination.page - 2 + i;
                                        }
                                        return (
                                            <Button
                                                key={pageNum}
                                                variant={pageNum === pagination.page ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => handlePageChange(pageNum)}
                                                className="w-10 h-10 sm:w-10 sm:h-9 text-sm p-0 min-w-[40px]"
                                            >
                                                {pageNum}
                                            </Button>
                                        );
                                    })}
                                </div>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(pagination.page + 1)}
                                    disabled={pagination.page === pagination.pages}
                                    className="h-10 sm:h-9 px-3 sm:px-4"
                                >
                                    <span className="hidden sm:inline ml-1">التالي</span>
                                    <ChevronLeft className="w-4 h-4" />
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
