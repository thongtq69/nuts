export interface AffiliateAccountIdentity {
    role?: string | null;
    roleType?: string | null;
    saleType?: string | null;
    affiliateLevel?: string | null;
}

export function isCollaboratorAccount(user: AffiliateAccountIdentity | null | undefined): boolean {
    return Boolean(user && (
        user.roleType === 'collaborator'
        || user.saleType === 'collaborator'
        || user.affiliateLevel === 'collaborator'
    ));
}
