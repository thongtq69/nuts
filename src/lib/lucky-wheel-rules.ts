import { createHmac } from 'node:crypto';

export const LUCKY_WHEEL_PRIZES = [0, 1000, 0, 5000, 0] as const;
export const LUCKY_WHEEL_VISIBLE_PRIZES = [0, 1000, 5000, 10_000, 50_000, 100_000] as const;
export const LUCKY_WHEEL_MINIMUM_TOP_UP = 10_000;
export const LUCKY_WHEEL_SPINS_PER_TOP_UP_UNIT = 5;
export const LUCKY_WHEEL_MILESTONE_TOP_UPS = 1_000_000;
export const LUCKY_WHEEL_MINIMUM_WITHDRAWAL = 100_000;

export function availablePrizeBalance(prizeBalance: number, pendingWithdrawal: number): number {
    return Math.max(0, Math.floor(Number(prizeBalance) || 0) - Math.max(0, Math.floor(Number(pendingWithdrawal) || 0)));
}

export function withdrawalRequestDecision(
    amount: number,
    prizeBalance: number,
    pendingWithdrawal: number,
    minimumWithdrawal = LUCKY_WHEEL_MINIMUM_WITHDRAWAL,
): 'pending' | 'below_minimum' | 'insufficient_balance' {
    if (amount < Math.max(LUCKY_WHEEL_MINIMUM_WITHDRAWAL, minimumWithdrawal)) return 'below_minimum';
    if (amount > availablePrizeBalance(prizeBalance, pendingWithdrawal)) return 'insufficient_balance';
    return 'pending';
}

function deterministicRandomBytes(entropyKey: string, cycle: number, prizes: readonly number[]): Buffer {
    return createHmac('sha256', entropyKey)
        .update(`regular-spin:${cycle}:${prizes.join(',')}`)
        .digest();
}

function shufflePrizeCycle(prizes: number[], randomBytes: Buffer, startByteIndex = 1): number[] {
    const shuffled = [...prizes];
    let byteIndex = Math.max(1, Math.min(startByteIndex, randomBytes.length - 1));
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
        if (byteIndex >= randomBytes.length) byteIndex = 1;
        const swapIndex = randomBytes[byteIndex] % (index + 1);
        [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
        byteIndex += 1;
    }
    return shuffled;
}

export function randomizedPrizeCycle(
    cycle: number,
    prizes: readonly number[] = LUCKY_WHEEL_PRIZES,
    entropyKey = 'gonuts-lucky-wheel',
): number[] {
    if (!Number.isInteger(cycle) || cycle < 0) throw new Error('Invalid spin cycle');
    if (!prizes.length) throw new Error('Prize sequence is empty');

    const normalizedPrizes = prizes.map(value => Math.max(0, Math.floor(Number(value) || 0)));
    const randomBytes = deterministicRandomBytes(entropyKey, cycle, normalizedPrizes);
    const supportsCustomerRule = normalizedPrizes.length >= 3
        && normalizedPrizes.includes(0)
        && normalizedPrizes.includes(1_000)
        && normalizedPrizes.includes(5_000)
        && normalizedPrizes.every(value => value === 0 || value === 1_000 || value === 5_000);

    if (!supportsCustomerRule) return shufflePrizeCycle(normalizedPrizes, randomBytes);

    // The composition changes for every group as well as its order:
    // - A group containing 5,000đ has exactly one 5,000đ, one 1,000đ and only misses.
    // - A group without 5,000đ has a random number of 1,000đ results (including all 1,000đ).
    const containsFiveThousand = (randomBytes[0] & 1) === 0;
    if (containsFiveThousand) {
        return shufflePrizeCycle(
            [5_000, 1_000, ...Array(Math.max(0, normalizedPrizes.length - 2)).fill(0)],
            randomBytes,
        );
    }

    const oneThousandCount = 1 + (randomBytes[1] % normalizedPrizes.length);
    return shufflePrizeCycle(
        [
            ...Array(oneThousandCount).fill(1_000),
            ...Array(normalizedPrizes.length - oneThousandCount).fill(0),
        ],
        randomBytes,
        2,
    );
}

export function prizeForSpin(
    sequence: number,
    prizes: readonly number[] = LUCKY_WHEEL_PRIZES,
    entropyKey = 'gonuts-lucky-wheel',
): number {
    if (!Number.isInteger(sequence) || sequence < 1) throw new Error('Invalid spin sequence');
    if (!prizes.length) throw new Error('Prize sequence is empty');
    const cycle = Math.floor((sequence - 1) / prizes.length);
    const position = (sequence - 1) % prizes.length;
    return randomizedPrizeCycle(cycle, prizes, entropyKey)[position];
}

export function spinsForTopUp(amount: number, minimumTopUp = LUCKY_WHEEL_MINIMUM_TOP_UP, spinsPerUnit = LUCKY_WHEEL_SPINS_PER_TOP_UP_UNIT): number {
    if (!Number.isFinite(amount) || !Number.isFinite(minimumTopUp) || minimumTopUp < 1 || amount < minimumTopUp || amount % minimumTopUp !== 0) return 0;
    return Math.floor(amount / minimumTopUp) * Math.max(1, Math.floor(spinsPerUnit));
}

export function milestonePrizeValues(): number[] {
    return [...Array(10).fill(100_000), ...Array(5).fill(50_000)];
}

export function isCampaignActive(settings: {
    enabled?: boolean;
    campaignStartAt?: Date | string | null;
    campaignEndAt?: Date | string | null;
}, now = new Date()): boolean {
    if (!settings.enabled) return false;
    if (settings.campaignStartAt && new Date(settings.campaignStartAt) > now) return false;
    if (settings.campaignEndAt && new Date(settings.campaignEndAt) < now) return false;
    return true;
}
