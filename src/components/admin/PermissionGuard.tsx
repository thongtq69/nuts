'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Permission, hasPermission, hasAnyPermission as checkAnyPermission } from '@/constants/permissions';

interface PermissionGuardProps {
    permission: Permission;
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export function PermissionGuard({ permission, children, fallback = null }: PermissionGuardProps) {
    const { user, loading } = useAuth();
    const [hasAccess, setHasAccess] = useState(false);

    useEffect(() => {
        if (!loading && user) {
            if (user.role === 'admin') {
                setHasAccess(true);
            } else {
                const permissions = user.customPermissions || [];
                setHasAccess(hasPermission(permissions, permission));
            }
        } else if (!loading && !user) {
            setHasAccess(false);
        }
    }, [user, loading, permission]);

    if (loading) {
        return null;
    }

    if (!hasAccess) {
        return fallback;
    }

    return <>{children}</>;
}

interface RoleGuardProps {
    allowedRoles: string[];
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export function RoleGuard({ allowedRoles, children, fallback = null }: RoleGuardProps) {
    const { user, loading } = useAuth();

    if (loading) {
        return null;
    }

    if (!user) {
        return fallback;
    }

    if (user.role === 'admin') {
        return <>{children}</>;
    }

    if (!allowedRoles.includes(user.role)) {
        return fallback;
    }

    return <>{children}</>;
}

export function useHasPermission(permission: Permission): boolean {
    const { user, loading } = useAuth();
    const [hasPermissionState, setHasPermission] = useState(false);

    useEffect(() => {
        if (!loading && user) {
            if (user.role === 'admin') {
                setHasPermission(true);
            } else {
                const permissions = user.customPermissions || [];
                setHasPermission(hasPermission(permissions, permission));
            }
        } else if (!loading && !user) {
            setHasPermission(false);
        }
    }, [user, loading, permission]);

    return hasPermissionState;
}

export function useHasAnyPermission(permissions: Permission[]): boolean {
    const { user, loading } = useAuth();
    const [hasAny, setHasAny] = useState(false);

    useEffect(() => {
        if (!loading && user) {
            if (user.role === 'admin') {
                setHasAny(true);
            } else {
                const userPermissions = user.customPermissions || [];
                setHasAny(permissions.some(p => hasPermission(userPermissions, p)));
            }
        } else if (!loading && !user) {
            setHasAny(false);
        }
    }, [user, loading, permissions]);

    return hasAny;
}
