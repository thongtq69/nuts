export const HOMEPAGE_SECTION_CONFIG = {
    bestSeller: {
        label: 'Sản phẩm bán chạy',
        field: 'showOnHomepageBestSeller',
        legacyTag: 'best-seller',
        limit: 8,
        linkedOnly: false,
    },
    new: {
        label: 'Sản phẩm mới',
        field: 'showOnHomepageNew',
        legacyTag: 'new',
        limit: 8,
        linkedOnly: false,
    },
    promo: {
        label: 'Khuyến mãi',
        field: 'showOnHomepagePromo',
        legacyTag: 'promo',
        limit: 8,
        linkedOnly: false,
    },
    linked: {
        label: 'Sản phẩm liên kết',
        field: 'showOnHomepageLinked',
        legacyTag: null,
        limit: 6,
        linkedOnly: true,
    },
} as const;

export type HomepageSection = keyof typeof HOMEPAGE_SECTION_CONFIG;
export type HomepageSelectionField = typeof HOMEPAGE_SECTION_CONFIG[HomepageSection]['field'];

export class HomepageSelectionError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'HomepageSelectionError';
    }
}

export function isHomepageSection(value: unknown): value is HomepageSection {
    return typeof value === 'string' && value in HOMEPAGE_SECTION_CONFIG;
}

export function normalizeHomepageSelection(
    section: unknown,
    productIds: unknown,
): { section: HomepageSection; productIds: string[] } {
    if (!isHomepageSection(section)) {
        throw new HomepageSelectionError('Nhóm sản phẩm trang chủ không hợp lệ');
    }

    if (!Array.isArray(productIds)) {
        throw new HomepageSelectionError('Danh sách sản phẩm không hợp lệ');
    }

    const normalizedIds = [...new Set(productIds.map(id => String(id).trim()).filter(Boolean))];
    const config = HOMEPAGE_SECTION_CONFIG[section];

    if (normalizedIds.length > config.limit) {
        throw new HomepageSelectionError(
            `${config.label} chỉ được chọn tối đa ${config.limit} sản phẩm trên trang chủ`,
        );
    }

    return { section, productIds: normalizedIds };
}
