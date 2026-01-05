"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Edit, Trash2, Shield, Ban } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const initialUsers = [
    { id: "1", name: "أحمد محمد", email: "ahmed@example.com", role: "user", status: "active", joinDate: "2024-01-15" },
    { id: "2", name: "سارة علي", email: "sara@example.com", role: "admin", status: "active", joinDate: "2024-02-20" },
    { id: "3", name: "خالد عبدالله", email: "khaled@example.com", role: "user", status: "inactive", joinDate: "2024-03-10" },
    { id: "4", name: "منى سعيد", email: "mona@example.com", role: "user", status: "active", joinDate: "2024-04-05" },
];

export default function UsersPage() {
    const [users, setUsers] = useState(initialUsers);
    const [searchQuery, setSearchQuery] = useState("");

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleDelete = (id: string) => {
        if (confirm("هل أنت متأكد من حذف هذا المستخدم؟")) {
            setUsers(users.filter(u => u.id !== id));
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">المستخدمين</h1>
                    <p className="text-muted-foreground mt-2">إدارة حسابات المستخدمين والصلاحيات</p>
                </div>
                <Button className="gap-2">
                    <Shield className="w-4 h-4" />
                    إضافة مسؤول جديد
                </Button>
            </div>

            <Card className="border-border/50 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <CardTitle className="text-xl font-bold">قائمة المستخدمين</CardTitle>
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
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-secondary/20 transition-colors">
                                        <td className="p-4 font-medium">{user.name}</td>
                                        <td className="p-4 text-muted-foreground">{user.email}</td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground'
                                                }`}>
                                                {user.role === 'admin' ? 'مسؤول' : 'مستخدم'}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                                                }`}>
                                                {user.status === 'active' ? 'نشط' : 'غير نشط'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-muted-foreground">{user.joinDate}</td>
                                        <td className="p-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                    onClick={() => handleDelete(user.id)}
                                                >
                                                    <Ban className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
