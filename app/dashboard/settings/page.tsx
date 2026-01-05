"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Save } from "lucide-react";

export default function SettingsPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">الإعدادات</h1>
                <p className="text-muted-foreground mt-2">إدارة إعدادات الموقع والتفضيلات</p>
            </div>

            <div className="grid gap-8">
                {/* General Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle>الإعدادات العامة</CardTitle>
                        <CardDescription>تعديل المعلومات الأساسية للموقع</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">اسم الموقع</label>
                            <Input defaultValue="ريان للتصميم" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">وصف الموقع</label>
                            <Input defaultValue="أفضل المنتجات الرقمية والعروض التقديمية" />
                        </div>
                    </CardContent>
                </Card>

                {/* Contact Info */}
                <Card>
                    <CardHeader>
                        <CardTitle>معلومات التواصل</CardTitle>
                        <CardDescription>تحديث بيانات الاتصال المعروضة في الموقع</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">البريد الإلكتروني</label>
                            <Input type="email" defaultValue="contact@rayan.com" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">رقم الهاتف</label>
                            <Input type="tel" defaultValue="+968 9553 4007" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">العنوان</label>
                            <Input defaultValue="صحار، سلطنة عمان" />
                        </div>
                    </CardContent>
                </Card>

                {/* Social Media */}
                <Card>
                    <CardHeader>
                        <CardTitle>وسائل التواصل الاجتماعي</CardTitle>
                        <CardDescription>روابط حسابات التواصل الاجتماعي</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Instagram</label>
                            <Input defaultValue="https://instagram.com/Rayian_design" />
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button className="gap-2">
                        <Save className="w-4 h-4" />
                        حفظ التغييرات
                    </Button>
                </div>
            </div>
        </div>
    );
}
