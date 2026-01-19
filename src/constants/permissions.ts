export type Permission =
    // Dashboard & Analytics
    | 'dashboard:view'
    | 'dashboard:stats'
    
    // Products
    | 'products:view'
    | 'products:create'
    | 'products:edit'
    | 'products:delete'
    | 'products:pricing'
    
    // Orders
    | 'orders:view'
    | 'orders:edit'
    | 'orders:delete'
    | 'orders:process'
    | 'orders:export'
    
    // Users & Customers
    | 'users:view'
    | 'users:create'
    | 'users:edit'
    | 'users:delete'
    | 'users:roles'
    
    // Staff Management
    | 'staff:view'
    | 'staff:create'
    | 'staff:edit'
    | 'staff:delete'
    | 'staff:permissions'
    
    // Collaborators (CTV)
    | 'collaborators:view'
    | 'collaborators:create'
    | 'collaborators:edit'
    | 'collaborators:delete'
    | 'collaborators:commissions'
    
    // Affiliate & Commissions
    | 'affiliate:view'
    | 'affiliate:settings'
    | 'affiliate:commissions'
    | 'affiliate:pay'
    
    // Vouchers
    | 'vouchers:view'
    | 'vouchers:create'
    | 'vouchers:edit'
    | 'vouchers:delete'
    | 'vouchers:rewards'
    
    // Banners
    | 'banners:view'
    | 'banners:create'
    | 'banners:edit'
    | 'banners:delete'
    
    // Blogs
    | 'blogs:view'
    | 'blogs:create'
    | 'blogs:edit'
    | 'blogs:delete'
    
    // Reports
    | 'reports:view'
    | 'reports:export'
    | 'reports:financial'
    
    // Settings
    | 'settings:view'
    | 'settings:edit'
    | 'settings:site'
    | 'settings:payments'
    
    // Admin Actions
    | 'admin:super'
    | 'admin:logs';

export type RoleType = 'admin' | 'manager' | 'sales' | 'support' | 'warehouse' | 'accountant' | 'collaborator' | 'viewer';

export interface RoleDefinition {
    name: string;
    description: string;
    permissions: Permission[];
    isDefault: boolean;
    color: string;
}

export const ROLE_DEFINITIONS: Record<RoleType, RoleDefinition> = {
    admin: {
        name: 'Quản trị viên',
        description: 'Toàn quyền truy cập hệ thống',
        permissions: [
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
        ],
        isDefault: false,
        color: '#dc2626'
    },
    manager: {
        name: 'Quản lý',
        description: 'Quản lý toàn diện trừ cài đặt hệ thống',
        permissions: [
            'dashboard:view', 'dashboard:stats',
            'products:view', 'products:create', 'products:edit', 'products:pricing',
            'orders:view', 'orders:edit', 'orders:process', 'orders:export',
            'users:view', 'users:create', 'users:edit',
            'staff:view', 'staff:create', 'staff:edit',
            'collaborators:view', 'collaborators:create', 'collaborators:edit', 'collaborators:commissions',
            'affiliate:view', 'affiliate:commissions',
            'vouchers:view', 'vouchers:create', 'vouchers:edit', 'vouchers:rewards',
            'banners:view', 'banners:create', 'banners:edit',
            'blogs:view', 'blogs:create', 'blogs:edit',
            'reports:view', 'reports:export', 'reports:financial',
            'settings:view'
        ],
        isDefault: false,
        color: '#7c3aed'
    },
    sales: {
        name: 'Nhân viên bán hàng',
        description: 'Quản lý đơn hàng và khách hàng',
        permissions: [
            'dashboard:view',
            'products:view',
            'orders:view', 'orders:edit', 'orders:process',
            'users:view', 'users:create',
            'collaborators:view', 'collaborators:commissions',
            'affiliate:view',
            'vouchers:view'
        ],
        isDefault: true,
        color: '#059669'
    },
    support: {
        name: 'Hỗ trợ khách hàng',
        description: 'Hỗ trợ và chăm sóc khách hàng',
        permissions: [
            'dashboard:view',
            'products:view',
            'orders:view',
            'users:view', 'users:create',
            'collaborators:view',
            'vouchers:view', 'vouchers:create'
        ],
        isDefault: false,
        color: '#0891b2'
    },
    warehouse: {
        name: 'Kho hàng',
        description: 'Quản lý kho và vận chuyển',
        permissions: [
            'dashboard:view',
            'products:view', 'products:edit',
            'orders:view', 'orders:process'
        ],
        isDefault: false,
        color: '#d97706'
    },
    accountant: {
        name: 'Kế toán',
        description: 'Quản lý tài chính và báo cáo',
        permissions: [
            'dashboard:view',
            'orders:view', 'orders:export',
            'affiliate:view', 'affiliate:commissions', 'affiliate:pay',
            'reports:view', 'reports:export', 'reports:financial',
            'settings:payments'
        ],
        isDefault: false,
        color: '#4f46e5'
    },
    collaborator: {
        name: 'Cộng tác viên',
        description: 'Xem thông tin cơ bản',
        permissions: [
            'dashboard:view',
            'products:view',
            'affiliate:view', 'affiliate:commissions'
        ],
        isDefault: false,
        color: '#16a34a'
    },
    viewer: {
        name: 'Người xem',
        description: 'Chỉ được xem thông tin',
        permissions: [
            'dashboard:view',
            'products:view'
        ],
        isDefault: false,
        color: '#6b7280'
    }
};

export const PERMISSION_GROUPS: Record<string, Permission[]> = {
    'Dashboard': ['dashboard:view', 'dashboard:stats'],
    'Sản phẩm': ['products:view', 'products:create', 'products:edit', 'products:delete', 'products:pricing'],
    'Đơn hàng': ['orders:view', 'orders:edit', 'orders:delete', 'orders:process', 'orders:export'],
    'Khách hàng': ['users:view', 'users:create', 'users:edit', 'users:delete', 'users:roles'],
    'Nhân viên': ['staff:view', 'staff:create', 'staff:edit', 'staff:delete', 'staff:permissions'],
    'Cộng tác viên': ['collaborators:view', 'collaborators:create', 'collaborators:edit', 'collaborators:delete', 'collaborators:commissions'],
    'Affiliate': ['affiliate:view', 'affiliate:settings', 'affiliate:commissions', 'affiliate:pay'],
    'Voucher': ['vouchers:view', 'vouchers:create', 'vouchers:edit', 'vouchers:delete', 'vouchers:rewards'],
    'Banner': ['banners:view', 'banners:create', 'banners:edit', 'banners:delete'],
    'Blog': ['blogs:view', 'blogs:create', 'blogs:edit', 'blogs:delete'],
    'Báo cáo': ['reports:view', 'reports:export', 'reports:financial'],
    'Cài đặt': ['settings:view', 'settings:edit', 'settings:site', 'settings:payments'],
    'Admin': ['admin:super', 'admin:logs']
};

export function hasPermission(userPermissions: Permission[], requiredPermission: Permission): boolean {
    return userPermissions.includes(requiredPermission) || userPermissions.includes('admin:super');
}

export function hasAnyPermission(userPermissions: Permission[], requiredPermissions: Permission[]): boolean {
    return requiredPermissions.some(p => userPermissions.includes(p)) || userPermissions.includes('admin:super');
}

export function hasAllPermissions(userPermissions: Permission[], requiredPermissions: Permission[]): boolean {
    return requiredPermissions.every(p => userPermissions.includes(p)) || userPermissions.includes('admin:super');
}

export function getDefaultPermissions(roleType: RoleType): Permission[] {
    return ROLE_DEFINITIONS[roleType]?.permissions || [];
}

export function getRoleColor(roleType: RoleType): string {
    return ROLE_DEFINITIONS[roleType]?.color || '#6b7280';
}
