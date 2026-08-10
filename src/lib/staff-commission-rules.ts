export interface RevenueOrderInput {
    id?: string;
    orderType?: string;
    status?: string;
    paymentStatus?: string;
    totalAmount?: number;
    shippingFee?: number;
    createdAt?: Date | string;
}

export interface CommissionAllocation<T extends RevenueOrderInput = RevenueOrderInput> {
    order: T;
    eligibleRevenue: number;
    commissionableRevenue: number;
    commissionAmount: number;
}

const EXCLUDED_ORDER_STATUSES = new Set([
    'cancelled',
    'canceled',
    'refunded',
    'returned',
    'failed',
]);

const REVENUE_ORDER_STATUSES = new Set(['completed', 'delivered', 'paid']);
const CONFIRMED_PAYMENT_STATUSES = new Set(['paid', 'completed']);

function normalizedStatus(value: unknown): string {
    return String(value || '').trim().toLowerCase();
}

function nonNegative(value: unknown): number {
    const normalized = Number(value);
    return Number.isFinite(normalized) ? Math.max(0, normalized) : 0;
}

export function isEligibleStaffRevenueOrder(order: RevenueOrderInput): boolean {
    if (normalizedStatus(order.orderType) === 'membership') return false;

    const orderStatus = normalizedStatus(order.status);
    if (EXCLUDED_ORDER_STATUSES.has(orderStatus)) return false;

    const paymentStatus = normalizedStatus(order.paymentStatus);
    return CONFIRMED_PAYMENT_STATUSES.has(paymentStatus)
        || REVENUE_ORDER_STATUSES.has(orderStatus);
}

export function getEligibleProductRevenue(order: RevenueOrderInput): number {
    if (!isEligibleStaffRevenueOrder(order)) return 0;

    // totalAmount is the final amount after product promotions/vouchers and includes
    // shipping. Shipping is explicitly excluded from staff KPI revenue.
    return Math.max(
        0,
        Math.round(nonNegative(order.totalAmount) - nonNegative(order.shippingFee)),
    );
}

export function allocateKpiCommission<T extends RevenueOrderInput>(
    orders: T[],
    kpiTargetInput: number,
    commissionRateInput: number,
): CommissionAllocation<T>[] {
    const kpiTarget = nonNegative(kpiTargetInput);
    const commissionRate = nonNegative(commissionRateInput);
    let cumulativeRevenue = 0;

    return [...orders]
        .sort((left, right) => {
            const leftTime = new Date(left.createdAt || 0).getTime();
            const rightTime = new Date(right.createdAt || 0).getTime();
            return leftTime - rightTime;
        })
        .map((order) => {
            const eligibleRevenue = getEligibleProductRevenue(order);
            const previousExcess = Math.max(cumulativeRevenue - kpiTarget, 0);
            cumulativeRevenue += eligibleRevenue;
            const currentExcess = Math.max(cumulativeRevenue - kpiTarget, 0);
            const commissionableRevenue = Math.max(0, currentExcess - previousExcess);
            const previousCommission = Math.round(previousExcess * (commissionRate / 100));
            const currentCommission = Math.round(currentExcess * (commissionRate / 100));

            return {
                order,
                eligibleRevenue,
                commissionableRevenue,
                commissionAmount: kpiTarget > 0
                    ? Math.max(0, currentCommission - previousCommission)
                    : 0,
            };
        });
}
