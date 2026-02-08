"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Mail, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (data.success) {
                setEmailSent(true);
                toast.success('تم إرسال رابط إعادة التعيين!');
            } else {
                toast.error(data.error || 'حدث خطأ');
            }
        } catch (error) {
            toast.error('حدث خطأ أثناء الإرسال');
        } finally {
            setIsLoading(false);
        }
    };

    if (emailSent) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl">تحقق من بريدك الإلكتروني</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center space-y-4">
                        <Mail className="w-16 h-16 mx-auto text-primary" />
                        <p className="text-muted-foreground">
                            تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني
                        </p>
                        <Link href="/ar/login">
                            <Button variant="outline" className="w-full">
                                <ArrowLeft className="w-4 h-4 ml-2" />
                                العودة إلى تسجيل الدخول
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

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
                        <CardTitle className="text-2xl">نسيت كلمة المرور؟</CardTitle>
                        <p className="text-muted-foreground mt-2">
                            أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين
                        </p>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label htmlFor="email" className="text-sm font-medium">
                                    البريد الإلكتروني
                                </label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@example.com"
                                    required
                                    className="h-12"
                                />
                            </div>
                            <Button type="submit" className="w-full h-12" disabled={isLoading}>
                                {isLoading ? "جاري الإرسال..." : "إرسال رابط إعادة التعيين"}
                            </Button>
                            <Link href="/ar/login">
                                <Button variant="ghost" className="w-full">
                                    <ArrowLeft className="w-4 h-4 ml-2" />
                                    العودة إلى تسجيل الدخول
                                </Button>
                            </Link>
                        </form>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
