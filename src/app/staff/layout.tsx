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
    TrendingUp,
    DollarSign,
    UserPlus,
    Settings,
    FileText,
    Image as ImageIcon
} from 'lucide-react';

const menuItems = [
    { href: '/staff', icon: LayoutDashboard, label: 'Tổng quan', badge: null },
    { href: '/staff/collaborators', icon: Users, label: 'Cộng tác viên', badge: 'count' },
    { href: '/staff/commissions', icon: Wallet, label: 'Hoa hồng', badge: 'pending' },
    { href: '/staff/orders', icon: ShoppingCart, label: 'Đơn hàng', badge: null },
    { href: '/staff/blogs', icon: FileText, label: 'Quản lý Bài viết', badge: null },
    { href: '/staff/banners', icon: ImageIcon, label: 'Quản lý Banner', badge: null },
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
            <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-brand/20 rounded-full" />
                        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-brand border-t-transparent rounded-full animate-spin" />
                    </div>
                    <div className="text-slate-600 font-medium">Đang tải...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50/50 via-white to-orange-50/30">
            {/* Mobile Header */}
            <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-amber-100/50 h-16 flex items-center justify-between px-4 shadow-sm">
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="p-2.5 hover:bg-amber-50 rounded-xl transition-colors"
                >
                    <Menu className="w-6 h-6 text-slate-700" />
                </button>
                <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand to-brand-light flex items-center justify-center text-gray-800 font-bold shadow-lg shadow-brand/25">
                        {user?.name?.charAt(0)?.toUpperCase() || 'S'}
                    </div>
                    <span className="font-bold text-slate-800">Trang Nhân viên</span>
                </div>
                <div className="w-10" />
            </header>

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div
                        className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                    <div className="absolute inset-y-0 left-0 w-80 bg-white shadow-2xl animate-in slide-in-from-left duration-300">
                        <SidebarContent pathname={pathname} onClose={() => setIsSidebarOpen(false)} user={user} />
                    </div>
                </div>
            )}

            {/* Desktop Sidebar */}
            <aside className="hidden lg:block fixed inset-y-0 left-0 w-72 bg-white border-r border-amber-100/50 z-30 shadow-xl">
                <SidebarContent pathname={pathname} user={user} />
            </aside>

            {/* Main Content */}
            <main className="lg:pl-72 min-h-screen bg-gradient-to-br from-amber-50/30 via-white to-orange-50/20">
                <div className="p-4 sm:p-6 lg:p-8 max-w-full lg:max-w-7xl mx-auto">
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
            <div className="h-20 flex items-center justify-between px-6 border-b border-amber-100/50 bg-gradient-to-r from-brand/5 to-brand-light/5">
                <Link href="/staff" className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand to-brand-light flex items-center justify-center text-gray-800 font-bold shadow-xl shadow-brand/25">
                        GN
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-slate-800 text-lg">Go Nuts</span>
                        <span className="text-[10px] text-brand font-bold uppercase tracking-wider">
                            Staff Portal
                        </span>
                    </div>
                </Link>
                {onClose && (
                    <button onClick={onClose} className="p-2 hover:bg-amber-50 rounded-xl transition-colors">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                )}
            </div>

            {/* User Profile Card */}
            <div className="p-4">
                <div className="bg-gradient-to-br from-brand via-brand-light to-amber-200 rounded-3xl p-5 text-gray-800 shadow-xl shadow-brand/20 relative overflow-hidden">
                    {/* Decorative elements */}
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-gray-800/10 rounded-full" />
                    <div className="absolute bottom-0 right-0 w-20 h-20 bg-gray-800/10 rounded-full" />
                    
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-gray-800/20 backdrop-blur-sm flex items-center justify-center text-gray-800 font-bold text-lg shadow-lg">
                                {user?.name?.charAt(0)?.toUpperCase() || 'S'}
                            </div>
                            <div>
                                <div className="font-bold text-lg text-gray-800">{user?.name}</div>
                                <div className="text-gray-600 text-xs">{user?.email}</div>
                            </div>
                        </div>
                        
                        {user?.staffCode && (
                            <div className="bg-gray-800/10 backdrop-blur-sm rounded-xl px-3 py-2.5 flex items-center gap-2">
                                <div className="flex-1 min-w-0">
                                    <div className="text-[10px] text-gray-600 uppercase tracking-wider mb-0.5">Mã nhân viên</div>
                                    <div className="font-mono font-bold text-gray-800 truncate">{user.staffCode}</div>
                                </div>
                                <button
                                    onClick={copyStaffCode}
                                    className="p-1.5 hover:bg-gray-800/10 rounded-lg transition-colors"
                                >
                                    {copied ? (
                                        <span className="text-sm text-emerald-600">✓</span>
                                    ) : (
                                        <Copy className="w-4 h-4 text-gray-600" />
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto px-3">
                <div className="space-y-1.5">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={onClose}
                                className={`
                                    flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-200 border-2
                                    ${isActive
                                        ? 'bg-brand text-white shadow-lg shadow-brand/30 border-brand transform scale-[1.02]'
                                        : 'text-slate-600 hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 hover:text-brand border-transparent'
                                    }
                                `}
                            >
                                <item.icon size={20} className={isActive ? 'text-white' : ''} />
                                <span className="flex-1">{item.label}</span>
                                {isActive && <ChevronRight size={16} className="text-white/80" />}
                            </Link>
                        );
                    })}
                </div>

                {/* Quick Links */}
                <div className="mt-8 px-4">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Liên kết nhanh</div>
                    <div className="space-y-1">
                        <Link href="/products" className="flex items-center gap-2 px-3 py-2 text-sm text-slate-500 hover:text-brand hover:bg-amber-50 rounded-xl transition-colors">
                            <Package size={16} />
                            <span>Xem sản phẩm</span>
                        </Link>
                        <Link href="/admin" className="flex items-center gap-2 px-3 py-2 text-sm text-slate-500 hover:text-brand hover:bg-amber-50 rounded-xl transition-colors">
                            <Settings size={16} />
                            <span>Quản trị (Admin)</span>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-amber-100/50">
                <Link
                    href="/"
                    className="flex items-center gap-2 px-4 py-3 rounded-2xl text-slate-500 hover:text-brand hover:bg-amber-50 transition-all text-sm font-medium"
                >
                    <ExternalLink size={18} />
                    <span className="flex-1">Về trang chủ</span>
                    <ChevronRight size={16} className="opacity-50" />
                </Link>
            </div>
        </div>
    );
}
