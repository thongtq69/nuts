
import dbConnect from './src/lib/db';
import Order from './src/models/Order';
import mongoose from 'mongoose';

async function findPendingOrder() {
    try {
        await dbConnect();
        const order = await Order.findOne({ paymentStatus: 'pending' }).sort({ createdAt: -1 }).lean();
        if (order) {
            console.log('--- FOUND PENDING ORDER ---');
            console.log('Order ID:', order._id.toString());
            console.log('Payment Ref:', order.paymentRef);
            console.log('Total Amount:', order.totalAmount);
            console.log('---------------------------');
        } else {
            console.log('No pending orders found.');
        }
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

findPendingOrder();
