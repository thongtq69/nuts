'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

interface SiteSettings {
    hotline: string;
    zaloLink: string;
    facebookUrl: string;
    instagramUrl: string;
    youtubeUrl: string;
    promoText: string;
    promoEnabled: boolean;
    agentRegistrationUrl: string;
    ctvRegistrationUrl: string;
}

export default function Header() {
    const router = useRouter();
    const { cartCount, cartTotal } = useCart();
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [settings, setSettings] = useState<SiteSettings>({
        hotline: '090xxxxxxx',
        zaloLink: '',
        facebookUrl: '',
        instagramUrl: '',
        youtubeUrl: '',
        promoText: 'Giảm giá 8% khi mua hàng từ 899k trở lên với mã "SAVER8"',
        promoEnabled: true,
        agentRegistrationUrl: '/agent/register',
        ctvRegistrationUrl: '/agent/register',
    });

    useEffect(() => {
        // Fetch site settings
        fetch('/api/settings')
            .then(res => res.json())
            .then(data => {
                if (data && !data.message) {
                    setSettings(data);
                }
            })
            .catch(err => console.error('Error fetching settings:', err));
    }, []);

    const handleSearch = () => {
        if (searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <>
            {/* Promo Bar - Yellow */}
            {settings.promoEnabled && settings.promoText && (
                <div className="promo-bar">
                    <div className="container">
                        <span className="promo-text">{settings.promoText}</span>
                    </div>
                </div>
            )}

            {/* Top Bar - White with info */}
            <div className="top-bar">
                <div className="container">
                    <div className="top-bar-content">
                        <div className="top-bar-left">
                            <span className="hotline">Hotline: {settings.hotline}</span>
                            {settings.zaloLink && (
                                <a href={settings.zaloLink} target="_blank" rel="noopener noreferrer" className="zalo-link">
                                    <img src="/assets/images/Zalo.svg" alt="Zalo" className="zalo-icon" />
                                </a>
                            )}
                        </div>
                        <div className="top-bar-right">
                            <Link href={settings.agentRegistrationUrl || '/agent/register'}>Đăng ký Đại lý</Link>
                            <span className="divider">|</span>
                            <Link href={settings.ctvRegistrationUrl || '/agent/register'}>Cộng tác viên</Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Header - White */}
            <header className="header">
                <div className="container">
                    <div className="header-content">
                        <Link href="/" className="logo">
                            <img src="/assets/logo.png" alt="Go Nuts Logo" />
                        </Link>

                        <div className="search-container">
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Tìm kiếm..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                            <div className="category-dropdown">
                                <button className="category-btn">
                                    Tất cả các danh mục
                                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                        <path d="M3 5L6 8L9 5" stroke="currentColor" strokeWidth="1.5" />
                                    </svg>
                                </button>
                            </div>
                            <button className="search-btn" onClick={handleSearch}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="11" cy="11" r="8" />
                                    <path d="M21 21l-4.35-4.35" />
                                </svg>
                            </button>
                        </div>

                        <div className="header-actions">
                            <Link href={user ? "/account" : "/login"} className="action-link account-link">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                                    <circle cx="12" cy="7" r="4" />
                                </svg>
                                <div className="account-info">
                                    <span className="account-label">
                                        {user ? `Xin chào, ${user.name}` : 'Đăng nhập / Đăng ký'}
                                    </span>
                                    <span className="account-title">
                                        Tài khoản của tôi{' '}
                                        <svg width="10" height="10" viewBox="0 0 12 12">
                                            <path d="M3 5L6 8L9 5" stroke="currentColor" strokeWidth="1.5" fill="none" />
                                        </svg>
                                    </span>
                                </div>
                            </Link>
                            <Link href="/cart" className="action-link cart">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="9" cy="21" r="1" />
                                    <circle cx="20" cy="21" r="1" />
                                    <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
                                </svg>
                                <div className="cart-info">
                                    <span className="cart-label">Giỏ hàng</span>
                                    <div className="cart-detail">
                                        <span className="cart-count">{cartCount}</span>
                                        <span className="cart-total">{cartTotal.toLocaleString()}đ</span>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>
            </header>
        </>
    );
}
