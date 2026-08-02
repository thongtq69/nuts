export interface VipSavingsOrderInput {
    items?: Array<{ price?: number; quantity?: number }>;
    shippingFee?: number;
    totalAmount?: number;
}

export function calculateLegacyVipSavings(order: VipSavingsOrderInput): number {
    const itemsTotal = Array.isArray(order.items)
        ? order.items.reduce((total, item) => (
            total + Math.max(0, Number(item.price) || 0) * Math.max(0, Number(item.quantity) || 0)
        ), 0)
        : 0;
    const beforeVoucher = itemsTotal + Math.max(0, Number(order.shippingFee) || 0);
    return Math.max(0, Math.round(beforeVoucher - Math.max(0, Number(order.totalAmount) || 0)));
}
