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
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Update cart count
    useEffect(() => {
        const updateCartCount = () => {
            const cart = JSON.parse(localStorage.getItem('cart') || '[]');
            setCartCount(cart.length);
        };

        updateCartCount();

        // Listen for storage changes
        window.addEventListener('storage', updateCartCount);
        // Listen for custom cart update event
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
                    ? "bg-background/80 backdrop-blur-md border-b border-border/40 py-2"
                    : "bg-transparent py-4"
            )}
        >
            <div className="container flex items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="relative w-12 h-12 overflow-hidden rounded-lg group-hover:scale-105 transition-transform">
                            <img src="/logo.jpeg" alt="Logo" className="object-cover w-full h-full" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-primary">ريان <span className="text-foreground">للتصميم</span></span>
                    </Link>
                </div>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-8">
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

                <div className="flex items-center gap-2">
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
                            <span className="sr-only">{t('cart')}</span>
                        </Link>
                    </Button>

                    {status === 'authenticated' && session?.user ? (
                        <>
                            <Button variant="ghost" size="icon" aria-label="My Orders" asChild>
                                <Link href="/my-orders" className="relative">
                                    <Package className="h-5 w-5" />
                                    <span className="sr-only">طلباتي</span>
                                </Link>
                            </Button>
                            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/50">
                                <User className="h-4 w-4" />
                                <span className="text-sm font-medium">{session.user.name || session.user.email}</span>
                            </div>
                            <Button variant="ghost" size="sm" className="hidden md:flex gap-2" onClick={handleLogout}>
                                <LogOut className="h-4 w-4" />
                                تسجيل الخروج
                            </Button>
                        </>
                    ) : (
                        <Button variant="default" size="sm" className="hidden md:flex font-bold" asChild>
                            <Link href="/login">
                                {t('login')}
                            </Link>
                        </Button>
                    )}

                    {/* Mobile Menu Toggle */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </Button>
                </div>
            </div>

            {/* Mobile Nav */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur-md overflow-hidden"
                    >
                        <div className="container flex flex-col gap-2 p-4">
                            {/* User Info (Mobile) */}
                            {status === 'authenticated' && session?.user && (
                                <div className="flex items-center gap-2 px-4 py-3 mb-2 rounded-lg bg-secondary/50">
                                    <User className="h-5 w-5" />
                                    <span className="text-sm font-medium">{session.user.name || session.user.email}</span>
                                </div>
                            )}

                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="text-lg font-medium p-4 hover:bg-secondary rounded-lg transition-colors"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    {item.name}
                                </Link>
                            ))}

                            {/* Auth Buttons (Mobile) */}
                            {status === 'authenticated' && session?.user ? (
                                <Button
                                    variant="ghost"
                                    className="w-full justify-start text-lg font-medium p-4 h-auto"
                                    onClick={() => {
                                        handleLogout();
                                        setIsMenuOpen(false);
                                    }}
                                >
                                    <LogOut className="h-5 w-5 ml-2" />
                                    تسجيل الخروج
                                </Button>
                            ) : (
                                <Button
                                    variant="default"
                                    className="w-full mt-2 font-bold"
                                    asChild
                                >
                                    <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                                        {t('login')}
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
