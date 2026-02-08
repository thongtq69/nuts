'use client';

import { useState, useEffect } from 'react';

interface PromoBannerSettings {
    homePromoBannerUrl: string;
    homePromoBannerTitle: string;
    homePromoBannerButtonText: string;
    homePromoBannerButtonLink: string;
    homePromoBannerNote: string;
    homePromoBannerEnabled: boolean;
}

export default function LargePromoBanner() {
    const [settings, setSettings] = useState<PromoBannerSettings>({
        homePromoBannerUrl: '/assets/images/promotion.png',
        homePromoBannerTitle: "TẶNG VOUCHER 50.000 VNĐ<br />KHI ĐĂNG KÝ THÀNH VIÊN",
        homePromoBannerButtonText: 'ĐĂNG KÝ NGAY',
        homePromoBannerButtonLink: '/register',
        homePromoBannerNote: '*Áp dụng cho đơn hàng từ 300.000đ',
        homePromoBannerEnabled: true,
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch('/api/settings', { cache: 'no-store' });
                if (res.ok) {
                    const data = await res.json();
                    if (data) {
                        setSettings({
                            homePromoBannerUrl: data.homePromoBannerUrl || '/assets/images/promotion.png',
                            homePromoBannerTitle: data.homePromoBannerTitle || "TẶNG VOUCHER 50.000 VNĐ<br />KHI ĐĂNG KÝ THÀNH VIÊN",
                            homePromoBannerButtonText: data.homePromoBannerButtonText || 'ĐĂNG KÝ NGAY',
                            homePromoBannerButtonLink: data.homePromoBannerButtonLink || '/register',
                            homePromoBannerNote: data.homePromoBannerNote || '*Áp dụng cho đơn hàng từ 300.000đ',
                            homePromoBannerEnabled: data.homePromoBannerEnabled !== false,
                        });
                    }
                }
            } catch (error) {
                console.error('Error fetching promo banner settings:', error);
            }
        };
        fetchSettings();
    }, []);

    if (!settings.homePromoBannerEnabled) return null;

    return (
        <section className="promo-banner-section">
            <div className="container">
                <div className="promo-banner-card">
                    <div className="promo-banner-content">
                        <h2
                            className="promo-title"
                            dangerouslySetInnerHTML={{ __html: settings.homePromoBannerTitle }}
                        />
                        <a href={settings.homePromoBannerButtonLink} className="promo-btn">
                            {settings.homePromoBannerButtonText}
                        </a>
                        <p className="promo-note">{settings.homePromoBannerNote}</p>
                    </div>
                    <div className="promo-banner-image">
                        <img src={settings.homePromoBannerUrl} alt="Promotion Banner" />
                    </div>
                </div>
            </div>
        </section>
    );
}
