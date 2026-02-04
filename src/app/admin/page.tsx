import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
import User from '@/models/User';
import Link from 'next/link';
import {
    Wallet,
    ShoppingCart,
    Package,
    Users,
    Plus,
    FileText,
    Settings,
    ArrowRight,
    Sparkles,
    TrendingUp,
    TrendingDown,
    Minus
} from 'lucide-react';
import {
    RevenueChart,
    TopProductsChart,
    OrderStatusChart,
} from '@/components/admin/dashboard';

export const dynamic = 'force-dynamic';

// ========================================
// DATA LAYER - Giữ nguyên 100% logic cũ
// ========================================
async function getStats() {
    await dbConnect();
    const orderCount = await Order.countDocuments();
    const productCount = await Product.countDocuments();
    const userCount = await User.countDocuments();

    const orders = await Order.find({ status: 'delivered' });
    const totalRevenue = orders.reduce((acc, order) => acc + (order.totalAmount || 0), 0);

    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const completedOrders = await Order.countDocuments({ status: 'delivered' });
    const cancelledOrders = await Order.countDocuments({ status: 'cancelled' });

    const recentOrders = await Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('user', 'name email')
        .lean();

    // Chart Data Aggregation
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const revenueAggregation = await Order.aggregate([
        {
            $match: {
                status: { $in: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'] },
                createdAt: { $gte: sevenDaysAgo }
            }
        },
        {
            $group: {
                _id: { $dateToString: { format: "%d/%m", date: "$createdAt" } },
                revenue: { $sum: "$totalAmount" }
            }
        },
        { $sort: { "_id": 1 } }
    ]);

    const revenueData = revenueAggregation.map(item => ({
        name: item._id,
        revenue: item.revenue
    }));

    const productAggregation = await Order.aggregate([
        { $match: { status: { $in: ['completed', 'paid'] } } },
        { $unwind: "$items" },
        {
            $group: {
                _id: "$items.name",
                sales: { $sum: "$items.quantity" }
            }
        },
        { $sort: { sales: -1 } },
        { $limit: 5 }
    ]);

    const topProductsData = productAggregation.map(item => ({
        name: item._id,
        sales: item.sales
    }));

    const statusData = [
        { name: 'Hoàn thành', value: completedOrders, color: '#10b981' },
        { name: 'Chờ xử lý', value: pendingOrders, color: '#f59e0b' },
        { name: 'Hủy', value: cancelledOrders, color: '#ef4444' },
    ];

    return {
        orderCount,
        productCount,
        userCount,
        totalRevenue,
        pendingOrders,
        completedOrders,
        cancelledOrders,
        recentOrders: JSON.parse(JSON.stringify(recentOrders)),
        revenueData,
        topProductsData,
        statusData
    };
}

// ========================================
// UI COMPONENTS - Thiết kế mới, dễ dùng
// ========================================

// Stat Card với touch target lớn, readable text
function StatCard({ 
    title, 
    value, 
    change, 
    trend,
    icon: Icon,
    color 
}: { 
    title: string;
    value: string | number;
    change?: string;
    trend?: 'up' | 'down' | 'neutral';
    icon: any;
    color: 'amber' | 'blue' | 'green' | 'purple';
}) {
    const colorStyles = {
        amber: 'bg-amber-100 text-amber-700',
        blue: 'bg-blue-100 text-blue-700',
        green: 'bg-emerald-100 text-emerald-700',
        purple: 'bg-purple-100 text-purple-700',
    };

    const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;

    return (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-start justify-between">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${colorStyles[color]}`}>
                    <Icon className="w-7 h-7" />
                </div>
                {change && (
                    <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-semibold ${
                        trend === 'up' ? 'bg-emerald-100 text-emerald-700' :
                        trend === 'down' ? 'bg-red-100 text-red-700' :
                        'bg-slate-100 text-slate-600'
                    }`}>
                        <TrendIcon className="w-4 h-4" />
                        {change}
                    </div>
                )}
            </div>
            <div className="mt-5">
                <p className="text-3xl font-bold text-slate-900">{value}</p>
                <p className="text-base text-slate-500 mt-1">{title}</p>
            </div>
        </div>
    );
}

// Quick Action Button - Touch target 48px+
function QuickAction({ icon: Icon, label, href }: { icon: any; label: string; href: string }) {
    return (
        <Link 
            href={href}
            className="flex flex-col items-center justify-center gap-3 p-6 bg-white border border-slate-200 rounded-2xl hover:border-amber-400 hover:shadow-md transition-all group min-h-[140px]"
        >
            <div className="w-14 h-14 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Icon className="w-6 h-6" />
            </div>
            <span className="text-base font-semibold text-slate-700">{label}</span>
        </Link>
    );
}

// Recent Orders Table - Simplified, readable
function RecentOrdersTable({ orders }: { orders: any[] }) {
    const getStatusStyle = (status: string) => {
        const styles: Record<string, string> = {
            pending: 'bg-amber-100 text-amber-700',
            paid: 'bg-blue-100 text-blue-700',
            completed: 'bg-emerald-100 text-emerald-700',
            delivered: 'bg-emerald-100 text-emerald-700',
            cancelled: 'bg-red-100 text-red-700'
        };
        return styles[status] || 'bg-slate-100 text-slate-700';
    };

    const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            pending: 'Chờ xử lý',
            paid: 'Đã thanh toán',
            completed: 'Hoàn thành',
            delivered: 'Hoàn thành',
            cancelled: 'Đã hủy'
        };
        return labels[status] || status;
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full">
                <thead className="bg-slate-50">
                    <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Mã đơn</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Khách hàng</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Ngày</th>
                        <th className="px-6 py-4 text-right text-sm font-semibold text-slate-600">Tổng tiền</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-slate-600">Trạng thái</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {orders.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                                Chưa có đơn hàng nào
                            </td>
                        </tr>
                    ) : (
                        orders.map((order) => (
                            <tr key={order._id} className="hover:bg-slate-50">
                                <td className="px-6 py-4 font-medium text-slate-900">
                                    #{order._id.toString().slice(-8)}
                                </td>
                                <td className="px-6 py-4">
                                    <div>
                                        <p className="font-medium text-slate-900">{order.user?.name || 'Khách vãng lai'}</p>
                                        <p className="text-sm text-slate-500">{order.user?.email}</p>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-slate-600">
                                    {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                                </td>
                                <td className="px-6 py-4 text-right font-semibold text-slate-900">
                                    {order.totalAmount?.toLocaleString('vi-VN')}đ
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`inline-flex px-3 py-1.5 rounded-full text-sm font-semibold ${getStatusStyle(order.status)}`}>
                                        {getStatusLabel(order.status)}
                                    </span>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}

// ========================================
// MAIN PAGE - UI mới + Data cũ
// ========================================
export default async function AdminDashboard() {
    const stats = await getStats();

    return (
        <div className="space-y-8">
            {/* Welcome Banner */}
            <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 text-white overflow-hidden">
                {/* Decorative circles */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full -translate-y-1/2 translate-x-1/4" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/5 rounded-full translate-y-1/2 -translate-x-1/4" />
                
                <div className="relative">
                    <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="w-5 h-5 text-amber-400" />
                        <span className="text-amber-400 font-semibold">Xin chào!</span>
                    </div>
                    <h1 className="text-3xl font-bold mb-2">
                        Chào mừng trở lại, Admin
                    </h1>
                    <p className="text-slate-300 text-lg max-w-xl">
                        Đây là tổng quan về tình hình kinh doanh của bạn hôm nay.
                        {stats.pendingOrders > 0 && (
                            <> Có <span className="text-amber-400 font-semibold">{stats.pendingOrders} đơn hàng mới</span> cần xử lý.</>
                        )}
                    </p>
                    <div className="flex items-center gap-3 mt-6">
                        <Link 
                            href="/admin/orders"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold rounded-xl transition-colors"
                        >
                            Xem đơn hàng
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                        <Link 
                            href="/"
                            target="_blank"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-colors"
                        >
                            Xem website
                        </Link>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <section>
                <h2 className="text-xl font-bold text-slate-900 mb-4">Tổng quan</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Tổng doanh thu"
                        value={`${stats.totalRevenue.toLocaleString('vi-VN')}đ`}
                        change="+12.5%"
                        trend="up"
                        icon={Wallet}
                        color="green"
                    />
                    <StatCard
                        title="Đơn hàng"
                        value={stats.orderCount}
                        change={`${stats.pendingOrders} chờ`}
                        trend="neutral"
                        icon={ShoppingCart}
                        color="blue"
                    />
                    <StatCard
                        title="Sản phẩm"
                        value={stats.productCount}
                        change="Đang bán"
                        trend="neutral"
                        icon={Package}
                        color="amber"
                    />
                    <StatCard
                        title="Ngườii dùng"
                        value={stats.userCount}
                        change="+8.2%"
                        trend="up"
                        icon={Users}
                        color="purple"
                    />
                </div>
            </section>

            {/* Quick Actions */}
            <section>
                <h2 className="text-xl font-bold text-slate-900 mb-4">Thao tác nhanh</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <QuickAction icon={Plus} label="Thêm sản phẩm" href="/admin/products/new" />
                    <QuickAction icon={ShoppingCart} label="Xử lý đơn hàng" href="/admin/orders" />
                    <QuickAction icon={FileText} label="Viết bài mới" href="/admin/blogs" />
                    <QuickAction icon={Settings} label="Cài đặt" href="/admin/settings" />
                </div>
            </section>

            {/* Charts & Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Chart */}
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-slate-900">Doanh thu 7 ngày qua</h3>
                        <select className="px-3 py-2 bg-slate-100 border-0 rounded-lg text-sm font-medium text-slate-600 cursor-pointer hover:bg-slate-200 transition-colors">
                            <option>7 ngày qua</option>
                            <option>Tháng này</option>
                            <option>Năm nay</option>
                        </select>
                    </div>
                    <div className="h-[300px]">
                        <RevenueChart data={stats.revenueData} />
                    </div>
                </div>

                {/* Order Status Chart */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-6">Trạng thái đơn hàng</h3>
                    <div className="h-[300px]">
                        <OrderStatusChart data={stats.statusData} total={stats.orderCount} />
                    </div>
                </div>
            </div>

            {/* Recent Orders & Top Products */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Orders */}
                <div className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-slate-900">Đơn hàng gần đây</h3>
                        <Link 
                            href="/admin/orders"
                            className="text-base font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1"
                        >
                            Xem tất cả <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <RecentOrdersTable orders={stats.recentOrders} />
                </div>

                {/* Top Products */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-6">Sản phẩm bán chạy</h3>
                    <div className="h-[300px]">
                        <TopProductsChart data={stats.topProductsData} />
                    </div>
                </div>
            </div>
        </div>
    );
}
