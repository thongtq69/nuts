const REFERRAL_CODE_PATTERN = /^[A-Z0-9_-]{2,64}$/;

export function normalizeReferralCode(value?: string | null): string {
    if (typeof value !== 'string') return '';
    const normalized = value.trim().toUpperCase();
    return REFERRAL_CODE_PATTERN.test(normalized) ? normalized : '';
}

export function addReferralToPath(path: string, referralCode?: string | null): string {
    const normalized = normalizeReferralCode(referralCode);
    if (!normalized) return path;

    const url = new URL(path, 'https://gonuts.vn');
    url.searchParams.set('ref', normalized);
    return `${url.pathname}${url.search}${url.hash}`;
}
