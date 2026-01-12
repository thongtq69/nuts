import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';

export async function GET(request: Request) {
    try {
        await dbConnect();

        // Simple query handling could be added here (e.g., ?category=...)
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');
        const query = searchParams.get('q');

        let filter: any = {};
        if (category) {
            filter.category = category;
        }
        if (query) {
            filter.name = { $regex: query, $options: 'i' };
        }

        const products = await Product.find(filter).sort({ createdAt: -1 });
        return NextResponse.json(products);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await dbConnect();
        const body = await request.json();
        const product = await Product.create(body);
        return NextResponse.json(product, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
    }
}
