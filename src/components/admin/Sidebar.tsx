'use client';

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
    Image,
    Settings,
    Crown
} from 'lucide-react';

const menuItems = [
    {
        title: 'TỔNG QUAN',
        items: [
            { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
        ],
    },
    {
        title: 'QUẢN LÝ BÁN HÀNG',
        items: [
            { href: '/admin/orders', icon: ShoppingBag, label: 'Đơn hàng' },
            { href: '/admin/products', icon: Package, label: 'Sản phẩm' },
            { href: '/admin/vouchers', icon: Ticket, label: 'Vouchher' },
        ],
    },
    {
        title: 'HỆ THỐNG',
        items: [
            { href: '/admin/users', icon: Users, label: 'Người dùng' },
            { href: '/admin/affiliates', icon: UserCheck, label: 'Cộng tác viên' },
            { href: '/admin/commissions', icon: CreditCard, label: 'Hoa hồng' },
            { href: '/admin/packages', icon: Crown, label: 'Gói Hội Viên' },
        ],
    },
    {
        title: 'NỘI DUNG',
        items: [
            { href: '/admin/blogs', icon: PenTool, label: 'Bài viết' },
            { href: '/admin/banners', icon: Image, label: 'Banner' },
        ],
    },
    {
        title: 'CÀI ĐẶT',
        items: [
            { href: '/admin/affiliate-settings', icon: Settings, label: 'Cấu hình Affiliate' },
        ],
    },
];

export default function AdminSidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-64 bg-slate-900 dark:bg-slate-950 text-slate-300 dark:text-slate-400 flex flex-col fixed inset-y-0 left-0 z-20 border-r border-slate-800 dark:border-slate-900 transition-colors duration-200">
            {/* Logo */}
            <div className="h-16 flex items-center px-6 border-b border-slate-800 dark:border-slate-900">
                <Link href="/admin" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold text-lg">
                        G
                    </div>
                    <span className="text-white font-bold text-lg tracking-tight">Go Nuts Admin</span>
                </Link>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto py-6 px-3 space-y-8">
                {menuItems.map((group, groupIndex) => (
                    <div key={groupIndex}>
                        <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                            {group.title}
                        </h3>
                        <div className="space-y-1">
                            {group.items.map((item) => {
                                const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`
                                            flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                                            ${isActive
                                                ? 'bg-amber-600/10 text-amber-500'
                                                : 'hover:bg-slate-800 hover:text-white dark:hover:bg-slate-900'
                                            }
                                        `}
                                    >
                                        <item.icon size={18} className={isActive ? 'text-amber-500' : 'text-slate-400 group-hover:text-white'} />
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer User Info */}
            <div className="p-4 border-t border-slate-800 dark:border-slate-900 bg-slate-900/50 dark:bg-slate-950/50">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-medium text-white">
                        A
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white truncate">Administrator</div>
                        <div className="text-xs text-slate-500 truncate">admin@gonuts.com</div>
                    </div>
                </div>
            </div>
        </aside>
    );
}
