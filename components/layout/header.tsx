"use client";

import { Link, usePathname, useRouter } from "@/i18n/routing";
import { ShoppingCart, Menu, X, Globe, User, LogOut, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";
import { useTranslations, useLocale } from "next-intl";
import { useSession, signOut } from "next-auth/react";
import { CurrencySelector } from "@/components/features/currency-selector";

export function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [cartCount, setCartCount] = useState(0);
    const { data: session, status } = useSession();
    const t = useTranslations('Navbar');
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        const updateCartCount = () => {
            const cart = JSON.parse(localStorage.getItem('cart') || '[]');
            setCartCount(cart.length);
        };
        updateCartCount();
        window.addEventListener('storage', updateCartCount);
        window.addEventListener('cartUpdated', updateCartCount);
        return () => {
            window.removeEventListener('storage', updateCartCount);
            window.removeEventListener('cartUpdated', updateCartCount);
        };
    }, []);

    const handleLogout = async () => {
        await signOut({ redirect: false });
        router.push('/');
        router.refresh();
    };

    const navItems = [
        { name: t('home'), href: "/" },
        { name: t('products'), href: "/products" },
        { name: t('about'), href: "/about" },
        { name: t('contact'), href: "/contact" },
    ];

    const toggleLanguage = () => {
        const nextLocale = locale === 'ar' ? 'en' : 'ar';
        router.replace(pathname, { locale: nextLocale });
    };

    return (
        <header
            className={cn(
                "fixed top-0 z-[100] w-full transition-all duration-300",
                scrolled
                    ? "bg-background/90 backdrop-blur-md border-b border-border/40 py-1.5"
                    : "bg-transparent py-3"
            )}
        >
            <div className="container flex items-center justify-between gap-2 px-3 sm:px-4">

                {/* ── Logo ── */}
                <Link href="/" className="flex items-center gap-2 group shrink-0">
                    <div className="relative w-9 h-9 sm:w-10 sm:h-10 overflow-hidden rounded-lg group-hover:scale-105 transition-transform">
                        <img src="/logo.jpeg" alt="Logo" className="object-cover w-full h-full" />
                    </div>
                    {/* Hide brand text on very small screens to save space */}
                    <span className="hidden sm:block text-base sm:text-lg font-bold tracking-tight text-primary">
                        ريان <span className="text-foreground">للتصميم</span>
                    </span>
                </Link>

                {/* ── Desktop nav links (hidden on mobile) ── */}
                <nav className="hidden md:flex items-center gap-6 lg:gap-8 mx-auto">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="text-sm font-medium transition-colors hover:text-primary relative group"
                        >
                            {item.name}
                            <span className="absolute -bottom-1 right-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
                        </Link>
                    ))}
                </nav>

                {/* ── Right side — always visible ── */}
                <div className="flex items-center gap-0.5 sm:gap-1">

                    {/* Currency — always visible, compact on mobile */}
                    <CurrencySelector />

                    {/* Language toggle — icon only on mobile, icon+text on lg */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleLanguage}
                        aria-label="Switch Language"
                        className="shrink-0 w-8 h-8 sm:w-9 sm:h-9"
                    >
                        <Globe className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>

                    {/* Theme toggle — always visible */}
                    <ThemeToggle />

                    {/* Cart — always visible */}
                    <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Cart"
                        className="relative shrink-0 w-8 h-8 sm:w-9 sm:h-9"
                        asChild
                    >
                        <Link href="/cart">
                            <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
                            {cartCount > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                                    {cartCount}
                                </span>
                            )}
                        </Link>
                    </Button>

                    {status === 'authenticated' && session?.user ? (
                        <>
                            {/* My Orders — always visible */}
                            <Button
                                variant="ghost"
                                size="icon"
                                aria-label="My Orders"
                                className="shrink-0 w-8 h-8 sm:w-9 sm:h-9"
                                asChild
                            >
                                <Link href="/my-orders">
                                    <Package className="h-4 w-4 sm:h-5 sm:w-5" />
                                </Link>
                            </Button>

                            {/* User chip — only on md+ */}
                            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-secondary/50">
                                <User className="h-3.5 w-3.5" />
                                <span className="text-xs font-medium max-w-[100px] truncate">
                                    {session.user.name || session.user.email}
                                </span>
                            </div>

                            {/* Logout — icon on mobile, icon+text on md+ */}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="shrink-0 w-8 h-8 sm:w-9 sm:h-9 md:hidden text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={handleLogout}
                                aria-label="Logout"
                            >
                                <LogOut className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="hidden md:flex gap-1.5"
                                onClick={handleLogout}
                            >
                                <LogOut className="h-4 w-4" />
                                تسجيل الخروج
                            </Button>
                        </>
                    ) : (
                        /* Login — always visible, compact on mobile */
                        <Button
                            variant="default"
                            size="sm"
                            className="font-bold text-xs sm:text-sm px-2.5 sm:px-3 h-8 sm:h-9 shrink-0"
                            asChild
                        >
                            <Link href="/auth">{t('login')}</Link>
                        </Button>
                    )}

                    {/* Hamburger — mobile only, for nav links */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden shrink-0 w-8 h-8 sm:w-9 sm:h-9"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label="Toggle Navigation"
                    >
                        {isMenuOpen ? <X className="h-4 w-4 sm:h-5 sm:w-5" /> : <Menu className="h-4 w-4 sm:h-5 sm:w-5" />}
                    </Button>
                </div>
            </div>

            {/* ── Mobile nav drawer (nav links only) ── */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="md:hidden border-t border-border/40 bg-background/98 backdrop-blur-md overflow-hidden"
                    >
                        <div className="container flex flex-col px-4 py-2">
                            {/* User greeting on mobile (if logged in) */}
                            {status === 'authenticated' && session?.user && (
                                <div className="flex items-center gap-2 px-3 py-2.5 mb-1 rounded-xl bg-secondary/40">
                                    <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
                                        <User className="h-3.5 w-3.5 text-primary" />
                                    </div>
                                    <span className="text-sm font-medium truncate">
                                        {session.user.name || session.user.email}
                                    </span>
                                </div>
                            )}

                            {/* Nav links */}
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="flex items-center text-base font-medium px-3 py-3 hover:bg-secondary/60 rounded-xl transition-colors"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
