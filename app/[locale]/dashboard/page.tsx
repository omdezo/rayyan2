"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Users,
    Package,
    ShoppingCart,
    ArrowUpRight,
    ArrowDownRight,
    DollarSign,
    Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SalesChart } from "./_components/sales-chart";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface DashboardStats {
    totalSales: {
        value: string;
        change: string;
        trend: 'up' | 'down';
    };
    totalOrders: {
        value: number;
        change: string;
        trend: 'up' | 'down';
    };
    products: {
        value: number;
        change: string;
        trend: 'up' | 'down';
    };
    users: {
        value: number;
        change: string;
        trend: 'up' | 'down';
    };
    recentOrders: Array<{
        _id: string;
        customerInfo: {
            name: string;
        };
        items: Array<{
            title: string;
            price: number;
        }>;
        total: number;
        status: string;
        date: Date;
    }>;
    salesChartData: any;
}

export default function DashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch('/api/stats');
                const data = await response.json();

                if (data.success) {
                    setStats(data.data);
                } else {
                    toast.error('فشل في تحميل الإحصائيات');
                }
            } catch (error) {
                console.error('Error fetching stats:', error);
                toast.error('حدث خطأ أثناء تحميل البيانات');
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <p className="text-muted-foreground">لا توجد بيانات متاحة</p>
            </div>
        );
    }

    const statsCards = [
        {
            title: "إجمالي المبيعات",
            value: stats.totalSales.value,
            change: stats.totalSales.change,
            trend: stats.totalSales.trend,
            icon: DollarSign,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
        },
        {
            title: "إجمالي الطلبات",
            value: stats.totalOrders.value.toString(),
            change: stats.totalOrders.change,
            trend: stats.totalOrders.trend,
            icon: ShoppingCart,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
        },
        {
            title: "المنتجات",
            value: stats.products.value.toString(),
            change: stats.products.change,
            trend: stats.products.trend,
            icon: Package,
            color: "text-violet-500",
            bg: "bg-violet-500/10",
        },
        {
            title: "المستخدمين",
            value: stats.users.value.toString(),
            change: stats.users.change,
            trend: stats.users.trend,
            icon: Users,
            color: "text-orange-500",
            bg: "bg-orange-500/10",
        },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">لوحة التحكم</h1>
                <p className="text-muted-foreground mt-2">مرحباً بك في لوحة تحكم ريان للتصميم</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statsCards.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <Card key={index} className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div className={cn("p-3 rounded-xl", stat.bg)}>
                                        <Icon className={cn("w-6 h-6", stat.color)} />
                                    </div>
                                    <div className={cn(
                                        "flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-full",
                                        stat.trend === "up" ? "text-emerald-500 bg-emerald-500/10" : "text-rose-500 bg-rose-500/10"
                                    )}>
                                        <span>{stat.change}</span>
                                        {stat.trend === "up" ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                    </div>
                                </div>
                                <div className="mt-4 space-y-1">
                                    <h3 className="text-2xl font-bold">{stat.value}</h3>
                                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="border-border/50 shadow-sm">
                    <CardHeader>
                        <CardTitle>آخر الطلبات</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {stats.recentOrders && stats.recentOrders.length > 0 ? (
                                stats.recentOrders.map((order) => (
                                    <div key={order._id} className="flex items-center justify-between p-4 rounded-xl bg-secondary/20 hover:bg-secondary/40 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                {order.customerInfo.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-medium">{order.customerInfo.name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {order.items[0]?.title || 'منتج'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-left">
                                            <p className="font-bold">{order.total.toFixed(3)} ر.ع</p>
                                            <span className={cn(
                                                "text-xs px-2 py-1 rounded-full",
                                                order.status === "completed" && "bg-emerald-500/10 text-emerald-500",
                                                order.status === "pending" && "bg-amber-500/10 text-amber-500",
                                                order.status === "failed" && "bg-rose-500/10 text-rose-500",
                                            )}>
                                                {order.status === "completed" && "مكتمل"}
                                                {order.status === "pending" && "قيد الانتظار"}
                                                {order.status === "failed" && "فشل"}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-muted-foreground py-8">لا توجد طلبات حديثة</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Sales Chart */}
                <Card className="border-border/50 shadow-sm">
                    <CardHeader>
                        <CardTitle>نظرة عامة على الأداء</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[400px]">
                        <SalesChart data={stats.salesChartData} />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}