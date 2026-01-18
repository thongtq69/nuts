'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import {
    LayoutDashboard,
    Users,
    Wallet,
    TrendingUp,
    Copy,
    ExternalLink,
    Menu,
    X,
    ChevronRight
} from 'lucide-react';

const menuItems = [
    { href: '/staff', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/staff/collaborators', icon: Users, label: 'Cộng tác viên' },
    { href: '/staff/commissions', icon: Wallet, label: 'Hoa hồng' },
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
                alert('Bạn không có quyền truy cập trang này');
                router.push('/');
            } else {
                setIsAuthorized(true);
            }
        }
    }, [user, loading, router]);

    if (loading || !isAuthorized) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
                    <div className="text-slate-600 font-medium">Đang kiểm tra quyền truy cập...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-brand-light/20 to-brand/20">
            {/* Mobile Header */}
            <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 h-16 flex items-center justify-between px-4">
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                >
                    <Menu className="w-6 h-6 text-slate-700" />
                </button>
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand to-brand-light flex items-center justify-center text-white font-bold text-sm">
                        S
                    </div>
                    <span className="font-bold text-slate-800">Staff Portal</span>
                </div>
                <div className="w-10" />
            </header>

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                    <div className="absolute inset-y-0 left-0 w-72 bg-white shadow-2xl animate-in slide-in-from-left duration-300">
                        <SidebarContent pathname={pathname} onClose={() => setIsSidebarOpen(false)} user={user} />
                    </div>
                </div>
            )}

            {/* Desktop Sidebar */}
            <aside className="hidden lg:block fixed inset-y-0 left-0 w-72 bg-white border-r border-slate-200/50 z-40">
                <SidebarContent pathname={pathname} user={user} />
            </aside>

            {/* Main Content */}
            <main className="lg:ml-72 min-h-screen pt-16 lg:pt-0">
                <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}

function SidebarContent({ pathname, onClose, user }: { pathname: string; onClose?: () => void; user: any }) {
    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100">
                <Link href="/staff" className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand to-brand-light flex items-center justify-center text-white font-bold shadow-lg shadow-brand/25">
                        S
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-slate-800">Staff Portal</span>
                        <span className="text-[10px] text-brand font-medium uppercase tracking-wider">
                            Quản lý đội nhóm
                        </span>
                    </div>
                </Link>
                {onClose && (
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg lg:hidden">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                )}
            </div>

            {/* User Info */}
            <div className="px-4 py-4 border-b border-slate-100">
                <div className="bg-gradient-to-br from-brand-light/20 to-brand/10 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand to-brand-light flex items-center justify-center text-white font-bold">
                            {user?.name?.charAt(0)?.toUpperCase() || 'S'}
                        </div>
                        <div>
                            <div className="font-semibold text-slate-800">{user?.name}</div>
                            <div className="text-xs text-slate-500">{user?.email}</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm bg-white/60 rounded-lg px-3 py-2">
                        <span className="text-slate-500">Mã nhân viên:</span>
                        <span className="font-mono font-bold text-brand">{user?.staffCode || 'Chưa có'}</span>
                        {user?.staffCode && (
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(user.staffCode);
                                }}
                                className="ml-auto p-1 hover:bg-brand/10 rounded transition-colors"
                            >
                                <Copy className="w-3.5 h-3.5 text-brand" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-4 px-3">
                <div className="space-y-1">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={onClose}
                                className={`
                                    flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                                    ${isActive
                                        ? 'bg-gradient-to-r from-brand to-brand-light text-white shadow-lg shadow-brand/25'
                                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                                    }
                                `}
                            >
                                <item.icon size={20} />
                                <span className="flex-1">{item.label}</span>
                                {isActive && <ChevronRight size={16} />}
                            </Link>
                        );
                    })}
                </div>
            </nav>

            {/* Quick Stats */}
            <div className="px-4 py-4 border-t border-slate-100">
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-emerald-50 rounded-xl p-3 text-center">
                        <div className="text-lg font-bold text-emerald-600">--</div>
                        <div className="text-[10px] text-emerald-600/70 font-medium">Hoa hồng</div>
                    </div>
                    <div className="bg-brand-light/30 rounded-xl p-3 text-center">
                        <div className="text-lg font-bold text-brand">--</div>
                        <div className="text-[10px] text-brand/70 font-medium">CTV</div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100">
                <Link
                    href="/"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors text-sm font-medium"
                >
                    <ExternalLink size={16} />
                    <span>Xem Website</span>
                </Link>
            </div>
        </div>
    );
}
