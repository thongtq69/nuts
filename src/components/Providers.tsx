'use client';

import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { SettingsProvider } from '@/context/SettingsContext';
import { ToastProvider } from '@/context/ToastContext';
import { ThemeProvider } from 'next-themes';
import { ReactNode } from 'react';

import { NotificationProvider } from '@/context/NotificationContext';

export function Providers({ children }: { children: ReactNode }) {
    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <SettingsProvider>
                <AuthProvider>
                    <CartProvider>
                        <NotificationProvider>
                            {children}
                        </NotificationProvider>
                    </CartProvider>
                </AuthProvider>
            </SettingsProvider>
        </ThemeProvider>
    );
}
