
import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://nuts:123123a@cluster0.0rpbkdx.mongodb.net/gonuts?retryWrites=true&w=majority&appName=Cluster0';

async function findPendingOrder() {
    try {
        await mongoose.connect(MONGODB_URI);
        const db = mongoose.connection.db;
        const ordersCollection = db.collection('orders');

        const order = await ordersCollection.findOne(
            { paymentStatus: 'pending' },
            { sort: { createdAt: -1 } }
        );

        if (order) {
            console.log('--- FOUND PENDING ORDER ---');
            console.log('Order ID:', order._id.toString());
            console.log('Payment Ref:', order.paymentRef);
            console.log('Total Amount:', order.totalAmount);
            console.log('---------------------------');
        } else {
            console.log('No pending orders found.');
        }
        await mongoose.disconnect();
    } catch (error) {
        console.error(error);
    }
}

findPendingOrder();
