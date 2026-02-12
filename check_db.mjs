
import dbConnect from './src/lib/db';
import Product from './src/models/Product';
import mongoose from 'mongoose';

async function checkProducts() {
    try {
        await dbConnect();
        const products = await Product.find({}, 'name image').lean();
        console.log('--- ALL PRODUCTS IN DB ---');
        products.forEach(p => {
            console.log(`- ${p.name}: ${p.image}`);
        });
        console.log('--------------------------');
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

checkProducts();
