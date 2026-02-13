
import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://nuts:123123a@cluster0.0rpbkdx.mongodb.net/gonuts?retryWrites=true&w=majority&appName=Cluster0';

async function verifyOrder() {
    try {
        await mongoose.connect(MONGODB_URI);
        const db = mongoose.connection.db;
        const ordersCollection = db.collection('orders');

        console.log('--- ORDER #EEBE03 ---');
        const order = await ordersCollection.findOne({ _id: new mongoose.Types.ObjectId('6984886194eec7ef0eeebe03') });
        console.log(`Status: ${order.status}`);
        console.log(`Payment Status: ${order.paymentStatus}`);
        console.log(`Updated At: ${order.updatedAt}`);

        await mongoose.disconnect();
    } catch (error) {
        console.error(error);
    }
}

verifyOrder();
