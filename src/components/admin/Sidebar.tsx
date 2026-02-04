'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    ShoppingBag,
    Package,
    Users,
    UserCheck,
    CreditCard,
    Ticket,
    PenTool,
    ImageIcon,
    Calendar,
    Settings,
    Crown,
    TrendingUp,
    Gift,
    Tag,
    Home,
    Cloud,
    Sparkles,
    Star,
    ExternalLink,
    Mail,
    X,
    ChevronRight
} from 'lucide-react';

const menuSections = [
    {
        title: 'Tổng quan',
        items: [
            { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
            { href: '/admin/analytics', icon: TrendingUp, label: 'Thống kê' },
        ],
    },
    {
        title: 'Quản lý bán hàng',
        items: [
            { href: '/admin/orders', icon: ShoppingBag, label: 'Đơn hàng' },
            { href: '/admin/products', icon: Package, label: 'Sản phẩm' },
            { href: '/admin/vouchers', icon: Ticket, label: 'Voucher' },
        ],
    },
    {
        title: 'Hệ thống',
        items: [
            { href: '/admin/users', icon: Users, label: 'Ngườii dùng' },
            { href: '/admin/staff', icon: UserCheck, label: 'Nhân viên' },
            { href: '/admin/commissions', icon: CreditCard, label: 'Hoa hồng' },
            { href: '/admin/packages', icon: Crown, label: 'Gói Hội Viên' },
        ],
    },
    {
        title: 'Nội dung',
        items: [
            { href: '/admin/blogs', icon: PenTool, label: 'Bài viết' },
            { href: '/admin/events', icon: Calendar, label: 'Sự kiện' },
            { href: '/admin/banners', icon: ImageIcon, label: 'Banner' },
            { href: '/admin/contacts', icon: Mail, label: 'Liên hệ' },
        ],
    },
    {
        title: 'Cài đặt',
        items: [
            { href: '/admin/settings', icon: Settings, label: 'Cài đặt Website' },
            { href: '/admin/affiliate-settings', icon: TrendingUp, label: 'Cấu hình Affiliate' },
            { href: '/admin/cloudinary', icon: Cloud, label: 'Quản lý Cloudinary' },
        ],
    },
];

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

export default function AdminSidebar({ isOpen, onClose }: SidebarProps) {
    const pathname = usePathname();

    // Close sidebar when route changes on mobile
    useEffect(() => {
        if (onClose && isOpen) {
            onClose();
        }
    }, [pathname, isOpen, onClose]);

    const isActive = (href: string) => {
        if (href === '/admin') {
            return pathname === '/admin';
        }
        return pathname.startsWith(href);
    };

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex flex-col w-72 h-screen bg-slate-900 text-white fixed left-0 top-0 z-40 overflow-y-auto">
                {/* Logo */}
                <div className="p-6 border-b border-slate-800">
                    <Link href="/admin" className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
                            <span className="text-2xl">🥜</span>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white">Go Nuts</h1>
                            <p className="text-xs text-slate-400">Admin Panel</p>
                        </div>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-6">
                    {menuSections.map((section) => (
                        <div key={section.title}>
                            <h3 className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                                {section.title}
                            </h3>
                            <ul className="space-y-1">
                                {section.items.map((item) => {
                                    const active = isActive(item.href);
                                    const Icon = item.icon;
                                    
                                    return (
                                        <li key={item.href}>
                                            <Link
                                                href={item.href}
                                                className={`
                                                    flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                                                    transition-all duration-200 min-h-[48px]
                                                    ${active 
                                                        ? 'bg-amber-500 text-slate-900 shadow-lg shadow-amber-500/25' 
                                                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                                    }
                                                `}
                                            >
                                                <Icon className="w-5 h-5 flex-shrink-0" />
                                                <span>{item.label}</span>
                                                {active && (
                                                    <ChevronRight className="w-4 h-4 ml-auto" />
                                                )}
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    ))}
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-slate-800">
                    <Link
                        href="/"
                        target="_blank"
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all min-h-[48px]"
                    >
                        <ExternalLink className="w-5 h-5" />
                        <span className="text-sm font-medium">Xem Website</span>
                    </Link>
                </div>
            </aside>

            {/* Mobile Sidebar Overlay */}
            {isOpen && (
                <div 
                    className="lg:hidden fixed inset-0 bg-black/50 z-40"
                    onClick={onClose}
                />
            )}

            {/* Mobile Sidebar */}
            <aside 
                className={`
                    lg:hidden fixed inset-y-0 left-0 w-72 bg-slate-900 text-white z-50 transform transition-transform duration-300 overflow-y-auto
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                `}
            >
                {/* Mobile Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-800">
                    <Link href="/admin" className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center">
                            <span className="text-xl">🥜</span>
                        </div>
                        <span className="text-lg font-bold text-white">Go Nuts</span>
                    </Link>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Mobile Navigation */}
                <nav className="p-4 space-y-6">
                    {menuSections.map((section) => (
                        <div key={section.title}>
                            <h3 className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                                {section.title}
                            </h3>
                            <ul className="space-y-1">
                                {section.items.map((item) => {
                                    const active = isActive(item.href);
                                    const Icon = item.icon;
                                    
                                    return (
                                        <li key={item.href}>
                                            <Link
                                                href={item.href}
                                                className={`
                                                    flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-medium
                                                    transition-all duration-200 min-h-[52px]
                                                    ${active 
                                                        ? 'bg-amber-500 text-slate-900' 
                                                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                                    }
                                                `}
                                            >
                                                <Icon className="w-5 h-5 flex-shrink-0" />
                                                <span>{item.label}</span>
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    ))}
                </nav>

                {/* Mobile Footer */}
                <div className="p-4 border-t border-slate-800">
                    <Link
                        href="/"
                        target="_blank"
                        className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
                    >
                        <ExternalLink className="w-5 h-5" />
                        <span className="text-base font-medium">Xem Website</span>
                    </Link>
                </div>
            </aside>
        </>
    );
}
