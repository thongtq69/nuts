'use client';

import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

interface NavItem {
    href: string;
    label: string;
    children?: NavItem[];
}

export default function Navbar() {
    const pathname = usePathname();
    const [, setForceUpdate] = useState(0);
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

        history.pushState = function (...args) {
            originalPushState.apply(history, args);
            setTimeout(() => setForceUpdate(prev => prev + 1), 0);
        };

        history.replaceState = function (...args) {
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

    const isActive = (path: string) => {
        if (path === '/') return pathname === '/';

        const currentParams = typeof window !== 'undefined'
            ? new URLSearchParams(window.location.search)
            : new URLSearchParams();

        if (path.includes('?')) {
            const [basePath, queryString] = path.split('?');
            if (pathname === basePath) {
                const expectedParams = new URLSearchParams(queryString);
                return Array.from(expectedParams.entries()).every(
                    ([key, value]) => currentParams.get(key) === value
                );
            }
            return false;
        }

        if (path === '/products') {
            return pathname === '/products' && currentParams.toString() === '';
        }

        return pathname.startsWith(path);
    };

    const navItems: NavItem[] = [
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
        <nav className="bg-white border-b border-slate-100 z-40 relative">
            <div className="container mx-auto px-4 py-2 lg:py-0">
                <div className="flex items-center justify-between">
                    {/* Mobile Menu Toggle - Only visible on small screens */}
                    <button
                        className="lg:hidden p-2 text-[#3C2A1A] hover:bg-slate-50 rounded-lg transition-colors"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        <div className="w-6 h-5 relative flex flex-col justify-between">
                            <span className={`h-0.5 w-full bg-current rounded-full transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-2.5' : ''}`}></span>
                            <span className={`h-0.5 w-full bg-current rounded-full transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`}></span>
                            <span className={`h-0.5 w-full bg-current rounded-full transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
                        </div>
                    </button>

                    {/* Desktop Menu */}
                    <ul className="hidden lg:flex items-center justify-center gap-10 w-full">
                        {navItems.map((item) => (
                            <li key={item.href} className="relative group">
                                <Link
                                    href={item.href}
                                    className={`block py-5 text-[15px] font-semibold transition-all duration-300 ${isActive(item.href)
                                        ? 'text-[#9C7044]'
                                        : 'text-slate-600 hover:text-[#9C7044]'
                                        }`}
                                >
                                    <span className="inline-flex items-center gap-1.5">
                                        {item.label}
                                        {!!item.children?.length && (
                                            <span className="text-[10px] transition-transform group-hover:rotate-180">▼</span>
                                        )}
                                    </span>
                                    <span className={`absolute bottom-0 left-0 h-0.5 bg-[#9C7044] transition-all duration-300 ${isActive(item.href) ? 'w-full' : 'w-0 group-hover:w-full'
                                        }`}></span>
                                </Link>
                                {!!item.children?.length && (
                                    <div className="absolute left-1/2 top-full min-w-52 -translate-x-1/2 rounded-b-xl border border-slate-100 bg-white py-2 shadow-xl opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-200 z-50">
                                        <Link
                                            href={item.href}
                                            className="block px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-[#9C7044]/5 hover:text-[#9C7044]"
                                        >
                                            Tất cả
                                        </Link>
                                        {item.children?.map(child => (
                                            <div key={child.href} className="group/flyout relative">
                                                <Link
                                                    href={child.href}
                                                    className="flex items-center justify-between gap-4 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-[#9C7044]/5 hover:text-[#9C7044]"
                                                >
                                                    <span>{child.label}</span>
                                                    {!!child.children?.length && <span aria-hidden>›</span>}
                                                </Link>
                                                {!!child.children?.length && (
                                                    <div className="invisible absolute left-full top-0 min-w-52 rounded-xl border border-slate-100 bg-white py-2 opacity-0 shadow-xl transition-all duration-200 group-hover/flyout:visible group-hover/flyout:opacity-100">
                                                        <Link
                                                            href={child.href}
                                                            className="block px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-[#9C7044]/5 hover:text-[#9C7044]"
                                                        >
                                                            Tất cả {child.label}
                                                        </Link>
                                                        {child.children.map(submenu => (
                                                            <Link
                                                                key={submenu.href}
                                                                href={submenu.href}
                                                                className="block px-4 py-2.5 text-sm text-slate-600 hover:bg-[#9C7044]/5 hover:text-[#9C7044]"
                                                            >
                                                                {submenu.label}
                                                            </Link>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>

                    {/* Mobile Menu Items - Slide Down */}
                    <div className={`
                        absolute top-full left-0 w-full bg-white shadow-2xl lg:hidden overflow-hidden transition-all duration-500 ease-in-out z-50
                        ${isMobileMenuOpen ? 'max-h-[80vh] border-t border-slate-100' : 'max-h-0'}
                    `}>
                        <ul className="py-4">
                            {navItems.map((item) => (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        className={`block px-6 py-4 text-base font-semibold transition-all ${isActive(item.href)
                                            ? 'text-[#9C7044] bg-[#9C7044]/5 border-l-4 border-[#9C7044]'
                                            : 'text-slate-700 hover:bg-slate-50 border-l-4 border-transparent'
                                            }`}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        {item.label}
                                    </Link>
                                    {!!item.children?.length && (
                                        <div className="ml-6 border-l border-slate-200">
                                            {item.children.map(child => (
                                                <div key={child.href}>
                                                    {child.children?.length ? (
                                                        <details>
                                                            <summary className="flex cursor-pointer list-none items-center justify-between px-6 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#9C7044]">
                                                                {child.label}
                                                                <span aria-hidden>⌄</span>
                                                            </summary>
                                                            <div className="ml-4 border-l border-slate-100">
                                                                <Link
                                                                    href={child.href}
                                                                    className="block px-6 py-2 text-xs font-semibold text-slate-600 hover:text-[#9C7044]"
                                                                    onClick={() => setIsMobileMenuOpen(false)}
                                                                >
                                                                    Tất cả {child.label}
                                                                </Link>
                                                                {child.children.map(submenu => (
                                                                    <Link
                                                                        key={submenu.href}
                                                                        href={submenu.href}
                                                                        className="block px-6 py-2 text-sm text-slate-500 hover:bg-slate-50 hover:text-[#9C7044]"
                                                                        onClick={() => setIsMobileMenuOpen(false)}
                                                                    >
                                                                        {submenu.label}
                                                                    </Link>
                                                                ))}
                                                            </div>
                                                        </details>
                                                    ) : (
                                                        <Link
                                                            href={child.href}
                                                            className="block px-6 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-[#9C7044]"
                                                            onClick={() => setIsMobileMenuOpen(false)}
                                                        >
                                                            {child.label}
                                                        </Link>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                        {/* Mobile Extras: Hotline in Menu */}
                        <div className="p-6 bg-slate-50 border-t border-slate-100 mt-2">
                            <p className="text-xs text-slate-500 uppercase font-black tracking-widest mb-3">Hỗ trợ nhanh</p>
                            <a href="tel:0961185753" className="flex items-center gap-3 text-lg font-black text-[#3C2A1A]">
                                <div className="w-10 h-10 rounded-full bg-[#E3E846] flex items-center justify-center">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l2.27-2.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                                    </svg>
                                </div>
                                096 118 5753
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Backdrop for mobile menu */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm lg:hidden z-[-1]"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}
        </nav>
    );
}
