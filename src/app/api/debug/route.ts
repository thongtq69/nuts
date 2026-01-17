import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';

export const dynamic = 'force-dynamic';

export async function GET() {
    const debugInfo: any = {
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        mongoUri: process.env.MONGODB_URI ? 'SET' : 'NOT SET',
        apiUrl: process.env.NEXT_PUBLIC_API_URL || 'NOT SET',
    };

    try {
        // Test database connection
        await dbConnect();
        debugInfo.dbConnection = 'SUCCESS';
        
        // Test product count
        const productCount = await Product.countDocuments();
        debugInfo.productCount = productCount;
        
        // Get sample products
        const sampleProducts = await Product.find().limit(3).lean();
        debugInfo.sampleProducts = sampleProducts.map((p: any) => ({
            id: p._id.toString(),
            name: p.name,
            hasImage: !!p.image,
            tags: p.tags || []
        }));
        
        // Check products by tags
        const bestSellers = await Product.find({ tags: 'best-seller' }).limit(3).lean();
        const newProducts = await Product.find({ tags: 'new' }).limit(3).lean();
        const promoProducts = await Product.find({ tags: 'promo' }).limit(3).lean();
        
        debugInfo.productsByTags = {
            'best-seller': bestSellers.length,
            'new': newProducts.length,
            'promo': promoProducts.length
        };
        
        debugInfo.sampleProductsByTag = {
            'best-seller': bestSellers.map((p: any) => ({ id: p._id.toString(), name: p.name, tags: p.tags })),
            'new': newProducts.map((p: any) => ({ id: p._id.toString(), name: p.name, tags: p.tags })),
            'promo': promoProducts.map((p: any) => ({ id: p._id.toString(), name: p.name, tags: p.tags }))
        };
        
    } catch (error: any) {
        debugInfo.dbConnection = 'FAILED';
        debugInfo.dbError = error.message;
        debugInfo.productCount = 0;
        debugInfo.sampleProducts = [];
        debugInfo.productsByTags = {};
        debugInfo.sampleProductsByTag = {};
    }

    return NextResponse.json(debugInfo);
}