'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface User {
    _id: string;
    name: string;
    email: string;
    role: 'user' | 'admin';
    phone?: string;
    address?: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (userData: User) => void;
    logout: () => void;
    checkUser: () => Promise<void>;
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
        checkUser(); // Re-verify to ensure consistency
    };

    const logout = async () => {
        try {
            // Optional: call logout API to clear cookie
            // For now, we assume cookie clearance is handled or we just clear client state
            // Better to have a logout route
            document.cookie = 'token=; Max-Age=0; path=/;'; // Simple client-side clear for now if not httpOnly, but better to use an API endpoint
            // Since it is httpOnly, we CANNOT clear it from client JS directly.
            // We MUST create a logout route. 
            await fetch('/api/auth/logout', { method: 'POST' }); // We will implement this

        } catch (e) {
            console.error('Logout error', e);
        }
        setUser(null);
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, checkUser }}>
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
