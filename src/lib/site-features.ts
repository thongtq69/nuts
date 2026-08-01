export const HOME_FEATURE_ICONS = ['truck', 'refresh', 'shield', 'users'] as const;

export type HomeFeatureIcon = (typeof HOME_FEATURE_ICONS)[number];

export interface HomeFeature {
    text: string;
    icon: HomeFeatureIcon;
    enabled: boolean;
}

export const DEFAULT_HOME_FEATURES: HomeFeature[] = [
    { text: 'Giao hàng miễn phí toàn quốc', icon: 'truck', enabled: true },
    { text: 'Đổi trả trong 7 ngày nếu không hài lòng', icon: 'refresh', enabled: true },
    { text: '100% Sạch, Sản phẩm dinh dưỡng', icon: 'shield', enabled: true },
    { text: 'Cung cấp bởi 5000+ nông dân', icon: 'users', enabled: true },
];

export function normalizeHomeFeatures(value: unknown): HomeFeature[] {
    if (!Array.isArray(value)) {
        return DEFAULT_HOME_FEATURES.map(feature => ({ ...feature }));
    }

    return DEFAULT_HOME_FEATURES.map((fallback, index) => {
        const candidate = value[index];
        if (!candidate || typeof candidate !== 'object') return { ...fallback };

        const feature = candidate as Partial<HomeFeature>;
        const text = typeof feature.text === 'string' && feature.text.trim()
            ? feature.text.trim()
            : fallback.text;
        const icon = HOME_FEATURE_ICONS.includes(feature.icon as HomeFeatureIcon)
            ? feature.icon as HomeFeatureIcon
            : fallback.icon;

        return {
            text,
            icon,
            enabled: typeof feature.enabled === 'boolean' ? feature.enabled : fallback.enabled,
        };
    });
}
