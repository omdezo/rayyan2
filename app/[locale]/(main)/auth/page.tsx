"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, Mail, User } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import { toast } from "sonner";
import Link from "next/link";

export default function AuthPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { data: session, status } = useSession();
    const [activeTab, setActiveTab] = useState("register"); // Default to register
    const [isLoading, setIsLoading] = useState(false);
    const [loginError, setLoginError] = useState("");
    const [registerError, setRegisterError] = useState("");

    const callbackUrl = searchParams.get('callbackUrl');

    // If already logged in, redirect
    if (status === 'authenticated' && session?.user) {
        const role = (session.user as any)?.role;
        const redirectUrl = callbackUrl || (role === 'admin' ? '/ar/dashboard' : '/ar');
        router.push(redirectUrl);
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">جاري التوجيه...</p>
                </div>
            </div>
        );
    }

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

    const handleGoogleSignIn = () => {
        signIn('google', { callbackUrl: callbackUrl || '/ar/dashboard' });
    };

    const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setLoginError("");

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
                if (result.error.includes('تأكيد بريدك الإلكتروني') || result.error.includes('verify')) {
                    toast.error("البريد الإلكتروني غير مؤكد", {
                        description: "يرجى تأكيد بريدك الإلكتروني أولاً",
                    });
                    setTimeout(() => {
                        router.push(`/ar/auth/verify-reminder?email=${encodeURIComponent(email)}`);
                    }, 1500);
                } else {
                    setLoginError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
                    toast.error("فشل تسجيل الدخول", {
                        description: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
                    });
                }
                setIsLoading(false);
            } else if (result?.ok) {
                const redirectUrl = callbackUrl || "/ar/dashboard";
                setTimeout(() => {
                    window.location.href = redirectUrl;
                }, 1000);
            }
        } catch (error) {
            console.error("Login error:", error);
            toast.error("حدث خطأ أثناء تسجيل الدخول");
            setIsLoading(false);
        }
    };

    const handleRegisterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setRegisterError("");

        const formData = new FormData(e.currentTarget);
        const name = formData.get("name") as string;
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        // Password validation
        if (password.length < 8) {
            setRegisterError("كلمة المرور يجب أن تكون 8 أحرف على الأقل");
            toast.error("كلمة المرور قصيرة جداً");
            setIsLoading(false);
            return;
        }

        if (!/[A-Z]/.test(password)) {
            setRegisterError("كلمة المرور يجب أن تحتوي على حرف كبير واحد على الأقل");
            toast.error("كلمة المرور ضعيفة");
            setIsLoading(false);
            return;
        }

        if (!/[a-z]/.test(password)) {
            setRegisterError("كلمة المرور يجب أن تحتوي على حرف صغير واحد على الأقل");
            toast.error("كلمة المرور ضعيفة");
            setIsLoading(false);
            return;
        }

        if (!/[0-9]/.test(password)) {
            setRegisterError("كلمة المرور يجب أن تحتوي على رقم واحد على الأقل");
            toast.error("كلمة المرور ضعيفة");
            setIsLoading(false);
            return;
        }

        if (!/[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/]/.test(password)) {
            setRegisterError("كلمة المرور يجب أن تحتوي على رمز خاص واحد على الأقل (!@#$%...)");
            toast.error("كلمة المرور ضعيفة");
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await response.json();

            if (data.success) {
                toast.success("تم إنشاء الحساب بنجاح!", {
                    description: "يرجى التحقق من بريدك الإلكتروني",
                });
                router.push(`/ar/auth/check-email?email=${encodeURIComponent(email)}`);
            } else {
                setRegisterError(data.error || "حدث خطأ أثناء إنشاء الحساب");
                toast.error("فشل إنشاء الحساب", {
                    description: data.error || "حدث خطأ غير متوقع",
                });
            }
        } catch (error) {
            console.error("Registration error:", error);
            setRegisterError("حدث خطأ أثناء الاتصال بالخادم");
            toast.error("حدث خطأ أثناء إنشاء الحساب");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background py-12">
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
                    <CardHeader className="text-center space-y-2 pb-6">
                        <motion.div
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            <CardTitle className="text-3xl font-black tracking-tight">
                                {activeTab === "register" ? "إنشاء حساب جديد" : "مرحباً بعودتك"}
                            </CardTitle>
                            <p className="text-muted-foreground mt-2">
                                {activeTab === "register"
                                    ? "انضم إلينا وابدأ رحلتك الإبداعية"
                                    : "سجل دخولك للمتابعة إلى حسابك"}
                            </p>
                        </motion.div>
                    </CardHeader>
                    <CardContent>
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid w-full grid-cols-2 mb-6">
                                <TabsTrigger value="register" className="font-bold">إنشاء حساب</TabsTrigger>
                                <TabsTrigger value="login" className="font-bold">تسجيل دخول</TabsTrigger>
                            </TabsList>

                            {/* Register Tab */}
                            <TabsContent value="register">
                                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <label htmlFor="register-name" className="text-sm font-medium mr-1">الاسم الكامل</label>
                                        <div className="relative">
                                            <User className="absolute right-3 top-3 h-5 w-5 text-muted-foreground" />
                                            <Input
                                                id="register-name"
                                                name="name"
                                                placeholder="الاسم"
                                                required
                                                className="pr-10 h-12 bg-secondary/50 border-white/10 focus:bg-background transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="register-email" className="text-sm font-medium mr-1">البريد الإلكتروني</label>
                                        <div className="relative">
                                            <Mail className="absolute right-3 top-3 h-5 w-5 text-muted-foreground" />
                                            <Input
                                                id="register-email"
                                                name="email"
                                                type="email"
                                                placeholder="name@example.com"
                                                required
                                                className="pr-10 h-12 bg-secondary/50 border-white/10 focus:bg-background transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="register-password" className="text-sm font-medium mr-1">كلمة المرور</label>
                                        <div className="relative">
                                            <Lock className="absolute right-3 top-3 h-5 w-5 text-muted-foreground" />
                                            <Input
                                                id="register-password"
                                                name="password"
                                                type="password"
                                                required
                                                minLength={8}
                                                className="pr-10 h-12 bg-secondary/50 border-white/10 focus:bg-background transition-all"
                                            />
                                        </div>
                                        <div className="text-xs text-muted-foreground mt-2 space-y-1 bg-secondary/30 p-3 rounded-md">
                                            <p className="font-semibold mb-1">متطلبات كلمة المرور:</p>
                                            <ul className="space-y-0.5 mr-4 list-disc">
                                                <li>8 أحرف على الأقل</li>
                                                <li>حرف كبير (A-Z) وصغير (a-z)</li>
                                                <li>رقم واحد (0-9)</li>
                                                <li>رمز خاص (!@#$%...)</li>
                                            </ul>
                                        </div>
                                        {registerError && (
                                            <p className="text-sm text-red-500 mt-2 font-medium">{registerError}</p>
                                        )}
                                    </div>
                                    <Button
                                        type="submit"
                                        className="w-full h-12 text-lg font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? "جاري التحميل..." : "إنشاء حساب"}
                                    </Button>
                                </form>

                                {/* Divider */}
                                <div className="relative my-6">
                                    <div className="absolute inset-0 flex items-center">
                                        <span className="w-full border-t border-white/10" />
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-card px-2 text-muted-foreground">أو</span>
                                    </div>
                                </div>

                                {/* Google Sign Up */}
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full h-12 text-base font-semibold border-white/10 hover:bg-white/5"
                                    onClick={handleGoogleSignIn}
                                    disabled={isLoading}
                                >
                                    <svg className="w-5 h-5 ml-2" viewBox="0 0 24 24">
                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                    </svg>
                                    التسجيل باستخدام Google
                                </Button>
                            </TabsContent>

                            {/* Login Tab */}
                            <TabsContent value="login">
                                <form onSubmit={handleLoginSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <label htmlFor="login-email" className="text-sm font-medium mr-1">البريد الإلكتروني</label>
                                        <div className="relative">
                                            <Mail className="absolute right-3 top-3 h-5 w-5 text-muted-foreground" />
                                            <Input
                                                id="login-email"
                                                name="email"
                                                type="email"
                                                placeholder="name@example.com"
                                                required
                                                className="pr-10 h-12 bg-secondary/50 border-white/10 focus:bg-background transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <label htmlFor="login-password" className="text-sm font-medium mr-1">كلمة المرور</label>
                                            <Link href="/ar/auth/forgot-password" className="text-sm text-primary hover:underline">
                                                نسيت كلمة المرور؟
                                            </Link>
                                        </div>
                                        <div className="relative">
                                            <Lock className="absolute right-3 top-3 h-5 w-5 text-muted-foreground" />
                                            <Input
                                                id="login-password"
                                                name="password"
                                                type="password"
                                                required
                                                className="pr-10 h-12 bg-secondary/50 border-white/10 focus:bg-background transition-all"
                                            />
                                        </div>
                                        {loginError && (
                                            <p className="text-sm text-red-500 mt-2">{loginError}</p>
                                        )}
                                    </div>
                                    <Button
                                        type="submit"
                                        className="w-full h-12 text-lg font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? "جاري التحميل..." : "تسجيل الدخول"}
                                    </Button>
                                </form>

                                {/* Divider */}
                                <div className="relative my-6">
                                    <div className="absolute inset-0 flex items-center">
                                        <span className="w-full border-t border-white/10" />
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-card px-2 text-muted-foreground">أو</span>
                                    </div>
                                </div>

                                {/* Google Sign In */}
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full h-12 text-base font-semibold border-white/10 hover:bg-white/5"
                                    onClick={handleGoogleSignIn}
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
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
