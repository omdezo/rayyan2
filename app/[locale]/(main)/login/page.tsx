"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Lock, Mail } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import { toast } from "sonner";

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { data: session, status } = useSession();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const callbackUrl = searchParams.get('callbackUrl');

    // If already logged in, redirect to dashboard
    if (status === 'authenticated' && session?.user) {
        const role = (session.user as any)?.role;
        const redirectUrl = callbackUrl || (role === 'admin' ? '/ar/dashboard' : '/ar');

        console.log('✅ Already authenticated, redirecting to:', redirectUrl);

        // Use router.push for client-side navigation
        router.push(redirectUrl);

        // Show loading while redirecting
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">جاري التوجيه...</p>
                </div>
            </div>
        );
    }

    // Show loading while checking authentication
    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">جاري التحميل...</p>
                </div>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        const formData = new FormData(e.currentTarget);
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        try {
            console.log('🔐 Starting login process...');

            const result = await signIn("credentials", {
                email,
                password,
                redirect: false, // Handle redirect manually
            });

            console.log('📋 SignIn result:', result);

            if (result?.error) {
                console.log('❌ Login failed:', result.error);

                // Check if error is about email verification
                if (result.error.includes('تأكيد بريدك الإلكتروني') || result.error.includes('verify')) {
                    setError("يرجى تأكيد بريدك الإلكتروني قبل تسجيل الدخول. تحقق من بريدك الإلكتروني.");
                    toast.error("البريد الإلكتروني غير مؤكد", {
                        description: "يرجى التحقق من بريدك الإلكتروني وتأكيد الحساب",
                    });
                } else {
                    setError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
                    toast.error("فشل تسجيل الدخول", {
                        description: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
                    });
                }
                setIsLoading(false);
            } else if (result?.ok) {
                console.log('✅ Login successful!');

                // Determine redirect URL
                const redirectUrl = callbackUrl || "/ar/dashboard";
                console.log('➡️  Will redirect to:', redirectUrl);

                // Wait longer for cookies to be properly set before redirecting
                setTimeout(() => {
                    console.log('🚀 Redirecting with window.location...');
                    // Use window.location.href to ensure cookies are sent with the request
                    window.location.href = redirectUrl;
                }, 1000); // 1 second delay to ensure cookies are set
            }
        } catch (error) {
            console.error("❌ Login error:", error);
            toast.error("حدث خطأ أثناء تسجيل الدخول");
            setIsLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
            {/* Background Elements */}
            <div className="absolute inset-0 w-full h-full">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[100px] animate-blob" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary/40 blur-[100px] animate-blob animation-delay-2000" />
                <div className="absolute top-[40%] left-[40%] w-[30%] h-[30%] rounded-full bg-accent/20 blur-[100px] animate-blob animation-delay-4000" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 w-full max-w-md px-4"
            >
                <Card className="border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl">
                    <CardHeader className="text-center space-y-2 pb-8">
                        <motion.div
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            <CardTitle className="text-3xl font-black tracking-tight">مرحباً بعودتك</CardTitle>
                            <p className="text-muted-foreground mt-2">سجل دخولك للمتابعة إلى حسابك</p>
                        </motion.div>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <motion.div
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="space-y-2"
                            >
                                <label htmlFor="email" className="text-sm font-medium mr-1">البريد الإلكتروني</label>
                                <div className="relative">
                                    <Mail className="absolute right-3 top-3 h-5 w-5 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="name@example.com"
                                        required
                                        className="pr-10 h-12 bg-secondary/50 border-white/10 focus:bg-background transition-all"
                                    />
                                </div>
                            </motion.div>
                            <motion.div
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="space-y-2"
                            >
                                <div className="flex items-center justify-between">
                                    <label htmlFor="password" className="text-sm font-medium mr-1">كلمة المرور</label>
                                    <Link href="/ar/auth/forgot-password" className="text-sm text-primary hover:underline">
                                        نسيت كلمة المرور؟
                                    </Link>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute right-3 top-3 h-5 w-5 text-muted-foreground" />
                                    <Input
                                        id="password"
                                        name="password"
                                        type="password"
                                        required
                                        className="pr-10 h-12 bg-secondary/50 border-white/10 focus:bg-background transition-all"
                                    />
                                </div>
                                {error && (
                                    <p className="text-sm text-red-500 mt-2">{error}</p>
                                )}
                            </motion.div>
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.5 }}
                            >
                                <Button type="submit" className="w-full h-12 text-lg font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all" disabled={isLoading}>
                                    {isLoading ? "جاري التحميل..." : "تسجيل الدخول"}
                                </Button>
                            </motion.div>
                        </form>

                        {/* Divider */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="relative my-6"
                        >
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-white/10" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-card px-2 text-muted-foreground">أو</span>
                            </div>
                        </motion.div>

                        {/* Google Sign In Button */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 }}
                        >
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full h-12 text-base font-semibold border-white/10 hover:bg-white/5"
                                onClick={() => signIn('google', { callbackUrl: callbackUrl || '/ar/dashboard' })}
                                disabled={isLoading}
                            >
                                <svg className="w-5 h-5 ml-2" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                </svg>
                                تسجيل الدخول باستخدام Google
                            </Button>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 }}
                            className="mt-8 text-center text-sm text-muted-foreground"
                        >
                            ليس لديك حساب؟{" "}
                            <Link href="/ar/register" className="text-primary hover:text-primary/80 font-bold hover:underline transition-all inline-flex items-center gap-1">
                                إنشاء حساب جديد <ArrowLeft className="w-3 h-3" />
                            </Link>
                        </motion.div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
