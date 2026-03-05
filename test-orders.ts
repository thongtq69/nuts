import mongoose from 'mongoose';
import dbConnect from './src/lib/db';
import Order from './src/models/Order';

async function run() {
    await dbConnect();
    const order = await Order.findOne({ "items.0": { $exists: true } });
    console.log(order?.items[0].productId);
    process.exit(0);
}
run();
