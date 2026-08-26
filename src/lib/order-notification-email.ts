const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeOrderEmail(value: unknown): string {
    return typeof value === 'string' ? value.trim() : '';
}

export function isValidOptionalOrderEmail(value: unknown): boolean {
    const email = normalizeOrderEmail(value);
    return email === '' || EMAIL_PATTERN.test(email);
}

export function resolveOrderNotificationEmail(
    shippingEmail: unknown,
    accountEmail: unknown,
): string | undefined {
    const submittedEmail = normalizeOrderEmail(shippingEmail);
    if (submittedEmail) return submittedEmail;

    const loginEmail = normalizeOrderEmail(accountEmail);
    return loginEmail || undefined;
}
