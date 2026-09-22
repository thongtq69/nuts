import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
    availablePrizeBalance,
    isCampaignActive,
    milestonePrizeValues,
    prizeForSpin,
    randomizedPrizeCycle,
    spinsForTopUp,
    withdrawalRequestDecision,
} from '../src/lib/lucky-wheel-rules.ts';
import { matchesWithdrawalTransaction } from '../src/lib/lucky-wheel-withdrawal-rules.ts';
import { findVietnamBank, searchVietnamBanks, VIETNAM_BANKS } from '../src/lib/vietnam-banks.ts';
import { DEFAULT_WHEEL_COPY } from '../src/lib/lucky-wheel-config.ts';

test('lucky wheel title uses GO NUTS and stays on one line for the default campaign', () => {
    const customerPage = readFileSync(new URL('../src/app/lucky-wheel/page.tsx', import.meta.url), 'utf8');
    const wheelService = readFileSync(new URL('../src/lib/lucky-wheel.ts', import.meta.url), 'utf8');

    assert.equal(DEFAULT_WHEEL_COPY.campaignName, 'Vòng quay may mắn GO NUTS');
    assert.match(customerPage, /whitespace-nowrap text-\[clamp\(1rem,4vw,3\.4rem\)\]/);
    assert.match(customerPage, /Vòng quay may mắn GO NUTS/);
    assert.match(wheelService, /settings\.campaignName === 'Vòng quay may mắn Go Nuts'/);
    assert.match(wheelService, /settings\.campaignName = DEFAULT_WHEEL_COPY\.campaignName/);
});

test('regular spin groups are random-looking while respecting the customer prize rule', () => {
    const arrangements = new Set<string>();
    let highPrizeGroups = 0;
    const regularWinningCounts = new Set<number>();

    for (let cycle = 0; cycle < 300; cycle += 1) {
        const prizes = randomizedPrizeCycle(cycle, undefined, 'customer-a:secret');
        arrangements.add(prizes.join(','));

        if (prizes.includes(5_000)) {
            highPrizeGroups += 1;
            assert.equal(prizes.filter(value => value === 5_000).length, 1);
            assert.equal(prizes.filter(value => value === 1_000).length, 1);
            assert.equal(prizes.filter(value => value === 0).length, 3);
            assert.equal(prizes.reduce((sum, value) => sum + value, 0), 6_000);
        } else {
            assert.ok(prizes.every(value => value === 0 || value === 1_000));
            const oneThousandCount = prizes.filter(value => value === 1_000).length;
            assert.ok(oneThousandCount >= 1 && oneThousandCount <= prizes.length);
            regularWinningCounts.add(oneThousandCount);
        }
    }

    assert.ok(arrangements.size > 20);
    assert.ok(highPrizeGroups > 0);
    assert.deepEqual([...regularWinningCounts].sort((a, b) => a - b), [1, 2, 3, 4, 5]);
});

test('randomized result remains deterministic for audit and idempotency', () => {
    const firstRead = Array.from({ length: 20 }, (_, index) => prizeForSpin(index + 1, undefined, 'customer-a:secret'));
    const retryRead = Array.from({ length: 20 }, (_, index) => prizeForSpin(index + 1, undefined, 'customer-a:secret'));
    const anotherCustomer = Array.from({ length: 20 }, (_, index) => prizeForSpin(index + 1, undefined, 'customer-b:secret'));

    assert.deepEqual(retryRead, firstRead);
    assert.notDeepEqual(anotherCustomer, firstRead);
});

test('custom structures without the 1k/5k policy are still shuffled instead of repeated in fixed order', () => {
    const prizes = [0, 2_000, 5_000];
    const cycle = randomizedPrizeCycle(4, prizes, 'custom-structure');
    assert.deepEqual([...cycle].sort((a, b) => a - b), prizes);
    assert.deepEqual(randomizedPrizeCycle(4, prizes, 'custom-structure'), cycle);

    const extendedPrizes = [0, 1_000, 5_000, 10_000];
    assert.deepEqual(
        [...randomizedPrizeCycle(4, extendedPrizes, 'extended-structure')].sort((a, b) => a - b),
        extendedPrizes,
    );
});

test('existing players begin a fresh randomized group without changing their historical spin count', () => {
    const source = readFileSync(new URL('../src/lib/lucky-wheel.ts', import.meta.url), 'utf8');
    assert.match(source, /regularSpinRandomOffset:[\s\S]*?\$ifNull:[\s\S]*?\$lifetimeSpinsUsed/);
    assert.match(source, /randomizedSequence = sequence - Number\(account\.regularSpinRandomOffset \|\| 0\)/);
    assert.match(source, /updatePipeline: true/);
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

test('withdrawal is only settled by an exact posted ACB debit', () => {
    const target = {
        amount: 100_000,
        beneficiaryAccount: '123456789',
        payoutReference: 'WDABC123',
        transactionId: 'TRACE-9988',
    };
    const transaction = {
        transactionCode: 'TRACE-9988',
        transactionAmount: 100_000,
        transactionDescription: 'Chi thuong WDABC123',
        beneficiaryAccount: '123456789',
        transactionStatus: 'SUCCESS',
        debitOrCredit: 'D',
    };

    assert.equal(matchesWithdrawalTransaction(transaction, target), true);
    assert.equal(matchesWithdrawalTransaction({ ...transaction, debitOrCredit: 'C' }, target), false);
    assert.equal(matchesWithdrawalTransaction({ ...transaction, transactionAmount: 99_000 }, target), false);
    assert.equal(matchesWithdrawalTransaction({ ...transaction, beneficiaryAccount: '000000000' }, target), false);
    assert.equal(matchesWithdrawalTransaction({ ...transaction, transactionDescription: 'Chi thuong khac' }, target), false);
    assert.equal(matchesWithdrawalTransaction({ ...transaction, transactionCode: 'TRACE-OTHER' }, target), false);
});

test('withdrawal requests reserve availability but only deduct the total balance after approval', () => {
    assert.equal(availablePrizeBalance(300_000, 100_000), 200_000);
    assert.equal(withdrawalRequestDecision(50_000, 300_000, 0), 'below_minimum');
    assert.equal(withdrawalRequestDecision(250_000, 300_000, 100_000), 'insufficient_balance');
    assert.equal(withdrawalRequestDecision(200_000, 300_000, 100_000), 'pending');
});

test('withdrawal accounting migration explicitly enables MongoDB update pipelines', () => {
    const source = readFileSync(new URL('../src/lib/lucky-wheel.ts', import.meta.url), 'utf8');
    assert.match(source, /LuckyWheelAccount\.updateMany\([\s\S]*?\{ updatePipeline: true \}\)/);
});

test('customer and admin pages fail closed instead of rendering empty wheel data', () => {
    const customerPage = readFileSync(new URL('../src/app/lucky-wheel/page.tsx', import.meta.url), 'utf8');
    const adminPage = readFileSync(new URL('../src/app/admin/lucky-wheel/page.tsx', import.meta.url), 'utf8');
    assert.match(customerPage, /if \(!data\)[\s\S]*Chưa tải được vòng quay/);
    assert.match(customerPage, /Tải lại dữ liệu/);
    assert.match(adminPage, /if \(!data\)[\s\S]*Không thể tải cấu hình vòng quay/);
    assert.match(adminPage, /Thử tải lại/);
});

test('withdrawal bank selector contains the full bank directory and searches without accents', () => {
    assert.equal(VIETNAM_BANKS.length, 61);
    assert.equal(searchVietnamBanks('ngoai thuong')[0]?.shortName, 'Vietcombank');
    assert.equal(searchVietnamBanks('970416')[0]?.shortName, 'ACB');
    assert.equal(searchVietnamBanks('quan doi')[0]?.shortName, 'MBBank');
    assert.equal(findVietnamBank('TCB')?.shortName, 'Techcombank');
    assert.equal(findVietnamBank('MoMo'), undefined);
});

test('withdrawal form uses an accessible searchable bank combobox', () => {
    const component = readFileSync(new URL('../src/components/payment/BankCombobox.tsx', import.meta.url), 'utf8');
    const customerPage = readFileSync(new URL('../src/app/lucky-wheel/page.tsx', import.meta.url), 'utf8');
    assert.match(component, /role="combobox"/);
    assert.match(component, /aria-autocomplete="list"/);
    assert.match(component, /ArrowDown/);
    assert.match(customerPage, /<BankCombobox/);
});

test('wheel prizes are rendered directly on their segments without fixed cards', () => {
    const customerPage = readFileSync(new URL('../src/app/lucky-wheel/page.tsx', import.meta.url), 'utf8');
    const prizeMarkup = customerPage.slice(
        customerPage.indexOf('data-wheel-prize'),
        customerPage.indexOf('</div>;', customerPage.indexOf('data-wheel-prize')),
    );

    assert.match(prizeMarkup, /labelRotation/);
    assert.match(prizeMarkup, /text-shadow/);
    assert.doesNotMatch(prizeMarkup, /bg-white|rounded-(?:lg|xl)|border-white/);
    assert.match(customerPage, /key={`divider-\$\{segment\.label\}`}/);
});

test('wheel result presentation removes admin notes, uses radial labels and celebrates wins', () => {
    const customerPage = readFileSync(new URL('../src/app/lucky-wheel/page.tsx', import.meta.url), 'utf8');
    const resultCelebration = readFileSync(new URL('../src/components/lucky-wheel/SpinResultCelebration.tsx', import.meta.url), 'utf8');

    assert.doesNotMatch(customerPage, /Chế độ test Admin: quay không giới hạn/);
    assert.doesNotMatch(customerPage, /Admin được quay test không giới hạn/);
    assert.match(customerPage, /const labelRotation = angleDegrees - 90/);
    assert.match(resultCelebration, /won && <div/);
    assert.match(resultCelebration, /data-fireworks-canvas/);
    assert.match(resultCelebration, /window\.requestAnimationFrame\(draw\)/);
    assert.match(resultCelebration, /window\.setInterval\(createBurst, 520\)/);
    assert.match(resultCelebration, /celebration-glow/);
    assert.match(resultCelebration, /animation-iteration-count: 3/);
});
