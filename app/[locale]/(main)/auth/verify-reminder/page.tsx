"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ShieldAlert, Mail, Loader2, Clock, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

function VerifyReminderContent() {
    const searchParams = useSearchParams();
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
                <Card className="border-amber-200 dark:border-amber-800">
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center">
                            <ShieldAlert className="w-8 h-8 text-amber-500" />
                        </div>
                        <CardTitle className="text-2xl">يرجى تأكيد بريدك الإلكتروني</CardTitle>
                        <p className="text-muted-foreground mt-2">
                            لا يمكنك تسجيل الدخول حتى يتم التحقق من بريدك
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {email && (
                            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4 text-right">
                                <p className="text-sm text-amber-900 dark:text-amber-200 leading-relaxed">
                                    حسابك المرتبط بـ:
                                </p>
                                <p className="text-base font-semibold text-amber-600 dark:text-amber-400 mt-2">
                                    {email}
                                </p>
                                <p className="text-xs text-amber-700 dark:text-amber-300 mt-2">
                                    غير مؤكد بعد
                                </p>
                            </div>
                        )}

                        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-right">
                            <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
                                📧 كيفية التحقق:
                            </h3>
                            <ol className="text-sm text-blue-800 dark:text-blue-300 space-y-2 mr-4 list-decimal">
                                <li>افتح بريدك الإلكتروني</li>
                                <li>ابحث عن رسالة من "ريان للتصاميم"</li>
                                <li>انقر على رابط التحقق</li>
                                <li>عد وسجل الدخول</li>
                            </ol>
                        </div>

                        <div className="space-y-3">
                            <Button
                                onClick={handleResend}
                                disabled={isResending || cooldown > 0}
                                className="w-full"
                                size="lg"
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
                                <Button variant="outline" className="w-full">
                                    <ArrowLeft className="w-4 h-4 ml-2" />
                                    العودة إلى تسجيل الدخول
                                </Button>
                            </Link>
                        </div>

                        <div className="text-center text-xs text-muted-foreground pt-2 space-y-1">
                            <p>لم تستلم الرسالة؟</p>
                            <p>تحقق من مجلد الرسائل غير المرغوب فيها (Spam)</p>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}

export default function VerifyReminderPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        }>
            <VerifyReminderContent />
        </Suspense>
    );
}
