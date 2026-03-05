const mongoose = require('mongoose');

async function run() {
    await mongoose.connect('mongodb+srv://quocthong1290_db_user:TZzVNqXP9gALfcIq@cluster0.bbs1yqz.mongodb.net/ptn_english?appName=Cluster0');
    
    const db = mongoose.connection.db;
    const orders = await db.collection('orders').find({}).toArray();
    
    let toDelete = [];
    let toKeep = [];
    
    for (let order of orders) {
        let isMock = false;
        if (order.items) {
            for (let item of order.items) {
                if (item.name.includes('Farmley') || item.name.includes('Mixed Seeds') || item.name.includes('Hạt sen') || item.name.includes('Hạt điều vỏ lụa')) {
                    isMock = true;
                }
            }
        }
        if (isMock) {
            toDelete.push(order._id);
        } else {
            toKeep.push(order._id);
        }
    }
    
    console.log(`Found ${toDelete.length} mock orders to delete.`);
    console.log(`Keeping ${toKeep.length} real orders.`);
    
    // Check if there are real orders at all
    if (toDelete.length > 0) {
        await db.collection('orders').deleteMany({ _id: { $in: toDelete } });
        console.log('Deleted mock orders.');
    }
    
    process.exit(0);
}

run().catch(console.error);
