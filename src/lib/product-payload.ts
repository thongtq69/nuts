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
    const linkedMenuCategoryId = String(input.linkedMenuCategoryId || '').trim();
    const linkedMenuSubmenuId = String(input.linkedMenuSubmenuId || '').trim();

    if (isLinkedProduct && (!linkedMenuCategoryId || !linkedMenuSubmenuId)) {
        throw new ProductPayloadError('Sản phẩm liên kết phải chọn đầy đủ danh mục và submenu');
    }

    const rawVipMaxDiscount = input.vipMaxDiscount ?? 0;
    const vipMaxDiscount = Number(rawVipMaxDiscount);

    if (!Number.isFinite(vipMaxDiscount) || vipMaxDiscount < 0) {
        throw new ProductPayloadError('Giới hạn giảm VIP phải là số tiền không âm');
    }

    normalized.isLinkedProduct = isLinkedProduct;
    normalized.linkedMenuCategoryId = isLinkedProduct ? linkedMenuCategoryId : undefined;
    normalized.linkedMenuSubmenuId = isLinkedProduct ? linkedMenuSubmenuId : undefined;
    normalized.linkedMenuCategory = isLinkedProduct ? normalized.linkedMenuCategory : '';
    normalized.linkedCategory = isLinkedProduct ? normalized.linkedCategory : '';
    normalized.vipMaxDiscount = Math.round(vipMaxDiscount);

    return normalized;
}
