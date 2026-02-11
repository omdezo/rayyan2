"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Lock, Mail, User } from "lucide-react";
import { toast } from "sonner";

export default function RegisterPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        const formData = new FormData(e.currentTarget);
        const name = formData.get("name") as string;
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        // Client-side strong password validation
        if (password.length < 8) {
            setError("كلمة المرور يجب أن تكون 8 أحرف على الأقل");
            toast.error("كلمة المرور قصيرة جداً");
            setIsLoading(false);
            return;
        }

        if (!/[A-Z]/.test(password)) {
            setError("كلمة المرور يجب أن تحتوي على حرف كبير واحد على الأقل");
            toast.error("كلمة المرور ضعيفة");
            setIsLoading(false);
            return;
        }

        if (!/[a-z]/.test(password)) {
            setError("كلمة المرور يجب أن تحتوي على حرف صغير واحد على الأقل");
            toast.error("كلمة المرور ضعيفة");
            setIsLoading(false);
            return;
        }

        if (!/[0-9]/.test(password)) {
            setError("كلمة المرور يجب أن تحتوي على رقم واحد على الأقل");
            toast.error("كلمة المرور ضعيفة");
            setIsLoading(false);
            return;
        }

        if (!/[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/]/.test(password)) {
            setError("كلمة المرور يجب أن تحتوي على رمز خاص واحد على الأقل (!@#$%...)");
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
                setError(data.error || "حدث خطأ أثناء إنشاء الحساب");
                toast.error("فشل إنشاء الحساب", {
                    description: data.error || "حدث خطأ غير متوقع",
                });
            }
        } catch (error) {
            console.error("Registration error:", error);
            setError("حدث خطأ أثناء الاتصال بالخادم");
            toast.error("حدث خطأ أثناء إنشاء الحساب");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
            {/* Background Elements */}
            <div className="absolute inset-0 w-full h-full">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[100px] animate-blob" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-secondary/40 blur-[100px] animate-blob animation-delay-2000" />
                <div className="absolute top-[40%] right-[40%] w-[30%] h-[30%] rounded-full bg-accent/20 blur-[100px] animate-blob animation-delay-4000" />
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
                            <CardTitle className="text-3xl font-black tracking-tight">إنشاء حساب جديد</CardTitle>
                            <p className="text-muted-foreground mt-2">انضم إلينا وابدأ رحلتك الإبداعية</p>
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
                                <label htmlFor="name" className="text-sm font-medium mr-1">الاسم الكامل</label>
                                <div className="relative">
                                    <User className="absolute right-3 top-3 h-5 w-5 text-muted-foreground" />
                                    <Input
                                        id="name"
                                        name="name"
                                        placeholder="الاسم"
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
                                transition={{ delay: 0.5 }}
                                className="space-y-2"
                            >
                                <label htmlFor="password" className="text-sm font-medium mr-1">كلمة المرور</label>
                                <div className="relative">
                                    <Lock className="absolute right-3 top-3 h-5 w-5 text-muted-foreground" />
                                    <Input
                                        id="password"
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
                                        <li>حرف كبير واحد (A-Z)</li>
                                        <li>حرف صغير واحد (a-z)</li>
                                        <li>رقم واحد (0-9)</li>
                                        <li>رمز خاص واحد (!@#$%...)</li>
                                    </ul>
                                </div>
                                {error && (
                                    <p className="text-sm text-red-500 mt-2 font-medium">{error}</p>
                                )}
                            </motion.div>
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.6 }}
                            >
                                <Button type="submit" className="w-full h-12 text-lg font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all" disabled={isLoading}>
                                    {isLoading ? "جاري التحميل..." : "إنشاء حساب"}
                                </Button>
                            </motion.div>
                        </form>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.7 }}
                            className="mt-8 text-center text-sm text-muted-foreground"
                        >
                            لديك حساب بالفعل؟{" "}
                            <Link href="/ar/login" className="text-primary hover:text-primary/80 font-bold hover:underline transition-all inline-flex items-center gap-1">
                                تسجيل الدخول <ArrowLeft className="w-3 h-3" />
                            </Link>
                        </motion.div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
