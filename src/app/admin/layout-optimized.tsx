'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import SidebarOptimized, { NavItem } from '@/components/admin/SidebarOptimized';
import AdminHeader from '@/components/admin/Header';
import { useTheme } from 'next-themes';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const { user, loading } = useAuth();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { setTheme } = useTheme();

    // Force light theme for admin
    useEffect(() => {
        setTheme('light');
    }, [setTheme]);

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

    const handleSidebarToggle = () => {
        setIsSidebarOpen(prev => !prev);
    };

    const handleMobileMenuClose = () => {
        setIsSidebarOpen(false);
    };

    const handleMobileMenuClick = () => {
        setIsSidebarOpen(true);
    };

    const userInfo = user ? {
        name: user.name || 'Admin User',
        email: user.email || 'admin@gonuts.com',
    } : undefined;

    const customNavItems: NavItem[] = [
        {
            label: 'Tổng quan',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="text-slate-300">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18" />
                </svg>
            ),
            children: [
                { href: '/admin', label: 'Dashboard' },
            ],
        },
        {
            label: 'Quản lý bán hàng',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="text-slate-300">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 0 1 0v12a4 4 0 0 1-8 0v12a4 4 0 0 1-8zm0 4V5a4 4 0 0 1 0v4a4 4 0 0 1 8zm0 10V15a4 4 0 0 1 0v4a4 4 0 0 1 8zm0 8V9a4 4 0 0 1 0-8 4 0 0 1-8zm0 6V9a4 4 0 0 1 0-8 4 0 0 1-8zm0 0V5a4 4 0 0 1 0v4a4 4 0 0 1 8z" />
                </svg>
            ),
            children: [
                { href: '/admin/orders', label: 'Đơn hàng', badge: 'orders' },
                { href: '/admin/products', label: 'Sản phẩm' },
                { href: '/admin/users', label: 'Người dùng' },
                { href: '/admin/staff', label: 'Staff' },
                { href: '/admin/affiliates', label: 'Đối tác' },
                { href: '/admin/commissions', label: 'Hoa hồng' },
                { href: '/admin/packages', label: 'Gói hội viên' },
            ],
        },
        {
            label: 'Hệ thống',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="text-slate-300">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s-4-4-4 4-4 0-4zm2 12V7a4 4 0 0 1 0v12a4 4 0 0 1-8 0v12a4 4 0 0 1-8zm0 4V5a4 4 0 0 1 0v4a4 4 0 0 1 8zm0 10V15a4 4 4 0 0 1 0v4a4 4 0 0 1 8zm0 8V9a4 4 0 0 1 0-8 4 0 0 1-8zm0 6V9a4 4 0 0 1 0-8 4 0 0 1-8zm0 0V5a4 4 0 0 1 0v4a4 4 0 0 1 8z" />
                </svg>
            ),
            children: [
                { href: '/admin/blogs', label: 'Bài viết' },
                { href: '/admin/banners', label: 'Banner' },
                { href: '/admin/product-tags', label: 'Danh mục sản phẩm' },
                { href: '/admin/vouchers', label: 'Voucher' },
            ],
        },
        {
            label: 'Nội dung',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="text-slate-300">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 19.5A1 1 0 0 1 14 4a1 1 0 0 1 2.5V12h1.5v5.5h8.5a1 1 0 0 1 0 1v12a4 4 0 0 1 8 0 4a4 0 0 0 1 8zm-8.5 3.25a1 1 0 0 0-1 0v12a1 1 0 0 0 1 8 0v12a2 2 0 0 1 8 0 4a4 0 0 0 1-8zm2-2a1 1 0 0 1 2.5V17H8V5.5A1 1 0 0 1 6 4 0 0 1 0h1.5a1 1 0 0 1 8 0 4a4 0 0 0 1 8z" />
                </svg>
            ),
            children: [
                { href: '/admin/settings', label: 'Cài đặt' },
                { href: '/admin/affiliate-settings', label: 'Cấu hình Affiliate' },
                { href: '/admin/vouchers', label: 'Voucher quà tặng' },
                { href: '/admin/packages', label: 'Gói hội viên' },
            ],
        },
        {
            label: 'Analytics',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="text-slate-300">
                    <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2" />
                    <path d="M3 9h18M9 21V3m0 0h18m-9 0v18m-9 0h18" />
                </svg>
            ),
            children: [
                { href: '/admin/analytics', label: 'Dashboard' },
                { href: '/admin/reports', label: 'Báo cáo' },
                { href: '/admin/audit', label: 'Nhật ký' },
            ],
        },
    ];

    const userInfo = user ? {
        name: user.name || 'Admin User',
        email: user.email || 'admin@gonuts.com',
    } : undefined;

    if (loading || !isAuthorized) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin" />
                    <div className="text-slate-600">Đang kiểm tra quyền...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-900">
            {/* Mobile Menu Overlay */}
            <div className={`lg:hidden fixed inset-0 z-50 ${isSidebarOpen ? 'block' : 'hidden'}`}>
                <div
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    onClick={() => setIsSidebarOpen(false)}
                />
                <div className="absolute left-0 top-0 bottom-0 w-80 bg-white shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
                    <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                        <h2 className="font-semibold text-slate-900">Menu</h2>
                        <button
                            onClick={() => setIsSidebarOpen(false)}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="text-slate-600">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="6" />
                            </svg>
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4">
                        {customNavItems.map((item) => (
                            <div key={item.label} className="mb-2">
                                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                                    {item.label}
                                </div>
                                {item.children && item.children.map((child) => (
                                    <Link
                                        key={child.href}
                                        href={child.href}
                                        className="block px-4 py-2 rounded-lg text-slate-700 hover:bg-brand/5 transition-colors"
                                    >
                                        {child.label}
                                    </Link>
                                ))}
                            </div>
                        ))}
                    </div>

                    {userInfo && (
                        <div className="p-4 border-t border-slate-200 mt-auto">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand to-brand-dark flex items-center justify-center text-white font-semibold text-sm">
                                    {(userInfo.name || 'A')[0].toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium text-slate-900 truncate">{userInfo.name}</div>
                                    <div className="text-sm text-slate-500 truncate">{userInfo.email}</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Desktop Sidebar */}
            <SidebarOptimized
                isOpen={true}
                onToggle={() => {}}
                navItems={customNavItems}
                userInfo={userInfo}
            />

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-h-screen">
                {/* Top Bar */}
                <AdminHeader
                    onMenuClick={() => {}}
                    showMobileMenu={isSidebarOpen}
                    onMobileMenuClose={() => setIsSidebarOpen(false)}
                />

                {/* Page Content */}
                <div className="flex-1 p-6">
                    {children}
                </div>
            </main>
        </div>
    );
}
