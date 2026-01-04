"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { products } from "@/lib/products";
import { Loader2 } from "lucide-react";

function CheckoutContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const productId = searchParams.get("productId");
    const product = products.find((p) => p.id === productId);

    const [isLoading, setIsLoading] = useState(false);

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate payment processing
        await new Promise((resolve) => setTimeout(resolve, 2000));
        router.push("/success");
    };

    if (!product) {
        return (
            <div className="container py-20 text-center">
                <p>المنتج غير موجود</p>
            </div>
        );
    }

    return (
        <div className="container py-10 px-4 max-w-lg mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-center">إتمام الشراء</h1>

            <Card>
                <CardHeader>
                    <CardTitle>ملخص الطلب</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex justify-between items-center border-b border-border/50 pb-4">
                        <span className="font-medium">{product.title}</span>
                        <span>{product.price.toFixed(3)} ر.ع</span>
                    </div>

                    <div className="flex justify-between items-center font-bold text-lg">
                        <span>الإجمالي</span>
                        <span className="text-primary">{product.price.toFixed(3)} ر.ع</span>
                    </div>

                    <form onSubmit={handlePayment} className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium">البريد الإلكتروني (لاستلام الملف)</label>
                            <Input id="email" type="email" placeholder="name@example.com" required />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="card" className="text-sm font-medium">بيانات البطاقة (تجريبي)</label>
                            <Input id="card" placeholder="0000 0000 0000 0000" disabled />
                        </div>

                        <Button type="submit" className="w-full h-12 text-lg mt-4" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    جاري المعالجة...
                                </>
                            ) : (
                                "دفع الآن"
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={<div className="container py-20 text-center">جاري التحميل...</div>}>
            <CheckoutContent />
        </Suspense>
    );
}
