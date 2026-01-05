import { products } from "@/lib/products";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import Image from "next/image";

import { use } from "react";

export default function ProductDetailsPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const product = products.find((p) => p.id === id);

    if (!product) {
        notFound();
    }

    return (
        <div className="container py-10 px-4">
            <Link
                href="/products"
                className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6 transition-colors"
            >
                <ArrowRight className="ml-2 h-4 w-4" />
                العودة للمنتجات
            </Link>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
                {/* Product Image */}
                <div className="relative aspect-video md:aspect-square bg-muted rounded-xl overflow-hidden border border-border/50">
                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground bg-secondary/30">
                        <span className="text-2xl font-bold">{product.title}</span>
                    </div>
                </div>

                {/* Product Info */}
                <div className="flex flex-col space-y-6">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">{product.title}</h1>
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80">
                                {product.category}
                            </span>
                            {product.subcategory && (
                                <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                                    {product.subcategory}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="text-3xl font-bold text-primary">
                        {product.price.toFixed(3)} ر.ع
                    </div>

                    <p className="text-muted-foreground text-lg leading-relaxed">
                        {product.description}
                    </p>

                    <div className="space-y-4 pt-6 border-t border-border/40">
                        <h3 className="font-semibold">مميزات المنتج:</h3>
                        <ul className="space-y-2">
                            <li className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Check className="h-4 w-4 text-primary" />
                                تحميل فوري بعد الدفع
                            </li>
                            <li className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Check className="h-4 w-4 text-primary" />
                                ملف عالي الجودة (PDF/PPT)
                            </li>
                            <li className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Check className="h-4 w-4 text-primary" />
                                دعم فني متواصل
                            </li>
                        </ul>
                    </div>

                    <div className="flex flex-col gap-3 pt-6">
                        <Button size="lg" className="w-full text-lg h-12" asChild>
                            <Link href={`/checkout?productId=${product.id}`}>
                                شراء الآن - {product.price.toFixed(3)} ر.ع
                            </Link>
                        </Button>
                        <p className="text-xs text-center text-muted-foreground">
                            دفع آمن 100% عبر البطاقة البنكية أو أبل باي
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
