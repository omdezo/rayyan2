"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Suspense } from "react";
import { useRouter } from "next/navigation";
import { Loader2, XCircle, ShoppingCart } from "lucide-react";

function CancelContent() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-background py-12 px-4">
            <div className="container max-w-2xl mx-auto">
                <Card className="border-2 border-orange-500">
                    <CardHeader className="text-center">
                        <div className="w-20 h-20 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <XCircle className="w-10 h-10 text-orange-500" />
                        </div>
                        <CardTitle className="text-3xl font-bold">تم إلغاء الدفع</CardTitle>
                        <p className="text-muted-foreground mt-2">
                            لم يتم إتمام عملية الدفع. يمكنك المحاولة مرة أخرى أو العودة إلى المتجر.
                        </p>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {/* Info Box */}
                        <div className="bg-secondary/20 p-6 rounded-lg space-y-3">
                            <h3 className="font-semibold text-lg">ماذا حدث؟</h3>
                            <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
                                <li>قمت بإلغاء عملية الدفع</li>
                                <li>لم يتم خصم أي مبلغ من حسابك</li>
                                <li>منتجاتك لا تزال في السلة</li>
                            </ul>
                        </div>

                        {/* Next Steps */}
                        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg">
                            <h3 className="font-semibold mb-2">الخطوات التالية:</h3>
                            <p className="text-sm text-muted-foreground">
                                يمكنك العودة إلى السلة لمراجعة مشترياتك والمحاولة مرة أخرى، أو يمكنك الاستمرار في التسوق.
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <Button
                                className="flex-1 bg-[#8B7355] hover:bg-[#8B7355]/90"
                                onClick={() => router.push("/cart")}
                            >
                                <ShoppingCart className="w-4 h-4 ml-2" />
                                العودة إلى السلة
                            </Button>
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => router.push("/products")}
                            >
                                تصفح المنتجات
                            </Button>
                        </div>

                        {/* Help Section */}
                        <div className="text-center pt-4 border-t">
                            <p className="text-sm text-muted-foreground">
                                هل تواجه مشكلة في الدفع؟{" "}
                                <a href="/contact" className="text-primary hover:underline font-medium">
                                    تواصل معنا
                                </a>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default function PaymentCancelPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        }>
            <CancelContent />
        </Suspense>
    );
}
