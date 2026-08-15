'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft,
    User,
    Mail,
    Phone,
    Calendar,
    MapPin,
    Shield,
    CreditCard,
    Package,
    Ticket,
    ShoppingBag,
    Edit2,
    Trash2,
    CheckCircle,
    XCircle,
    Crown,
    Users,
    TrendingUp,
    Clock,
    Loader2,
    Link as LinkIcon,
    Copy,
    KeyRound,
    PiggyBank
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { useConfirm } from '@/context/ConfirmContext';
import { usePrompt } from '@/context/PromptContext';
import CustomerOrderDetails from '@/components/customers/CustomerOrderDetails';

interface UserDetail {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    role: 'user' | 'sale' | 'admin' | 'staff';

    saleApplicationStatus?: 'pending' | 'approved' | 'rejected' | null;
    createdAt: string;
    lastLogin?: string;
    address?: string;
    dateOfBirth?: string;
    gender?: string;
    isActive: boolean;
    // Affiliate/Staff Info
    referralCode?: string;
    staffCode?: string;
    saleType?: 'agent' | 'collaborator' | null;
    affiliateLevel?: 'staff' | 'collaborator';
    // Statistics
    totalOrders: number;
    totalSpent: number;
    totalVipSavings: number;
    vipSavingsOrderCount: number;
    vipSavingsOrders: any[];
    membershipPackages: any[];
    vouchers: any[];
    recentOrders: any[];
    managedBy?: {
        _id: string;
        name: string;
        email?: string;
        phone?: string;
        staffCode?: string;
    } | null;
}

export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const [user, setUser] = useState<UserDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const router = useRouter();
    const [userId, setUserId] = useState<string>('');
    const toast = useToast();
    const confirm = useConfirm();
    const prompt = usePrompt();
    const [copied, setCopied] = useState(false);
    const [activeStat, setActiveStat] = useState<'orders' | 'spent' | 'savings' | 'membership' | 'vouchers'>('orders');

    useEffect(() => {
        params.then(({ id }) => {
            setUserId(id);
            fetchUserDetail(id);
        });
    }, [params]);

    const fetchUserDetail = async (id: string) => {
        try {
            setLoading(true);
            const res = await fetch(`/api/admin/users/${id}/detail`);
            if (res.ok) {
                const data = await res.json();
                setUser(data);
            } else {
                router.push('/admin/users');
            }
        } catch (error) {
            console.error('Error fetching user detail:', error);
            router.push('/admin/users');
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (newRole: 'user' | 'sale' | 'staff' | 'collaborator') => {
        const roleLabels = {
            user: 'Khách hàng',
            sale: 'Đại lý',
            staff: 'Nhân viên',
            collaborator: 'Cộng tác viên',
        };
        const confirmed = await confirm({
            title: 'Xác nhận đổi quyền',
            description: `Chuyển tài khoản này thành ${roleLabels[newRole]}? Tài khoản sẽ được áp dụng đúng quyền và trang quản lý tương ứng.`,
            confirmText: 'Xác nhận',
            cancelText: 'Hủy',
        });

        if (!confirmed) return;

        try {
            setUpdating(true);
            const res = await fetch(`/api/admin/users/${userId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: newRole }),
            });
            const data = await res.json();
            if (res.ok) {
                await fetchUserDetail(userId);
                toast.success('Đã cập nhật quyền', `Tài khoản đã được chuyển thành ${roleLabels[newRole]}.`);
            } else {
                toast.error('Không thể cập nhật quyền', data.error || 'Vui lòng thử lại.');
            }
        } catch (error) {
            console.error('Error changing role:', error);
            toast.error('Không thể cập nhật quyền', 'Vui lòng thử lại.');
        } finally {
            setUpdating(false);
        }
    };

    const handleToggleActive = async () => {
        if (!user) return;

        try {
            setUpdating(true);
            const res = await fetch(`/api/admin/users/${userId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !user.isActive }),
            });
            if (res.ok) {
                fetchUserDetail(userId);
            }
        } catch (error) {
            console.error('Error toggling active status:', error);
        } finally {
            setUpdating(false);
        }
    };

    const handleSetPassword = async () => {
        if (!user) return;
        const password = await prompt({
            title: 'Cấp mật khẩu đăng nhập',
            description: `Nhập mật khẩu mới cho ${user.name} (ít nhất 8 ký tự). Hệ thống sẽ gửi thông tin này tới ${user.email}.`,
            placeholder: 'Mật khẩu mới (ít nhất 8 ký tự)',
            confirmText: 'Lưu và gửi email',
            cancelText: 'Hủy',
            inputType: 'password',
        });

        if (password === null) return;
        if (password.length < 8) {
            toast.warning('Mật khẩu chưa hợp lệ', 'Mật khẩu phải có ít nhất 8 ký tự.');
            return;
        }

        setUpdating(true);
        try {
            const res = await fetch(`/api/admin/users/${userId}/password`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password, sendEmail: true }),
            });
            const data = await res.json();
            if (res.ok) {
                toast.success('Đã cấp mật khẩu', data.message);
            } else {
                toast.error('Không thể cấp mật khẩu', data.message || 'Vui lòng thử lại.');
            }
        } catch {
            toast.error('Không thể cấp mật khẩu', 'Vui lòng thử lại.');
        } finally {
            setUpdating(false);
        }
    };

    const handleDelete = async () => {
        if (!user) return;
        if (user.role === 'admin') {
            toast.warning('Không thể xóa tài khoản Admin', 'Hãy chọn tài khoản khác.');
            return;
        }
        const confirmed = await confirm({
            title: 'Xác nhận xóa người dùng',
            description: `Bạn có chắc muốn xóa người dùng "${user.name}"? Hành động này không thể hoàn tác.`,
            confirmText: 'Xóa người dùng',
            cancelText: 'Hủy',
        });

        if (!confirmed) return;

        try {
            setUpdating(true);
            const res = await fetch(`/api/admin/users/${userId}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                router.push('/admin/users');
            } else {
                const data = await res.json();
                toast.error('Lỗi xóa người dùng', data.error || 'Vui lòng thử lại.');
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            toast.error('Lỗi xóa người dùng', 'Vui lòng thử lại.');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-brand" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="text-center py-20">
                <p className="text-slate-500">Không tìm thấy người dùng</p>
                <Link href="/admin/users" className="text-brand hover:underline mt-4 inline-block">
                    ← Quay lại danh sách
                </Link>
            </div>
        );
    }

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'admin': return 'bg-red-100 text-red-600 border-red-200';
            case 'sale': return 'bg-amber-100 text-amber-600 border-amber-200';
            case 'staff': return 'bg-violet-100 text-violet-600 border-violet-200';
            default: return 'bg-slate-100 text-slate-600 border-slate-200';

        }
    };

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'admin': return <Shield size={16} />;
            case 'sale': return <Users size={16} />;
            case 'staff': return <Crown size={16} />;
            default: return <User size={16} />;

        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/users"
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Chi tiết người dùng</h1>
                        <p className="text-slate-500">Thông tin chi tiết và quản lý người dùng</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleSetPassword}
                        disabled={updating}
                        className="px-4 py-2 bg-brand-light/30 text-brand-dark hover:bg-brand-light/50 rounded-lg font-medium transition-all"
                    >
                        <KeyRound size={16} className="inline mr-2" />
                        Cấp mật khẩu
                    </button>
                    <button
                        onClick={handleToggleActive}
                        disabled={updating}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${user.isActive
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                    >
                        {user.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
                    </button>

                    {user.role !== 'admin' && (
                        <button
                            onClick={handleDelete}
                            disabled={updating}
                            className="px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg font-medium transition-all"
                        >
                            <Trash2 size={16} className="inline mr-2" />
                            Xóa người dùng
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Thông tin cơ bản */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Profile Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="bg-gradient-to-r from-brand to-brand-dark p-6 text-white">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-2xl font-bold">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold">{user.name}</h2>
                                    <p className="text-white/80">{user.email}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getRoleColor(user.role)}`}>
                                            {getRoleIcon(user.role)}
                                            {user.role === 'user' ? 'Khách hàng' :
                                                user.role === 'sale' && (user.affiliateLevel === 'collaborator' || user.saleType === 'collaborator') ? 'Cộng tác viên' :
                                                    user.role === 'sale' ? 'Đại lý' :
                                                    user.role === 'staff' ? 'Nhân viên' : 'Admin'}

                                        </span>
                                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                            {user.isActive ? <CheckCircle size={14} /> : <XCircle size={14} />}
                                            {user.isActive ? 'Hoạt động' : 'Vô hiệu hóa'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <Mail className="text-slate-400" size={18} />
                                        <div>
                                            <p className="text-sm text-slate-500">Email</p>
                                            <p className="font-medium">{user.email}</p>
                                        </div>
                                    </div>

                                    {user.phone && (
                                        <div className="flex items-center gap-3">
                                            <Phone className="text-slate-400" size={18} />
                                            <div>
                                                <p className="text-sm text-slate-500">Số điện thoại</p>
                                                <p className="font-medium">{user.phone}</p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-3">
                                        <Calendar className="text-slate-400" size={18} />
                                        <div>
                                            <p className="text-sm text-slate-500">Ngày tham gia</p>
                                            <p className="font-medium">{new Date(user.createdAt).toLocaleDateString('vi-VN')}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {user.address && (
                                        <div className="flex items-center gap-3">
                                            <MapPin className="text-slate-400" size={18} />
                                            <div>
                                                <p className="text-sm text-slate-500">Địa chỉ</p>
                                                <p className="font-medium">{user.address}</p>
                                            </div>
                                        </div>
                                    )}

                                    {user.lastLogin && (
                                        <div className="flex items-center gap-3">
                                            <Clock className="text-slate-400" size={18} />
                                            <div>
                                                <p className="text-sm text-slate-500">Lần đăng nhập cuối</p>
                                                <p className="font-medium">{new Date(user.lastLogin).toLocaleDateString('vi-VN')}</p>
                                            </div>
                                        </div>
                                    )}

                                    {user.saleApplicationStatus === 'pending' && (
                                        <div className="bg-brand-light/30 border border-brand-light/50 rounded-lg p-3">
                                            <p className="text-brand-dark font-medium text-sm">
                                                🕐 Đang chờ duyệt đăng ký đại lý
                                            </p>
                                        </div>
                                    )}

                                    {user.role === 'user' && (
                                        <div className="flex items-center gap-3">
                                            <Users className="text-[#9C7044]" size={18} />
                                            <div>
                                                <p className="text-sm text-slate-500">Nhân viên quản lý</p>
                                                {user.managedBy ? (
                                                    <div>
                                                        <Link href={`/admin/users/${user.managedBy._id}`} className="font-semibold text-[#7d5a36] hover:underline">
                                                            {user.managedBy.name}
                                                        </Link>
                                                        <p className="text-xs text-slate-500">
                                                            {user.managedBy.staffCode || user.managedBy.email || ''}
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <p className="font-medium text-slate-400">Chưa gắn với nhân viên</p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quản lý Role */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Shield className="text-brand" size={20} />
                            Quản lý quyền
                        </h3>

                        <div className="flex flex-wrap gap-3">
                            {user.role === 'user' && !user.saleApplicationStatus && (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleRoleChange('sale')}
                                        disabled={updating}
                                        className="px-4 py-2 bg-amber-100 text-amber-700 hover:bg-amber-200 rounded-lg font-medium transition-all"
                                    >
                                        Nâng cấp Đại lý
                                    </button>
                                    <button
                                        onClick={() => handleRoleChange('staff')}
                                        disabled={updating}
                                        className="px-4 py-2 bg-violet-100 text-violet-700 hover:bg-violet-200 rounded-lg font-medium transition-all"
                                    >
                                        Nâng cấp Nhân viên
                                    </button>
                                    <button
                                        onClick={() => handleRoleChange('collaborator')}
                                        disabled={updating}
                                        className="px-4 py-2 bg-sky-100 text-sky-700 hover:bg-sky-200 rounded-lg font-medium transition-all"
                                    >
                                        Chuyển thành Cộng tác viên
                                    </button>
                                </div>
                            )}

                            {(user.role === 'sale' || user.role === 'staff') && (
                                <div className="flex flex-wrap gap-2">
                                    {user.role === 'sale' && user.affiliateLevel !== 'collaborator' && user.saleType !== 'collaborator' && (
                                        <button
                                            onClick={() => handleRoleChange('staff')}
                                            disabled={updating}
                                            className="px-4 py-2 bg-violet-100 text-violet-700 hover:bg-violet-200 rounded-lg font-medium transition-all"
                                        >
                                            Chuyển thành Nhân viên
                                        </button>
                                    )}
                                    {user.role === 'staff' && (
                                        <button
                                            onClick={() => handleRoleChange('sale')}
                                            disabled={updating}
                                            className="px-4 py-2 bg-amber-100 text-amber-700 hover:bg-amber-200 rounded-lg font-medium transition-all"
                                        >
                                            Chuyển thành Đại lý
                                        </button>
                                    )}
                                    {(user.affiliateLevel !== 'collaborator' && user.saleType !== 'collaborator') && (
                                        <button
                                            onClick={() => handleRoleChange('collaborator')}
                                            disabled={updating}
                                            className="px-4 py-2 bg-sky-100 text-sky-700 hover:bg-sky-200 rounded-lg font-medium transition-all"
                                        >
                                            Chuyển thành Cộng tác viên
                                        </button>
                                    )}
                                    {(user.affiliateLevel === 'collaborator' || user.saleType === 'collaborator') && (
                                        <>
                                            <button
                                                onClick={() => handleRoleChange('sale')}
                                                disabled={updating}
                                                className="px-4 py-2 bg-amber-100 text-amber-700 hover:bg-amber-200 rounded-lg font-medium transition-all"
                                            >
                                                Chuyển thành Đại lý
                                            </button>
                                            <button
                                                onClick={() => handleRoleChange('staff')}
                                                disabled={updating}
                                                className="px-4 py-2 bg-violet-100 text-violet-700 hover:bg-violet-200 rounded-lg font-medium transition-all"
                                            >
                                                Chuyển thành Nhân viên
                                            </button>
                                        </>
                                    )}
                                    <button
                                        onClick={() => handleRoleChange('user')}
                                        disabled={updating}
                                        className="px-4 py-2 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg font-medium transition-all"
                                    >
                                        Hạ cấp xuống Khách hàng
                                    </button>
                                </div>
                            )}


                            {user.saleApplicationStatus === 'pending' && (
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        onClick={() => {
                                            // Handle approve sale application
                                            fetch(`/api/admin/users/${userId}/approve-sale`, { method: 'POST' })
                                                .then(() => fetchUserDetail(userId));
                                        }}
                                        className="px-4 py-2 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg font-medium transition-all"
                                    >
                                        <CheckCircle size={16} className="inline mr-2" />
                                        Duyệt đại lý
                                    </button>
                                    <button
                                        onClick={() => {
                                            prompt({
                                                title: 'Lý do từ chối',
                                                description: 'Nhập lý do từ chối:',
                                                placeholder: 'Lý do từ chối...',
                                                confirmText: 'Gửi',
                                                cancelText: 'Hủy',
                                            }).then((reason) => {
                                                if (reason !== null) {
                                                    fetch(`/api/admin/users/${userId}/reject-sale`, {
                                                        method: 'POST',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify({ reason })
                                                    }).then(() => fetchUserDetail(userId));
                                                }
                                            });
                                        }}
                                        className="px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg font-medium transition-all"
                                    >
                                        <XCircle size={16} className="inline mr-2" />
                                        Từ chối
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Affiliate/Staff Referral Link Section */}
                    {(user.role === 'sale' || user.role === 'staff') && (
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <LinkIcon size={20} className="text-brand" />
                                Thông tin giới thiệu
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm text-slate-500 mb-1">Mã định danh</p>
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono font-bold text-lg bg-slate-100 px-3 py-1 rounded-lg">
                                                {user.role === 'staff' ? user.staffCode : user.referralCode}
                                                {!(user.role === 'staff' ? user.staffCode : user.referralCode) && 'Chưa có mã'}
                                            </span>
                                            {(user.role === 'staff' ? user.staffCode : user.referralCode) && (
                                                <button
                                                    onClick={() => {
                                                        const code = user.role === 'staff' ? user.staffCode : user.referralCode;
                                                        if (code) {
                                                            navigator.clipboard.writeText(code);
                                                            toast.success('Đã sao chép mã', 'Mã giới thiệu đã được lưu vào bộ nhớ tạm.');
                                                        }
                                                    }}
                                                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-brand"
                                                    title="Sao chép mã"
                                                >
                                                    <Copy size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm text-slate-500 mb-1">Link giới thiệu khách hàng</p>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                readOnly
                                                value={(user.role === 'staff' ? (user.staffCode || user.referralCode) : user.referralCode)
                                                    ? `${typeof window !== 'undefined' ? window.location.origin : ''}?ref=${user.role === 'staff' ? (user.staffCode || user.referralCode) : user.referralCode}`
                                                    : 'Chưa có mã giới thiệu'}
                                                className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm font-mono text-slate-600 truncate"
                                            />
                                            <button
                                                onClick={() => {
                                                    const code = user.role === 'staff' ? (user.staffCode || user.referralCode) : user.referralCode;
                                                    if (code) {
                                                        const link = `${window.location.origin}?ref=${code}`;
                                                        navigator.clipboard.writeText(link);
                                                        setCopied(true);
                                                        toast.success('Đã sao chép link', 'Link giới thiệu đã được lưu vào bộ nhớ tạm.');
                                                        setTimeout(() => setCopied(false), 2000);
                                                    }
                                                }}
                                                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${copied
                                                    ? 'bg-green-100 text-green-700 border border-green-200'
                                                    : 'bg-brand text-white hover:bg-brand-dark'
                                                    }`}
                                            >
                                                {copied ? 'Đã sao!' : 'Sao chép'}
                                            </button>
                                        </div>
                                        <p className="text-xs text-slate-400 mt-2">
                                            * Khách hàng đặt hàng qua link này sẽ được ghi nhận doanh số cho {user.role === 'staff'
                                                ? 'Nhân viên'
                                                : user.affiliateLevel === 'collaborator' || user.saleType === 'collaborator'
                                                    ? 'Cộng tác viên'
                                                    : 'Đại lý'}.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar - Thống kê */}
                <div className="space-y-6">
                    {/* Thống kê tổng quan */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <TrendingUp className="text-green-600" size={20} />
                            Thống kê
                        </h3>

                        <div className="space-y-4">
                            <button onClick={() => setActiveStat('orders')} className={`w-full flex items-center justify-between p-3 bg-brand/10 rounded-lg border-2 transition-all ${activeStat === 'orders' ? 'border-brand' : 'border-transparent'}`}>
                                <div className="flex items-center gap-3">
                                    <ShoppingBag className="text-brand" size={18} />
                                    <span className="text-sm font-medium">Đơn hàng</span>
                                </div>
                                <span className="font-bold text-brand">{user.totalOrders}</span>
                            </button>

                            <button onClick={() => setActiveStat('spent')} className={`w-full flex items-center justify-between p-3 bg-green-50 rounded-lg border-2 transition-all ${activeStat === 'spent' ? 'border-green-500' : 'border-transparent'}`}>
                                <div className="flex items-center gap-3">
                                    <CreditCard className="text-green-600" size={18} />
                                    <span className="text-sm font-medium">Tổng chi tiêu</span>
                                </div>
                                <span className="font-bold text-green-600">
                                    {new Intl.NumberFormat('vi-VN').format(user.totalSpent)}đ
                                </span>
                            </button>

                            <button onClick={() => setActiveStat('savings')} className={`w-full flex items-center justify-between p-3 bg-teal-50 rounded-lg border-2 transition-all ${activeStat === 'savings' ? 'border-teal-500' : 'border-transparent'}`}>
                                <div className="flex items-center gap-3">
                                    <PiggyBank className="text-teal-600" size={18} />
                                    <span className="text-sm font-medium">Tiết kiệm nhờ VIP</span>
                                </div>
                                <span className="font-bold text-teal-700">{new Intl.NumberFormat('vi-VN').format(user.totalVipSavings || 0)}đ</span>
                            </button>

                            <button onClick={() => setActiveStat('membership')} className={`w-full flex items-center justify-between p-3 bg-purple-50 rounded-lg border-2 transition-all ${activeStat === 'membership' ? 'border-purple-500' : 'border-transparent'}`}>
                                <div className="flex items-center gap-3">
                                    <Package className="text-purple-600" size={18} />
                                    <span className="text-sm font-medium">Gói hội viên</span>
                                </div>
                                <span className="font-bold text-purple-600">{user.membershipPackages.length}</span>
                            </button>

                            <button onClick={() => setActiveStat('vouchers')} className={`w-full flex items-center justify-between p-3 bg-amber-50 rounded-lg border-2 transition-all ${activeStat === 'vouchers' ? 'border-amber-500' : 'border-transparent'}`}>
                                <div className="flex items-center gap-3">
                                    <Ticket className="text-amber-600" size={18} />
                                    <span className="text-sm font-medium">Voucher</span>
                                </div>
                                <span className="font-bold text-amber-600">{user.vouchers.length}</span>
                            </button>

                            <div className="border-t border-slate-100 pt-4 mt-4">
                                {activeStat === 'orders' && (
                                    <div className="space-y-2">
                                        <p className="font-semibold text-sm text-slate-700">Đơn hàng gần đây</p>
                                        {user.recentOrders.length === 0 ? <p className="text-xs text-slate-400">Chưa có đơn hàng.</p> : user.recentOrders.slice(0, 5).map((order: any) => (
                                            <Link key={order._id} href={`/admin/orders/${order._id}`} className="flex justify-between p-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-xs">
                                                <span>#{order._id.slice(-6).toUpperCase()}</span>
                                                <strong>{new Intl.NumberFormat('vi-VN').format(order.totalAmount || 0)}đ</strong>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                                {activeStat === 'spent' && (
                                    <div><p className="text-sm font-semibold text-slate-700">Tổng tiền từ các đơn đã thanh toán</p><p className="text-xl font-bold text-green-600 mt-1">{new Intl.NumberFormat('vi-VN').format(user.totalSpent)}đ</p></div>
                                )}
                                {activeStat === 'savings' && (
                                    <div className="space-y-2">
                                        <p className="text-sm font-semibold text-slate-700">Tiền khách hàng đã tiết kiệm nhờ gói VIP</p>
                                        <p className="text-xl font-bold text-teal-700">{new Intl.NumberFormat('vi-VN').format(user.totalVipSavings || 0)}đ</p>
                                        <p className="text-xs text-slate-500">Từ {user.vipSavingsOrderCount || 0} đơn đã thanh toán có sử dụng voucher VIP.</p>
                                    </div>
                                )}
                                {activeStat === 'membership' && (
                                    <div className="space-y-2"><p className="font-semibold text-sm text-slate-700">Gói hội viên đã kích hoạt</p>{user.membershipPackages.length === 0 ? <p className="text-xs text-slate-400">Chưa có gói đã kích hoạt.</p> : user.membershipPackages.map((item: any) => <div key={item._id} className="p-2 rounded-lg bg-purple-50 text-xs">{item.packageId?.name || item.packageInfo?.name || 'Gói hội viên'}</div>)}</div>
                                )}
                                {activeStat === 'vouchers' && (
                                    <div className="space-y-2"><p className="font-semibold text-sm text-slate-700">Voucher của khách hàng</p>{user.vouchers.length === 0 ? <p className="text-xs text-slate-400">Chưa có voucher.</p> : user.vouchers.slice(0, 10).map((voucher: any) => <div key={voucher._id} className="flex justify-between p-2 rounded-lg bg-amber-50 text-xs"><span className="font-mono font-semibold">{voucher.code}</span><span>{voucher.isUsed ? 'Đã dùng' : 'Chưa dùng'}</span></div>)}</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Đơn hàng gần đây */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h3 className="text-lg font-bold text-slate-800 mb-4">Chi tiết đơn hàng gần đây</h3>

                        {user.recentOrders.length > 0 ? (
                            <div className="space-y-3">
                                <CustomerOrderDetails orders={user.recentOrders} adminLinks limit={5} />

                                <Link
                                    href={`/admin/orders?userId=${userId}`}
                                    className="block text-center text-blue-600 hover:underline text-sm mt-3"
                                >
                                    Xem tất cả đơn hàng →
                                </Link>
                            </div>
                        ) : (
                            <p className="text-slate-500 text-sm text-center py-4">Chưa có đơn hàng nào</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
