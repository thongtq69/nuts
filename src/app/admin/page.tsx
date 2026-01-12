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

            <style jsx>{`
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 20px;
                    margin-top: 20px;
                }
                .stat-card {
                    background: #fff;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                    border-left: 4px solid #3498db;
                }
                .stat-card h3 {
                    margin: 0 0 10px 0;
                    font-size: 14px;
                    color: #7f8c8d;
                    text-transform: uppercase;
                }
                .stat-value {
                    font-size: 28px;
                    font-weight: 700;
                    color: #2c3e50;
                    margin: 0;
                }
                .stat-card:nth-child(2) { border-left-color: #2ecc71; }
                .stat-card:nth-child(3) { border-left-color: #f1c40f; }
                .stat-card:nth-child(4) { border-left-color: #e74c3c; }
            `}</style>
        </div>
    );
}
