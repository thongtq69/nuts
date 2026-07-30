import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeProductPayload, ProductPayloadError } from '../src/lib/product-payload.ts';
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
