"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Eye, Download, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const initialOrders = [
    { id: "#ORD-001", customer: "أحمد محمد", date: "2024-05-01", amount: "15.000 ر.ع", status: "completed", items: 2 },
    { id: "#ORD-002", customer: "سارة علي", date: "2024-05-02", amount: "5.000 ر.ع", status: "pending", items: 1 },
    { id: "#ORD-003", customer: "خالد عبدالله", date: "2024-05-03", amount: "25.000 ر.ع", status: "completed", items: 3 },
    { id: "#ORD-004", customer: "منى سعيد", date: "2024-05-03", amount: "45.000 ر.ع", status: "failed", items: 1 },
    { id: "#ORD-005", customer: "علي حسن", date: "2024-05-04", amount: "10.000 ر.ع", status: "completed", items: 1 },
];

export default function OrdersPage() {
    const [orders, setOrders] = useState(initialOrders);
    const [searchQuery, setSearchQuery] = useState("");

    const filteredOrders = orders.filter(order =>
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">الفواتير والطلبات</h1>
                    <p className="text-muted-foreground mt-2">متابعة جميع الطلبات والفواتير المالية</p>
                </div>
                <Button variant="outline" className="gap-2">
                    <Download className="w-4 h-4" />
                    تصدير التقرير
                </Button>
            </div>

            <Card className="border-border/50 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <CardTitle className="text-xl font-bold">سجل الطلبات</CardTitle>
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <Button variant="outline" size="icon">
                            <Filter className="w-4 h-4" />
                        </Button>
                        <div className="relative w-full md:w-64">
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="بحث برقم الطلب أو العميل..."
                                className="pr-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-xl border border-border overflow-hidden">
                        <table className="w-full text-sm text-right">
                            <thead className="bg-secondary/50 text-muted-foreground font-medium">
                                <tr>
                                    <th className="p-4">رقم الطلب</th>
                                    <th className="p-4">العميل</th>
                                    <th className="p-4">التاريخ</th>
                                    <th className="p-4">عدد العناصر</th>
                                    <th className="p-4">المبلغ</th>
                                    <th className="p-4">الحالة</th>
                                    <th className="p-4 text-left">إجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filteredOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-secondary/20 transition-colors">
                                        <td className="p-4 font-mono font-bold text-primary">{order.id}</td>
                                        <td className="p-4 font-medium">{order.customer}</td>
                                        <td className="p-4 text-muted-foreground">{order.date}</td>
                                        <td className="p-4">{order.items}</td>
                                        <td className="p-4 font-bold">{order.amount}</td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${order.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' :
                                                    order.status === 'pending' ? 'bg-amber-500/10 text-amber-500' :
                                                        'bg-rose-500/10 text-rose-500'
                                                }`}>
                                                {order.status === 'completed' ? 'مكتمل' :
                                                    order.status === 'pending' ? 'قيد الانتظار' : 'فشل'}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                                                    <Download className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
