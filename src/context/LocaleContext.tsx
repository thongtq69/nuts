'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { Locale, localizePath, normalizeLocale } from '@/i18n/config';
import { interpolate, translate } from '@/i18n/messages';

interface LocaleContextValue {
    locale: Locale;
    isEnglish: boolean;
    t: (source: string, values?: Record<string, string | number>) => string;
    href: (path: string) => string;
    apiPath: (path: string) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({
    children,
    initialLocale,
}: {
    children: React.ReactNode;
    initialLocale: Locale;
}) {
    const pathname = usePathname();
    const locale = pathname
        ? normalizeLocale(pathname === '/en' || pathname.startsWith('/en/') ? 'en' : 'vi')
        : initialLocale;

    useEffect(() => {
        document.documentElement.lang = locale;
    }, [locale]);

    const t = useCallback((source: string, values?: Record<string, string | number>) => {
        return values ? interpolate(locale, source, values) : translate(locale, source);
    }, [locale]);

    const href = useCallback((path: string) => localizePath(path, locale), [locale]);
    const apiPath = useCallback((path: string) => {
        if (locale === 'vi') return path;
        const separator = path.includes('?') ? '&' : '?';
        return `${path}${separator}locale=en`;
    }, [locale]);

    const value = useMemo<LocaleContextValue>(() => ({
        locale,
        isEnglish: locale === 'en',
        t,
        href,
        apiPath,
    }), [locale, t, href, apiPath]);

    return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
    const context = useContext(LocaleContext);
    if (!context) throw new Error('useLocale must be used inside LocaleProvider');
    return context;
}
