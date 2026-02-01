"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, Eye, EyeOff, GripVertical, Save, X } from "lucide-react";
import { ISection } from "@/lib/types/models";

export default function SectionsPage() {
    const [sections, setSections] = useState<ISection[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        key: "",
        nameAr: "",
        nameEn: "",
        descriptionAr: "",
        descriptionEn: "",
        icon: "",
        isActive: true,
        order: 0,
    });

    useEffect(() => {
        fetchSections();
    }, []);

    const fetchSections = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/sections');
            const data = await response.json();

            if (data.success) {
                setSections(data.data);
            } else {
                toast.error('فشل في تحميل الأقسام');
            }
        } catch (error) {
            console.error('Error fetching sections:', error);
            toast.error('حدث خطأ أثناء تحميل الأقسام');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            key: "",
            nameAr: "",
            nameEn: "",
            descriptionAr: "",
            descriptionEn: "",
            icon: "",
            isActive: true,
            order: sections.length,
        });
        setEditingId(null);
        setShowAddForm(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.key || !formData.nameAr || !formData.nameEn) {
            toast.error('الرجاء ملء جميع الحقول المطلوبة');
            return;
        }

        try {
            const url = editingId ? `/api/sections/${editingId}` : '/api/sections';
            const method = editingId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (data.success) {
                toast.success(editingId ? 'تم تحديث القسم بنجاح' : 'تم إضافة القسم بنجاح');
                fetchSections();
                resetForm();
            } else {
                toast.error(data.error || 'حدث خطأ');
            }
        } catch (error) {
            console.error('Error saving section:', error);
            toast.error('حدث خطأ أثناء حفظ القسم');
        }
    };

    const handleEdit = (section: ISection) => {
        setFormData({
            key: section.key,
            nameAr: section.nameAr,
            nameEn: section.nameEn,
            descriptionAr: section.descriptionAr || "",
            descriptionEn: section.descriptionEn || "",
            icon: section.icon || "",
            isActive: section.isActive,
            order: section.order,
        });
        setEditingId(section._id);
        setShowAddForm(true);
    };

    const handleDelete = async (id: string, nameAr: string) => {
        if (!confirm(`هل أنت متأكد من حذف القسم "${nameAr}"؟`)) {
            return;
        }

        try {
            const response = await fetch(`/api/sections/${id}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (data.success) {
                toast.success('تم حذف القسم بنجاح');
                fetchSections();
            } else {
                toast.error(data.error || 'فشل في حذف القسم');
            }
        } catch (error) {
            console.error('Error deleting section:', error);
            toast.error('حدث خطأ أثناء حذف القسم');
        }
    };

    const toggleVisibility = async (id: string, currentStatus: boolean) => {
        try {
            const response = await fetch(`/api/sections/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ isActive: !currentStatus }),
            });

            const data = await response.json();

            if (data.success) {
                toast.success(currentStatus ? 'تم إخفاء القسم' : 'تم إظهار القسم');
                fetchSections();
            } else {
                toast.error(data.error || 'حدث خطأ');
            }
        } catch (error) {
            console.error('Error toggling visibility:', error);
            toast.error('حدث خطأ أثناء تغيير حالة القسم');
        }
    };

    if (loading) {
        return (
            <div className="container py-10">
                <div className="text-center">جاري التحميل...</div>
            </div>
        );
    }

    return (
        <div className="container py-10 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">إدارة الأقسام</h1>
                    <p className="text-muted-foreground mt-2">
                        إضافة، تعديل، حذف، وإخفاء/إظهار الأقسام
                    </p>
                </div>
                <Button
                    onClick={() => {
                        resetForm();
                        setShowAddForm(true);
                    }}
                    className="gap-2"
                >
                    <Plus className="w-4 h-4" />
                    إضافة قسم جديد
                </Button>
            </div>

            {/* Add/Edit Form */}
            {showAddForm && (
                <Card className="border-2 border-primary/20">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span>{editingId ? 'تعديل القسم' : 'إضافة قسم جديد'}</span>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={resetForm}
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="key">المعرف (Key) *</Label>
                                    <Input
                                        id="key"
                                        value={formData.key}
                                        onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                                        placeholder="ai-games"
                                        required
                                        disabled={!!editingId}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        معرف فريد بالإنجليزية (لا يمكن تغييره بعد الإنشاء)
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="icon">الأيقونة (اختياري)</Label>
                                    <Input
                                        id="icon"
                                        value={formData.icon}
                                        onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                        placeholder="🎮"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        يمكنك إضافة إيموجي أو اسم أيقونة
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="nameAr">الاسم بالعربية *</Label>
                                    <Input
                                        id="nameAr"
                                        value={formData.nameAr}
                                        onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                                        placeholder="عروض إرشادية"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="nameEn">الاسم بالإنجليزية *</Label>
                                    <Input
                                        id="nameEn"
                                        value={formData.nameEn}
                                        onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                                        placeholder="Guidance"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="descriptionAr">الوصف بالعربية (اختياري)</Label>
                                    <Input
                                        id="descriptionAr"
                                        value={formData.descriptionAr}
                                        onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                                        placeholder="وصف القسم بالعربية"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="descriptionEn">الوصف بالإنجليزية (اختياري)</Label>
                                    <Input
                                        id="descriptionEn"
                                        value={formData.descriptionEn}
                                        onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                                        placeholder="Section description in English"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="order">الترتيب</Label>
                                    <Input
                                        id="order"
                                        type="number"
                                        value={formData.order}
                                        onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                                        placeholder="0"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        رقم أقل = يظهر أولاً
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="isActive">حالة القسم</Label>
                                    <div className="flex items-center gap-2">
                                        <Switch
                                            id="isActive"
                                            checked={formData.isActive}
                                            onCheckedChange={(checked) =>
                                                setFormData({ ...formData, isActive: checked })
                                            }
                                        />
                                        <span className="text-sm">
                                            {formData.isActive ? 'نشط (ظاهر)' : 'غير نشط (مخفي)'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <Button type="submit" className="gap-2">
                                    <Save className="w-4 h-4" />
                                    {editingId ? 'حفظ التعديلات' : 'إضافة القسم'}
                                </Button>
                                <Button type="button" variant="outline" onClick={resetForm}>
                                    إلغاء
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Sections List */}
            <Card>
                <CardHeader>
                    <CardTitle>الأقسام ({sections.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {sections.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            لا توجد أقسام بعد. قم بإضافة قسم جديد للبدء.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {sections.map((section) => (
                                <div
                                    key={section._id}
                                    className="flex items-center gap-4 p-4 border rounded-lg hover:bg-secondary/50 transition-colors"
                                >
                                    <GripVertical className="w-5 h-5 text-muted-foreground cursor-move" />

                                    {section.icon && (
                                        <div className="text-2xl">{section.icon}</div>
                                    )}

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold">{section.nameAr}</h3>
                                            <span className="text-sm text-muted-foreground">
                                                ({section.nameEn})
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                            <span>المعرف: {section.key}</span>
                                            <span>•</span>
                                            <span>الترتيب: {section.order}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => toggleVisibility(section._id, section.isActive)}
                                            className="gap-2"
                                        >
                                            {section.isActive ? (
                                                <>
                                                    <Eye className="w-4 h-4" />
                                                    ظاهر
                                                </>
                                            ) : (
                                                <>
                                                    <EyeOff className="w-4 h-4" />
                                                    مخفي
                                                </>
                                            )}
                                        </Button>

                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleEdit(section)}
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </Button>

                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDelete(section._id, section.nameAr)}
                                            className="text-destructive hover:text-destructive"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
