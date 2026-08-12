'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import PasswordInput from '@/components/common/PasswordInput';
import {
    MAX_PASSWORD_LENGTH,
    MIN_PASSWORD_LENGTH,
    getNewPasswordValidationError,
} from '@/lib/password-policy';
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
    Image as ImageIcon,
    Calculator,
    KeyRound,
    LogOut,
    LoaderCircle,
} from 'lucide-react';

const menuItems = [
    { href: '/staff', icon: LayoutDashboard, label: 'Tổng quan' },
    { href: '/staff/collaborators', icon: Users, label: 'Cộng tác viên' },
    { href: '/staff/customers', icon: Users, label: 'Khách hàng của tôi' },
    { href: '/staff/commissions', icon: Wallet, label: 'Hoa hồng' },
    { href: '/staff/payroll', icon: Calculator, label: 'Lương & KPI của tôi' },
    { href: '/staff/orders', icon: ShoppingCart, label: 'Đơn hàng' },
    { href: '/staff/blogs', icon: FileText, label: 'Quản lý Bài viết', permission: 'blogs:create' },
    { href: '/staff/banners', icon: ImageIcon, label: 'Quản lý Banner' },
];

export default function StaffLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const { user, loading, logout } = useAuth();
    const toast = useToast();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    useEffect(() => {
        if (loading) return;
        if (!user) {
            router.replace('/login');
        } else if (user.role !== 'staff' && user.role !== 'admin') {
            router.replace('/');
        }
    }, [user, loading, router]);

    const isAuthorized = Boolean(user && (user.role === 'staff' || user.role === 'admin'));

    const handleLogout = async () => {
        if (isLoggingOut) return;

        setIsLoggingOut(true);
        const didLogout = await logout();

        if (!didLogout) {
            toast.error('Không thể đăng xuất', 'Vui lòng thử lại.');
            setIsLoggingOut(false);
        }
    };

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
                        <SidebarContent
                            pathname={pathname}
                            onClose={() => setIsSidebarOpen(false)}
                            onChangePassword={() => {
                                setIsSidebarOpen(false);
                                setIsChangePasswordOpen(true);
                            }}
                            onLogout={handleLogout}
                            isLoggingOut={isLoggingOut}
                            user={user}
                        />
                    </div>
                </div>
            )}

            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex w-64 shrink-0 bg-white border-r border-slate-200 flex-col">
                <SidebarContent
                    pathname={pathname}
                    onChangePassword={() => setIsChangePasswordOpen(true)}
                    onLogout={handleLogout}
                    isLoggingOut={isLoggingOut}
                    user={user}
                />
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-h-screen pt-16 lg:pt-0">
                <div className="p-4 sm:p-6 lg:p-8 w-full max-w-[1400px] mx-auto">
                    {children}
                </div>
            </main>

            <ChangePasswordModal
                isOpen={isChangePasswordOpen}
                onClose={() => setIsChangePasswordOpen(false)}
            />
        </div>
    );
}

interface SidebarContentProps {
    pathname: string;
    onClose?: () => void;
    onChangePassword: () => void;
    onLogout: () => void;
    isLoggingOut: boolean;
    user: {
        name?: string;
        email?: string;
        role?: string;
        staffCode?: string;
        customPermissions?: readonly string[];
    } | null;
}

function SidebarContent({
    pathname,
    onClose,
    onChangePassword,
    onLogout,
    isLoggingOut,
    user,
}: SidebarContentProps) {
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
                    {menuItems.filter((item) => {
                        if (!item.permission) return true;
                        if (user?.role === 'admin') return true;
                        return user?.customPermissions?.includes(item.permission);
                    }).map((item) => {
                        const isActive = pathname === item.href || (item.href !== '/staff' && pathname.startsWith(`${item.href}/`));
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
            <div className="space-y-1 p-4 border-t border-slate-200">
                <button
                    type="button"
                    onClick={onChangePassword}
                    className="flex w-full items-center gap-2 px-3 py-2 rounded-lg text-slate-600 hover:text-[#7d5a36] hover:bg-[#F5EFE6] transition-all text-sm font-medium"
                >
                    <KeyRound size={16} />
                    <span className="flex-1 text-left">Đổi mật khẩu</span>
                    <ChevronRight size={14} className="opacity-50" />
                </button>
                <button
                    type="button"
                    onClick={onLogout}
                    disabled={isLoggingOut}
                    className="flex w-full items-center gap-2 px-3 py-2 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 transition-all text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {isLoggingOut ? <LoaderCircle size={16} className="animate-spin" /> : <LogOut size={16} />}
                    <span className="flex-1 text-left">{isLoggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}</span>
                </button>
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

function ChangePasswordModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const toast = useToast();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!isOpen) return;

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && !isSubmitting) {
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
                onClose();
            }
        };

        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isOpen, isSubmitting, onClose]);

    if (!isOpen) return null;

    const closeModal = () => {
        if (isSubmitting) return;
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        onClose();
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (newPassword !== confirmPassword) {
            toast.error('Mật khẩu chưa khớp', 'Xác nhận mật khẩu mới không chính xác.');
            return;
        }

        const passwordValidationError = getNewPasswordValidationError(newPassword, currentPassword);
        if (passwordValidationError) {
            toast.error('Mật khẩu chưa hợp lệ', passwordValidationError);
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch('/api/auth/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword, newPassword }),
            });
            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(data.message || 'Không thể đổi mật khẩu');
            }

            toast.success('Đổi mật khẩu thành công', 'Vui lòng đăng nhập lại bằng mật khẩu mới.');
            window.setTimeout(() => window.location.assign('/login'), 600);
        } catch (error) {
            toast.error(
                'Không thể đổi mật khẩu',
                error instanceof Error ? error.message : 'Vui lòng thử lại.',
            );
            setIsSubmitting(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
            onMouseDown={closeModal}
            role="presentation"
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="change-password-title"
                className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
                onMouseDown={(event) => event.stopPropagation()}
            >
                <div className="mb-6 flex items-start justify-between gap-4">
                    <div className="flex gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F5EFE6] text-[#9C7044]">
                            <KeyRound size={20} />
                        </div>
                        <div>
                            <h2 id="change-password-title" className="text-lg font-bold text-slate-900">Đổi mật khẩu</h2>
                            <p className="mt-1 text-sm text-slate-500">Bạn sẽ cần đăng nhập lại sau khi đổi thành công.</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={closeModal}
                        disabled={isSubmitting}
                        aria-label="Đóng"
                        className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <X size={19} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <label className="block">
                        <span className="mb-2 block text-sm font-semibold text-slate-700">Mật khẩu hiện tại</span>
                        <PasswordInput
                            value={currentPassword}
                            onChange={setCurrentPassword}
                            placeholder="Nhập mật khẩu hiện tại"
                            required
                            disabled={isSubmitting}
                            name="currentPassword"
                        />
                    </label>
                    <label className="block">
                        <span className="mb-2 block text-sm font-semibold text-slate-700">Mật khẩu mới</span>
                        <PasswordInput
                            value={newPassword}
                            onChange={setNewPassword}
                            placeholder={`Từ ${MIN_PASSWORD_LENGTH} đến ${MAX_PASSWORD_LENGTH} ký tự`}
                            required
                            disabled={isSubmitting}
                            name="newPassword"
                        />
                    </label>
                    <label className="block">
                        <span className="mb-2 block text-sm font-semibold text-slate-700">Xác nhận mật khẩu mới</span>
                        <PasswordInput
                            value={confirmPassword}
                            onChange={setConfirmPassword}
                            placeholder="Nhập lại mật khẩu mới"
                            required
                            disabled={isSubmitting}
                            name="confirmPassword"
                        />
                    </label>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={closeModal}
                            disabled={isSubmitting}
                            className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#9C7044] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#7d5a36] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isSubmitting && <LoaderCircle size={16} className="animate-spin" />}
                            {isSubmitting ? 'Đang đổi...' : 'Đổi mật khẩu'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
