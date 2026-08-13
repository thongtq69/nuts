import test from 'node:test';
import assert from 'node:assert/strict';
import { localizePath, stripLocalePrefix } from '../src/i18n/config.ts';
import { interpolate, translate, translateLoose } from '../src/i18n/messages.ts';

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
});
