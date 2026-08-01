'use client';

import { Truck, RotateCcw, ShieldCheck, Users } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import { DEFAULT_HOME_FEATURES, HomeFeatureIcon } from '@/lib/site-features';

const FEATURE_ICONS = {
    truck: Truck,
    refresh: RotateCcw,
    shield: ShieldCheck,
    users: Users,
} satisfies Record<HomeFeatureIcon, typeof Truck>;

export default function FeaturesSection() {
    const { settings } = useSettings();
    const features = (settings?.homeFeatures?.length ? settings.homeFeatures : DEFAULT_HOME_FEATURES)
        .filter(feature => feature.enabled);

    if (features.length === 0) return null;

    return (
        <section className="features-section">
            <div className="container">
                <div className="features-grid">
                    {features.map((feature, index) => {
                        const Icon = FEATURE_ICONS[feature.icon] || ShieldCheck;
                        return (
                            <div className="feature-item" key={`${feature.icon}-${index}`}>
                                <div className="feature-icon">
                                    <Icon size={32} strokeWidth={2} />
                                </div>
                                <p className="feature-text">{feature.text}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
