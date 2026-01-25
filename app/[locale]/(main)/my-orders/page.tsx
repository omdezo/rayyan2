"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Package, Loader2, ShoppingBag, ShieldAlert, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

interface Order {
    _id: string;
    items: Array<{
        productId: string;
        title: string;
        price: number;
        language?: 'ar' | 'en';
        fileUrl?: string;
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
    const [pagination, setPagination] = useState<Pagination>({
        total: 0,
        page: 1,
        limit: 10,
        pages: 0,
    });

    useEffect(() => {
        if (status === 'unauthenticated') {
            toast.error('يجب تسجيل الدخول لعرض طلباتك');
            router.push('/login?callbackUrl=/ar/my-orders' as any);
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
                setOrders(data.data.orders);
                setPagination(data.data.pagination);
            } else {
                toast.error('فشل في تحميل الطلبات');
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

    const handleDownload = async (fileKey: string, productTitle: string, language?: string) => {
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
                // Open signed URL in new tab for download
                const link = document.createElement('a');
                link.href = data.data.url;
                link.target = '_blank';
                link.download = productTitle;
                link.click();

                toast.success(`جاري تحميل: ${productTitle}${language ? ` (${language === 'ar' ? 'النسخة العربية' : 'English Version'})` : ''}`);
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

    if (loading || status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen py-6 sm:py-12 px-3 sm:px-4">
            <div className="container max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-6 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold mb-2">طلباتي السابقة</h1>
                    <p className="text-sm sm:text-base text-muted-foreground">
                        عرض جميع مشترياتك وتحميل المنتجات الرقمية
                    </p>
                </div>

                {/* Terms Message */}
                {orders.length > 0 && (
                    <Card className="border-red-500/50 bg-white dark:bg-gray-900 mb-6 shadow-lg">
                        <CardContent className="p-4 sm:p-6">
                            <div className="flex gap-3 sm:gap-4">
                                <div className="flex-shrink-0 mt-0.5">
                                    <ShieldAlert className="w-6 h-6 sm:w-7 sm:h-7 text-red-600" />
                                </div>
                                <div className="space-y-2 text-sm sm:text-base leading-relaxed">
                                    <p className="font-bold text-lg text-red-600 dark:text-red-500">
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
                        <CardContent className="flex flex-col items-center justify-center py-16">
                            <ShoppingBag className="w-16 h-16 text-muted-foreground mb-4" />
                            <h3 className="text-xl font-bold mb-2">لا توجد طلبات</h3>
                            <p className="text-muted-foreground mb-6 text-center">
                                لم تقم بشراء أي منتجات بعد
                            </p>
                            <Button onClick={() => router.push('/products' as any)}>
                                تصفح المنتجات
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <Card key={order._id} className="border-border/50 shadow-sm">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-lg">
                                                طلب #{order._id.slice(-8).toUpperCase()}
                                            </CardTitle>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {formatDate(order.date)}
                                            </p>
                                        </div>
                                        <div className="text-left">
                                            <p className="font-bold text-lg">{order.total.toFixed(3)} ر.ع</p>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                order.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' :
                                                order.status === 'pending' ? 'bg-amber-500/10 text-amber-500' :
                                                'bg-rose-500/10 text-rose-500'
                                            }`}>
                                                {getStatusLabel(order.status)}
                                            </span>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {order.items.map((item, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between p-4 rounded-lg bg-secondary/20"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 rounded-lg bg-secondary/50 flex items-center justify-center">
                                                        <Package className="w-6 h-6 text-muted-foreground" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{item.title}</p>
                                                        {item.language && (
                                                            <div className="mt-1">
                                                                <span className="inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium transition-colors border-transparent bg-secondary text-secondary-foreground">
                                                                    {item.language === 'ar' ? 'AR - النسخة العربية' : 'EN - English Version'}
                                                                </span>
                                                            </div>
                                                        )}
                                                        <p className="text-sm text-muted-foreground mt-1">
                                                            {item.price.toFixed(3)} ر.ع
                                                        </p>
                                                    </div>
                                                </div>
                                                {order.status === 'completed' && item.fileUrl && (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleDownload(item.fileUrl!, item.title, item.language)}
                                                        className="gap-2 bg-green-600 hover:bg-green-700"
                                                    >
                                                        <Download className="w-4 h-4" />
                                                        تحميل
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Canva Request Button */}
                                    <div className="mt-4 pt-4 border-t">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => window.open("https://wa.me/96895534007", "_blank")}
                                            className="w-full sm:w-auto"
                                        >
                                            طلب نسخة من كانفا
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}

                        {/* Pagination */}
                        {pagination.pages > 1 && (
                            <div className="flex items-center justify-center gap-1 sm:gap-2 mt-6 sm:mt-8">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(pagination.page - 1)}
                                    disabled={pagination.page === 1}
                                    className="h-9 px-2 sm:px-4"
                                >
                                    <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
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
                                                className="w-8 h-9 sm:w-10 text-xs sm:text-sm p-0"
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
                                    className="h-9 px-2 sm:px-4"
                                >
                                    <span className="hidden sm:inline ml-1">التالي</span>
                                    <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
