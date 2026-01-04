"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Users, Trophy, Target, Sparkles, Zap, Heart } from "lucide-react";

export default function AboutPage() {
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
                            <span>نبتكر للمستقبل</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tight text-foreground leading-tight">
                            نصنع <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/50">التميز</span> الرقمي
                        </h1>
                        <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                            نحن منصة رائدة متخصصة في توفير المحتوى الرقمي التعليمي والترفيهي المبتكر. نسعى لتمكين الأفراد والمؤسسات في دول الخليج بأدوات إبداعية تعزز التعلم والإنتاجية.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Mission & Vision */}
            <section className="py-20 relative">
                <div className="container px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Target,
                                title: "رؤيتنا",
                                desc: "أن نكون المصدر الأول للمحتوى الرقمي العربي عالي الجودة، ونساهم في إثراء المحتوى التعليمي في المنطقة.",
                                delay: 0
                            },
                            {
                                icon: Users,
                                title: "مجتمعنا",
                                desc: "نخدم المعلمين، الطلاب، وأولياء الأمور في جميع دول الخليج، ونوفر لهم أدوات تناسب بيئتهم وثقافتهم.",
                                delay: 0.1
                            },
                            {
                                icon: Trophy,
                                title: "جودتنا",
                                desc: "نلتزم بأعلى معايير التصميم والمحتوى، لضمان تجربة مستخدم استثنائية ومنتجات ذات قيمة حقيقية.",
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
            </section>

            {/* Stats Section */}
            <section className="py-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-primary/5 skew-y-3 transform origin-bottom-right" />
                <div className="container px-4 relative">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
                        {[
                            { number: "500+", label: "منتج رقمي", icon: Zap },
                            { number: "10k+", label: "عميل سعيد", icon: Heart },
                            { number: "6", label: "دول نخدمها", icon: Target },
                            { number: "24/7", label: "دعم فني", icon: Users },
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
            </section>

            {/* CTA */}
            <section className="py-32 text-center relative overflow-hidden">
                <div className="absolute inset-0 w-full h-full">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 blur-[100px] rounded-full animate-pulse" />
                </div>
                <div className="container px-4 space-y-8 relative z-10">
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight">جاهز لاستكشاف منتجاتنا؟</h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto text-xl">
                        تصفح مكتبتنا المتنوعة وابدأ رحلة التعلم والإبداع اليوم.
                    </p>
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Button size="lg" className="h-16 px-10 rounded-full text-xl shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all" asChild>
                            <Link href="/products">
                                تصفح المتجر <ArrowLeft className="mr-2 h-6 w-6" />
                            </Link>
                        </Button>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}
