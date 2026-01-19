import dbConnect from '@/lib/db';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { Permission, ROLE_DEFINITIONS, getDefaultPermissions } from '@/constants/permissions';
import { cookies as nextCookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_change_me';

export interface AuthenticatedUser {
    _id: string;
    name: string;
    email: string;
    role: 'user' | 'sale' | 'admin' | 'staff';
    roleType?: 'admin' | 'manager' | 'sales' | 'support' | 'warehouse' | 'accountant' | 'collaborator' | 'viewer';
    customPermissions?: Permission[];
}

export async function getAuthUser(): Promise<AuthenticatedUser | null> {
    try {
        await dbConnect();
        const cookieStore = await nextCookies();
        const token = cookieStore.get('token')?.value;
        
        if (!token) return null;

        const decoded: any = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        
        if (!user) return null;

        return {
            _id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            roleType: user.roleType,
            customPermissions: user.customPermissions || []
        };
    } catch (error) {
        console.error('Auth error:', error);
        return null;
    }
}

export function getUserPermissions(user: AuthenticatedUser): Permission[] {
    if (user.role === 'admin') {
        return [
            'dashboard:view', 'dashboard:stats',
            'products:view', 'products:create', 'products:edit', 'products:delete', 'products:pricing',
            'orders:view', 'orders:edit', 'orders:delete', 'orders:process', 'orders:export',
            'users:view', 'users:create', 'users:edit', 'users:delete', 'users:roles',
            'staff:view', 'staff:create', 'staff:edit', 'staff:delete', 'staff:permissions',
            'collaborators:view', 'collaborators:create', 'collaborators:edit', 'collaborators:delete', 'collaborators:commissions',
            'affiliate:view', 'affiliate:settings', 'affiliate:commissions', 'affiliate:pay',
            'vouchers:view', 'vouchers:create', 'vouchers:edit', 'vouchers:delete', 'vouchers:rewards',
            'banners:view', 'banners:create', 'banners:edit', 'banners:delete',
            'blogs:view', 'blogs:create', 'blogs:edit', 'blogs:delete',
            'reports:view', 'reports:export', 'reports:financial',
            'settings:view', 'settings:edit', 'settings:site', 'settings:payments',
            'admin:super', 'admin:logs'
        ];
    }

    if (user.role === 'staff' && user.roleType) {
        const rolePermissions = getDefaultPermissions(user.roleType);
        const customPermissions = user.customPermissions || [];
        return [...new Set([...rolePermissions, ...customPermissions])];
    }

    return [];
}

export function hasPermission(user: AuthenticatedUser | null, permission: Permission): boolean {
    if (!user) return false;
    const permissions = getUserPermissions(user);
    return permissions.includes(permission) || permissions.includes('admin:super');
}

export function hasAnyPermission(user: AuthenticatedUser | null, requiredPermissions: Permission[]): boolean {
    if (!user) return false;
    const permissions = getUserPermissions(user);
    return requiredPermissions.some(p => permissions.includes(p)) || permissions.includes('admin:super');
}

export function requirePermission(user: AuthenticatedUser | null, permission: Permission): { authorized: boolean; error?: string } {
    if (!user) {
        return { authorized: false, error: 'Unauthorized: Not logged in' };
    }
    
    if (!hasPermission(user, permission)) {
        return { authorized: false, error: `Forbidden: Missing permission '${permission}'` };
    }
    
    return { authorized: true };
}

export function requireAnyPermission(user: AuthenticatedUser | null, permissions: Permission[]): { authorized: boolean; error?: string } {
    if (!user) {
        return { authorized: false, error: 'Unauthorized: Not logged in' };
    }
    
    if (!hasAnyPermission(user, permissions)) {
        return { authorized: false, error: `Forbidden: Missing required permissions` };
    }
    
    return { authorized: true };
}

export async function requireAuth(): Promise<{ user: AuthenticatedUser | null; error?: string }> {
    const user = await getAuthUser();
    if (!user) {
        return { user: null, error: 'Unauthorized' };
    }
    return { user };
}

export async function requireStaffAuth(): Promise<{ user: AuthenticatedUser | null; error?: string }> {
    const user = await getAuthUser();
    if (!user || (user.role !== 'staff' && user.role !== 'admin')) {
        return { user: null, error: 'Unauthorized: Staff access required' };
    }
    return { user };
}

export async function requireAdminAuth(): Promise<{ user: AuthenticatedUser | null; error?: string }> {
    const user = await getAuthUser();
    if (!user || user.role !== 'admin') {
        return { user: null, error: 'Unauthorized: Admin access required' };
    }
    return { user };
}

export function canAccessRoute(user: AuthenticatedUser | null, routeKey: string): boolean {
    const permissionMap: Record<string, Permission[]> = {
        'dashboard': ['dashboard:view'],
        'products': ['products:view'],
        'orders': ['orders:view'],
        'users': ['users:view'],
        'staff': ['staff:view'],
        'collaborators': ['collaborators:view'],
        'affiliates': ['affiliate:view'],
        'commissions': ['affiliate:commissions'],
        'vouchers': ['vouchers:view'],
        'banners': ['banners:view'],
        'blogs': ['blogs:view'],
        'reports': ['reports:view'],
        'settings': ['settings:view']
    };

    const requiredPermissions = permissionMap[routeKey];
    if (!requiredPermissions) return true;
    
    return hasAnyPermission(user, requiredPermissions);
}
