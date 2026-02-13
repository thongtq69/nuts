
import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://nuts:123123a@cluster0.0rpbkdx.mongodb.net/gonuts?retryWrites=true&w=majority&appName=Cluster0';

async function resetAndTest() {
    try {
        await mongoose.connect(MONGODB_URI);
        const db = mongoose.connection.db;
        const ordersCollection = db.collection('orders');

        // Reset đơn #9D5C03
        const result = await ordersCollection.updateOne(
            { _id: new mongoose.Types.ObjectId('698ee1e01f450e5f109d5c03') },
            { $set: { paymentStatus: 'pending', status: 'pending', paymentRef: 'GO9D5C03', acbTransactionNo: null } }
        );

        console.log(`Reset result: ${result.modifiedCount} modified`);

        const order = await ordersCollection.findOne({ _id: new mongoose.Types.ObjectId('698ee1e01f450e5f109d5c03') });
        console.log(`Order #9D5C03 - Status: ${order.status}, Payment: ${order.paymentStatus}, Ref: ${order.paymentRef}`);

        await mongoose.disconnect();
    } catch (error) {
        console.error(error);
    }
}

resetAndTest();
