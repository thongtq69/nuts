import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import { products } from '@/data/products'; // Import existing mock data

export async function GET(request: Request) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const force = searchParams.get('force') === 'true';

        if (force) {
            await Product.deleteMany({});
        }

        // Check if data exists
        const count = await Product.countDocuments();
        if (count > 0 && !force) {
            return NextResponse.json({ message: 'Database already seeded', count });
        }

        // Insert mock data

        // Transform mock data to remove 'id' property so Mongoose generates _id
        // AND convert price strings to numbers
        const seedData = products.map(({ id, currentPrice, originalPrice, priceValue, ...rest }) => ({
            ...rest,
            currentPrice: priceValue, // Use the numeric value
            // Fix: Remove 'Rs.' explicitly and then parse. 'Rs. 400.00' -> ' 400.00' -> 400.00
            originalPrice: originalPrice ? parseFloat(originalPrice.replace('Rs.', '').replace(/[^0-9.]/g, '')) : 0,
        }));

        await Product.insertMany(seedData);

        return NextResponse.json({ message: 'Seeding successful', seededCount: seedData.length });
    } catch (error) {
        console.error('Seeding error:', error);
        return NextResponse.json({ error: 'Seeding failed', details: (error as Error).message }, { status: 500 });
    }
}
