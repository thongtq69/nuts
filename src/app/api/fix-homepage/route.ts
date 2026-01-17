import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';

export const dynamic = 'force-dynamic';

export async function POST() {
    try {
        console.log('🔧 Starting homepage fix...');
        
        await dbConnect();
        console.log('✅ Database connected');

        // Get all products
        const products = await Product.find({});
        console.log(`📦 Found ${products.length} products`);

        if (products.length === 0) {
            return NextResponse.json({ 
                error: 'No products found in database',
                message: 'Please add some products first',
                products: 0
            }, { status: 404 });
        }

        let updated = 0;

        // Add tags to all products to ensure they show up on homepage
        for (let i = 0; i < products.length; i++) {
            const product = products[i];
            const tags = [];

            // Assign tags based on position
            if (i % 3 === 0) {
                tags.push('best-seller');
            }
            if (i % 3 === 1) {
                tags.push('new');
            }
            if (i % 3 === 2) {
                tags.push('promo');
            }

            // First few products get featured tag
            if (i < 4) {
                tags.push('featured');
            }

            // Update product
            await Product.findByIdAndUpdate(product._id, {
                $set: { tags: tags }
            });

            console.log(`✅ Updated "${product.name}" with tags: ${tags.join(', ')}`);
            updated++;
        }

        // Verify the update worked
        const bestSellers = await Product.find({ tags: 'best-seller' });
        const newProducts = await Product.find({ tags: 'new' });
        const promoProducts = await Product.find({ tags: 'promo' });

        console.log(`🎉 Fix completed! Updated ${updated} products`);
        console.log(`📊 Results: ${bestSellers.length} best-sellers, ${newProducts.length} new, ${promoProducts.length} promo`);

        return NextResponse.json({
            success: true,
            message: `Successfully fixed homepage! Updated ${updated} products with tags`,
            updated: updated,
            results: {
                'best-seller': bestSellers.length,
                'new': newProducts.length,
                'promo': promoProducts.length,
                'total': products.length
            },
            timestamp: new Date().toISOString()
        });

    } catch (error: any) {
        console.error('❌ Error fixing homepage:', error);
        return NextResponse.json({ 
            error: 'Failed to fix homepage',
            message: error.message,
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}

export async function GET() {
    try {
        await dbConnect();
        
        // Check current status
        const totalProducts = await Product.countDocuments();
        const bestSellers = await Product.countDocuments({ tags: 'best-seller' });
        const newProducts = await Product.countDocuments({ tags: 'new' });
        const promoProducts = await Product.countDocuments({ tags: 'promo' });
        const noTags = await Product.countDocuments({ $or: [{ tags: { $exists: false } }, { tags: { $size: 0 } }] });

        return NextResponse.json({
            status: 'Current homepage status',
            totalProducts,
            tagCounts: {
                'best-seller': bestSellers,
                'new': newProducts,
                'promo': promoProducts,
                'no-tags': noTags
            },
            needsFix: noTags > 0 || (bestSellers === 0 && newProducts === 0 && promoProducts === 0),
            timestamp: new Date().toISOString()
        });

    } catch (error: any) {
        console.error('❌ Error checking homepage status:', error);
        return NextResponse.json({ 
            error: 'Failed to check homepage status',
            message: error.message 
        }, { status: 500 });
    }
}