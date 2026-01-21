'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Breadcrumb from '@/components/common/Breadcrumb';
import { useToast } from '@/context/ToastContext';

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

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch('/api/settings');
                if (res.ok) {
                    const data = await res.json();
                    setSettings(data);
                }
            } catch (error) {
                console.error('Error fetching settings:', error);
            }
        };
        
        fetchSettings();
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        toast.success('Đã gửi liên hệ', 'Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất.');
    };

    // Default values nếu chưa load được settings
    const defaultSettings = {
        hotline: '090 118 5753',
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
                <h1 className="page-title">Liên hệ với chúng tôi</h1>

                <div className="contact-layout">
                    <div className="contact-form-section">
                        <form className="contact-form" onSubmit={handleSubmit}>
                            <h3>Gửi tin nhắn cho chúng tôi</h3>
                            <div className="form-group">
                                <label>Họ và tên</label>
                                <input type="text" placeholder="Nhập họ và tên" required />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input type="email" placeholder="Nhập email" required />
                            </div>
                            <div className="form-group">
                                <label>Số điện thoại</label>
                                <input type="tel" placeholder="Nhập số điện thoại" />
                            </div>
                            <div className="form-group">
                                <label>Nội dung</label>
                                <textarea rows={5} placeholder="Nhập nội dung tin nhắn" required></textarea>
                            </div>
                            <button type="submit" className="submit-btn">Gửi tin nhắn</button>
                        </form>
                    </div>

                    <div className="contact-info-section">
                        <h3>Thông tin liên hệ</h3>
                        <div className="info-item">
                            <span className="label">Địa chỉ:</span>
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
                            <span className="label">Giờ làm việc:</span>
                            <p>{currentSettings.workingHours}</p>
                        </div>

                        <div className="social-links" style={{ marginTop: '20px' }}>
                            <h4>Theo dõi chúng tôi</h4>
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
                            <h4>Bản đồ</h4>
                            <div className="map-container">
                                <iframe
                                    width="100%"
                                    height="300"
                                    style={{ border: 0, borderRadius: '12px' }}
                                    src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}&q=${encodeURIComponent(currentSettings.address)}&zoom=15&language=vi`}
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
                                Xem trên Google Maps →
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
