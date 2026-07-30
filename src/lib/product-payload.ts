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
    const linkedCategory = typeof input.linkedCategory === 'string'
        ? input.linkedCategory.trim().replace(/\s+/g, ' ')
        : '';

    if (isLinkedProduct && !linkedCategory) {
        throw new ProductPayloadError('Sản phẩm liên kết phải có submenu');
    }

    const rawVipMaxDiscount = input.vipMaxDiscount ?? 0;
    const vipMaxDiscount = Number(rawVipMaxDiscount);

    if (!Number.isFinite(vipMaxDiscount) || vipMaxDiscount < 0) {
        throw new ProductPayloadError('Giới hạn giảm VIP phải là số tiền không âm');
    }

    normalized.isLinkedProduct = isLinkedProduct;
    normalized.linkedCategory = isLinkedProduct ? linkedCategory : '';
    normalized.vipMaxDiscount = Math.round(vipMaxDiscount);

    return normalized;
}
