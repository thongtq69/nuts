export interface AdminNotificationPreferences {
    recipients: string[];
    notifyNewAccount: boolean;
    notifyNewOrder: boolean;
}

export const DEFAULT_ADMIN_NOTIFICATION_PREFERENCES: AdminNotificationPreferences = {
    recipients: [],
    notifyNewAccount: true,
    notifyNewOrder: true,
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeNotificationEmails(value: unknown): string[] {
    const candidates = Array.isArray(value)
        ? value
        : typeof value === 'string'
            ? value.split(/[\n,;]+/)
            : [];

    return [...new Set(
        candidates
            .map(item => String(item || '').trim().toLowerCase())
            .filter(email => EMAIL_PATTERN.test(email)),
    )].slice(0, 10);
}

export function normalizeAdminNotificationPreferences(
    value: Partial<AdminNotificationPreferences> | null | undefined,
): AdminNotificationPreferences {
    return {
        recipients: normalizeNotificationEmails(value?.recipients),
        notifyNewAccount: value?.notifyNewAccount !== false,
        notifyNewOrder: value?.notifyNewOrder !== false,
    };
}
