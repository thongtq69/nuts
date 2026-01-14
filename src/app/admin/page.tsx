import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
import User from '@/models/User';
import {
    DollarSign,
    ShoppingCart,
    Package,
    Users,
    Clock,
    CheckCircle,
    XCircle
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

    const orders = await Order.find({ status: { $in: ['completed', 'paid'] } });
    const totalRevenue = orders.reduce((acc, order) => acc + (order.totalAmount || 0), 0);

    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const completedOrders = await Order.countDocuments({ status: { $in: ['completed', 'paid'] } });
    const cancelledOrders = await Order.countDocuments({ status: 'cancelled' });

    const recentOrders = await Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('user', 'name email')
        .lean();

    // Chart Data Aggregation

    // 1. Revenue Last 7 Days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const revenueAggregation = await Order.aggregate([
        {
            $match: {
                status: { $in: ['completed', 'paid'] },
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

    // 2. Top Products
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

    // 3. Order Status
    const statusData = [
        { name: 'Hoàn thành', value: completedOrders, color: '#10b981' }, // emerald-500
        { name: 'Chờ xử lý', value: pendingOrders, color: '#f59e0b' },   // amber-500
        { name: 'Hủy', value: cancelledOrders, color: '#ef4444' },       // red-500
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

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Dashboard</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Tổng quan tình hình kinh doanh hôm nay.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm">Xuất báo cáo</Button>
                    <Button size="sm">Tạo đơn hàng</Button>
                </div>
            </div>

            <StatsCards stats={statCardsData} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <RevenueChart data={stats.revenueData} />
                </div>
                <div>
                    <OrderStatusChart data={stats.statusData} total={stats.orderCount} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <RecentOrdersTable orders={stats.recentOrders} />
                </div>
                <div>
                    <TopProductsChart data={stats.topProductsData} />
                </div>
            </div>
        </div>
    );
}
