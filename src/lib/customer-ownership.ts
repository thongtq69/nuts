export function buildManagedCustomerQuery(
    staffId: string,
    collaboratorIds: string[] = [],
) {
    const referrerIds = [staffId, ...collaboratorIds];

    return {
        role: 'user',
        affiliateLevel: { $ne: 'collaborator' },
        $or: [
            // A manual Admin assignment always wins over every legacy or
            // referral-derived relationship.
            { assignedStaff: staffId },
            {
                assignedStaff: null,
                'commissionSettings.managerId': staffId,
            },
            {
                assignedStaff: null,
                'commissionSettings.managerId': null,
                parentStaff: staffId,
            },
            {
                assignedStaff: null,
                'commissionSettings.managerId': null,
                parentStaff: null,
                referrer: { $in: referrerIds },
            },
        ],
    };
}

export function buildManagedOrderQuery(
    staffId: string,
    collaboratorIds: string[] = [],
    customerIds: string[] = [],
) {
    const referrerIds = [staffId, ...collaboratorIds];
    const relationships: Record<string, unknown>[] = [];

    if (customerIds.length > 0) {
        relationships.push(
            { user: { $in: customerIds } },
            // Some legacy orders used userId before the Order schema standardized on user.
            { userId: { $in: customerIds } },
        );
    }

    // Referral access is retained for guest orders. Registered customers are
    // scoped by the customer assignment above so an old referrer cannot keep
    // viewing a customer after Admin assigns that customer to another staff.
    relationships.push({
        user: null,
        userId: null,
        referrer: { $in: referrerIds },
    });

    return { $or: relationships };
}

export function isConfirmedPaymentStatus(status: unknown): boolean {
    return ['paid', 'completed'].includes(String(status || '').trim().toLowerCase());
}

export function buildMembershipVoucherCode(orderId: string, index: number): string {
    const orderPart = orderId.replace(/[^a-z0-9]/gi, '').slice(-8).toUpperCase();
    return `VIP${orderPart}${String(index + 1).padStart(2, '0')}`;
}
