const DEFAULT_PRODUCT_CATEGORIES = [
    { value: 'Jars', label: 'Hũ đựng' },
    { value: 'Bags', label: 'Túi đựng' },
    { value: 'Nuts', label: 'Các loại hạt' },
    { value: 'Berries', label: 'Quả mọng' },
    { value: 'Seeds', label: 'Hạt giống' },
    { value: 'Dried Fruits', label: 'Trái cây sấy' },
    { value: 'Snacks', label: 'Đồ ăn vặt' },
] as const;

function getEnglishAlphabetKey(value: string) {
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .toLocaleLowerCase('en');
}

export function sortProductCategoriesAlphabetically<T extends { label: string }>(
    categories: readonly T[],
): T[] {
    return [...categories].sort((first, second) => {
        const alphabetOrder = getEnglishAlphabetKey(first.label)
            .localeCompare(getEnglishAlphabetKey(second.label), 'en');

        return alphabetOrder || first.label.localeCompare(second.label, 'vi');
    });
}

export const PRODUCT_CATEGORIES = sortProductCategoriesAlphabetically(
    DEFAULT_PRODUCT_CATEGORIES,
);

export function getProductCategoryLabel(value?: string | null) {
    return PRODUCT_CATEGORIES.find(category => category.value === value)?.label;
}
