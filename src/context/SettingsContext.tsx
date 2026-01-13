'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Settings {
    companyName?: string;
    hotline?: string;
    email?: string;
    address?: string;
    logoUrl?: string;
    topBarPromoText?: string;
    zaloLink?: string;
    socialLinks?: {
        facebook?: string;
        instagram?: string;
        youtube?: string;
    };
}

interface SettingsContextType {
    settings: Settings | null;
    loading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<Settings | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/settings');
            if (res.ok) {
                const data = await res.json();
                setSettings(data);
            } else {
                // Use default settings if API fails
                setSettings({
                    companyName: 'Go Nuts',
                    hotline: '0901234567',
                    email: 'info@gonuts.vn',
                    address: 'TP. Hồ Chí Minh, Việt Nam',
                    topBarPromoText: 'Giảm giá 8% khi mua hàng từ 899k trở lên với mã "SAVER8"',
                });
            }
        } catch (error) {
            console.error('Failed to fetch settings', error);
            // Use default settings
            setSettings({
                companyName: 'Go Nuts',
                hotline: '0901234567',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <SettingsContext.Provider value={{ settings, loading }}>
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
