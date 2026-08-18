'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ChevronRight,
    Copy,
    DollarSign,
    ExternalLink,
    KeyRound,
    LayoutDashboard,
    LoaderCircle,
    LogOut,
    Menu,
    Package,
    ShoppingCart,
    Users,
    Wallet,
    X,
} from 'lucide-react';
import ChangePasswordModal from '@/components/account/ChangePasswordModal';
import { useAuth } from '@/context/AuthContext';
import type { AuthUser } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { isCollaboratorAccount } from '@/lib/account-role';

const menuItems = [
    { href: '/agent', icon: LayoutDashboard, label: 'Tổng quan' },
    { href: '/agent/orders', icon: ShoppingCart, label: 'Đơn hàng Đại lý' },
    { href: '/agent/commissions', icon: Wallet, label: 'Hoa hồng' },
    { href: '/agent/collaborators', icon: Users, label: 'Cộng tác viên' },
];

export default function AgentLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const { user, loading, logout } = useAuth();
    const toast = useToast();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    useEffect(() => {
        if (loading) return;
        if (!user) router.push('/login');
        else if (isCollaboratorAccount(user)) router.replace('/collaborator');
        else if (user.role !== 'sale' && user.role !== 'admin') router.push('/');
    }, [loading, router, user]);

    const handleLogout = async () => {
        if (isLoggingOut) return;

        setIsLoggingOut(true);
        const didLogout = await logout();

        if (!didLogout) {
            toast.error('Không thể đăng xuất', 'Vui lòng thử lại.');
            setIsLoggingOut(false);
        }
    };

    const authorized = !loading && user && !isCollaboratorAccount(user)
        && (user.role === 'sale' || user.role === 'admin');
    if (!authorized) {
        return (
            <div className="grid min-h-screen place-items-center bg-slate-50">
                <div className="text-center">
                    <div className="mx-auto mb-3 h-11 w-11 animate-spin rounded-full border-4 border-[#E3C88D] border-t-[#9C7044]" />
                    <p className="text-slate-600">Đang tải...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 lg:flex">
            <header className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:hidden">
                <button onClick={() => setSidebarOpen(true)} className="rounded-lg p-2 hover:bg-slate-100" aria-label="Mở menu"><Menu size={21} /></button>
                <strong>Đại lý</strong>
                <div className="w-9" />
            </header>

            {sidebarOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <button className="absolute inset-0 bg-slate-900/40" onClick={() => setSidebarOpen(false)} aria-label="Đóng menu" />
                    <aside className="absolute inset-y-0 left-0 w-72 bg-white shadow-xl">
                        <Sidebar
                            pathname={pathname}
                            user={user}
                            close={() => setSidebarOpen(false)}
                            onChangePassword={() => {
                                setSidebarOpen(false);
                                setIsChangePasswordOpen(true);
                            }}
                            onLogout={handleLogout}
                            isLoggingOut={isLoggingOut}
                        />
                    </aside>
                </div>
            )}

            <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white lg:flex">
                <Sidebar
                    pathname={pathname}
                    user={user}
                    onChangePassword={() => setIsChangePasswordOpen(true)}
                    onLogout={handleLogout}
                    isLoggingOut={isLoggingOut}
                />
            </aside>

            <main className="min-h-screen flex-1 pt-16 lg:pt-0">
                <div className="mx-auto w-full max-w-[1400px] p-4 sm:p-6 lg:p-8">{children}</div>
            </main>

            <ChangePasswordModal isOpen={isChangePasswordOpen} onClose={() => setIsChangePasswordOpen(false)} />
        </div>
    );
}

interface SidebarProps {
    pathname: string;
    user: AuthUser;
    close?: () => void;
    onChangePassword: () => void;
    onLogout: () => void;
    isLoggingOut: boolean;
}

function Sidebar({ pathname, user, close, onChangePassword, onLogout, isLoggingOut }: SidebarProps) {
    const [copied, setCopied] = useState(false);

    async function copyCode() {
        if (!user?.referralCode) return;
        await navigator.clipboard.writeText(user.referralCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
    }

    return (
        <div className="flex h-full w-full flex-col">
            <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5">
                <Link href="/agent" onClick={close} className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#9C7044] text-sm font-bold text-white">GN</span>
                    <span>
                        <b className="block text-slate-900">Go Nuts</b>
                        <small className="block uppercase tracking-wider text-slate-500">Đại lý</small>
                    </span>
                </Link>
                {close && <button onClick={close} className="rounded-lg p-2 hover:bg-slate-100" aria-label="Đóng menu"><X size={20} /></button>}
            </div>

            <div className="p-4">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="mb-3 flex items-center gap-3">
                        <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#E3C88D] font-bold text-[#7d5a36]">{user?.name?.charAt(0)?.toUpperCase() || 'A'}</span>
                        <span className="min-w-0">
                            <b className="block truncate text-sm text-slate-900">{user?.name}</b>
                            <small className="block truncate text-slate-500">{user?.email}</small>
                        </span>
                    </div>
                    {user?.referralCode && (
                        <button onClick={() => void copyCode()} className="mb-3 flex w-full items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-left">
                            <span className="min-w-0 flex-1">
                                <small className="block uppercase text-slate-500">Mã Đại lý</small>
                                <b className="block truncate font-mono text-sm">{user.referralCode}</b>
                            </span>
                            {copied ? <small className="text-emerald-600">Đã chép</small> : <Copy size={16} className="text-slate-400" />}
                        </button>
                    )}
                    <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2">
                        <span className="flex items-center gap-2 text-xs text-slate-500"><DollarSign size={16} className="text-emerald-600" />Số dư ví</span>
                        <b className="text-sm text-emerald-600">{new Intl.NumberFormat('vi-VN').format(user?.walletBalance || 0)}đ</b>
                    </div>
                </div>
            </div>

            <nav className="flex-1 overflow-y-auto px-3">
                <div className="space-y-1">
                    {menuItems.map((item) => {
                        const active = pathname === item.href || (item.href !== '/agent' && pathname.startsWith(`${item.href}/`));
                        return (
                            <Link key={item.href} href={item.href} onClick={close} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${active ? 'bg-[#F5EFE6] text-[#7d5a36]' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}>
                                <item.icon size={18} />
                                <span className="flex-1">{item.label}</span>
                                {active && <ChevronRight size={14} />}
                            </Link>
                        );
                    })}
                </div>
                <div className="mt-6 px-3">
                    <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Liên kết nhanh</div>
                    <Link href="/products" onClick={close} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-500 hover:bg-slate-50 hover:text-[#9C7044]"><Package size={16} />Xem sản phẩm</Link>
                    <Link href="/agent/collaborators" onClick={close} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-500 hover:bg-slate-50 hover:text-[#9C7044]"><Users size={16} />Tạo cộng tác viên</Link>
                </div>
            </nav>

            <div className="space-y-1 border-t border-slate-200 p-4">
                <button type="button" onClick={onChangePassword} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-[#F5EFE6] hover:text-[#7d5a36]"><KeyRound size={16} /><span className="flex-1 text-left">Đổi mật khẩu</span><ChevronRight size={14} /></button>
                <button type="button" onClick={onLogout} disabled={isLoggingOut} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60">{isLoggingOut ? <LoaderCircle size={16} className="animate-spin" /> : <LogOut size={16} />}<span className="flex-1 text-left">{isLoggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}</span></button>
                <Link href="/" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100"><ExternalLink size={16} /><span className="flex-1">Về trang chủ</span><ChevronRight size={14} /></Link>
            </div>
        </div>
    );
}
