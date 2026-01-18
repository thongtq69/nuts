import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    ChevronDown,
    ChevronRight,
    ChevronLeft,
    LayoutDashboard,
    ShoppingBag,
    Users,
    ShoppingCart,
    Package,
    ClipboardList,
    UserCog,
    Tag,
    Settings,
    Image,
    FileText,
    Gift,
    Zap,
    CreditCard,
    MapPin,
    Globe,
    Shield,
    Menu,
    X,
    Search,
} from 'lucide-react';
import { Button } from './ui/Button';

export interface NavItem {
    label: string;
    href?: string;
    icon?: React.ReactNode;
    badge?: number | string;
    children?: NavItem[];
}

interface SidebarProps {
    isOpen: boolean;
    onToggle: () => void;
    navItems: NavItem[];
    userInfo?: {
        name: string;
        email: string;
        avatar?: string;
    };
}

const defaultNavItems: NavItem[] = [
    {
        label: 'Tổng quan',
        icon: <LayoutDashboard size={20} />,
        children: [
            { label: 'Dashboard', href: '/admin' },
            { label: 'Thống kê', href: '/admin/analytics' },
        ],
    },
    {
        label: 'Quản lý bán hàng',
        icon: <ShoppingBag size={20} />,
        children: [
            { label: 'Đơn hàng', href: '/admin/orders', badge: '12' },
            { label: 'Sản phẩm', href: '/admin/products' },
            { label: 'Người dùng', href: '/admin/users' },
            { label: 'Staff', href: '/admin/staff' },
            { label: 'Đối tác', href: '/admin/affiliates' },
            { label: 'Hoa hồng', href: '/admin/commissions' },
        ],
    },
    {
        label: 'Hệ thống',
        icon: <ClipboardList size={20} />,
        children: [
            { label: 'Tài khoản', href: '/admin/accounts' },
            { label: 'Nhân sự', href: '/admin/personnel' },
            { label: 'Kho hàng', href: '/admin/inventory' },
            { label: 'Vận chuyển', href: '/admin/shipping' },
            { label: 'Thanh toán', href: '/admin/payments' },
        ],
    },
    {
        label: 'Nội dung',
        icon: <FileText size={20} />,
        children: [
            { label: 'Banners', href: '/admin/banners' },
            { label: 'Blogs', href: '/admin/blogs' },
            { label: 'Danh mục sản phẩm', href: '/admin/product-tags' },
        ],
    },
    {
        label: 'Cài đặt',
        icon: <Settings size={20} />,
        children: [
            { label: 'Tổng quan', href: '/admin/settings' },
            { label: 'Hoa hồng', href: '/admin/affiliate-settings' },
            { label: 'Vouchers', href: '/admin/vouchers' },
            { label: 'Gói hội viên', href: '/admin/packages' },
            { label: 'Voucher quà tặng', href: '/admin/voucher-rewards' },
        ],
    },
];

export const Sidebar = ({
    isOpen,
    onToggle,
    navItems = defaultNavItems,
    userInfo,
}: SidebarProps) => {
    const pathname = usePathname();
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
    const [searchQuery, setSearchQuery] = useState('');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const savedExpanded = localStorage.getItem('sidebar-expanded');
        if (savedExpanded) {
            setExpandedSections(new Set(JSON.parse(savedExpanded)));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('sidebar-expanded', JSON.stringify([...expandedSections]));
    }, [expandedSections]);

    const toggleSection = (label: string) => {
        setExpandedSections(prev => {
            const newSet = new Set(prev);
            if (newSet.has(label)) {
                newSet.delete(label);
            } else {
                newSet.add(label);
            }
            return newSet;
        });
    };

    const isSectionActive = (items: NavItem[]): boolean => {
        return items.some(item => (item.href && pathname.startsWith(item.href)) || isSectionActive(item.children || []));
    };

    const isItemActive = (href: string | undefined): boolean => {
        if (!href) return false;
        return pathname === href || pathname.startsWith(href + '/');
    };

    const filterNavItems = (items: NavItem[]): NavItem[] => {
        if (!searchQuery.trim()) {
            return items;
        }

        const query = searchQuery.toLowerCase();

        return items.reduce((filtered, item) => {
            const matchesLabel = item.label.toLowerCase().includes(query);
            const filteredChildren = item.children
                ? filterNavItems(item.children)
                : undefined;

            if (matchesLabel || (filteredChildren && filteredChildren.length > 0)) {
                filtered.push({
                    ...item,
                    children: filteredChildren,
                });
            }

            return filtered;
        }, [] as NavItem[]);
    };

    const renderNavItems = (items: NavItem[], depth = 0): React.ReactNode => {
        return items.map((item) => {
            const hasChildren = item.children && item.children.length > 0;
            const isActive = isItemActive(item.href);
            const isExpanded = expandedSections.has(item.label);

            return (
                <div key={item.href || item.label}>
                    {hasChildren ? (
                        <div>
                            <button
                                onClick={() => toggleSection(item.label)}
                                className={`
                                    w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all
                                    ${isActive || isSectionActive(item.children || [])
                                        ? 'bg-brand/10 text-brand font-semibold'
                                        : 'text-slate-600 hover:bg-slate-50'
                                    }
                                    ${!isOpen && 'px-3'}
                                `}
                            >
                                <div className="flex items-center gap-3">
                                    {item.icon && (
                                        <span className={isSectionActive(item.children || []) ? 'text-brand' : ''}>
                                            {item.icon}
                                        </span>
                                    )}
                                    {isOpen && (
                                        <span className="whitespace-nowrap overflow-hidden">
                                            {item.label}
                                        </span>
                                    )}
                                    {isOpen && item.badge && (
                                        <span className="ml-auto bg-brand text-white text-xs px-2 py-0.5 rounded-full">
                                            {item.badge}
                                        </span>
                                    )}
                                </div>

                                {isOpen && (
                                    <div className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                                        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                    </div>
                                )}
                            </button>

                            {isOpen && isExpanded && (
                                <div className="ml-4 mt-1 space-y-1">
                                    {renderNavItems(item.children!, depth + 1)}
                                </div>
                            )}
                        </div>
                    ) : item.href ? (
                        <Link
                            href={item.href}
                            className={`
                                flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all
                                ${isActive
                                    ? 'bg-brand text-white font-semibold'
                                    : 'text-slate-600 hover:bg-slate-50'
                                }
                                ${!isOpen && 'justify-center px-3'}
                            `}
                        >
                            {item.icon && (
                                <span className={isActive ? 'text-white' : ''}>
                                    {item.icon}
                                </span>
                            )}
                            {isOpen && (
                                <>
                                    <span className="whitespace-nowrap">{item.label}</span>
                                    {item.badge && (
                                        <span className="ml-auto bg-brand text-white text-xs px-2 py-0.5 rounded-full">
                                            {item.badge}
                                        </span>
                                    )}
                                </>
                            )}
                        </Link>
                    ) : null}
                </div>
            );
        });
    };

    const filteredNavItems = filterNavItems(navItems);

    return (
        <>
            <div className={`lg:hidden fixed inset-0 z-50 ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
                <div
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                />

                <div className="absolute left-0 top-0 bottom-0 w-80 bg-white shadow-2xl flex flex-col">
                    <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                        <h2 className="font-semibold text-slate-900">Menu</h2>
                        <button
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            <X size={20} className="text-slate-600" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4">
                        {renderNavItems(filteredNavItems)}
                    </div>

                    {userInfo && (
                        <div className="p-4 border-t border-slate-200 bg-slate-50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-brand rounded-full flex items-center justify-center text-white font-semibold">
                                    {userInfo.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium text-slate-900 truncate">
                                        {userInfo.name}
                                    </div>
                                    <div className="text-sm text-slate-600 truncate">
                                        {userInfo.email}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <aside
                className={`
                    hidden lg:flex flex-col h-full bg-gradient-to-b from-slate-900 to-slate-800
                    transition-all duration-300
                    ${isOpen ? 'w-72' : 'w-20'}
                `}
            >
                <div className="p-4 border-b border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                            <h1 className="font-bold text-white text-lg truncate">
                                {isOpen ? 'Admin Panel' : 'A'}
                            </h1>
                        </div>
                        <button
                            onClick={onToggle}
                            className={`
                                p-2 rounded-lg hover:bg-slate-700 transition-colors
                                ${isOpen ? '' : 'rotate-180'}
                            `}
                        >
                            <ChevronLeft size={20} className="text-slate-300" />
                        </button>
                    </div>
                </div>

                {isOpen && (
                    <div className="p-4">
                        <div className="relative">
                            <Search
                                size={18}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                            />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Tìm kiếm..."
                                className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
                            />
                        </div>
                    </div>
                )}

                <nav className="flex-1 overflow-y-auto px-3 py-4">
                    {renderNavItems(filteredNavItems)}
                </nav>

                {isOpen && userInfo && (
                    <div className="p-4 border-t border-slate-700">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-brand rounded-full flex items-center justify-center text-white font-semibold">
                                {userInfo.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="font-medium text-white truncate">
                                    {userInfo.name}
                                </div>
                                <div className="text-sm text-slate-300 truncate">
                                    {userInfo.email}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </aside>
        </>
    );
};
