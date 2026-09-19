export const LUCKY_WHEEL_PRIZES = [0, 1000, 0, 5000, 0] as const;
export const LUCKY_WHEEL_VISIBLE_PRIZES = [0, 1000, 5000, 10_000, 50_000, 100_000] as const;
export const LUCKY_WHEEL_MINIMUM_TOP_UP = 10_000;
export const LUCKY_WHEEL_SPINS_PER_TOP_UP_UNIT = 5;
export const LUCKY_WHEEL_MILESTONE_TOP_UPS = 1_000_000;
export const LUCKY_WHEEL_MINIMUM_WITHDRAWAL = 100_000;

export function prizeForSpin(sequence: number, prizes: readonly number[] = LUCKY_WHEEL_PRIZES): number {
    if (!Number.isInteger(sequence) || sequence < 1) throw new Error('Invalid spin sequence');
    if (!prizes.length) throw new Error('Prize sequence is empty');
    const position = (sequence - 1) % prizes.length;
    return Number(prizes[position]) || 0;
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
