export const LUCKY_WHEEL_HISTORY_RESET_MS = 60 * 60 * 1_000;

export function luckyWheelHistoryWindowStart(now = new Date()) {
    const start = new Date(now);
    start.setMinutes(0, 0, 0);
    return start;
}

export function millisecondsUntilNextLuckyWheelHistoryReset(now = new Date()) {
    const nextReset = luckyWheelHistoryWindowStart(now).getTime() + LUCKY_WHEEL_HISTORY_RESET_MS;
    return Math.max(1_000, nextReset - now.getTime() + 250);
}

export function isInCurrentLuckyWheelHistoryWindow(createdAt: string | Date | undefined, now = new Date()) {
    if (!createdAt) return false;
    const timestamp = new Date(createdAt).getTime();
    return Number.isFinite(timestamp) && timestamp >= luckyWheelHistoryWindowStart(now).getTime();
}
