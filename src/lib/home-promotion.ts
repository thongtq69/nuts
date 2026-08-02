export const DEFAULT_HOME_PROMOTION_TEXT =
    '🎉 Miễn phí vận chuyển cho đơn hàng trên 500.000₫ | Giảm 10% cho khách hàng mới';

export function normalizeHomePromotionText(value: unknown): string {
    if (typeof value !== 'string') return DEFAULT_HOME_PROMOTION_TEXT;
    return value.trim().slice(0, 300);
}
