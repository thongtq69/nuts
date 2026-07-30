export const PRODUCT_CATEGORIES = [
    { value: 'Jars', label: 'Hũ đựng' },
    { value: 'Bags', label: 'Túi đựng' },
    { value: 'Nuts', label: 'Các loại hạt' },
    { value: 'Berries', label: 'Quả mọng' },
    { value: 'Seeds', label: 'Hạt giống' },
    { value: 'Dried Fruits', label: 'Trái cây sấy' },
    { value: 'Snacks', label: 'Đồ ăn vặt' },
] as const;

export function getProductCategoryLabel(value?: string | null) {
    return PRODUCT_CATEGORIES.find(category => category.value === value)?.label;
}
