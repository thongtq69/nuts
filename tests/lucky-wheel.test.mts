import assert from 'node:assert/strict';
import test from 'node:test';
import {
    isCampaignActive,
    milestonePrizeValues,
    prizeForSpin,
    voucherMinimumOrder,
} from '../src/lib/lucky-wheel-rules.ts';

test('every five reveals follow the exact published order', () => {
    for (let cycle = 0; cycle < 20; cycle += 1) {
        const prizes = Array.from({ length: 5 }, (_, index) => prizeForSpin(cycle * 5 + index + 1));
        assert.deepEqual(prizes, [0, 1000, 0, 5000, 0]);
        assert.equal(prizes.reduce((sum, value) => sum + value, 0), 6000);
    }
});

test('reveal result is deterministic for audit and idempotency', () => {
    assert.equal(prizeForSpin(7), 1000);
});

test('fixed-benefit program can be activated without a random-draw approval field', () => {
    assert.equal(isCampaignActive({ enabled: true }), true);
    assert.equal(isCampaignActive({ enabled: false }), false);
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
