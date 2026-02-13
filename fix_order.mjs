
import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://nuts:123123a@cluster0.0rpbkdx.mongodb.net/gonuts?retryWrites=true&w=majority&appName=Cluster0';

async function fixTargetOrder() {
    try {
        await mongoose.connect(MONGODB_URI);
        const db = mongoose.connection.db;
        const ordersCollection = db.collection('orders');

        // 1. Reset các đơn khác để không tranh chấp mã GOEEBE03
        await ordersCollection.updateMany(
            { paymentRef: 'GOEEBE03' },
            { $set: { paymentRef: 'GO_OTHER_TEST' } }
        );

        // 2. Gán mã GOEEBE03 cho đơn hàng mà User đang nhìn thấy (#EEBE03)
        // ID: 6984886194eec7ef0eeebe03 (từ log trước đó)
        await ordersCollection.updateOne(
            { _id: new mongoose.Types.ObjectId('6984886194eec7ef0eeebe03') },
            {
                $set: {
                    paymentRef: 'GOEEBE03',
                    paymentStatus: 'pending',
                    status: 'pending'
                }
            }
        );

        console.log('Target order #EEBE03 is now ready with paymentRef: GOEEBE03');
        await mongoose.disconnect();
    } catch (error) {
        console.error(error);
    }
}

fixTargetOrder();
