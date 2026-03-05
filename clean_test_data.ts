import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://nuts:123123a@cluster0.0rpbkdx.mongodb.net/gonuts?retryWrites=true&w=majority&appName=Cluster0';

async function run() {
    try {
        await mongoose.connect(MONGODB_URI);
        const db = mongoose.connection.db;

        if (!db) {
            console.error('Database connection failed.');
            process.exit(1);
        }

        // 1. Check all current products in DB
        const products = await db.collection('products').find({}).toArray();
        console.log(`There are ${products.length} products in DB.`);

        const productNames = products.map((p: any) => p.name);
        console.log('Real product names in DB:');
        console.dir(productNames, { maxArrayLength: null });

        // 2. Find orders that have products not in this list
        const orders = await db.collection('orders').find({}).toArray();
        console.log(`Total orders in DB: ${orders.length}`);

        let toDeleteOrders = [];
        let deletedProductNames = new Set();

        for (const order of orders) {
            let hasFakeProduct = false;
            if (order.items && Array.isArray(order.items)) {
                for (const item of order.items) {
                    if (!productNames.includes(item.name)) {
                        hasFakeProduct = true;
                        deletedProductNames.add(item.name);
                    }
                }
            }
            if (hasFakeProduct) {
                toDeleteOrders.push(order._id);
            }
        }

        console.log(`Found ${toDeleteOrders.length} orders containing products not currently in DB.`);
        console.log('These products are: ', Array.from(deletedProductNames));

        // Let's delete them
        if (toDeleteOrders.length > 0) {
            const res = await db.collection('orders').deleteMany({ _id: { $in: toDeleteOrders } });
            console.log(`Deleted ${res.deletedCount} old/mock orders successfully.`);
        }

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
run();
