"use client";

import { Button } from "@/components/ui/button";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Link } from "@/i18n/routing";
import { ArrowLeft, Gamepad2, Rocket, Puzzle, Presentation, Sparkles } from "lucide-react";
import { useRef } from "react";
import { useTranslations } from "next-intl";

export function Hero() {
    const ref = useRef<HTMLDivElement>(null);
    const t = useTranslations('Hero');

    // Mouse movement for parallax
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    // Smooth spring animation for mouse movement
    const mouseX = useSpring(x, { stiffness: 150, damping: 15 });
    const mouseY = useSpring(y, { stiffness: 150, damping: 15 });

    function handleMouseMove({ clientX, clientY, currentTarget }: React.MouseEvent) {
        const { left, top, width, height } = currentTarget.getBoundingClientRect();
        // Calculate normalized position (-1 to 1)
        const xPos = (clientX - left - width / 2) / (width / 2);
        const yPos = (clientY - top - height / 2) / (height / 2);

        x.set(xPos);
        y.set(yPos);
    }

    return (
        <section
            ref={ref}
            onMouseMove={handleMouseMove}
            className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background perspective-1000"
        >
            {/* Background Gradients (Bright & Warm) */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-secondary/30 rounded-full blur-[120px]" />
                <div className="absolute top-[40%] left-[30%] w-[40%] h-[40%] bg-accent/20 rounded-full blur-[100px]" />

                {/* Sparkles (Darker for visibility) */}
                <Sparkle x={mouseX} y={mouseY} depth={10} className="top-[20%] left-[20%]" delay={0} />
                <Sparkle x={mouseX} y={mouseY} depth={-10} className="top-[30%] right-[25%]" delay={1} />
                <Sparkle x={mouseX} y={mouseY} depth={15} className="bottom-[25%] left-[15%]" delay={2} />
                <Sparkle x={mouseX} y={mouseY} depth={-5} className="bottom-[40%] right-[10%]" delay={0.5} />
            </div>

            {/* Floating Game Assets (Gold/Glass Style) */}
            <div className="absolute inset-0 z-[1] pointer-events-none">
                {/* Game Controller */}
                <FloatingElement x={mouseX} y={mouseY} depth={30} className="top-[15%] left-[10%] md:left-[15%]">
                    <GlassIcon icon={<Gamepad2 className="w-12 h-12 text-primary" />} label={t('games')} />
                </FloatingElement>

                {/* Rocket Ship */}
                <FloatingElement x={mouseX} y={mouseY} depth={-20} className="top-[20%] right-[10%] md:right-[15%]">
                    <GlassIcon icon={<Rocket className="w-10 h-10 text-primary" />} label={t('adventures')} />
                </FloatingElement>

                {/* Puzzle Piece */}
                <FloatingElement x={mouseX} y={mouseY} depth={25} className="bottom-[20%] left-[5%] md:left-[12%]">
                    <GlassIcon icon={<Puzzle className="w-10 h-10 text-primary" />} label={t('puzzle')} />
                </FloatingElement>

                {/* Presentation/Slideshow */}
                <FloatingElement x={mouseX} y={mouseY} depth={-25} className="bottom-[25%] right-[5%] md:right-[12%]">
                    <GlassIcon icon={<Presentation className="w-10 h-10 text-primary" />} label={t('presentations')} />
                </FloatingElement>
            </div>

            {/* Main Content */}
            <div className="container px-4 relative z-[10] text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1 }}
                    className="relative inline-block mb-8"
                >
                    <div className="relative z-20 select-none">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.5 }}
                            className="relative w-[200px] md:w-[300px] aspect-square mx-auto"
                        >
                            <img
                                src="/logo.jpeg"
                                alt="Rayan Design Logo"
                                className="w-full h-full object-contain drop-shadow-2xl rounded-3xl"
                            />
                        </motion.div>
                    </div>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="text-4xl md:text-6xl font-bold mb-6"
                >
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-foreground/80">
                        {t('title')}
                    </span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-10 font-light tracking-wide"
                >
                    {t('description')}
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.7 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-6"
                >
                    <Button size="lg" className="h-14 px-8 rounded-full text-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 shadow-[0_0_20px_-5px_var(--primary)]" asChild>
                        <Link href="/products" className="flex items-center gap-2">
                            {t('cta_products')} <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <Button size="lg" variant="outline" className="h-14 px-8 rounded-full text-lg border-border hover:bg-secondary/50 text-foreground transition-all duration-300" asChild>
                        <Link href="/about">
                            {t('cta_about')}
                        </Link>
                    </Button>
                </motion.div>
            </div>
        </section>
    );
}

// --- Helper Components ---

function FloatingElement({ children, x, y, depth, className }: { children: React.ReactNode, x: any, y: any, depth: number, className?: string }) {
    const xMove = useTransform(x, [-1, 1], [-depth, depth]);
    const yMove = useTransform(y, [-1, 1], [-depth, depth]);

    return (
        <motion.div
            style={{ x: xMove, y: yMove }}
            className={`absolute ${className}`}
            initial={{ opacity: 0 }}
            animate={{
                opacity: 1,
                y: [0, -15, 0],
            }}
            transition={{
                opacity: { duration: 1 },
                y: {
                    duration: 4 + Math.random() * 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: Math.random() * 2
                }
            }}
        >
            {children}
        </motion.div>
    );
}

function GlassIcon({ icon, label }: { icon: React.ReactNode, label: string }) {
    return (
        <div className="flex flex-col items-center gap-3 group cursor-pointer">
            <div className="w-20 h-20 rounded-[2rem] bg-background/40 backdrop-blur-md border border-primary/20 shadow-[0_10px_30px_-10px_rgba(212,175,55,0.15)] flex items-center justify-center group-hover:scale-110 group-hover:border-primary/50 group-hover:shadow-[0_15px_40px_-5px_rgba(212,175,55,0.3)] transition-all duration-300">
                {icon}
            </div>
            <span className="text-sm font-medium text-foreground/80 bg-background/60 px-3 py-1 rounded-full backdrop-blur-sm border border-primary/10 shadow-sm">
                {label}
            </span>
        </div>
    );
}

function Sparkle({ x, y, depth, className, delay }: { x: any, y: any, depth: number, className?: string, delay: number }) {
    const xMove = useTransform(x, [-1, 1], [-depth, depth]);
    const yMove = useTransform(y, [-1, 1], [-depth, depth]);

    return (
        <motion.div
            style={{ x: xMove, y: yMove }}
            className={`absolute ${className}`}
            animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
                rotate: [0, 180],
            }}
            transition={{
                duration: 3,
                repeat: Infinity,
                delay: delay,
                ease: "easeInOut"
            }}
        >
            <Sparkles className="w-6 h-6 text-primary/60" />
        </motion.div>
    );
}
