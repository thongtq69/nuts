'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
    Bell,
    User,
    LogOut,
    Menu,
    Settings,
    ExternalLink,
    ChevronDown,
    Search
} from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import NotificationDropdown from './NotificationDropdown';

interface HeaderProps {
    onMenuClick: () => void;
}

export default function AdminHeader({ onMenuClick }: HeaderProps) {
    const router = useRouter();
    const { user, logout } = useAuth();
    const [showUserMenu, setShowUserMenu] = useState(false);

    const handleLogout = () => {
        logout?.();
        router.push('/login');
    };

    return (
        <header className="h-20 bg-white border-b border-slate-200 sticky top-0 z-30">
            <div className="h-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
                {/* Left: Menu Button & Search */}
                <div className="flex items-center gap-4 flex-1">
                    <button
                        onClick={onMenuClick}
                        className="lg:hidden p-3 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
                        aria-label="Mở menu"
                    >
                        <Menu className="w-6 h-6" />
                    </button>

                    {/* Search - Desktop */}
                    <div className="hidden md:flex items-center max-w-md flex-1">
                        <div className="relative w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm..."
                                className="w-full pl-12 pr-4 py-3 bg-slate-100 border-0 rounded-xl text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:bg-white transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 sm:gap-3">
                    {/* View Website - Desktop */}
                    <Link
                        href="/"
                        target="_blank"
                        className="hidden sm:flex items-center gap-2 px-4 py-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors text-sm font-medium"
                    >
                        <ExternalLink className="w-4 h-4" />
                        <span className="hidden lg:inline">Xem website</span>
                    </Link>

                    {/* Divider */}
                    <div className="hidden sm:block w-px h-8 bg-slate-200" />

                    {/* Theme Toggle */}
                    <div className="hidden sm:block">
                        <ThemeToggle />
                    </div>

                    {/* Notifications */}
                    <NotificationDropdown />

                    {/* User Menu */}
                    <div className="relative">
                        <button
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-100 transition-colors min-h-[48px]"
                        >
                            <div className="hidden sm:block text-right">
                                <p className="text-sm font-semibold text-slate-900 leading-tight">
                                    {user?.name || 'Admin'}
                                </p>
                                <p className="text-xs text-slate-500">Quản trị viên</p>
                            </div>
                            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md">
                                {user?.name?.charAt(0).toUpperCase() || 'A'}
                            </div>
                            <ChevronDown className={`hidden sm:block w-4 h-4 text-slate-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Dropdown */}
                        {showUserMenu && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setShowUserMenu(false)}
                                />
                                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-20 animate-fade-in">
                                    {/* User Info */}
                                    <div className="px-4 py-3 border-b border-slate-100">
                                        <p className="font-semibold text-slate-900">{user?.name}</p>
                                        <p className="text-sm text-slate-500 truncate">{user?.email}</p>
                                    </div>

                                    {/* Menu Items */}
                                    <div className="p-2">
                                        <Link
                                            href="/account"
                                            className="flex items-center gap-3 px-3 py-2.5 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                                        >
                                            <User className="w-5 h-5 text-slate-400" />
                                            <span className="font-medium">Tài khoản</span>
                                        </Link>
                                        <Link
                                            href="/admin/settings"
                                            className="flex items-center gap-3 px-3 py-2.5 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                                        >
                                            <Settings className="w-5 h-5 text-slate-400" />
                                            <span className="font-medium">Cài đặt</span>
                                        </Link>
                                    </div>

                                    {/* Logout */}
                                    <div className="border-t border-slate-100 p-2">
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <LogOut className="w-5 h-5" />
                                            <span className="font-medium">Đăng xuất</span>
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
