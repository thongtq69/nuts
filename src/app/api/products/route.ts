import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import { normalizeProductPayload, ProductPayloadError } from '@/lib/product-payload';
import { describeProductPersistenceError } from '@/lib/product-persistence-error';
import { resolveLinkedProductSelection } from '@/lib/linked-product-selection';

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
        const linked = searchParams.get('linked');
        const linkedCategory = searchParams.get('linkedCategory')?.trim();
        const linkedMenuCategory = searchParams.get('linkedMenuCategory')?.trim();
        const linkedMenuSubmenu = searchParams.get('linkedMenuSubmenu')?.trim();

        let filter: any = {};
        if (category) {
            filter.category = category;
        }
        if (query) {
            filter.name = { $regex: query, $options: 'i' };
        }
        if (linked === 'true' || linked === '1') {
            filter.isLinkedProduct = true;
        } else if (linked === 'false' || linked === '0') {
            filter.isLinkedProduct = { $ne: true };
        }
        if (linkedCategory) {
            filter.isLinkedProduct = true;
            filter.linkedCategory = linkedCategory;
        }
        if (linkedMenuCategory) {
            filter.isLinkedProduct = true;
            filter.linkedMenuCategoryId = linkedMenuCategory;
        }
        if (linkedMenuSubmenu) {
            filter.isLinkedProduct = true;
            filter.linkedMenuSubmenuId = linkedMenuSubmenu;
        }

        console.log('🔍 Products API: Query filter:', filter);

        const products = await Product.find(filter).sort({ sortOrder: -1, createdAt: -1 } as any).lean();
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
        const normalizedBody = normalizeProductPayload(await request.json());
        const body = await resolveLinkedProductSelection(normalizedBody);
        const product = await Product.create(body);
        return NextResponse.json(product, { status: 201 });
    } catch (error) {
        if (error instanceof ProductPayloadError) {
            return NextResponse.json({ error: error.message, message: error.message }, { status: 400 });
        }
        console.error('Failed to create product:', error);
        const details = describeProductPersistenceError(error, 'create');
        return NextResponse.json({
            error: 'Failed to create product',
            message: details.message,
        }, { status: details.status });
    }
}
