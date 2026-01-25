"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Edit, Trash2, Shield, Ban, UserPlus, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { toast } from "sonner";

interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    joinDate: string;
}

interface UserFormData {
    name: string;
    email: string;
    password: string;
    role: string;
    status: string;
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [deletingUser, setDeletingUser] = useState<User | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState<UserFormData>({
        name: "",
        email: "",
        password: "",
        role: "user",
        status: "active",
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/users');
            const data = await response.json();

            if (data.success) {
                setUsers(data.data);
            } else {
                toast.error('فشل في تحميل المستخدمين');
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('حدث خطأ أثناء تحميل المستخدمين');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.name || !formData.email) {
            toast.error('الرجاء ملء جميع الحقول المطلوبة');
            return;
        }

        // Password required for new users
        if (!editingUser && !formData.password) {
            toast.error('كلمة المرور مطلوبة للمستخدمين الجدد');
            return;
        }

        // Email validation
        const emailRegex = /^\S+@\S+\.\S+$/;
        if (!emailRegex.test(formData.email)) {
            toast.error('الرجاء إدخال بريد إلكتروني صحيح');
            return;
        }

        // Password length validation (only if password is provided)
        if (formData.password && formData.password.length < 6) {
            toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
            return;
        }

        try {
            setSubmitting(true);
            const url = editingUser ? `/api/users/${editingUser._id}` : '/api/users';
            const method = editingUser ? 'PUT' : 'POST';

            // Only send password if it's set (for new users or if changing password)
            const payload: any = {
                name: formData.name,
                email: formData.email,
                role: formData.role,
                status: formData.status,
            };

            if (formData.password) {
                payload.password = formData.password;
            }

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (data.success) {
                toast.success(editingUser ? 'تم تحديث المستخدم بنجاح' : 'تم إضافة المستخدم بنجاح');
                setIsDialogOpen(false);
                resetForm();
                fetchUsers();
            } else {
                toast.error(data.error || 'حدث خطأ');
            }
        } catch (error) {
            console.error('Error submitting user:', error);
            toast.error('حدث خطأ أثناء حفظ المستخدم');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!deletingUser) return;

        try {
            setSubmitting(true);
            const response = await fetch(`/api/users/${deletingUser._id}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (data.success) {
                toast.success('تم حذف المستخدم بنجاح');
                setIsDeleteDialogOpen(false);
                setDeletingUser(null);
                fetchUsers();
            } else {
                toast.error(data.error || 'فشل في حذف المستخدم');
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            toast.error('حدث خطأ أثناء حذف المستخدم');
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggleStatus = async (user: User) => {
        const newStatus = user.status === 'active' ? 'banned' : 'active';

        try {
            const response = await fetch(`/api/users/${user._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    status: newStatus,
                }),
            });

            const data = await response.json();

            if (data.success) {
                toast.success(newStatus === 'active' ? 'تم تفعيل المستخدم' : 'تم حظر المستخدم');
                fetchUsers();
            } else {
                toast.error(data.error || 'فشل في تغيير حالة المستخدم');
            }
        } catch (error) {
            console.error('Error toggling user status:', error);
            toast.error('حدث خطأ');
        }
    };

    const openCreateDialog = () => {
        resetForm();
        setEditingUser(null);
        setIsDialogOpen(true);
    };

    const openEditDialog = (user: User) => {
        setEditingUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            password: "", // Don't pre-fill password
            role: user.role,
            status: user.status,
        });
        setIsDialogOpen(true);
    };

    const openDeleteDialog = (user: User) => {
        setDeletingUser(user);
        setIsDeleteDialogOpen(true);
    };

    const resetForm = () => {
        setFormData({
            name: "",
            email: "",
            password: "",
            role: "user",
            status: "active",
        });
        setEditingUser(null);
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ar-SA', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        });
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">المستخدمين</h1>
                    <p className="text-muted-foreground mt-2">إدارة حسابات المستخدمين والصلاحيات</p>
                </div>
                <Button onClick={openCreateDialog} className="gap-2">
                    <UserPlus className="w-4 h-4" />
                    إضافة مستخدم جديد
                </Button>
            </div>

            <Card className="border-border/50 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <CardTitle className="text-xl font-bold">قائمة المستخدمين ({filteredUsers.length})</CardTitle>
                    <div className="relative w-full md:w-64">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="بحث عن مستخدم..."
                            className="pr-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
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
                                        <th className="p-4">المستخدم</th>
                                        <th className="p-4">البريد الإلكتروني</th>
                                        <th className="p-4">الدور</th>
                                        <th className="p-4">الحالة</th>
                                        <th className="p-4">تاريخ الانضمام</th>
                                        <th className="p-4 text-left">إجراءات</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {filteredUsers.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="p-8 text-center text-muted-foreground">
                                                لا توجد مستخدمين
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredUsers.map((user) => (
                                            <tr key={user._id} className="hover:bg-secondary/20 transition-colors">
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                            {user.name.charAt(0)}
                                                        </div>
                                                        <p className="font-medium">{user.name}</p>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-muted-foreground">{user.email}</td>
                                                <td className="p-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        user.role === 'admin'
                                                            ? 'bg-primary/10 text-primary'
                                                            : 'bg-secondary text-muted-foreground'
                                                    }`}>
                                                        {user.role === 'admin' ? 'مسؤول' : 'مستخدم'}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        user.status === 'active'
                                                            ? 'bg-emerald-500/10 text-emerald-500'
                                                            : user.status === 'banned'
                                                            ? 'bg-rose-500/10 text-rose-500'
                                                            : 'bg-gray-500/10 text-gray-500'
                                                    }`}>
                                                        {user.status === 'active' ? 'نشط' : user.status === 'banned' ? 'محظور' : 'غير نشط'}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-muted-foreground">{formatDate(user.joinDate)}</td>
                                                <td className="p-4">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                                                            onClick={() => openEditDialog(user)}
                                                            title="تعديل"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className={`h-8 w-8 text-muted-foreground ${
                                                                user.status === 'active' ? 'hover:text-rose-500' : 'hover:text-emerald-500'
                                                            }`}
                                                            onClick={() => handleToggleStatus(user)}
                                                            title={user.status === 'active' ? 'حظر' : 'تفعيل'}
                                                        >
                                                            <Ban className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                            onClick={() => openDeleteDialog(user)}
                                                            title="حذف"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
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

            {/* Create/Edit User Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingUser ? 'تعديل المستخدم' : 'إضافة مستخدم جديد'}</DialogTitle>
                        <DialogDescription>
                            {editingUser ? 'قم بتعديل بيانات المستخدم أدناه' : 'أدخل بيانات المستخدم الجديد'}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="name">الاسم *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="الاسم الكامل"
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="email">البريد الإلكتروني *</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="email@example.com"
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="password">
                                كلمة المرور {editingUser ? '(اتركها فارغة إذا لم ترد التغيير)' : '*'}
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                placeholder="••••••••"
                                required={!editingUser}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="role">الدور *</Label>
                                <Select
                                    id="role"
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    required
                                >
                                    <option value="user">مستخدم</option>
                                    <option value="admin">مسؤول</option>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="status">الحالة *</Label>
                                <Select
                                    id="status"
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    required
                                >
                                    <option value="active">نشط</option>
                                    <option value="inactive">غير نشط</option>
                                    <option value="banned">محظور</option>
                                </Select>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsDialogOpen(false)}
                                disabled={submitting}
                            >
                                إلغاء
                            </Button>
                            <Button type="submit" disabled={submitting}>
                                {submitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                                        جاري الحفظ...
                                    </>
                                ) : (
                                    editingUser ? 'تحديث' : 'إضافة'
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
                        <DialogDescription>
                            هل أنت متأكد من حذف المستخدم "{deletingUser?.name}"؟ هذا الإجراء لا يمكن التراجع عنه.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsDeleteDialogOpen(false)}
                            disabled={submitting}
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
                                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
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
