'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    ChevronDown,
    ChevronRight,
    Search,
    LayoutDashboard,
    ShoppingBag,
    Package,
    Users,
    UserCheck,
    CreditCard,
    Ticket,
    PenTool,
    Image,
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
} from 'lucide-react';

const menuItems = [
    {
        title: 'TỔNG QUAN',
        items: [
            { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
            { href: '/admin/analytics', icon: TrendingUp, label: 'Thống kê' },
        ],
    },
    {
        title: 'QUẢN LÝ BÁN HÀNG',
        items: [
            { href: '/admin/orders', icon: ShoppingBag, label: 'Đơn hàng', badge: 'orders' },
            { href: '/admin/products', icon: Package, label: 'Sản phẩm' },
            { href: '/admin/products/featured', icon: Star, label: 'Sản phẩm Nổi bật' },
            { href: '/admin/products/best-sellers', icon: TrendingUp, label: 'Sản phẩm Bán chạy' },
            { href: '/admin/products/new-products', icon: Sparkles, label: 'Sản phẩm Mới' },
            { href: '/admin/product-tags', icon: Tag, label: 'Tags Sản phẩm' },
            { href: '/admin/vouchers', icon: Ticket, label: 'Voucher' },
        ],
    },
    {
        title: 'HỆ THỐNG',
        items: [
            { href: '/admin/users', icon: Users, label: 'Người dùng' },
            { href: '/admin/staff', icon: UserCheck, label: 'Nhân viên' },
            { href: '/admin/affiliates', icon: UserCheck, label: 'Đối tác' },
            { href: '/admin/commissions', icon: CreditCard, label: 'Hoa hồng' },
            { href: '/admin/packages', icon: Crown, label: 'Gói Hội Viên' },
        ],
    },
    {
        title: 'NỘI DUNG',
        items: [
            { href: '/admin/blogs', icon: PenTool, label: 'Bài viết' },
            { href: '/admin/banners', icon: Image, label: 'Banner' },
            { href: '/admin/contacts', icon: Mail, label: 'Liên hệ' },
            { href: '/admin/product-tags', icon: Tag, label: 'Danh mục sản phẩm' },
        ],
    },
    {
        title: 'CÀI ĐẶT',
        items: [
            { href: '/admin/settings', icon: Settings, label: 'Cài đặt Website' },
            { href: '/admin/affiliate-settings', icon: TrendingUp, label: 'Cấu hình Affiliate' },
            { href: '/admin/voucher-rewards', icon: Gift, label: 'Voucher quà tặng' },
            { href: '/admin/packages', icon: Crown, label: 'Gói hội viên' },
            { href: '/admin/fix-homepage', icon: Home, label: 'Sửa Trang Chủ' },
            { href: '/admin/cloudinary', icon: Cloud, label: 'Quản lý Cloudinary' },
        ],
    },
];

export default function AdminSidebar() {
    const pathname = usePathname();
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

    useEffect(() => {
        const savedExpanded = localStorage.getItem('sidebar-expanded');
        if (savedExpanded) {
            setExpandedSections(new Set(JSON.parse(savedExpanded)));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('sidebar-expanded', JSON.stringify([...expandedSections]));
    }, [expandedSections]);

    const toggleSection = (title: string) => {
        setExpandedSections(prev => {
            const newSet = new Set(prev);
            if (newSet.has(title)) {
                newSet.delete(title);
            } else {
                newSet.add(title);
            }
            return newSet;
        });
    };

    const isSectionActive = (items: typeof menuItems[0]['items']): boolean => {
        return items.some(item => pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href)));
    };

    const filterMenuItems = (items: typeof menuItems): typeof menuItems => {
        if (!searchQuery.trim()) {
            return items;
        }

        const query = searchQuery.toLowerCase();

        return items.filter((group) => {
            const matchesTitle = group.title.toLowerCase().includes(query);
            const matchesItems = group.items.some((item) =>
                item.label.toLowerCase().includes(query)
            );

            return matchesTitle || matchesItems;
        });
    };

    return (
        <aside className="w-64 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-slate-300 flex flex-col fixed inset-y-0 left-0 z-20 border-r border-slate-800/50 transition-colors duration-200">
            <div className="h-16 flex items-center px-6 border-b border-slate-800/50">
                <Link href="/admin" className="flex items-center gap-3 group">
                    <img
                        src="/assets/logo.png"
                        alt="Go Nuts Logo"
                        className="w-10 h-10 rounded-xl object-contain shadow-lg shadow-brand/25 group-hover:shadow-brand/40 transition-shadow"
                    />
                    <div className="flex flex-col">
                        <span className="text-white font-bold text-lg tracking-tight">Go Nuts</span>
                        <span className="text-[10px] text-brand-light/80 font-medium uppercase tracking-wider">Admin Panel</span>
                    </div>
                </Link>
            </div>

            <div className="px-4 py-4 border-b border-slate-800/50">
                <div className="relative group/sidebar-search">
                    <Search
                        size={16}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/sidebar-search:text-brand transition-colors pointer-events-none z-20"
                    />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Tìm menu..."
                        className="w-full pl-12 pr-4 py-2.5 bg-slate-800/30 border border-slate-700/50 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:bg-slate-800/60 focus:border-brand/40 transition-all relative z-10"
                    />
                </div>
            </div>

            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-2">
                {filterMenuItems(menuItems).map((group, groupIndex) => {
                    const isExpanded = expandedSections.has(group.title);
                    const isGroupActive = isSectionActive(group.items);

                    return (
                        <div key={groupIndex} className="mb-1">
                            <button
                                onClick={() => toggleSection(group.title)}
                                className={`
                                    w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                                    ${isGroupActive
                                        ? 'bg-brand/15 text-brand-light'
                                        : 'hover:bg-slate-800/50 hover:text-white'
                                    }
                                `}
                            >
                                <span className="font-semibold text-xs uppercase tracking-wider">
                                    {group.title}
                                </span>
                                <div className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                </div>
                            </button>

                            {isExpanded && (
                                <div className="ml-2 mt-1 space-y-1">
                                    {group.items.map((item, index) => {
                                        const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));

                                        return (
                                            <Link
                                                key={index}
                                                href={item.href}
                                                className={`
                                                    relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                                                    ${isActive
                                                        ? 'bg-gradient-to-r from-brand/20 to-brand-light/15 text-brand-light font-semibold'
                                                        : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                                                    }
                                                `}
                                            >
                                                <div className={`
                                                    w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200
                                                    ${isActive
                                                        ? 'bg-brand'
                                                        : 'bg-slate-800/50'
                                                    }
                                                `}>
                                                    <item.icon size={16} className={isActive ? 'text-white' : 'text-slate-400'} />
                                                </div>
                                                <span className="flex-1 whitespace-nowrap">{item.label}</span>
                                                {isActive && (
                                                    <div className="w-1.5 h-1.5 rounded-full bg-brand-light animate-pulse" />
                                                )}
                                                {item.badge && (
                                                    <span className="ml-auto bg-brand text-white text-[10px] px-2 py-0.5 rounded-full font-medium">
                                                        {item.badge}
                                                    </span>
                                                )}
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </nav>

            <div className="px-4 py-4 border-t border-slate-800/50">
                <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-xl p-4 border border-slate-700/50">
                    <div className="flex items-center gap-2 mb-3">
                        <TrendingUp size={14} className="text-emerald-400" />
                        <span className="text-xs font-semibold text-slate-400">Hôm nay</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <div className="text-lg font-bold text-white">--</div>
                            <div className="text-[10px] text-slate-500">Đơn hàng</div>
                        </div>
                        <div>
                            <div className="text-lg font-bold text-emerald-400">--</div>
                            <div className="text-[10px] text-slate-500">Doanh thu</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-4 border-t border-slate-800/50">
                <Link
                    href="/"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors text-sm"
                >
                    <ExternalLink size={14} />
                    <span>Xem Website</span>
                </Link>
            </div>
        </aside>
    );
}
