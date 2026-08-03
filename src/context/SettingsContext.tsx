'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { HomeFeature } from '@/lib/site-features';
import { DEFAULT_HOME_PROMOTION_TEXT } from '@/lib/home-promotion';

interface ProductFeature {
    title: string;
    description: string;
    icon: 'truck' | 'refresh' | 'shield';
    enabled: boolean;
}

interface Settings {
    companyName?: string;
    hotline?: string;
    email?: string;
    address?: string;
    logoUrl?: string;
    topBarPromoText?: string;
    homePromotionText?: string;
    homePromotionEnabled?: boolean;
    zaloLink?: string;
    socialLinks?: {
        facebook?: string;
        instagram?: string;
        youtube?: string;
    };
    productFeatures?: ProductFeature[];
    homeFeatures?: HomeFeature[];
    freeShippingThreshold?: number;
    supportHotline?: string;
}

interface SettingsContextType {
    settings: Settings | null;
    loading: boolean;
    refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<Settings | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchSettings = useCallback(async () => {
        try {
            const res = await fetch('/api/settings', { cache: 'no-store' });
            if (res.ok) {
                const data = await res.json();
                setSettings(data);
            } else {
                // Use default settings if API fails
                setSettings({
                    companyName: 'Go Nuts',
                    hotline: '096 118 5753',
                    zaloLink: 'https://zalo.me/0961185753',
                    email: 'info@gonuts.vn',
                    address: 'TP. Hồ Chí Minh, Việt Nam',
                    topBarPromoText: 'Giảm giá 8% khi mua hàng từ 899k trở lên với mã "SAVER8"',
                    homePromotionText: DEFAULT_HOME_PROMOTION_TEXT,
                    homePromotionEnabled: true,
                });
            }
        } catch (error) {
            console.error('Failed to fetch settings', error);
            // Use default settings
            setSettings({
                companyName: 'Go Nuts',
                hotline: '096 118 5753',
                zaloLink: 'https://zalo.me/0961185753',
                homePromotionText: DEFAULT_HOME_PROMOTION_TEXT,
                homePromotionEnabled: true,
            });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void fetchSettings();
    }, [fetchSettings]);

    useEffect(() => {
        const handleSettingsUpdated = () => {
            void fetchSettings();
        };

        window.addEventListener('storage', handleSettingsUpdated);
        return () => window.removeEventListener('storage', handleSettingsUpdated);
    }, [fetchSettings]);

    return (
        <SettingsContext.Provider value={{ settings, loading, refreshSettings: fetchSettings }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
}
