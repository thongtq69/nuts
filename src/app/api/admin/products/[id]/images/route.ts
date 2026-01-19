import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;
        const body = await request.json();
        const { images } = body;

        const product = await Product.findById(id);
        if (!product) {
            return NextResponse.json(
                { message: 'Không tìm thấy sản phẩm' },
                { status: 404 }
            );
        }

        // Update images
        product.images = images;
        await product.save();

        return NextResponse.json({
            message: 'Cập nhật ảnh thành công',
            images: product.images
        });
    } catch (error) {
        console.error('Error updating product images:', error);
        return NextResponse.json(
            { message: 'Lỗi khi cập nhật ảnh' },
            { status: 500 }
        );
    }
}

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;
        const product = await Product.findById(id).lean();

        if (!product) {
            return NextResponse.json(
                { message: 'Không tìm thấy sản phẩm' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            images: product.images || []
        });
    } catch (error) {
        console.error('Error fetching product images:', error);
        return NextResponse.json(
            { message: 'Lỗi khi lấy thông tin ảnh' },
            { status: 500 }
        );
    }
}
