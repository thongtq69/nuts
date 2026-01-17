import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';

export const dynamic = 'force-dynamic';

export async function POST() {
    try {
        console.log('🏷️ Starting to add tags to products...');
        
        await dbConnect();
        console.log('✅ Database connected');

        // Get all products
        const products = await Product.find({});
        console.log(`📦 Found ${products.length} products`);

        if (products.length === 0) {
            return NextResponse.json({ 
                message: 'No products found to update',
                updated: 0 
            });
        }

        let updated = 0;

        // Add tags to products based on their index/position
        for (let i = 0; i < products.length; i++) {
            const product = products[i];
            const tags = [];

            // Distribute tags evenly
            if (i % 3 === 0) {
                tags.push('best-seller');
            }
            if (i % 3 === 1) {
                tags.push('new');
            }
            if (i % 3 === 2) {
                tags.push('promo');
            }

            // Some products can have multiple tags
            if (i < 3) {
                tags.push('featured');
            }

            // Update product with tags
            await Product.findByIdAndUpdate(product._id, {
                $set: { tags: tags }
            });

            console.log(`✅ Updated product "${product.name}" with tags: ${tags.join(', ')}`);
            updated++;
        }

        console.log(`🎉 Successfully updated ${updated} products with tags`);

        return NextResponse.json({
            message: `Successfully updated ${updated} products with tags`,
            updated: updated,
            timestamp: new Date().toISOString()
        });

    } catch (error: any) {
        console.error('❌ Error updating product tags:', error);
        return NextResponse.json({ 
            error: 'Failed to update product tags',
            message: error.message,
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}

export async function GET() {
    try {
        await dbConnect();
        
        // Get products with their tags
        const products = await Product.find({}, 'name tags').lean();
        
        const tagStats = {
            'best-seller': 0,
            'new': 0,
            'promo': 0,
            'featured': 0,
            'no-tags': 0
        };

        products.forEach(product => {
            if (!product.tags || product.tags.length === 0) {
                tagStats['no-tags']++;
            } else {
                product.tags.forEach((tag: string) => {
                    if (tagStats[tag as keyof typeof tagStats] !== undefined) {
                        tagStats[tag as keyof typeof tagStats]++;
                    }
                });
            }
        });

        return NextResponse.json({
            totalProducts: products.length,
            tagStats,
            products: products.map(p => ({
                id: p._id.toString(),
                name: p.name,
                tags: p.tags || []
            }))
        });

    } catch (error: any) {
        console.error('❌ Error getting product tags:', error);
        return NextResponse.json({ 
            error: 'Failed to get product tags',
            message: error.message 
        }, { status: 500 });
    }
}