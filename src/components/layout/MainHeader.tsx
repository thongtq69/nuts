'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useSettings } from '@/context/SettingsContext';
import { useAuth } from '@/context/AuthContext';

export default function MainHeader() {
    const router = useRouter();
    const { cartCount, cartTotal } = useCart();
    const { settings } = useSettings();
    const [searchQuery, setSearchQuery] = useState('');
    const { user } = useAuth();

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
        <header className="header">
            <div className="container">
                <div className="header-content">
                    {/* Logo */}
                    <Link href="/" className="logo">
                        <img
                            src={settings?.logoUrl || "/assets/logo.png"}
                            alt={settings?.companyName || "Go Nuts"}
                        />
                    </Link>

                    {/* Search Bar */}
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
                                <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                                    <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" />
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

                    {/* Actions: Account & Cart */}
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
                            <div style={{ position: 'relative' }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="9" cy="21" r="1" />
                                    <circle cx="20" cy="21" r="1" />
                                    <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
                                </svg>
                                {cartCount > 0 && (
                                    <span className="cart-badge">{cartCount}</span>
                                )}
                            </div>
                            <div className="cart-info">
                                <span className="cart-label">Giỏ hàng</span>
                                <div className="cart-detail">
                                    <span className="cart-total">{cartTotal.toLocaleString()}đ</span>
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
            <style jsx>{`
                .cart-badge {
                    position: absolute;
                    top: -5px;
                    right: -5px;
                    background: #E3E846;
                    color: #333;
                    font-size: 10px;
                    font-weight: bold;
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
            `}</style>
        </header>
    );
}
