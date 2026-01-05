"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Users,
    Package,
    ShoppingCart,
    ArrowUpRight,
    ArrowDownRight,
    DollarSign
} from "lucide-react";
import { cn } from "@/lib/utils";
import { products } from "@/lib/products";
import { SalesChart } from "./_components/sales-chart";

const stats = [
    {
        title: "إجمالي المبيعات",
        value: "12,345 ر.ع",
        change: "+12%",
        trend: "up",
        icon: DollarSign,
        color: "text-emerald-500",
        bg: "bg-emerald-500/10",
    },
    {
        title: "إجمالي الطلبات",
        value: "1,234",
        change: "+8%",
        trend: "up",
        icon: ShoppingCart,
        color: "text-blue-500",
        bg: "bg-blue-500/10",
    },
    {
        title: "المنتجات",
        value: products.length.toString(),
        change: "+2",
        trend: "up",
        icon: Package,
        color: "text-violet-500",
        bg: "bg-violet-500/10",
    },
    {
        title: "المستخدمين",
        value: "890",
        change: "+5%",
        trend: "up",
        icon: Users,
        color: "text-orange-500",
        bg: "bg-orange-500/10",
    },
];

// Map real products to recent orders for demo
const recentOrders = [
    {
        id: "#ORD-001",
        customer: "أحمد محمد",
        product: products[0],
        status: "completed",
        date: "منذ 5 دقائق",
    },
    {
        id: "#ORD-002",
        customer: "سارة علي",
        product: products[1],
        status: "pending",
        date: "منذ 15 دقيقة",
    },
    {
        id: "#ORD-003",
        customer: "خالد عبدالله",
        product: products[2],
        status: "completed",
        date: "منذ ساعة",
    },
    {
        id: "#ORD-004",
        customer: "منى سعيد",
        product: products[3],
        status: "failed",
        date: "منذ ساعتين",
    },
];

export default function DashboardPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">لوحة التحكم</h1>
                <p className="text-muted-foreground mt-2">مرحباً بك في لوحة تحكم ريان للتصميم</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => {
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
                            {recentOrders.map((order) => (
                                <div key={order.id} className="flex items-center justify-between p-4 rounded-xl bg-secondary/20 hover:bg-secondary/40 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                            {order.customer.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-medium">{order.customer}</p>
                                            <p className="text-sm text-muted-foreground">{order.product.title}</p>
                                        </div>
                                    </div>
                                    <div className="text-left">
                                        <p className="font-bold">{order.product.price.toFixed(3)} ر.ع</p>
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
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Sales Chart */}
                <Card className="border-border/50 shadow-sm">
                    <CardHeader>
                        <CardTitle>نظرة عامة على الأداء</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[400px]">
                        <SalesChart />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
