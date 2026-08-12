'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import type { Permission, RoleType } from '@/constants/permissions';

interface User {
    _id: string;
    name: string;
    email: string;
    role: 'user' | 'sale' | 'admin' | 'staff';
    phone?: string;
    address?: string;
    saleApplicationStatus?: 'pending' | 'approved' | 'rejected' | null;
    roleType?: RoleType;
    customPermissions?: Permission[];
    staffCode?: string;
    referralCode?: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (userData: User) => void;
    logout: () => Promise<boolean>;
    checkUser: () => Promise<void>;
    isAdmin: boolean;
    isSale: boolean;
    isStaff: boolean;
    hasPermission: (permission: Permission) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const checkUser = async () => {
        try {
            const res = await fetch('/api/auth/me');
            if (res.ok) {
                const userData = await res.json();
                setUser(userData);
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error('Failed to check auth status', error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkUser();
    }, []);

    const login = (userData: User) => {
        setUser(userData);
        checkUser();
    };

    const logout = async () => {
        try {
            const response = await fetch('/api/auth/logout', { method: 'POST' });
            if (!response.ok) {
                throw new Error('Logout request failed');
            }
        } catch (e) {
            console.error('Logout error', e);
            return false;
        }

        setUser(null);
        router.replace('/login');
        router.refresh();
        return true;
    };

    const isAdmin = user?.role === 'admin';
    const isSale = user?.role === 'sale';
    const isStaff = user?.role === 'staff';

    const hasPermission = (permission: Permission): boolean => {
        if (!user) return false;
        if (user.role === 'admin') return true;
        const permissions = user.customPermissions || [];
        return permissions.includes(permission);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, checkUser, isAdmin, isSale, isStaff, hasPermission }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
