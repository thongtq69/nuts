'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import {
    LayoutDashboard,
    Users,
    Wallet,
    ShoppingCart,
    Package,
    Copy,
    ExternalLink,
    Menu,
    X,
    ChevronRight,
    FileText,
    Image as ImageIcon
} from 'lucide-react';

const menuItems = [
    { href: '/staff', icon: LayoutDashboard, label: 'Tổng quan' },
    { href: '/staff/collaborators', icon: Users, label: 'Cộng tác viên' },
    { href: '/staff/commissions', icon: Wallet, label: 'Hoa hồng' },
    { href: '/staff/orders', icon: ShoppingCart, label: 'Đơn hàng' },
    { href: '/staff/blogs', icon: FileText, label: 'Quản lý Bài viết' },
    { href: '/staff/banners', icon: ImageIcon, label: 'Quản lý Banner' },
];

export default function StaffLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const { user, loading } = useAuth();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push('/login');
            } else if (user.role !== 'staff' && user.role !== 'admin') {
                router.push('/');
            } else {
                setIsAuthorized(true);
            }
        }
    }, [user, loading, router]);

    if (loading || !isAuthorized) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                        <div className="w-12 h-12 border-4 border-[#E3C88D] rounded-full" />
                        <div className="absolute top-0 left-0 w-12 h-12 border-4 border-[#9C7044] border-t-transparent rounded-full animate-spin" />
                    </div>
                    <div className="text-slate-600 font-medium">Đang tải...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 lg:flex">
            {/* Mobile Header */}
            <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4">
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                    <Menu className="w-5 h-5 text-slate-600" />
                </button>
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#9C7044] flex items-center justify-center text-white font-bold text-sm">
                        {user?.name?.charAt(0)?.toUpperCase() || 'S'}
                    </div>
                    <span className="font-semibold text-slate-800">Staff Portal</span>
                </div>
                <div className="w-10" />
            </header>

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div
                        className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                    <div className="absolute inset-y-0 left-0 w-72 bg-white shadow-xl animate-in slide-in-from-left duration-300">
                        <SidebarContent pathname={pathname} onClose={() => setIsSidebarOpen(false)} user={user} />
                    </div>
                </div>
            )}

            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex w-64 shrink-0 bg-white border-r border-slate-200 flex-col">
                <SidebarContent pathname={pathname} user={user} />
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-h-screen pt-16 lg:pt-0">
                <div className="p-4 sm:p-6 lg:p-8 w-full max-w-[1400px] mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}

function SidebarContent({ pathname, onClose, user }: { pathname: string; onClose?: () => void; user: any }) {
    const [copied, setCopied] = useState(false);

    const copyStaffCode = () => {
        if (user?.staffCode) {
            navigator.clipboard.writeText(user.staffCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200">
                <Link href="/staff" className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#9C7044] flex items-center justify-center text-white font-bold text-sm">
                        GN
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-slate-900 text-base">Go Nuts</span>
                        <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                            Staff Portal
                        </span>
                    </div>
                </Link>
                {onClose && (
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                )}
            </div>

            {/* User Profile Card */}
            <div className="p-4">
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-[#E3C88D] flex items-center justify-center text-[#7d5a36] font-bold text-sm">
                            {user?.name?.charAt(0)?.toUpperCase() || 'S'}
                        </div>
                        <div className="min-w-0">
                            <div className="font-semibold text-slate-900 text-sm truncate">{user?.name}</div>
                            <div className="text-slate-500 text-xs truncate">{user?.email}</div>
                        </div>
                    </div>

                    {user?.staffCode && (
                        <div className="bg-white rounded-lg px-3 py-2 border border-slate-200 flex items-center gap-2">
                            <div className="flex-1 min-w-0">
                                <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">Mã nhân viên</div>
                                <div className="font-mono font-semibold text-slate-700 text-sm truncate">{user.staffCode}</div>
                            </div>
                            <button
                                onClick={copyStaffCode}
                                className="p-1.5 hover:bg-slate-100 rounded-md transition-colors"
                            >
                                {copied ? (
                                    <span className="text-xs text-green-600 font-medium">Đã copy</span>
                                ) : (
                                    <Copy className="w-4 h-4 text-slate-400" />
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto px-3">
                <div className="space-y-1">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={onClose}
                                className={`
                                    flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                                    ${isActive
                                        ? 'bg-[#F5EFE6] text-[#7d5a36]'
                                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                    }
                                `}
                            >
                                <item.icon size={18} className={isActive ? 'text-[#9C7044]' : 'text-slate-500'} />
                                <span className="flex-1">{item.label}</span>
                                {isActive && <ChevronRight size={14} className="text-[#9C7044]" />}
                            </Link>
                        );
                    })}
                </div>

                {/* Quick Links */}
                <div className="mt-6 px-3">
                    <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Liên kết nhanh</div>
                    <Link href="/products" className="flex items-center gap-2 px-3 py-2 text-sm text-slate-500 hover:text-[#9C7044] hover:bg-slate-50 rounded-lg transition-colors">
                        <Package size={16} />
                        <span>Xem sản phẩm</span>
                    </Link>
                </div>
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200">
                <Link
                    href="/"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all text-sm font-medium"
                >
                    <ExternalLink size={16} />
                    <span className="flex-1">Về trang chủ</span>
                    <ChevronRight size={14} className="opacity-50" />
                </Link>
            </div>
        </div>
    );
}
