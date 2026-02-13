
import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://nuts:123123a@cluster0.0rpbkdx.mongodb.net/gonuts?retryWrites=true&w=majority&appName=Cluster0';

async function findDuplicateOrders() {
    try {
        await mongoose.connect(MONGODB_URI);
        const db = mongoose.connection.db;
        const ordersCollection = db.collection('orders');

        // Tìm tất cả các đơn hàng có đuôi ID là EEBE03
        console.log('--- SEARCHING FOR EEBE03 ORDERS ---');
        const allOrders = await ordersCollection.find({}).toArray();
        const matches = allOrders.filter(o => o._id.toString().toUpperCase().endsWith('EEBE03'));

        matches.forEach(o => {
            console.log(`ID: ${o._id}, Ref: ${o.paymentRef}, Status: ${o.paymentStatus}, Created: ${o.createdAt}`);
        });

        const byRef = await ordersCollection.find({ paymentRef: 'GOEEBE03' }).toArray();
        console.log('\n--- SEARCHING BY paymentRef: GOEEBE03 ---');
        byRef.forEach(o => {
            console.log(`ID: ${o._id}, Ref: ${o.paymentRef}, Status: ${o.paymentStatus}, TranNo: ${o.acbTransactionNo}`);
        });

        await mongoose.disconnect();
    } catch (error) {
        console.error(error);
    }
}

findDuplicateOrders();
