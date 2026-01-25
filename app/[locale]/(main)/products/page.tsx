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
import { useTranslations } from "next-intl";

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
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const currentCategory = searchParams.get("category");
    const currentSubcategory = searchParams.get("subcategory");
    const [searchQuery, setSearchQuery] = useState("");
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState<Pagination>({
        total: 0,
        page: 1,
        limit: 12,
        pages: 0,
    });

    // Reset page when search query changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    const categories = [
        {
            id: "ai-games",
            title: t('categories.ai-games'),
            icon: "🤖"
        },
        {
            id: "guidance",
            title: t('categories.guidance'),
            icon: "📚"
        },
        {
            id: "general",
            title: t('categories.general'),
            icon: "🎨"
        },
        {
            id: "stories",
            title: t('categories.stories'),
            icon: "📖"
        },
    ];

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
        <div className="min-h-screen pb-20 bg-background">
            {/* Header Section */}
            <div className="pt-24 sm:pt-32 pb-6 sm:pb-8 px-4">
                <div className="container">
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
                                className="pl-10 h-10 sm:h-12 text-sm sm:text-base rounded-full bg-secondary/30 border-border/50 focus:bg-background transition-all"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="space-y-4 sm:space-y-8">
                        {/* Categories */}
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 sm:gap-3">
                            {categories.map((cat) => (
                                <Button
                                    key={cat.id}
                                    variant={currentCategory === cat.id ? "default" : "outline"}
                                    onClick={() => handleCategoryClick(cat.id)}
                                    size="sm"
                                    className={cn(
                                        "rounded-full h-8 sm:h-10 px-3 sm:px-6 border-border/50 text-xs sm:text-sm",
                                        currentCategory === cat.id ? "shadow-lg shadow-primary/20" : "hover:border-primary/50 bg-card"
                                    )}
                                >
                                    <span className="ml-1 sm:ml-2 text-sm sm:text-base">{cat.icon}</span>
                                    {cat.title}
                                </Button>
                            ))}
                            <Button
                                variant={!currentCategory ? "default" : "outline"}
                                onClick={() => handleCategoryClick(null)}
                                size="sm"
                                className={cn(
                                    "rounded-full h-8 sm:h-10 px-3 sm:px-6 border-border/50 text-xs sm:text-sm",
                                    !currentCategory ? "shadow-lg shadow-primary/20" : "hover:border-primary/50 bg-card"
                                )}
                            >
                                <Filter className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" />
                                {t('all_categories')}
                            </Button>
                        </div>

                        {/* Countries */}
                        <div className="flex flex-col items-center md:flex-row md:items-center justify-start gap-3 sm:gap-4">
                            <span className="text-xs sm:text-sm font-medium text-muted-foreground whitespace-nowrap">{t('filter_country')}</span>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 sm:gap-3">
                                <button
                                    onClick={() => handleCountryClick(null)}
                                    className={cn(
                                        "flex flex-col items-center justify-center w-20 h-16 sm:w-24 sm:h-20 rounded-xl sm:rounded-2xl border transition-all duration-200 flex-shrink-0",
                                        !currentSubcategory
                                            ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-105"
                                            : "bg-card border-border/50 hover:border-primary/50 hover:shadow-md"
                                    )}
                                >
                                    <span className="text-xl sm:text-2xl mb-0.5 sm:mb-1">🌍</span>
                                    <span className="text-[10px] sm:text-xs font-bold">{t('all_countries')}</span>
                                </button>
                                {countries.map((country) => (
                                    <button
                                        key={country.id}
                                        onClick={() => handleCountryClick(country.id)}
                                        className={cn(
                                            "flex flex-col items-center justify-center w-20 h-16 sm:w-24 sm:h-20 rounded-xl sm:rounded-2xl border transition-all duration-200 flex-shrink-0",
                                            currentSubcategory === country.id
                                                ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-105"
                                                : "bg-card border-border/50 hover:border-primary/50 hover:shadow-md"
                                        )}
                                    >
                                        <span className="text-[10px] sm:text-sm font-bold text-center px-1">{country.title}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Products Grid */}
            <div className="container px-4 py-6 sm:py-12">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-6 sm:mb-8">
                    <p className="text-sm sm:text-base text-muted-foreground font-medium">
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
                            className="text-muted-foreground hover:text-destructive"
                        >
                            <X className="w-4 h-4 ml-2" />
                            {t('clear_filters')}
                        </Button>
                    )}
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-32">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : filteredProducts.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                            <div className="flex items-center justify-center gap-2 mt-12">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="h-9 px-3 sm:px-4"
                                >
                                    <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                                    <span className="hidden sm:inline mr-1">السابق</span>
                                </Button>

                                <div className="flex items-center gap-1">
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
                                                className="w-8 h-9 sm:w-10 text-xs sm:text-sm p-0"
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
                                    className="h-9 px-3 sm:px-4"
                                >
                                    <span className="hidden sm:inline ml-1">التالي</span>
                                    <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                                </Button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center py-32 text-center">
                        <div className="w-20 h-20 bg-secondary/50 rounded-full flex items-center justify-center mb-6">
                            <Search className="w-10 h-10 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">{t('no_products')}</h3>
                        <p className="text-muted-foreground mb-6">{t('no_products_desc')}</p>
                        <Button onClick={() => {
                            setSearchQuery("");
                            router.push("/products");
                        }}>
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
