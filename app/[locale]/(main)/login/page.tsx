"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useState, useEffect } from "react";
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
    const [isRedirecting, setIsRedirecting] = useState(false);

    const callbackUrl = searchParams.get('callbackUrl');

    // Redirect if already logged in
    useEffect(() => {
        if (status === 'authenticated' && session?.user && !isRedirecting) {
            console.log('✅ Already logged in, redirecting...');
            setIsRedirecting(true);

            const role = (session.user as any)?.role;
            let redirectUrl = '/ar';

            if (callbackUrl) {
                console.log('🔗 Redirecting to callback:', callbackUrl);
                redirectUrl = callbackUrl;
            } else if (role === 'admin') {
                console.log('👑 Admin user, redirecting to dashboard');
                redirectUrl = '/ar/dashboard';
            } else {
                console.log('👤 Regular user, redirecting to home');
                redirectUrl = '/ar';
            }

            // Use window.location for a hard redirect to avoid loops
            window.location.href = redirectUrl;
        }
    }, [status, session, callbackUrl, isRedirecting]);

    // Show loading spinner while checking auth or redirecting
    if (status === 'loading' || isRedirecting) {
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
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
                toast.error("فشل تسجيل الدخول", {
                    description: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
                });
            } else {
                toast.success("تم تسجيل الدخول بنجاح!");
                setIsRedirecting(true);

                // Small delay to let the toast show
                setTimeout(async () => {
                    // Get session to check user role
                    const sessionResponse = await fetch('/api/auth/session');
                    const session = await sessionResponse.json();

                    console.log('📋 Session after login:', session);
                    console.log('👤 User role:', session?.user?.role);

                    // Determine redirect URL
                    let redirectUrl = '/ar';
                    if (callbackUrl) {
                        console.log('🔗 Redirecting to callback URL:', callbackUrl);
                        redirectUrl = callbackUrl;
                    } else if (session?.user?.role === 'admin') {
                        console.log('👑 Admin detected, redirecting to dashboard');
                        redirectUrl = '/ar/dashboard';
                    } else {
                        console.log('👤 Regular user, redirecting to home');
                        redirectUrl = '/ar';
                    }

                    // Hard redirect to avoid any routing issues
                    window.location.href = redirectUrl;
                }, 500);
            }
        } catch (error) {
            console.error("Login error:", error);
            toast.error("حدث خطأ أثناء تسجيل الدخول");
        } finally {
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
                                    <Link href="#" className="text-xs text-primary hover:underline">نسيت كلمة المرور؟</Link>
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
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
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
