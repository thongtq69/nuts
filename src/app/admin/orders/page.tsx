import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import User from '@/models/User';

async function getOrders() {
    await dbConnect();
    // Populate user to get name/email if referenced
    const orders = await Order.find({}).populate('user', 'name email').sort({ createdAt: -1 });

    return orders.map(order => ({
        id: order._id.toString(),
        customer: (order.user as any)?.name || order.shippingInfo?.fullName || 'Guest',
        total: order.totalAmount,
        status: order.status,
        date: order.createdAt ? order.createdAt.toLocaleDateString() : 'N/A',
        itemCount: order.items.length
    }));
}

export default async function AdminOrdersPage() {
    const orders = await getOrders();

    return (
        <div>
            <h1>Orders</h1>
            <div className="card">
                <table>
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Customer</th>
                            <th>Date</th>
                            <th>Items</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => (
                            <tr key={order.id}>
                                <td>#{order.id.slice(-6).toUpperCase()}</td>
                                <td>{order.customer}</td>
                                <td>{order.date}</td>
                                <td>{order.itemCount}</td>
                                <td>{order.total.toLocaleString()}đ</td>
                                <td>
                                    <span className={`status-badge ${order.status}`}>
                                        {order.status}
                                    </span>
                                </td>
                                <td>
                                    <button className="btn btn-primary" style={{ fontSize: '12px', padding: '4px 8px' }}>
                                        View
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
