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
        </table>
            </div >
        </div >
    );
}
