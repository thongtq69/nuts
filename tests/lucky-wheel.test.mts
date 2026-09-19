import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
    availablePrizeBalance,
    isCampaignActive,
    milestonePrizeValues,
    prizeForSpin,
    spinsForTopUp,
    withdrawalRequestDecision,
} from '../src/lib/lucky-wheel-rules.ts';
import { matchesWithdrawalTransaction } from '../src/lib/lucky-wheel-withdrawal-rules.ts';
import { findVietnamBank, searchVietnamBanks, VIETNAM_BANKS } from '../src/lib/vietnam-banks.ts';

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
