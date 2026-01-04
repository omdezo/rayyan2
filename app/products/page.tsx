"use client";

import { products } from "@/lib/products";
import { ProductCard } from "@/components/features/product-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Suspense } from "react";
import { Filter, X } from "lucide-react";

const categories = [
    {
        id: "ai-games",
        title: "ألعاب الذكاء الاصطناعي",
        subcategories: [
            { id: "omani", title: "عماني" },
            { id: "saudi", title: "سعودي" },
            { id: "emirati", title: "إماراتي" },
            { id: "qatari", title: "قطري" },
            { id: "bahraini", title: "بحريني" },
            { id: "kuwaiti", title: "كويتي" },
        ],
    },
    {
        id: "guidance",
        title: "عروض إرشادية",
        subcategories: [
            { id: "omani", title: "عماني" },
            { id: "saudi", title: "سعودي" },
            { id: "emirati", title: "إماراتي" },
            { id: "qatari", title: "قطري" },
            { id: "bahraini", title: "بحريني" },
            { id: "kuwaiti", title: "كويتي" },
        ],
    },
    {
        id: "general",
        title: "تصاميم عامة",
    },
    {
        id: "stories",
        title: "القصص",
    },
];

function ProductsContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const currentCategory = searchParams.get("category");
    const currentSubcategory = searchParams.get("subcategory");

    const filteredProducts = products.filter((p) => {
        if (currentCategory && p.category !== currentCategory) return false;
        if (currentSubcategory && p.subcategory !== currentSubcategory) return false;
        return true;
    });

    const activeCategory = categories.find(c => c.id === currentCategory);

    const handleCategoryClick = (categoryId: string | null) => {
        if (!categoryId) {
            router.push("/products");
        } else {
            router.push(`/products?category=${categoryId}`);
        }
    };

    const handleSubcategoryClick = (subId: string | null) => {
        if (!subId) {
            router.push(`/products?category=${currentCategory}`);
        } else {
            router.push(`/products?category=${currentCategory}&subcategory=${subId}`);
        }
    };

    return (
        <div className="min-h-screen pb-20">
            {/* Header Section */}
            <div className="bg-secondary/30 pt-24 pb-12 px-4">
                <div className="container text-center space-y-4">
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight">المكتبة الرقمية</h1>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        تصفح مجموعتنا المميزة من المنتجات الرقمية المصممة بعناية لتلبية احتياجاتك
                    </p>
                </div>
            </div>

            {/* Sticky Filters */}
            <div className="sticky top-16 z-40 bg-background/80 backdrop-blur-md border-b border-border/40 py-4">
                <div className="container px-4 space-y-4">
                    {/* Main Categories */}
                    <div className="flex flex-wrap items-center justify-center gap-2">
                        <Button
                            variant={!currentCategory ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleCategoryClick(null)}
                            className="rounded-full"
                        >
                            الكل
                        </Button>
                        {categories.map((cat) => (
                            <Button
                                key={cat.id}
                                variant={currentCategory === cat.id ? "default" : "outline"}
                                size="sm"
                                onClick={() => handleCategoryClick(cat.id)}
                                className="rounded-full"
                            >
                                {cat.title}
                            </Button>
                        ))}
                    </div>

                    {/* Subcategories (if active category has them) */}
                    <AnimatePresence>
                        {activeCategory?.subcategories && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="flex flex-wrap items-center justify-center gap-2 pt-2 border-t border-border/40">
                                    <span className="text-xs font-medium text-muted-foreground ml-2">الدولة:</span>
                                    <Button
                                        variant={!currentSubcategory ? "secondary" : "ghost"}
                                        size="sm"
                                        onClick={() => handleSubcategoryClick(null)}
                                        className="rounded-full h-7 text-xs"
                                    >
                                        الكل
                                    </Button>
                                    {activeCategory.subcategories.map((sub) => (
                                        <Button
                                            key={sub.id}
                                            variant={currentSubcategory === sub.id ? "secondary" : "ghost"}
                                            size="sm"
                                            onClick={() => handleSubcategoryClick(sub.id)}
                                            className="rounded-full h-7 text-xs"
                                        >
                                            {sub.title}
                                        </Button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Products Grid */}
            <div className="container px-4 py-12">
                <div className="flex items-center justify-between mb-8">
                    <p className="text-muted-foreground font-medium">
                        {filteredProducts.length} منتج
                    </p>

                    {/* Active Filters Display */}
                    {(currentCategory || currentSubcategory) && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push("/products")}
                            className="text-muted-foreground hover:text-destructive"
                        >
                            <X className="w-4 h-4 ml-2" />
                            مسح التصفيات
                        </Button>
                    )}
                </div>

                {filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredProducts.map((product, index) => (
                            <motion.div
                                key={product.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <ProductCard product={product} />
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-32 text-center">
                        <div className="w-20 h-20 bg-secondary/50 rounded-full flex items-center justify-center mb-6">
                            <Filter className="w-10 h-10 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">لا توجد منتجات</h3>
                        <p className="text-muted-foreground mb-6">حاول تغيير خيارات التصفية أو البحث في قسم آخر</p>
                        <Button onClick={() => router.push("/products")}>
                            عرض جميع المنتجات
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function ProductsPage() {
    return (
        <Suspense fallback={<div className="flex justify-center py-20">جاري التحميل...</div>}>
            <ProductsContent />
        </Suspense>
    );
}
