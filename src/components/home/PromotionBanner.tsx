'use client';

import { useSettings } from '@/context/SettingsContext';
import { DEFAULT_HOME_PROMOTION_TEXT } from '@/lib/home-promotion';

export default function PromotionBanner() {
    const { settings } = useSettings();
    const text = settings?.homePromotionText ?? DEFAULT_HOME_PROMOTION_TEXT;
    const enabled = settings?.homePromotionEnabled ?? true;

    if (!enabled || !text.trim()) return null;

    return (
        <section className="promotion-banner">
            <div className="container">
                <p className="promotion-text">
                    {text}
                </p>
            </div>
        </section>
    );
}
