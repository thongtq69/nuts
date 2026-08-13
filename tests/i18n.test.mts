import test from 'node:test';
import assert from 'node:assert/strict';
import { localizePath, stripLocalePrefix } from '../src/i18n/config.ts';
import { interpolate, translate, translateLoose } from '../src/i18n/messages.ts';
import {
    getMissingEnglishFields,
    isPublishedForLocale,
    localizeBanner,
    localizePageContent,
    localizePackage,
} from '../src/lib/localized-content.ts';

test('English storefront paths preserve queries and hashes', () => {
    assert.equal(localizePath('/products?sort=newest#grid', 'en'), '/en/products?sort=newest#grid');
    assert.equal(localizePath('/en/products?sort=newest', 'vi'), '/products?sort=newest');
    assert.equal(localizePath('/', 'en'), '/en');
});

test('locale prefix stripping only changes the English prefix', () => {
    assert.equal(stripLocalePrefix('/en'), '/');
    assert.equal(stripLocalePrefix('/en/news/article'), '/news/article');
    assert.equal(stripLocalePrefix('/products'), '/products');
});

test('English messages support exact, interpolated and legacy UI translation', () => {
    assert.equal(translate('en', 'Trang chủ'), 'Home');
    assert.equal(interpolate('en', '{count} lượt xem', { count: 12 }), '12 views');
    assert.equal(translateLoose('en', 'Đơn hàng #ABC123'), 'Order #ABC123');
    assert.equal(translate('vi', 'Trang chủ'), 'Trang chủ');
    assert.equal(interpolate('en', '{count} mã', { count: 3 }), '3 vouchers');
    assert.equal(interpolate('en', 'TRỌN GÓI {days} NGÀY', { days: 30 }), 'VALID FOR 30 DAYS');
});

test('English public content requires an explicitly published translation', () => {
    assert.equal(isPublishedForLocale({ name: 'Hạt điều' }, 'en'), false);
    assert.equal(isPublishedForLocale({ translations: { en: { isPublished: false } } }, 'en'), false);
    assert.equal(isPublishedForLocale({ translations: { en: { isPublished: true } } }, 'en'), true);
    assert.equal(isPublishedForLocale({ name: 'Hạt điều' }, 'vi'), true);
    assert.deepEqual(getMissingEnglishFields({
        translations: { en: { name: 'Cashews', description: ' ' } },
    }, ['name', 'description']), ['description']);
});

test('banner and package localization uses English dynamic fields with field-level fallback', () => {
    const banner = localizeBanner({
        title: 'Banner tiếng Việt',
        alt: 'Mô tả banner tiếng Việt',
        imageUrl: '/vi.jpg',
        link: '/products',
        translations: {
            en: {
                title: 'English banner',
                imageUrl: '/en.jpg',
                alt: 'English banner description',
            },
        },
    }, 'en');
    assert.equal(banner.title, 'English banner');
    assert.equal(banner.imageUrl, '/en.jpg');
    assert.equal(banner.link, '/products');
    assert.equal(banner.alt, 'English banner description');

    const subscriptionPackage = localizePackage({
        name: 'Gói hạt',
        description: 'Mô tả tiếng Việt',
        terms: 'Điều khoản tiếng Việt',
        translations: {
            en: {
                name: 'Nut plan',
                description: '',
                terms: 'English terms',
            },
        },
    }, 'en');
    assert.equal(subscriptionPackage.name, 'Nut plan');
    assert.equal(subscriptionPackage.description, 'Mô tả tiếng Việt');
    assert.equal(subscriptionPackage.terms, 'English terms');

    const pageContent = localizePageContent({
        title: 'Chính sách',
        metadata: { description: 'Mô tả SEO', keywords: ['chính sách'] },
        translations: {
            en: {
                title: 'Policy',
                metadata: { description: 'English SEO description', keywords: [] },
            },
        },
    }, 'en');
    assert.equal(pageContent.title, 'Policy');
    assert.deepEqual(pageContent.metadata, {
        description: 'English SEO description',
        keywords: ['chính sách'],
    });
});
