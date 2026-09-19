import { createHmac } from 'node:crypto';

export const LUCKY_WHEEL_PRIZES = [0, 1000, 0, 5000, 0] as const;
export const LUCKY_WHEEL_SPINS_PER_ORDER = 5;
export const LUCKY_WHEEL_MINIMUM_ORDER = 10_000;
export const LUCKY_WHEEL_MILESTONE_REVENUE = 1_000_000_000;

export function prizeForSpin(userId: string, sequence: number, secret: string): number {
    if (!Number.isInteger(sequence) || sequence < 1) throw new Error('Invalid spin sequence');
    const cycle = Math.floor((sequence - 1) / LUCKY_WHEEL_SPINS_PER_ORDER);
    const position = (sequence - 1) % LUCKY_WHEEL_SPINS_PER_ORDER;
    const values = [...LUCKY_WHEEL_PRIZES];
    const digest = createHmac('sha256', secret).update(`${userId}:${cycle}`).digest();

    for (let index = values.length - 1; index > 0; index -= 1) {
        const swapIndex = digest[index] % (index + 1);
        [values[index], values[swapIndex]] = [values[swapIndex], values[index]];
    }
    return values[position];
}

export function voucherMinimumOrder(prize: number): number {
    if (prize >= 100_000) return 1_000_000;
    if (prize >= 50_000) return 500_000;
    if (prize >= 5_000) return 100_000;
    return 50_000;
}

export function milestonePrizeValues(): number[] {
    return [...Array(10).fill(100_000), ...Array(5).fill(50_000)];
}

export function isCampaignActive(settings: {
    enabled?: boolean;
    legalApprovalReference?: string;
    campaignStartAt?: Date | string | null;
    campaignEndAt?: Date | string | null;
}, now = new Date()): boolean {
    if (!settings.enabled || !settings.legalApprovalReference?.trim()) return false;
    if (settings.campaignStartAt && new Date(settings.campaignStartAt) > now) return false;
    if (settings.campaignEndAt && new Date(settings.campaignEndAt) < now) return false;
    return true;
}
