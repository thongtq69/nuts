'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    Image as ImageIcon,
    FileText,
    Tag,
    Gift,
    Settings,
    DollarSign,
    Menu,
    X,
    ChevronDown,
    ChevronRight,
    Store
} from 'lucide-react';
import { useState } from 'react';

interface MenuItem {
    href?: string;
    label: string;
    icon: any;
    exact?: boolean;
    children?: MenuItem[];
}

export default function AdminSidebar() {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [expandedGroups, setExpandedGroups] = useState<string[]>(['commerce', 'affiliate']);

    const isActive = (path: string) => pathname === path || pathname.startsWith(`${path}/`);

    const toggleGroup = (label: string) => {
        setExpandedGroups(prev =>
            prev.includes(label)
                ? prev.filter(g => g !== label)
                : [...prev, label]
        );
    };

    const menuGroups: MenuItem[] = [
        { href: '/admin', label: 'Tổng quan', icon: LayoutDashboard, exact: true },
        {
            label: 'Thương mại',
            icon: Store,
            children: [
                { href: '/admin/orders', label: 'Đơn hàng', icon: ShoppingCart },
                { href: '/admin/products', label: 'Sản phẩm', icon: Package },
                { href: '/admin/vouchers', label: 'Voucher', icon: Tag },
            ]
        },
        {
            label: 'Affiliate',
            icon: DollarSign,
            children: [
                { href: '/admin/affiliates', label: 'Cộng tác viên', icon: Users },
                { href: '/admin/commissions', label: 'Hoa hồng', icon: Gift },
                { href: '/admin/affiliate-settings', label: 'Cài đặt Affiliate', icon: Settings },
            ]
        },
        {
            label: 'Nội dung',
            icon: FileText,
            children: [
                { href: '/admin/blogs', label: 'Bài viết', icon: FileText },
                { href: '/admin/banners', label: 'Banner', icon: ImageIcon },
            ]
        },
        { href: '/admin/users', label: 'Người dùng', icon: Users },
        { href: '/admin/packages', label: 'Gói Hội Viên', icon: Tag },
    ];

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                className="md:hidden fixed top-4 right-4 z-50 p-2 bg-white rounded-md shadow-md text-gray-700 hover:text-amber-600"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/50 z-40"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed md:static inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-100 shadow-xl transition-transform duration-300 ease-in-out transform 
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                <div className="h-full flex flex-col">
                    <div className="p-6 border-b border-slate-800">
                        <Link href="/admin" className="flex items-center gap-2 font-bold text-xl text-amber-500">
                            <Package className="h-8 w-8" />
                            <span>Go Nuts Admin</span>
                        </Link>
                    </div>

                    <nav className="flex-1 overflow-y-auto py-4">
                        <ul className="space-y-1 px-3">
                            {menuGroups.map((item, index) => {
                                if (item.children) {
                                    const isExpanded = expandedGroups.includes(item.label);
                                    const hasActiveChild = item.children.some(child => child.href && isActive(child.href));

                                    return (
                                        <li key={index}>
                                            <button
                                                onClick={() => toggleGroup(item.label)}
                                                className={`
                                                    w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-md transition-all duration-200
                                                    ${hasActiveChild
                                                        ? 'text-amber-400'
                                                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                                    }
                                                `}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <item.icon size={18} strokeWidth={1.5} />
                                                    <span className="font-medium text-sm">{item.label}</span>
                                                </div>
                                                {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                            </button>
                                            {isExpanded && (
                                                <ul className="mt-1 ml-4 space-y-1 border-l-2 border-slate-800 pl-3">
                                                    {item.children.map((child) => {
                                                        const active = child.exact
                                                            ? pathname === child.href
                                                            : child.href && isActive(child.href);

                                                        return (
                                                            <li key={child.href}>
                                                                <Link
                                                                    href={child.href!}
                                                                    className={`
                                                                        flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200
                                                                        ${active
                                                                            ? 'bg-amber-600 text-white shadow-md'
                                                                            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                                                        }
                                                                    `}
                                                                    onClick={() => setIsMobileMenuOpen(false)}
                                                                >
                                                                    <child.icon size={16} strokeWidth={1.5} />
                                                                    <span className="text-sm">{child.label}</span>
                                                                </Link>
                                                            </li>
                                                        );
                                                    })}
                                                </ul>
                                            )}
                                        </li>
                                    );
                                }

                                const active = item.exact
                                    ? pathname === item.href
                                    : item.href && isActive(item.href);

                                return (
                                    <li key={item.href}>
                                        <Link
                                            href={item.href!}
                                            className={`
                                                flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200
                                                ${active
                                                    ? 'bg-amber-600 text-white shadow-md'
                                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                                }
                                            `}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            <item.icon size={18} strokeWidth={1.5} />
                                            <span className="font-medium text-sm">{item.label}</span>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>

                    <div className="p-4 border-t border-slate-800">
                        <Link
                            href="/"
                            target="_blank"
                            className="flex items-center justify-center gap-2 w-full px-4 py-2 border border-slate-700 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-sm font-medium"
                        >
                            <span>Xem trang chủ</span>
                        </Link>
                    </div>
                </div>
            </aside>
        </>
    );
}
