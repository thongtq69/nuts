import type { Locale } from '../i18n/config.ts';

type LocalizedDocument = {
    translations?: {
        en?: object;
    };
};

function hasLocalizedValue(value: unknown): boolean {
    if (typeof value === 'string') return value.trim().length > 0;
    if (Array.isArray(value)) return value.some(hasLocalizedValue);
    if (typeof value === 'object' && value !== null) {
        return Object.values(value).some(hasLocalizedValue);
    }
    return value !== undefined && value !== null;
}

function isLocalizedObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function mergeLocalizedObject(
    source: unknown,
    translation: Record<string, unknown>,
): Record<string, unknown> {
    const merged = isLocalizedObject(source) ? { ...source } : {};
    for (const [key, translatedValue] of Object.entries(translation)) {
        if (!hasLocalizedValue(translatedValue)) continue;
        const sourceValue = merged[key];
        merged[key] = isLocalizedObject(translatedValue)
            ? mergeLocalizedObject(sourceValue, translatedValue)
            : translatedValue;
    }
    return merged;
}

export function isPublishedForLocale(document: object, locale: Locale): boolean {
    const localizedDocument = document as LocalizedDocument;
    const english = localizedDocument.translations?.en as Record<string, unknown> | undefined;
    return locale !== 'en' || english?.isPublished === true;
}

export function getMissingEnglishFields<T extends LocalizedDocument>(
    document: T,
    requiredFields: readonly string[],
): string[] {
    const english = document.translations?.en as Record<string, unknown> | undefined;
    return requiredFields.filter(field => !hasLocalizedValue(english?.[field]));
}

export function localizeDocument<T extends LocalizedDocument>(
    document: T,
    locale: Locale,
    fields: readonly string[],
): T {
    if (locale !== 'en') return document;
    const english = document.translations?.en as Record<string, unknown> | undefined;
    if (!english) return document;

    const localized = { ...document } as T;
    for (const field of fields) {
        const translatedValue = english[field];
        if (!hasLocalizedValue(translatedValue)) continue;
        const sourceValue = (localized as Record<string, unknown>)[field];
        (localized as Record<string, unknown>)[field] = isLocalizedObject(translatedValue)
            ? mergeLocalizedObject(sourceValue, translatedValue)
            : translatedValue;
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

export const BANNER_LOCALIZED_FIELDS = [
    'title',
    'imageUrl',
    'link',
    'alt',
] as const;

export const PACKAGE_LOCALIZED_FIELDS = [
    'name',
    'description',
    'terms',
    'badgeText',
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
    return localizeDocument(subscriptionPackage, locale, PACKAGE_LOCALIZED_FIELDS);
}

export function localizeBanner<T extends LocalizedDocument>(banner: T, locale: Locale): T {
    return localizeDocument(banner, locale, BANNER_LOCALIZED_FIELDS);
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
