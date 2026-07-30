export function normalizeLinkedMenuName(value: unknown): string {
    return typeof value === 'string'
        ? value.trim().replace(/\s+/g, ' ')
        : '';
}

export function createLinkedMenuSlug(value: string): string {
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}
