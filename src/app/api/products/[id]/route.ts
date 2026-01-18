import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await dbConnect();
        const product = await Product.findById(id);
        if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        return NextResponse.json(product);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await dbConnect();
        const body = await request.json();
        const product = await Product.findByIdAndUpdate(id, body, { new: true, runValidators: true });
        if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        return NextResponse.json(product);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
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
            updateOperation = body;
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            id, 
            updateOperation, 
            { new: true, runValidators: true }
        );

        console.log(`✅ Product ${action === 'add_tag' ? 'added to' : 'removed from'} ${tag}:`, updatedProduct.name);
        
        return NextResponse.json(updatedProduct);
    } catch (error: any) {
        console.error('❌ Error updating product:', error);
        return NextResponse.json({ error: 'Failed to update product', message: error.message }, { status: 500 });
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
