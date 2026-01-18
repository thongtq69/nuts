'use client';

import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function Navbar() {
    const pathname = usePathname();
    const [currentSort, setCurrentSort] = useState<string | null>(null);

    useEffect(() => {
        // Get sort parameter from URL on client side
        const urlParams = new URLSearchParams(window.location.search);
        setCurrentSort(urlParams.get('sort'));
    }, [pathname]);

    const isActive = (path: string) => {
        if (path === '/') return pathname === '/';
        
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
