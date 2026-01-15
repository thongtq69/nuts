import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import Link from 'next/link';
import { ShoppingCart, Eye, Calendar, User as UserIcon, Clock, CheckCircle, XCircle, Truck, Search, Filter } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getOrders() {
    await dbConnect();
    const orders = await Order.find({}).populate('user', 'name email').sort({ createdAt: -1 });

    return orders.map(order => ({
        id: order._id.toString(),
        customer: (order.user as any)?.name || order.shippingInfo?.fullName || 'Khách vãng lai',
        email: (order.user as any)?.email || order.shippingInfo?.email || '',
        total: order.totalAmount,
        status: order.status,
        paymentMethod: order.paymentMethod || 'COD',
        date: order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : 'N/A',
        time: order.createdAt ? new Date(order.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '',
        itemCount: order.items.length
    }));
}

const statusConfig: Record<string, { label: string; class: string; icon: any }> = {
    pending: { label: 'Chờ xử lý', class: 'badge-warning', icon: Clock },
    confirmed: { label: 'Đã xác nhận', class: 'badge-info', icon: CheckCircle },
    shipping: { label: 'Đang giao', class: 'badge-info', icon: Truck },
    completed: { label: 'Hoàn thành', class: 'badge-success', icon: CheckCircle },
    paid: { label: 'Đã thanh toán', class: 'badge-success', icon: CheckCircle },
    cancelled: { label: 'Đã hủy', class: 'badge-danger', icon: XCircle },
};

export default async function AdminOrdersPage() {
    const orders = await getOrders();

    const pendingCount = orders.filter(o => o.status === 'pending').length;
    const completedCount = orders.filter(o => ['completed', 'paid'].includes(o.status)).length;

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
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="glass-card p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                        <Clock className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-slate-800 dark:text-white">{pendingCount}</div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">Chờ xử lý</div>
                    </div>
                </div>
                <div className="glass-card p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <Truck className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-slate-800 dark:text-white">
                            {orders.filter(o => o.status === 'shipping').length}
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">Đang giao</div>
                    </div>
                </div>
                <div className="glass-card p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-slate-800 dark:text-white">{completedCount}</div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">Hoàn thành</div>
                    </div>
                </div>
                <div className="glass-card p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                        <XCircle className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-slate-800 dark:text-white">
                            {orders.filter(o => o.status === 'cancelled').length}
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">Đã hủy</div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="glass-card p-4 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Tìm theo mã đơn, tên khách hàng..."
                        className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-slate-800 dark:text-slate-200"
                    />
                </div>
                <button className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium transition-colors">
                    <Filter size={18} />
                    Lọc trạng thái
                </button>
            </div>

            {/* Table */}
            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="premium-table w-full">
                        <thead>
                            <tr>
                                <th>Mã đơn</th>
                                <th>Khách hàng</th>
                                <th>Thời gian</th>
                                <th className="text-center">Số lượng</th>
                                <th className="text-right">Tổng tiền</th>
                                <th className="text-center">Trạng thái</th>
                                <th className="text-center">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                                <ShoppingCart className="w-8 h-8 text-slate-400" />
                                            </div>
                                            <p className="text-slate-500 dark:text-slate-400">Chưa có đơn hàng nào</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                orders.map((order) => {
                                    const config = statusConfig[order.status] || statusConfig.pending;
                                    const StatusIcon = config.icon;
                                    return (
                                        <tr key={order.id} className="group">
                                            <td>
                                                <div className="font-mono font-bold text-slate-700 dark:text-slate-300">
                                                    #{order.id.slice(-6).toUpperCase()}
                                                </div>
                                                <div className="text-xs text-slate-400 mt-0.5">
                                                    {order.paymentMethod}
                                                </div>
                                            </td>
                                            <td>
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
                                            <td>
                                                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                                    <Calendar size={14} className="text-slate-400" />
                                                    <div>
                                                        <div className="text-sm">{order.date}</div>
                                                        <div className="text-xs text-slate-400">{order.time}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="text-center">
                                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                    {order.itemCount}
                                                </span>
                                            </td>
                                            <td className="text-right">
                                                <span className="font-bold text-lg text-amber-600">
                                                    {order.total.toLocaleString()}đ
                                                </span>
                                            </td>
                                            <td className="text-center">
                                                <span className={`badge-premium ${config.class}`}>
                                                    <StatusIcon size={12} />
                                                    {config.label}
                                                </span>
                                            </td>
                                            <td className="text-center">
                                                <Link
                                                    href={`/admin/orders/${order.id}`}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-sm font-medium transition-colors"
                                                >
                                                    <Eye size={14} />
                                                    Chi tiết
                                                </Link>
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
