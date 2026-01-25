"use client";

import { useState, useEffect } from "react";
import { useRouter } from "@/i18n/routing";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, ShoppingBag, Loader2 } from "lucide-react";
import { Link } from "@/i18n/routing";
import { toast } from "sonner";
import { R2Image } from "@/components/ui/r2-image";

interface CartItem {
    id: string;
    productId: string;
    title: string;
    price: number;
    image: string;
    quantity: number;
    language?: 'ar' | 'en';
    fileUrl?: string;
}

export default function CartPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [cart, setCart] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCart();
    }, []);

    const loadCart = () => {
        try {
            const cartData = localStorage.getItem('cart');
            const parsedCart = cartData ? JSON.parse(cartData) : [];
            setCart(parsedCart);
        } catch (error) {
            console.error('Error loading cart:', error);
            setCart([]);
        } finally {
            setLoading(false);
        }
    };

    const removeItem = (id: string) => {
        const updatedCart = cart.filter((item) => item.id !== id);
        setCart(updatedCart);
        localStorage.setItem('cart', JSON.stringify(updatedCart));

        // Dispatch event to update cart count in header
        window.dispatchEvent(new Event('cartUpdated'));

        toast.success('تم إزالة المنتج من السلة');
    };

    const clearCart = () => {
        setCart([]);
        localStorage.setItem('cart', JSON.stringify([]));
        window.dispatchEvent(new Event('cartUpdated'));
        toast.success('تم مسح السلة');
    };

    const handleCheckout = () => {
        if (status === 'unauthenticated') {
            toast.error('يجب تسجيل الدخول أولاً للمتابعة');
            const currentPath = '/ar/cart';
            router.push(`/login?callbackUrl=${encodeURIComponent(currentPath)}` as any);
            return;
        }

        // Navigate to checkout with cart data
        router.push('/checkout?fromCart=true' as any);
    };

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container py-10 px-4 min-h-[80vh]">
            <div className="mb-8 flex items-center justify-between">
                <h1 className="text-3xl font-bold">سلة المشتريات</h1>
                {cart.length > 0 && (
                    <Button variant="ghost" size="sm" onClick={clearCart} className="text-destructive hover:text-destructive">
                        <Trash2 className="w-4 h-4 ml-2" />
                        مسح السلة
                    </Button>
                )}
            </div>

            {cart.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-4">
                        {cart.map((item) => (
                            <Card key={item.id} className="border-border/50">
                                <CardContent className="flex flex-row items-center p-4 gap-4">
                                    <div className="h-20 w-20 bg-muted rounded-md flex-shrink-0 overflow-hidden">
                                        <R2Image
                                            r2Key={item.image}
                                            alt={item.title}
                                            className="w-full h-full object-cover"
                                            fallback={
                                                <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                                                    صورة
                                                </div>
                                            }
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold line-clamp-1">{item.title}</h3>
                                        {item.language && (
                                            <div className="flex items-center gap-1 mt-1">
                                                <span className="inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium transition-colors border-transparent bg-secondary text-secondary-foreground">
                                                    {item.language === 'ar' ? 'AR - النسخة العربية' : 'EN - English Version'}
                                                </span>
                                            </div>
                                        )}
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
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Summary */}
                    <div className="lg:col-span-1">
                        <Card className="border-border/50 sticky top-4">
                            <CardHeader>
                                <CardTitle>ملخص الطلب</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">عدد المنتجات</span>
                                        <span className="font-medium">{cart.length}</span>
                                    </div>
                                    <div className="flex justify-between text-lg font-bold border-t pt-2">
                                        <span>الإجمالي</span>
                                        <span className="text-primary">{total.toFixed(3)} ر.ع</span>
                                    </div>
                                </div>
                                <Button className="w-full h-12 text-lg" onClick={handleCheckout}>
                                    متابعة الدفع
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
                    <ShoppingBag className="w-20 h-20 text-muted-foreground mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">سلة المشتريات فارغة</h2>
                    <p className="text-muted-foreground text-lg mb-6">لم تقم بإضافة أي منتجات بعد</p>
                    <Button size="lg" asChild>
                        <Link href="/products">
                            تصفح المنتجات
                        </Link>
                    </Button>
                </div>
            )}
        </div>
    );
}
