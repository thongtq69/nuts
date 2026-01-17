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
    Crown,
    TrendingUp,
    ExternalLink,
    Gift
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
            { href: '/admin/orders', icon: ShoppingBag, label: 'Đơn hàng', badge: 'orders' },
            { href: '/admin/products', icon: Package, label: 'Sản phẩm' },
            { href: '/admin/vouchers', icon: Ticket, label: 'Voucher' },
        ],
    },
    {
        title: 'HỆ THỐNG',
        items: [
            { href: '/admin/users', icon: Users, label: 'Người dùng' },
            { href: '/admin/staff', icon: UserCheck, label: 'Nhân viên' },
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
            { href: '/admin/voucher-rewards', icon: Gift, label: 'Tặng Voucher' },
            { href: '/admin/settings', icon: Settings, label: 'Cài đặt Website' },
            { href: '/admin/affiliate-settings', icon: TrendingUp, label: 'Cấu hình Affiliate' },
        ],
    },
];

export default function AdminSidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-64 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-slate-300 flex flex-col fixed inset-y-0 left-0 z-20 border-r border-slate-800/50 transition-colors duration-200">
            {/* Logo */}
            <div className="h-16 flex items-center px-6 border-b border-slate-800/50">
                <Link href="/admin" className="flex items-center gap-3 group">
                    <img
                        src="/assets/logo.png"
                        alt="Go Nuts Logo"
                        className="w-10 h-10 rounded-xl object-contain shadow-lg shadow-amber-500/25 group-hover:shadow-amber-500/40 transition-shadow"
                    />
                    <div className="flex flex-col">
                        <span className="text-white font-bold text-lg tracking-tight">Go Nuts</span>
                        <span className="text-[10px] text-amber-500/80 font-medium uppercase tracking-wider">Admin Panel</span>
                    </div>
                </Link>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto py-6 px-3 space-y-6">
                {menuItems.map((group, groupIndex) => (
                    <div key={groupIndex}>
                        <h3 className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">
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
                                            sidebar-item-glow relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                                            ${isActive
                                                ? 'active bg-gradient-to-r from-amber-500/15 to-orange-500/10 text-amber-400'
                                                : 'hover:bg-slate-800/50 hover:text-white'
                                            }
                                        `}
                                    >
                                        <div className={`
                                            w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200
                                            ${isActive
                                                ? 'bg-gradient-to-br from-amber-500/20 to-orange-500/20'
                                                : 'bg-slate-800/50 group-hover:bg-slate-700/50'
                                            }
                                        `}>
                                            <item.icon size={16} className={isActive ? 'text-amber-400' : 'text-slate-400'} />
                                        </div>
                                        <span className="flex-1">{item.label}</span>
                                        {isActive && (
                                            <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Stats */}
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

            {/* Footer */}
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
