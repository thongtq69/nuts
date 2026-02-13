
import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://nuts:123123a@cluster0.0rpbkdx.mongodb.net/gonuts?retryWrites=true&w=majority&appName=Cluster0';

async function prepareTestData() {
    try {
        await mongoose.connect(MONGODB_URI);
        const db = mongoose.connection.db;
        const ordersCollection = db.collection('orders');

        // Tìm đơn hàng chờ thanh toán gần nhất
        const order = await ordersCollection.findOne(
            { paymentStatus: 'pending' },
            { sort: { createdAt: -1 } }
        );

        if (order) {
            const testRef = 'GOEEBE03';
            await ordersCollection.updateOne(
                { _id: order._id },
                { $set: { paymentRef: testRef } }
            );
            console.log('--- TEST DATA PREPARED ---');
            console.log('Order ID:', order._id.toString());
            console.log('Use this paymentRef for simulation:', testRef);
            console.log('Amount:', order.totalAmount);
            console.log('--------------------------');
        } else {
            console.log('No pending orders found to update.');
        }
        await mongoose.disconnect();
    } catch (error) {
        console.error(error);
    }
}

prepareTestData();
