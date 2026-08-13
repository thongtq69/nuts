'use client';

import { useState, useEffect } from 'react';
import { getOptimizedCloudinaryUrl } from '@/lib/cloudinary-image';
import { useLocale } from '@/context/LocaleContext';

interface PromoBannerSettings {
    homePromoBannerUrl: string;
    homePromoBannerTitle: string;
    homePromoBannerButtonText: string;
    homePromoBannerButtonLink: string;
    homePromoBannerNote: string;
    homePromoBannerEnabled: boolean;
}

export default function LargePromoBanner() {
    const { t, href, apiPath } = useLocale();
    const [settings, setSettings] = useState<PromoBannerSettings>({
        homePromoBannerUrl: '/assets/images/gonuts-banner-member.png',
        homePromoBannerTitle: "TẶNG VOUCHER 50.000 VNĐ<br />KHI ĐĂNG KÝ THÀNH VIÊN",
        homePromoBannerButtonText: 'ĐĂNG KÝ NGAY',
        homePromoBannerButtonLink: '/register',
        homePromoBannerNote: '*Áp dụng cho đơn hàng từ 300.000đ',
        homePromoBannerEnabled: true,
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch(apiPath('/api/settings'), { cache: 'no-store' });
                if (res.ok) {
                    const data = await res.json();
                    if (data) {
                        setSettings({
                            homePromoBannerUrl: typeof data.homePromoBannerUrl === 'string'
                                ? data.homePromoBannerUrl
                                : '/assets/images/gonuts-banner-member.png',
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
    }, [apiPath]);

    if (!settings.homePromoBannerEnabled || !settings.homePromoBannerUrl) return null;

    return (
        <section className="promo-banner-section">
            <div className="container">
                <div className="promo-banner-card">
                    <div className="promo-banner-content">
                        <h2
                            className="promo-title"
                            dangerouslySetInnerHTML={{ __html: t(settings.homePromoBannerTitle) }}
                        />
                        <a href={href(settings.homePromoBannerButtonLink)} className="promo-btn">
                            {t(settings.homePromoBannerButtonText)}
                        </a>
                        <p className="promo-note">{t(settings.homePromoBannerNote)}</p>
                    </div>
                    <div className="promo-banner-image">
                        <img
                            src={getOptimizedCloudinaryUrl(settings.homePromoBannerUrl, 'f_auto,q_auto,w_1400,c_limit')}
                            alt="Promotion Banner"
                            width={1400}
                            height={700}
                            loading="lazy"
                            decoding="async"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
