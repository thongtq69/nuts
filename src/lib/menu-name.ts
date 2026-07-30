export function normalizeMenuName(value: unknown) {
    return String(value || '').trim().replace(/\s+/g, ' ');
}

export function createMenuSlug(value: unknown) {
    return normalizeMenuName(value)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'submenu';
}
