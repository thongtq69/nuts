import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;
        const body = await request.json();
        const { stockStatus, stock } = body;

        const product = await Product.findById(id);
        if (!product) {
            return NextResponse.json(
                { message: 'Không tìm thấy sản phẩm' },
                { status: 404 }
            );
        }

        // Update stock status if provided
        if (stockStatus) {
            product.stockStatus = stockStatus;
        }

        // Update stock quantity if provided
        if (typeof stock === 'number') {
            product.stock = stock;
            // Auto update stock status based on quantity
            if (stock === 0) {
                product.stockStatus = 'out_of_stock';
            } else if (stock <= 10) {
                product.stockStatus = 'low_stock';
            } else {
                product.stockStatus = 'in_stock';
            }
        }

        await product.save();

        return NextResponse.json({
            message: 'Cập nhật tồn kho thành công',
            product: {
                id: product._id,
                stock: product.stock,
                stockStatus: product.stockStatus,
            }
        });
    } catch (error) {
        console.error('Error updating product stock:', error);
        return NextResponse.json(
            { message: 'Lỗi khi cập nhật tồn kho' },
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
            stock: product.stock || 0,
            stockStatus: product.stockStatus || 'in_stock',
        });
    } catch (error) {
        console.error('Error fetching product stock:', error);
        return NextResponse.json(
            { message: 'Lỗi khi lấy thông tin tồn kho' },
            { status: 500 }
        );
    }
}
