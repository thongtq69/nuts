'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Breadcrumb from '@/components/common/Breadcrumb';
import { useToast } from '@/context/ToastContext';
import { useLocale } from '@/context/LocaleContext';

interface SiteSettings {
    hotline: string;
    email: string;
    address: string;
    facebookUrl: string;
    instagramUrl: string;
    youtubeUrl: string;
    tiktokUrl: string;
    workingHours: string;
}

export default function ContactPage() {
    const [settings, setSettings] = useState<SiteSettings | null>(null);
    const toast = useToast();
    const { t, apiPath, locale } = useLocale();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch(apiPath('/api/settings'));
                if (res.ok) {
                    const data = await res.json();
                    setSettings(data);
                }
            } catch (error) {
                console.error('Error fetching settings:', error);
            }
        };

        fetchSettings();
    }, [apiPath]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validatePhone = (phone: string) => {
        const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
        return phoneRegex.test(phone);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.phone || !validatePhone(formData.phone)) {
            toast.error(t('Số điện thoại không hợp lệ'), t('Vui lòng nhập số điện thoại Việt Nam hợp lệ (VD: 0912345678)'));
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (data.success) {
                toast.success(t('Đã gửi liên hệ'), t('Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất.'));
                setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    message: ''
                });
            } else {
                toast.error(t('Lỗi khi gửi'), data.message || t('Vui lòng thử lại sau.'));
            }
        } catch (error) {
            console.error('Error submitting contact form:', error);
            toast.error(t('Lỗi kết nối'), t('Không thể gửi tin nhắn. Vui lòng kiểm tra kết nối mạng.'));
        } finally {
            setIsSubmitting(false);
        }
    };

    // Default values nếu chưa load được settings
    const defaultSettings = {
        hotline: '096 118 5753',
        email: 'contact.gonuts@gmail.com',
        address: 'Tầng 4, VT1-B09, Khu đô thị mới An Hưng, Phường Dương Nội, Thành phố Hà Nội, Việt Nam',
        facebookUrl: 'https://www.facebook.com/profile.php?id=61572944004088',
        instagramUrl: 'https://instagram.com/',
        youtubeUrl: 'https://youtube.com/',
        tiktokUrl: 'https://tiktok.com/',
        workingHours: 'Thứ 2 - Thứ 7: 8:00 - 17:30'
    };

    const currentSettings = settings || defaultSettings;

    return (
        <main>
            <Header />
            <Navbar />
            <Breadcrumb items={[{ label: 'Trang chủ', href: '/' }, { label: 'Liên hệ' }]} />

            <div className="container">
                <h1 className="page-title">{t('Liên hệ với chúng tôi')}</h1>

                <div className="contact-layout">
                    <div className="contact-form-section">
                        <form className="contact-form" onSubmit={handleSubmit}>
                            <h3>{t('Gửi tin nhắn cho chúng tôi')}</h3>
                            <div className="form-group">
                                <label>{t('Họ và tên')}</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder={t('Nhập họ và tên')}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder={t('Nhập email')}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>{t('Số điện thoại')}</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder={t('Nhập số điện thoại')}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>{t('Nội dung')}</label>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    rows={5}
                                    placeholder={t('Nhập nội dung tin nhắn')}
                                    required
                                ></textarea>
                            </div>
                            <button
                                type="submit"
                                className="submit-btn"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? t('Đang gửi...') : t('Gửi tin nhắn')}
                            </button>
                        </form>
                    </div>

                    <div className="contact-info-section">
                        <h3>{t('Thông tin liên hệ')}</h3>
                        <div className="info-item">
                            <span className="label">{t('Địa chỉ:')}</span>
                            <p>{currentSettings.address}</p>
                        </div>
                        <div className="info-item">
                            <span className="label">Hotline:</span>
                            <p>{currentSettings.hotline}</p>
                        </div>
                        <div className="info-item">
                            <span className="label">Email:</span>
                            <p>{currentSettings.email}</p>
                        </div>
                        <div className="info-item">
                            <span className="label">{t('Giờ làm việc:')}</span>
                            <p>{currentSettings.workingHours}</p>
                        </div>

                        <div className="social-links" style={{ marginTop: '20px' }}>
                            <h4>{t('Theo dõi chúng tôi')}</h4>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                <a href={currentSettings.facebookUrl} target="_blank" rel="noopener noreferrer"
                                    style={{ padding: '8px', backgroundColor: '#1877f2', color: 'white', borderRadius: '5px', textDecoration: 'none' }}>
                                    Facebook
                                </a>
                                <a href={currentSettings.instagramUrl} target="_blank" rel="noopener noreferrer"
                                    style={{ padding: '8px', backgroundColor: '#e4405f', color: 'white', borderRadius: '5px', textDecoration: 'none' }}>
                                    Instagram
                                </a>
                                <a href={currentSettings.youtubeUrl} target="_blank" rel="noopener noreferrer"
                                    style={{ padding: '8px', backgroundColor: '#ff0000', color: 'white', borderRadius: '5px', textDecoration: 'none' }}>
                                    YouTube
                                </a>
                                {currentSettings.tiktokUrl && (
                                    <a href={currentSettings.tiktokUrl} target="_blank" rel="noopener noreferrer"
                                        style={{ padding: '8px', backgroundColor: '#000000', color: 'white', borderRadius: '5px', textDecoration: 'none' }}>
                                        TikTok
                                    </a>
                                )}
                            </div>
                        </div>

                        <div className="map-section">
                            <h4>{t('Bản đồ')}</h4>
                            <div className="map-container">
                                <iframe
                                    width="100%"
                                    height="300"
                                    style={{ border: 0, borderRadius: '12px' }}
                                    src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}&q=${encodeURIComponent(currentSettings.address)}&zoom=15&language=${locale}`}
                                    allowFullScreen
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    title="Google Maps"
                                />
                            </div>
                            <a
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(currentSettings.address)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="map-directions-link"
                            >
                                {t('Xem trên Google Maps →')}
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />

            <style jsx>{`
                .map-section {
                    margin-top: 24px;
                }
                .map-section h4 {
                    margin-bottom: 12px;
                    color: #333;
                }
                .map-container {
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                }
                .map-directions-link {
                    display: inline-block;
                    margin-top: 12px;
                    color: #9C7043;
                    text-decoration: none;
                    font-weight: 500;
                }
                .map-directions-link:hover {
                    text-decoration: underline;
                }
            `}</style>
        </main>
    );
}
