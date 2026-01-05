"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";

export function HowItWorks() {
    const t = useTranslations('HowItWorks');

    const steps = [
        {
            number: "01",
            title: t('step1_title'),
            description: t('step1_desc')
        },
        {
            number: "02",
            title: t('step2_title'),
            description: t('step2_desc')
        },
        {
            number: "03",
            title: t('step3_title'),
            description: t('step3_desc')
        }
    ];

    return (
        <section className="py-24 relative overflow-hidden">
            <div className="container px-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    {/* Left Side - Card (Visual) */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="relative order-2 lg:order-2"
                    >
                        <div className="relative aspect-square max-w-xl mx-auto">
                            {/* Gradient Glow */}
                            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-[2.5rem] blur opacity-30 animate-pulse" />

                            {/* Card Content */}
                            <div className="relative h-full bg-card border border-border/50 rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />

                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="relative z-10"
                                >
                                    <Button size="lg" className="h-20 w-20 rounded-full bg-primary/20 text-primary hover:bg-primary hover:text-primary-foreground transition-all mb-6 flex items-center justify-center">
                                        <ArrowLeft className="w-8 h-8" />
                                    </Button>
                                </motion.div>

                                <h3 className="text-3xl font-bold mb-2 relative z-10">{t('card_title')}</h3>
                                <p className="text-muted-foreground relative z-10">{t('card_desc')}</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Side - Steps (Content) */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="space-y-12 order-1 lg:order-1"
                    >
                        <div className="space-y-4">
                            <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                                {t('main_title')}
                            </h2>
                            <p className="text-muted-foreground text-lg max-w-md">
                                {t('main_desc')}
                            </p>
                        </div>

                        <div className="space-y-8">
                            {steps.map((step, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.2 }}
                                    className="flex items-start gap-6 group"
                                >
                                    <span className="text-4xl font-black text-muted-foreground/20 group-hover:text-primary/20 transition-colors">
                                        {step.number}
                                    </span>
                                    <div className="space-y-1">
                                        <h3 className="text-xl font-bold group-hover:text-primary transition-colors">
                                            {step.title}
                                        </h3>
                                        <p className="text-muted-foreground">
                                            {step.description}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
