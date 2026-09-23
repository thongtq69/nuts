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
import { findVietnamBank, searchVietnamBanks, VIETNAM_BANKS } from '../src/lib/vietnam-banks.ts';
import { DEFAULT_WHEEL_COPY } from '../src/lib/lucky-wheel-config.ts';
import {
    isInCurrentLuckyWheelHistoryWindow,
    luckyWheelHistoryWindowStart,
    millisecondsUntilNextLuckyWheelHistoryReset,
} from '../src/lib/lucky-wheel-history.ts';
import { matchesMemberSearch, normalizeMemberSearch } from '../src/lib/member-search.ts';

test('gift wheel title uses GO NUTS and stays on one line for the default campaign', () => {
    const customerPage = readFileSync(new URL('../src/app/lucky-wheel/page.tsx', import.meta.url), 'utf8');
    const wheelService = readFileSync(new URL('../src/lib/lucky-wheel.ts', import.meta.url), 'utf8');

    assert.equal(DEFAULT_WHEEL_COPY.campaignName, 'Bánh xe quà tặng GO NUTS');
    assert.match(customerPage, /whitespace-nowrap text-\[clamp\(1rem,4vw,3\.4rem\)\]/);
    assert.match(customerPage, /Vòng quay may mắn GO NUTS/);
    assert.match(wheelService, /settings\.campaignName === 'Vòng quay may mắn Go Nuts'/);
    assert.match(wheelService, /settings\.campaignName = DEFAULT_WHEEL_COPY\.campaignName/);
});

test('customer histories reset hourly while admin histories remain complete', () => {
    const now = new Date('2026-09-22T16:34:39.000+07:00');
    assert.equal(luckyWheelHistoryWindowStart(now).toISOString(), '2026-09-22T09:00:00.000Z');
    assert.equal(millisecondsUntilNextLuckyWheelHistoryReset(now), 1_521_250);
    assert.equal(isInCurrentLuckyWheelHistoryWindow('2026-09-22T16:00:00.000+07:00', now), true);
    assert.equal(isInCurrentLuckyWheelHistoryWindow('2026-09-22T15:59:59.999+07:00', now), false);

    const service = readFileSync(new URL('../src/lib/lucky-wheel.ts', import.meta.url), 'utf8');
    const customerPage = readFileSync(new URL('../src/app/lucky-wheel/page.tsx', import.meta.url), 'utf8');
    assert.match(service, /const activityFilter = adminTestMode/);
    assert.match(service, /\? \{ userId \}/);
    assert.match(service, /: \{ userId, createdAt: \{ \$gte: historyWindowStart \} \}/);
    assert.match(service, /historyWindowStart: adminTestMode \? null : historyWindowStart/);
    assert.match(customerPage, /millisecondsUntilNextLuckyWheelHistoryReset/);
    assert.match(customerPage, /if \(user\?\.role === 'admin'\) return/);
    assert.match(customerPage, /data\?\.campaign\.adminTestMode \|\| isInCurrentLuckyWheelHistoryWindow/);
    assert.match(customerPage, /setMoneyTab\('top-up'\)/);
    assert.match(customerPage, /setMoneyTab\('withdrawal'\)/);
    assert.match(customerPage, /Tự làm mới mỗi giờ/);
    assert.match(customerPage, /Lưu đầy đủ cho Admin/);
    assert.match(customerPage, /Hiển thị toàn bộ lịch sử/);
    assert.doesNotMatch(customerPage, /Chưa có lượt chơi trong giờ này/);

    const adminSummary = service.split('export async function getLuckyWheelAdminSummary()')[1];
    assert.ok(adminSummary);
    assert.doesNotMatch(adminSummary, /historyWindowStart/);
    assert.doesNotMatch(adminSummary, /\.limit\(/);
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

test('withdrawals use complete bank details and an atomic manual Admin approval', () => {
    const service = readFileSync(new URL('../src/lib/lucky-wheel.ts', import.meta.url), 'utf8');
    const customerApi = readFileSync(new URL('../src/app/api/lucky-wheel/withdraw/route.ts', import.meta.url), 'utf8');
    const adminApi = readFileSync(new URL('../src/app/api/admin/lucky-wheel/route.ts', import.meta.url), 'utf8');
    const customerPage = readFileSync(new URL('../src/app/lucky-wheel/page.tsx', import.meta.url), 'utf8');
    const adminPage = readFileSync(new URL('../src/app/admin/lucky-wheel/page.tsx', import.meta.url), 'utf8');
    const model = readFileSync(new URL('../src/models/LuckyWheelWithdrawal.ts', import.meta.url), 'utf8');

    for (const field of ['accountName', 'accountNumber', 'bankName', 'payoutReference']) {
        assert.match(model, new RegExp(field));
    }
    assert.match(customerPage, /Họ tên chủ tài khoản/);
    assert.match(customerPage, /Số tài khoản/);
    assert.match(customerPage, /<BankCombobox/);
    assert.match(customerPage, /Nội dung đối chiếu sẽ được hệ thống tự tạo/);
    assert.match(customerApi, /Nội dung đối chiếu: \$\{withdrawal\.payoutReference\}/);
    assert.match(service, /rejectionCode: 'BELOW_MINIMUM'/);
    assert.match(service, /rejectionCode: 'INSUFFICIENT_BALANCE'/);
    assert.ok(service.indexOf("rejectionCode: 'BELOW_MINIMUM'") < service.indexOf("amount % 1_000 !== 0"));
    assert.match(service, /export async function approveLuckyWheelWithdrawal/);
    assert.match(service, /status: 'paid'/);
    assert.match(service, /prizeBalance: -withdrawal\.amount, pendingWithdrawal: -withdrawal\.amount, lifetimeWithdrawn: withdrawal\.amount/);
    assert.match(adminApi, /action === 'withdrawal-approved'/);
    assert.match(adminApi, /minimumWithdrawal < LUCKY_WHEEL_MINIMUM_WITHDRAWAL/);
    assert.match(adminPage, /Duyệt thủ công/);
    assert.match(adminPage, /Nội dung đối chiếu do hệ thống tạo/);
    assert.doesNotMatch(adminPage, /Mã giao dịch ACB|Xác minh ACB/);
    assert.doesNotMatch(service, /verifyWithdrawalInAcbHistory/);
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

    assert.match(prizeMarkup, /rotate\(\$\{labelRotation\}deg\)/);
    assert.doesNotMatch(prizeMarkup, /readableLabelRotation|labelRotation \+ 180/);
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
    assert.doesNotMatch(customerPage, /const readableLabelRotation/);
    assert.match(resultCelebration, /won && <div/);
    assert.match(resultCelebration, /data-fireworks-canvas/);
    assert.match(resultCelebration, /window\.requestAnimationFrame\(draw\)/);
    assert.match(resultCelebration, /const burstSchedule = \[0, 420, 940, 1_520\]/);
    assert.match(resultCelebration, /const ratio = 1/);
    assert.match(resultCelebration, /width < 640 \? 10 : 14/);
    assert.doesNotMatch(resultCelebration, /setInterval/);
    assert.doesNotMatch(resultCelebration, /backdrop-blur/);
    assert.match(resultCelebration, /celebration-glow/);
    assert.match(resultCelebration, /animation-iteration-count: 1/);
});

test('long lucky wheel and voucher lists are revealed incrementally', () => {
    const customerWheel = readFileSync(new URL('../src/app/lucky-wheel/page.tsx', import.meta.url), 'utf8');
    const adminWheel = readFileSync(new URL('../src/app/admin/lucky-wheel/page.tsx', import.meta.url), 'utf8');
    const account = readFileSync(new URL('../src/app/account/page.tsx', import.meta.url), 'utf8');
    const controls = readFileSync(new URL('../src/components/common/ProgressiveListControls.tsx', import.meta.url), 'utf8');

    assert.match(controls, /Xem thêm/);
    assert.match(controls, /Thu gọn/);
    assert.match(customerWheel, /visibleMoneyHistory/);
    assert.match(adminWheel, /visibleMemberAccounts/);
    assert.match(adminWheel, /visibleWithdrawals/);
    assert.match(account, /group\.vouchers\.slice\(0, visibleVoucherCount\)/);
});

test('admin wheel lists have live name and email search with separate money history tabs', () => {
    assert.equal(normalizeMemberSearch('  Trần Văn An  '), 'tran van an');
    assert.equal(matchesMemberSearch({ name: 'Trần Văn An', email: 'eostradingvn@gmail.com' }, 'van an'), true);
    assert.equal(matchesMemberSearch({ name: 'Trần Văn An', email: 'eostradingvn@gmail.com' }, 'eostra'), true);
    assert.equal(matchesMemberSearch({ name: 'Trần Văn An', email: 'eostradingvn@gmail.com' }, 'khong co'), false);

    const adminWheel = readFileSync(new URL('../src/app/admin/lucky-wheel/page.tsx', import.meta.url), 'utf8');
    assert.match(adminWheel, /moneyHistoryTab/);
    assert.match(adminWheel, /Nạp tiền \(\{data\.recentTopUps\.length\}\)/);
    assert.match(adminWheel, /Rút tiền \(\{data\.withdrawals\.length\}\)/);
    assert.match(adminWheel, /filteredMemberAccounts/);
    assert.match(adminWheel, /filteredWithdrawals/);
    assert.match(adminWheel, /filteredMoneyHistory/);
    assert.match(adminWheel, /filteredSpins/);
    assert.equal((adminWheel.match(/<MemberSearchField/g) || []).length, 4);
});

test('admin mobile lists avoid horizontal scrolling and floating wheel does not cover pagination', () => {
    const usersPage = readFileSync(new URL('../src/app/admin/users/page.tsx', import.meta.url), 'utf8');
    const floatingWheel = readFileSync(new URL('../src/components/lucky-wheel/LuckyWheelFloatingButton.tsx', import.meta.url), 'utf8');
    const customerWheel = readFileSync(new URL('../src/app/lucky-wheel/page.tsx', import.meta.url), 'utf8');

    assert.match(usersPage, /<select value=\{filter\}/);
    assert.match(usersPage, /key={`mobile-\$\{user\._id\}`}/);
    assert.match(usersPage, /hidden lg:block/);
    assert.match(floatingWheel, /pathname\.startsWith\('\/admin'\)/);
    assert.match(customerWheel, /toneWheelColor\(segment\.color\)/);
    assert.match(customerWheel, /rotate\(\$\{labelRotation\}deg\)/);
});

test('gift wheel keeps the legacy deployment background and wheel color treatment', () => {
    const customerWheel = readFileSync(new URL('../src/app/lucky-wheel/page.tsx', import.meta.url), 'utf8');
    const decorations = readFileSync(new URL('../src/components/lucky-wheel/PlayfulWheelDecorations.tsx', import.meta.url), 'utf8');

    assert.match(customerWheel, /min-h-screen overflow-x-hidden bg-\[#fffaf0\]/);
    assert.match(customerWheel, /h-80 bg-\[radial-gradient\(circle_at_50%_0%,rgba\(235,191,91,\.3\),transparent_70%\)\]/);
    assert.match(customerWheel, /-right-28 top-80 h-80 w-80 rounded-full bg-emerald-100\/45 blur-3xl/);
    assert.doesNotMatch(customerWheel, /<PlayfulWheelBackdrop\/>|bg-sky-200\/35/);
    assert.match(customerWheel, /bg-\[linear-gradient\(145deg,#24282b,#15181a\)\]/);
    assert.match(customerWheel, /bg-\[#765d47\]/);
    assert.match(customerWheel, /border-\[#e7dcc9\] bg-\[linear-gradient\(145deg,#5c493a,#2c2926\)\]/);
    assert.match(customerWheel, /<PlayfulJoyBanner\/>/);
    assert.match(customerWheel, /<CupcakeIllustration/);
    assert.match(decorations, /AcornFriendIllustration/);
    assert.match(customerWheel, /<CookieFriendIllustration/);
    assert.match(customerWheel, /<RainbowCloudIllustration/);
    assert.match(decorations, /data-playful-illustrations/);
    assert.match(decorations, /Bánh nhỏ xinh · Niềm vui thật trong veo/);
    assert.doesNotMatch(decorations, /<img|https?:\/\//);
});
