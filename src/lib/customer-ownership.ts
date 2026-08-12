export function buildManagedCustomerQuery(
    staffId: string,
    collaboratorIds: string[] = [],
) {
    const referrerIds = [staffId, ...collaboratorIds];

    return {
        role: 'user',
        affiliateLevel: { $ne: 'collaborator' },
        $or: [
            { parentStaff: staffId },
            { 'commissionSettings.managerId': staffId },
            { referrer: { $in: referrerIds } },
        ],
    };
}

export function buildManagedOrderQuery(
    staffId: string,
    collaboratorIds: string[] = [],
    customerIds: string[] = [],
) {
    const referrerIds = [staffId, ...collaboratorIds];
    const relationships: Record<string, unknown>[] = [
        { referrer: { $in: referrerIds } },
    ];

    if (customerIds.length > 0) {
        relationships.push(
            { user: { $in: customerIds } },
            // Some legacy orders used userId before the Order schema standardized on user.
            { userId: { $in: customerIds } },
        );
    }

    return { $or: relationships };
}

export function isConfirmedPaymentStatus(status: unknown): boolean {
    return ['paid', 'completed'].includes(String(status || '').trim().toLowerCase());
}

export function buildMembershipVoucherCode(orderId: string, index: number): string {
    const orderPart = orderId.replace(/[^a-z0-9]/gi, '').slice(-8).toUpperCase();
    return `VIP${orderPart}${String(index + 1).padStart(2, '0')}`;
}
