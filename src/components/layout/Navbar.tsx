'use client';

import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function Navbar() {
    const pathname = usePathname();
    const [forceUpdate, setForceUpdate] = useState(0);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        let lastUrl = window.location.href;

        const checkUrlChange = () => {
            const currentUrl = window.location.href;
            if (currentUrl !== lastUrl) {
                lastUrl = currentUrl;
                setForceUpdate(prev => prev + 1);
            }
        };

        const interval = setInterval(checkUrlChange, 500);

        const handlePopState = () => {
            setForceUpdate(prev => prev + 1);
        };

        window.addEventListener('popstate', handlePopState);

        const originalPushState = history.pushState;
        const originalReplaceState = history.replaceState;

        history.pushState = function(...args) {
            originalPushState.apply(history, args);
            setTimeout(() => setForceUpdate(prev => prev + 1), 0);
        };

        history.replaceState = function(...args) {
            originalReplaceState.apply(history, args);
            setTimeout(() => setForceUpdate(prev => prev + 1), 0);
        };

        return () => {
            clearInterval(interval);
            window.removeEventListener('popstate', handlePopState);
            history.pushState = originalPushState;
            history.replaceState = originalReplaceState;
        };
    }, [pathname]);

    const getCurrentSort = () => {
        if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            return urlParams.get('sort');
        }
        return null;
    };

    const isActive = (path: string) => {
        if (path === '/') return pathname === '/';
        
        const currentSort = getCurrentSort();
        
        if (path.includes('?')) {
            const [basePath, queryString] = path.split('?');
            if (pathname === basePath) {
                const expectedParams = new URLSearchParams(queryString);
                const expectedSort = expectedParams.get('sort');
                
                return currentSort === expectedSort;
            }
            return false;
        }
        
        if (path === '/products') {
            return pathname === '/products' && !currentSort;
        }
        
        return pathname.startsWith(path);
    };

    const navItems = [
        { href: '/', label: 'Trang chủ' },
        { href: '/products?sort=bestselling', label: 'Sản phẩm bán chạy' },
        { href: '/products?sort=newest', label: 'Sản phẩm mới' },
        { href: '/products', label: 'Tất cả sản phẩm' },
        { href: '/subscriptions', label: 'Gói VIP' },
        { href: '/agent', label: 'Đại lý' },
        { href: '/news', label: 'Tin tức' },
        { href: '/contact', label: 'Liên hệ' },
    ];

    return (
        <nav className="main-nav">
            <div className="container">
                <button
                    className="mobile-menu-button"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    aria-label="Toggle menu"
                >
                    <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                        {isMobileMenuOpen ? (
                            <path d="M6 18L18 6M6 6l12 12" />
                        ) : (
                            <>
                                <path d="M3 12h18M3 6h18M3 18h18" />
                            </>
                        )}
                    </svg>
                </button>

                <ul className={`nav-menu ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
                    {navItems.map((item) => (
                        <li key={item.href}>
                            <Link
                                href={item.href}
                                className={`nav-link ${isActive(item.href) ? 'active' : ''}`}
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {item.label}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </nav>
    );
}
