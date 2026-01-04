import Link from "next/link";

export function Footer() {
    return (
        <footer className="border-t border-border/40 bg-background py-6 md:py-0">
            <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row px-4">
                <p className="text-center text-sm leading-loose text-muted-foreground md:text-right">
                    جميع الحقوق محفوظة &copy; {new Date().getFullYear()} ريان للتصميم.
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <Link href="/terms" className="hover:text-primary">
                        الشروط والأحكام
                    </Link>
                    <Link href="/privacy" className="hover:text-primary">
                        سياسة الخصوصية
                    </Link>
                </div>
            </div>
        </footer>
    );
}
