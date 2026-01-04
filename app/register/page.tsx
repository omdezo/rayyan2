"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Lock, Mail, User } from "lucide-react";

export default function RegisterPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate registration
        await new Promise((resolve) => setTimeout(resolve, 1000));
        router.push("/");
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
                                        type="password"
                                        required
                                        className="pr-10 h-12 bg-secondary/50 border-white/10 focus:bg-background transition-all"
                                    />
                                </div>
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
                            <Link href="/login" className="text-primary hover:text-primary/80 font-bold hover:underline transition-all inline-flex items-center gap-1">
                                تسجيل الدخول <ArrowLeft className="w-3 h-3" />
                            </Link>
                        </motion.div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
