'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    ShoppingCart,
    Eye,
    Calendar,
    Clock,
    CheckCircle,
    XCircle,
    Truck,
    Search,
    Filter,
    ChevronDown,
    Loader2,
    RefreshCw,
    Trash2
} from 'lucide-react';

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

const statusConfig: Record<string, { label: string; class: string; icon: any; bgColor: string }> = {
    pending: { label: 'Chờ xử lý', class: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock, bgColor: 'bg-amber-500' },
    confirmed: { label: 'Đã xác nhận', class: 'bg-blue-100 text-blue-700 border-blue-200', icon: CheckCircle, bgColor: 'bg-blue-500' },
    shipping: { label: 'Đang giao', class: 'bg-indigo-100 text-indigo-700 border-indigo-200', icon: Truck, bgColor: 'bg-indigo-500' },
    completed: { label: 'Hoàn thành', class: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle, bgColor: 'bg-emerald-500' },
    paid: { label: 'Đã thanh toán', class: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle, bgColor: 'bg-emerald-500' },
    cancelled: { label: 'Đã hủy', class: 'bg-red-100 text-red-700 border-red-200', icon: XCircle, bgColor: 'bg-red-500' },
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
                alert(data.message || 'Lỗi cập nhật trạng thái');
            }
        } catch (error) {
            console.error('Error updating order:', error);
            alert('Lỗi khi cập nhật trạng thái');
        } finally {
            setUpdating(null);
            setOpenDropdown(null);
        }
    };

    const handleDelete = async (orderId: string) => {
        if (!confirm('Bạn có chắc muốn xóa đơn hàng này? Hành động này không thể hoàn tác.')) {
            return;
        }
        try {
            setDeleting(orderId);
            const res = await fetch(`/api/admin/orders/${orderId}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                setOrders(prev => prev.filter(order => order.id !== orderId));
            } else {
                const data = await res.json();
                alert(data.error || 'Lỗi xóa đơn hàng');
            }
        } catch (error) {
            console.error('Error deleting order:', error);
            alert('Lỗi xóa đơn hàng');
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
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
                            <ShoppingCart className="h-5 w-5" />
                        </div>
                        Quản lý Đơn hàng
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 ml-13">
                        {orders.length} đơn hàng • {pendingCount} chờ xử lý • {completedCount} hoàn thành
                    </p>
                </div>
                <button
                    onClick={fetchOrders}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                >
                    <RefreshCw size={18} />
                    Làm mới
                </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                        <Clock className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-slate-800 dark:text-white">{pendingCount}</div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">Chờ xử lý</div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <Truck className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-slate-800 dark:text-white">{shippingCount}</div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">Đang giao</div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-slate-800 dark:text-white">{completedCount}</div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">Hoàn thành</div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                        <XCircle className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-slate-800 dark:text-white">{cancelledCount}</div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">Đã hủy</div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Tìm theo mã đơn, tên khách hàng..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-slate-800 dark:text-slate-200"
                    />
                </div>
                <div className="relative">
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="appearance-none px-4 py-2.5 pr-10 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium cursor-pointer focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
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

            {/* Table */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Mã đơn</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Khách hàng</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Thời gian</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Số lượng</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Tổng tiền</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Trạng thái</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                                <ShoppingCart className="w-8 h-8 text-slate-400" />
                                            </div>
                                            <p className="text-slate-500 dark:text-slate-400">
                                                {searchTerm || filterStatus !== 'all' ? 'Không tìm thấy đơn hàng phù hợp' : 'Chưa có đơn hàng nào'}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map((order) => {
                                    const config = statusConfig[order.status] || statusConfig.pending;
                                    const StatusIcon = config.icon;
                                    const isUpdating = updating === order.id;
                                    const isDropdownOpen = openDropdown === order.id;

                                    return (
                                        <tr key={order.id} className="group hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-mono font-bold text-slate-700 dark:text-slate-300">
                                                    #{order.id.slice(-6).toUpperCase()}
                                                </div>
                                                <div className="text-xs text-slate-400 mt-0.5">
                                                    {order.paymentMethod}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 font-medium text-sm">
                                                        {order.customer.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-slate-800 dark:text-white">
                                                            {order.customer}
                                                        </div>
                                                        {order.email && (
                                                            <div className="text-xs text-slate-400">{order.email}</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                                    <Calendar size={14} className="text-slate-400" />
                                                    <div>
                                                        <div className="text-sm">{order.date}</div>
                                                        <div className="text-xs text-slate-400">{order.time}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="text-center px-6 py-4">
                                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                    {order.itemCount}
                                                </span>
                                            </td>
                                            <td className="text-right px-6 py-4">
                                                <span className="font-bold text-lg text-amber-600">
                                                    {order.total.toLocaleString()}đ
                                                </span>
                                            </td>
                                            <td className="text-center px-6 py-4">
                                                <div className="relative inline-block">
                                                    <button
                                                        onClick={() => setOpenDropdown(isDropdownOpen ? null : order.id)}
                                                        disabled={isUpdating}
                                                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all ${config.class} hover:shadow-md cursor-pointer`}
                                                    >
                                                        {isUpdating ? (
                                                            <Loader2 size={14} className="animate-spin" />
                                                        ) : (
                                                            <StatusIcon size={14} />
                                                        )}
                                                        {config.label}
                                                        <ChevronDown size={14} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                                                    </button>

                                                    {/* Dropdown Menu */}
                                                    {isDropdownOpen && (
                                                        <>
                                                            <div
                                                                className="fixed inset-0 z-10"
                                                                onClick={() => setOpenDropdown(null)}
                                                            />
                                                            <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-20">
                                                                <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase">
                                                                    Đổi trạng thái
                                                                </div>
                                                                {statusActions.map((action) => {
                                                                    const ActionIcon = action.icon;
                                                                    const actionConfig = statusConfig[action.value];
                                                                    const isCurrentStatus = order.status === action.value;

                                                                    return (
                                                                        <button
                                                                            key={action.value}
                                                                            onClick={() => updateOrderStatus(order.id, action.value)}
                                                                            disabled={isCurrentStatus}
                                                                            className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors
                                                                                ${isCurrentStatus
                                                                                    ? 'bg-slate-100 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                                                                                    : 'hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                                                                                }`}
                                                                        >
                                                                            <div className={`w-2 h-2 rounded-full ${actionConfig?.bgColor || 'bg-slate-400'}`} />
                                                                            <ActionIcon size={16} />
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
                                            <td className="text-center px-6 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <Link
                                                        href={`/admin/orders/${order.id}`}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-sm font-medium transition-colors"
                                                    >
                                                        <Eye size={14} />
                                                        Chi tiết
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(order.id)}
                                                        disabled={deleting === order.id}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm font-medium transition-colors disabled:opacity-50"
                                                    >
                                                        {deleting === order.id ? (
                                                            <Loader2 size={14} className="animate-spin" />
                                                        ) : (
                                                            <Trash2 size={14} />
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
