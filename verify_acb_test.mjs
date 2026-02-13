
import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://nuts:123123a@cluster0.0rpbkdx.mongodb.net/gonuts?retryWrites=true&w=majority&appName=Cluster0';

async function verifyTestResult() {
    try {
        await mongoose.connect(MONGODB_URI);
        const db = mongoose.connection.db;
        const ordersCollection = db.collection('orders');

        const testRef = 'GOEEBE03';
        const order = await ordersCollection.findOne({ paymentRef: testRef });

        console.log('--- VERIFICATION RESULT ---');
        if (order) {
            console.log('Order ID:', order._id.toString());
            console.log('Payment Reference:', order.paymentRef);
            console.log('Payment Status:', order.paymentStatus);
            console.log('Order Status:', order.status);
            console.log('ACB Transaction No:', order.acbTransactionNo);

            if (order.paymentStatus === 'paid') {
                console.log('\n🎉 SUCCESS: The callback was received and order is marked as PAID!');
            } else {
                console.log('\n⏳ PENDING: Order found but paymentStatus is still:', order.paymentStatus);
                console.log('This might mean the callback hasn\'t reached our server yet or authentication failed.');
            }
        } else {
            console.log('❌ ERROR: Could not find order with paymentRef:', testRef);
        }
        console.log('---------------------------');
        await mongoose.disconnect();
    } catch (error) {
        console.error(error);
    }
}

verifyTestResult();
