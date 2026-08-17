export interface MembershipVoucherConfig {
    discountType: 'percent' | 'fixed';
    discountValue: number;
    maxDiscount?: number;
    minOrderValue?: number;
    quantity?: number;
}

export interface MembershipVoucherPackage {
    discountType: 'percent' | 'fixed';
    discountValue: number;
    maxDiscount?: number;
    minOrderValue?: number;
    voucherQuantity?: number;
    isUnlimitedVoucher?: boolean;
    vouchers?: MembershipVoucherConfig[];
}

export interface MembershipVoucherIssuance extends MembershipVoucherConfig {
    sourceIndex: number;
    isUnlimited: boolean;
}

const MAX_FINITE_VOUCHERS = 10_000;

function positiveInteger(value: unknown, fallback = 0): number {
    const number = Number(value);
    if (!Number.isFinite(number) || number <= 0) return fallback;
    return Math.floor(number);
}

/** Stores an unlimited package without the old 1,000,000-record placeholder. */
export function normalizeUnlimitedVoucherPackage<T extends MembershipVoucherPackage>(pkg: T): T {
    if (!pkg.isUnlimitedVoucher) return pkg;

    const vouchers = Array.isArray(pkg.vouchers) && pkg.vouchers.length > 0
        ? pkg.vouchers.map(voucher => ({ ...voucher, quantity: 1 }))
        : undefined;

    return {
        ...pkg,
        voucherQuantity: vouchers?.length || 1,
        ...(vouchers ? { vouchers } : {}),
    };
}

/**
 * Expands the package configuration into the voucher records that must exist.
 * An unlimited package receives one reusable code per configured voucher type;
 * it must never materialize a placeholder quantity such as 1,000,000 records.
 */
export function buildMembershipVoucherIssuance(
    pkg: MembershipVoucherPackage,
): MembershipVoucherIssuance[] {
    const configured = Array.isArray(pkg.vouchers) && pkg.vouchers.length > 0
        ? pkg.vouchers
        : [{
            discountType: pkg.discountType,
            discountValue: pkg.discountValue,
            maxDiscount: pkg.maxDiscount || 0,
            minOrderValue: pkg.minOrderValue || 0,
            quantity: pkg.voucherQuantity || 0,
        }];

    const issuance: MembershipVoucherIssuance[] = [];
    const unlimited = Boolean(pkg.isUnlimitedVoucher);

    for (const config of configured) {
        const quantity = unlimited ? 1 : positiveInteger(config.quantity, 0);
        for (let index = 0; index < quantity; index += 1) {
            if (issuance.length >= MAX_FINITE_VOUCHERS) {
                throw new Error(`Số voucher của gói vượt giới hạn an toàn ${MAX_FINITE_VOUCHERS} mã.`);
            }
            issuance.push({
                discountType: config.discountType,
                discountValue: Number(config.discountValue) || 0,
                maxDiscount: Number(config.maxDiscount) || 0,
                minOrderValue: Number(config.minOrderValue) || 0,
                sourceIndex: issuance.length,
                isUnlimited: unlimited,
            });
        }
    }

    return issuance;
}
