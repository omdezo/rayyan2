"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Mail, Loader2, Clock } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useSession } from "next-auth/react";

function CheckEmailContent() {
    const searchParams = useSearchParams();
    const { data: session } = useSession();
    const email = searchParams.get('email');

    const [isResending, setIsResending] = useState(false);
    const [cooldown, setCooldown] = useState(0);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (cooldown > 0) {
            timer = setInterval(() => {
                setCooldown((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [cooldown]);

    const handleResend = async () => {
        if (cooldown > 0 || isResending) return;

        setIsResending(true);

        try {
            const response = await fetch('/api/auth/send-verification', {
                method: 'POST',
            });

            const data = await response.json();

            if (data.success) {
                toast.success('✅ تم إرسال رسالة التحقق مرة أخرى!');
                setCooldown(60); // 60 seconds cooldown
            } else {
                // Extract wait time from error message if rate limited
                const waitTimeMatch = data.error?.match(/(\d+)\s*ثانية/);
                if (waitTimeMatch) {
                    const waitTime = parseInt(waitTimeMatch[1]);
                    setCooldown(waitTime);
                    toast.error(`يرجى الانتظار ${waitTime} ثانية`);
                } else {
                    toast.error(data.error || 'حدث خطأ');
                }
            }
        } catch (error) {
            toast.error('حدث خطأ أثناء الإرسال');
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <Card>
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center">
                            <Mail className="w-8 h-8 text-blue-500" />
                        </div>
                        <CardTitle className="text-2xl">تحقق من بريدك الإلكتروني</CardTitle>
                        <p className="text-muted-foreground mt-2">
                            تم إرسال رابط التحقق بنجاح!
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-right">
                            <p className="text-sm text-blue-900 dark:text-blue-200 leading-relaxed">
                                قمنا بإرسال رسالة تحقق إلى:
                            </p>
                            <p className="text-base font-semibold text-blue-600 dark:text-blue-400 mt-2">
                                {email || session?.user?.email || 'بريدك الإلكتروني'}
                            </p>
                        </div>

                        <div className="space-y-3 text-sm text-muted-foreground text-right">
                            <p className="flex items-start gap-2">
                                <span className="text-primary">1.</span>
                                <span>افتح بريدك الإلكتروني</span>
                            </p>
                            <p className="flex items-start gap-2">
                                <span className="text-primary">2.</span>
                                <span>ابحث عن رسالة من "ريان للتصاميم"</span>
                            </p>
                            <p className="flex items-start gap-2">
                                <span className="text-primary">3.</span>
                                <span>انقر على رابط التحقق (صالح لمدة 10 دقائق)</span>
                            </p>
                            <p className="flex items-start gap-2">
                                <span className="text-primary">4.</span>
                                <span>عد إلى صفحة تسجيل الدخول</span>
                            </p>
                        </div>

                        <div className="pt-4 space-y-3">
                            <Button
                                onClick={handleResend}
                                disabled={isResending || cooldown > 0}
                                variant="outline"
                                className="w-full"
                            >
                                {isResending ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin ml-2" />
                                        جاري الإرسال...
                                    </>
                                ) : cooldown > 0 ? (
                                    <>
                                        <Clock className="w-4 h-4 ml-2" />
                                        انتظر {cooldown} ثانية
                                    </>
                                ) : (
                                    <>
                                        <Mail className="w-4 h-4 ml-2" />
                                        إعادة إرسال رابط التحقق
                                    </>
                                )}
                            </Button>

                            <Link href="/ar/login">
                                <Button className="w-full">
                                    الذهاب إلى تسجيل الدخول
                                </Button>
                            </Link>
                        </div>

                        <div className="text-center text-xs text-muted-foreground pt-2">
                            <p>لم تستلم الرسالة؟ تحقق من مجلد الرسائل غير المرغوب فيها (Spam)</p>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}

export default function CheckEmailPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        }>
            <CheckEmailContent />
        </Suspense>
    );
}
