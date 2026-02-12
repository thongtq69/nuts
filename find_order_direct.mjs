
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('MONGODB_URI not found in .env.local');
    process.exit(1);
}

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
            console.log('Created At:', order.createdAt);
            console.log('---------------------------');
        } else {
            console.log('No pending orders found.');
        }
        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

findPendingOrder();
