export interface VoucherDiscountItem {
    unitPrice: number;
    quantity: number;
    vipMaxDiscount?: number;
}

export interface VoucherDiscountInput {
    discountType: 'percent' | 'fixed' | string;
    discountValue: number;
    voucherMaxDiscount?: number;
    items: VoucherDiscountItem[];
    applyProductCaps?: boolean;
}

/**
 * Calculates the discount for a voucher.
 *
 * VIP package vouchers can be capped on each product unit before the
 * package-wide voucher cap is applied. A product cap of 0 means unlimited.
 */
export function calculateVoucherDiscount({
    discountType,
    discountValue,
    voucherMaxDiscount = 0,
    items,
    applyProductCaps = false,
}: VoucherDiscountInput): number {
    const normalizedValue = Math.max(0, Number(discountValue) || 0);
    const orderValue = items.reduce((total, item) => {
        const unitPrice = Math.max(0, Number(item.unitPrice) || 0);
        const quantity = Math.max(0, Math.floor(Number(item.quantity) || 0));
        return total + unitPrice * quantity;
    }, 0);

    let discount = 0;

    if (discountType === 'percent') {
        const percent = Math.min(100, normalizedValue);

        discount = items.reduce((total, item) => {
            const unitPrice = Math.max(0, Number(item.unitPrice) || 0);
            const quantity = Math.max(0, Math.floor(Number(item.quantity) || 0));
            const rawUnitDiscount = unitPrice * (percent / 100);
            const productCap = Math.max(0, Number(item.vipMaxDiscount) || 0);
            const unitDiscount = applyProductCaps && productCap > 0
                ? Math.min(rawUnitDiscount, productCap)
                : rawUnitDiscount;

            return total + unitDiscount * quantity;
        }, 0);
    } else {
        discount = normalizedValue;
    }

    const normalizedVoucherCap = Math.max(0, Number(voucherMaxDiscount) || 0);
    if (normalizedVoucherCap > 0) {
        discount = Math.min(discount, normalizedVoucherCap);
    }

    return Math.round(Math.min(discount, orderValue));
}
