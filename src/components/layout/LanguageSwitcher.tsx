'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useLocale } from '@/context/LocaleContext';
import { LOCALE_COOKIE, Locale, localizePath } from '@/i18n/config';

export default function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
    const { locale, t } = useLocale();
    const pathname = usePathname() || '/';
    const searchParams = useSearchParams();

    const selectLocale = (nextLocale: Locale) => {
        if (nextLocale === locale) return;
        document.cookie = `${LOCALE_COOKIE}=${nextLocale}; Path=/; Max-Age=31536000; SameSite=Lax`;
        const query = searchParams.toString();
        const localized = localizePath(pathname, nextLocale);
        const hash = window.location.hash;
        // A full navigation refreshes root metadata and <html lang> as well as
        // the visible route. This is intentionally used for locale changes.
        window.location.assign(`${localized}${query ? `?${query}` : ''}${hash}`);
    };

    return (
        <div
            className={`language-switcher ${compact ? 'language-switcher-compact' : ''}`}
            role="group"
            aria-label={t('Chọn ngôn ngữ')}
        >
            {!compact && (
                <svg aria-hidden="true" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" />
                </svg>
            )}
            <button
                type="button"
                onClick={() => selectLocale('vi')}
                className={locale === 'vi' ? 'is-active' : ''}
                aria-pressed={locale === 'vi'}
                title={t('Tiếng Việt')}
            >
                VI
            </button>
            <span aria-hidden="true">|</span>
            <button
                type="button"
                onClick={() => selectLocale('en')}
                className={locale === 'en' ? 'is-active' : ''}
                aria-pressed={locale === 'en'}
                title={t('Tiếng Anh')}
            >
                EN
            </button>
        </div>
    );
}
