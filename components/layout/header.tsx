"use client";

import { Link, usePathname, useRouter } from "@/i18n/routing";
import { ShoppingCart, Menu, X, Globe, User, LogOut, Package, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTranslations, useLocale } from "next-intl";
import { useSession, signOut } from "next-auth/react";
import { CurrencySelector } from "@/components/features/currency-selector";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useTheme } from "next-themes";

export function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [cartCount, setCartCount] = useState(0);
    const { data: session, status } = useSession();
    const t = useTranslations('Navbar');
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const { theme, setTheme } = useTheme();

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

    const closeMenu = () => setIsMenuOpen(false);

    return (
        <header
            className={cn(
                "fixed top-0 z-[100] w-full transition-all duration-300",
                scrolled
                    ? "bg-background/90 backdrop-blur-md border-b border-border/40 py-2"
                    : "bg-transparent py-3"
            )}
        >
            <div className="container flex items-center justify-between px-4">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group shrink-0">
                    <div className="relative w-10 h-10 overflow-hidden rounded-lg group-hover:scale-105 transition-transform">
                        <img src="/logo.jpeg" alt="Logo" className="object-cover w-full h-full" />
                    </div>
                    <span className="text-lg font-bold tracking-tight text-primary">
                        ريان <span className="text-foreground">للتصميم</span>
                    </span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-6 lg:gap-8">
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

                {/* Desktop Right Actions */}
                <div className="hidden md:flex items-center gap-1.5">
                    <CurrencySelector variant="full" />
                    <Button variant="ghost" size="icon" onClick={toggleLanguage} aria-label="Switch Language">
                        <Globe className="h-5 w-5" />
                    </Button>
                    <ThemeToggle />
                    <Button variant="ghost" size="icon" aria-label="Cart" className="relative" asChild>
                        <Link href="/cart">
                            <ShoppingCart className="h-5 w-5" />
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                    {cartCount}
                                </span>
                            )}
                        </Link>
                    </Button>

                    {status === 'authenticated' && session?.user ? (
                        <>
                            <Button variant="ghost" size="icon" aria-label="My Orders" asChild>
                                <Link href="/my-orders">
                                    <Package className="h-5 w-5" />
                                </Link>
                            </Button>
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/50">
                                <User className="h-4 w-4" />
                                <span className="text-sm font-medium max-w-[120px] truncate">
                                    {session.user.name || session.user.email}
                                </span>
                            </div>
                            <Button variant="ghost" size="sm" className="gap-1.5" onClick={handleLogout}>
                                <LogOut className="h-4 w-4" />
                                تسجيل الخروج
                            </Button>
                        </>
                    ) : (
                        <Button variant="default" size="sm" className="font-bold" asChild>
                            <Link href="/auth">{t('login')}</Link>
                        </Button>
                    )}
                </div>

                {/* Mobile Right Actions — only Cart + Menu toggle */}
                <div className="flex md:hidden items-center gap-1">
                    <Button variant="ghost" size="icon" aria-label="Cart" className="relative" asChild>
                        <Link href="/cart">
                            <ShoppingCart className="h-5 w-5" />
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
                                    {cartCount}
                                </span>
                            )}
                        </Link>
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label="Toggle Menu"
                    >
                        {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </Button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="md:hidden border-t border-border/40 bg-background/98 backdrop-blur-md overflow-hidden"
                    >
                        <div className="container flex flex-col gap-1 px-4 py-3">

                            {/* User info */}
                            {status === 'authenticated' && session?.user && (
                                <div className="flex items-center gap-2 px-3 py-2.5 mb-1 rounded-xl bg-secondary/50">
                                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                                        <User className="h-4 w-4 text-primary" />
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
                                    onClick={closeMenu}
                                >
                                    {item.name}
                                </Link>
                            ))}

                            {/* My orders (authenticated) */}
                            {status === 'authenticated' && session?.user && (
                                <Link
                                    href="/my-orders"
                                    className="flex items-center gap-2 text-base font-medium px-3 py-3 hover:bg-secondary/60 rounded-xl transition-colors"
                                    onClick={closeMenu}
                                >
                                    <Package className="h-5 w-5" />
                                    طلباتي
                                </Link>
                            )}

                            {/* Divider */}
                            <div className="my-1 border-t border-border/30" />

                            {/* Currency selector */}
                            <div className="flex items-center justify-between px-3 py-2">
                                <span className="text-sm text-muted-foreground">
                                    {locale === 'ar' ? 'العملة' : 'Currency'}
                                </span>
                                <CurrencySelector variant="compact" />
                            </div>

                            {/* Language + Theme row */}
                            <div className="flex items-center gap-2 px-3 py-1">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 gap-2"
                                    onClick={() => { toggleLanguage(); closeMenu(); }}
                                >
                                    <Globe className="h-4 w-4" />
                                    {locale === 'ar' ? 'English' : 'العربية'}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 gap-2"
                                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                >
                                    <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                                    <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                                    {theme === 'dark'
                                        ? (locale === 'ar' ? 'فاتح' : 'Light')
                                        : (locale === 'ar' ? 'داكن' : 'Dark')}
                                </Button>
                            </div>

                            {/* Auth */}
                            <div className="mt-1">
                                {status === 'authenticated' && session?.user ? (
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start gap-2 text-base font-medium px-3 py-3 h-auto text-destructive hover:text-destructive hover:bg-destructive/10"
                                        onClick={() => { handleLogout(); closeMenu(); }}
                                    >
                                        <LogOut className="h-5 w-5" />
                                        تسجيل الخروج
                                    </Button>
                                ) : (
                                    <Button
                                        variant="default"
                                        className="w-full font-bold text-base h-11 mt-1"
                                        asChild
                                    >
                                        <Link href="/auth" onClick={closeMenu}>
                                            {t('login')}
                                        </Link>
                                    </Button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
