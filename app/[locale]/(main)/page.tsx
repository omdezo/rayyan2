import { Hero } from "@/components/features/hero";
import { HowItWorks } from "@/components/features/how-it-works";
import { products, categories } from "@/lib/products";
import { ProductCard } from "@/components/features/product-card";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";

export default function Home() {
    const featuredProducts = products.slice(0, 3);
    const t = useTranslations('Home');

    return (
        <div className="min-h-screen">
            <Hero />

            {/* Featured Section */}
            <section className="py-24 bg-secondary/30">
                <div className="container px-4">
                    <div className="flex items-center justify-between mb-12">
                        <div>
                            <h2 className="text-3xl font-bold mb-2">{t('latest_products')}</h2>
                            <p className="text-muted-foreground">{t('latest_desc')}</p>
                        </div>
                        <Button variant="ghost" asChild className="hidden md:inline-flex">
                            <Link href="/products">
                                {t('view_all')} <ArrowLeft className="mr-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {featuredProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>

                    <div className="mt-8 text-center md:hidden">
                        <Button variant="outline" asChild className="w-full">
                            <Link href="/products">
                                {t('view_all_products')}
                            </Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* Categories Grid */}
            <section className="py-24">
                <div className="container px-4">
                    <h2 className="text-3xl font-bold text-center mb-16">{t('browse_category')}</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {categories.map((category) => (
                            <Link
                                key={category.id}
                                href={`/products?category=${category.id}`}
                                className="group relative overflow-hidden rounded-3xl aspect-square bg-card border border-border/50 hover:border-primary/50 transition-colors p-6 flex flex-col justify-between hover:shadow-xl hover:shadow-primary/5"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                <h3 className="text-xl font-bold relative z-10 group-hover:text-primary transition-colors">
                                    {category.title}
                                </h3>

                                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center self-end group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300 relative z-10">
                                    <ArrowLeft className="w-5 h-5 -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            <HowItWorks />
        </div>
    );
}
