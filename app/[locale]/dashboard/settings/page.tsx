"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Save,
    Building2,
    Mail,
    Phone,
    MapPin,
    Globe,
    Instagram,
    Facebook,
    Twitter,
    Settings2,
    Bell,
    Lock,
    Palette,
    Shield,
    Check,
    AlertCircle,
    Loader2
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface SettingsData {
    // General
    siteName: string;
    siteDescription: string;
    siteUrl: string;

    // Contact
    email: string;
    phone: string;
    whatsapp: string;
    address: string;

    // Social Media
    instagram: string;
    facebook: string;
    twitter: string;

    // Notifications
    emailNotifications: boolean;
    orderNotifications: boolean;
    marketingEmails: boolean;
}

export default function SettingsPage() {
    const [loading, setLoading] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [activeTab, setActiveTab] = useState("general");
    const [settings, setSettings] = useState<SettingsData>({
        // General
        siteName: "ريان للتصميم",
        siteDescription: "أفضل المنتجات الرقمية والعروض التقديمية",
        siteUrl: "https://www.rayiandesign.com",

        // Contact
        email: "contact@rayiandesign.com",
        phone: "+968 9553 4007",
        whatsapp: "+968 9553 4007",
        address: "صحار، سلطنة عمان",

        // Social Media
        instagram: "https://instagram.com/Rayian_design",
        facebook: "",
        twitter: "",

        // Notifications
        emailNotifications: true,
        orderNotifications: true,
        marketingEmails: false,
    });

    const handleChange = (field: keyof SettingsData, value: string | boolean) => {
        setSettings(prev => ({ ...prev, [field]: value }));
        setHasChanges(true);
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            toast.success("تم حفظ الإعدادات بنجاح");
            setHasChanges(false);
        } catch (error) {
            toast.error("فشل في حفظ الإعدادات");
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        // Reset to default values
        setSettings({
            siteName: "ريان للتصميم",
            siteDescription: "أفضل المنتجات الرقمية والعروض التقديمية",
            siteUrl: "https://www.rayiandesign.com",
            email: "contact@rayiandesign.com",
            phone: "+968 9553 4007",
            whatsapp: "+968 9553 4007",
            address: "صحار، سلطنة عمان",
            instagram: "https://instagram.com/Rayian_design",
            facebook: "",
            twitter: "",
            emailNotifications: true,
            orderNotifications: true,
            marketingEmails: false,
        });
        setHasChanges(false);
        toast.info("تم إعادة تعيين الإعدادات");
    };

    return (
        <div className="space-y-8 pb-12">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                        الإعدادات
                    </h1>
                    <p className="text-muted-foreground mt-2 text-lg">
                        إدارة وتخصيص إعدادات الموقع بالكامل
                    </p>
                </div>

                {/* Unsaved Changes Indicator */}
                {hasChanges && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg animate-in fade-in slide-in-from-top">
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                        <span className="text-sm text-amber-700 dark:text-amber-400 font-medium">
                            لديك تغييرات غير محفوظة
                        </span>
                    </div>
                )}
            </div>

            {/* Main Content */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                {/* Modern Tab List */}
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 gap-4 bg-transparent h-auto p-0">
                    <TabsTrigger
                        value="general"
                        className={cn(
                            "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                            "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-primary",
                            "data-[state=inactive]:border-border data-[state=inactive]:hover:border-primary/50"
                        )}
                    >
                        <Settings2 className="w-5 h-5" />
                        <span className="font-semibold">عام</span>
                    </TabsTrigger>

                    <TabsTrigger
                        value="contact"
                        className={cn(
                            "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                            "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-primary",
                            "data-[state=inactive]:border-border data-[state=inactive]:hover:border-primary/50"
                        )}
                    >
                        <Phone className="w-5 h-5" />
                        <span className="font-semibold">التواصل</span>
                    </TabsTrigger>

                    <TabsTrigger
                        value="social"
                        className={cn(
                            "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                            "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-primary",
                            "data-[state=inactive]:border-border data-[state=inactive]:hover:border-primary/50"
                        )}
                    >
                        <Globe className="w-5 h-5" />
                        <span className="font-semibold">التواصل الاجتماعي</span>
                    </TabsTrigger>

                    <TabsTrigger
                        value="notifications"
                        className={cn(
                            "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                            "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-primary",
                            "data-[state=inactive]:border-border data-[state=inactive]:hover:border-primary/50"
                        )}
                    >
                        <Bell className="w-5 h-5" />
                        <span className="font-semibold">الإشعارات</span>
                    </TabsTrigger>
                </TabsList>

                {/* General Settings Tab */}
                <TabsContent value="general" className="space-y-6">
                    <Card className="border-2">
                        <CardHeader className="pb-4 border-b bg-secondary/20">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-primary/10">
                                    <Building2 className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl">معلومات الموقع</CardTitle>
                                    <CardDescription>تعديل المعلومات الأساسية للموقع</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-6">
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold flex items-center gap-2">
                                        <Building2 className="w-4 h-4 text-primary" />
                                        اسم الموقع
                                    </label>
                                    <Input
                                        value={settings.siteName}
                                        onChange={(e) => handleChange("siteName", e.target.value)}
                                        className="h-11 text-base"
                                        placeholder="أدخل اسم الموقع"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold flex items-center gap-2">
                                        <Globe className="w-4 h-4 text-primary" />
                                        رابط الموقع
                                    </label>
                                    <Input
                                        value={settings.siteUrl}
                                        onChange={(e) => handleChange("siteUrl", e.target.value)}
                                        className="h-11 text-base"
                                        placeholder="https://..."
                                        dir="ltr"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold">وصف الموقع</label>
                                <Textarea
                                    value={settings.siteDescription}
                                    onChange={(e) => handleChange("siteDescription", e.target.value)}
                                    className="min-h-[100px] text-base resize-none"
                                    placeholder="أدخل وصف الموقع..."
                                />
                                <p className="text-xs text-muted-foreground">
                                    يظهر هذا الوصف في محركات البحث ووسائل التواصل
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Contact Settings Tab */}
                <TabsContent value="contact" className="space-y-6">
                    <Card className="border-2">
                        <CardHeader className="pb-4 border-b bg-secondary/20">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-primary/10">
                                    <Mail className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl">معلومات الاتصال</CardTitle>
                                    <CardDescription>تحديث بيانات التواصل المعروضة في الموقع</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-6">
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-primary" />
                                        البريد الإلكتروني
                                    </label>
                                    <Input
                                        type="email"
                                        value={settings.email}
                                        onChange={(e) => handleChange("email", e.target.value)}
                                        className="h-11 text-base"
                                        placeholder="email@example.com"
                                        dir="ltr"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-primary" />
                                        رقم الهاتف
                                    </label>
                                    <Input
                                        type="tel"
                                        value={settings.phone}
                                        onChange={(e) => handleChange("phone", e.target.value)}
                                        className="h-11 text-base"
                                        placeholder="+968 XXXX XXXX"
                                        dir="ltr"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold flex items-center gap-2">
                                        <svg className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                        </svg>
                                        واتساب
                                    </label>
                                    <Input
                                        type="tel"
                                        value={settings.whatsapp}
                                        onChange={(e) => handleChange("whatsapp", e.target.value)}
                                        className="h-11 text-base"
                                        placeholder="+968 XXXX XXXX"
                                        dir="ltr"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-primary" />
                                        العنوان
                                    </label>
                                    <Input
                                        value={settings.address}
                                        onChange={(e) => handleChange("address", e.target.value)}
                                        className="h-11 text-base"
                                        placeholder="المدينة، البلد"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Social Media Tab */}
                <TabsContent value="social" className="space-y-6">
                    <Card className="border-2">
                        <CardHeader className="pb-4 border-b bg-secondary/20">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-primary/10">
                                    <Globe className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl">وسائل التواصل الاجتماعي</CardTitle>
                                    <CardDescription>روابط حسابات التواصل الاجتماعي الخاصة بك</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold flex items-center gap-2">
                                        <Instagram className="w-4 h-4 text-pink-500" />
                                        Instagram
                                    </label>
                                    <div className="relative">
                                        <Input
                                            value={settings.instagram}
                                            onChange={(e) => handleChange("instagram", e.target.value)}
                                            className="h-11 text-base pr-10"
                                            placeholder="https://instagram.com/username"
                                            dir="ltr"
                                        />
                                        <Instagram className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold flex items-center gap-2">
                                        <Facebook className="w-4 h-4 text-blue-500" />
                                        Facebook
                                    </label>
                                    <div className="relative">
                                        <Input
                                            value={settings.facebook}
                                            onChange={(e) => handleChange("facebook", e.target.value)}
                                            className="h-11 text-base pr-10"
                                            placeholder="https://facebook.com/username"
                                            dir="ltr"
                                        />
                                        <Facebook className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold flex items-center gap-2">
                                        <Twitter className="w-4 h-4 text-sky-500" />
                                        Twitter (X)
                                    </label>
                                    <div className="relative">
                                        <Input
                                            value={settings.twitter}
                                            onChange={(e) => handleChange("twitter", e.target.value)}
                                            className="h-11 text-base pr-10"
                                            placeholder="https://twitter.com/username"
                                            dir="ltr"
                                        />
                                        <Twitter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                                <p className="text-sm text-blue-700 dark:text-blue-400">
                                    <strong>نصيحة:</strong> تأكد من إضافة الرابط الكامل بما في ذلك https://
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Notifications Tab */}
                <TabsContent value="notifications" className="space-y-6">
                    <Card className="border-2">
                        <CardHeader className="pb-4 border-b bg-secondary/20">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-primary/10">
                                    <Bell className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl">إعدادات الإشعارات</CardTitle>
                                    <CardDescription>تخصيص تفضيلات الإشعارات الخاصة بك</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-secondary/20 transition-colors">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <Mail className="w-4 h-4 text-primary" />
                                            <span className="font-semibold">إشعارات البريد الإلكتروني</span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            تلقي تحديثات عبر البريد الإلكتروني
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleChange("emailNotifications", !settings.emailNotifications)}
                                        className={cn(
                                            "relative w-14 h-7 rounded-full transition-colors",
                                            settings.emailNotifications ? "bg-primary" : "bg-gray-300 dark:bg-gray-600"
                                        )}
                                    >
                                        <span
                                            className={cn(
                                                "absolute top-1 h-5 w-5 rounded-full bg-white transition-transform shadow-sm",
                                                settings.emailNotifications ? "right-1" : "right-8"
                                            )}
                                        />
                                    </button>
                                </div>

                                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-secondary/20 transition-colors">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <Bell className="w-4 h-4 text-primary" />
                                            <span className="font-semibold">إشعارات الطلبات</span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            إشعار عند استلام طلبات جديدة
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleChange("orderNotifications", !settings.orderNotifications)}
                                        className={cn(
                                            "relative w-14 h-7 rounded-full transition-colors",
                                            settings.orderNotifications ? "bg-primary" : "bg-gray-300 dark:bg-gray-600"
                                        )}
                                    >
                                        <span
                                            className={cn(
                                                "absolute top-1 h-5 w-5 rounded-full bg-white transition-transform shadow-sm",
                                                settings.orderNotifications ? "right-1" : "right-8"
                                            )}
                                        />
                                    </button>
                                </div>

                                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-secondary/20 transition-colors">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <Settings2 className="w-4 h-4 text-primary" />
                                            <span className="font-semibold">رسائل تسويقية</span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            تلقي عروض وتحديثات المنتجات
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleChange("marketingEmails", !settings.marketingEmails)}
                                        className={cn(
                                            "relative w-14 h-7 rounded-full transition-colors",
                                            settings.marketingEmails ? "bg-primary" : "bg-gray-300 dark:bg-gray-600"
                                        )}
                                    >
                                        <span
                                            className={cn(
                                                "absolute top-1 h-5 w-5 rounded-full bg-white transition-transform shadow-sm",
                                                settings.marketingEmails ? "right-1" : "right-8"
                                            )}
                                        />
                                    </button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Floating Action Bar */}
            <div className={cn(
                "fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300",
                hasChanges ? "translate-y-0" : "translate-y-full"
            )}>
                <div className="container max-w-7xl mx-auto px-4 pb-4">
                    <Card className="border-2 shadow-2xl bg-background/95 backdrop-blur">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-full bg-amber-500/10">
                                        <AlertCircle className="w-5 h-5 text-amber-500" />
                                    </div>
                                    <div>
                                        <p className="font-semibold">لديك تغييرات غير محفوظة</p>
                                        <p className="text-sm text-muted-foreground">
                                            اضغط "حفظ التغييرات" لتطبيق التعديلات
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Button
                                        variant="outline"
                                        onClick={handleReset}
                                        disabled={loading}
                                        className="gap-2"
                                    >
                                        إعادة تعيين
                                    </Button>
                                    <Button
                                        onClick={handleSave}
                                        disabled={loading}
                                        className="gap-2 min-w-[140px]"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                جاري الحفظ...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4" />
                                                حفظ التغييرات
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
