"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Link } from "@/i18n/routing";
import { ArrowLeft, CheckCircle2, Users, Trophy, Target, Sparkles, Zap, Heart } from "lucide-react";
import { useTranslations } from "next-intl";

export default function AboutPage() {
    const t = useTranslations('About');

    return (
        <div className="min-h-screen bg-background overflow-hidden">
            {/* Hero Section */}
            <section className="relative py-32 overflow-hidden">
                <div className="absolute inset-0 w-full h-full pointer-events-none">
                    <div className="absolute top-0 left-1/4 w-1/2 h-1/2 bg-primary/5 blur-[120px] rounded-full" />
                    <div className="absolute bottom-0 right-1/4 w-1/2 h-1/2 bg-secondary/10 blur-[120px] rounded-full" />
                </div>

                <div className="container px-4 text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="max-w-4xl mx-auto space-y-8"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-secondary text-sm font-medium text-muted-foreground mb-4">
                            <Sparkles className="w-4 h-4 text-primary" />
                            <span>{t('badge')}</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tight text-foreground leading-tight">
                            {t('title')}
                        </h1>
                        <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                            {t('description')}
                        </p>
                    </motion.div>
                </div>
            </section >

            {/* Mission & Vision */}
            < section className="py-20 relative" >
                <div className="container px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Target,
                                title: t('vision_title'),
                                desc: t('vision_desc'),
                                delay: 0
                            },
                            {
                                icon: Users,
                                title: t('community_title'),
                                desc: t('community_desc'),
                                delay: 0.1
                            },
                            {
                                icon: Trophy,
                                title: t('quality_title'),
                                desc: t('quality_desc'),
                                delay: 0.2
                            }
                        ].map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: item.delay }}
                                className="group relative bg-card/50 backdrop-blur-sm border border-border/50 rounded-[2rem] p-8 text-center space-y-6 hover:bg-card hover:border-primary/20 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/5"
                            >
                                <div className="w-20 h-20 bg-secondary/50 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 group-hover:bg-primary/10 transition-all duration-500">
                                    <item.icon className="w-10 h-10 text-foreground group-hover:text-primary transition-colors" />
                                </div>
                                <h3 className="text-2xl font-bold">{item.title}</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    {item.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section >

            {/* Stats Section */}
            < section className="py-24 relative overflow-hidden" >
                <div className="absolute inset-0 bg-primary/5 skew-y-3 transform origin-bottom-right" />
                <div className="container px-4 relative">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                        {[
                            { number: "500+", label: t('stats_products'), icon: Zap },
                            { number: "10k+", label: t('stats_clients'), icon: Heart },
                            { number: "24/7", label: t('stats_support'), icon: Users },
                        ].map((stat, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.5 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="space-y-4"
                            >
                                <div className="text-5xl md:text-6xl font-black text-foreground tracking-tighter">
                                    {stat.number}
                                </div>
                                <div className="text-lg text-muted-foreground font-medium flex items-center justify-center gap-2">
                                    <stat.icon className="w-4 h-4" />
                                    {stat.label}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section >

            {/* Refund & Exchange Policy */}
            < section className="py-20 relative" >
                <div className="container px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="max-w-5xl mx-auto"
                    >
                        <div className="text-center mb-12">
                            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">سياسة الاسترجاع والاستبدال</h2>
                            <p className="text-muted-foreground text-lg">Return & Exchange Policy</p>
                        </div>

                        <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-[2rem] p-8 md:p-12">
                            <div className="grid md:grid-cols-2 gap-8">
                                {/* Arabic Section */}
                                <div className="space-y-4 text-right">
                                    <h3 className="font-bold text-xl mb-4 flex items-center justify-end gap-2">
                                        <span>سياسة الاسترجاع والاستبدال</span>
                                        <CheckCircle2 className="w-6 h-6 text-primary" />
                                    </h3>
                                    <p className="text-muted-foreground leading-relaxed">
                                        يمنح قانون حماية المستهلك الحق في استبدال أو استرجاع المنتج وذلك حسب السعر المدفوع أو وجود عيوب بالمنتج خلال 15 يوماً.
                                    </p>
                                    <ul className="list-disc mr-6 space-y-2 text-muted-foreground">
                                        <li>يمكنك استبدال أو استرجاع السلعة خلال 15 يوماً من شرائها.</li>
                                        <li>لا تنطبق هذه السياسة على المنتجات التي يجب فتحها لاستخدامها أو إذا كان غرض الشراء خاص.</li>
                                        <li>يمكن استبدال أو استرجاع السلعة فقط إذا كانت في مواصفاتها الأصلية غير مفتوحة أو بها عيب أو إذا كانت ليست كما جاء في مواصفات المنتج أو الخدمة.</li>
                                        <li>يجب تقديم الفاتورة أو ما يثبت الشراء عند طلب الاسترجاع.</li>
                                    </ul>
                                </div>

                                {/* English Section */}
                                <div className="space-y-4 text-left" dir="ltr">
                                    <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
                                        <CheckCircle2 className="w-6 h-6 text-primary" />
                                        <span>Return & Exchange Policy</span>
                                    </h3>
                                    <p className="text-muted-foreground leading-relaxed">
                                        Consumer Protection Law grants you the right to exchange or return and redeem the price of an item within 15 days of receipt.
                                    </p>
                                    <ul className="list-disc ml-6 space-y-2 text-muted-foreground">
                                        <li>You may exchange or return and redeem the price of an item within 15 days of receipt.</li>
                                        <li>This policy does not apply to the products that should be opened for use or if the purpose is for personal use only.</li>
                                        <li>An item may be exchanged or returned only if it's in its original standard specifications or not as described or if it has any defect for its purpose of use.</li>
                                        <li>A valid receipt must be provided.</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Consumer Protection Authority Contact */}
                            <div className="mt-8 pt-6 border-t border-border/40 text-center">
                                <p className="font-semibold mb-2 text-foreground">هيئة حماية المستهلك | Consumer Protection Authority</p>
                                <div className="flex items-center justify-center gap-4 flex-wrap text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <span>☎️</span>
                                        <span>80079009 / 80077997</span>
                                    </span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1">
                                        <span>🌐</span>
                                        <span>www.pacp.gov.om</span>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section >

            {/* CTA */}
            < section className="py-32 text-center relative overflow-hidden" >
                <div className="absolute inset-0 w-full h-full">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 blur-[100px] rounded-full animate-pulse" />
                </div>
                <div className="container px-4 space-y-8 relative z-10">
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight">{t('cta_title')}</h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto text-xl">
                        {t('cta_desc')}
                    </p>
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Button size="lg" className="h-16 px-10 rounded-full text-xl shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all" asChild>
                            <Link href="/products">
                                {t('cta_button')} <ArrowLeft className="mr-2 h-6 w-6" />
                            </Link>
                        </Button>
                    </motion.div>
                </div>
            </section >
        </div >
    );
}
