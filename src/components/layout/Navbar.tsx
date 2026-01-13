'use client';

import Link from 'next/link';
import React from 'react';
import { usePathname } from 'next/navigation';

export default function Navbar() {
    const pathname = usePathname();

    const isActive = (path: string) => {
        if (path === '/') return pathname === '/';
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
