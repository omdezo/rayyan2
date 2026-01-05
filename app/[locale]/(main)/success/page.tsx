import { Button } from "@/components/ui/button";
import { CheckCircle, Download } from "lucide-react";
import Link from "next/link";

export default function SuccessPage() {
    return (
        <div className="container py-20 px-4 text-center flex flex-col items-center justify-center min-h-[60vh]">
            <div className="h-24 w-24 rounded-full bg-green-500/20 flex items-center justify-center mb-6 text-green-500">
                <CheckCircle className="h-12 w-12" />
            </div>

            <h1 className="text-3xl font-bold mb-2">تم الدفع بنجاح!</h1>
            <p className="text-muted-foreground max-w-md mx-auto mb-8">
                شكراً لشرائك. تم إرسال رابط التحميل إلى بريدك الإلكتروني، ويمكنك تحميل الملف الآن.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="h-12 px-8">
                    <Download className="mr-2 h-4 w-4" />
                    تحميل الملف
                </Button>
                <Button variant="outline" size="lg" className="h-12 px-8" asChild>
                    <Link href="/">
                        العودة للرئيسية
                    </Link>
                </Button>
            </div>
        </div>
    );
}
