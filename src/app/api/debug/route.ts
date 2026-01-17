import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';

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
            hasImage: !!p.image
        }));
        
    } catch (error: any) {
        debugInfo.dbConnection = 'FAILED';
        debugInfo.dbError = error.message;
        debugInfo.productCount = 0;
        debugInfo.sampleProducts = [];
    }

    return NextResponse.json(debugInfo);
}