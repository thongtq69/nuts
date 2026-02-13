
import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://nuts:123123a@cluster0.0rpbkdx.mongodb.net/gonuts?retryWrites=true&w=majority&appName=Cluster0';

async function checkDebugLogs() {
    try {
        await mongoose.connect(MONGODB_URI);
        const db = mongoose.connection.db;
        const logsCollection = db.collection('acb_debug_logs');

        console.log('--- ACB DEBUG LOGS (LAST 5) ---');
        const logs = await logsCollection.find({}).sort({ timestamp: -1 }).limit(5).toArray();

        if (logs.length > 0) {
            logs.forEach(log => {
                console.log(`Time: ${log.timestamp}`);
                console.log(`Headers: ${JSON.stringify(log.headers, null, 2)}`);
                console.log(`Body: ${JSON.stringify(log.body, null, 2)}`);
                console.log('---------------------------');
            });
        } else {
            console.log('No debug logs found yet.');
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error(error);
    }
}

checkDebugLogs();
