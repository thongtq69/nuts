import type { Locale } from '@/i18n/config';

type LocalizedDocument = Record<string, any> & {
    translations?: {
        en?: Record<string, any>;
    };
};

function hasLocalizedValue(value: unknown): boolean {
    if (typeof value === 'string') return value.trim().length > 0;
    if (Array.isArray(value)) return value.length > 0;
    return value !== undefined && value !== null;
}

export function isPublishedForLocale(document: LocalizedDocument, locale: Locale): boolean {
    return locale !== 'en' || document.translations?.en?.isPublished !== false;
}

export function localizeDocument<T extends LocalizedDocument>(
    document: T,
    locale: Locale,
    fields: readonly string[],
): T {
    if (locale !== 'en') return document;
    const english = document.translations?.en;
    if (!english) return document;

    const localized = { ...document } as T;
    for (const field of fields) {
        if (hasLocalizedValue(english[field])) {
            (localized as Record<string, any>)[field] = english[field];
        }
    }
    return localized;
}

export const PRODUCT_LOCALIZED_FIELDS = [
    'name',
    'description',
    'shortDescription',
    'badgeText',
    'linkedCategory',
] as const;

export const BLOG_LOCALIZED_FIELDS = [
    'title',
    'slug',
    'excerpt',
    'content',
    'category',
    'tags',
] as const;

export const SETTINGS_LOCALIZED_FIELDS = [
    'address',
    'workingHours',
    'promoText',
    'homePromotionText',
    'homeFeatures',
    'productFeatures',
    'productsBannerUrl',
    'homePromoBannerUrl',
    'homePromoBannerTitle',
    'homePromoBannerButtonText',
    'homePromoBannerNote',
] as const;

export function localizeProduct<T extends LocalizedDocument>(product: T, locale: Locale): T {
    return localizeDocument(product, locale, PRODUCT_LOCALIZED_FIELDS);
}

export function localizeBlog<T extends LocalizedDocument>(blog: T, locale: Locale): T {
    return localizeDocument(blog, locale, BLOG_LOCALIZED_FIELDS);
}

export function localizeSettings<T extends LocalizedDocument>(settings: T, locale: Locale): T {
    return localizeDocument(settings, locale, SETTINGS_LOCALIZED_FIELDS);
}

export function localizePackage<T extends LocalizedDocument>(subscriptionPackage: T, locale: Locale): T {
    return localizeDocument(subscriptionPackage, locale, ['name', 'description', 'terms', 'badgeText']);
}

export function localizePageContent<T extends LocalizedDocument>(page: T, locale: Locale): T {
    return localizeDocument(page, locale, [
        'title',
        'subtitle',
        'content',
        'heroImage',
        'sideImage',
        'stats',
        'commitments',
        'metadata',
    ]);
}
