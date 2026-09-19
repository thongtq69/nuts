import assert from 'node:assert/strict';
import test from 'node:test';
import {
    isCampaignActive,
    milestonePrizeValues,
    prizeForSpin,
    spinsForTopUp,
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
    assert.equal(prizeForSpin(4, [0, 2000, 5000]), 0);
    assert.equal(prizeForSpin(5, [0, 2000, 5000]), 2000);
});

test('fixed-benefit program can be activated without a random-draw approval field', () => {
    assert.equal(isCampaignActive({ enabled: true }), true);
    assert.equal(isCampaignActive({ enabled: false }), false);
});

test('top-up conversion and milestone prize pool are fixed', () => {
    assert.equal(spinsForTopUp(9_999), 0);
    assert.equal(spinsForTopUp(10_000), 5);
    assert.equal(spinsForTopUp(50_000), 25);
    assert.equal(spinsForTopUp(30_000, 15_000, 4), 8);
    assert.equal(spinsForTopUp(20_000, 15_000, 4), 0);
    const prizes = milestonePrizeValues();
    assert.equal(prizes.length, 15);
    assert.equal(prizes.filter(value => value === 100_000).length, 10);
    assert.equal(prizes.filter(value => value === 50_000).length, 5);
});
