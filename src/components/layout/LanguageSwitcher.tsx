'use client';

import { useEffect, useId, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useLocale } from '@/context/LocaleContext';
import { LOCALE_COOKIE, Locale, localizePath } from '@/i18n/config';

type LanguageOption = {
    locale: Locale;
    label: string;
    shortLabel: string;
};

const LANGUAGE_OPTIONS: LanguageOption[] = [
    { locale: 'vi', label: 'Tiếng Việt', shortLabel: 'VI' },
    { locale: 'en', label: 'English', shortLabel: 'EN' },
];

function persistLocaleCookie(locale: Locale) {
    document.cookie = `${LOCALE_COOKIE}=${locale}; Path=/; Max-Age=31536000; SameSite=Lax`;
}

function FlagIcon({ locale }: { locale: Locale }) {
    if (locale === 'vi') {
        return (
            <svg className="language-flag" viewBox="0 0 36 24" aria-hidden="true" focusable="false">
                <rect width="36" height="24" rx="2" fill="#DA251D" />
                <path
                    fill="#FFEB3B"
                    d="m18 5.2 1.57 4.82h5.07l-4.1 2.98 1.57 4.82L18 14.84l-4.1 2.98L15.47 13l-4.1-2.98h5.06L18 5.2Z"
                />
            </svg>
        );
    }

    return (
        <svg className="language-flag" viewBox="0 0 36 24" aria-hidden="true" focusable="false">
            <rect width="36" height="24" fill="#21468B" />
            <path d="M0 0 36 24M36 0 0 24" stroke="#fff" strokeWidth="6" />
            <path d="M0 0 36 24M36 0 0 24" stroke="#CF142B" strokeWidth="2.5" />
            <path d="M18 0v24M0 12h36" stroke="#fff" strokeWidth="8" />
            <path d="M18 0v24M0 12h36" stroke="#CF142B" strokeWidth="4" />
        </svg>
    );
}

function CheckIcon() {
    return (
        <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="m5 12 4 4L19 6" />
        </svg>
    );
}

export default function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
    const { locale, t } = useLocale();
    const pathname = usePathname() || '/';
    const searchParams = useSearchParams();
    const [isOpen, setIsOpen] = useState(false);
    const switcherRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
    const openFocusIndexRef = useRef(0);
    const menuId = useId();
    const activeLanguage = LANGUAGE_OPTIONS.find(option => option.locale === locale) || LANGUAGE_OPTIONS[0];
    const activeIndex = Math.max(0, LANGUAGE_OPTIONS.findIndex(option => option.locale === locale));

    useEffect(() => {
        if (!isOpen) return;

        optionRefs.current[openFocusIndexRef.current]?.focus();

        const closeOnOutsideClick = (event: PointerEvent) => {
            if (!switcherRef.current?.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        const closeOnEscape = (event: KeyboardEvent) => {
            if (event.key !== 'Escape') return;
            event.preventDefault();
            setIsOpen(false);
            triggerRef.current?.focus();
        };

        document.addEventListener('pointerdown', closeOnOutsideClick);
        document.addEventListener('keydown', closeOnEscape);
        return () => {
            document.removeEventListener('pointerdown', closeOnOutsideClick);
            document.removeEventListener('keydown', closeOnEscape);
        };
    }, [isOpen]);

    const openMenu = (focusIndex: number) => {
        openFocusIndexRef.current = focusIndex;
        setIsOpen(true);
    };

    const handleTriggerClick = () => {
        if (isOpen) {
            setIsOpen(false);
            return;
        }
        openMenu(activeIndex);
    };

    const handleTriggerKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
        if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
        event.preventDefault();
        openMenu(event.key === 'ArrowDown' ? 0 : LANGUAGE_OPTIONS.length - 1);
    };

    const handleMenuKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
        const currentIndex = optionRefs.current.findIndex(option => option === document.activeElement);
        let nextIndex: number | null = null;

        if (event.key === 'ArrowDown') {
            nextIndex = currentIndex < 0 ? 0 : (currentIndex + 1) % LANGUAGE_OPTIONS.length;
        } else if (event.key === 'ArrowUp') {
            nextIndex = currentIndex <= 0 ? LANGUAGE_OPTIONS.length - 1 : currentIndex - 1;
        } else if (event.key === 'Home') {
            nextIndex = 0;
        } else if (event.key === 'End') {
            nextIndex = LANGUAGE_OPTIONS.length - 1;
        }

        if (nextIndex === null) return;
        event.preventDefault();
        optionRefs.current[nextIndex]?.focus();
    };

    const selectLocale = (nextLocale: Locale) => {
        setIsOpen(false);
        if (nextLocale === locale) {
            triggerRef.current?.focus();
            return;
        }
        persistLocaleCookie(nextLocale);
        const query = searchParams.toString();
        const localized = localizePath(pathname, nextLocale);
        const hash = window.location.hash;
        // A full navigation also refreshes root metadata and the document lang.
        window.location.assign(`${localized}${query ? `?${query}` : ''}${hash}`);
    };

    return (
        <div
            ref={switcherRef}
            className={`language-switcher ${compact ? 'language-switcher-compact' : ''} ${isOpen ? 'is-open' : ''}`}
        >
            <button
                ref={triggerRef}
                type="button"
                className="language-switcher-trigger"
                aria-label={`${t('Chọn ngôn ngữ')}: ${activeLanguage.label}`}
                aria-haspopup="menu"
                aria-expanded={isOpen}
                aria-controls={menuId}
                onClick={handleTriggerClick}
                onKeyDown={handleTriggerKeyDown}
            >
                <FlagIcon locale={activeLanguage.locale} />
                <span className="language-switcher-current">{activeLanguage.shortLabel}</span>
                <svg className="language-switcher-chevron" aria-hidden="true" viewBox="0 0 20 20" width="16" height="16">
                    <path d="m5 7.5 5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </button>

            {isOpen && (
                <div
                    id={menuId}
                    className="language-switcher-menu"
                    role="menu"
                    aria-label={t('Chọn ngôn ngữ')}
                    onKeyDown={handleMenuKeyDown}
                >
                    {LANGUAGE_OPTIONS.map((option, index) => {
                        const isActive = option.locale === locale;
                        return (
                            <button
                                ref={element => {
                                    optionRefs.current[index] = element;
                                }}
                                key={option.locale}
                                type="button"
                                role="menuitemradio"
                                aria-checked={isActive}
                                tabIndex={-1}
                                className={`language-switcher-option ${isActive ? 'is-active' : ''}`}
                                onClick={() => selectLocale(option.locale)}
                            >
                                <FlagIcon locale={option.locale} />
                                <span className="language-switcher-label" lang={option.locale}>{option.label}</span>
                                <span className="language-switcher-code" aria-hidden="true">{option.shortLabel}</span>
                                <span className="language-switcher-check" aria-hidden="true">
                                    {isActive && <CheckIcon />}
                                </span>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
