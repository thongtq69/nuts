import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
import User from '@/models/User';

async function getStats() {
    await dbConnect();
    const orderCount = await Order.countDocuments();
    const productCount = await Product.countDocuments();
    const userCount = await User.countDocuments();

    // Calculate total revenue
    const orders = await Order.find({ status: 'completed' });
    const totalRevenue = orders.reduce((acc, order) => acc + (order.totalAmount || 0), 0);

    return {
        orderCount,
        productCount,
        userCount,
        totalRevenue
    };
}

export default async function AdminDashboard() {
    const stats = await getStats();

    return (
        <div>
            <h1>Dashboard Overview</h1>
            <div className="stats-grid">
                <div className="stat-card">
                    <h3>Total Orders</h3>
                    <p className="stat-value">{stats.orderCount}</p>
                </div>
                <div className="stat-card">
                    <h3>Total Products</h3>
                    <p className="stat-value">{stats.productCount}</p>
                </div>
                <div className="stat-card">
                    <h3>Total Users</h3>
                    <p className="stat-value">{stats.userCount}</p>
                </div>
                <div className="stat-card">
                    <h3>Total Revenue</h3>
                    <p className="stat-value">{stats.totalRevenue.toLocaleString()}đ</p>
                </div>
            </div>
        </div>
    );
}
