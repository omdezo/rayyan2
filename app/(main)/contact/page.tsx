"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Instagram, Phone, MapPin, Send, MessageSquare, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function ContactPage() {
    return (
        <div className="min-h-screen pb-20 bg-background overflow-hidden">
            {/* Hero */}
            <section className="relative py-32 text-center px-4 overflow-hidden">
                <div className="absolute inset-0 w-full h-full pointer-events-none">
                    <div className="absolute top-0 right-1/4 w-1/2 h-1/2 bg-primary/5 blur-[120px] rounded-full" />
                    <div className="absolute bottom-0 left-1/4 w-1/2 h-1/2 bg-secondary/10 blur-[120px] rounded-full" />
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="max-w-3xl mx-auto space-y-6 relative z-10"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-secondary text-sm font-medium text-muted-foreground mb-4">
                        <Sparkles className="w-4 h-4 text-primary" />
                        <span>نحن هنا للمساعدة</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tight text-foreground">تواصل معنا</h1>
                    <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                        نحن هنا للإجابة على استفساراتك ومساعدتك في أي وقت. لا تتردد في التواصل معنا.
                    </p>
                </motion.div>
            </section>

            <div className="container px-4 -mt-10 relative z-20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Contact Info Cards */}
                    <div className="lg:col-span-1 space-y-6">
                        {[
                            { icon: Instagram, title: "انستجرام", desc: "تابع أحدث أعمالنا", link: "https://instagram.com/Rayian_design", linkText: "@Rayian_design", delay: 0.2 },
                            { icon: Phone, title: "الهاتف", desc: "من الأحد إلى الخميس، 9ص - 5م", link: "tel:+96895534007", linkText: "95534007", delay: 0.3 },
                            { icon: MapPin, title: "الموقع", desc: "صحار، سلطنة عمان", link: null, linkText: null, delay: 0.4 }
                        ].map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: item.delay }}
                            >
                                <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card hover:shadow-lg hover:border-primary/20 transition-all duration-300 group">
                                    <CardContent className="p-6 flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-secondary text-primary flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:bg-primary/10 transition-all duration-300">
                                            <item.icon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg mb-1">{item.title}</h3>
                                            <p className="text-muted-foreground text-sm mb-2">{item.desc}</p>
                                            {item.link && (
                                                <a href={item.link} className="text-primary font-semibold hover:underline">{item.linkText}</a>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>

                    {/* Contact Form */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="lg:col-span-2"
                    >
                        <Card className="h-full border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl overflow-hidden relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
                            <CardContent className="p-8 relative">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                                        <MessageSquare className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold">أرسل لنا رسالة</h2>
                                        <p className="text-muted-foreground text-sm">سنرد عليك في أقرب وقت ممكن</p>
                                    </div>
                                </div>

                                <form className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label htmlFor="name" className="text-sm font-medium">الاسم الكامل</label>
                                            <Input id="name" placeholder="الاسم" className="h-12 bg-secondary/50 border-white/10 focus:bg-background transition-all" />
                                        </div>
                                        <div className="space-y-2">
                                            <label htmlFor="email" className="text-sm font-medium">البريد الإلكتروني</label>
                                            <Input id="email" type="email" placeholder="name@example.com" className="h-12 bg-secondary/50 border-white/10 focus:bg-background transition-all" />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="subject" className="text-sm font-medium">الموضوع</label>
                                        <Input id="subject" placeholder="كيف يمكننا مساعدتك؟" className="h-12 bg-secondary/50 border-white/10 focus:bg-background transition-all" />
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="message" className="text-sm font-medium">الرسالة</label>
                                        <textarea
                                            id="message"
                                            className="flex min-h-[150px] w-full rounded-md border border-white/10 bg-secondary/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none focus:bg-background transition-all"
                                            placeholder="اكتب رسالتك هنا..."
                                        />
                                    </div>

                                    <Button type="submit" size="lg" className="w-full h-14 text-lg font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all">
                                        إرسال الرسالة <Send className="mr-2 h-5 w-5" />
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
