import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { normalizeProductPayload, ProductPayloadError } from '../src/lib/product-payload.ts';
import { describeProductPersistenceError } from '../src/lib/product-persistence-error.ts';
import {
    PRODUCT_CATEGORIES,
    getCategoryValuesWithProducts,
    getProductCategoryLabel,
    sortProductCategoriesAlphabetically,
} from '../src/constants/product-categories.ts';
import { normalizeMenuName } from '../src/lib/menu-name.ts';
import { cleanHTMLContent } from '../src/lib/textUtils.ts';
import { calculateVoucherDiscount } from '../src/lib/voucher-discount.ts';
import { isProductPriceInRanges } from '../src/lib/product-price-filter.ts';
import {
    HOMEPAGE_SECTION_CONFIG,
    HomepageSelectionError,
    normalizeHomepageSelection,
} from '../src/lib/homepage-products.ts';
import { DEFAULT_HOME_FEATURES, normalizeHomeFeatures } from '../src/lib/site-features.ts';
import { formatStaffCode } from '../src/lib/staff-code.ts';
import { addReferralToPath, normalizeReferralCode } from '../src/lib/referral-attribution.ts';
import { ROLE_DEFINITIONS } from '../src/constants/permissions.ts';
import { DEFAULT_HOME_PROMOTION_TEXT, normalizeHomePromotionText } from '../src/lib/home-promotion.ts';
import {
    buildManagedCustomerQuery,
    buildMembershipVoucherCode,
    isConfirmedPaymentStatus,
} from '../src/lib/customer-ownership.ts';

test('customer detail registers the membership package model on cold starts', async () => {
    const source = await readFile(
        new URL('../src/lib/customer-detail.ts', import.meta.url),
        'utf8',
    );

    assert.match(
        source,
        /import SubscriptionPackage from '@\/models\/SubscriptionPackage';/,
    );
    assert.match(source, /model: SubscriptionPackage,/);
});

test('staff customer scope includes only direct and team referral relationships', () => {
    const query = buildManagedCustomerQuery('staff-1', ['collab-1']);
    assert.equal(query.role, 'user');
    assert.deepEqual(query.$or, [
        { parentStaff: 'staff-1' },
        { 'commissionSettings.managerId': 'staff-1' },
        { referrer: { $in: ['staff-1', 'collab-1'] } },
    ]);
});

test('membership vouchers can only be activated after confirmed payment', () => {
    assert.equal(isConfirmedPaymentStatus('pending'), false);
    assert.equal(isConfirmedPaymentStatus('failed'), false);
    assert.equal(isConfirmedPaymentStatus('paid'), true);
    assert.equal(isConfirmedPaymentStatus('completed'), true);
});

test('membership voucher codes are stable per order and voucher position', () => {
    assert.equal(buildMembershipVoucherCode('698abc1234567890', 0), 'VIP3456789001');
    assert.equal(buildMembershipVoucherCode('698abc1234567890', 1), 'VIP3456789002');
});

test('staff codes are generated in the required fixed-width sequence', () => {
    assert.equal(formatStaffCode(1), 'NV000001');
    assert.equal(formatStaffCode(42), 'NV000042');
});

test('staff referral code stays attached to every registration URL', () => {
    assert.equal(
        addReferralToPath('/register?type=collaborator', 'nv000001'),
        '/register?type=collaborator&ref=NV000001',
    );
    assert.equal(normalizeReferralCode(' nv000042 '), 'NV000042');
    assert.equal(normalizeReferralCode('mã không hợp lệ'), '');
});

test('staff roles do not inherit article publishing rights automatically', () => {
    for (const [role, definition] of Object.entries(ROLE_DEFINITIONS)) {
        if (role === 'admin') continue;
        assert.equal(
            definition.permissions.some(permission => permission.startsWith('blogs:')),
            false,
            `${role} must receive blog permissions explicitly`,
        );
    }

    assert.equal(ROLE_DEFINITIONS.admin.permissions.includes('blogs:create'), true);
});

test('homepage commitments keep four editable content boxes', () => {
    assert.equal(DEFAULT_HOME_FEATURES.length, 4);
    assert.deepEqual(
        DEFAULT_HOME_FEATURES.map(feature => feature.icon),
        ['truck', 'refresh', 'shield', 'users'],
    );
});

test('the homepage announcement strip keeps an editable normalized value', () => {
    assert.equal(
        normalizeHomePromotionText('  Miễn phí vận chuyển từ 500.000đ  '),
        'Miễn phí vận chuyển từ 500.000đ',
    );
    assert.equal(normalizeHomePromotionText(undefined), DEFAULT_HOME_PROMOTION_TEXT);
    assert.equal(normalizeHomePromotionText('x'.repeat(301)).length, 300);
});

test('homepage commitment content is normalized before saving', () => {
    const features = normalizeHomeFeatures([
        { text: '  Miễn phí từ 500.000đ  ', icon: 'truck', enabled: true },
        { text: 'Đổi trả trong 7 ngày', icon: 'refresh', enabled: false },
    ]);

    assert.equal(features.length, 4);
    assert.equal(features[0].text, 'Miễn phí từ 500.000đ');
    assert.equal(features[1].enabled, false);
    assert.equal(features[2].text, DEFAULT_HOME_FEATURES[2].text);
});

test('homepage product groups keep the requested limits', () => {
    assert.equal(HOMEPAGE_SECTION_CONFIG.bestSeller.limit, 8);
    assert.equal(HOMEPAGE_SECTION_CONFIG.new.limit, 8);
    assert.equal(HOMEPAGE_SECTION_CONFIG.promo.limit, 8);
    assert.equal(HOMEPAGE_SECTION_CONFIG.linked.limit, 6);
});

test('homepage product selection removes duplicate ids', () => {
    assert.deepEqual(
        normalizeHomepageSelection('linked', ['a', 'a', 'b']).productIds,
        ['a', 'b'],
    );
});

test('homepage product selection rejects more products than the section can display', () => {
    assert.throws(
        () => normalizeHomepageSelection(
            'linked',
            Array.from({ length: 7 }, (_, index) => `product-${index}`),
        ),
        HomepageSelectionError,
    );
});

test('product price ranges use non-overlapping storefront boundaries', () => {
    assert.equal(isProductPriceInRanges(99_999, ['under-100k']), true);
    assert.equal(isProductPriceInRanges(100_000, ['under-100k']), false);
    assert.equal(isProductPriceInRanges(100_000, ['100k-300k']), true);
    assert.equal(isProductPriceInRanges(300_000, ['100k-300k']), false);
    assert.equal(isProductPriceInRanges(300_000, ['300k-500k']), true);
    assert.equal(isProductPriceInRanges(500_000, ['300k-500k']), true);
    assert.equal(isProductPriceInRanges(500_000, ['over-500k']), false);
    assert.equal(isProductPriceInRanges(500_001, ['over-500k']), true);
});

test('selecting multiple product price ranges combines their results', () => {
    const selectedRanges = ['under-100k', 'over-500k'] as const;

    assert.equal(isProductPriceInRanges(50_000, selectedRanges), true);
    assert.equal(isProductPriceInRanges(175_000, selectedRanges), false);
    assert.equal(isProductPriceInRanges(691_200, selectedRanges), true);
    assert.equal(isProductPriceInRanges(175_000, []), true);
});

test('VIP 30% on 200,000đ is capped at 50,000đ for the product', () => {
    const discount = calculateVoucherDiscount({
        discountType: 'percent',
        discountValue: 30,
        items: [{ unitPrice: 200_000, quantity: 1, vipMaxDiscount: 50_000 }],
        applyProductCaps: true,
    });

    assert.equal(discount, 50_000);
    assert.equal(200_000 - discount, 150_000);
});

test('each product uses its own VIP limit before the whole-voucher limit', () => {
    const discount = calculateVoucherDiscount({
        discountType: 'percent',
        discountValue: 30,
        voucherMaxDiscount: 60_000,
        items: [
            { unitPrice: 200_000, quantity: 1, vipMaxDiscount: 50_000 },
            { unitPrice: 100_000, quantity: 1, vipMaxDiscount: 20_000 },
        ],
        applyProductCaps: true,
    });

    assert.equal(discount, 60_000);
});

test('the product VIP limit is applied per purchased unit', () => {
    const discount = calculateVoucherDiscount({
        discountType: 'percent',
        discountValue: 30,
        items: [{ unitPrice: 200_000, quantity: 2, vipMaxDiscount: 50_000 }],
        applyProductCaps: true,
    });

    assert.equal(discount, 100_000);
});

test('zero means that the product has no individual VIP limit', () => {
    const discount = calculateVoucherDiscount({
        discountType: 'percent',
        discountValue: 30,
        items: [{ unitPrice: 200_000, quantity: 1, vipMaxDiscount: 0 }],
        applyProductCaps: true,
    });

    assert.equal(discount, 60_000);
});

test('fixed VIP vouchers also respect the total of product limits', () => {
    const discount = calculateVoucherDiscount({
        discountType: 'fixed',
        discountValue: 80_000,
        items: [
            { unitPrice: 200_000, quantity: 1, vipMaxDiscount: 50_000 },
            { unitPrice: 100_000, quantity: 1, vipMaxDiscount: 20_000 },
        ],
        applyProductCaps: true,
    });

    assert.equal(discount, 70_000);
});

test('the VIP limit is rounded before the product is persisted', () => {
    const product = normalizeProductPayload({
        vipMaxDiscount: 50_000.4,
    });

    assert.equal(product.vipMaxDiscount, 50_000);
});

test('a linked product requires a submenu', () => {
    assert.throws(
        () => normalizeProductPayload({
            isLinkedProduct: true,
            linkedCategory: '   ',
            vipMaxDiscount: 0,
        }),
        ProductPayloadError,
    );
});

test('a linked product submenu is normalized before persistence', () => {
    const product = normalizeProductPayload({
        isLinkedProduct: true,
        linkedCategory: '  Táo   đỏ  ',
        vipMaxDiscount: 0,
    });

    assert.equal(product.isLinkedProduct, true);
    assert.equal(product.linkedCategory, 'Táo đỏ');
});

test('a regular product does not retain a linked submenu', () => {
    const product = normalizeProductPayload({
        isLinkedProduct: false,
        linkedCategory: 'Bánh',
        vipMaxDiscount: 0,
    });

    assert.equal(product.isLinkedProduct, false);
    assert.equal(product.linkedCategory, '');
});

test('a negative per-product VIP limit is rejected', () => {
    assert.throws(
        () => normalizeProductPayload({
            vipMaxDiscount: -1,
        }),
        ProductPayloadError,
    );
});

test('database quota errors are translated into a useful admin message', () => {
    const error = new Error(
        'you are over your space quota, using 513 MB of 512 MB. Writes are blocked on your cluster',
    );
    const result = describeProductPersistenceError(error, 'create');

    assert.equal(result.status, 507);
    assert.match(result.message, /Cơ sở dữ liệu đã đầy/);
});

test('duplicate product errors return a conflict instead of a generic failure', () => {
    const result = describeProductPersistenceError({ code: 11000 }, 'create');

    assert.equal(result.status, 409);
    assert.match(result.message, /đã tồn tại/);
});

test('the storefront and product form share the same icon-free categories', () => {
    assert.deepEqual(
        PRODUCT_CATEGORIES.map(category => category.label),
        ['Các loại hạt', 'Đồ ăn vặt', 'Hạt giống', 'Hũ đựng', 'Quả mọng', 'Trái cây sấy', 'Túi đựng'],
    );
    assert.equal(getProductCategoryLabel('Dried Fruits'), 'Trái cây sấy');
    assert.equal(
        new Set(PRODUCT_CATEGORIES.map(category => category.value)).size,
        PRODUCT_CATEGORIES.length,
    );
});

test('product categories use English alphabetical order without Vietnamese accents', () => {
    const categories = sortProductCategoriesAlphabetically([
        { label: 'Yến Sào' },
        { label: 'Đông Trùng Hạ Thảo' },
        { label: 'Bánh' },
        { label: 'Áo quà tặng' },
    ]);

    assert.deepEqual(
        categories.map(category => category.label),
        ['Áo quà tặng', 'Bánh', 'Đông Trùng Hạ Thảo', 'Yến Sào'],
    );
});

test('the storefront only shows categories containing regular products', () => {
    const categoryValues = getCategoryValuesWithProducts([
        { category: 'Nuts', isLinkedProduct: false },
        { category: 'Nuts', isLinkedProduct: false },
        { category: 'Berries', isLinkedProduct: true },
        { category: '  Snacks  ' },
        { category: '' },
    ]);

    assert.deepEqual(categoryValues, ['Nuts', 'Snacks']);
});

test('new category names are normalized before they are saved', () => {
    assert.equal(normalizeMenuName('  Đông   trùng hạ thảo  '), 'Đông trùng hạ thảo');
});

test('short product descriptions preserve an intentional VAT line break', () => {
    const description = 'Đông Trùng Hạ Thảo khô 300mg.\nGiá bán đã bao gồm VAT';
    assert.equal(cleanHTMLContent(description), description);
});
