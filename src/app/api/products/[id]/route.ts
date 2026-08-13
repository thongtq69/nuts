import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import { normalizeProductPayload, ProductPayloadError } from '@/lib/product-payload';
import { describeProductPersistenceError } from '@/lib/product-persistence-error';
import { getUrlLocale } from '@/i18n/server';
import { isPublishedForLocale, localizeProduct } from '@/lib/localized-content';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await dbConnect();
        const product = await Product.findById(id).lean();
        const locale = getUrlLocale(request);
        if (!product || !isPublishedForLocale(product as any, locale)) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }
        return NextResponse.json(localizeProduct(product as any, locale));
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await dbConnect();
        const body = normalizeProductPayload(await request.json());
        const product = await Product.findByIdAndUpdate(id, body, { new: true, runValidators: true });
        if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        return NextResponse.json(product);
    } catch (error) {
        if (error instanceof ProductPayloadError) {
            return NextResponse.json({ error: error.message, message: error.message }, { status: 400 });
        }
        console.error('Failed to update product:', error);
        const details = describeProductPersistenceError(error, 'update');
        return NextResponse.json({
            error: 'Failed to update product',
            message: details.message,
        }, { status: details.status });
    }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await dbConnect();
        const body = await request.json();
        const { action, tag } = body;

        const product = await Product.findById(id);
        if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

        let updateOperation = {};

        if (action === 'add_tag') {
            // Thêm tag nếu chưa có
            updateOperation = {
                $addToSet: { tags: tag }
            };
        } else if (action === 'remove_tag') {
            // Xóa tag
            updateOperation = {
                $pull: { tags: tag }
            };
        } else {
            // Update thông thường
            const touchesProductRules =
                'isLinkedProduct' in body ||
                'linkedCategory' in body ||
                'vipMaxDiscount' in body;
            updateOperation = touchesProductRules
                ? normalizeProductPayload({ ...product.toObject(), ...body })
                : body;
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            id, 
            updateOperation, 
            { new: true, runValidators: true }
        );

        console.log(`✅ Product ${action === 'add_tag' ? 'added to' : 'removed from'} ${tag}:`, updatedProduct?.name || 'Unknown');
        
        return NextResponse.json(updatedProduct);
    } catch (error: any) {
        if (error instanceof ProductPayloadError) {
            return NextResponse.json({ error: error.message, message: error.message }, { status: 400 });
        }
        console.error('❌ Error updating product:', error);
        const details = describeProductPersistenceError(error, 'update');
        return NextResponse.json({
            error: 'Failed to update product',
            message: details.message,
        }, { status: details.status });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await dbConnect();
        const product = await Product.findByIdAndDelete(id);
        if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        return NextResponse.json({ message: 'Product deleted successfully' });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
    }
}
