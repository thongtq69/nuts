import React from 'react';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
import User from '@/models/User';
import {
    TrendingUp,
    CreditCard,
    ShoppingCart,
    Users,
    ArrowUpRight,
    ArrowDownRight,
    PackageSearch,
    BadgeDollarSign
} from 'lucide-react';
import GA4Dashboard from '@/components/admin/analytics/GA4Dashboard';
import { RevenueChart, TopProductsChart, OrderStatusChart } from '@/components/admin/dashboard';

export const dynamic = 'force-dynamic';

async function getAnalyticsData() {
    await dbConnect();

    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // Revenue current month vs last month
    const currentMonthOrders = await Order.find({
        status: { $in: ['shipped', 'delivered', 'completed'] },
        createdAt: { $gte: startOfCurrentMonth }
    });

    const lastMonthOrders = await Order.find({
        status: { $in: ['shipped', 'delivered', 'completed'] },
        createdAt: { $gte: startOfLastMonth, $lt: startOfCurrentMonth }
    });

    const currentRevenue = currentMonthOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const lastRevenue = lastMonthOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const revenueGrowth = lastRevenue === 0 ? 100 : ((currentRevenue - lastRevenue) / lastRevenue) * 100;

    // Users
    const currentMonthUsers = await User.countDocuments({ createdAt: { $gte: startOfCurrentMonth } });
    const lastMonthUsers = await User.countDocuments({ createdAt: { $gte: startOfLastMonth, $lt: startOfCurrentMonth } });
    const userGrowth = lastMonthUsers === 0 ? 100 : ((currentMonthUsers - lastMonthUsers) / lastMonthUsers) * 100;

    // Total counts
    const totalOrders = await Order.countDocuments();
    const totalProducts = await Product.countDocuments();
    const activeProducts = await Product.countDocuments({ 'stock.quantity': { $gt: 0 } });

    // Chart Data Aggregation (30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const revenueAggregation = await Order.aggregate([
        {
            $match: {
                status: { $in: ['shipped', 'delivered', 'completed'] },
                createdAt: { $gte: thirtyDaysAgo }
            }
        },
        {
            $group: {
                _id: { $dateToString: { format: "%d/%m", date: "$createdAt" } },
                revenue: { $sum: "$totalAmount" },
                orders: { $sum: 1 }
            }
        },
        { $sort: { "_id": 1 } }
    ]);

    const revenueData = revenueAggregation.map(item => ({
        name: item._id,
        revenue: item.revenue,
        orders: item.orders
    }));

    // Top Products
    const productAggregation = await Order.aggregate([
        { $match: { status: { $in: ['completed', 'delivered', 'shipped', 'paid'] } } },
        { $unwind: "$items" },
        {
            $group: {
                _id: "$items.name",
                sales: { $sum: "$items.quantity" },
                revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } }
            }
        },
        { $sort: { sales: -1 } },
        { $limit: 10 }
    ]);

    // Order Status Data
    const statusCounts = await Order.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    const statusMap = statusCounts.reduce((acc, curr) => ({ ...acc, [curr._id]: curr.count }), {});

    const statusData = [
        { name: 'Hoàn thành', value: (statusMap.completed || 0) + (statusMap.delivered || 0), color: '#10b981' },
        { name: 'Chờ xử lý', value: statusMap.pending || 0, color: '#f59e0b' },
        { name: 'Đang giao', value: statusMap.shipped || 0, color: '#3b82f6' },
        { name: 'Đã hủy', value: statusMap.cancelled || 0, color: '#ef4444' },
    ];

    return {
        currentRevenue,
        revenueGrowth,
        currentMonthUsers,
        userGrowth,
        totalOrders,
        totalProducts,
        activeProducts,
        revenueData,
        topProducts: productAggregation,
        statusData
    };
}

function StatCard({ title, value, growth, icon: Icon, prefix = '', suffix = '' }: any) {
    const isPositive = growth >= 0;
    return (
        <div className="bg-white p-6 justify-between border border-slate-200 shadow-sm rounded-2xl flex flex-col">
            <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Icon className="w-6 h-6" />
                </div>
                <div className={`flex items-center gap-1 text-sm font-semibold px-2.5 py-1 rounded-full ${isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                    {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                    {Math.abs(growth).toFixed(1)}%
                </div>
            </div>
            <div>
                <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
                <h4 className="text-3xl font-black text-slate-900">
                    {prefix}{typeof value === 'number' ? value.toLocaleString('vi-VN') : value}{suffix}
                </h4>
            </div>
        </div>
    );
}

export default async function AnalyticsPage() {
    const data = await getAnalyticsData();

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Thống kê & Phân tích</h1>
                <p className="text-slate-500 mt-1">Theo dõi hiệu suất kinh doanh và lưu lượng truy cập của cửa hàng.</p>
            </div>

            {/* Doanh thu & Bán hàng */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Doanh thu tháng này"
                    value={data.currentRevenue}
                    growth={data.revenueGrowth}
                    icon={BadgeDollarSign}
                    suffix="đ"
                />
                <StatCard
                    title="Khách hàng mới"
                    value={data.currentMonthUsers}
                    growth={data.userGrowth}
                    icon={Users}
                />
                <StatCard
                    title="Tổng số đơn hàng"
                    value={data.totalOrders}
                    growth={5.2} // Giả lập mức tăng trưởng trung bình
                    icon={ShoppingCart}
                />
                <StatCard
                    title="Sản phẩm đang bán"
                    value={data.activeProducts}
                    growth={((data.activeProducts / data.totalProducts) * 100) - 100}
                    icon={PackageSearch}
                />
            </div>

            {/* Google Analytics Section */}
            <GA4Dashboard />

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-slate-900">Doanh thu 30 ngày qua</h3>
                        <div className="p-2 bg-slate-50 rounded-lg">
                            <TrendingUp className="w-5 h-5 text-slate-400" />
                        </div>
                    </div>
                    <div className="h-[350px]">
                        <RevenueChart data={data.revenueData} />
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-6">Tỉ lệ trạng thái đơn hàng</h3>
                    <div className="h-[350px]">
                        <OrderStatusChart data={data.statusData} total={data.totalOrders} />
                    </div>
                </div>
            </div>

            {/* Top Products Table */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm overflow-hidden">
                <h3 className="text-lg font-bold text-slate-900 mb-6">Top 10 Sản phẩm bán chạy nhất</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50">
                                <th className="px-4 py-3 text-sm font-semibold text-slate-600 rounded-l-lg">Tên sản phẩm</th>
                                <th className="px-4 py-3 text-sm font-semibold text-slate-600 text-right">Đã bán</th>
                                <th className="px-4 py-3 text-sm font-semibold text-slate-600 text-right rounded-r-lg">Doanh thu mang lại</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {data.topProducts.map((product: any, index: number) => (
                                <tr key={product._id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-3">
                                            <span className="w-6 text-center text-slate-400 font-medium">#{index + 1}</span>
                                            <span className="font-semibold text-slate-900">{product._id}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                        <span className="inline-flex px-2.5 py-1 bg-blue-50 text-blue-700 font-semibold rounded-lg">
                                            {product.sales}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 text-right font-bold text-slate-900">
                                        {product.revenue.toLocaleString('vi-VN')}đ
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
