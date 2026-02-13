
import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://nuts:123123a@cluster0.0rpbkdx.mongodb.net/gonuts?retryWrites=true&w=majority&appName=Cluster0';

async function checkCallbacks() {
    try {
        await mongoose.connect(MONGODB_URI);
        const db = mongoose.connection.db;
        const ordersCollection = db.collection('orders');

        // Tìm bất kỳ đơn hàng nào có acbTransactionNo (đã từng nhận callback thành công)
        const orders = await ordersCollection.find({
            acbTransactionNo: { $exists: true }
        }).sort({ updatedAt: -1 }).limit(5).toArray();

        console.log('--- RECENT SUCCESSFUL CALLBACKS ---');
        if (orders.length > 0) {
            orders.forEach(o => {
                console.log(`Order: ${o._id}, Ref: ${o.paymentRef}, Time: ${o.updatedAt}, Status: ${o.paymentStatus}, TranNo: ${o.acbTransactionNo}`);
            });
        } else {
            console.log('No orders with acbTransactionNo found.');
        }

        // Kiểm tra đơn hàng test cụ thể
        const testOrder = await ordersCollection.findOne({ paymentRef: 'GOEEBE03' });
        console.log('\n--- TEST ORDER STATUS ---');
        console.log(JSON.stringify(testOrder, null, 2));

        console.log('---------------------------');
        await mongoose.disconnect();
    } catch (error) {
        console.error(error);
    }
}

checkCallbacks();
