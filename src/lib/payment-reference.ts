export const BANK_PAYMENT_REF_PATTERN = /^(?:GO|VIP)[A-Z0-9]{6,12}$/i;

const BANK_PAYMENT_REF_IN_TEXT = /(?:^|[^A-Z0-9])((?:GO|VIP)[A-Z0-9]{6,12})(?![A-Z0-9])/i;

export function isBankPaymentRef(value: string): boolean {
    return BANK_PAYMENT_REF_PATTERN.test(value.trim());
}

export function extractBankPaymentRef(description: string): string | null {
    const match = description.match(BANK_PAYMENT_REF_IN_TEXT);
    return match ? match[1].toUpperCase() : null;
}

export function buildMembershipPaymentRef(orderId: string): string {
    return `VIP${orderId.slice(-10).toUpperCase()}`;
}
