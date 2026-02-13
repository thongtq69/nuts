
import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://nuts:123123a@cluster0.0rpbkdx.mongodb.net/gonuts?retryWrites=true&w=majority&appName=Cluster0';

async function verify() {
    try {
        await mongoose.connect(MONGODB_URI);
        const db = mongoose.connection.db;

        const order = await db.collection('orders').findOne({ _id: new mongoose.Types.ObjectId('698ee1e01f450e5f109d5c03') });
        console.log('=== ĐƠN HÀNG #9D5C03 ===');
        console.log(`Status: ${order.status}`);
        console.log(`Payment Status: ${order.paymentStatus}`);
        console.log(`ACB Transaction No: ${order.acbTransactionNo}`);
        console.log(`Payment Ref: ${order.paymentRef}`);
        console.log(`Updated At: ${order.updatedAt}`);

        if (order.paymentStatus === 'paid' && order.status === 'confirmed') {
            console.log('\n🎉 THÀNH CÔNG! Đơn hàng đã được xử lý đúng với format thực tế của ACB!');
        } else {
            console.log('\n❌ THẤT BẠI! Đơn hàng vẫn chưa được cập nhật.');
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error(error);
    }
}

verify();
