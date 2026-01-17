import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        console.log('🔍 Products API: Starting request...');
        
        await dbConnect();
        console.log('✅ Products API: Database connected');

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

        console.log('🔍 Products API: Query filter:', filter);

        const products = await Product.find(filter).sort({ createdAt: -1 }).lean();
        console.log(`✅ Products API: Found ${products.length} products`);

        // Convert ObjectId to string for JSON serialization
        const serializedProducts = products.map((product: any) => ({
            ...product,
            _id: product._id.toString(),
            id: product._id.toString()
        }));

        return NextResponse.json(serializedProducts);
    } catch (error: any) {
        console.error('❌ Products API Error:', error);
        return NextResponse.json({ 
            error: 'Failed to fetch products',
            message: error.message,
            timestamp: new Date().toISOString()
        }, { status: 500 });
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
