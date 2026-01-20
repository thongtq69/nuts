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
    Loader2
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { useConfirm } from '@/context/ConfirmContext';
import { usePrompt } from '@/context/PromptContext';

interface UserDetail {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    role: 'user' | 'sale' | 'admin';
    saleApplicationStatus?: 'pending' | 'approved' | 'rejected' | null;
    createdAt: string;
    lastLogin?: string;
    address?: string;
    dateOfBirth?: string;
    gender?: string;
    isActive: boolean;
    // Statistics
    totalOrders: number;
    totalSpent: number;
    membershipPackages: any[];
    vouchers: any[];
    recentOrders: any[];
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

    const handleRoleChange = async (newRole: string) => {
        const confirmed = await confirm({
            title: 'Xác nhận đổi quyền',
            description: `Đổi role thành ${newRole}?`,
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
            if (res.ok) {
                fetchUserDetail(userId);
            }
        } catch (error) {
            console.error('Error changing role:', error);
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
            case 'admin': return 'bg-brand/10 text-brand border-brand/20';
            case 'sale': return 'bg-brand-light/30 text-brand-dark border-brand-light/50';
            default: return 'bg-slate-100 text-slate-600 border-slate-200';
        }
    };

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'admin': return <Crown size={16} />;
            case 'sale': return <Users size={16} />;
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
                        onClick={handleToggleActive}
                        disabled={updating}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                            user.isActive 
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
                                            {user.role === 'user' ? 'Khách hàng' : user.role === 'sale' ? 'Đại lý' : 'Admin'}
                                        </span>
                                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                                            user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
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
                        
                        <div className="flex gap-3">
                            {user.role === 'user' && !user.saleApplicationStatus && (
                                <button
                                    onClick={() => handleRoleChange('sale')}
                                    disabled={updating}
                                    className="px-4 py-2 bg-brand-light/30 text-brand-dark hover:bg-brand-light/50 rounded-lg font-medium transition-all"
                                >
                                    Nâng cấp thành Đại lý
                                </button>
                            )}
                            
                            {user.role === 'sale' && (
                                <button
                                    onClick={() => handleRoleChange('user')}
                                    disabled={updating}
                                    className="px-4 py-2 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg font-medium transition-all"
                                >
                                    Hạ cấp xuống Khách hàng
                                </button>
                            )}

                            {user.saleApplicationStatus === 'pending' && (
                                <div className="flex gap-2">
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
                            <div className="flex items-center justify-between p-3 bg-brand/10 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <ShoppingBag className="text-brand" size={18} />
                                    <span className="text-sm font-medium">Đơn hàng</span>
                                </div>
                                <span className="font-bold text-brand">{user.totalOrders}</span>
                            </div>
                            
                            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <CreditCard className="text-green-600" size={18} />
                                    <span className="text-sm font-medium">Tổng chi tiêu</span>
                                </div>
                                <span className="font-bold text-green-600">
                                    {new Intl.NumberFormat('vi-VN').format(user.totalSpent)}đ
                                </span>
                            </div>
                            
                            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Package className="text-purple-600" size={18} />
                                    <span className="text-sm font-medium">Gói hội viên</span>
                                </div>
                                <span className="font-bold text-purple-600">{user.membershipPackages.length}</span>
                            </div>
                            
                            <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Ticket className="text-amber-600" size={18} />
                                    <span className="text-sm font-medium">Voucher</span>
                                </div>
                                <span className="font-bold text-amber-600">{user.vouchers.length}</span>
                            </div>
                        </div>
                    </div>

                    {/* Đơn hàng gần đây */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h3 className="text-lg font-bold text-slate-800 mb-4">Đơn hàng gần đây</h3>
                        
                        {user.recentOrders.length > 0 ? (
                            <div className="space-y-3">
                                {user.recentOrders.slice(0, 5).map((order: any) => (
                                    <div key={order._id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                        <div>
                                            <p className="font-medium text-sm">#{order._id.slice(-6)}</p>
                                            <p className="text-xs text-slate-500">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-sm">{new Intl.NumberFormat('vi-VN').format(order.total)}đ</p>
                                            <span className={`text-xs px-2 py-1 rounded-full ${
                                                order.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                order.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                                'bg-blue-100 text-blue-700'
                                            }`}>
                                                {order.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                                
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
