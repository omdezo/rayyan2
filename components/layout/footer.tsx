import Link from "next/link";
import { Phone, MapPin, Instagram } from "lucide-react";

export function Footer() {
    return (
        <footer className="border-t border-white/10 bg-[#0a0a0a] text-white pt-16 pb-8">
            <div className="container px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
                    {/* Brand & Description (Right) */}
                    <div className="space-y-6">
                        <h3 className="text-2xl font-bold text-primary">ريان للتصميم</h3>
                        <p className="text-gray-400 leading-relaxed max-w-md">
                            نبتكر حلولًا رقمية متكاملة تجمع بين الإبداع والدقة، ونقدّم محتوى وتصاميم احترافية تُبنى على فهم عميق للتجربة والقيمة، لنصنع حضورًا رقميًا مؤثرًا ومستدامًا
                        </p>
                    </div>

                    {/* Quick Links (Center) */}
                    <div className="space-y-6 md:text-center">
                        <h3 className="text-xl font-bold">روابط سريعة</h3>
                        <ul className="space-y-4 text-gray-400">
                            <li>
                                <Link href="/" className="hover:text-primary transition-colors">
                                    الرئيسية
                                </Link>
                            </li>
                            <li>
                                <Link href="/products" className="hover:text-primary transition-colors">
                                    المنتجات
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="hover:text-primary transition-colors">
                                    اتصل بنا
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info (Left) */}
                    <div className="space-y-6 md:text-left">
                        <h3 className="text-xl font-bold">تواصل معنا</h3>
                        <ul className="space-y-4 text-gray-400">
                            <li>
                                <a href="tel:+96895534007" className="flex items-center gap-3 hover:text-primary transition-colors justify-start md:justify-end md:flex-row-reverse">
                                    <span dir="ltr">+968 9553 4007</span>
                                    <Phone className="w-5 h-5" />
                                </a>
                            </li>
                            <li className="flex items-center gap-3 justify-start md:justify-end md:flex-row-reverse">
                                <span>صحار، سلطنة عمان</span>
                                <MapPin className="w-5 h-5" />
                            </li>
                        </ul>
                        <div className="flex items-center gap-4 justify-start md:justify-end">
                            <a href="https://instagram.com/Rayian_design" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary hover:text-white transition-all">
                                <Instagram className="w-5 h-5" />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-400">
                    <p className="text-center md:text-right">
                        جميع الحقوق محفوظة &copy; {new Date().getFullYear()} ريان للتصميم.
                    </p>
                    <div className="flex items-center gap-6">
                        <Link href="/terms" className="hover:text-primary transition-colors">
                            الشروط والأحكام
                        </Link>
                        <Link href="/privacy" className="hover:text-primary transition-colors">
                            سياسة الخصوصية
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
