
import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://nuts:123123a@cluster0.0rpbkdx.mongodb.net/gonuts?retryWrites=true&w=majority&appName=Cluster0';

async function verifyDetailedState() {
    try {
        await mongoose.connect(MONGODB_URI);
        const db = mongoose.connection.db;
        const ordersCollection = db.collection('orders');
        const debugLogsCollection = db.collection('acb_debug_logs');

        console.log('--- ORDER #EEBE03 (6984886194eec7ef0eeebe03) ---');
        const order1 = await ordersCollection.findOne({ _id: new mongoose.Types.ObjectId('6984886194eec7ef0eeebe03') });
        console.log(JSON.stringify(order1, null, 2));

        console.log('\n--- ORDER #EEBDB8 (6984881194eec7ef0eeebdb8) ---');
        const order2 = await ordersCollection.findOne({ _id: new mongoose.Types.ObjectId('6984881194eec7ef0eeebdb8') });
        console.log(JSON.stringify(order2, null, 2));

        console.log('\n--- LAST 3 DEBUG LOGS ---');
        const logs = await debugLogsCollection.find({}).sort({ timestamp: -1 }).limit(3).toArray();
        console.log(JSON.stringify(logs, null, 2));

        await mongoose.disconnect();
    } catch (error) {
        console.error(error);
    }
}

verifyDetailedState();
