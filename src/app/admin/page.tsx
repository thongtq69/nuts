import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
import User from '@/models/User';
import Link from 'next/link';
import {
    DollarSign,
    ShoppingCart,
    Package,
    Users,
    Plus,
    FileText,
    Settings,
    ArrowRight,
    Sparkles
} from 'lucide-react';
import {
    StatsCards,
    RevenueChart,
    TopProductsChart,
    OrderStatusChart,
    RecentOrdersTable
} from '@/components/admin/dashboard';
import { Button } from '@/components/admin/ui';

export const dynamic = 'force-dynamic';

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
        { name: 'Chờ xử lý', value: pendingOrders, color: '#9C7043' },
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

export default async function AdminDashboard() {
    const stats = await getStats();

    const statCardsData = [
        {
            title: 'Tổng doanh thu',
            value: `${stats.totalRevenue.toLocaleString('vi-VN')}đ`,
            change: '+12.5%',
            trend: 'up' as const,
            icon: DollarSign,
            color: 'emerald' as const,
        },
        {
            title: 'Đơn hàng',
            value: stats.orderCount,
            change: `${stats.pendingOrders} chờ xử lý`,
            trend: 'neutral' as const,
            icon: ShoppingCart,
            color: 'blue' as const,
        },
        {
            title: 'Sản phẩm',
            value: stats.productCount,
            change: 'Đang hoạt động',
            trend: 'neutral' as const,
            icon: Package,
            color: 'amber' as const,
        },
        {
            title: 'Người dùng',
            value: stats.userCount,
            change: '+8.2%',
            trend: 'up' as const,
            icon: Users,
            color: 'purple' as const,
        },
    ];

    const quickActions = [
        { icon: Plus, label: 'Thêm sản phẩm', href: '/admin/products/new' },
        { icon: ShoppingCart, label: 'Xử lý đơn hàng', href: '/admin/orders' },
        { icon: FileText, label: 'Viết bài mới', href: '/admin/blogs' },
        { icon: Settings, label: 'Cài đặt', href: '/admin/affiliate-settings' },
    ];

    return (
        <div className="space-y-8">
            {/* Welcome Banner */}
            <div className="welcome-banner animate-fade-in">
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-5 h-5 text-brand-light" />
                        <span className="text-brand-light font-semibold text-sm">Xin chào!</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                        Chào mừng trở lại, Admin 👋
                    </h1>
                    <p className="text-slate-400 text-sm sm:text-base max-w-xl">
                        Đây là tổng quan về tình hình kinh doanh của bạn hôm nay.
                        Tiếp tục phát triển nhé!
                    </p>
                </div>
                <div className="flex items-center gap-3 mt-6 relative z-10">
                    <Link href="/admin/orders">
                        <Button size="sm" className="bg-brand hover:bg-brand-dark text-white shadow-lg shadow-brand/25">
                            Xem đơn hàng mới
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </Link>
                    <Link href="/" target="_blank">
                        <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-800">
                            Xem website
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats Cards */}
            <StatsCards stats={statCardsData} />

            {/* Quick Actions */}
            <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
                <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Thao tác nhanh</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {quickActions.map((action, index) => (
                        <Link key={index} href={action.href}>
                            <div className="quick-action-btn group">
                                <div className="icon group-hover:scale-110 transition-transform">
                                    <action.icon className="w-5 h-5" />
                                </div>
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    {action.label}
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 glass-card p-6">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Doanh thu 7 ngày qua</h3>
                    <RevenueChart data={stats.revenueData} />
                </div>
                <div className="glass-card p-6">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Trạng thái đơn hàng</h3>
                    <OrderStatusChart data={stats.statusData} total={stats.orderCount} />
                </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 glass-card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white">Đơn hàng gần đây</h3>
                        <Link href="/admin/orders" className="text-sm text-brand hover:text-brand-dark font-medium flex items-center gap-1">
                            Xem tất cả <ArrowRight size={14} />
                        </Link>
                    </div>
                    <RecentOrdersTable orders={stats.recentOrders} />
                </div>
                <div className="glass-card p-6">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Sản phẩm bán chạy</h3>
                    <TopProductsChart data={stats.topProductsData} />
                </div>
            </div>
        </div>
    );
}
