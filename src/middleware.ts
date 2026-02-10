import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const jwtSecret = new TextEncoder().encode(
    process.env.JWT_SECRET || 'fallback_secret_change_me'
);

const PUBLIC_ROUTES = ['/', '/login', '/register', '/products', '/products/', '/news', '/contact', '/policy', '/search'];
const ADMIN_ROUTES = ['/admin', '/admin/'];
const STAFF_ROUTES = ['/staff', '/agent'];

const ADMIN_SUBROUTE_PERMISSIONS: Record<string, string[]> = {
    'products': ['products:view'],
    'orders': ['orders:view'],
    'users': ['users:view'],
    'staff': ['staff:view'],
    'affiliates': ['affiliate:view'],
    'affiliate-settings': ['affiliate:settings'],
    'commissions': ['affiliate:commissions'],
    'vouchers': ['vouchers:view'],
    'banners': ['banners:view'],
    'blogs': ['blogs:view'],
    'reports': ['reports:view'],
    'settings': ['settings:view']
};

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
    
    const permissions = user.customPermissions || [];
    const roleType = user.roleType;
    
    const rolePermissionMap: Record<string, string[]> = {
        'manager': ['dashboard:view', 'products:view', 'orders:view', 'users:view', 'staff:view', 'collaborators:view', 'affiliate:view', 'vouchers:view', 'banners:view', 'blogs:view', 'reports:view', 'settings:view'],
        'sales': ['dashboard:view', 'products:view', 'orders:view', 'users:view', 'collaborators:view', 'affiliate:view', 'vouchers:view'],
        'support': ['dashboard:view', 'products:view', 'orders:view', 'users:view', 'vouchers:view'],
        'warehouse': ['dashboard:view', 'products:view', 'orders:view'],
        'accountant': ['dashboard:view', 'orders:view', 'affiliate:view', 'reports:view', 'settings:payments'],
        'viewer': ['dashboard:view', 'products:view']
    };
    
    const basePermissions = rolePermissionMap[roleType] || [];
    
    return [...basePermissions, ...permissions].includes(requiredPermission) || 
           [...basePermissions, ...permissions].some(p => p.startsWith(requiredPermission.split(':')[0] + ':'));
}

export async function middleware(request: NextRequest) {
    const response = NextResponse.next();
    const path = request.nextUrl.pathname;
    const token = request.cookies.get('token')?.value;

    const { searchParams } = new URL(request.url);
    const refCode = searchParams.get('ref');

    if (refCode) {
        response.cookies.set('gonuts_ref', refCode, {
            maxAge: 30 * 24 * 60 * 60,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
        });
    }

    if (PUBLIC_ROUTES.some(route => path === route || path.startsWith(route + '/'))) {
        return response;
    }

    if (path.startsWith('/admin') || path === '/admin') {
        if (!token) {
            return NextResponse.redirect(new URL('/login', request.url));
        }

        try {
            const user = await getUserFromToken(token);
            if (!user) {
                return NextResponse.redirect(new URL('/login', request.url));
            }

            if (user.role !== 'admin') {
                const subroute = path.split('/')[2];
                const requiredPermission = ADMIN_SUBROUTE_PERMISSIONS[subroute]?.[0];
                
                if (requiredPermission && !hasPermission(user, requiredPermission)) {
                    return NextResponse.redirect(new URL('/admin', request.url));
                }
            }
        } catch (e) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    if (path.startsWith('/agent') || path.startsWith('/staff') || path.startsWith('/collaborator')) {
        if (!token) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
        try {
            const { payload } = await jwtVerify(token, jwtSecret);
            const role = payload.role as string;
            const roleType = payload.roleType as string;
            
            // For collaborator routes, allow: admin, staff, sale, or roleType === 'collaborator'
            if (path.startsWith('/collaborator')) {
                const isAllowed = role === 'admin' || role === 'staff' || role === 'sale' || roleType === 'collaborator';
                if (!isAllowed) {
                    return NextResponse.redirect(new URL('/', request.url));
                }
            } else {
                // For agent/staff routes
                const allowedRoles = ['sale', 'staff', 'admin'];
                if (!allowedRoles.includes(role)) {
                    return NextResponse.redirect(new URL('/', request.url));
                }
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
