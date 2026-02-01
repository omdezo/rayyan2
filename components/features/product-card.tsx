import { Product } from "@/lib/products";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { ArrowLeft } from "lucide-react";
import { R2Image } from "@/components/ui/r2-image";
import { useLocale } from "next-intl";

interface ProductCardProps {
    product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
    const locale = useLocale();
    return (
        <Link href={`/products/${product.id}`} className="block h-full">
            <Card className="group overflow-hidden border-primary/10 bg-card/50 backdrop-blur-sm hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 transition-all duration-500 cursor-pointer h-full">
                <div className="relative aspect-[4/3] bg-secondary/50 overflow-hidden">
                    {/* Product Image - automatically converts R2 keys to presigned URLs */}
                    <R2Image
                        r2Key={product.image}
                        alt={locale === 'ar' ? product.titleAr || product.title : product.titleEn || product.title}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        fallback={
                            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground bg-secondary/30 group-hover:scale-105 transition-transform duration-700">
                                <span className="text-lg font-medium">
                                    {locale === 'ar' ? product.titleAr || product.title : product.titleEn || product.title}
                                </span>
                            </div>
                        }
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-6">
                        <div className="w-full text-center font-bold text-sm text-white translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                            عرض التفاصيل
                            <ArrowLeft className="inline-block mr-2 w-4 h-4" />
                        </div>
                    </div>
                </div>

                <CardHeader className="pb-2">
                    <div className="flex justify-between items-start gap-2">
                        <CardTitle className="line-clamp-1 text-lg font-bold group-hover:text-primary transition-colors">
                            {locale === 'ar' ? product.titleAr || product.title : product.titleEn || product.title}
                        </CardTitle>
                        <span className="font-bold text-primary whitespace-nowrap">
                            {product.price.toFixed(3)} ر.ع
                        </span>
                    </div>
                </CardHeader>

                <CardContent className="pb-4">
                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                        {locale === 'ar' ? product.descriptionAr || product.description : product.descriptionEn || product.description}
                    </p>
                </CardContent>
            </Card>
        </Link>
    );
}
