"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Edit, Trash2, Loader2, Percent, Calendar, Users, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

interface DiscountCode {
    _id: string;
    code: string;
    discountPercent: number;
    isActive: boolean;
    usageLimit: number | null;
    usedCount: number;
    validFrom: Date | null;
    validUntil: Date | null;
    minPurchaseAmount: number;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
}

interface FormData {
    code: string;
    discountPercent: string;
    isActive: boolean;
    usageLimit: string;
    validFrom: string;
    validUntil: string;
    minPurchaseAmount: string;
    description: string;
}

export default function DiscountCodesPage() {
    const [codes, setCodes] = useState<DiscountCode[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [editingCode, setEditingCode] = useState<DiscountCode | null>(null);
    const [deletingCode, setDeletingCode] = useState<DiscountCode | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState<FormData>({
        code: "",
        discountPercent: "",
        isActive: true,
        usageLimit: "",
        validFrom: "",
        validUntil: "",
        minPurchaseAmount: "",
        description: "",
    });

    useEffect(() => {
        fetchCodes();
    }, []);

    const fetchCodes = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/discount-codes');
            const data = await response.json();

            if (data.success) {
                setCodes(data.data);
            } else {
                toast.error('فشل في تحميل رموز الخصم');
            }
        } catch (error) {
            console.error('Error fetching discount codes:', error);
            toast.error('حدث خطأ أثناء تحميل رموز الخصم');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (code?: DiscountCode) => {
        if (code) {
            setEditingCode(code);
            setFormData({
                code: code.code,
                discountPercent: code.discountPercent.toString(),
                isActive: code.isActive,
                usageLimit: code.usageLimit?.toString() || "",
                validFrom: code.validFrom ? new Date(code.validFrom).toISOString().split('T')[0] : "",
                validUntil: code.validUntil ? new Date(code.validUntil).toISOString().split('T')[0] : "",
                minPurchaseAmount: code.minPurchaseAmount?.toString() || "0",
                description: code.description || "",
            });
        } else {
            setEditingCode(null);
            setFormData({
                code: "",
                discountPercent: "",
                isActive: true,
                usageLimit: "",
                validFrom: "",
                validUntil: "",
                minPurchaseAmount: "",
                description: "",
            });
        }
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setEditingCode(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.code.trim()) {
            toast.error('الرجاء إدخال رمز الخصم');
            return;
        }

        if (!formData.discountPercent || parseFloat(formData.discountPercent) < 1 || parseFloat(formData.discountPercent) > 100) {
            toast.error('نسبة الخصم يجب أن تكون بين 1 و 100');
            return;
        }

        try {
            setSubmitting(true);

            const codeData = {
                code: formData.code.trim().toUpperCase(),
                discountPercent: parseFloat(formData.discountPercent),
                isActive: formData.isActive,
                usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
                validFrom: formData.validFrom || null,
                validUntil: formData.validUntil || null,
                minPurchaseAmount: formData.minPurchaseAmount ? parseFloat(formData.minPurchaseAmount) : 0,
                description: formData.description,
            };

            const url = editingCode
                ? `/api/discount-codes/${editingCode._id}`
                : '/api/discount-codes';

            const method = editingCode ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(codeData),
            });

            const data = await response.json();

            if (data.success) {
                toast.success(editingCode ? 'تم تحديث رمز الخصم بنجاح' : 'تم إنشاء رمز الخصم بنجاح');
                handleCloseDialog();
                fetchCodes();
            } else {
                toast.error(data.message || 'حدث خطأ');
            }
        } catch (error) {
            console.error('Error saving discount code:', error);
            toast.error('حدث خطأ أثناء حفظ رمز الخصم');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!deletingCode) return;

        try {
            setSubmitting(true);
            const response = await fetch(`/api/discount-codes/${deletingCode._id}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (data.success) {
                toast.success('تم حذف رمز الخصم بنجاح');
                setIsDeleteDialogOpen(false);
                setDeletingCode(null);
                fetchCodes();
            } else {
                toast.error(data.message || 'حدث خطأ أثناء الحذف');
            }
        } catch (error) {
            console.error('Error deleting discount code:', error);
            toast.error('حدث خطأ أثناء حذف رمز الخصم');
        } finally {
            setSubmitting(false);
        }
    };

    const formatDate = (date: Date | null) => {
        if (!date) return 'غير محدد';
        return new Date(date).toLocaleDateString('ar-SA');
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">رموز الخصم</h1>
                    <p className="text-muted-foreground mt-2">إدارة رموز الخصم والعروض الترويجية</p>
                </div>
                <Button onClick={() => handleOpenDialog()} className="gap-2">
                    <Plus className="w-4 h-4" />
                    إضافة رمز خصم جديد
                </Button>
            </div>

            <Card className="border-border/50 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-xl font-bold">قائمة رموز الخصم ({codes.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <div className="rounded-xl border border-border overflow-hidden">
                            <table className="w-full text-sm text-right">
                                <thead className="bg-secondary/50 text-muted-foreground font-medium">
                                    <tr>
                                        <th className="p-4">الرمز</th>
                                        <th className="p-4">الخصم</th>
                                        <th className="p-4">الاستخدام</th>
                                        <th className="p-4">الحد الأدنى</th>
                                        <th className="p-4">صالح حتى</th>
                                        <th className="p-4">الحالة</th>
                                        <th className="p-4 text-left">إجراءات</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {codes.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="p-8 text-center text-muted-foreground">
                                                لا توجد رموز خصم
                                            </td>
                                        </tr>
                                    ) : (
                                        codes.map((code) => (
                                            <tr key={code._id} className="hover:bg-secondary/20 transition-colors">
                                                <td className="p-4">
                                                    <span className="font-mono font-bold text-primary">{code.code}</span>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-1">
                                                        <Percent className="w-3 h-3 text-green-600" />
                                                        <span className="font-semibold text-green-600">{code.discountPercent}%</span>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-1">
                                                        <Users className="w-3 h-3 text-blue-600" />
                                                        <span className="text-xs">
                                                            {code.usedCount} / {code.usageLimit || '∞'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-1">
                                                        <DollarSign className="w-3 h-3 text-amber-600" />
                                                        <span className="text-xs">{code.minPurchaseAmount.toFixed(3)} ر.ع</span>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3 text-purple-600" />
                                                        <span className="text-xs">{formatDate(code.validUntil)}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    {code.isActive ? (
                                                        <span className="px-2 py-1 bg-green-500/10 text-green-600 rounded-md text-xs font-medium">
                                                            نشط
                                                        </span>
                                                    ) : (
                                                        <span className="px-2 py-1 bg-red-500/10 text-red-600 rounded-md text-xs font-medium">
                                                            معطل
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex gap-2 justify-end">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleOpenDialog(code)}
                                                            className="gap-2"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                            تعديل
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => {
                                                                setDeletingCode(code);
                                                                setIsDeleteDialogOpen(true);
                                                            }}
                                                            className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                            حذف
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Create/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editingCode ? 'تعديل رمز الخصم' : 'إضافة رمز خصم جديد'}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="code">رمز الخصم *</Label>
                                <Input
                                    id="code"
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    placeholder="OFF25"
                                    required
                                    className="font-mono"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="discountPercent">نسبة الخصم (%) *</Label>
                                <Input
                                    id="discountPercent"
                                    type="number"
                                    min="1"
                                    max="100"
                                    step="1"
                                    value={formData.discountPercent}
                                    onChange={(e) => setFormData({ ...formData, discountPercent: e.target.value })}
                                    placeholder="25"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="usageLimit">حد الاستخدام</Label>
                                <Input
                                    id="usageLimit"
                                    type="number"
                                    min="1"
                                    value={formData.usageLimit}
                                    onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                                    placeholder="غير محدود"
                                />
                                <p className="text-xs text-muted-foreground">اتركه فارغاً لعدد غير محدود</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="minPurchaseAmount">الحد الأدنى للشراء (ر.ع)</Label>
                                <Input
                                    id="minPurchaseAmount"
                                    type="number"
                                    min="0"
                                    step="0.001"
                                    value={formData.minPurchaseAmount}
                                    onChange={(e) => setFormData({ ...formData, minPurchaseAmount: e.target.value })}
                                    placeholder="0.000"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="validFrom">صالح من</Label>
                                <Input
                                    id="validFrom"
                                    type="date"
                                    value={formData.validFrom}
                                    onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="validUntil">صالح حتى</Label>
                                <Input
                                    id="validUntil"
                                    type="date"
                                    value={formData.validUntil}
                                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">الوصف</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="وصف اختياري للرمز"
                                rows={3}
                            />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-secondary/20 rounded-lg">
                            <Label htmlFor="isActive" className="cursor-pointer">
                                تفعيل الرمز
                            </Label>
                            <Switch
                                id="isActive"
                                checked={formData.isActive}
                                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                            />
                        </div>

                        <DialogFooter className="gap-2">
                            <Button type="button" variant="outline" onClick={handleCloseDialog}>
                                إلغاء
                            </Button>
                            <Button type="submit" disabled={submitting}>
                                {submitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        جاري الحفظ...
                                    </>
                                ) : (
                                    editingCode ? 'تحديث' : 'إنشاء'
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>تأكيد الحذف</DialogTitle>
                    </DialogHeader>
                    <p className="text-muted-foreground">
                        هل أنت متأكد من حذف رمز الخصم <span className="font-mono font-bold text-primary">{deletingCode?.code}</span>؟
                        لا يمكن التراجع عن هذا الإجراء.
                    </p>
                    <DialogFooter className="gap-2">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsDeleteDialogOpen(false);
                                setDeletingCode(null);
                            }}
                        >
                            إلغاء
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={submitting}
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    جاري الحذف...
                                </>
                            ) : (
                                'حذف'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
