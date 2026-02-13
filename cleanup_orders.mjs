
import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://nuts:123123a@cluster0.0rpbkdx.mongodb.net/gonuts?retryWrites=true&w=majority&appName=Cluster0';

async function cleanupOrders() {
    try {
        await mongoose.connect(MONGODB_URI);
        const db = mongoose.connection.db;
        const ordersCollection = db.collection('orders');

        // 1. Rename paymentRef của đơn đã PAID để tránh trùng
        await ordersCollection.updateOne(
            { _id: new mongoose.Types.ObjectId('6984886194eec7ef0eeebe03') },
            { $set: { paymentRef: 'GO_TEST_DONE' } }
        );

        // 2. Đảm bảo đơn còn lại có paymentRef đúng
        await ordersCollection.updateOne(
            { _id: new mongoose.Types.ObjectId('6984881194eec7ef0eeebdb8') },
            { $set: { paymentRef: 'GOEEBE03', paymentStatus: 'pending' } }
        );

        console.log('Cleanup completed. Only one order now has Ref: GOEEBE03');
        await mongoose.disconnect();
    } catch (error) {
        console.error(error);
    }
}

cleanupOrders();
