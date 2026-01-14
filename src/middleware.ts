import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const response = NextResponse.next();

    // Check for referral code in URL
    const { searchParams } = new URL(request.url);
    const refCode = searchParams.get('ref');

    if (refCode) {
        // Set referral cookie (valid for 30 days)
        response.cookies.set('gonuts_ref', refCode, {
            maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
        });
    }

    // Role-based protection for routes
    const path = request.nextUrl.pathname;
    const token = request.cookies.get('token')?.value;

    // Admin routes protection
    if (path.startsWith('/admin')) {
        if (!token) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    // Agent routes protection
    if (path.startsWith('/agent')) {
        if (!token) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    return response;
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
