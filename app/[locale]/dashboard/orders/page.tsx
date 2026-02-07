"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Eye, Download, Filter, Loader2, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

interface Order {
    _id: string;
    userId?: {
        _id: string;
        name: string;
        email: string;
    };
    customerInfo: {
        name: string;
        email: string;
        phone: string;
    };
    items: Array<{
        productId: string;
        title: string;
        price: number;
    }>;
    total: number;
    status: string;
    paymentMethod: string;
    date: string;
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all"); // all, completed, pending, failed
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/orders');
            const data = await response.json();

            if (data.success) {
                // The API returns { orders: [...], pagination: {...} }
                const ordersData = Array.isArray(data.data?.orders) ? data.data.orders : [];
                setOrders(ordersData);
            } else {
                toast.error('فشل في تحميل الطلبات');
                setOrders([]);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
            toast.error('حدث خطأ أثناء تحميل الطلبات');
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredOrders = Array.isArray(orders) ? orders.filter(order => {
        // Search filter
        const matchesSearch = order._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.customerInfo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.customerInfo.email.toLowerCase().includes(searchQuery.toLowerCase());

        // Status filter
        const matchesStatus = statusFilter === "all" || order.status === statusFilter;

        return matchesSearch && matchesStatus;
    }) : [];

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ar-SA', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusLabel = (status: string) => {
        const labels: { [key: string]: string } = {
            'completed': 'مكتمل',
            'pending': 'قيد الانتظار',
            'failed': 'فشل',
        };
        return labels[status] || status;
    };

    const getPaymentMethodLabel = (method: string) => {
        const labels: { [key: string]: string } = {
            'card': 'بطاقة بنكية',
            'apple': 'Apple Pay',
            'paypal': 'PayPal',
        };
        return labels[method] || method;
    };

    const openOrderDetails = (order: Order) => {
        setSelectedOrder(order);
        setIsDetailOpen(true);
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">الفواتير والطلبات</h1>
                    <p className="text-muted-foreground mt-2">متابعة جميع الطلبات والفواتير المالية</p>
                </div>
            </div>

            <Card className="border-border/50 shadow-sm">
                <CardHeader className="space-y-4 pb-4">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <CardTitle className="text-xl font-bold">سجل الطلبات ({filteredOrders.length})</CardTitle>
                        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                            {/* Status Filter */}
                            <div className="flex items-center gap-2">
                                <Filter className="w-4 h-4 text-muted-foreground" />
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    <option value="all">جميع الحالات</option>
                                    <option value="completed">مكتمل</option>
                                    <option value="pending">قيد الانتظار</option>
                                    <option value="failed">فشل</option>
                                </select>
                            </div>
                            {/* Search */}
                            <div className="relative w-full sm:w-64">
                                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="بحث برقم الطلب أو العميل..."
                                    className="pr-10"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery("")}
                                        className="absolute left-3 top-1/2 -translate-y-1/2"
                                    >
                                        <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                                    </button>
                                )}
                            </div>
                        </div>
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
                                        <th className="p-4">رقم الفاتورة</th>
                                        <th className="p-4">العميل</th>
                                        <th className="p-4">التاريخ</th>
                                        <th className="p-4">المنتجات</th>
                                        <th className="p-4">المبلغ</th>
                                        <th className="p-4">الحالة</th>
                                        <th className="p-4 text-left">إجراءات</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {filteredOrders.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="p-8 text-center text-muted-foreground">
                                                لا توجد طلبات
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredOrders.map((order) => (
                                            <tr key={order._id} className="hover:bg-secondary/20 transition-colors">
                                                <td className="p-4 font-mono text-xs font-bold text-primary">
                                                    #{order._id.slice(-8).toUpperCase()}
                                                </td>
                                                <td className="p-4">
                                                    <div>
                                                        <p className="font-medium">{order.customerInfo.name}</p>
                                                        <p className="text-xs text-muted-foreground">{order.customerInfo.email}</p>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-muted-foreground text-xs">{formatDate(order.date)}</td>
                                                <td className="p-4">
                                                    <div>
                                                        <p className="font-medium line-clamp-1">{order.items[0]?.title}</p>
                                                        {order.items.length > 1 && (
                                                            <p className="text-xs text-muted-foreground">+{order.items.length - 1} منتج آخر</p>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-4 font-bold">{order.total.toFixed(3)} ر.ع</td>
                                                <td className="p-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        order.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' :
                                                        order.status === 'pending' ? 'bg-amber-500/10 text-amber-500' :
                                                        'bg-rose-500/10 text-rose-500'
                                                    }`}>
                                                        {getStatusLabel(order.status)}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                                                            onClick={() => openOrderDetails(order)}
                                                        >
                                                            <Eye className="w-4 h-4" />
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

            {/* Order Details Dialog */}
            <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>تفاصيل الفاتورة</DialogTitle>
                    </DialogHeader>

                    {selectedOrder && (
                        <div className="space-y-6">
                            {/* Order ID */}
                            <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/20">
                                <span className="text-sm text-muted-foreground">رقم الفاتورة</span>
                                <span className="font-mono font-bold text-primary">
                                    #{selectedOrder._id.slice(-8).toUpperCase()}
                                </span>
                            </div>

                            {/* Customer Info */}
                            <div className="space-y-3">
                                <h3 className="font-bold text-lg">معلومات العميل</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">الاسم</p>
                                        <p className="font-medium">{selectedOrder.customerInfo.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">البريد الإلكتروني</p>
                                        <p className="font-medium text-sm">{selectedOrder.customerInfo.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">رقم الهاتف</p>
                                        <p className="font-medium">{selectedOrder.customerInfo.phone}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">تاريخ الطلب</p>
                                        <p className="font-medium text-sm">{formatDate(selectedOrder.date)}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Products */}
                            <div className="space-y-3">
                                <h3 className="font-bold text-lg">المنتجات المشتراة</h3>
                                <div className="space-y-2">
                                    {selectedOrder.items.map((item, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-secondary/20">
                                            <div>
                                                <p className="font-medium">{item.title}</p>
                                                <p className="text-xs text-muted-foreground">Product ID: {item.productId}</p>
                                            </div>
                                            <p className="font-bold">{item.price.toFixed(3)} ر.ع</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Payment Info */}
                            <div className="space-y-3">
                                <h3 className="font-bold text-lg">معلومات الدفع</h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">طريقة الدفع</span>
                                        <span className="font-medium">{getPaymentMethodLabel(selectedOrder.paymentMethod)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">الحالة</span>
                                        <span className={`font-medium ${
                                            selectedOrder.status === 'completed' ? 'text-emerald-500' :
                                            selectedOrder.status === 'pending' ? 'text-amber-500' :
                                            'text-rose-500'
                                        }`}>
                                            {getStatusLabel(selectedOrder.status)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between pt-2 border-t">
                                        <span className="font-bold text-lg">المجموع الكلي</span>
                                        <span className="font-bold text-lg text-primary">{selectedOrder.total.toFixed(3)} ر.ع</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
