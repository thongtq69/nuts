'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
    Search,
    Bell,
    User,
    LogOut,
    Menu,
    X,
    Settings,
    ExternalLink
} from 'lucide-react';
import { Button } from './ui';
import ThemeToggle from '@/components/ThemeToggle';
import NotificationDropdown from './NotificationDropdown';

export default function AdminHeader({
    onMenuClick
}: {
    onMenuClick?: () => void
}) {
    const router = useRouter();
    const { user, logout } = useAuth();
    const [showUserMenu, setShowUserMenu] = useState(false);

    return (
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10 px-4 sm:px-6 lg:px-8">
            <div className="h-full flex items-center justify-between gap-4">
                {/* Left: Mobile Menu & Search */}
                <div className="flex items-center gap-4 flex-1">
                    <button
                        onClick={onMenuClick}
                        className="lg:hidden p-2.5 -ml-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                    >
                        <Menu size={22} />
                    </button>

                    <div className="hidden lg:block w-full max-w-md relative group">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand transition-colors">
                            <Search size={18} />
                        </div>
                        <input
                            type="text"
                            placeholder="Tìm kiếm nhanh (Ctrl + K)..."
                            className="w-full pl-11 pr-4 py-2.5 bg-slate-100/80 dark:bg-slate-800/80 border border-transparent rounded-xl text-sm focus:bg-white dark:focus:bg-slate-900 focus:border-brand/30 focus:shadow-[0_0_15px_rgba(156,112,68,0.1)] dark:text-slate-200 transition-all outline-none"
                        />
                    </div>
                </div>

                {/* Right: Actions & User */}
                <div className="flex items-center gap-2 sm:gap-4">
                    <Button variant="ghost" size="sm" className="hidden sm:flex text-slate-500">
                        <ExternalLink size={18} />
                        <span className="hidden lg:inline ml-2">Xem website</span>
                    </Button>

                    <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>

                    <ThemeToggle />

                    <NotificationDropdown />

                    <div className="relative">
                        <button
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className="flex items-center gap-3 pl-2 py-1 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                            <div className="text-right hidden sm:block">
                                <div className="text-sm font-medium text-slate-900 dark:text-slate-200">{user?.name}</div>
                                <div className="text-xs text-slate-500 dark:text-slate-400">Admin</div>
                            </div>
                            <div className="w-9 h-9 bg-gradient-to-br from-brand-light to-brand rounded-full flex items-center justify-center text-white font-semibold shadow-sm">
                                {user?.name?.charAt(0).toUpperCase() || 'A'}
                            </div>
                        </button>

                        {/* Dropdown */}
                        {showUserMenu && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setShowUserMenu(false)}
                                />
                                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-100 dark:border-slate-800 py-1 z-20 animate-in fade-in zoom-in-95 duration-200">
                                    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 sm:hidden">
                                        <div className="font-medium text-slate-900 dark:text-slate-200">{user?.name}</div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</div>
                                    </div>

                                    <div className="p-1">
                                        <Link href="/account" className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg">
                                            <User size={16} />
                                            Tài khoản
                                        </Link>
                                        <Link href="/admin/settings" className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg">
                                            <Settings size={16} />
                                            Cài đặt
                                        </Link>
                                    </div>

                                    <div className="border-t border-slate-100 dark:border-slate-800 p-1 mt-1">
                                        <button
                                            onClick={() => {
                                                logout?.();
                                                router.push('/login');
                                            }}
                                            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg"
                                        >
                                            <LogOut size={16} />
                                            Đăng xuất
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}

