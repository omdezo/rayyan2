import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const intlMiddleware = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
    // Get the pathname
    const pathname = request.nextUrl.pathname;

    // Check if it's a dashboard route
    const isDashboardRoute = pathname.includes('/dashboard');

    if (isDashboardRoute) {
        console.log('🔐 [Middleware] Dashboard route accessed:', pathname);
        console.log('🍪 [Middleware] Cookies:', request.cookies.getAll().map(c => c.name));

        // Get the token using next-auth/jwt which works in Edge runtime
        const token = await getToken({
            req: request,
            secret: process.env.NEXTAUTH_SECRET,
            secureCookie: process.env.NODE_ENV === 'production',
        });

        console.log('🎫 [Middleware] Token:', token ? 'EXISTS' : 'NULL');
        if (token) {
            console.log('🎫 [Middleware] Token details:', JSON.stringify(token));
        }
        console.log('👑 [Middleware] Role:', token?.role);

        // If no token, redirect to login
        if (!token) {
            console.log('❌ [Middleware] No token - redirecting to login');
            const locale = pathname.split('/')[1] || 'ar';
            const loginUrl = new URL(`/${locale}/login`, request.url);
            loginUrl.searchParams.set('callbackUrl', pathname);
            return NextResponse.redirect(loginUrl);
        }

        // Check if user is admin
        const userRole = token?.role;
        if (userRole !== 'admin') {
            console.log('❌ [Middleware] Not admin - redirecting to home');
            // Non-admin trying to access dashboard - redirect to home
            const locale = pathname.split('/')[1] || 'ar';
            return NextResponse.redirect(new URL(`/${locale}`, request.url));
        }

        console.log('✅ [Middleware] Admin access granted');
    }

    // Continue with i18n middleware
    return intlMiddleware(request);
}

export const config = {
    // Match only internationalized pathnames
    matcher: ['/', '/(ar|en)/:path*']
};
