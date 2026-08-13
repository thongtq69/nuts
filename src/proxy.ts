import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { normalizeReferralCode } from '@/lib/referral-attribution';
import {
    LOCALE_COOKIE,
    LOCALE_HEADER,
    Locale,
    localizePath,
    normalizeLocale,
    stripLocalePrefix,
} from '@/i18n/config';

const jwtSecret = new TextEncoder().encode(
    process.env.JWT_SECRET || 'fallback_secret_change_me'
);

const LOCALIZED_STOREFRONT_ROUTES = [
    '/',
    '/about',
    '/account',
    '/cart',
    '/checkout',
    '/contact',
    '/forgot-password',
    '/login',
    '/news',
    '/policy',
    '/products',
    '/ref',
    '/register',
    '/reset-password',
    '/search',
    '/subscriptions',
    '/tra-cuu-don-hang',
];

const ADMIN_SUBROUTE_PERMISSIONS: Record<string, string[]> = {
    products: ['products:view'],
    orders: ['orders:view'],
    users: ['users:view'],
    staff: ['staff:view'],
    affiliates: ['affiliate:view'],
    'affiliate-settings': ['affiliate:settings'],
    commissions: ['affiliate:commissions'],
    vouchers: ['vouchers:view'],
    banners: ['banners:view'],
    blogs: ['blogs:view'],
    reports: ['reports:view'],
    settings: ['settings:view'],
};

function isStorefrontPath(pathname: string): boolean {
    return LOCALIZED_STOREFRONT_ROUTES.some(route =>
        route === '/'
            ? pathname === '/'
            : pathname === route || pathname.startsWith(`${route}/`)
    );
}

async function getUserFromToken(token: string) {
    try {
        const { payload } = await jwtVerify(token, jwtSecret);
        const role = (payload.role as string) || 'staff';
        const roleType = (payload.roleType as string) || 'viewer';
        const customPermissions = (payload.customPermissions as string[]) || [];
        return { role, roleType, customPermissions };
    } catch {
        return null;
    }
}

function hasPermission(user: any, requiredPermission: string): boolean {
    if (!user) return false;
    if (user.role === 'admin') return true;
    if (requiredPermission.startsWith('vouchers:')) return false;

    const permissions = user.customPermissions || [];
    const roleType = user.roleType;
    const rolePermissionMap: Record<string, string[]> = {
        manager: ['dashboard:view', 'products:view', 'orders:view', 'users:view', 'staff:view', 'collaborators:view', 'affiliate:view', 'banners:view', 'reports:view', 'settings:view'],
        sales: ['dashboard:view', 'products:view', 'orders:view', 'users:view', 'collaborators:view', 'affiliate:view'],
        support: ['dashboard:view', 'products:view', 'orders:view', 'users:view'],
        warehouse: ['dashboard:view', 'products:view', 'orders:view'],
        accountant: ['dashboard:view', 'orders:view', 'affiliate:view', 'reports:view', 'settings:payments'],
        viewer: ['dashboard:view', 'products:view'],
    };
    const basePermissions = rolePermissionMap[roleType] || [];

    return [...basePermissions, ...permissions].includes(requiredPermission) ||
        [...basePermissions, ...permissions].some(permission =>
            permission.startsWith(`${requiredPermission.split(':')[0]}:`)
        );
}

function localizedRedirect(request: NextRequest, pathname: string, locale: Locale) {
    const url = request.nextUrl.clone();
    url.pathname = localizePath(pathname, locale);
    return NextResponse.redirect(url);
}

export async function proxy(request: NextRequest) {
    const incomingPath = request.nextUrl.pathname;
    const hasEnglishPrefix = incomingPath === '/en' || incomingPath.startsWith('/en/');
    const logicalPath = hasEnglishPrefix ? stripLocalePrefix(incomingPath) : incomingPath;
    const isStorefront = isStorefrontPath(logicalPath);
    const savedLocale = normalizeLocale(request.cookies.get(LOCALE_COOKIE)?.value);
    const locale: Locale = hasEnglishPrefix ? 'en' : 'vi';
    const token = request.cookies.get('token')?.value;

    // A saved, explicit English choice is honored on storefront links that still
    // use an unprefixed legacy href. Admin/staff URLs are deliberately excluded.
    if (!hasEnglishPrefix && isStorefront && savedLocale === 'en') {
        return localizedRedirect(request, incomingPath, 'en');
    }

    // `/en/admin` and similar internal URLs are not valid localized surfaces.
    if (hasEnglishPrefix && !isStorefront) {
        return localizedRedirect(request, logicalPath, 'vi');
    }

    const { searchParams } = request.nextUrl;
    const refCode = normalizeReferralCode(searchParams.get('ref'));
    const storedRefCode = normalizeReferralCode(request.cookies.get('gonuts_ref')?.value);

    if (logicalPath === '/register' && !refCode && storedRefCode) {
        const registrationUrl = request.nextUrl.clone();
        registrationUrl.searchParams.set('ref', storedRefCode);
        return NextResponse.redirect(registrationUrl);
    }

    if (logicalPath.startsWith('/admin') || logicalPath === '/admin') {
        if (!token) return NextResponse.redirect(new URL('/login', request.url));

        const user = await getUserFromToken(token);
        if (!user) return NextResponse.redirect(new URL('/login', request.url));

        if (user.role !== 'admin') {
            const subroute = logicalPath.split('/')[2];
            const requiredPermission = ADMIN_SUBROUTE_PERMISSIONS[subroute]?.[0];
            if (requiredPermission && !hasPermission(user, requiredPermission)) {
                return NextResponse.redirect(new URL('/admin', request.url));
            }
        }
    }

    if (logicalPath.startsWith('/agent') || logicalPath.startsWith('/staff') || logicalPath.startsWith('/collaborator')) {
        if (!token) return NextResponse.redirect(new URL('/login', request.url));

        try {
            const { payload } = await jwtVerify(token, jwtSecret);
            const role = payload.role as string;
            const roleType = payload.roleType as string;

            if (logicalPath.startsWith('/collaborator')) {
                const isAllowed = role === 'admin' || role === 'staff' || role === 'sale' || roleType === 'collaborator';
                if (!isAllowed) return NextResponse.redirect(new URL('/', request.url));
            } else if (!['sale', 'staff', 'admin'].includes(role)) {
                return NextResponse.redirect(new URL('/', request.url));
            }
        } catch {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set(LOCALE_HEADER, locale);

    let response: NextResponse;
    if (hasEnglishPrefix && isStorefront) {
        const rewriteUrl = request.nextUrl.clone();
        rewriteUrl.pathname = logicalPath;
        response = NextResponse.rewrite(rewriteUrl, { request: { headers: requestHeaders } });
    } else {
        response = NextResponse.next({ request: { headers: requestHeaders } });
    }

    if (hasEnglishPrefix) {
        response.cookies.set(LOCALE_COOKIE, 'en', {
            maxAge: 365 * 24 * 60 * 60,
            sameSite: 'lax',
            path: '/',
        });
    }

    if (refCode) {
        response.cookies.set('gonuts_ref', refCode, {
            maxAge: 30 * 24 * 60 * 60,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
        });
    }

    return response;
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

