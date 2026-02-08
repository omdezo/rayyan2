"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');

    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('رمز التحقق مفقود');
            return;
        }

        verifyEmail(token);
    }, [token]);

    const verifyEmail = async (token: string) => {
        try {
            const response = await fetch('/api/auth/verify-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token }),
            });

            const data = await response.json();

            if (data.success) {
                setStatus('success');
                setMessage('تم تأكيد بريدك الإلكتروني بنجاح!');
                toast.success('تم التأكيد بنجاح!');

                // Redirect to login after 3 seconds
                setTimeout(() => {
                    router.push('/ar/login');
                }, 3000);
            } else {
                setStatus('error');
                setMessage(data.error || 'فشل التحقق');
                toast.error(data.error);
            }
        } catch (error) {
            setStatus('error');
            setMessage('حدث خطأ أثناء التحقق');
            toast.error('حدث خطأ');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
            >
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl">تأكيد البريد الإلكتروني</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center space-y-6">
                        {status === 'loading' && (
                            <div className="space-y-4">
                                <Loader2 className="w-16 h-16 mx-auto animate-spin text-primary" />
                                <p className="text-muted-foreground">جاري التحقق من بريدك الإلكتروني...</p>
                            </div>
                        )}

                        {status === 'success' && (
                            <div className="space-y-4">
                                <CheckCircle className="w-16 h-16 mx-auto text-green-500" />
                                <p className="text-xl font-semibold text-green-600">{message}</p>
                                <p className="text-sm text-muted-foreground">سيتم توجيهك إلى صفحة تسجيل الدخول...</p>
                            </div>
                        )}

                        {status === 'error' && (
                            <div className="space-y-4">
                                <XCircle className="w-16 h-16 mx-auto text-red-500" />
                                <p className="text-xl font-semibold text-red-600">{message}</p>
                                <Button onClick={() => router.push('/ar/login')} className="w-full">
                                    العودة إلى تسجيل الدخول
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        }>
            <VerifyEmailContent />
        </Suspense>
    );
}
