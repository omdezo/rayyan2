"use client";

import { ProductCard } from "@/components/features/product-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useRouter, usePathname } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Suspense, useState, useEffect } from "react";
import { Filter, X, Search, Globe, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";

interface Product {
    _id: string;
    title: string;
    description: string;
    price: number;
    category: string;
    subcategory?: string;
    image: string;
    status: string;
}

interface Pagination {
    total: number;
    page: number;
    limit: number;
    pages: number;
}

function ProductsContent() {
    const t = useTranslations('Products');
    const locale = useLocale();
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const currentCategory = searchParams.get("category");
    const currentSubcategory = searchParams.get("subcategory");
    const [searchQuery, setSearchQuery] = useState("");
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Array<{id: string, title: string, icon?: string}>>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState<Pagination>({
        total: 0,
        page: 1,
        limit: 12,
        pages: 0,
    });

    // Fetch categories from database
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch('/api/sections?activeOnly=true');
                const data = await response.json();

                if (data.success) {
                    const formattedCategories = data.data.map((section: any) => ({
                        id: section.key,
                        title: locale === 'ar' ? section.nameAr : section.nameEn,
                        icon: section.icon || '📦'
                    }));
                    setCategories(formattedCategories);
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };

        fetchCategories();
    }, [locale]);

    // Reset page when search query changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    const countries = [
        { id: "omani", title: t('countries.omani'), flag: "🇴🇲" },
        { id: "saudi", title: t('countries.saudi'), flag: "🇸🇦" },
        { id: "emirati", title: t('countries.emirati'), flag: "🇦🇪" },
        { id: "qatari", title: t('countries.qatari'), flag: "🇶🇦" },
        { id: "bahraini", title: t('countries.bahraini'), flag: "🇧🇭" },
        { id: "kuwaiti", title: t('countries.kuwaiti'), flag: "🇰🇼" },
    ];

    // Fetch products from API
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const params = new URLSearchParams();
                if (currentCategory) params.set('category', currentCategory);
                if (currentSubcategory) params.set('subcategory', currentSubcategory);
                if (searchQuery) params.set('search', searchQuery);
                params.set('status', 'active'); // Only show active products
                params.set('page', currentPage.toString());
                params.set('limit', '12');

                const response = await fetch(`/api/products?${params}`);
                const data = await response.json();

                if (data.success && data.data.products) {
                    setProducts(data.data.products);
                    setPagination(data.data.pagination);
                }
            } catch (error) {
                console.error('Error fetching products:', error);
            } finally {
                setLoading(false);
            }
        };

        // Debounce search
        const timeoutId = setTimeout(fetchProducts, searchQuery ? 300 : 0);
        return () => clearTimeout(timeoutId);
    }, [currentCategory, currentSubcategory, searchQuery, currentPage]);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.pages) {
            setCurrentPage(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const filteredProducts = products;

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
        router.push(`${pathname}?${params.toString()}`);
        setCurrentPage(1); // Reset to first page
    };

    const handleCountryClick = (countryId: string | null) => {
        const params = new URLSearchParams(searchParams.toString());
        if (countryId) {
            params.set("subcategory", countryId);
        } else {
            params.delete("subcategory");
        }
        router.push(`${pathname}?${params.toString()}`);
        setCurrentPage(1); // Reset to first page
    };

    return (
        <div className="min-h-screen pb-20 bg-gradient-to-b from-background via-background to-secondary/10">
            {/* Header Section */}
            <div className="pt-24 sm:pt-32 pb-8 sm:pb-12 px-4">
                <div className="container max-w-7xl">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 mb-8 sm:mb-12">
                        {/* Title & Subtitle (Right) */}
                        <div className="text-center md:text-right space-y-1 sm:space-y-2 order-1 md:order-1 w-full md:w-auto">
                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">{t('title')}</h1>
                            <p className="text-sm sm:text-base text-muted-foreground">{t('subtitle')}</p>
                        </div>

                        {/* Search Bar (Left) */}
                        <div className="w-full md:w-96 relative order-2 md:order-2">
                            <Input
                                placeholder={t('search_placeholder')}
                                className="pl-10 h-12 sm:h-14 text-sm sm:text-base rounded-2xl bg-secondary/30 border-none focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="space-y-4 sm:space-y-8">
                        {/* Categories */}
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                            {categories.map((cat) => (
                                <Button
                                    key={cat.id}
                                    variant={currentCategory === cat.id ? "default" : "outline"}
                                    onClick={() => handleCategoryClick(cat.id)}
                                    size="sm"
                                    className={cn(
                                        "rounded-2xl h-11 sm:h-12 px-5 sm:px-7 text-sm sm:text-base font-semibold transition-all duration-300",
                                        currentCategory === cat.id
                                            ? "shadow-md shadow-primary/30 scale-105"
                                            : "border-none bg-secondary/40 hover:bg-secondary/60 hover:scale-105 hover:shadow-sm"
                                    )}
                                >
                                    <span className="ml-2 text-lg">{cat.icon}</span>
                                    {cat.title}
                                </Button>
                            ))}
                            <Button
                                variant={!currentCategory ? "default" : "outline"}
                                onClick={() => handleCategoryClick(null)}
                                size="sm"
                                className={cn(
                                    "rounded-2xl h-11 sm:h-12 px-5 sm:px-7 text-sm sm:text-base font-semibold transition-all duration-300",
                                    !currentCategory
                                        ? "shadow-md shadow-primary/30 scale-105"
                                        : "border-none bg-secondary/40 hover:bg-secondary/60 hover:scale-105 hover:shadow-sm"
                                )}
                            >
                                <Filter className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                                {t('all_categories')}
                            </Button>
                        </div>

                        {/* Countries */}
                        <div className="flex flex-col items-center md:flex-row md:items-center justify-start gap-4 sm:gap-5">
                            <span className="text-sm font-semibold text-foreground whitespace-nowrap">{t('filter_country')}</span>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                <button
                                    onClick={() => handleCountryClick(null)}
                                    className={cn(
                                        "flex flex-col items-center justify-center w-24 h-20 sm:w-28 sm:h-24 rounded-2xl transition-all duration-300 flex-shrink-0 shadow-sm",
                                        !currentSubcategory
                                            ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/30 scale-105"
                                            : "bg-secondary/50 hover:bg-secondary/70 hover:scale-105 hover:shadow-md"
                                    )}
                                >
                                    <span className="text-2xl sm:text-3xl mb-1 sm:mb-2">🌍</span>
                                    <span className="text-xs sm:text-sm font-bold">{t('all_countries')}</span>
                                </button>
                                {countries.map((country) => (
                                    <button
                                        key={country.id}
                                        onClick={() => handleCountryClick(country.id)}
                                        className={cn(
                                            "flex flex-col items-center justify-center w-24 h-20 sm:w-28 sm:h-24 rounded-2xl transition-all duration-300 flex-shrink-0 shadow-sm",
                                            currentSubcategory === country.id
                                                ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/30 scale-105"
                                                : "bg-secondary/50 hover:bg-secondary/70 hover:scale-105 hover:shadow-md"
                                        )}
                                    >
                                        <span className="text-xs sm:text-sm font-bold text-center px-2">{country.title}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Products Grid */}
            <div className="container max-w-7xl px-4 py-8 sm:py-16">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 sm:mb-10">
                    <p className="text-base sm:text-lg font-semibold">
                        {loading ? t('loading') || 'Loading...' : t('products_count', { count: filteredProducts.length })}
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
                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all"
                        >
                            <X className="w-4 h-4 ml-2" />
                            {t('clear_filters')}
                        </Button>
                    )}
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-32">
                        <div className="flex flex-col items-center gap-4">
                            <Loader2 className="w-12 h-12 animate-spin text-primary" />
                            <p className="text-muted-foreground">جاري التحميل...</p>
                        </div>
                    </div>
                ) : filteredProducts.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
                            {filteredProducts.map((product, index) => (
                                <motion.div
                                    key={product._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <ProductCard product={{...product, id: product._id}} />
                                </motion.div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {pagination.pages > 1 && (
                            <div className="flex items-center justify-center gap-3 mt-16">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="h-11 px-4 sm:px-6 rounded-xl font-semibold shadow-sm hover:shadow-md transition-all disabled:opacity-40"
                                >
                                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                                    <span className="hidden sm:inline mr-2">السابق</span>
                                </Button>

                                <div className="flex items-center gap-2">
                                    {Array.from({ length: Math.min(pagination.pages, window.innerWidth < 640 ? 5 : 7) }, (_, i) => {
                                        const maxPages = window.innerWidth < 640 ? 5 : 7;
                                        let pageNum;
                                        if (pagination.pages <= maxPages) {
                                            pageNum = i + 1;
                                        } else if (currentPage <= Math.floor(maxPages / 2) + 1) {
                                            pageNum = i + 1;
                                        } else if (currentPage >= pagination.pages - Math.floor(maxPages / 2)) {
                                            pageNum = pagination.pages - maxPages + i + 1;
                                        } else {
                                            pageNum = currentPage - Math.floor(maxPages / 2) + i;
                                        }
                                        return (
                                            <Button
                                                key={pageNum}
                                                variant={pageNum === currentPage ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => handlePageChange(pageNum)}
                                                className={cn(
                                                    "w-10 h-11 sm:w-12 text-sm sm:text-base p-0 rounded-xl font-semibold transition-all",
                                                    pageNum === currentPage
                                                        ? "shadow-md shadow-primary/30"
                                                        : "border-none bg-secondary/40 hover:bg-secondary/60 hover:scale-105"
                                                )}
                                            >
                                                {pageNum}
                                            </Button>
                                        );
                                    })}
                                </div>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === pagination.pages}
                                    className="h-11 px-4 sm:px-6 rounded-xl font-semibold shadow-sm hover:shadow-md transition-all disabled:opacity-40"
                                >
                                    <span className="hidden sm:inline ml-2">التالي</span>
                                    <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                                </Button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center py-32 text-center">
                        <div className="w-28 h-28 bg-gradient-to-br from-secondary/40 to-secondary/20 rounded-full flex items-center justify-center mb-8 shadow-lg">
                            <Search className="w-12 h-12 text-muted-foreground" />
                        </div>
                        <h3 className="text-2xl font-bold mb-3">{t('no_products')}</h3>
                        <p className="text-muted-foreground mb-8 max-w-md">{t('no_products_desc')}</p>
                        <Button
                            onClick={() => {
                                setSearchQuery("");
                                router.push("/products");
                            }}
                            size="lg"
                            className="rounded-xl shadow-lg"
                        >
                            {t('view_all_products')}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function ProductsPage() {
    return (
        <Suspense fallback={<div className="flex justify-center py-20">Loading...</div>}>
            <ProductsContent />
        </Suspense>
    );
}
