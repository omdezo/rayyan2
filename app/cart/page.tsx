"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

// Mock cart data
const initialCart = [
    {
        id: "1",
        title: "لعبة الذكاء الاصطناعي - النسخة العمانية",
        price: 5.0,
        image: "/placeholder-game.jpg",
    },
    {
        id: "2",
        title: "عرض تقديمي - اليوم الوطني السعودي",
        price: 3.5,
        image: "/placeholder-saudi.jpg",
    },
];

export default function CartPage() {
    const [cart, setCart] = useState(initialCart);

    const removeItem = (id: string) => {
        setCart(cart.filter((item) => item.id !== id));
    };

    const total = cart.reduce((sum, item) => sum + item.price, 0);

    return (
        <div className="container py-10 px-4 min-h-[80vh]">
            <h1 className="text-3xl font-bold mb-8">سلة المشتريات</h1>

            {cart.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-4">
                        {cart.map((item) => (
                            <Card key={item.id} className="flex flex-row items-center p-4 gap-4">
                                <div className="h-20 w-20 bg-muted rounded-md flex-shrink-0" />
                                <div className="flex-1">
                                    <h3 className="font-semibold line-clamp-1">{item.title}</h3>
                                    <p className="text-primary font-bold mt-1">{item.price.toFixed(3)} ر.ع</p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                                    onClick={() => removeItem(item.id)}
                                >
                                    <Trash2 className="h-5 w-5" />
                                </Button>
                            </Card>
                        ))}
                    </div>

                    {/* Summary */}
                    <div className="lg:col-span-1">
                        <Card>
                            <CardHeader>
                                <CardTitle>ملخص الطلب</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between text-lg font-bold">
                                    <span>الإجمالي</span>
                                    <span>{total.toFixed(3)} ر.ع</span>
                                </div>
                                <Button className="w-full h-12 text-lg" asChild>
                                    <Link href="/checkout">
                                        متابعة الدفع
                                    </Link>
                                </Button>
                                <Button variant="outline" className="w-full" asChild>
                                    <Link href="/products">
                                        متابعة التسوق
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            ) : (
                <div className="text-center py-20">
                    <p className="text-muted-foreground text-lg mb-6">سلة المشتريات فارغة</p>
                    <Button size="lg" asChild>
                        <Link href="/products">
                            تصفح المنتجات <ArrowLeft className="mr-2 h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            )}
        </div>
    );
}
