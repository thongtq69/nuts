import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';

export async function POST(request: Request) {
    try {
        await dbConnect();
        const { productIds } = await request.json();

        if (!Array.isArray(productIds)) {
            return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
        }

        // Update each product's sortOrder based on its index in the array
        // We want the first item to have the highest sortOrder
        const bulkOps = productIds.map((id, index) => ({
            updateOne: {
                filter: { _id: id },
                update: { $set: { sortOrder: productIds.length - index } }
            }
        }));

        await Product.bulkWrite(bulkOps);

        return NextResponse.json({ message: 'Reordered successfully' });
    } catch (error: any) {
        console.error('Reorder Error:', error);
        return NextResponse.json({ error: 'Failed to reorder products' }, { status: 500 });
    }
}
