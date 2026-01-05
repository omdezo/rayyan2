"use client";

import { products } from "@/lib/products";
import { ProductCard } from "@/components/features/product-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Suspense, useState, useEffect } from "react";
import { Filter, X, Search, Globe } from "lucide-react";

const categories = [
    {
        id: "ai-games",
        title: "ألعاب الذكاء الاصطناعي",
        icon: "🤖"
    },
    {
        id: "guidance",
        title: "عروض إرشادية",
        icon: "📚"
    },
    {
        id: "general",
        title: "تصاميم عامة",
        icon: "🎨"
    },
    {
        id: "stories",
        title: "القصص",
        icon: "📖"
    },
];

const countries = [
    { id: "omani", title: "عمان", flag: "🇴🇲" },
    { id: "saudi", title: "السعودية", flag: "🇸🇦" },
    { id: "emirati", title: "الإمارات", flag: "🇦🇪" },
    { id: "qatari", title: "قطر", flag: "🇶🇦" },
    { id: "bahraini", title: "البحرين", flag: "🇧🇭" },
    { id: "kuwaiti", title: "الكويت", flag: "🇰🇼" },
];

function ProductsContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const currentCategory = searchParams.get("category");
    const currentSubcategory = searchParams.get("subcategory");
    const [searchQuery, setSearchQuery] = useState("");

    // Update local state when URL params change (optional, but good for sync)
    // For search, we might want to debounce or just filter locally if the list is small.
    // Given the current setup, I'll filter locally based on state and URL params.

    const filteredProducts = products.filter((p) => {
        // Filter by Category
        if (currentCategory && p.category !== currentCategory) return false;

        // Filter by Subcategory (Country)
        // Note: The original code used 'subcategory' for country. I'll stick to that mapping.
        if (currentSubcategory && p.subcategory !== currentSubcategory) return false;

        // Filter by Search Query
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return p.title.toLowerCase().includes(query) || p.description.toLowerCase().includes(query);
        }

        return true;
    });

    const handleCategoryClick = (categoryId: string | null) => {
        const params = new URLSearchParams(searchParams.toString());
        if (categoryId) {
            params.set("category", categoryId);
        } else {
            params.delete("category");
        }
        // Reset subcategory when changing category? Maybe not if countries are global filters now.
        // The design shows countries as a separate row, implying they might apply generally or per category.
        // I'll keep them independent if possible, or reset if they don't make sense.
        // For now, let's keep subcategory (country) if it exists.
        router.push(`/products?${params.toString()}`);
    };

    const handleCountryClick = (countryId: string | null) => {
        const params = new URLSearchParams(searchParams.toString());
        if (countryId) {
            params.set("subcategory", countryId);
        } else {
            params.delete("subcategory");
        }
        router.push(`/products?${params.toString()}`);
    };

    return (
        <div className="min-h-screen pb-20 bg-background">
            {/* Header Section */}
            <div className="pt-32 pb-8 px-4">
                <div className="container">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
                        {/* Title & Subtitle (Right) */}
                        <div className="text-center md:text-right space-y-2 order-1 md:order-1">
                            <h1 className="text-3xl md:text-4xl font-bold">المتجر</h1>
                            <p className="text-muted-foreground">تصفح أفضل المنتجات الرقمية المختارة بعناية</p>
                        </div>

                        {/* Search Bar (Left) */}
                        <div className="w-full md:w-96 relative order-2 md:order-2">
                            <Input
                                placeholder="ابحث عن منتج..."
                                className="pl-10 h-12 rounded-full bg-secondary/30 border-border/50 focus:bg-background transition-all"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="space-y-8">
                        {/* Categories */}
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                            {categories.map((cat) => (
                                <Button
                                    key={cat.id}
                                    variant={currentCategory === cat.id ? "default" : "outline"}
                                    onClick={() => handleCategoryClick(cat.id)}
                                    className={cn(
                                        "rounded-full h-10 px-6 border-border/50",
                                        currentCategory === cat.id ? "shadow-lg shadow-primary/20" : "hover:border-primary/50 bg-card"
                                    )}
                                >
                                    <span className="ml-2">{cat.icon}</span>
                                    {cat.title}
                                </Button>
                            ))}
                            <Button
                                variant={!currentCategory ? "default" : "outline"}
                                onClick={() => handleCategoryClick(null)}
                                className={cn(
                                    "rounded-full h-10 px-6 border-border/50",
                                    !currentCategory ? "shadow-lg shadow-primary/20" : "hover:border-primary/50 bg-card"
                                )}
                            >
                                <Filter className="w-4 h-4 ml-2" />
                                الكل
                            </Button>
                        </div>

                        {/* Countries */}
                        <div className="flex flex-col md:flex-row items-center justify-start gap-4">
                            <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">اختر الدولة:</span>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                <button
                                    onClick={() => handleCountryClick(null)}
                                    className={cn(
                                        "flex flex-col items-center justify-center w-24 h-20 rounded-2xl border transition-all duration-200",
                                        !currentSubcategory
                                            ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-105"
                                            : "bg-card border-border/50 hover:border-primary/50 hover:shadow-md"
                                    )}
                                >
                                    <span className="text-2xl mb-1">🌍</span>
                                    <span className="text-xs font-bold">الجميع</span>
                                </button>
                                {countries.map((country) => (
                                    <button
                                        key={country.id}
                                        onClick={() => handleCountryClick(country.id)}
                                        className={cn(
                                            "flex flex-col items-center justify-center w-24 h-20 rounded-2xl border transition-all duration-200",
                                            currentSubcategory === country.id
                                                ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-105"
                                                : "bg-card border-border/50 hover:border-primary/50 hover:shadow-md"
                                        )}
                                    >
                                        <span className="text-2xl mb-1">{country.flag}</span>
                                        <span className="text-xs font-bold">{country.title}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Products Grid */}
            <div className="container px-4 py-12">
                <div className="flex items-center justify-between mb-8">
                    <p className="text-muted-foreground font-medium">
                        {filteredProducts.length} منتج
                    </p>

                    {/* Active Filters Display */}
                    {(currentCategory || currentSubcategory || searchQuery) && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                setSearchQuery("");
                                router.push("/products");
                            }}
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
                            <Search className="w-10 h-10 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">لا توجد منتجات</h3>
                        <p className="text-muted-foreground mb-6">حاول تغيير خيارات التصفية أو البحث عن كلمة أخرى</p>
                        <Button onClick={() => {
                            setSearchQuery("");
                            router.push("/products");
                        }}>
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
