import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const jwtSecret = new TextEncoder().encode(
    process.env.JWT_SECRET || 'fallback_secret_change_me'
);

export async function middleware(request: NextRequest) {
    const response = NextResponse.next();
    const path = request.nextUrl.pathname;
    const fullPath = request.nextUrl.href;
    
    // Log for debugging
    const token = request.cookies.get('token')?.value;
    
    console.log('=== MIDDLEWARE DEBUG ===');
    console.log('Full URL:', fullPath);
    console.log('Path:', path);
    console.log('Has token:', !!token);
    
    // Admin routes protection - require admin role
    if (path.startsWith('/admin') || path === '/admin') {
        console.log('Admin route detected');
        
        if (!token) {
            console.log('No token - redirecting to /login');
            return NextResponse.redirect(new URL('/login', request.url));
        }
        
        try {
            const { payload } = await jwtVerify(token, jwtSecret);
            const role = payload.role as string;
            console.log('Token valid, role:', role);
            
            if (role !== 'admin') {
                console.log('Not admin role - redirecting to /');
                return NextResponse.redirect(new URL('/', request.url));
            }
            console.log('Admin access granted');
        } catch (e: any) {
            console.log('Token verification failed:', e.message);
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

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

    // Agent/Staff routes protection - require sale, staff, or admin role
    if (path.startsWith('/agent') || path.startsWith('/staff')) {
        if (!token) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
        try {
            const { payload } = await jwtVerify(token, jwtSecret);
            const role = payload.role as string;
            const allowedRoles = ['sale', 'staff', 'admin'];
            if (!allowedRoles.includes(role)) {
                return NextResponse.redirect(new URL('/', request.url));
            }
        } catch (e) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    return response;
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
