import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeProductPayload, ProductPayloadError } from '../src/lib/product-payload.ts';
import { describeProductPersistenceError } from '../src/lib/product-persistence-error.ts';
import { calculateVoucherDiscount } from '../src/lib/voucher-discount.ts';

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

test('a linked product must have a submenu', () => {
    assert.throws(
        () => normalizeProductPayload({
            isLinkedProduct: true,
            linkedCategory: '   ',
            vipMaxDiscount: 50_000,
        }),
        ProductPayloadError,
    );
});

test('submenu names are normalized and the VIP limit is rounded', () => {
    const product = normalizeProductPayload({
        isLinkedProduct: true,
        linkedCategory: '  Táo   đỏ  ',
        vipMaxDiscount: 50_000.4,
    });

    assert.equal(product.linkedCategory, 'Táo đỏ');
    assert.equal(product.vipMaxDiscount, 50_000);
});

test('a negative per-product VIP limit is rejected', () => {
    assert.throws(
        () => normalizeProductPayload({
            isLinkedProduct: false,
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
