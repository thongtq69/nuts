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
            {/* Unified Dark Top Bar - matching Figma */}
            <div className="unified-top-bar">
                <div className="container">
                    <div className="unified-top-content">
                        {/* Left: Hotline + Zalo */}
                        <div className="top-left">
                            <span className="hotline-dark">Hotline: {settings.hotline}</span>
                            {settings.zaloLink && (
                                <a href={settings.zaloLink} target="_blank" rel="noopener noreferrer" className="zalo-link-dark">
                                    <img src="/assets/images/Zalo.svg" alt="Zalo" className="zalo-icon" />
                                </a>
                            )}
                        </div>

                        {/* Center: Yellow Promo Banner */}
                        {settings.promoEnabled && settings.promoText && (
                            <div className="promo-banner-inline">
                                <span>{settings.promoText}</span>
                            </div>
                        )}

                        {/* Right: Social Icons + Links */}
                        <div className="top-right">
                            <Link href={settings.agentRegistrationUrl || '/agent/register'} className="top-link">Đăng ký Đại lý/</Link>
                            <Link href={settings.ctvRegistrationUrl || '/agent/register'} className="top-link">Cộng tác viên</Link>

                            <div className="social-icons-group">
                                {settings.facebookUrl && (
                                    <a href={settings.facebookUrl} target="_blank" rel="noopener noreferrer" className="social-icon-dark facebook">
                                        <svg viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                        </svg>
                                    </a>
                                )}
                                {settings.instagramUrl && (
                                    <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" className="social-icon-dark instagram">
                                        <svg viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                        </svg>
                                    </a>
                                )}
                                {settings.youtubeUrl && (
                                    <a href={settings.youtubeUrl} target="_blank" rel="noopener noreferrer" className="social-icon-dark youtube">
                                        <svg viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                        </svg>
                                    </a>
                                )}
                            </div>
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
