'use client';

import './admin.css';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import AdminSidebar from '@/components/admin/Sidebar';
import { UserCircle, LogOut, Bell, Search, ChevronRight } from 'lucide-react';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const { user, loading, logout } = useAuth();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);

    const getBreadcrumbs = () => {
        const paths = pathname.split('/').filter(Boolean);
        const breadcrumbs = [{ label: 'Admin', href: '/admin' }];
        
        const labels: Record<string, string> = {
            'orders': 'Đơn hàng',
            'products': 'Sản phẩm',
            'users': 'Người dùng',
            'affiliates': 'Cộng tác viên',
            'commissions': 'Hoa hồng',
            'packages': 'Gói Hội Viên',
            'vouchers': 'Voucher',
            'blogs': 'Bài viết',
            'banners': 'Banner',
            'affiliate-settings': 'Cài đặt Affiliate',
            'new': 'Tạo mới',
        };

        let currentPath = '';
        paths.slice(1).forEach((path) => {
            currentPath += `/${path}`;
            breadcrumbs.push({
                label: labels[path] || path,
                href: `/admin${currentPath}`
            });
        });

        return breadcrumbs;
    };

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push('/login');
            } else if (user.role !== 'admin') {
                alert('Bạn không có quyền truy cập trang này');
                router.push('/');
            } else {
                setIsAuthorized(true);
            }
        }
    }, [user, loading, router]);

    if (loading || !isAuthorized) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                    <div className="text-slate-500 font-medium">Đang kiểm tra quyền truy cập...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-slate-50">
            {/* Sidebar */}
            <AdminSidebar />

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <header className="bg-white shadow-sm border-b border-slate-200 z-10 sticky top-0">
                    <div className="px-4 sm:px-6 lg:px-8">
                        {/* Top Bar */}
                        <div className="h-16 flex items-center justify-between">
                            {/* Search Bar */}
                            <div className="flex-1 max-w-xl hidden md:block">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Tìm kiếm..."
                                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            {/* Right Actions */}
                            <div className="flex items-center gap-3 ml-auto">
                                {/* Notifications */}
                                <button className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                                    <Bell size={20} />
                                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                                </button>

                                {/* User Menu */}
                                <div className="relative">
                                    <button
                                        onClick={() => setShowUserMenu(!showUserMenu)}
                                        className="flex items-center gap-3 pl-3 hover:bg-slate-50 rounded-lg transition-colors"
                                    >
                                        <div className="text-right hidden sm:block">
                                            <div className="text-sm font-medium text-slate-900">{user?.name}</div>
                                            <div className="text-xs text-slate-500">{user?.email}</div>
                                        </div>
                                        <div className="h-10 w-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center text-white font-semibold">
                                            {user?.name?.charAt(0).toUpperCase()}
                                        </div>
                                    </button>

                                    {/* Dropdown Menu */}
                                    {showUserMenu && (
                                        <>
                                            <div
                                                className="fixed inset-0 z-10"
                                                onClick={() => setShowUserMenu(false)}
                                            />
                                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-20">
                                                <Link
                                                    href="/account"
                                                    className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                                                    onClick={() => setShowUserMenu(false)}
                                                >
                                                    <UserCircle size={16} />
                                                    Tài khoản của tôi
                                                </Link>
                                                <Link
                                                    href="/"
                                                    target="_blank"
                                                    className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                                                >
                                                    <ChevronRight size={16} />
                                                    Xem trang chủ
                                                </Link>
                                                <hr className="my-2 border-slate-200" />
                                                <button
                                                    onClick={() => {
                                                        logout?.();
                                                        router.push('/login');
                                                    }}
                                                    className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full"
                                                >
                                                    <LogOut size={16} />
                                                    Đăng xuất
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Breadcrumbs */}
                        <div className="pb-3 flex items-center gap-2 text-sm overflow-x-auto">
                            {getBreadcrumbs().map((crumb, index) => (
                                <div key={crumb.href} className="flex items-center gap-2 whitespace-nowrap">
                                    {index > 0 && <ChevronRight size={14} className="text-slate-400" />}
                                    <Link
                                        href={crumb.href}
                                        className={`${
                                            index === getBreadcrumbs().length - 1
                                                ? 'text-amber-600 font-medium'
                                                : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                    >
                                        {crumb.label}
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50">
                    {children}
                </main>
            </div>
        </div>
    );
}
