'use client';

import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function Navbar() {
    const pathname = usePathname();
    const [forceUpdate, setForceUpdate] = useState(0);

    useEffect(() => {
        let lastUrl = window.location.href;

        const checkUrlChange = () => {
            const currentUrl = window.location.href;
            if (currentUrl !== lastUrl) {
                lastUrl = currentUrl;
                setForceUpdate(prev => prev + 1);
            }
        };

        // Check URL changes periodically (more efficient than 100ms)
        const interval = setInterval(checkUrlChange, 500);

        // Listen for popstate events (browser back/forward)
        const handlePopState = () => {
            setForceUpdate(prev => prev + 1);
        };
        
        window.addEventListener('popstate', handlePopState);

        // Override pushState and replaceState to catch programmatic navigation
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
        
        // Handle query parameters for product filtering
        if (path.includes('?')) {
            const [basePath, queryString] = path.split('?');
            if (pathname === basePath) {
                // Parse expected query params
                const expectedParams = new URLSearchParams(queryString);
                const expectedSort = expectedParams.get('sort');
                
                return currentSort === expectedSort;
            }
            return false;
        }
        
        // For /products without query params, only match when no sort parameter
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
                <ul className="nav-menu">
                    {navItems.map((item) => (
                        <li key={item.href}>
                            <Link
                                href={item.href}
                                className={`nav-link ${isActive(item.href) ? 'active' : ''}`}
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
