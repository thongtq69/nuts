import assert from 'node:assert/strict';
import test from 'node:test';
import {
    isCampaignActive,
    milestonePrizeValues,
    prizeForSpin,
    voucherMinimumOrder,
} from '../src/lib/lucky-wheel-rules.ts';

test('every five spins contain exactly the advertised prizes', () => {
    for (let cycle = 0; cycle < 20; cycle += 1) {
        const prizes = Array.from({ length: 5 }, (_, index) => prizeForSpin('customer-1', cycle * 5 + index + 1, 'secret'));
        assert.deepEqual([...prizes].sort((a, b) => a - b), [0, 0, 0, 1000, 5000]);
        assert.equal(prizes.reduce((sum, value) => sum + value, 0), 6000);
    }
});

test('spin result is deterministic for audit and idempotency', () => {
    assert.equal(prizeForSpin('customer-9', 7, 'secret'), prizeForSpin('customer-9', 7, 'secret'));
});

test('campaign cannot run without legal approval reference', () => {
    assert.equal(isCampaignActive({ enabled: true }), false);
    assert.equal(isCampaignActive({ enabled: true, legalApprovalReference: 'XN-123' }), true);
    assert.equal(isCampaignActive({ enabled: false, legalApprovalReference: 'XN-123' }), false);
});

test('voucher conditions and milestone prize pool are fixed', () => {
    assert.equal(voucherMinimumOrder(1000), 50_000);
    assert.equal(voucherMinimumOrder(5000), 100_000);
    assert.equal(voucherMinimumOrder(50_000), 500_000);
    assert.equal(voucherMinimumOrder(100_000), 1_000_000);
    const prizes = milestonePrizeValues();
    assert.equal(prizes.length, 15);
    assert.equal(prizes.filter(value => value === 100_000).length, 10);
    assert.equal(prizes.filter(value => value === 50_000).length, 5);
});
