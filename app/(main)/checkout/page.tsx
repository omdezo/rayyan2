"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { products } from "@/lib/products";
import { Loader2, CreditCard, Smartphone, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

function CheckoutContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const productId = searchParams.get("productId");
    const product = products.find((p) => p.id === productId);

    const [isLoading, setIsLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<"card" | "apple" | "paypal">("card");

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
                <Button onClick={() => router.push("/products")} className="mt-4">
                    العودة للمتجر
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background py-12 px-4">
            <div className="container max-w-6xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Right Column - Checkout Form (lg:col-span-7) */}
                    <div className="lg:col-span-7 space-y-8 order-2 lg:order-1">
                        <Card className="border-border/50 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-2xl font-bold">إتمام الشراء</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handlePayment} className="space-y-8">

                                    {/* Contact Info */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold">بيانات التواصل</h3>

                                        <div className="space-y-2">
                                            <label htmlFor="email" className="text-sm font-medium text-muted-foreground">البريد الإلكتروني</label>
                                            <Input id="email" type="email" placeholder="example@mail.com" className="h-12 bg-secondary/20" required />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label htmlFor="name" className="text-sm font-medium text-muted-foreground">الاسم الكامل</label>
                                                <Input id="name" placeholder="الاسم" className="h-12 bg-secondary/20" required />
                                            </div>
                                            <div className="space-y-2">
                                                <label htmlFor="phone" className="text-sm font-medium text-muted-foreground">رقم الهاتف (واتساب)</label>
                                                <div className="relative">
                                                    <Input id="phone" placeholder="+968" className="h-12 bg-secondary/20 text-left" dir="ltr" required />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Payment Method */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold">طريقة الدفع</h3>
                                        <div className="grid grid-cols-3 gap-4">
                                            <button
                                                type="button"
                                                onClick={() => setPaymentMethod("paypal")}
                                                className={cn(
                                                    "flex flex-col items-center justify-center gap-2 h-24 rounded-xl border transition-all",
                                                    paymentMethod === "paypal"
                                                        ? "border-primary bg-primary/5 text-primary"
                                                        : "border-border/50 hover:border-primary/50 hover:bg-secondary/20"
                                                )}
                                            >
                                                <Wallet className="w-6 h-6" />
                                                <span className="text-sm font-medium">PayPal</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setPaymentMethod("apple")}
                                                className={cn(
                                                    "flex flex-col items-center justify-center gap-2 h-24 rounded-xl border transition-all",
                                                    paymentMethod === "apple"
                                                        ? "border-primary bg-primary/5 text-primary"
                                                        : "border-border/50 hover:border-primary/50 hover:bg-secondary/20"
                                                )}
                                            >
                                                <Smartphone className="w-6 h-6" />
                                                <span className="text-sm font-medium">Apple Pay</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setPaymentMethod("card")}
                                                className={cn(
                                                    "flex flex-col items-center justify-center gap-2 h-24 rounded-xl border transition-all",
                                                    paymentMethod === "card"
                                                        ? "border-primary bg-primary/5 text-primary"
                                                        : "border-border/50 hover:border-primary/50 hover:bg-secondary/20"
                                                )}
                                            >
                                                <CreditCard className="w-6 h-6" />
                                                <span className="text-sm font-medium">بطاقة بنكية</span>
                                            </button>
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full h-14 text-lg font-bold bg-[#8B7355] hover:bg-[#8B7355]/90 text-white shadow-lg shadow-[#8B7355]/20 rounded-xl mt-8"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                جاري المعالجة...
                                            </>
                                        ) : (
                                            `دفع ${product.price.toFixed(3)} ر.ع`
                                        )}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Left Column - Order Summary (lg:col-span-5) */}
                    <div className="lg:col-span-5 order-1 lg:order-2">
                        <Card className="border-border/50 shadow-sm sticky top-24">
                            <CardHeader>
                                <CardTitle className="text-xl font-bold">ملخص الطلب</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex gap-4">
                                    <div className="w-20 h-20 bg-secondary/30 rounded-lg flex-shrink-0" />
                                    <div className="space-y-1">
                                        <h4 className="font-medium line-clamp-2">{product.title}</h4>
                                        <p className="text-sm text-muted-foreground">PPT - النسخة العمانية</p>
                                    </div>
                                </div>

                                <div className="border-t border-border/50 my-4" />

                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between text-muted-foreground">
                                        <span>المجموع الفرعي</span>
                                        <span>{product.price.toFixed(3)} ر.ع</span>
                                    </div>
                                    <div className="flex justify-between text-muted-foreground">
                                        <span>الضريبة</span>
                                        <span>0.000 ر.ع</span>
                                    </div>
                                </div>

                                <div className="border-t border-border/50 my-4" />

                                <div className="flex justify-between items-center font-bold text-xl">
                                    <span>الإجمالي</span>
                                    <span className="text-[#8B7355]">{product.price.toFixed(3)} ر.ع</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                </div>
            </div>
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
