export const SUPPORTED_LOCALES = ['vi', 'en'] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'vi';
export const LOCALE_COOKIE = 'gonuts_locale';
export const LOCALE_HEADER = 'x-gonuts-locale';

export function isLocale(value: unknown): value is Locale {
    return typeof value === 'string' && SUPPORTED_LOCALES.includes(value as Locale);
}

export function normalizeLocale(value: unknown): Locale {
    return isLocale(value) ? value : DEFAULT_LOCALE;
}

export function stripLocalePrefix(pathname: string): string {
    if (pathname === '/en') return '/';
    if (pathname.startsWith('/en/')) return pathname.slice(3) || '/';
    return pathname || '/';
}

export function localizePath(pathname: string, locale: Locale): string {
    if (!pathname || pathname.startsWith('#')) return pathname;
    if (/^(?:[a-z]+:)?\/\//i.test(pathname) || pathname.startsWith('mailto:') || pathname.startsWith('tel:')) {
        return pathname;
    }

    const [pathAndQuery, hash = ''] = pathname.split('#', 2);
    const [rawPath, query = ''] = pathAndQuery.split('?', 2);
    const basePath = stripLocalePrefix(rawPath || '/');
    const localizedPath = locale === 'en'
        ? (basePath === '/' ? '/en' : `/en${basePath}`)
        : basePath;

    return `${localizedPath}${query ? `?${query}` : ''}${hash ? `#${hash}` : ''}`;
}

