import { getMissingEnglishFields } from './localized-content.ts';

export class ProductPayloadError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ProductPayloadError';
    }
}

export function normalizeProductPayload(payload: unknown): Record<string, unknown> {
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
        throw new ProductPayloadError('Dữ liệu sản phẩm không hợp lệ');
    }

    const input = payload as Record<string, unknown>;
    const normalized: Record<string, unknown> = { ...input };
    const isLinkedProduct = input.isLinkedProduct === true;
    const inputTags = Array.isArray(input.tags)
        ? input.tags.filter((tag): tag is string => typeof tag === 'string')
        : [];
    const hasBestSellerSelection = typeof input.showOnHomepageBestSeller === 'boolean' || inputTags.includes('best-seller');
    const hasNewSelection = typeof input.showOnHomepageNew === 'boolean' || inputTags.includes('new');
    const hasPromoSelection = typeof input.showOnHomepagePromo === 'boolean' || inputTags.includes('promo');
    const showOnHomepageBestSeller = !isLinkedProduct && (
        input.showOnHomepageBestSeller === true ||
        (typeof input.showOnHomepageBestSeller !== 'boolean' && inputTags.includes('best-seller'))
    );
    const showOnHomepageNew = !isLinkedProduct && (
        input.showOnHomepageNew === true ||
        (typeof input.showOnHomepageNew !== 'boolean' && inputTags.includes('new'))
    );
    const showOnHomepagePromo = !isLinkedProduct && (
        input.showOnHomepagePromo === true ||
        (typeof input.showOnHomepagePromo !== 'boolean' && inputTags.includes('promo'))
    );
    const linkedCategory = typeof input.linkedCategory === 'string'
        ? input.linkedCategory.trim().replace(/\s+/g, ' ')
        : '';
    const category = typeof input.category === 'string'
        ? input.category.trim().replace(/\s+/g, ' ')
        : '';

    if (isLinkedProduct && !linkedCategory) {
        throw new ProductPayloadError('Sản phẩm liên kết phải có submenu');
    }
    if (isLinkedProduct && !category) {
        throw new ProductPayloadError('Sản phẩm liên kết phải có danh mục');
    }

    const rawVipMaxDiscount = input.vipMaxDiscount ?? 0;
    const vipMaxDiscount = Number(rawVipMaxDiscount);

    if (!Number.isFinite(vipMaxDiscount) || vipMaxDiscount < 0) {
        throw new ProductPayloadError('Giới hạn giảm VIP phải là số tiền không âm');
    }

    normalized.isLinkedProduct = isLinkedProduct;
    normalized.linkedCategory = isLinkedProduct ? linkedCategory : '';
    normalized.category = category;
    if (hasBestSellerSelection) normalized.showOnHomepageBestSeller = showOnHomepageBestSeller;
    else delete normalized.showOnHomepageBestSeller;
    if (hasNewSelection) normalized.showOnHomepageNew = showOnHomepageNew;
    else delete normalized.showOnHomepageNew;
    if (hasPromoSelection) normalized.showOnHomepagePromo = showOnHomepagePromo;
    else delete normalized.showOnHomepagePromo;
    if (isLinkedProduct) normalized.showOnHomepageLinked = true;
    else if (typeof input.showOnHomepageLinked !== 'boolean') delete normalized.showOnHomepageLinked;
    normalized.vipMaxDiscount = Math.round(vipMaxDiscount);

    const homepageTags = new Set(['best-seller', 'new', 'promo']);
    const customTags = inputTags
        .map(tag => tag.trim())
        .filter(tag => tag && !homepageTags.has(tag));
    if (showOnHomepageBestSeller) customTags.push('best-seller');
    if (showOnHomepageNew) customTags.push('new');
    if (showOnHomepagePromo) customTags.push('promo');
    normalized.tags = [...new Set(customTags)];

    const englishTranslation = (input.translations as {
        en?: Record<string, unknown>;
    } | undefined)?.en;
    if (englishTranslation?.isPublished === true) {
        const requiredEnglishFields = ['name'];
        for (const field of ['description', 'shortDescription', 'badgeText'] as const) {
            if (typeof input[field] === 'string' && input[field].trim()) {
                requiredEnglishFields.push(field);
            }
        }
        if (isLinkedProduct) requiredEnglishFields.push('linkedCategory');

        const missingFields = getMissingEnglishFields(
            { translations: { en: englishTranslation } },
            requiredEnglishFields,
        );
        if (missingFields.length > 0) {
            throw new ProductPayloadError(
                `Không thể xuất bản tiếng Anh khi còn thiếu: ${missingFields.join(', ')}`,
            );
        }
    }

    return normalized;
}
