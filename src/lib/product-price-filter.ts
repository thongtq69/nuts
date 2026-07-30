export const PRODUCT_PRICE_RANGES = [
    { value: 'under-100k', label: 'Dưới 100k' },
    { value: '100k-300k', label: '100k - 300k' },
    { value: '300k-500k', label: '300k - 500k' },
    { value: 'over-500k', label: 'Trên 500k' },
] as const;

export type ProductPriceRange = (typeof PRODUCT_PRICE_RANGES)[number]['value'];

export function isProductPriceInRanges(
    price: number,
    selectedRanges: readonly ProductPriceRange[],
): boolean {
    if (selectedRanges.length === 0) return true;

    return selectedRanges.some(range => {
        switch (range) {
            case 'under-100k':
                return price < 100_000;
            case '100k-300k':
                return price >= 100_000 && price < 300_000;
            case '300k-500k':
                return price >= 300_000 && price <= 500_000;
            case 'over-500k':
                return price > 500_000;
            default:
                return false;
        }
    });
}
