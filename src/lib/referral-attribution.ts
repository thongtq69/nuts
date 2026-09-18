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

type ReferrerAccount = {
    _id?: unknown;
    role?: string | null;
    roleType?: string | null;
    saleType?: string | null;
    affiliateLevel?: string | null;
    parentStaff?: unknown;
};

/**
 * Resolve who owns a new registration in the staff/agent hierarchy.
 *
 * A collaborator applying through an agent's referral link must belong to that
 * agent directly. Previously the agent's own parentStaff was copied instead,
 * which made the application disappear from the agent collaborator screen.
 */
export function resolveRegistrationManagerId(
    referrer: ReferrerAccount,
    registerAs?: string | null,
): unknown {
    const isCollaborator = referrer.roleType === 'collaborator'
        || referrer.saleType === 'collaborator'
        || referrer.affiliateLevel === 'collaborator';
    const isAgent = referrer.role === 'sale' && !isCollaborator;

    if (registerAs === 'collaborator' && isAgent) return referrer._id;
    if (referrer.role === 'staff' || referrer.affiliateLevel === 'staff') return referrer._id;
    return referrer.parentStaff;
}
