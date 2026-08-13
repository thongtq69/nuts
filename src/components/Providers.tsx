'use client';

import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { SettingsProvider } from '@/context/SettingsContext';
import { ToastProvider } from '@/context/ToastContext';
import { ConfirmProvider } from '@/context/ConfirmContext';
import { PromptProvider } from '@/context/PromptContext';
import { ThemeProvider } from 'next-themes';
import { ReactNode } from 'react';

import { NotificationProvider } from '@/context/NotificationContext';
import { LocaleProvider } from '@/context/LocaleContext';
import type { Locale } from '@/i18n/config';
import LocaleDomBridge from '@/components/i18n/LocaleDomBridge';

export function Providers({ children, locale }: { children: ReactNode; locale: Locale }) {
    return (
        <LocaleProvider initialLocale={locale}>
            <LocaleDomBridge />
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                <SettingsProvider>
                    <AuthProvider>
                        <CartProvider>
                            <NotificationProvider>
                                <ToastProvider>
                                    <ConfirmProvider>
                                        <PromptProvider>
                                            {children}
                                        </PromptProvider>
                                    </ConfirmProvider>
                                </ToastProvider>
                            </NotificationProvider>
                        </CartProvider>
                    </AuthProvider>
                </SettingsProvider>
            </ThemeProvider>
        </LocaleProvider>
    );
}
