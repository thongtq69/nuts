import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
import User from '@/models/User';
import { ShoppingCart, Package, Users, DollarSign, ArrowUpRight, ArrowDownRight, Clock, CheckCircle, XCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getStats() {
    await dbConnect();
    const orderCount = await Order.countDocuments();
    const productCount = await Product.countDocuments();
    const userCount = await User.countDocuments();

    // Calculate total revenue
    const orders = await Order.find({ status: { $in: ['completed', 'paid'] } });
    const totalRevenue = orders.reduce((acc, order) => acc + (order.totalAmount || 0), 0);

    // Calculate pending orders
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const completedOrders = await Order.countDocuments({ status: { $in: ['completed', 'paid'] } });
    const cancelledOrders = await Order.countDocuments({ status: 'cancelled' });

    // Get recent orders
    const recentOrders = await Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('user', 'name email')
        .lean();

    return {
        orderCount,
        productCount,
        userCount,
        totalRevenue,
        pendingOrders,
        completedOrders,
        cancelledOrders,
        recentOrders
    };
}

export default async function AdminDashboard() {
    const stats = await getStats();

    const statCards = [
        {
            title: 'Tổng doanh thu',
            value: `${stats.totalRevenue.toLocaleString('vi-VN')}đ`,
            change: '+12.5%',
            trend: 'up',
            icon: DollarSign,
            textColor: 'text-emerald-600',
            bgColor: 'bg-emerald-50',
            borderColor: 'border-emerald-200'
        },
        {
            title: 'Đơn hàng',
            value: stats.orderCount,
            change: `${stats.pendingOrders} chờ xử lý`,
            trend: 'neutral',
            icon: ShoppingCart,
            textColor: 'text-blue-600',
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-200'
        },
        {
            title: 'Sản phẩm',
            value: stats.productCount,
            change: 'Đang hoạt động',
            trend: 'neutral',
            icon: Package,
            textColor: 'text-amber-600',
            bgColor: 'bg-amber-50',
            borderColor: 'border-amber-200'
        },
        {
            title: 'Người dùng',
            value: stats.userCount,
            change: '+8.2%',
            trend: 'up',
            icon: Users,
            textColor: 'text-purple-600',
            bgColor: 'bg-purple-50',
            borderColor: 'border-purple-200'
        },
    ];

    const orderStats = [
        { label: 'Chờ xử lý', value: stats.pendingOrders, icon: Clock, color: 'text-amber-600 bg-amber-50' },
        { label: 'Hoàn thành', value: stats.completedOrders, icon: CheckCircle, color: 'text-green-600 bg-green-50' },
        { label: 'Đã hủy', value: stats.cancelledOrders, icon: XCircle, color: 'text-red-600 bg-red-50' },
    ];

    const getStatusBadge = (status: string) => {
        const badges: Record<string, { label: string; className: string }> = {
            pending: { label: 'Chờ xử lý', className: 'bg-amber-100 text-amber-700' },
            paid: { label: 'Đã thanh toán', className: 'bg-blue-100 text-blue-700' },
            completed: { label: 'Hoàn thành', className: 'bg-green-100 text-green-700' },
            cancelled: { label: 'Đã hủy', className: 'bg-red-100 text-red-700' },
        };
        return badges[status] || { label: status, className: 'bg-slate-100 text-slate-700' };
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
                    <p className="text-slate-500 mt-1">Chào mừng quay trở lại! Đây là tổng quan hệ thống của bạn.</p>
                </div>
                <div className="text-sm text-slate-500">
                    Cập nhật: {new Date().toLocaleDateString('vi-VN')}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, index) => (
                    <div 
                        key={index} 
                        className={`bg-white p-6 rounded-xl shadow-sm border-2 ${stat.borderColor} transition-all hover:shadow-lg hover:-translate-y-1`}
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                                <stat.icon className={`w-6 h-6 ${stat.textColor}`} strokeWidth={2} />
                            </div>
                            {stat.trend === 'up' && (
                                <div className="flex items-center gap-1 text-emerald-600 text-xs font-semibold bg-emerald-50 px-2 py-1 rounded-full">
                                    <ArrowUpRight size={12} />
                                    {stat.change}
                                </div>
                            )}
                            {stat.trend === 'down' && (
                                <div className="flex items-center gap-1 text-red-600 text-xs font-semibold bg-red-50 px-2 py-1 rounded-full">
                                    <ArrowDownRight size={12} />
                                    {stat.change}
                                </div>
                            )}
                        </div>
                        <div>
                            <h3 className="text-slate-500 text-sm font-medium mb-2">{stat.title}</h3>
                            <div className="text-3xl font-bold text-slate-800">{stat.value}</div>
                            {stat.trend === 'neutral' && (
                                <div className="mt-2 text-xs text-slate-500 font-medium">
                                    {stat.change}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Order Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {orderStats.map((stat, index) => (
                    <div key={index} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-lg ${stat.color}`}>
                                <stat.icon size={24} strokeWidth={2} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-slate-800">{stat.value}</div>
                                <div className="text-sm text-slate-500">{stat.label}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Orders & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Orders */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200">
                    <div className="p-6 border-b border-slate-200">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-slate-800 text-lg">Đơn hàng gần đây</h3>
                            <a href="/admin/orders" className="text-sm text-amber-600 hover:text-amber-700 font-medium">
                                Xem tất cả →
                            </a>
                        </div>
                    </div>
                    <div className="p-6">
                        {stats.recentOrders && stats.recentOrders.length > 0 ? (
                            <div className="space-y-4">
                                {stats.recentOrders.map((order: any) => {
                                    const badge = getStatusBadge(order.status);
                                    return (
                                        <div key={order._id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                                            <div className="flex-1">
                                                <div className="font-medium text-slate-800">#{order._id.toString().slice(-8)}</div>
                                                <div className="text-sm text-slate-500 mt-1">
                                                    {order.user?.name || 'Khách hàng'} • {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-semibold text-slate-800">
                                                    {order.totalAmount?.toLocaleString('vi-VN')}đ
                                                </div>
                                                <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-medium ${badge.className}`}>
                                                    {badge.label}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <ShoppingCart className="mx-auto text-slate-300 mb-3" size={48} />
                                <p className="text-slate-500 text-sm">Chưa có đơn hàng nào</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                    <div className="p-6 border-b border-slate-200">
                        <h3 className="font-bold text-slate-800 text-lg">Thao tác nhanh</h3>
                    </div>
                    <div className="p-6 space-y-3">
                        <a
                            href="/admin/products/new"
                            className="flex items-center gap-3 p-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all shadow-md hover:shadow-lg"
                        >
                            <Package size={20} />
                            <span className="font-medium">Thêm sản phẩm mới</span>
                        </a>
                        <a
                            href="/admin/orders"
                            className="flex items-center gap-3 p-4 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                        >
                            <ShoppingCart size={20} />
                            <span className="font-medium">Quản lý đơn hàng</span>
                        </a>
                        <a
                            href="/admin/users"
                            className="flex items-center gap-3 p-4 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                        >
                            <Users size={20} />
                            <span className="font-medium">Quản lý người dùng</span>
                        </a>
                        <a
                            href="/admin/vouchers"
                            className="flex items-center gap-3 p-4 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                        >
                            <DollarSign size={20} />
                            <span className="font-medium">Tạo voucher mới</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
