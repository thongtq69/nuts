export type LegacyCommissionIntegrity =
    | 'valid'
    | 'missing_affiliate'
    | 'missing_order'
    | 'missing_both';

export type LegacyCommissionStatus = 'pending' | 'approved' | 'rejected' | 'paid';

export function getLegacyCommissionIntegrity(
    hasAffiliate: boolean,
    hasOrder: boolean,
): LegacyCommissionIntegrity {
    if (!hasAffiliate && !hasOrder) return 'missing_both';
    if (!hasAffiliate) return 'missing_affiliate';
    if (!hasOrder) return 'missing_order';
    return 'valid';
}

export function canTransitionLegacyCommission(
    currentStatus: LegacyCommissionStatus,
    nextStatus: LegacyCommissionStatus,
): boolean {
    if (currentStatus === 'pending') {
        return nextStatus === 'approved' || nextStatus === 'rejected';
    }

    return currentStatus === 'approved' && nextStatus === 'paid';
}

export function getLegacyCommissionIntegrityLabel(integrity: LegacyCommissionIntegrity): string {
    switch (integrity) {
        case 'missing_affiliate':
            return 'Thiếu tài khoản nhận hoa hồng';
        case 'missing_order':
            return 'Thiếu đơn hàng';
        case 'missing_both':
            return 'Thiếu tài khoản và đơn hàng';
        default:
            return 'Đủ liên kết';
    }
}
