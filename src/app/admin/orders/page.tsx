'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    ShoppingCart,
    Calendar,
    Clock,
    CheckCircle,
    XCircle,
    Truck,
    Filter,
    ChevronDown,
    Loader2,
    RefreshCw,
    Trash2,
    AlertTriangle,
    Eye,
    Search
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { useConfirm } from '@/context/ConfirmContext';

interface Order {
    id: string;
    customer: string;
    email: string;
    total: number;
    status: string;
    paymentMethod: string;
    date: string;
    time: string;
    itemCount: number;
}

const statusConfig: Record<string, { label: string; class: string; icon: any }> = {
    pending: { label: 'Chờ xử lý', class: 'bg-amber-100 text-amber-700', icon: Clock },
    confirmed: { label: 'Đã xác nhận', class: 'bg-blue-100 text-blue-700', icon: CheckCircle },
    shipping: { label: 'Đang giao', class: 'bg-purple-100 text-purple-700', icon: Truck },
    completed: { label: 'Hoàn thành', class: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
    paid: { label: 'Đã thanh toán', class: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
    cancelled: { label: 'Đã hủy', class: 'bg-red-100 text-red-700', icon: XCircle },
};

const statusActions = [
    { value: 'confirmed', label: 'Xác nhận đơn', icon: CheckCircle },
    { value: 'shipping', label: 'Đang giao hàng', icon: Truck },
    { value: 'completed', label: 'Hoàn thành', icon: CheckCircle },
    { value: 'cancelled', label: 'Hủy đơn', icon: XCircle },
];

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const toast = useToast();
    const confirm = useConfirm();

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/admin/orders');
            if (res.ok) {
                const data = await res.json();
                setOrders(data);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = async (orderId: string, newStatus: string) => {
        try {
            setUpdating(orderId);
            const res = await fetch('/api/admin/orders', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId, status: newStatus }),
            });

            if (res.ok) {
                setOrders(prev => prev.map(order =>
                    order.id === orderId ? { ...order, status: newStatus } : order
                ));
            } else {
                const data = await res.json();
                toast.error('Lỗi cập nhật trạng thái', data.message || 'Vui lòng thử lại.');
            }
        } catch (error) {
            console.error('Error updating order:', error);
            toast.error('Lỗi cập nhật trạng thái', 'Vui lòng thử lại.');
        } finally {
            setUpdating(null);
            setOpenDropdown(null);
        }
    };

    const handleDelete = async (orderId: string) => {
        const confirmed = await confirm({
            title: 'Xác nhận xóa đơn hàng',
            description: 'Bạn có chắc muốn xóa đơn hàng này? Hành động này không thể hoàn tác.',
            confirmText: 'Xóa đơn',
            cancelText: 'Hủy',
        });

        if (!confirmed) return;
        try {
            setDeleting(orderId);
            const res = await fetch(`/api/admin/orders/${orderId}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                setOrders(prev => prev.filter(order => order.id !== orderId));
            } else {
                const data = await res.json();
                toast.error('Lỗi xóa đơn hàng', data.error || 'Vui lòng thử lại.');
            }
        } catch (error) {
            console.error('Error deleting order:', error);
            toast.error('Lỗi xóa đơn hàng', 'Vui lòng thử lại.');
        } finally {
            setDeleting(null);
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch = order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === 'all' || order.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    const pendingCount = orders.filter(o => o.status === 'pending').length;
    const shippingCount = orders.filter(o => o.status === 'shipping').length;
    const completedCount = orders.filter(o => ['completed', 'paid'].includes(o.status)).length;
    const cancelledCount = orders.filter(o => o.status === 'cancelled').length;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white shadow-lg">
                            <ShoppingCart className="h-6 w-6" />
                        </div>
                        Quản lý Đơn hàng
                    </h1>
                    <p className="text-slate-500 mt-1 text-base">
                        {orders.length} đơn hàng • {pendingCount} chờ xử lý • {completedCount} hoàn thành
                    </p>
                </div>
                <button
                    onClick={fetchOrders}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium"
                >
                    <RefreshCw size={18} />
                    Làm mới
                </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-amber-100 flex items-center justify-center">
                        <Clock className="w-7 h-7 text-amber-700" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-slate-900">{pendingCount}</div>
                        <div className="text-sm text-slate-500">Chờ xử lý</div>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-purple-100 flex items-center justify-center">
                        <Truck className="w-7 h-7 text-purple-700" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-slate-900">{shippingCount}</div>
                        <div className="text-sm text-slate-500">Đang giao</div>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-emerald-100 flex items-center justify-center">
                        <CheckCircle className="w-7 h-7 text-emerald-700" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-slate-900">{completedCount}</div>
                        <div className="text-sm text-slate-500">Hoàn thành</div>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-red-100 flex items-center justify-center">
                        <XCircle className="w-7 h-7 text-red-700" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-slate-900">{cancelledCount}</div>
                        <div className="text-sm text-slate-500">Đã hủy</div>
                    </div>
                </div>
            </div>

            {/* Search & Filter */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm đơn hàng..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-100 border-0 rounded-xl text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    />
                </div>
                <div className="relative">
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="appearance-none w-full sm:w-48 px-4 py-3 pr-10 bg-slate-100 border-0 rounded-xl text-base text-slate-700 font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    >
                        <option value="all">Tất cả trạng thái</option>
                        <option value="pending">Chờ xử lý</option>
                        <option value="confirmed">Đã xác nhận</option>
                        <option value="shipping">Đang giao</option>
                        <option value="completed">Hoàn thành</option>
                        <option value="cancelled">Đã hủy</option>
                    </select>
                    <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                </div>
            </div>


            {/* Table - Fixed layout */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto" style={{ minWidth: '100%' }}>
                    <table className="w-full" style={{ minWidth: '1200px' }}>
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-4 py-4 text-center text-sm font-semibold text-slate-600 uppercase tracking-wider w-16">STT</th>
                                <th className="px-4 py-4 text-left text-sm font-semibold text-slate-600 uppercase tracking-wider w-32">Mã đơn</th>
                                <th className="px-4 py-4 text-left text-sm font-semibold text-slate-600 uppercase tracking-wider min-w-[280px]">Khách hàng</th>
                                <th className="px-4 py-4 text-left text-sm font-semibold text-slate-600 uppercase tracking-wider w-36">Thời gian</th>
                                <th className="px-4 py-4 text-center text-sm font-semibold text-slate-600 uppercase tracking-wider w-24">SL</th>
                                <th className="px-4 py-4 text-right text-sm font-semibold text-slate-600 uppercase tracking-wider w-36">Tổng tiền</th>
                                <th className="px-4 py-4 text-center text-sm font-semibold text-slate-600 uppercase tracking-wider w-40">Trạng thái</th>
                                <th className="px-4 py-4 text-center text-sm font-semibold text-slate-600 uppercase tracking-wider w-28">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center">
                                                <ShoppingCart className="w-10 h-10 text-slate-400" />
                                            </div>
                                            <p className="text-lg text-slate-500">
                                                {searchTerm || filterStatus !== 'all' ? 'Không tìm thấy đơn hàng phù hợp' : 'Chưa có đơn hàng nào'}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map((order, index) => {
                                    const config = statusConfig[order.status] || statusConfig.pending;
                                    const StatusIcon = config.icon;
                                    const isUpdating = updating === order.id;
                                    const isDropdownOpen = openDropdown === order.id;

                                    return (
                                        <tr
                                            key={order.id}
                                            className="hover:bg-slate-50 transition-colors"
                                        >
                                            <td className="px-4 py-4 text-center font-semibold text-slate-500">
                                                {index + 1}
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="font-mono font-bold text-slate-700">
                                                    #{order.id.slice(-6).toUpperCase()}
                                                </div>
                                                <div className="text-sm text-slate-400 mt-1">
                                                    {order.paymentMethod}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-slate-600 font-bold flex-shrink-0">
                                                        {order.customer.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="font-semibold text-slate-900 text-base truncate">
                                                            {order.customer}
                                                        </div>
                                                        {order.email && (
                                                            <div className="text-sm text-slate-500 truncate">
                                                                {order.email}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-2 text-slate-600">
                                                    <Calendar size={16} className="text-slate-400 flex-shrink-0" />
                                                    <div>
                                                        <div className="font-medium">{order.date}</div>
                                                        <div className="text-sm text-slate-400">{order.time}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100 text-base font-semibold text-slate-700">
                                                    {order.itemCount}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                <span className="font-bold text-lg text-amber-600">
                                                    {order.total.toLocaleString()}đ
                                                </span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="relative flex justify-center">

                                                    <button
                                                        onClick={() => setOpenDropdown(isDropdownOpen ? null : order.id)}
                                                        disabled={isUpdating}
                                                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${config.class}`}
                                                    >
                                                        {isUpdating ? (
                                                            <Loader2 size={16} className="animate-spin" />
                                                        ) : (
                                                            <StatusIcon size={16} />
                                                        )}
                                                        {config.label}
                                                        <ChevronDown size={16} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                                                    </button>

                                                    {isDropdownOpen && (
                                                        <>
                                                            <div
                                                                className="fixed inset-0 z-10"
                                                                onClick={() => setOpenDropdown(null)}
                                                            />
                                                            <div className="absolute top-full mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-20">
                                                                <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase">
                                                                    Đổi trạng thái
                                                                </div>
                                                                {statusActions.map((action) => {
                                                                    const ActionIcon = action.icon;
                                                                    const isCurrentStatus = order.status === action.value;

                                                                    return (
                                                                        <button
                                                                            key={action.value}
                                                                            onClick={() => updateOrderStatus(order.id, action.value)}
                                                                            disabled={isCurrentStatus}
                                                                            className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors
                                                                                ${isCurrentStatus
                                                                                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                                                                    : 'hover:bg-slate-50 text-slate-700'
                                                                                }`}
                                                                        >
                                                                            <ActionIcon size={18} />
                                                                            <span>{action.label}</span>
                                                                            {isCurrentStatus && (
                                                                                <span className="ml-auto text-xs text-slate-400">Hiện tại</span>
                                                                            )}
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <Link
                                                        href={`/admin/orders/${order.id}`}
                                                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-blue-600 hover:bg-blue-50 text-sm font-medium transition-colors"
                                                    >
                                                        <Eye size={16} />
                                                        Xem
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(order.id)}
                                                        disabled={deleting === order.id}
                                                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 text-sm font-medium transition-colors disabled:opacity-50"
                                                    >
                                                        {deleting === order.id ? (
                                                            <Loader2 size={16} className="animate-spin" />
                                                        ) : (
                                                            <Trash2 size={16} />
                                                        )}
                                                        Xóa
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
