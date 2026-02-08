"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Lock, Loader2 } from "lucide-react";
import { toast } from "sonner";

function ResetPasswordContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <Card className="w-full max-w-md">
                    <CardContent className="text-center p-8">
                        <p className="text-red-500">رمز إعادة التعيين مفقود</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (newPassword !== confirmPassword) {
            setError('كلمات المرور غير متطابقة');
            return;
        }

        // Client-side validation
        if (newPassword.length < 8) {
            setError('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword }),
            });

            const data = await response.json();

            if (data.success) {
                toast.success('تم إعادة تعيين كلمة المرور بنجاح!');
                router.push('/ar/login');
            } else {
                setError(data.error || 'حدث خطأ');
                toast.error(data.error);
            }
        } catch (error) {
            setError('حدث خطأ أثناء إعادة التعيين');
            toast.error('حدث خطأ');
        } finally {
            setIsLoading(false);
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
                        <CardTitle className="text-2xl">إعادة تعيين كلمة المرور</CardTitle>
                        <p className="text-muted-foreground mt-2">
                            أدخل كلمة المرور الجديدة
                        </p>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label htmlFor="newPassword" className="text-sm font-medium">
                                    كلمة المرور الجديدة
                                </label>
                                <div className="relative">
                                    <Lock className="absolute right-3 top-3 h-5 w-5 text-muted-foreground" />
                                    <Input
                                        id="newPassword"
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                        minLength={8}
                                        className="pr-10 h-12"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="confirmPassword" className="text-sm font-medium">
                                    تأكيد كلمة المرور
                                </label>
                                <div className="relative">
                                    <Lock className="absolute right-3 top-3 h-5 w-5 text-muted-foreground" />
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        minLength={8}
                                        className="pr-10 h-12"
                                    />
                                </div>
                            </div>
                            {error && (
                                <p className="text-sm text-red-500">{error}</p>
                            )}
                            <div className="text-xs text-muted-foreground bg-secondary/30 p-3 rounded-md">
                                <p className="font-semibold mb-1">متطلبات كلمة المرور:</p>
                                <ul className="space-y-0.5 mr-4 list-disc">
                                    <li>8 أحرف على الأقل</li>
                                    <li>حرف كبير (A-Z)</li>
                                    <li>حرف صغير (a-z)</li>
                                    <li>رقم (0-9)</li>
                                    <li>رمز خاص (!@#$%...)</li>
                                </ul>
                            </div>
                            <Button type="submit" className="w-full h-12" disabled={isLoading}>
                                {isLoading ? "جاري التعيين..." : "إعادة تعيين كلمة المرور"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        }>
            <ResetPasswordContent />
        </Suspense>
    );
}
